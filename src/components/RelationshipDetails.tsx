import { useState } from 'react';
import { Relationship, Character, Interaction } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowRightLeft, ArrowRight, Users } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RelationshipDetailProps {
  relationships: Relationship[];
  characters: Character[];
  interactions?: Interaction[];
  selectedCharacter?: string;
}

interface RelationshipPair {
  source: string;
  target: string;
  sourceToTarget?: Relationship;
  targetToSource?: Relationship;
}

const RelationshipDetail = ({ relationships, characters, interactions = [], selectedCharacter }: RelationshipDetailProps) => {
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
        <Tabs defaultValue="relationships">
          <TabsList className="mb-4">
            <TabsTrigger value="relationships">Relationships</TabsTrigger>
            <TabsTrigger value="interactions">Interactions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="relationships">
            {viewMode === 'grouped' ? (
              <div className="space-y-3">
                {filteredPairs.length > 0 ? (
                  filteredPairs.map((pair, index) => {
                    // Get character importance for styling
                    const sourceImportance = getCharacterImportance(pair.source);
                    const targetImportance = getCharacterImportance(pair.target);
                    
                    // Get maximum strength for better visualization
                    const maxStrength = Math.max(
                      pair.sourceToTarget?.strength || 0,
                      pair.targetToSource?.strength || 0
                    );
                    
                    return (
                      <div key={index} className="border rounded-md p-3 hover:bg-gray-50">
                        <div className="flex justify-between mb-2">
                          <div className="flex gap-2 items-center">
                            <Badge variant={sourceImportance === 'major' ? 'default' : 'outline'}>
                              {pair.source}
                            </Badge>
                            <ArrowRightLeft className="h-4 w-4 text-gray-500" />
                            <Badge variant={targetImportance === 'major' ? 'default' : 'outline'}>
                              {pair.target}
                            </Badge>
                          </div>
                          <Badge variant="outline" className={getStrengthColor(maxStrength)}>
                            {getStrengthText(maxStrength)}
                          </Badge>
                        </div>
                        
                        {pair.sourceToTarget && (
                          <div className="mb-2 border-b pb-2">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <ArrowRight className="h-3 w-3 mr-1 text-gray-500" />
                                <span className="text-sm font-medium">{pair.source} → {pair.target}</span>
                              </div>
                              <Badge variant="outline" className={getRelationshipTypeStyle(pair.sourceToTarget.type)}>
                                {pair.sourceToTarget.type}
                              </Badge>
                            </div>
                            <p className="text-sm mt-1 text-gray-600">{pair.sourceToTarget.description}</p>
                            {pair.sourceToTarget.status && (
                              <Badge variant="secondary" className="mt-1 text-xs">
                                {pair.sourceToTarget.status}
                              </Badge>
                            )}
                            {pair.sourceToTarget.numberOfInteractions && (
                              <div className="mt-2 text-xs flex justify-end">
                                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                  {pair.sourceToTarget.numberOfInteractions} interactions
                                </Badge>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {pair.targetToSource && (
                          <div>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <ArrowRight className="h-3 w-3 mr-1 text-gray-500" />
                                <span className="text-sm font-medium">{pair.target} → {pair.source}</span>
                              </div>
                              <Badge variant="outline" className={getRelationshipTypeStyle(pair.targetToSource.type)}>
                                {pair.targetToSource.type}
                              </Badge>
                            </div>
                            <p className="text-sm mt-1 text-gray-600">{pair.targetToSource.description}</p>
                            {pair.targetToSource.status && (
                              <Badge variant="secondary" className="mt-1 text-xs">
                                {pair.targetToSource.status}
                              </Badge>
                            )}
                            {pair.targetToSource.numberOfInteractions && (
                              <div className="mt-2 text-xs flex justify-end">
                                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                  {pair.targetToSource.numberOfInteractions} interactions
                                </Badge>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No relationships found matching your search
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRelationships.length > 0 ? (
                  filteredRelationships.map((rel, index) => {
                    const sourceImportance = getCharacterImportance(rel.source);
                    const targetImportance = getCharacterImportance(rel.target);
                    
                    return (
                      <div key={index} className="border rounded-md p-3 hover:bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex gap-1 items-center">
                            <Badge variant={sourceImportance === 'major' ? 'default' : 'outline'}>
                              {rel.source}
                            </Badge>
                            <ArrowRight className="h-4 w-4 text-gray-500" />
                            <Badge variant={targetImportance === 'major' ? 'default' : 'outline'}>
                              {rel.target}
                            </Badge>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge variant="outline" className={getStrengthColor(rel.strength)}>
                              {getStrengthText(rel.strength)}
                            </Badge>
                            {rel.numberOfInteractions && (
                              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                {rel.numberOfInteractions} interactions
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <Badge variant="outline" className={getRelationshipTypeStyle(rel.type)}>
                          {rel.type}
                        </Badge>
                        
                        <p className="text-sm mt-2 text-gray-600">{rel.description}</p>
                        
                        {rel.status && (
                          <div className="mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {rel.status}
                            </Badge>
                          </div>
                        )}
                        
                        {rel.evidence && (
                          <div className="mt-2 text-xs text-gray-500">
                            <strong>Evidence:</strong> {rel.evidence}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No relationships found matching your search
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="interactions">
            <div className="space-y-3">
              {interactions.length > 0 ? (
                <ScrollArea className="h-[400px]">
                  {interactions
                    .filter(interaction => 
                      !selectedCharacter || 
                      interaction.characters.includes(selectedCharacter)
                    )
                    .filter(interaction => 
                      searchTerm === '' || 
                      interaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      interaction.characters.some(char => 
                        char.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                    )
                    .map((interaction, index) => (
                      <div key={index} className="border rounded-md p-3 mb-3 hover:bg-gray-50">
                        <div className="flex flex-wrap gap-1 mb-2">
                          {interaction.characters.map((char, i) => (
                            <Badge 
                              key={i} 
                              variant={getCharacterImportance(char) === 'major' ? 'default' : 'outline'}
                            >
                              {char}
                            </Badge>
                          ))}
                        </div>
                        
                        <p className="text-sm">{interaction.description}</p>
                        
                        <div className="flex justify-between mt-2 text-xs text-gray-500">
                          {interaction.context && (
                            <span><strong>Context:</strong> {interaction.context}</span>
                          )}
                          {interaction.type && (
                            <Badge variant="outline">
                              {interaction.type}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))
                  }
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <Users className="h-12 w-12 mb-4 text-gray-300" />
                  <p>No character interactions available</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RelationshipDetail;