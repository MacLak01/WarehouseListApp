import { getSupabaseClient } from './supabaseClient';

export type SupabaseUserRow = {
  id: string;
  email: string | null;
  user_metadata: Record<string, any> | null;
  app_metadata: Record<string, any> | null;
  created_at: string;
};

/**
 * Pobiera listę użytkowników z Supabase Auth
 * UWAGA: Wymaga service_role key na backendzie!
 * Na frontendzie można pobrać tylko aktualnie zalogowanego użytkownika
 */
export async function readCurrentUser() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getUser();

  return { user: data.user, error };
}

/**
 * Pobiera sesję aktualnego użytkownika
 */
export async function readCurrentSession() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getSession();

  return { session: data.session, error };
}

/**
 * Pobiera listę użytkowników z tabeli users_profiles (należy ją utworzyć)
 * Ta tabela powinna zawierać profil użytkowników
 */
export async function readUserProfiles() {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.from('user_profiles').select('id, email, full_name, created_at');

  return { data: (data ?? []) as SupabaseUserRow[], error };
}

/**
 * Pobiera pojedynczego użytkownika po ID
 */
export async function readUserProfile(userId: string) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  return { user: data, error };
}

/**
 * Formatuje imię użytkownika do wyświetlenia
 */
export function formatUserName(user: any): string {
  if (!user) return 'Nieznany użytkownik';

  // Jeśli jest pełne imię
  if (user.full_name) {
    return user.full_name;
  }

  // Jeśli jest email
  if (user.email) {
    return user.email.split('@')[0];
  }

  // Fallback na ID
  return user.id?.substring(0, 8) || 'Użytkownik';
}

/**
 * Pobiera wyświetlane imię użytkownika z różnych źródeł
 */
export function getUserDisplayName(user: any): string {
  // Sprawdź user_metadata (np. ustawione przez aplikację)
  if (user?.user_metadata?.display_name) {
    return user.user_metadata.display_name;
  }

  // Sprawdź full_name
  if (user?.full_name) {
    return user.full_name;
  }

  // Sprawdź email (część przed @)
  if (user?.email) {
    return user.email.split('@')[0];
  }

  // Fallback
  return 'Użytkownik';
}
