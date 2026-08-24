export type ProjectColorTheme =
  | 'indigo'
  | 'emerald'
  | 'amber'
  | 'blue'
  | 'purple'
  | 'rose'
  | 'cyan'
  | 'violet'
  | 'teal';

export interface Project {
  id: string;
  title: string;
  description: string;
  icon: string;
  url: string;
  category?: string;
  badge?: string;
  colorTheme?: ProjectColorTheme;
  isInternal?: boolean;
}

export interface SocialLink {
  name: string;
  url: string;
  icon: string;
  handle?: string;
}

export interface ContactInfo {
  name: string;
  inn?: string;
  email: string;
  title?: string;
  bio?: string;
  telegram?: string;
  telegramUrl?: string;
  github?: string;
  location?: string;
  workingHours?: string;
  socials?: SocialLink[];
}

export interface SiteConfig {
  title: string;
  subtitle: string;
  logoIcon: string;
  badgeText?: string;
  footerText: string;
}

export type TabType = 'projects' | 'contacts' | 'auth';
