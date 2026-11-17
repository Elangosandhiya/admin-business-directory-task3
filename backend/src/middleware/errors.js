const { validationResult } = require("express-validator");

function validateRequest(req, res, next) {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed.",
      details: result.array().map(({ path, msg }) => ({
        field: path,
        message: msg
      }))
    });
  }

  return next();
}

function notFound(req, res) {
  res.status(404).json({ error: "Route not found." });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err.code === "23505") {
    return res.status(409).json({ error: "A record with that value already exists." });
  }

  if (err.code === "23503") {
    return res.status(409).json({
      error: "This record is still referenced by another record."
    });
  }

  const status = err.status || 500;

  if (status >= 500) {
    console.error(err);
  }

  return res.status(status).json({
    error: status >= 500 ? "Internal server error." : err.message
  });
}

module.exports = { validateRequest, notFound, errorHandler };
