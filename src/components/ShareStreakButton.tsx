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
    if (!generatedImage) return;

    try {
      // Create share text
      const shareText = `🔥 ${currentStreak} Days of Devotion! 🔥\n\n${getMotivationalQuote(currentStreak)}\n\n🏆 Best Streak: ${longestStreak} days\n📿 Total Malas: ${totalMalas}\n🔥 Current: ${currentStreak} days\n\nKeep chanting with devotion! 🙏\n\n#BhaktiMalaCounter #RadhaNaamJap #SpiritualJourney`;
      
      // Convert image to blob
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const file = new File([blob], `streak-${currentStreak}-days-devotion.png`, { type: 'image/png' });
      
      // Method 1: Try Web Share API with files (most reliable)
      if (navigator.share && navigator.canShare) {
        try {
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              text: shareText,
              files: [file],
              title: `${currentStreak} Days of Devotion`,
            });
            
            toast.success("Streak shared directly! 📱", {
              description: `Your ${currentStreak} days of devotion has been shared with image!`,
              duration: 4000,
            });
            setShowImageModal(false);
            return;
          }
        } catch (shareError) {
          console.log('Web Share API with files failed:', shareError);
        }
      }
      
      // Method 2: Try to copy image to clipboard and open WhatsApp
      try {
        // Copy image to clipboard
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob
          })
        ]);
        
        // Open WhatsApp with text
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
        window.open(whatsappUrl, '_blank');
        
        toast.success("Image copied! Paste in WhatsApp 📱", {
          description: "Image copied to clipboard. In WhatsApp, paste the image (Ctrl+V or long press → paste) to share with text!",
          duration: 8000,
        });
        setShowImageModal(false);
        return;
        
      } catch (clipboardError) {
        console.log('Clipboard copy failed:', clipboardError);
      }
      
      // Method 3: Try to use a temporary image element and copy to clipboard
      try {
        // Create a temporary image element
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = async () => {
          // Create canvas to convert to blob
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            
            // Convert to blob
            canvas.toBlob(async (blob) => {
              if (blob) {
                try {
                  // Try to copy to clipboard again
                  await navigator.clipboard.write([
                    new ClipboardItem({
                      'image/png': blob
                    })
                  ]);
                  
                  // Open WhatsApp
                  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
                  window.open(whatsappUrl, '_blank');
                  
                  toast.success("Image copied! Paste in WhatsApp 📱", {
                    description: "Image copied to clipboard. Paste it in WhatsApp along with the text!",
                    duration: 8000,
                  });
                  setShowImageModal(false);
                  
                } catch (finalError) {
                  // Final fallback: just share text and download image
                  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
                  window.open(whatsappUrl, '_blank');
                  
                  // Download image
                  const link = document.createElement('a');
                  link.href = generatedImage;
                  link.download = `streak-${currentStreak}-days-devotion.png`;
                  link.click();
                  
                  toast.success("WhatsApp opened! Image downloaded 📱", {
                    description: "Share the downloaded image manually in WhatsApp",
                    duration: 5000,
                  });
                }
              }
            }, 'image/png');
          }
        };
        
        img.src = generatedImage;
        
      } catch (error) {
        console.log('Image processing failed:', error);
        
        // Final fallback: just share text and download image
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
        window.open(whatsappUrl, '_blank');
        
        // Download image
        const link = document.createElement('a');
        link.href = generatedImage;
        link.download = `streak-${currentStreak}-days-devotion.png`;
        link.click();
        
        toast.success("WhatsApp opened! Image downloaded 📱", {
          description: "Share the downloaded image manually in WhatsApp",
          duration: 5000,
        });
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
            <div className="text-center text-sm text-muted-foreground space-y-2">
              <p><strong>📱 How to Share Image + Text:</strong></p>
              <p>1. Tap "Share Directly" button</p>
              <p>2. Image copied to clipboard</p>
              <p>3. WhatsApp opens with text</p>
              <p>4. Paste image (Ctrl+V or long press → paste)</p>
              <p>5. Send both together!</p>
              <p className="text-xs text-muted-foreground mt-2">
                If clipboard fails, image will download automatically
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ShareStreakButton;