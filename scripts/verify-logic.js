
import { calculateScore } from '../src/utils/scoringEngine.js';

// Sample Job Description
const JD = `
Senior Frontend Engineer

Requirements:
- 5+ years of experience in web development
- Strong proficiency in React, TypeScript, and Node.js
- Experience with modern build tools (Vite, Webpack)
- Bachelor's degree in Computer Science or related field
- Good communication skills
`;

// Sample CV 1: Perfect Match
const CV_PERFECT = `
John Doe
Senior Frontend Developer

Profile:
Experienced developer with 8 years of experience building scalable web applications.
Expert in React, TypeScript, Node.js.

Experience:
Senior Developer at Tech Corp
2018 - Present
- Led frontend team using React and TypeScript
- 7 years of experience in total software development

Education:
Bachelors in Computer Science, University of Tech
`;

// Sample CV 2: Junior / Mismatch
const CV_JUNIOR = `
Jane Smith
Junior Web Developer

Profile:
Recent graduate looking for frontend roles.
Familiar with HTML, CSS, and basic JavaScript.
Learning React.

Experience:
Intern at StartUp Inc
2023 - Present (6 months)
1 year of experience in coding.

Education:
High School Diploma
`;

// Sample CV 3: Good Match but different title
const CV_GOOD = `
Bob Wilson
Software Engineer

Skills:
React, JavaScript, TypeScript, Node.js, AWS.

Experience:
Software Engineer at Big Co.
6 years of experience.
Working on high traffic web apps.

Education:
Masters in Engineering.
`;

console.log('--- CV Screener Verification ---');
console.log('Testing Scoring Engine Logic...\n');

const cases = [
    { name: 'Perfect Match', cv: CV_PERFECT },
    { name: 'Junior / Mismatch', cv: CV_JUNIOR },
    { name: 'Good Match', cv: CV_GOOD },
];

cases.forEach(({ name, cv }) => {
    console.log(`Analyzing: ${name}`);
    const result = calculateScore(cv, JD);

    console.log(`Score: ${result.total}/100 [${result.classification}]`);
    console.log('Breakdown:');
    console.log(`- Semantic: ${result.breakdown.semantic.score}`);
    console.log(`- Skills:   ${result.breakdown.skills.score} (Extracted: ${result.breakdown.skills.extracted.join(', ')})`);
    console.log(`- Education:${result.breakdown.education.score} (Level: ${result.breakdown.education.cvLevel})`);
    console.log(`- Exp:      ${result.breakdown.experience.score} (Years: ${result.breakdown.experience.cvYears})`);
    console.log('-----------------------------------');
});
