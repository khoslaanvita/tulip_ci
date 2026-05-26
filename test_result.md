#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: |
  Tulip Competitive Intelligence Command Center — Polished B&W MVP that tracks 40 industry
  competitors with executive dashboard, signals, profiles, AI agents (VoC, summary, battlecards).
  Latest session goals: (1) update dashboard table to drop Threat score and add visual category
  distinction + standout Industry column; (2) build /agents page with timestamps & status per agent.

frontend:
  - task: "Dashboard table redesign — drop Threat, group categories into B&W visual buckets, add Industry standout, render 40 competitors"
    implemented: true
    working: true
    file: "/app/app/page.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Replaced Threat column with cleaner 5-column table (Company / Category / Industry Focus / Geography / Tulip Competitive Angle). Added getCategoryGroup() mapping that buckets 35+ raw categories into 9 groups (MES/ERP, Connected Worker, QMS, CMMS/EAM, SCADA/OT, Analytics, AI Vision, Platform, Other) each with distinct B&W badge styling (solid black, double-border, dashed, gray fills) + lucide icon. Industry column gets a VERTICAL eyebrow label with left black border bar for clear visual prominence. Verified via screenshot — all 40 competitors render, badges correctly differentiate categories (incl. Cognex/Landing AI → AI VISION after reordering). Also converted residual blue/green color violations on the page to B&W."

  - task: "Agents page — timestamps + per-agent status (last run, scheduler health, activity log)"
    implemented: true
    working: true
    file: "/app/app/agents/page.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Rebuilt /agents page as a client component fetching /api/scheduler/status and /api/activity-log. Top status bar shows Scheduler (Running/Stopped), Last Global Run (relative + absolute), Total Agent Runs. Each of the 7 agent cards shows ACTIVE/READY/ON-DEMAND status pill, type+schedule chip, and a Last Run strip (relative time + monospace absolute). Bottom adds a 5-step 'How Agents Work Together' B&W card and a Recent Agent Activity table (latest 8 events). Replaced the previous blue summary card with strict B&W styling. Screenshot confirmed Scheduler=Running, Market Monitor=Active with 'just now' timestamp, 100 total runs, activity log rendering correctly."

metadata:
  created_by: "main_agent"
  version: "1.1"
  test_sequence: 1
  run_ui: false

test_plan:
  current_focus: []
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

agent_communication:
  - agent: "main"
    message: "Completed P0 items: dashboard table redesign + agents page with live timestamps/status. Did not call backend testing agent since changes are frontend-only and rely on existing /api/scheduler/status & /api/activity-log endpoints which are already returning data. OpenAI quota error remains blocked pending funded key from user. Awaiting user verification before moving to upcoming task (weekly leadership digest email)."
  - agent: "main"
    message: "Big feature pass v1.2: (1) Strategic Insights box (Top 3 Moves to Make) computed deterministically with optional AI refinement — red CRITICAL pills, green Tulip Advantage callouts, black Recommended Action boxes. (2) Threat Score column restored with red/amber/green band indicators (Critical/High/Medium/Low) + progress bar; table sorted by threat. (3) Single green accent introduced (emerald-600/700) per user direction. (4) New Category Intelligence section between Strategic Insights and table — 8 category tabs, AI-refreshed summaries via gpt-4o-mini, 4-axis What's Happening (Product/AI/Sales/Pricing), Tulip Takeaways with green numbered list; data backed by /app/data/category-insights.json seed for resilience. (5) Competitor detail Overview now has 'Tulip Battle Plan' with Threats (black/red), Opportunities (green), Competitive Gaps, Market Trends + Tulip Position, and Recommended Actions — auto-loads on page mount, AI-powered with deterministic fallback. (6) VoC transcripts expanded from 5 to 15 covering 19 competitors. (7) Bugs fixed: Tulip Command Center crash (undefined competitor), missing getCustomerTranscriptsCollection import, missing await on getVoCStats. (8) All AI calls switched to gpt-4o-mini with 1h/6h caching to handle 3 RPM rate limit gracefully. OpenAI key user provided is working at free tier (3 RPM)."
