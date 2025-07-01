# Dash Agent - Claude Documentation

## Project Overview

Dash Agent is a sophisticated AI application built on Cloudflare Workers with a React frontend. It provides a multi-model AI chat interface with support for various providers including OpenAI, Anthropic, and Workers AI.

### Key Features
- **Multi-Model Chat Interface**: Support for various AI providers through Cloudflare AI Gateway
- **Image Generation**: Integration with DALL-E, Flux, and other image generation models
- **Video Generation**: Support for Kling and other video generation services
- **File Management**: R2-based file storage and exploration
- **Team Collaboration**: Multi-user support with team management
- **Project Management**: Organize conversations and resources by project

## Architecture

### Tech Stack
- **Backend**: Cloudflare Workers with TypeScript
- **Frontend**: React with Vite, TypeScript, and Tailwind CSS
- **Storage**: 
  - R2 buckets for file/image storage
  - D1 database for persistent data
  - Durable Objects for stateful agents
- **AI Integration**: Cloudflare AI Gateway for provider abstraction

### Key Components
1. **Workers Environment** (src/server.ts)
   - Main entry point for the Worker
   - Handles routing and request processing
   - Integrates with Durable Objects for agent management

2. **Durable Objects** (configured in wrangler.jsonc)
   - Sequential, Routing, Parallel, Orchestrator, Evaluator patterns
   - Stateful agents with global addressing
   - Migration system for schema changes

3. **API Endpoints** (src/api/)
   - chat.ts - AI chat functionality
   - generate-image.ts, generate-video.ts - Media generation
   - files.ts, images.ts - File management
   - teams.ts, project.ts - Collaboration features
   - save-conversation.ts - Conversation persistence

## Development Guidelines

### Cursor Rules (.cursor/rules/)

The project includes extensive Cursor AI rules for different aspects:

1. **tools.mdc** - Adding new AI tools
   - Use the tool builder pattern
   - Tools can auto-execute or require confirmation
   - Example patterns for scheduling, database queries, etc.

2. **agents.mdc** - Working with Cloudflare Agents
   - Agent creation and lifecycle management
   - State management patterns
   - Communication between agents

3. **r2.mdc** - R2 Storage patterns
   - File upload/download patterns
   - Bucket management
   - Integration with Workers

4. **ai-gateway.mdc** - AI Gateway configuration
   - Provider configuration
   - Request routing
   - Analytics and logging

5. **durable-objects-migrations.mdc** - Critical migration guide
   - Safe patterns for modifying Durable Objects
   - Version management strategies
   - State preservation techniques

6. **calling-agents.mdc** - Agent communication
   - Named vs routed addressing
   - Creating agents on-the-fly
   - TypeScript patterns for agent calls

### Current Tasks (TO-DO.md)

**Priority:**
- Batch management implementation

**Unsorted:**
- UI enhancements
  - Add tools to UI
  - Support more model types (image, video, audio)
  - MCP (Model Context Protocol) integration
- Add "copy as markdown" button to chat interface
- Create schemas/routes for blob/storage metadata

## Configuration

### wrangler.jsonc
```json
{
  "name": "agents-main-v3",
  "main": "src/server.ts",
  "compatibility_date": "2025-05-16",
  "compatibility_flags": ["nodejs_compat", "nodejs_compat_populate_process_env"],
  "assets": {
    "directory": "dist",
    "not_found_handling": "single-page-application"
  },
  "r2_buckets": [
    { "binding": "IMAGE_BUCKET", "bucket_name": "sd-chat" },
    { "binding": "SCRAPES_BUCKET", "bucket_name": "scrapes" }
  ],
  "d1_databases": [
    { "binding": "DB", "database_name": "mulls-dash-db" }
  ],
  "durable_objects": {
    "bindings": [
      { "name": "sequential", "class_name": "Sequential" },
      { "name": "routing", "class_name": "Routing" },
      { "name": "parallel", "class_name": "Parallel" },
      { "name": "orchestrator", "class_name": "Orchestrator" },
      { "name": "evaluator", "class_name": "Evaluator" }
    ]
  }
}
```

## Testing

The project uses Vitest with Cloudflare's test environment:

```typescript
// tests/index.test.ts
import { env, createExecutionContext, waitOnExecutionContext } from "cloudflare:test";
import { describe, it, expect } from "vitest";
```

Key testing patterns:
- Use `cloudflare:test` for Worker environment simulation
- Test with execution context for async operations
- Mock environment bindings as needed

## API Patterns

### Chat API Example
```typescript
// Standard pattern for API endpoints
export async function handleChat(request: Request, env: Env) {
  // Validate request
  // Process with AI Gateway
  // Return streaming or JSON response
}
```

### File Management
- Upload to R2: Use multipart form data
- Download from R2: Stream response with proper headers
- List files: Query with pagination

## Deployment

### Commands
```bash
# Development
npm run dev

# Build frontend
npm run build

# Deploy to Cloudflare
npx wrangler deploy

# Run tests
npm test
```

### Environment Variables
Key variables configured in wrangler.jsonc:
- AI_GATEWAY_ACCOUNT_ID
- AI_GATEWAY_ID
- HOST
- CLOUDFLARE_EMAIL
- CLOUDFLARE_ACCOUNT_ID

## Best Practices

### Durable Objects
1. **Never modify existing classes** - Create new versions instead
2. **Always use migrations** when adding new Durable Objects
3. **Initialize state explicitly** in constructors
4. **Version your objects** (e.g., MyAgentV1, MyAgentV2)

### State Management
- Use Durable Objects for persistent, globally-addressable state
- Use D1 for relational data
- Use R2 for file/blob storage
- Cache frequently accessed data in Workers KV

### Error Handling
- Always handle edge cases in API endpoints
- Provide meaningful error messages
- Use proper HTTP status codes
- Log errors for debugging

### Security
- Validate all inputs
- Use authenticated gateways for production
- Implement rate limiting
- Sanitize file uploads

## Integration Points

### AI Providers (via AI Gateway)
- OpenAI
- Anthropic
- Workers AI
- Azure OpenAI
- HuggingFace
- Replicate

### Frontend Components
- Located in src/components/
- Reusable UI components in src/components/ui/
- Feature-specific components organized by domain

### Styling
- Tailwind CSS for utility-first styling
- Custom styles in src/index.css and src/styles/
- Component-specific styles co-located with components

## Monitoring and Debugging

- Observability enabled in wrangler.jsonc
- Use Cloudflare dashboard for logs and analytics
- AI Gateway provides request metrics and costs
- Wrangler tail for real-time log streaming

## Common Patterns

### Creating a New Feature
1. Add API endpoint in src/api/
2. Create frontend component in src/components/
3. Add route in src/pages/
4. Update types in src/lib/types.ts
5. Test with Vitest
6. Deploy with wrangler

### Adding a New AI Tool
1. Define tool in tools.ts using tool builder
2. Add execution handler if confirmation required
3. Update UI to display tool invocations
4. Test tool behavior thoroughly

### Modifying Durable Objects
1. Create new class version (never modify existing)
2. Add migration entry in wrangler.jsonc
3. Plan data migration strategy
4. Test thoroughly before deployment
5. Deploy with careful monitoring

## Claude Memories

### Project Interaction Guidelines
- Never change the model name in a project without being explicitly asked to