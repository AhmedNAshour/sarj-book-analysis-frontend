import React, { useState } from 'react';
import { Character } from '../types';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Info, Search } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CharacterListProps {
  characters: Character[];
}

const CharacterList = ({ characters }: CharacterListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'mentions' | 'alphabetical' | 'arcSpan' | 'appearanceCount'>('mentions');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  const filteredCharacters = characters.filter(char => 
    char.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    char.aliases.some(alias => alias.toLowerCase().includes(searchTerm.toLowerCase())) ||
    char.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedCharacters = [...filteredCharacters].sort((a, b) => {
    if (sortBy === 'mentions') {
      return b.mentions - a.mentions;
    } else if (sortBy === 'arcSpan') {
      return (b.arcSpan || 0) - (a.arcSpan || 0);
    } else if (sortBy === 'appearanceCount') {
      return (b.appearanceCount || 0) - (a.appearanceCount || 0);
    } else {
      return a.name.localeCompare(b.name);
    }
  });

  const importanceColor = (importance: string) => {
    switch (importance) {
      case 'major':
        return 'bg-blue-500 text-white';
      case 'supporting':
        return 'bg-blue-300 text-blue-900';
      case 'minor':
        return 'bg-blue-100 text-blue-900';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };
  
  const openCharacterModal = (character: Character) => {
    setSelectedCharacter(character);
  };

  const closeCharacterModal = () => {
    setSelectedCharacter(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search characters..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as 'mentions' | 'alphabetical' | 'arcSpan' | 'appearanceCount')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mentions">Sort by Mentions</SelectItem>
              <SelectItem value="alphabetical">Sort Alphabetically</SelectItem>
              <SelectItem value="arcSpan">Sort by Arc Span</SelectItem>
              <SelectItem value="appearanceCount">Sort by Appearances</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="w-full min-w-max">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Character</TableHead>
                  <TableHead>Importance</TableHead>
                  <TableHead className="text-right">Mentions</TableHead>
                  <TableHead className="text-center">Appearances</TableHead>
                  <TableHead className="text-center">Arc Span</TableHead>
                  <TableHead className="w-[100px] text-center">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedCharacters.map((character) => (
                  <TableRow 
                    key={character.name}
                    onClick={() => openCharacterModal(character)}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <TableCell className="font-medium">
                      {character.name}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${importanceColor(character.importance)} capitalize`}>
                        {character.importance}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{character.mentions}</TableCell>
                    <TableCell className="text-center">{character.appearanceCount || 'N/A'}</TableCell>
                    <TableCell className="text-center">{character.arcSpan || 'N/A'}</TableCell>
                    <TableCell className="text-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button 
                              type="button"
                              className="inline-flex justify-center items-center text-blue-500 hover:text-blue-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                openCharacterModal(character);
                              }}
                              aria-label={`View details for ${character.name}`}
                            >
                              <Info className="h-4 w-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View detailed information about {character.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))}
                {sortedCharacters.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      No characters found matching '{searchTerm}'
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Character Details Modal */}
      <Dialog open={!!selectedCharacter} onOpenChange={closeCharacterModal}>
        <DialogContent className="sm:max-w-md">
          {selectedCharacter && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedCharacter.name}</DialogTitle>
                <DialogDescription>
                  <Badge className={`${importanceColor(selectedCharacter.importance)} capitalize mt-2`}>
                    {selectedCharacter.importance} character
                  </Badge>
                  <span className="ml-2 text-sm">
                    {selectedCharacter.mentions} mentions
                  </span>
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                {selectedCharacter.aliases.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 mb-2">Also known as:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCharacter.aliases.map(alias => (
                        <Badge key={alias} variant="outline">{alias}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 mb-2">Description:</h4>
                  <p className="text-sm">{selectedCharacter.description}</p>
                </div>
                
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {selectedCharacter.appearanceCount && (
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-medium">{selectedCharacter.appearanceCount}</div>
                      <div className="text-xs text-gray-500">Appearances</div>
                    </div>
                  )}
                  
                  {selectedCharacter.arcSpan && (
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-medium">{selectedCharacter.arcSpan}</div>
                      <div className="text-xs text-gray-500">Arc Span</div>
                    </div>
                  )}
                  
                  {selectedCharacter.presencePattern && (
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-medium text-xs capitalize">{selectedCharacter.presencePattern}</div>
                      <div className="text-xs text-gray-500">Presence</div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CharacterList;