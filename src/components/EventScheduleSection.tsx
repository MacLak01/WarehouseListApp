import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useCallback, useState } from 'react';
import {
  createScheduleEntry,
  deleteScheduleEntry,
  updateScheduleEntry,
  type EventScheduleRow,
} from '../lib/eventSchedule';

interface EventScheduleSectionProps {
  eventId: number;
  scheduleEntries: EventScheduleRow[];
  onScheduleChange: () => Promise<void>;
}

interface NewScheduleEntry {
  timeStart: string;
  timeEnd: string;
  activityDescription: string;
}

export function EventScheduleSection({
  eventId,
  scheduleEntries,
  onScheduleChange,
}: EventScheduleSectionProps) {
  const [newEntry, setNewEntry] = useState<NewScheduleEntry>({
    timeStart: '',
    timeEnd: '',
    activityDescription: '',
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<NewScheduleEntry>({
    timeStart: '',
    timeEnd: '',
    activityDescription: '',
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAddEntry = useCallback(async () => {
    if (!newEntry.timeStart || !newEntry.timeEnd || !newEntry.activityDescription.trim()) {
      setErrorMessage('Wymagane są wszystkie pola');
      return;
    }

    setErrorMessage(null);
    const result = await createScheduleEntry(
      eventId,
      newEntry.timeStart,
      newEntry.timeEnd,
      newEntry.activityDescription,
    );

    if (result.error) {
      setErrorMessage('Błąd podczas dodawania wpisu');
    } else {
      setNewEntry({
        timeStart: '',
        timeEnd: '',
        activityDescription: '',
      });
      await onScheduleChange();
    }
  }, [eventId, newEntry, onScheduleChange]);

  const handleUpdateEntry = useCallback(
    async (entryId: number) => {
      if (!editData.timeStart || !editData.timeEnd || !editData.activityDescription.trim()) {
        setErrorMessage('Wymagane są wszystkie pola');
        return;
      }

      setErrorMessage(null);
      const result = await updateScheduleEntry(
        entryId,
        editData.timeStart,
        editData.timeEnd,
        editData.activityDescription,
      );

      if (result.error) {
        setErrorMessage('Błąd podczas aktualizacji wpisu');
      } else {
        setEditingId(null);
        setEditData({
          timeStart: '',
          timeEnd: '',
          activityDescription: '',
        });
        await onScheduleChange();
      }
    },
    [editData, onScheduleChange],
  );

  const handleDeleteEntry = useCallback(
    async (entryId: number) => {
      const result = await deleteScheduleEntry(entryId);

      if (result.error) {
        setErrorMessage('Błąd podczas usuwania wpisu');
      } else {
        if (editingId === entryId) {
          setEditingId(null);
        }
        await onScheduleChange();
      }
    },
    [editingId, onScheduleChange],
  );

  const handleStartEdit = (entry: EventScheduleRow) => {
    setEditingId(entry.id);
    setEditData({
      timeStart: entry.time_start,
      timeEnd: entry.time_end,
      activityDescription: entry.activity_description,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({
      timeStart: '',
      timeEnd: '',
      activityDescription: '',
    });
  };

  return (
    <Stack spacing={3}>
      {errorMessage && (
        <Typography variant="body2" color="error">
          {errorMessage}
        </Typography>
      )}

      {/* Add New Entry Form */}
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="subtitle1">Dodaj nowy harmonogram</Typography>

            <TextField
              type="time"
              label="Czas rozpoczęcia"
              value={newEntry.timeStart}
              onChange={(e) => setNewEntry({ ...newEntry, timeStart: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
              size="small"
            />

            <TextField
              type="time"
              label="Czas zakończenia"
              value={newEntry.timeEnd}
              onChange={(e) => setNewEntry({ ...newEntry, timeEnd: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
              size="small"
            />

            <TextField
              label="Opis czynności"
              value={newEntry.activityDescription}
              onChange={(e) => setNewEntry({ ...newEntry, activityDescription: e.target.value })}
              fullWidth
              size="small"
              multiline
              rows={2}
              placeholder="Np. Przygotowanie sцeny, test nagłośnienia..."
            />

            <Button variant="contained" color="primary" onClick={handleAddEntry}>
              Dodaj wpis
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Schedule Entries List */}
      <Box>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Harmonogram
        </Typography>

        {scheduleEntries.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Brak wpisów w harmonogramie
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {scheduleEntries.map((entry) => (
              <Card key={entry.id} variant="outlined">
                <CardContent>
                  {editingId === entry.id ? (
                    <Stack spacing={2}>
                      <TextField
                        type="time"
                        label="Czas rozpoczęcia"
                        value={editData.timeStart}
                        onChange={(e) => setEditData({ ...editData, timeStart: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                        size="small"
                      />

                      <TextField
                        type="time"
                        label="Czas zakończenia"
                        value={editData.timeEnd}
                        onChange={(e) => setEditData({ ...editData, timeEnd: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                        size="small"
                      />

                      <TextField
                        label="Opis czynności"
                        value={editData.activityDescription}
                        onChange={(e) =>
                          setEditData({ ...editData, activityDescription: e.target.value })
                        }
                        fullWidth
                        size="small"
                        multiline
                        rows={2}
                      />

                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => handleUpdateEntry(entry.id)}
                        >
                          Zapisz
                        </Button>
                        <Button variant="outlined" size="small" onClick={handleCancelEdit}>
                          Anuluj
                        </Button>
                      </Box>
                    </Stack>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {entry.time_start} - {entry.time_end}
                        </Typography>
                        <Typography variant="body2">{entry.activity_description}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleStartEdit(entry)}
                        >
                          Edytuj
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          onClick={() => handleDeleteEntry(entry.id)}
                        >
                          Usuń
                        </Button>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Box>
    </Stack>
  );
}
