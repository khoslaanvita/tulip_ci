import Parser from 'rss-parser';
import { appendToJSON, readJSON } from './storage';
import { analyzeSignalWithAI } from './ai-helpers';
import { v4 as uuidv4 } from 'uuid';

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Tulip-Competitive-Intelligence/1.0'
  }
});

// RSS feeds and news sources for each competitor
export const competitorFeeds = {
  tulip: [
    { 
      name: 'Tulip Press Releases',
      url: 'https://tulip.co/press/',
      type: 'html', // Scraping needed
      description: 'Official Tulip press releases and announcements'
    },
    {
      name: 'Tulip Blog',
      url: 'https://tulip.co/blog/',
      type: 'html',
      description: 'Product updates and thought leadership'
    },
    {
      name: 'Manufacturing News - Tulip',
      url: 'https://www.assemblymag.com/rss',
      type: 'rss',
      keywords: ['Tulip', 'Tulip Interfaces'],
      description: 'Industry news mentioning Tulip'
    }
  ],
  
  'critical-manufacturing': [
    {
      name: 'Critical Manufacturing Blog RSS',
      url: 'https://www.criticalmanufacturing.com/blog/feed/',
      type: 'rss',
      description: 'Official blog with product updates and insights'
    },
    {
      name: 'Critical Manufacturing News',
      url: 'https://www.criticalmanufacturing.com/all-news/',
      type: 'html',
      description: 'Company news and press releases'
    },
    {
      name: 'Critical Manufacturing Press Releases',
      url: 'https://www.criticalmanufacturing.com/press-releases/',
      type: 'html',
      description: 'Official press releases'
    }
  ],
  
  poka: [
    {
      name: 'Poka Blog RSS',
      url: 'https://www.poka.io/en/blog/rss.xml',
      type: 'rss',
      description: 'Official blog with product updates and customer stories'
    },
    {
      name: 'Poka News & Updates',
      url: 'https://www.poka.io/en/blog',
      type: 'html',
      description: 'Company news and announcements'
    },
    {
      name: 'IFS News (Poka Parent)',
      url: 'https://www.ifs.com/news/',
      type: 'html',
      keywords: ['Poka'],
      description: 'IFS news mentioning Poka'
    }
  ],
  
  parsable: [
    {
      name: 'Parsable Blog',
      url: 'https://parsable.com/parsable-blog/',
      type: 'html',
      description: 'Company blog and thought leadership'
    },
    {
      name: 'Parsable In The News',
      url: 'https://parsable.com/in-the-news/',
      type: 'html',
      description: 'Press coverage and media mentions'
    },
    {
      name: 'Food Industry Executive',
      url: 'https://www.foodindustryexecutive.com/rss',
      type: 'rss',
      keywords: ['Parsable', 'CAI Software'],
      description: 'Industry news (Parsable focus on food & beverage)'
    }
  ],
  
  apprentice: [
    {
      name: 'Apprentice.io Newsroom',
      url: 'https://www.apprentice.io/learn/newsroom',
      type: 'html',
      description: 'Company news and press releases'
    },
    {
      name: 'Apprentice.io Blog',
      url: 'https://www.apprentice.io/learn/blog',
      type: 'html',
      description: 'Product updates and industry insights'
    },
    {
      name: 'BioPharm International',
      url: 'https://www.biopharminternational.com/rss',
      type: 'rss',
      keywords: ['Apprentice', 'manufacturing execution'],
      description: 'Pharma industry news'
    }
  ],
  
  'siemens-xcelerator': [
    {
      name: 'Siemens Press RSS',
      url: 'https://press.siemens.com/global/en/rss-feed',
      type: 'rss',
      keywords: ['Xcelerator', 'MindSphere', 'Industrial AI', 'Copilot'],
      description: 'Official Siemens press releases'
    },
    {
      name: 'Siemens Industrial AI',
      url: 'https://www.siemens.com/en-us/company/artificial-intelligence/industrial-ai/',
      type: 'html',
      description: 'Industrial AI announcements'
    },
    {
      name: 'Siemens Digital Industries News',
      url: 'https://press.siemens.com/global/en/',
      type: 'html',
      keywords: ['manufacturing', 'Xcelerator'],
      description: 'Digital industries press releases'
    }
  ]
};

// Generic industry RSS feeds to monitor all competitors
export const industryFeeds = [
  {
    name: 'TechCrunch Manufacturing',
    url: 'https://techcrunch.com/tag/manufacturing/feed/',
    type: 'rss',
    description: 'Manufacturing tech news from TechCrunch'
  },
  {
    name: 'VentureBeat Manufacturing',
    url: 'https://venturebeat.com/category/manufacturing/feed/',
    type: 'rss',
    description: 'Manufacturing AI and tech news'
  },
  {
    name: 'Assembly Magazine',
    url: 'https://www.assemblymag.com/rss',
    type: 'rss',
    description: 'Assembly and manufacturing industry news'
  },
  {
    name: 'Manufacturing.net',
    url: 'https://www.manufacturing.net/rss',
    type: 'rss',
    description: 'General manufacturing news'
  }
];

/**
 * Fetch and parse RSS feed
 */
