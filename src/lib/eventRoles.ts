import { readTableRows } from './supabaseRead';
import { getSupabaseClient } from './supabaseClient';

export type EventRoleType = 'technik_sceny' | 'realizator_foh' | 'realizator_mon' | 'inzynier_systemu';

export type EventRoleRow = {
  id: number;
  event_id: number;
  role_type: EventRoleType;
  max_participants: number | null;
  available_for_admin: boolean;
  description: string | null;
};

export type UserRoleAssignmentRow = {
  id: number;
  event_id: number;
  user_id: string;
  role_type: EventRoleType;
  assigned_at: string;
  notes: string | null;
};

export const ROLE_LABELS: Record<EventRoleType, string> = {
  technik_sceny: 'Technik sceny',
  realizator_foh: 'Realizator FOH',
  realizator_mon: 'Realizator MON',
  inzynier_systemu: 'Inżynier systemu',
};

export const DEFAULT_ROLES: EventRoleType[] = [
  'technik_sceny',
  'realizator_foh',
  'realizator_mon',
  'inzynier_systemu',
];

export async function readEventRoles(eventId: number) {
  return readTableRows<EventRoleRow>('event_roles', {
    columns: 'id, event_id, role_type, max_participants, available_for_admin, description',
    orderBy: 'id',
    ascending: true,
  });
}

export async function readUserRoleAssignments(eventId: number) {
  return readTableRows<UserRoleAssignmentRow>('user_role_assignments', {
    columns: 'id, event_id, user_id, role_type, assigned_at, notes',
    orderBy: 'assigned_at',
    ascending: true,
  });
}

export async function assignUserToRole(
  eventId: number,
  userId: string,
  roleType: EventRoleType,
  notes?: string,
) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('user_role_assignments')
    .insert([
      {
        event_id: eventId,
        user_id: userId,
        role_type: roleType,
        notes: notes || null,
        assigned_at: new Date().toISOString(),
      },
    ])
    .select();

  return { data, error };
}

export async function removeUserFromRole(assignmentId: number) {
  const supabase = getSupabaseClient();

  const { error } = await supabase.from('user_role_assignments').delete().eq('id', assignmentId);

  return { error };
}

export async function createEventRoles(eventId: number, roles: EventRoleType[] = DEFAULT_ROLES) {
  const supabase = getSupabaseClient();

  const rolesToInsert = roles.map((roleType) => ({
    event_id: eventId,
    role_type: roleType,
    max_participants: null,
    available_for_admin: ['realizator_foh', 'realizator_mon'].includes(roleType),
    description: ROLE_LABELS[roleType],
  }));

  const { data, error } = await supabase.from('event_roles').insert(rolesToInsert).select();

  return { data, error };
}
