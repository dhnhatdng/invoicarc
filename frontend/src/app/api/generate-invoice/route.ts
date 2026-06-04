import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { description } = await req.json();
    if (!description) return NextResponse.json({ error: 'Description is required' }, { status: 400 });

    const apiKey = process.env.OPENAI_API_KEY;
    
    // NẾU BỊ LỖI THIẾU KEY, SE IN RA DANH SÁCH CÁC BIẾN MÔI TRƯỜNG ĐANG CÓ TRÊN VERCEL
    if (!apiKey) {
      const envKeys = Object.keys(process.env).filter(
        key => !key.startsWith('npm_') && !key.startsWith('NODE_') && !key.startsWith('AWS_')
      );
      return NextResponse.json({ 
        error: 'OpenAI API key is not configured', 
        debugAvailableKeys: envKeys 
      }, { status: 500 });
    }

    const systemPrompt = `You are an invoice assistant. Given a plain text work description, extract and return ONLY a JSON object with these fields:
{
  "title": "Invoice title",
  "description": "Invoice description",
  "lineItems": [{"name": "Item description", "quantity": 1, "unitPrice": 100.0}],
  "subtotal": 100.0,
  "notes": "Any additional notes"
}
All prices are in USDC.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: description }
        ],
        response_format: { type: 'json_object' }
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'OpenAI API Error');

    const jsonString = data.choices[0].message.content.trim();
    const parsedInvoice = JSON.parse(jsonString);
    return NextResponse.json(parsedInvoice);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('OpenAI Error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
