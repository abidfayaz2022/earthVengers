import cookieParser from "cookie-parser";
import type { RequestHandler } from "express";
import session from "express-session";

const COOKIE_NAME = "climate_action_session";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

function createStatelessSession(secret: string): RequestHandler[] {
  const secureCookie = process.env.NODE_ENV === "production";

  return [
    cookieParser(secret),
    (req, res, next) => {
      const parsedUserId = Number(req.signedCookies?.[COOKIE_NAME]);
      let userId =
        Number.isSafeInteger(parsedUserId) && parsedUserId > 0
          ? parsedUserId
          : undefined;

      const sessionState = {
        destroy(callback: (error?: unknown) => void) {
          userId = undefined;
          res.clearCookie(COOKIE_NAME, {
            httpOnly: true,
            secure: secureCookie,
            sameSite: "lax",
            path: "/",
          });
          callback();
          return sessionState;
        },
      };

      Object.defineProperty(sessionState, "userId", {
        enumerable: true,
        get: () => userId,
        set: (value: number | undefined) => {
          userId = value;
          if (value) {
            res.cookie(COOKIE_NAME, String(value), {
              signed: true,
              httpOnly: true,
              secure: secureCookie,
              sameSite: "lax",
              maxAge: COOKIE_MAX_AGE,
              path: "/",
            });
          }
        },
      });

      req.session = sessionState as typeof req.session;
      next();
    },
  ];
}

export function createSessionMiddleware(secret: string): RequestHandler[] {
  if (process.env.VERCEL) {
    return createStatelessSession(secret);
  }

  return [
    session({
      secret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: COOKIE_MAX_AGE,
      },
    }),
  ];
}
