export interface GameUngraded {
  puzzle_date_iso_day: string;
  movesUngraded: string[]; // 1-6 items, each string is alphanumeric and 5 letters long
}

export interface GameGraded {
  puzzle_date_iso_day: string;
  movesGraded: GuessGraded[]; // 1-6 items, each string is alphanumeric and 5 letters long
}

// Response Body: GameGraded
export interface GuessLetterGraded {
  letter: string; // string length == 1
  letter_contained_in_answer: boolean;
  correct_letter_and_position: boolean;
}
type GuessGraded = [
  GuessLetterGraded,
  GuessLetterGraded,
  GuessLetterGraded,
  GuessLetterGraded,
  GuessLetterGraded,
];
