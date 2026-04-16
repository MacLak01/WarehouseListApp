# Konfiguracja bazy danych

W Supabase zostały wdrożone tabele używane przez aplikację kalendarza wydarzeń i widoki pomocnicze.

## Istniejące tabele

- `Events` - wydarzenia importowane z CSV.
- `Places` - lokalizacje powiązane z wydarzeniami.

Obie tabele mają obecnie wyłączony RLS, żeby aplikacja mogła swobodnie czytać dane podczas tej fazy prac.

## Nowe tabele

- `event_roles` - role przypisane do wydarzeń.
- `user_role_assignments` - przypisania użytkowników do ról.
- `event_schedule` - szczegółowy harmonogram wydarzenia.
- `warehouse_items` - przedmioty magazynowe.
- `event_warehouse_checklist` - lista kontrolna materiałów dla wydarzenia.

## Zależności

- `event_roles.event_id` -> `Events.id`
- `user_role_assignments.event_id` -> `Events.id`
- `event_schedule.event_id` -> `Events.id`
- `event_warehouse_checklist.event_id` -> `Events.id`
- `event_warehouse_checklist.warehouse_item_id` -> `warehouse_items.id`

## Bezpieczeństwo

- RLS jest tymczasowo wyłączony na wszystkich tabelach.
- Po powrocie do modelu z uwierzytelnianiem warto ponownie włączyć RLS i dodać polityki dopasowane do ról użytkowników.
