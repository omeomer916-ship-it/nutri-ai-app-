import type { IconName } from './components/Icon';
import type { TKey } from './i18n';
import type { ToolId } from './ai';

export type Tool = { id: ToolId; icon: IconName; input: 'image' | 'text' | 'none' | 'any'; ex?: [TKey, TKey] };

/** The AI tools, in the order shown in the AI Studio. Titles are tl_<id>, descriptions td_<id>, placeholders tp_<id>. */
export const TOOLS: Tool[] = [
  { id: 'fridge', icon: 'fridge', input: 'image' },
  { id: 'menu', icon: 'menu', input: 'any', ex: ['te_menu1', 'te_menu2'] },
  { id: 'label', icon: 'tag', input: 'image' },
  { id: 'plan', icon: 'calendar', input: 'none' },
  { id: 'week', icon: 'list', input: 'none' },
  { id: 'snack', icon: 'cookie', input: 'none' },
  { id: 'swap', icon: 'refresh', input: 'text', ex: ['te_swap1', 'te_swap2'] },
  { id: 'craving', icon: 'cake', input: 'text', ex: ['te_crav1', 'te_crav2'] },
  { id: 'eatout', icon: 'globe', input: 'text', ex: ['te_eat1', 'te_eat2'] },
  { id: 'compare', icon: 'compare', input: 'text', ex: ['te_cmp1', 'te_cmp2'] },
  { id: 'workout', icon: 'run', input: 'text', ex: ['te_wo1', 'te_wo2'] },
  { id: 'grocery', icon: 'cart', input: 'none' },
];
