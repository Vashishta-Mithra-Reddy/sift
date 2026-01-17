This document serves as the conceptual North Star for **Sift**. It defines the "why," the "what," and the "feel" of the product, ensuring that every feature we build later aligns with the goal of being "simple, clean, and perfect."

---

# 🔘 Sift: Product Manifest()

> **The Vision:** To turn passive consumption into active mastery. Sift is a minimalist "active recall" engine that transforms any source of information—be it a slide deck, a messy note, or a textbook—into a precision-engineered learning experience.

---

## 1. The Core Problem

Most people "study" by re-reading. Science shows this is the least effective way to learn. Existing tools like Anki or Quizlet require too much manual effort (creating cards) or are cluttered with social features and "bloat" that distract from the task at hand: **Learning.**

## 2. The Sift Philosophy

* **Friction is the Enemy:** The time between "I have a PPT" and "I am being quizzed" should be less than 10 seconds.
* **Source of Truth:** AI can be "falsy." Sift prioritizes the user's uploaded content above all else. If it isn't in your document, it shouldn't be in your quiz.
* **The "Zen" Loop:** Studying should feel like a flow state. No sidebars, no ads, no complex settings. Just the question and your brain.
* **Rewarding, Not Gamified:** We don't need cartoon characters. We need the reward of seeing a score go up and a "topic mastery" bar fill.

---

## 3. The User Journey (The "Perfect" Flow)

### Phase I: The Ingestion

The user arrives at a clean, "drop-zone" interface.

* **Action:** Upload an AWS PPT, paste a lecture transcript, or choose a pre-loaded "Sift Pack" (e.g., React Hooks, System Design).
* **The Magic:** Sift parses the content and identifies "Knowledge Clusters" (topics).

### Phase II: The Configuration

Instead of a complex menu, the user is asked two simple things:

1. **"How far did you get?"** (e.g., *I've covered Slides 1 through 20*).
2. **"How deep is the dive?"** (e.g., *10, 20, or 30 questions*).

### Phase III: The Sprint (Active Recall)

The interface enters **Zen Mode**.

* One question at a time.
* Fast, keyboard-driven interactions.
* The raw data is hidden to prevent "peeking," keeping the focus on recall.

### Phase IV: The Resolution

* **Immediate Feedback:** If you get a question wrong, Sift doesn't just show the answer; it shows you the **Source Snippet** from your own PPT so you can see the context you missed.
* **Progress Tracking:** A visual map of what you know vs. what you need to "Sift" again.

---

## 4. Key Functional Pillars

### 🧠 Grounded Intelligence (Anti-Hallucination)

The system uses the uploaded document as its "brain." When generating questions, it is strictly forbidden from inventing facts. Every question is anchored to a specific reference point in the user's data.

### 📅 Progressive Mastery

When a user returns to a topic (e.g., AWS Associate), Sift remembers what they got right last time. It prioritizes the "weak links" while introducing new questions from the next chapters in the document.

### 🎯 Manual & Automated Hybrid

* **The Pro Mode:** Paste your own Q&A pairs directly for instant testing.
* **The AI Mode:** Let Sift's "Sifter" engine extract the logic for you.

---

## 5. The Aesthetic: "Clean & Perfect"

* **Typography:** High readability, monospace for technical topics (like AWS/Coding).
* **Motion:** Subtle transitions using Framer Motion to make the "card flip" or "next question" feel tactile and responsive.
* **Color Palette:** Low-contrast "Dark Mode" by default to reduce eye strain during long study sessions.

---

## 6. The Roadmap

1. **The MVP:** A focused web app where users can paste text or upload a PDF/PPT and immediately take a 10-question quiz.
2. **The Vault:** Persistence. Saving your sources and tracking your mastery over weeks.
3. **The Public Launch:** Sharing "Sift Packs"—allowing experts to upload high-quality sources that others can study from.

---
