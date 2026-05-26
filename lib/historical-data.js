// Historical tracking data with sources
export const historicalData = {
  tulip: {
    timeline: [
      { date: '2021-Q2', employees: 250, funding: 32.5, revenue: null, source: 'Series C announcement' },
      { date: '2023-Q1', employees: 310, funding: 152.5, revenue: 35, source: 'BuiltIn Boston profile' },
      { date: '2024-Q4', employees: 340, funding: 152.5, revenue: 45, source: 'GetLatka estimate' },
      { date: '2026-Q1', employees: 340, funding: 272.5, revenue: 50, valuation: 1300, source: 'Series D press release' }
    ],
    acquisitions: [
      { date: '2025-11', company: 'Akooda', amount: 'Undisclosed', focus: 'AI-driven operations intelligence', source: 'https://tulip.co/press/tulip-acquires-ai-company-akooda/' }
    ],
    keyMilestones: [
      { date: '2026-01', event: 'Achieved unicorn status ($1.3B valuation)', source: 'https://tulip.co/press/tulip-secures-120m-series-d/' },
      { date: '2026-01', event: 'Raised $120M Series D led by Mitsubishi Electric', source: 'https://tulip.co/press/tulip-secures-120m-series-d/' },
      { date: '2025-11', event: 'Acquired Akooda for AI capabilities', source: 'https://tulip.co/press/tulip-acquires-ai-company-akooda/' },
      { date: '2025-06', event: 'Launched AI Composer and Tulip AI Agents', source: 'https://tulip.co/blog/' },
      { date: '2025-03', event: 'Partnership with Sartorius for biopharma', source: 'https://tulip.co/press/' }
    ]
  },
  'critical-manufacturing': {
    timeline: [
      { date: '2023-Q1', employees: 450, revenue: 40, source: 'Company estimates' },
      { date: '2024-Q4', employees: 467, revenue: 43.9, source: 'GetLatka/ZoomInfo' },
      { date: '2025-Q2', employees: 541, revenue: 54.9, source: 'ZoomInfo estimate' }
    ],
    keyMilestones: [
      { date: '2025-06', event: 'MES available on AWS for cloud deployment', source: 'https://www.criticalmanufacturing.com/press-releases/' },
      { date: '2025-06', event: 'Hosted MES & Industry 4.0 Summit', source: 'https://www.criticalmanufacturing.com/press-releases/' },
      { date: '2025-03', event: 'Exhibited at Hannover Messe 2025', source: 'https://www.criticalmanufacturing.com/press-releases/' }
    ]
  },
  poka: {
    timeline: [
      { date: '2021-Q3', employees: 54, funding: 20, revenue: null, source: 'Crunchbase' },
      { date: '2022-Q2', employees: 61, funding: 45, revenue: null, source: 'Series B announcement' },
      { date: '2023-Q2', employees: 140, funding: 45, revenue: 15, source: 'IFS acquisition' },
      { date: '2025-Q1', employees: 169, funding: 45, revenue: 18.6, source: 'GetLatka' }
    ],
    acquisitions: [
      { date: '2023-06', company: 'Acquired by IFS', amount: 'Undisclosed', source: 'https://www.agcpartners.com/transactions/poka-enters-into-an-agreement-to-be-acquired-by-ifs-backed-by-eqt-hg-and-ta-associates' }
    ],
    keyMilestones: [
      { date: '2025-01', event: 'Launched AI Toolkit for Connected Worker Platform', source: 'https://www.automation.com/article/poka-ai-toolkit-manufacturing-workflows' },
      { date: '2025-03', event: 'Published Poka Automate content', source: 'https://www.poka.io/en/blog/' },
      { date: '2023-06', event: 'Acquired by IFS', source: 'https://www.agcpartners.com/transactions/' }
    ]
  },
  parsable: {
    timeline: [
      { date: '2020-Q4', employees: 120, funding: 133, revenue: null, source: 'Series D announcement' },
      { date: '2024-Q3', employees: 150, funding: 133, revenue: 18.9, source: 'Growjo estimate' },
      { date: '2024-Q4', employees: 150, funding: 133, revenue: 30, source: 'Post-acquisition' }
    ],
    acquisitions: [
      { date: '2024-09', company: 'Acquired by CAI Software', amount: 'Undisclosed', source: 'https://parsable.com/news/' }
    ],
    keyMilestones: [
      { date: '2024-09', event: 'Acquired by CAI Software', source: 'https://parsable.com/news/' },
      { date: '2024-06', event: 'Launched AI-Powered Analytics', source: 'https://parsable.com/' },
      { date: '2024-03', event: 'Received Frost & Sullivan Award', source: 'https://parsable.com/' }
    ]
  },
  apprentice: {
    timeline: [
      { date: '2023-Q1', employees: 200, funding: 142, revenue: 35.7, source: 'GetLatka' },
      { date: '2023-Q2', employees: 220, funding: 207, revenue: 35.7, source: 'Series funding' },
      { date: '2024-Q4', employees: 250, funding: 207, revenue: 55.2, source: 'GetLatka' }
    ],
    keyMilestones: [
      { date: '2025-03', event: 'Launched Agentic AI Agents', source: 'https://www.apprentice.io/about/who-we-are' },
      { date: '2024-09', event: 'Reached $55.2M ARR (54% YoY growth)', source: 'https://getlatka.com/companies/apprentice' },
      { date: '2023-03', event: 'Raised ~$65M funding round', source: 'Company announcements' }
    ]
  },
  'siemens-xcelerator': {
    timeline: [
      { date: '2024-Q4', employees: 'Part of 320K', revenue: 'Part of €78B', source: 'Siemens annual report' },
      { date: '2025-Q1', employees: 'Part of 320K', revenue: 'Part of €78B+', source: 'Siemens public data' }
    ],
    keyMilestones: [
      { date: '2025-01', event: 'Unveiled Industrial Copilot at CES 2025', source: 'https://press.siemens.com/' },
      { date: '2025-06', event: 'Expanded NVIDIA partnership for industrial AI', source: 'https://investor.nvidia.com/' },
      { date: '2025-04', event: 'Introduced industrial AI agents at Automate 2025', source: 'https://press.siemens.com/' }
    ]
  }
};

