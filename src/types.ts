// ============================================================================
// Anki MCP Codemode - Type Definitions
// ============================================================================

// AnkiConnect Response
export interface AnkiConnectResponse<T = unknown> {
  result: T;
  error: string | null;
}

// Deck Types
export interface DeckStats {
  deckId: number;
  name: string;
  newCount: number;
  learnCount: number;
  reviewCount: number;
  totalInDeck: number;
}

export interface DeckConfig {
  id: number;
  name: string;
  maxTaken: number;
  autoplay: boolean;
  timer: number;
  replayq: boolean;
  new: {
    perDay: number;
    delays: number[];
    initialFactor: number;
    order: number;
  };
  rev: {
    perDay: number;
    maxIvl: number;
    fuzz: number;
    ease4: number;
  };
  lapse: {
    delays: number[];
    mult: number;
    minInt: number;
    leechFails: number;
    leechAction: number;
  };
}

// Card Types
export interface CardInfo {
  cardId: number;
  noteId: number;
  deckName: string;
  modelName: string;
  question: string;
  answer: string;
  fields: Record<string, { value: string; order: number }>;
  due: number;
  interval: number;
  ease: number;
  reps: number;
  lapses: number;
  type: number;
  queue: number;
}

// Note Types
export interface NoteInfo {
  noteId: number;
  modelName: string;
  tags: string[];
  fields: Record<string, { value: string; order: number }>;
}

export interface AddNoteInput {
  deckName: string;
  modelName: string;
  fields: Record<string, string>;
  tags?: string[];
  options?: {
    allowDuplicate?: boolean;
    duplicateScope?: string;
  };
}

// Model Types
export interface ModelInfo {
  modelName: string;
  fields: string[];
}

export interface ModelStyling {
  css: string;
}

export interface CreateModelInput {
  modelName: string;
  inOrderFields: string[];
  css?: string;
  cardTemplates: {
    Name: string;
    Front: string;
    Back: string;
  }[];
}

// Stats Types
export interface CollectionStats {
  deckCount: number;
  noteCount: number;
  cardCount: number;
  reviewCount: number;
}

export interface ReviewStats {
  days: number;
  reviews: number;
  time: number;
  failed: number;
  young: number;
  mature: number;
}

// GUI Types
export interface GuiCurrentCard {
  cardId: number;
  noteId: number;
  question: string;
  answer: string;
  deckName: string;
  modelName: string;
  buttons: number[];
}

// Sandbox Types
export interface SandboxResult {
  success: boolean;
  output: unknown[];
  error?: string;
}

// Partial API Interfaces for scoped tools

export interface CreateToolAPI {
  decks: {
    list(): Promise<string[]>;
    create(name: string): Promise<number>;
  };
  models: {
    list(): Promise<string[]>;
    getFields(name: string): Promise<string[]>;
  };
  notes: {
    add(note: AddNoteInput): Promise<number>;
    addMany(notes: AddNoteInput[]): Promise<number[]>;
  };
  prompts: {
    twentyRules(): string;
  };
}

export interface ManageToolAPI {
  decks: {
    listWithIds(): Promise<Record<string, number>>;
    delete(name: string): Promise<void>;
    getConfig(name: string): Promise<DeckConfig>;
    getStats(name: string): Promise<DeckStats>;
  };
  cards: {
    find(query: string): Promise<number[]>;
    getInfo(ids: number[]): Promise<CardInfo[]>;
    getDue(deckName?: string): Promise<CardInfo[]>;
    suspend(ids: number[]): Promise<void>;
    unsuspend(ids: number[]): Promise<void>;
    areDue(ids: number[]): Promise<boolean[]>;
  };
  notes: {
    find(query: string): Promise<number[]>;
    getInfo(ids: number[]): Promise<NoteInfo[]>;
    update(id: number, fields: Record<string, string>): Promise<void>;
    delete(ids: number[]): Promise<void>;
    addTags(ids: number[], tags: string): Promise<void>;
    removeTags(ids: number[], tags: string): Promise<void>;
  };
  tags: {
    list(): Promise<string[]>;
    clearUnused(): Promise<void>;
    replace(ids: number[], oldTag: string, newTag: string): Promise<void>;
  };
}

