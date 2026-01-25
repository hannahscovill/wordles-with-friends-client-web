import { useReducer, useCallback, useEffect } from 'react';
import type { GuessLetterProps } from '../components/GuessLetter';
import type { KeyState } from '../components/Keyboard';

// Common 5-letter words for the game
const WORDS: string[] = [
  'ABOUT',
  'ABOVE',
  'ABUSE',
  'ACTOR',
  'ACUTE',
  'ADMIT',
  'ADOPT',
  'ADULT',
  'AFTER',
  'AGAIN',
  'AGENT',
  'AGREE',
  'AHEAD',
  'ALARM',
  'ALBUM',
  'ALERT',
  'ALIKE',
  'ALIVE',
  'ALLOW',
  'ALONE',
  'ALONG',
  'ALTER',
  'AMONG',
  'ANGEL',
  'ANGER',
  'ANGLE',
  'ANGRY',
  'APART',
  'APPLE',
  'APPLY',
  'ARENA',
  'ARGUE',
  'ARISE',
  'ARMOR',
  'ARRAY',
  'ASIDE',
  'ASSET',
  'AVOID',
  'AWARD',
  'AWARE',
  'BADGE',
  'BASIC',
  'BEACH',
  'BEAST',
  'BEGIN',
  'BEING',
  'BELOW',
  'BENCH',
  'BIRTH',
  'BLACK',
  'BLADE',
  'BLAME',
  'BLANK',
  'BLAST',
  'BLAZE',
  'BLEND',
  'BLESS',
  'BLIND',
  'BLOCK',
  'BLOOD',
  'BOARD',
  'BOOST',
  'BOOTH',
  'BOUND',
  'BRAIN',
  'BRAND',
  'BRAVE',
  'BREAD',
  'BREAK',
  'BREED',
  'BRICK',
  'BRIEF',
  'BRING',
  'BROAD',
  'BROWN',
  'BRUSH',
  'BUILD',
  'BUNCH',
  'BURST',
  'BUYER',
  'CABIN',
  'CABLE',
  'CACHE',
  'CAMEL',
  'CANDY',
  'CARGO',
  'CARRY',
  'CATCH',
  'CAUSE',
  'CHAIN',
  'CHAIR',
  'CHALK',
  'CHAMP',
  'CHARM',
  'CHART',
  'CHASE',
  'CHEAP',
  'CHECK',
  'CHESS',
  'CHEST',
  'CHIEF',
  'CHILD',
  'CHINA',
  'CHOSE',
  'CHUNK',
  'CLAIM',
  'CLASS',
  'CLEAN',
  'CLEAR',
  'CLIMB',
  'CLOCK',
  'CLOSE',
  'CLOUD',
  'COACH',
  'COAST',
  'COMMA',
  'CORAL',
  'COUCH',
  'COUNT',
  'COURT',
  'COVER',
  'CRAFT',
  'CRANE',
  'CRASH',
  'CRAZY',
  'CREAM',
  'CRIME',
  'CRISP',
  'CROSS',
  'CROWD',
  'CROWN',
  'CRUSH',
  'CURVE',
  'CYCLE',
  'DAILY',
  'DANCE',
  'DEATH',
  'DEBUT',
  'DECAY',
  'DELTA',
  'DEPTH',
  'DIARY',
  'DIRTY',
  'DIVER',
  'DOUBT',
  'DOZEN',
  'DRAFT',
  'DRAIN',
  'DRAMA',
  'DRANK',
  'DREAM',
  'DRESS',
  'DRIED',
  'DRIFT',
  'DRINK',
  'DRIVE',
  'DROWN',
  'DRUNK',
  'DYING',
  'EAGER',
  'EARLY',
  'EARTH',
  'EIGHT',
  'ELDER',
  'ELITE',
  'EMPTY',
  'ENEMY',
  'ENJOY',
  'ENTER',
  'ENTRY',
  'EQUAL',
  'ERROR',
  'EVENT',
  'EVERY',
  'EXACT',
  'EXIST',
  'EXTRA',
  'FAINT',
  'FAITH',
  'FALSE',
  'FANCY',
  'FAULT',
  'FEAST',
  'FIBER',
  'FIELD',
  'FIFTH',
  'FIFTY',
  'FIGHT',
  'FINAL',
  'FIRST',
  'FIXED',
  'FLAME',
  'FLASH',
  'FLEET',
  'FLESH',
  'FLOAT',
  'FLOOD',
  'FLOOR',
  'FLOUR',
  'FLUID',
  'FLUSH',
  'FOCUS',
  'FORCE',
  'FORGE',
  'FORTH',
  'FORUM',
  'FOUND',
  'FRAME',
  'FRANK',
  'FRAUD',
  'FRESH',
  'FRONT',
  'FROST',
  'FRUIT',
  'FULLY',
  'GHOST',
  'GIANT',
  'GIVEN',
  'GLASS',
  'GLOBE',
  'GLORY',
  'GLOVE',
  'GRACE',
  'GRADE',
  'GRAIN',
  'GRAND',
  'GRANT',
  'GRAPE',
  'GRAPH',
  'GRASP',
  'GRASS',
  'GRAVE',
  'GREAT',
  'GREEN',
  'GREET',
  'GRIEF',
  'GRILL',
  'GRIND',
  'GROSS',
  'GROUP',
  'GROVE',
  'GROWN',
  'GUARD',
  'GUESS',
  'GUEST',
  'GUIDE',
  'GUILD',
  'GUILT',
  'HAPPY',
  'HARSH',
  'HASTE',
  'HAUNT',
  'HEART',
  'HEAVY',
  'HENCE',
  'HOBBY',
  'HONEY',
  'HONOR',
  'HORSE',
  'HOTEL',
  'HOUSE',
  'HUMAN',
  'IDEAL',
  'IMAGE',
  'IMPLY',
  'INDEX',
  'INNER',
  'INPUT',
  'ISSUE',
  'IVORY',
  'JEWEL',
  'JOINT',
  'JONES',
  'JUDGE',
  'JUICE',
  'KNIFE',
  'KNOWN',
  'LABEL',
  'LARGE',
  'LASER',
  'LATER',
  'LAUGH',
  'LAYER',
  'LEARN',
  'LEASE',
  'LEAST',
  'LEAVE',
  'LEGAL',
  'LEMON',
  'LEVEL',
  'LEVER',
  'LIGHT',
  'LIMIT',
  'LINEN',
  'LIVER',
  'LOCAL',
  'LODGE',
  'LOGIC',
  'LOOSE',
  'LOTUS',
  'LOVER',
  'LOWER',
  'LOYAL',
  'LUCKY',
  'LUNCH',
  'LYING',
  'MAGIC',
  'MAJOR',
  'MAKER',
  'MANOR',
  'MAPLE',
  'MARCH',
  'MATCH',
  'MAYOR',
  'MEDAL',
  'MEDIA',
  'MELON',
  'MERCY',
  'MERGE',
  'MERIT',
  'METAL',
  'METER',
  'MIGHT',
  'MINOR',
  'MINUS',
  'MIXED',
  'MODEL',
  'MONEY',
  'MONTH',
  'MORAL',
  'MOTOR',
  'MOUNT',
  'MOUSE',
  'MOUTH',
  'MOVIE',
  'MUSIC',
  'NAIVE',
  'NAKED',
  'NASTY',
  'NAVAL',
  'NERVE',
  'NEVER',
  'NEWLY',
  'NIGHT',
  'NINTH',
  'NOISE',
  'NORTH',
  'NOTED',
  'NOVEL',
  'NURSE',
  'OCCUR',
  'OCEAN',
  'OFFER',
  'OFTEN',
  'OLIVE',
  'OPERA',
  'ORBIT',
  'ORDER',
  'ORGAN',
  'OTHER',
  'OUGHT',
  'OUTER',
  'OWNER',
  'OXIDE',
  'OZONE',
  'PAINT',
  'PANEL',
  'PANIC',
  'PAPER',
  'PARTY',
  'PASTA',
  'PATCH',
  'PAUSE',
  'PEACE',
  'PEARL',
  'PENNY',
  'PHASE',
  'PHONE',
  'PHOTO',
  'PIANO',
  'PIECE',
  'PILOT',
  'PINCH',
  'PITCH',
  'PLACE',
  'PLAIN',
  'PLANE',
  'PLANT',
  'PLATE',
  'PLAZA',
  'PLEAD',
  'PLOT',
  'POINT',
  'POLAR',
  'POUND',
  'POWER',
  'PRESS',
  'PRICE',
  'PRIDE',
  'PRIME',
  'PRINT',
  'PRIOR',
  'PRIZE',
  'PROBE',
  'PROOF',
  'PROUD',
  'PROVE',
  'PROXY',
  'PULSE',
  'PUPIL',
  'QUEEN',
  'QUEST',
  'QUICK',
  'QUIET',
  'QUITE',
  'QUOTA',
  'QUOTE',
  'RADAR',
  'RADIO',
  'RAISE',
  'RALLY',
  'RANCH',
  'RANGE',
  'RAPID',
  'RATIO',
  'REACH',
  'REACT',
  'READY',
  'REALM',
  'REBEL',
  'REFER',
  'REIGN',
  'RELAX',
  'REPLY',
  'RIDER',
  'RIDGE',
  'RIFLE',
  'RIGHT',
  'RIGID',
  'RISKY',
  'RIVAL',
  'RIVER',
  'ROBOT',
  'ROCKY',
  'ROMAN',
  'ROUGH',
  'ROUND',
  'ROUTE',
  'ROYAL',
  'RUGBY',
  'RULER',
  'RURAL',
  'SADLY',
  'SAINT',
  'SALAD',
  'SALON',
  'SANDY',
  'SAUCE',
  'SCALE',
  'SCARE',
  'SCENE',
  'SCOPE',
  'SCORE',
  'SCOUT',
  'SCREW',
  'SEDAN',
  'SENSE',
  'SERVE',
  'SETUP',
  'SEVEN',
  'SHADE',
  'SHAFT',
  'SHAKE',
  'SHALL',
  'SHAME',
  'SHAPE',
  'SHARE',
  'SHARK',
  'SHARP',
  'SHEEP',
  'SHEER',
  'SHEET',
  'SHELF',
  'SHELL',
  'SHIFT',
  'SHINE',
  'SHIRT',
  'SHOCK',
  'SHOOT',
  'SHORT',
  'SHOUT',
  'SHOWN',
  'SIGHT',
  'SIGMA',
  'SILLY',
  'SINCE',
  'SIXTH',
  'SIXTY',
  'SIZED',
  'SKILL',
  'SKULL',
  'SLASH',
  'SLATE',
  'SLAVE',
  'SLEEP',
  'SLIDE',
  'SLOPE',
  'SMALL',
  'SMART',
  'SMELL',
  'SMILE',
  'SMITH',
  'SMOKE',
  'SNAKE',
  'SOLAR',
  'SOLID',
  'SOLVE',
  'SORRY',
  'SOUND',
  'SOUTH',
  'SPACE',
  'SPARE',
  'SPARK',
  'SPEAK',
  'SPEED',
  'SPELL',
  'SPEND',
  'SPENT',
  'SPICE',
  'SPINE',
  'SPLIT',
  'SPOKE',
  'SPOON',
  'SPORT',
  'SPRAY',
  'SQUAD',
  'STACK',
  'STAFF',
  'STAGE',
  'STAIN',
  'STAKE',
  'STAMP',
  'STAND',
  'STARK',
  'START',
  'STATE',
  'STEAK',
  'STEAL',
  'STEAM',
  'STEEL',
  'STEEP',
  'STEER',
  'STICK',
  'STIFF',
  'STILL',
  'STOCK',
  'STONE',
  'STOOD',
  'STOOL',
  'STORE',
  'STORM',
  'STORY',
  'STOVE',
  'STRAP',
  'STRAW',
  'STRIP',
  'STUCK',
  'STUDY',
  'STUFF',
  'STYLE',
  'SUGAR',
  'SUITE',
  'SUNNY',
  'SUPER',
  'SURGE',
  'SWAMP',
  'SWEAR',
  'SWEAT',
  'SWEEP',
  'SWEET',
  'SWEPT',
  'SWIFT',
  'SWING',
  'SWORD',
  'TABLE',
  'TAKEN',
  'TASTE',
  'TAXES',
  'TEACH',
  'TEETH',
  'TEMPO',
  'TENSE',
  'TENTH',
  'TERMS',
  'THANK',
  'THEFT',
  'THEIR',
  'THEME',
  'THERE',
  'THICK',
  'THIEF',
  'THING',
  'THINK',
  'THIRD',
  'THOSE',
  'THREE',
  'THREW',
  'THROW',
  'THUMB',
  'TIGER',
  'TIGHT',
  'TIMER',
  'TIRED',
  'TITLE',
  'TODAY',
  'TOKEN',
  'TONAL',
  'TOPIC',
  'TOTAL',
  'TOUCH',
  'TOUGH',
  'TOWER',
  'TOXIC',
  'TRACE',
  'TRACK',
  'TRADE',
  'TRAIL',
  'TRAIN',
  'TRAIT',
  'TRASH',
  'TREAT',
  'TREND',
  'TRIAL',
  'TRIBE',
  'TRICK',
  'TRIED',
  'TROOP',
  'TRUCK',
  'TRULY',
  'TRUNK',
  'TRUST',
  'TRUTH',
  'TUTOR',
  'TWICE',
  'TWIST',
  'ULTRA',
  'UNCLE',
  'UNDER',
  'UNITY',
  'UNTIL',
  'UPPER',
  'UPSET',
  'URBAN',
  'USAGE',
  'USUAL',
  'VALID',
  'VALUE',
  'VAPOR',
  'VAULT',
  'VENUE',
  'VERSE',
  'VIDEO',
  'VIEWS',
  'VIRAL',
  'VIRUS',
  'VISIT',
  'VITAL',
  'VIVID',
  'VOCAL',
  'VOICE',
  'VOTED',
  'VOTER',
  'WAGON',
  'WASTE',
  'WATCH',
  'WATER',
  'WEARY',
  'WHEAT',
  'WHEEL',
  'WHERE',
  'WHICH',
  'WHILE',
  'WHITE',
  'WHOLE',
  'WHOSE',
  'WIDEN',
  'WIDOW',
  'WIDTH',
  'WOMAN',
  'WORKS',
  'WORLD',
  'WORRY',
  'WORSE',
  'WORST',
  'WORTH',
  'WOULD',
  'WOUND',
  'WRIST',
  'WRITE',
  'WRONG',
  'WROTE',
  'YACHT',
  'YIELD',
  'YOUNG',
  'YOUTH',
  'ZEBRA',
  'ZESTY',
];

