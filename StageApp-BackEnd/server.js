const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const bodyParser = require("body-parser");
const _ = require("lodash");

const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));

const server = require("http").createServer(app);
const io = require("socket.io").listen(server);

const { User } = require("./Helpers/UserClass");

require("./socket/streams")(io, User, _);
require("./socket/private")(io);

const dbConfig = require("./config/secret");
const auth = require("./routes/authRoutes");
const post = require("./routes/postRoutes");
const users = require("./routes/userRoutes");
const friends = require("./routes/friendsRoutes");
const message = require("./routes/messageRoutes");
const image = require("./routes/imageRoutes");
const file = require("./routes/fileRoutes");

//Cross Origin Access
// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Credentials", "true");
//   res.header(
//     "Access-Control-Allow-Methods",
//     "GET",
//     "POST",
//     "PUT",
//     "DELETE",
//     "OPTIONS"
//   );
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept, Authorization"
//   );
//   next();
// });

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

//app.use(logger("dev"));

mongoose.Promise = global.Promise;
mongoose.connect(dbConfig.url, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

app.use("/api/chatapp", auth);
app.use("/api/chatapp", post);
app.use("/api/chatapp", users);
app.use("/api/chatapp", friends);
app.use("/api/chatapp", message);
app.use("/api/chatapp", image);
app.use("/api/chatapp", file);

// app.use("/api/chatapp/uploads", express.static(__dirname + "/uploads"));
app.use(
  "/api/chatapp/upload-image",
  express.static(__dirname + "/uploads/images")
);
app.use(
  "/api/chatapp/upload-file",
  express.static(__dirname + "/uploads/files")
);
server.listen(3000, () => {
  console.log("Running on port 3000");
});
