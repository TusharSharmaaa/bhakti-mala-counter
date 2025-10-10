import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Heart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface QuoteCardProps {
  quote: string;
  author: string;
  category: 'maharaj' | 'gita' | 'story';
}

const QuoteCard = ({ quote, author, category }: QuoteCardProps) => {
  const [liked, setLiked] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          text: `${quote}\n\n— ${author}`,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(`${quote}\n\n— ${author}`);
      toast.success("Copied to clipboard!");
    }
  };

  const categoryColors = {
    maharaj: 'from-primary to-primary-glow',
    gita: 'from-accent to-yellow-400',
    story: 'from-purple-500 to-pink-500'
  };

  return (
    <Card className="shadow-soft border-border/50 overflow-hidden">
      <div className={`h-1 bg-gradient-to-r ${categoryColors[category]}`} />
      <CardContent className="pt-6 space-y-4">
        <blockquote className="text-lg leading-relaxed text-foreground italic">
          "{quote}"
        </blockquote>
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <p className="text-sm font-medium text-muted-foreground">— {author}</p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLiked(!liked)}
              className={liked ? 'text-primary' : ''}
            >
              <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuoteCard;
