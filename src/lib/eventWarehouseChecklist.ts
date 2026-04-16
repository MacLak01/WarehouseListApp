import { readTableRows } from './supabaseRead';
import { getSupabaseClient } from './supabaseClient';

export type EventWarehouseItemRow = {
  id: number;
  event_id: number;
  warehouse_item_id: number;
  item_name: string;
  quantity_needed: number;
  quantity_available: number;
  is_checked: boolean;
  notes: string | null;
};

export type WarehouseItemRow = {
  id: number;
  name: string;
  category: string | null;
  quantity: number;
  unit: string | null;
};

export async function readEventWarehouseChecklist(eventId: number) {
  return readTableRows<EventWarehouseItemRow>('event_warehouse_checklist', {
    columns:
      'id, event_id, warehouse_item_id, item_name, quantity_needed, quantity_available, is_checked, notes',
    orderBy: 'item_name',
    ascending: true,
  });
}

export async function readAllWarehouseItems() {
  return readTableRows<WarehouseItemRow>('warehouse_items', {
    columns: 'id, name, category, quantity, unit',
    orderBy: 'name',
    ascending: true,
  });
}

export async function addItemToEventChecklist(
  eventId: number,
  warehouseItemId: number,
  itemName: string,
  quantityNeeded: number,
  notes?: string,
) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('event_warehouse_checklist')
    .insert([
      {
        event_id: eventId,
        warehouse_item_id: warehouseItemId,
        item_name: itemName,
        quantity_needed: quantityNeeded,
        quantity_available: 0,
        is_checked: false,
        notes: notes || null,
      },
    ])
    .select();

  return { data, error };
}

export async function updateChecklistItem(
  checklistItemId: number,
  quantityNeeded: number,
  isChecked: boolean,
  notes?: string,
) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('event_warehouse_checklist')
    .update({
      quantity_needed: quantityNeeded,
      is_checked: isChecked,
      notes: notes || null,
    })
    .eq('id', checklistItemId)
    .select();

  return { data, error };
}

export async function updateAvailableQuantity(checklistItemId: number, quantityAvailable: number) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('event_warehouse_checklist')
    .update({ quantity_available: quantityAvailable })
    .eq('id', checklistItemId)
    .select();

  return { data, error };
}

export async function removeItemFromChecklist(checklistItemId: number) {
  const supabase = getSupabaseClient();

  const { error } = await supabase.from('event_warehouse_checklist').delete().eq('id', checklistItemId);

  return { error };
}
