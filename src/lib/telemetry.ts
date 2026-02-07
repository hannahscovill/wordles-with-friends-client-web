import {
  WebTracerProvider,
  BatchSpanProcessor,
  type ReadableSpan,
  type SpanProcessor,
} from '@opentelemetry/sdk-trace-web';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import {
  resourceFromAttributes,
  type Resource,
} from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import type { SpanExporter } from '@opentelemetry/sdk-trace-base';
import {
  trace,
  SpanStatusCode,
  type Tracer,
  type Span,
} from '@opentelemetry/api';

interface PendingBody {
  requestBody?: string;
  responseBody?: string;
  timestamp: number;
}

// Truncate large payloads to avoid bloating traces
function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + `... [truncated, ${str.length} bytes total]`;
}

// Store to pass request/response bodies to span attributes
// Key: URL + timestamp, Value: { requestBody, responseBody, timestamp }
const pendingBodies: Map<string, PendingBody> = new Map();

// Clean up old entries (older than 30 seconds)
function cleanupPendingBodies(): void {
  const now: number = Date.now();
  for (const [key, value] of pendingBodies) {
    if (now - value.timestamp > 30000) {
      pendingBodies.delete(key);
    }
  }
}

// Get the URL from a fetch input
function getUrlFromInput(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.href;
  if (input instanceof Request) return input.url;
  return String(input);
}

