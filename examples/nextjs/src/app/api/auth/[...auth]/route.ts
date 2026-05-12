import { createAuth, GoogleProvider, GitHubProvider } from '@custom-auth/core';
import { PrismaAdapter } from '@custom-auth/prisma';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const auth = createAuth({
  secret: process.env.AUTH_SECRET || 'super-secret',
  adapter: new PrismaAdapter(prisma),
  providers: [
    new GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/callback/google',
    }),
    new GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      redirectUri: process.env.GITHUB_REDIRECT_URI || 'http://localhost:3000/api/auth/callback/github',
    })
  ],
  session: {
    expiresIn: '7d'
  }
});

export async function GET(request: Request) {
  return auth.handleRequest(request);
}

export async function POST(request: Request) {
  return auth.handleRequest(request);
}
