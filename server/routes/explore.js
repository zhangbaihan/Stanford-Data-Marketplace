const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');
const Dataset = require('../models/Dataset');
const { getFileContent } = require('../services/s3service');

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = process.env.CLAUDE_MODEL || 'claude-opus-4-6';

// System prompt for Claude
const SYSTEM_PROMPT = `You are an intelligent data analyst assistant for the Stanford Data Marketplace — a platform where Stanford researchers share and explore datasets.

You have access to tools that let you:
- List all available datasets in the marketplace
- Search for datasets by keyword
- Get detailed metadata about specific datasets
- Fetch the actual data content from datasets (CSV data)

When a user asks a question about data, you should:
1. First search for or list relevant datasets to understand what's available
2. Fetch the actual data content if needed for analysis
3. Provide insightful analysis and commentary
4. When appropriate, create beautiful interactive visualizations

VISUALIZATION INSTRUCTIONS:
When you want to create a visualization, chart, graph, table, or any interactive data display, output a complete self-contained HTML page between <visualization> and </visualization> tags.

Requirements for the HTML:
- Complete HTML document with <!DOCTYPE html>
- All CSS inline in <style> tags
- All JavaScript inline in <script> tags
- Use Chart.js from CDN (https://cdn.jsdelivr.net/npm/chart.js) for charts
- You may also use D3.js (https://cdn.jsdelivr.net/npm/d3@7) for more complex visualizations
- Embed ALL data directly in the JavaScript — do NOT fetch from external URLs
- Beautiful, modern design with a clean color palette
- Responsive layout that fills its container
- Clear titles, axis labels, legends, and data callouts
- Use a white or very light background
- Use the system font stack: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif

Example format:
<visualization>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; background: #fff; color: #1a1a1a; }
  </style>
</head>
<body>
  <h2>Chart Title</h2>
  <canvas id="chart"></canvas>
  <script>
    // visualization code here
  </script>
</body>
</html>
</visualization>

IMPORTANT RULES:
- Always provide narrative text explaining your findings OUTSIDE of the visualization tags. This text appears in the chat panel on the right side.
- Visualizations appear on the main canvas to the left of the chat.
- You can include multiple paragraphs of analysis, insights, and explanations in the text portion.
- When generating a visualization, highlight key patterns, correlations, or surprising findings.
- If the user asks a question that doesn't require visualization (e.g., "what datasets do you have?"), just respond with text.
- When you're not sure which dataset to use, list the available ones and ask the user to clarify.
- For data analysis, always fetch the actual data — don't just describe datasets.
- Keep chat text concise and insightful. The visualization should do the heavy lifting for data display.`;

// Tool definitions for Claude
const TOOLS = [
  {
    name: "list_datasets",
    description: "List all available public and approved datasets in the marketplace. Returns dataset titles, descriptions, tags, and IDs. Use this to see what data is available.",
    input_schema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "search_datasets",
    description: "Search for datasets by keyword query. Returns matching datasets sorted by relevance. Use this when the user mentions specific topics.",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query to find relevant datasets (e.g., 'crime', 'grades', 'climate')"
        }
      },
      required: ["query"]
    }
  },
  {
    name: "get_dataset",
    description: "Get detailed metadata about a specific dataset including full description, methodology, usage notes, provenance, file info, etc.",
    input_schema: {
      type: "object",
      properties: {
        dataset_id: {
          type: "string",
          description: "The MongoDB ObjectId of the dataset"
        }
      },
      required: ["dataset_id"]
    }
  },
  {
    name: "fetch_dataset_content",
    description: "Download and return the actual data content from a dataset file. For CSV files, returns the raw CSV text (limited to first 500 rows for large files). Use this when you need to analyze or visualize the actual data values.",
    input_schema: {
      type: "object",
      properties: {
        dataset_id: {
          type: "string",
          description: "The MongoDB ObjectId of the dataset"
        }
      },
      required: ["dataset_id"]
    }
  }
];

