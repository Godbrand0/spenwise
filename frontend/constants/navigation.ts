import { 
  LayoutDashboard, 
  UploadCloud, 
  PieChart, 
  ShieldCheck, 
  Target, 
  FileText,
  BarChart2,
  Upload,
  Receipt
} from 'lucide-react';

export const navLinks = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Statements', href: '/statements', icon: FileText },
  { name: 'Analysis', href: '/analysis', icon: BarChart2 },
  { name: 'Import', href: '/upload', icon: Upload },
  { name: 'Tax', href: '/tax', icon: Receipt },
  { name: 'Goals', href: '/todos', icon: Target },
];
