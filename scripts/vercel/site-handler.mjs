// Vercel function entry for the public site. It reuses the exact production
// static server (artifacts/bettex-site/scripts/serve.mjs) that served bettex.ai.
import { createSiteServer } from './artifacts/bettex-site/scripts/serve.mjs';
import { withDeploymentHeaders } from './deployment-headers.mjs';

const server = createSiteServer();
const listener = server.listeners('request')[0];

export default withDeploymentHeaders(listener);
