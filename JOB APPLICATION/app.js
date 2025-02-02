const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3000; // Choose your desired port number

// MongoDB connection URI
const uri = 'mongodb://localhost:27017'; // Replace with your MongoDB URI
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Connect to MongoDB
async function connectDB() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

connectDB();

// Middleware to parse JSON and urlencoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (like your HTML form)
app.use(express.static('public'));

// Route handlers for form submissions
app.post('/apply', async (req, res) => {
    try {
        const { fullname, email, phone, coverletter, position, education } = req.body;

        // Insert data into MongoDB
        const database = client.db('job_application'); // Replace with your actual database name
        const collection = database.collection('applications');

        const application = {
            fullname,
            email,
            phone,
            coverletter,
            position,
            education
        };

        const result = await collection.insertOne(application);
        console.log(${result.insertedCount} document inserted);

        // Respond with success message or redirect
        res.status(200).send('Application submitted successfully');
    } catch (error) {
        console.error('Error submitting application:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/update', async (req, res) => {
    try {
        const { email, phone, coverletter, position, education } = req.body;

        // Update data in MongoDB
        const database = client.db('job_application'); // Replace with your actual database name
        const collection = database.collection('applications');

        const filter = { email: email }; // Assuming email is unique identifier for update
        const updateDoc = {
            $set: {
                phone,
                coverletter,
                position,
                education
            }
        };

        const result = await collection.updateOne(filter, updateDoc);
        console.log(${result.modifiedCount} document updated);

        // Respond with success message or redirect
        res.status(200).send('Application updated successfully');
    } catch (error) {
        console.error('Error updating application:', error);
        res.status(500).send('Internal Server Error');
    }
});

// POST request to fetch all applications in table format
app.post('/applications', async (req, res) => {
    try {
        // Retrieve all applications from MongoDB
        const database = client.db('job_application'); // Replace with your actual database name
        const collection = database.collection('applications');

        const applications = await collection.find({}).toArray();

        // Format applications as HTML table rows
        let tableRows = '';
        applications.forEach(application => {
            tableRows += `
                <tr>
                    <td>${application.fullname}</td>
                    <td>${application.email}</td>
                    <td>${application.phone}</td>
                    <td>${application.coverletter}</td>
                    <td>${application.position}</td>
                    <td>${application.education}</td>
                </tr>
            `;
        });

        // Send back HTML response with table
        const tableHTML = `
            <html>
            <head>
                <title>Applications</title>
                <link href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body>
                <div class="container mt-5">
                    <h1 class="text-center">Job Applications</h1>
                    <table class="table">
                        <thead class="thead-dark">
                            <tr>
                                <th>Full Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Cover Letter</th>
                                <th>Position</th>
                                <th>Education</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows}
                        </tbody>
                    </table>
                </div>
            </body>
            </html>
        `;

        res.status(200).send(tableHTML);
    } catch (error) {
        console.error('Error retrieving applications:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Start the server
app.listen(port, () => {
    console.log(Server is running on http://localhost:${port});
});
