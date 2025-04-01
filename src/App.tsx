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
              {"name": "King Claudius", "aliases": ["The King", "Claudius"], "description": "The King of Denmark, brother to the former king and uncle to Hamlet. He is manipulative and cunning, using his power to maintain control and suppress opposition. Throughout the play, he struggles with his own guilt and conscience, trying to justify his actions. His desire for power and control drives him to commit atrocities, including murdering his brother and manipulating those around him.", "importance": "major", "mentions": 99},
              {"name": "Hamlet", "aliases": ["Prince Hamlet"], "description": "The Prince of Denmark, son of the former king and nephew to Claudius. He is intelligent, emotional, and conflicted, struggling to come to terms with his father's death and his mother's quick remarriage to his uncle. Hamlet is determined to uncover the truth about his father's death and to avenge his murder, driven by his desire for justice and truth. Throughout the play, his emotions and actions are guided by his moral principles and his sense of loyalty to his father and his kingdom.", "importance": "major", "mentions": 294},
              {"name": "Gertrude", "aliases": ["The Queen"], "description": "The Queen of Denmark, mother to Hamlet and wife to Claudius. She is concerned about her son's well-being but also loyal to her new husband and willing to follow his advice. Gertrude is torn between her love for her son Hamlet and her loyalty to her new husband King Claudius, trying to navigate her own feelings and loyalties.", "importance": "major", "mentions": 69},
              {"name": "Polonius", "aliases": ["Lord Chamberlain"], "description": "The Lord Chamberlain of Denmark, father to Laertes and Ophelia. He is long-winded, self-important, and manipulative, using his position to advance his own interests and to gain favor with the king. Polonius tries to protect his daughter Ophelia from Hamlet's perceived madness while also trying to use his position to manipulate Hamlet.", "importance": "major", "mentions": 85},
              {"name": "Horatio", "aliases": [], "description": "A friend of Hamlet's, who is loyal, intelligent, and level-headed. He serves as a confidant to Hamlet, providing a voice of reason and morality in the play. Horatio is one of the few characters not motivated by personal gain or ambition, trying to help Hamlet navigate the complex web of relationships and alliances at court.", "importance": "major", "mentions": 43},
              {"name": "Laertes", "aliases": [], "description": "The son of Polonius, who is impulsive and hot-headed. He is concerned about his sister's well-being and willing to take action to protect her. Laertes is driven by his desire for revenge against Hamlet, willing to do whatever it takes to avenge his father's death, including working with Claudius to manipulate Hamlet.", "importance": "major", "mentions": 33},
              {"name": "Ophelia", "aliases": [], "description": "The daughter of Polonius, who is innocent, naive, and vulnerable. She is caught in the middle of the conflict between her father and Hamlet, ultimately destroyed by the chaos that surrounds her. Ophelia's madness and death serve as a symbol of the destruction caused by the chaos and violence that surrounds her.", "importance": "major", "mentions": 65},
              {"name": "Ghost of Hamlet's Father", "aliases": ["The Ghost"], "description": "The spirit of the former king, who appears to Hamlet and demands that he avenges his murder. He is a symbol of justice and morality, serving as a catalyst for the events of the play.", "importance": "major", "mentions": 8},
              {"name": "Marcellus", "aliases": [], "description": "A sentinel who is guarding the castle and is one of the first to see the ghost. He is loyal and concerned about the well-being of the kingdom.", "importance": "minor", "mentions": 5},
              {"name": "Bernardo", "aliases": [], "description": "A sentinel who is guarding the castle and is one of the first to see the ghost. He is loyal and concerned about the well-being of the kingdom.", "importance": "minor", "mentions": 4},
              {"name": "Rosencrantz", "aliases": [], "description": "A friend of Hamlet's, who is summoned by the king to try to determine the cause of Hamlet's madness. He is loyal to the king but also concerned about his friend's well-being, being used by the King to try to uncover the truth about Hamlet's behavior.", "importance": "minor", "mentions": 41},
              {"name": "Guildenstern", "aliases": [], "description": "A friend of Hamlet's, who is summoned by the king to try to determine the cause of Hamlet's madness. He is loyal to the king but also concerned about his friend's well-being, being used by the King to try to uncover the truth about Hamlet's behavior.", "importance": "minor", "mentions": 38},
              {"name": "Fortinbras", "aliases": [], "description": "A young and ambitious prince who is determined to avenge his father's death and reclaim his family's honor. He serves as a foil to Hamlet.", "importance": "minor", "mentions": 3},
              {"name": "Osric", "aliases": [], "description": "A messenger and a courtier to Claudius, who is foolish and obsequious. He is willing to do whatever it takes to gain favor with the king.", "importance": "minor", "mentions": 5}
            ],
            "relationships": [
              {"source": "King Claudius", "target": "Hamlet", "type": "uncle-nephew + king-subject", "status": "manipulative and controlling", "description": "King Claudius views Hamlet as a potential threat to his power and is manipulative and controlling in his interactions with him. He tries to persuade Hamlet to stay in Denmark and forget about his father's death, while also plotting against him.", "strength": 9},
              {"source": "Hamlet", "target": "King Claudius", "type": "nephew-uncle + subject-king", "status": "angry and resentful", "description": "Hamlet views King Claudius as a usurper and a murderer, and is angry and resentful towards him. He is determined to avenge his father's death and sees Claudius as a major obstacle to achieving this goal.", "strength": 9},
              {"source": "Gertrude", "target": "Hamlet", "type": "mother-son", "status": "concerned but loyal to her husband", "description": "Gertrude is concerned about Hamlet's well-being but is also loyal to her new husband, King Claudius. She tries to navigate her feelings and loyalties, but ultimately prioritizes her relationship with Claudius.", "strength": 6},
              {"source": "Polonius", "target": "Hamlet", "type": "father figure", "status": "manipulative and self-serving", "description": "Polonius views Hamlet as a means to advance his own interests and gain favor with the king. He tries to manipulate Hamlet into revealing his true feelings, while also using his position to protect his daughter Ophelia.", "strength": 5},
              {"source": "Horatio", "target": "Hamlet", "type": "friend", "status": "loyal and supportive", "description": "Horatio is a loyal and trustworthy friend to Hamlet, providing a voice of reason and morality in the play. He tries to help Hamlet navigate the complex web of relationships and alliances at court.", "strength": 8},
              {"source": "Laertes", "target": "Ophelia", "type": "brother-sister", "status": "protective and concerned", "description": "Laertes is protective and concerned about his sister Ophelia's well-being, warning her about the dangers of Hamlet's love. He is willing to take action to protect her, even if it means working against Hamlet.", "strength": 7},
              {"source": "Ophelia", "target": "Hamlet", "type": "lover", "status": "innocent and vulnerable", "description": "Ophelia views Hamlet as her lover and is innocent and vulnerable in her interactions with him. She is caught in the middle of the conflict between her father and Hamlet, and is ultimately destroyed by the chaos that surrounds her.", "strength": 6},
              {"source": "Ghost of Hamlet's Father", "target": "Hamlet", "type": "father-son", "status": "demanding and authoritative", "description": "The Ghost demands that Hamlet avenges his murder, serving as a catalyst for the events of the play. Hamlet is driven by his desire to fulfill his father's demand and uncover the truth about his death.", "strength": 10},
              {"source": "Hamlet", "target": "Polonius", "type": "nephew-uncle + subject-lord", "status": "angry and resentful", "description": "Hamlet views Polonius as a self-important and manipulative figure, and is angry and resentful towards him. He sees Polonius as a major obstacle to achieving his goals, and is willing to take action against him.", "strength": 8},
              {"source": "Polonius", "target": "Hamlet", "type": "uncle-nephew + lord-subject", "status": "manipulative and controlling", "description": "Polonius views Hamlet as a means to advance his own interests and gain favor with the king. He tries to manipulate Hamlet into revealing his true feelings, while also using his position to protect his daughter Ophelia.", "strength": 7},
              {"source": "Hamlet", "target": "Ophelia", "type": "lover", "status": "conflicted and uncertain", "description": "Hamlet is conflicted and uncertain in his interactions with Ophelia, struggling to navigate his feelings and loyalties. He is torn between his love for her and his desire for revenge against her father.", "strength": 7},
              {"source": "Hamlet", "target": "Gertrude", "type": "son-mother", "status": "conflicted and uncertain", "description": "Hamlet is conflicted and uncertain in his interactions with his mother, struggling to navigate his feelings and loyalties. He is torn between his love for her and his anger and resentment towards her for marrying Claudius.", "strength": 8},
              {"source": "Rosencrantz", "target": "Hamlet", "type": "friend", "status": "loyal but manipulative", "description": "Rosencrantz is a loyal friend to Hamlet, but is also being used by the King to try to uncover the truth about Hamlet's behavior. He is torn between his loyalty to Hamlet and his loyalty to the King.", "strength": 6},
              {"source": "Guildenstern", "target": "Hamlet", "type": "friend", "status": "loyal but manipulative", "description": "Guildenstern is a loyal friend to Hamlet, but is also being used by the King to try to uncover the truth about Hamlet's behavior. He is torn between his loyalty to Hamlet and his loyalty to the King.", "strength": 6},
              {"source": "Laertes", "target": "Hamlet", "type": "brother-rival", "status": "hot-headed and vengeful", "description": "Laertes views Hamlet as a rival and is hot-headed and vengeful in his interactions with him. He is driven by his desire for revenge against Hamlet, and is willing to do whatever it takes to achieve his goal.", "strength": 8},
              {"source": "Fortinbras", "target": "Hamlet", "type": "rival", "status": "ambitious and determined", "description": "Fortinbras views Hamlet as a rival and is ambitious and determined in his interactions with him. He is driven by his desire to avenge his father's death and reclaim his family's honor.", "strength": 5},
              {"source": "Osric", "target": "Hamlet", "type": "messenger", "status": "obsequious and foolish", "description": "Osric is obsequious and foolish in his interactions with Hamlet, trying to persuade him to participate in the fencing match with Laertes. He is willing to do whatever it takes to gain favor with the King.", "strength": 4},
              {"source": "Gertrude", "target": "King Claudius", "type": "wife-husband", "status": "loyal and supportive", "description": "Gertrude is loyal and supportive of her husband, King Claudius, and tries to navigate her feelings and loyalties. She is torn between her love for her son Hamlet and her loyalty to her new husband.", "strength": 7},
              {"source": "King Claudius", "target": "Gertrude", "type": "husband-wife", "status": "manipulative and controlling", "description": "King Claudius is manipulative and controlling in his interactions with his wife, Gertrude. He tries to persuade her to follow his advice and support his actions, while also using his power to maintain control over her.", "strength": 8},
              {"source": "Polonius", "target": "Laertes", "type": "father-son", "status": "protective and concerned", "description": "Polonius is protective and concerned about his son Laertes' well-being, and tries to advise him on how to navigate the complex web of relationships and alliances at court.", "strength": 7},
              {"source": "Laertes", "target": "Polonius", "type": "son-father", "status": "respectful and obedient", "description": "Laertes is respectful and obedient towards his father, Polonius, and tries to follow his advice. He is driven by his desire to avenge his father's death and reclaim his family's honor.", "strength": 7},
              {"source": "Ophelia", "target": "Polonius", "type": "daughter-father", "status": "loving and obedient", "description": "Ophelia is loving and obedient towards her father, Polonius, and tries to follow his advice. She is caught in the middle of the conflict between her father and Hamlet, and is ultimately destroyed by the chaos that surrounds her.", "strength": 6},
              {"source": "Polonius", "target": "Ophelia", "type": "father-daughter", "status": "protective and controlling", "description": "Polonius is protective and controlling in his interactions with his daughter, Ophelia. He tries to advise her on how to navigate the complex web of relationships and alliances at court, while also using his position to protect her from Hamlet's perceived madness.", "strength": 7},
              {"source": "Horatio", "target": "Fortinbras", "type": "ally", "status": "respectful and admiring", "description": "Horatio views Fortinbras as a worthy ally and is respectful and admiring of his ambition and determination. He sees Fortinbras as a potential threat to Hamlet, but also as a means to achieve justice and stability in the kingdom.", "strength": 5},
              {"source": "Fortinbras", "target": "Horatio", "type": "ally", "status": "respectful and admiring", "description": "Fortinbras views Horatio as a worthy ally and is respectful and admiring of his loyalty and intelligence. He sees Horatio as a means to achieve his goals and reclaim his family's honor.", "strength": 5},
              {"source": "Gertrude", "target": "Polonius", "type": "queen-lord", "status": "respectful and cautious", "description": "Gertrude views Polonius as a powerful and influential lord, and is respectful and cautious in her interactions with him. She is aware of his manipulative nature and tries to navigate her relationships with him and her son Hamlet.", "strength": 5},
              {"source": "Polonius", "target": "Gertrude", "type": "lord-queen", "status": "obsequious and manipulative", "description": "Polonius views Gertrude as a means to advance his own interests and gain favor with the king. He tries to manipulate her into supporting his actions and using her influence to further his own goals.", "strength": 6},
              {"source": "Horatio", "target": "Laertes", "type": "friend-rival", "status": "cautious and observant", "description": "Horatio views Laertes as a rival to Hamlet and is cautious and observant in his interactions with him. He is aware of Laertes' hot-headed nature and tries to navigate his relationships with him and Hamlet.", "strength": 4},
              {"source": "Laertes", "target": "Horatio", "type": "rival-friend", "status": "suspicious and hostile", "description": "Laertes views Horatio as a friend and ally to Hamlet, and is suspicious and hostile towards him. He sees Horatio as a potential obstacle to his goals and is willing to take action against him if necessary.", "strength": 5},
              {"source": "Ophelia", "target": "Gertrude", "type": "lady-in-waiting-queen", "status": "respectful and obedient", "description": "Ophelia views Gertrude as her queen and is respectful and obedient in her interactions with her. She is aware of Gertrude's complex relationships with her son Hamlet and her husband King Claudius.", "strength": 4},
              {"source": "Gertrude", "target": "Ophelia", "type": "queen-lady-in-waiting", "status": "kind and maternal", "description": "Gertrude views Ophelia as a innocent and vulnerable young woman, and is kind and maternal in her interactions with her. She tries to offer guidance and support to Ophelia, while also navigating her own complex relationships with her son Hamlet and her husband King Claudius.", "strength": 5},
              {"source": "Fortinbras", "target": "King Claudius", "type": "rival-king", "status": "ambitious and aggressive", "description": "Fortinbras views King Claudius as a rival and is ambitious and aggressive in his interactions with him. He sees King Claudius as a weak and corrupt ruler, and is determined to take advantage of the situation to further his own goals.", "strength": 6},
              {"source": "King Claudius", "target": "Fortinbras", "type": "king-rival", "status": "cautious and defensive", "description": "King Claudius views Fortinbras as a rival and is cautious and defensive in his interactions with him. He is aware of Fortinbras' ambition and aggression, and tries to navigate his relationships with him while maintaining his own power and control.", "strength": 6}
            ],
            "meta": {
              "consistencyKey": 1743466232139,
              "chunksProcessed": 3,
              "characterCount": 14,
              "relationshipCount": 33,
              "relationshipPairsCount": 20,
              "bidirectionalAnalysis": true,
              "analysisDate": "2025-04-01T00:11:20.438Z"
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