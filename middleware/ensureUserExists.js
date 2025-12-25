const db = require("../db");

const ensureUserExists = (req, res, next) => {
  const userId = req.params._id;
  db.get("SELECT _id FROM users WHERE _id = ?", [userId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    if (!row) {
      return res.status(404).json({ error: "User not found" });
    }
    next();
  });
};

module.exports = ensureUserExists;
