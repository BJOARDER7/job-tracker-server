const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;


// middleware
app.use(cors(
//   {
//   origin: ["http://localhost:5173", 
//     "https://job-tracker-firebase.web.app", 
//     "https://job-tracker-firebase.firebaseapp.com/"],
//   credentials: true,
// }
));
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wo01dvu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const jobsCollection = client.db("jobTrackerDb").collection("jobs");


    app.get('/jobs', async (req, res) => {
      const cursor = jobsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
  })

  app.get('/jobs/:id', async(req, res) => {
    const id = req.params.id;
    const query = {_id: new ObjectId(id)};
    const result = await jobsCollection.findOne(query);
    res.send(result);
  })

  app.post('/jobs', async(req, res) => {
    const newJob = req.body;
    console.log(newJob);
    const result = await jobsCollection.insertOne(newJob);
    res.send(result);
  })

  app.put('/jobs/:id', async(req, res) => {
    const id = req.params.id;
    const filter = {_id: new ObjectId(id)}
    const options = { upsert: true };
    const updatedJob = req.body;

    const job = {
        $set: {
            title: updatedJob.title, 
            category: updatedJob.category, 
            salary_range: updatedJob.salary_range, 
            description: updatedJob.description, 
            posting_date: updatedJob.posting_date, 
            application_deadline: updatedJob.application_deadline, 
            applicants: updatedJob.applicants,
            image: updatedJob.image,            
            name: updatedJob.name,
            email: updatedJob.email
        }
    }

    const result = await jobsCollection.updateOne(filter, job, options);
    res.send(result);
})

  app.delete('/jobs/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await jobsCollection.deleteOne(query);
    res.send(result);
  })

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
  res.send('Job tracker is running')
})

app.listen(port, () => {
  console.log(`Job tracker is running on port, ${port}`)
})