#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createTask, getTaskStatus, getCredit, waitForTask, runwayGenerate, gpt4oImageGenerate, gpt4oImageGetStatus } from "./api.js";
import { imageTools, videoTools, audioTools, utilityTools, z } from "./tools.js";

const server = new McpServer({
  name: "kie-ai",
  version: "1.0.0",
});

// ============================================================
// Helper: format task result for MCP response
// ============================================================

interface PollingGuidance {
  recommended_interval: string;
  max_wait: string;
  tip: string;
}

function formatTaskCreated(taskId: string, model: string): string {
  const guidance: PollingGuidance = {
    recommended_interval: "3-5 seconds initially, back off to 10s after 30s",
    max_wait: "10 minutes for images, 15 minutes for video",
    tip: "Use get_task_status to check progress. Results expire after 14 days.",
  };

  return JSON.stringify({
    taskId,
    model,
    status: "created",
    message: "Task submitted successfully. Use get_task_status to check progress.",
    polling_guidance: guidance,
  });
}

function formatTaskStatus(data: Record<string, unknown>): string {
  // Normalize: dedicated endpoints use successFlag (0=generating, 1=success, 2/3=fail)
  // Common endpoint uses state ("waiting"|"queuing"|"generating"|"success"|"fail")
  let state: string;
  if (data.state) {
    state = data.state as string;
  } else if (data.successFlag !== undefined) {
    const flag = data.successFlag as number;
    state = flag === 1 ? "success" : flag === 0 ? "generating" : "fail";
  } else {
    state = "unknown";
  }

  const result: Record<string, unknown> = {
    taskId: data.taskId,
    model: data.model || data.taskType,
    state,
  };

  // Handle common endpoint success (resultJson string)
  if (state === "success" && data.resultJson) {
    try {
      const parsed = JSON.parse(data.resultJson as string);
      result.result_urls = parsed.resultUrls || parsed.result_urls;
      result.result = parsed;
    } catch {
      result.resultJson = data.resultJson;
    }
  }

  // Handle dedicated endpoint success (response object or resultInfoJson)
  if (state === "success" && data.response) {
    const resp = data.response as Record<string, unknown>;
    // GPT-4o returns resultUrls (array), others return resultImageUrl (string)
    if (Array.isArray(resp.resultUrls)) {
      result.result_urls = resp.resultUrls;
    } else {
      result.result_urls = [resp.resultImageUrl].filter(Boolean);
    }
    result.result = resp;
  }
  if (state === "success" && data.resultInfoJson) {
    // resultInfoJson may be a string or already-parsed object depending on endpoint
    let parsed: Record<string, unknown>;
    if (typeof data.resultInfoJson === "string") {
      try {
        parsed = JSON.parse(data.resultInfoJson as string);
      } catch {
        result.resultInfoJson = data.resultInfoJson;
        parsed = {};
      }
    } else {
      parsed = data.resultInfoJson as Record<string, unknown>;
    }
    if (parsed.resultUrls) {
      // MJ format: resultUrls is array of {resultUrl: string}
      const urls = parsed.resultUrls as Array<Record<string, string>>;
      result.result_urls = urls.map((u) => u.resultUrl || u);
    } else {
      result.result_urls = parsed.imageUrls || parsed.result_urls;
    }
    result.result = parsed;
  }

  if (state === "fail") {
    result.error_code = data.failCode || data.errorCode;
    result.error_message = data.failMsg || data.errorMessage;
  }

  if (data.progress !== undefined && data.progress !== null) {
    result.progress = data.progress;
  }

  if (data.costTime) result.cost_time_ms = data.costTime;

  // Polling guidance based on state
  if (state === "waiting" || state === "queuing" || state === "generating") {
    result.polling_guidance = {
      status: "in_progress",
      next_check: "3-5 seconds",
      tip: "Task is still processing. Check again shortly.",
    };
  }

  return JSON.stringify(result);
}

// ============================================================
// Register all generation tools (image + video + audio)
// ============================================================

type ToolDef = {
  name: string;
  description: string;
  model: string;
  schema: Record<string, z.ZodType>;
  buildInput: (params: Record<string, unknown>) => Record<string, unknown>;
  getModel?: (params: Record<string, unknown>) => string;
  isRunway?: boolean;
  isGpt4o?: boolean;
};

const allGenerationTools: ToolDef[] = [
  ...Object.values(imageTools),
  ...Object.values(videoTools),
  ...Object.values(audioTools),
] as ToolDef[];

for (const tool of allGenerationTools) {
  const schemaShape: Record<string, z.ZodType> = { ...tool.schema };

  // Add common callBackUrl to all generation tools
  schemaShape.callBackUrl = z
    .string()
    .url()
    .optional()
    .describe("Callback URL for task completion notifications");

  server.tool(tool.name, tool.description, schemaShape, async (params) => {
    try {
      const model = tool.getModel
        ? tool.getModel(params as Record<string, unknown>)
        : tool.model;
      const input = tool.buildInput(params as Record<string, unknown>);

      // Remove MCP-only params from input
      delete (input as Record<string, unknown>).callBackUrl;

      const cbUrl =
        (params as Record<string, unknown>).callBackUrl as string | undefined ||
        process.env.KIE_AI_CALLBACK_URL;

      let response;
      if (tool.isRunway) {
        response = await runwayGenerate(input);
      } else if (tool.isGpt4o) {
        if (cbUrl) (input as Record<string, unknown>).callBackUrl = cbUrl;
        response = await gpt4oImageGenerate(input);
      } else {
        response = await createTask(model, input, cbUrl);
      }

      if (response.code !== 200) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error: ${response.msg}`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text" as const,
            text: formatTaskCreated(response.data.taskId, model),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  });
}

// ============================================================
// Utility tools
// ============================================================

server.tool(
  "get_task_status",
  utilityTools.get_task_status.description,
  utilityTools.get_task_status.schema,
  async (params) => {
    try {
      const taskId = params.task_id;
      const source = (params.source as string) || "auto";

      // Route to correct status endpoint
      let response;
      if (source === "gpt4o") {
        response = await gpt4oImageGetStatus(taskId);
      } else {
        response = await getTaskStatus(taskId);
      }

      if (response.code !== 200) {
        return {
          content: [{ type: "text" as const, text: `Error: ${response.msg}` }],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text" as const,
            text: formatTaskStatus(response.data as unknown as Record<string, unknown>),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }
);

server.tool(
  "get_credit_balance",
  utilityTools.get_credit_balance.description,
  utilityTools.get_credit_balance.schema,
  async () => {
    try {
      const response = await getCredit();
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              credit_balance: response.data.credit,
              note: "Credits are in Kie.ai credit units",
            }),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// ============================================================
// Start server
// ============================================================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
