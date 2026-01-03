# Technical Interview Guide: CV Screener

This document explains **how** the CV Screener works under the hood. Use this to answer technical questions about your implementation.

## 1. System Architecture
**"Client-Side RegEx & Heuristic Engine"**

*   **Model**: Single Page Application (SPA).
*   **Privacy-First**: Zero backend. All processing happens in the user's browser (Client-side).
*   **Performance**: Uses Web Workers (via PDF.js) to prevent freezing the UI during heavy parsing.

## 2. Key Algorithms (The "Secret Sauce")

The scoring engine (`src/utils/scoringEngine.js`) combines **4 weighted signals** to produce a final score.

### A. Semantic Matching (40% Weight)
**Technique**: **TF-IDF** (Term Frequency - Inverse Document Frequency) + **Cosine Similarity**.

*   **How it works**:
    1.  **Tokenization**: We break the text into words and remove "stop words" (common noise words like *and, the, a*).
    2.  **Vectorization**: We convert the Job Description (JD) and the CV into simplified mathematical vectors based on word frequency.
    3.  **Cosine Similarity**: We calculate the angle between these two vectors.
        *   Angle = 0° (Cosine 1.0) -> Identical text.
        *   Angle = 90° (Cosine 0.0) -> No shared words.
    4.  **Phrase Bonus**: We also look for matching **bigrams/trigrams** (2-3 word sequences) to reward phrase matches over scattered keyword matches.

> **Interview Soundbite**: *"I implemented a lightweight VSM (Vector Space Model) using Cosine Similarity to capture the thematic overlap between the candidate and the job requirements, rather than just keyword counting."*

### B. Skills Extraction (25% Weight)
**Technique**: **Dictionary Matching & Synonyms**.

*   **Database**: A local JSON mapping of skills (`src/utils/skillsExtractor.js`).
*   **Smart Matching**:
    *   It knows that `JS` = `JavaScript` and `React.js` = `React`.
    *   It explicitly looks for these keywords in the text.
*   **Scoring**: `(Matches Found / Total Required Skills) * 100`.

### C. Education Heuristic (15% Weight)
**Technique**: **Hierarchical Leveling**.

*   **Logic**: We map degrees to a numerical level:
    *   PhD = 6
    *   Masters = 5
    *   Bachelors = 4
    *   Diploma = 3
*   **The Fix**: A naive search usually fails (e.g., finding "graduate" in a profile summary).
    *   *We implemented "Section Extraction" to isolate the **Education** block of the CV before scanning for keywords.*
*   **Scoring**: If `CV Level >= Job Level`, Score is 100%. Otherwise, it scales down proportionally.

### D. Experience Extraction (20% Weight)
**Technique**: **Regex Pattern Matching**.

*   **Logic**: We look for patterns like `"5 years of experience"` or `"5+ years"` using Regular Expressions.
*   **Scoring**: `Math.min((CV Years / JD Years) * 100, 100)`. We cap it at 100% so over-qualified candidates don't break the scale.

## 3. Technology Choices

| Choice | Why? |
| :--- | :--- |
| **Vite** | For instant server start and fast HMR (Hot Module Replacement) during dev. |
| **PDF.js** | The gold standard for rendering/parsing PDFs in JS. We use the **TextLayer** to extract raw strings. |
| **Mammoth.js** | Best-in-class for converting `.docx` to raw text while preserving simple structure. |
| **Local Logic** | Avoids the latency, cost, and privacy concerns of sending resumes to OpenAI/Gemini APIs for a simple MVP. |

## 4. Potential Improvements (Future Roadmap)
*Answer this if asked "How would you make it better?"*

1.  **AI Integration**: Replace TF-IDF with **Embeddings** (e.g., OpenAI `text-embedding-3-small`) for true semantic understanding (e.g., understanding that "Frontend" is related to "UI" even if the words differ).
2.  **OCR**: Add Tesseract.js to read image-based PDFs.
3.  **Custom Weights**: Allow the recruiter to adjust weights via UI (e.g., prioritize Skills over Experience). *Note: The UI for this is already built!*
