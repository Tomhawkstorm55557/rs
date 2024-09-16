const { GridFsStorage } = require('multer-gridfs-storage');

const mongoURI = 'mongodb+srv://vinayaksharma20715:Vinayak@cluster0.ubtgdeq.mongodb.net/?retryWrites=true&w=majority';

const storage = new GridFsStorage({
    url: mongoURI,
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file: (req, file) => ({
        bucketName: 'resumes',
        filename: file.originalname,
        metadata: req.body
    })
});

module.exports = storage;
