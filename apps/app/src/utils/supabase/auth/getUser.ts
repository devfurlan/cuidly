import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import type { User } from '@supabase/supabase-js';

interface GetUserOptions {
  redirectOnFail?: boolean;
}

/**
 * Retrieves the currently authenticated user from Supabase.
 *
 * **How to use**
 *
 * - **In pages/server (with automatic redirect):**
 *   const user = await getUser();
 *
 * - **In client components or server actions (without redirect):**
 *   const user = await getUser({ redirectOnFail: false });
 *
 */
export async function getUser({
  redirectOnFail = true,
}: GetUserOptions = {}): Promise<User> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  const isServer = typeof window === 'undefined';

  if (!data?.user || ((!data?.user || error) && redirectOnFail && isServer)) {
    redirect('/app/login');
  }

  return data.user;
}
