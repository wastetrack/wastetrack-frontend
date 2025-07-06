export interface MenuItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

export type UserRole =
  | 'waste_bank_unit'
  | 'waste_collector_unit'
  | 'waste_bank_central'
  | 'waste_collector_central'
  | 'industry';

export interface MenuConfig {
  [key: string]: MenuItem[];
}

export interface SidebarProps {
  isCollapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  role: UserRole;
  userData?: {
    email?: string;
    profile?: {
      institution?: string;
      institutionName?: string;
    };
  };
}

export interface UserData {
  email?: string;
  profile?: {
    institution?: string;
    institutionName?: string;
    name?: string;
    phone?: string;
  };
}
