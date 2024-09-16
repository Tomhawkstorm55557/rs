const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const insertData = require('../utils/insertData');
const extractDataFromText = require('../utils/extractData');
const calculateATSScore = require('../utils/atsScoreCalculator');
const storage = require('../components/multerStorage');

const router = express.Router();
const upload = multer({ storage });

// POST route to analyze a resume
router.post('/analyze-resume', upload.single('resume'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    try {
        const fileId = req.file.id || req.file._id;
        if (!fileId) {
            console.error('Error: File ID is undefined.');
            throw new Error('File ID is undefined.');
        }

        const fileStream = req.gfs.openDownloadStream(fileId);
        let pdfBuffer = Buffer.alloc(0);

        // Collect file chunks
        fileStream.on('data', (chunk) => {
            pdfBuffer = Buffer.concat([pdfBuffer, chunk]);
        });

        fileStream.on('end', async () => {
            try {
                // Log PDF buffer length
                console.log('PDF Buffer Size:', pdfBuffer.length);

                // Check if buffer is empty
                if (pdfBuffer.length === 0) {
                    throw new Error('PDF buffer is empty. File might not be loaded properly.');
                }

                // Parse the PDF
                const resumeData = await pdfParse(pdfBuffer);
                const resumeText = resumeData.text;

                // Log the extracted text
                console.log('Extracted Resume Text:', resumeText);

                // Extract data from text
                const extractedData = extractDataFromText(resumeText);
                console.log('Extracted Data:', extractedData);  // Log extracted data

                // Calculate ATS score
                extractedData.atsScore = calculateATSScore(resumeText);
                console.log('ATS Score:', extractedData.atsScore);  // Log ATS score

                // Insert the data into the database
                await insertData(req.conn, extractedData);

                // Return the extracted data as a response
                res.json(extractedData);
            } catch (error) {
                console.error('Error parsing resume:', error.message);
                res.status(500).send('Error parsing resume');
            }
        });

        fileStream.on('error', (error) => {
            console.error('Error reading from GridFS:', error);
            res.status(500).send('Error processing resume');
        });
    } catch (error) {
        console.error('Error processing resume:', error.message);
        res.status(500).send('Error processing resume');
    }
});

module.exports = router;
