import { readTableRows } from './supabaseRead';

export type PlaceRow = {
  id: number;
  name: string | null;
  city: string | null;
  address: string | null;
};

export async function readPlaces() {
  return readTableRows<PlaceRow>('Places', {
    columns: 'id, name, city, address',
    orderBy: 'name',
    ascending: true,
  });
}