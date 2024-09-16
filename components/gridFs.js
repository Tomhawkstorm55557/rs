const mongoose = require('mongoose');

const setupGridFS = (conn) => {
    return new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'resumes'
    });
};

module.exports = setupGridFS;
