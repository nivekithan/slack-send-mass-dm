import { App, LogLevel } from "@slack/bolt";
import { HomeView } from "./slackComponents/homeView";
import { SendBulkMessageModal } from "./slackComponents/sendBulkMessageModals";
import { getEnvVar } from "./utils";

export const SlackApp = new App({
  token: getEnvVar("SLACK_BOT_TOKEN"),
  signingSecret: getEnvVar("SLACK_SIGNING_SECRET"),
  socketMode: true,
  appToken: getEnvVar("SLACK_APP_TOKEN"),
  logLevel: LogLevel.DEBUG,
});

export const SlackActions = {
  openSendBulkMessageModel: "openSendBulkMessageModal",
};

export const SlackView = {
  sendBulkMessageModal: "sendBulkMessageModalView",
};

SlackApp.event("app_home_opened", async ({ event, context }) => {
  await SlackApp.client.views.publish({
    user_id: event.user,
    view: HomeView().buildToObject(),
  });
});

SlackApp.action(
  SlackActions.openSendBulkMessageModel,
  async ({ ack, body, client }) => {
    await ack();

    if (body.type !== "block_actions") {
      throw new Error(
        `Expected SlackActions.openSendBulkMessageModel actionId to be used only in Action Button but instead used in type: ${body.type}`
      );
    }
    await client.views.open({
      trigger_id: body.trigger_id,
      view: SendBulkMessageModal().buildToObject(),
    });
  }
);

SlackApp.view(SlackView.sendBulkMessageModal, async ({ ack, body, view }) => {
  await ack();
});
