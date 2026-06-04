import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { description } = await req.json();
    if (!description) return NextResponse.json({ error: 'Description is required' }, { status: 400 });

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'Groq API key is not configured' }, { status: 500 });

    const systemPrompt = `You are an invoice assistant. Given a plain text work description, extract and return ONLY a JSON object with these fields:
{
  "title": "Invoice title",
  "description": "Invoice description",
  "lineItems": [{"name": "Item description", "quantity": 1, "unitPrice": 100.0}],
  "subtotal": 100.0,
  "notes": "Any additional notes"
}
Return only the raw JSON. Do not add markdown or conversational text.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', // Model Llama mạnh mẽ và hoàn toàn miễn phí của Meta
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: description }
        ],
        response_format: { type: 'json_object' }
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Groq API Error');

    const jsonString = data.choices[0].message.content.trim();
    const parsedInvoice = JSON.parse(jsonString);
    return NextResponse.json(parsedInvoice);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('Groq Error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
