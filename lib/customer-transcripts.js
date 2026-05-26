// Sample customer conversation transcripts mentioning competitors

export const customerTranscripts = [
  {
    id: 'transcript-001',
    customerName: 'Acme Manufacturing',
    customerIndustry: 'Automotive',
    date: '2025-05-15',
    participants: ['John Smith (Acme COO)', 'Sarah Chen (Tulip Account Executive)'],
    type: 'Discovery Call',
    duration: '45 minutes',
    competitorsMentioned: ['poka', 'critical-manufacturing'],
    transcript: `
Sarah: Thanks for taking the time today, John. I'd love to understand your current shop floor challenges.

John: Absolutely. We're at a critical point. Right now we're using paper-based work instructions and it's killing us. We're looking at a few solutions - we've had demos from Poka and Critical Manufacturing.

Sarah: Interesting. What did you think of those solutions?

John: Poka seems focused on the knowledge management side - digitizing work instructions, that sort of thing. It's fine for what it does, but we need more. We need to connect to our machines, pull real-time data, build custom workflows. Poka feels pretty rigid.

Sarah: And Critical Manufacturing?

John: That's a full MES system. Way too heavy for what we need right now. We're not a semiconductor fab. We just need to get our operators off paper and start collecting quality data. Their implementation timeline was 18 months. We can't wait that long.

Sarah: What's driving the urgency?

John: We lost a major customer audit last month because we couldn't prove our quality processes. Paper trails aren't cutting it anymore. We need digital records, real-time visibility, and we need it fast. If Tulip can do work instructions PLUS machine connectivity PLUS custom apps, that's the trifecta we need.

Sarah: That's exactly what we do. Our customers typically start with one line, prove value in 30-60 days, then scale across the plant.

John: That's what I want to hear. Poka can't do machine connectivity, and Critical Manufacturing is overkill. Show me how Tulip can do both.
    `,
    sentiment: 'positive',
    urgency: 'high',
    stage: 'evaluation'
  },
  {
    id: 'transcript-002',
    customerName: 'BioTech Solutions',
    customerIndustry: 'Pharmaceuticals',
    date: '2025-05-18',
    participants: ['Dr. Lisa Martinez (BioTech VP Manufacturing)', 'Mike Johnson (Tulip Sales Engineer)'],
    type: 'Technical Deep Dive',
    duration: '60 minutes',
    competitorsMentioned: ['apprentice'],
    transcript: `
Mike: Dr. Martinez, you mentioned you're also evaluating Apprentice.io. How's that going?

Lisa: They're impressive for pharma-specific compliance. Their 21 CFR Part 11 story is solid - they were built for our industry. But here's my concern: they're great at batch manufacturing workflows, but we're expanding into continuous manufacturing. I'm not sure Apprentice can handle that.

Mike: What specifically worries you about their flexibility?

Lisa: It feels very prescribed. Their templates are pharma-focused, which is great, but when I asked about customizing for our continuous process, they said we'd need professional services for months. We can't afford that kind of lock-in. 

Mike: How important is the ability to customize quickly?

Lisa: Critical. Our R&D team is constantly iterating on processes. We need a platform that our engineers can adapt without waiting for vendor consultants. I've heard Tulip's no-code app builder lets us do that. Is that true?

Mike: Yes, exactly. Our customers build and modify apps in days, not months. You own the platform.

Lisa: That's compelling. Apprentice is strong on compliance, but if we can't iterate quickly, we'll be stuck. We need both - compliance AND agility. Can Tulip handle pharma validation requirements?

Mike: Absolutely. We have multiple pharma customers who've validated Tulip for GMP environments. I can connect you with a reference who went through FDA inspection with Tulip-built apps.

Lisa: That would be huge. If you can match Apprentice on compliance but beat them on flexibility, you'll win this deal.
    `,
    sentiment: 'positive',
    urgency: 'medium',
    stage: 'technical-validation'
  },
  {
    id: 'transcript-003',
    customerName: 'Global Electronics Corp',
    customerIndustry: 'Electronics Assembly',
    date: '2025-05-20',
    participants: ['Robert Chang (Global Electronics CIO)', 'Emily Torres (Tulip Solution Architect)'],
    type: 'Executive Briefing',
    duration: '30 minutes',
    competitorsMentioned: ['siemens-xcelerator'],
    transcript: `
Robert: Emily, I'll be direct. We're a Siemens shop. We already have MindSphere deployed across three plants. Why would we introduce another platform?

Emily: That's a fair question. Can I ask - are your shop floor operators actually using MindSphere?

Robert: [pause] No. It's really an IT and engineering tool. The complexity is too high for operators.

Emily: Exactly. That's what we hear constantly. Siemens builds powerful industrial IoT infrastructure, but it's not designed for the people actually running production. Tulip sits on top of your existing systems - including MindSphere - and gives operators simple, visual interfaces they can actually use.

Robert: So you're saying Tulip complements Siemens, not replaces it?

Emily: Yes. Think of Siemens as your data backbone, Tulip as the frontline app layer. We have customers running Tulip + Siemens together. Tulip pulls data from MindSphere, presents it to operators in context, and pushes operator actions back into your Siemens environment.

Robert: Interesting. We spent $2M on the Siemens rollout. I can't walk away from that investment.

Emily: You shouldn't. We integrate with it. The question is: do you want your shop floor teams to actually USE the data Siemens is collecting? That's where Tulip comes in.

Robert: Hmm. Send me a case study of someone running both. If you can prove Tulip enhances our Siemens investment rather than competing with it, we should talk more.

Emily: I have the perfect reference - an automotive tier 1 supplier running both. I'll send it over today.
    `,
    sentiment: 'neutral',
    urgency: 'low',
    stage: 'early-education'
  },
  {
    id: 'transcript-004',
    customerName: 'Precision Parts Inc',
    customerIndustry: 'Aerospace',
    date: '2025-05-22',
    participants: ['Jennifer Wu (Precision Parts Operations Director)', 'Alex Kumar (Tulip Account Manager)'],
    type: 'Check-in Call',
    duration: '25 minutes',
    competitorsMentioned: ['poka'],
    transcript: `
Alex: Jennifer, how did the executive review go?

Jennifer: Not great. Our CFO is pushing back on cost. He says Poka quoted us 40% less than Tulip.

Alex: I see. What does that Poka quote include?

Jennifer: Honestly, I'm not sure. He just saw the bottom-line number. It was like $180K versus our $300K proposal.

Alex: Can I ask - does Poka's quote include machine connectivity? Custom app building? Analytics dashboards?

Jennifer: [long pause] I don't think so. I think it's just digital work instructions.

Alex: Right. So you're comparing their core product to our full platform. It's apples to oranges. Here's the thing - if you just need PDFs on tablets, Poka might be fine. But you told me you need to track cycle times, monitor equipment, and build custom quality checks. Poka can't do that.

Jennifer: You're right. I need to walk the CFO through what's actually included in each quote.

Alex: Let me help. I can build a side-by-side comparison showing feature parity. When you add the extra modules Poka would need to match our capabilities, I bet the price gap shrinks dramatically. Plus, what's the cost of deploying TWO systems - one for work instructions, another for machine data?

Jennifer: That's a good point. If we go with Poka, we'll still need something else for equipment monitoring. Then we're integrating two platforms. That's a nightmare.

Alex: Exactly. One platform, one vendor, one implementation. That has value. Let me put together that TCO analysis for your CFO.

Jennifer: Please do. I think Tulip is the right choice technically. I just need to make the business case.
    `,
    sentiment: 'concerned',
    urgency: 'high',
    stage: 'negotiation'
  },
  {
    id: 'transcript-005',
    customerName: 'FreshFood Manufacturing',
    customerIndustry: 'Food & Beverage',
    date: '2025-05-21',
    participants: ['Tom Anderson (FreshFood Plant Manager)', 'Rachel Green (Tulip CSM)'],
    type: 'Renewal Discussion',
    duration: '20 minutes',
    competitorsMentioned: ['parsable'],
    transcript: `
Rachel: Tom, I wanted to check in before your renewal comes up next quarter. How's Tulip working for you?

Tom: It's been good. We've digitized all our SOPs, quality checks are automated, we're seeing less waste. No complaints.

Rachel: That's great to hear. Are you planning to expand to other lines?

Tom: That's what I wanted to talk about. We got approached by Parsable last week. They're now owned by CAI Software, and they're offering us a pretty aggressive deal to switch.

Rachel: I see. What's attractive about their offer?

Tom: Honestly? The price. They're basically matching our current Tulip cost but throwing in their connected worker stuff and some AI features. It's tempting.

Rachel: I get it. Can I ask - have you tried migrating your existing apps to Parsable? 

Tom: Not yet. It's just a proposal.

Rachel: Here's my concern. You've built 15 custom apps in Tulip over the past year. Your team knows the platform. You've integrated with your ERP. Migrating all of that to a new platform - even at a lower price - is going to cost you time, productivity, and risk during the transition. What's that worth?

Tom: Fair point. I hadn't really thought through the migration effort.

Rachel: Also, CAI just acquired Parsable six months ago. They're still figuring out the integration. Do you want to be a guinea pig during their merger transition? Or stick with a stable platform that's working?

Tom: You make a good argument. I just need to make sure we're getting the best value.

Rachel: Let's talk about that. What if we added some of those advanced features you're interested in - maybe our AI quality detection - at a competitive rate? Would that address the value question while avoiding the risk of switching?

Tom: Yeah, if you can sweeten the renewal with some new capabilities, I think we stay. Let me see what you can do.
    `,
    sentiment: 'at-risk',
    urgency: 'high',
    stage: 'renewal-risk'
  }
];
