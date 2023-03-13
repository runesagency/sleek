import type { ApiRequest, ApiResponse } from "@/lib/types";
import type { NextHandler } from "next-connect";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

import { getServerSession } from "next-auth/next";

export const authorizationMiddleware = async (req: ApiRequest, res: ApiResponse, next: NextHandler) => {
    const session = await getServerSession(req, res, authOptions);

    if (session && session.user && session.user.email) {
        const user = await prisma.user.findUnique({
            where: {
                email: session.user.email,
            },
        });

        if (user) {
            req.user = user;
            return next();
        }
    } else {
        // get bearer token from header
        const authHeader = req.headers.authorization;

        if (authHeader) {
            const [tokenType, tokenCode] = authHeader.split(" ");

            if (tokenType === "Bearer" && tokenCode) {
                console.log(tokenCode);
                // WIP: get user from token
            } else {
                return res.status(401).json({
                    error: {
                        message: "Invalid authorization header",
                        name: "ClientError",
                    },
                });
            }
        }
    }

    return res.status(401).json({
        error: {
            message: "You are not authorized to access this resource",
            name: "ClientError",
        },
    });
};
