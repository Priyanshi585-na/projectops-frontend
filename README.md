# ProjectOps AI

**ProjectOps AI** is an AI-powered project management platform designed to help project managers monitor project health, manage tasks, analyze budgets, identify risks, and interact with project information using natural language.

The system combines live project data with multiple specialized AI agents coordinated by a central **Orchestrator**.

---

## Overview

ProjectOps AI provides a unified dashboard for managing a project through:

- Live task and project data
- AI-powered project analysis
- Intelligent task assignment
- Budget and expense analysis
- Risk detection and analysis
- Project-document knowledge retrieval
- Multi-agent orchestration
- Human-in-the-loop task assignment
- Automated email notifications after approved assignments

The manager interacts primarily with the Orchestrator, which routes requests to the appropriate specialist agents.

---

## System Architecture

```text
                         PROJECT MANAGER
                               |
                               v
                       REACT FRONTEND
                               |
                               v
                        ORCHESTRATOR
                               |
          +--------------------+--------------------+
          |                    |                    |
          v                    v                    v
     TASK AGENT          BUDGET AGENT        KNOWLEDGE AGENT
          |                    |                    |
          v                    v                    v
      AZURE SQL            AZURE SQL       AZURE AI SEARCH
                                                |
                                                v
                                         PROJECT DOCUMENTS
                                         AZURE BLOB STORAGE

                               |
                               v
                        ATTENTION AGENT
                               |
                               v
                     PROJECT HEALTH ANALYSIS


                 APPROVED TASK ASSIGNMENT
                               |
                               v
                          AZURE SQL
                               |
                               v
                           BREVO API
                               |
                               v
                     ASSIGNMENT EMAIL
```

---

## AI Agents

### 1. Orchestrator

The **Orchestrator** acts as the central coordinator of ProjectOps AI.

It:

- Understands the manager's request
- Determines which specialist agents are required
- Routes requests to the appropriate agents
- Coordinates multi-agent analysis
- Combines responses from multiple agents
- Produces a concise response for the manager

For example:

```text
Analyze the project and tell me what needs my attention today.
```

The Orchestrator can use the Task Agent, Budget Agent, and Knowledge Agent and synthesize their results into a single response.

---

### 2. Task Agent

The **Task Agent** manages project task information and team assignments.

It can:

- Retrieve project tasks
- Analyze task status and progress
- Analyze priorities and deadlines
- Retrieve project team members
- Analyze member skills and experience
- Analyze existing workload
- Propose suitable task assignments
- Return structured assignment proposals

Task assignments require explicit manager approval before they are committed to the database.

---

### 3. Budget Agent

The **Budget Agent** handles project financial analysis.

It can:

- Retrieve project budgets
- Analyze expenses
- Calculate remaining budget
- Calculate spending and burn rate
- Forecast future project costs
- Answer financial questions using project data

---

### 4. Knowledge Agent

The **Knowledge Agent** answers project-specific questions using approved project documentation.

It uses the project knowledge base backed by **Azure AI Search** and project documents stored in **Azure Blob Storage**.

It can retrieve information related to:

- Project requirements
- Architecture
- Project plans
- Meeting notes
- Risk information
- Release plans
- Other approved project documentation

---

### 5. Attention Agent

The **Attention Agent** analyzes project information and identifies areas requiring manager attention.

It considers information such as:

- Task deadlines
- Task status
- Task priorities
- Team workload
- Budget information
- Project risks
- Project documentation

Its analysis is displayed in the **Needs Your Attention** section of the Overview dashboard.

---

## Key Features

### Project Overview

The Overview dashboard provides a high-level view of project health.

It includes:

- Total tasks
- Completed tasks
- Remaining tasks
- Budget information
- Attention signals
- Project-level AI analysis

The dashboard uses live project data for its core project metrics.

---

### Natural Language Ask Bar

Project managers can interact with ProjectOps AI using natural language.

For example:

```text
What needs my attention today?
```

