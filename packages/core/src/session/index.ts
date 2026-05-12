import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { AuthConfig, User } from '../interfaces';

export class SessionManager {
  private secret: Uint8Array;
  private expiresIn: string | number;

  constructor(private config: AuthConfig) {
    this.secret = new TextEncoder().encode(this.config.secret);
    this.expiresIn = this.config.session?.expiresIn || '7d';
  }

  async createToken(user: User): Promise<string> {
    const payload: JWTPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(this.expiresIn as any)
      .sign(this.secret);
  }

  async verifyToken(token: string): Promise<JWTPayload | null> {
    try {
      const { payload } = await jwtVerify(token, this.secret);
      return payload;
    } catch (e) {
      return null;
    }
  }
}
