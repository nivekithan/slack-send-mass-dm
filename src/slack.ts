import { SlackApp } from "./slackApp";
import { assertItsNotProduction, isProduction } from "./utils";

export class Slack {
  static async sendDmTo(userId: string) {
    if (!isProduction()) {
      await this.#devSendDmTo(userId);
    }
  }

  static async #devSendDmTo(userId: string) {
    assertItsNotProduction();


    
  }
}
