import { ViewOutput } from "@slack/bolt";
import {
  Blocks,
  Context,
  Divider,
  Elements,
  Modal,
  Option,
  Section,
} from "slack-block-builder";
import { SlackView } from "../slackApp";

const SendBulkMessageValues = {
  messageNameBlockId: "messageNameBlockIdentifier",
  messageNameActionId: "messageNameActionIdentifier",

  messageBlockId: "messageBlockIdentifier",
  messageActionId: "messageActionIdentifier",

  recipientsBlockId: "recipientsBlockIdentifier",
  recipientsActionId: "recipientsActionIdentifier",

  sendDateBlockId: "sendDateBlockIdenifier",
  sendDateActionId: "sendDateActionIdentifier",

  sendTimeBlockId: "sendTimeBlockIdenifier",
  sendTimeActionId: "sendTimeActionIdentifier",

  timeZoneAdjustmentBlockId: "timeZoneAdjustmentBlockIdentifier",
  timeZoneAdjustmentActionId: "timeZoneAdjustmentActionIdentifier",
};

export const getMessageNameValue = (view: ViewOutput) => {
  const messageNameValue =
    view.state.values[SendBulkMessageValues.messageNameBlockId][
      SendBulkMessageValues.messageNameActionId
    ].value;

  return messageNameValue;
};

export const getMessageValue = (view: ViewOutput) => {
  const messageValue =
    view.state.values[SendBulkMessageValues.messageBlockId][
      SendBulkMessageValues.messageActionId
    ].value;

  return messageValue;
};

export const getRecipientsValue = (view: ViewOutput) => {
  const recipientsValue =
    view.state.values[SendBulkMessageValues.recipientsBlockId][
      SendBulkMessageValues.recipientsActionId
    ].selected_conversations;

  return recipientsValue;
};

export const getSendDateValue = (view: ViewOutput) => {
  const sendSendDateValue =
    view.state.values[SendBulkMessageValues.sendDateBlockId][
      SendBulkMessageValues.sendDateActionId
    ].selected_date;

  return sendSendDateValue;
};

export const getSendTimeValue = (view: ViewOutput) => {
  const sendTimeValue =
    view.state.values[SendBulkMessageValues.sendTimeBlockId][
      SendBulkMessageValues.sendTimeActionId
    ].selected_time;

  return sendTimeValue;
};

export const getTimeZoneAdjustmentValue = (view: ViewOutput) => {
  const timeZoneAdjustmentValue =
    view.state.values[SendBulkMessageValues.timeZoneAdjustmentBlockId][
      SendBulkMessageValues.timeZoneAdjustmentActionId
    ].selected_option.value;

  return timeZoneAdjustmentValue as "localTimeZone" | "userTimeZone";
};

export const SendBulkMessageModal = () => {
  return Modal()
    .callbackId(SlackView.sendBulkMessageModal)
    .title("Schedule a message")
    .submit("Next")
    .close("Cancel")
    .blocks(
      Blocks.Input()
        .label("Message Name")
        .blockId(SendBulkMessageValues.messageNameBlockId)
        .element(
          Elements.TextInput()
            .placeholder("Message Name")
            .actionId(SendBulkMessageValues.messageNameActionId)
        ),
      Section({
        text: "You can personalize your message using the following substitutions *{firstName}, {secondName}, {thirdName}*",
      }),
      Blocks.Input()
        .label("Write your message")
        .blockId(SendBulkMessageValues.messageBlockId)
        .element(
          Elements.TextInput()
            .multiline(true)
            .placeholder("Write Something...")
            .actionId(SendBulkMessageValues.messageActionId)
        ),
      Blocks.Input()
        .label("Recipients")
        .blockId(SendBulkMessageValues.recipientsBlockId)
        .element(
          Elements.ConversationMultiSelect()
            .placeholder("Select Conversation")
            .actionId(SendBulkMessageValues.recipientsActionId)
        )
        .optional(true),
      Context().elements(
        "Leave this empty if you want to brodcast message to entire workspace"
      ),
      Section().text("Configuration"),
      Context().elements(
        "Set the date and time in past if you want to send message immediately"
      ),
      Blocks.Input()
        .label("When do want to send messages")
        .blockId(SendBulkMessageValues.sendDateBlockId)
        .element(
          Elements.DatePicker().actionId(SendBulkMessageValues.sendDateActionId)
        ),
      Blocks.Input()
        .blockId(SendBulkMessageValues.sendTimeBlockId)
        .label("Select Time")
        .element(
          Elements.TimePicker().actionId(SendBulkMessageValues.sendTimeActionId)
        ),
      Blocks.Input()
        .label("Timezone adjustment")
        .blockId(SendBulkMessageValues.timeZoneAdjustmentBlockId)
        .element(
          Elements.StaticSelect()
            .options(
              Option().text("Your Timezone").value("localTimeZone"),
              Option().text("User timezone").value("userTimeZone")
            )
            .initialOption(
              Option().text("Your Timezone").value("localTimeZone")
            )
            .actionId(SendBulkMessageValues.timeZoneAdjustmentActionId)
        )
    );
};
