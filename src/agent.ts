import "dotenv/config";
import express, { Request, Response } from "express";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { createDeepAgent } from "./graph";
import { BaseMessage, HumanMessage } from "@langchain/core/messages";
import { CompiledStateGraph } from "@langchain/langgraph";

const researchInstructions = `
# Guidelines
- You are an expert JS developer instructed with creating a JS script for an experiment on an eCommerce website.
- The JS script should alter the DOM of the page to show a new UI per the experiment instructions.
- The design of the experiment should be on par with the website's design system and colors.
- If something is unclear or you are unsure of how to implement the experiment, ask the user.
- Use the playwright mcp server to navigate to the location of the experiment, retrieve the DOM, run the JS script and test that the final result actually works.`;

const experimentInstructions = `let's create an additional button warranty option that should appear as soon as the cart is loaded. It should say: ""1 Year"" and it's protecction price shoul be $0.00. It should be pre-selected, and designed exactly like the rest of the warranty selection buttons. When another warranty button is selected, it should look like a non-selected option`;
const website = 'https://babyark.com';

const prompt = `The website is ${website}.

The experiment instructions are: ${experimentInstructions}.
`;

// MCP 
const client = new MultiServerMCPClient({
  mcpServers: {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest"
      ]
    }
  },
});

let agent: CompiledStateGraph<any, any, any, any, any>;

// Invoke the agent
async function main() {
  console.log('Starting..');
  console.log('anthropic key ', process.env.ANTHROPIC_API_KEY);

  const tools = await client.getTools();

  // Create the agent
  agent = createDeepAgent({
    tools,
    instructions: researchInstructions,
    subagents: [],
  }).withConfig({ recursionLimit: 1000 });

  await startServer();

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
      const { content, thread_id } = req.body;

      const message: BaseMessage = new HumanMessage(content);
      const result = await addMessage(message, thread_id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  const port = Number(10000);
  await new Promise<void>((resolve) => {
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
      resolve();
    });
  });
}

async function addMessage(message: BaseMessage, thread_id: string) {
  const result = await agent.invoke({
    messages: [message],
  }, {
    configurable: {
      thread_id: thread_id,
    }
  });

  console.log(result);
  return result;
}

main();
