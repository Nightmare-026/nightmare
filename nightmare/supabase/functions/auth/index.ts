import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

serve(async (req) => {
  console.log('Request URL:', req.url)
  console.log('Request method:', req.method)
  console.log('Request headers:', Object.fromEntries(req.headers.entries()))

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const path = url.pathname.replace('/functions/v1/auth', '')

    console.log('Request URL:', req.url)
    console.log('Request method:', req.method)
    console.log('Request headers:', Object.fromEntries(req.headers.entries()))
    console.log('Parsed path:', path)

    // POST /auth/register - Register new user
    if (req.method === 'POST' && path === '/register') {
      const { email, password, name, action } = await req.json()
      console.log('Register request body:', { email, password, name, action })

      // Hash password
      const encoder = new TextEncoder()
      const data = encoder.encode(password)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray.map((b: number) => b.toString(16).padStart(2, '0')).join('')

      // Initialize Supabase client
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      
      console.log('Supabase URL:', supabaseUrl)
      console.log('Creating user with data:', { email, name, passwordHash: hashHex, action })
      
      // Create user in database
      const response = await fetch(`${supabaseUrl}/rest/v1/users`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'authorization': `Bearer ${supabaseKey}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          email,
          name,
          passwordHash: hashHex,
          action
        })
      })

      console.log('Supabase response status:', response.status)
      
      if (!response.ok) {
        const error = await response.json()
        console.error('Registration error:', error)
        throw new Error(error.message || 'Registration failed')
      }

      const user = await response.json()
      console.log('User created:', user)

      return new Response(
        JSON.stringify({ 
          success: true, 
          data: {
            id: user.id,
            email: user.email,
            name: user.name
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 201 
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed', path: path }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
