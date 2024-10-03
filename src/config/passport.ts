import { Strategy as GithubStrategy } from "passport-github2";
import db from "../utils/db";
import { PassportStatic } from "passport";
import createToken from "../utils/createToken";

export const githubStrategy = (passport: PassportStatic) => {
  passport.use(
    new GithubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID as string,
        clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        callbackURL: `${process.env.SERVER_URL as string}/auth/github/callback`,
        // callbackURL: "http://localhost:8080/api/auth/github/callback",
        scope: ["user:email"],
      },
      async (
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: any
      ) => {
        try {
          //   console.log("Profile is: ", profile);

          // Check if email is already registered
          let user = await db.user.findUnique({
            where: {
              email: profile.emails[0].value,
            },
          });

          if (user && user.password) {
            // return done(new Error("This email already exists"), null);
            throw new Error("This email is already registered");
          }

          if (!user) {
            // If user doesn't exist, create new one
            user = await db.user.create({
              data: {
                provider: "github",
                providerId: profile.id,
                email: profile.emails[0].value,
                name: profile.displayName,
                image: profile.photos[0].value,
              },
            });
          }

          const token = createToken({ userId: user.id });

          done(null, { user, token });
        } catch (error) {
          done(error, null);
        }
      }
    )
  );
};
