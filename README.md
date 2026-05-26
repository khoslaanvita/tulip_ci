# Tulip Competitive Intelligence Command Center

A continuous competitive intelligence system for manufacturing software, powered by AI agents.

## 🎯 Overview

The Tulip Competitive Intelligence Command Center is an MVP web application that demonstrates how AI agents can continuously monitor competitors, analyze signals, generate insights, and keep sales teams informed with real-time battlecards and alerts.

## ✨ Key Features

### 📊 **Dashboard Overview**
- Track 5 key competitors in manufacturing software
- Real-time competitive signals with severity scoring
- Quick stats on high-priority alerts
- One-click Market Monitor agent execution

### 🔍 **Signal Feed**
- Centralized feed of all competitive signals
- Filter by severity (high/medium/low) and signal type
- Manual signal input for internal intelligence
- AI-powered analysis and classification
- Email draft generation for alerts

### 🎯 **Competitor Profiles**
- Detailed competitor intelligence
- Market positioning and strengths/weaknesses
- Pricing notes and AI claims
- Recent signal history
- Integrated battlecard access

### ⚔️ **Battlecard Generator**
- AI-powered sales battlecard creation
- When competitors appear in deals
- Where Tulip wins
- Likely objections and sales responses
- Discovery questions to ask prospects
- Product and marketing implications

### 📋 **Agent Activity Log**
- Real-time tracking of AI agent operations
- Chronological timeline of all activities
- Detailed results and timestamps
- Agent performance metrics

## 🤖 AI Agents

### Market Monitor Agent
**Role**: Continuous competitive intelligence gathering
- Ingests signals from multiple sources
- Classifies signal type (product, pricing, AI, customer, etc.)
- Scores severity (low, medium, high)
- Recommends ownership (sales, product, marketing, exec)
- Triggers battlecard updates for high-priority signals

### Battlecard Update Agent
**Role**: Automated sales enablement
- Generates comprehensive competitive battlecards
- Incorporates recent competitive signals
- Provides discovery questions and objection handling
- Updates product and marketing recommendations

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14 + React
- **UI Components**: shadcn/ui + Radix UI + Tailwind CSS
- **AI**: OpenAI GPT-4o-mini (token-efficient)
- **Storage**: Local JSON files (zero-dependency MVP)
- **Email**: mailto: links (opens Gmail/default email client)
- **Icons**: Lucide React

### Project Structure
```
/app
├── app/
│   ├── page.js                      # Dashboard
│   ├── signals/page.js              # Signal feed
│   ├── competitors/[id]/page.js     # Competitor profiles
│   ├── battlecard/page.js           # Battlecard generator
│   ├── activity/page.js             # Agent activity log
│   └── api/[[...path]]/route.js     # Backend API
├── lib/
│   ├── ai-helpers.js                # AI integration
│   └── storage.js                   # JSON file operations
├── data/
│   ├── competitors.json             # 5 competitors
│   ├── signals.json                 # Competitive signals
│   ├── battlecards.json             # Generated battlecards
│   └── activity-log.json            # Agent activity
└── components/ui/                   # shadcn components
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- OpenAI API key (optional - has intelligent fallback)

### Installation
```bash
# Install dependencies
yarn install

# Set up environment variables
cp .env.example .env
# Add your OPENAI_API_KEY to .env

# Run development server
yarn dev
```

Visit `http://localhost:3000` to see the dashboard.

## 📖 Usage Guide

### 1. View Dashboard
- See all 5 tracked competitors at a glance
- Review latest signals and severity levels
- Check high-priority alerts

### 2. Run Market Monitor
- Click "Run Market Monitor" button on dashboard
- Agent scans competitors and detects new signals
- Automatic severity scoring and classification
- High/medium signals trigger battlecard updates

### 3. Add Manual Signals
- Go to Signal Feed → "Add Internal Signal"
- Select competitor
- Paste sales call notes, customer feedback, or analyst insights
- AI analyzes and classifies automatically

