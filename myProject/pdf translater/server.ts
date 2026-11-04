import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { globalBrain } from './brain/engine';
import { GenerateOptions, TrainInput, BrainExportData } from './brain/types';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// In-memory cross-device sync store (Sync Code -> Data)
const syncStore = new Map<string, { data: any; updatedAt: number }>();

// Clean up expired sync entries (> 24 hours)
setInterval(() => {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  for (const [key, val] of syncStore.entries()) {
    if (val.updatedAt < cutoff) {
      syncStore.delete(key);
    }
  }
}, 60 * 60 * 1000);

// Initialize optional Gemini client for Hybrid Booster mode
let geminiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  } catch (err) {
    console.warn('[Hybrid Booster] Gemini API init skipped:', err);
  }
}

// -------------------------------------------------------------
// REST API Routes
// -------------------------------------------------------------

// 1. Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    model: globalBrain.name,
    version: globalBrain.version,
    geminiBoosterAvailable: !!geminiClient,
    stats: globalBrain.getStats()
  });
});

// 2. Custom Model Generate Endpoint
app.post('/api/brain/generate', async (req: Request, res: Response) => {
  try {
    const { prompt, personality, temperature, enableHybridBooster, conversationHistory } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Valid prompt string is required' });
      return;
    }

    // Step A: Autonomous Local Brain generation
    const brainResult = globalBrain.generate({
      prompt,
      personality,
      temperature
    });

    // Step B: Optional Hybrid Booster mode if requested, available, and brain has low confidence
    if (
      enableHybridBooster &&
      geminiClient &&
      brainResult.confidence < 0.55
    ) {
      try {
        const sysInstruction = personality?.systemPrompt || 
          'You are Chotu, a friendly child-like learning AI from India. Speak warmly in Hinglish/English.';
        
        const response = await geminiClient.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            { role: 'user', parts: [{ text: `${sysInstruction}\n\nUser Question: ${prompt}` }] }
          ]
        });

        const boosterText = response.text || brainResult.text;
        
        // Auto-train the local brain with this boosted knowledge!
        globalBrain.train({
          prompt,
          response: boosterText,
          category: 'hybrid_learned',
          priority: 'normal'
        });

        res.json({
          ...brainResult,
          text: boosterText,
          source: 'hybrid',
          confidence: 0.95,
          needsTeaching: false
        });
        return;
      } catch (geminiErr) {
        console.warn('[Hybrid Booster Error, falling back to local brain]:', geminiErr);
      }
    }

    res.json(brainResult);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Generation failed' });
  }
});

// 3. OpenAI-Compatible Chat Completions API (/api/v1/chat/completions)
app.post('/api/v1/chat/completions', (req: Request, res: Response) => {
  try {
    const { messages, temperature } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Messages array is required' });
      return;
    }

    const lastMessage = messages[messages.length - 1];
    const userPrompt = lastMessage?.content || '';

    const brainResult = globalBrain.generate({
      prompt: userPrompt,
      temperature: temperature || 0.7
    });

    res.json({
      id: `chatcmpl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: 'chotu-ai-v2',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: brainResult.text
          },
          finish_reason: 'stop'
        }
      ],
      usage: {
        prompt_tokens: Math.ceil(userPrompt.length / 4),
        completion_tokens: brainResult.tokensUsed,
        total_tokens: Math.ceil(userPrompt.length / 4) + brainResult.tokensUsed
      },
      brain_metadata: {
        confidence: brainResult.confidence,
        intent: brainResult.intent,
        matchedNodes: brainResult.matchedNodes,
        latencyMs: brainResult.latencyMs
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'API request failed' });
  }
});

// 4. Train the Model ("Bachho ki tarah sikhna")
app.post('/api/brain/train', (req: Request, res: Response) => {
  try {
    const { prompt, response, category, priority } = req.body;
    if (!prompt || !response) {
      res.status(400).json({ error: 'Both prompt and response are required for training' });
      return;
    }

    const result = globalBrain.train({
      prompt,
      response,
      category: category || 'teacher',
      priority: priority || 'high'
    });

    res.json({
      success: true,
      message: result.isNew 
        ? 'Balle Balle! Chotu ne naya concept seekh liya! 🌟' 
        : 'Purani memory update aur reinforce ho gayi! 🧠',
      node: result.node,
      stats: globalBrain.getStats()
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Training failed' });
  }
});

// 5. Brain Statistics
app.get('/api/brain/stats', (req: Request, res: Response) => {
  res.json({
    stats: globalBrain.getStats(),
    learningLog: globalBrain.getLearningLog().slice(0, 15)
  });
});

// 6. Get Knowledge Nodes
app.get('/api/brain/nodes', (req: Request, res: Response) => {
  const nodes = globalBrain.getAllNodes();
  res.json({ total: nodes.length, nodes });
});

// 7. Delete Node
app.delete('/api/brain/nodes/:id', (req: Request, res: Response) => {
  const success = globalBrain.deleteNode(req.params.id);
  res.json({ success });
});

// 8. Model Export & Import
app.get('/api/brain/export', (req: Request, res: Response) => {
  const data = globalBrain.exportData();
  res.setHeader('Content-Disposition', 'attachment; filename=chotu-model-weights.json');
  res.setHeader('Content-Type', 'application/json');
  res.json(data);
});

app.post('/api/brain/import', (req: Request, res: Response) => {
  const data = req.body as BrainExportData;
  const success = globalBrain.importData(data);
  if (success) {
    res.json({ success: true, stats: globalBrain.getStats() });
  } else {
    res.status(400).json({ error: 'Invalid model weights file format' });
  }
});

// 9. Cross-Device Sync Backup & Restore
app.post('/api/sync/push', (req: Request, res: Response) => {
  const { syncKey, data } = req.body;
  if (!syncKey || !data) {
    res.status(400).json({ error: 'syncKey and data are required' });
    return;
  }
  syncStore.set(syncKey, { data, updatedAt: Date.now() });
  res.json({ success: true, message: 'Data synced successfully to cloud vault' });
});

app.get('/api/sync/pull/:key', (req: Request, res: Response) => {
  const entry = syncStore.get(req.params.key);
  if (!entry) {
    res.status(404).json({ error: 'Sync code not found or expired' });
    return;
  }
  res.json({ success: true, data: entry.data, updatedAt: entry.updatedAt });
});

// -------------------------------------------------------------
// Vite Server mounting in Dev / Static serving in Prod
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 ChotuAI Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
