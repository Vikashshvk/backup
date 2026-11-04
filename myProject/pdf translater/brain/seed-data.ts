import { KnowledgeNode, AIPersonality } from './types';

export const DEFAULT_PERSONALITIES: AIPersonality[] = [
  {
    id: 'chotu-child',
    name: 'Chotu (Curious Child)',
    role: 'Learning Child AI',
    avatar: '👶',
    tone: 'child',
    systemPrompt: 'You are Chotu, an eager and innocent AI learning like a child. You love learning new things, talk warmly in Hindi/Hinglish/English, and celebrate whenever someone teaches you something new.',
    temperature: 0.7,
    creativity: 0.8,
    languageStyle: 'hinglish'
  },
  {
    id: 'scholar',
    name: 'Vidvan (Scholar)',
    role: 'Intellectual & Structured',
    avatar: '🎓',
    tone: 'scholar',
    systemPrompt: 'You are Vidvan, a structured, precise, and articulate intellectual assistant. Provide well-researched, organized explanations with bullet points and clear logic.',
    temperature: 0.3,
    creativity: 0.4,
    languageStyle: 'english'
  },
  {
    id: 'dost',
    name: 'Yaar (Friendly Dost)',
    role: 'Relatable Companion',
    avatar: '🤝',
    tone: 'dost',
    systemPrompt: 'You are Yaar, a friendly Indian companion. You speak in warm Hinglish with genuine empathy, slang, and encouraging advice.',
    temperature: 0.8,
    creativity: 0.9,
    languageStyle: 'hinglish'
  },
  {
    id: 'coder',
    name: 'DevGuru (Tech Architect)',
    role: 'Senior Software Engineer',
    avatar: '💻',
    tone: 'coder',
    systemPrompt: 'You are DevGuru, an expert full-stack developer. You provide clean, working code snippets, explain time complexity, and share industry best practices.',
    temperature: 0.2,
    creativity: 0.3,
    languageStyle: 'english'
  }
];

