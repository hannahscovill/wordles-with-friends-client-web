import { useEffect, useRef, useCallback, type ReactElement } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          'error-callback'?: () => void;
          'expired-callback'?: () => void;
          theme?: 'light' | 'dark' | 'auto';
        },
      ) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId: string) => void;
    };
  }
}

const TURNSTILE_SCRIPT_URL: string =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

export interface TurnstileProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
}

export const Turnstile = ({
  siteKey,
  onVerify,
  onError,
  onExpire,
}: TurnstileProps): ReactElement => {
  const containerRef: React.RefObject<HTMLDivElement | null> =
    useRef<HTMLDivElement>(null);
  const widgetIdRef: React.RefObject<string | null> = useRef<string | null>(
    null,
  );
  const onVerifyRef: React.RefObject<(token: string) => void> =
    useRef(onVerify);
  const onErrorRef: React.RefObject<(() => void) | undefined> = useRef(onError);
  const onExpireRef: React.RefObject<(() => void) | undefined> =
    useRef(onExpire);

  // Keep callback refs current inside an effect (not during render)
  useEffect((): void => {
    onVerifyRef.current = onVerify;
    onErrorRef.current = onError;
    onExpireRef.current = onExpire;
  }, [onVerify, onError, onExpire]);

  const renderWidget: () => void = useCallback((): void => {
    if (!containerRef.current || !window.turnstile || widgetIdRef.current) {
      return;
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: (token: string) => onVerifyRef.current(token),
      'error-callback': () => onErrorRef.current?.(),
      'expired-callback': () => onExpireRef.current?.(),
    });
  }, [siteKey]);

  useEffect((): (() => void) => {
    // If script is already loaded, render immediately
    if (window.turnstile) {
      renderWidget();
      return (): void => {
        if (widgetIdRef.current) {
          window.turnstile?.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        }
      };
    }

    // Check if script tag already exists
    const existing: Element | null = document.querySelector(
      `script[src="${TURNSTILE_SCRIPT_URL}"]`,
    );
    if (!existing) {
      const script: HTMLScriptElement = document.createElement('script');
      script.src = TURNSTILE_SCRIPT_URL;
      script.async = true;
      script.onload = (): void => renderWidget();
      document.head.appendChild(script);
    } else {
      // Script tag exists but hasn't loaded yet — poll for readiness
      const interval: ReturnType<typeof setInterval> = setInterval((): void => {
        if (window.turnstile) {
          clearInterval(interval);
          renderWidget();
        }
      }, 100);

      return (): void => {
        clearInterval(interval);
        if (widgetIdRef.current) {
          window.turnstile?.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        }
      };
    }

    return (): void => {
      if (widgetIdRef.current) {
        window.turnstile?.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [renderWidget]);

  return <div ref={containerRef} />;
};
