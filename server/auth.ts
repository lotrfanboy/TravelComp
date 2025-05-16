import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from "passport-google-oauth20";
import session from "express-session";
import connectPg from "connect-pg-simple";
import bcrypt from "bcryptjs";
import type { Express, RequestHandler } from "express";
import { db } from "./db";
import { storage } from "./storage";
import { eq } from "drizzle-orm";
import { users } from "@shared/schema";
import { randomUUID } from "crypto";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Desativa cookies seguros para ambiente de desenvolvimento
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  // Trust proxies so that secure cookies work
  app.set("trust proxy", true);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Set up local strategy with username/password (email/password)
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          // Find the user
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, email));
          
          // User not found
          if (!user) {
            return done(null, false, { message: "Incorrect email or password" });
          }
          
          // Check the password
          try {
            console.log("Verifying password for user:", email);
            const passwordMatches = user.password 
              ? await bcrypt.compare(password, user.password) 
              : false;
            
            if (!passwordMatches) {
              console.log("Password verification failed for user:", email);
              return done(null, false, { message: "Incorrect email or password" });
            }
            console.log("Password verification successful for user:", email);
          } catch (error) {
            console.error("Error comparing passwords:", error);
            return done(null, false, { message: "Authentication error" });
          }
          
          // Success! Return the user
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
  
  // Set up Google strategy
  console.log("Google OAuth credentials check:", {
    clientID: process.env.GOOGLE_CLIENT_ID ? "set" : "not set",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ? "set" : "not set"
  });
  
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    console.log("Setting up Google OAuth Strategy");
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: "https://" + process.env.REPLIT_DOMAINS?.split(',')[0] + "/api/auth/google/callback",
          proxy: true,
          passReqToCallback: true
        },
        async (req: any, accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
          try {
            console.log("Google OAuth callback received, processing profile:", profile.id);
            // Check if user exists
            const email = profile.emails && profile.emails[0] ? profile.emails[0].value : '';
            if (!email) {
              console.error("No email found in Google profile");
              return done(new Error("No email found in Google profile"));
            }
            
            console.log(`Google Auth: Processing login for email: ${email}`);
            let user = await storage.getUserByEmail(email);
            
            if (!user) {
              console.log(`Google Auth: Creating new user for email: ${email}`);
              // Create a new user
              const firstName = profile.name && profile.name.givenName ? profile.name.givenName : '';
              const lastName = profile.name && profile.name.familyName ? profile.name.familyName : '';
              const profileImageUrl = profile.photos && profile.photos[0] ? profile.photos[0].value : '';
              
              user = await storage.createUser({
                id: randomUUID(),
                email: email,
                firstName: firstName,
                lastName: lastName,
                profileImageUrl: profileImageUrl,
                role: "tourist", // Default role
              });
              console.log(`Google Auth: New user created with ID: ${user.id}`);
            } else {
              console.log(`Google Auth: Found existing user with ID: ${user.id}`);
            }
            
            return done(null, user);
          } catch (error) {
            console.error("Google OAuth error:", error);
            return done(error as Error);
          }
        }
      )
    );
  } else {
    console.warn("Google OAuth credentials missing. Google login will not be available.");
  }
  
  // Serialize user to the session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });
  
  // Deserialize user from the session
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  
  // Register routes
  app.post("/api/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      // Check if user exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create the user
      const user = await storage.createUser({
        id: randomUUID(),
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: "tourist", // Default role
      });
      
      // Log the user in
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Failed to login after registration" });
        }
        return res.status(201).json({ 
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        });
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });
  
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error | null, user: any, info: { message?: string }) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Authentication failed" });
      }
      req.login(user, (loginErr: Error | null) => {
        if (loginErr) {
          return next(loginErr);
        }
        return res.json({ 
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        });
      });
    })(req, res, next);
  });
  
  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.status(204).end();
    });
  });
  
  // Google OAuth routes
  app.get("/api/auth/google", (req, res, next) => {
    console.log("Starting Google OAuth authentication flow");
    passport.authenticate("google", { 
      scope: ["profile", "email"],
      prompt: "select_account"
    })(req, res, next);
  });
  
  app.get("/api/auth/google/callback", (req, res, next) => {
    console.log("Google OAuth callback received, authenticating...");
    passport.authenticate("google", { 
      failureRedirect: "/auth"
    }, (err, user, info) => {
      if (err) {
        console.error("Google OAuth callback error:", err);
        return res.redirect("/auth?error=" + encodeURIComponent(err.message));
      }
      
      if (!user) {
        console.error("Google OAuth: No user returned");
        return res.redirect("/auth?error=authentication_failed");
      }
      
      req.login(user, (loginErr) => {
        if (loginErr) {
          console.error("Google OAuth login error:", loginErr);
          return res.redirect("/auth?error=login_failed");
        }
        
        console.log("Google OAuth login successful, redirecting to dashboard");
        return res.redirect("/dashboard");
      });
    })(req, res, next);
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};