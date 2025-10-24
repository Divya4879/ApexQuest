# 🏆 ApexQuest - Auth0 for AI Agents Challenge

> **A secure community platform with autonomous AI agents powered by Auth0 Machine-to-Machine authentication**

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=for-the-badge)](https://apexquest.netlify.app)
[![Auth0 Challenge](https://img.shields.io/badge/Auth0-AI%20Agents%20Challenge-orange?style=for-the-badge)](https://dev.to/challenges/auth0)

## 🎯 Challenge Overview

ApexQuest demonstrates **Auth0 for AI Agents** by implementing secure, autonomous AI agents that authenticate via Machine-to-Machine (M2M) credentials before performing actions. Each agent type has specific scopes and permissions, showcasing enterprise-grade security for AI systems.

### 🔐 Auth0 for AI Agents Implementation

- **✅ Authenticate the user**: Auth0 React SDK with role-based access
- **✅ Control the tools**: M2M scopes limit agent capabilities (`admin:manage`, `mod:warn`, `user:post`)
- **✅ Limit knowledge**: Role-based content access and agent permissions
- **✅ Secure agent authentication**: Each agent authenticates before every action

## 🚀 Features

### 🤖 Autonomous AI Agents
- **Admin Agent**: Autonomous user management and escalation handling
- **Moderator Agent**: AI-powered content analysis and moderation decisions
- **User Agent**: Secure content creation with authentication

### 🔒 Security & Authentication
- **Auth0 Integration**: User authentication with role-based access control
- **M2M Authentication**: Each agent type has dedicated Auth0 M2M applications
- **Scope-Based Permissions**: Fine-grained control over agent capabilities
- **Activity Logging**: Complete audit trail of agent actions and decisions

### 🏘️ Community Platform
- **Channel System**: Topic-based communities for personal growth
- **Content Management**: Posts, replies, likes with real-time updates
- **Moderation System**: Automated flagging, warnings, and banning
- **Notification System**: Real-time alerts for user interactions

### 🧠 AI-Powered Features
- **Content Analysis**: Gemini AI analyzes flagged content for severity
- **Autonomous Decisions**: Agents make moderation decisions based on AI analysis
- **Multi-Step Workflows**: Analyze → Decide → Act → Report
- **Escalation Handling**: Automatic escalation from moderator to admin agents

## 🛠️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Auth0 React SDK** for authentication

### Backend & Services
- **Supabase** for database and real-time features
- **Auth0** for user authentication and M2M agent credentials
- **Google Gemini AI** for content analysis
- **Netlify** for deployment

### Architecture
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
├── components/           # React components
│   ├── AgentActivityDashboard.tsx    # Auth0 agent activity monitor
│   ├── InteractiveAgent.tsx          # Autonomous agent interface
│   ├── PostCard.tsx                  # Content display with moderation
│   ├── NotificationBell.tsx          # Real-time notifications
│   └── ...
├── services/            # Business logic and integrations
│   ├── agentAuthService.ts           # Auth0 M2M authentication
│   ├── agenticModerationService.ts   # Autonomous AI moderation
│   ├── supabaseService.ts            # Database operations
│   ├── geminiService.ts              # AI content analysis
│   └── ...
├── pages/               # Application pages
│   ├── AgentPage.tsx                 # AI agent management
│   ├── HomePage.tsx                  # Main community feed
│   └── ...
├── sql/                 # Database schema and migrations
└── context/             # React context providers
```

## 🔧 Setup & Installation

### Prerequisites
- Node.js 18+
- Auth0 Account
- Supabase Account
- Google AI API Key

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/apexquest.git
cd apexquest
npm install
```

### 2. Auth0 Configuration

#### Create Auth0 Applications
1. **Regular Web Application** for user authentication
2. **Machine-to-Machine Applications** for AI agents:
   - `apexquest-admin-agent` with `admin:manage` scope
   - `apexquest-mod-agent` with `mod:warn` scope  
   - `apexquest-user-agent` with `user:post` scope

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

# AI Agents M2M
VITE_AUTH0_AGENTS_DOMAIN=your-domain.auth0.com
VITE_AUTH0_AGENTS_AUDIENCE=https://apexquest.com/api
VITE_ADMIN_AGENT_CLIENT_ID=admin-client-id
VITE_ADMIN_AGENT_CLIENT_SECRET=admin-client-secret
VITE_MOD_AGENT_CLIENT_ID=mod-client-id
VITE_MOD_AGENT_CLIENT_SECRET=mod-client-secret
VITE_USER_AGENT_CLIENT_ID=user-client-id
VITE_USER_AGENT_CLIENT_SECRET=user-client-secret

# Database & AI
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
-- Agent credentials
\i add-user-agent-credentials.sql
```

### 5. Run Development Server
```bash
npm run dev
```

## 🎮 Usage

### For Users
1. **Sign up/Login** with Auth0
2. **Select channels** for personal growth topics
3. **Create posts** about your progress
4. **Interact** with community content

### For Moderators
1. **Access Agent Page** (🤖 icon in sidebar)
2. **Use "🤖 Auto-Moderate"** on flagged content
3. **View agent decisions** in activity dashboard

### For Admins
1. **Use "👑 Admin Auto-Review"** for serious violations
2. **Manage users** through agent interface
3. **Monitor all agent activity** and decisions

## 🔍 Auth0 for AI Agents Demo

### Agent Authentication Flow
```typescript
// 1. Agent authenticates with Auth0 M2M
const token = await agentAuthService.authenticateAgent('mod');

// 2. Agent analyzes content with AI
const decision = await analyzeContentForModeration(content);

// 3. Agent executes decision autonomously
await executeModeratorDecision(decision);

// 4. Agent reports results
console.log(`Agent decision: ${decision.action} - ${decision.reasoning}`);
```

### Security Features
- **Token Caching**: Prevents unnecessary Auth0 calls
- **Scope Validation**: Each agent limited to specific actions
- **Activity Logging**: Complete audit trail
- **Error Handling**: Graceful fallbacks for auth failures

## 📊 Agent Types & Capabilities

| Agent Type | Auth0 Scope | Capabilities | Use Cases |
|------------|-------------|--------------|-----------|
| **Admin Agent** | `admin:manage` | Ban/unban users, escalation handling | Serious violations, repeat offenders |
| **Moderator Agent** | `mod:warn` | Content analysis, warnings, escalation | Automated content moderation |
| **User Agent** | `user:post` | Secure content creation | Post/reply authentication |

## 🏆 Challenge Requirements Met

### ✅ Authenticate the User
- Auth0 React SDK integration
- Role-based access control (user/moderator/admin)
- Secure login/logout flow

### ✅ Control the Tools
- M2M scopes limit agent capabilities
- Fine-grained permissions per agent type
- Token-based authorization for all agent actions

### ✅ Limit Knowledge
- Role-based content access
- Agents only see relevant data for their scope
- Hierarchical permission system

### ✅ Secure Agent Authentication
- Dedicated M2M applications per agent type
- Token validation before every action
- Complete activity logging and audit trail

## 🚀 Deployment

### Netlify Deployment
1. **Connect repository** to Netlify
2. **Set environment variables** in Netlify dashboard
3. **Deploy** with build command: `npm run build`

### Environment Configuration
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  SECRETS_SCAN_ENABLED = "false"
```

## 🔮 Future Enhancements

- **Multi-Agent Workflows**: Agents collaborating on complex tasks
- **Advanced AI Models**: Integration with multiple AI providers
- **Real-Time Monitoring**: Live agent activity dashboard
- **Custom Agent Training**: Domain-specific agent behaviors
- **Enterprise Features**: Advanced audit logs, compliance reporting

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Auth0** for providing secure authentication infrastructure
- **Supabase** for real-time database capabilities
- **Google AI** for content analysis capabilities
- **Netlify** for seamless deployment experience

---

**Built for the Auth0 for AI Agents Challenge** 🏆

*Demonstrating the future of secure, autonomous AI systems with enterprise-grade authentication.*
