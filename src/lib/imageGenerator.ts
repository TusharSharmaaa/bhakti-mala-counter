/**
 * Advanced devotional image generator for streak sharing
 * Creates beautiful Instagram-story style images with streak data
 */

export interface StreakImageData {
  currentStreak: number;
  longestStreak: number;
  totalMalas: number;
  userName?: string;
}

export class DevotionalImageGenerator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  
  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
    
    // Set canvas size (Instagram story format)
    this.canvas.width = 1080;
    this.canvas.height = 1920;
  }

  /**
   * Generate a beautiful devotional streak image
   */
  async generateStreakImage(data: StreakImageData): Promise<string> {
    this.clearCanvas();
    await this.drawBackground();
    await this.drawHeader();
    this.drawCenterRingAndTitle(data);
    this.drawSubheading();
    this.drawStatsCard(data);
    this.drawFooterBranding();
    
    return this.canvas.toDataURL('image/png', 0.9);
  }

  private clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private async drawBackground() {
    // Try realistic photo background, fallback to gradient
    let drewPhoto = false;
    try {
      const bg = await this.loadImage('/images/background-Image.png');
      // Draw cover
      const canvasW = this.canvas.width;
      const canvasH = this.canvas.height;
      const imgW = bg.width;
      const imgH = bg.height;
      const scale = Math.max(canvasW / imgW, canvasH / imgH);
      const drawW = imgW * scale;
      const drawH = imgH * scale;
      const dx = (canvasW - drawW) / 2;
      const dy = (canvasH - drawH) / 2;
      this.ctx.drawImage(bg, dx, dy, drawW, drawH);
      drewPhoto = true;
    } catch {}

    if (!drewPhoto) {
      const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
      gradient.addColorStop(0, '#ec4899');
      gradient.addColorStop(0.5, '#a855f7');
      gradient.addColorStop(1, '#7c3aed');
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Vignette + tint overlay for readability
    const overlay = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    overlay.addColorStop(0, 'rgba(0,0,0,0.25)');
    overlay.addColorStop(0.5, 'rgba(0,0,0,0.15)');
    overlay.addColorStop(1, 'rgba(0,0,0,0.35)');
    this.ctx.fillStyle = overlay;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private async drawHeader() {
    // Avatar circle image with proper scaling and centering
    try {
      const img = await this.loadImage('/images/Gemini_Generated_Image_hlmn5lhlmn5lhlmn.png');
      const avatarX = this.canvas.width / 2;
      const avatarY = this.canvas.height * 0.10;
      const r = 70;
      
      // Shadow
      this.ctx.beginPath();
      this.ctx.arc(avatarX, avatarY, r + 6, 0, Math.PI * 2);
      this.ctx.fillStyle = 'rgba(0,0,0,0.15)';
      this.ctx.fill();
      
      // White border ring
      this.ctx.beginPath();
      this.ctx.arc(avatarX, avatarY, r + 3, 0, Math.PI * 2);
      this.ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      this.ctx.lineWidth = 6;
      this.ctx.stroke();
      
      // Clip circle and draw image with proper scaling
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(avatarX, avatarY, r, 0, Math.PI * 2);
      this.ctx.closePath();
      this.ctx.clip();
      
      // Calculate proper scaling to fill circle while maintaining aspect ratio
      const imgAspect = img.width / img.height;
      const circleAspect = 1; // Circle is 1:1
      
      let drawWidth, drawHeight, drawX, drawY;
      
      if (imgAspect > circleAspect) {
        // Image is wider than circle - fit to height
        drawHeight = r * 2;
        drawWidth = drawHeight * imgAspect;
        drawX = avatarX - drawWidth / 2;
        drawY = avatarY - r;
      } else {
        // Image is taller than circle - fit to width
        drawWidth = r * 2;
        drawHeight = drawWidth / imgAspect;
        drawX = avatarX - r;
        drawY = avatarY - drawHeight / 2;
      }
      
      this.ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
      this.ctx.restore();
    } catch {}
    
    // Inspiration text
    this.ctx.fillStyle = '#ffffff';
    this.ctx.textAlign = 'center';
    this.ctx.font = '28px Arial';
    this.ctx.fillText('Inspired by Shri Premanand Maharaj Ji', this.canvas.width / 2, this.canvas.height * 0.18);
  }

  private drawCenterRingAndTitle(data: StreakImageData) {
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height * 0.42;
    
    // Glowing concentric rings
    const radii = [260, 230, 200];
    radii.forEach((r, i) => {
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
      this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.25 - i * 0.06})`;
      this.ctx.lineWidth = 10 - i * 2;
      this.ctx.shadowColor = 'rgba(255,255,255,0.6)';
      this.ctx.shadowBlur = 30 - i * 8;
      this.ctx.stroke();
      this.ctx.shadowBlur = 0;
    });

    // Title e.g. "7-DAY STREAK!" with fire emojis
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 120px Arial';
    const dayText = `${data.currentStreak}-DAY`;
    this.ctx.fillText(dayText, cx, cy - 20);
    this.ctx.font = 'bold 120px Arial';
    this.ctx.fillText('STREAK!', cx, cy + 110);

    // Emoji accents
    this.ctx.font = '80px Arial';
    this.ctx.fillText('🔥', cx - 330, cy + 90);
    this.ctx.fillText('🔥', cx + 300, cy + 90);
  }

  private drawSubheading() {
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = 'rgba(255,255,255,0.95)';
    this.ctx.font = '36px Arial';
    this.ctx.fillText('Your Devotional Journey Continues!', this.canvas.width / 2, this.canvas.height * 0.58);
  }

  private drawStatsCard(data: StreakImageData) {
    const cardW = this.canvas.width * 0.86;
    const cardH = 220;
    const x = (this.canvas.width - cardW) / 2;
    const y = this.canvas.height * 0.63;

    // Rounded rect background
    this.roundRect(x, y, cardW, cardH, 24, 'rgba(255,255,255,0.9)');

    // Columns: Best Streak, Total Malas, Current
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#111827';
    this.ctx.font = '28px Arial';
    
    const colW = cardW / 3;
    const cx1 = x + colW * 0.5;
    const cx2 = x + colW * 1.5;
    const cx3 = x + colW * 2.5;
    const titleY = y + 70;
    const valueY = y + 130;

    // Titles
    this.ctx.fillText('Best Streak', cx1, titleY);
    this.ctx.fillText('Total Malas', cx2, titleY);
    this.ctx.fillText('Current', cx3, titleY);

    // Values
    this.ctx.font = 'bold 48px Arial';
    this.ctx.fillText(`${data.longestStreak} Days`, cx1, valueY);
    this.ctx.fillText(`${data.totalMalas}`, cx2, valueY);
    this.ctx.fillText(`${data.currentStreak} Days`, cx3, valueY);

    // Dividers
    this.ctx.strokeStyle = 'rgba(17,24,39,0.15)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(x + colW, y + 24);
    this.ctx.lineTo(x + colW, y + cardH - 24);
    this.ctx.moveTo(x + colW * 2, y + 24);
    this.ctx.lineTo(x + colW * 2, y + cardH - 24);
    this.ctx.stroke();
  }

  private drawFooterBranding() {
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 44px Arial';
    this.ctx.fillText('Radha Jaap Counter', this.canvas.width / 2, this.canvas.height * 0.86);
    this.ctx.font = '26px Arial';
    this.ctx.fillStyle = 'rgba(255,255,255,0.9)';
    this.ctx.fillText('Track Your Bhakti Sadhana', this.canvas.width / 2, this.canvas.height * 0.89);
  }

  private drawFooter() {
    // App branding footer
    this.ctx.font = '24px Arial';
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Keep chanting with devotion', this.canvas.width / 2, this.canvas.height * 0.92);

    // Hashtags
    this.ctx.font = '20px Arial';
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    this.ctx.fillText('#BhaktiMalaCounter #RadhaNaamJap #SpiritualJourney', this.canvas.width / 2, this.canvas.height * 0.96);
  }

  private getStreakEmoji(streak: number): string {
    if (streak === 0) return "💪";
    if (streak < 3) return "🌱";
    if (streak < 7) return "🔥";
    if (streak < 30) return "🏆";
    if (streak < 100) return "👑";
    return "🕉️";
  }

  private getMotivationalQuote(streak: number): string {
    const quotes = [
      "Start your spiritual journey today! 🙏",
      "Every step on the spiritual path matters! 🌱",
      "Building beautiful habits with devotion! 🔥",
      "Amazing dedication to spiritual practice! 🏆",
      "Incredible spiritual discipline! 👑",
      "Divine devotion at its finest! 🕉️"
    ];

    if (streak === 0) return quotes[0];
    if (streak < 3) return quotes[1];
    if (streak < 7) return quotes[2];
    if (streak < 30) return quotes[3];
    if (streak < 100) return quotes[4];
    return quotes[5];
  }

  // Helpers
  private async loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  private roundRect(x: number, y: number, w: number, h: number, r: number, fillStyle: string) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.fillStyle = fillStyle;
    ctx.fill();
  }
}

