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
    // Strip both possible prefixes to get the relative path
    const path = url.pathname
      .replace('/functions/v1/auth', '')
      .replace('/auth', '') || '/'

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

    // POST /auth/login - Login user
    if (req.method === 'POST' && path === '/login') {
      const { email, password } = await req.json()
      console.log('Login request for:', email)

      // Hash the provided password
      const encoder = new TextEncoder()
      const data = encoder.encode(password)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray.map((b: number) => b.toString(16).padStart(2, '0')).join('')

      // Look up user by email
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

      const response = await fetch(
        `${supabaseUrl}/rest/v1/users?email=eq.${encodeURIComponent(email)}&select=*`,
        {
          method: 'GET',
          headers: {
            'apikey': supabaseKey,
            'authorization': `Bearer ${supabaseKey}`,
            'content-type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        const error = await response.json()
        console.error('Database error:', error)
        throw new Error('Login failed')
      }

      const users = await response.json()
      console.log('Users found:', users.length)

      if (users.length === 0) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid email or password' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 401
          }
        )
      }

      const user = users[0]

      // Compare password hashes
      if (user.passwordHash !== hashHex) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid email or password' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 401
          }
        )
      }

      // Generate a simple token (base64 encoded user info + timestamp)
      const tokenPayload = {
        id: user.id,
        email: user.email,
        name: user.name,
        iat: Date.now(),
        exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
      }
      const token = btoa(JSON.stringify(tokenPayload))

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            user: {
              id: user.id,
              email: user.email,
              name: user.name
            },
            token: token
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Route not found', path: path }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404 
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
