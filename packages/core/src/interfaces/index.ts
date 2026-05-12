export interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  [key: string]: any;
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
}

export interface AuthConfig {
  secret: string;
  session?: {
    expiresIn?: string | number; // e.g. "1d", "7d", or seconds
  };
  providers?: Provider[];
  adapter?: DatabaseAdapter;
  emailAdapter?: EmailAdapter;
}

export interface DatabaseAdapter {
  createUser(data: any): Promise<User>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserById(id: string): Promise<User | null>;
  createSession?(userId: string, expiresAt: Date): Promise<Session>;
  getSession?(sessionId: string): Promise<Session | null>;
  deleteSession?(sessionId: string): Promise<void>;
  updateUser?(id: string, data: any): Promise<User>;
}

export interface EmailAdapter {
  sendVerificationEmail(email: string, token: string, url: string): Promise<void>;
  sendPasswordResetEmail(email: string, token: string, url: string): Promise<void>;
  sendMagicLinkEmail(email: string, token: string, url: string): Promise<void>;
}

export interface Provider {
  id: string;
  name: string;
  type: 'oauth' | 'credentials' | 'magic-link';
}
