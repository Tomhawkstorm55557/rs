const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const mongoose = require('mongoose');
const pdfParse = require('pdf-parse');
const { ds_course, web_course, android_course, ios_course, uiux_course } = require('./courses'); // Importing recommended courses

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection setup
const mongoURI = 'mongodb+srv://vinayaksharma20715:Vinayak@cluster0.ubtgdeq.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
const conn = mongoose.connection;

// GridFS setup
let gfs;
conn.once('open', () => {
    gfs = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'resumes'
    });
    console.log('MongoDB connection established and GridFS initialized');
});

// Multer storage engine setup
const storage = new GridFsStorage({
    url: mongoURI,
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file: (req, file) => ({
        bucketName: 'resumes',
        filename: file.originalname,
        metadata: req.body
    })
});
const upload = multer({ storage });

// Function to insert data into MongoDB
const insertData = (data) => {
    const collection = conn.db.collection('user_data');
    collection.insertOne(data, (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return;
        }
        console.log('Data inserted successfully');
    });
};

// Common skills list
const commonSkills = [
    'Python', 'JavaScript', 'Java', 'C\\+\\+', 'C#', 'PHP', 'Swift', 'Kotlin', 'SQL', 'R', 'Go', 'Ruby', 'MATLAB',
    'HTML', 'CSS', 'React', 'Angular', 'Vue', 'Node.js', 'Django', 'Flask', 'Spring', 'ASP.NET', 'MySQL', 'PostgreSQL',
    'MongoDB', 'Oracle', 'Git', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Machine Learning', 'Deep Learning',
    'Data Analysis', 'Data Visualization', 'Big Data', 'Hadoop', 'Spark', 'TensorFlow', 'PyTorch', 'Scikit-Learn',
    'Natural Language Processing', 'Computer Vision', 'Blockchain', 'Cybersecurity', 'DevOps'
];

// Function to extract data from resume text and calculate ATS score
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

    // Extract Skills
    const skills = [];
    commonSkills.forEach(skill => {
        const skillRegex = new RegExp(`\\b${skill}\\b`, 'i');
        if (skillRegex.test(text)) {
            skills.push(skill);
        }
    });
    extractedData.skills = skills;

   // Extract Achievements
   const achievementMatch = text.match(/Achievements\s*[:\-]?\s*([\w\s.,;]+)/i);
   extractedData.achievements = achievementMatch ? achievementMatch[1].trim().split(/[\r\n]+/) : [];

   // Calculate ATS score
   let atsScore = 0;

   // Check for the presence of key sections and keywords
   const sectionKeywords = {
       'Objective': ['Objective', 'Career Objective', 'Professional Objective'],
       'Declaration': ['Declaration'],
       'Hobbies': ['Hobbies', 'Interests'],
       'Achievements': ['Achievements', 'Awards', 'Honors', 'Recognition'],
       'Projects': ['Projects', 'Project Experience', 'Notable Projects']
   };

   Object.keys(sectionKeywords).forEach(section => {
       sectionKeywords[section].forEach(keyword => {
           if (text.includes(keyword)) {
               atsScore += 20;
           }
       });
   });

   // Add more granularity to the scoring process
   const granularKeywords = {
       'Objective': ['seeking', 'aim', 'goal'],
       'Declaration': ['declare', 'hereby', 'certify'],
       'Hobbies': ['reading', 'travelling', 'sports'],
       'Achievements': ['award', 'honor', 'recognition', 'certificate'],
       'Projects': ['developed', 'implemented', 'designed']
   };

   Object.keys(granularKeywords).forEach(section => {
       granularKeywords[section].forEach(keyword => {
           const regex = new RegExp(`\\b${keyword}\\b`, 'i');
           if (regex.test(text)) {
               atsScore += 5;
           }
       });
   });

   extractedData.atsScore = atsScore;


    // Recommend courses based on job title
    switch (extractedData.jobTitle) {
        case 'Data Scientist':
            extractedData.recommendedCourses = ds_course;
            break;
        case 'Web Developer':
            extractedData.recommendedCourses = web_course;
            break;
        case 'Android Developer':
            extractedData.recommendedCourses = android_course;
            break;
        case 'iOS Developer':
            extractedData.recommendedCourses = ios_course;
            break;
        case 'UI/UX Designer':
            extractedData.recommendedCourses = uiux_course;
            break;
        default:
            extractedData.recommendedCourses = [];
            break;
    }

    console.log('Extracted Data:', extractedData); // Debug log to see the final extracted data

    return extractedData;
};

// Route to analyze uploaded resume
app.post('/analyze-resume', upload.single('resume'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    try {
        console.log('File uploaded:', req.file);
        const fileId = req.file.id || req.file._id;
        if (!fileId) {
            throw new Error('File ID is undefined.');
        }

        const fileStream = gfs.openDownloadStream(fileId);
        let pdfBuffer = Buffer.alloc(0);

        fileStream.on('data', (chunk) => {
            pdfBuffer = Buffer.concat([pdfBuffer, chunk]);
        });

        fileStream.on('end', async () => {
            try {
                const resumeData = await pdfParse(pdfBuffer);
                const resumeText = resumeData.text;

                const extractedData = extractDataFromText(resumeText);

                const name = extractedData.name || 'N/A';
                const email = extractedData.email || 'N/A';
                const candidateLevel = extractedData.jobTitle !== 'N/A' ? 'Experienced' : 'Fresher'; // Adjust based on job title
                const skills = extractedData.skills || [];
                const recommendedCourses = extractedData.recommendedCourses || [];
                const atsScore = extractedData.atsScore || 0;

                const data = {
                    name,
                    email,
                    candidateLevel,
                    skills,
                    recommendedCourses,
                    atsScore
                };

                insertData(data);

                res.json(data);
            } catch (error) {
                console.error('Error parsing resume:', error);
                res.status(500).send('Error parsing resume');
            }
        });

        fileStream.on('error', (error) => {
            console.error('Error processing resume:', error);
            res.status(500).send('Error processing resume');
        });
    } catch (error) {
        console.error('Error processing resume:', error);
        res.status(500).send('Error processing resume');
    }
});

// Server start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
