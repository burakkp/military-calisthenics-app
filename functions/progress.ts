import type { ProgressState } from '../src/types';

const STORAGE_KEY = 'fitness:user';
const today = new Date().toISOString().split('T')[0];

type KVNamespaceLike = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
};

type ProgressEnv = {
  FITNESS_KV: KVNamespaceLike;
  APP_SECRET: string;
};

export const onRequest = async ({ request, env }: { request: Request; env: ProgressEnv }) => {
  const secret = env.APP_SECRET;
  const headerSecret = request.headers.get('X-App-Secret');

  if (!secret || headerSecret !== secret) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (request.method === 'GET') {
    const stored = await env.FITNESS_KV.get(STORAGE_KEY);
    const data: ProgressState = stored ? JSON.parse(stored) : {
      profile: { weight: 90, maxPushups: 10 },
      week: 1,
      streak: 0,
      longestStreak: 0,
      completed: { monday: false, wednesday: false, friday: false, sunday: false },
      notes: [],
      weightHistory: [{ date: today, value: 90 }],
      maxPushupHistory: [{ date: today, value: 10 }],
      lastSynced: null
    };

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (request.method === 'POST') {
    try {
      const payload = (await request.json()) as ProgressState;
      await env.FITNESS_KV.put(STORAGE_KEY, JSON.stringify(payload));

      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ success: false, error: 'Bad request' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' }
  });
};
