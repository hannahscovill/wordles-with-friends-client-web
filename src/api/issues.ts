import { apiClient, authHeaders } from './client';

// ── Types ───────────────────────────────────────────────────────────

export type IssueType = 'bug' | 'feature' | 'question';

export interface IssueReport {
  issueType: IssueType;
  title: string;
  description: string;
  turnstileToken: string;
  /** Honeypot field — should always be empty for real users */
  website?: string;
  userAgent?: string;
  pageUrl?: string;
}

export interface IssueReportResponse {
  issueNumber: number;
  issueUrl: string;
}

// ── Client ──────────────────────────────────────────────────────────

export const submitIssueReport = async (
  report: IssueReport,
  token: string,
): Promise<IssueReportResponse> => {
  const response: { data: IssueReportResponse } =
    await apiClient.post<IssueReportResponse>('/issues', report, {
      headers: authHeaders(token),
    });
  return response.data;
};
