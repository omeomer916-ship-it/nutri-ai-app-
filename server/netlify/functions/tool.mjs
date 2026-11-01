import handler from '../../api/tool.js';
import { adapt } from './_adapt.mjs';
export default adapt(handler, 'tool');
export const config = { path: '/api/tool' };
