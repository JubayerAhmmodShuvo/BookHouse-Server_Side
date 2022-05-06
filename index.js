const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();


app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.haogd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const bookCollections = client.db("bookhouse").collection("book");

    app.get('/books', async (req, res) => {
      const query = {};
      const books = await bookCollections.find(query).toArray();
      res.send(books);
    })

    app.get('/books/:id', async (req, res) => { 
      const book = await bookCollections.findOne({ _id: new ObjectId(req.params.id) });
      res.send(book);
    })

    app.put('/books/:id', async (req, res) => {
      const id = req.params.id;
      const updatedQunatity = req.body.quantity;
      const updatedSold = req.body.sold;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const update = { $set: { quantity: updatedQunatity,sold:updatedSold } };
      const result = await bookCollections.updateOne(filter, update, options);
      res.send(result);
    })

    app.delete('/books/:id', async (req, res) => {
      const id = req.params.id;
      const result = await bookCollections.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    }
    )

    app.post('/books', async (req, res) => { 
      const book = req.body;
      const result = await bookCollections.insertOne(book);
      res.send(result);

    })

    
    

  
   


    console.log("Connected correctly to server");
    
  }
  finally {

  }
}
run().catch(console.dir);





app.get("/", (req, res) => {
  res.send("Welcome To Bookhouse!!!");
});

app.listen(port, () => console.log(`Listening on port ${port}`));