import { Router, type IRouter } from "express";
import bcrypt from "bcrypt";
import { dataStore, nextId } from "../lib/dataStore";
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

  const existing = dataStore.users.some(
    (user) => user.email.toLowerCase() === email.toLowerCase(),
  );
  if (existing) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: nextId(dataStore.users),
    name,
    email,
    passwordHash,
    points: 0,
    avatarUrl: null,
    createdAt: new Date(),
  };
  dataStore.users.push(user);

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

  const user = dataStore.users.find(
    (candidate) => candidate.email.toLowerCase() === email.toLowerCase(),
  );
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const isCsvDemoAccount = user.passwordHash.includes("demo.placeholder.hash");
  const valid = isCsvDemoAccount
    ? password === "demo"
    : await bcrypt.compare(password, user.passwordHash);
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

  const user = dataStore.users.find((candidate) => candidate.id === req.session.userId);
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
