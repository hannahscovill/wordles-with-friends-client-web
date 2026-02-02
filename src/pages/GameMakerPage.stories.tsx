import { useState, type ReactElement } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import './GameMakerPage.scss';
import '../components/ui/Input/Input.scss';
import '../components/ui/Select/Select.scss';

interface MockPuzzle {
  date: string;
  word: string;
}

// Mock data - mix of set and unset answers
const mockPuzzles: MockPuzzle[] = [
  { date: '2025-01-26', word: 'CRANE' },
  { date: '2025-01-27', word: 'SLATE' },
  { date: '2025-01-28', word: '' }, // Unset - shows "Set Answer" button
  { date: '2025-01-29', word: 'CRATE' },
  { date: '2025-01-30', word: '' }, // Unset - shows "Set Answer" button
  { date: '2025-01-31', word: 'ADIEU' },
  { date: '2025-02-01', word: '' }, // Unset - shows "Set Answer" button
];

// Interactive mock component with toggle functionality
const MockGameMakerPage = (): ReactElement => {
  const [visibleAnswers, setVisibleAnswers] = useState<Set<string>>(new Set());

  const toggleVisibility = (date: string): void => {
    setVisibleAnswers((prev: Set<string>) => {
      const newSet: Set<string> = new Set(prev);
      if (newSet.has(date)) {
        newSet.delete(date);
      } else {
        newSet.add(date);
      }
      return newSet;
    });
  };

  return (
    <div className="gamemaker-page">
      <h2 className="gamemaker-page__title">Gamemaker</h2>

      <div className="gamemaker-page__filter-section">
        <div className="gamemaker-page__preset-buttons">
          <button
            type="button"
            className="gamemaker-page__preset-button gamemaker-page__preset-button--active"
          >
            Week
          </button>
          <button type="button" className="gamemaker-page__preset-button">
            Month
          </button>
          <button type="button" className="gamemaker-page__preset-button">
            Year
          </button>
          <button type="button" className="gamemaker-page__preset-button">
            All
          </button>
        </div>
        <div className="gamemaker-page__date-pickers">
          <div className="input-wrapper">
            <label className="input-wrapper__label">From</label>
            <input type="date" className="input-wrapper__input" />
          </div>
          <div className="input-wrapper">
            <label className="input-wrapper__label">To</label>
            <input type="date" className="input-wrapper__input" />
          </div>
        </div>
      </div>

      <table className="gamemaker-page__table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Answer</th>
          </tr>
        </thead>
        <tbody>
          {mockPuzzles.map((puzzle) => (
            <tr key={puzzle.date}>
              <td>{puzzle.date}</td>
              <td>
                {puzzle.word ? (
                  <button
                    type="button"
                    className="gamemaker-page__answer-toggle"
                    onClick={() => toggleVisibility(puzzle.date)}
                  >
                    {visibleAnswers.has(puzzle.date)
                      ? puzzle.word
                      : '* * * * *'}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="gamemaker-page__set-answer-btn"
                  >
                    Set Answer
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="gamemaker-page__pagination">
        <button
          type="button"
          className="gamemaker-page__pagination-button"
          disabled
        >
          Prev
        </button>
        <button
          type="button"
          className="gamemaker-page__pagination-number gamemaker-page__pagination-number--active"
        >
          1
        </button>
        <button type="button" className="gamemaker-page__pagination-number">
          2
        </button>
        <button type="button" className="gamemaker-page__pagination-number">
          3
        </button>
        <button type="button" className="gamemaker-page__pagination-button">
          Next
        </button>
      </div>
    </div>
  );
};

const meta: Meta<typeof MockGameMakerPage> = {
  title: 'Pages/Gamemaker',
  component: MockGameMakerPage,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
