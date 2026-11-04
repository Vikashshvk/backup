import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  Search,
  Cpu,
  Brain,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { KnowledgeNode, BrainStats, TrainInput } from '../types';

interface TeacherStudioProps {
  stats: BrainStats | null;
  onTrain: (input: TrainInput) => Promise<boolean>;
  onRefreshStats: () => void;
  onExportModel: () => void;
  onImportModel: (file: File) => Promise<boolean>;
  isOffline: boolean;
}

const PRESET_LESSONS = [
  {
    title: '🚀 Space & ISRO',
    prompt: 'Chandrayaan 3 ke baare mein batao',
    response: 'Chandrayaan-3 ISRO ka tisra lunar mission tha jise 14 July 2023 ko launch kiya gaya. 23 August 2023 ko isne Moon ke South Pole ke paas historic soft landing ki!',
    category: 'space'
  },
  {
    title: '🐍 Python List Comprehension',
    prompt: 'What is Python list comprehension?',
    response: 'Python mein List Comprehension ek concise tarika hai naye lists banane ka. Example:\n```python\nsquares = [x**2 for x in range(5)] # [0, 1, 4, 9, 16]\n```',
    category: 'coding'
  },
  {
    title: '🇮🇳 National Anthem of India',
    prompt: 'Who wrote the National Anthem of India? / Rashtragan kisne likha?',
    response: 'Bharat ka Rashtragan "Jana Gana Mana" Gurudev Rabindranath Tagore ji dwara likha gaya tha.',
    category: 'history'
  },
  {
    title: '💧 Water Chemical Formula',
    prompt: 'What is the chemical formula of water? / Paani ka formula?',
    response: 'Paani ka chemical formula H₂O hai. Isme do Hydrogen atoms aur ek Oxygen atom covalent bond se jude hote hain.',
    category: 'science'
  }
];

