// UI Component Types

// Navbar Menu Types
export interface MenuLinkItem {
  label: string;
  href: string;
}

export interface MenuSection {
  title?: string;
  links: MenuLinkItem[];
}

export interface MenuPromo {
  image: string;
  alt: string;
  caption?: string;
  href?: string;
}

export interface MenuItemSimple {
  label: string;
  href: string;
  dropdown?: never;
  promos?: never;
}

export interface MenuItemWithDropdown {
  label: string;
  href?: string;
  dropdown: MenuSection[];
  promos?: MenuPromo[];
}

export type MenuItem = MenuItemSimple | MenuItemWithDropdown;
