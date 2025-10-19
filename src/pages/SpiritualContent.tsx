import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Heart, BookOpen, Sparkles, Share2, RefreshCw, ArrowLeft, ArrowRight } from "lucide-react";
import { maharajQuotes, hinduStories } from "@/data/spiritualContent";
import Navigation from "@/components/Navigation";
import maharajImage from "@/assets/maharaj-ji.jpg";
import { toast } from "sonner";
import { motion } from "framer-motion";
import axios from "axios";

const SpiritualContent = () => {
  const [showHindi, setShowHindi] = useState(true);

  // --- Quotes & Stories States ---
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(Math.floor(Math.random() * maharajQuotes.length));
  const [currentStoryIndex, setCurrentStoryIndex] = useState(Math.floor(Math.random() * hinduStories.length));

  const currentQuote = maharajQuotes[currentQuoteIndex];
  const currentStory = hinduStories[currentStoryIndex];

  // --- Gita States ---
  const [chapters, setChapters] = useState<any[]>([]);
  const [currentSlok, setCurrentSlok] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getNextItem = (current: number, max: number) => (current + 1) % max;
  const getPrevItem = (current: number, max: number) => (current - 1 + max) % max;

  // --- WhatsApp Share ---
  const shareToWhatsApp = (text: string, type: string) => {
    const appLink = "\n\n📱 Download Radha Naam Jap Counter:\nhttps://play.google.com/store/apps/details?id=com.bhaktimala.counter";
    const message = `${text}\n\n— Shri Premanand Maharaj Ji\n🙏 Radhe Radhe${appLink}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    toast.success("Opening WhatsApp...");
  };

  // --- Fetch Chapters Info ---
  useEffect(() => {
    const fetchChapters = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch chapters metadata
        const response = await axios.get("https://vedicscriptures.github.io/chapters");
        const chaptersData = response.data;
        
        if (!chaptersData || chaptersData.length === 0) {
          throw new Error("No chapters data available.");
        }

        setChapters(chaptersData);
        
        // Load a random sloka on initial load
        await loadRandomSloka(chaptersData);
      } catch (err) {
        console.error(err);
        setError("Failed to load Gita chapters. Please try again later.");
        setLoading(false);
      }
    };

    fetchChapters();
  }, []);

  // --- Load Random Sloka ---
  const loadRandomSloka = async (chaptersData?: any[]) => {
    try {
      const chaptersToUse = chaptersData || chapters;
      
      if (chaptersToUse.length === 0) {
        throw new Error("No chapters available");
      }

      // Select random chapter
      const randomChapter = chaptersToUse[Math.floor(Math.random() * chaptersToUse.length)];
      
      // Get the chapter number and verses count (handling different field name variations)
      const chapterNumber = randomChapter.chapter_number || randomChapter.chapter || (chaptersToUse.indexOf(randomChapter) + 1);
      const versesCount = randomChapter.verses_count || randomChapter.verses || randomChapter.slokas_count || 47; // Default fallback
      
      // Select random verse within that chapter
      const randomVerse = Math.floor(Math.random() * versesCount) + 1;

      // Fetch the specific sloka
      const response = await axios.get(
        `https://vedicscriptures.github.io/slok/${chapterNumber}/${randomVerse}`
      );

      setCurrentSlok({
        ...response.data,
        chapter: chapterNumber,
        verse: randomVerse,
      });
      
      setLoading(false);
    } catch (err) {
      console.error("Error loading sloka:", err);
      setError("Failed to load sloka. Please try again.");
      setLoading(false);
    }
  };

  // --- Random Slokha Switcher ---
  const showRandomSloka = async () => {
    setLoading(true);
    await loadRandomSloka();
  };

  return (
    <div className="min-h-screen gradient-peaceful pb-20">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="border-b border-border/50 backdrop-blur-sm bg-background/50 sticky top-0 z-10 shadow-sm"
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary">Spiritual Content</h1>
            <p className="text-sm text-muted-foreground">Divine wisdom for your journey</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="font-medium hover:bg-primary/10 transition-all"
            onClick={() => setShowHindi(!showHindi)}
          >
            {showHindi ? "English" : "हिंदी"}
          </Button>
        </div>
      </motion.header>

      {/* Main */}
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="quotes" className="w-full">
          <TabsList className="flex w-full rounded-xl p-1 bg-background/40 backdrop-blur-sm shadow-inner border border-border/40">
            <TabsTrigger value="quotes" className="flex-1 data-[state=active]:bg-primary/90 data-[state=active]:text-white rounded-lg py-2 transition-all duration-300">
              <Heart className="h-4 w-4 mr-2" /> Quotes
            </TabsTrigger>
            <TabsTrigger value="gita" className="flex-1 data-[state=active]:bg-primary/90 data-[state=active]:text-white rounded-lg py-2 transition-all duration-300">
              <BookOpen className="h-4 w-4 mr-2" /> Gita
            </TabsTrigger>
            <TabsTrigger value="stories" className="flex-1 data-[state=active]:bg-primary/90 data-[state=active]:text-white rounded-lg py-2 transition-all duration-300">
              <Sparkles className="h-4 w-4 mr-2" /> Stories
            </TabsTrigger>
          </TabsList>

          {/* --- Quotes Tab --- */}
          <TabsContent value="quotes" className="space-y-4 mt-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Card className="shadow-soft border-border/50 overflow-hidden">
                <CardHeader className="bg-primary/5 pb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={maharajImage}
                      alt="Shri Premanand Maharaj"
                      className="w-16 h-16 rounded-full object-cover shadow-divine border-2 border-primary/20"
                    />
                    <div>
                      <CardTitle className="text-primary">Shri Premanand Maharaj</CardTitle>
                      <p className="text-xs text-muted-foreground">Divine Wisdom</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <blockquote className="text-lg leading-relaxed italic px-4 py-6 bg-secondary/10 rounded-lg border-l-4 border-primary/30">
                    "{showHindi ? currentQuote.quoteHindi : currentQuote.quote}"
                  </blockquote>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentQuoteIndex(getPrevItem(currentQuoteIndex, maharajQuotes.length))}
                        className="h-8 w-8 rounded-full"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentQuoteIndex(getNextItem(currentQuoteIndex, maharajQuotes.length))}
                        className="h-8 w-8 rounded-full"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentQuoteIndex(Math.floor(Math.random() * maharajQuotes.length))}
                        className="h-8 w-8 rounded-full"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => shareToWhatsApp(showHindi ? currentQuote.quoteHindi : currentQuote.quote, "quote")}
                      className="gap-2"
                    >
                      <Share2 className="h-4 w-4" /> Share on WhatsApp
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* --- Gita Tab (Dynamic from API) --- */}
          <TabsContent value="gita" className="space-y-4 mt-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Card className="shadow-soft border-border/50 overflow-hidden">
                <CardHeader className="bg-primary/5">
                  <CardTitle className="text-primary flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-primary/70" />
                    {currentSlok ? `Chapter ${currentSlok.chapter} - Verse ${currentSlok.verse}` : "Bhagavad Gita"}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6 pt-6">
                  {loading ? (
                    <p className="text-center text-muted-foreground">Loading sloka...</p>
                  ) : error ? (
                    <p className="text-center text-red-500">{error}</p>
                  ) : currentSlok ? (
                    <>
                      <div className="p-6 bg-secondary/20 rounded-lg border border-secondary/20 shadow-inner">
                        <p className="text-lg font-medium text-center leading-relaxed mb-3">{currentSlok.slok}</p>
                        {currentSlok.transliteration && (
                          <p className="text-sm text-muted-foreground text-center italic mt-2">
                            {currentSlok.transliteration}
                          </p>
                        )}
                      </div>
                      <div className="bg-background/50 p-4 rounded-lg border border-border/50">
                        <p className="text-sm text-primary font-medium mb-2">{showHindi ? "अनुवाद:" : "Translation:"}</p>
                        <p className="text-foreground leading-relaxed">
                          {showHindi
                            ? currentSlok.raman?.ht || currentSlok.siva?.ht || currentSlok.gambir?.ht || currentSlok.tej?.ht || "—"
                            : currentSlok.tej?.et || currentSlok.siva?.et || currentSlok.gambir?.et || currentSlok.purohit?.et || currentSlok.raman?.et || "—"}
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="text-center text-muted-foreground">No slokas found.</p>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="flex gap-1">
                      <Button variant="outline" size="icon" onClick={showRandomSloka} className="h-8 w-8 rounded-full">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const translation = showHindi
                          ? currentSlok?.raman?.ht || currentSlok?.siva?.ht || currentSlok?.gambir?.ht || currentSlok?.tej?.ht
                          : currentSlok?.tej?.et || currentSlok?.siva?.et || currentSlok?.gambir?.et || currentSlok?.purohit?.et;
                        const message = `🕉️ Bhagavad Gita ${currentSlok?.chapter}:${currentSlok?.verse}\n\n${currentSlok?.slok}\n\n${translation || ""}`;
                        shareToWhatsApp(message, "gita");
                      }}
                      className="gap-2"
                    >
                      <Share2 className="h-4 w-4" /> Share on WhatsApp
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* --- Stories Tab --- */}
          <TabsContent value="stories" className="space-y-4 mt-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Card className="shadow-soft border-border/50 overflow-hidden">
                <CardHeader className="bg-primary/5">
                  <CardTitle className="text-primary flex items-center">
                    <Sparkles className="h-5 w-5 mr-2 text-primary/70" />
                    {showHindi ? currentStory.titleHindi : currentStory.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="bg-background/50 p-5 rounded-lg border border-border/50">
                    <p className="text-foreground leading-relaxed">
                      {showHindi ? currentStory.storyHindi : currentStory.story}
                    </p>
                  </div>
                  <div className="pt-4 px-4 pb-4 border border-primary/20 rounded-lg bg-primary/5">
                    <p className="text-sm font-medium text-primary mb-2">
                      {showHindi ? "सीख:" : "Moral:"}
                    </p>
                    <p className="text-sm text-foreground italic">
                      {showHindi ? currentStory.moralHindi : currentStory.moral}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentStoryIndex(getPrevItem(currentStoryIndex, hinduStories.length))}
                        className="h-8 w-8 rounded-full"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentStoryIndex(getNextItem(currentStoryIndex, hinduStories.length))}
                        className="h-8 w-8 rounded-full"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentStoryIndex(Math.floor(Math.random() * hinduStories.length))}
                        className="h-8 w-8 rounded-full"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        shareToWhatsApp(
                          `${showHindi ? currentStory.titleHindi : currentStory.title}\n\n${showHindi ? currentStory.storyHindi : currentStory.story}\n\n${showHindi ? "सीख:" : "Moral:"} ${showHindi ? currentStory.moralHindi : currentStory.moral}`,
                          "story"
                        )
                      }
                      className="gap-2"
                    >
                      <Share2 className="h-4 w-4" /> Share on WhatsApp
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>

      <Navigation />
    </div>
  );
};

export default SpiritualContent;
