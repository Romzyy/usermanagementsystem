const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const pool = require("../controllers/db");

// Mock user data (replace with your database queries)
const users = [
  {
    id: 1,
    username: "user",
    password:
      "$2b$10$ZAnDmxrSrgVKBzB.gBGa7u9NjI8kCqLmYs97EV09hxR06rOD5D6y6" /* hashed: "password" */,
  },
];

function initialize(passport) {
  const authenticateUser = async (username, password, done) => {
    pool.query(
      "SELECT * FROM users WHERE username = ?",
      [username],
      async (err, results) => {
        if (err) {
          return done(err);
        }
        if (results.length === 0) {
          return done(null, false, { message: "No user with that username." });
        }

        const user = results[0];
        try {
          if (await bcrypt.compare(password, user.password)) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Password incorrect." });
          }
        } catch (e) {
          return done(e);
        }
      }
    );
  };

  passport.use(
    new LocalStrategy({ usernameField: "username" }, authenticateUser)
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => {
    pool.query("SELECT * FROM users WHERE id = ?", [id], (err, results) => {
      if (err) {
        return done(err);
      }
      return done(null, results[0]);
    });
  });
}

module.exports = initialize;
