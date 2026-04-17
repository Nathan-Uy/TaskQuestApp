export interface NavItem {
  name:  string
  label: string
  icon:  string
  path:  string
}

export interface NavSection {
  title: string
  items: NavItem[]
}