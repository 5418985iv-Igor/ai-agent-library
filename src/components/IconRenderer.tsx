import React from 'react';
import {
  Bot,
  BarChart3,
  Code2,
  FileText,
  Terminal,
  Brain,
  Sparkles,
  Cpu,
  MessageSquare,
  Globe,
  Send,
  Mail,
  Github,
  ExternalLink,
  Search,
  Copy,
  Check,
  FolderCode,
  Layers,
  Zap,
  BookOpen,
  Settings,
  HelpCircle,
  LucideProps,
} from 'lucide-react';

interface IconRendererProps extends LucideProps {
  name: string;
}

export const IconRenderer: React.FC<IconRendererProps> = ({ name, ...props }) => {
  const iconMap: Record<string, React.ElementType> = {
    Bot,
    BarChart3,
    BarChart: BarChart3,
    Code2,
    Code: Code2,
    FileText,
    Terminal,
    Brain,
    Sparkles,
    Cpu,
    MessageSquare,
    Globe,
    Send,
    Mail,
    Github,
    ExternalLink,
    Search,
    Copy,
    Check,
    FolderCode,
    Layers,
    Zap,
    BookOpen,
    Settings,
    HelpCircle,
  };

  const IconComponent = iconMap[name] || Sparkles;

  return <IconComponent {...props} />;
};
