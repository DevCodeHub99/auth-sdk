import { AuthConfig, User } from '../interfaces';
import { hashPassword, verifyPassword, generateToken } from '../utils/crypto';
import { SessionManager } from '../session';

export class AuthFlows {
  private sessionManager: SessionManager;

  constructor(private config: AuthConfig) {
    this.sessionManager = new SessionManager(config);
  }

  async register(email: string, password?: string, name?: string): Promise<{ user: User; token: string }> {
    if (!this.config.adapter) {
      throw new Error('Database adapter is required for registration.');
    }

    const existingUser = await this.config.adapter.getUserByEmail(email);
    if (existingUser) {
      throw new Error('User already exists.');
    }

    let passwordHash = undefined;
    if (password) {
      passwordHash = await hashPassword(password);
    }

    const user = await this.config.adapter.createUser({
      email,
      name,
      passwordHash,
      role: 'user' // Default role
    });

    const token = await this.sessionManager.createToken(user);
    return { user, token };
  }

  async login(email: string, password?: string): Promise<{ user: User; token: string }> {
    if (!this.config.adapter) {
      throw new Error('Database adapter is required for login.');
    }

    const user = await this.config.adapter.getUserByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials.');
    }

    if (password && user.passwordHash) {
      const isValid = await verifyPassword(password, user.passwordHash);
      if (!isValid) {
        throw new Error('Invalid credentials.');
      }
    }

    const token = await this.sessionManager.createToken(user);
    return { user, token };
  }

  async requestMagicLink(email: string, callbackUrl: string): Promise<void> {
    if (!this.config.adapter || !this.config.emailAdapter) {
      throw new Error('Database and Email adapters are required for magic links.');
    }

    let user = await this.config.adapter.getUserByEmail(email);
    if (!user) {
      // Auto-register on magic link if not exists, or throw depending on strategy.
      // We'll auto-register for ease of use.
      user = await this.config.adapter.createUser({ email, role: 'user' });
    }

    const token = generateToken(64);
    
    // Store token logic would go here (e.g. in a VerificationToken table via adapter)
    // For simplicity, we assume the adapter handles it if we extend the interface
    // Let's assume we pass it to the email adapter for now to build the URL.
    const url = `${callbackUrl}?token=${token}&email=${encodeURIComponent(email)}`;
    
    await this.config.emailAdapter.sendMagicLinkEmail(email, token, url);
  }
}
