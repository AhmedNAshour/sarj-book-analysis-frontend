import { useState } from 'react';
import { Relationship, Character } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowRightLeft, ArrowRight } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";

interface RelationshipDetailProps {
  relationships: Relationship[];
  characters: Character[];
  selectedCharacter?: string;
}

interface RelationshipPair {
  source: string;
  target: string;
  sourceToTarget?: Relationship;
  targetToSource?: Relationship;
}

const RelationshipDetail = ({ relationships, characters, selectedCharacter }: RelationshipDetailProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grouped' | 'individual'>('grouped');

  // Group relationships into bi-directional pairs
  const relationshipPairs: RelationshipPair[] = relationships.reduce((pairs: RelationshipPair[], rel) => {
    // First, check if this relationship's reversed pair already exists in our array
    const existingPairIndex = pairs.findIndex(
      p => (p.source === rel.target && p.target === rel.source)
    );
    
    if (existingPairIndex >= 0) {
      // If reversed pair exists, add this relationship to it
      pairs[existingPairIndex] = {
        ...pairs[existingPairIndex],
        targetToSource: rel
      };
    } else {
      // Check if we already have this exact pair
      const exactPairIndex = pairs.findIndex(
        p => (p.source === rel.source && p.target === rel.target)
      );
      
      if (exactPairIndex >= 0) {
        // Update the existing exact pair
        pairs[exactPairIndex] = {
          ...pairs[exactPairIndex],
          sourceToTarget: rel
        };
      } else {
        // Create a new pair
        pairs.push({
          source: rel.source,
          target: rel.target,
          sourceToTarget: rel
        });
      }
    }
    
    return pairs;
  }, []);

  // Sort and filter relationship pairs
  const filteredPairs = relationshipPairs.filter(pair => {
    // If there's a selected character, only show relationships involving that character
    if (selectedCharacter && pair.source !== selectedCharacter && pair.target !== selectedCharacter) {
      return false;
    }

    // Apply search term filtering to both directions
    const matchesSearch = (
      pair.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pair.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pair.sourceToTarget?.type.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (pair.targetToSource?.type.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (pair.sourceToTarget?.status?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (pair.targetToSource?.status?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (pair.sourceToTarget?.description.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (pair.targetToSource?.description.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    );
    
    return matchesSearch;
  }).sort((a, b) => {
    // Calculate average strength for sorting
    const aMaxStrength = Math.max(
      a.sourceToTarget?.strength || 0,
      a.targetToSource?.strength || 0
    );
    
    const bMaxStrength = Math.max(
      b.sourceToTarget?.strength || 0,
      b.targetToSource?.strength || 0
    );
    
    return bMaxStrength - aMaxStrength;
  });

  // Individual relationships filtering for "individual" view mode
  const filteredRelationships = relationships.filter(rel => {
    // If there's a selected character, only show relationships involving that character
    if (selectedCharacter && rel.source !== selectedCharacter && rel.target !== selectedCharacter) {
      return false;
    }

    // Apply search term filtering
    return (
      rel.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rel.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rel.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rel.status?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      rel.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }).sort((a, b) => b.strength - a.strength);

  // Helper to get character importance
  const getCharacterImportance = (name: string): string => {
    const character = characters.find(c => c.name === name);
    return character ? character.importance : 'unknown';
  };

  // Helper for relationship strength text
  const getStrengthText = (strength: number): string => {
    if (strength >= 10) return 'Very Strong';
    if (strength >= 7) return 'Strong';
    if (strength >= 4) return 'Moderate';
    if (strength >= 2) return 'Weak';
    return 'Very Weak';
  };

  // Helper for strength color
  const getStrengthColor = (strength: number): string => {
    if (strength >= 10) return 'bg-purple-700 text-white';
    if (strength >= 7) return 'bg-purple-500 text-white';
    if (strength >= 4) return 'bg-purple-300 text-purple-900';
    if (strength >= 2) return 'bg-purple-200 text-purple-900';
    return 'bg-purple-100 text-purple-900';
  };

  // Helper for relationship type styling
  const getRelationshipTypeStyle = (type: string): string => {
    const types: Record<string, string> = {
      'friendship': 'bg-green-100 text-green-800 border-green-200',
      'romantic': 'bg-pink-100 text-pink-800 border-pink-200',
      'family': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'adversarial': 'bg-red-100 text-red-800 border-red-200',
      'professional': 'bg-blue-100 text-blue-800 border-blue-200',
      'mentor': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    };

    // Check if the type contains any of our known keywords
    for (const [keyword, style] of Object.entries(types)) {
      if (type.toLowerCase().includes(keyword.toLowerCase())) {
        return style;
      }
    }

    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Character Relationships</CardTitle>
        <CardDescription>
          {selectedCharacter 
            ? `Showing relationships for ${selectedCharacter}`
            : 'Explore relationships between characters'
          }
        </CardDescription>
        <div className="flex flex-col sm:flex-row gap-2 justify-between items-start mt-2">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search relationships..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 items-center">
            <Toggle
              size="sm"
              variant="outline"
              pressed={viewMode === 'grouped'} 
              onPressedChange={() => setViewMode('grouped')}
              className="flex items-center gap-1"
            >
              <ArrowRightLeft className="h-4 w-4 mr-1" />
              Grouped
            </Toggle>
            <Toggle
              size="sm"
              variant="outline"
              pressed={viewMode === 'individual'} 
              onPressedChange={() => setViewMode('individual')}
              className="flex items-center gap-1"
            >
              <ArrowRight className="h-4 w-4 mr-1" />
              Individual
            </Toggle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {viewMode === 'grouped' ? (
            // Grouped view
            filteredPairs.length > 0 ? (
              filteredPairs.map((pair, idx) => (
                <div key={idx} className="border rounded-md p-4">
                  <div className="flex flex-col sm:flex-row justify-between mb-4">
                    <div className="flex items-center gap-2 mb-2 sm:mb-0">
                      <span className="font-medium">{pair.source}</span>
                      <ArrowRightLeft className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{pair.target}</span>
                    </div>
                  </div>
                  
                  {/* Source to Target Relationship */}
                  {pair.sourceToTarget && (
                    <div className="mb-4 border-l-2 pl-3 border-blue-300">
                      <div className="text-sm font-medium mb-1 flex items-center">
                        <ArrowRight className="h-4 w-4 mr-1 text-blue-500" />
                        {pair.source} → {pair.target}
                      </div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge className={getRelationshipTypeStyle(pair.sourceToTarget.type)}>
                          {pair.sourceToTarget.type}
                        </Badge>
                        <Badge className={getStrengthColor(pair.sourceToTarget.strength)}>
                          {getStrengthText(pair.sourceToTarget.strength)} ({pair.sourceToTarget.strength})
                        </Badge>
                      </div>
                      
                      {pair.sourceToTarget.status && (
                        <div className="mb-2">
                          <span className="text-sm text-gray-500">Status: </span>
                          <span className="text-sm font-medium">{pair.sourceToTarget.status}</span>
                        </div>
                      )}
                      
                      <p className="text-sm text-gray-600 mb-2">{pair.sourceToTarget.description}</p>
                    </div>
                  )}
                  
                  {/* Target to Source Relationship */}
                  {pair.targetToSource && (
                    <div className="border-l-2 pl-3 border-purple-300">
                      <div className="text-sm font-medium mb-1 flex items-center">
                        <ArrowRight className="h-4 w-4 mr-1 text-purple-500" />
                        {pair.target} → {pair.source}
                      </div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge className={getRelationshipTypeStyle(pair.targetToSource.type)}>
                          {pair.targetToSource.type}
                        </Badge>
                        <Badge className={getStrengthColor(pair.targetToSource.strength)}>
                          {getStrengthText(pair.targetToSource.strength)} ({pair.targetToSource.strength})
                        </Badge>
                      </div>
                      
                      {pair.targetToSource.status && (
                        <div className="mb-2">
                          <span className="text-sm text-gray-500">Status: </span>
                          <span className="text-sm font-medium">{pair.targetToSource.status}</span>
                        </div>
                      )}
                      
                      <p className="text-sm text-gray-600 mb-2">{pair.targetToSource.description}</p>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    {/* Show metadata if either relationship has it */}
                    {(pair.sourceToTarget?.arcSpan || pair.targetToSource?.arcSpan) && (
                      <div className="text-xs px-2 py-1 bg-gray-100 rounded-md">
                        Arc Span: <span className="font-medium">
                          {pair.sourceToTarget?.arcSpan || pair.targetToSource?.arcSpan}
                        </span>
                      </div>
                    )}
                    
                    {(pair.sourceToTarget?.appearanceCount || pair.targetToSource?.appearanceCount) && (
                      <div className="text-xs px-2 py-1 bg-gray-100 rounded-md">
                        Appearances: <span className="font-medium">
                          {pair.sourceToTarget?.appearanceCount || pair.targetToSource?.appearanceCount}
                        </span>
                      </div>
                    )}
                    
                    {(pair.sourceToTarget?.developmentPattern || pair.targetToSource?.developmentPattern) && (
                      <div className="text-xs px-2 py-1 bg-gray-100 rounded-md">
                        Development: <span className="font-medium">
                          {pair.sourceToTarget?.developmentPattern || pair.targetToSource?.developmentPattern}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                {searchTerm 
                  ? `No relationships found matching '${searchTerm}'`
                  : selectedCharacter 
                    ? `No relationships found for ${selectedCharacter}`
                    : 'No relationships to display'
                }
              </div>
            )
          ) : (
            // Individual view (original)
            filteredRelationships.length > 0 ? (
              filteredRelationships.map((rel, idx) => (
                <div key={idx} className="border rounded-md p-4">
                  <div className="flex flex-col sm:flex-row justify-between mb-2">
                    <div className="flex items-center gap-2 mb-2 sm:mb-0">
                      <span className="font-medium">{rel.source}</span>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{rel.target}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getRelationshipTypeStyle(rel.type)}>
                        {rel.type}
                      </Badge>
                      <Badge className={getStrengthColor(rel.strength)}>
                        {getStrengthText(rel.strength)} ({rel.strength})
                      </Badge>
                    </div>
                  </div>
                  
                  {rel.status && (
                    <div className="mb-2">
                      <span className="text-sm text-gray-500">Status: </span>
                      <span className="text-sm font-medium">{rel.status}</span>
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-600 mb-3">{rel.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {rel.arcSpan && (
                      <div className="text-xs px-2 py-1 bg-gray-100 rounded-md">
                        Arc Span: <span className="font-medium">{rel.arcSpan}</span>
                      </div>
                    )}
                    
                    {rel.appearanceCount && (
                      <div className="text-xs px-2 py-1 bg-gray-100 rounded-md">
                        Appearances: <span className="font-medium">{rel.appearanceCount}</span>
                      </div>
                    )}
                    
                    {rel.developmentPattern && (
                      <div className="text-xs px-2 py-1 bg-gray-100 rounded-md">
                        Development: <span className="font-medium">{rel.developmentPattern}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                {searchTerm 
                  ? `No relationships found matching '${searchTerm}'`
                  : selectedCharacter 
                    ? `No relationships found for ${selectedCharacter}`
                    : 'No relationships to display'
                }
              </div>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RelationshipDetail;