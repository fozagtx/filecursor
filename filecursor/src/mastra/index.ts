import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';

// Import agents
import { filcoinAgent } from './agents/filcoin-agent';

export const mastra = new Mastra({
  agents: {
    filcoinAgent,
  },
  storage: new LibSQLStore({
    url: 'file:../mastra.db',
  }),
  logger: new PinoLogger({
    name: 'Filcoin Agent',
    level: 'info',
  }),
});