The request is sent to the Orchestrator, which determines the appropriate specialist agent or agents and returns a synthesized response.

---

### AI Team Assignment

The Task Agent can analyze incomplete project tasks and available team members.

The analysis considers:

- Member role
- Member skills
- Experience
- Existing workload
- Task requirements
- Task priority
- Task deadlines

The system then generates assignment proposals.

The manager can individually:

- Approve an assignment
- Reject an assignment

No assignment is committed without human approval.

---

## Task Assignment Workflow

```text
Manager requests team assignment
              |
              v
          Task Agent
              |
              v
 Analyze tasks + team members
              |
              v
 Analyze skills + workload
              |
              v
     Generate proposals
              |
              v
       Human approval
          /       \
         /         \
    APPROVE       REJECT
       |
       v
 Update Azure SQL
       |
       v
 Retrieve member email
       |
       v
    Brevo API
       |
       v
 Assignment Email
```

---

## Automated Assignment Emails

After a manager approves an assignment, ProjectOps AI:

1. Updates the task assignment in Azure SQL.
2. Retrieves the assigned member's email address from the database.
3. Sends an assignment email using the Brevo Transactional Email API.

The email address is retrieved dynamically from the `Members` table rather than being hardcoded into the application.

---

## Budget Dashboard

The Budget page provides a financial overview of the project.

It displays:

- Total project budget
- Total spending
- Remaining budget
- Budget utilization
- Spending by category
- Recent expenses

The financial information is retrieved from the project database.

---

## Budget Agent

The Budget Agent provides AI-powered financial analysis.

Example questions include:

```text
How much budget is remaining?
```

```text
What is our current spending rate?
```

```text
What will our projected spending be?
```

The agent uses the project's current financial data to answer these questions.

---

## What-If Budget Simulator

The Budget page also includes a What-If Budget Simulator.

The manager can simulate an additional expense or cost increase and see its effect on:

- Projected spending
- Remaining budget
- Budget utilization

The simulator is used for analysis only and does not modify the actual project financial data.

---

## Risk Center

The Risk Center provides project risk information and risk signals.

It helps managers identify areas that may require attention based on current project information.

---

## Data Sources

ProjectOps AI uses multiple sources of project information.

### Azure SQL Database

Stores structured project data including:

- Projects
- Tasks
- Members
- Expenses
- Task assignments

### Azure Blob Storage

Stores approved project documents.

### Azure AI Search

Provides search and retrieval capabilities for the project knowledge base.

---

## Database Structure

The primary project entities are:

```text
Projects
   |
   +---- Tasks
   |
   +---- Members
   |
   +---- Expenses
```

The task assignment workflow additionally maintains assignment information.

---

## Technology Stack

### Frontend

- React
- Vite
- Tailwind CSS
- JavaScript

### Backend

- Python
- FastAPI
- Azure Identity
- PyODBC

### AI and Cloud

- Microsoft Foundry
- Azure AI Agents
- Azure AI Search
- Azure Blob Storage
- Agent-to-Agent (A2A) communication
- Azure SQL Database

### Email

- Brevo Transactional Email API

### Deployment

- Frontend: Vercel
- Backend: Azure App Service

---

## Project Structure

