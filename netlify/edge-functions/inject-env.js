/* ============================================================
   PDT SINGERS — Environment Variable Injector
   Netlify Edge Function: injects Supabase credentials into
   HTML pages as a window.__PDT_ENV object so client-side JS
   can access them without exposing them in source files.

   Place this file at: netlify/edge-functions/inject-env.js
   ============================================================ */

export default async (request, context) => {
  const response = await context.next()

  // Only process HTML responses
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('text/html')) return response

  const html = await response.text()

  // Inject env vars as a script tag before </head>
  const envScript = `
<script>
  window.__PDT_ENV = {
    SUPABASE_URL:      "${Deno.env.get('SUPABASE_URL') || ''}",
    SUPABASE_ANON_KEY: "${Deno.env.get('SUPABASE_ANON_KEY') || ''}"
  };
</script>`

  const injected = html.replace('</head>', `${envScript}\n</head>`)

  return new Response(injected, {
    status: response.status,
    headers: response.headers
  })
}

export const config = {
  path: '/*'
}
