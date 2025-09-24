
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import axios from 'axios';

export const braveSearchTool = createTool({
  id: 'brave-search',
  description: 'Searches the web using the Brave Search API, focusing on Filecoin documentation.',
  inputSchema: z.object({
    query: z.string().describe('The search query.'),
  }),
  outputSchema: z.object({
    results: z.array(
      z.object({
        title: z.string(),
        url: z.string(),
        description: z.string(),
      })
    ),
  }),
  execute: async ({ context }) => {
    const { query } = context;
    const apiKey = process.env.BRAVE_API_KEY;

    if (!apiKey) {
      throw new Error('Brave API key is not set.');
    }

    try {
      const response = await axios.get('https://api.search.brave.com/res/v1/web/search', {
        headers: {
          'X-Subscription-Token': apiKey,
        },
        params: {
          q: `${query} site:docs.filecoin.io`,
        },
      });

      const results = response.data.web.results.map((result: any) => ({
        title: result.title,
        url: result.url,
        description: result.description,
      }));

      return { results };
    } catch (error) {
      console.error('Error searching with Brave:', error);
      throw new Error('Failed to perform search with Brave.');
    }
  },
});
