const express = require("express");
const basicAuth = require("basic-auth");
require("dotenv").config();

const app = express();

// Basic Auth Middleware
const auth = (req, res, next) => {
  const user = basicAuth(req);
  if (
    !user ||
    user.name !== process.env.USERNAME ||
    user.pass !== process.env.PASSWORD
  ) {
    res.set("WWW-Authenticate", 'Basic realm="401"');
    return res.status(401).send("Authentication required.");
  }
  next();
};

// Routes
app.get("/", (req, res) => {
  res.send("This page is deployed in remote server using docker.!");
});

app.get("/secret", auth, (req, res) => {
  res.send(process.env.SECRET_MESSAGE || "No secret message provided.");
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
