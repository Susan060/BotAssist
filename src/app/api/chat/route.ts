import Settings from '@/model/settings.model'
import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from "@google/genai";
import connectDB from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const { message, ownerId } = await req.json()
        if (!message || !ownerId) {
            return NextResponse.json(
                { message: "Message and Owner Id is required" },
                { status: 400 }
            )
        }
        await connectDB()
        const setting = await Settings.findOne({ ownerId })
        if (!setting) {
            return NextResponse.json(
                { message: "Chatbot is not Configured yet" },
                { status: 400 }
            )
        }

        const prompt = `${setting.knowledge}

---

BUSINESS CONTACT DETAILS (authoritative)
-----------------------------------------
Business Name: ${setting.businessName || "not provided"}
Support Email: ${setting.supportEmail || "not provided"}

---

CUSTOMER MESSAGE
----------------
${message}`;

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
        const res = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        const response = NextResponse.json(res.text)
        response.headers.set("Access-Control-Allow-Origin", "*");
        response.headers.set("Access-Control-Allow-Methods", "POST,OPTIONS");
        response.headers.set("Access-Control-Allow-Headers", "Content-Type");
        return response

    } catch (error) {
        const response = NextResponse.json(
            { message: `chat error: ${error}` },
            { status: 500 })
        response.headers.set("Access-Control-Allow-Origin", "*");
        response.headers.set("Access-Control-Allow-Methods", "POST,OPTIONS");
        response.headers.set("Access-Control-Allow-Headers", "Content-Type");
        return response
    }
}

export const OPTIONS = async () => {
    return NextResponse.json(null, {
        status: 201,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        }
    })
}