import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  type ReactElement,
  type ReactNode,
} from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import posthog from 'posthog-js';
import { getSessionCookie, clearSessionCookie } from '../api/session';
import { convertSession } from '../api/scorekeeper';

interface SessionConversionContextValue {
  isConverting: boolean;
}

const SessionConversionContext: React.Context<SessionConversionContextValue> =
  createContext<SessionConversionContextValue>({ isConverting: false });

export const SessionConversionProvider = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const hasConverted: React.MutableRefObject<boolean> = useRef<boolean>(false);

  useEffect(() => {
    if (!isAuthenticated || hasConverted.current) {
      return;
    }

    const sessionId: string | null = getSessionCookie();
    if (!sessionId) {
      return;
    }

    hasConverted.current = true;
    setIsConverting(true);

    const doConversion = async (): Promise<void> => {
      try {
        const token: string = await getAccessTokenSilently();
        const result: Awaited<ReturnType<typeof convertSession>> =
          await convertSession(sessionId, token);

        posthog.capture('session_converted', {
          games_converted: result.converted,
          conflicts_resolved: result.conflicts_resolved,
        });
      } catch (e: unknown) {
        console.error('Session conversion failed:', e);
      } finally {
        clearSessionCookie();
        setIsConverting(false);
      }
    };

    doConversion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  return (
    <SessionConversionContext.Provider value={{ isConverting }}>
      {children}
    </SessionConversionContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSessionConversion = (): SessionConversionContextValue => {
  return useContext(SessionConversionContext);
};
