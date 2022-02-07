import session from "express-session";
import Keycloak from "keycloak-connect";

import { WebSocketServer } from 'ws';
import express from "express";
import http from 'http';
import path from "path";
import bodyParser from 'body-parser';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ clientTracking: false, noServer: true });
const connectionMap = new Map();

const kcConfig = {
  "client-id": process.env.GW_CLIENTID,
  "auth-server-url": process.env.GW_AUTHURL,
  "realm": process.env.GW_REALM,
  "secret": process.env.GW_CLIENTSECRET,
  "public-client": false
};
const APIKEY = process.env.GW_APIKEY;

const memoryStore = new session.MemoryStore();
const keycloak = new Keycloak({ store: memoryStore }, kcConfig);

function msgObject(group, username, adminMsg, msg) {
  this.group = group,
    this.username = username,
    this.adminMsg = adminMsg,
    this.msg = msg
}

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());

const sessionParser = session({
  secret: process.env.GW_SESS_KEY,
  resave: false,
  saveUninitialized: true,
  store: memoryStore,
});
app.use(sessionParser);
app.set('trust proxy', true);
app.use(keycloak.middleware());

app.get("/", keycloak.protect(), (req, res) => {
  req.session.username = req.kauth.grant.access_token.content.preferred_username;
  req.session.groups = req.kauth.grant.access_token.content.groups;
  res.render("index", { title: "Guardian Prototype", hostURL: `\'${process.env.GW_REDIRECT_URL}\'` });
});

app.post("/sendMessage", (req, res) => {

  if (req.headers['gw_apikey'] === APIKEY) {
    let counter = 0;
    const message = new msgObject(req.body.group, req.body.username, req.body.adminMsg, req.body.msg);

    for (const [key, value] of connectionMap.entries()) {
      if (message.group === "all" && (message.msg !== undefined || message.msg !== "")) {
        value.send(JSON.stringify({ adminMsg: message.adminMsg, msg: message.msg }));
        counter++;
      }
      if (message.group !== undefined && message.username === undefined && (message.msg !== undefined && message.msg !== "")) {

        if (key.groups.includes(message.group)) {
          value.send(JSON.stringify({ adminMsg: message.adminMsg, msg: message.msg }));
          counter++;
        }
      }
      if (message.username !== undefined && message.group === undefined && (message.msg !== undefined && message.msg !== "")) {
        if (key.username === message.username) {
          value.send(JSON.stringify({ adminMsg: message.adminMsg, msg: message.msg }));
          counter++;
        }
      }
    }
    res.status(200).send(`{\"message\":  \"ok\", \"sentCounter\": \"${counter}\"}`);
  }
  else {
    res.status(401).send("Access denied");
  }
});

server.on('upgrade', function (request, socket, head) {
  console.log('Parsing session from request...');
  sessionParser(request, {}, () => {
    if (!request.session.username) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    console.log('Session is parsed!');

    wss.handleUpgrade(request, socket, head, function (ws) {
      wss.emit('connection', ws, request);
    });
  });
});

wss.on('connection', function connection(ws, request) {
  const tmpObject = {
    username: request.session.username,
    groups: request.session.groups
  }
  connectionMap.set(tmpObject, ws)
  ws.send('Connection to guardian etablished!');
  
  ws.on('message', function message(data) {
    console.log('received: %s', data);
    
  });
  ws.on('close', function () {
    connectionMap.delete({ username: request.session.username, groups: request.session.groups });
  });

});

server.listen(4000, "0.0.0.0", () => {
  console.log("Server started");
});
