const conn = require('../mongoConnection');

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

module.exports = insertData;