export async function fetchRSSFeed(feedUrl) {
  try {
    console.log(`📡 Fetching RSS feed: ${feedUrl}`);
    const feed = await parser.parseURL(feedUrl);
    
    return {
      success: true,
      title: feed.title,
      items: feed.items.map(item => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate || item.isoDate,
        content: item.content || item.contentSnippet || item.description || '',
        author: item.creator || item.author || feed.title
      }))
    };
  } catch (error) {
    console.error(`❌ Error fetching RSS feed ${feedUrl}:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Check if content mentions competitor keywords
 */
function matchesKeywords(text, keywords) {
  if (!keywords || keywords.length === 0) return true;
  
  const lowerText = text.toLowerCase();
  return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
}

/**
 * Process RSS feed for a competitor and create signals
 */
export async function processCompetitorFeed(competitorId, feed) {
  const competitors = readJSON('competitors.json');
  const competitor = competitors.find(c => c.id === competitorId);
  
  if (!competitor) {
    console.log(`⚠️  Competitor ${competitorId} not found`);
    return { processed: 0, created: 0 };
  }
  
  const existingSignals = readJSON('signals.json');
  const existingUrls = new Set(existingSignals.map(s => s.sourceUrl));
  
  let processed = 0;
  let created = 0;
  
  if (feed.type === 'rss') {
    const result = await fetchRSSFeed(feed.url);
    
    if (!result.success) {
      console.log(`⚠️  Failed to fetch ${feed.name}`);
      return { processed, created, error: result.error };
    }
    
    for (const item of result.items.slice(0, 10)) { // Process only latest 10
      processed++;
      
      // Skip if we already have this URL
      if (existingUrls.has(item.link)) {
        continue;
      }
      
      // Check if content matches keywords (if specified)
      const fullText = `${item.title} ${item.content}`;
      if (!matchesKeywords(fullText, feed.keywords)) {
        continue;
      }
      
      // Check if article is recent (within last 90 days)
      const articleDate = new Date(item.pubDate);
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      
      if (articleDate < ninetyDaysAgo) {
        continue;
      }
      
      try {
        // Analyze with AI
        const competitorContext = `Name: ${competitor.name}\nCategory: ${competitor.category}\nPositioning: ${competitor.positioning}`;
        const analysis = await analyzeSignalWithAI(fullText, competitorContext);
        
        // Create signal
        const signal = {
          id: `sig-${uuidv4().slice(0, 8)}`,
          competitorId,
          competitorName: competitor.name,
          title: analysis.title || item.title,
          signalType: analysis.signalType,
          source: feed.name,
          sourceUrl: item.link,
          sourceConfidence: 'high',
          verifiedDate: item.pubDate,
          summary: analysis.summary,
          whyItMatters: analysis.whyItMatters,
          recommendedAction: analysis.recommendedAction,
          severity: analysis.severity,
          severityScore: analysis.severity === 'high' ? 10 : analysis.severity === 'medium' ? 5 : 2,
          severityReason: `Auto-detected from ${feed.name}`,
          recommendedOwner: analysis.recommendedOwner,
          timestamp: item.pubDate || new Date().toISOString(),
          discoveredDate: new Date().toISOString(),
          processed: true,
          dataQuality: 'high',
          ratingCriteria: {
            baseScore: analysis.severity === 'high' ? 10 : analysis.severity === 'medium' ? 5 : 2,
            typeWeight: getTypeWeight(analysis.signalType),
            recencyBonus: 2,
            totalImpact: (analysis.severity === 'high' ? 10 : analysis.severity === 'medium' ? 5 : 2) * getTypeWeight(analysis.signalType) + 2
          }
        };
        
        appendToJSON('signals.json', signal);
        created++;
        console.log(`✅ Created signal: ${signal.title}`);
        
      } catch (error) {
        console.error(`❌ Error analyzing article:`, error.message);
      }
    }
  }
  
  return { processed, created, feedName: feed.name };
}

/**
 * Get type weight for signal scoring
 */
function getTypeWeight(signalType) {
  const weights = {
    AI: 1.8,
    product: 1.5,
    fundraising: 1.4,
    pricing: 1.3,
    partnership: 1.3,
    customer: 1.3,
    hiring: 1.2,
    analyst: 1.2,
    gtm: 1.1,
    other: 1.0
  };
  return weights[signalType] || 1.0;
}

/**
 * Run RSS monitoring for all competitors
 */
export async function runRSSMonitoring() {
  console.log('🔄 Starting RSS monitoring for all competitors...');
  
  const results = [];
  
  for (const [competitorId, feeds] of Object.entries(competitorFeeds)) {
    console.log(`\n📰 Processing feeds for ${competitorId}...`);
    
    for (const feed of feeds) {
      if (feed.type === 'rss') {
        const result = await processCompetitorFeed(competitorId, feed);
        results.push({
          competitorId,
          ...result
        });
        
        // Small delay between feeds to be polite
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  
  // Also check industry feeds
  console.log('\n📰 Processing industry feeds...');
  for (const feed of industryFeeds) {
    const result = await fetchRSSFeed(feed.url);
    if (result.success) {
      console.log(`✅ ${feed.name}: ${result.items.length} articles`);
    }
  }
  
  const totalCreated = results.reduce((sum, r) => sum + r.created, 0);
  const totalProcessed = results.reduce((sum, r) => sum + r.processed, 0);
  
  console.log(`\n✅ RSS monitoring complete:`);
  console.log(`   Processed: ${totalProcessed} articles`);
  console.log(`   Created: ${totalCreated} new signals`);
  
  return {
    success: true,
    totalProcessed,
    totalCreated,
    results
  };
}