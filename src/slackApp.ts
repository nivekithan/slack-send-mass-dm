import { App, LogLevel } from "@slack/bolt";
import { getEnvVar } from "./utils";

export const SlackApp = new App({
  token: getEnvVar("SLACK_BOT_TOKEN"),
  signingSecret: getEnvVar("SLACK_SIGNING_SECRET"),
  socketMode: true,
  appToken: getEnvVar("SLACK_APP_TOKEN"),
  logLevel: LogLevel.DEBUG,
});
