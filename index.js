const express = require("express");
const server = express();
const PORT = process.env.PORT || 8909;

const io = require("socket.io")(PORT, {
  cors: {
    origin: "*",
  },
});

let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  for (let x = 0; x < users.length; x++) {
    if (users[x].userId === userId) return users[x].socketId;
  }
};

io.on("connection", (socket) => {
  // when connect
  console.log("A user connected!");
  io.emit("welcome", "hello this is socket server!");
  //taker userId and socketId from user
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  // send and get message
  socket.on("sendMessage", ({ userId, receiverId, text }) => {
    const user = getUser(receiverId);
    console.log(users);
    console.log(user);
    io.to(user).emit("getMessage", {
      userId,
      text,
    });
  });

  socket.on("sendConversation", ({ userId, receiverId, data }) => {
    const user = getUser(receiverId);
    console.log(data);
    io.to(user).emit("getConversation", {
      data,
    });
  });

  // when disconnect
  socket.on("disconnect", () => {
    console.log("A user disconnected!");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});

server.listen(PORT, () => {
  console.log(`%s listening at ${PORT}`); // eslint-disable-line no-console
});
