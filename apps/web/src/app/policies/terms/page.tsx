export default function TermsOfService() {
  return (
    <div className="container max-w-4xl mx-auto py-12 space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
        <p className="text-muted-foreground text-lg">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="prose dark:prose-invert max-w-none space-y-8">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
          <p className="leading-relaxed text-muted-foreground">
            By accessing and using Sift, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">2. Use License</h2>
          <p className="leading-relaxed text-muted-foreground">
            Permission is granted to temporarily download one copy of the materials (information or software) on Sift's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">3. User Content</h2>
          <p className="leading-relaxed text-muted-foreground">
            You retain all rights to the content you upload to Sift. By uploading content, you grant us a license to use, reproduce, and process that content solely for the purpose of providing the study features of the application (e.g., generating questions).
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">4. Disclaimer</h2>
          <p className="leading-relaxed text-muted-foreground">
            The materials on Sift's website are provided on an 'as is' basis. Sift makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">5. Limitations</h2>
          <p className="leading-relaxed text-muted-foreground">
            In no event shall Sift or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Sift's website.
          </p>
        </section>
      </div>
    </div>
  );
}
