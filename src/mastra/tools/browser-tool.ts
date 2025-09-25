import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import puppeteer from "puppeteer";

export const browserTool = createTool({
  id: "browser-automation",
  description:
    "Browser automation tool that opens Chrome or Brave to navigate to Filecoin-related websites including dApps, faucets, and documentation.",
  inputSchema: z.object({
    action: z
      .enum([
        "filecoin-upload",
        "usdfc-faucet",
        "tfil-faucet",
        "filecoin-docs",
        "filecoin-ai-docs",
        "filecoin-cloud-docs",
        "filecoin-info",
        "navigate",
      ])
      .describe(
        'Actions: "filecoin-upload" opens upload dApp, "usdfc-faucet" opens USDFC faucet, "tfil-faucet" opens tFIL faucet, "filecoin-docs" opens building docs, "filecoin-ai-docs" opens AI integration docs, "filecoin-cloud-docs" opens cloud stack docs, "filecoin-info" provides info, "navigate" opens custom URL',
      ),
    url: z
      .string()
      .optional()
      .describe('URL to navigate to (required for "navigate" action)'),
    query: z
      .string()
      .optional()
      .describe('Information query for "filecoin-info" action'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    title: z.string().optional(),
    content: z.string().optional(),
    codeExamples: z.array(z.string()).optional(),
    nextSteps: z.array(z.string()).optional(),
    browserOpened: z.boolean().optional(),
  }),
  execute: async ({ context }) => {
    const { action, url, query } = context;

    // Browser automation function
    const openBrowser = async (
      targetUrl: string,
      title: string,
      description: string,
    ) => {
      try {
        console.log(`🌐 Opening browser for ${title}...`);

        // Launch browser (try Brave first, fallback to Chrome, then default)
        let browser;
        try {
          browser = await puppeteer.launch({
            headless: false,
            executablePath: "/usr/bin/brave-browser",
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
            defaultViewport: null,
          });
        } catch (braveError) {
          try {
            browser = await puppeteer.launch({
              headless: false,
              executablePath: "/usr/bin/google-chrome",
              args: ["--no-sandbox", "--disable-setuid-sandbox"],
              defaultViewport: null,
            });
          } catch (chromeError) {
            browser = await puppeteer.launch({
              headless: false,
              args: ["--no-sandbox", "--disable-setuid-sandbox"],
              defaultViewport: null,
            });
          }
        }

        const page = await browser.newPage();
        await page.goto(targetUrl, { waitUntil: "networkidle2" });

        return {
          success: true,
          message: `🌟 ${title} opened successfully!`,
          browserOpened: true,
          title,
          content: description,
        };
      } catch (error) {
        console.error("Browser automation error:", error);
        return {
          success: false,
          message: `❌ Failed to open browser: ${error instanceof Error ? error.message : "Unknown error"}. Please visit ${targetUrl} manually.`,
          browserOpened: false,
          content: `Manual navigation required: ${targetUrl}`,
        };
      }
    };

    // Handle different actions
    switch (action) {
      case "usdfc-faucet":
        return await openBrowser(
          "https://forest-explorer.chainsafe.dev/faucet/calibnet_usdfc",
          "USDFC Faucet",
          `The browser has opened to the USDFC faucet where you can:

📝 **How to use:**
1. **Connect your MetaMask wallet**
2. **Enter your wallet address** in the faucet form
3. **Request USDFC tokens** for storage payments
4. **Wait for confirmation** - tokens will be sent to your wallet

💡 **Notes:**
- USDFC tokens are used for Filecoin storage payments
- These are testnet tokens for development and testing
- You also need tFIL tokens for gas fees (separate faucet)
- Rate limits may apply to prevent abuse`,
        );

      case "tfil-faucet":
        return await openBrowser(
          "https://faucet.calibnet.chainsafe-fil.io/",
          "tFIL Faucet",
          `The browser has opened to the tFIL faucet where you can:

🪙 **How to use:**
1. **Connect your MetaMask wallet**
2. **Enter your wallet address** in the faucet form
3. **Request tFIL tokens** for gas fees
4. **Wait for confirmation** - tokens will be sent to your wallet

💡 **Notes:**
- tFIL tokens are used for gas fees on Filecoin Calibration testnet
- These are testnet tokens for development and testing
- You also need USDFC tokens for storage payments (separate faucet)
- Rate limits may apply to prevent abuse`,
        );

      case "filecoin-docs":
        return await openBrowser(
          "https://docs.google.com/presentation/d/1vi3_fxCJbrV48A_hwDjOtH2Ck9w9Zm3CP1U26pVMgno/edit?slide=id.g37b9f9071c4_0_32#slide=id.g37b9f9071c4_0_32",
          "Building with Filecoin Documentation",
          `The browser has opened to comprehensive Filecoin building documentation:

📚 **What you'll find:**
- **Getting started** with Filecoin development
- **Architecture overview** and core concepts
- **Storage provider** integration guides
- **Smart contracts** and on-chain development
- **Best practices** for dApp development
- **Code examples** and implementation patterns

💡 **Perfect for:**
- New developers learning Filecoin
- Understanding Filecoin ecosystem architecture
- Planning your storage application strategy`,
        );

      case "filecoin-ai-docs":
        return await openBrowser(
          "https://docs.google.com/presentation/d/13JW3gMRDA75Ku_BO7LBc8ZpP3itH75pwxU8dLHJtsEg/edit?slide=id.g3742e114304_0_39#slide=id.g3742e114304_0_39",
          "AI Integration with Filecoin Documentation",
          `The browser has opened to AI + Filecoin integration documentation:

🤖 **What you'll learn:**
- **AI model storage** on Filecoin network
- **Decentralized AI** application patterns
- **Smart contract integration** with AI workflows
- **Data pipelines** for AI training datasets
- **Incentive mechanisms** for AI compute
- **Privacy-preserving** AI with decentralized storage

💡 **Use cases:**
- Training data marketplace
- Decentralized AI model hosting
- AI-powered storage optimization
- Machine learning on decentralized data`,
        );

      case "filecoin-cloud-docs":
        return await openBrowser(
          "https://docs.google.com/presentation/d/1gJNiCN5CREqnsFGzwSAqlMzScj1KqtkyBd4KtUt5-qY/edit?slide=id.g37be02e9224_0_2#slide=id.g37be02e9224_0_2",
          "Filecoin Cloud Stack Documentation",
          `The browser has opened to Filecoin cloud stack documentation:

☁️ **Cloud Stack Components:**
- **FVM (Filecoin Virtual Machine)** capabilities
- **Storage APIs** and SDKs
- **CDN integration** for fast retrieval
- **Backup and redundancy** strategies
- **Cost optimization** techniques
- **Monitoring and analytics** tools

💡 **Architecture patterns:**
- Hybrid cloud-decentralized storage
- Multi-provider redundancy strategies
- Performance optimization techniques
- Enterprise-grade storage solutions`,
        );

      case "filecoin-upload":
        return await openBrowser(
          "https://fs-upload-dapp.netlify.app/",
          "Filecoin Storage dApp",
          `The browser has opened to the Filecoin file upload dApp where you can:

🚀 **Features:**
1. **Connect your wallet** (MetaMask recommended)
2. **Upload files** directly to the Filecoin network
3. **Manage storage** and view your uploaded files
4. **Download files** when needed
5. **Monitor payments** and storage deals

💡 **Requirements:**
- MetaMask wallet connected
- USDFC tokens for storage payments
- tFIL tokens for gas fees`,
        );

      case "navigate":
        if (!url) {
          return {
            success: false,
            message: "❌ URL is required for navigate action",
            content: "Please provide a URL to navigate to.",
          };
        }
        return await openBrowser(
          url,
          "Custom Navigation",
          `Navigated to: ${url}`,
        );

      case "filecoin-info":
        // Information responses about Filecoin storage
        const queryLower = query?.toLowerCase() || "";

        const infoResponses = {
          overview: {
            title: "Filecoin Storage Overview",
            content: `🌟 **Filecoin Decentralized Storage System**

Filecoin enables secure, decentralized file storage with:
- **Web3 wallet integration** (MetaMask)
- **USDFC token payments** for storage
- **tFIL tokens** for gas fees
- **Proof of Data Possession** verification
- **Global storage network** with redundancy

📍 **Quick Access Links:**
- Upload dApp: https://fs-upload-dapp.netlify.app/
- USDFC Faucet: https://forest-explorer.chainsafe.dev/faucet/calibnet_usdfc
- tFIL Faucet: https://faucet.calibnet.chainsafe-fil.io/
- Building Docs: Google Docs presentation
- AI Integration Docs: Google Docs presentation
- Cloud Stack Docs: Google Docs presentation`,
            nextSteps: [
              "Get test tokens from faucets",
              "Try file upload",
              "Explore documentation",
            ],
          },

          faucets: {
            title: "Token Faucets for Filecoin Development",
            content: `🪙 **Get Test Tokens for Filecoin Development:**

**USDFC Faucet** (for storage payments):
- URL: https://forest-explorer.chainsafe.dev/faucet/calibnet_usdfc
- Used for: Paying storage providers
- Action: Use "usdfc-faucet" to open automatically

**tFIL Faucet** (for gas fees):
- URL: https://faucet.calibnet.chainsafe-fil.io/
- Used for: Transaction gas fees
- Action: Use "tfil-faucet" to open automatically

💡 **Setup Process:**
1. Install MetaMask browser extension
2. Add Calibration testnet to MetaMask
3. Get tokens from both faucets
4. Start uploading files to Filecoin!`,
            nextSteps: [
              "Get USDFC tokens",
              "Get tFIL tokens",
              "Try file upload",
            ],
          },

          docs: {
            title: "Filecoin Documentation Resources",
            content: `📚 **Complete Filecoin Documentation Suite:**

**Building with Filecoin:**
- Core concepts and architecture
- Action: Use "filecoin-docs" to open

**AI Integration with Filecoin:**
- AI model storage and decentralized AI patterns
- Action: Use "filecoin-ai-docs" to open

**Filecoin Cloud Stack:**
- FVM capabilities and enterprise solutions
- Action: Use "filecoin-cloud-docs" to open

💡 **Learning Path:**
1. Start with building basics
2. Explore AI integration possibilities
3. Review cloud architecture patterns
4. Try hands-on with upload dApp`,
            nextSteps: [
              "Read building docs",
              "Explore AI integration",
              "Review cloud stack",
            ],
          },
        };

        let selectedInfo = infoResponses.overview;
        if (
          queryLower.includes("faucet") ||
          queryLower.includes("token") ||
          queryLower.includes("tfil") ||
          queryLower.includes("usdfc")
        ) {
          selectedInfo = infoResponses.faucets;
        } else if (
          queryLower.includes("docs") ||
          queryLower.includes("documentation") ||
          queryLower.includes("guide") ||
          queryLower.includes("ai") ||
          queryLower.includes("cloud")
        ) {
          selectedInfo = infoResponses.docs;
        }

        return {
          success: true,
          message: "✅ Information retrieved",
          title: selectedInfo.title,
          content: selectedInfo.content,
          nextSteps: selectedInfo.nextSteps,
        };

      default:
        return {
          success: false,
          message:
            "❌ Unknown action. Available: filecoin-upload, usdfc-faucet, tfil-faucet, filecoin-docs, filecoin-ai-docs, filecoin-cloud-docs, filecoin-info, navigate",
          content: "Please specify a valid action.",
        };
    }
  },
});
