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
import { Slack } from "../slack";
import {
  getRequests,
  postRequest,
  resetGetAndPostRequests,
  startTestServer,
  stopTestServer,
} from "./testServer";
import { nanoid } from "nanoid";
import { execSync } from "child_process";

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

describe("Testing Slack api implementation", () => {
  it("Test starting a job", async () => {
    const userIds = [nanoid(), nanoid(), nanoid(), nanoid()];
    const jobId = await Slack.registerJob(userIds, "Hello There");

    await Slack.sendDmToAll(userIds, "Hello There", jobId);

    expect(postRequest).toEqual(
      userIds.map((userId) => {
        return {
          type: "sendDmTo",
          userId,
          message: "Hello There",
          jobId: jobId,
        };
      })
    );

    const registeredJob = await prisma.jobs.findUnique({
      where: { id: jobId },
    });

    expect(registeredJob.finished).toEqual(true);
    expect(registeredJob.message).toEqual("Hello There");
    expect(registeredJob.user_ids).toEqual(userIds);

    const allSentMessages = await prisma.sentMessages.findMany({
      where: { jobsId: jobId },
    });

    userIds.forEach((userId) => {
      const sentMessage = allSentMessages.find(
        (message) => message.user_id === userId
      );

      expect(sentMessage.jobsId).toEqual(jobId);
      expect(sentMessage.message).toEqual("Hello There");
    });
  });

  it("Test restarting job", async () => {
    const usersIds: string[] = [];

    for (let i = 0; i <= 100; i++) {
      usersIds.push(nanoid());
    }

    const jobId = await Slack.registerJob(usersIds, "Should Restart jobs");

    await Slack.restartMessageJobs();

    const job = await prisma.jobs.findUnique({ where: { id: jobId } });

    expect(job.finished).toEqual(true);

    await Promise.all(
      usersIds.map(async (userId) => {
        const sentMessage = await prisma.sentMessages.findMany({
          where: { user_id: userId, jobsId: jobId },
        });

        expect(sentMessage.length).toEqual(1);
      })
    );
  }, 5_000);
});
