import {
  KnowledgeNode,
  GenerateOptions,
  GenerateResult,
  TrainInput,
  BrainStats,
  BrainExportData,
  AIPersonality
} from './types';
import {
  tokenize,
  generateNGrams,
  calculateTF,
  cosineSimilarity,
  detectIntent,
  normalizeText
} from './tokenizer';
import { INITIAL_KNOWLEDGE_NODES, DEFAULT_PERSONALITIES } from './seed-data';

export class BrainEngine {
  public name = 'ChotuBrain';
  public version = '2.4.0-autonomous';
  private nodes: Map<string, KnowledgeNode> = new Map();
  private vocabulary: Map<string, number> = new Map(); // word -> total document frequency
  private totalInteractions = 0;
  private learningLog: Array<{ timestamp: number; prompt: string; response: string; source: string }> = [];

  constructor(initialNodes?: KnowledgeNode[]) {
    this.init(initialNodes || INITIAL_KNOWLEDGE_NODES);
  }

  /**
   * Initialize or reset brain with knowledge nodes
   */
  public init(seedNodes: KnowledgeNode[]) {
    this.nodes.clear();
    this.vocabulary.clear();
    this.learningLog = [];

    for (const node of seedNodes) {
      this.nodes.set(node.id, { ...node });
      this.indexNode(node);
    }
  }

  /**
   * Index node tokens into vocabulary
   */
  private indexNode(node: KnowledgeNode) {
    const text = `${node.prompt} ${node.keywords.join(' ')}`;
    const tokens = generateNGrams(tokenize(text, true));

    const uniqueTokens = new Set(tokens);
    for (const token of uniqueTokens) {
      this.vocabulary.set(token, (this.vocabulary.get(token) || 0) + 1);
    }
  }