```text
projectops-frontend/
│
├── src/
│   │
│   ├── components/
│   │   ├── Sidebar.jsx
│   │   ├── AskBar.jsx
│   │   ├── AgentBadge.jsx
│   │   ├── MetricCard.jsx
│   │   ├── RiskSignalCard.jsx
│   │   └── AssignConfirmCard.jsx
│   │
│   ├── pages/
│   │   ├── Overview.jsx
│   │   ├── Tasks.jsx
│   │   ├── Budget.jsx
│   │   └── RiskCenter.jsx
│   │
│   └── ...
│
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

---

## Backend API

The FastAPI backend exposes APIs for:

- Task retrieval
- Overdue task retrieval
- Tasks by assignee
- Upcoming deadlines
- Project progress
- Project lookup
- Team member retrieval
- Budget retrieval
- Expense retrieval
- Remaining budget
- Burn-rate calculation
- Cost forecasting
- Risk analysis
- Orchestrator queries
- AI assignment proposals
- Assignment approval

---

## Example API Workflow

### Ask the Orchestrator

```text
POST /orchestrator/query
```

Example request:

```json
{
  "query": "What needs my attention today?"
}
```

---

### Generate Assignment Proposals

```text
POST /assignment/propose
```

The backend sends the project information to the Task Agent, which retrieves the relevant tasks and team members and returns structured assignment proposals.

---

### Approve Assignment

```text
POST /assignment/approve
```

The backend:

1. Validates the task.
2. Validates the team member.
3. Updates the task assignment in Azure SQL.
4. Retrieves the member's email.
5. Sends the assignment email through Brevo.

---

## Human-in-the-Loop Design

ProjectOps AI does not allow the AI agent to permanently assign tasks automatically.

Instead:

```text
AI proposes
     |
     v
Human reviews
     |
     +---- Reject
     |
     +---- Approve
              |
              v
        Database update
              |
              v
        Email notification
```

This keeps the manager in control of important project decisions.

---

## Security

Sensitive credentials are not stored directly in the source code.

The backend uses environment variables for sensitive configuration such as:

```text
BREVO_API_KEY
BREVO_SENDER_EMAIL
BREVO_SENDER_NAME
```

These values are configured through deployment environment variables.

API keys and other secrets should never be committed to the repository.

---

## Running the Frontend Locally

Clone the repository:

```bash
git clone <repository-url>
```

Move into the project directory:

```bash
cd projectops-frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The application will then be available through the local Vite development server.

---

## Production Build

To create a production build:

```bash
npm run build
```

The generated production files are placed in:

```text
dist/
```

---

## Deployment

### Frontend

The React frontend is deployed using **Vercel**.

The production build is generated using:

```bash
npm run build
```

### Backend

The FastAPI backend is deployed using **Azure App Service**.

The backend connects to:

- Microsoft Foundry
- Azure SQL
- Azure AI Search
- Azure Blob Storage
- Brevo

---

## Project Workflow

A typical ProjectOps AI workflow looks like this:

```text
                    PROJECT MANAGER
                           |
                           v
                    React Dashboard
                           |
                           v
                      Orchestrator
                           |
             +-------------+-------------+
             |             |             |
             v             v             v
        Task Agent    Budget Agent   Knowledge Agent
             |             |             |
             +-------------+-------------+
                           |
                           v
                    Synthesized Result
                           |
                           v
                    Manager Decision
```

For task assignment:

```text
Task Agent
    |
    v
Assignment Proposals
    |
    v
Manager Approval
    |
    v
Azure SQL
    |
    v
Brevo
    |
    v
Email to Assigned Member
```

---

## Design Principles

ProjectOps AI follows several core principles.

### AI-Assisted, Human-Controlled

AI agents provide analysis and recommendations, while important actions such as task assignment require human approval.

### Specialized Agents

Each agent has a focused responsibility rather than one agent handling every type of project information.

### Centralized Orchestration

The Orchestrator provides a single interface for the manager while coordinating the specialist agents behind the scenes.

### Live Data

Core project information is retrieved from the project's data sources rather than being hardcoded into the dashboard.

### Knowledge Grounding

Project-specific questions can be answered using approved project documents through the knowledge base.

---

## Future Improvements

Potential future extensions include:

- Authentication and role-based access control
- Calendar integration
- Automated project status reports
- Advanced workload optimization
- Additional project analytics
- Expanded agent capabilities
- Additional notification channels
- More advanced forecasting

---

## Team

ProjectOps AI was developed as a collaborative AI/ML project.

The project demonstrates the use of:

- Multi-agent AI systems
- Cloud-based AI services
- Agent-to-Agent communication
- Project data integration
- Knowledge-grounded AI
- Human-in-the-loop decision making
- Automated workflows

---

## License

This project was developed as an academic project.
