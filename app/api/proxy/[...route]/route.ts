import { NextRequest, NextResponse } from "next/server";
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

const BASE_URL = process.env.ACE_BASE;

async function handleRequests(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const path = (req.nextUrl.pathname.match(/api\/proxy\/(.*)/) || [])[1] || "";
  const search = req.nextUrl.search;
  const backendPath = `${BASE_URL}/${path}${search}`;

  let body = null;

  if (req.method == "POST" || req.method == "PUT" || req.method == "PATCH") {
    try {
      body = await req.json();
    } catch (e) {
      body = null;
    }
  }

  const headers: Record<string, any> = {
    ...req.headers,
    Authorization: `Bearer ${session?.user?.userToken ?? ""}`,
  };
  console.log('This is  auth', session?.user?.userToken)
  const config: AxiosRequestConfig = {
    method: req.method,
    url: backendPath,
    headers,
    data: body,
  };

  try {
    const response = await axios(config);
    const result = await response.data;
    console.log(result)
    return NextResponse.json(result);
  } catch (error) {
    console.log(error)
    if (error instanceof AxiosError) {
        console.log(error.response?.data)
      return NextResponse.json(
        { message: error.response?.data?.detail },
        {
          status: error.response?.status || 500,
        }
      );
    }

    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json(
      { message: "Error processing request", error: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return handleRequests(req);
}

export async function POST(req: NextRequest) {
  console.log('Thisn')
 return handleRequests(req); 
}

export async function DELETE(req: NextRequest) {
 return handleRequests(req);
}

