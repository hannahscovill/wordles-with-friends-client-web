import { useReducer, useCallback, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import type { GuessLetterProps } from '../components/GuessLetter';
import type { KeyState } from '../components/Keyboard';
import {
  submitGuess as submitGuessApi,
  getGameProgress as getGameProgressApi,
  type GameState as ApiGameState,
  type GradedMove,
} from '../api/guess';

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
  puzzleDate: string;
  isSubmitting: boolean;
  /** True if game was completed during this session (not loaded as already complete) */
  completedDuringSession: boolean;
}

type GameAction =
  | { type: 'ADD_LETTER'; letter: string }
  | { type: 'REMOVE_LETTER' }
  | { type: 'SUBMIT_GUESS_START' }
  | { type: 'SUBMIT_GUESS_SUCCESS'; payload: ApiGameState }
  | { type: 'SUBMIT_GUESS_ERROR' }
  | { type: 'NEW_GAME' }
  | { type: 'LOAD_GAME_PROGRESS'; payload: ApiGameState }
  | { type: 'SET_PUZZLE_DATE'; puzzleDate: string };

function convertApiMoveToLocal(move: GradedMove): GradedGuess {
  return move.map((letter) => ({
    letter: letter.letter.toUpperCase(),
    correct_letter_and_position: letter.grade === 'correct',
    letter_contained_in_answer:
      letter.grade === 'correct' || letter.grade === 'contained',
  })) as GradedGuess;
}

function getTodayLocalDate(): string {
  const now: Date = new Date();
  const year: number = now.getFullYear();
  const month: string = String(now.getMonth() + 1).padStart(2, '0');
  const day: string = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getRandomWord(): string {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
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

    case 'SUBMIT_GUESS_START':
      if (state.status !== 'playing' || state.currentGuess.length !== 5) {
        return state;
      }
      return {
        ...state,
        isSubmitting: true,
      };

    case 'SUBMIT_GUESS_SUCCESS': {
      const apiState: ApiGameState = action.payload;
      const newGuesses: GradedGuess[] = apiState.moves.map(
        convertApiMoveToLocal,
      );
      const isLost: boolean = !apiState.won && newGuesses.length >= 6;
      const newStatus: GameStatus = apiState.won
        ? 'won'
        : isLost
          ? 'lost'
          : 'playing';

      return {
        ...state,
        guesses: newGuesses,
        currentGuess: '',
        isSubmitting: false,
        status: newStatus,
        completedDuringSession:
          state.completedDuringSession || newStatus !== 'playing',
      };
    }

    case 'SUBMIT_GUESS_ERROR':
      return {
        ...state,
        isSubmitting: false,
      };

    case 'NEW_GAME':
      return {
        answer: getRandomWord(),
        currentGuess: '',
        guesses: [],
        status: 'playing',
        gameNumber: state.gameNumber + 1,
        puzzleDate: getTodayLocalDate(),
        isSubmitting: false,
        completedDuringSession: false,
      };

    case 'LOAD_GAME_PROGRESS': {
      const apiState: ApiGameState = action.payload;
      const loadedGuesses: GradedGuess[] = apiState.moves.map(
        convertApiMoveToLocal,
      );
      const isLost: boolean = !apiState.won && loadedGuesses.length >= 6;

      return {
        ...state,
        guesses: loadedGuesses,
        status: apiState.won ? 'won' : isLost ? 'lost' : 'playing',
      };
    }

    case 'SET_PUZZLE_DATE':
      // Reset game state for new puzzle date
      return {
        answer: getRandomWord(),
        currentGuess: '',
        guesses: [],
        status: 'playing',
        gameNumber: state.gameNumber,
        puzzleDate: action.puzzleDate,
        isSubmitting: false,
        completedDuringSession: false,
      };

    default:
      return state;
  }
}

function createInitialState(puzzleDate?: string): GameState {
  return {
    answer: getRandomWord(),
    currentGuess: '',
    guesses: [],
    status: 'playing',
    gameNumber: 1,
    puzzleDate: puzzleDate ?? getTodayLocalDate(),
    isSubmitting: false,
    completedDuringSession: false,
  };
}

interface UseGameOptions {
  puzzleDate?: string;
}

interface UseGameReturn {
  guesses: { boxes: GradedGuess; shake?: boolean }[];
  keyStates: Record<string, KeyState>;
  status: GameStatus;
  answer: string;
  gameNumber: number;
  puzzleDate: string;
  isSubmitting: boolean;
  isLoading: boolean;
  error: Error | null;
  invalidWord: boolean;
  /** True if game was completed during this session (not loaded as already complete) */
  completedDuringSession: boolean;
  onKeyPress: (letter: string) => void;
  onEnter: () => void;
  onBackspace: () => void;
  onNewGame: () => void;
}

