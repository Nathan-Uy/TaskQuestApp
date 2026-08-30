import type { VercelRequest, VercelResponse } from "@vercel/node";
import app from "../server/dist/index.js";

/**
 * Catch-all API handler
 * Routes all /api/* requests to the Express app
 */
const handler = async (req: VercelRequest, res: VercelResponse) => {
  return app(req, res);
};

export default handler;
