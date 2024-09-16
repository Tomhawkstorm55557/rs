// Import course data using require
const { ds_course, web_course, android_course, ios_course, uiux_course } = require('./courses');

const commonSkills = {
    'JavaScript': 10,
    'Python': 10,
    'Java': 10,
    'SQL': 8,
    'HTML': 6,
    'CSS': 6,
    'React': 10,
    'Node.js': 10,
    'TypeScript': 9,
    'Django': 9,
    'Angular': 8,
    'MongoDB': 8,
    'C++': 8,
    'AWS': 10,
    'Azure': 10,
    'Docker': 9,
    'Kubernetes': 9
};

// Common experience and proficiency keywords
const experienceKeywords = ['years of experience', 'proficient in', 'certified', 'expert', 'familiar with', 'hands-on experience', 'advanced', 'intermediate'];

// Helper function to recommend courses based on skill gaps
const recommendCourses = (skills) => {
    const recommendedCourses = [];

    // Data science related courses
    if (skills.includes('Python') || skills.includes('SQL')) {
        recommendedCourses.push(...ds_course);
    }
    
    // Web development related courses
    if (skills.includes('JavaScript') || skills.includes('React') || skills.includes('Node.js') || skills.includes('Django')) {
        recommendedCourses.push(...web_course);
    }

    // Android development related courses
    if (skills.includes('Java') || skills.includes('Kotlin')) {
        recommendedCourses.push(...android_course);
    }

    // iOS development related courses
    if (skills.includes('Swift') || skills.includes('Objective-C')) {
        recommendedCourses.push(...ios_course);
    }

    // UI/UX design courses
    if (skills.includes('UI') || skills.includes('UX') || skills.includes('design')) {
        recommendedCourses.push(...uiux_course);
    }

    return recommendedCourses;
};

const calculateATSScore = (text) => {
    let atsScore = 0;
    let missingSkills = [];
    
    // Convert text to lowercase for case-insensitive matching
    const lowerText = text.toLowerCase();

    // Check for skills and give weighted scores
    Object.keys(commonSkills).forEach(skill => {
        const skillRegex = new RegExp(`\\b${skill.toLowerCase()}\\b`, 'g'); // Word boundary for accurate matching
        const skillMatches = lowerText.match(skillRegex);
        if (skillMatches) {
            atsScore += commonSkills[skill] * skillMatches.length; // Add weighted score based on occurrences
        } else {
            missingSkills.push(skill); // Track missing skills for course recommendations
        }
    });

    // Check for experience-related keywords
    experienceKeywords.forEach(keyword => {
        if (lowerText.includes(keyword)) {
            atsScore += 5; // Add points for relevant experience
        }
    });

    // Check for specific certifications (example)
    if (lowerText.includes('certified aws solutions architect')) {
        atsScore += 15; // Add extra points for specific certifications
    }

    // Check for role-specific terms
    const roles = ['frontend developer', 'backend developer', 'full stack developer', 'data scientist', 'project manager'];
    roles.forEach(role => {
        if (lowerText.includes(role)) {
            atsScore += 10; // Add points for matching job roles
        }
    });

    // Recommend courses based on missing skills
    const recommendedCourses = recommendCourses(missingSkills);

    return {
        atsScore,
        recommendedCourses
    };
};

// Export the function using module.exports
module.exports = calculateATSScore;
