export interface Env {
  ASSETS: {
    fetch: (request: Request | string) => Promise<Response>;
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Health check endpoint for Cloudflare Workers monitoring
    if (url.pathname === '/api/health') {
      return new Response(
        JSON.stringify({
          status: 'ok',
          service: 'cloudflare-worker',
          timestamp: new Date().toISOString(),
        }),
        {
          headers: {
            'content-type': 'application/json; charset=UTF-8',
            'cache-control': 'no-cache',
          },
        }
      );
    }

    // Serve static assets from dist/ with SPA fallback handled by ASSETS binding
    return await env.ASSETS.fetch(request);
  },
};
