import { serve }                         from 'https://deno.land/std@0.168.0/http/server.ts';
import admin                            from 'npm:firebase-admin';
import { createClient }                 from 'npm:@supabase/supabase-js';

// ** CORS headers **
const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ---- ENV VARS ----
const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_KEY     = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const FIREBASE_KEY     = Deno.env.get('FIREBASE_SERVER_KEY')!;

// ---- INIT Firebase Admin ----
const serviceAccount   = JSON.parse(Deno.readTextFileSync('./serviceAccountKey.json'));
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

// ---- INIT Supabase ----
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ---- SERVER ----
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS });
  }

  try {
    // 1) Fetch documents needing a reminder
    const { data: docs, error: docsErr } = await supabase
      .from('documents_needing_reminders')
      .select('*');

    if (docsErr) throw docsErr;

    if (!docs?.length) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No reminders due today',
        documents: 0
      }), { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } });
    }

    // 2) Fetch active tokens for these users
    const userIds = [...new Set(docs.map(d => d.user_id))];
    const { data: tokens, error: tokErr } = await supabase
      .from('user_tokens')
      .select('user_id, token')
      .in('user_id', userIds)
      .eq('is_active', true);

    if (tokErr) throw tokErr;
    if (!tokens?.length) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No active tokens',
        documents: docs.length,
        tokens: 0
      }), { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } });
    }

    // 3) Group docs by user
    const byUser = docs.reduce<Record<string, typeof docs>>((acc, d) => {
      (acc[d.user_id] ??= []).push(d);
      return acc;
    }, {});

    let sent = 0, errors = 0;
    const badTokens: string[] = [];

    // 4) Send one notification per user
    for (const { user_id, token } of tokens) {
      const userDocs = byUser[user_id]!;
      const count   = userDocs.length;
      const names   = userDocs.map(d => d.name).join(', ');
      const title   = count > 1
        ? `📋 You have ${count} documents expiring`
        : `📋 "${userDocs[0].name}" is expiring`;
      const body    = count > 1 ? names : `Expires on ${userDocs[0].expiry_date}`;

      // call FCM
      const resp = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Authorization': `key=${FIREBASE_KEY}`,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify({
          to: token,
          notification: { title, body },
          data: { type: 'reminder', count: count.toString() },
          priority: 'high'
        }),
      });

      const result = await resp.json();

      if (resp.ok && result.success === 1) {
        sent++;
      } else {
        errors++;
        console.error(`FCM error for ${user_id}:`, result);
        // if invalid, mark for cleanup
        const err = result.results?.[0]?.error;
        if (['InvalidRegistration','NotRegistered'].includes(err)) {
          badTokens.push(token);
        }
      }
    }

    // 5) Cleanup invalid tokens
    if (badTokens.length) {
      const { error: clrErr } = await supabase
        .from('user_tokens')
        .update({ is_active: false })
        .in('token', badTokens);
      if (clrErr) console.error('Token cleanup error:', clrErr);
    }

    // 6) Return summary
    return new Response(JSON.stringify({
      success: true,
      documents: docs.length,
      tokens:    tokens.length,
      sent,
      errors,
      cleaned: badTokens.length
    }), {
      status: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Reminder Function Error:', err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' }
    });
  }
});
