const express = require("express");
const { body, param } = require("express-validator");
const pool = require("../db");
const authMiddleware = require("../middleware/auth");
const { validateRequest } = require("../middleware/errors");

const router = express.Router();

const optionalText = (field, maxLength) =>
  body(field)
    .optional({ values: "falsy" })
    .isString()
    .bail()
    .trim()
    .isLength({ max: maxLength });

const businessFields = [
  body("name").isString().trim().notEmpty().isLength({ max: 200 }),
  body("category_id").isInt({ min: 1 }).toInt(),
  optionalText("description", 5000),
  optionalText("address", 500),
  optionalText("location", 200),
  optionalText("contact_number", 50),
  optionalText("whatsapp_number", 50),
  optionalText("website_url", 2048),
  optionalText("image_url", 2048),
  body("is_featured").optional().isBoolean().toBoolean()
];

const nullableText = (value) => value || null;

router.get("/", async (req, res) => {
  const result = await pool.query(`
    SELECT b.*, c.name AS category_name
    FROM businesses b
    LEFT JOIN categories c ON c.id = b.category_id
    ORDER BY b.created_at DESC
  `);

  res.json(result.rows);
});

router.post(
  "/",
  authMiddleware,
  businessFields,
  validateRequest,
  async (req, res) => {
    const {
      name, description, category_id, address, location, contact_number,
      whatsapp_number, website_url, image_url, is_featured
    } = req.body;

    const result = await pool.query(
      `INSERT INTO businesses
        (name, description, category_id, address, location, contact_number,
         whatsapp_number, website_url, image_url, is_featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        name, nullableText(description), category_id, nullableText(address),
        nullableText(location), nullableText(contact_number),
        nullableText(whatsapp_number), nullableText(website_url),
        nullableText(image_url), is_featured ?? false
      ]
    );

    return res.status(201).json(result.rows[0]);
  }
);

router.put(
  "/:id",
  authMiddleware,
  param("id").isInt({ min: 1 }).toInt(),
  ...businessFields,
  validateRequest,
  async (req, res) => {
    const {
      name, description, category_id, address, location, contact_number,
      whatsapp_number, website_url, image_url, is_featured
    } = req.body;

    const result = await pool.query(
      `UPDATE businesses
       SET name = $1, description = $2, category_id = $3, address = $4,
           location = $5, contact_number = $6, whatsapp_number = $7,
           website_url = $8, image_url = $9, is_featured = $10,
           updated_at = NOW()
       WHERE id = $11
       RETURNING *`,
      [
        name, nullableText(description), category_id, nullableText(address),
        nullableText(location), nullableText(contact_number),
        nullableText(whatsapp_number), nullableText(website_url),
        nullableText(image_url), is_featured ?? false, req.params.id
      ]
    );

    if (!result.rowCount) {
      return res.status(404).json({ error: "Business not found." });
    }

    return res.json(result.rows[0]);
  }
);

router.patch(
  "/:id/featured",
  authMiddleware,
  param("id").isInt({ min: 1 }).toInt(),
  body("is_featured").isBoolean().toBoolean(),
  validateRequest,
  async (req, res) => {
    const result = await pool.query(
      `UPDATE businesses
       SET is_featured = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [req.body.is_featured, req.params.id]
    );

    if (!result.rowCount) {
      return res.status(404).json({ error: "Business not found." });
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
    const result = await pool.query(
      "DELETE FROM businesses WHERE id = $1 RETURNING id",
      [req.params.id]
    );

    if (!result.rowCount) {
      return res.status(404).json({ error: "Business not found." });
    }

    return res.status(204).end();
  }
);

module.exports = router;
