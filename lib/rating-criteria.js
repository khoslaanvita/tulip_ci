// Signal Rating Criteria and Methodology

export const signalRatingCriteria = {
  severity: {
    high: {
      description: 'Immediate threat requiring action within 1-2 weeks',
      criteria: [
        'Major product launch that directly competes with Tulip core features',
        'Significant funding round (>$50M) enabling aggressive expansion',
        'Acquisition of technology/company that strengthens their position',
        'Key customer win in Tulip target accounts',
        'Pricing change that undercuts Tulip by >30%',
        'Executive hire from Tulip or top competitor',
        'Partnership with major tech vendor (Microsoft, AWS, etc.)'
      ],
      score: 10,
      responseTime: '1-2 weeks',
      owners: ['exec', 'product', 'sales']
    },
    medium: {
      description: 'Important competitive move requiring monitoring and potential response',
      criteria: [
        'Product feature enhancement in overlapping area',
        'Moderate funding round ($10-50M)',
        'Entry into new vertical where Tulip operates',
        'Marketing campaign or rebranding',
        'New partnership announcement',
        'Customer case study publication',
        'Award or analyst recognition'
      ],
      score: 5,
      responseTime: '2-4 weeks',
      owners: ['product', 'marketing', 'sales']
    },
    low: {
      description: 'Informational update worth tracking but not requiring immediate action',
      criteria: [
        'Minor product updates or bug fixes',
        'Blog post or content publication',
        'Conference participation or speaking',
        'Team expansion announcements',
        'Office opening or relocation',
        'Industry news mention',
        'Social media activity'
      ],
      score: 2,
      responseTime: 'Monitor over time',
      owners: ['marketing', 'sales']
    }
  },
  
  signalTypes: {
    product: {
      description: 'New features, releases, or product announcements',
      weight: 1.5,
      impactAreas: ['product', 'sales', 'marketing']
    },
    pricing: {
      description: 'Pricing changes, packaging updates, or discount programs',
      weight: 1.3,
      impactAreas: ['sales', 'finance', 'exec']
    },
    AI: {
      description: 'AI/ML capabilities, generative AI, or automation features',
      weight: 1.8,
      impactAreas: ['product', 'exec', 'marketing']
    },
    fundraising: {
      description: 'Funding rounds, M&A, IPO, or financial events',
      weight: 1.4,
      impactAreas: ['exec', 'finance', 'bd']
    },
    hiring: {
      description: 'Key hires, team expansion, or employee growth',
      weight: 1.2,
      impactAreas: ['hr', 'exec', 'sales']
    },
    customer: {
      description: 'Customer wins, case studies, or testimonials',
      weight: 1.3,
      impactAreas: ['sales', 'marketing', 'customer-success']
    },
    analyst: {
      description: 'Analyst reports, Gartner/Forrester placement, or market research',
      weight: 1.2,
      impactAreas: ['marketing', 'exec', 'sales']
    },
    gtm: {
      description: 'Go-to-market strategy, messaging, or positioning changes',
      weight: 1.1,
      impactAreas: ['marketing', 'sales', 'exec']
    },
    partnership: {
      description: 'Strategic partnerships, integrations, or alliances',
      weight: 1.3,
      impactAreas: ['bd', 'product', 'exec']
    },
    other: {
      description: 'Miscellaneous competitive intelligence',
      weight: 1.0,
      impactAreas: ['marketing']
    }
  },
  
  threatScoreCalculation: {
    formula: 'Base Score + (Signal Type Weight × Severity Score) + Recency Bonus',
    components: {
      baseScore: 'Starts at 0 for each competitor',
      severityScore: 'High=10, Medium=5, Low=2',
      typeWeight: 'AI=1.8x, Product=1.5x, Pricing=1.3x, etc.',
      recencyBonus: '+2 points per signal in last 30 days',
      decayFactor: '-1 point per signal older than 90 days'
    },
    thresholds: {
      high: '≥20 points',
      medium: '10-19 points',
      low: '<10 points'
    },
    example: {
      competitor: 'Poka',
      signals: [
        { type: 'AI', severity: 'high', days: 15, calculation: '(1.8 × 10) + 2 = 20' },
        { type: 'product', severity: 'medium', days: 45, calculation: '(1.5 × 5) + 2 = 9.5' }
      ],
      totalScore: 29.5,
      threatLevel: 'high'
    }
  },
  
  dataQuality: {
    high: {
      description: 'Official company announcement or verified public filing',
      confidence: '95%+',
      sources: ['Press releases', 'SEC filings', 'Official blogs', 'Earnings calls']
    },
    medium: {
      description: 'Reputable third-party source or industry publication',
      confidence: '75-94%',
      sources: ['TechCrunch', 'GetLatka', 'ZoomInfo', 'Crunchbase', 'LinkedIn']
    },
    low: {
      description: 'Unverified or estimated data',
      confidence: '<75%',
      sources: ['Estimates', 'Aggregators', 'Social media', 'Rumors']
    }
  }
};

// Employee tracking methodology
export const employeeTrackingCriteria = {
  dataSource: 'LinkedIn company pages and employee count APIs',
  updateFrequency: 'Daily snapshots',
  alertThresholds: {
    rapid_growth: {
      trigger: '>15% employee increase in 30 days',
      severity: 'high',
      message: 'Competitor showing rapid hiring - potential expansion or new product launch'
    },
    moderate_growth: {
      trigger: '5-15% employee increase in 30 days',
      severity: 'medium',
      message: 'Competitor steadily hiring - monitor for strategic shifts'
    },
    contraction: {
      trigger: '>10% employee decrease in 30 days',
      severity: 'medium',
      message: 'Competitor reducing headcount - potential financial issues or pivot'
    },
    key_department: {
      trigger: '>5 hires in specific department (Engineering, Sales, etc.) in 30 days',
      severity: 'medium',
      message: 'Competitor investing in specific function - investigate strategic focus'
    }
  },
  emailTemplate: {
    subject: '🚨 Hiring Velocity Alert: {competitor} +{percentage}% employees in {period}',
    recipients: ['ceo@tulip.co', 'hr@tulip.co', 'strategy@tulip.co'],
    content: `
THREAT ALERT: Rapid Hiring Detected

Competitor: {competitor}
Employee Growth: +{count} employees ({percentage}%)
Time Period: {period}
Current Total: {total} employees

Department Breakdown:
- Engineering: +{eng}
- Sales: +{sales}
- Marketing: +{marketing}
- Other: +{other}

Why This Matters:
Rapid hiring typically indicates:
1. New product development (if engineering heavy)
2. Market expansion (if sales/marketing heavy)
3. Large funding round enabling growth
4. Preparing for major launch or initiative

Recommended Actions:
1. Monitor for product announcements in next 2-3 months
2. Check for recent funding news
3. Review job postings for strategic clues
4. Update competitive battlecards
5. Brief sales team on potential new capabilities

View Full Analysis: {dashboardLink}
    `
  }
};