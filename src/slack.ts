import { SlackApp } from "./slackApp";
import { assertItsNotProduction, isProduction } from "./utils";
import fetch from "node-fetch";
import { testServerUrl } from "./test/testServer";

export class Slack {
  static async sendDmTo(userId: string, message: string, sendAt?: string) {
    if (!isProduction()) {
      await this.#devSendDmTo(userId, message, sendAt);
    }
  }

  static async #devSendDmTo(userId: string, message: string, sendAt?: string) {
    assertItsNotProduction();
    let numberOfRetries = 0;

    while (numberOfRetries < 3) {
      const res = await fetch(testServerUrl, {
        method: "post",
        body: JSON.stringify({
          type: "sendDmTo",
          userId,
          message,
          sendAt: sendAt,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        break;
      }

      numberOfRetries++;
    }
  }
}
