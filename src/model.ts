/**
 * Model configuration for Deep Agents
 *
 * Default model configuration matching the Python implementation exactly.
 * Returns a ChatAnthropic instance configured with claude-sonnet-4-20250514 and maxTokens: 4096.
 */

import { ChatAnthropic } from "@langchain/anthropic";
import { LanguageModelLike } from "./types";

/**
 * Get the default model for Deep Agents
 *
 * Returns a ChatAnthropic instance configured exactly like the Python version:
 * - model: "claude-sonnet-4-20250514"
 * - maxTokens: 4096
 *
 * @returns ChatAnthropic instance with default configuration
 */
export function getDefaultModel(): LanguageModelLike {
  return new ChatAnthropic({
    model: "claude-sonnet-4-20250514",
    maxTokens: 4096,
  });
}
