import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import SynthikClient, {
  ColumnBuilder,
  type DatasetGenerationRequest,
  type TextDatasetGenerationRequest,
  type ColumnDescription,
  type GenerationStrategy,
  type TabularExportFormat,
} from "synthik-client";

const columnConstraintsSchema = z
  .object({
    min: z.number().optional(),
    max: z.number().optional(),
    regex: z.string().optional(),
  })
  .optional();

const columnSchema = z.object({
  name: z.string().describe("Column name"),
  type: z
    .enum(["string", "int", "float", "email", "categorical", "uuid"])
    .describe("Column data type"),
  description: z.string().optional().describe("Column description"),
  max_length: z
    .number()
    .optional()
    .describe("Maximum length for string columns"),
  constraints: columnConstraintsSchema.describe("Value constraints"),
  categories: z
    .array(z.string())
    .optional()
    .describe("Categories for categorical columns"),
});

const tabularRequestSchema = z.object({
  num_rows: z
    .number()
    .min(1)
    .max(10000)
    .describe("Number of rows to generate (1-10000)"),
  topic: z.string().describe("Topic or theme for the synthetic data"),
  columns: z.array(columnSchema).describe("Array of column definitions"),
  strategy: z
    .enum(["adaptive_flow", "baseline"])
    .optional()
    .default("adaptive_flow")
    .describe("Generation strategy"),
  format: z
    .enum(["json", "csv", "parquet"])
    .optional()
    .default("json")
    .describe("Output format"),
});

const textExampleSchema = z.object({
  instruction: z.string().describe("Instruction text"),
  input: z.string().describe("Input text"),
  output: z.string().describe("Expected output"),
});

const textRequestSchema = z.object({
  num_samples: z
    .number()
    .min(1)
    .max(1000)
    .describe("Number of text samples to generate (1-1000)"),
  task_definition: z.string().describe("Definition of the task/use case"),
  data_domain: z.string().describe("Domain or context of the data"),
  data_description: z
    .string()
    .describe("Detailed description of the expected data"),
  output_format: z
    .enum(["instruction", "conversation", "json"])
    .describe("Format of generated text data"),
  sample_examples: z
    .array(textExampleSchema)
    .optional()
    .describe("Example samples to guide generation"),
});

const synthikRequestSchema = z.object({
  type: z
    .enum(["tabular", "text"])
    .describe("Type of synthetic data to generate"),
  tabular_config: tabularRequestSchema.optional(),
  text_config: textRequestSchema.optional(),
});

