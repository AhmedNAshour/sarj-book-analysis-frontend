import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Book, Zap, SearchCheck } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface SearchInputProps {
  onSearch: (bookId: string, analysisType: 'fast' | 'detailed') => void;
  isLoading: boolean;
}

// Sample book suggestions
const SAMPLE_BOOKS = [
  { id: '1787', title: 'Hamlet', author: 'William Shakespeare' },
  { id: '1342', title: 'Pride and Prejudice', author: 'Jane Austen' },
  { id: '84', title: 'Frankenstein', author: 'Mary Shelley' },
  { id: '1661', title: 'The Adventures of Sherlock Holmes', author: 'Arthur Conan Doyle' },
  { id: '2701', title: 'Moby-Dick', author: 'Herman Melville' },
];

const SearchInput: React.FC<SearchInputProps> = ({ onSearch, isLoading }) => {
  const [bookId, setBookId] = useState<string>('');
  const [open, setOpen] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<typeof SAMPLE_BOOKS>([]);
  const [analysisType, setAnalysisType] = useState<'fast' | 'detailed'>('fast');

  useEffect(() => {
    // Filter suggestions based on input
    if (bookId.trim() === '') {
      setSuggestions(SAMPLE_BOOKS);
    } else {
      const filtered = SAMPLE_BOOKS.filter(book => 
        book.id.includes(bookId) || 
        book.title.toLowerCase().includes(bookId.toLowerCase()) ||
        book.author.toLowerCase().includes(bookId.toLowerCase())
      );
      setSuggestions(filtered);
    }
  }, [bookId]);

  const handleSearch = () => {
    if (bookId.trim()) {
      onSearch(bookId.trim(), analysisType);
      setOpen(false);
    }
  };

  const handleSelectSuggestion = (id: string) => {
    setBookId(id);
    setOpen(false);
  };

  return (
    <div className="relative w-full">
      <div className="flex flex-col gap-4">
        <div className="relative flex-grow">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Enter book ID (e.g., 1787 for Hamlet)"
                  value={bookId}
                  onChange={(e) => setBookId(e.target.value)}
                  onClick={() => setOpen(true)}
                  className="pl-9"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[300px]" align="start">
              <Command>
                <CommandInput 
                  placeholder="Search books..." 
                  value={bookId} 
                  onValueChange={setBookId} 
                />
                <CommandList>
                  <CommandEmpty>No matching books found</CommandEmpty>
                  <CommandGroup>
                    {suggestions.map((book) => (
                      <CommandItem 
                        key={book.id} 
                        onSelect={() => handleSelectSuggestion(book.id)}
                        className="flex items-center gap-2"
                      >
                        <Book className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="font-medium">{book.title}</div>
                          <div className="text-xs text-gray-500">{book.author} (ID: {book.id})</div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="border rounded-md p-3 bg-gray-50">
          <p className="text-sm font-medium mb-2">Analysis Type</p>
          <RadioGroup value={analysisType} onValueChange={(value: 'fast' | 'detailed') => setAnalysisType(value)} className="flex flex-col gap-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="fast" id="fast" />
              <Label htmlFor="fast" className="flex items-center cursor-pointer">
                <Zap className="h-4 w-4 mr-2 text-amber-500" />
                <div>
                  <span className="font-medium">Fast Analysis</span>
                  <p className="text-xs text-gray-500">Quicker results, less detailed (larger chunks)</p>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="detailed" id="detailed" />
              <Label htmlFor="detailed" className="flex items-center cursor-pointer">
                <SearchCheck className="h-4 w-4 mr-2 text-blue-500" />
                <div>
                  <span className="font-medium">Detailed Analysis</span>
                  <p className="text-xs text-gray-500">More thorough results, slower (smaller chunks)</p>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>
        
        <Button 
          onClick={handleSearch} 
          disabled={isLoading || !bookId.trim()}
          className="w-full sm:w-auto self-end"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            "Analyze Book"
          )}
        </Button>
      </div>
    </div>
  );
};

export default SearchInput;