// RSS feeds and data sources for each competitor
export const competitorSources = {
  tulip: {
    rss: 'https://tulip.co/press/', // News page (no RSS detected)
    blog: 'https://tulip.co/blog/',
    news: 'https://tulip.co/press/',
    linkedin: 'https://www.linkedin.com/company/tulip-interfaces',
    youtube: 'https://www.youtube.com/@TulipInterfaces',
    monitoring: [
      'https://tulip.co/press/',
      'https://www.assemblymag.com/rss' // Manufacturing news RSS
    ]
  },
  'critical-manufacturing': {
    rss: 'https://www.criticalmanufacturing.com/blog/feed/',
    blog: 'https://www.criticalmanufacturing.com/blog/',
    news: 'https://www.criticalmanufacturing.com/all-news/',
    pressReleases: 'https://www.criticalmanufacturing.com/press-releases/',
    linkedin: 'https://www.linkedin.com/company/critical-manufacturing',
    monitoring: [
      'https://www.criticalmanufacturing.com/all-news/',
      'https://www.criticalmanufacturing.com/blog/feed/'
    ]
  },
  poka: {
    rss: 'https://www.poka.io/en/blog/rss.xml',
    blog: 'https://www.poka.io/en/blog',
    news: 'https://www.poka.io/en/blog',
    linkedin: 'https://www.linkedin.com/company/poka-inc',
    monitoring: [
      'https://www.poka.io/en/blog/rss.xml'
    ]
  },
  parsable: {
    rss: 'https://parsable.com/parsable-blog/feed/', // Likely pattern
    blog: 'https://parsable.com/parsable-blog/',
    news: 'https://parsable.com/in-the-news/',
    linkedin: 'https://www.linkedin.com/company/parsable',
    monitoring: [
      'https://parsable.com/in-the-news/',
      'https://parsable.com/parsable-blog/'
    ]
  },
  apprentice: {
    rss: 'https://www.apprentice.io/learn/blog/feed/', // Likely pattern
    blog: 'https://www.apprentice.io/learn/blog',
    news: 'https://apprentice.suite.accessnewswire.com/browse/pr',
    linkedin: 'https://www.linkedin.com/company/apprenticeio',
    monitoring: [
      'https://apprentice.suite.accessnewswire.com/browse/pr',
      'https://www.apprentice.io/learn/blog'
    ]
  },
  'siemens-xcelerator': {
    rss: 'https://press.siemens.com/global/en/rss-feed', // Siemens press RSS
    blog: 'https://www.siemens.com/en-us/company/digital-transformation/',
    news: 'https://press.siemens.com/global/en/',
    industrialAI: 'https://www.siemens.com/en-us/company/artificial-intelligence/industrial-ai/',
    linkedin: 'https://www.linkedin.com/company/siemens',
    monitoring: [
      'https://press.siemens.com/global/en/',
      'https://www.siemens.com/en-us/company/artificial-intelligence/industrial-ai/'
    ]
  }
};

// Search keywords for each competitor
export const competitorKeywords = {
  tulip: ['Tulip Interfaces', 'Tulip manufacturing', 'Tulip frontline operations', 'Tulip MES'],
  'critical-manufacturing': ['Critical Manufacturing', 'Critical MES', 'Critical Manufacturing MES'],
  poka: ['Poka', 'Poka connected worker', 'Poka IFS'],
  parsable: ['Parsable', 'Parsable connected worker', 'CAI Software Parsable'],
  apprentice: ['Apprentice.io', 'Apprentice manufacturing', 'Apprentice pharma'],
  'siemens-xcelerator': ['Siemens Xcelerator', 'Siemens MindSphere', 'Siemens Industrial Copilot', 'Siemens industrial AI']
};