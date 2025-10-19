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
    this.drawBackground();
    this.drawDecorativeElements();
    this.drawAppBranding();
    this.drawStreakData(data);
    this.drawMotivationalContent(data);
    this.drawStats(data);
    this.drawFooter();
    
    return this.canvas.toDataURL('image/png', 0.9);
  }

  private clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private drawBackground() {
    // Create beautiful gradient background
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#667eea');    // Purple-blue
    gradient.addColorStop(0.3, '#764ba2');  // Deep purple
    gradient.addColorStop(0.7, '#f093fb');  // Pink-purple
    gradient.addColorStop(1, '#f5576c');    // Coral-pink
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Add subtle pattern overlay
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * this.canvas.width;
      const y = Math.random() * this.canvas.height;
      const radius = Math.random() * 100 + 50;
      
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  private drawDecorativeElements() {
    // Draw lotus-like decorative circles
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height * 0.4;
    
    // Outer circle
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, 250, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Middle circle
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, 180, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Inner circle
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, 120, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private drawAppBranding() {
    // App title in Devanagari
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 56px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('राधा नाम जप', this.canvas.width / 2, this.canvas.height * 0.12);

    // English subtitle
    this.ctx.font = '28px Arial';
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    this.ctx.fillText('Bhakti Mala Counter', this.canvas.width / 2, this.canvas.height * 0.15);

    // Decorative line
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(this.canvas.width * 0.2, this.canvas.height * 0.17);
    this.ctx.lineTo(this.canvas.width * 0.8, this.canvas.height * 0.17);
    this.ctx.stroke();
  }

  private drawStreakData(data: StreakImageData) {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height * 0.4;

    // Streak emoji
    this.ctx.font = '180px Arial';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText(this.getStreakEmoji(data.currentStreak), centerX, centerY);

    // Current streak number
    this.ctx.font = 'bold 140px Arial';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText(data.currentStreak.toString(), centerX, centerY + 200);

    // Streak label
    this.ctx.font = '42px Arial';
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    this.ctx.fillText('Days of Devotion', centerX, centerY + 280);
  }

  private drawMotivationalContent(data: StreakImageData) {
    const quote = this.getMotivationalQuote(data.currentStreak);
    
    this.ctx.font = '36px Arial';
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    this.ctx.textAlign = 'center';
    
    // Draw quote with word wrapping
    const words = quote.split(' ');
    let line = '';
    let y = this.canvas.height * 0.65;
    const maxWidth = this.canvas.width - 100;
    
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = this.ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && i > 0) {
        this.ctx.fillText(line, this.canvas.width / 2, y);
        line = words[i] + ' ';
        y += 45;
      } else {
        line = testLine;
      }
    }
    this.ctx.fillText(line, this.canvas.width / 2, y);
  }

  private drawStats(data: StreakImageData) {
    const statsY = this.canvas.height * 0.78;
    
    // Stats background
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    this.ctx.fillRect(this.canvas.width * 0.1, statsY - 30, this.canvas.width * 0.8, 120);
    
    // Stats border
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(this.canvas.width * 0.1, statsY - 30, this.canvas.width * 0.8, 120);

    // Best streak
    this.ctx.font = '32px Arial';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`🏆 Best Streak: ${data.longestStreak} days`, this.canvas.width * 0.15, statsY);

    // Total malas
    this.ctx.fillText(`📿 Total Malas: ${data.totalMalas}`, this.canvas.width * 0.15, statsY + 40);

    // Current streak status
    this.ctx.fillText(`🔥 Current: ${data.currentStreak} days`, this.canvas.width * 0.15, statsY + 80);
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
}

