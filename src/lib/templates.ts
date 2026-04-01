export interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  category: 'blog' | 'guide' | 'listicle' | 'business' | 'review' | 'comparison';
  structure: string[];
  promptTemplate: string;
  estimatedWords: number;
  icon: string;
}

export const CONTENT_TEMPLATES: ContentTemplate[] = [
  {
    id: 'ultimate-guide',
    name: 'Ultimate Guide',
    description: 'Comprehensive, in-depth guide covering all aspects of a topic',
    category: 'guide',
    estimatedWords: 3500,
    icon: '📚',
    structure: [
      'Introduction - Hook and overview',
      'Table of Contents',
      'Background/History',
      'Core Concepts (3-5 sections)',
      'Step-by-Step Process',
      'Advanced Tips',
      'Common Mistakes to Avoid',
      'Tools & Resources',
      'Case Studies/Examples',
      'FAQs',
      'Conclusion & Next Steps'
    ],
    promptTemplate: `Write an ultimate guide about {topic}. Include:
- Engaging introduction explaining why this matters
- Comprehensive coverage of all key aspects
- Step-by-step instructions
- Real-world examples
- Expert tips
- Common pitfalls to avoid
Target audience: {audience}
Tone: {tone}`
  },
  {
    id: 'how-to-tutorial',
    name: 'How-To Tutorial',
    description: 'Step-by-step instructions to accomplish a specific task',
    category: 'guide',
    estimatedWords: 1500,
    icon: '🎯',
    structure: [
      'Introduction - What you will achieve',
      'Prerequisites/Requirements',
      'Step 1 with detailed instructions',
      'Step 2 with detailed instructions',
      'Step 3 with detailed instructions',
      '(Additional steps as needed)',
      'Troubleshooting common issues',
      'Conclusion & next steps'
    ],
    promptTemplate: `Write a how-to tutorial on {topic}. Make it:
- Clear and actionable
- Easy to follow step-by-step
- Include screenshots/visuals references
- Address common problems
Target skill level: {skillLevel}
Tone: {tone}`
  },
  {
    id: 'listicle',
    name: 'Numbered Listicle',
    description: 'Engaging numbered list format (e.g., "10 Ways to...")',
    category: 'listicle',
    estimatedWords: 2000,
    icon: '📝',
    structure: [
      'Catchy introduction',
      'Item #1 with explanation',
      'Item #2 with explanation',
      'Item #3 with explanation',
      '(Continue pattern)',
      'Summary of key takeaways',
      'Call-to-action'
    ],
    promptTemplate: `Write a listicle: "{listNumber} {topic}". For each item:
- Clear heading
- 2-3 paragraphs explanation
- Real example or data point
- Actionable takeaway
Tone: {tone}
Make it engaging and skimmable.`
  },
  {
    id: 'case-study',
    name: 'Case Study',
    description: 'Real-world example showing results and lessons learned',
    category: 'business',
    estimatedWords: 2500,
    icon: '📊',
    structure: [
      'Executive Summary',
      'Background/Context',
      'The Challenge',
      'The Solution/Approach',
      'Implementation Process',
      'Results & Metrics',
      'Key Lessons Learned',
      'Conclusion & Recommendations'
    ],
    promptTemplate: `Write a case study about {topic}:
- Real or hypothetical scenario
- Clear problem statement
- Solution with implementation details
- Quantifiable results
- Lessons learned
Include metrics and data points.
Tone: {tone}`
  },
  {
    id: 'product-review',
    name: 'Product/Tool Review',
    description: 'Comprehensive review of a product, tool, or service',
    category: 'review',
    estimatedWords: 1800,
    icon: '⭐',
    structure: [
      'Introduction - What is it?',
      'Key Features Overview',
      'Pros (detailed)',
      'Cons (detailed)',
      'Pricing & Plans',
      'Best Use Cases',
      'Alternatives to Consider',
      'Final Verdict & Rating',
      'Who should buy this?'
    ],
    promptTemplate: `Write a review of {productName}:
- Balanced and honest assessment
- Specific features and capabilities
- Real-world testing insights
- Comparison with alternatives
- Clear recommendation
Tone: {tone}
Target audience: {audience}`
  },
  {
    id: 'comparison',
    name: 'Comparison Post',
    description: 'Side-by-side comparison of options (e.g., "X vs Y")',
    category: 'comparison',
    estimatedWords: 2200,
    icon: '⚖️',
    structure: [
      'Introduction - What is being compared',
      'Quick Comparison Table',
      'Option A - Overview',
      'Option A - Pros & Cons',
      'Option B - Overview',
      'Option B - Pros & Cons',
      'Head-to-Head Feature Comparison',
      'Pricing Comparison',
      'Which to Choose? Recommendations',
      'Conclusion'
    ],
    promptTemplate: `Write a comparison: "{option1} vs {option2}":
- Fair and objective analysis
- Side-by-side feature comparison
- Use cases for each option
- Clear recommendation based on needs
Include comparison table.
Tone: {tone}`
  },
  {
    id: 'beginner-guide',
    name: 'Beginner\'s Guide',
    description: 'Friendly introduction for newcomers to a topic',
    category: 'guide',
    estimatedWords: 2000,
    icon: '🌱',
    structure: [
      'Introduction - Why learn this?',
      'Key Terms & Definitions',
      'Fundamental Concepts',
      'Getting Started - First Steps',
      'Common Beginner Mistakes',
      'Practice Exercises/Examples',
      'Resources for Learning More',
      'Next Steps'
    ],
    promptTemplate: `Write a beginner-friendly guide to {topic}:
- Assume no prior knowledge
- Define all technical terms
- Use simple analogies
- Include practical examples
- Encouraging tone
Target audience: Complete beginners
Tone: {tone}`
  },
  {
    id: 'problem-solution',
    name: 'Problem-Solution Post',
    description: 'Address a specific problem and present solutions',
    category: 'blog',
    estimatedWords: 1600,
    icon: '💡',
    structure: [
      'Introduction - State the problem',
      'Why this problem matters',
      'Common causes/factors',
      'Solution #1 (detailed)',
      'Solution #2 (detailed)',
      'Solution #3 (detailed)',
      'Which solution is best for you?',
      'Implementation tips',
      'Conclusion'
    ],
    promptTemplate: `Write about solving {problem}:
- Empathize with the problem
- Multiple solution approaches
- Pros/cons of each
- Actionable implementation steps
Make it practical and helpful.
Tone: {tone}`
  },
  {
    id: 'expert-roundup',
    name: 'Expert Roundup',
    description: 'Compilation of insights from multiple experts',
    category: 'blog',
    estimatedWords: 2800,
    icon: '👥',
    structure: [
      'Introduction - The question',
      'Expert #1 - Bio & Response',
      'Expert #2 - Bio & Response',
      'Expert #3 - Bio & Response',
      '(Additional experts)',
      'Common themes & insights',
      'Key takeaways',
      'Conclusion'
    ],
    promptTemplate: `Create an expert roundup on "{topic}":
- Question: {question}
- 5-8 hypothetical expert responses
- Vary perspectives and approaches
- Synthesize key insights
Include expert bios.
Tone: {tone}`
  },
  {
    id: 'trend-analysis',
    name: 'Trend Analysis',
    description: 'Analysis of current and emerging trends in an industry',
    category: 'business',
    estimatedWords: 2300,
    icon: '📈',
    structure: [
      'Introduction - Current landscape',
      'Key Statistics & Data',
      'Trend #1 - Analysis & Impact',
      'Trend #2 - Analysis & Impact',
      'Trend #3 - Analysis & Impact',
      'What is driving these trends?',
      'Future predictions',
      'How to adapt/capitalize',
      'Conclusion'
    ],
    promptTemplate: `Analyze trends in {industry}:
- Data-driven insights
- Specific trend examples
- Business implications
- Actionable recommendations
- Forward-looking perspective
Tone: {tone}
Include statistics and projections.`
  },
  {
    id: 'checklist',
    name: 'Checklist/Framework',
    description: 'Actionable checklist or framework to follow',
    category: 'guide',
    estimatedWords: 1400,
    icon: '✅',
    structure: [
      'Introduction - Purpose of checklist',
      'How to use this checklist',
      'Phase 1: Preparation (items)',
      'Phase 2: Execution (items)',
      'Phase 3: Review (items)',
      'Tips for best results',
      'Downloadable version/summary'
    ],
    promptTemplate: `Create a checklist for {topic}:
- Comprehensive but concise
- Logical order/grouping
- Actionable items
- Brief explanations for each
Make it printable and practical.
Tone: {tone}`
  },
  {
    id: 'myth-busting',
    name: 'Myth-Busting Post',
    description: 'Debunk common myths and misconceptions',
    category: 'blog',
    estimatedWords: 1900,
    icon: '🔍',
    structure: [
      'Introduction - Why myths persist',
      'Myth #1 - The Truth',
      'Myth #2 - The Truth',
      'Myth #3 - The Truth',
      '(Additional myths)',
      'Why these myths are harmful',
      'The real facts',
      'Conclusion - Moving forward'
    ],
    promptTemplate: `Write a myth-busting post about {topic}:
- Common misconceptions
- Evidence-based corrections
- Cite credible sources
- Explain why myths exist
Make it informative and respectful.
Tone: {tone}`
  },
  {
    id: 'interview',
    name: 'Interview-Style Q&A',
    description: 'Question and answer format with an expert',
    category: 'blog',
    estimatedWords: 2100,
    icon: '🎤',
    structure: [
      'Introduction - Who & Why',
      'Background of interviewee',
      'Q1: [Opening question]',
      'Q2: [Core topic question]',
      'Q3: [Deep dive question]',
      '(Additional Q&As)',
      'Quick Fire Round',
      'Key Takeaways',
      'Where to follow them'
    ],
    promptTemplate: `Create an interview-style post about {topic}:
- Thoughtful questions
- In-depth answers
- Personal anecdotes
- Actionable advice
Format as Q&A dialogue.
Tone: {tone}`
  },
  {
    id: 'behind-the-scenes',
    name: 'Behind-the-Scenes',
    description: 'Inside look at a process, workflow, or system',
    category: 'blog',
    estimatedWords: 1700,
    icon: '🎬',
    structure: [
      'Introduction - What you will see',
      'The challenge/goal',
      'Our approach/method',
      'The actual process (detailed)',
      'Unexpected lessons',
      'Results & outcomes',
      'What we would do differently',
      'Conclusion & insights'
    ],
    promptTemplate: `Write a behind-the-scenes post about {topic}:
- Honest and transparent
- Specific details and examples
- Lessons learned
- Practical insights readers can use
Make it authentic and valuable.
Tone: {tone}`
  },
  {
    id: 'resource-list',
    name: 'Ultimate Resource List',
    description: 'Curated collection of tools, links, and resources',
    category: 'listicle',
    estimatedWords: 2400,
    icon: '🔗',
    structure: [
      'Introduction - Scope of list',
      'Category #1 - Resources',
      'Category #2 - Resources',
      'Category #3 - Resources',
      '(Additional categories)',
      'How to choose the right resource',
      'Bonus recommendations',
      'Conclusion - Getting started'
    ],
    promptTemplate: `Create a resource list for {topic}:
- Organized by category
- Brief description for each
- Why it's valuable
- Link/pricing info
- Personal recommendation
Make it comprehensive yet focused.
Tone: {tone}`
  }
];

export const getTemplatesByCategory = (category: string) => {
  return CONTENT_TEMPLATES.filter(t => t.category === category);
};

export const getTemplateById = (id: string) => {
  return CONTENT_TEMPLATES.find(t => t.id === id);
};

export const TEMPLATE_CATEGORIES = [
  { value: 'all', label: 'All Templates' },
  { value: 'blog', label: 'Blog Posts' },
  { value: 'guide', label: 'Guides & Tutorials' },
  { value: 'listicle', label: 'Lists & Listicles' },
  { value: 'business', label: 'Business & Analysis' },
  { value: 'review', label: 'Reviews' },
  { value: 'comparison', label: 'Comparisons' }
];
