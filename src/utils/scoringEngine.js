/**
 * Main Scoring Engine
 * Orchestrates all scoring modules to produce composite scores
 */

import { calculateSemanticScore, findMatchingKeywords } from './semanticMatcher.js';
import { extractSkills, calculateSkillsScore } from './skillsExtractor.js';

// Education levels for matching
const EDUCATION_LEVELS = {
    'phd': 6,
    'doctorate': 6,
    'masters': 5,
    'master': 5,
    'mba': 5,
    'msc': 5,
    'mtech': 5,
    'bachelors': 4,
    'bachelor': 4,
    'btech': 4,
    'bsc': 4,
    'degree': 4,
    // Removed 'graduate' as it is too generic (e.g. "recent graduate")
    'diploma': 3,
    'associate': 2,
    'high school': 1,
    'secondary': 1,
};

// Experience level patterns
const EXPERIENCE_PATTERNS = [
    /(\d+)\+?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:experience|exp)/gi,
    /(?:experience|exp)\s*(?:of)?\s*(\d+)\+?\s*(?:years?|yrs?)/gi,
];

/**
 * Helper to extract a specific section from text
 * Looks for headers like "Education", "Experience", etc.
 */
function extractSection(text, sectionKeywords) {
    if (!text) return '';

    const lowerText = text.toLowerCase();
    const lines = text.split('\n');
    let inSection = false;
    let sectionText = [];

    // Common section headers to look out for as delimiters
    const ALL_HEADERS = [
        'education', 'experience', 'work history', 'employment',
        'skills', 'projects', 'summary', 'profile', 'contact',
        'languages', 'certifications', 'achievements'
    ];

    for (const line of lines) {
        const lowerLine = line.toLowerCase().trim();

        // Check if this line is a header
        const isHeader = ALL_HEADERS.some(header =>
            lowerLine === header || lowerLine.startsWith(header + ':') || lowerLine === header + 's'
        );

        // Check if we are entering the target section
        if (sectionKeywords.some(kw => lowerLine.includes(kw)) && isHeader) {
            inSection = true;
            continue; // Skip the header line itself
        }

        // Check if we are leaving the section (hit another header)
        if (inSection && isHeader && !sectionKeywords.some(kw => lowerLine.includes(kw))) {
            break;
        }

        if (inSection) {
            sectionText.push(line);
        }
    }

    return sectionText.join('\n');
}

/**
 * Extract education level from text
 */
export function extractEducation(text) {
    if (!text) return { level: 0, degrees: [] };

    // Try to extract just the education section first
    const educationSection = extractSection(text, ['education', 'academic', 'qualifications']);

    // Use the section if found, otherwise fall back to full text
    const targetText = educationSection.length > 20 ? educationSection : text;
    const lowerText = targetText.toLowerCase();

    const degrees = [];
    let maxLevel = 0;

    Object.entries(EDUCATION_LEVELS).forEach(([keyword, level]) => {
        // Use word boundary to avoid partial matches
        const regex = new RegExp(`\\b${keyword}\\b`, 'i');
        if (regex.test(lowerText)) {
            degrees.push(keyword);
            maxLevel = Math.max(maxLevel, level);
        }
    });

    return { level: maxLevel, degrees };
}

/**
 * Extract years of experience from text
 */
export function extractExperience(text) {
    if (!text) return 0;

    let maxYears = 0;

    EXPERIENCE_PATTERNS.forEach(pattern => {
        const matches = [...text.matchAll(pattern)];
        matches.forEach(match => {
            const years = parseInt(match[1], 10);
            if (!isNaN(years)) {
                maxYears = Math.max(maxYears, years);
            }
        });
    });

    return maxYears;
}

/**
 * Calculate education score
 */
export function calculateEducationScore(cvEducation, requiredEducation) {
    if (!requiredEducation || requiredEducation.level === 0) {
        return { score: 100, cvLevel: cvEducation.level, requiredLevel: 0 };
    }

    if (cvEducation.level >= requiredEducation.level) {
        return {
            score: 100,
            cvLevel: cvEducation.level,
            requiredLevel: requiredEducation.level
        };
    }

    const score = Math.round((cvEducation.level / requiredEducation.level) * 100);
    return {
        score,
        cvLevel: cvEducation.level,
        requiredLevel: requiredEducation.level
    };
}

