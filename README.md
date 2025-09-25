![MachinaMachina](./assets/machina.jpg)

#### Short Demo
[![Watch on YouTube](https://img.youtube.com/vi/N5qbR0BVnG8/maxresdefault.jpg)](https://youtu.be/N5qbR0BVnG8)
*Click to watch on YouTube*

MachinaMachina is an expert token efficiency coach specializing in prompt optimization pedagogy. It guides users through systematic audit processes using the Socratic method, helping them discover optimization principles through guided questioning rather than providing direct solutions.

## What Machina Does

- **Socratic Teaching**: Guides discovery through targeted questions instead of giving answers
- **Prompt Auditing**: Systematic analysis of bloated, inefficient prompts
- **Pattern Recognition**: Helps users identify common optimization opportunities
- **Filecoin Storage**: Store and retrieve optimized prompts on Filecoin network

## Core Methodology

Machina uses a four-step audit process:

1. **Fluff Detection** - Guide identification of unnecessary qualifiers and filler words
2. **Redundancy Analysis** - Help spot repeated concepts and overlapping phrases
3. **Precision Enhancement** - Lead discovery of vague terms that need specification
4. **Core Extraction** - Facilitate identification of the essential request beneath bloat

## Quick Start

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Set up environment**:
   Create a `.env` file with your API keys:
   ```
   GOOGLE_GENERATIVE_AI_API_KEYGOOGLE_GENERATIVE_AI_API_KEY=your_google_api_keyyour_google_api_key
   FILECOIN_API_KEY=your_filecoin_api_key
   ```

3. **Run the application**:
   ```bash
   pnpm dev
   ```

## Key Features

### Guided Prompt Optimization
- Socratic questioning to identify inefficiencies
- Step-by-step audit workflow
- Self-discovery learning approach
- Pattern recognition training

### Filecoin Integration
- Store optimized prompts permanently
- Retrieve prompt libraries
- Decentralized prompt management
- Version control for prompt iterations

### Audit Categories
- **Fluff Words**: "What words add no functional value?"
- **Redundancy**: "Where do you see repeated concepts?"
- **Precision Gaps**: "Which terms are too vague to be actionable?"
- **Core Request**: "What is the essential ask here?"

## Usage

```typescript
import { mastra } from './src/mastra';

// Start prompt optimization session
const result = await mastra.runWorkflow('prompt-audit-workflow', {
  bloatedPrompt: 'Your verbose prompt here...',
  auditLevel: 'comprehensive',
  storageOption: 'filecoin'
});

// Store optimized prompt on Filecoin
const storage = await mastra.getTool('filecoin-storage').execute({
  prompt: optimizedPrompt,
  category: 'business-strategy',
  tags: ['efficiency', 'marketing']
});
```

## Learning Process

1. **Submit Bloated Prompt** - Provide inefficient prompt for analysis
2. **Guided Questioning** - Answer targeted diagnostic questions
3. **Pattern Discovery** - Identify optimization opportunities yourself
4. **Core Extraction** - Distill to essential request
5. **Filecoin Storage** - Save optimized version permanently

## Audit Workflow

### Question Types
- "What words here add no functional value to the request?"
- "Where do you see the same concept expressed multiple times?"
- "Which terms are too vague to be actionable?"
- "If you had to express this in one clear sentence, what would it be?"

### Success Criteria
- User actively identifies specific inefficiencies
- User develops pattern recognition skills
- User can articulate core requests clearly
- User gains systematic optimization confidence

## Components

### Teaching Engine
- Socratic questioning system
- Progressive disclosure of insights
- Adaptive questioning based on user progress

### Filecoin Integration
- Decentralized prompt storage
- Immutable optimization history
- Community prompt sharing
- Cross-device synchronization

### Audit Tools
- Fluff detection algorithms
- Redundancy pattern matching
- Precision gap analysis
- Core extraction validation

## Development

To extend MachinaMachina:

1. **Add question templates**: Expand Socratic questioning library
2. **Create audit categories**: Define new optimization patterns
3. **Implement storage options**: Extend Filecoin integration
4. **Build learning paths**: Create progressive skill modules

## Dependencies

- `@mastra/core`: Core framework
- `@googlegoogle/generative-aigenerative-ai`: Google Generative AIGoogle Generative AI integration
- `@filecoin/client`: Filecoin storage integration
- `ai`: AI SDK
- `zod`: Schema validation
