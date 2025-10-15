import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User";

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: '/api/auth/google/callback',
},
    async (_accessToken, _refreshToken, profile, done) => {
        try {
            let user = await User.findOne({ googleId: profile.id });
            if (!user) {
                user = await User.create({
                    googleId: profile.id,
                    name: profile.displayName,
                    email: profile.emails?.[0].value,
                    avatar: profile.photos?.[0].value,
                });
            }
            done(null, user);
        } catch (error) {
            done(error, undefined);
        }
    }
))

passport.serializeUser((user: any, done) => done(null, { userId: user.id, role: user.role }));
passport.deserializeUser((id, done) => User.findById(id).then(user => done(null, user)));

export default passport;