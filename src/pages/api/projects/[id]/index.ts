import type { ApiRequest, ApiResponse } from "@/lib/types";
import type { Board, Project, User } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

import { getServerSession } from "next-auth/next";
import { createRouter } from "next-connect";
import { z } from "zod";

const router = createRouter<ApiRequest, ApiResponse>();

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
    }

    return res.status(401).end();
});

export type GetResult = Project & {
    users: User[];
    boards: Board[];
};

router.get(async (req, res) => {
    const projectId = req.query.id as string;

    const project = await prisma.project.findUnique({
        where: {
            id: projectId,
        },
        include: {
            boards: true,
            users: {
                include: {
                    user: true,
                },
            },
        },
    });

    if (!project) {
        return res.status(404).json({
            error: {
                message: "Project not found",
                name: "ClientError",
            },
        });
    }

    const users = project.users.map(({ user }) => user);

    return res.status(200).json({
        result: {
            ...project,
            users,
        } as GetResult,
    });
});

export default router.handler();
