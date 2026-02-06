import { expect, rs } from '@rstest/core';
import * as jestDomMatchers from '@testing-library/jest-dom/matchers';

// Set required env vars for tests
process.env.PUBLIC_API_URL = 'http://localhost:8080';

expect.extend(jestDomMatchers);

rs.mock('@auth0/auth0-react', () => ({
  useAuth0: (): {
    isAuthenticated: boolean;
    isLoading: boolean;
    error: null;
  } => ({
    isAuthenticated: false,
    isLoading: false,
    error: null,
  }),
}));

rs.mock('../src/contexts/UserProfileContext', () => ({
  useUserProfile: (): {
    profile: null;
    isLoading: boolean;
    refreshProfile: () => Promise<void>;
  } => ({
    profile: null,
    isLoading: false,
    refreshProfile: async (): Promise<void> => {},
  }),
}));
