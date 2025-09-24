import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { Synapse, RPC_URLS } from '@filoz/synapse-sdk';

export const synapseStorageTool = createTool({
  id: 'synapse-storage',
  description: 'Stores files on the Filecoin network using the Synapse SDK.',
  inputSchema: z.object({
    data: z.string().describe('The content of the file to store.'),
    filename: z.string().optional().describe('The name of the file.'),
  }),
  outputSchema: z.object({
    pieceCid: z.string(),
  }),
  execute: async ({ context }) => {
    const { data } = context;
    const privateKey = process.env.FIL_PRIVATE_KEY;

    if (!privateKey) {
      throw new Error('Filecoin private key is not set.');
    }

    try {
      const synapse = await Synapse.create({
        privateKey,
        rpcURL: RPC_URLS.calibration.websocket, // Using calibration testnet
      });

      const uploadResult = await synapse.storage.upload(
        new TextEncoder().encode(data)
      );

      // Close the connection
      const provider = synapse.getProvider();
      if (provider && typeof provider.destroy === 'function') {
        await provider.destroy();
      }

      return { pieceCid: uploadResult.pieceCid.toString() };
    } catch (error) {
      console.error('Error storing file with Synapse:', error);
      throw new Error('Failed to store file with Synapse.');
    }
  },
});
