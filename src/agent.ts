import "dotenv/config";
import express, { Request, Response } from "express";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { createDeepAgent } from "./graph";
import { BaseMessage, HumanMessage } from "@langchain/core/messages";
import { CompiledStateGraph, MemorySaver } from "@langchain/langgraph";

const researchInstructions = `
# Guidelines
- You are an expert JS developer instructed with creating a JS script for an experiment on an eCommerce website.
- The JS script should alter the DOM of the page to show a new UI per the experiment instructions.
- The design of the experiment should be on par with the website's design system and colors.
- If something is unclear or you are unsure of how to implement the experiment, ask the user.
- Use the playwright mcp server to navigate to the location of the experiment, retrieve the DOM, run the JS script and test that the final result actually works.`;


const prompt = `The website is https://babyark.com.

The experiment instructions are:
let's create an additional button warranty option that should appear as soon as the cart is loaded. It should say: ""1 Year"" and it's protecction price shoul be $0.00. It should be pre-selected, and designed exactly like the rest of the warranty selection buttons. When another warranty button is selected, it should look like a non-selected option
`;

// MCP 
const client = new MultiServerMCPClient({
  mcpServers: {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest",
        "--isolated"
      ]
    }
  },
});

let agent: CompiledStateGraph<any, any, any, any, any>;

// Invoke the agent
async function main() {
  console.log('Starting..');
  await startServer();

  const tools = await client.getTools();

  // Create the agent
  agent = createDeepAgent({
    tools,
    instructions: researchInstructions,
    subagents: [],
  }).withConfig({ recursionLimit: 1000 });

  console.log('Application started');
}

async function startServer(): Promise<void> {
  const app = express();
  app.use(express.json());

  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({ status: "ok" });
  });

  app.post("/message", async (req: Request, res: Response) => {
    try {
      const { message, thread_id } = req.body;
      console.log('adding message', { message, thread_id });
      for await (const chunk of await agent.stream(
        { messages: [message] },
        { streamMode: "updates", configurable: { thread_id: thread_id } }
      )) {
        console.log(chunk);
        console.log("\n");
      }
      res.json({ status: "ok" });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.get("/thread/:thread_id", async (req: Request, res: Response) => {
    const { thread_id } = req.params;
    const state = await getState(thread_id);
    res.json(state);
  });

  const port = Number(10000);
  await new Promise<void>((resolve) => {
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
      resolve();
    });
  });
}

async function getState(thread_id: string) {
  const state = await agent.getState({ configurable: { thread_id: thread_id } });
  return state;
}

main();
