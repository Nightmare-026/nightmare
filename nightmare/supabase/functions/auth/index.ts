import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const derivedBits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial, 256
  );
  const hashHex = Array.from(new Uint8Array(derivedBits)).map(b => b.toString(16).padStart(2, '0')).join('');
  return `${saltHex}:${hashHex}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, storedHash] = stored.split(':');
  if (!saltHex || !storedHash) return false;
  const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map(b => parseInt(b, 16)));
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const derivedBits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial, 256
  );
  const hashHex = Array.from(new Uint8Array(derivedBits)).map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex === storedHash;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace('/functions/v1/auth', '').replace('/auth', '') || '/';
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (req.method === 'POST' && path === '/register') {
      const { email, password, name } = await req.json();

      if (!email || !password || !name) {
        return new Response(JSON.stringify({ success: false, error: 'Missing required fields' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
      }

      const passwordHash = await hashPassword(password);
      const now = new Date().toISOString();

      const response = await fetch(`${supabaseUrl}/rest/v1/users`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'authorization': `Bearer ${supabaseKey}`,
          'content-type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ id: crypto.randomUUID(), email, name, password_hash: passwordHash, created_at: now, updated_at: now })
      });

      if (!response.ok) {
        const error = await response.json();
        const msg = error?.message?.includes('duplicate') ? 'Email already registered' : 'Registration failed';
        return new Response(JSON.stringify({ success: false, error: msg }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
      }

      const [user] = await response.json();
      return new Response(
        JSON.stringify({ success: true, data: { id: user.id, email: user.email, name: user.name } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 }
      );
    }

    if (req.method === 'POST' && path === '/login') {
      const { email, password } = await req.json();
      if (!email || !password) {
        return new Response(JSON.stringify({ success: false, error: 'Missing email or password' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
      }

      const response = await fetch(
        `${supabaseUrl}/rest/v1/users?email=eq.${encodeURIComponent(email)}&select=*`,
        { headers: { 'apikey': supabaseKey, 'authorization': `Bearer ${supabaseKey}`, 'content-type': 'application/json' } }
      );

      const users = await response.json();
      if (!users.length) {
        return new Response(JSON.stringify({ success: false, error: 'Invalid email or password' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 });
      }

      const user = users[0];
      const isValid = await verifyPassword(password, user.password_hash);
      if (!isValid) {
        return new Response(JSON.stringify({ success: false, error: 'Invalid email or password' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 });
      }

      return new Response(
        JSON.stringify({ success: true, data: { id: user.id, email: user.email, name: user.name } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    return new Response(JSON.stringify({ success: false, error: 'Not found' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
  }
})
