# CV Screener 📄✅

A modern, localized **Applicant Tracking System (ATS)** helper built with **React** and **Vite**.

This application allows recruiters and hiring managers to instantly score Candidate CVs/Resumes against a Job Description using a local, heuristic-based scoring engine—no external AI APIs required.

## 🚀 Key Features

-   **Privacy-First & Local**: All parsing and scoring happens in your browser. No data is sent to external servers.
-   **Multi-Format Support**: Parse **PDF**, **DOCX**, and **TXT** files.
-   **Intelligent Scoring**:
    -   **Semantic Match**: Uses TF-IDF & Cosine Similarity to measure context overlap.
    -   **Skills Matching**: Extracts technical skills and compares them against JD requirements.
    -   **Education Heuristics**: Identifies degree levels (PhD, Masters, Bachelors, etc.).
    -   **Experience Analysis**: Extracts years of experience.
-   **Instant Demo Mode**: Load sample data with one click to test the flow.
-   **Modern UI**: Sleek, dark-mode interface with responsive design.

## 🛠️ Tech Stack

-   **Frontend**: React, Vite
-   **Styling**: Pure CSS (Variables, Flexbox/Grid, Glassmorphism)
-   **Document Processing**:
    -   `pdfjs-dist`: For PDF parsing.
    -   `mammoth`: For DOCX parsing.
-   **Icons**: Lucide React

## 📦 Installation

Prerequisites: Node.js (v16+)

```bash
# Clone the repository
git clone https://github.com/rishabhpatre/cv-screener.git

# Go to project directory
cd cv-screener

# Install dependencies
npm install
```

## 🚦 Usage

```bash
# Start the development server
npm run dev
```

1.  Open [http://localhost:5173](http://localhost:5173).
2.  **Setup Phase**:
    -   Paste a **Job Description** in the text panel.
    -   Drop CV files into the **Upload Zone**.
    -   *Or click "Load Demo Data" to try it with pre-loaded examples.*
3.  **Analysis**:
    -   Click **"Analyze CVs"**.
4.  **Results**:
    -   View candidates ranked by their match score.
    -   Click the **eye icon** to see a detailed scorecard breakdown (Skills, Semantic, Education, etc.).

## 🧪 Verification

To verify the scoring logic without the UI:

```bash
node scripts/verify-logic.js
```

## 📝 License

This project is open source.
