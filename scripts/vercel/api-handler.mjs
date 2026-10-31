// Vercel function entry for /api: the same Express app the production API ran.
import app from '../../artifacts/api-server/src/app';
import { withDeploymentHeaders } from './deployment-headers.mjs';

export default withDeploymentHeaders((req, res) => app(req, res));
