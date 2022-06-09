import { prisma } from "./prisma";
import {
  addSendBulkMessageJob,
  MessageFlowProducer,
  MessageJob,
  MessageQueue,
  MESSAGE_QUEUE_NAME,
} from "./messageQueue";
import { testServerUrl } from "./test/testServer";
import { assertItsNotProduction, isProduction } from "./utils";
import fetch from "node-fetch";

export class Slack {
  static async registerJob(userIds: string[], message: string) {
    const jobs = await prisma.jobs.create({
      data: { message, finished: false, user_ids: userIds },
    });

    return jobs.id;
  }

  static async sendDmTo({ jobId, message, userId, type }: MessageJob) {
    if (!isProduction()) {
      this.#denSendDmTo({ jobId, message, userId, type });
    }
  }

  static async #denSendDmTo({ jobId, message, userId }: MessageJob) {
    assertItsNotProduction();

    let numberOfRetries = 0;

    while (numberOfRetries < 3) {
      const res = await fetch(testServerUrl, {
        method: "post",
        body: JSON.stringify({
          type: "sendDmTo",
          userId,
          message,
          jobId,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        await prisma.sentMessages.create({
          data: { message, jobsId: jobId, user_id: userId },
        });
        break;
      }

      numberOfRetries++;
    }
  }
}
