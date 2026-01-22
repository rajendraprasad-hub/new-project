module.exports = function uploaderOnly(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const role = req.session.user.role;

  // ✅ uploader OR admin can upload
  if (role === "uploader" || role === "admin") {
    return next();
  }

  return res.status(403).json({ message: "Upload access denied" });
};

