import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useCallback, useState } from 'react';
import {
  addItemToEventChecklist,
  removeItemFromChecklist,
  updateChecklistItem,
  type EventWarehouseItemRow,
} from '../lib/eventWarehouseChecklist';

interface WarehouseChecklistSectionProps {
  eventId: number;
  warehouseChecklist: EventWarehouseItemRow[];
  onChecklistChange: () => Promise<void>;
}

interface NewChecklistItem {
  itemName: string;
  quantityNeeded: string;
  notes: string;
}

export function WarehouseChecklistSection({
  eventId,
  warehouseChecklist,
  onChecklistChange,
}: WarehouseChecklistSectionProps) {
  const [newItem, setNewItem] = useState<NewChecklistItem>({
    itemName: '',
    quantityNeeded: '',
    notes: '',
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleAddItem = useCallback(async () => {
    if (!newItem.itemName.trim() || !newItem.quantityNeeded.trim()) {
      setErrorMessage('Wymagane są nazwa przedmiotu i ilość');
      return;
    }

    const quantity = parseInt(newItem.quantityNeeded, 10);
    if (isNaN(quantity) || quantity < 0) {
      setErrorMessage('Ilość musi być liczbą dodatnią');
      return;
    }

    setErrorMessage(null);

    const result = await addItemToEventChecklist(
      eventId,
      0, // warehouse_item_id - in a real scenario, this would be linked to warehouse
      newItem.itemName.trim(),
      quantity,
      newItem.notes,
    );

    if (result.error) {
      setErrorMessage('Błąd podczas dodawania przedmiotu');
    } else {
      setNewItem({
        itemName: '',
        quantityNeeded: '',
        notes: '',
      });
      await onChecklistChange();
    }
  }, [eventId, newItem, onChecklistChange]);

  const handleUpdateItem = useCallback(
    async (itemId: number, item: EventWarehouseItemRow) => {
      const result = await updateChecklistItem(
        itemId,
        item.quantity_needed,
        item.is_checked,
        item.notes,
      );

      if (result.error) {
        setErrorMessage('Błąd podczas aktualizacji przedmiotu');
      } else {
        setEditingId(null);
        await onChecklistChange();
      }
    },
    [onChecklistChange],
  );

  const handleRemoveItem = useCallback(
    async (itemId: number) => {
      const result = await removeItemFromChecklist(itemId);

      if (result.error) {
        setErrorMessage('Błąd podczas usuwania przedmiotu');
      } else {
        await onChecklistChange();
      }
    },
    [onChecklistChange],
  );

  const handleToggleCheck = useCallback(
    async (item: EventWarehouseItemRow) => {
      const updatedItem = { ...item, is_checked: !item.is_checked };
      await handleUpdateItem(item.id, updatedItem);
    },
    [handleUpdateItem],
  );

  return (
    <Stack spacing={3}>
      {errorMessage && (
        <Typography variant="body2" color="error">
          {errorMessage}
        </Typography>
      )}

      {/* Add New Item Form */}
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="subtitle1">Dodaj nowy przedmiot do listy</Typography>

            <TextField
              label="Nazwa przedmiotu"
              value={newItem.itemName}
              onChange={(e) => setNewItem({ ...newItem, itemName: e.target.value })}
              fullWidth
              size="small"
              placeholder="Np. Kabel XLR 5m"
            />

            <TextField
              label="Ilość"
              value={newItem.quantityNeeded}
              onChange={(e) => setNewItem({ ...newItem, quantityNeeded: e.target.value })}
              fullWidth
              size="small"
              type="number"
              inputProps={{ min: 0 }}
              placeholder="Ilość potrzebnych sztuk"
            />

            <TextField
              label="Notatki (opcjonalnie)"
              value={newItem.notes}
              onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
              fullWidth
              size="small"
              multiline
              rows={2}
              placeholder="Dodatkowe informacje..."
            />

            <Button variant="contained" color="primary" onClick={handleAddItem}>
              Dodaj przedmiot
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Checklist Items */}
      <Box>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Lista magazynowa
        </Typography>

        {warehouseChecklist.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Brak przedmiotów na liście
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {warehouseChecklist.map((item) => (
              <Card key={item.id} variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={item.is_checked}
                          onChange={() => handleToggleCheck(item)}
                        />
                      }
                      label={
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              textDecoration: item.is_checked ? 'line-through' : 'none',
                            }}
                          >
                            {item.item_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Potrzebna ilość: {item.quantity_needed} | Dostępna ilość:{' '}
                            {item.quantity_available}
                          </Typography>
                          {item.notes && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              Notatki: {item.notes}
                            </Typography>
                          )}
                        </Box>
                      }
                      sx={{ width: '100%', m: 0, flex: 1 }}
                    />
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleRemoveItem(item.id)}
                      sx={{ mt: 0.5 }}
                    >
                      Usuń
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Box>
    </Stack>
  );
}
