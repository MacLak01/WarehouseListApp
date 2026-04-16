import { readTableRows } from './supabaseRead';

export type WarehouseRow = {
  id: string | number;
  name: string;
  city: string | null;
  status: string | null;
  stock: number | null;
};

export async function readWarehouses() {
  return readTableRows<WarehouseRow>('warehouses', {
    columns: 'id, name, city, status, stock',
    orderBy: 'name',
    ascending: true,
  });
}