### 4. Generate Battlecards
- Navigate to Battlecard Generator
- Select competitor
- Optionally add deal context
- Get comprehensive sales battlecard with:
  - When they appear in deals
  - Where Tulip wins
  - Objection handling
  - Discovery questions

### 5. Email Alerts
- On any signal, click the mail icon
- Opens email client with pre-filled alert
- Includes what changed, why it matters, recommended action
- Links back to dashboard and battlecard

### 6. Track Agent Activity
- View all agent operations in real-time
- See what each agent discovered
- Review timestamps and results
- Monitor system performance

## 🎨 Design Philosophy

**B2B SaaS Dashboard Style**
- Clean, minimal, professional
- Card-based layouts
- Color-coded severity badges
- Clear call-to-action buttons
- Responsive design

**User Experience**
- Demo-ready with seed data
- Loading states for async operations
- Toast notifications for feedback
- One-click actions
- Intuitive navigation

## 🔧 API Endpoints

### Competitors
- `GET /api/competitors` - List all competitors
- `GET /api/competitors/:id` - Get competitor details

### Signals
- `GET /api/signals` - List signals (with filters)
- `POST /api/signals` - Add new signal

### Battlecards
- `GET /api/battlecards` - List all battlecards
- `GET /api/battlecards/:competitorId` - Get specific battlecard
- `POST /api/battlecards/generate` - Generate new battlecard

### Agents
- `POST /api/agents/run-monitor` - Run Market Monitor Agent

### Utilities
- `GET /api/activity-log` - Get agent activity log
- `POST /api/email/draft` - Generate email draft URL

## 📊 Tracked Competitors

1. **Critical Manufacturing** (MES)
   - Enterprise MES for semiconductors and electronics
   
2. **Poka** (Connected Worker)
   - Frontline knowledge management with AI
   
3. **Parsable** (Connected Worker)
   - Digital workflows for operational execution
   
4. **Apprentice.io** (Life Sciences / Pharma)
   - Manufacturing execution for biopharma
   
5. **Siemens MindSphere / Xcelerator** (SCADA / Industrial Platform)
   - Industrial IoT and automation platform

## 🎯 Signal Types

- **Product**: New features, releases, capabilities
- **Pricing**: Pricing changes, packaging updates
- **AI**: AI/ML capabilities and claims
- **Customer**: Case studies, wins, testimonials
- **GTM**: Go-to-market strategy changes
- **Fundraising**: Investment rounds, M&A
- **Hiring**: Key hires, team expansion
- **Analyst**: Analyst reports, market positioning
- **Other**: Miscellaneous competitive intelligence

## 🎖️ Severity Levels

- **High**: Requires immediate attention, significant competitive threat
- **Medium**: Important but not urgent, should be reviewed
- **Low**: Informational, monitor over time

## 📧 Email Functionality

The app uses `mailto:` links to create email drafts:
- Opens user's default email client (Gmail, Outlook, etc.)
- Pre-fills subject and body with competitive alert
- Includes what changed, why it matters, recommended action
- Links back to dashboard for more details

## 🚢 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables
```env
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

## 🔮 Future Enhancements

- Real RSS feed integration
- Scheduled agent runs (cron jobs)
- Actual email sending (via Resend/SendGrid)
- Web scraping for competitor websites
- Integration with CRM (Salesforce, HubSpot)
- Slack notifications
- Advanced analytics and reporting
- Custom signal sources
- Team collaboration features
- Export battlecards as PDF

## 🤝 Contributing

This is an MVP demonstration project. For production use, consider:
- Implementing proper authentication
- Using a production database (PostgreSQL, MongoDB)
- Adding rate limiting and error handling
- Implementing real-time websockets
- Adding comprehensive testing
- Setting up monitoring and logging

## 📝 License

MIT License - feel free to use this as a template for your own competitive intelligence system!

## 🙏 Acknowledgments

Built with:
- Next.js
- OpenAI GPT-4o-mini
- shadcn/ui
- Tailwind CSS
- Lucide Icons

---

**Note**: This is a demonstration MVP. The AI agent pattern shown here uses a simplified implementation. For production use with proper CrewAI or LangGraph integration, additional architecture would be needed.