  /**
   * Train the brain like a child with a new concept or correction
   */
  public train(input: TrainInput): { node: KnowledgeNode; isNew: boolean } {
    const normalizedPrompt = normalizeText(input.prompt);
    const existingNode = this.findClosestNode(normalizedPrompt, 0.85);

    let targetNode: KnowledgeNode;
    let isNew = false;

    if (existingNode && existingNode.similarity >= 0.85) {
      // Reinforce and update existing node
      targetNode = existingNode.node;
      targetNode.response = input.response.trim();
      targetNode.weight = Math.min(10, targetNode.weight + 2);
      targetNode.confidence = Math.min(1.0, targetNode.confidence + 0.1);
      targetNode.source = 'feedback';
      targetNode.learnedAt = Date.now();
      if (input.category) targetNode.category = input.category;
    } else {
      // Create new knowledge node (child learns new fact!)
      isNew = true;
      const id = `learned-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const promptTokens = tokenize(input.prompt, true);

      targetNode = {
        id,
        prompt: input.prompt.trim(),
        response: input.response.trim(),
        category: input.category || 'learned',
        keywords: promptTokens.slice(0, 10),
        weight: input.priority === 'high' ? 9 : 7,
        confidence: 0.95,
        learnedAt: Date.now(),
        source: 'teacher',
        timesRecalled: 0
      };

      this.nodes.set(id, targetNode);
    }

    // Update vocabulary index
    this.indexNode(targetNode);

    // Record in learning log
    this.learningLog.unshift({
      timestamp: Date.now(),
      prompt: input.prompt,
      response: input.response,
      source: isNew ? 'teacher_new' : 'teacher_correction'
    });

    if (this.learningLog.length > 50) {
      this.learningLog.pop();
    }

    return { node: targetNode, isNew };
  }

  /**
   * Find closest matching knowledge node
   */
  private findClosestNode(
    query: string,
    threshold = 0.25
  ): { node: KnowledgeNode; similarity: number } | null {
    const queryTokens = generateNGrams(tokenize(query, true));
    if (queryTokens.length === 0) return null;

    const queryTF = calculateTF(queryTokens);
    let bestMatch: KnowledgeNode | null = null;
    let highestScore = -1;

    for (const node of this.nodes.values()) {
      // 1. Direct prompt or keyword match bonus
      const nodeText = `${node.prompt} ${node.keywords.join(' ')}`;
      const nodeTokens = generateNGrams(tokenize(nodeText, true));
      const nodeTF = calculateTF(nodeTokens);

      const cosine = cosineSimilarity(queryTF, nodeTF);

      // Keyword overlap bonus
      let keywordHits = 0;
      for (const kw of node.keywords) {
        if (query.toLowerCase().includes(kw.toLowerCase())) {
          keywordHits++;
        }
      }

      const keywordBonus = Math.min(0.35, keywordHits * 0.1);
      const totalScore = (cosine * 0.65) + keywordBonus + (node.weight * 0.02);

      if (totalScore > highestScore) {
        highestScore = totalScore;
        bestMatch = node;
      }
    }

    if (bestMatch && highestScore >= threshold) {
      return { node: bestMatch, similarity: Math.min(1.0, highestScore) };
    }

    return null;
  }

  /**
   * Evaluate simple arithmetic expressions safely
   */
  private trySolveMath(prompt: string): string | null {
    const clean = prompt.replace(/[^\d\+\-\*\/\(\)\.\s]/g, '').trim();
    if (!clean || !/[\+\-\*\/]/.test(clean)) return null;

    // Check if it's a valid simple math expression
    if (/^[\d\s\+\-\*\/\.\(\)]+$/.test(clean)) {
      try {
        // Safe evaluation for basic math tokens only
        const fn = new Function(`"use strict"; return (${clean});`);
        const result = fn();
        if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
          return `Hisab (Calculation):\n\`${clean} = ${result}\``;
        }
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Apply personality styling to the response
   */
  private applyPersonality(
    rawText: string,
    personality: AIPersonality,
    intent: string
  ): string {
    const tone = personality.tone || 'child';

    if (tone === 'child') {
      if (rawText.startsWith('Mujhe abhi yeh nahi pata')) {
        return rawText;
      }
      // Warm, enthusiastic child touch
      if (intent === 'greeting') {
        return `${rawText}\n\nMain aapki help karne ke liye ready hoon! Aap mujhe naya kya sikhayenge? 🌟`;
      }
      return rawText;
    }

    if (tone === 'scholar') {
      return `### Overview\n${rawText}\n\n*Note: Structured analysis processed by Autonomous Local Model.*`;
    }

    if (tone === 'dost') {
      return `Arre dost! 🙌 ${rawText}\n\nAur bata, koi aur doubt ho toh bina jhijhak bolna!`;
    }

    if (tone === 'coder') {
      if (!rawText.includes('```')) {
        return `${rawText}\n\n> Tip: Make sure your implementation handles edge cases and null checks properly.`;
      }
      return rawText;
    }

    return rawText;
  }

  /**
   * Primary inference generation method
   */
  public generate(options: GenerateOptions): GenerateResult {
    const startTime = Date.now();
    this.totalInteractions++;

    const rawPrompt = options.prompt || '';
    const personality = options.personality || DEFAULT_PERSONALITIES[0];
    const { intent } = detectIntent(rawPrompt);

    // 1. Check for basic math
    if (intent === 'math') {
      const mathResult = this.trySolveMath(rawPrompt);
      if (mathResult) {
        return {
          text: this.applyPersonality(mathResult, personality, intent),
          tokensUsed: tokenize(mathResult).length,
          confidence: 0.99,
          intent: 'math',
          matchedNodes: ['math-evaluator'],
          latencyMs: Date.now() - startTime,
          source: 'brain'
        };
      }
    }

    // 2. Search neural associative memory
    const match = this.findClosestNode(rawPrompt, 0.28);

    if (match) {
      match.node.timesRecalled++;
      const stylizedResponse = this.applyPersonality(match.node.response, personality, intent);

      return {
        text: stylizedResponse,
        tokensUsed: tokenize(stylizedResponse).length,
        confidence: Number(match.similarity.toFixed(2)),
        intent,
        matchedNodes: [match.node.id],
        latencyMs: Date.now() - startTime,
        source: 'brain',
        needsTeaching: match.similarity < 0.45
      };
    }

    // 3. Child Learning Mode: If not known, ask the user to teach it like a child
    const childFallbackText = 
      `Mujhe abhi iske baare mein nahi pata! 👶 Main abhi ek bacha hoon aur roz naye concepts sikh raha hoon.\n\n` +
      `Kya aap mujhe yeh sikha sakte hain? Upar ya is message ke niche **"Teach / Correct"** button dabayein aur iska sahi jawab enter karein. Ek baar sikhne ke baad main ise humesha yaad rakhunga! 💡`;

    return {
      text: childFallbackText,
      tokensUsed: tokenize(childFallbackText).length,
      confidence: 0.15,
      intent,
      matchedNodes: [],
      latencyMs: Date.now() - startTime,
      source: 'brain',
      needsTeaching: true
    };
  }

  /**
   * Get all knowledge nodes
   */
  public getAllNodes(): KnowledgeNode[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Delete a knowledge node
   */
  public deleteNode(id: string): boolean {
    return this.nodes.delete(id);
  }

  /**
   * Get recent learning log
   */
  public getLearningLog() {
    return [...this.learningLog];
  }

  /**
   * Get brain statistics
   */
  public getStats(): BrainStats {
    let teacherTrained = 0;
    let seedCount = 0;
    let totalConf = 0;

    for (const node of this.nodes.values()) {
      if (node.source === 'teacher' || node.source === 'feedback') {
        teacherTrained++;
      } else {
        seedCount++;
      }
      totalConf += node.confidence;
    }

    const nodeCount = this.nodes.size;
    const avgConfidence = nodeCount > 0 ? Number((totalConf / nodeCount).toFixed(2)) : 0;

    return {
      name: this.name,
      version: this.version,
      totalVocabulary: this.vocabulary.size,
      totalNodes: nodeCount,
      trainedByTeacher: teacherTrained,
      seedNodes: seedCount,
      avgConfidence,
      totalInteractions: this.totalInteractions
    };
  }

  /**
   * Export the entire model state and weights
   */
  public exportData(): BrainExportData {
    const vocabObj: Record<string, number> = {};
    for (const [k, v] of this.vocabulary.entries()) {
      vocabObj[k] = v;
    }

    return {
      version: this.version,
      name: this.name,
      exportedAt: Date.now(),
      vocabulary: vocabObj,
      nodes: Array.from(this.nodes.values()),
      totalInteractions: this.totalInteractions
    };
  }

  /**
   * Import model state and weights
   */
  public importData(data: BrainExportData): boolean {
    if (!data || !Array.isArray(data.nodes)) return false;

    this.init(data.nodes);
    this.totalInteractions = data.totalInteractions || 0;
    return true;
  }
}

// Global brain singleton instance
export const globalBrain = new BrainEngine();
