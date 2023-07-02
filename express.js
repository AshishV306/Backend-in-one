import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

//connecting to mongoDB
mongoose.connect("mongodb://localhost:27017/", {
    dbName: "back",
  }).then(() => console.log("database Connected")).catch(() => console.log(e));

  //Defining Schema
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

//Creating colecction named userdetail
const User = mongoose.model("userdetail", UserSchema);

//creating server
const app = express();

app.use(cookieParser());
app.use(express.urlencoded({ extended: true })); //using middleware: this one gives req.body for use

app.set("views engine", "ejs");

const isAuthenticated = async (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    const decoded = jwt.verify(token, "sdgbdfghfbfsdg");
    req.user = await User.findById(decoded._id);
    next(); //goes to next paramerter after isAuthenticated i.e res.render("logout.ejs", { name: req.user.name });
  } 
  else {
    res.render("login.ejs");
  }
};

app.get("/", (req, res) => {
  res.render("login.ejs");
});

app.get("/login", isAuthenticated, async (req, res) => {
  res.render("logout.ejs", { name: req.user.name });
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.get("/logout", (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.redirect("/login");
});

app.post("/login", async (req, res) => {

  const { name, email, password } = req.body;

  //putting condition for duplicate user login

  let present = await User.findOne({ email });

  if (!present) {
    return res.redirect("/register");
  }
  //here we check if entered password is correct or not
  //const isMatch = present.password === password;

  //as we have encrypted the password we first decrypt it for comparison
  const isMatch = await bcrypt.compare(password, present.password);

  if (!isMatch) {
    return res.render("login.ejs", { email, message: "Incorrect Password" });
  } else {
    // const userID = await User.create({name: req.body.name, email: req.body.email})

    //we use jwt token to hide our id as it can be visible
    const newToken = jwt.sign({ _id: present._id }, "sdgbdfghfbfsdg"); //we create new token with our value and some secret value
    console.log(newToken);

    res.cookie("token", newToken, {
      //setting cookie with name, value
      expires: new Date(Date.now() + 60 * 1000), //cookie will expire after 60 sec means you will be logout after 60 sec as cookie maintains session ex. some app logs out after some period
      httpOnly: true, //it means only server side can access cookie
    });
    console.log(req.body);

    res.redirect("/login");
  }
});

app.post("/register", async (req, res) => {
  
  const { name, email } = req.body;

  //putting condition for duplicate user login

  let present1 = await User.findOne({ email });

  //bcrypt is used to hide the password in database by encrypting it
  const hashpassword = await bcrypt.hash(req.body.password, 10);

  if (present1) {
    //return console.log("Register first");
    return res.redirect("/login");
  } else {
    const userID = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: hashpassword,
    });

    //we use jwt token to hide our id as it can be visible
    const newToken = jwt.sign({ _id: userID._id }, "sdgbdfghfbfsdg"); //we create new token with our value and some secret value
    console.log(newToken);

    res.cookie("token", newToken, {
      //setting cookie with name, value
      expires: new Date(Date.now() + 60 * 1000), //cookie will expire after 60 sec means you will be logout after 60 sec as cookie maintains session ex. some app logs out after some period
      httpOnly: true, //it means only server side can access cookie
    });
    console.log(req.body);

    res.redirect("/");
  }
});



//listening server
app.listen(3000, () => {
  console.log("express server running");
});
