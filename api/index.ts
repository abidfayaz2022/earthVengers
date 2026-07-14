// Vercel discovers files in /api as Node.js Functions. Exporting the existing
// Express app keeps local and deployed routing behavior identical.
export { default } from "../artifacts/api-server/src/app";
