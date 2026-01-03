/**
 * Skills Extractor and Matcher
 * Extracts skills from text and matches against requirements
 */

// Common tech skills database with synonyms
const SKILL_SYNONYMS = {
    'javascript': ['js', 'ecmascript', 'es6', 'es2015'],
    'typescript': ['ts'],
    'python': ['py', 'python3'],
    'react': ['reactjs', 'react.js'],
    'vue': ['vuejs', 'vue.js'],
    'angular': ['angularjs', 'angular.js'],
    'node': ['nodejs', 'node.js'],
    'css': ['css3', 'cascading style sheets'],
    'html': ['html5'],
    'sql': ['mysql', 'postgresql', 'postgres', 'sqlite', 'mssql'],
    'mongodb': ['mongo'],
    'aws': ['amazon web services'],
    'azure': ['microsoft azure'],
    'gcp': ['google cloud', 'google cloud platform'],
    'docker': ['containerization'],
    'kubernetes': ['k8s'],
    'git': ['github', 'gitlab', 'bitbucket'],
    'machine learning': ['ml', 'deep learning', 'ai', 'artificial intelligence'],
    'data science': ['data analytics', 'data analysis'],
    'agile': ['scrum', 'kanban'],
    'java': ['j2ee', 'jvm'],
    'c++': ['cpp'],
    'c#': ['csharp', 'dotnet', '.net'],
    'ruby': ['ruby on rails', 'ror'],
    'php': ['laravel', 'symfony'],
    'swift': ['ios development'],
    'kotlin': ['android development'],
    'go': ['golang'],
    'rust': ['rustlang'],
};

// Common skills patterns
const SKILL_PATTERNS = [
    // Programming languages
    /\b(javascript|typescript|python|java|c\+\+|c#|ruby|php|swift|kotlin|go|rust|scala|perl|r|matlab)\b/gi,
    // Frameworks
    /\b(react|vue|angular|node|express|django|flask|spring|rails|laravel|symfony|nextjs|nuxt)\b/gi,
    // Databases
    /\b(sql|mysql|postgresql|mongodb|redis|elasticsearch|cassandra|dynamodb|oracle|firebase)\b/gi,
    // Cloud/DevOps
    /\b(aws|azure|gcp|docker|kubernetes|jenkins|terraform|ansible|ci\/cd|devops)\b/gi,
    // Tools
    /\b(git|jira|confluence|slack|figma|sketch|photoshop|illustrator)\b/gi,
    // Concepts
    /\b(agile|scrum|rest|graphql|microservices|api|testing|tdd|bdd)\b/gi,
    // Data/ML
    /\b(machine learning|deep learning|nlp|computer vision|tensorflow|pytorch|pandas|numpy)\b/gi,
];

/**
 * Extract skills from text
 */
export function extractSkills(text) {
    if (!text) return [];

    const lowerText = text.toLowerCase();
    const foundSkills = new Set();

    // Extract using patterns
    SKILL_PATTERNS.forEach(pattern => {
        const matches = lowerText.match(pattern);
        if (matches) {
            matches.forEach(match => foundSkills.add(match.toLowerCase()));
        }
    });

    // Check for synonym matches
    Object.entries(SKILL_SYNONYMS).forEach(([skill, synonyms]) => {
        synonyms.forEach(synonym => {
            if (lowerText.includes(synonym.toLowerCase())) {
                foundSkills.add(skill);
            }
        });
        if (lowerText.includes(skill)) {
            foundSkills.add(skill);
        }
    });

    return Array.from(foundSkills).sort();
}

/**
 * Match CV skills against required skills
 */
export function matchSkills(cvSkills, requiredSkills) {
    const matched = [];
    const unmatched = [];

    requiredSkills.forEach(required => {
        const lowerRequired = required.toLowerCase();

        // Check direct match
        if (cvSkills.some(skill => skill.toLowerCase() === lowerRequired)) {
            matched.push(required);
            return;
        }

        // Check synonym match
        const synonyms = SKILL_SYNONYMS[lowerRequired] || [];
        const found = cvSkills.some(skill =>
            synonyms.includes(skill.toLowerCase()) ||
            Object.entries(SKILL_SYNONYMS).some(([key, syns]) =>
                syns.includes(lowerRequired) && skill.toLowerCase() === key
            )
        );

        if (found) {
            matched.push(required);
        } else {
            unmatched.push(required);
        }
    });

    return { matched, unmatched };
}

/**
 * Calculate skills score
 */
export function calculateSkillsScore(cvSkills, requiredSkills) {
    if (!requiredSkills || requiredSkills.length === 0) {
        return { score: 100, matched: [], unmatched: [] };
    }

    const { matched, unmatched } = matchSkills(cvSkills, requiredSkills);
    const score = Math.round((matched.length / requiredSkills.length) * 100);

    return { score, matched, unmatched };
}
