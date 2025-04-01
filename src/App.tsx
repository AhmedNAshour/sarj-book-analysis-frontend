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
        const testData: BookAnalysis = {
          "bookId": "1787",
          "title": "Hamlet",
          "author": "William Shakespeare",
          "analysis": {
            "characters": [
              {"name": "Prince Hamlet", "aliases": ["Lord Hamlet", "The Prince of Denmark", "Son of Denmark"], "description": "The melancholic prince of Denmark and protagonist. After his father's death and his mother's hasty remarriage to his uncle Claudius, Hamlet is visited by his father's ghost, who reveals he was murdered by Claudius. Torn between duty, moral questions, and psychological turmoil, Hamlet feigns madness while contemplating revenge. His philosophical nature leads to inaction and delay as he questions existence itself ('To be or not to be'). Throughout the play, his relationships deteriorate as his behavior becomes increasingly erratic, culminating in a tragic chain of deaths including his own.", "importance": "major", "mentions": 834, "arcSpan": 5, "appearanceCount": 5, "presencePattern": "continuous"},
              {"name": "King Claudius", "aliases": ["The King", "The King of Denmark", "Hamlet's Uncle"], "description": "The current king of Denmark who murdered his brother (Old Hamlet) and hastily married his widow Gertrude. Ambitious and calculating, Claudius presents a public face of strength and normalcy while secretly dealing with guilt over his fratricide. As Hamlet's behavior grows more threatening, Claudius plots increasingly desperate measures to eliminate his nephew, ultimately arranging what he intends to be Hamlet's death in England. His guilt is confirmed when he cannot pray for forgiveness, revealing his understanding of the magnitude of his crime.", "importance": "major", "mentions": 573, "arcSpan": 5, "appearanceCount": 5, "presencePattern": "continuous"},
              {"name": "Queen Gertrude", "aliases": ["The Queen", "Queen of Denmark", "Hamlet's Mother"], "description": "The Queen of Denmark, mother to Hamlet and now wife to Claudius. Her hasty marriage following her husband's death deeply troubles Hamlet. Her character is morally ambiguous - it's unclear whether she was complicit in her husband's murder or simply a weak-willed woman who chose security and status. Her love for her son is evident, though her loyalty remains divided between Hamlet and Claudius until the final scene where she unwittingly drinks the poison intended for Hamlet.", "importance": "major", "mentions": 340, "arcSpan": 4, "appearanceCount": 4, "presencePattern": "continuous"},
              {"name": "Polonius", "aliases": ["Lord Chamberlain"], "description": "The King's chief counselor, father to Laertes and Ophelia. A long-winded, meddling politician who constantly spies on others while offering tedious advice packaged as wisdom. His suspicious nature leads him to hide behind a tapestry to eavesdrop on Hamlet's conversation with Gertrude, resulting in his death when Hamlet stabs him through the curtain. His death triggers a series of tragic events affecting his children.", "importance": "major", "mentions": 238, "arcSpan": 3, "appearanceCount": 3, "presencePattern": "early"},
              {"name": "Horatio", "aliases": ["Hamlet's Friend"], "description": "Hamlet's loyal friend from university who serves as his confidant throughout the play. Unlike other characters, Horatio is honest, rational, and steadfast. He witnesses the ghost's first appearance and becomes Hamlet's trusted ally. Horatio's levelheadedness provides a stark contrast to Hamlet's emotional turbulence. In the end, he is the only main character to survive, tasked with telling Hamlet's story to the world.", "importance": "major", "mentions": 212, "arcSpan": 5, "appearanceCount": 5, "presencePattern": "continuous"}
            ],
            "relationships": [
              {"source": "Prince Hamlet", "target": "King Claudius", "type": "nephew-uncle + subject-king", "status": "vengeful, antagonistic, distrustful", "description": "This complex relationship forms the central conflict of the play. As Hamlet discovers Claudius murdered his father, their uncle-nephew bond transforms into one of secret enemies. While maintaining a facade of royal subject and monarch in public, Hamlet contemplates killing Claudius while Claudius increasingly fears Hamlet's erratic behavior. Their relationship evolves from uncomfortable wariness to active plotting against each other. Hamlet's delay in taking revenge allows Claudius time to arrange his murder, culminating in the tragedy that destroys the royal family. Their relationship embodies themes of revenge, justice, duty and the corruption of royal power.", "strength": 10, "arcSpan": 5, "appearanceCount": 5, "developmentPattern": "continuous"},
              {"source": "Prince Hamlet", "target": "Queen Gertrude", "type": "mother-son", "status": "complex, disappointed, conflicted", "description": "Hamlet's relationship with his mother is deeply conflicted after her hasty remarriage to Claudius. He views her choice as a betrayal of his father's memory and questions her morality and judgment. His famous line 'Frailty, thy name is woman' reflects his disappointment in her choices. During their confrontation in her chambers, Hamlet expresses his disgust openly but also shows concern for her soul, urging her to abandon Claudius' bed. Whether Gertrude knows about Claudius' crime remains ambiguous, but Hamlet's harsh words appear to affect her conscience. Despite their strained relationship, Gertrude retains maternal affection for Hamlet, showing concern for his mental state and drinking the poisoned cup perhaps in a final act of maternal protection.", "strength": 8, "arcSpan": 4, "appearanceCount": 4, "developmentPattern": "continuous"},
              {"source": "Prince Hamlet", "target": "Horatio", "type": "friendship", "status": "loyal, trusting", "description": "One of the few positive relationships in the play. Horatio is Hamlet's devoted friend from Wittenberg University who comes to Elsinore for King Hamlet's funeral. He serves as Hamlet's confidant, trusted ally, and the voice of reason amidst chaos. Unlike others, Horatio never betrays Hamlet and remains steadfastly loyal. Hamlet trusts him completely, sharing his thoughts, fears, and plans for revenge. In the final scene, Hamlet's dying wish is for Horatio to live and tell his story, showing his trust in Horatio's integrity and devotion.", "strength": 7, "arcSpan": 5, "appearanceCount": 5, "developmentPattern": "steady"},
              {"source": "Prince Hamlet", "target": "Polonius", "type": "subject-counselor", "status": "contemptuous, suspicious", "description": "Hamlet has little respect for Polonius, whom he sees as a foolish, meddling old man. He openly mocks him, calling him a 'fishmonger' and speaking to him with thinly veiled contempt. Polonius believes Hamlet's apparent madness stems from his love for Ophelia, completely misdiagnosing the prince's true condition. Their antagonistic relationship culminates when Hamlet mistakenly kills Polonius, who is spying on him from behind a tapestry in Gertrude's chamber. This pivotal action accelerates the play's tragic conclusion, turning Laertes and Ophelia decisively against Hamlet.", "strength": 5, "arcSpan": 3, "appearanceCount": 3, "developmentPattern": "escalating"}
            ],
            "meta": {
              "consistencyKey": 1712014982736,
              "chunksProcessed": 5,
              "characterCount": 18,
              "relationshipCount": 42,
              "analysisDate": "2025-03-31T15:36:22.736Z"
            }
          }
        };
        setBookData(testData);
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