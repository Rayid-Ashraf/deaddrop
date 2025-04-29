import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NEXT_PUBLIC_NOTION_TOKEN });

export async function POST(req) {
  try {
    const { pageId } = await req.json();

    const page = await notion.pages.retrieve({ page_id: pageId });
    const blocks = await notion.blocks.children.list({ block_id: pageId });

    const titleProperty = page.properties?.Title || page.properties?.Name;
    const publishedOnProperty = page.properties?.["Published on"];

    const title = titleProperty?.title?.[0]?.plain_text || "Untitled";
    const publishedOn = publishedOnProperty?.date?.start || null;

    return NextResponse.json({
      success: true,
      data: {
        id: page.id,
        title,
        publishedOn,
        content: blocks.results,
      },
    });
  } catch (error) {
    console.error("Error fetching page from Notion:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch Notion page." },
      { status: 500 }
    );
  }
}