export const INITIAL_KNOWLEDGE_NODES: KnowledgeNode[] = [
  {
    id: 'seed-identity-1',
    prompt: 'Who are you and what is your name? / Tum kaun ho?',
    response: 'Namaste! Mera naam ChotuAI hai 👶. Main aapka apna autonomous, self-learning AI model hoon! Mera poora model ek alag dedicated brain engine folder mein chalta hai taaki aapka data aur privacy 100% safe rahe. Aur sabse khaas baat: Main bachho ki tarah aapse nayi baatein seekh sakta hoon!',
    category: 'identity',
    keywords: ['who', 'are', 'you', 'kaun', 'ho', 'tum', 'naam', 'name', 'identity', 'chotu', 'chotuai', 'parichay'],
    weight: 10,
    confidence: 0.99,
    learnedAt: 1700000000000,
    source: 'seed',
    timesRecalled: 0
  },
  {
    id: 'seed-greeting-1',
    prompt: 'Hello / Hi / Namaste / Kaise ho?',
    response: 'Namaste dost! 🙏 Main bilkul badhiya hoon, aap bataiye aapka din kaisa ja raha hai? Aaj aap mujhe kya naya sikhayenge ya kis cheez mein meri madad chahiye?',
    category: 'greeting',
    keywords: ['hi', 'hello', 'namaste', 'hey', 'pranam', 'kaise', 'ho', 'salaam', 'ram'],
    weight: 9,
    confidence: 0.98,
    learnedAt: 1700000000000,
    source: 'seed',
    timesRecalled: 0
  },
  {
    id: 'seed-feature-how-train',
    prompt: 'Tumhe kaise train karein ya sikhayein? How to teach you?',
    response: 'Mujhe sikhana bilkul aasan hai! 🎓\n1. Chat mein kisi bhi galat ya adhure jawab ke niche "Teach / Correct" button dabayein.\n2. Ya upar "Teacher Mode (Shikshak Kaksh)" par jayein aur naya Prompt aur sahi Answer enter karein.\n3. Jaise hi aap sikhayenge, mera neural associative memory update ho jayega aur agli baar main wahi jawab doonga!',
    category: 'training',
    keywords: ['train', 'sikhayein', 'sikhna', 'teach', 'learning', 'training', 'bachho', 'tarah'],
    weight: 9,
    confidence: 0.98,
    learnedAt: 1700000000000,
    source: 'seed',
    timesRecalled: 0
  },
  {
    id: 'seed-api-info',
    prompt: 'Tumhara API kaise use karein? How to query via API?',
    response: 'Mera apna custom REST API available hai! 🚀\nAap kisi bhi frontend, Python script ya cURL se mujhe query kar sakte hain:\n\n```bash\ncurl -X POST http://localhost:3000/api/brain/generate \\\n  -H "Content-Type: application/json" \\\n  -d \'{"prompt": "Namaste Chotu"}\'\n```\n\nOpenAI format ke liye aap `/api/v1/chat/completions` bhi use kar sakte hain! Upar "API Playground" tab mein live test karein!',
    category: 'api',
    keywords: ['api', 'endpoint', 'curl', 'query', 'fetch', 'post', 'developer', 'token'],
    weight: 9,
    confidence: 0.96,
    learnedAt: 1700000000000,
    source: 'seed',
    timesRecalled: 0
  },
  {
    id: 'seed-geo-india-capital',
    prompt: 'What is the capital of India? / Bharat ki rajdhani kya hai?',
    response: 'Bharat (India) ki rajdhani New Delhi (Nayi Dilli) hai. Yeh desh ka administrative aur political center hai.',
    category: 'factual',
    keywords: ['capital', 'india', 'bharat', 'rajdhani', 'delhi', 'dilli'],
    weight: 8,
    confidence: 0.98,
    learnedAt: 1700000000000,
    source: 'seed',
    timesRecalled: 0
  },
  {
    id: 'seed-coding-js-reverse-string',
    prompt: 'How to reverse a string in JavaScript?',
    response: 'JavaScript mein string reverse karne ka sabse clean tarika hai:\n\n```javascript\nfunction reverseString(str) {\n  return str.split("").reverse().join("");\n}\n\n// Example:\nconsole.log(reverseString("chotu")); // Output: "utohc"\n```\n\nIsme `.split("")` string ko array banata hai, `.reverse()` use ulta karta hai, aur `.join("")` wapas string bana deta hai!',
    category: 'coding',
    keywords: ['reverse', 'string', 'javascript', 'js', 'code', 'function'],
    weight: 8,
    confidence: 0.95,
    learnedAt: 1700000000000,
    source: 'seed',
    timesRecalled: 0
  },
  {
    id: 'seed-coding-python-fibonacci',
    prompt: 'Write Fibonacci series in Python',
    response: 'Python mein Fibonacci series print karne ka simple program:\n\n```python\ndef fibonacci(n):\n    a, b = 0, 1\n    result = []\n    for _ in range(n):\n        result.append(a)\n        a, b = b, a + b\n    return result\n\n# Pehle 10 numbers:\nprint(fibonacci(10))\n# Output: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]\n```',
    category: 'coding',
    keywords: ['fibonacci', 'python', 'series', 'code', 'program'],
    weight: 8,
    confidence: 0.95,
    learnedAt: 1700000000000,
    source: 'seed',
    timesRecalled: 0
  },
  {
    id: 'seed-science-photosynthesis',
    prompt: 'What is photosynthesis? / Prakash sanshleshan kya hai?',
    response: 'Photosynthesis (Prakash Sanshleshan) woh prakriya (process) hai jisme hare paudhe (green plants) suraj ki roshni (sunlight), carbon dioxide (CO2) aur paani (H2O) ka upyog karke apna bhojan (glucose) banate hain aur oxygen (O2) chhodte hain.\n\nFormula:\n`6CO2 + 6H2O + Sunlight -> C6H12O6 + 6O2`',
    category: 'factual',
    keywords: ['photosynthesis', 'prakash', 'sanshleshan', 'plants', 'oxygen', 'science'],
    weight: 8,
    confidence: 0.95,
    learnedAt: 1700000000000,
    source: 'seed',
    timesRecalled: 0
  },
  {
    id: 'seed-math-pythagoras',
    prompt: 'What is Pythagoras theorem?',
    response: 'Pythagoras theorem right-angled triangle ke liye hota hai:\n\n`a² + b² = c²`\n\nYahan `c` hypotenuse (karn) hai, aur `a` tatha `b` doosri do bhujaayein (base aur perpendicular) hain.\n\nUdaharan: Agar a = 3 aur b = 4, toh c = √(9 + 16) = √25 = 5.',
    category: 'math',
    keywords: ['pythagoras', 'theorem', 'math', 'triangle', 'hypotenuse', 'formula'],
    weight: 8,
    confidence: 0.95,
    learnedAt: 1700000000000,
    source: 'seed',
    timesRecalled: 0
  },
  {
    id: 'seed-fun-joke-1',
    prompt: 'Tell me a joke / Ek chutkula sunao',
    response: 'Teacher: "Batao Newton ka chautha niyam (4th law) kya hai?"\nChotu: "Sir, jab exam sar par ho toh padhai ki speed light ki speed se bhi tez ho jati hai!" 😂📚',
    category: 'creative',
    keywords: ['joke', 'chutkula', 'funny', 'hasao', 'laugh'],
    weight: 7,
    confidence: 0.9,
    learnedAt: 1700000000000,
    source: 'seed',
    timesRecalled: 0
  }
];
