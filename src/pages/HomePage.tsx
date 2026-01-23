import type { ReactElement } from 'react';
import { GameBoard } from '../components/GameBoard';
import type { GameBoardProps } from '../components/GameBoard';
import { Keyboard } from '../components/Keyboard';
import gradedGame from '../gradedGame.json';
import './HomePage.scss';

const guesses: GameBoardProps['guesses'] = gradedGame.moves.map((move) => ({
  boxes: move as GameBoardProps['guesses'][number]['boxes'],
}));

export const HomePage = (): ReactElement => (
  <div className="home-page">
    <GameBoard guesses={guesses} />
    <Keyboard />
  </div>
);
