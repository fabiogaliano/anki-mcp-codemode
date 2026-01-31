// Prompt content for card creation and review sessions

export const TWENTY_RULES = `# Twenty Rules of Formulating Knowledge

*Based on Dr. Piotr Wozniak's SuperMemo research*

## Core Principles

### 1. Understand First
Never create cards from material you don't comprehend. Ask clarifying questions first.

### 2. Big Picture Before Details
Build context and foundational knowledge before memorizing specifics.

### 3. Minimum Information Principle (CRITICAL)
Each card tests ONE piece of information.
- ❌ "What are the three features of X?"
- ✅ Three separate cards, one per feature

### 4. Cloze Deletion
Use fill-in-the-blank format: "The capital of {{c1::France}} is {{c2::Paris}}"

### 5. Avoid Sets and Enumerations
- ❌ "List all 50 state capitals"
- ✅ Convert to individual cloze cards or break into small groups

### 6. Combat Interference
Make similar cards distinct. Add context to differentiate.

### 7. Optimize Wording
Shorter = faster reviews = better retention.
- ❌ "In the context of programming, when considering paradigms..."
- ✅ "Functional programming's main characteristic?"

### 8. Use Imagery
Add images for visual concepts. A picture is worth a thousand words.

### 9. Use Mnemonics
Create memorable associations for difficult items.

### 10. Personalize
Link to your experiences, projects, or interests.

### 11. Add Context Cues
Use prefixes: "js:", "bio:", "hist:" to reduce cognitive load.

### 12. Redundancy for Critical Concepts
Test important facts from different angles.

## Workflow

1. **Verify understanding** - Don't create cards from confusion
2. **Break into atomic facts** - One fact per card
3. **Choose format** - Cloze for facts, Q&A for concepts
4. **Optimize wording** - Clear, concise, unambiguous
5. **Add richness** - Images, mnemonics, personal connections

## Example Transformation

❌ **Bad**: "What are the differences between REST and GraphQL?"

✅ **Good** (4 cards):
1. "REST uses {{c1::multiple endpoints}}, GraphQL uses {{c2::single endpoint}}"
2. "GraphQL advantage: {{c1::client specifies exact data needed}}"
3. "REST advantage: {{c1::simpler caching}}"
4. "Use GraphQL when: {{c1::reducing over-fetching matters}}"

## Remember
- **Quality > Quantity**: 5 good cards beat 20 bad ones
- **Atomic Knowledge**: One fact per card, always
- **Understanding First**: Never memorize what you don't understand
`;

export const REVIEW_SESSION = `# Anki Review Session Guidelines

## Synchronization (CRITICAL)
- **Start**: ALWAYS sync before getting cards
- **End**: ALWAYS sync before ending session

## Review Workflow

1. **Sync first** - Get latest from AnkiWeb
2. **Ask about deck** - "Which deck?" or review all
3. **Present question** - Show front of card
4. **Wait for answer** - Let user attempt
5. **Show answer** - Reveal back of card
6. **Evaluate** - Assess their response
7. **Suggest rating**:
   - 1 (Again) - Got it wrong
   - 2 (Hard) - Got it with difficulty
   - 3 (Good) - Knew it well
   - 4 (Easy) - Instant recall
8. **Wait for confirmation** - NEVER auto-rate
9. **Submit rating** - Only after user confirms
10. **Continue or end** - Sync before goodbye

## Example Interaction

**You**: "Good explanation but missed some details. I'd suggest **2 (Hard)**. Sound right?"

**User**: "Yes" → Submit rating 2
**User**: "It was easy" → Submit rating 4 (accept their assessment)

## Key Principles
- Never auto-rate without user confirmation
- Accept user's self-assessment over your suggestion
- Be encouraging but honest
- Sync at start AND end of session
`;
