export const preventAuthPages = (req, res, next) => {

  const mode =
    req.query?.mode || req.body?.mode;

  // allow authenticated users only for change-email flow
  if (
    req.session?.userId &&
    mode !== "change-email"
  ) {
    return res.redirect("/");
  }

  next();
};