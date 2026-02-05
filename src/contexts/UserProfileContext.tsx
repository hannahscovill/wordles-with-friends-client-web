import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactElement,
  type ReactNode,
} from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { getUserProfile, type UserProfile } from '../api';

interface UserProfileContextValue {
  profile: UserProfile | null;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
}

const UserProfileContext: React.Context<UserProfileContextValue | null> =
  createContext<UserProfileContextValue | null>(null);

export const UserProfileProvider = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfile: () => Promise<void> =
    useCallback(async (): Promise<void> => {
      if (!isAuthenticated) {
        setProfile(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const token: string = await getAccessTokenSilently();
        const data: UserProfile | null = await getUserProfile(token);
        setProfile(data);
      } catch {
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    }, [isAuthenticated, getAccessTokenSilently]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const refreshProfile: () => Promise<void> =
    useCallback(async (): Promise<void> => {
      if (!isAuthenticated) {
        return;
      }

      try {
        const token: string = await getAccessTokenSilently();
        const data: UserProfile | null = await getUserProfile(token);
        setProfile(data);
      } catch {
        // Keep existing profile on refresh failure
      }
    }, [isAuthenticated, getAccessTokenSilently]);

  return (
    <UserProfileContext.Provider value={{ profile, isLoading, refreshProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useUserProfile = (): UserProfileContextValue => {
  const context: UserProfileContextValue | null =
    useContext(UserProfileContext);
  if (context === null) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};
