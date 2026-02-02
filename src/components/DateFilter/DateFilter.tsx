import type { ReactElement } from 'react';
import { Input } from '../ui/Input';
import {
  type PresetPeriod,
  type DateRange,
  getDateRange,
  navigateDateRange,
} from '../../utils/dates';
import './DateFilter.scss';

export interface DateFilterProps {
  presetPeriod: PresetPeriod;
  customStartDate: string;
  customEndDate: string;
  onPresetChange: (preset: PresetPeriod) => void;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  showNavigation?: boolean;
}

export const DateFilter = ({
  presetPeriod,
  customStartDate,
  customEndDate,
  onPresetChange,
  onStartDateChange,
  onEndDateChange,
  showNavigation = true,
}: DateFilterProps): ReactElement => {
  const handlePresetClick = (preset: PresetPeriod): void => {
    onPresetChange(preset);
    const range: DateRange | null = getDateRange(preset);
    if (range) {
      onStartDateChange(range.startDate);
      onEndDateChange(range.endDate);
    } else {
      onStartDateChange('');
      onEndDateChange('');
    }
  };

  const handleNavigate = (direction: 'prev' | 'next'): void => {
    const newRange: DateRange | null = navigateDateRange(presetPeriod, customStartDate, direction);
    if (newRange) {
      onStartDateChange(newRange.startDate);
      onEndDateChange(newRange.endDate);
    }
  };

  const isPresetActive = (preset: PresetPeriod): boolean => {
    if (preset === 'all') {
      return !customStartDate && !customEndDate;
    }
    const presetRange: DateRange | null = getDateRange(preset);
    return (
      presetRange?.startDate === customStartDate &&
      presetRange?.endDate === customEndDate
    );
  };

  return (
    <div className="date-filter">
      <div className="date-filter__preset-buttons">
        {(['week', 'month', 'year', 'all'] as PresetPeriod[]).map((preset) => (
          <button
            key={preset}
            type="button"
            className={`date-filter__preset-button ${
              isPresetActive(preset) ? 'date-filter__preset-button--active' : ''
            }`}
            onClick={() => handlePresetClick(preset)}
          >
            {preset.charAt(0).toUpperCase() + preset.slice(1)}
          </button>
        ))}
      </div>
      <div className="date-filter__date-pickers">
        <Input
          label="From"
          type="date"
          value={customStartDate}
          onChange={(e) => onStartDateChange(e.target.value)}
        />
        <Input
          label="To"
          type="date"
          value={customEndDate}
          onChange={(e) => onEndDateChange(e.target.value)}
        />
      </div>
      {showNavigation && (
        <div className="date-filter__navigation">
          <button
            type="button"
            className="date-filter__nav-button"
            onClick={() => handleNavigate('prev')}
            disabled={presetPeriod === 'all'}
          >
            Previous
          </button>
          <button
            type="button"
            className="date-filter__nav-button"
            onClick={() => handleNavigate('next')}
            disabled={presetPeriod === 'all'}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
