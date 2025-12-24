import worker, { handleHealthAPI, handleContactAPI } from '../worker';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the global fetch and console.error
global.fetch = vi.fn();
console.error = vi.fn();

const createMockRequest = (path: string, method: string, body?: any, headers?: any): Request => {
  const request = new Request(`https://lornu.ai${path}`, {
    method,
    headers: new Headers({ 'Content-Type': 'application/json', ...headers }),
    body: body ? JSON.stringify(body) : undefined,
  });
  return request;
};

const createMockEnv = (kv?: any, rateLimitConfig?: any): any => ({
  RESEND_API_KEY: 'test-key',
  RATE_LIMIT_KV: {
    get: vi.fn().mockResolvedValue(kv?.get),
    put: vi.fn(),
  },
  ASSETS: {
    fetch: vi.fn(),
  },
  ...rateLimitConfig,
});

describe('worker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleHealthAPI', () => {
    it('should return a 200 OK response', async () => {
      const response = await handleHealthAPI();
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual({ status: 'ok' });
    });
  });

  describe('handleContactAPI', () => {
    it('should send an email and return 200 on valid submission', async () => {
      (fetch as any).mockResolvedValue(new Response(JSON.stringify({ id: 'test-id' }), { status: 200 }));
      const env = createMockEnv();
      const request = createMockRequest('/api/contact', 'POST', {
        name: 'John Doe',
        email: 'john.doe@example.com',
        message: 'This is a test message.',
      });
      const response = await handleContactAPI(request, env);
      const responseBody = await response.json();
      expect(response.status).toBe(200);
      expect(responseBody).toEqual({ success: true, message: 'Message sent successfully' });
      expect(fetch).toHaveBeenCalledWith('https://api.resend.com/emails', expect.any(Object));
    });

    it('should return 405 for non-POST requests', async () => {
        const env = createMockEnv();
        const request = createMockRequest('/api/contact', 'GET');
        const response = await handleContactAPI(request, env);
        expect(response.status).toBe(405);
        const body = await response.json();
        expect(body).toEqual({ error: 'Method not allowed' });
    });

    it('should return 400 for invalid name', async () => {
      const env = createMockEnv();
      const request = createMockRequest('/api/contact', 'POST', { name: 'J', email: 'john.doe@example.com', message: 'This is a test message.' });
      const response = await handleContactAPI(request, env);
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body).toEqual({ error: 'Name must be at least 2 characters' });
    });

    it('should return 400 for invalid email', async () => {
      const env = createMockEnv();
      const request = createMockRequest('/api/contact', 'POST', { name: 'John Doe', email: 'invalid-email', message: 'This is a test message.' });
      const response = await handleContactAPI(request, env);
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body).toEqual({ error: 'Invalid email address' });
    });

    it('should return 400 for invalid message', async () => {
      const env = createMockEnv();
      const request = createMockRequest('/api/contact', 'POST', { name: 'John Doe', email: 'john.doe@example.com', message: 'short' });
      const response = await handleContactAPI(request, env);
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body).toEqual({ error: 'Message must be at least 10 characters' });
    });

    it('should return 429 when rate limit is exceeded', async () => {
        const env = createMockEnv(
            { get: JSON.stringify({ count: 5, resetAt: Date.now() + 1000 * 60 * 60 }) },
            { RATE_LIMIT_MAX_REQUESTS: '5' }
        );
        const request = createMockRequest('/api/contact', 'POST', { name: 'John Doe', email: 'john.doe@example.com', message: 'This is a test message.' });
        const response = await handleContactAPI(request, env);
        expect(response.status).toBe(429);
        const body = await response.json();
        expect(body).toEqual({ error: 'Too many requests. Please try again later.' });
    });

    it('should log the full error when sending email fails', async () => {
        const error = new Error('Network error');
        (fetch as any).mockRejectedValue(error);

        const env = createMockEnv();
        const request = createMockRequest('/api/contact', 'POST', {
            name: 'John Doe',
            email: 'john.doe@example.com',
            message: 'This is a test message.',
        });

        const response = await handleContactAPI(request, env);
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body).toEqual({ error: 'Failed to send email. Please try again later.' });

        expect(console.error).toHaveBeenCalledWith('Email sending error:', {
            message: 'Network error',
            stack: expect.any(String),
            error,
        });
    });
  });

  describe('SPA routing', () => {
    it('should serve index.html for extensionless routes', async () => {
        const env = createMockEnv();
        const request = createMockRequest('/some/path', 'GET');

        (env.ASSETS.fetch as any)
            .mockResolvedValueOnce(new Response('Not Found', { status: 404 }))
            .mockResolvedValueOnce(new Response('<html></html>', { status: 200, headers: { 'Content-Type': 'text/html' } }));

        const response = await worker.fetch(request, env);

        expect(response.status).toBe(200);
        expect(response.headers.get('Content-Type')).toBe('text/html;charset=UTF-8');
        expect(await response.text()).toBe('<html></html>');

        expect(env.ASSETS.fetch).toHaveBeenCalledWith(expect.objectContaining({ url: 'https://lornu.ai/some/path' }));
        expect(env.ASSETS.fetch).toHaveBeenCalledWith(expect.objectContaining({ url: 'https://lornu.ai/index.html' }));
    });
  });
});
