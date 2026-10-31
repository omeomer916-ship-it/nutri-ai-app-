import handler from '../../api/scan.js';
import { adapt } from './_adapt.mjs';
export default adapt(handler, 'scan');
export const config = { path: '/api/scan' };
