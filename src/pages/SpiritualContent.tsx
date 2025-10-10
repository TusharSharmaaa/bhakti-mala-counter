import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Heart, BookOpen, Sparkles, Share2 } from "lucide-react";
import { maharajQuotes, gitaShlokas, hinduStories } from "@/data/spiritualContent";
import Navigation from "@/components/Navigation";
import maharajImage from "@/assets/maharaj-ji.jpg";
import { toast } from "sonner";

const SpiritualContent = () => {
  const [showHindi, setShowHindi] = useState(true);
  const randomQuote = maharajQuotes[Math.floor(Math.random() * maharajQuotes.length)];
  const randomGita = gitaShlokas[Math.floor(Math.random() * gitaShlokas.length)];
  const randomStory = hinduStories[Math.floor(Math.random() * hinduStories.length)];

  const shareToWhatsApp = (text: string, type: string) => {
    const message = `${text}\n\n— Shri Premanand Maharaj Ji\n🙏 Radhe Radhe`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen gradient-peaceful pb-20">
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-primary">Spiritual Content</h1>
              <p className="text-sm text-muted-foreground">Divine wisdom for your journey</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowHindi(!showHindi)}
            >
              {showHindi ? 'English' : 'हिंदी'}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="quotes" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="quotes">
              <Heart className="h-4 w-4 mr-2" />
              Quotes
            </TabsTrigger>
            <TabsTrigger value="gita">
              <BookOpen className="h-4 w-4 mr-2" />
              Gita
            </TabsTrigger>
            <TabsTrigger value="stories">
              <Sparkles className="h-4 w-4 mr-2" />
              Stories
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quotes" className="space-y-4 mt-6">
            <Card className="shadow-soft border-border/50">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <img 
                    src={maharajImage} 
                    alt="Shri Premanand Maharaj" 
                    className="w-16 h-16 rounded-full object-cover shadow-divine"
                  />
                  <div>
                    <CardTitle className="text-primary">Shri Premanand Maharaj</CardTitle>
                    <p className="text-xs text-muted-foreground">Divine Wisdom</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <blockquote className="text-lg leading-relaxed italic">
                  "{showHindi ? randomQuote.quoteHindi : randomQuote.quote}"
                </blockquote>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => shareToWhatsApp(showHindi ? randomQuote.quoteHindi : randomQuote.quote, 'quote')}
                    className="gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    Share on WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gita" className="space-y-4 mt-6">
            <Card className="shadow-soft border-border/50">
              <CardHeader>
                <CardTitle className="text-primary">{randomGita.chapter}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <p className="text-lg font-medium text-center leading-relaxed">
                    {randomGita.verse}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-2">
                    {showHindi ? 'अनुवाद:' : 'Translation:'}
                  </p>
                  <p className="text-foreground leading-relaxed">
                    {showHindi ? randomGita.translationHindi : randomGita.translation}
                  </p>
                </div>
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => shareToWhatsApp(`${randomGita.verse}\n\n${showHindi ? randomGita.translationHindi : randomGita.translation}`, 'gita')}
                    className="gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    Share on WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stories" className="space-y-4 mt-6">
            <Card className="shadow-soft border-border/50">
              <CardHeader>
                <CardTitle className="text-primary">
                  {showHindi ? randomStory.titleHindi : randomStory.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground leading-relaxed">
                  {showHindi ? randomStory.storyHindi : randomStory.story}
                </p>
                <div className="pt-4 border-t border-border">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    {showHindi ? 'सीख:' : 'Moral:'}
                  </p>
                  <p className="text-sm text-foreground italic">
                    {showHindi ? randomStory.moralHindi : randomStory.moral}
                  </p>
                </div>
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => shareToWhatsApp(`${showHindi ? randomStory.titleHindi : randomStory.title}\n\n${showHindi ? randomStory.storyHindi : randomStory.story}\n\n${showHindi ? 'सीख:' : 'Moral:'} ${showHindi ? randomStory.moralHindi : randomStory.moral}`, 'story')}
                    className="gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    Share on WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Navigation />
    </div>
  );
};

export default SpiritualContent;
