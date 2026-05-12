import { DatabaseAdapter, User, Session } from '@custom-auth/core';
import { eq } from 'drizzle-orm';

export interface DrizzleConfig {
  db: any;
  usersTable: any;
  sessionsTable?: any;
}

export class DrizzleAdapter implements DatabaseAdapter {
  private db: any;
  private usersTable: any;
  private sessionsTable: any;

  constructor(config: DrizzleConfig) {
    this.db = config.db;
    this.usersTable = config.usersTable;
    this.sessionsTable = config.sessionsTable;
  }

  async createUser(data: any): Promise<User> {
    const [user] = await this.db.insert(this.usersTable).values({
      email: data.email,
      name: data.name,
      passwordHash: data.passwordHash,
      role: data.role || 'user',
    }).returning();
    return user as User;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const [user] = await this.db.select().from(this.usersTable).where(eq(this.usersTable.email, email));
    return (user as User) || null;
  }

  async getUserById(id: string): Promise<User | null> {
    const [user] = await this.db.select().from(this.usersTable).where(eq(this.usersTable.id, id));
    return (user as User) || null;
  }

  async createSession(userId: string, expiresAt: Date): Promise<Session> {
    if (!this.sessionsTable) throw new Error('Sessions table not provided');
    const [session] = await this.db.insert(this.sessionsTable).values({
      userId,
      expiresAt,
    }).returning();
    return session as Session;
  }

  async getSession(sessionId: string): Promise<Session | null> {
    if (!this.sessionsTable) throw new Error('Sessions table not provided');
    const [session] = await this.db.select().from(this.sessionsTable).where(eq(this.sessionsTable.id, sessionId));
    return (session as Session) || null;
  }

  async deleteSession(sessionId: string): Promise<void> {
    if (!this.sessionsTable) throw new Error('Sessions table not provided');
    await this.db.delete(this.sessionsTable).where(eq(this.sessionsTable.id, sessionId));
  }

  async updateUser(id: string, data: any): Promise<User> {
    const [user] = await this.db.update(this.usersTable).set(data).where(eq(this.usersTable.id, id)).returning();
    return user as User;
  }
}
