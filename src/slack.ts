import { SlackApp } from "./slackApp";
import { assertItsNotProduction, isProduction } from "./utils";
import fetch from "node-fetch";
import { testServerUrl } from "./test/testServer";
import { prisma } from "./prisma";

export class Slack {
  static async registerJob(
    userIds: string[],
    message: string
  ): Promise<string> {
    const addRes = await prisma.jobs.create({
      data: { message, user_ids: userIds, finished: false },
    });

    return addRes.id;
  }

  static async sendDmTo(
    userId: string,
    message: string,
    jobId: string,
    sendAt?: string
  ) {
    if (!isProduction()) {
      await this.#devSendDmTo(userId, message, jobId, sendAt);
    }
  }

  static async #devSendDmTo(
    userId: string,
    message: string,
    jobId: string,
    sendAt?: string
  ) {
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

  static async sendDmToAll(userIds: string[], message: string, jobId: string) {
    if (!isProduction()) {
      await this.#devSendDmToAll(userIds, message, jobId);
    }
  }

  static async #devSendDmToAll(
    userIds: string[],
    message: string,
    jobId: string
  ) {
    assertItsNotProduction();

    await Promise.all(
      userIds.map(async (userId) => {
        return await Slack.sendDmTo(userId, message, jobId);
      })
    );

    await prisma.jobs.update({
      data: { finished: true },
      where: { id: jobId },
    });
  }

  static async restartMessageJobs() {
    const allUnfinishedJobs = await prisma.jobs.findMany({
      where: { finished: false },
    });

    const unfinishedJobsCreatedBeforeNow = allUnfinishedJobs.filter((job) => {
      const jobCreatedAt = new Date(job.created_at).getTime();
      const dateTimeNow = new Date().getTime();
      const isCreatedBeforeNow = jobCreatedAt < dateTimeNow;

      return isCreatedBeforeNow;
    });

    await Promise.all(
      unfinishedJobsCreatedBeforeNow.map(async (job) => {
        const userIds = job.user_ids;

        const usersWhoAlreadyGotMessage = await prisma.sentMessages.findMany({
          where: { jobsId: job.id },
        });

        const usersWhoAlreadyGotMessageMap = usersWhoAlreadyGotMessage.reduce(
          (accum: Record<string, boolean>, currentSentMessage) => {
            accum[currentSentMessage.user_id] = true;
            return accum;
          },
          {}
        );

        const userIdsWhoDidntReceiveMessages = userIds.filter(
          (userId) => !usersWhoAlreadyGotMessageMap[userId]
        );

        await Slack.sendDmToAll(
          userIdsWhoDidntReceiveMessages,
          job.message,
          job.id
        );
      })
    );
  }
}