export function useGame(options: UseGameOptions = {}): UseGameReturn {
  const initialPuzzleDate: string = options.puzzleDate ?? getTodayLocalDate();
  const [state, dispatch] = useReducer(
    gameReducer,
    initialPuzzleDate,
    createInitialState,
  );
  const [error, setError] = useState<Error | null>(null);
  const [invalidWord, setInvalidWord] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const {
    getAccessTokenSilently,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth0();

  // Compute the effective puzzle date (prop or today)
  const effectivePuzzleDate: string = options.puzzleDate ?? getTodayLocalDate();

  // Reset game state when puzzle date changes (e.g., navigating between dates)
  useEffect(() => {
    if (effectivePuzzleDate !== state.puzzleDate) {
      setIsLoading(true);
      dispatch({ type: 'SET_PUZZLE_DATE', puzzleDate: effectivePuzzleDate });
    }
  }, [effectivePuzzleDate, state.puzzleDate]);

  // Load game progress on startup
  // Wait for auth state to resolve to ensure consistent user identification
  useEffect(() => {
    // Don't load until auth state is resolved to avoid user identity mismatch
    if (authLoading) {
      return;
    }

    let isMounted: boolean = true;

    const loadGameProgress = async (): Promise<void> => {
      try {
        // Use the same auth pattern as submitGuess for consistency:
        // - If authenticated, use Auth0 token (identifies user by Auth0 ID)
        // - If not authenticated, no token (server uses session cookie)
        // This prevents the server from seeing different user identities
        // between loadGameProgress and submitGuess calls.
        const token: string | undefined = isAuthenticated
          ? await getAccessTokenSilently()
          : undefined;

        // Fetch game progress (will use cookie if no token)
        const gameProgress: ApiGameState | null = await getGameProgressApi(
          state.puzzleDate,
          { token },
        );

        if (isMounted && gameProgress) {
          dispatch({ type: 'LOAD_GAME_PROGRESS', payload: gameProgress });
        }
      } catch (e) {
        console.error('Failed to load game progress:', e);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadGameProgress();

    return (): void => {
      isMounted = false;
    };
  }, [authLoading, isAuthenticated, getAccessTokenSilently, state.puzzleDate]);

  // Clear invalidWord after animation duration
  useEffect(() => {
    if (invalidWord) {
      const timer: ReturnType<typeof setTimeout> = setTimeout((): void => {
        setInvalidWord(false);
      }, 600);
      return (): void => clearTimeout(timer);
    }
    return undefined;
  }, [invalidWord]);

  const addLetter: (letter: string) => void = useCallback(
    (letter: string): void => {
      dispatch({ type: 'ADD_LETTER', letter });
    },
    [],
  );

  const removeLetter: () => void = useCallback((): void => {
    dispatch({ type: 'REMOVE_LETTER' });
  }, []);

  const submitGuess: () => Promise<void> =
    useCallback(async (): Promise<void> => {
      if (state.status !== 'playing' || state.currentGuess.length !== 5) {
        return;
      }

      dispatch({ type: 'SUBMIT_GUESS_START' });
      setError(null);

      try {
        const token: string | undefined = isAuthenticated
          ? await getAccessTokenSilently()
          : undefined;

        const response: ApiGameState = await submitGuessApi(
          {
            puzzle_date_iso_day: state.puzzleDate,
            word_guessed: state.currentGuess,
          },
          { token },
        );

        dispatch({ type: 'SUBMIT_GUESS_SUCCESS', payload: response });
      } catch (e: unknown) {
        const err: Error = e instanceof Error ? e : new Error(String(e));
        setError(err);
        setInvalidWord(true);
        dispatch({ type: 'SUBMIT_GUESS_ERROR' });
      }
    }, [
      state.status,
      state.currentGuess,
      state.puzzleDate,
      isAuthenticated,
      getAccessTokenSilently,
    ]);

  const newGame: () => void = useCallback((): void => {
    setError(null);
    dispatch({ type: 'NEW_GAME' });
  }, []);

  // Handle physical keyboard
  useEffect((): (() => void) => {
    const handleKeyDown: (e: KeyboardEvent) => void = (
      e: KeyboardEvent,
    ): void => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      // Let buttons handle their own Enter/Space key events
      const target: EventTarget | null = e.target;
      const isButton: boolean =
        target instanceof HTMLButtonElement ||
        (target instanceof HTMLElement && target.closest('button') !== null);

      if (e.key === 'Enter') {
        if (isButton) return;
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
  const displayGuesses: { boxes: GradedGuess; shake?: boolean }[] =
    state.guesses.map((graded: GradedGuess) => ({ boxes: graded }));

  if (state.status === 'playing' && state.currentGuess.length > 0) {
    const currentRow: GuessLetterProps[] = [];
    for (let i: number = 0; i < 5; i++) {
      currentRow.push({
        letter: state.currentGuess[i] || '',
        letter_contained_in_answer: false,
        correct_letter_and_position: false,
      });
    }
    displayGuesses.push({
      boxes: currentRow as GradedGuess,
      shake: invalidWord,
    });
  }

  return {
    guesses: displayGuesses,
    keyStates,
    status: state.status,
    answer: state.answer,
    gameNumber: state.gameNumber,
    puzzleDate: state.puzzleDate,
    isSubmitting: state.isSubmitting,
    isLoading,
    error,
    invalidWord,
    completedDuringSession: state.completedDuringSession,
    onKeyPress: addLetter,
    onEnter: submitGuess,
    onBackspace: removeLetter,
    onNewGame: newGame,
  };
}
