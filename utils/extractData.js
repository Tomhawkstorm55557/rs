const commonSkills = [
    'Python', 'JavaScript', 'Java', 'C\\+\\+', 'C#', 'PHP', 'Swift', 'Kotlin', 'SQL', 'R', 'Go', 'Ruby', 'MATLAB',
    'HTML', 'CSS', 'React', 'Angular', 'Vue', 'Node.js', 'Django', 'Flask', 'Spring', 'ASP.NET', 'MySQL', 'PostgreSQL',
    'MongoDB', 'Oracle', 'Git', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Machine Learning', 'Deep Learning',
    'Data Analysis', 'Data Visualization', 'Big Data', 'Hadoop', 'Spark', 'TensorFlow', 'PyTorch', 'Scikit-Learn',
    'Natural Language Processing', 'Computer Vision', 'Blockchain', 'Cybersecurity', 'DevOps'
];

// Function to escape special characters in skill names for regex
const escapeSpecialChars = (string) => {
    // Escape special characters for regex (including '+', '.', '*', etc.)
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const extractDataFromText = (text) => {
    const extractedData = {};

    // Regex patterns for different job titles
    const jobTitleRegex = {
        'Android Developer': /Android\s*Developer\s*[:\-]?\s*([\w\s]+)\s*/i,
        'Data Analyst': /Data\s*Analyst\s*[:\-]?\s*([\w\s]+)\s*/i,
        'Data Scientist': /Data\s*Scientist\s*[:\-]?\s*([\w\s]+)\s*/i,
        'Software Engineer': /Software\s*Engineer\s*[:\-]?\s*([\w\s]+)\s*/i,
        'Web Developer': /Web\s*Developer\s*[:\-]?\s*([\w\s]+)\s*/i,
        'UI/UX Designer': /UI\/UX\s*Designer\s*[:\-]?\s*([\w\s]+)\s*/i,
        'Network Engineer': /Network\s*Engineer\s*[:\-]?\s*([\w\s]+)\s*/i,
        'Business Analyst': /Business\s*Analyst\s*[:\-]?\s*([\w\s]+)\s*/i,
        'System Administrator': /System\s*Administrator\s*[:\-]?\s*([\w\s]+)\s*/i,
        'DevOps Engineer': /DevOps\s*Engineer\s*[:\-]?\s*([\w\s]+)\s*/i,
        'Database Administrator': /Database\s*Administrator\s*[:\-]?\s*([\w\s]+)\s*/i,
        'iOS Developer': /iOS\s*Developer\s*[:\-]?\s*([\w\s]+)\s*/i,
    };

    // Attempt to match each job title regex
    let jobTitleFound = false;
    Object.keys(jobTitleRegex).forEach(title => {
        const match = text.match(jobTitleRegex[title]);
        if (match) {
            extractedData.jobTitle = title;
            extractedData.name = match[1].trim();
            jobTitleFound = true;
        }
    });

    if (!jobTitleFound) {
        extractedData.jobTitle = 'N/A';
        extractedData.name = 'N/A';
    }

    // Extract Email
    const emailMatch = text.match(/Email\s*:\s*([\w._%+-]+@[\w.-]+\.[a-zA-Z]{2,})/i);
    extractedData.email = emailMatch ? emailMatch[1].trim() : 'N/A';

    // Extract Skills, escaping special characters in skill names for regex
    const skills = [];
    commonSkills.forEach(skill => {
        const escapedSkill = escapeSpecialChars(skill);
        const skillRegex = new RegExp(`\\b${escapedSkill}\\b`, 'i'); // Using the escaped skill in regex
        if (skillRegex.test(text)) {
            skills.push(skill);
        }
    });
    extractedData.skills = skills;

    // Extract Achievements
    const achievementMatch = text.match(/Achievements\s*[:\-]?\s*([\w\s.,;]+)/i);
    extractedData.achievements = achievementMatch ? achievementMatch[1].trim().split(/[\r\n]+/) : [];

    // Check for the presence of key sections and keywords
    const sectionKeywords = {
        'Objective': ['Objective', 'Career Objective', 'Professional Objective'],
        'Declaration': ['Declaration'],
        'Hobbies': ['Hobbies', 'Interests'],
        'Achievements': ['Achievements', 'Awards', 'Honors', 'Recognition'],
        'Projects': ['Projects', 'Project Experience', 'Notable Projects']
    };

    extractedData.sections = {};
    Object.keys(sectionKeywords).forEach(section => {
        extractedData.sections[section] = sectionKeywords[section].some(keyword => {
            const regex = new RegExp(keyword, 'i');
            return regex.test(text);
        });
    });

    // Calculate ATS score based on the presence of certain sections and keywords
    const sectionScores = {
        'Objective': 10,
        'Declaration': 5,
        'Hobbies': 5,
        'Achievements': 10,
        'Projects': 15
    };

    // Add points for sections present in the resume
    let atsScore = 0;
    Object.keys(sectionScores).forEach(section => {
        if (extractedData.sections[section]) {
            atsScore += sectionScores[section];
        }
    });

    // Add points for each skill matched
    atsScore += (skills.length * 2); // Each skill gives 2 points

    // Store ATS score
    extractedData.atsScore = atsScore;

    return extractedData;
};

module.exports = extractDataFromText;
