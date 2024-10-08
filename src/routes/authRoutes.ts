import { NextFunction, Request, Response, Router } from "express";
import passport from "passport";
import setToken from "../utils/setToken";
import {
  loginController,
  getAuthUser,
  checkToken,
  logout,
} from "../controllers/authController";
import authMiddleware from "../middleware/authMiddleware";

const authRoutes = Router();

// Credentials authentication
authRoutes.post("/login", loginController);

// Get current user info
authRoutes.get("/get-user", authMiddleware, getAuthUser);

// Check validity of token
authRoutes.get("/check-token", authMiddleware, checkToken);

// Logout
authRoutes.post("/logout", logout);

// ========================================================================================
// ==================================== OAUTH =============================================
// ========================================================================================
// GITHUB AUTHENTICATION
// Redirect to Github for authentication
authRoutes.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

// Github Callback URL
authRoutes.get(
  "/github/callback",
  passport.authenticate("github", {
    session: false,
  }),
  (req: any, res: Response, next: NextFunction) => {
    if (req.user) {
      // At this point, auth was successful, and a token has been generated
      const token = req.user.token;
      setToken(token, res);

      res.redirect(process.env.CLIENT_URL as string);
    } else {
      next();
    }
  }
);

// Error middleware
authRoutes.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err) {
    // return res.status(500).redirect(process.env.CLIENT_URL as string);
    // return res
    //   .status(500)
    //   .json({ message: err.message ?? "Uh oh, seems like something happened" });

    if (process.env.CLIENT_URL) {
      res.redirect(
        `${process.env.CLIENT_URL}/login?error=${
          err.message ?? "An error occured"
        }`
      );
    } else {
      res.redirect(`/login?error${err.message ?? "An error occured"}`);
    }
  }
  next();
});

export default authRoutes;
