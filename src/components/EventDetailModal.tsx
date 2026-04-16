import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import {
  assignUserToRole,
  readEventRoles,
  readUserRoleAssignments,
  ROLE_LABELS,
  type EventRoleRow,
  type EventRoleType,
  type UserRoleAssignmentRow,
} from '../lib/eventRoles';
import { readEventSchedule, type EventScheduleRow } from '../lib/eventSchedule';
import { readEventWarehouseChecklist, type EventWarehouseItemRow } from '../lib/eventWarehouseChecklist';
import type { EventRow } from '../lib/events';
import type { PlaceRow } from '../lib/places';
import { EventRoleAssignmentSection } from './EventRoleAssignmentSection';
import { EventScheduleSection } from './EventScheduleSection';
import { WarehouseChecklistSection } from './WarehouseChecklistSection';

function formatDateTime(value: string | null) {
  if (!value) {
    return 'N/A';
  }

  return new Intl.DateTimeFormat('pl-PL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

interface EventDetailModalProps {
  event: EventRow | null;
  place: PlaceRow | null;
  open: boolean;
  onClose: () => void;
}

type TabValue = 'info' | 'roles' | 'schedule' | 'warehouse';

export function EventDetailModal({ event, place, open, onClose }: EventDetailModalProps) {
  const [tabValue, setTabValue] = useState<TabValue>('info');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [eventRoles, setEventRoles] = useState<EventRoleRow[]>([]);
  const [roleAssignments, setRoleAssignments] = useState<UserRoleAssignmentRow[]>([]);
  const [scheduleEntries, setScheduleEntries] = useState<EventScheduleRow[]>([]);
  const [warehouseChecklist, setWarehouseChecklist] = useState<EventWarehouseItemRow[]>([]);

  const loadEventData = useCallback(async () => {
    if (!event) return;

    setLoading(true);
    setErrorMessage(null);

    const [rolesResult, assignmentsResult, scheduleResult, warehouseResult] = await Promise.all([
      readEventRoles(event.id),
      readUserRoleAssignments(event.id),
      readEventSchedule(event.id),
      readEventWarehouseChecklist(event.id),
    ]);

    if (
      rolesResult.error ||
      assignmentsResult.error ||
      scheduleResult.error ||
      warehouseResult.error
    ) {
      setErrorMessage('Błąd podczas ładowania danych');
    }

    setEventRoles(rolesResult.data);
    setRoleAssignments(assignmentsResult.data);
    setScheduleEntries(scheduleResult.data);
    setWarehouseChecklist(warehouseResult.data);
    setLoading(false);
  }, [event]);

  useEffect(() => {
    if (open && event) {
      void loadEventData();
    }
  }, [open, event, loadEventData]);

  if (!event || !open) {
    return null;
  }

  const handleAssignToRole = async (roleType: EventRoleType) => {
    // This will be handled by the child component
    // After assignment, we reload the data
    await loadEventData();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">{event.name}</Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Info Tab Content */}
        <Box sx={{ p: 3, borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Miejsce
              </Typography>
              <Typography variant="body1">{place?.name ?? 'Bez przypisanego miejsca'}</Typography>
              {place?.city && (
                <Typography variant="body2" color="text.secondary">
                  {place.city}
                  {place.address && `, ${place.address}`}
                </Typography>
              )}
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Godzina rozpoczęcia
              </Typography>
              <Typography variant="body1">{formatDateTime(event.date_start)}</Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Godzina zakończenia
              </Typography>
              <Typography variant="body1">{formatDateTime(event.date_end)}</Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Opis
              </Typography>
              <Typography variant="body2">{event.description?.trim() || 'Brak opisu'}</Typography>
            </Box>
          </Stack>
        </Box>

        {/* Tabs */}
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}
        >
          <Tab label="Informacje" value="info" />
          <Tab label="Role" value="roles" />
          <Tab label="Harmonogram" value="schedule" />
          <Tab label="Lista magazynowa" value="warehouse" />
        </Tabs>

        {/* Tab Content */}
        <Box sx={{ p: 3, minHeight: 300 }}>
          {loading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary">
                Ładowanie danych...
              </Typography>
            </Box>
          )}

          {errorMessage && (
            <Typography variant="body2" color="error">
              {errorMessage}
            </Typography>
          )}

          {!loading && tabValue === 'roles' && (
            <EventRoleAssignmentSection
              eventId={event.id}
              eventRoles={eventRoles}
              roleAssignments={roleAssignments}
              onAssignmentChange={loadEventData}
            />
          )}

          {!loading && tabValue === 'schedule' && (
            <EventScheduleSection
              eventId={event.id}
              scheduleEntries={scheduleEntries}
              onScheduleChange={loadEventData}
            />
          )}

          {!loading && tabValue === 'warehouse' && (
            <WarehouseChecklistSection
              eventId={event.id}
              warehouseChecklist={warehouseChecklist}
              onChecklistChange={loadEventData}
            />
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
