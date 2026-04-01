// Demo data for testing without backend
export const DEMO_SEO_ANALYSIS = {
  keywords: [
    {
      keyword: "content marketing strategy",
      searchIntent: "Informational",
      intentConfidence: 92,
      mentionCount: 847,
      difficulty: "medium" as const,
      difficultyScore: 65,
      serpFeatures: ["Featured Snippet", "People Also Ask", "Video Results"],
      contentBenchmark: {
        avgWordCount: 2850,
        avgH2Count: 8,
        avgImageCount: 5,
        avgReadingTime: 12,
        commonFormats: ["Guide", "Blog Post", "Case Study"],
        structuralPatterns: ["Introduction", "Strategy Steps", "Examples", "Conclusion"]
      },
      topCompetitors: [
        {
          rank: 1,
          title: "Complete Content Marketing Strategy Guide 2026",
          source: "HubSpot",
          url: "https://blog.hubspot.com/marketing/content-strategy",
          keywordDensity: "2.3%",
          contentType: "Comprehensive Guide",
          wordCount: 3200,
          contentScore: 95,
          strengths: ["Detailed examples", "Expert insights", "Actionable templates"],
          weaknesses: ["Heavy on HubSpot products", "Dense for beginners"]
        },
        {
          rank: 2,
          title: "How to Build a Winning Content Strategy",
          source: "Neil Patel",
          url: "https://neilpatel.com/blog/content-strategy/",
          keywordDensity: "1.8%",
          contentType: "How-to Guide",
          wordCount: 2650,
          contentScore: 88,
          strengths: ["Clear step-by-step process", "Video tutorials", "Free tools"],
          weaknesses: ["Lacks recent case studies", "Limited industry examples"]
        },
        {
          rank: 3,
          title: "Content Marketing Strategy: The Ultimate Playbook",
          source: "Backlinko",
          url: "https://backlinko.com/content-strategy",
          keywordDensity: "2.1%",
          contentType: "Ultimate Guide",
          wordCount: 4100,
          contentScore: 92,
          strengths: ["Data-driven insights", "Real examples", "SEO optimization"],
          weaknesses: ["Long read time", "Advanced for beginners"]
        }
      ],
      relatedKeywords: [
        "content marketing plan",
        "content strategy framework",
        "digital content strategy",
        "B2B content marketing"
      ],
      opportunity: "High potential to rank with comprehensive guide focusing on 2026 trends and AI-powered strategies",
      quickWins: [
        "Create FAQ section targeting PAA boxes",
        "Add video content for video SERP feature",
        "Include downloadable templates"
      ],
      recommendedContentFormat: "Comprehensive guide (2500-3500 words) with templates and video walkthrough"
    },
    {
      keyword: "SEO best practices",
      searchIntent: "Informational",
      intentConfidence: 95,
      mentionCount: 1240,
      difficulty: "high" as const,
      difficultyScore: 78,
      serpFeatures: ["Featured Snippet", "People Also Ask", "Related Searches"],
      contentBenchmark: {
        avgWordCount: 3200,
        avgH2Count: 10,
        avgImageCount: 7,
        avgReadingTime: 15,
        commonFormats: ["Checklist", "Guide", "Best Practices List"],
        structuralPatterns: ["Overview", "Technical SEO", "On-Page", "Off-Page", "Checklist"]
      },
      topCompetitors: [
        {
          rank: 1,
          title: "SEO Best Practices 2026: Complete Checklist",
          source: "Moz",
          url: "https://moz.com/learn/seo/best-practices",
          keywordDensity: "2.5%",
          contentType: "Checklist Guide",
          wordCount: 3800,
          contentScore: 97,
          strengths: ["Authority domain", "Regular updates", "Technical depth"],
          weaknesses: ["Complex for beginners", "Overwhelming detail"]
        },
        {
          rank: 2,
          title: "Google SEO Best Practices Guide",
          source: "Google Search Central",
          url: "https://developers.google.com/search/docs",
          keywordDensity: "1.9%",
          contentType: "Official Documentation",
          wordCount: 2900,
          contentScore: 100,
          strengths: ["Official source", "Authoritative", "Always current"],
          weaknesses: ["Technical language", "Lacks examples"]
        }
      ],
      relatedKeywords: [
        "on-page SEO",
        "technical SEO checklist",
        "SEO optimization tips",
        "Google ranking factors"
      ],
      opportunity: "Moderate potential - focus on beginner-friendly approach with visual examples",
      quickWins: [
        "Create simplified beginner version",
        "Add visual infographics",
        "Include video tutorials"
      ],
      recommendedContentFormat: "Interactive checklist with step-by-step visual guide"
    },
    {
      keyword: "social media marketing",
      searchIntent: "Commercial",
      intentConfidence: 88,
      mentionCount: 956,
      difficulty: "medium" as const,
      difficultyScore: 58,
      serpFeatures: ["Local Pack", "People Also Ask", "Image Results"],
      contentBenchmark: {
        avgWordCount: 2400,
        avgH2Count: 7,
        avgImageCount: 8,
        avgReadingTime: 10,
        commonFormats: ["Guide", "Strategy Post", "Platform Comparison"],
        structuralPatterns: ["Platform Overview", "Strategy Tips", "Tools", "Metrics"]
      },
      topCompetitors: [
        {
          rank: 1,
          title: "Social Media Marketing Strategy for 2026",
          source: "Sprout Social",
          url: "https://sproutsocial.com/insights/social-media-marketing-strategy/",
          keywordDensity: "2.2%",
          contentType: "Strategy Guide",
          wordCount: 2800,
          contentScore: 90,
          strengths: ["Platform-specific tips", "Data insights", "Tool recommendations"],
          weaknesses: ["Product-focused", "Limited creative examples"]
        }
      ],
      relatedKeywords: [
        "social media strategy",
        "social media platforms",
        "content calendar template",
        "social media ROI"
      ],
      opportunity: "Good opportunity with platform-specific strategies and emerging platforms",
      quickWins: [
        "Focus on new platforms (Threads, etc.)",
        "Add content calendar templates",
        "Include engagement metrics guide"
      ],
      recommendedContentFormat: "Platform comparison guide with downloadable templates"
    }
  ],
  summary: {
    topKeyword: "content marketing strategy",
    avgDifficulty: 67,
    totalCompetitors: 8,
    estimatedTraffic: "5,200 monthly visits potential",
    topOpportunities: [
      "Featured snippets for FAQ content",
      "Video content for YouTube rankings",
      "Template downloads for link building"
    ]
  }
};

