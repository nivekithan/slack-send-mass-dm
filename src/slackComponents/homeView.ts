import { Actions, Elements, HomeTab } from "slack-block-builder";
import { SlackActions } from "../slackApp";

export const HomeView = () => {
  return HomeTab().blocks(
    Actions({ blockId: "sendBulkMessage" }).elements(
      Elements.Button({
        text: "Send Bulk Message",
        actionId: SlackActions.openSendBulkMessageModel,
      })
    )
  );
};
