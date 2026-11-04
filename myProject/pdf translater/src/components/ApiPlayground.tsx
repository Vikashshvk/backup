import React, { useState } from 'react';
import {
  Terminal,
  Copy,
  Check,
  Play,
  Code2,
  Cpu,
  Layers,
  KeyRound,
  ExternalLink
} from 'lucide-react';

export const ApiPlayground: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<'generate' | 'openai' | 'train'>('generate');
  const [promptInput, setPromptInput] = useState('Namaste Chotu! Bharat ki rajdhani kya hai?');
  const [trainPrompt, setTrainPrompt] = useState('What is the national animal of India?');
  const [trainResponse, setTrainResponse] = useState('The national animal of India is the Royal Bengal Tiger.');
  const [apiKey, setApiKey] = useState('chotu-sk-live-india-2026');
  const [responseJson, setResponseJson] = useState<string | null>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const handleTestRequest = async () => {
    setIsLoading(true);
    setResponseJson(null);
    setResponseStatus(null);
    const start = performance.now();

    try {
      let url = `${origin}/api/brain/generate`;
      let body: any = { prompt: promptInput };

      if (selectedEndpoint === 'openai') {
        url = `${origin}/api/v1/chat/completions`;
        body = {
          model: 'chotu-ai-v2',
          messages: [{ role: 'user', content: promptInput }],
          temperature: 0.7
        };
      } else if (selectedEndpoint === 'train') {
        url = `${origin}/api/brain/train`;
        body = {
          prompt: trainPrompt,
          response: trainResponse,
          category: 'general',
          priority: 'high'
        };
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(body)
      });

      const elapsed = Math.round(performance.now() - start);
      setLatencyMs(elapsed);
      setResponseStatus(res.status);

      const json = await res.json();
      setResponseJson(JSON.stringify(json, null, 2));
    } catch (err: any) {
      setResponseStatus(500);
      setResponseJson(JSON.stringify({ error: err.message || 'Network request failed' }, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  const curlSnippet = selectedEndpoint === 'openai'
    ? `curl -X POST ${origin}/api/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -d '{
    "model": "chotu-ai-v2",
    "messages": [{"role": "user", "content": "${promptInput}"}]
  }'`
    : selectedEndpoint === 'train'
    ? `curl -X POST ${origin}/api/brain/train \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "${trainPrompt}",
    "response": "${trainResponse}",
    "category": "science"
  }'`
    : `curl -X POST ${origin}/api/brain/generate \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "${promptInput}"
  }'`;

  const jsSnippet = selectedEndpoint === 'openai'
    ? `const response = await fetch("${origin}/api/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer ${apiKey}"
  },
  body: JSON.stringify({
    model: "chotu-ai-v2",
    messages: [{ role: "user", content: "${promptInput}" }]
  })
});

const data = await response.json();
console.log(data.choices[0].message.content);`
    : `const response = await fetch("${origin}/api/brain/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    prompt: "${promptInput}"
  })
});

const data = await response.json();
console.log(data.text);`;

  const pythonSnippet = selectedEndpoint === 'openai'
    ? `from openai import OpenAI

client = OpenAI(
    base_url="${origin}/api/v1",
    api_key="${apiKey}"
)

completion = client.chat.completions.create(
    model="chotu-ai-v2",
    messages=[{"role": "user", "content": "${promptInput}"}]
)

print(completion.choices[0].message.content)`
    : `import requests

url = "${origin}/api/brain/generate"
payload = {"prompt": "${promptInput}"}

res = requests.post(url, json=payload)
data = res.json()
print("Chotu Response:", data["text"])`;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-neutral-50 dark:bg-[#1a1a1a] text-neutral-900 dark:text-neutral-100 transition-colors">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-neutral-200 dark:border-neutral-800 pb-6 space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 text-xs font-semibold">
            <Terminal className="w-3.5 h-3.5" />
            Developer REST API & SDK
          </div>
          <h1 className="text-2xl font-bold tracking-tight">ChotuAI Custom REST API</h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-2xl leading-relaxed">
            Jaise aap OpenAI / ChatGPT se API leke apps banate hain, wese hi aap ChotuAI ke apne model ko kisi bhi Python app, React app, backend service ya cURL se query aur train kar sakte hain!
          </p>
        </div>

        {/* API Base URL & Key Info Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#222] space-y-2 shadow-xs">
            <div className="text-xs font-medium text-neutral-500 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-sky-500" />
              API Base URL
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 font-mono text-xs text-neutral-800 dark:text-neutral-200">
              <span className="truncate">{origin}</span>
              <button
                onClick={() => handleCopy(origin, 'base-url')}
                className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                aria-label="Copy API Base URL"
              >
                {copiedSnippet === 'base-url' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#222] space-y-2 shadow-xs">
            <div className="text-xs font-medium text-neutral-500 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-500" />
              Your API Token / Key
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 font-mono text-xs text-neutral-800 dark:text-neutral-200">
              <span className="truncate">{apiKey}</span>
              <button
                onClick={() => handleCopy(apiKey, 'api-key')}
                className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                aria-label="Copy API Token"
              >
                {copiedSnippet === 'api-key' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Live Interactive API Tester */}
        <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#222] shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4 text-emerald-500 fill-emerald-500" />
              <h2 className="font-semibold text-base">Live Interactive API Console</h2>
            </div>

            {/* Endpoint Selector */}
            <div className="flex bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl text-xs font-medium">
              <button
                onClick={() => setSelectedEndpoint('generate')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  selectedEndpoint === 'generate'
                    ? 'bg-white dark:bg-neutral-700 text-sky-600 dark:text-sky-400 shadow-xs'
                    : 'text-neutral-500'
                }`}
              >
                POST /api/brain/generate
              </button>
              <button
                onClick={() => setSelectedEndpoint('openai')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  selectedEndpoint === 'openai'
                    ? 'bg-white dark:bg-neutral-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-neutral-500'
                }`}
              >
                OpenAI /v1/chat/completions
              </button>
              <button
                onClick={() => setSelectedEndpoint('train')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  selectedEndpoint === 'train'
                    ? 'bg-white dark:bg-neutral-700 text-amber-600 dark:text-amber-400 shadow-xs'
                    : 'text-neutral-500'
                }`}
              >
                POST /api/brain/train
              </button>
            </div>
          </div>

          {/* Form Parameters */}
          {selectedEndpoint === 'train' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-neutral-500 mb-1 font-medium">Question / Prompt to Teach</label>
                <input
                  type="text"
                  value={trainPrompt}
                  onChange={e => setTrainPrompt(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-neutral-500 mb-1 font-medium">Desired Response</label>
                <input
                  type="text"
                  value={trainResponse}
                  onChange={e => setTrainResponse(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 focus:outline-hidden"
                />
              </div>
            </div>
          ) : (
            <div className="text-xs">
              <label className="block text-neutral-500 mb-1 font-medium">Prompt query</label>
              <input
                type="text"
                value={promptInput}
                onChange={e => setPromptInput(e.target.value)}
                placeholder="Enter prompt for model..."
                className="w-full p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 focus:outline-hidden font-mono"
              />
            </div>
          )}

          <button
            onClick={handleTestRequest}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>{isLoading ? 'Executing Request...' : 'Send Live HTTP Request'}</span>
          </button>

          {/* Response Inspector */}
          {responseJson && (
            <div className="space-y-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-700 dark:text-neutral-300">HTTP Response</span>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded font-mono text-[10px] ${
                    responseStatus === 200 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'
                  }`}>
                    {responseStatus} OK
                  </span>
                  {latencyMs !== null && (
                    <span className="text-[10px] font-mono text-neutral-400">
                      {latencyMs}ms
                    </span>
                  )}
                </div>
              </div>
              <pre className="p-3.5 rounded-xl bg-[#1e1e1e] text-emerald-400 font-mono text-xs overflow-x-auto max-h-64 leading-relaxed border border-neutral-800">
                <code>{responseJson}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Code Snippets (cURL, JS, Python) */}
        <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#222] shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-indigo-500" />
            <h2 className="font-semibold text-base">Client Integration Code Snippets</h2>
          </div>

          {/* cURL */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">cURL (Terminal)</span>
              <button
                onClick={() => handleCopy(curlSnippet, 'curl')}
                className="flex items-center gap-1 hover:text-neutral-900 dark:hover:text-white"
                aria-label="Copy cURL snippet"
              >
                {copiedSnippet === 'curl' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy</span>
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-[#1e1e1e] text-neutral-200 font-mono text-[11px] overflow-x-auto leading-relaxed border border-neutral-800">
              <code>{curlSnippet}</code>
            </pre>
          </div>

          {/* JavaScript */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">JavaScript (Fetch)</span>
              <button
                onClick={() => handleCopy(jsSnippet, 'js')}
                className="flex items-center gap-1 hover:text-neutral-900 dark:hover:text-white"
                aria-label="Copy JavaScript snippet"
              >
                {copiedSnippet === 'js' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy</span>
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-[#1e1e1e] text-neutral-200 font-mono text-[11px] overflow-x-auto leading-relaxed border border-neutral-800">
              <code>{jsSnippet}</code>
            </pre>
          </div>

          {/* Python */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">Python (Requests / OpenAI SDK)</span>
              <button
                onClick={() => handleCopy(pythonSnippet, 'python')}
                className="flex items-center gap-1 hover:text-neutral-900 dark:hover:text-white"
                aria-label="Copy Python snippet"
              >
                {copiedSnippet === 'python' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy</span>
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-[#1e1e1e] text-neutral-200 font-mono text-[11px] overflow-x-auto leading-relaxed border border-neutral-800">
              <code>{pythonSnippet}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
