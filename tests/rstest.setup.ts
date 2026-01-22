import { expect, rs } from '@rstest/core';
import * as jestDomMatchers from '@testing-library/jest-dom/matchers';

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
