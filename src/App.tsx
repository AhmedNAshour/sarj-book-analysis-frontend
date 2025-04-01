import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Book, Network, Users, Link } from "lucide-react";
import NetworkGraph from './components/NetworkGraph';
import CharacterList from './components/CharacterList';
import RelationshipDetail from './components/RelationshipDetails';
import SearchInput from './components/SearchInput';
import LoadingState from './components/LoadingState';
import ErrorBoundary from './components/ErrorBoundary';
import { BookAnalysis } from './types';

function App() {
  const [bookData, setBookData] = useState<BookAnalysis | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookAnalysis = async (bookId: string) => {
    if (!bookId.trim()) {
      setError("Please enter a book ID");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use localhost:3000 for development
      const apiBaseUrl = import.meta.env.DEV ? 'http://localhost:3000' : import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${apiBaseUrl}/api/analysis/${bookId}/full`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          options: {
            provider: "sambanova",
            batchSize: 3,
            chunkSize: 90000,
            delayBetweenBatches: 500,
            overrideCache: false
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch book data: ${response.statusText}`);
      }
      
      const data = await response.json();
      setBookData(data);
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
      setBookData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Book Character Network Analyzer</h1>
        <p className="text-gray-500">Enter a book ID to visualize character relationships</p>
      </header>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Search for a Book</CardTitle>
          <CardDescription>Enter a book ID to analyze character interactions</CardDescription>
        </CardHeader>
        <CardContent>
          <SearchInput onSearch={fetchBookAnalysis} isLoading={loading} />
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="mb-8">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && <LoadingState />}

      {!loading && bookData && (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5" />
                {bookData.title}
              </CardTitle>
              <CardDescription>By {bookData.author} • Book ID: {bookData.bookId}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="bg-blue-50 p-3 rounded-md flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="text-sm font-medium">{bookData.analysis.meta.characterCount}</div>
                    <div className="text-xs text-gray-500">Characters</div>
                  </div>
                </div>
                <div className="bg-purple-50 p-3 rounded-md flex items-center gap-2">
                  <Link className="h-5 w-5 text-purple-500" />
                  <div>
                    <div className="text-sm font-medium">{bookData.analysis.meta.relationshipCount}</div>
                    <div className="text-xs text-gray-500">Relationships</div>
                  </div>
                </div>
                <div className="bg-green-50 p-3 rounded-md flex items-center gap-2">
                  <Network className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="text-sm font-medium">{Math.round(bookData.analysis.relationships.reduce((sum, rel) => sum + rel.strength, 0) / bookData.analysis.relationships.length * 10) / 10}</div>
                    <div className="text-xs text-gray-500">Avg. Relationship Strength</div>
                  </div>
                </div>
                {bookData.analysis.meta.analysisDate && (
                  <div className="bg-amber-50 p-3 rounded-md flex items-center gap-2">
                    <Book className="h-5 w-5 text-amber-500" />
                    <div>
                      <div className="text-sm font-medium">{new Date(bookData.analysis.meta.analysisDate).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500">Analysis Date</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="network" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="network" className="flex items-center gap-1">
                <Network className="h-4 w-4" />
                Network Graph
              </TabsTrigger>
              <TabsTrigger value="characters" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                Characters
              </TabsTrigger>
              <TabsTrigger value="relationships" className="flex items-center gap-1">
                <Link className="h-4 w-4" />
                Relationships
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="network" className="h-[600px]">
              <ErrorBoundary>
                <NetworkGraph 
                  characters={bookData.analysis.characters} 
                  relationships={bookData.analysis.relationships} 
                />
              </ErrorBoundary>
            </TabsContent>
            
            <TabsContent value="characters" className="h-[600px]">
              <CharacterList characters={bookData.analysis.characters} />
            </TabsContent>
            
            <TabsContent value="relationships" className="h-[600px]">
              <RelationshipDetail 
                relationships={bookData.analysis.relationships}
                characters={bookData.analysis.characters}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}

      {!loading && !bookData && !error && (
        <div className="text-center py-16 px-4">
          <Book className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">No Book Selected</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Enter a book ID above to visualize character networks and relationships. 
            Try ID "1342" for Jane Austen's Pride and Prejudice.
          </p>
        </div>
      )}
    </div>
  );
}

export default App;