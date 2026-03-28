import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from './env';
import User from '../models/User';

export const configurePassport = (): void => {
  if (!env.google.clientId || !env.google.clientSecret) return;

  passport.use(
    new GoogleStrategy(
      {
        clientID: env.google.clientId,
        clientSecret: env.google.clientSecret,
        callbackURL: env.google.callbackUrl,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id });

          if (!user) {
            user = await User.findOne({ email: profile.emails?.[0]?.value });
            if (user) {
              user.googleId = profile.id;
              await user.save();
            } else {
              user = await User.create({
                username: profile.displayName?.replace(/\s+/g, '_').toLowerCase() || `user_${Date.now()}`,
                email: profile.emails?.[0]?.value || '',
                googleId: profile.id,
                avatar: profile.photos?.[0]?.value || '',
                isVerified: true,
              });
            }
          }

          done(null, user);
        } catch (error) {
          done(error as Error, undefined);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};
