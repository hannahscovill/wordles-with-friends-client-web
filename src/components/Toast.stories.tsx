import { useState, useCallback, type ReactElement } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Toast } from './Toast';

const meta: Meta<typeof Toast> = {
  title: 'Components/Toast',
  component: Toast,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (): ReactElement => (
    <div
      style={{
        background: '#e8e9de',
        minHeight: '300px',
        padding: '2rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div style={{ position: 'relative' }}>
        <div
          style={{
            width: '280px',
            height: '150px',
            background: '#ccc',
            border: '2px solid #000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600,
          }}
        >
          Game Board
        </div>
        <Toast
          message="Not in word list"
          visible={true}
          onHide={(): void => {}}
          duration={999999}
        />
      </div>
    </div>
  ),
};

const InteractiveDemo = (): ReactElement => {
  const [visible, setVisible] = useState<boolean>(false);

  const showToast: () => void = useCallback((): void => {
    setVisible(true);
  }, []);

  const hideToast: () => void = useCallback((): void => {
    setVisible(false);
  }, []);

  return (
    <div
      style={{
        background: '#e8e9de',
        minHeight: '500px',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem',
      }}
    >
      <button
        type="button"
        onClick={showToast}
        style={{
          padding: '12px 16px',
          border: '4px solid #000',
          background: '#fff',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Submit Invalid Word
      </button>
      <div style={{ position: 'relative' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          {['ZZZZZ', '', '', '', '', ''].map((word, rowIndex) => (
            <div key={rowIndex} style={{ display: 'flex', gap: '4px' }}>
              {Array.from({ length: 5 }).map((_, colIndex) => (
                <div
                  key={colIndex}
                  style={{
                    width: '52px',
                    height: '52px',
                    border: '2px solid #3a3a3c',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    fontWeight: 700,
                    background: rowIndex === 0 ? '#3a3a3c' : '#121213',
                    color: '#fff',
                  }}
                >
                  {word[colIndex] ?? ''}
                </div>
              ))}
            </div>
          ))}
        </div>
        <Toast
          message="Not in word list"
          visible={visible}
          onHide={hideToast}
          duration={1500}
        />
      </div>
    </div>
  );
};

export const Interactive: Story = {
  render: (): ReactElement => <InteractiveDemo />,
};
