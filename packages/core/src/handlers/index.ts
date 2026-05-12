import { AuthConfig } from '../interfaces';
import { AuthFlows } from '../flows';

export class CustomAuth {
  private flows: AuthFlows;

  constructor(private config: AuthConfig) {
    this.flows = new AuthFlows(config);
  }

  async handleRequest(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const pathname = url.pathname;
    const method = req.method;

    if (method === 'POST') {
      if (pathname.endsWith('/register')) {
        return this.handleRegister(req);
      }
      if (pathname.endsWith('/login')) {
        return this.handleLogin(req);
      }
      if (pathname.endsWith('/magic-link')) {
        return this.handleMagicLink(req);
      }
    }

    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
  }

  private async handleRegister(req: Request): Promise<Response> {
    try {
      const { email, password, name } = await req.json();
      const result = await this.flows.register(email, password, name);
      return new Response(JSON.stringify(result), { status: 201, headers: { 'Content-Type': 'application/json' } });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
  }

  private async handleLogin(req: Request): Promise<Response> {
    try {
      const { email, password } = await req.json();
      const result = await this.flows.login(email, password);
      return new Response(JSON.stringify(result), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
  }

  private async handleMagicLink(req: Request): Promise<Response> {
    try {
      const { email, callbackUrl } = await req.json();
      await this.flows.requestMagicLink(email, callbackUrl);
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
  }
}

export function createAuth(config: AuthConfig) {
  return new CustomAuth(config);
}
