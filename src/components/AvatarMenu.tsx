import {
  useState,
  useRef,
  useEffect,
  type ReactElement,
  type RefObject,
} from 'react';
import { Button } from './Button';
import './AvatarMenu.scss';

export interface AvatarMenuProps {
  /** URL for the avatar image */
  avatarSrc: string;
  /** Alt text for the avatar image */
  avatarAlt?: string;
  /** Handler for profile option click */
  onProfileClick?: () => void;
  /** Handler for log out option click */
  onLogOutClick?: () => void;
}

export const AvatarMenu = ({
  avatarSrc,
  avatarAlt = 'User avatar',
  onProfileClick,
  onLogOutClick,
}: AvatarMenuProps): ReactElement => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef: RefObject<HTMLDivElement | null> =
    useRef<HTMLDivElement>(null);
  const menuRef: RefObject<HTMLUListElement | null> =
    useRef<HTMLUListElement>(null);

  useEffect((): (() => void) => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return (): void => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  useEffect((): void => {
    if (isOpen && menuRef.current) {
      const firstItem: HTMLButtonElement | null =
        menuRef.current.querySelector<HTMLButtonElement>('.avatar-menu__item');
      firstItem?.focus();
    }
  }, [isOpen]);

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

  const handleItemClick = (handler?: () => void): void => {
    setIsOpen(false);
    handler?.();
  };

  return (
    <div className="avatar-menu" ref={containerRef}>
      <Button
        className="avatar-menu__trigger"
        size="s"
        imageUrl={avatarSrc}
        imageAlt={avatarAlt}
        aria-label="Open user menu"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => setIsOpen(!isOpen)}
      />
      {isOpen && (
        <ul
          className="avatar-menu__popover"
          role="menu"
          ref={menuRef}
          onKeyDown={handleKeyDown}
        >
          <li role="none">
            <button
              type="button"
              className="avatar-menu__item"
              role="menuitem"
              onClick={() => handleItemClick(onProfileClick)}
            >
              Profile
            </button>
          </li>
          <li role="none">
            <button
              type="button"
              className="avatar-menu__item"
              role="menuitem"
              onClick={() => handleItemClick(onLogOutClick)}
            >
              Log out
            </button>
          </li>
        </ul>
      )}
    </div>
  );
};
