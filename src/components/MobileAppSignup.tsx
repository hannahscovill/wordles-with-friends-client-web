import { useState, type ReactElement, type FormEvent } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import {
  Button,
  Input,
  Spinner,
  HoneypotField,
  OptionToggle,
  OptionToggleGroup,
} from './ui';
import { Turnstile } from './Turnstile';
import {
  submitAuthenticatedMobileTestTrackSignup,
  submitAnonymousMobileTestTrackSignup,
  type MobileTestTrackSignupSource,
} from '../api/mobileTestTrackSignup';
import { analytics } from '../lib/analytics';
import './MobileAppSignup.scss';

export interface MobileAppSignupProps {
  /** Where this form is being rendered, for analytics/backend attribution */
  source: MobileTestTrackSignupSource;
  /** Called when the user dismisses the card. Omit to hide the dismiss control. */
  onDismiss?: () => void;
  /** Called after a successful signup submission */
  onSuccess?: () => void;
}

type SubmissionState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success' }
  | { status: 'error'; message: string };

const TURNSTILE_SITE_KEY: string = import.meta.env
  .PUBLIC_TURNSTILE_SITE_KEY as string;

const EMAIL_PATTERN: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const MobileAppSignup = ({
  source,
  onDismiss,
  onSuccess,
}: MobileAppSignupProps): ReactElement => {
  const { isAuthenticated, getAccessTokenSilently, user } = useAuth0();
  const userMetadata: Record<string, unknown> | undefined = (
    user as Record<string, unknown> | undefined
  )?.['wordles.dev/user_metadata'] as Record<string, unknown> | undefined;
  const hasOptedIntoBothPlatforms: boolean =
    userMetadata?.mobile_test_track_opt_in_ios === true &&
    userMetadata?.mobile_test_track_opt_in_android === true;
  const [email, setEmail] = useState<string>('');
  const [ios, setIos] = useState<boolean>(false);
  const [android, setAndroid] = useState<boolean>(false);
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const [platformError, setPlatformError] = useState<string | undefined>(
    undefined,
  );
  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  const [submission, setSubmission] = useState<SubmissionState>({
    status: 'idle',
  });

  const handleIosClick = (): void => {
    setIos((prev) => !prev);
    setPlatformError(undefined);
  };

  const handleAndroidClick = (): void => {
    setAndroid((prev) => !prev);
    setPlatformError(undefined);
  };

  const handleSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();

    if (!ios && !android) {
      setPlatformError('Select iOS, Android, or both.');
      return;
    }
    setPlatformError(undefined);

    if (!isAuthenticated) {
      if (!EMAIL_PATTERN.test(email)) {
        setEmailError('Enter a valid email address');
        return;
      }
      setEmailError(undefined);

      if (!turnstileToken) {
        setSubmission({
          status: 'error',
          message: 'Please complete the CAPTCHA.',
        });
        return;
      }
    }

    setSubmission({ status: 'submitting' });

    try {
      if (isAuthenticated) {
        const token: string = await getAccessTokenSilently();
        await submitAuthenticatedMobileTestTrackSignup({ ios, android }, token);
      } else {
        // Read the honeypot value directly from the form
        const form: HTMLFormElement = event.target as HTMLFormElement;
        const honeypotInput: HTMLInputElement | null = form.elements.namedItem(
          'website',
        ) as HTMLInputElement | null;
        const website: string = honeypotInput?.value ?? '';

        await submitAnonymousMobileTestTrackSignup({
          email,
          ios,
          android,
          turnstileToken,
          website,
        });
      }

      analytics.trackMobileTestTrackSignup({ source, ios, android });
      setSubmission({ status: 'success' });
      onSuccess?.();
    } catch (e: unknown) {
      setSubmission({
        status: 'error',
        message:
          e instanceof Error
            ? e.message
            : 'Something went wrong. Please try again.',
      });
    }
  };

  if (submission.status === 'success') {
    return (
      <div className="mobile-app-signup mobile-app-signup--success">
        <p className="mobile-app-signup__message">
          Thanks! We&apos;ll email you when the app is ready.
        </p>
      </div>
    );
  }

  if (hasOptedIntoBothPlatforms) {
    return (
      <div className="mobile-app-signup">
        {onDismiss && (
          <button
            type="button"
            className="mobile-app-signup__dismiss"
            aria-label="Dismiss"
            onClick={onDismiss}
          >
            &times;
          </button>
        )}
        <h2 className="mobile-app-signup__title">
          Wordles with Friends is coming to mobile
        </h2>
        <p className="mobile-app-signup__message">
          You&apos;ve requested to join both internal test tracks. We&apos;ll
          let you know the moment it&apos;s ready.
        </p>
      </div>
    );
  }

  return (
    <div className="mobile-app-signup">
      {onDismiss && (
        <button
          type="button"
          className="mobile-app-signup__dismiss"
          aria-label="Dismiss"
          onClick={onDismiss}
        >
          &times;
        </button>
      )}
      <h2 className="mobile-app-signup__title">
        Wordles with Friends is coming to mobile
      </h2>
      <p className="mobile-app-signup__message">
        We&apos;re building a native mobile app. Drop your email and we&apos;ll
        let you know the moment it&apos;s ready.
      </p>
      <form className="mobile-app-signup__form" onSubmit={handleSubmit}>
        <div className="mobile-app-signup__platforms">
          <span className="mobile-app-signup__platforms-label">
            Select your platform(s):
          </span>
          <OptionToggleGroup
            aria-label="Choose platform"
            error={Boolean(platformError)}
          >
            <OptionToggle selected={android} onClick={handleAndroidClick}>
              Android
            </OptionToggle>
            <OptionToggle selected={ios} onClick={handleIosClick}>
              iOS
            </OptionToggle>
          </OptionToggleGroup>
          {platformError && (
            <span className="mobile-app-signup__platforms-error">
              {platformError}
            </span>
          )}
        </div>

        {!isAuthenticated && (
          <>
            <Input
              type="text"
              inputMode="email"
              autoComplete="email"
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError(undefined);
              }}
              error={emailError}
              fullWidth
            />

            <HoneypotField id="mobile-app-signup-website" />

            <div className="mobile-app-signup__turnstile">
              <Turnstile
                siteKey={TURNSTILE_SITE_KEY}
                onVerify={setTurnstileToken}
                theme="light"
              />
            </div>
          </>
        )}

        {submission.status === 'error' && (
          <p className="mobile-app-signup__error">{submission.message}</p>
        )}
        <Button
          type="submit"
          size="s"
          variant="onLight"
          className="mobile-app-signup__submit"
          disabled={submission.status === 'submitting'}
        >
          {submission.status === 'submitting' ? (
            <Spinner size="small" label="Submitting" />
          ) : (
            'Notify Me'
          )}
        </Button>
      </form>
    </div>
  );
};