type GradedGuess = [
  GuessLetterProps,
  GuessLetterProps,
  GuessLetterProps,
  GuessLetterProps,
  GuessLetterProps,
];

type GameStatus = 'playing' | 'won' | 'lost';

interface GameState {
  answer: string;
  currentGuess: string;
  guesses: GradedGuess[];
  status: GameStatus;
  gameNumber: number;
}

type GameAction =
  | { type: 'ADD_LETTER'; letter: string }
  | { type: 'REMOVE_LETTER' }
  | { type: 'SUBMIT_GUESS' }
  | { type: 'NEW_GAME' };

function getRandomWord(): string {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

function gradeGuess(guess: string, answer: string): GradedGuess {
  const result: GuessLetterProps[] = [];
  const answerLetters: string[] = answer.split('');
  const guessLetters: string[] = guess.split('');

  // Track which answer letters have been "used"
  const used: boolean[] = new Array(5).fill(false);

  // First pass: mark correct positions
  for (let i: number = 0; i < 5; i++) {
    if (guessLetters[i] === answerLetters[i]) {
      result[i] = {
        letter: guessLetters[i],
        correct_letter_and_position: true,
        letter_contained_in_answer: true,
      };
      used[i] = true;
    }
  }

  // Second pass: mark contained letters
  for (let i: number = 0; i < 5; i++) {
    if (result[i]) continue; // Already marked as correct

    const letter: string = guessLetters[i];
    let foundIndex: number = -1;

    for (let j: number = 0; j < 5; j++) {
      if (!used[j] && answerLetters[j] === letter) {
        foundIndex = j;
        break;
      }
    }

    if (foundIndex !== -1) {
      result[i] = {
        letter,
        correct_letter_and_position: false,
        letter_contained_in_answer: true,
      };
      used[foundIndex] = true;
    } else {
      result[i] = {
        letter,
        correct_letter_and_position: false,
        letter_contained_in_answer: false,
      };
    }
  }

  return result as GradedGuess;
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'ADD_LETTER':
      if (state.status !== 'playing' || state.currentGuess.length >= 5) {
        return state;
      }
      return {
        ...state,
        currentGuess: state.currentGuess + action.letter.toUpperCase(),
      };

    case 'REMOVE_LETTER':
      if (state.status !== 'playing' || state.currentGuess.length === 0) {
        return state;
      }
      return {
        ...state,
        currentGuess: state.currentGuess.slice(0, -1),
      };

    case 'SUBMIT_GUESS': {
      if (state.status !== 'playing' || state.currentGuess.length !== 5) {
        return state;
      }

      const graded: GradedGuess = gradeGuess(state.currentGuess, state.answer);
      const newGuesses: GradedGuess[] = [...state.guesses, graded];
      const isWin: boolean = state.currentGuess === state.answer;
      const isLoss: boolean = !isWin && newGuesses.length >= 6;

      return {
        ...state,
        guesses: newGuesses,
        currentGuess: '',
        status: isWin ? 'won' : isLoss ? 'lost' : 'playing',
      };
    }

    case 'NEW_GAME':
      return {
        answer: getRandomWord(),
        currentGuess: '',
        guesses: [],
        status: 'playing',
        gameNumber: state.gameNumber + 1,
      };

    default:
      return state;
  }
}

