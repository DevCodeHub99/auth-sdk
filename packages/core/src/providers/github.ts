import { OAuthProvider, OAuthConfig } from './oauth';

export class GitHubProvider extends OAuthProvider {
  id = 'github';
  name = 'GitHub';

  constructor(config: OAuthConfig) {
    super(config);
  }

  getAuthorizationUrl(): string {
    const url = new URL('https://github.com/login/oauth/authorize');
    url.searchParams.append('client_id', this.config.clientId);
    url.searchParams.append('redirect_uri', this.config.redirectUri);
    url.searchParams.append('scope', 'read:user user:email');
    return url.toString();
  }

  async getTokens(code: string): Promise<{ accessToken: string; idToken?: string; refreshToken?: string }> {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code,
        redirect_uri: this.config.redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch GitHub tokens');
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
    };
  }

  async getUserProfile(accessToken: string): Promise<{ id: string; email: string; name?: string; image?: string }> {
    const profileResponse = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/vnd.github.v3+json' },
    });

    if (!profileResponse.ok) {
      throw new Error('Failed to fetch GitHub user profile');
    }

    const profileData = await profileResponse.json();

    let email = profileData.email;
    if (!email) {
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/vnd.github.v3+json' },
      });
      if (emailResponse.ok) {
        const emails = await emailResponse.json();
        const primaryEmail = emails.find((e: any) => e.primary) || emails[0];
        if (primaryEmail) {
          email = primaryEmail.email;
        }
      }
    }

    return {
      id: profileData.id.toString(),
      email,
      name: profileData.name || profileData.login,
      image: profileData.avatar_url,
    };
  }
}
