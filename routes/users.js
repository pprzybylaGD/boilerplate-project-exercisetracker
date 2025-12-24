const express = require("express");
const { check, param, query, validationResult } = require("express-validator");

const router = express.Router();

const user_controller = require("../controllers/userController");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.get("/", user_controller.list_users);

router.post(
  "/",
  [
     
    check("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLength({ max: 50 })
      .withMessage("Username must be at most 50 characters"),
    handleValidationErrors,
  ],
  user_controller.create_user
);

router.post(
  "/:_id/exercises",
  [
    param("_id").isInt({ gt: 0 }).withMessage("_id must be a positive integer").toInt(),
    check("description").trim().notEmpty().withMessage("Description is required"),
    check("duration")
      .notEmpty()
      .withMessage("Duration is required")
      .isInt({ gt: 0 })
      .withMessage("Duration must be a positive integer")
      .toInt(),
    check("date").optional({ checkFalsy: true }).isISO8601().withMessage("Date must be yyyy-mm-dd").toDate(),
    handleValidationErrors,
  ],
  user_controller.add_exercise
);

router.get(
  "/:_id/logs",
  [
    param("_id").isInt({ gt: 0 }).toInt(),
    query("from").optional().isISO8601().toDate(),
    query("to").optional().isISO8601().toDate(),
    query("limit").optional().isInt({ gt: 0 }).toInt(),
    handleValidationErrors,
  ],
  user_controller.get_logs
);

module.exports = router;
