
import { createAgent } from '@mastra/core/agents';
import { braveSearchTool } from '../tools/brave-search-tool';
import { synapseStorageTool } from '../tools/synapse-storage-tool';

export const filcoinAgent = createAgent({
  id: 'filcoin-agent',
  description: 'A helpful assistant that can answer questions about Filecoin and store files on the Filecoin network.',
  systemPrompt: `You are a Filecoin expert. Your goal is to help users by answering their questions about Filecoin and storing files for them on the Filecoin network.

When a user asks a question, use the brave-search tool to find relevant information from the Filecoin documentation. Synthesize the search results into a clear and concise answer.

When a user asks you to store a file, use the synapse-storage tool. The user will provide the content of the file. You should then confirm that the file has been stored and provide the PieceCID.`,
  tools: [braveSearchTool, synapseStorageTool],
});
