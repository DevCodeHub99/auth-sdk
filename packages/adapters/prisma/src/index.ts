import { PrismaClient } from '@prisma/client';
import { DatabaseAdapter, User, Session } from '@custom-auth/core';

export class PrismaAdapter implements DatabaseAdapter {
  constructor(private prisma: PrismaClient) {}

  async createUser(data: any): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash: data.passwordHash,
        role: data.role || 'user',
      },
    });
    return user as unknown as User;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    return user ? (user as unknown as User) : null;
  }

  async getUserById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    return user ? (user as unknown as User) : null;
  }

  async createSession(userId: string, expiresAt: Date): Promise<Session> {
    const session = await this.prisma.session.create({
      data: {
        userId,
        expiresAt,
      },
    });
    return session as unknown as Session;
  }

  async getSession(sessionId: string): Promise<Session | null> {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });
    return session ? (session as unknown as Session) : null;
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.prisma.session.delete({
      where: { id: sessionId },
    });
  }

  async updateUser(id: string, data: any): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data,
    });
    return user as unknown as User;
  }
}