export interface ReviewToolAPI {
  gui: {
    browse(query: string): Promise<number[]>;
    currentCard(): Promise<GuiCurrentCard | null>;
    showQuestion(): Promise<void>;
    showAnswer(): Promise<void>;
    answerCard(ease: 1 | 2 | 3 | 4): Promise<void>;
    deckBrowser(): Promise<void>;
    deckOverview(name: string): Promise<void>;
    addCards(): Promise<void>;
    editNote(noteId: number): Promise<void>;
    selectCard(cardId: number): Promise<boolean>;
    selectedNotes(): Promise<number[]>;
    undo(): Promise<string>;
  };
  prompts: {
    reviewSession(): string;
  };
  sync(): Promise<void>;
}

export interface DesignToolAPI {
  models: {
    list(): Promise<string[]>;
    listWithIds(): Promise<Record<string, number>>;
    getFields(name: string): Promise<string[]>;
    getStyling(name: string): Promise<ModelStyling>;
    create(model: CreateModelInput): Promise<void>;
    updateStyling(name: string, css: string): Promise<void>;
  };
  media: {
    store(filename: string, base64: string): Promise<string>;
    retrieve(filename: string): Promise<string>;
    list(pattern?: string): Promise<string[]>;
    delete(filename: string): Promise<void>;
  };
  stats: {
    collection(): Promise<CollectionStats>;
    decks(): Promise<Record<string, DeckStats>>;
    reviews(days?: number): Promise<ReviewStats>;
  };
}

// Full Anki API Interface (what the agent sees in sandbox)
export interface AnkiAPI {
  // Deck operations
  decks: {
    list(): Promise<string[]>;
    listWithIds(): Promise<Record<string, number>>;
    create(name: string): Promise<number>;
    delete(name: string): Promise<void>;
    getConfig(name: string): Promise<DeckConfig>;
    getStats(name: string): Promise<DeckStats>;
  };

  // Card operations
  cards: {
    find(query: string): Promise<number[]>;
    getInfo(ids: number[]): Promise<CardInfo[]>;
    getDue(deckName?: string): Promise<CardInfo[]>;
    suspend(ids: number[]): Promise<void>;
    unsuspend(ids: number[]): Promise<void>;
    areDue(ids: number[]): Promise<boolean[]>;
  };

  // Note operations
  notes: {
    find(query: string): Promise<number[]>;
    getInfo(ids: number[]): Promise<NoteInfo[]>;
    add(note: AddNoteInput): Promise<number>;
    addMany(notes: AddNoteInput[]): Promise<number[]>;
    update(id: number, fields: Record<string, string>): Promise<void>;
    delete(ids: number[]): Promise<void>;
    addTags(ids: number[], tags: string): Promise<void>;
    removeTags(ids: number[], tags: string): Promise<void>;
  };

  // Model operations
  models: {
    list(): Promise<string[]>;
    listWithIds(): Promise<Record<string, number>>;
    getFields(name: string): Promise<string[]>;
    getStyling(name: string): Promise<ModelStyling>;
    create(model: CreateModelInput): Promise<void>;
    updateStyling(name: string, css: string): Promise<void>;
  };

  // Tag operations
  tags: {
    list(): Promise<string[]>;
    clearUnused(): Promise<void>;
    replace(ids: number[], oldTag: string, newTag: string): Promise<void>;
  };

  // Media operations
  media: {
    store(filename: string, base64: string): Promise<string>;
    retrieve(filename: string): Promise<string>;
    list(pattern?: string): Promise<string[]>;
    delete(filename: string): Promise<void>;
  };

  // Stats
  stats: {
    collection(): Promise<CollectionStats>;
    decks(): Promise<Record<string, DeckStats>>;
    reviews(days?: number): Promise<ReviewStats>;
  };

  // Prompts (guidelines for AI behavior)
  prompts: {
    twentyRules(): string;
    reviewSession(): string;
  };

  // Global actions
  sync(): Promise<void>;

  // GUI operations
  gui: {
    browse(query: string): Promise<number[]>;
    currentCard(): Promise<GuiCurrentCard | null>;
    showQuestion(): Promise<void>;
    showAnswer(): Promise<void>;
    answerCard(ease: 1 | 2 | 3 | 4): Promise<void>;
    deckBrowser(): Promise<void>;
    deckOverview(name: string): Promise<void>;
    addCards(): Promise<void>;
    editNote(noteId: number): Promise<void>;
    selectCard(cardId: number): Promise<boolean>;
    selectedNotes(): Promise<number[]>;
    undo(): Promise<string>;
  };
}
