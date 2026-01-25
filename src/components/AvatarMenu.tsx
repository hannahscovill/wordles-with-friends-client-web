import { useRef, type ReactElement, type RefObject } from 'react';
import { Button } from './Button';
import './AvatarMenu.scss';

export interface AvatarMenuProps {
  /** URL for the avatar image */
  avatarSrc: string;
  /** Alt text for the avatar image */
  avatarAlt?: string;
  /** Whether the user is logged in */
  isLoggedIn?: boolean;
  /** Handler for log in option click */
  onLogInClick?: () => void;
  /** Handler for profile option click */
  onProfileClick?: () => void;
  /** Handler for log out option click */
  onLogOutClick?: () => void;
}

export const AvatarMenu = ({
  avatarSrc,
  avatarAlt = 'User avatar',
  isLoggedIn = false,
  onLogInClick,
  onProfileClick,
  onLogOutClick,
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

  return (
    <div className="avatar-menu">
      <Button
        className="avatar-menu__trigger"
        size="s"
        imageUrl={avatarSrc}
        imageAlt={avatarAlt}
        aria-label="User menu"
        aria-haspopup="menu"
      />
      <ul
        className="avatar-menu__popover"
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
    </div>
  );
};
