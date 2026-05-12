import { Provider } from '../interfaces';

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export abstract class OAuthProvider implements Provider {
  abstract id: string;
  abstract name: string;
  type: 'oauth' = 'oauth';

  constructor(protected config: OAuthConfig) {}

  abstract getAuthorizationUrl(): string;
  abstract getTokens(code: string): Promise<{ accessToken: string; idToken?: string; refreshToken?: string }>;
  abstract getUserProfile(accessToken: string): Promise<{ id: string; email: string; name?: string; image?: string }>;
}
