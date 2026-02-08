import {
  WebTracerProvider,
  BatchSpanProcessor,
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

export const MAX_ATTR_LENGTH: number = 4096;

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + `... [truncated, ${str.length} bytes total]`;
}

export function initTelemetry(): void {
  const collectorUrl: string | undefined = import.meta.env
    .PUBLIC_OTEL_COLLECTOR_URL;
  const environmentName: string | undefined = import.meta.env
    .PUBLIC_ENVIRONMENT_NAME;

  if (!environmentName) {
    throw new Error(
      'PUBLIC_ENVIRONMENT_NAME is not set. ' +
        'Set it in .env for local development or via SSM for production builds.',
    );
  }

  if (collectorUrl) {
    const resource: Resource = resourceFromAttributes({
      [ATTR_SERVICE_NAME]: 'wordles-frontend',
      [ATTR_SERVICE_VERSION]:
        import.meta.env.PUBLIC_COMMIT_HASH ?? 'dev-0000000',
      'deployment.environment': environmentName,
    });

    const exporter: SpanExporter = new OTLPTraceExporter({
      url: collectorUrl,
    });

    const provider: WebTracerProvider = new WebTracerProvider({
      resource,
      spanProcessors: [new BatchSpanProcessor(exporter)],
    });
    provider.register({
      contextManager: new ZoneContextManager(),
    });

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
