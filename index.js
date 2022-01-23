import { WebSocketServer } from 'ws';
import express from "express";
import http from 'http';
import path from "path";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', function connection(ws) {
  ws.on('message', function message(data) {
    console.log('received: %s', data);
    ws.send('Hello Client!');
  });

});

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    // #swagger.ignore = true
    res.render("index", {title: "Guardian Prototype"});
  });

server.listen(8080, "127.0.0.1");
