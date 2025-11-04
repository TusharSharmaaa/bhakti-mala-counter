import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateStreakOnShare } from "@/lib/streakSupabase";
import { toast } from "sonner";

interface WhatsAppShareButtonProps {
  content: string;
  title?: string;
  onShareComplete?: () => void;
  className?: string;
}

const WhatsAppShareButton = ({ content, title = "Spiritual Content", onShareComplete, className = "" }: WhatsAppShareButtonProps) => {
  const handleWhatsAppShare = async () => {
    try {
      // Create WhatsApp share URL with Play Store link
      const playLink = 'https://play.google.com/store/apps/details?id=com.tusharsharmaaa.radha';
      const shareText = `${title}\n\n${content}\n\n📱 Download Radha Jap Counter:\n${playLink}\n\nShared via Radha Jap Counter App`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
      
      // Open WhatsApp share
      window.open(whatsappUrl, '_blank');
      
      // Update streak in database
      await updateStreakOnShare();
      
      // Show success message
      toast.success("Content shared! Your streak continues 🔥");
      
      // Call completion callback
      if (onShareComplete) {
        onShareComplete();
      }
    } catch (error) {
      console.error('Error sharing to WhatsApp:', error);
      toast.error("Failed to share content. Please try again.");
    }
  };

  return (
    <Button
      onClick={handleWhatsAppShare}
      className={`bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto ${className}`}
      size="sm"
    >
      <Share2 className="h-4 w-4 mr-2" />
      Share on WhatsApp
    </Button>
  );
};

export default WhatsAppShareButton;

