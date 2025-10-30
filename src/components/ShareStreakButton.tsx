import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Share2, Download, Loader2, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { DevotionalImageGenerator, StreakImageData } from "@/lib/imageGenerator";

interface ShareStreakButtonProps {
  currentStreak: number;
  longestStreak: number;
  totalMalas: number;
}

const ShareStreakButton = ({ currentStreak, longestStreak, totalMalas }: ShareStreakButtonProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string>("");
  const [showImageModal, setShowImageModal] = useState(false);

  // Motivational quotes based on streak
  const getMotivationalQuote = (streak: number): string => {
    if (streak === 0) return "Start your spiritual journey today! 🙏";
    if (streak < 3) return "Every step on the spiritual path matters! 🌱";
    if (streak < 7) return "Building beautiful habits with devotion! 🔥";
    if (streak < 30) return "Amazing dedication to spiritual practice! 🏆";
    if (streak < 100) return "Incredible spiritual discipline! 👑";
    return "Divine devotion at its finest! 🕉️";
  };

  const generateImage = async () => {
    setIsGenerating(true);
    
    try {
      const imageGenerator = new DevotionalImageGenerator();
      const streakData: StreakImageData = {
        currentStreak,
        longestStreak,
        totalMalas,
      };
      
      const imageDataURL = await imageGenerator.generateStreakImage(streakData);
      setGeneratedImage(imageDataURL);
      setShowImageModal(true);
      
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error("Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDirectShare = async () => {
    if (!generatedImage) {
      toast.error("No image generated yet. Please generate an image first.");
      return;
    }

    console.log('Starting share process...', { generatedImage: !!generatedImage });

    try {
      // Create share text
      const shareText = `🔥 ${currentStreak} Days of Devotion! 🔥\n\n${getMotivationalQuote(currentStreak)}\n\n🏆 Best Streak: ${longestStreak} days\n📿 Total Malas: ${totalMalas}\n🔥 Current: ${currentStreak} days\n\nKeep chanting with devotion! 🙏\n\n#BhaktiMalaCounter #RadhaNaamJap #SpiritualJourney`;
      
      console.log('Fetching image blob...');
      // Convert image to blob
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const file = new File([blob], `streak-${currentStreak}-days-devotion.png`, { type: 'image/png' });
      
      console.log('Blob created:', { size: blob.size, type: blob.type });

      // Check if native sharing is supported
      const hasShare = typeof navigator !== 'undefined' && !!navigator.share;
      const canShareFilesApi = typeof navigator !== 'undefined' && (navigator as any).canShare && (navigator as any).canShare({ files: [file] });
      const canShareFiles = !!hasShare && (!!canShareFilesApi);
      console.log('Native share support:', { 
        hasShare: !!navigator.share, 
        hasCanShare: !!navigator.canShare, 
        canShareFiles 
      });

      // Try native Web Share API with files first (some browsers don't expose canShare but still work)
      if (hasShare) {
        try {
          console.log('Attempting native share...');
          await (navigator as any).share({
            files: [file],
            text: shareText,
            title: `${currentStreak} Days of Devotion`,
          });
          console.log('Native share successful');
          toast.success("Shared with image! 📱", { description: 'If WhatsApp is available, choose Status or chat.' });
          setShowImageModal(false);
          return;
        } catch (shareError: any) {
          console.log('Native share attempt errored:', shareError);
          // If the error indicates files unsupported, fall back to download
        }
      }

      console.log('Falling back to download method...');
      
      // If native share not supported or failed, download the image
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `streak-${currentStreak}-days-devotion.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('Image download triggered');
      
      toast.success("Image downloaded! 📱", {
        description: "You can now share this image manually in WhatsApp or any other app",
        duration: 4000,
      });
      
      // Also try to open WhatsApp with text (image cannot be sent via URL scheme from web)
      const whatsappUrl = (isMobile ? 'whatsapp://send?text=' : 'https://wa.me/?text=') + encodeURIComponent(shareText);
      console.log('Opening WhatsApp:', whatsappUrl);
      
      try {
        const newWindow = window.open(whatsappUrl, '_blank');
        if (!newWindow) {
          throw new Error('Popup blocked');
        }
      } catch (e) {
        console.log('Window.open failed, trying location.href');
        if (isMobile) {
          window.location.href = whatsappUrl;
        }
      }
      
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error("Failed to share. Please try again.");
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `streak-${currentStreak}-days-devotion.png`;
    link.click();
    
    toast.success("Image downloaded! 📱", {
      description: "You can now share this image manually",
      duration: 3000,
    });
  };

  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  return (
    <>
      <Button
        onClick={generateImage}
        disabled={isGenerating}
        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg"
        size="lg"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Creating Image...
          </>
        ) : (
          <>
            <Share2 className="h-5 w-5 mr-2" />
            Share My Streak
          </>
        )}
      </Button>

      {/* Image Preview Modal */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">
              Your Devotional Streak - {currentStreak} Days! 🔥
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Generated Image */}
            <div className="flex justify-center">
              <img 
                src={generatedImage} 
                alt={`${currentStreak} days of devotion`}
                className="max-w-full h-auto rounded-lg shadow-lg"
                style={{ maxHeight: '70vh' }}
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={handleDirectShare}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                <Share2 className="h-5 w-5 mr-2" />
                {isMobile ? "Share Directly" : "Share on WhatsApp"}
              </Button>
              
              <Button
                onClick={downloadImage}
                variant="outline"
                size="lg"
              >
                <Download className="h-5 w-5 mr-2" />
                Download Image
              </Button>
            </div>
            
            {/* Device-specific instructions */}
            
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ShareStreakButton;