// types.ts - Updated types for the new response format

export interface Character {
  name: string;
  aliases: string[];
  description: string;
  importance: 'major' | 'supporting' | 'minor';
  mentions: number;
}

export interface Relationship {
  source: string;
  target: string;
  type: string;
  description: string;
  strength: number;
  status?: string;
}

export interface BookAnalysisMeta {
  consistencyKey: number;
  chunksProcessed: number;
  characterCount: number;
  relationshipCount: number;
  relationshipPairsCount?: number;
  bidirectionalAnalysis?: boolean;
  analysisDate?: string;
}

export interface BookAnalysis {
  bookId: string;
  title: string;
  author: string;
  analysis: {
    characters: Character[];
    relationships: Relationship[];
    meta: BookAnalysisMeta;
  }
}

export interface GraphData {
  nodes: Node[];
  links: Link[];
}

export interface Node {
  id: string;
  name: string;
  value: number;
  importance: string;
  description: string;
  aliases: string[];
}

export interface Link {
  source: string;
  target: string;
  value: number;
  type: string;
  description: string;
  status?: string;
}