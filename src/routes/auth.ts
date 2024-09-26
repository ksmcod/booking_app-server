import { Router } from "express";
import passport from "passport";
import setToken from "../utils/setToken";

const authRoutes = Router();

// GITHUB AUTHENTICATION
// Redirect to Github for authentication
authRoutes.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

// Github Callback URL
authRoutes.get(
  "/github/callback",
  passport.authenticate("github", { session: false }),
  (req: any, res) => {
    // At this point, auth was successful, and a token has been generated
    const token = req.user.token;
    setToken(token, res);

    res.redirect(process.env.CLIENT_URL as string);
  }
);

export default authRoutes;
