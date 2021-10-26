const __prod__ = process.env.NODE_ENV === "production";
const server = { PORT: process.env.PORT || 4000 };
const COOKIE_NAME = "qid";
const FORGET_PASSWORD_PREFIX = "forget-password:";

export { __prod__, server, COOKIE_NAME, FORGET_PASSWORD_PREFIX };
