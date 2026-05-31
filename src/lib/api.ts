import type { ProgressState } from '../types';

const API_PATH = '/api/progress';
const SECRET = import.meta.env.VITE_APP_SECRET ?? '';

async function getJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  return response.json();
}

export async function fetchProgress(): Promise<ProgressState | null> {
  const response = await fetch(API_PATH, {
    headers: {
      'Content-Type': 'application/json',
      'X-App-Secret': SECRET
    }
  });

  if (!response.ok) {
    return null;
  }

  const payload = await getJson<{ success: boolean; data?: ProgressState }>(response);
  return payload.success && payload.data ? payload.data : null;
}

export async function submitProgress(state: ProgressState): Promise<boolean> {
  const response = await fetch(API_PATH, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-App-Secret': SECRET
    },
    body: JSON.stringify(state)
  });

  const payload = await getJson<{ success: boolean }>(response);
  return payload.success;
}
