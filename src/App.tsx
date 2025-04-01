import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Book, Network, Users, Link, Zap, SearchCheck, RefreshCw } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<string>("network");
  const [analysisMode, setAnalysisMode] = useState<'fast' | 'detailed'>('fast');
  const [cacheOverride, setCacheOverride] = useState<boolean>(false);

  const fetchBookAnalysis = async (bookId: string, analysisType: 'fast' | 'detailed' = 'fast', overrideCache: boolean = false) => {
    if (!bookId.trim()) {
      setError("Please enter a book ID");
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysisMode(analysisType);
    setCacheOverride(overrideCache);

    try {
      // Use localhost:3000 for development, and the Render backend URL for production
      const apiBaseUrl = import.meta.env.DEV ? 'http://localhost:3000' : 'https://sarj-book-analysis-backend.onrender.com';
      
      // Set chunk size based on analysis type
      const chunkSize = analysisType === 'detailed' ? 30000 : 90000;
      
      const requestOptions = {
        provider: "sambanova",
        batchSize: 3,
        chunkSize: chunkSize,
        delayBetweenBatches: 500,
        overrideCache: overrideCache
      };
      
      // Debug what's being sent
      console.log('Sending API request with options:', JSON.stringify(requestOptions));
      
      const response = await fetch(`${apiBaseUrl}/api/analysis/${bookId}/full`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          options: requestOptions
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
    <div className="container mx-auto px-4 py-8 pb-16 min-h-screen flex flex-col">
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

      {loading && (
        <div className="space-y-4">
          <LoadingState />
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <span className="inline-flex items-center">
                {analysisMode === 'fast' ? (
                  <>
                    <Zap className="h-4 w-4 mr-1 text-amber-500" />
                    Fast Analysis
                  </>
                ) : (
                  <>
                    <SearchCheck className="h-4 w-4 mr-1 text-blue-500" />
                    Detailed Analysis
                  </>
                )}
              </span>
              <span>•</span>
              <span>Chunk Size: {analysisMode === 'detailed' ? '30,000' : '90,000'}</span>
              {cacheOverride && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center text-red-500">
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Cache Override
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {analysisMode === 'detailed' 
                ? 'Using smaller chunks for more thorough analysis (takes longer)' 
                : 'Using larger chunks for faster analysis'}
              {cacheOverride && ' • Ignoring cached results and generating new analysis'}
            </p>
          </div>
        </div>
      )}

      {!loading && bookData && (
        <div className="space-y-8 flex-grow">
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
                {bookData.analysis.meta.analysisDate && (
                  <div className="bg-amber-50 p-3 rounded-md flex items-center gap-2">
                    <Book className="h-5 w-5 text-amber-500" />
                    <div>
                      <div className="text-sm font-medium">{new Date(bookData.analysis.meta.analysisDate).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500">Analysis Date</div>
                    </div>
                  </div>
                )}
                <div className={`p-3 rounded-md flex items-center gap-2 ${analysisMode === 'detailed' ? 'bg-blue-50' : 'bg-amber-50'}`}>
                  {analysisMode === 'detailed' ? (
                    <SearchCheck className="h-5 w-5 text-blue-500" />
                  ) : (
                    <Zap className="h-5 w-5 text-amber-500" />
                  )}
                  <div>
                    <div className="text-sm font-medium">{analysisMode === 'detailed' ? 'Detailed' : 'Fast'}</div>
                    <div className="text-xs text-gray-500">Analysis Type</div>
                  </div>
                </div>
                {cacheOverride && (
                  <div className="bg-red-50 p-3 rounded-md flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 text-red-500" />
                    <div>
                      <div className="text-sm font-medium">Fresh Analysis</div>
                      <div className="text-xs text-gray-500">Cache Override</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="network" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4 overflow-x-auto flex whitespace-nowrap sm:whitespace-normal pb-1">
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
            
            <TabsContent value="network">
              <div className="h-[70vh] max-h-[600px]">
                <ErrorBoundary>
                  <NetworkGraph 
                    characters={bookData.analysis.characters} 
                    relationships={bookData.analysis.relationships} 
                  />
                </ErrorBoundary>
              </div>
            </TabsContent>
            
            <TabsContent value="characters">
              <div className="max-h-[70vh]">
                <CharacterList characters={bookData.analysis.characters} />
              </div>
            </TabsContent>
            
            <TabsContent value="relationships">
              <div className="max-h-[70vh]">
                <RelationshipDetail 
                  relationships={bookData.analysis.relationships}
                  characters={bookData.analysis.characters}
                  interactions={bookData.analysis.interactions || []}
                />
              </div>
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