import type { ApiRequest, ApiResponse } from "@/lib/types";
import type { Board, Project, User } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { authorizationMiddleware } from "@/lib/utils/api-middlewares";
import { getUserPermissionsForProject } from "@/lib/utils/get-user-permission";

import { createRouter } from "next-connect";
import { z } from "zod";

const router = createRouter<ApiRequest, ApiResponse>();

router.use(authorizationMiddleware);

// ------------------ GET /api/project/[id] ------------------

export type GetResult = Project & {
    users: User[];
    boards: Board[];
};

router.get(async (req, res) => {
    const user = req.user;
    const projectId = req.query.id as string;

    const { permissions, error: permissionError } = await getUserPermissionsForProject(user.id, projectId);

    if (permissionError) {
        return res.status(403).json({
            error: permissionError,
        });
    }

    if (!permissions.VIEW_PROJECT) {
        return res.status(403).json({
            error: {
                message: "You don't have permission to view this project",
                name: "ClientError",
            },
        });
    }

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

    const result: GetResult = {
        ...project,
        users: project.users.map(({ user, roleId }) => ({
            ...user,
            roleId,
        })),
    };

    return res.status(200).json({ result });
});

export default router.handler();
