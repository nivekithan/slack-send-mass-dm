import assert from "assert";

export type EnvVariablesName =
  | "SLACK_BOT_TOKEN"
  | "SLACK_SIGNING_SECRET"
  | "SLACK_APP_TOKEN";

export const getEnvVar = (name: EnvVariablesName) => {
  const envValue = process.env[name] as string | undefined;

  if (envValue === undefined) {
    throw new Error(`Environment variable ${name} is not defined`);
  }

  return envValue;
};

export const assertItsNotProduction = () => {
  const nodeEnv = process.env.NODE_ENV;

  assert(
    nodeEnv !== "production",
    "Code which is not supposed to run at production is running at production"
  );
};

export const isProduction = () => {
  const nodeEnv = process.env.NODE_ENV;

  return nodeEnv === "production";
};
