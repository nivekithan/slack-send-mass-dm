import { Jobs, SentMessages } from "@prisma/client";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";
import { prisma } from "../prisma";
import { Slack as SlackQueue } from "../slack.queue";
import {
  getRequests,
  postRequest,
  resetGetAndPostRequests,
  startTestServer,
  stopTestServer,
} from "./testServer";
import { nanoid } from "nanoid";
import { execSync } from "child_process";
import { addSendBulkMessageJob } from "../messageQueue";

beforeAll(() => {
  startTestServer();
});

afterAll(() => {
  execSync("npx prisma migrate reset --force");
  stopTestServer();
});

beforeEach(() => {
  resetGetAndPostRequests();
});

afterEach(() => {
  resetGetAndPostRequests();
});

describe("Testing queue implementation", () => {
  it("Test Starting a job", async () => {
    const userIds = [nanoid(), nanoid(), nanoid(), nanoid()];
    const message = "Hello There";

    const jobId = await SlackQueue.registerJob(userIds, message);

    await addSendBulkMessageJob({ jobId, message, userIds });

    // TODO: Find better way to know when all jobs are done
    await new Promise((r) => setTimeout(r, 100));

    expect(postRequest).toEqual(
      userIds.map((userId) => {
        return {
          type: "sendDmTo",
          userId,
          message,
          jobId: jobId,
        };
      })
    );

    const registeredJob = await prisma.jobs.findUnique({
      where: { id: jobId },
    });

    expect(registeredJob.finished).toEqual(true);
    expect(registeredJob.message).toEqual(message);
    expect(registeredJob.user_ids).toEqual(userIds);

    const allSentMessages = await prisma.sentMessages.findMany({
      where: { jobsId: jobId },
    });

    userIds.forEach((userId) => {
      const sentMessage = allSentMessages.find(
        (message) => message.user_id === userId
      );

      expect(sentMessage.jobsId).toEqual(jobId);
      expect(sentMessage.message).toEqual(message);
    });
  });
});
