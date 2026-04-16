import { readTableRows } from './supabaseRead';

export type EventRow = {
  id: number;
  name: string;
  date_start: string | null;
  date_end: string | null;
  description: string | null;
  place: number | null;
};

export async function readEvents() {
  return readTableRows<EventRow>('Events', {
    columns: 'id, name, date_start, date_end, description, place',
    orderBy: 'date_start',
    ascending: true,
  });
}