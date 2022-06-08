import { Slack } from "./slack";
import { SlackApp } from "./slackApp";

SlackApp.event("app_home_opened", async ({ event, say }) => {
  console.log(event);
  await Slack.sendDmTo(event.user);
});

const startApp = async () => {
  await SlackApp.start(process.env.PORT || 3000);
  console.log("⚡️ Bolt app is running!");
};

startApp();
