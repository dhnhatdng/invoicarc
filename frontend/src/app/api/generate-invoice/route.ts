import { GoogleGenerativeAI } from '@google/generative-ai';
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

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key is not configured' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const systemPrompt = `You are an invoice assistant. Given a plain text work description, extract and return ONLY a JSON object with these fields:
{
  "title": "Invoice title",
  "description": "Invoice description",
  "lineItems": [{"name": "Item description", "quantity": 1, "unitPrice": 100.0}],
  "subtotal": 100.0,
  "currency": "USDC",
  "notes": "Any additional notes"
}
All prices are in USDC. Do not add markdown or explanation.`;

    // Danh sách các model để thử nghiệm phòng khi bị lỗi 404 ở một số tài khoản/khu vực
    const modelsToTry = [
      'gemini-1.5-flash',
      'gemini-1.5-flash-latest',
      'gemini-2.0-flash',
      'gemini-1.5-pro',
      'gemini-1.5-pro-latest'
    ];

    let rawText = '';
    let lastError: unknown = null;

    // Vòng lặp thử từng model cho đến khi thành công
    for (const modelName of modelsToTry) {
      try {
        console.log(`Attempting generation with model: ${modelName}`);
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            responseMimeType: 'application/json',
          }
        });

        const response = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: description }] }],
          systemInstruction: systemPrompt,
        });

        rawText = response.response.text().trim();
        if (rawText) {
          console.log(`Success using model: ${modelName}`);
          lastError = null;
          break; // Tìm thấy model chạy thành công, thoát khỏi vòng lặp
        }
      } catch (err) {
        console.warn(`Model ${modelName} failed, trying next... Error:`, err);
        lastError = err;
      }
    }

    if (lastError) {
      throw lastError; // Nếu tất cả các model đều thất bại thì mới báo lỗi
    }

    // Loại bỏ code block markdown ```json ... ``` nếu có
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
      console.error('Failed parsing Gemini response:', jsonString);
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
    console.error('Gemini API Call Error:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
