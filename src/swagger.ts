import swaggerJsdoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Variant Agent API",
      version: "1.0.0",
      description: "API endpoints for controlling the Variant Agent threads",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
        },
      },
      schemas: {
        ContentItem: {
          type: "object",
          description: "A single content block within a message.",
          required: ["type"],
          properties: {
            type: {
              type: "string",
              description: "Type of the content block",
              enum: ["text"],
            },
            text: {
              type: "string",
              description: "Text content when type is 'text'",
            },
          },
        },
        Message: {
          type: "object",
          description: "Structured message payload.",
          required: ["role", "content"],
          properties: {
            role: {
              type: "string",
              description: "Author role of the message",
              enum: ["user", "assistant", "system"],
            },
            content: {
              type: "array",
              description: "List of content blocks composing the message",
              minItems: 1,
              items: { $ref: "#/components/schemas/ContentItem" },
            },
          },
        },
        MessageRequest: {
          type: "object",
          required: ["message"],
          properties: {
            thread_id: {
              description: "Thread identifier; also provided via path parameter",
              oneOf: [{ type: "string" }, { type: "integer" }],
            },
            message: {
              $ref: "#/components/schemas/Message",
            },
          },
          example: {
            thread_id: 2,
            message: {
              content: [
                {
                  type: "text",
                  text:
                    "The website is https://babyark.com.\nThe experiment instructions are:\nlet's create an additional button warranty option that should appear as soon as the cart is loaded. It should say: '1 Year' and it's protecction price shoul be $0.00. It should be pre-selected, and designed exactly like the rest of the warranty selection buttons. When another warranty button is selected, it should look like a non-selected option",
                },
              ],
              role: "user",
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            error: { type: "string" },
          },
        },
      },
    },
    paths: {
      "/health": {
        get: {
          summary: "Health check",
          tags: ["System"],
          responses: {
            200: {
              description: "Service is healthy",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string", example: "ok" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/thread/{thread_id}": {
        get: {
          summary: "Get thread state",
          tags: ["Threads"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "thread_id",
              in: "path",
              required: true,
              schema: { type: "string" },
              example: "2",
            },
          ],
          responses: {
            200: {
              description: "Thread state returned",
              content: {
                "application/json": {
                  schema: { type: "object", additionalProperties: true },
                },
              },
            },
            401: {
              description: "Unauthorized",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
              },
            },
          },
        },
      },
      "/thread/{thread_id}/message": {
        post: {
          summary: "Post a message to a thread",
          tags: ["Threads"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "thread_id",
              in: "path",
              required: true,
              schema: { type: "string" },
              example: "2",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageRequest" },
              },
            },
          },
          responses: {
            200: {
              description: "Message accepted",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: { status: { type: "string", example: "ok" } },
                  },
                },
              },
            },
            401: {
              description: "Unauthorized",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
              },
            },
            500: {
              description: "Internal Server Error",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
              },
            },
          },
        },
      },
    },
  },
  apis: [],
});


