/**
 * Safe API client for LumiLearn AI.
 * Handles network failures, non-JSON error payloads (such as Vercel 500 error pages),
 * and provides clear, actionable error diagnostics.
 */

export interface HealthCheckResult {
  status: string;
  service?: string;
  geminiKeyConfigured: boolean;
  environment?: string;
  error?: string;
}

export async function checkApiHealth(): Promise<HealthCheckResult> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) {
      return {
        status: 'error',
        geminiKeyConfigured: false,
        error: `HTTP ${res.status}: ${res.statusText}`
      };
    }
    const data = await res.json();
    return {
      status: data.status || 'ok',
      service: data.service,
      geminiKeyConfigured: Boolean(data.geminiKeyConfigured),
      environment: data.environment
    };
  } catch (err: any) {
    return {
      status: 'unreachable',
      geminiKeyConfigured: false,
      error: err?.message || 'Cannot reach API endpoint'
    };
  }
}

export async function postApiJson<T = any>(endpoint: string, body: any): Promise<T> {
  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
  } catch (netErr: any) {
    throw new Error(`Connection error: ${netErr.message || 'Unable to reach the server.'}`);
  }

  // If HTTP status is not 2xx
  if (!response.ok) {
    let errorMessage = `Server error (${response.status} ${response.statusText})`;
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      try {
        const errorJson = await response.json();
        errorMessage = errorJson.error || errorJson.message || errorMessage;
      } catch {
        const text = await response.text();
        if (text) errorMessage = text;
      }
    } else {
      const rawText = await response.text();
      if (
        rawText.includes('A server error') ||
        rawText.includes('FUNCTION_INVOCATION_FAILED') ||
        rawText.includes('An error occurred on the server') ||
        rawText.includes('Crash')
      ) {
        errorMessage = `Vercel Serverless Function error (${response.status}). If you already added GEMINI_API_KEY in Vercel Settings, note that Vercel requires you to click REDEPLOY for environment variable changes to take effect on your deployment.`;
      } else if (rawText) {
        const clean = rawText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        errorMessage = clean.length > 250 ? clean.slice(0, 250) + '...' : clean || errorMessage;
      }
    }
    throw new Error(errorMessage);
  }

  // Parse successful JSON
  try {
    return (await response.json()) as T;
  } catch {
    const rawText = await response.text();
    throw new Error(
      `Received non-JSON response from server: ${rawText ? rawText.slice(0, 150) : 'Empty response'}`
    );
  }
}
