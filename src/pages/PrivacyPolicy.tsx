import Navigation from "@/components/Navigation";

const PrivacyPolicy = () => (
  <div className="min-h-screen gradient-peaceful pb-20">
    <header className="border-b border-border/50 backdrop-blur-sm bg-background/50">
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-2xl font-bold text-primary">Privacy Policy — Radha Jap Counter</h1>
        <p className="text-sm text-muted-foreground">Effective Date: October 30, 2025</p>
      </div>
    </header>
    <main className="container mx-auto px-4 sm:px-6 py-8 space-y-4 prose prose-sm sm:prose lg:prose-lg max-w-none">
      <p>Radha Jap Counter (“the App”) respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how the App collects, uses, and safeguards data when you use it.</p>
      <h2>1. Information We Collect</h2>
      <ul>
        <li>No personally identifiable information is collected.</li>
        <li>Jap/Mala counts, streaks, preferences, theme, and language are stored locally on your device.</li>
        <li>Optional anonymous analytics (e.g., screen views, crash logs) may be used to improve performance.</li>
      </ul>
      <h2>2. How Your Data Is Used</h2>
      <ul>
        <li>To display jap progress, streaks, and statistics.</li>
        <li>To remember preferred settings.</li>
        <li>To enhance experience via anonymous analytics. No personal data is shared or sold.</li>
      </ul>
      <h2>3. Data Storage & Security</h2>
      <p>All data is stored locally on your device. Uninstalling or clearing storage permanently deletes it.</p>
      <h2>4. Third-Party Services</h2>
      <p>The App may use Google AdMob and Google Play Services. These services have their own privacy policies. The App does not access their collected information.</p>
      <h2>5. Children’s Privacy</h2>
      <p>General audience. No data knowingly collected from children under 13.</p>
      <h2>6. Changes to This Policy</h2>
      <p>We may update this policy; the latest version will be available in the App and on our official page.</p>
      <h2>7. Consent</h2>
      <p>By installing and using the App, you consent to this Privacy Policy.</p>
      <h2>8. Summary</h2>
      <p>Radha Jap Counter honors your privacy. Your jap, your progress, your peace — remain with you.</p>
    </main>
    <Navigation />
  </div>
);

export default PrivacyPolicy;


