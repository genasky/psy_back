import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import User from "../models/User";

passport.use(
    new LocalStrategy(
        {
            usernameField: "email",
            passwordField: "password",
            session: false,
        },
        async (email, password, done) => {
            try {
                const user = await User.findOne({ email });
                if (!user) {
                    return done(null, false, { message: "User not found" });
                }

                const isMatch = await user.comparePassword(password);
                if (!isMatch) {
                    return done(null, false, { message: "Invalid password" });
                }

                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    )
);

passport.serializeUser((user: any, done) => done(null, { userId: user.id, role: user.role }));
passport.deserializeUser((id, done) =>
    User.findById(id).then((user) => done(null, user))
);

export default passport;
