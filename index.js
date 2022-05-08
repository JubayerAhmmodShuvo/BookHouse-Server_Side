const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) { 
  const authHeader = req.headers.authorization;
  if (!authHeader) { 
    return res.status(401).send({message:"Unauthorized"});
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Forbidden" });
    }
    else { 
       
      req.decoded = decoded;
      next();
    }
  });
  

    
}

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
   
    app.post('/login', async (req, res) => { 
      const user = req.body;
      const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_KEY, {
        expiresIn: "12h",
      });
      res.send({ accessToken });


    })

    app.get("/books", async (req, res) => {
      const query = {};
      const books = await bookCollections.find(query).toArray();
      res.send(books);
    });

    app.get("/books/:id", async (req, res) => {
      const book = await bookCollections.findOne({
        _id: new ObjectId(req.params.id),
      });
      res.send(book);
    });

    app.put("/books/:id", async (req, res) => {
      const id = req.params.id;
      const updatedQunatity = req.body.quantity;
      const updatedSold = req.body.sold;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const update = { $set: { quantity: updatedQunatity, sold: updatedSold } };
      const result = await bookCollections.updateOne(filter, update, options);
      res.send(result);
    });

    app.delete("/books/:id", async (req, res) => {
      const id = req.params.id;
      const result = await bookCollections.deleteOne({ _id: ObjectId(id) });
      res.send(result);
    });

    app.post("/books", async (req, res) => {
      const book = req.body;
      const result = await bookCollections.insertOne(book);
      res.send(result);
    });

   
    app.get("/book", verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.user.email;
      
      const email = req.query.email;
      if (email === decodedEmail) {
        const query = { email: email };
        const items = await bookCollections.find(query).toArray();
        res.send(items);
      }
      else { 
       res.status(403).send({ message: "forbidden access" });
      }
    });


    console.log("Connected correctly to server");
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome To Bookhouse!!!");
});

app.listen(port, () => console.log(`Listening on port ${port}`));
