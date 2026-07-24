import { useEffect, type ReactElement } from 'react';
import { WHATS_NEW_ENTRIES, type WhatsNewEntry } from '../data/whatsNew';
import { useWhatsNewUnread } from '../hooks/useWhatsNewUnread';
import { MobileAppSignup } from '../components/MobileAppSignup';
import './WhatsNewPage.scss';

export const WhatsNewPage = (): ReactElement => {
  const { markAllSeen } = useWhatsNewUnread();

  useEffect(() => {
    markAllSeen();
    // Only needs to run once, when the page is actually viewed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="whats-new-page">
      <h1 className="whats-new-page__title">What&apos;s New</h1>
      <ul className="whats-new-page__list">
        {WHATS_NEW_ENTRIES.map(
          (entry: WhatsNewEntry): ReactElement => (
            <li key={entry.id} className="whats-new-page__entry">
              {entry.id === '2026-07-mobile-app' ? (
                <MobileAppSignup source="whats_new_page" />
              ) : (
                <>
                  <h2 className="whats-new-page__entry-title">{entry.title}</h2>
                  <p className="whats-new-page__entry-body">{entry.body}</p>
                </>
              )}
            </li>
          ),
        )}
      </ul>
    </div>
  );
};
