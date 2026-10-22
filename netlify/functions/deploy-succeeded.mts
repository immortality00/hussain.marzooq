import { ensureIndexesAfterDeploy } from "../../lib/server/deploy-indexes";

// Netlify runs this after every successful deploy (named after the event) and checks the event's
// signature before calling it, so it cannot be triggered from outside.
export default async function deploySucceeded(req: Request) {
  await ensureIndexesAfterDeploy(await req.json().catch(() => null));
}
