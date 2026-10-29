export type RoleChange = {
  actorId: string;
  targetId: string;
};

/**
 * Role changes are performed by an administrator. An administrator must never
 * change their own role, which also guarantees that at least one administrator
 * remains because only administrators can change roles.
 */
export function validateRoleChange({
  actorId,
  targetId,
}: RoleChange): string | null {
  if (actorId === targetId) {
    return "You cannot change your own role.";
  }

  return null;
}
