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

export interface SongMetadata {
  musik?: string;
  text?: string;
  copyright?: string;
}

export interface ParsedSong {
  sections: Section[];
  metadata?: SongMetadata;
}
