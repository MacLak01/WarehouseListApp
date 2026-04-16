import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  IconButton,
  Paper,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { readEvents, type EventRow } from './lib/events';
import { readPlaces, type PlaceRow } from './lib/places';
import { EventDetailModal } from './components/EventDetailModal';

const dayNames = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'];

function toDayKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat('pl-PL', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function buildMonthDays(month: Date) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDay = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const leadingEmpty = (firstDay.getDay() + 6) % 7;
  const cells: Array<Date | null> = [];

  for (let i = 0; i < leadingEmpty; i++) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(year, monthIndex, day));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

function formatDateTime(value: string | null) {
  if (!value) {
    return 'N/A';
  }

  return new Intl.DateTimeFormat('pl-PL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function getEventStatus(event: EventRow) {
  const now = Date.now();
  const start = event.date_start ? new Date(event.date_start).getTime() : null;
  const end = event.date_end ? new Date(event.date_end).getTime() : null;

  if (start && now < start) {
    return { label: 'Nadchodzące', color: 'info' as const };
  }

  if (end && now > end) {
    return { label: 'Zakończone', color: 'default' as const };
  }

  return { label: 'Trwa', color: 'success' as const };
}

function App() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [places, setPlaces] = useState<PlaceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeMonth, setActiveMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedEvent, setSelectedEvent] = useState<EventRow | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);

    const [eventsResult, placesResult] = await Promise.all([readEvents(), readPlaces()]);

    if (eventsResult.error || placesResult.error) {
      setErrorMessage(eventsResult.error?.message ?? placesResult.error?.message ?? 'Błąd odczytu danych');
      setLoading(false);
      return;
    }

    setEvents(eventsResult.data);
    setPlaces(placesResult.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const placesById = useMemo(() => {
    return new Map(places.map((place) => [place.id, place]));
  }, [places]);

  const upcomingCount = useMemo(() => {
    const now = Date.now();

    return events.filter((event) => {
      if (!event.date_start) {
        return false;
      }

      return new Date(event.date_start).getTime() > now;
    }).length;
  }, [events]);

  const eventsByDay = useMemo(() => {
    const grouped = new Map<string, EventRow[]>();

    for (const event of events) {
      if (!event.date_start) {
        continue;
      }

      const key = toDayKey(new Date(event.date_start));
      const current = grouped.get(key);

      if (current) {
        current.push(event);
      } else {
        grouped.set(key, [event]);
      }
    }

    return grouped;
  }, [events]);

  const monthCells = useMemo(() => buildMonthDays(activeMonth), [activeMonth]);

  const changeMonth = (offset: number) => {
    setActiveMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  const handleOpenEventDetail = (event: EventRow) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const handleCloseEventDetail = () => {
    setModalOpen(false);
    setSelectedEvent(null);
  };

  const selectedPlace = selectedEvent?.place ? placesById.get(selectedEvent.place) ?? null : null;

  return (
    <Box sx={{ minHeight: '100vh', py: { xs: 3, md: 6 } }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'grid', gap: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 5 },
              background:
                'linear-gradient(135deg, rgba(15, 23, 42, 0.94), rgba(14, 116, 144, 0.16))',
            }}
          >
            <Box sx={{ display: 'grid', gap: 3 }}>
              <Chip label="Events & Places" color="primary" sx={{ alignSelf: 'flex-start' }} />
              <Box>
                <Typography component="h1" variant="h2" sx={{ maxWidth: 760 }}>
                  Odczyt danych z istniejących tabel Supabase przez klienta aplikacji.
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 2, maxWidth: 760 }}>
                  Widok korzysta bezpośrednio z tabel <strong>Events</strong> i <strong>Places</strong>,
                  z mapowaniem wydarzeń do lokalizacji po kolumnie <strong>place</strong>.
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                <Button variant="contained" color="primary" onClick={() => void loadData()}>
                  Odśwież dane
                </Button>
              </Box>
            </Box>
          </Paper>

          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
            }}
          >
            <Card>
              <CardContent>
                <Typography variant="overline" color="text.secondary">
                  Places
                </Typography>
                <Typography variant="h4">{places.length}</Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant="overline" color="text.secondary">
                  Events
                </Typography>
                <Typography variant="h4">{events.length}</Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant="overline" color="text.secondary">
                  Nadchodzące
                </Typography>
                <Typography variant="h4">{upcomingCount}</Typography>
              </CardContent>
            </Card>
          </Box>

          <Paper elevation={0} sx={{ p: { xs: 2.5, md: 4 } }}>
            <Box sx={{ display: 'grid', gap: 3 }}>
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h5">Kalendarz wydarzeń</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton aria-label="Poprzedni miesiąc" size="small" onClick={() => changeMonth(-1)}>
                      {'<'}
                    </IconButton>
                    <Typography variant="body1" sx={{ minWidth: 170, textAlign: 'center' }}>
                      {monthLabel(activeMonth)}
                    </Typography>
                    <IconButton aria-label="Następny miesiąc" size="small" onClick={() => changeMonth(1)}>
                      {'>'}
                    </IconButton>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                    gap: 1,
                  }}
                >
                  {dayNames.map((name) => (
                    <Box
                      key={name}
                      sx={{
                        borderRadius: 1,
                        py: 0.5,
                        textAlign: 'center',
                        backgroundColor: 'rgba(148, 163, 184, 0.12)',
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {name}
                      </Typography>
                    </Box>
                  ))}

                  {monthCells.map((day, index) => {
                    if (!day) {
                      return (
                        <Box
                          key={`empty-${index}`}
                          sx={{ borderRadius: 1.5, minHeight: 110, backgroundColor: 'rgba(15, 23, 42, 0.25)' }}
                        />
                      );
                    }

                    const dayKey = toDayKey(day);
                    const dayEvents = eventsByDay.get(dayKey) ?? [];

                    return (
                      <Box
                        key={dayKey}
                        sx={{
                          borderRadius: 1.5,
                          minHeight: 110,
                          p: 1,
                          border: '1px solid rgba(148, 163, 184, 0.2)',
                          backgroundColor: dayEvents.length
                            ? 'rgba(56, 189, 248, 0.08)'
                            : 'rgba(15, 23, 42, 0.25)',
                          display: 'grid',
                          alignContent: 'start',
                          gap: 0.6,
                        }}
                      >
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          {day.getDate()}
                        </Typography>

                        {dayEvents.slice(0, 2).map((event) => (
                          <Chip
                            key={event.id}
                            size="small"
                            label={event.name}
                            color="primary"
                            variant="outlined"
                            sx={{
                              justifyContent: 'flex-start',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                backgroundColor: 'rgba(56, 189, 248, 0.16)',
                              },
                            }}
                            onClick={() => handleOpenEventDetail(event)}
                          />
                        ))}

                        {dayEvents.length > 2 && (
                          <Typography variant="caption" color="text.secondary">
                            +{dayEvents.length - 2} więcej
                          </Typography>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 2 }}>
                <Typography variant="h5">Lista wydarzeń (Events)</Typography>
                <Typography variant="body2" color="text.secondary">
                  Źródło: Supabase
                </Typography>
              </Box>

              {loading && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CircularProgress size={18} />
                  <Typography variant="body2" color="text.secondary">
                    Ładowanie danych...
                  </Typography>
                </Box>
              )}

              {errorMessage && !loading && (
                <Typography variant="body2" color="error">
                  {errorMessage}
                </Typography>
              )}

              {!loading && !errorMessage && events.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  Brak danych w tabeli Events.
                </Typography>
              )}

              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
                }}
              >
                {events.map((event) => {
                  const place = event.place ? placesById.get(event.place) : undefined;
                  const status = getEventStatus(event);

                  return (
                  <Card
                    variant="outlined"
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        boxShadow: 2,
                        transform: 'translateY(-2px)',
                      },
                    }}
                    key={event.id}
                    onClick={() => handleOpenEventDetail(event)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'grid', gap: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                          <Box>
                            <Typography variant="h6">{event.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {place?.name ?? 'Bez przypisanego miejsca'}
                            </Typography>
                          </Box>
                          <Chip label={status.label} color={status.color} size="small" />
                        </Box>

                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 700 }}>
                            Start: {formatDateTime(event.date_start)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Koniec: {formatDateTime(event.date_end)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                            Miasto: {place?.city ?? 'N/A'}
                          </Typography>
                        </Box>

                        <Box sx={{ minHeight: 56 }}>
                          <Typography variant="body2" color="text.secondary">
                            {event.description?.trim() || 'Brak opisu'}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                  );
                })}
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>

      <EventDetailModal
        event={selectedEvent}
        place={selectedPlace}
        open={modalOpen}
        onClose={handleCloseEventDetail}
      />
    </Box>
  );
}

export default App;
