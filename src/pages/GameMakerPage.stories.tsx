import type { ReactElement } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import './GameMakerPage.scss';
import '../components/ui/Input/Input.scss';
import '../components/ui/Select/Select.scss';

interface MockPuzzle {
  date: string;
  word: string;
}

// Mock data
const mockPuzzles: MockPuzzle[] = [
  { date: '2025-01-26', word: 'CRANE' },
  { date: '2025-01-27', word: 'SLATE' },
  { date: '2025-01-28', word: 'TRACE' },
  { date: '2025-01-29', word: 'CRATE' },
  { date: '2025-01-30', word: 'STARE' },
  { date: '2025-01-31', word: 'ADIEU' },
  { date: '2025-02-01', word: 'AUDIO' },
];

// Create a mock component that shows the UI without Auth0
const MockGameMakerPage = (): ReactElement => {
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

      <div className="gamemaker-page__page-size-selector">
        <div className="select-wrapper">
          <label className="select-wrapper__label">Show</label>
          <select className="select-wrapper__select">
            <option value="7">7</option>
            <option value="14">14</option>
            <option value="30">30</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>

      <table className="gamemaker-page__table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Answer</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {mockPuzzles.map((puzzle) => (
            <tr key={puzzle.date}>
              <td>{puzzle.date}</td>
              <td>
                <button type="button" className="gamemaker-page__answer-toggle">
                  <span className="gamemaker-page__answer-hidden">
                    Click to reveal
                  </span>
                </button>
              </td>
              <td>
                <button
                  type="button"
                  style={{
                    padding: '8px 16px',
                    border: '3px solid #000',
                    background: '#fff',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Set Answer
                </button>
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

// Mock with some answers revealed
const MockGameMakerPageWithVisibleAnswers = (): ReactElement => {
  const visibleDates: Set<string> = new Set([
    '2025-01-27',
    '2025-01-29',
    '2025-01-31',
  ]);

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

      <div className="gamemaker-page__page-size-selector">
        <div className="select-wrapper">
          <label className="select-wrapper__label">Show</label>
          <select className="select-wrapper__select">
            <option value="7">7</option>
            <option value="14">14</option>
            <option value="30">30</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>

      <table className="gamemaker-page__table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Answer</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {mockPuzzles.map((puzzle) => (
            <tr key={puzzle.date}>
              <td>{puzzle.date}</td>
              <td>
                <button type="button" className="gamemaker-page__answer-toggle">
                  {visibleDates.has(puzzle.date) ? (
                    puzzle.word
                  ) : (
                    <span className="gamemaker-page__answer-hidden">
                      Click to reveal
                    </span>
                  )}
                </button>
              </td>
              <td>
                <button
                  type="button"
                  style={{
                    padding: '8px 16px',
                    border: '3px solid #000',
                    background: '#fff',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Set Answer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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

export const WithFilters: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Shows the page with filter options. Use preset buttons (Week/Month/Year/All) or custom date range pickers.',
      },
    },
  },
};

export const Paginated: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates pagination controls for navigating through puzzle data.',
      },
    },
  },
};

export const MixedVisibility: Story = {
  render: () => <MockGameMakerPageWithVisibleAnswers />,
  parameters: {
    docs: {
      description: {
        story:
          'Shows a table with some answers revealed and others hidden. Click on answers to toggle visibility.',
      },
    },
  },
};

export const LargeDataset: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Simulates a large dataset with many puzzles to test pagination with larger page sizes.',
      },
    },
  },
};
