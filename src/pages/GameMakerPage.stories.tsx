import type { Meta, StoryObj } from '@storybook/react';
import { useState, type ReactElement } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import type { Puzzle } from '../api/puzzle';
import './GameMakerPage.scss';

interface WeekDay {
  date: string;
  displayDate: string;
  dayName: string;
  puzzle?: Puzzle;
}

const formatDisplayDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const getDayName = (date: Date): string => {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

/**
 * GameMakerPage story component - renders the week view without Auth0
 */
const GameMakerPageStory = ({
  weekDays,
  weekLabel,
}: {
  weekDays: WeekDay[];
  weekLabel: string;
}): ReactElement => {
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [word, setWord] = useState<string>('');

  const handleSetAnswer = (date: string): void => {
    setEditingDate(date);
    setWord('');
  };

  const handleCloseModal = (): void => {
    setEditingDate(null);
    setWord('');
  };

  return (
    <div className="gamemaker-page">
      <h2 className="gamemaker-page__title">Game Maker</h2>

      <div className="gamemaker-page__week-nav">
        <Button size="s" onClick={() => {}}>
          Previous
        </Button>
        <span className="gamemaker-page__week-label">{weekLabel}</span>
        <Button size="s" onClick={() => {}}>
          Next
        </Button>
      </div>

      <div className="gamemaker-page__week-table">
        <div className="gamemaker-page__week-header">
          <span>Day</span>
          <span>Date</span>
          <span>Answer</span>
        </div>
        {weekDays.map((day) => (
          <div key={day.date} className="gamemaker-page__week-row">
            <span className="gamemaker-page__day-name">{day.dayName}</span>
            <span className="gamemaker-page__date">{day.displayDate}</span>
            <span className="gamemaker-page__answer">
              {day.puzzle ? (
                <span className="gamemaker-page__word">{day.puzzle.word}</span>
              ) : (
                <Button size="s" onClick={() => handleSetAnswer(day.date)}>
                  Set Answer
                </Button>
              )}
            </span>
          </div>
        ))}
      </div>

      {editingDate && (
        <Modal>
          <div className="gamemaker-page__modal">
            <h3 className="gamemaker-page__modal-title">
              Set Answer for {editingDate}
            </h3>
            <form className="gamemaker-page__form">
              <Input
                label="5-Letter Word"
                type="text"
                value={word}
                onChange={(e) => setWord(e.target.value.toUpperCase())}
                maxLength={5}
                pattern="[A-Za-z]{5}"
                placeholder="WORD"
                fullWidth
                required
                error={
                  word.length > 0 && word.length !== 5
                    ? 'Must be 5 letters'
                    : undefined
                }
              />
              <div className="gamemaker-page__modal-actions">
                <Button
                  type="button"
                  size="s"
                  variant="onLight"
                  onClick={handleCloseModal}
                >
                  Cancel
                </Button>
                <Button type="submit" size="s" variant="onLight">
                  Set Answer
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
};

// Generate sample week data
const generateWeekDays = (withAnswers: boolean[]): WeekDay[] => {
  const today: Date = new Date();
  const startOfWeek: Date = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  const sampleWords: string[] = [
    'CRANE',
    'SLATE',
    'TRACE',
    'CRATE',
    'STARE',
    'ADIEU',
    'AUDIO',
  ];

  return Array.from({ length: 7 }, (_, i: number) => {
    const date: Date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    const dateStr: string = date.toISOString().split('T')[0];

    return {
      date: dateStr,
      displayDate: formatDisplayDate(date),
      dayName: getDayName(date),
      puzzle: withAnswers[i]
        ? { date: dateStr, word: sampleWords[i] }
        : undefined,
    };
  });
};

const meta: Meta<typeof GameMakerPageStory> = {
  title: 'Pages/GameMakerPage',
  component: GameMakerPageStory,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const AllAnswersSet: Story = {
  args: {
    weekDays: generateWeekDays([true, true, true, true, true, true, true]),
    weekLabel: 'Jan 26 - Feb 1',
  },
};

export const NoAnswersSet: Story = {
  args: {
    weekDays: generateWeekDays([
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ]),
    weekLabel: 'Jan 26 - Feb 1',
  },
};

export const PartialAnswers: Story = {
  args: {
    weekDays: generateWeekDays([true, true, true, false, false, false, false]),
    weekLabel: 'Jan 26 - Feb 1',
  },
};