export const synthikTool = createTool({
  id: "synthik-data-generator",
  description:
    "Generate high-quality synthetic data using Synthik Labs API. Supports both tabular data (structured datasets) and text data (instruction datasets, completions, conversations) with various output formats.",
  inputSchema: synthikRequestSchema,
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    data: z.any().optional(),
    format: z.string().optional(),
    stats: z
      .object({
        rows_generated: z.number().optional(),
        samples_generated: z.number().optional(),
        columns: z.number().optional(),
        generation_time: z.string().optional(),
      })
      .optional(),
    examples: z.array(z.any()).optional(),
    error: z.string().optional(),
  }),
  execute: async ({ context }) => {
    const { type, tabular_config, text_config } = context;

    try {
      // Initialize client without API key as per documentation
      const client = new SynthikClient();

      const startTime = Date.now();

      if (type === "tabular") {
        if (!tabular_config) {
          return {
            success: false,
            message:
              "❌ Tabular configuration is required when type is 'tabular'",
            error: "Missing tabular_config",
          };
        }
        const columns: ColumnDescription[] = tabular_config.columns.map(
          (col) => {
            switch (col.type) {
              case "string":
                return ColumnBuilder.string(col.name, {
                  description: col.description,
                  max_length: col.max_length,
                  constraints: col.constraints,
                }).build();

              case "int":
                return ColumnBuilder.int(col.name, {
                  description: col.description,
                  constraints: col.constraints,
                }).build();

              case "float":
                return ColumnBuilder.float(col.name, {
                  description: col.description,
                  constraints: col.constraints,
                }).build();

              case "uuid":
                return ColumnBuilder.uuid(col.name, {
                  description: col.description,
                }).build();

              case "email":
                return ColumnBuilder.email(col.name, {
                  description: col.description,
                }).build();

              case "categorical":
                if (!col.categories || col.categories.length === 0) {
                  throw new Error(
                    `Categories are required for categorical column '${col.name}'`,
                  );
                }
                return ColumnBuilder.categorical(col.name, col.categories, {
                  description: col.description,
                }).build();

              default:
                throw new Error(`Unsupported column type: ${col.type}`);
            }
          },
        );

        const request: DatasetGenerationRequest = {
          num_rows: tabular_config.num_rows,
          topic: tabular_config.topic,
          columns,
        };

        console.log(
          `🎯 Generating ${tabular_config.num_rows} rows of tabular data on topic: "${tabular_config.topic}"`,
        );
        const result: any = await client.tabular.generate(request, {
          strategy: tabular_config.strategy as GenerationStrategy,
          format: tabular_config.format as TabularExportFormat,
        });

        const endTime = Date.now();
        const generationTime = ((endTime - startTime) / 1000).toFixed(2);
        let examples: any[] = [];
        if (Array.isArray(result)) {
          examples = result.slice(0, 3);
        } else if (typeof result === "string") {
          if (tabular_config.format === "json") {
            try {
              const parsed = JSON.parse(result);
              if (Array.isArray(parsed)) {
                examples = parsed.slice(0, 3);
              } else {
                examples = [parsed];
              }
            } catch (e) {
              // If parsing fails, show raw result as example
              const preview =
                result.length > 500 ? result.substring(0, 500) + "..." : result;
              examples = [preview];
            }
          } else {
            // For CSV or other string formats
            const preview =
              result.length > 500 ? result.substring(0, 500) + "..." : result;
            examples = [preview];
          }
        } else if (result instanceof ArrayBuffer) {
          // Handle Parquet format
          examples = [`[Binary Parquet data - ${result.byteLength} bytes]`];
        } else {
          examples = [result];
        }

        return {
          success: true,
          message: `✅ Successfully generated ${tabular_config.num_rows} rows of synthetic tabular data in ${generationTime}s`,
          data: result,
          format: tabular_config.format,
          stats: {
            rows_generated: tabular_config.num_rows,
            columns: columns.length,
            generation_time: `${generationTime}s`,
          },
          examples,
        };
      } else if (type === "text") {
        if (!text_config) {
          return {
            success: false,
            message: "❌ Text configuration is required when type is 'text'",
            error: "Missing text_config",
          };
        }

        // Create the text generation request
        const request: TextDatasetGenerationRequest = {
          num_samples: text_config.num_samples,
          task_definition: text_config.task_definition,
          data_domain: text_config.data_domain,
          data_description: text_config.data_description,
          output_format: text_config.output_format,
          sample_examples: text_config.sample_examples,
        };

        console.log(
          `📝 Generating ${text_config.num_samples} text samples for task: "${text_config.task_definition}"`,
        );

        // Generate the text data
        const result: any = await client.text.generate(request);

        const endTime = Date.now();
        const generationTime = ((endTime - startTime) / 1000).toFixed(2);

        // Get a few examples for preview
        let examples: any[] = [];
        if (Array.isArray(result)) {
          examples = result.slice(0, 3);
        }

        return {
          success: true,
          message: `✅ Successfully generated ${text_config.num_samples} synthetic text samples in ${generationTime}s`,
          data: result,
          format: text_config.output_format,
          stats: {
            samples_generated: text_config.num_samples,
            generation_time: `${generationTime}s`,
          },
          examples,
        };
      } else {
        return {
          success: false,
          message: "❌ Invalid type specified. Must be 'tabular' or 'text'",
          error: "Invalid type",
        };
      }
    } catch (error) {
      console.error("Synthik generation error:", error);

      let errorMessage = "Unknown error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      if (errorMessage.includes("rate limit")) {
        errorMessage +=
          ". Please wait before making another request or upgrade your Synthik plan.";
      } else if (
        errorMessage.includes("network") ||
        errorMessage.includes("fetch")
      ) {
        errorMessage +=
          ". Please check your internet connection and try again.";
      }

      return {
        success: false,
        message: `❌ Failed to generate synthetic data: ${errorMessage}`,
        error: errorMessage,
      };
    }
  },
});
