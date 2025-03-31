import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Book } from "lucide-react";

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
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
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
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (id: string) => {
    setBookId(id);
    onSearch(id);
    setShowSuggestions(false);
  };

  return (
    <div className="relative w-full">
      <div className="flex gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Enter book ID (e.g., 1787 for Hamlet)"
            value={bookId}
            onChange={(e) => {
              setBookId(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => {
              // Delay hiding suggestions to allow for clicks
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            className="pl-9"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
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

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white rounded-md border border-gray-200 shadow-lg max-h-60 overflow-auto">
          <ul className="py-1">
            {suggestions.map((book) => (
              <li 
                key={book.id}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                onClick={() => handleSelectSuggestion(book.id)}
              >
                <Book className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="font-medium">{book.title}</div>
                  <div className="text-sm text-gray-500">{book.author} (ID: {book.id})</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {showSuggestions && suggestions.length === 0 && bookId.trim() !== '' && (
        <div className="absolute z-10 mt-1 w-full bg-white rounded-md border border-gray-200 shadow-lg p-4 text-center text-gray-500">
          No matching books found
        </div>
      )}
    </div>
  );
};

export default SearchInput;