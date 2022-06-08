import { Slack } from "./slack";
import { SlackApp } from "./slackApp";

const startApp = async () => {
  await SlackApp.start(process.env.PORT || 3000);
  console.log("⚡️ Bolt app is running!");
};

startApp();
