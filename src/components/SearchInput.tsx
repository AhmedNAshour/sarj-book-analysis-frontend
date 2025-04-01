import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Book } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface SearchInputProps {
  onSearch: (bookId: string) => void;
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
      onSearch(bookId.trim());
      setOpen(false);
    }
  };

  const handleSelectSuggestion = (id: string) => {
    setBookId(id);
    onSearch(id);
    setOpen(false);
  };

  return (
    <div className="relative w-full">
      <div className="flex gap-4">
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
        <Button 
          onClick={handleSearch} 
          disabled={isLoading || !bookId.trim()}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            "Analyze"
          )}
        </Button>
      </div>
    </div>
  );
};

export default SearchInput;