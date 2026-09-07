import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://moiybjysoshxhgilakca.supabase.co';
const supabaseAnonKey = 'sb_publishable_ZeAvABjreJ89Ek8c2mR6LQ_tlh3NZBt';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

const originalGetUser = supabase.auth.getUser.bind(supabase.auth);
let cachedUserResult = null;
let cachedUserAt = 0;
let unavailableUntil = 0;
let pendingUserRequest = null;
const USER_CACHE_MS = 15000;
const NETWORK_COOLDOWN_MS = 30000;

// Prevent every mounted page from retrying the same unavailable auth endpoint.
supabase.auth.getUser = async (...args) => {
  const now = Date.now();
  if (now < unavailableUntil) return { data: { user: null }, error: null };
  if (cachedUserResult && now - cachedUserAt < USER_CACHE_MS) return cachedUserResult;
  if (pendingUserRequest) return pendingUserRequest;

  pendingUserRequest = (async () => {
    try {
      const result = await originalGetUser(...args);
      if (!result.error) {
        cachedUserResult = result;
        cachedUserAt = now;
        return result;
      }

      if (/fetch|network|closed|failed/i.test(result.error.message || "")) {
        unavailableUntil = now + NETWORK_COOLDOWN_MS;
        return { data: { user: null }, error: null };
      }
      return result;
    } catch (error) {
      if (/fetch|network|closed|failed/i.test(error.message || "")) {
        unavailableUntil = now + NETWORK_COOLDOWN_MS;
        return { data: { user: null }, error: null };
      }
      throw error;
    } finally {
      pendingUserRequest = null;
    }
  })();

  return pendingUserRequest;
};

