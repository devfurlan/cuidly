'use server';

import { createClient } from '../server';

export async function getUserIdFromSession(): Promise<string | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) throw new Error('Unauthorized');

  return user.id;
}
