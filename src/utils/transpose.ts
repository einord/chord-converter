import type { ParsedSong, Section, TextLine, ChordPosition } from '../types';

// Chromatic scale using sharps as the canonical form
const CHROMATIC_SCALE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Map enharmonic variants and H notation to canonical sharp form
const NOTE_MAP: Record<string, string> = {
  'C': 'C',
  'C#': 'C#',
  'Db': 'C#',
  'D': 'D',
  'D#': 'D#',
  'Eb': 'D#',
  'E': 'E',
  'Fb': 'E',
  'E#': 'F',
  'F': 'F',
  'F#': 'F#',
  'Gb': 'F#',
  'G': 'G',
  'G#': 'G#',
  'Ab': 'G#',
  'A': 'A',
  'A#': 'A#',
  'Bb': 'A#',
  'B': 'B',
  'Cb': 'B',
  'B#': 'C',
  'H': 'B',   // German/Scandinavian notation
  'H#': 'C',
  'Hb': 'A#',
};

// Regex to parse root note from the rest of the chord
const CHORD_REGEX = /^([A-Ha-h][#b]?)(.*)$/;

/**
 * Parses a chord string into its components: root, modifier, and optional bass note.
 * @param chord - The chord string to parse (e.g., "Am7/G")
 * @returns An object with root, modifier, and optional bassNote, or null if invalid
 */
function parseChord(chord: string): { root: string; modifier: string; bassNote?: string } | null {
  // Handle bass notes first (split on "/")
  const slashIndex = chord.indexOf('/');
  let mainPart = chord;
  let bassNote: string | undefined;

  if (slashIndex !== -1) {
    mainPart = chord.substring(0, slashIndex);
    bassNote = chord.substring(slashIndex + 1);
  }

  // Parse the main chord part
  const match = mainPart.match(CHORD_REGEX);
  if (!match) {
    return null;
  }

  const [, root, modifier] = match;

  // Capitalize the root note for consistent lookup
  const normalizedRoot = root.charAt(0).toUpperCase() + root.slice(1);

  return {
    root: normalizedRoot,
    modifier,
    bassNote,
  };
}

/**
 * Gets the index of a note in the chromatic scale.
 * @param note - The note to look up (e.g., "C#", "Db", "H")
 * @returns The index in the chromatic scale (0-11), or -1 if invalid
 */
function getNoteIndex(note: string): number {
  const canonical = NOTE_MAP[note];
  if (!canonical) {
    return -1;
  }
  return CHROMATIC_SCALE.indexOf(canonical);
}

/**
 * Transposes a note by the given number of semitones.
 * @param note - The note to transpose
 * @param semitones - Number of semitones to transpose (positive = up, negative = down)
 * @returns The transposed note in sharp notation, or the original if invalid
 */
function transposeNote(note: string, semitones: number): string {
  const index = getNoteIndex(note);
  if (index === -1) {
    return note; // Return original if we can't parse it
  }

  // Calculate new index with proper modulo handling for negative numbers
  const newIndex = ((index + semitones) % 12 + 12) % 12;
  return CHROMATIC_SCALE[newIndex];
}

/**
 * Transposes a single chord by the specified number of semitones.
 * Handles root notes, modifiers, and bass notes.
 * @param chord - The chord to transpose (e.g., "Am7/G", "F#m", "Bb")
 * @param semitones - Number of semitones to transpose (positive = up, negative = down)
 * @returns The transposed chord string
 */
export function transposeChord(chord: string, semitones: number): string {
  // Handle empty or whitespace-only input
  if (!chord || !chord.trim()) {
    return chord;
  }

  const parsed = parseChord(chord);
  if (!parsed) {
    return chord; // Return original if we can't parse it
  }

  const { root, modifier, bassNote } = parsed;

  // Transpose the root note
  const newRoot = transposeNote(root, semitones);

  // Build the transposed chord
  let result = newRoot + modifier;

  // Transpose bass note if present
  if (bassNote) {
    const bassMatch = bassNote.match(CHORD_REGEX);
    if (bassMatch) {
      const [, bassRoot, bassModifier] = bassMatch;
      const normalizedBassRoot = bassRoot.charAt(0).toUpperCase() + bassRoot.slice(1);
      const newBassRoot = transposeNote(normalizedBassRoot, semitones);
      result += '/' + newBassRoot + bassModifier;
    } else {
      result += '/' + bassNote; // Keep original if we can't parse it
    }
  }

  return result;
}

/**
 * Creates a deep copy of a ChordPosition with transposed chord.
 */
function transposeChordPosition(chordPos: ChordPosition, semitones: number): ChordPosition {
  return {
    chord: transposeChord(chordPos.chord, semitones),
    position: chordPos.position,
  };
}

/**
 * Creates a deep copy of a TextLine with transposed chords.
 */
function transposeTextLine(line: TextLine, semitones: number): TextLine {
  return {
    text: line.text,
    chords: line.chords.map(cp => transposeChordPosition(cp, semitones)),
  };
}

/**
 * Creates a deep copy of a Section with transposed chords.
 */
function transposeSection(section: Section, semitones: number): Section {
  return {
    type: section.type,
    name: section.name,
    lines: section.lines.map(line => transposeTextLine(line, semitones)),
  };
}

/**
 * Transposes all chords in a ParsedSong by the specified number of semitones.
 * Creates a deep copy of the song structure to avoid mutating the original.
 * @param song - The parsed song to transpose
 * @param semitones - Number of semitones to transpose (positive = up, negative = down)
 * @returns A new ParsedSong with all chords transposed
 */
export function transposeSong(song: ParsedSong, semitones: number): ParsedSong {
  return {
    sections: song.sections.map(section => transposeSection(section, semitones)),
  };
}

/**
 * Gets the key name from a semitone offset relative to an original key.
 * Useful for displaying the current key after transposition.
 * @param originalKey - The original key (e.g., "C", "Am", "F#")
 * @param semitones - Number of semitones offset from the original key
 * @returns The new key name (e.g., transposing "C" by +2 returns "D")
 */
export function getKeyFromOffset(originalKey: string, semitones: number): string {
  // Parse the key - it might have a modifier like "m" for minor
  const match = originalKey.match(CHORD_REGEX);
  if (!match) {
    return originalKey;
  }

  const [, root, modifier] = match;
  const normalizedRoot = root.charAt(0).toUpperCase() + root.slice(1);
  const newRoot = transposeNote(normalizedRoot, semitones);

  return newRoot + modifier;
}
