import Navigation from "@/components/Navigation";

const Terms = () => (
  <div className="min-h-screen gradient-peaceful pb-20">
    <header className="border-b border-border/50 backdrop-blur-sm bg-background/50">
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-2xl font-bold text-primary">Terms & Conditions — Radha Jap Counter</h1>
        <p className="text-sm text-muted-foreground">Effective Date: October 30, 2025</p>
      </div>
    </header>
    <main className="container mx-auto px-4 sm:px-6 py-8 space-y-4 prose prose-sm sm:prose lg:prose-lg max-w-none">
      <h2>1. Purpose of the App</h2>
      <p>Radha Jap Counter assists users in spiritual and devotional practice. It is intended for personal reflection and inner peace and is not a commercial, medical, or diagnostic tool.</p>
      <h2>2. User Responsibilities</h2>
      <ul>
        <li>Use the App respectfully and lawfully.</li>
        <li>Do not manipulate jap counts or misuse the platform.</li>
        <li>Avoid sharing misleading, harmful, or offensive content.</li>
        <li>Take responsibility for your own practice and progress.</li>
      </ul>
      <h2>3. Data & Privacy</h2>
      <p>The App does not collect personal data on external servers. Jap history, streaks, and preferences are stored locally on your device. See the <a href="/privacy-policy">Privacy Policy</a> for details.</p>
      <h2>4. Third-Party Services</h2>
      <p>Third-party tools (e.g., Google AdMob, Google Play Services) may be integrated. They operate under their own data policies. The App does not directly access their data.</p>
      <h2>5. Disclaimer</h2>
      <ul>
        <li>The App is a spiritual aid, not a professional or medical tool.</li>
        <li>Use practices at your discretion; we are not responsible for misuse.</li>
        <li>No guarantees of specific outcomes are provided.</li>
      </ul>
      <h2>6. Limitation of Liability</h2>
      <p>We are not liable for technical errors, interruptions, data loss, or any damages arising from use or inability to use the App.</p>
      <h2>7. App Modifications</h2>
      <p>Features and terms may change without prior notice. The latest version will be accessible within the App.</p>
      <h2>8. Intellectual Property</h2>
      <p>All elements in the App are the intellectual property of Radha Jap Counter and may not be copied or redistributed without permission.</p>
      <h2>9. Termination of Use</h2>
      <p>We may suspend access for violations of these terms. You can stop using the App by uninstalling it at any time.</p>
      <h2>10. Acceptance</h2>
      <p>By using the App, you confirm that you have read, understood, and agree to these Terms and Conditions.</p>
      <h2>11. Closing Note</h2>
      <p>Radha Jap Counter exists to help you grow closer to peace through jap and devotion. Use it mindfully and with sincerity.</p>
    </main>
    <Navigation />
  </div>
);

export default Terms;


