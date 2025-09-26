import { synthikTool } from "./src/mastra/tools/synthik-tool.ts";

console.log("🧪 Testing Synthik Tool - Tabular Data Generation");

const testTabularGeneration = async () => {
  try {
    const result = await synthikTool.execute({
      context: {
        type: "tabular",
        tabular_config: {
          num_rows: 5,
          topic: "User profiles for testing",
          columns: [
            {
              name: "full_name",
              type: "string",
              description: "User's full name",
              max_length: 50
            },
            {
              name: "age",
              type: "int",
              description: "Age in years",
              constraints: { min: 18, max: 80 }
            },
            {
              name: "email",
              type: "email",
              description: "User's email address"
            },
            {
              name: "country",
              type: "categorical",
              description: "User's country",
              categories: ["US", "CA", "GB", "FR", "DE"]
            }
          ],
          strategy: "adaptive_flow",
          format: "json"
        }
      }
    });

    console.log("✅ Tabular Result:", result);

    if (result.success && result.examples) {
      console.log("\n📊 Sample Data:");
      result.examples.forEach((example, index) => {
        console.log(`Sample ${index + 1}:`, JSON.stringify(example, null, 2));
      });
    }
  } catch (error) {
    console.error("❌ Tabular test failed:", error);
  }
};

const testTextGeneration = async () => {
  console.log("\n🧪 Testing Synthik Tool - Text Data Generation");

  try {
    const result = await synthikTool.execute({
      context: {
        type: "text",
        text_config: {
          num_samples: 3,
          task_definition: "sentiment analysis of product reviews",
          data_domain: "e-commerce",
          data_description: "Product reviews with positive/negative/neutral sentiment",
          output_format: "instruction",
          sample_examples: [
            {
              instruction: "Analyze the sentiment of this product review",
              input: "This phone has amazing battery life and great camera quality!",
              output: "positive"
            }
          ]
        }
      }
    });

    console.log("✅ Text Result:", result);

    if (result.success && result.examples) {
      console.log("\n📝 Sample Text Data:");
      result.examples.forEach((example, index) => {
        console.log(`Sample ${index + 1}:`, JSON.stringify(example, null, 2));
      });
    }
  } catch (error) {
    console.error("❌ Text test failed:", error);
  }
};

// Run tests
testTabularGeneration().then(() => testTextGeneration());
