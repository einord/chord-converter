import type { Chunk, TextLine, Section, ParsedSong, SongMetadata } from '../types';

/**
 * Converts underscores to em space characters in text.
 *
 * @param text - The input text potentially containing underscores
 * @returns The text with underscores replaced by em spaces
 */
function convertUnderscoreToEmSpace(text: string): string {
  return text.replace(/_/g, '\u2003');
}

/**
 * Parses frontmatter metadata from the beginning of input.
 * Frontmatter is delimited by --- at the start and end.
 *
 * @param input - The raw input text potentially containing frontmatter
 * @returns An object with optional metadata and the remaining input after frontmatter
 */
function parseMetadata(input: string): { metadata?: SongMetadata; remainingInput: string } {
  const trimmedInput = input.trimStart();

  // Check if input starts with frontmatter delimiter
  if (!trimmedInput.startsWith('---')) {
    return { remainingInput: input };
  }

  // Find the closing delimiter
  const endDelimiterIndex = trimmedInput.indexOf('---', 3);
  if (endDelimiterIndex === -1) {
    return { remainingInput: input };
  }

  // Extract frontmatter content
  const frontmatterContent = trimmedInput.slice(3, endDelimiterIndex).trim();
  const remainingInput = trimmedInput.slice(endDelimiterIndex + 3).trimStart();

  // Parse frontmatter lines
  const metadata: SongMetadata = {};
  const lines = frontmatterContent.split('\n');

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim().toLowerCase();
    const value = line.slice(colonIndex + 1).trim();

    if (!value) continue;

    switch (key) {
      case 'musik':
        metadata.musik = value;
        break;
      case 'text':
        metadata.text = value;
        break;
      case 'copyright':
        metadata.copyright = value;
        break;
    }
  }

  // Only return metadata if at least one field was parsed
  if (Object.keys(metadata).length === 0) {
    return { remainingInput };
  }

  return { metadata, remainingInput };
}

/**
 * Parses a single line of text containing chord notations in [Chord] format.
 * Splits the line into chunks where each chunk has an optional chord and the text that follows it.
 *
 * @param line - The input line potentially containing [Chord] patterns
 * @returns A TextLine object with chunks
 */
function parseLine(line: string): TextLine {
  const chunks: Chunk[] = [];
  const chordPattern = /\[([^\]]+)\]/g;

  let match: RegExpExecArray | null;
  const matches: { chord: string; index: number; length: number }[] = [];

  // Find all chord positions and values
  while ((match = chordPattern.exec(line)) !== null) {
    matches.push({
      chord: match[1],
      index: match.index,
      length: match[0].length,
    });
  }

  // If no chords found, return the entire line as a single chunk
  if (matches.length === 0) {
    return {
      chunks: [{ text: convertUnderscoreToEmSpace(line) }],
    };
  }

  // Handle text before the first chord
  if (matches[0].index > 0) {
    const textBeforeFirstChord = line.slice(0, matches[0].index);
    chunks.push({ text: convertUnderscoreToEmSpace(textBeforeFirstChord) });
  }

  // Build chunks by iterating through the matches
  for (let i = 0; i < matches.length; i++) {
    const currentMatch = matches[i];
    const nextMatch = matches[i + 1];

    // Calculate text start position (after the current chord marker)
    const textStart = currentMatch.index + currentMatch.length;

    // Calculate text end position (start of next chord or end of line)
    const textEnd = nextMatch ? nextMatch.index : line.length;

    // Extract the text following this chord
    let text = line.slice(textStart, textEnd);

    // If text is empty (chord at end of line), add a non-breaking space
    // to ensure the chord is positioned correctly above the line
    if (text === '') {
      text = '\u00A0';
    }

    chunks.push({
      chord: currentMatch.chord,
      text: convertUnderscoreToEmSpace(text),
    });
  }

  return {
    chunks,
  };
}

/**
 * Parses a markdown-like song format with chords into a structured ParsedSong object.
 *
 * Format:
 * - `# Text` - Song title (type: 'title')
 * - `## Text` - Section/verse (type: 'section')
 * - `[Chord]` - Chord notation, each chord and its following text become a chunk
 * - Line breaks are preserved
 *
 * @param input - The raw song text in markdown-like format
 * @returns A ParsedSong object containing all sections with their lines and chords
 */
export function parseSong(input: string): ParsedSong {
  // Parse frontmatter metadata if present
  const { metadata, remainingInput } = parseMetadata(input);

  const lines = remainingInput.split('\n');
  const sections: Section[] = [];
  let currentSection: Section | null = null;

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Check for title (# Text)
    if (trimmedLine.startsWith('# ') && !trimmedLine.startsWith('## ')) {
      const titleName = trimmedLine.slice(2).trim();
      currentSection = {
        type: 'title',
        name: titleName,
        lines: [],
      };
      sections.push(currentSection);
      continue;
    }

    // Check for section header (## Text)
    if (trimmedLine.startsWith('## ')) {
      const sectionName = trimmedLine.slice(3).trim();
      currentSection = {
        type: 'section',
        name: sectionName,
        lines: [],
      };
      sections.push(currentSection);
      continue;
    }

    // Regular line (possibly with chords)
    if (currentSection) {
      // Preserve empty lines as empty TextLine objects
      if (trimmedLine === '') {
        currentSection.lines.push({
          chunks: [{ text: '' }],
        });
      } else {
        currentSection.lines.push(parseLine(line));
      }
    } else if (trimmedLine !== '') {
      // Line without a section - create an implicit section
      currentSection = {
        type: 'section',
        name: '',
        lines: [parseLine(line)],
      };
      sections.push(currentSection);
    }
  }

  return {
    metadata,
    sections,
  };
}