export const DEMO_CONTENT_PLAN = [
  {
    day: 1,
    title: "The Ultimate Guide to Content Marketing Strategy in 2026",
    type: "blog",
    keyword: "content marketing strategy",
    description: "Comprehensive guide covering the complete content marketing strategy framework, from planning to execution. Includes practical templates, case studies, and expert insights.",
    long_tail_keyword: "how to create a content marketing strategy"
  },
  {
    day: 3,
    title: "10 Proven SEO Techniques to Boost Your Rankings",
    type: "listicle",
    keyword: "SEO best practices",
    description: "Actionable list of proven SEO techniques with step-by-step implementation guides. Covers technical SEO, on-page optimization, and link building strategies.",
    long_tail_keyword: "best SEO practices for beginners"
  },
  {
    day: 5,
    title: "How to Build an Email Marketing Campaign That Converts",
    type: "how-to",
    keyword: "email marketing",
    description: "Step-by-step tutorial on creating high-converting email campaigns. Includes templates, automation workflows, and A/B testing strategies.",
    long_tail_keyword: "email marketing campaign tutorial"
  },
  {
    day: 7,
    title: "Case Study: How We Grew Organic Traffic by 300% in 6 Months",
    type: "case-study",
    keyword: "increase organic traffic",
    description: "Detailed case study showcasing the exact strategies used to triple organic traffic. Includes metrics, challenges, and lessons learned.",
    long_tail_keyword: "how to increase website traffic organically"
  },
  {
    day: 10,
    title: "Social Media Marketing in 2026: Trends and Predictions",
    type: "blog",
    keyword: "social media marketing",
    description: "Analysis of current social media trends and future predictions. Covers platform-specific strategies, content formats, and algorithm changes.",
    long_tail_keyword: "social media marketing trends 2026"
  },
  {
    day: 12,
    title: "15 Content Marketing Tools Every Marketer Should Use",
    type: "listicle",
    keyword: "content marketing tools",
    description: "Curated list of essential tools for content creation, distribution, and analytics. Includes pricing, features, and use cases.",
    long_tail_keyword: "best content marketing software"
  },
  {
    day: 14,
    title: "How to Conduct Effective Keyword Research for SEO",
    type: "how-to",
    keyword: "keyword research",
    description: "Complete guide to keyword research methodology, tools, and analysis. Includes competitor analysis and content gap identification.",
    long_tail_keyword: "keyword research for beginners"
  },
  {
    day: 17,
    title: "Why AI is Transforming Content Creation (And What It Means for You)",
    type: "opinion",
    keyword: "AI content creation",
    description: "Thought leadership piece on AI's impact on content marketing. Discusses opportunities, challenges, and ethical considerations.",
    long_tail_keyword: "future of AI in content marketing"
  },
  {
    day: 19,
    title: "The Complete Guide to Content Distribution Strategies",
    type: "blog",
    keyword: "content distribution",
    description: "Comprehensive guide to distributing content across multiple channels. Covers owned, earned, and paid distribution tactics.",
    long_tail_keyword: "content distribution strategy template"
  },
  {
    day: 21,
    title: "12 Common Content Marketing Mistakes and How to Avoid Them",
    type: "listicle",
    keyword: "content marketing mistakes",
    description: "List of frequent pitfalls in content marketing with practical solutions. Based on real-world examples and data.",
    long_tail_keyword: "content marketing errors to avoid"
  },
  {
    day: 24,
    title: "How to Create a Content Calendar That Actually Works",
    type: "how-to",
    keyword: "content calendar",
    description: "Practical tutorial on building and maintaining an effective content calendar. Includes templates and scheduling best practices.",
    long_tail_keyword: "content planning calendar template"
  },
  {
    day: 26,
    title: "Case Study: Turning Blog Content into Multiple Revenue Streams",
    type: "case-study",
    keyword: "monetize blog content",
    description: "Real-world case study on content monetization strategies. Shows how to repurpose content across different platforms and revenue models.",
    long_tail_keyword: "how to make money from blog posts"
  },
  {
    day: 28,
    title: "The Future of Voice Search and Its Impact on Content Strategy",
    type: "blog",
    keyword: "voice search optimization",
    description: "Analysis of voice search trends and optimization strategies. Includes technical implementation and content formatting tips.",
    long_tail_keyword: "optimize content for voice search"
  },
  {
    day: 30,
    title: "Content Marketing ROI: How to Measure What Matters",
    type: "blog",
    keyword: "content marketing ROI",
    description: "Guide to measuring content marketing effectiveness with actionable metrics. Includes attribution models and reporting frameworks.",
    long_tail_keyword: "how to calculate content marketing ROI"
  }
];
