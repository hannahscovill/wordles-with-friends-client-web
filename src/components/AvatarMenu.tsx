import { useRef, type ReactElement, type RefObject } from 'react';
import { Popover } from './Popover';
import { Avatar } from './ui/Avatar';
import './AvatarMenu.scss';

export interface AvatarMenuProps {
  /** URL for the avatar image */
  avatarSrc: string;
  /** Alt text for the avatar image */
  avatarAlt?: string;
  /** Whether the user is logged in */
  isLoggedIn?: boolean;
  /** Whether the user is a game admin */
  isGameAdmin?: boolean;
  /** Handler for log in option click */
  onLogInClick?: () => void;
  /** Handler for profile option click */
  onProfileClick?: () => void;
  /** Handler for score history option click */
  onScoreHistoryClick?: () => void;
  /** Handler for game maker option click */
  onGameMakerClick?: () => void;
  /** Handler for log out option click */
  onLogOutClick?: () => void;
  /** Handler for report issue option click */
  onReportIssueClick?: () => void;
}

export const AvatarMenu = ({
  avatarSrc,
  avatarAlt = 'User avatar',
  isLoggedIn = false,
  isGameAdmin = false,
  onLogInClick,
  onProfileClick,
  onScoreHistoryClick,
  onGameMakerClick,
  onLogOutClick,
  onReportIssueClick,
}: AvatarMenuProps): ReactElement => {
  const menuRef: RefObject<HTMLUListElement | null> =
    useRef<HTMLUListElement>(null);

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLUListElement>,
  ): void => {
    const items: NodeListOf<HTMLButtonElement> | undefined =
      menuRef.current?.querySelectorAll<HTMLButtonElement>(
        '.avatar-menu__item',
      );
    if (!items) return;

    const currentIndex: number = Array.from(items).findIndex(
      (item: HTMLButtonElement): boolean => item === document.activeElement,
    );

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const nextIndex: number = (currentIndex + 1) % items.length;
      items[nextIndex].focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      const prevIndex: number =
        (currentIndex - 1 + items.length) % items.length;
      items[prevIndex].focus();
    }
  };

  const trigger: ReactElement = (
    <button
      type="button"
      className="avatar-menu__trigger"
      aria-label="User menu"
      aria-haspopup="menu"
    >
      <Avatar src={avatarSrc} alt={avatarAlt} size="s" />
    </button>
  );

  return (
    <Popover trigger={trigger}>
      <ul
        className="avatar-menu__list"
        role="menu"
        ref={menuRef}
        onKeyDown={handleKeyDown}
      >
        {isLoggedIn ? (
          <>
            <li role="none">
              <button
                type="button"
                className="avatar-menu__item"
                role="menuitem"
                onClick={onProfileClick}
              >
                Profile
              </button>
            </li>
            {isGameAdmin && (
              <li role="none">
                <button
                  type="button"
                  className="avatar-menu__item"
                  role="menuitem"
                  onClick={onGameMakerClick}
                >
                  Gamemaker
                </button>
              </li>
            )}
            <li role="none">
              <button
                type="button"
                className="avatar-menu__item"
                role="menuitem"
                onClick={onScoreHistoryClick}
              >
                Score History
              </button>
            </li>
            <li role="none">
              <button
                type="button"
                className="avatar-menu__item"
                role="menuitem"
                onClick={onReportIssueClick}
              >
                Feedback
              </button>
            </li>
            <li role="none">
              <button
                type="button"
                className="avatar-menu__item"
                role="menuitem"
                onClick={onLogOutClick}
              >
                Log out
              </button>
            </li>
          </>
        ) : (
          <li role="none">
            <button
              type="button"
              className="avatar-menu__item"
              role="menuitem"
              onClick={onLogInClick}
            >
              Log in
            </button>
          </li>
        )}
      </ul>
    </Popover>
  );
};
