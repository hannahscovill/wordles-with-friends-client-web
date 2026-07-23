import { useLocalStorage } from './useLocalStorage';
import { LATEST_WHATS_NEW_ID } from '../data/whatsNew';

const STORAGE_KEY: string = 'whats_new_last_seen_id';

export interface UseWhatsNewUnread {
  hasUnread: boolean;
  markAllSeen: () => void;
}

export const useWhatsNewUnread = (): UseWhatsNewUnread => {
  const [lastSeenId, setLastSeenId] = useLocalStorage<string>(STORAGE_KEY);

  return {
    hasUnread: lastSeenId !== LATEST_WHATS_NEW_ID,
    markAllSeen: (): void => setLastSeenId(LATEST_WHATS_NEW_ID),
  };
};
