import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Heart, BookOpen, Sparkles, Share2, RefreshCw, ArrowLeft, ArrowRight } from "lucide-react";
import { maharajQuotes, hinduStories } from "@/data/spiritualContent";
import Navigation from "@/components/Navigation";
import WhatsAppShareButton from "@/components/WhatsAppShareButton";
import maharajImage from "/images/Gemini_Generated_Image_hlmn5lhlmn5lhlmn.png";
import { toast } from "sonner";
import { motion } from "framer-motion";
import axios from "axios";
import { useBannerAd } from "@/hooks/useAdMob";

const SpiritualContent = () => {
  const [showHindi, setShowHindi] = useState(true);
  
  // AdMob integration - show banner at bottom
  useBannerAd(true, 'bottom');
  
  // Ensure page opens at top
  useEffect(() => { try { window.scrollTo({ top: 0, behavior: 'auto' }); } catch {} }, []);

  // --- Quotes & Stories States ---
  const [quotes, setQuotes] = useState(maharajQuotes);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(Math.floor(Math.random() * hinduStories.length));

  const currentQuote = quotes[currentQuoteIndex] || quotes[0];
  const currentStory = hinduStories[currentStoryIndex];

  // --- Gita States ---
  const [chapters, setChapters] = useState<any[]>([]);
  const [currentSlok, setCurrentSlok] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentChapter, setCurrentChapter] = useState(1);
  const [currentVerse, setCurrentVerse] = useState(1);

  const getNextItem = (current: number, max: number) => (current + 1) % max;
  const getPrevItem = (current: number, max: number) => (current - 1 + max) % max;

  // Shuffle quotes on first load so each user sees a different order
  useEffect(() => {
    const shuffled = [...maharajQuotes].sort(() => Math.random() - 0.5);
    setQuotes(shuffled);
    setCurrentQuoteIndex(0);
  }, []);

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
        
        // Load the first sloka on initial load
        await loadSloka(1, 1, chaptersData);
      } catch (err) {
        console.error(err);
        setError("Failed to load Gita chapters. Please try again later.");
        setLoading(false);
      }
    };

    fetchChapters();
  }, []);

  // --- Load Specific Sloka ---
  const loadSloka = async (chapterNumber: number, verseNumber: number, chaptersData?: any[]) => {
    try {
      const chaptersToUse = chaptersData || chapters;
      
      if (chaptersToUse.length === 0) {
        throw new Error("No chapters available");
      }

      // Find the specific chapter
      const chapter = chaptersToUse.find(ch => 
        (ch.chapter_number || ch.chapter || (chaptersToUse.indexOf(ch) + 1)) === chapterNumber
      );
      
      if (!chapter) {
        throw new Error(`Chapter ${chapterNumber} not found`);
      }

      // Get the verses count for this chapter
      const versesCount = chapter.verses_count || chapter.verses || chapter.slokas_count || 47;
      
      // Validate verse number
      if (verseNumber < 1 || verseNumber > versesCount) {
        throw new Error(`Verse ${verseNumber} not found in Chapter ${chapterNumber}`);
      }

      // Fetch the specific sloka
      const response = await axios.get(
        `https://vedicscriptures.github.io/slok/${chapterNumber}/${verseNumber}`
      );

      setCurrentSlok({
        ...response.data,
        chapter: chapterNumber,
        verse: verseNumber,
      });
      
      setCurrentChapter(chapterNumber);
      setCurrentVerse(verseNumber);
      setLoading(false);
    } catch (err) {
      console.error("Error loading sloka:", err);
      setError("Failed to load sloka. Please try again.");
      setLoading(false);
    }
  };

  // --- Navigation Functions ---
  const loadNextSloka = async () => {
    setLoading(true);
    const chaptersToUse = chapters;
    
    if (chaptersToUse.length === 0) return;
    
    const currentChapterData = chaptersToUse.find(ch => 
      (ch.chapter_number || ch.chapter || (chaptersToUse.indexOf(ch) + 1)) === currentChapter
    );
    
    if (!currentChapterData) return;
    
    const versesCount = currentChapterData.verses_count || currentChapterData.verses || currentChapterData.slokas_count || 47;
    
    if (currentVerse < versesCount) {
      // Next verse in same chapter
      await loadSloka(currentChapter, currentVerse + 1);
    } else if (currentChapter < chaptersToUse.length) {
      // First verse of next chapter
      await loadSloka(currentChapter + 1, 1);
    } else {
      // Loop back to first chapter, first verse
      await loadSloka(1, 1);
    }
  };

  const loadPrevSloka = async () => {
    setLoading(true);
    const chaptersToUse = chapters;
    
    if (chaptersToUse.length === 0) return;
    
    if (currentVerse > 1) {
      // Previous verse in same chapter
      await loadSloka(currentChapter, currentVerse - 1);
    } else if (currentChapter > 1) {
      // Last verse of previous chapter
      const prevChapterData = chaptersToUse.find(ch => 
        (ch.chapter_number || ch.chapter || (chaptersToUse.indexOf(ch) + 1)) === currentChapter - 1
      );
      
      if (prevChapterData) {
        const versesCount = prevChapterData.verses_count || prevChapterData.verses || prevChapterData.slokas_count || 47;
        await loadSloka(currentChapter - 1, versesCount);
      }
    } else {
      // Loop to last chapter, last verse
      const lastChapterData = chaptersToUse[chaptersToUse.length - 1];
      const versesCount = lastChapterData.verses_count || lastChapterData.verses || lastChapterData.slokas_count || 47;
      await loadSloka(chaptersToUse.length, versesCount);
    }
  };

  const showRandomSloka = async () => {
    setLoading(true);
    const chaptersToUse = chapters;
    
    if (chaptersToUse.length === 0) return;
    
    // Select random chapter
    const randomChapter = chaptersToUse[Math.floor(Math.random() * chaptersToUse.length)];
    
    // Get the chapter number and verses count
    const chapterNumber = randomChapter.chapter_number || randomChapter.chapter || (chaptersToUse.indexOf(randomChapter) + 1);
    const versesCount = randomChapter.verses_count || randomChapter.verses || randomChapter.slokas_count || 47;
    
    // Select random verse within that chapter
    const randomVerse = Math.floor(Math.random() * versesCount) + 1;
    
    await loadSloka(chapterNumber, randomVerse);
  };

  return (
    <div className="min-h-screen gradient-peaceful page-bottom-spacing">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="border-b border-border/50 backdrop-blur-sm bg-background/50 sticky top-0 z-10 shadow-sm"
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary">Spiritual Content — मन की यात्रा, माला के संग</h1>
          </div>
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
                      <p className="text-xs text-muted-foreground">दिव्य वचन</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <motion.blockquote drag="x" dragConstraints={{ left: 0, right: 0 }} onDragEnd={(e, info) => {
                    if (info.offset.x > 60) setCurrentQuoteIndex(getPrevItem(currentQuoteIndex, maharajQuotes.length));
                    if (info.offset.x < -60) setCurrentQuoteIndex(getNextItem(currentQuoteIndex, maharajQuotes.length));
                  }} className="text-lg leading-relaxed italic px-4 py-6 bg-secondary/10 rounded-lg border-l-4 border-primary/30 cursor-grab">
                    "{showHindi ? currentQuote.quoteHindi : currentQuote.quote}"
                  </motion.blockquote>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-3 items-stretch sm:items-center">
                    <div className="flex flex-wrap w-full sm:w-auto justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentQuoteIndex(getPrevItem(currentQuoteIndex, quotes.length))}
                        className="rounded-l-lg rounded-r-none px-3"
                      >
                        <ArrowLeft className="h-4 w-4 mr-1" /> Prev
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentQuoteIndex(getNextItem(currentQuoteIndex, quotes.length))}
                        className="rounded-r-lg rounded-l-none px-3 border-l-0"
                      >
                        Next <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                    <WhatsAppShareButton
                      content={showHindi ? currentQuote.quoteHindi : currentQuote.quote}
                      title="दिव्य वचन — श्री प्रेमानन्द महाराज"
                      className="sm:ml-auto"
                      adMode="none"
                    />
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

                  <div className="flex flex-col sm:flex-row sm:justify-between gap-3 items-stretch sm:items-center">
                    <div className="flex flex-wrap w-full sm:w-auto justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={loadPrevSloka}
                        className="rounded-l-lg rounded-r-none px-3"
                        disabled={loading}
                      >
                        <ArrowLeft className="h-4 w-4 mr-1" /> Prev
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={loadNextSloka}
                        className="rounded-r-lg rounded-l-none px-3 border-l-0"
                        disabled={loading}
                      >
                        Next <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                    {currentSlok && (
                      <WhatsAppShareButton
                        content={`🕉️ Bhagavad Gita ${currentSlok.chapter}:${currentSlok.verse}\n\n${currentSlok.slok}\n\n${showHindi 
                          ? currentSlok.raman?.ht || currentSlok.siva?.ht || currentSlok.gambir?.ht || currentSlok.tej?.ht || ""
                          : currentSlok.tej?.et || currentSlok.siva?.et || currentSlok.gambir?.et || currentSlok.purohit?.et || currentSlok.raman?.et || ""
                        }`}
                        title={`Chapter ${currentSlok.chapter} - Bhagavad Gita`}
                        className="sm:ml-auto"
                        adMode="none"
                      />
                    )}
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
                  <ExpandableStory text={showHindi ? currentStory.storyHindi : currentStory.story} />
                  <div className="pt-4 px-4 pb-4 border border-primary/20 rounded-lg bg-primary/5">
                    <p className="text-sm font-medium text-primary mb-2">
                      {showHindi ? "सीख:" : "Moral:"}
                    </p>
                    <p className="text-sm text-foreground italic">
                      {showHindi ? currentStory.moralHindi : currentStory.moral}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-3 items-stretch sm:items-center">
                    <div className="flex flex-wrap w-full sm:w-auto justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentStoryIndex(getPrevItem(currentStoryIndex, hinduStories.length))}
                        className="rounded-l-lg rounded-r-none px-3"
                      >
                        <ArrowLeft className="h-4 w-4 mr-1" /> Prev
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentStoryIndex(getNextItem(currentStoryIndex, hinduStories.length))}
                        className="rounded-r-lg rounded-l-none px-3 border-l-0"
                      >
                        Next <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                    <WhatsAppShareButton
                      content={`${showHindi ? currentStory.titleHindi : currentStory.title}\n\n${showHindi ? currentStory.storyHindi : currentStory.story}\n\n${showHindi ? 'सीख:' : 'Moral:'} ${showHindi ? currentStory.moralHindi : currentStory.moral}`}
                      title="Hindu Spiritual Story"
                      className="sm:ml-auto"
                    />
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

// Small expandable block for stories
function ExpandableStory({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const preview = text.split(/\s+/).slice(0, 60).join(' ');
  return (
    <div className="bg-background/50 p-5 rounded-lg border border-border/50">
      <p className="text-foreground leading-relaxed">
        {expanded ? text : `${preview}${text.length > preview.length ? '…' : ''}`}
      </p>
      {text.length > preview.length && (
        <button className="mt-2 text-primary text-sm underline" onClick={() => setExpanded(!expanded)}>
          {expanded ? ("Read less") : ("Read more")}
        </button>
      )}
    </div>
  );
}
