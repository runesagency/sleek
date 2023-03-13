import { Routes } from "@/lib/constants";

export { default } from "next-auth/middleware";

export const config = {
    matcher: [
        Routes.App + "/:path*", //
    ],
};
