import handler from '../../api/describe.js';
import { adapt } from './_adapt.mjs';
export default adapt(handler, 'describe');
export const config = { path: '/api/describe' };
