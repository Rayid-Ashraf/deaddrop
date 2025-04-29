// app/api/notion/database/route.js
import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NEXT_PUBLIC_NOTION_TOKEN });

export async function POST(req) {
  try {
    const { databaseId } = await req.json();

    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: "Status",
        select: {
          equals: "Published",
        },
      },
      sorts: [
        {
          property: "Published on",
          direction: "descending",
        },
      ],
    });

    const results = response.results.map((page) => {
      const titleProperty = page.properties.Title || page.properties.Name;
      const publishedOnProperty = page.properties["Published on"];

      return {
        id: page.id,
        title: titleProperty?.title?.[0]?.plain_text || "Untitled",
        date: publishedOnProperty?.date?.start || "No date",
      };
    });

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error("Error fetching database:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch Notion database." },
      { status: 500 }
    );
  }
}
