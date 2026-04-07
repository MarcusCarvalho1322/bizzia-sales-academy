export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req) {
  try {
    const { messages, systemPrompt } = await req.json()

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return Response.json({ error: 'API key nao configurada no servidor' }, { status: 500 })
    }

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: systemPrompt,
        messages,
      }),
    })

    if (!resp.ok) {
      const err = await resp.json()
      return Response.json({ error: err.error?.message || 'Erro na API' }, { status: resp.status })
    }

    const data = await resp.json()
    return Response.json({ text: data.content?.[0]?.text || '' })

  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}
