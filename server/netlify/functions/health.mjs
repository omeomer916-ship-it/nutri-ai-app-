import handler from '../../api/health.js';
import { adapt } from './_adapt.mjs';
export default adapt(handler);
export const config = { path: '/api/health' };