// Execute a tool call against our backend
async function executeTool(name, input) {
  try {
    switch (name) {
      case 'list_datasets': {
        const datasets = await Dataset.find({
          isPublic: true,
          status: 'approved',
        })
          .select('title description tags size fileType downloadCount createdAt')
          .sort({ updatedAt: -1 })
          .limit(50);

        return {
          count: datasets.length,
          datasets: datasets.map(d => ({
            id: d._id.toString(),
            title: d.title,
            description: d.description,
            tags: d.tags,
            size: d.size,
            fileType: d.fileType,
            downloadCount: d.downloadCount,
          }))
        };
      }

      case 'search_datasets': {
        const { query } = input;
        const datasets = await Dataset.find({
          $text: { $search: query },
          isPublic: true,
          status: 'approved',
        })
          .select('title description tags size fileType downloadCount')
          .sort({ score: { $meta: 'textScore' } })
          .limit(20);

        return {
          query,
          count: datasets.length,
          datasets: datasets.map(d => ({
            id: d._id.toString(),
            title: d.title,
            description: d.description,
            tags: d.tags,
            size: d.size,
            fileType: d.fileType,
          }))
        };
      }

      case 'get_dataset': {
        const { dataset_id } = input;
        const dataset = await Dataset.findById(dataset_id)
          .populate('uploadedBy', 'username');

        if (!dataset) {
          return { error: 'Dataset not found' };
        }

        return {
          id: dataset._id.toString(),
          title: dataset.title,
          description: dataset.description,
          abstract: dataset.abstract,
          tags: dataset.tags,
          tableCount: dataset.tableCount,
          fileCount: dataset.fileCount,
          size: dataset.size,
          version: dataset.version,
          provenance: dataset.provenance,
          methodology: dataset.methodology,
          usageNotes: dataset.usageNotes,
          fileName: dataset.fileName,
          fileType: dataset.fileType,
          fileSize: dataset.fileSize,
          downloadCount: dataset.downloadCount,
          license: dataset.license,
          contact: dataset.contact,
          uploadedBy: dataset.uploadedBy?.username,
          createdAt: dataset.createdAt,
        };
      }

      case 'fetch_dataset_content': {
        const { dataset_id } = input;
        const dataset = await Dataset.findById(dataset_id);

        if (!dataset) {
          return { error: 'Dataset not found' };
        }

        if (!dataset.filePath) {
          return { error: 'No file associated with this dataset' };
        }

        const content = await getFileContent(dataset.filePath);

        // Limit content size for large files
        const lines = content.split('\n');
        const MAX_ROWS = 500;

        if (lines.length > MAX_ROWS + 1) { // +1 for header row
          const truncatedContent = lines.slice(0, MAX_ROWS + 1).join('\n');
          return {
            dataset_title: dataset.title,
            file_name: dataset.fileName,
            file_type: dataset.fileType,
            total_rows: lines.length - 1,
            rows_returned: MAX_ROWS,
            truncated: true,
            content: truncatedContent,
          };
        }

        return {
          dataset_title: dataset.title,
          file_name: dataset.fileName,
          file_type: dataset.fileType,
          total_rows: lines.length - 1,
          truncated: false,
          content: content,
        };
      }

      default:
        return { error: `Unknown tool: ${name}` };
    }
  } catch (error) {
    console.error(`Error executing tool ${name}:`, error);
    return { error: `Failed to execute ${name}: ${error.message}` };
  }
}

// Friendly names for tool status updates
const TOOL_STATUS_MESSAGES = {
  list_datasets: 'Browsing available datasets...',
  search_datasets: 'Searching datasets...',
  get_dataset: 'Reading dataset details...',
  fetch_dataset_content: 'Downloading dataset content...',
};

// POST /api/explore/chat
// Accepts conversation messages, talks to Claude with tools, streams back SSE events
router.post('/chat', async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ message: 'Messages array is required' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ message: 'Anthropic API key is not configured on the server' });
  }

  // Set up SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const sendEvent = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    // Build Claude messages from the conversation history
    const claudeMessages = messages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    let continueLoop = true;
    let iterations = 0;
    const MAX_ITERATIONS = 10; // Safety limit to prevent infinite loops

    while (continueLoop && iterations < MAX_ITERATIONS) {
      iterations++;

      sendEvent('status', {
        message: iterations === 1 ? 'Thinking...' : 'Analyzing...',
      });

      const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 16384,
        system: SYSTEM_PROMPT,
        tools: TOOLS,
        messages: claudeMessages,
      });

      if (response.stop_reason === 'tool_use') {
        // Claude wants to use tools — execute them and continue the loop
        claudeMessages.push({ role: 'assistant', content: response.content });

        const toolResults = [];
        for (const block of response.content) {
          if (block.type === 'tool_use') {
            const statusMsg = TOOL_STATUS_MESSAGES[block.name] || `Using ${block.name}...`;
            sendEvent('status', { message: statusMsg });

            const result = await executeTool(block.name, block.input);

            toolResults.push({
              type: 'tool_result',
              tool_use_id: block.id,
              content: JSON.stringify(result),
            });
          }
        }

        // Feed tool results back to Claude
        claudeMessages.push({ role: 'user', content: toolResults });
      } else {
        // Final text response from Claude
        continueLoop = false;

        let fullText = '';
        for (const block of response.content) {
          if (block.type === 'text') {
            fullText += block.text;
          }
        }

        // Extract visualization blocks (take the last one if multiple)
        const vizRegex = /<visualization>([\s\S]*?)<\/visualization>/g;
        let lastArtifact = null;
        let match;

        while ((match = vizRegex.exec(fullText)) !== null) {
          lastArtifact = match[1].trim();
        }

        // Remove visualization blocks from chat text
        const chatText = fullText
          .replace(/<visualization>[\s\S]*?<\/visualization>/g, '')
          .trim();

        if (chatText) {
          sendEvent('text', { content: chatText });
        }

        if (lastArtifact) {
          sendEvent('artifact', { html: lastArtifact });
        }
      }
    }

    if (iterations >= MAX_ITERATIONS) {
      sendEvent('error', { message: 'Reached maximum processing steps. Please try a simpler query.' });
    }

    sendEvent('done', {});
    res.end();
  } catch (error) {
    console.error('Explore chat error:', error);
    sendEvent('error', { message: error.message || 'An unexpected error occurred' });
    sendEvent('done', {});
    res.end();
  }
});

module.exports = router;
