// admin: full access (users, themes, posts, uploads)
// editor: can write/edit/publish posts, upload files, use research — no user management
// viewer: read-only access to admin panel (e.g. reviewing drafts)

const ROLE_RANK = { viewer: 0, editor: 1, admin: 2 };

export function requireRole(session, minRole) {
  if (!session?.user?.role) return false;
  return ROLE_RANK[session.user.role] >= ROLE_RANK[minRole];
}

export function canManageUsers(session) {
  return requireRole(session, "admin");
}

export function canEditPosts(session) {
  return requireRole(session, "editor");
}

export function canManageThemes(session) {
  return requireRole(session, "editor");
}
