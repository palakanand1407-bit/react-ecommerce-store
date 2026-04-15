// ============================================================
//  backend/middleware/upload.js
//  Multer config for avatar and product image uploads
// ============================================================

const multer = require("multer");
const path   = require("path");
const fs     = require("fs");

const MAX_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024; // 5 MB

// ── Storage factory ───────────────────────────────────────────
const makeStorage = (destination) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(__dirname, "..", destination);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext    = path.extname(file.originalname).toLowerCase();
      const prefix = req.user?.id ?? "anon";
      cb(null, `${prefix}-${Date.now()}${ext}`);
    },
  });

// ── File filter — images only ─────────────────────────────────
const imageFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif/;
  const extOk   = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeOk  = allowed.test(file.mimetype);

  if (extOk && mimeOk) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpeg, jpg, png, webp, gif) are allowed."));
  }
};

// ── Multer instances ──────────────────────────────────────────

/** For user avatar uploads */
const uploadAvatar = multer({
  storage: makeStorage("uploads/avatars"),
  limits:  { fileSize: MAX_SIZE },
  fileFilter: imageFilter,
}).single("avatar");

/** For product image uploads */
const uploadProduct = multer({
  storage: makeStorage("uploads/products"),
  limits:  { fileSize: MAX_SIZE },
  fileFilter: imageFilter,
}).single("image");

// ── Wrap multer to return express-friendly errors ──────────────
const handleUpload = (multerFn) => (req, res, next) => {
  multerFn(req, res, (err) => {
    if (!err) return next();
    const status  = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    const message = err.code === "LIMIT_FILE_SIZE"
      ? `File too large. Max size is ${MAX_SIZE / 1024 / 1024}MB.`
      : err.message;
    return res.status(status).json({ success: false, message });
  });
};

module.exports = {
  uploadAvatar:  handleUpload(uploadAvatar),
  uploadProduct: handleUpload(uploadProduct),
};
