import { useState, useEffect, type ReactElement, type FormEvent } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import posthog from 'posthog-js';
import { Modal, Button, Input, Textarea, Spinner } from '../ui';
import { Turnstile } from '../Turnstile';
import { submitIssueReport, type IssueReportResponse } from '../../api/issues';
import './IssueReportModal.scss';

export interface IssueReportModalProps {
  /** Handler called when the modal should close */
  onClose: () => void;
}

type IssueType = 'bug' | 'feature' | 'question';

type SubmissionState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; issueUrl: string; issueNumber: number }
  | { status: 'error'; message: string };

interface IssueTypeOption {
  value: IssueType;
  label: string;
  emoji: string;
}

const ISSUE_TYPES: IssueTypeOption[] = [
  { value: 'bug', label: 'Bug Report', emoji: '' },
  { value: 'feature', label: 'Feature Request', emoji: '' },
  { value: 'question', label: 'Question', emoji: '' },
];

const TURNSTILE_SITE_KEY: string = import.meta.env
  .PUBLIC_TURNSTILE_SITE_KEY as string;

export const IssueReportModal = ({
  onClose,
}: IssueReportModalProps): ReactElement => {
  const { getAccessTokenSilently } = useAuth0();
  const [issueType, setIssueType] = useState<IssueType>('bug');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const [submission, setSubmission] = useState<SubmissionState>({
    status: 'idle',
  });
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
  }>({});

  // Prevent keyboard events from reaching the game while modal is open
  useEffect((): (() => void) => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      // Allow the event to work within the modal, but stop it from
      // propagating to window-level listeners (like the game keyboard)
      event.stopPropagation();

      // Close on Escape
      if (event.key === 'Escape') {
        onClose();
      }
    };

    // Use capture phase to intercept before it reaches window listeners
    document.addEventListener('keydown', handleKeyDown, true);
    return (): void => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [onClose]);

  const validate = (): boolean => {
    const newErrors: { title?: string; description?: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setSubmission({ status: 'submitting' });

    try {
      const token: string = await getAccessTokenSilently();

      // Read the honeypot value directly from the form
      const form: HTMLFormElement = event.target as HTMLFormElement;
      const honeypotInput: HTMLInputElement | null = form.elements.namedItem(
        'website',
      ) as HTMLInputElement | null;
      const website: string = honeypotInput?.value ?? '';

      const response: IssueReportResponse = await submitIssueReport(
        {
          issueType,
          title,
          description,
          turnstileToken,
          website,
          userAgent: navigator.userAgent,
          pageUrl: window.location.href,
          posthogSessionId: posthog.get_session_id(),
          clientEnvironmentName: import.meta.env.PUBLIC_ENVIRONMENT_NAME,
          clientCommitHash: import.meta.env.PUBLIC_COMMIT_HASH,
        },
        token,
      );

      setSubmission({
        status: 'success',
        issueUrl: response.issueUrl,
        issueNumber: response.issueNumber,
      });
    } catch {
      setSubmission({
        status: 'error',
        message: 'Failed to submit your report. Please try again.',
      });
    }
  };

  const handleBackdropClick = (
    event: React.MouseEvent<HTMLDivElement>,
  ): void => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (submission.status === 'success') {
    return (
      <div
        className="issue-report-modal-backdrop"
        onClick={handleBackdropClick}
      >
        <Modal>
          <div className="issue-report-modal">
            <div className="issue-report-modal__success">
              <h2 className="issue-report-modal__title">Thank you!</h2>
              <p>Your issue has been submitted successfully.</p>
              <a
                href={submission.issueUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="issue-report-modal__issue-link"
              >
                View Issue #{submission.issueNumber}
              </a>
            </div>
            <div className="issue-report-modal__actions issue-report-modal__actions--center">
              <Button
                type="button"
                size="s"
                variant="onLight"
                onClick={onClose}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  return (
    <div className="issue-report-modal-backdrop" onClick={handleBackdropClick}>
      <Modal>
        <form onSubmit={handleSubmit} className="issue-report-modal">
          <h2 className="issue-report-modal__title">Send Feedback</h2>

          {submission.status === 'error' && (
            <p className="issue-report-modal__error">{submission.message}</p>
          )}

          <div className="issue-report-modal__type-selector">
            <div className="issue-report-modal__type-options">
              {ISSUE_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  className={`issue-report-modal__type-option ${
                    issueType === type.value
                      ? 'issue-report-modal__type-option--selected'
                      : ''
                  }`}
                  onClick={() => setIssueType(type.value)}
                  aria-pressed={issueType === type.value}
                >
                  {type.emoji && (
                    <span className="issue-report-modal__type-emoji">
                      {type.emoji}
                    </span>
                  )}
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Title"
            placeholder="Brief summary"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title)
                setErrors((prev) => ({ ...prev, title: undefined }));
            }}
            error={errors.title}
            fullWidth
          />

          <Textarea
            label="Description"
            placeholder={
              issueType === 'bug'
                ? 'Describe what happened and what you expected to happen...'
                : issueType === 'feature'
                  ? 'Describe the feature you would like to see...'
                  : 'What would you like to know?'
            }
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errors.description)
                setErrors((prev) => ({ ...prev, description: undefined }));
            }}
            error={errors.description}
            rows={5}
            fullWidth
          />

          {/* Honeypot field — hidden from real users, bots will fill it */}
          <div className="issue-report-modal__honeypot" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input
              type="text"
              id="website"
              name="website"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div className="issue-report-modal__turnstile">
            <Turnstile
              siteKey={TURNSTILE_SITE_KEY}
              onVerify={setTurnstileToken}
            />
          </div>

          <div className="issue-report-modal__actions">
            <Button
              type="button"
              size="s"
              variant="onLight"
              onClick={onClose}
              disabled={submission.status === 'submitting'}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="s"
              variant="onLight"
              disabled={submission.status === 'submitting'}
            >
              {submission.status === 'submitting' ? (
                <Spinner size="small" label="Submitting" />
              ) : (
                'Submit'
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
