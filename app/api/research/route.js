import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { db } from "@/lib/db";
import { nanoid } from "nanoid";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function tavilySearch(query) {
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: process.env.TAVILY_API_KEY,
      query,
      search_depth: "advanced",
      max_results: 6,
      include_answer: true,
    }),
  });
  if (!res.ok) throw new Error(`Tavily error: ${res.status}`);
  return res.json();
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { topic, postId } = await req.json();
  if (!topic) {
    return NextResponse.json({ error: "topic required" }, { status: 400 });
  }

  // 1. Search with Tavily
  const tavilyData = await tavilySearch(topic);

  // 2. Summarize with Groq, grounded in the search results
  const context = (tavilyData.results || [])
    .map((r, i) => `[${i + 1}] ${r.title}\n${r.content}\nSource: ${r.url}`)
    .join("\n\n");

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content:
          "You are a research assistant for a technical writer. Summarize the given search results into concise, factual reference notes the writer can use themselves — do not write the article itself, just organize the facts, numbers, and sources clearly.",
      },
      {
        role: "user",
        content: `Topic: ${topic}\n\nSearch results:\n${context}\n\nProduce a structured research brief with key facts and cited sources.`,
      },
    ],
    temperature: 0.3,
  });

  const summary = completion.choices[0]?.message?.content || "";

  // 3. Save the research note
  const id = nanoid();
  await db.execute({
    sql: `INSERT INTO research_notes (id, post_id, topic, tavily_raw, groq_summary, created_by)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      postId || null,
      topic,
      JSON.stringify(tavilyData),
      summary,
      session.user.id,
    ],
  });

  return NextResponse.json({
    id,
    topic,
    summary,
    sources: (tavilyData.results || []).map((r) => ({
      title: r.title,
      url: r.url,
    })),
  });
}

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const postId = searchParams.get("postId");

  const result = await db.execute({
    sql: postId
      ? `SELECT * FROM research_notes WHERE post_id = ? ORDER BY created_at DESC`
      : `SELECT * FROM research_notes ORDER BY created_at DESC LIMIT 50`,
    args: postId ? [postId] : [],
  });

  return NextResponse.json(result.rows);
}
