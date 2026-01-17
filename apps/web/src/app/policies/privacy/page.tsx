export default function PrivacyPolicy() {
  return (
    <div className="container max-w-4xl mx-auto py-12 space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-muted-foreground text-lg">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="prose dark:prose-invert max-w-none space-y-8">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">1. Introduction</h2>
          <p className="leading-relaxed text-muted-foreground">
            Welcome to Sift ("we," "our," or "us"). We are committed to protecting your privacy and ensuring you have a positive experience on our website and in using our active recall engine. This policy explains how we handle your personal information.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">2. Information We Collect</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li><strong>Account Information:</strong> When you sign up, we collect your name, email address, and authentication details.</li>
            <li><strong>User Content:</strong> We store the notes, documents, and text you upload ("Sources") and the study materials generated from them ("Sifts", "Questions", "Echoes").</li>
            <li><strong>Usage Data:</strong> We collect data on your study habits, progress, and mastery levels to provide the active recall service.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">3. How We Use Your Information</h2>
          <p className="leading-relaxed text-muted-foreground">
            We use your information solely to provide and improve the Sift service. This includes generating questions from your content, tracking your learning progress, and personalizing your study schedule. We do not sell your data to third parties.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">4. Data Security</h2>
          <p className="leading-relaxed text-muted-foreground">
            We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">5. Contact Us</h2>
          <p className="leading-relaxed text-muted-foreground">
            If you have any questions about this Privacy Policy, please contact us at support@sift.app.
          </p>
        </section>
      </div>
    </div>
  );
}
