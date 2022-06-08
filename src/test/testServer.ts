import express from "express";
import { Server } from "http";

const testApp = express();
testApp.use(express.json());

export let getRequests = [];
export let postRequest = [];

testApp.post("/", (req, res) => {
  postRequest.push(req.body);
  res.json({ hello: "world!" });
});

const port = 4000;

export const testServerUrl = `http://localhost:${port}/`;

let server: Server | null = null;

export const startTestServer = () => {
  const testServer = testApp.listen(4000, () => {
    server = testServer;
  });
};

export const stopTestServer = () => {
  server?.close();
};

export const resetGetAndPostRequests = () => {
  getRequests = [];
  postRequest = [];
};
