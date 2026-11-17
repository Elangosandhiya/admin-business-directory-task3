const express = require("express");
const { body, param } = require("express-validator");
const pool = require("../db");
const authMiddleware = require("../middleware/auth");
const { validateRequest } = require("../middleware/errors");

const router = express.Router();

router.get("/", async (req, res) => {
  const result = await pool.query("SELECT id, name FROM categories ORDER BY name");
  res.json(result.rows);
});

router.post(
  "/",
  authMiddleware,
  body("name").isString().trim().notEmpty().isLength({ max: 150 }),
  validateRequest,
  async (req, res) => {
    const result = await pool.query(
      "INSERT INTO categories (name) VALUES ($1) RETURNING id, name",
      [req.body.name]
    );

    return res.status(201).json(result.rows[0]);
  }
);

router.put(
  "/:id",
  authMiddleware,
  param("id").isInt({ min: 1 }).toInt(),
  body("name").isString().trim().notEmpty().isLength({ max: 150 }),
  validateRequest,
  async (req, res) => {
    const result = await pool.query(
      "UPDATE categories SET name = $1 WHERE id = $2 RETURNING id, name",
      [req.body.name, req.params.id]
    );

    if (!result.rowCount) {
      return res.status(404).json({ error: "Category not found." });
    }

    return res.json(result.rows[0]);
  }
);

router.delete(
  "/:id",
  authMiddleware,
  param("id").isInt({ min: 1 }).toInt(),
  validateRequest,
  async (req, res) => {
    // The NOT EXISTS condition avoids deleting categories still in use.
    const result = await pool.query(
      `DELETE FROM categories c
       WHERE c.id = $1
         AND NOT EXISTS (
           SELECT 1 FROM businesses b WHERE b.category_id = c.id
         )
       RETURNING c.id`,
      [req.params.id]
    );

    if (!result.rowCount) {
      const exists = await pool.query(
        "SELECT id FROM categories WHERE id = $1",
        [req.params.id]
      );

      if (!exists.rowCount) {
        return res.status(404).json({ error: "Category not found." });
      }

      return res.status(409).json({
        error: "Cannot delete a category that has businesses."
      });
    }

    return res.status(204).end();
  }
);

module.exports = router;
