import { NextResponse } from "next/server";
import { supabase } from "@/libs/supabase";

export async function POST(request) {
  try {
    const { name } = await request.json();

    // Validate inputs
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Fetch current download count
    const { data, error } = await supabase
      .from("metadata")
      .select("downloads, max_downloads")
      .eq("name", name)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "No file found with this name" },
        { status: 404 }
      );
    }

    const { downloads } = data;

    // Update download count
    const updatedCount = downloads + 1;
    const { error: updateError } = await supabase
      .from("metadata")
      .update({ downloads: updatedCount })
      .eq("name", name);

    if (updateError) {
      console.error("Error updating downloads:", updateError);
      return NextResponse.json(
        { error: "Failed to update download count" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, downloads: updatedCount });
  } catch (error) {
    console.error("Download count update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update download count" },
      { status: 500 }
    );
  }
}
