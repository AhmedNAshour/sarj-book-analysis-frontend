import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Character, Relationship } from '../types';
import { BookOpen, Users, Link as LinkIcon, Hash, Award, Zap, Clock, Calendar } from "lucide-react";

interface BookStatsCardProps {
  title: string;
  author: string;
  bookId: string;
  characters: Character[];
  relationships: Relationship[];
}

const BookStatsCard: React.FC<BookStatsCardProps> = ({
  title,
  author,
  bookId,
  characters,
  relationships
}) => {
  // Calculate statistics
  const totalCharacters = characters.length;
  const majorCharacters = characters.filter(c => c.importance === 'major').length;
  const supportingCharacters = characters.filter(c => c.importance === 'supporting').length;
  const minorCharacters = characters.filter(c => c.importance === 'minor').length;
  
  const totalRelationships = relationships.length;
  const strongRelationships = relationships.filter(r => r.strength >= 7).length;
  const moderateRelationships = relationships.filter(r => r.strength >= 3 && r.strength < 7).length;
  const weakRelationships = relationships.filter(r => r.strength < 3).length;
  
  const avgMentions = Math.round(characters.reduce((sum, c) => sum + c.mentions, 0) / totalCharacters);
  const maxMentions = Math.max(...characters.map(c => c.mentions));
  const mostMentionedCharacter = characters.find(c => c.mentions === maxMentions)?.name;
  
  const avgRelationshipStrength = Math.round(relationships.reduce((sum, r) => sum + r.strength, 0) / totalRelationships * 10) / 10;
  
  // New metrics for presence patterns
  const presencePatterns = characters.reduce((acc: Record<string, number>, char) => {
    if (char.presencePattern) {
      acc[char.presencePattern] = (acc[char.presencePattern] || 0) + 1;
    }
    return acc;
  }, {});
  
  // Development patterns for relationships
  const developmentPatterns = relationships.reduce((acc: Record<string, number>, rel) => {
    if (rel.developmentPattern) {
      acc[rel.developmentPattern] = (acc[rel.developmentPattern] || 0) + 1;
    }
    return acc;
  }, {});
  
  // Calculate average arc span
  const charactersWithArcSpan = characters.filter(c => c.arcSpan !== undefined);
  const avgCharacterArcSpan = charactersWithArcSpan.length > 0 
    ? Math.round(charactersWithArcSpan.reduce((sum, c) => sum + (c.arcSpan || 0), 0) / charactersWithArcSpan.length * 10) / 10
    : 0;
    
  // Calculate average appearance count
  const charactersWithAppearances = characters.filter(c => c.appearanceCount !== undefined);
  const avgAppearanceCount = charactersWithAppearances.length > 0
    ? Math.round(charactersWithAppearances.reduce((sum, c) => sum + (c.appearanceCount || 0), 0) / charactersWithAppearances.length * 10) / 10
    : 0;
  
  // Count relationship types
  const relationshipTypes = relationships.reduce((acc: Record<string, number>, rel) => {
    // Extract base type (e.g., "friendship" from "close friendship")
    const baseType = rel.type.split(' ')[0].toLowerCase().replace(/-/g, ' ');
    acc[baseType] = (acc[baseType] || 0) + 1;
    return acc;
  }, {});
  
  // Get top 3 relationship types
  const topRelationshipTypes = Object.entries(relationshipTypes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Character Stats */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-blue-500" />
              <h3 className="font-medium">Character Distribution</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Major</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 bg-blue-500 rounded" style={{ width: `${majorCharacters/totalCharacters*100}px` }}></div>
                  <span className="text-sm text-gray-600">{majorCharacters}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Supporting</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 bg-blue-300 rounded" style={{ width: `${supportingCharacters/totalCharacters*100}px` }}></div>
                  <span className="text-sm text-gray-600">{supportingCharacters}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Minor</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 bg-blue-100 rounded" style={{ width: `${minorCharacters/totalCharacters*100}px` }}></div>
                  <span className="text-sm text-gray-600">{minorCharacters}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Relationship Stats */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <LinkIcon className="h-5 w-5 text-purple-500" />
              <h3 className="font-medium">Relationship Types</h3>
            </div>
            <div className="space-y-2">
              {topRelationshipTypes.map(([type, count], idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-sm capitalize">{type}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 bg-purple-500 rounded" style={{ 
                      width: `${count/totalRelationships*100}px`, 
                      opacity: 1 - (idx * 0.2) 
                    }}></div>
                    <span className="text-sm text-gray-600">{count}</span>
                  </div>
                </div>
              ))}
              <div className="text-xs text-gray-500 mt-2">
                {strongRelationships} strong, {moderateRelationships} moderate, {weakRelationships} weak relationships
              </div>
            </div>
          </div>
          
          {/* Key Metrics */}
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-green-500" />
              <h3 className="font-medium">Key Metrics</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Most Mentioned</span>
                <span className="text-sm font-medium">{mostMentionedCharacter}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Avg. Mentions</span>
                <span className="text-sm">{avgMentions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Avg. Relationship Strength</span>
                <span className="text-sm">{avgRelationshipStrength}</span>
              </div>
            </div>
          </div>
          
          {/* Character Presence - New stats section */}
          {(charactersWithArcSpan.length > 0 || charactersWithAppearances.length > 0) && (
            <div className="bg-amber-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-amber-500" />
                <h3 className="font-medium">Character Presence</h3>
              </div>
              <div className="space-y-2">
                {avgCharacterArcSpan > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Avg. Arc Span</span>
                    <span className="text-sm font-medium">{avgCharacterArcSpan}</span>
                  </div>
                )}
                {avgAppearanceCount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Avg. Appearances</span>
                    <span className="text-sm font-medium">{avgAppearanceCount}</span>
                  </div>
                )}
                {Object.entries(presencePatterns).length > 0 && (
                  <div className="mt-2">
                    <span className="text-sm text-gray-500">Presence Patterns:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {Object.entries(presencePatterns).map(([pattern, count]) => (
                        <div key={pattern} className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                          {pattern} ({count})
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Relationship Dynamics - New stats section */}
          {Object.entries(developmentPatterns).length > 0 && (
            <div className="bg-indigo-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-5 w-5 text-indigo-500" />
                <h3 className="font-medium">Relationship Dynamics</h3>
              </div>
              <div className="space-y-2">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Strong Relationships</span>
                    <span className="text-sm font-medium">{strongRelationships}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Moderate Relationships</span>
                    <span className="text-sm font-medium">{moderateRelationships}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Weak Relationships</span>
                    <span className="text-sm font-medium">{weakRelationships}</span>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-gray-500">Development Patterns:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {Object.entries(developmentPatterns).map(([pattern, count]) => (
                      <div key={pattern} className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                        {pattern} ({count})
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Analysis Meta Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              <h3 className="font-medium">Analysis Details</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span>Book Coverage</span>
                <span className="font-medium">
                  {charactersWithArcSpan.length > 0 ? "Full Analysis" : "Basic Analysis"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Total Characters</span>
                <span className="font-medium">{totalCharacters}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Total Relationships</span>
                <span className="font-medium">{totalRelationships}</span>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Analysis includes {characters.filter(c => c.description).length} character descriptions and {relationships.filter(r => r.description).length} relationship descriptions
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookStatsCard;