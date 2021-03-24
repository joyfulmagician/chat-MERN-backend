import express from "express";
import mongoose from "mongoose";
import Messages from "./dbmessages.js";
import Chats from "./dbChats.js";
import Users from "./dbUsers.js";
import Pusher from "pusher";
import cors from "cors";
const key = process.env.KEY;
const secret = process.env.SECRET;
const db_url = process.env.DB_URL;

const app = express();
const port = process.env.PORT || 9000;

const pusher = new Pusher({
  appId: "1159554",
  key: key,
  secret: secret,
  cluster: "ap2",
  useTLS: true,
});

app.use(express.json());
app.use(cors());

mongoose.connect(db_url, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.once("open", () => {
  console.log("DB connected");
  const msgCollection = db.collection("messagecontents");
  const changeStreamMsg = msgCollection.watch();

  changeStreamMsg.on("change", (change) => {
    if (change.operationType === "insert") {
      const messageDetails = change.fullDocument;
      pusher.trigger("messages", "inserted", {
        name: messageDetails.name,
        message: messageDetails.message,
        timestamp: messageDetails.timestamp,
        received: messageDetails.received,
        roomid: messageDetails.roomid,
        googleid: messageDetails.googleid,
      });
    } else {
      console.log("Error triggering pusher");
    }
  });
  const chatCollection = db.collection("chats");
  const changeStreamChat = chatCollection.watch();

  changeStreamChat.on("change", (change) => {
    if (change.operationType === "insert") {
      const chatDetails = change.fullDocument;
      pusher.trigger("chats", "inserted", {
        id: chatDetails.id,
        name: chatDetails.name,
        email: chatDetails.email,
      });
    } else {
      console.log("Error triggering pusher");
    }
  });
  const userCollection = db.collection("users");
  const changeStreamUser = userCollection.watch();

  changeStreamUser.on("change", (change) => {
    if (change.operationType === "insert") {
      const userDetails = change.fullDocument;
      pusher.trigger("users", "inserted", {
        name: userDetails.name,
        email: userDetails.email,
        img: userDetails.img,
      });
    } else {
      console.log("Error triggering pusher");
    }
  });
});

app.get("/api/v1/messages/sync", (req, res) => {
  Messages.find((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});

app.get("/api/v1/room/sync", (req, res) => {
  Chats.find((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});

app.get("/api/v1/room/:roomId", (req, res) => {
  const { roomId } = req.params;
  Chats.find({ id: roomId }, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});

app.get("/api/v1/messages/:roomId", (req, res) => {
  const { roomId } = req.params;
  Messages.find({ roomid: roomId }, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});
app.get("/api/v1/login/:email", (req, res) => {
  const { email } = req.params;
  Users.find({ email: email }, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});

app.post("/api/v1/messages/new", (req, res) => {
  const dbMessage = req.body;

  Messages.create(dbMessage, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(data);
    }
  });
});

app.post("/api/v1/login", (req, res) => {
  const dbUser = req.body;

  Users.create(dbUser, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(data);
    }
  });
});

app.post("/api/v1/room/new", (req, res) => {
  const dbChat = req.body;
  Chats.create(dbChat, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