export const TeacherStudio: React.FC<TeacherStudioProps> = ({
  stats,
  onTrain,
  onRefreshStats,
  onExportModel,
  onImportModel,
  isOffline
}) => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [category, setCategory] = useState('general');
  const [priority, setPriority] = useState<'normal' | 'high'>('high');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Testing Sandbox state
  const [testQuery, setTestQuery] = useState('');
  const [testResult, setTestResult] = useState<any | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Knowledge Nodes List
  const [nodes, setNodes] = useState<KnowledgeNode[]>([]);
  const [nodeSearch, setNodeSearch] = useState('');
  const [loadingNodes, setLoadingNodes] = useState(false);

  // Fetch all nodes
  const fetchNodes = async () => {
    setLoadingNodes(true);
    try {
      const res = await fetch('/api/brain/nodes');
      if (res.ok) {
        const data = await res.json();
        setNodes(data.nodes || []);
      }
    } catch {
      // Offline fallback
    } finally {
      setLoadingNodes(false);
    }
  };

  useEffect(() => {
    fetchNodes();
  }, []);

  const handleTeachSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !response.trim()) return;

    setIsSubmitting(true);
    setSuccessMessage(null);

    const success = await onTrain({
      prompt: prompt.trim(),
      response: response.trim(),
      category: category.trim() || 'teacher',
      priority
    });

    if (success) {
      setSuccessMessage('Shabash! 🌟 Chotu ne yeh baat sikh li aur memory mein save kar li!');
      setPrompt('');
      setResponse('');
      fetchNodes();
      setTimeout(() => setSuccessMessage(null), 4000);
    }

    setIsSubmitting(false);
  };

  const handleApplyLesson = (lesson: typeof PRESET_LESSONS[0]) => {
    setPrompt(lesson.prompt);
    setResponse(lesson.response);
    setCategory(lesson.category);
  };

  const handleTestQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testQuery.trim()) return;

    setIsTesting(true);
    try {
      const res = await fetch('/api/brain/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: testQuery })
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({ text: 'Error querying local brain: ' + err.message });
    } finally {
      setIsTesting(false);
    }
  };

  const handleDeleteNode = async (id: string) => {
    if (!confirm('Are you sure you want to remove this memory node?')) return;
    try {
      await fetch(`/api/brain/nodes/${id}`, { method: 'DELETE' });
      fetchNodes();
      onRefreshStats();
    } catch (e) {
      console.warn('Failed to delete node:', e);
    }
  };

  const filteredNodes = nodes.filter(n =>
    n.prompt.toLowerCase().includes(nodeSearch.toLowerCase()) ||
    n.response.toLowerCase().includes(nodeSearch.toLowerCase()) ||
    n.category.toLowerCase().includes(nodeSearch.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-neutral-50 dark:bg-[#1a1a1a] text-neutral-900 dark:text-neutral-100 transition-colors">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <GraduationCap className="w-3.5 h-3.5" />
              Teacher Mode • Bachha Learning Studio
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Chotu ka Shikshak Kaksh</h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Yahan aap Chotu ko bilkul bachhe ki tarah nayi baatein, sawal-jawab, code aur rules sikha sakte hain.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefreshStats}
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Refresh Stats"
              aria-label="Refresh Stats"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>

            <button
              onClick={onExportModel}
              className="px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Download Model Weights as JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Model</span>
            </button>

            <label className="cursor-pointer px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs">
              <Upload className="w-3.5 h-3.5" />
              <span>Import Weights</span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) onImportModel(file);
                }}
              />
            </label>
          </div>
        </div>

        {/* Brain Stats Vitals Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#222] shadow-xs space-y-1">
            <div className="text-xs text-neutral-500 flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-emerald-500" />
              Total Knowledge Nodes
            </div>
            <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100">
              {stats?.totalNodes || nodes.length || 0}
            </div>
            <div className="text-[11px] text-neutral-400">
              {stats?.seedNodes || 10} seed + {stats?.trainedByTeacher || 0} taught
            </div>
          </div>

          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#222] shadow-xs space-y-1">
            <div className="text-xs text-neutral-500 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-sky-500" />
              Learned Vocabulary
            </div>
            <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100">
              {stats?.totalVocabulary || 120}
            </div>
            <div className="text-[11px] text-neutral-400">Words & N-grams indexed</div>
          </div>

          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#222] shadow-xs space-y-1">
            <div className="text-xs text-neutral-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Trained by You
            </div>
            <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100">
              {stats?.trainedByTeacher || 0}
            </div>
            <div className="text-[11px] text-neutral-400">Custom user lessons</div>
          </div>

          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#222] shadow-xs space-y-1">
            <div className="text-xs text-neutral-500 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-500" />
              Engine Autonomy
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              100%
            </div>
            <div className="text-[11px] text-neutral-400">Zero external cloud lock-in</div>
          </div>
        </div>

        {/* Section 1: Teach Chotu a New Concept Form */}
        <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#222] shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                🎓
              </div>
              <h2 className="font-semibold text-base">Teach Chotu a New Lesson (Sikhayein)</h2>
            </div>
            <span className="text-xs text-neutral-400">Step-by-step reinforcement</span>
          </div>

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleTeachSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Question or Prompt (User kya puchega?)
              </label>
              <input
                type="text"
                required
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="e.g., Bharat ka rashtriya phool kya hai? ya What is photosynthesis?"
                className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Desired Response (Chotu kya jawab dega?)
              </label>
              <textarea
                required
                rows={3}
                value={response}
                onChange={e => setResponse(e.target.value)}
                placeholder="e.g., Bharat ka rashtriya phool Kamal (Lotus) hai. Yeh pavitrata aur gyan ka prateek hai."
                className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-sans leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Category Tag
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="general">General Knowledge</option>
                  <option value="science">Science & Nature</option>
                  <option value="space">Space & ISRO</option>
                  <option value="coding">Coding & Software</option>
                  <option value="math">Mathematics</option>
                  <option value="history">History & Culture</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Memory Priority Weight
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPriority('high')}
                    className={`flex-1 py-2 text-xs font-medium rounded-xl border transition-colors ${
                      priority === 'high'
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-semibold'
                        : 'border-neutral-300 dark:border-neutral-700 text-neutral-500'
                    }`}
                  >
                    High (Strong Rule)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriority('normal')}
                    className={`flex-1 py-2 text-xs font-medium rounded-xl border transition-colors ${
                      priority === 'normal'
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-semibold'
                        : 'border-neutral-300 dark:border-neutral-700 text-neutral-500'
                    }`}
                  >
                    Normal Recall
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !prompt.trim() || !response.trim()}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50"
            >
              <GraduationCap className="w-4 h-4" />
              <span>{isSubmitting ? 'Teaching & Associating...' : 'Teach Chotu Now! 🎓'}</span>
            </button>
          </form>

          {/* Quick Curriculum presets */}
          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800">
            <div className="text-xs font-medium text-neutral-500 mb-2 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              Quick Lessons (Click to load template):
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_LESSONS.map((l, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleApplyLesson(l)}
                  className="text-left p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700/80 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs transition-colors flex items-center justify-between"
                >
                  <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate pr-2">
                    {l.title}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 2: Interactive Testing Sandbox */}
        <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#222] shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-sky-500" />
            <h2 className="font-semibold text-base">Interactive Knowledge Testing Sandbox</h2>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Aap Chotu ke jawab aur confidence level ko real-time test kar sakte hain.
          </p>

          <form onSubmit={handleTestQuery} className="flex gap-2">
            <input
              type="text"
              value={testQuery}
              onChange={e => setTestQuery(e.target.value)}
              placeholder="Test any question with Chotu (e.g. Bharat ki rajdhani?)..."
              className="flex-1 text-xs p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
            />
            <button
              type="submit"
              disabled={isTesting || !testQuery.trim()}
              className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-medium transition-colors disabled:opacity-50"
            >
              {isTesting ? 'Testing...' : 'Test Response'}
            </button>
          </form>

          {testResult && (
            <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-700 dark:text-neutral-300">Test Output</span>
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-sky-500/10 text-sky-600 dark:text-sky-400">
                    Intent: {testResult.intent || 'general'}
                  </span>
                  <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    Confidence: {Math.round((testResult.confidence || 0) * 100)}%
                  </span>
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap leading-relaxed font-sans">
                {testResult.text}
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Memory Inspector (All Knowledge Nodes) */}
        <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#222] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-500" />
              <h2 className="font-semibold text-base">Active Memory Graph ({nodes.length} Nodes)</h2>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Filter memories..."
                value={nodeSearch}
                onChange={e => setNodeSearch(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="divide-y divide-neutral-200 dark:divide-neutral-800 max-h-96 overflow-y-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30">
            {filteredNodes.length === 0 ? (
              <div className="p-6 text-center text-xs text-neutral-400">
                {loadingNodes ? 'Loading brain memory graph...' : 'No memory nodes matched.'}
              </div>
            ) : (
              filteredNodes.map(node => (
                <div key={node.id} className="p-3.5 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/50 transition-colors flex items-start justify-between gap-3">
                  <div className="space-y-1 text-xs flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {node.prompt}
                      </span>
                      <span className="px-1.5 py-0.2 rounded font-mono text-[10px] bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                        {node.category}
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        Weight: {node.weight}
                      </span>
                    </div>
                    <p className="text-neutral-600 dark:text-neutral-300 line-clamp-2 leading-relaxed">
                      {node.response}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteNode(node.id)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors shrink-0"
                    title="Delete Memory Node"
                    aria-label="Delete Memory Node"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
