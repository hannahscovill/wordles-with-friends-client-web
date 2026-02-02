import type { ReactElement, SelectHTMLAttributes } from 'react';
import './Select.scss';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'className'
> {
  /** Label text displayed above the select */
  label?: string;
  /** Options to display in the select */
  options: SelectOption[];
  /** Full width of container */
  fullWidth?: boolean;
}

export const Select = ({
  label,
  options,
  fullWidth = false,
  id,
  ...rest
}: SelectProps): ReactElement => {
  const selectId: string | undefined =
    id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div
      className={`select-wrapper ${fullWidth ? 'select-wrapper--full-width' : ''}`}
    >
      {label && (
        <label htmlFor={selectId} className="select-wrapper__label">
          {label}
        </label>
      )}
      <select id={selectId} className="select-wrapper__select" {...rest}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
