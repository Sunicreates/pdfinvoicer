import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import { Invoice } from '../types';
import { getFile } from './fileStorage';
import pdfParse from 'pdf-parse';

// Lazy initialization of AI clients
let gemini: GoogleGenerativeAI | null = null;
let groq: Groq | null = null;

function getGeminiClient() {
  if (!gemini && process.env.GEMINI_API_KEY) {
    gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return gemini;
}

function getGroqClient() {
  if (!groq && process.env.GROQ_API_KEY) {
    console.log('Initializing Groq client with API key');
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groq;
}

const EXTRACTION_PROMPT = `
You are an AI assistant that extracts structured data from invoice text. 
Extract the following information and return it as a JSON object:

{
  "fileId": "string",
  "fileName": "string", 
  "vendor": {
    "name": "string",
    "address": "string (optional)",
    "taxId": "string (optional)"
  },
  "invoice": {
    "number": "string",
    "date": "string (YYYY-MM-DD format)",
    "currency": "string (optional)",
    "subtotal": "number (optional)",
    "taxPercent": "number (optional)", 
    "total": "number (optional)",
    "poNumber": "string (optional)",
    "poDate": "string (optional, YYYY-MM-DD format)",
    "lineItems": [
      {
        "description": "string",
        "unitPrice": "number",
        "quantity": "number", 
        "total": "number"
      }
    ]
  }
}

Extract data from this invoice text and return ONLY the JSON object, no other text:
`;

export async function extractDataFromPDF(
  fileId: string, 
  model: 'gemini' | 'groq'
): Promise<Omit<Invoice, '_id' | 'createdAt' | 'updatedAt'> | null> {
  try {
    // Get file buffer (placeholder for now)
    const fileBuffer = await getFile(fileId);
    if (!fileBuffer) {
      throw new Error('File not found');
    }

    // Extract text from PDF
    const pdfData = await pdfParse(fileBuffer);
    const pdfText = pdfData.text;

    if (!pdfText.trim()) {
      throw new Error('No text found in PDF');
    }

    // Extract data using specified AI model
    let extractedData: any;
    
    if (model === 'gemini') {
      extractedData = await extractWithGemini(pdfText, fileId);
    } else if (model === 'groq') {
      extractedData = await extractWithGroq(pdfText, fileId);
    } else {
      throw new Error('Invalid AI model specified');
    }

    // Validate and return extracted data
    if (!extractedData || !extractedData.vendor || !extractedData.invoice) {
      throw new Error('Invalid extraction result');
    }

    return extractedData;

  } catch (error) {
    console.error('PDF extraction error:', error);
    throw error;
  }
}

async function extractWithGemini(
  pdfText: string, 
  fileId: string
): Promise<any> {
  const geminiClient = getGeminiClient();
  if (!geminiClient) {
    throw new Error('Gemini API key not configured');
  }

  try {
    const model = geminiClient.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = EXTRACTION_PROMPT + '\n\n' + pdfText;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Gemini response');
    }
    
    const extractedData = JSON.parse(jsonMatch[0]);
    extractedData.fileId = fileId;
    
    return extractedData;
    
  } catch (error) {
    console.error('Gemini extraction error:', error);
    throw new Error('Failed to extract with Gemini');
  }
}

async function extractWithGroq(
  pdfText: string, 
  fileId: string
): Promise<any> {
  const groqClient = getGroqClient();
  if (!groqClient) {
    throw new Error('Groq API key not configured');
  }

  try {
    const completion = await groqClient.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an AI that extracts structured data from invoices. Respond only with valid JSON.'
        },
        {
          role: 'user',
          content: EXTRACTION_PROMPT + '\n\n' + pdfText
        }
      ],
      model: 'llama-3.1-8b-instant', // Updated to use current model
      temperature: 0.1,
      max_tokens: 2048,
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error('Empty response from Groq');
    }

    // Parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Groq response');
    }
    
    const extractedData = JSON.parse(jsonMatch[0]);
    extractedData.fileId = fileId;
    
    return extractedData;
    
  } catch (error) {
    console.error('Groq extraction error:', error);
    throw new Error('Failed to extract with Groq');
  }
}
