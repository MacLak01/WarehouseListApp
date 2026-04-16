import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import {
  assignUserToRole,
  removeUserFromRole,
  ROLE_LABELS,
  type EventRoleRow,
  type EventRoleType,
  type UserRoleAssignmentRow,
} from '../lib/eventRoles';
import { readCurrentUser, readCurrentSession, getUserDisplayName } from '../lib/supabaseUsers';

interface EventRoleAssignmentSectionProps {
  eventId: number;
  eventRoles: EventRoleRow[];
  roleAssignments: UserRoleAssignmentRow[];
  onAssignmentChange: () => Promise<void>;
}

export function EventRoleAssignmentSection({
  eventId,
  eventRoles,
  roleAssignments,
  onAssignmentChange,
}: EventRoleAssignmentSectionProps) {
  const [selectedRole, setSelectedRole] = useState<EventRoleType | null>(null);
  const [notes, setNotes] = useState('');
  const [assigningRole, setAssigningRole] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);

  // Pobierz aktualnie zalogowanego użytkownika
  useEffect(() => {
    const loadUser = async () => {
      try {
        const { user, error } = await readCurrentUser();

        if (error) {
          setUserError('Nie jesteś zalogowany. Zaloguj się, aby przypisać się do roli.');
          setCurrentUser(null);
        } else if (user) {
          setCurrentUser(user);
          setUserError(null);
        } else {
          setUserError('Nie jesteś zalogowany. Zaloguj się, aby przypisać się do roli.');
          setCurrentUser(null);
        }
      } catch (err) {
        console.error('Błąd przy pobieraniu użytkownika:', err);
        setUserError('Błąd przy pobieraniu danych użytkownika');
        setCurrentUser(null);
      } finally {
        setLoadingUser(false);
      }
    };

    loadUser();
  }, []);

  const handleAssignUser = useCallback(async () => {
    if (!currentUser?.id) {
      setErrorMessage('Użytkownik nie jest zalogowany');
      return;
    }

    if (!selectedRole) {
      setErrorMessage('Wymagane jest wybranie roli');
      return;
    }

    setAssigningRole(true);
    setErrorMessage(null);

    const result = await assignUserToRole(eventId, currentUser.id, selectedRole, notes);

    if (result.error) {
      setErrorMessage('Błąd podczas przypisywania użytkownika do roli');
    } else {
      setNotes('');
      setSelectedRole(null);
      await onAssignmentChange();
    }

    setAssigningRole(false);
  }, [eventId, selectedRole, notes, onAssignmentChange, currentUser]);

  const handleRemoveAssignment = useCallback(
    async (assignmentId: number) => {
      const result = await removeUserFromRole(assignmentId);

      if (result.error) {
        setErrorMessage('Błąd podczas usuwania przypisania');
      } else {
        await onAssignmentChange();
      }
    },
    [onAssignmentChange],
  );

  const groupedAssignments = new Map<EventRoleType, UserRoleAssignmentRow[]>();

  for (const assignment of roleAssignments) {
    const existing = groupedAssignments.get(assignment.role_type) || [];
    groupedAssignments.set(assignment.role_type, [...existing, assignment]);
  }

  return (
    <Stack spacing={3}>
      {/* Role Assignment Form */}
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="subtitle1">Przypisz się do roli</Typography>

            {/* Zalogowany użytkownik */}
            {loadingUser ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} />
                <Typography variant="body2">Ładowanie danych użytkownika...</Typography>
              </Box>
            ) : userError ? (
              <Typography variant="body2" color="error">
                {userError}
              </Typography>
            ) : currentUser ? (
              <Card variant="outlined" sx={{ backgroundColor: 'rgba(76, 175, 80, 0.08)' }}>
                <CardContent>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2">Zalogowany użytkownik:</Typography>
                      <Chip
                        label={getUserDisplayName(currentUser)}
                        color="success"
                        size="small"
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Email: {currentUser.email || 'brak'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ID: {currentUser.id?.substring(0, 8)}...
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            ) : null}

            {errorMessage && (
              <Typography variant="body2" color="error">
                {errorMessage}
              </Typography>
            )}

            <TextField
              select
              label="Rola"
              value={selectedRole || ''}
              onChange={(e) => setSelectedRole(e.target.value as EventRoleType)}
              SelectProps={{
                native: true,
              }}
              fullWidth
              size="small"
            >
              <option value="">-- Wybierz rolę --</option>
              {eventRoles.map((role) => (
                <option key={role.id} value={role.role_type}>
                  {ROLE_LABELS[role.role_type]}
                </option>
              ))}
            </TextField>

            <TextField
              label="Notatki (opcjonalnie)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
              size="small"
              multiline
              rows={2}
              placeholder="Dodatkowe informacje..."
            />

            <Button
              variant="contained"
              color="primary"
              onClick={handleAssignUser}
              disabled={assigningRole || !currentUser || loadingUser}
            >
              {assigningRole ? <CircularProgress size={20} /> : 'Przypisz mnie do roli'}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Current Assignments by Role */}
      <Box>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Przypisane role
        </Typography>

        {eventRoles.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Brak dostępnych ról dla tego wydarzenia
          </Typography>
        ) : (
          <Stack spacing={2}>
            {eventRoles.map((role) => {
              const assignments = groupedAssignments.get(role.role_type) || [];

              return (
                <Card key={role.id} variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                      {ROLE_LABELS[role.role_type]}
                    </Typography>

                    {assignments.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        Brak przypisanych użytkowników
                      </Typography>
                    ) : (
                      <Stack spacing={1}>
                        {assignments.map((assignment) => (
                          <Box
                            key={assignment.id}
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              p: 1,
                              backgroundColor: 'rgba(0, 0, 0, 0.04)',
                              borderRadius: 1,
                            }}
                          >
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2">{assignment.user_id}</Typography>
                              {assignment.notes && (
                                <Typography variant="caption" color="text.secondary">
                                  {assignment.notes}
                                </Typography>
                              )}
                            </Box>
                            <Button
                              size="small"
                              color="error"
                              onClick={() => handleRemoveAssignment(assignment.id)}
                            >
                              Usuń
                            </Button>
                          </Box>
                        ))}
                      </Stack>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        )}
      </Box>
    </Stack>
  );
}
