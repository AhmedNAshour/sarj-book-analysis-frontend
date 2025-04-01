import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Character, Relationship } from '../types';
import { Users, Link as LinkIcon, Award, Zap, Calendar, ArrowRightLeft } from "lucide-react";

interface BookStatsCardProps {
  title?: string;
  author?: string;
  bookId?: string;
  characters: Character[];
  relationships: Relationship[];
}

const BookStatsCard: React.FC<BookStatsCardProps> = ({
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

  // Analyze bi-directional relationships
  const relationshipPairs = new Map<string, { source: string, target: string, sourceToTarget?: Relationship, targetToSource?: Relationship }>();
  
  relationships.forEach(rel => {
    const pairKey = [rel.source, rel.target].sort().join('->');
    if (!relationshipPairs.has(pairKey)) {
      relationshipPairs.set(pairKey, { source: rel.source, target: rel.target });
    }
    
    const pair = relationshipPairs.get(pairKey)!;
    if (rel.source === pair.source && rel.target === pair.target) {
      pair.sourceToTarget = rel;
    } else {
      pair.targetToSource = rel;
    }
  });
  
  // Count bidirectional relationship pairs
  const totalPairs = relationshipPairs.size;
  const bidirectionalPairs = Array.from(relationshipPairs.values())
    .filter(pair => pair.sourceToTarget && pair.targetToSource).length;
  const bidirectionalPercentage = Math.round((bidirectionalPairs / totalPairs) * 100);

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
          
          {/* Relationship Dynamics - Simplified */}
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
            </div>
          </div>
          
          {/* Bi-directional Relationship Stats */}
          <div className="bg-teal-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <ArrowRightLeft className="h-5 w-5 text-teal-500" />
              <h3 className="font-medium">Relationship Perspectives</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Character Pairs</span>
                <span className="text-sm font-medium">{totalPairs}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Bi-directional Pairs</span>
                <span className="text-sm font-medium">{bidirectionalPairs}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Bi-directional Coverage</span>
                <span className="text-sm font-medium">{bidirectionalPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div 
                  className="bg-teal-500 h-2.5 rounded-full" 
                  style={{ width: `${bidirectionalPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* Analysis Meta Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              <h3 className="font-medium">Analysis Details</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span>Book Coverage</span>
                <span className="font-medium">Basic Analysis</span>
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