import { readTableRows } from './supabaseRead';
import { getSupabaseClient } from './supabaseClient';

export type EventScheduleRow = {
  id: number;
  event_id: number;
  time_start: string;
  time_end: string;
  activity_description: string;
  assigned_roles: string[] | null;
};

export async function readEventSchedule(eventId: number) {
  return readTableRows<EventScheduleRow>('event_schedule', {
    columns: 'id, event_id, time_start, time_end, activity_description, assigned_roles',
    orderBy: 'time_start',
    ascending: true,
  });
}

export async function createScheduleEntry(
  eventId: number,
  timeStart: string,
  timeEnd: string,
  activityDescription: string,
  assignedRoles?: string[],
) {
  const supabase = getSupabaseClient();

  const { data, error } = await (supabase
    .from('event_schedule')
    .insert([
      {
        event_id: eventId,
        time_start: timeStart,
        time_end: timeEnd,
        activity_description: activityDescription,
        assigned_roles: assignedRoles || null,
      },
    ] as any)
    .select() as any);

  return { data, error };
}

export async function updateScheduleEntry(
  entryId: number,
  timeStart: string,
  timeEnd: string,
  activityDescription: string,
  assignedRoles?: string[],
) {
  const supabase = getSupabaseClient();

  const { data, error } = await ((supabase as any)
    .from('event_schedule')
    .update({
      time_start: timeStart,
      time_end: timeEnd,
      activity_description: activityDescription,
      assigned_roles: assignedRoles || null,
    })
    .eq('id', entryId)
    .select() as any);

  return { data, error };
}

export async function deleteScheduleEntry(entryId: number) {
  const supabase = getSupabaseClient();

  const { error } = await supabase.from('event_schedule').delete().eq('id', entryId);

  return { error };
}
