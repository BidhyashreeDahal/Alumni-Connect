import { AppError } from "../utils/AppError.js";

export function validate(schemas) {
  return (req, _res, next) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }

      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }

      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }

      return next();
    } catch (error) {
      if (error?.name === "ZodError") {
        return next(
          AppError.badRequest("Validation failed", error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message
          })))
        );
      }

      return next(error);
    }
  };
}
