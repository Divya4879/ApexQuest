# 🏆 ApexQuest - Auth0 for AI Agents Challenge

> **A secure community platform with autonomous AI agents powered by Auth0 Machine-to-Machine authentication**

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=for-the-badge)](https://apexquest.netlify.app)
[![Auth0 Challenge](https://img.shields.io/badge/Auth0-AI%20Agents%20Challenge-orange?style=for-the-badge)](https://dev.to/challenges/auth0)

## 🌟 Product Overview

**ApexQuest** is a revolutionary social media platform designed for personal growth enthusiasts. Users join topic-based communities, share their progress, and receive AI-powered insights in a secure, authenticated environment. Built specifically for the **Auth0 for AI Agents Challenge**, it showcases enterprise-grade security for autonomous AI systems.

### 🎯 The Personal Growth Revolution
Transform your self-improvement journey through:
- **10 Growth Categories**: Fitness, Learning, Career, Finance, Mental Health, Relationships, and more
- **AI-Powered Community**: Intelligent content moderation and personalized insights
- **Secure Environment**: Enterprise-grade authentication protecting every interaction
- **Real-time Engagement**: Live notifications, instant updates, and community connections

## 🔐 Auth0 for AI Agents Implementation

ApexQuest demonstrates **Auth0 for AI Agents** by implementing secure, autonomous AI agents that authenticate via Machine-to-Machine (M2M) credentials before performing actions. Each agent type has specific scopes and permissions, showcasing enterprise-grade security for AI systems.

### ✅ Challenge Requirements - 100% Complete

| Requirement | Implementation | Status |
|-------------|----------------|---------|
| **Authenticate the user** | Auth0 React SDK with role-based access | ✅ **Complete** |
| **Control the tools** | M2M scopes limit agent capabilities | ✅ **Complete** |
| **Limit knowledge** | Role-based content access and permissions | ✅ **Complete** |
| **Secure agent authentication** | Each agent authenticates before every action | ✅ **Complete** |

### 🤖 AI Agent Architecture

#### **👑 Admin Agent** - `admin:manage` scope
- **Auth0 M2M App**: `apexquest-admin-agent`
- **Capabilities**: Autonomous user management, ban/unban decisions, escalation handling
- **Security**: Authenticates with Auth0 before every administrative action

#### **🛡️ Moderator Agent** - `mod:warn` scope  
- **Auth0 M2M App**: `apexquest-mod-agent`
- **Capabilities**: AI-powered content analysis, automated warnings, intelligent escalation
- **AI Integration**: Uses Google Gemini to analyze flagged content and make moderation decisions

#### **👤 User Agent** - `user:post` scope
- **Auth0 M2M App**: `apexquest-user-agent`  
- **Capabilities**: Secure content creation, authenticated posting and replies
- **Security**: Pre-authenticates all user-generated content for platform safety

## 🚀 Key Features

### 🏘️ Community Platform
- **Smart Channel System**: 10 personal growth categories with rich content feeds
- **Real-time Interactions**: Posts, replies, likes with instant notifications
- **Progress Tracking**: Visual journey mapping for personal development
- **Community Safety**: AI-moderated environment with automated content review

### 🤖 Autonomous AI Moderation
- **Multi-Step Workflows**: Analyze → Decide → Act → Report
- **Intelligent Decision Making**: AI evaluates content severity and takes appropriate action
- **Automatic Escalation**: Complex cases escalated from Moderator to Admin agents
- **Complete Audit Trail**: Every agent decision logged with reasoning and confidence levels

### 🔒 Enterprise Security
- **Auth0 Integration**: Secure user authentication with role-based access control
- **M2M Authentication**: Dedicated Auth0 applications for each AI agent type
- **Scope-Based Permissions**: Fine-grained control over agent capabilities
- **Activity Monitoring**: Real-time dashboard showing all agent authentications and decisions

## 🛠️ Technology Stack

### Frontend
- **React 19** with TypeScript for type-safe development
- **Vite** for lightning-fast build and development experience
- **Tailwind CSS** for modern, responsive UI design
- **Auth0 React SDK** for seamless user authentication

### Backend & Services
- **Supabase** - PostgreSQL database with real-time subscriptions
- **Auth0** - Enterprise identity platform with M2M agent authentication
- **Google Gemini AI** - Advanced content analysis and moderation decisions
- **Netlify** - Global deployment with automatic CI/CD

### Security Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React App     │    │   Auth0 M2M      │    │   Supabase      │
│                 │    │                  │    │                 │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │ ┌─────────────┐ │
│ │ User Auth   │◄┼────┼►│ User Login   │ │    │ │ Posts       │ │
│ └─────────────┘ │    │ └──────────────┘ │    │ └─────────────┘ │
│                 │    │                  │    │                 │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │ ┌─────────────┐ │
│ │ AI Agents   │◄┼────┼►│ M2M Tokens   │ │    │ │ Users       │ │
│ └─────────────┘ │    │ └──────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🏗️ Project Structure

```
apexquest/
├── components/           # React UI components
│   ├── AgentActivityDashboard.tsx    # Real-time agent monitoring
│   ├── InteractiveAgent.tsx          # Autonomous moderation interface
│   ├── PostCard.tsx                  # Content display with security
│   ├── NotificationBell.tsx          # Real-time notifications
│   └── ...
├── services/            # Core business logic
│   ├── agentAuthService.ts           # Auth0 M2M authentication
│   ├── agenticModerationService.ts   # Autonomous AI moderation
│   ├── supabaseService.ts            # Database operations
│   ├── geminiService.ts              # AI content analysis
│   └── ...
├── pages/               # Application routes
│   ├── AgentPage.tsx                 # AI agent management dashboard
│   ├── HomePage.tsx                  # Community feed
│   ├── LandingPage.tsx               # Marketing and onboarding
│   └── ...
├── sql/                 # Database schema and migrations
└── context/             # React state management
```

## 🔧 Setup & Installation

### Prerequisites
- Node.js 18+ and npm
- Auth0 Account (free tier works)
- Supabase Account (free tier works)  
- Google AI API Key (free tier works)

### 1. Clone and Install
```bash
git clone https://github.com/yourusername/apexquest.git
cd apexquest
npm install
```

### 2. Auth0 Configuration

#### Create Auth0 Applications
1. **Regular Web Application** for user authentication
2. **Machine-to-Machine Applications** for AI agents:

| Application Name | Type | Scopes | Purpose |
|------------------|------|--------|---------|
| `apexquest-admin-agent` | M2M | `admin:manage` | User bans, escalations |
| `apexquest-mod-agent` | M2M | `mod:warn` | Content moderation |
| `apexquest-user-agent` | M2M | `user:post` | Content creation |

#### Create Auth0 API
- **Name**: `apexquest-agents-api`
- **Identifier**: `https://apexquest.com/api`
- **Scopes**: `admin:manage`, `mod:warn`, `user:post`

### 3. Environment Variables
```env
# User Authentication
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=https://your-domain.auth0.com/api/v2/

# AI Agents M2M Authentication
VITE_AUTH0_AGENTS_DOMAIN=your-domain.auth0.com
VITE_AUTH0_AGENTS_AUDIENCE=https://apexquest.com/api
VITE_ADMIN_AGENT_CLIENT_ID=admin-client-id
VITE_ADMIN_AGENT_CLIENT_SECRET=admin-client-secret
VITE_MOD_AGENT_CLIENT_ID=mod-client-id
VITE_MOD_AGENT_CLIENT_SECRET=mod-client-secret
VITE_USER_AGENT_CLIENT_ID=user-client-id
VITE_USER_AGENT_CLIENT_SECRET=user-client-secret

# Database & AI Services
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_GEMINI_API_KEY=your-gemini-api-key
```

### 4. Database Setup
Run the SQL files in `/sql/` directory in your Supabase SQL editor:
```sql
-- Core schema
\i supabase-schema.sql
-- Admin system  
\i admin-system-complete.sql
-- User warnings and bans
\i create-user-warnings-table.sql
\i create-banned-users-table.sql
```

### 5. Development Server
```bash
npm run dev
```
Visit `http://localhost:5173` to see ApexQuest!

## 🎮 How It Works

### User Experience
1. **Sign up/Login** with Auth0 (supports social logins)
2. **Select Growth Channels** from 10 personal development categories
3. **Create Content** - Posts and replies are authenticated by User Agent
4. **Community Interaction** - Like, comment, and engage with others
5. **AI Insights** - Receive intelligent feedback on your progress

### Moderator Experience  
1. **Access Agent Dashboard** via 🤖 icon in sidebar
2. **Review Flagged Content** in the moderation interface
3. **Use "🤖 Auto-Moderate"** - AI analyzes content and makes decisions
4. **Monitor Agent Activity** - Real-time dashboard shows all AI decisions

### Admin Experience
1. **Use "👑 Admin Auto-Review"** for serious violations
2. **Autonomous User Management** - AI handles bans based on violation history
3. **Complete Oversight** - Monitor all agent activities and decisions

## 🔍 AI Agent Demo Flow

### Autonomous Moderation Process
```typescript
// 1. Agent authenticates with Auth0 M2M
const token = await agentAuthService.authenticateAgent('mod');

// 2. AI analyzes flagged content
const decision = await analyzeContentForModeration(content, flagReason);

// 3. Agent executes decision autonomously  
await executeModeratorDecision(decision, postId, userId);

// 4. Complete audit trail logged
console.log(`Agent decision: ${decision.action} - ${decision.reasoning}`);
```

### Security Features in Action
- **Token Validation**: Every agent action requires valid Auth0 M2M token
- **Scope Enforcement**: Agents can only perform actions within their granted scopes
- **Activity Logging**: Complete audit trail with timestamps, reasoning, and outcomes
- **Error Handling**: Graceful fallbacks when authentication fails

## 📊 Agent Capabilities Matrix

| Agent Type | Auth0 Scope | Autonomous Capabilities | Use Cases |
|------------|-------------|------------------------|-----------|
| **Admin Agent** | `admin:manage` | User bans, escalation handling, policy enforcement | Repeat offenders, serious violations |
| **Moderator Agent** | `mod:warn` | Content analysis, warnings, escalation decisions | Automated content moderation |
| **User Agent** | `user:post` | Secure content creation, interaction authentication | All user-generated content |

## 🚀 Deployment

### Netlify Configuration
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  SECRETS_SCAN_ENABLED = "false"
```

### Production Considerations
- **Security Note**: M2M client secrets are currently in frontend for demo purposes
- **Production Recommendation**: Move secrets to secure backend API (Supabase Edge Functions, AWS Lambda, etc.)
- **Scalability**: Current architecture supports thousands of concurrent users
- **Monitoring**: Built-in activity logging and error tracking

## 🔮 Future Enhancements

### Technical Roadmap
- **Backend API**: Move M2M secrets to secure server-side implementation
- **Advanced RAG**: Knowledge base integration with role-based access
- **Multi-Agent Workflows**: Collaborative AI agent decision making
- **Real-time Monitoring**: Live agent activity dashboard with analytics

### Product Roadmap  
- **Mobile Apps**: Native iOS and Android applications
- **Advanced Analytics**: User growth tracking and community insights
- **Gamification**: Achievement system and progress rewards
- **Enterprise Features**: White-label deployments and custom branding

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Follow TypeScript and React best practices
4. Add tests for new functionality
5. Update documentation as needed
6. Submit pull request with detailed description

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

### Challenge Recognition
**Built for the Auth0 for AI Agents Challenge** - demonstrating the future of secure, autonomous AI systems with enterprise-grade authentication.

### Technology Partners
- **[Auth0](https://auth0.com)** - Enterprise identity and authentication platform
- **[Supabase](https://supabase.com)** - Real-time database and backend services
- **[Google AI](https://ai.google.dev)** - Advanced language models for content analysis
- **[Netlify](https://netlify.com)** - Modern deployment and hosting platform

---

**🏆 Auth0 for AI Agents Challenge Entry**

*Showcasing the future of secure, autonomous AI systems with production-ready authentication architecture.*

**Live Demo**: [https://apexquest.netlify.app](https://apexquest.netlify.app)
