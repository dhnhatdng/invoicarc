import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { description } = await req.json();
    if (!description) return NextResponse.json({ error: 'Description is required' }, { status: 400 });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'OpenAI API key is not configured' }, { status: 500 });

    const systemPrompt = `You are an invoice assistant. Given a plain text work description, extract and return ONLY a JSON object with these fields:
{
  "title": "Invoice title",
  "description": "Invoice description",
  "lineItems": [{"name": "Item description", "quantity": 1, "unitPrice": 100.0}],
  "subtotal": 100.0,
  "notes": "Any additional notes"
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Model rẻ và nhanh nhất của OpenAI
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: description }
        ],
        response_format: { type: 'json_object' } // Ép buộc trả về JSON
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'OpenAI API Error');

    const parsedInvoice = JSON.parse(data.choices[0].message.content.trim());
    return NextResponse.json(parsedInvoice);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error' }, { status: 500 });
  }
}
