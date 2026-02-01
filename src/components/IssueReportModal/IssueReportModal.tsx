import { useState, type ReactElement, type FormEvent } from 'react';
import { Modal, Button, Input, Textarea } from '../ui';
import './IssueReportModal.scss';

export interface IssueReportModalProps {
  /** Handler called when the modal should close */
  onClose: () => void;
}

type IssueType = 'bug' | 'feature' | 'question';

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

const GITHUB_REPO_URL: string =
  'https://github.com/hannahscovill/wordles-with-friends-client-web';

const buildIssueUrl = (
  issueType: IssueType,
  title: string,
  description: string,
): string => {
  const typeOption: IssueTypeOption | undefined = ISSUE_TYPES.find(
    (t: IssueTypeOption): boolean => t.value === issueType,
  );
  const prefix: string = typeOption ? `[${typeOption.label}] ` : '';
  const fullTitle: string = `${prefix}${title}`;

  const bodyParts: string[] = [];

  if (issueType === 'bug') {
    bodyParts.push('## Description');
    bodyParts.push(description);
    bodyParts.push('');
    bodyParts.push('## Steps to Reproduce');
    bodyParts.push('1. ');
    bodyParts.push('2. ');
    bodyParts.push('3. ');
    bodyParts.push('');
    bodyParts.push('## Expected Behavior');
    bodyParts.push('');
    bodyParts.push('## Actual Behavior');
    bodyParts.push('');
    bodyParts.push('## Environment');
    bodyParts.push(`- Browser: ${navigator.userAgent}`);
    bodyParts.push(`- URL: ${window.location.href}`);
  } else if (issueType === 'feature') {
    bodyParts.push('## Feature Description');
    bodyParts.push(description);
    bodyParts.push('');
    bodyParts.push('## Use Case');
    bodyParts.push('');
    bodyParts.push('## Proposed Solution');
    bodyParts.push('');
  } else {
    bodyParts.push('## Question');
    bodyParts.push(description);
  }

  const body: string = bodyParts.join('\n');

  const params: URLSearchParams = new URLSearchParams({
    title: fullTitle,
    body: body,
  });

  if (issueType === 'bug') {
    params.append('labels', 'bug');
  } else if (issueType === 'feature') {
    params.append('labels', 'enhancement');
  } else {
    params.append('labels', 'question');
  }

  return `${GITHUB_REPO_URL}/issues/new?${params.toString()}`;
};

export const IssueReportModal = ({
  onClose,
}: IssueReportModalProps): ReactElement => {
  const [issueType, setIssueType] = useState<IssueType>('bug');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
  }>({});

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

  const handleSubmit = (event: FormEvent): void => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const issueUrl: string = buildIssueUrl(issueType, title, description);
    window.open(issueUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  const handleBackdropClick = (
    event: React.MouseEvent<HTMLDivElement>,
  ): void => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="issue-report-modal-backdrop"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      <Modal>
        <form onSubmit={handleSubmit} className="issue-report-modal">
          <h2 className="issue-report-modal__title">Report an Issue</h2>

          <div className="issue-report-modal__type-selector">
            <span className="issue-report-modal__type-label">Issue Type</span>
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
                  <span className="issue-report-modal__type-emoji">
                    {type.emoji}
                  </span>
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Title"
            placeholder="Brief summary of the issue"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
            onChange={(e) => setDescription(e.target.value)}
            error={errors.description}
            rows={5}
            fullWidth
          />

          <p className="issue-report-modal__note">
            This will open GitHub where you can review and submit the issue.
          </p>

          <div className="issue-report-modal__actions">
            <Button type="button" size="s" variant="onLight" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="s" variant="onLight">
              Continue to GitHub
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
