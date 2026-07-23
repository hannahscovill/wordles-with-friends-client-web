import type { ReactElement } from 'react';
import './HoneypotField.scss';

export interface HoneypotFieldProps {
  /** Element id, in case a form renders more than one honeypot field */
  id?: string;
}

/**
 * Hidden form field that only bots fill in. Read its value from the
 * form on submit and send it to the API as `website`.
 */
export const HoneypotField = ({
  id = 'website',
}: HoneypotFieldProps): ReactElement => {
  return (
    <div className="honeypot-field" aria-hidden="true">
      <label htmlFor={id}>Website</label>
      <input
        type="text"
        id={id}
        name="website"
        tabIndex={-1}
        autoComplete="off"
      />
    </div>
  );
};
