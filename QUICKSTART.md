# 🚀 Szybki Start - Implementacja systemu zdarzeń

## Kroki do wdrożenia

### Krok 1: Przygotowanie bazy danych (5 minut)

1. Przejdź do [Supabase Dashboard](https://app.supabase.com)
2. Otwórz **SQL Editor** dla swojego projektu
3. Skopiuj całą zawartość z tego SQL (podzielona na części):

#### Część 1: Tabela ról zdarzeń
```sql
CREATE TABLE event_roles (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  role_type TEXT NOT NULL CHECK (role_type IN ('technik_sceny', 'realizator_foh', 'realizator_mon', 'inzynier_systemu')),
  max_participants INT,
  available_for_admin BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(event_id, role_type)
);

CREATE INDEX idx_event_roles_event_id ON event_roles(event_id);
```

#### Część 2: Tabela przypisań użytkowników
```sql
CREATE TABLE user_role_assignments (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  role_type TEXT NOT NULL CHECK (role_type IN ('technik_sceny', 'realizator_foh', 'realizator_mon', 'inzynier_systemu')),
  assigned_at TIMESTAMP DEFAULT now(),
  notes TEXT,
  UNIQUE(event_id, user_id, role_type)
);

CREATE INDEX idx_user_role_assignments_event_id ON user_role_assignments(event_id);
CREATE INDEX idx_user_role_assignments_user_id ON user_role_assignments(user_id);
```

#### Część 3: Tabela harmonogramu
```sql
CREATE TABLE event_schedule (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  time_start TEXT NOT NULL,
  time_end TEXT NOT NULL,
  activity_description TEXT NOT NULL,
  assigned_roles TEXT[],
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_event_schedule_event_id ON event_schedule(event_id);
```

#### Część 4: Tabela przedmiotów magazynowych
```sql
CREATE TABLE warehouse_items (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT,
  quantity INT DEFAULT 0,
  unit TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_warehouse_items_name ON warehouse_items(name);
```

#### Część 5: Tabela listy magazynowej
```sql
CREATE TABLE event_warehouse_checklist (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  warehouse_item_id BIGINT REFERENCES warehouse_items(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  quantity_needed INT NOT NULL DEFAULT 1,
  quantity_available INT DEFAULT 0,
  is_checked BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_event_warehouse_checklist_event_id ON event_warehouse_checklist(event_id);
```

4. **Wykonaj** każde zapytanie SQL (przycisk ▶️ lub Ctrl+Enter)

### Krok 2: Inicjalizacja ról dla istniejących zdarzeń (opcjonalnie)

Jeśli chcesz, aby wszystkie istniejące zdarzenia miały automatycznie utworzone role:

```sql
INSERT INTO event_roles (event_id, role_type, available_for_admin, description)
SELECT 
  e.id,
  role_type,
  role_type IN ('realizator_foh', 'realizator_mon') as available_for_admin,
  CASE 
    WHEN role_type = 'technik_sceny' THEN 'Technik sceny'
    WHEN role_type = 'realizator_foh' THEN 'Realizator FOH'
    WHEN role_type = 'realizator_mon' THEN 'Realizator MON'
    WHEN role_type = 'inzynier_systemu' THEN 'Inżynier systemu'
  END as description
FROM events e
CROSS JOIN (
  SELECT 'technik_sceny' as role_type
  UNION ALL
  SELECT 'realizator_foh'
  UNION ALL
  SELECT 'realizator_mon'
  UNION ALL
  SELECT 'inzynier_systemu'
) roles
WHERE NOT EXISTS (
  SELECT 1 FROM event_roles er 
  WHERE er.event_id = e.id 
  AND er.role_type = roles.role_type
)
ON CONFLICT DO NOTHING;
```

### Krok 3: Uruchomienie aplikacji

```bash
# Terminal
npm run dev
```

Aplikacja powinna się uruchomić na `http://localhost:5173`

### Krok 4: Testowanie

1. **Otwórz przeglądarkę** i wejdź na `http://localhost:5173`
2. **Kliknij** na dowolne zdarzenie w kalendarzu lub na liście
3. **Powinno się otworzyć** modalne okno ze szczegółami
4. **Spróbuj** każdej zakładki:
   - **Informacje** - Wyświetla dane zdarzenia
   - **Role** - Przypisz sobie rolę (wpisz "Jan Kowalski" jako test)
   - **Harmonogram** - Dodaj harmonogram (np. 14:00 - 15:00: Przygotowanie)
   - **Lista magazynowa** - Dodaj przedmiot (np. "Kabel XLR 5m", ilość: 2)

## 🎯 Działanie funkcji

### Przypisywanie do roli
- Wybierz rolę z listy (Technik sceny, FOH, MON, Inżynier)
- Wpisz imię i nazwisko (w aplikacji testowej to jest ID użytkownika)
- Dodaj opcjonalne notatki
- Kliknij "Przypisz"

### Harmonogram
- Wpisz czas rozpoczęcia (HH:MM)
- Wpisz czas zakończenia (HH:MM)
- Opisz czynność
- Kliknij "Dodaj wpis"
- Możesz edytować lub usuwać wpisy

### Lista magazynowa
- Wpisz nazwę przedmiotu
- Wpisz ilość potrzebną
- Dodaj notatki (opcjonalnie)
- Kliknij "Dodaj przedmiot"
- Zaznacz przedmioty jako zweryfikowane (checkbox)

## 🐛 Rozwiązywanie problemów

### Problem: "Tabela nie istnieje" w konsoli
**Rozwiązanie:** Wykonałeś SQL? Upewnij się, że wszystkie 5 zapytań zostały uruchomione w Supabase SQL Editor.

### Problem: Modal się nie otwiera
**Rozwiązanie:** 
1. Otwórz konsole przeglądarki (F12)
2. Sprawdź czy są błędy JavaScript
3. Upewnij się, że Supabase jest poprawnie skonfigurowany

### Problem: Dane się nie zapisują
**Rozwiązanie:**
1. Sprawdź czy zmiennymi środowiskowe Supabase są prawidłowe w pliku `.env`
2. Sprawdź czy baza danych jest dostępna (Supabase Status)
3. Sprawdź uprawnienia w tabeli (RLS)

## 📝 Następne kroki

Po testowaniu możesz:

1. **Dodać dane testowe** do `warehouse_items` (przedmioty w magazynie)
2. **Skonfigurować role** - Zdecyduj które role mogą być dostępne dla administratora
3. **Implementować uwierzytelnianie** - Dodać Supabase Auth jeśli potrzebujesz
4. **Dostosować style** - Zmienić kolory i styl komponentów

## 🔗 Przydatne linki

- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Szczegółowe instrukcje
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Co zostało wdrożone
- [Supabase Docs](https://supabase.com/docs)

---

**Gotowe? Zacznij od Kroku 1!** 🎉
