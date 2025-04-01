import { useState } from 'react';
import { Relationship, Character } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";

interface RelationshipDetailProps {
  relationships: Relationship[];
  characters: Character[];
  selectedCharacter?: string;
}

const RelationshipDetail = ({ relationships, characters, selectedCharacter }: RelationshipDetailProps) => {
  const [searchTerm, setSearchTerm] = useState('');

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
  });

  // Sort by relationship strength
  const sortedRelationships = [...filteredRelationships].sort((a, b) => b.strength - a.strength);

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
        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search relationships..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedRelationships.length > 0 ? (
            sortedRelationships.map((rel, idx) => (
              <div key={idx} className="border rounded-md p-4">
                <div className="flex flex-col sm:flex-row justify-between mb-2">
                  <div className="flex items-center gap-2 mb-2 sm:mb-0">
                    <span className="font-medium">{rel.source}</span>
                    <span className="text-gray-400">to</span>
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
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RelationshipDetail;