declare module 'lucide-react' {
  import * as React from 'react';

  export type LucideProps = React.SVGProps<SVGSVGElement> & { size?: number | string };

  // Commonly used icons in this repo — expand if new icons are imported.
  export const Star: React.FC<LucideProps>;
  export const LogOut: React.FC<LucideProps>;
  export const ShieldCheck: React.FC<LucideProps>;
  export const ArrowLeft: React.FC<LucideProps>;
  export const Plus: React.FC<LucideProps>;
  export const Home: React.FC<LucideProps>;
  export const Calendar: React.FC<LucideProps>;
  export const Armchair: React.FC<LucideProps>;
  export const ChevronLeft: React.FC<LucideProps>;
  export const ChevronRight: React.FC<LucideProps>;
  export const CheckCircle: React.FC<LucideProps>;
  export const CheckCircle2: React.FC<LucideProps>;
  export const Circle: React.FC<LucideProps>;
  export const Trash2: React.FC<LucideProps>;
  export const Save: React.FC<LucideProps>;
  export const Settings: React.FC<LucideProps>;
  export const Layout: React.FC<LucideProps>;
  export const Box: React.FC<LucideProps>;
  export const ShoppingBag: React.FC<LucideProps>;
  export const Search: React.FC<LucideProps>;
  export const User: React.FC<LucideProps>;
  export const Sofa: React.FC<LucideProps>;
  export const RotateCw: React.FC<LucideProps>;
  export const Info: React.FC<LucideProps>;
  export const Ruler: React.FC<LucideProps>;
  export const Palette: React.FC<LucideProps>;
  export const FileText: React.FC<LucideProps>;

  const icons: { [key: string]: React.FC<LucideProps> };
  export default icons;
}
