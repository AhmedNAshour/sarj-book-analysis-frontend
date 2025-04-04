import { useState, useEffect } from 'react';
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface CharacterListProps {
  characters: Character[];
}

const CharacterList = ({ characters }: CharacterListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'mentions' | 'alphabetical'>('mentions');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredCharacters = characters.filter(char => 
    char.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    char.aliases.some(alias => alias.toLowerCase().includes(searchTerm.toLowerCase())) ||
    char.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedCharacters = [...filteredCharacters].sort((a, b) => {
    if (sortBy === 'mentions') {
      return b.mentions - a.mentions;
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

  // Pagination function
  const paginateCharacters = (chars: Character[], page: number, perPage: number) => {
    const startIndex = (page - 1) * perPage;
    return chars.slice(startIndex, startIndex + perPage);
  };

  // Get paginated characters
  const paginatedCharacters = paginateCharacters(sortedCharacters, currentPage, itemsPerPage);
  
  // Calculate total pages
  const totalPages = Math.ceil(sortedCharacters.length / itemsPerPage);
  
  // Reset to page 1 when filters or sorting changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy]);

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
            onValueChange={(value) => setSortBy(value as 'mentions' | 'alphabetical')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mentions">Sort by Mentions</SelectItem>
              <SelectItem value="alphabetical">Sort Alphabetically</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="max-h-[500px] overflow-hidden">
            <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
              <Table className="min-w-[500px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Character</TableHead>
                    <TableHead className="w-[120px]">Importance</TableHead>
                    <TableHead className="text-right w-[100px]">Mentions</TableHead>
                    <TableHead className="w-[80px] text-center">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCharacters.map((character) => (
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
                  {paginatedCharacters.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6">
                        No characters found matching '{searchTerm}'
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          
          {sortedCharacters.length > itemsPerPage && (
            <div className="border-t p-2">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      aria-disabled={currentPage === 1}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {Array.from({length: Math.min(5, totalPages)}, (_, i) => {
                    // Show 5 pages max with current page in the middle when possible
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else {
                      const middleIndex = Math.min(Math.max(currentPage, 3), totalPages - 2);
                      pageNum = i + middleIndex - 2;
                    }
                    
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink 
                          isActive={currentPage === pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      aria-disabled={currentPage === totalPages}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Character Details Modal */}
      <Dialog open={!!selectedCharacter} onOpenChange={closeCharacterModal}>
        <DialogContent className="w-[90vw] max-w-md mx-auto">
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
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CharacterList;