// Data source attribution for all fields
export const dataSources = {
  revenue: {
    tulip: { value: '$50M ARR', source: 'GetLatka', url: 'https://getlatka.com/companies/tulip.co', lastUpdated: '2025-01', confidence: 'Medium' },
    'critical-manufacturing': { value: '$43.9M - $54.9M', source: 'GetLatka/ZoomInfo', url: 'https://getlatka.com/companies/critical-manufacturing', lastUpdated: '2025-06', confidence: 'Low (estimate)' },
    poka: { value: '$18.6M ARR', source: 'GetLatka', url: 'https://getlatka.com/companies/poka.io', lastUpdated: '2025-01', confidence: 'Medium' },
    parsable: { value: '$18.9M - $30M', source: 'Growjo/ZoomInfo', url: 'https://growjo.com/company/Parsable', lastUpdated: '2024-09', confidence: 'Low (estimate)' },
    apprentice: { value: '$55.2M ARR', source: 'GetLatka', url: 'https://getlatka.com/companies/apprentice', lastUpdated: '2024-12', confidence: 'High' },
    'siemens-xcelerator': { value: 'Part of €78B+ Siemens', source: 'Siemens Annual Report', url: 'https://www.siemens.com', lastUpdated: '2025-01', confidence: 'High' }
  },
  employees: {
    tulip: { value: '340+', source: 'BuiltIn Boston', url: 'https://www.builtinboston.com/company/tulip', lastUpdated: '2025-01', confidence: 'High' },
    'critical-manufacturing': { value: '467-541', source: 'ZoomInfo/GetLatka', url: 'https://www.zoominfo.com/', lastUpdated: '2025-06', confidence: 'Medium' },
    poka: { value: '169', source: 'GetLatka', url: 'https://getlatka.com/companies/poka.io', lastUpdated: '2025-01', confidence: 'High' },
    parsable: { value: '150+ (est.)', source: 'LinkedIn/estimates', url: 'https://www.linkedin.com/company/parsable', lastUpdated: '2024-09', confidence: 'Low' },
    apprentice: { value: '250+ (est.)', source: 'Company profiles', url: 'https://www.apprentice.io', lastUpdated: '2024-12', confidence: 'Medium' },
    'siemens-xcelerator': { value: 'Part of 320K+', source: 'Siemens public data', url: 'https://www.siemens.com', lastUpdated: '2025-01', confidence: 'High' }
  },
  funding: {
    tulip: { value: '$272.5M', source: 'Tulip Press Release', url: 'https://tulip.co/press/tulip-secures-120m-series-d/', lastUpdated: '2026-01', confidence: 'High (Official)' },
    'critical-manufacturing': { value: 'Private', source: 'Company status', url: 'https://www.criticalmanufacturing.com', lastUpdated: '2025-06', confidence: 'High' },
    poka: { value: '$45M+ (IFS)', source: 'Crunchbase/Press', url: 'https://www.lacaisse.com/en/news/', lastUpdated: '2023-06', confidence: 'High' },
    parsable: { value: '$133M (CAI)', source: 'Press releases', url: 'https://parsable.com/news/', lastUpdated: '2024-09', confidence: 'High' },
    apprentice: { value: '$207M', source: 'Company newsroom', url: 'https://www.apprentice.io/about/', lastUpdated: '2023-03', confidence: 'High (Official)' },
    'siemens-xcelerator': { value: 'Public company', source: 'Siemens AG', url: 'https://www.siemens.com', lastUpdated: '2025-01', confidence: 'High' }
  },
  valuation: {
    tulip: { value: '$1.3B', source: 'Tulip Press Release', url: 'https://tulip.co/press/tulip-secures-120m-series-d/', lastUpdated: '2026-01', confidence: 'High (Official)' },
    'critical-manufacturing': { value: 'N/A (Private)', source: 'Not disclosed', url: null, lastUpdated: null, confidence: 'N/A' },
    poka: { value: 'Acquired by IFS', source: 'Acquisition announcement', url: 'https://www.agcpartners.com/transactions/', lastUpdated: '2023-06', confidence: 'High' },
    parsable: { value: 'Acquired by CAI', source: 'Acquisition announcement', url: 'https://parsable.com/news/', lastUpdated: '2024-09', confidence: 'High' },
    apprentice: { value: 'N/A (Private)', source: 'Not disclosed', url: null, lastUpdated: null, confidence: 'N/A' },
    'siemens-xcelerator': { value: '~€150B market cap', source: 'Stock market', url: 'https://www.siemens.com', lastUpdated: '2025-01', confidence: 'High' }
  }
};