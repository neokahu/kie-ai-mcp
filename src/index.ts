#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createTask, getTaskStatus, getCredit, waitForTask, runwayGenerate } from "./api.js";
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
  const result: Record<string, unknown> = {
    taskId: data.taskId,
    model: data.model,
    state: data.state,
  };

  if (data.state === "success" && data.resultJson) {
    try {
      const parsed = JSON.parse(data.resultJson as string);
      result.result_urls = parsed.resultUrls || parsed.result_urls;
      result.result = parsed;
    } catch {
      result.resultJson = data.resultJson;
    }
  }

  if (data.state === "fail") {
    result.error_code = data.failCode;
    result.error_message = data.failMsg;
  }

  if (data.progress !== undefined && data.progress !== null) {
    result.progress = data.progress;
  }

  if (data.costTime) result.cost_time_ms = data.costTime;

  // Polling guidance based on state
  if (data.state === "waiting" || data.state === "queuing" || data.state === "generating") {
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
      const response = await getTaskStatus(params.task_id);

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
