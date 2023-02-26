import type { ApiRequest, APIResponse } from "@/lib/types";
import type { Organization } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

import { ActivityAction, ActivityObject } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { createRouter } from "next-connect";
import { z } from "zod";

const router = createRouter<ApiRequest, APIResponse>();

router.use(async (req, res, next) => {
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
            }
        }
    }

    return res.status(401).end();
});

export type GetResult = {
    organizationsOwned: Organization[];
    organizationsJoined: Organization[];
};

const GetSchema = z.object({});

router.get(async (req, res) => {
    const parsedBody = GetSchema.safeParse(req.body);

    if (!parsedBody.success) {
        return res.status(400).json({
            error: parsedBody.error,
        });
    }

    const user = await prisma.user.findUnique({
        where: {
            email: req.user.email,
        },
        select: {
            organizationsOwned: true,
            organizations: {
                select: {
                    organization: true,
                },
            },
        },
    });

    if (!user) {
        return res.status(401).json({
            error: {
                message: "User not found",
                name: "ClientError",
            },
        });
    }

    return res.status(200).json({
        result: {
            organizationsOwned: user.organizationsOwned,
            organizationsJoined: user.organizations.map(({ organization }) => organization),
        } as GetResult,
    });
});

export type PostResult = Organization;

const PostSchema = z.object({
    name: z.string(),
});

router.post(async (req, res) => {
    const parsedBody = PostSchema.safeParse(req.body);

    if (!parsedBody.success) {
        return res.status(400).json({
            error: parsedBody.error,
        });
    }

    const { name } = parsedBody.data;
    const user = req.user;

    const organization = await prisma.organization.create({
        data: {
            name,
            ownerId: user.id,
        },
    });

    await prisma.activity.create({
        data: {
            action: ActivityAction.CREATE,
            objectId: organization.id,
            objectType: ActivityObject.ORGANIZATION,
            userId: user.id,
            creatorId: user.id,
        },
    });

    return res.status(200).json({
        result: organization as PostResult,
    });
});

export default router.handler();