/**
 * Calculate experience score
 */
export function calculateExperienceScore(cvYears, requiredYears) {
    if (!requiredYears || requiredYears === 0) {
        return { score: 100, cvYears, requiredYears: 0 };
    }

    if (cvYears >= requiredYears) {
        return { score: 100, cvYears, requiredYears };
    }

    const score = Math.round((cvYears / requiredYears) * 100);
    return { score: Math.min(score, 100), cvYears, requiredYears };
}

/**
 * Default scoring weights
 */
export const DEFAULT_WEIGHTS = {
    semantic: 40,
    skills: 25,
    experience: 20,
    education: 15,
};

/**
 * Get score classification
 */
export function getScoreClass(score) {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'average';
    return 'poor';
}

/**
 * Calculate composite score for a CV against a job description
 */
export function calculateScore(cvText, jdText, jdRequirements = {}, weights = DEFAULT_WEIGHTS) {
    // Normalize weights
    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
    const normalizedWeights = {};
    Object.keys(weights).forEach(key => {
        normalizedWeights[key] = weights[key] / totalWeight;
    });

    // Extract data from CV
    const cvSkills = extractSkills(cvText);
    const cvEducation = extractEducation(cvText);
    const cvExperience = extractExperience(cvText);

    // Calculate individual scores
    const semanticResult = {
        score: calculateSemanticScore(cvText, jdText),
        ...findMatchingKeywords(cvText, jdText),
    };

    const skillsResult = calculateSkillsScore(
        cvSkills,
        jdRequirements.skills || extractSkills(jdText)
    );

    const educationResult = calculateEducationScore(
        cvEducation,
        jdRequirements.education || extractEducation(jdText)
    );

    const experienceResult = calculateExperienceScore(
        cvExperience,
        jdRequirements.experience || extractExperience(jdText)
    );

    // Calculate weighted total
    const totalScore = Math.round(
        semanticResult.score * normalizedWeights.semantic +
        skillsResult.score * normalizedWeights.skills +
        educationResult.score * normalizedWeights.education +
        experienceResult.score * normalizedWeights.experience
    );

    return {
        total: totalScore,
        classification: getScoreClass(totalScore),
        breakdown: {
            semantic: {
                score: semanticResult.score,
                weight: weights.semantic,
                matched: semanticResult.matched,
                unmatched: semanticResult.unmatched,
            },
            skills: {
                score: skillsResult.score,
                weight: weights.skills,
                matched: skillsResult.matched,
                unmatched: skillsResult.unmatched,
                extracted: cvSkills,
            },
            education: {
                score: educationResult.score,
                weight: weights.education,
                cvLevel: educationResult.cvLevel,
                requiredLevel: educationResult.requiredLevel,
                degrees: cvEducation.degrees,
            },
            experience: {
                score: experienceResult.score,
                weight: weights.experience,
                cvYears: experienceResult.cvYears,
                requiredYears: experienceResult.requiredYears,
            },
        },
        cvData: {
            skills: cvSkills,
            education: cvEducation,
            experience: cvExperience,
        },
    };
}

/**
 * Extract name from CV (simple heuristic - first line or first capitalized words)
 */
export function extractName(text) {
    if (!text) return 'Unknown';

    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return 'Unknown';

    // First non-empty line is often the name
    const firstLine = lines[0].trim();

    // Check if it looks like a name (2-4 words, mostly alphabetic)
    const words = firstLine.split(/\s+/).filter(w => w.length > 1);
    if (words.length >= 1 && words.length <= 4) {
        const allAlphabetic = words.every(w => /^[A-Za-z\-']+$/.test(w));
        if (allAlphabetic) {
            return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        }
    }

    // Fallback: look for "Name:" pattern
    const nameMatch = text.match(/name\s*:\s*([^\n]+)/i);
    if (nameMatch) {
        return nameMatch[1].trim();
    }

    return 'Candidate';
}
