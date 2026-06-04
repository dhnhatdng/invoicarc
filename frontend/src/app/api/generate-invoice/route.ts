import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { description } = await req.json();

    if (!description) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Anthropic API key is not configured' },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({ apiKey });

    const systemPrompt = `You are an invoice assistant. Given a plain text work description, extract and return ONLY a JSON object with these fields:
{ title, description, lineItems: [{name, quantity, unitPrice}], subtotal, currency: 'USDC', notes }
All prices are in USDC. Do not add markdown or explanation.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514', // Using requested model
      max_tokens: 800,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: description,
        },
      ],
    });

    let rawText = '';
    const content = response.content[0];
    if (content && content.type === 'text') {
      rawText = content.text.trim();
    } else {
      return NextResponse.json(
        { error: 'Unexpected response content type from AI assistant' },
        { status: 500 }
      );
    }

    // Strip markdown code fences if they are returned by the AI
    let jsonString = rawText;
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.slice(7);
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.slice(3);
    }
    
    if (jsonString.endsWith('```')) {
      jsonString = jsonString.slice(0, -3);
    }
    
    jsonString = jsonString.trim();

    try {
      const parsedInvoice = JSON.parse(jsonString);
      return NextResponse.json(parsedInvoice);
    } catch {
      console.error('Failed parsing AI response:', jsonString);
      return NextResponse.json(
        {
          error: 'AI response failed to parse as valid JSON. Raw response is available.',
          rawText
        },
        { status: 400 }
      );
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('Anthropic API Call Error:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
