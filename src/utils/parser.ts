import type { ChordPosition, TextLine, Section, ParsedSong } from '../types';

/**
 * Parses a single line of text containing chord notations in [Chord] format.
 * Extracts chords and calculates their positions in the resulting clean text.
 *
 * @param line - The input line potentially containing [Chord] patterns
 * @returns A TextLine object with clean text and chord positions
 */
function parseLine(line: string): TextLine {
  const chords: ChordPosition[] = [];
  const chordPattern = /\[([^\]]+)\]/g;

  let match: RegExpExecArray | null;
  let cleanText = '';
  let lastIndex = 0;

  while ((match = chordPattern.exec(line)) !== null) {
    // Add text before this chord to the clean text
    const textBefore = line.slice(lastIndex, match.index);
    cleanText += textBefore;

    // Calculate the position in the clean text where this chord appears
    const chordPosition = cleanText.length;

    chords.push({
      chord: match[1],
      position: chordPosition,
    });

    lastIndex = match.index + match[0].length;
  }

  // Add any remaining text after the last chord
  cleanText += line.slice(lastIndex);

  return {
    text: cleanText,
    chords,
  };
}

/**
 * Parses a markdown-like song format with chords into a structured ParsedSong object.
 *
 * Format:
 * - `# Text` - Song title (type: 'title')
 * - `## Text` - Section/verse (type: 'section')
 * - `[Chord]` - Chord notation, position is preserved relative to the text
 * - Line breaks are preserved
 *
 * @param input - The raw song text in markdown-like format
 * @returns A ParsedSong object containing all sections with their lines and chords
 */
export function parseSong(input: string): ParsedSong {
  const lines = input.split('\n');
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
          text: '',
          chords: [],
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
    sections,
  };
}
