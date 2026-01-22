function adminOnly(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Forbidden. Admin access only." });
}

module.exports = adminOnly;

