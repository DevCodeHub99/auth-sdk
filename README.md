# Universal Auth SDK

A production-grade, plug-and-play custom authentication npm package built for any modern tech stack. 

The core logic is built on standard Web APIs (`Request` and `Response`), meaning it can seamlessly integrate into **Next.js (App Router), Express, Hono, SvelteKit, and more**.

## 🚀 Features

- **Framework Agnostic:** Built on standard Web APIs; runs anywhere.
- **Stateless Sessions:** Fast, secure session management using JWTs (`jose`).
- **Multiple Auth Flows:** 
  - Email/Password (hashed via `bcryptjs`)
  - Magic Links
  - OAuth (Built-in support for Google & GitHub)
- **Advanced Security:**
  - **Rate Limiting:** Built-in extensible rate limiter to prevent brute force attacks.
  - **MFA (Multi-Factor Authentication):** TOTP support using `speakeasy` and `qrcode`.
  - **RBAC (Role-Based Access Control):** Granular permission and role management.
- **Database Agnostic:** Plug-and-play database adapters. Includes `@custom-auth/prisma` out of the box.
- **TypeScript First:** Fully typed and bundled using `tsup`.

## 📦 Project Structure (Monorepo)

This project uses npm workspaces.

```
/
├── packages/
│   ├── core/           # The framework-agnostic auth engine
│   └── adapters/
│       └── prisma/     # The official Prisma database adapter
├── examples/
│   ├── nextjs/         # Next.js App Router implementation example
│   └── express/        # Node.js/Express implementation example
```

## 🛠 Installation

You can install the core SDK and the Prisma adapter:

```bash
npm install @custom-auth/core @custom-auth/prisma @prisma/client
```

## 💻 Usage Examples

### 1. Next.js (App Router)

Because Next.js Route Handlers use standard Web APIs, integration is seamless.

*File: `app/api/auth/[...auth]/route.ts`*
```typescript
import { createAuth, GoogleProvider, GitHubProvider } from '@custom-auth/core';
import { PrismaAdapter } from '@custom-auth/prisma';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const auth = createAuth({
  secret: process.env.AUTH_SECRET || 'super-secret',
  adapter: new PrismaAdapter(prisma),
  providers: [
    new GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: 'http://localhost:3000/api/auth/callback/google',
    }),
  ],
  session: { expiresIn: '7d' }
});

export async function GET(request: Request) {
  return auth.handleRequest(request);
}

export async function POST(request: Request) {
  return auth.handleRequest(request);
}
```

### 2. Express

For Node.js frameworks like Express, you simply adapt the node `req`/`res` objects into standard Web API objects.

*File: `src/index.ts`*
```typescript
import express, { Request, Response } from 'express';
import { createAuth } from '@custom-auth/core';
import { PrismaAdapter } from '@custom-auth/prisma';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

const auth = createAuth({
  secret: 'super-secret-express',
  adapter: new PrismaAdapter(prisma),
});

// Helper to adapt Express req to Web API Request
async function adaptRequest(req: Request): Promise<globalThis.Request> {
  const url = `http://${req.headers.host}${req.url}`;
  const init: RequestInit = {
    method: req.method,
    headers: req.headers as HeadersInit,
  };
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    init.body = JSON.stringify(req.body);
  }
  return new globalThis.Request(url, init);
}

app.all('/api/auth/*', async (req, res) => {
  const webRequest = await adaptRequest(req);
  const webResponse = await auth.handleRequest(webRequest);
  
  res.status(webResponse.status);
  webResponse.headers.forEach((value, key) => res.setHeader(key, value));
  res.send(await webResponse.text());
});

app.listen(3001, () => console.log('Express auth running on port 3001'));
```

## 🔒 Advanced Features

### Rate Limiting

The SDK includes an extensible Rate Limiter.

```typescript
import { RateLimiter, InMemoryRateLimitStore } from '@custom-auth/core';

const limiter = new RateLimiter(new InMemoryRateLimitStore());
const allowed = await limiter.check('user_ip_123', 5, 60000); // 5 requests per minute
```

### Role-Based Access Control (RBAC)

Easily configure static role hierarchies.

```typescript
import { RBACManager } from '@custom-auth/core';

const rbac = new RBACManager({
  roles: {
    admin: { permissions: ['delete:users', 'read:dashboard'] },
    user: { permissions: ['read:dashboard'] }
  }
});

const canDelete = rbac.hasPermission(user, 'delete:users');
```

## 🧑‍💻 Development

To build the packages locally:

```bash
npm install
npm run build
```

## License

MIT
