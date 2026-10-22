import passport from "passport";
import { Express } from "express";
import session from "express-session";
import { randomBytes } from "crypto";
import { createClient, type User as SupabaseUser } from "@supabase/supabase-js";
import { z } from "zod";
import { storage } from "./storage";
import { User } from "@shared/schema";

const profileMetadataSchema = z.object({
  username: z.string().trim().min(3).max(32).regex(/^[a-zA-Z0-9_.-]+$/),
  name: z.string().trim().min(1).max(100),
  phone: z.string().trim().max(30).optional().default(""),
});

function toPublicUser(user: User) {
  const { password: _password, authUserId: _authUserId, ...publicUser } = user;
  return publicUser;
}

function getDatabaseErrorCode(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null || !("code" in error)) return undefined;
  return String(error.code);
}

function createAuthClient() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
}

async function getOrCreateAppUser(authUser: SupabaseUser): Promise<User> {
  const attached = await storage.getUserByAuthId(authUser.id);
  if (attached) return attached;

  if (!authUser.email) throw Object.assign(new Error("A verified email is required."), { status: 400 });
  const metadata = profileMetadataSchema.safeParse(authUser.user_metadata);
  if (!metadata.success) throw Object.assign(new Error("The account profile is incomplete. Please register again."), { status: 400 });

  // Preserve the existing numeric user ID and its bookings when a verified
  // Supabase account matches one legacy account by email.
  const legacyMatches = await storage.getUsersByEmail(authUser.email);
  if (legacyMatches.length > 1) {
    throw Object.assign(new Error("This email matches multiple app profiles. Contact an administrator."), { status: 409 });
  }
  if (legacyMatches.length === 1) {
    if (!authUser.email_confirmed_at) {
      throw Object.assign(new Error("Confirm your email before linking your existing account."), { status: 403 });
    }
    const linked = await storage.linkUserToAuth(legacyMatches[0].id, authUser.id);
    if (linked) return linked;
  }

  const { username, name, phone } = metadata.data;
  const existingUsername = await storage.getUserByUsername(username);
  if (existingUsername) {
    throw Object.assign(new Error("That username is already in use. Register again with a different username."), { status: 409 });
  }

  return storage.createUser({
    authUserId: authUser.id,
    username,
    password: null,
    role: "customer",
    name,
    email: authUser.email,
    phone: phone || null,
  });
}

export function setupAuth(app: Express) {
  const configuredSessionSecret = process.env.SESSION_SECRET;
  const hasStrongSessionSecret = Boolean(
    configuredSessionSecret && Buffer.byteLength(configuredSessionSecret, "utf8") >= 32,
  );
  if (process.env.NODE_ENV === "production" && !hasStrongSessionSecret) {
    throw new Error("SESSION_SECRET must be configured with at least 32 characters");
  }
  const sessionSecret = hasStrongSessionSecret
    ? configuredSessionSecret!
    : randomBytes(32).toString("hex");
  const supabase = createAuthClient();

  if (app.get("env") === "production") app.set("trust proxy", 1);

  app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user, done) => done(null, (user as User).id));
  passport.deserializeUser(async (id, done) => {
    try {
      done(null, (await storage.getUser(Number(id))) || false);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/auth/session", async (req, res, next) => {
    if (!supabase) {
      return res.status(503).json({ message: "Supabase Auth is not configured. Add the project URL and publishable key to the local environment." });
    }
    const authorization = req.get("authorization") || "";
    const token = /^Bearer\s+(.+)$/i.exec(authorization)?.[1];
    if (!token) return res.status(401).json({ message: "Sign in to continue." });

    try {
      const { data, error } = await supabase.auth.getUser(token);
      if (error || !data.user) return res.status(401).json({ message: "Your Supabase session is invalid or expired. Please sign in again." });
      const user = await getOrCreateAppUser(data.user);
      req.login(user, (loginError) => {
        if (loginError) return next(loginError);
        res.json(toPublicUser(user));
      });
    } catch (error) {
      const status = typeof error === "object" && error !== null && "status" in error
        ? Number(error.status)
        : 500;
      const code = getDatabaseErrorCode(error);
      if (code === "23505") {
        return res.status(409).json({ message: "That username or Supabase account is already linked." });
      }
      if (code === "28P01" || code === "ECONNREFUSED" || code === "ETIMEDOUT") {
        console.error("Auth profile database connection failed:", code);
        return res.status(503).json({ message: "The account database is temporarily unavailable." });
      }
      if (status !== 500 && error instanceof Error) return res.status(status).json({ message: error.message });
      next(error);
    }
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((error) => {
      if (error) return next(error);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(toPublicUser(req.user as User));
  });
}
