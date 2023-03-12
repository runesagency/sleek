import type { NextRequest } from "next/server";

import { redirect } from "next/navigation";

export async function GET(request: NextRequest) {
    redirect(request.url + "/kanban");
}
