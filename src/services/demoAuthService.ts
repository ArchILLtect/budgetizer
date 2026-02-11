import { post } from "aws-amplify/api";
import { ApiError } from "aws-amplify/api";

export type DemoCredentials = { username: string; password: string };

function errorToMessage(err: unknown): string {
  if (typeof err === "string") return err;

  if (err instanceof ApiError) {
    // ApiError.message is typically a good human summary.
    return err.message || "Demo request failed.";
  }

  if (typeof err === "object" && err !== null && "message" in err) {
    return String((err as { message: unknown }).message);
  }

  return "Demo request failed.";
}

function isValidDemoCredentials(value: unknown): value is DemoCredentials {
  if (!value || typeof value !== "object") return false;
  const v = value as { username?: unknown; password?: unknown };
  return typeof v.username === "string" && typeof v.password === "string";
}

export async function createDemoCredentials(): Promise<DemoCredentials> {
  try {
    const { body } = await post({
      apiName: "taskmasterAuth",
      path: "/auth/demo",
      options: {
        body: {},
      },
    }).response;

    const data = (await body.json()) as unknown;

    if (!isValidDemoCredentials(data)) {
      throw new Error("Demo endpoint returned an invalid response.");
    }

    return data;
  } catch (err) {
    throw new Error(errorToMessage(err));
  }
}
