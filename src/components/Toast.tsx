import {
  useEffect,
  useState,
  useRef,
  type ReactElement,
  type MutableRefObject,
} from 'react';
import './Toast.scss';

export interface ToastProps {
  message: string;
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

export const Toast = ({
  message,
  visible,
  onHide,
  duration = 1500,
}: ToastProps): ReactElement | null => {
  const [isHiding, setIsHiding] = useState<boolean>(false);
  const [shouldRender, setShouldRender] = useState<boolean>(false);
  const hideTimerRef: MutableRefObject<ReturnType<typeof setTimeout> | null> =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible && !shouldRender) {
      // Start showing - use setTimeout to avoid sync setState
      const showTimer: ReturnType<typeof setTimeout> = setTimeout((): void => {
        setShouldRender(true);
        setIsHiding(false);
      }, 0);
      return (): void => clearTimeout(showTimer);
    }

    if (visible && shouldRender) {
      // Schedule hide
      hideTimerRef.current = setTimeout((): void => {
        setIsHiding(true);
        // Wait for animation to complete before calling onHide
        setTimeout((): void => {
          setShouldRender(false);
          onHide();
        }, 150);
      }, duration);

      return (): void => {
        if (hideTimerRef.current) {
          clearTimeout(hideTimerRef.current);
        }
      };
    }

    return undefined;
  }, [visible, shouldRender, duration, onHide]);

  if (!shouldRender) return null;

  return (
    <div className="toast-container">
      <div className={`toast${isHiding ? ' toast--hiding' : ''}`} role="alert">
        {message}
      </div>
    </div>
  );
};
