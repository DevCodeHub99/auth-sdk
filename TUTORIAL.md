# Universal Auth SDK - Developer Tutorial

Welcome to the **Universal Auth SDK**! This guide will walk you through setting up a complete, production-grade authentication system using Next.js (App Router), Prisma, Nodemailer, and our React Frontend SDK.

By the end of this tutorial, you will have a fully functional application with:
- Database-backed user and session management.
- Email verification and Magic Links.
- A React frontend with ready-to-use authentication hooks.

---

## 1. Installation

First, install the necessary packages. You will need the core SDK, your chosen database adapter, the email adapter, and the React frontend SDK.

```bash
npm install @custom-auth/core @custom-auth/react @custom-auth/prisma @custom-auth/nodemailer @prisma/client nodemailer
```

---

## 2. Setting up the Database (Prisma)

We will use Prisma as our ORM. Initialize Prisma in your project:

```bash
npx prisma init
```

Update your `prisma/schema.prisma` file with the required User and Session models:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id           String    @id @default(cuid())
  email        String    @unique
  name         String?
  passwordHash String?
  role         String    @default("user")
  sessions     Session[]
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  expiresAt DateTime
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

Run the database migration and generate the Prisma Client:

```bash
npx prisma db push
npx prisma generate
```

---

## 3. Configuring the Backend

Because the core SDK is framework-agnostic and relies on standard Web APIs (`Request` and `Response`), it integrates perfectly with Next.js App Router Route Handlers.

Create an API catch-all route at `app/api/auth/[...auth]/route.ts`:

```typescript
import { createAuth } from '@custom-auth/core';
import { PrismaAdapter } from '@custom-auth/prisma';
import { NodemailerAdapter } from '@custom-auth/nodemailer';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma
const prisma = new PrismaClient();

// Initialize the Auth SDK
const auth = createAuth({
  secret: process.env.AUTH_SECRET || 'super-secret-key-change-in-production',
  session: { expiresIn: '7d' },
  adapter: new PrismaAdapter(prisma),
  emailAdapter: new NodemailerAdapter({
    smtpOptions: {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    },
    fromAddress: 'noreply@yourdomain.com',
  }),
});

// Export standard Web API handlers for Next.js
export async function GET(request: Request) {
  return auth.handleRequest(request);
}

export async function POST(request: Request) {
  return auth.handleRequest(request);
}

// Required to prevent Next.js from attempting to statically generate this route
export const dynamic = 'force-dynamic';
```

Make sure to set your `.env` variables (`DATABASE_URL`, `AUTH_SECRET`, and `SMTP_*`).

---

## 4. Configuring the Frontend (React)

Now, let's wrap your application with the `AuthProvider` from the React SDK. This provides global session state to all your components.

If you are using Next.js App Router, do this in a Client Component, typically wrapping your `app/layout.tsx` children.

Create a file `components/Providers.tsx`:

```tsx
'use client';

import { AuthProvider } from '@custom-auth/react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider apiBaseUrl="/api/auth">
      {children}
    </AuthProvider>
  );
}
```

Then, use it in `app/layout.tsx`:

```tsx
import { Providers } from '../components/Providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

---

## 5. Using Authentication Hooks in your Components

The `@custom-auth/react` package provides convenient hooks to manage authentication state and perform actions.

### Displaying User Info & Sign Out

Create a `Profile.tsx` component:

```tsx
'use client';

import { useSession, useSignOut } from '@custom-auth/react';

export default function Profile() {
  const { user, isAuthenticated, isLoading } = useSession();
  const { signOut } = useSignOut();

  if (isLoading) return <p>Loading...</p>;

  if (!isAuthenticated) {
    return <p>You are not logged in.</p>;
  }

  return (
    <div>
      <h2>Welcome, {user?.email}</h2>
      <p>Role: {user?.role}</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
```

### Sign In Form

Create a `SignIn.tsx` component:

```tsx
'use client';

import { useState } from 'react';
import { useSignIn } from '@custom-auth/react';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, isLoading } = useSignIn();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // In a real app, hash the password strictly on the server.
      // For this SDK, the backend expects a hashed string or handles the plaintext based on configuration.
      await signIn(email, password);
      alert('Signed in successfully!');
    } catch (error) {
      alert('Sign in failed.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Signing In...' : 'Sign In'}
      </button>
    </form>
  );
}
```

---

## 6. Next Steps

Congratulations! You have successfully integrated the Universal Auth SDK.

Here are some recommended next steps for production:
1. **Secure Cookies:** Ensure your API route sets tokens as `HttpOnly`, `Secure` cookies.
2. **Rate Limiting:** Implement a Redis-backed rate limiter using the `RateLimiter` class.
3. **MFA:** Enable Multi-Factor Authentication for sensitive accounts.

For more advanced configurations and examples for Express or other frameworks, check out the `examples/` directory in the repository.
