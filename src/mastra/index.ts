import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { LibSQLStore } from "@mastra/libsql";
import { filcoinAgent } from "./agents/filcoin-agent";
import { promptAgent } from "./agents/prompt-agent";

export const mastra = new Mastra({
  agents: {
    filcoinAgent,
    promptAgent,
  },
  storage: new LibSQLStore({
    url: "file:../mastra.db",
  }),
  logger: new PinoLogger({
    name: "Filcoin Agent",
    level: "info",
  }),
});
