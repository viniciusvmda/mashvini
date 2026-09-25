class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function extractErrorMessage(
  response: Response,
  path: string,
): Promise<string> {
  const fallbackMessage = `Request to ${path} failed with status ${response.status}`;

  try {
    const body = await response.json();
    return body?.detail ?? fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

export { ApiError, extractErrorMessage };
