import axios from 'axios';

// ── Types ───────────────────────────────────────────────────────────

export type IssueType = 'bug' | 'feature' | 'question';

export interface IssueReport {
  issueType: IssueType;
  title: string;
  description: string;
  turnstileToken: string;
  /** Honeypot field — should always be empty for real users */
  website?: string;
}

export interface IssueReportResponse {
  issueNumber: number;
  issueUrl: string;
}

// ── Client ──────────────────────────────────────────────────────────

const ISSUE_PROXY_URL: string = import.meta.env
  .PUBLIC_ISSUE_PROXY_URL as string;

export const submitIssueReport = async (
  report: IssueReport,
): Promise<IssueReportResponse> => {
  const response: { data: IssueReportResponse } =
    await axios.post<IssueReportResponse>(`${ISSUE_PROXY_URL}`, report);
  return response.data;
};
