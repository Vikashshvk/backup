import test from 'node:test';
import assert from 'node:assert/strict';
import { BrainEngine } from './engine';
import { tokenize, detectIntent, cosineSimilarity, calculateTF } from './tokenizer';

test('Tokenizer extracts words and removes basic stopwords', () => {
  const tokens = tokenize('Namaste Chotu! How is the weather today?', true);
  assert.ok(tokens.includes('namaste'));
  assert.ok(tokens.includes('chotu'));
  assert.ok(tokens.includes('weather'));
  assert.ok(tokens.includes('today'));
});

test('Intent detector recognizes greetings, math, identity and coding', () => {
  assert.equal(detectIntent('Hello Chotu').intent, 'greeting');
  assert.equal(detectIntent('Who are you?').intent, 'identity');
  assert.equal(detectIntent('Calculate 50 + 25').intent, 'math');
  assert.equal(detectIntent('Write a function in javascript').intent, 'coding');
});

test('Cosine similarity measures token vector closeness', () => {
  const vecA = calculateTF(['delhi', 'capital', 'india']);
  const vecB = calculateTF(['delhi', 'capital', 'india']);
  const vecC = calculateTF(['apple', 'banana', 'orange']);

  const simIdentical = cosineSimilarity(vecA, vecB);
  const simDifferent = cosineSimilarity(vecA, vecC);

  assert.ok(simIdentical > 0.95);
  assert.equal(simDifferent, 0);
});

test('BrainEngine recalls seed knowledge', () => {
  const brain = new BrainEngine();
  const res = brain.generate({ prompt: 'Bharat ki rajdhani kya hai?' });
  assert.ok(res.text.includes('New Delhi') || res.text.includes('Dilli'));
  assert.ok(res.confidence > 0.5);
});

test('BrainEngine solves math queries', () => {
  const brain = new BrainEngine();
  const res = brain.generate({ prompt: 'Calculate 15 * 6' });
  assert.ok(res.text.includes('90'));
  assert.equal(res.intent, 'math');
});

test('BrainEngine child-like training: teaches new concept and recalls it immediately', () => {
  const brain = new BrainEngine();

  // Initially it doesn't know about a hypothetical secret code
  const initialRes = brain.generate({ prompt: 'What is the secret mantra of Chandrayaan?' });
  assert.ok(initialRes.needsTeaching);

  // Teach it like a child
  const trainResult = brain.train({
    prompt: 'What is the secret mantra of Chandrayaan?',
    response: 'Vigyan, Vishwas aur Vijay (Science, Faith and Victory)!',
    category: 'space',
    priority: 'high'
  });

  assert.ok(trainResult.isNew);
  assert.equal(trainResult.node.category, 'space');

  // Query again: now it knows!
  const learnedRes = brain.generate({ prompt: 'What is the secret mantra of Chandrayaan?' });
  assert.ok(learnedRes.text.includes('Vigyan, Vishwas aur Vijay'));
  assert.ok(learnedRes.confidence >= 0.85);
  assert.equal(learnedRes.needsTeaching, false);
});

test('BrainEngine exports and imports weights/memory', () => {
  const brain1 = new BrainEngine();
  brain1.train({
    prompt: 'Who is the fastest runner?',
    response: 'Usain Bolt is the fastest runner!',
    category: 'sports'
  });

  const exportData = brain1.exportData();
  assert.ok(exportData.nodes.length > 0);

  const brain2 = new BrainEngine([]);
  assert.equal(brain2.getAllNodes().length, 0);

  const success = brain2.importData(exportData);
  assert.equal(success, true);
  assert.ok(brain2.getAllNodes().length > 0);

  const testQuery = brain2.generate({ prompt: 'Who is the fastest runner?' });
  assert.ok(testQuery.text.includes('Usain Bolt'));
});
