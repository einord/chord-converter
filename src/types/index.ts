export interface Chunk {
  chord?: string;  // The chord (if any) at this position
  text: string;    // The text following the chord
}

export interface TextLine {
  chunks: Chunk[];
}

export interface Section {
  type: 'title' | 'section';
  name: string;
  lines: TextLine[];
}

export interface ParsedSong {
  sections: Section[];
}
