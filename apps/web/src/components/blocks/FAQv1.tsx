import { HugeiconsIcon } from "@hugeicons/react";
import { HelpCircleIcon } from "@hugeicons/core-free-icons";

const faqs = [
  {
    question: "What is Active Recall?",
    answer: "Active recall is a learning principle where you stimulate your memory during the learning process. Unlike passive review (reading), active recall forces your brain to retrieve information, strengthening neural pathways and improving long-term retention."
  },
  {
    question: "How does Sift generate questions?",
    answer: "Sift uses advanced AI models to analyze your uploaded documents (PDFs, notes, transcripts) and extracts key concepts. It then formulates high-quality multiple-choice questions that test your understanding of the material."
  },
  {
    question: "Is my data secure?",
    answer: "Yes. Your uploaded documents are processed securely and are only used to generate your personal study materials. We do not share your data with third parties or use it to train public AI models."
  },
  {
    question: "Can I use Sift on mobile?",
    answer: "Absolutely. Sift is designed as a Progressive Web App (PWA). It works seamlessly on desktops, tablets, and mobile phones, allowing you to study effectively wherever you are."
  },
  {
    question: "Is Sift free to use?",
    answer: "Sift offers a generous free tier that allows you to create and study multiple Sifts. We also offer premium plans for power users who need higher limits and advanced features."
  }
];

export default function FAQ() {
  return (
    <section className="py-12 border border-border/50 rounded-2xl bg-background/50 backdrop-blur-sm">
      <div className="px-6 md:px-12">
        <div className="text-left mb-12 space-y-2">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-3">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Everything you need to know about Sift and how it works.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`p-8 rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 flex flex-col justify-between group ${
                index === 0 
                  ? "md:col-span-2 border-primary/10 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#00000008_10px,#00000008_11px)] dark:bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#ffffff08_10px,#ffffff08_11px)]" 
                  : "md:col-span-1"
              }`}
            >
              <div className="space-y-4">
                <h3 className={`text-xl font-semibold group-hover:text-primary transition-colors bg-background w-fit rounded-xs ${
                    index === 0 ? "text-2xl" : ""
                }`}>
                    {faq.question}
                </h3>
                <p className={`text-muted-foreground leading-relaxed bg-background w-fit rounded-xs ${
                    index === 0 ? "text-lg" : "text-base"
                }`}>
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
