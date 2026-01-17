# 💎 Sift: The Soul (v2)

> **The Vision:** To transform passive consumption into active mastery.
> Sift is a precision-engineered **Active Recall Engine** that turns any input (text, audio, PDF) into a flow-state learning experience. It is not just a quiz app; it is an extension of your memory.

---

## 1. The Core Philosophy
**Minimalism • Speed • Truth**

*   **Friction is Failure:** The time from "thought" to "practice" must be near-zero. No complex decks, no manual card creation. You feed it; it feeds your brain.
*   **The "Zen" State:** Learning requires focus. The UI is stripped of noise. No ads, no social bloat, no gamification for the sake of engagement. Only **Mastery** matters.
*   **Grounded Intelligence:** AI is a tool, not the source. Sift generates questions *strictly* from your provided context. If it's not in your source, it's not in the quiz.
*   **Mobile-First, Always:** Knowledge happens everywhere. Sift is a Progressive Web App (PWA) designed to feel native, tactile, and responsive on any device.

---

## 2. The Architecture of "Perfect"

### The Stack (The Engine)
We build on a modern, type-safe, and high-performance foundation:
*   **Core:** Next.js 15 (React 19) – Server Actions, RSCs.
*   **Styling:** Tailwind CSS 4 + Shadcn UI – Clean, dark-mode first.
*   **Motion:** Framer Motion – Tactile interactions (swipes, flips, transitions).
*   **Data:** Drizzle ORM + Postgres – Type-safe database access.
*   **Intelligence:** Vercel AI SDK – Model-agnostic generation (Gemini/OpenAI).
*   **Icons:** HugeIcons – Consistent, rounded, professional iconography.

### The Data Model (The Vault)
*   **Sources:** The raw materials (PDFs, Transcripts, Notes).
*   **Sifts:** The generated active recall sessions (Quizzes).
*   **Echoes:** The user's performance history. We track *retention*, not just "score".

---

## 3. The User Journey

### Phase I: Ingestion ("The Drop")
The entry point is a unified "Drop Zone".
*   **Drag & Drop:** PDFs, Markdown, Text files.
*   **Paste:** Raw text, URL (content extraction).
*   **Voice:** Audio notes (transcribed via AI).
*   *Result:* The content is parsed, chunked, and stored as a **Source**.

### Phase II: The Sift ("The Sprint")
The core loop. User selects a Source and hits "Sift".
*   **Configuration:**
    *   *Depth:* Shallow (Key concepts) vs. Deep (Details).
    *   *Format:* Flashcards (Recall), Multiple Choice (Recognition), Socratic (Explain it to me).
*   **The Experience:**
    *   Full-screen "Zen Mode".
    *   Keyboard shortcuts (Desktop) / Gestures (Mobile).
    *   Instant feedback with **Source Anchors** (showing exactly *where* the answer came from).

### Phase III: Mastery ("The Echo")
We don't just discard results.
*   **Weakness Targeting:** Subsequent Sifts prioritize previously missed concepts.
*   **The Heatmap:** Visual representation of knowledge gaps in a Source.
*   **Long-term Storage:** Everything goes into "The Vault" for future review.

---

## 4. Roadmap & Milestones

### v2.0: The Foundation (Current Focus)
*   [x] **Authentication:** Secure login (Google/Email).
*   [x] **Shell:** Responsive PWA layout with Navigation.
*   [ ] **The Brain:** Robust AI integration for generating Q&A from text.
*   [ ] **The Vault (Basic):** Saving Sources and viewing past Sifts.
*   [ ] **The Interface:** Polishing the "Quiz" UI to be visually stunning.

### v2.1: The Deep Dive
*   [ ] **File Parsing:** Robust PDF/Docx text extraction.
*   [ ] **History:** detailed breakdown of past performance.
*   [ ] **Spaced Repetition:** Simple scheduling for "Review this again tomorrow."

### v2.2: The Community
*   [ ] **Sift Packs:** Share your processed Sources (e.g., "React 19 Documentation", "History of Rome").

---

## 5. Design Guidelines (The "Feel")

*   **Typography:** Clean Sans-serif (Inter/Geist) for UI. Monospace for code/data.
*   **Color:** Deep Zinc/Slate backgrounds. Vibrant but controlled accents (Indigo/Violet) for "Success" states.
*   **Interaction:**
    *   *Click:* Snappy, immediate.
    *   *Transition:* Smooth, physics-based (springs).
    *   *Loading:* Skeleton screens, never generic spinners if possible.
*   **Sound:** Subtle audio cues for "Correct", "Complete", and "Focus" (optional).

---

> *"We are building the bicycle for the mind's memory."*
