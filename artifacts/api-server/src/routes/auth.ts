import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import {
  RegisterBody,
  LoginBody,
  GetMeResponse,
  RegisterResponse,
  LoginResponse,
} from "@workspace/api-zod";

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

const router: IRouter = Router();

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, email, password } = parsed.data;

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing.length > 0) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db
    .insert(usersTable)
    .values({ name, email, passwordHash })
    .returning();

  req.session.userId = user.id;

  const userOut = {
    id: user.id,
    name: user.name,
    email: user.email,
    points: user.points,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt.toISOString(),
  };

  res.status(201).json(RegisterResponse.parse({ user: userOut }));
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  req.session.userId = user.id;

  const userOut = {
    id: user.id,
    name: user.name,
    email: user.email,
    points: user.points,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt.toISOString(),
  };

  res.json(LoginResponse.parse({ user: userOut }));
});

router.post("/auth/logout", (req, res): void => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId));
  if (!user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const userOut = {
    id: user.id,
    name: user.name,
    email: user.email,
    points: user.points,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt.toISOString(),
  };

  res.json(GetMeResponse.parse(userOut));
});

export default router;
