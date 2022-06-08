import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";
import { Slack } from "../slack";
import {
  getRequests,
  postRequest,
  resetGetAndPostRequests,
  startTestServer,
  stopTestServer,
} from "./testServer";

beforeAll(() => {
  startTestServer();
});

afterAll(() => {
  stopTestServer();
});

beforeEach(() => {
  resetGetAndPostRequests();
});

afterEach(() => {
  resetGetAndPostRequests();
});

describe("Testing Slack Class", () => {
  it("Sending message to a user", async () => {
    await Slack.sendDmTo("1234", "Hello There");

    expect(postRequest).toEqual([
      {
        type: "sendDmTo",
        userId: "1234",
        message: "Hello There",
      },
    ]);
  });

  it("Sending message at schedule", async () => {
    await Slack.sendDmTo("1234", "Hello There", "123456");

    expect(postRequest).toEqual([
      {
        type: "sendDmTo",
        userId: "1234",
        message: "Hello There",
        sendAt: "123456",
      },
    ]);
  });
});