function createInitialState(): GameState {
  return {
    answer: getRandomWord(),
    currentGuess: '',
    guesses: [],
    status: 'playing',
    gameNumber: 1,
  };
}

interface UseGameReturn {
  guesses: { boxes: GradedGuess }[];
  keyStates: Record<string, KeyState>;
  status: GameStatus;
  answer: string;
  gameNumber: number;
  onKeyPress: (letter: string) => void;
  onEnter: () => void;
  onBackspace: () => void;
  onNewGame: () => void;
}

export function useGame(): UseGameReturn {
  const [state, dispatch] = useReducer(gameReducer, null, createInitialState);

  const addLetter: (letter: string) => void = useCallback(
    (letter: string): void => {
      dispatch({ type: 'ADD_LETTER', letter });
    },
    [],
  );

  const removeLetter: () => void = useCallback((): void => {
    dispatch({ type: 'REMOVE_LETTER' });
  }, []);

  const submitGuess: () => void = useCallback((): void => {
    dispatch({ type: 'SUBMIT_GUESS' });
  }, []);

  const newGame: () => void = useCallback((): void => {
    dispatch({ type: 'NEW_GAME' });
  }, []);

  // Handle physical keyboard
  useEffect((): (() => void) => {
    const handleKeyDown: (e: KeyboardEvent) => void = (
      e: KeyboardEvent,
    ): void => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === 'Enter') {
        e.preventDefault();
        submitGuess();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        removeLetter();
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        addLetter(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return (): void => window.removeEventListener('keydown', handleKeyDown);
  }, [addLetter, removeLetter, submitGuess]);

  // Compute keyboard states from guesses
  const keyStates: Record<string, KeyState> = {};
  for (const guess of state.guesses) {
    for (const letterProps of guess) {
      const letter: string = letterProps.letter.toUpperCase();
      const current: KeyState | undefined = keyStates[letter];

      if (letterProps.correct_letter_and_position) {
        keyStates[letter] = 'correct';
      } else if (
        letterProps.letter_contained_in_answer &&
        current !== 'correct'
      ) {
        keyStates[letter] = 'contained';
      } else if (!current) {
        keyStates[letter] = 'wrong';
      }
    }
  }

  // Build guesses array for GameBoard (include current guess as in-progress row)
  const displayGuesses: { boxes: GradedGuess }[] = state.guesses.map(
    (graded: GradedGuess) => ({ boxes: graded }),
  );

  if (state.status === 'playing' && state.currentGuess.length > 0) {
    const currentRow: GuessLetterProps[] = [];
    for (let i: number = 0; i < 5; i++) {
      currentRow.push({
        letter: state.currentGuess[i] || '',
        letter_contained_in_answer: false,
        correct_letter_and_position: false,
      });
    }
    displayGuesses.push({ boxes: currentRow as GradedGuess });
  }

  return {
    guesses: displayGuesses,
    keyStates,
    status: state.status,
    answer: state.answer,
    gameNumber: state.gameNumber,
    onKeyPress: addLetter,
    onEnter: submitGuess,
    onBackspace: removeLetter,
    onNewGame: newGame,
  };
}
