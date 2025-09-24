import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import axios from 'axios';

export const braveSearchTool = createTool({
  id: 'brave-search',
  description:
    'Searches the web using the Brave Search API, focusing on Filecoin documentation.',
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
      const response = await axios.get(
        'https://api.search.brave.com/res/v1/web/search',
        {
          headers: {
            'X-Subscription-Token': apiKey,
            'Accept': 'application/json',
            'User-Agent': 'Mastra-Filecoin-Agent/1.0',
          },
          params: {
            q: query,
            count: 10,
            search_lang: 'en',
            country: 'us',
            safesearch: 'moderate',
            freshness: 'pd',
            text_decorations: false,
          },
          timeout: 10000,
        }
      );

      // Check if response has web results
      if (!response.data || !response.data.web || !response.data.web.results) {
        return { results: [] };
      }

      const results = response.data.web.results
        .slice(0, 5)
        .map((result: any) => ({
          title: result.title || 'No title',
          url: result.url || '',
          description:
            result.description || result.snippet || 'No description available',
        }));

      return { results };
    } catch (error: any) {
      console.error('Error searching with Brave:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });

      // Fallback to basic search without site restriction if 422 error
      if (error.response?.status === 422) {
        try {
          const fallbackResponse = await axios.get(
            'https://api.search.brave.com/res/v1/web/search',
            {
              headers: {
                'X-Subscription-Token': apiKey,
                'Accept': 'application/json',
              },
              params: {
                q: query,
                count: 5,
              },
              timeout: 10000,
            }
          );

          if (fallbackResponse.data?.web?.results) {
            const results = fallbackResponse.data.web.results
              .slice(0, 3)
              .map((result: any) => ({
                title: result.title || 'No title',
                url: result.url || '',
                description:
                  result.description ||
                  result.snippet ||
                  'No description available',
              }));
            return { results };
          }
        } catch (fallbackError) {
          console.error('Fallback search also failed:', fallbackError);
        }
      }

      return { results: [] };
    }
  },
});
