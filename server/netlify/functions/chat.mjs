import handler from '../../api/chat.js';
import { adapt } from './_adapt.mjs';
export default adapt(handler);
export const config = { path: '/api/chat' };
