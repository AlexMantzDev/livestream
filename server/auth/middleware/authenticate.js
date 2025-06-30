const authenticate = (req, res, next) => {
  // Check if the user is authenticated
  if (req.session && req.session.user) {
    // User is authenticated, proceed to the next middleware or route handler
    return next();
  } else {
    // User is not authenticated, send an error response
    return res.status(401).json({ message: "Unauthorized access" });
  }
};

export default authenticate;
