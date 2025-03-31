import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Book, Network, Users, Link, BarChart } from "lucide-react";
import NetworkGraph from './components/NetworkGraph';
import CharacterList from './components/CharacterList';
import RelationshipDetail from './components/RelationshipDetails';
import BookStatsCard from './components/BookStatsCard';
import SearchInput from './components/SearchInput';
import LoadingState from './components/LoadingState';
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
      // For development: check if we should load test data
      if (bookId === '1787') {
        // This is Hamlet ID from the example data, use hardcoded data
        const testData = {
          "bookId": "1787",
          "title": "Hamlet",
          "author": "William Shakespeare",
          "analysis": {
            "characters": [
              {"name": "Hamlet", "aliases": ["Prince Hamlet"], "description": "The Prince of Denmark, son of the former king and nephew of Claudius. Continues to struggle with his emotions and morality, seeking to avenge his father's death while navigating the complexities of his own sanity and the deceit surrounding him.", "importance": "major", "mentions": 162},
              {"name": "King Claudius", "aliases": ["The King", "Claudius"], "description": "The King of Denmark, brother of the former king and uncle of Hamlet. Struggles with his own guilt and the consequences of his actions, deciding to send Hamlet to England to prevent further danger to himself.", "importance": "major", "mentions": 55},
              {"name": "Polonius", "aliases": ["Lord Chamberlain"], "description": "The Lord Chamberlain of Denmark, father of Laertes and Ophelia. Meets his demise at the hands of Hamlet, who mistakes him for the King while he is hiding behind the arras in the Queen's closet.", "importance": "major", "mentions": 45},
              {"name": "Gertrude", "aliases": ["The Queen"], "description": "The Queen of Denmark, mother of Hamlet and wife of Claudius. Torn between her love for her son and her loyalty to her husband, ultimately deciding to follow Hamlet's advice and refrain from sleeping with Claudius.", "importance": "major", "mentions": 40},
              {"name": "Horatio", "aliases": [], "description": "A friend of Hamlet's, who has come to Elsinore for the funeral. Remains a loyal and trusted friend to Hamlet, providing a voice of reason and serving as a confidant in his times of need.", "importance": "major", "mentions": 35},
              {"name": "Ophelia", "aliases": [], "description": "The daughter of Polonius, who is loved by Hamlet. Becomes increasingly distraught and heartbroken as a result of Hamlet's rejection and the chaos surrounding her family.", "importance": "major", "mentions": 33},
              {"name": "Laertes", "aliases": [], "description": "The son of Polonius, who has come to Denmark for the coronation. Seeks to avenge his father's death and is manipulated by King Claudius to do so.", "importance": "major", "mentions": 28},
              {"name": "Rosencrantz", "aliases": [], "description": "A courtier who is a friend of Hamlet's. Continues to serve as a messenger and advisor to the King, while also attempting to understand and navigate Hamlet's behavior.", "importance": "supporting", "mentions": 18},
              {"name": "Guildenstern", "aliases": [], "description": "A courtier who is a friend of Hamlet's. Works alongside Rosencrantz to carry out the King's orders and provide counsel, while also observing Hamlet's actions and reporting back to the King.", "importance": "supporting", "mentions": 16},
              {"name": "Ghost of Hamlet's Father", "aliases": ["The Ghost"], "description": "The spirit of the former king, who appears to Hamlet and others. Appears to Hamlet once more, serving as a reminder of his duty to avenge his father's death and prompting him to take action.", "importance": "major", "mentions": 15},
              {"name": "Osric", "aliases": [], "description": "A courtier who serves as a messenger and informant for King Claudius.", "importance": "minor", "mentions": 11},
              {"name": "Fortinbras", "aliases": [], "description": "Returns from Poland and takes control of Denmark after the deaths of the royal family.", "importance": "major", "mentions": 7},
              {"name": "Marcellus", "aliases": [], "description": "An officer who is on guard with Bernardo.", "importance": "minor", "mentions": 6},
              {"name": "Bernardo", "aliases": [], "description": "An officer who is on guard with Marcellus.", "importance": "minor", "mentions": 5},
              {"name": "Voltemand", "aliases": [], "description": "A courtier who is sent to Norway.", "importance": "minor", "mentions": 2},
              {"name": "Cornelius", "aliases": [], "description": "A courtier who is sent to Norway.", "importance": "minor", "mentions": 2},
              {"name": "Reynaldo", "aliases": [], "description": "A servant of Polonius.", "importance": "minor", "mentions": 2},
              {"name": "Lucianus", "aliases": [], "description": "A player who performs a scene in the play-within-a-play, which mirrors the events of the King's murder and serves to provoke a reaction from him.", "importance": "minor", "mentions": 2},
              {"name": "First Player", "aliases": [], "description": "Performs a speech about the death of Priam, which moves Hamlet to consider the nature of his own emotions and the morality of his actions.", "importance": "minor", "mentions": 2}
            ],
            "relationships": [
              {"source": "King Claudius", "target": "Hamlet", "type": "uncle-nephew", "strength": 17, "description": "Claudius is Hamlet's uncle and the current king, while Hamlet is his nephew and the prince of Denmark. Hamlet continues to seek revenge against the King, who is increasingly wary of Hamlet's actions and intentions. Hamlet's desire for revenge against his uncle drives the plot of the play."},
              {"source": "Hamlet", "target": "Horatio", "type": "friendship", "strength": 14, "description": "Hamlet and Horatio are close friends, and Horatio is one of the few people Hamlet trusts. Horatio remains a loyal and trusted friend to Hamlet, providing a voice of reason and serving as a confidant in his times of need. Horatio provides a voice of reason and support for Hamlet throughout the play."},
              {"source": "Hamlet", "target": "Ophelia", "type": "romantic interest", "strength": 9, "description": "Hamlet is in love with Ophelia, but their relationship is complicated by the circumstances of the play. Hamlet's rejection of Ophelia continues to cause her distress and heartache, ultimately contributing to her downfall. Hamlet's rejection of Ophelia contributes to her downfall and ultimately her death."},
              {"source": "Laertes", "target": "Hamlet", "type": "adversarial", "strength": 9, "description": "Laertes seeks to avenge his father's death and ultimately engages in a fatal duel with Hamlet."},
              {"source": "King Claudius", "target": "Laertes", "type": "manipulative", "strength": 8, "description": "King Claudius manipulates Laertes into seeking revenge against Hamlet."},
              {"source": "Gertrude", "target": "Hamlet", "type": "mother-son", "strength": 4, "description": "Gertrude is Hamlet's mother, but their relationship is strained due to her quick remarriage to Claudius. Hamlet confronts his mother about her actions and morals, leading to a deeper understanding and a sense of resolution between them."},
              {"source": "Ghost of Hamlet's Father", "target": "Hamlet", "type": "father-son", "strength": 4, "description": "The ghost of Hamlet's father appears to him and demands that he avenges his death."},
              {"source": "Polonius", "target": "Laertes", "type": "father-son", "strength": 3, "description": "Polonius is Laertes' father and gives him advice on how to behave."},
              {"source": "Polonius", "target": "Ophelia", "type": "father-daughter", "strength": 3, "description": "Polonius is Ophelia's father and tries to control her interactions with Hamlet."},
              {"source": "Rosencrantz", "target": "Guildenstern", "type": "collaborative friendship", "strength": 2, "description": "Rosencrantz and Guildenstern work together to carry out the King's orders and provide counsel, demonstrating their close friendship and cooperation."},
              {"source": "Hamlet", "target": "Polonius", "type": "fatal confrontation", "strength": 1, "description": "Hamlet mistakenly kills Polonius while he is hiding behind the arras in the Queen's closet."},
              {"source": "King Claudius", "target": "Gertrude", "type": "marital tension", "strength": 1, "description": "The King and Queen's relationship is strained due to the King's guilt and the Queen's growing unease with her situation."}
            ],
            "meta": {
              "consistencyKey": 1743361897771,
              "chunksProcessed": 3,
              "characterCount": 19,
              "relationshipCount": 12
            }
          }
        };
        setBookData(testData as BookAnalysis);
        setLoading(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/analysis/${bookId}/full`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          options: {
            provider: "sambanova",
            batchSize: 3,
            chunkSize: 90000,
            delayBetweenBatches: 500
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
              <TabsTrigger value="stats" className="flex items-center gap-1">
                <BarChart className="h-4 w-4" />
                Statistics
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="network" className="h-[600px]">
              <NetworkGraph 
                characters={bookData.analysis.characters} 
                relationships={bookData.analysis.relationships} 
              />
            </TabsContent>
            
            <TabsContent value="characters">
              <CharacterList characters={bookData.analysis.characters} />
            </TabsContent>
            
            <TabsContent value="relationships">
              <RelationshipDetail 
                relationships={bookData.analysis.relationships}
                characters={bookData.analysis.characters}
              />
            </TabsContent>
            
            <TabsContent value="stats">
              <BookStatsCard 
                title={bookData.title}
                author={bookData.author}
                bookId={bookData.bookId}
                characters={bookData.analysis.characters}
                relationships={bookData.analysis.relationships}
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
            Try ID "1787" for Shakespeare's Hamlet.
          </p>
        </div>
      )}
    </div>
  );
}

export default App;