import { C } from './theme';

/** Accent colour for an icon, so every kind of thing keeps one colour across the app. */
export function accent(name: string): string {
  switch (name) {
    case 'heart': case 'shield': case 'run': return C.coral;
    case 'scale': case 'chart': case 'download': case 'fridge': case 'globe': case 'search': return C.sky;
    case 'pill': case 'moon': case 'list': case 'mic': return C.violet;
    case 'compare': case 'book': case 'menu': case 'cookie': case 'cart': case 'barcode': return C.orange;
    case 'trophy': case 'gift': case 'crown': case 'star': case 'medal': return C.gold;
    case 'tag': case 'cake': return C.pink;
    case 'drop': return C.water;
    case 'sun': case 'bread': return C.carb;
    case 'avocado': return C.fat;
    default: return C.green;
  }
}
