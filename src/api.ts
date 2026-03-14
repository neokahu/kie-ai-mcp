const BASE_URL = "https://api.kie.ai/api/v1";

function getApiKey(): string {
  const key = process.env.KIE_AI_API_KEY;
  if (!key) throw new Error("KIE_AI_API_KEY environment variable is required");
  return key;
}

function headers(): Record<string, string> {
  return {
    Authorization: `Bearer ${getApiKey()}`,
    "Content-Type": "application/json",
  };
}

export interface CreateTaskResponse {
  code: number;
  msg: string;
  data: { taskId: string };
}

export interface TaskStatusResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
    model: string;
    state: "waiting" | "queuing" | "generating" | "success" | "fail";
    param: string;
    resultJson: string;
    failCode: string;
    failMsg: string;
    costTime: number;
    completeTime: number;
    createTime: number;
    updateTime: number;
    progress?: number;
  };
}

export interface CreditResponse {
  code: number;
  msg: string;
  data: { credit: number };
}

export async function createTask(
  model: string,
  input: Record<string, unknown>,
  callBackUrl?: string
): Promise<CreateTaskResponse> {
  const body: Record<string, unknown> = { model, input };
  if (callBackUrl) body.callBackUrl = callBackUrl;

  const res = await fetch(`${BASE_URL}/jobs/createTask`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Kie.ai API error ${res.status}: ${text}`);
  }

  return res.json() as Promise<CreateTaskResponse>;
}

export async function getTaskStatus(
  taskId: string
): Promise<TaskStatusResponse> {
  const res = await fetch(
    `${BASE_URL}/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`,
    { headers: headers() }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Kie.ai API error ${res.status}: ${text}`);
  }

  return res.json() as Promise<TaskStatusResponse>;
}

export async function getCredit(): Promise<CreditResponse> {
  const res = await fetch(`${BASE_URL}/chat/credit`, {
    headers: headers(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Kie.ai API error ${res.status}: ${text}`);
  }

  return res.json() as Promise<CreditResponse>;
}

// Polling helper — waits for task completion
export async function waitForTask(
  taskId: string,
  maxWaitMs = 600000,
  intervalMs = 3000
): Promise<TaskStatusResponse> {
  const start = Date.now();

  while (Date.now() - start < maxWaitMs) {
    const status = await getTaskStatus(taskId);

    if (status.data.state === "success" || status.data.state === "fail") {
      return status;
    }

    await new Promise((r) => setTimeout(r, intervalMs));

    // Back off after 30s
    if (Date.now() - start > 30000 && intervalMs < 10000) {
      intervalMs = Math.min(intervalMs * 1.5, 10000);
    }
  }

  throw new Error(`Task ${taskId} timed out after ${maxWaitMs}ms`);
}

// Runway-specific endpoints
export async function runwayGenerate(
  input: Record<string, unknown>
): Promise<CreateTaskResponse> {
  const res = await fetch(`${BASE_URL}/runway/generate`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Kie.ai Runway API error ${res.status}: ${text}`);
  }

  return res.json() as Promise<CreateTaskResponse>;
}

export async function runwayGetStatus(
  taskId: string
): Promise<TaskStatusResponse> {
  const res = await fetch(
    `${BASE_URL}/runway/record-detail?taskId=${encodeURIComponent(taskId)}`,
    { headers: headers() }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Kie.ai Runway API error ${res.status}: ${text}`);
  }

  return res.json() as Promise<TaskStatusResponse>;
}
