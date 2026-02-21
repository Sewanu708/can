import { UTApi } from "uploadthing/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const files = new UTApi();
    // You might want to filter or map these files
    // const imageUrls = files.map(file => ({
    //   url: `https://utfs.io/f/${file.key}`, // Construct the public URL
    //   key: file.key
    // }));
    
    return NextResponse.json('imageUrls');
  } catch (error) {
    console.error("Error fetching assets:", error);
    return NextResponse.json({ error: "Failed to fetch assets" }, { status: 500 });
  }
}
