# TODO: Add Active Section Highlighting to Sidebar

## Tasks
- [x] Fix missing useEffect import in Dashboard.js
- [x] Add active class logic to admin menu links in Sidebar.js
- [x] Add active logic for submenu parents (Plans and Account Settings)
- [x] Test active highlighting on navigation (requires running dev server)

## Details
- For admin role, add `${pathname === '/Dashboard' ? 'active' : ''}` to each menu-link
- For submenus, check if pathname matches any submenu item and add active to parent
- Use existing .active CSS styling from theme
