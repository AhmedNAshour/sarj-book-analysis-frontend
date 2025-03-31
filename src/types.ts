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
    strength: number;
    description: string;
  }
  
  export interface BookAnalysisMetadata {
    consistencyKey: number;
    chunksProcessed: number;
    characterCount: number;
    relationshipCount: number;
  }
  
  export interface BookAnalysis {
    bookId: string;
    title: string;
    author: string;
    analysis: {
      characters: Character[];
      relationships: Relationship[];
      meta: BookAnalysisMetadata;
    };
  }
  
  // For D3 force-directed graph
  export interface Node {
    id: string;
    name: string;
    value: number; // mentions count
    importance: string;
    description: string;
    aliases: string[];
  }
  
  export interface Link {
    source: string;
    target: string;
    value: number; // relationship strength
    type: string;
    description: string;
  }
  
  export interface GraphData {
    nodes: Node[];
    links: Link[];
  }