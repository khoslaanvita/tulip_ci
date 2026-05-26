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
  },
  {
    id: 'transcript-006',
    customerName: 'Northstar Aerospace',
    customerIndustry: 'Aerospace & Defense',
    date: '2025-06-02',
    participants: ['Karen Brooks (Director of Operations)', 'David Park (Tulip Sales Engineer)'],
    type: 'Competitive Evaluation',
    duration: '50 minutes',
    competitorsMentioned: ['sap-digital-manufacturing', 'siemens-xcelerator'],
    transcript: `
David: Karen, you mentioned you're comparing Tulip to SAP DM and Siemens Xcelerator. What's tipping you one way or the other?

Karen: Honestly, both SAP and Siemens are giants — and our IT team likes that. But every time we ask "how long to get something running on the shop floor," the answer is 12 to 18 months. We just can't wait. We have a Boeing audit in eight months and we need digital traveler records yesterday.

David: How big is the deployment SAP is proposing?

Karen: They want a full DM Cloud rollout — $2.4M implementation, 14-month timeline, three integration partners. Siemens is similar — Xcelerator + Industrial Edge plus their AI Copilot demo, but it's vaporware in our use case. Their reference accounts are all automotive, not aerospace.

David: What does the operator experience look like in those proposals?

Karen: That's the kicker. Both show me beautiful executive dashboards. Neither has shown me an operator screen that I'd actually want my technicians on for 8 hours a day. Tulip's demo was the first time I saw something that looked like an iPad app a technician would actually like.

David: Where does this leave us?

Karen: I want to do a 60-day pilot — one Section 53 cell, full digital traveler with photo capture and machine integration. If we hit our quality metrics, we expand. SAP and Siemens are still on the long list as "platform of record" but I want Tulip to be the operator layer.

David: Done. Let me put a pilot scope together this week.
    `,
    sentiment: 'positive',
    urgency: 'high',
    stage: 'evaluation'
  },
  {
    id: 'transcript-007',
    customerName: 'Crestline Foods',
    customerIndustry: 'Food & Beverage',
    date: '2025-06-04',
    participants: ['Marcus Liu (Plant Manager)', 'Priya Nair (Tulip AE)'],
    type: 'Win/Loss Review',
    duration: '40 minutes',
    competitorsMentioned: ['parsable', 'augmentir', 'poka'],
    transcript: `
Priya: Marcus, thanks for being candid. You ended up picking Tulip last quarter — I want to understand why you ruled out the others.

Marcus: Sure. Parsable was the first one we looked at. Beautiful procedure builder, very polished. But when we asked them about machine integration — pulling temperatures off our pasteurizers — they basically said "we don't do that, you need a separate system." That's a deal breaker for us.

Priya: Got it. Augmentir?

Marcus: Augmentir's AI training story is sharp. The skills-tracking angle is great, especially for our high-turnover lines. But it's a point solution for training. We have FIVE other workflow problems to solve and Augmentir can't touch any of them. I don't want five vendors.

Priya: And Poka?

Marcus: Poka was the closest competitor for us. Their content library is genuinely impressive. But after the IFS acquisition, every conversation got pulled toward "do you also need IFS ERP?" We're not replacing our ERP. We just want frontline software. The Poka team felt distracted.

Priya: What pushed you to Tulip in the end?

Marcus: Three things. One, the platform story — we can build literally any app we need. Two, the operator UX felt like a consumer app, not enterprise software. Three, you closed in 7 weeks; Parsable wanted 6 months of "discovery."

Priya: Any concerns we should know about?

Marcus: Pricing transparency. Your enterprise pricing felt opaque early on. Once we got to a real quote it was fine, but it took two calls. Tighten that up.
    `,
    sentiment: 'positive',
    urgency: 'medium',
    stage: 'closed-won'
  },
  {
    id: 'transcript-008',
    customerName: 'Synergy Biotech',
    customerIndustry: 'Pharmaceuticals',
    date: '2025-05-29',
    participants: ['Dr. Helena Rao (VP Quality)', "James O'Brien (Tulip Industry Lead)"],
    type: 'Discovery + QMS Discussion',
    duration: '55 minutes',
    competitorsMentioned: ['mastercontrol', 'kneat', 'sparta-trackwise'],
    transcript: `
James: Helena, you mentioned you're standardizing on MasterControl for QMS but still have an MES gap. Tell me more.

Helena: Right. MasterControl is the system of record for our quality processes — CAPAs, change controls, document management. It's deeply embedded. We're NOT replacing it. But on the shop floor, we still have paper batch records, manual exception handling, no real-time visibility. That's where I need help.

James: Have you looked at MasterControl Manufacturing Excellence?

Helena: We did the demo. It's promising but very early. The roadmap is 18 months out for some of the features we need. And it's basically forcing us into a single-vendor stack. I'd rather have a flexible execution layer that sits cleanly above MasterControl and feeds it the right records.

James: That's exactly the architecture we deploy with QMS-heavy customers. Tulip executes the workflow on the shop floor, generates the e-records, and posts to MasterControl as the system of record.

Helena: That's what I want. Now — Kneat is also on my evaluation list, but mostly for validation lifecycle, not execution. Sparta/TrackWise we use for adverse events. None of them are execution platforms.

James: How important is GxP validation for Tulip itself?

Helena: Critical. I need pre-validated reference architecture, documentation packages, and a partner network that knows GMP. If we go through full IQ/OQ/PQ from scratch, the project takes a year.

James: We've got pre-validated app templates and a partner network. I'll send you our GxP playbook today.
    `,
    sentiment: 'positive',
    urgency: 'medium',
    stage: 'evaluation'
  },
  {
    id: 'transcript-009',
    customerName: 'Atlas Industrial',
    customerIndustry: 'Heavy Industrial',
    date: '2025-06-07',
    participants: ['Bruce Walden (VP Maintenance)', 'Casey Reed (Tulip AE)'],
    type: 'Discovery Call',
    duration: '45 minutes',
    competitorsMentioned: ['maintainx', 'fiix', 'ibm-maximo'],
    transcript: `
Casey: Bruce, walk me through what you're currently running for maintenance management.

Bruce: We run IBM Maximo at the enterprise level — it's been there for 15 years. It's where assets and work orders live. But our technicians hate it. Mobile experience is terrible. Half my guys carry paper backup.

Casey: Have you looked at MaintainX or Fiix?

Bruce: MaintainX, yes. The mobile-first story is incredible. My team would actually use it. The problem is — I can't rip out Maximo. There are 60,000 assets in there, integrated with our SAP. So I'd be running TWO systems.

Casey: That's a common pattern we see. Tulip is often the operator-facing app layer on top of Maximo or SAP.

Bruce: That's interesting. So a tech opens a Tulip app, sees their work orders coming from Maximo, completes the work in Tulip with photos and machine data, and it syncs back to Maximo?

Casey: Exactly. And you can build the workflow exactly the way YOUR techs work, not the way Maximo's mobile app was designed in 2012.

Bruce: That's compelling. Fiix tried to sell us a "Maximo replacement" — I'm not doing that. And MaintainX is pitching "ditch Maximo and just use us" — also not happening at our scale. The "app layer above your existing system" framing actually works for us.

Casey: We can demo that next week. We've done it with three other Maximo customers.

Bruce: Send me the references. If they're real, I'm in for a 60-day pilot on one plant.
    `,
    sentiment: 'positive',
    urgency: 'medium',
    stage: 'discovery'
  },
  {
    id: 'transcript-010',
    customerName: 'Lumen Electronics',
    customerIndustry: 'Electronics Manufacturing',
    date: '2025-06-10',
    participants: ['Jin Park (CIO)', 'Anna Goldstein (Tulip Solutions Architect)'],
    type: 'Technical Deep Dive',
    duration: '60 minutes',
    competitorsMentioned: ['inductive-automation', 'aveva-pi', 'highbyte'],
    transcript: `
Anna: Jin, you mentioned you're running Ignition for SCADA and AVEVA PI for historian. Tell me about the data architecture.

Jin: Ignition runs everything below the data layer — PLCs, line control, alarming. It's been incredible — unlimited licensing, fast to develop. AVEVA PI handles the historian, all the long-term tag data. We're moving toward a unified namespace, looking at HighByte to broker between systems.

Anna: Where does Tulip fit?

Jin: Honestly that's what I'm trying to figure out. Ignition has Perspective, which can build operator screens. But our process engineers build those, not our operators. The screens are very engineer-oriented. We need operator workflow apps — like "run this hourly check, take this photo, capture this measurement" — that don't really fit Ignition's model.

Anna: That's the sweet spot for Tulip. We're not competing with Ignition or AVEVA — we're consuming their data and giving operators a workflow layer on top.

Jin: That's what I needed to hear. I was getting pitched "Tulip will replace your SCADA" by a competitor, which is nonsense for us. We've invested too much in Ignition.

Anna: Many of our largest deployments coexist with Ignition. We have a documented integration pattern.

Jin: Good. What about HighByte? They're pitching themselves as the data broker layer.

Anna: HighByte is great for what they do. We can consume from HighByte just as easily as we consume directly from Ignition. We're orthogonal to that data fabric story.

Jin: OK. Send me the reference architecture and your top three Ignition coexistence accounts.
    `,
    sentiment: 'positive',
    urgency: 'medium',
    stage: 'technical-validation'
  },
  {
    id: 'transcript-011',
    customerName: 'Vertex Pharma',
    customerIndustry: 'Pharmaceuticals',
    date: '2025-06-12',
    participants: ['Olivia Tan (Director of Manufacturing Systems)', 'Brian Cole (Tulip AE)'],
    type: 'RFP Defense',
    duration: '50 minutes',
    competitorsMentioned: ['apprentice', 'critical-manufacturing', 'mastercontrol'],
    transcript: `
Brian: Olivia, the RFP came back as a three-way: Tulip, Apprentice.io, and Critical Manufacturing. What's your team's read?

Olivia: Apprentice is leading on the pharma-specific narrative. Their cell and gene therapy story is sharp. Their pre-validated templates for batch records are mature. The catch — they're prescriptive. Their way or no way.

Brian: And Critical Manufacturing?

Olivia: Critical is the "real MES" in the eyes of our IT team. Strong scheduler, deep equipment integration. But the implementation cost came in at $3.8M and 14 months. My CFO nearly fell out of his chair.

Brian: Where does Tulip fit in the comparison?

Olivia: Tulip is the flexibility and speed answer. The reason we're not eliminating you is that the operations team LOVED the demo. They could see themselves building their own apps without waiting six months for IT. That's huge for us.

Brian: What's the risk you're holding against us?

Olivia: Two things. One, validation maturity — your GxP story is solid but newer than Apprentice's. Two, our IT team worries about "shadow IT" — operations going rogue and building apps that don't meet our standards. I need governance answers.

Brian: We have a governance playbook — admin controls, audit trails, app lifecycle management, validation packages per app. I can walk you through it on Thursday.

Olivia: Do it. If the governance story holds up, I think we're choosing Tulip for execution and keeping MasterControl as the QMS system of record.

Brian: That's exactly the architecture we've deployed at three top-20 pharma companies.
    `,
    sentiment: 'cautiously-positive',
    urgency: 'high',
    stage: 'evaluation'
  },
  {
    id: 'transcript-012',
    customerName: 'Meridian Auto Parts',
    customerIndustry: 'Automotive',
    date: '2025-06-14',
    participants: ['Frank DeLuca (Plant Director)', 'Sasha Kim (Tulip AE)'],
    type: 'Renewal + Expansion',
    duration: '35 minutes',
    competitorsMentioned: ['plex', 'sap-digital-manufacturing'],
    transcript: `
Sasha: Frank, you're up for renewal at three plants. How are you feeling about the program?

Frank: Honestly, very good. The first plant went so well that we expanded to two more. The 40% reduction in scrap on Line 7 is now a board-level case study.

Sasha: That's incredible. What's the appetite for further expansion?

Frank: Big — but corporate is now pitching us Plex as a "single platform" alternative. They want us to standardize on Plex for MES across all 11 plants. The pitch is "one system, one vendor, one throat to choke."

Sasha: How are you responding to that?

Frank: I'm pushing back. Plex is great if you want a monolithic system, but it's slow to change and the operator UX is dated. With Tulip we ship a new app in two weeks. With Plex it's months and consultants.

Sasha: What would help you in that internal debate?

Frank: Two things. One — a written compete deck I can hand to my CIO that addresses every Plex objection point by point. Two — a multi-plant rollout story showing how Tulip scales. Right now my biggest reference is your own 5-plant deployment.

Sasha: I'll have both for you by Friday. And we're getting close to launching a Plant Network rollout playbook with case studies from a customer with 18 plants.

Frank: Send it. If you can defend the Plex pitch, we expand to all 11 plants by year-end.
    `,
    sentiment: 'positive',
    urgency: 'high',
    stage: 'expansion'
  },
  {
    id: 'transcript-013',
    customerName: 'Solis Energy',
    customerIndustry: 'Energy / Industrial Equipment',
    date: '2025-06-16',
    participants: ['Rachel Vance (VP Operations)', 'Daniel Wu (Tulip AE)'],
    type: 'Discovery + AI Conversation',
    duration: '40 minutes',
    competitorsMentioned: ['augmentir', 'parsable'],
    transcript: `
Daniel: Rachel, you mentioned AI was central to your evaluation. What's driving that?

Rachel: Two things. First, our workforce is aging. We're losing 15% of our most experienced techs in the next three years. Second, our CEO is obsessed with AI — every project needs an AI story for funding.

Daniel: Got it. How's Augmentir's AI story landing with you?

Rachel: They lead with AI everywhere — AI-suggested next steps, AI skills assessment, AI training plans. It's a strong pitch, especially the skills-gap angle. But when we dug in, half their "AI" is rule-based logic. Some is genuinely AI. It's hard to tell which is which.

Daniel: And Parsable?

Rachel: Parsable's AI story is way thinner. They're focused on procedure execution. Solid product, but they're behind on the AI narrative.

Daniel: Where does Tulip's AI fit?

Rachel: Honest answer? Your AI story is the youngest of the three but the most credible. You showed me real shop-floor copilot demos, not slideware. The "ask Tulip" feature where an operator can query the system for similar past issues — that's the kind of thing my CEO wants to see.

Daniel: That's the Tulip Frontline Copilot. It's in early access with five customers.

Rachel: Get me in that program. If we can deploy the copilot during the pilot, that's a game-changer for the funding conversation internally.

Daniel: I'll loop in our product team this week.
    `,
    sentiment: 'positive',
    urgency: 'high',
    stage: 'evaluation'
  },
  {
    id: 'transcript-014',
    customerName: 'Hartwell Metals',
    customerIndustry: 'Metals & Mining',
    date: '2025-06-18',
    participants: ['George Albright (COO)', 'Lena Park (Tulip AE)'],
    type: 'Loss Review',
    duration: '30 minutes',
    competitorsMentioned: ['sap-digital-manufacturing'],
    transcript: `
Lena: George, thanks for the candid post-mortem. You went with SAP DM over Tulip. Help me understand what tipped it.

George: Honestly, it was politics more than product. Our CIO is a 20-year SAP guy. We just signed S/4HANA. The pitch from SAP was "you're already buying ERP — bundle the manufacturing module for $200K incremental." That's hard to argue against.

Lena: Did the operators have a vote?

George: They did. They preferred Tulip — your demo was hands-down better. But the buying committee weighted IT integration and "single throat to choke" over operator usability. I lost that argument.

Lena: What would have changed the outcome?

George: Two things. One — if Tulip had an SAP S/4 reference architecture document that my CIO could review with SAP's blessing. Two — a stronger answer on long-term cost. Your three-year TCO was very competitive but our finance team was uncomfortable with "build apps yourself" — they prefer "buy this configured suite."

Lena: That's valuable feedback. The S/4 reference architecture is on our roadmap — we're working with SAP on a formal partner integration.

George: Get it done. Six months from now, our DM Cloud rollout will be way behind schedule — that's when I'd love to reopen the conversation about Tulip as the operator layer above SAP DM.

Lena: I'll keep this warm. Let's plan a Q3 revisit.
    `,
    sentiment: 'lost-but-open',
    urgency: 'low',
    stage: 'closed-lost'
  },
  {
    id: 'transcript-015',
    customerName: 'Aero Composites Inc',
    customerIndustry: 'Aerospace',
    date: '2025-06-20',
    participants: ['Patty Hernandez (Manufacturing Engineering Mgr)', 'Ron Garcia (Tulip Sales Engineer)'],
    type: 'AI Vision Conversation',
    duration: '45 minutes',
    competitorsMentioned: ['cognex', 'landing-ai'],
    transcript: `
Ron: Patty, you mentioned vision inspection is central to your roadmap. Walk me through the current state.

Patty: We have 14 Cognex In-Sight systems across two facilities. They're great at what they do — defect detection on composite layups. The problem is, they're islands. When the camera flags an issue, there's no workflow. An operator either ignores it or writes it in a logbook.

Ron: That's a workflow gap. What's the proposed solution?

Patty: We're looking at Landing AI for new lines because their SaaS model is cheaper. Also evaluating Cognex's newer EdgeLearning platform with foundation models. But again — same issue. Detection without action.

Ron: That's where Tulip fits. We don't compete with Cognex or Landing AI on detection. We consume their results and turn them into actionable workflows — pause the line, notify a supervisor, generate a quality record, route to disposition, all in one app.

Patty: Show me that integration.

Ron: Cognex has a digital I/O and OPC UA interface. We pull detection results in real-time. Tulip then triggers the operator workflow: "Defect detected — review image, accept or reject, capture rework data." All logged.

Patty: That's exactly the gap we're trying to close. What about Landing AI's SaaS pattern?

Ron: Landing AI has a REST API. Same pattern — we consume their classification results and trigger workflows.

Patty: OK. I want a pilot — Tulip + Cognex integration on Line 3. Sixty days. If we hit our quality metrics I'll roll this out across all 14 cameras.

Ron: Let's scope it this week.
    `,
    sentiment: 'positive',
    urgency: 'high',
    stage: 'evaluation'
  }
];
