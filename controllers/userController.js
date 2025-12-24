const db = require("../db");

exports.list_users = (req, res) => {
  const sql = "SELECT _id, username FROM users";

  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }

    res.json(rows);
  });
};

exports.create_user = (req, res) => {
  const username = (req.body.username || req.query.username || "")
    .toString()
    .trim();

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  const sql = "INSERT INTO users (username) VALUES (?)";

  db.run(sql, [username], function (err) {
    if (err) {
      if (err.code === "SQLITE_CONSTRAINT" && /unique/i.test(err.message)) {
        return res.status(409).json({ error: "Username already taken" });
      }

      return res.status(500).json({ error: "Database error" });
    }

    res.status(201).json({ username: username, _id: this.lastID });
  });
};

exports.add_exercise = (req, res) => {
  const userId = parseInt(req.params._id, 10);
  const description = (req.body.description || "").toString().trim();
  const duration = parseInt(req.body.duration, 10);

  let exerciseDate;
  if (req.body.date instanceof Date) {
    exerciseDate = req.body.date;
  } else if (req.body.date) {
    exerciseDate = new Date(req.body.date);
  } else {
    exerciseDate = new Date();
  }

  if (
    !description ||
    !duration ||
    isNaN(duration) ||
    isNaN(exerciseDate.getTime())
  ) {
    return res
      .status(400)
      .json({
        error: "Description, valid duration and valid date are required",
      });
  }

  const sql =
    "INSERT INTO exercises (user_id, description, duration, date) VALUES (?, ?, ?, ?)";

  db.run(
    sql,
    [userId, description, duration, exerciseDate.toISOString().split("T")[0]],
    function (err) {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }

      res.json({
        _id: userId,
        description: description,
        duration: parseInt(duration),
        date: exerciseDate.toDateString(),
      });
    }
  );
};

exports.get_logs = (req, res) => {
  const userId = parseInt(req.params._id, 10);
  const fromRaw = req.query.from;
  const toRaw = req.query.to;
  const limitRaw = req.query.limit;

  let sql =
    "SELECT description, duration, date FROM exercises WHERE user_id = ?";
  const params = [userId];

  if (fromRaw) {
    const fromDate = fromRaw instanceof Date ? fromRaw : new Date(fromRaw);
    if (isNaN(fromDate.getTime())) {
      return res.status(400).json({ error: "Invalid 'from' date" });
    }
    sql += " AND date >= ?";
    params.push(fromDate.toISOString().split("T")[0]);
  }

  if (toRaw) {
    const toDate = toRaw instanceof Date ? toRaw : new Date(toRaw);
    if (isNaN(toDate.getTime())) {
      return res.status(400).json({ error: "Invalid 'to' date" });
    }
    sql += " AND date <= ?";
    params.push(toDate.toISOString().split("T")[0]);
  }

  sql += " ORDER BY date";

  if (limitRaw) {
    const limit = parseInt(limitRaw, 10);
    if (isNaN(limit) || limit <= 0) {
      return res.status(400).json({ error: "Invalid 'limit'" });
    }
    sql += " LIMIT ?";
    params.push(limit);
  }

  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }

    const log = rows.map((row) => ({
      description: row.description,
      duration: row.duration,
      date: new Date(row.date).toDateString(),
    }));

    res.json({
      _id: userId,
      log: log,
      count: log.length,
    });
  });
};
