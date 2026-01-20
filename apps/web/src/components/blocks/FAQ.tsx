import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is Active Recall?",
    answer: "It's a way to learn by testing yourself. Instead of just reading, you force your brain to remember, which builds stronger memory."
  },
  {
    question: "Is Sift free to use?",
    answer: "Yes! There's a generous free plan to get you started. We also have premium options for power users."
  },
  {
    question: "What can I upload?",
    answer: "You can upload PDFs, notes, or even paste links to articles. Sift handles almost any text-based content you throw at it."
  },
  {
    question: "Is my data secure?",
    answer: "Yes. Your files are safe and only used to make you better. We don't share them or use them for anything else."
  },
  {
    question: "Can I use Sift on mobile?",
    answer: "Absolutely. Sift works great on your phone, tablet, or computer, so you can study anywhere."
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
                className={`p-8 rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 flex flex-col justify-start group ${
                    index === 0 
                    ? "md:col-span-2 border-primary/10 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#00000008_10px,#00000008_11px)] dark:bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#ffffff08_10px,#ffffff08_11px)]" 
                    : "md:col-span-1"
                }`}
                >
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value={`item-${index}`} className="border-none">
                    <AccordionTrigger className={`hover:no-underline py-0 text-left font-semibold group-hover:text-primary transition-colors ${
                        index === 0 ? "text-2xl" : "text-xl"
                    }`}>
                        <span className="bg-background/50 w-fit rounded-sm px-1 -ml-1">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className={`text-muted-foreground leading-relaxed mt-4 h-fit ${
                        index === 0 ? "text-lg" : "text-base"
                    }`}>
                        <div className="bg-background/50 w-fit rounded-sm px-1 -ml-1">
                        {faq.answer}
                        </div>
                    </AccordionContent>
                    </AccordionItem>
                </Accordion>
                </div>
            ))}
        </div>
      </div>
    </section>
  );
}
