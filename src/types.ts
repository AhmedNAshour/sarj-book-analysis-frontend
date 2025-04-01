// types.ts - Updated types for the new response format

export interface Character {
  name: string;
  aliases: string[];
  description: string;
  importance: 'major' | 'supporting' | 'minor';
  mentions: number;
  arcSpan?: number;
  appearanceCount?: number;
  presencePattern?: string;
}

export interface Relationship {
  source: string;
  target: string;
  type: string;
  description: string;
  strength: number;
  status?: string;
  arcSpan?: number;
  appearanceCount?: number;
  developmentPattern?: string;
}

export interface BookAnalysisMeta {
  consistencyKey: number;
  chunksProcessed: number;
  characterCount: number;
  relationshipCount: number;
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
  arcSpan?: number;
  appearanceCount?: number;
  presencePattern?: string;
}

export interface Link {
  source: string;
  target: string;
  value: number;
  type: string;
  description: string;
  status?: string;
  arcSpan?: number;
  appearanceCount?: number;
  developmentPattern?: string;
}