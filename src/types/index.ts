export interface ChordPosition {
  chord: string;
  position: number; // character position in the text
}

export interface TextLine {
  text: string;
  chords: ChordPosition[];
}

export interface Section {
  type: 'title' | 'section';
  name: string;
  lines: TextLine[];
}

export interface ParsedSong {
  sections: Section[];
}
