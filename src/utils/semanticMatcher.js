/**
 * Semantic Matcher
 * Uses TF-IDF and keyword matching for text similarity
 */

/**
 * Tokenize text into words
 */
function tokenize(text) {
    if (!text) return [];
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2);
}

/**
 * Remove common stop words
 */
const STOP_WORDS = new Set([
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her',
    'was', 'one', 'our', 'out', 'has', 'have', 'been', 'some', 'them', 'then',
    'this', 'that', 'with', 'they', 'from', 'will', 'would', 'there', 'their',
    'what', 'about', 'which', 'when', 'make', 'like', 'time', 'just', 'know',
    'take', 'people', 'into', 'year', 'your', 'good', 'could', 'give', 'than',
    'other', 'very', 'after', 'most', 'also', 'made', 'should', 'from', 'being',
    'well', 'back', 'much', 'where', 'only', 'come', 'even', 'want', 'because',
    'work', 'these', 'must', 'where', 'does', 'going', 'such', 'through',
]);

function removeStopWords(words) {
    return words.filter(word => !STOP_WORDS.has(word));
}

/**
 * Calculate term frequency
 */
function termFrequency(words) {
    const tf = {};
    words.forEach(word => {
        tf[word] = (tf[word] || 0) + 1;
    });

    // Normalize by document length
    const maxFreq = Math.max(...Object.values(tf));
    Object.keys(tf).forEach(word => {
        tf[word] = tf[word] / maxFreq;
    });

    return tf;
}

/**
 * Calculate cosine similarity between two TF vectors
 */
function cosineSimilarity(tf1, tf2) {
    const allWords = new Set([...Object.keys(tf1), ...Object.keys(tf2)]);

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    allWords.forEach(word => {
        const v1 = tf1[word] || 0;
        const v2 = tf2[word] || 0;
        dotProduct += v1 * v2;
        norm1 += v1 * v1;
        norm2 += v2 * v2;
    });

    if (norm1 === 0 || norm2 === 0) return 0;

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

/**
 * Extract key phrases (bigrams and trigrams)
 */
function extractPhrases(text) {
    const words = tokenize(text);
    const phrases = [];

    // Bigrams
    for (let i = 0; i < words.length - 1; i++) {
        phrases.push(words[i] + ' ' + words[i + 1]);
    }

    // Trigrams
    for (let i = 0; i < words.length - 2; i++) {
        phrases.push(words[i] + ' ' + words[i + 1] + ' ' + words[i + 2]);
    }

    return phrases;
}

/**
 * Calculate semantic similarity score between two texts
 */
export function calculateSemanticScore(text1, text2) {
    if (!text1 || !text2) return 0;

    // Tokenize and clean
    const words1 = removeStopWords(tokenize(text1));
    const words2 = removeStopWords(tokenize(text2));

    if (words1.length === 0 || words2.length === 0) return 0;

    // Calculate TF vectors
    const tf1 = termFrequency(words1);
    const tf2 = termFrequency(words2);

    // Cosine similarity
    const similarity = cosineSimilarity(tf1, tf2);

    // Phrase matching bonus
    const phrases1 = extractPhrases(text1.toLowerCase());
    const phrases2Set = new Set(extractPhrases(text2.toLowerCase()));
    const phraseMatches = phrases1.filter(p => phrases2Set.has(p)).length;
    const phraseBonus = Math.min(phraseMatches / 10, 0.2); // Max 20% bonus

    // Combine scores
    const finalScore = Math.min((similarity + phraseBonus) * 100, 100);

    return Math.round(finalScore);
}

/**
 * Extract keywords from job description
 */
export function extractKeywords(text, topN = 20) {
    if (!text) return [];

    const words = removeStopWords(tokenize(text));
    const frequency = {};

    words.forEach(word => {
        frequency[word] = (frequency[word] || 0) + 1;
    });

    return Object.entries(frequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, topN)
        .map(([word]) => word);
}

/**
 * Find matching keywords between CV and JD
 */
export function findMatchingKeywords(cvText, jdText) {
    const cvKeywords = new Set(extractKeywords(cvText, 50));
    const jdKeywords = extractKeywords(jdText, 30);

    const matched = jdKeywords.filter(kw => cvKeywords.has(kw));
    const unmatched = jdKeywords.filter(kw => !cvKeywords.has(kw));

    return { matched, unmatched };
}
