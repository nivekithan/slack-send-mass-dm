import { FlowProducer, Queue, Worker } from "bullmq";
import { prisma } from "./prisma";
import { Slack } from "./slack.queue";
import IoRedis from "ioredis";
import { getEnvVar } from "./utils";

export type MessageJob = {
  type: "sendMessage";
  jobId: string;
  userId: string;
  message: string;
};

export type BulkMessageJob = {
  type: "sendBulkMessage";
  jobId: string;
};

export const MESSAGE_QUEUE_NAME = "messageQueue";

const redisConnection = new IoRedis({
  host: getEnvVar("REDIS_HOST"),
  port: parseInt(getEnvVar("REDIS_PORT"), 10),
  maxRetriesPerRequest: null,
});

export const MessageQueue = new Queue<MessageJob | BulkMessageJob>(
  MESSAGE_QUEUE_NAME,
  { connection: redisConnection }
);

export const MessageFlowProducer = new FlowProducer();

export const MessageWorker = new Worker<MessageJob | BulkMessageJob>(
  MESSAGE_QUEUE_NAME,
  async ({ data }) => {
    if (data.type === "sendMessage") {
      return await Slack.sendDmTo({
        type: "sendMessage",
        jobId: data.jobId,
        message: data.message,
        userId: data.userId,
      });
    } else if (data.type === "sendBulkMessage") {
      return await prisma.jobs.update({
        data: { finished: true },
        where: { id: data.jobId },
      });
    }
  },
  { connection: redisConnection }
);

export type AddSendBulkMessageJobArgs = {
  userIds: string[];
  jobId: string;
  message: string;
};

export const addSendBulkMessageJob = async ({
  jobId,
  message,
  userIds,
}: AddSendBulkMessageJobArgs) => {
  await MessageFlowProducer.add({
    name: "sendBulkMessage",
    queueName: MESSAGE_QUEUE_NAME,
    data: { jobId, type: "sendBulkMessage" },
    children: userIds.map((userId) => {
      return {
        name: "sendMessage",
        queueName: MESSAGE_QUEUE_NAME,
        data: { jobId, message, userId, type: "sendMessage" },
      };
    }),
  });
};
