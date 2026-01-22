import type { Meta, StoryObj } from '@storybook/react';

import type { ReactElement } from 'react';
import tokens from '../tokens.module.scss';
import './DesignTokens.scss';

interface ColorSwatchProps {
  name: string;
  token: string;
  value: string;
}

const ColorSwatch = ({
  name,
  token,
  value,
}: ColorSwatchProps): ReactElement => (
  <div className="color-swatch">
    <div className="color-swatch__preview" style={{ backgroundColor: value }} />
    <div className="color-swatch__info">
      <span className="color-swatch__name">{name}</span>
      <code className="color-swatch__token">{token}</code>
      <span className="color-swatch__value">{value}</span>
    </div>
  </div>
);

const DesignTokens = (): ReactElement => {
  const gameStateColors: ColorSwatchProps[] = [
    { name: 'Correct', token: '--color-correct', value: tokens.colorCorrect },
    {
      name: 'Contained',
      token: '--color-contained',
      value: tokens.colorContained,
    },
    { name: 'Wrong', token: '--color-wrong', value: tokens.colorWrong },
  ];

  const uiColors: ColorSwatchProps[] = [
    {
      name: 'Background',
      token: '--color-background',
      value: tokens.colorBackground,
    },
    { name: 'Border', token: '--color-border', value: tokens.colorBorder },
    {
      name: 'Key Unused',
      token: '--color-key-unused',
      value: tokens.colorKeyUnused,
    },
    { name: 'Text', token: '--color-text', value: tokens.colorText },
  ];

  return (
    <div className="design-tokens">
      <section className="design-tokens__section">
        <h2 className="design-tokens__heading">Game State Colors</h2>
        <div className="design-tokens__grid">
          {gameStateColors.map((color) => (
            <ColorSwatch key={color.token} {...color} />
          ))}
        </div>
      </section>

      <section className="design-tokens__section">
        <h2 className="design-tokens__heading">UI Colors</h2>
        <div className="design-tokens__grid">
          {uiColors.map((color) => (
            <ColorSwatch key={color.token} {...color} />
          ))}
        </div>
      </section>
    </div>
  );
};

const meta: Meta<typeof DesignTokens> = {
  title: 'Foundation/Design Tokens',
  component: DesignTokens,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#121213' }],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Colors: Story = {};