// Wrap fetch to capture request/response bodies before OTel instrumentation consumes the streams
function wrapFetchForBodyCapture(): void {
  const originalFetch: typeof window.fetch = window.fetch;

  window.fetch = async function (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> {
    const url: string = getUrlFromInput(input);
    const timestamp: number = Date.now();
    // Use URL + timestamp as a key (handles concurrent requests to same URL)
    const requestKey: string = `${url}|${timestamp}`;

    // Capture request body
    let requestBody: string | undefined;
    if (init?.body) {
      if (typeof init.body === 'string') {
        requestBody = init.body;
      } else if (init.body instanceof FormData) {
        requestBody = '[FormData]';
      } else if (init.body instanceof URLSearchParams) {
        requestBody = init.body.toString();
      } else if (init.body instanceof Blob) {
        requestBody = `[Blob: ${init.body.size} bytes]`;
      } else if (init.body instanceof ArrayBuffer) {
        requestBody = `[ArrayBuffer: ${init.body.byteLength} bytes]`;
      } else {
        try {
          requestBody = JSON.stringify(init.body);
        } catch {
          requestBody = '[Unserializable body]';
        }
      }
    }

    // Store request body for later retrieval
    pendingBodies.set(requestKey, { requestBody, timestamp });

    // Cleanup old entries periodically
    if (pendingBodies.size > 50) {
      cleanupPendingBodies();
    }

    const response: Response = await originalFetch.call(this, input, init);

    // Clone response to read body without consuming the original
    const clonedResponse: Response = response.clone();

    // Read response body asynchronously and store it
    clonedResponse
      .text()
      .then((text: string) => {
        const entry: PendingBody | undefined = pendingBodies.get(requestKey);
        if (entry) {
          entry.responseBody = text;
        }
      })
      .catch(() => {
        // Ignore errors reading response body
      });

    return response;
  };
}

// Find and remove the matching pending body entry for a given URL (within time tolerance)
function findAndRemovePendingBody(url: string): PendingBody | undefined {
  // Look for entries with matching URL (within last 5 seconds)
  const now: number = Date.now();
  for (const [key, value] of pendingBodies) {
    const [entryUrl] = key.split('|');
    if (entryUrl === url && now - value.timestamp < 5000) {
      pendingBodies.delete(key);
      return value;
    }
  }
  return undefined;
}

// SpanProcessor that adds request/response body attributes to fetch spans
class BodyCaptureSpanProcessor implements SpanProcessor {
  onStart(): void {
    // No-op on start
  }

  onEnd(span: ReadableSpan): void {
    // Only process fetch spans
    if (
      span.instrumentationScope.name !== '@opentelemetry/instrumentation-fetch'
    ) {
      return;
    }

    // Get URL from span attributes
    const url: string | undefined = span.attributes['http.url'] as
      | string
      | undefined;
    if (!url) {
      return;
    }

    // ReadableSpan is read-only, but we mutate the underlying attributes object
    // before BatchSpanProcessor exports it
    const mutableSpan: { attributes: Record<string, unknown> } =
      span as unknown as { attributes: Record<string, unknown> };

    // Detect likely CORS errors: cross-origin + status 0 + "Failed to fetch"
    const statusCode: number =
      (span.attributes['http.status_code'] as number) ?? -1;
    const statusText: string =
      (span.attributes['http.status_text'] as string) ?? '';
    if (statusCode === 0 && statusText === 'Failed to fetch') {
      try {
        const requestOrigin: string = new URL(url).origin;
        const pageOrigin: string = globalThis.location?.origin ?? '';
        if (requestOrigin !== pageOrigin) {
          mutableSpan.attributes['http.error.likely_cause'] = 'CORS';
          mutableSpan.attributes['http.error.note'] =
            `Cross-origin request to ${requestOrigin} blocked. ` +
            `The server likely isn't returning the required Access-Control-Allow-Origin header.`;
        } else {
          mutableSpan.attributes['http.error.likely_cause'] = 'network';
          mutableSpan.attributes['http.error.note'] =
            'Same-origin request failed. Server may be down or unreachable.';
        }
      } catch {
        // URL parsing failed, skip
      }
    }

    // Find matching body data
    const bodies: PendingBody | undefined = findAndRemovePendingBody(url);
    if (bodies) {
      if (bodies.requestBody) {
        mutableSpan.attributes['http.request.body'] = truncate(
          bodies.requestBody,
          4096,
        );
      }
      if (bodies.responseBody) {
        mutableSpan.attributes['http.response.body'] = truncate(
          bodies.responseBody,
          4096,
        );
      }
    }
  }

  shutdown(): Promise<void> {
    return Promise.resolve();
  }

  forceFlush(): Promise<void> {
    return Promise.resolve();
  }
}

export function initTelemetry(): void {
  const collectorUrl: string | undefined = import.meta.env
    .PUBLIC_OTEL_COLLECTOR_URL;

  // Wrap fetch before OTel instrumentation to capture request/response bodies
  wrapFetchForBodyCapture();

  // Initialize OpenTelemetry if collector URL is configured
  if (collectorUrl) {
    const resource: Resource = resourceFromAttributes({
      [ATTR_SERVICE_NAME]: 'wordles-frontend',
      [ATTR_SERVICE_VERSION]: import.meta.env.PUBLIC_APP_VERSION ?? 'dev',
      'deployment.environment':
        import.meta.env.PUBLIC_ENVIRONMENT_NAME ?? 'local',
    });

    const exporter: SpanExporter = new OTLPTraceExporter({
      url: collectorUrl,
    });

    const provider: WebTracerProvider = new WebTracerProvider({
      resource,
      spanProcessors: [
        new BodyCaptureSpanProcessor(),
        new BatchSpanProcessor(exporter),
      ],
    });
    provider.register({
      contextManager: new ZoneContextManager(),
    });

    // Auto-instrument fetch - adds traceparent header automatically
    registerInstrumentations({
      instrumentations: [
        new FetchInstrumentation({
          propagateTraceHeaderCorsUrls: [
            /localhost/,
            /api\.wordles\.dev/,
            new RegExp(
              import.meta.env.PUBLIC_API_URL?.replace(/https?:\/\//, '') ?? '',
            ),
          ],
        }),
      ],
    });

    console.log('[telemetry] OpenTelemetry initialized');
  }

  // Register global error handlers regardless of collector URL
  // so reportError() calls from ErrorBoundary always work
  window.addEventListener('error', (event: ErrorEvent) => {
    reportError(event.error ?? new Error(event.message), {
      'error.source': 'window.onerror',
    });
  });

  window.addEventListener(
    'unhandledrejection',
    (event: PromiseRejectionEvent) => {
      const error: Error =
        event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason));
      reportError(error, { 'error.source': 'unhandledrejection' });
    },
  );
}

export function reportError(
  error: Error,
  attributes?: Record<string, string>,
): void {
  const tracer: Tracer = trace.getTracer('wordles-frontend');
  const span: Span = tracer.startSpan('error');

  span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
  span.recordException(error);

  if (attributes) {
    span.setAttributes(attributes);
  }

  span.end();
}
