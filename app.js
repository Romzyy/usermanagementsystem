const express = require("express");
const exphbs = require("express-handlebars");
require("dotenv").config();
const session = require("express-session");
const passport = require("passport");
const initializePassport = require("./server/controllers/passport");
const dotenv = require("dotenv");
const app = express();
const flash = require("connect-flash");

const port = process.env.PORT || 8000;

// Load environment variables
dotenv.config();

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize Passport and Session
initializePassport(passport);
app.use(passport.initialize());
app.use(passport.session());

// Login Form Submission
app.post(
  "/users/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

// Logout Route
app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/login");
});

// Parsing middleware
app.use(express.urlencoded({ extended: true }));

// Parse application/json
app.use(express.json());

// Static Files
app.use(express.static("public"));

// Flash messages middleware
app.use(flash());

// Templating Engine
const handlebars = exphbs.create({ extname: ".hbs" });
app.engine(".hbs", handlebars.engine);
app.set("view engine", ".hbs");

app.get("/login", (req, res) => {
  res.render("login");
});

const users = [
  {
    email: "test@example.com",
    hashedPassword: "$2b$10$...hash...", // Replace with a hashed password
  },
];

// Login Form Submission
app.post("/users/login", async (req, res) => {
  const { email, password } = req.body;

  // Find user in the database
  const user = users.find((user) => user.email === email);

  if (user) {
    // Compare provided password with stored hashed password
    const match = await bcrypt.compare(password, user.hashedPassword);
    if (match) {
      // Store user information in session
      req.session.user = { email: user.email };
      return res.redirect("/"); // Redirect to home page on successful login
    }
  }

  // Render login page with an error message
  res.render("login", { alert: "Invalid email or password." });
});

const routes = require("./server/routes/user");
app.use("/", routes);

app.listen(port, () => console.log(`Listening on port ${port}`));
