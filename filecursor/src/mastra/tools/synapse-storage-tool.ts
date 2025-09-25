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
    size: z.number().optional(),
    filename: z.string().optional(),
    error: z.string().optional(),
  }),
  execute: async ({ context }) => {
    const { data, filename } = context;
    const privateKey = process.env.FIL_PRIVATE_KEY;

    if (!privateKey) {
      throw new Error(
        'Filecoin private key is not set. Please set FIL_PRIVATE_KEY environment variable.'
      );
    }

    let synapse;
    try {
      synapse = await Synapse.create({
        privateKey,
        rpcURL: RPC_URLS.calibration.websocket,
      });

      console.log('Synapse client initialized successfully');

      const storage = await synapse.createStorage();
      console.log('Storage service created');
      const dataBytes = new TextEncoder().encode(data);
      console.log(`Uploading ${dataBytes.length} bytes to Filecoin`);

      const uploadResult = await storage.upload(dataBytes);

      console.log('Upload successful:', {
        pieceCid: uploadResult.pieceCid.toString(),
        filename: filename || 'unnamed-file',
      });

      return {
        pieceCid: uploadResult.pieceCid.toString(),
        size: dataBytes.length,
        filename: filename || 'unnamed-file',
      };
    } catch (error: any) {
      console.error('Error storing file with Synapse:', {
        message: error.message,
        stack: error.stack,
        cause: error.cause,
        data: error.data,
      });

      let errorMessage = 'Failed to store file with Synapse.';

      if (error.message?.includes('private key')) {
        errorMessage =
          'Invalid Filecoin private key. Please check FIL_PRIVATE_KEY environment variable.';
      } else if (
        error.message?.includes('network') ||
        error.message?.includes('connection')
      ) {
        errorMessage =
          'Network connection failed. Please check your internet connection and try again.';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds in wallet for storage operation.';
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'Storage operation timed out. Please try again.';
      }

      return {
        pieceCid: '',
        error: errorMessage,
        size: 0,
        filename: filename || 'unnamed-file',
      };
    } finally {
      try {
        if (synapse) {
          const provider = synapse.getProvider();
          if (provider && typeof provider.destroy === 'function') {
            await provider.destroy();
            console.log('Synapse provider connection cleaned up');
          }
        }
      } catch (cleanupError) {
        console.warn('Error during cleanup:', cleanupError);
      }
    }
  },
});
