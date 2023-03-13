import type { ApiRequest, ApiResponse } from "@/lib/types";
import type { Project } from "@prisma/client";

import { DefaultRolesIds } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { authorizationMiddleware } from "@/lib/utils/api-middlewares";
import { getUserPermissionsForOrganization } from "@/lib/utils/get-user-permission";

import { ActivityAction, ActivityObject } from "@prisma/client";
import { createRouter } from "next-connect";
import { z } from "zod";

const router = createRouter<ApiRequest, ApiResponse>();

router.use(authorizationMiddleware);

// ------------------ GET /api/projects ------------------

export type PostResult = Project & {
    _count: {
        boards: number;
    };
};

const PostSchema = z.object({
    organizationId: z.string(),
    name: z.string(),
    description: z.string().optional(),
});

router.post(async (req, res) => {
    const parsedBody = PostSchema.safeParse(req.body);

    if (!parsedBody.success) {
        return res.status(400).json({
            error: parsedBody.error,
        });
    }

    const { name, description, organizationId } = parsedBody.data;
    const user = req.user;

    const { permissions, error: permissionError } = await getUserPermissionsForOrganization(user.id, organizationId);

    if (permissionError) {
        return res.status(403).json({
            error: permissionError,
        });
    }

    if (!permissions.CREATE_PROJECT) {
        return res.status(403).json({
            error: {
                message: "You don't have permission to create a project",
                name: "ClientError",
            },
        });
    }

    const project = await prisma.project.create({
        data: {
            name,
            description,
            organizationId,
            creatorId: user.id,
            users: {
                create: {
                    userId: user.id,
                    adderId: user.id,
                    roleId: DefaultRolesIds.PROJECT_ADMIN,
                },
            },
        },
        include: {
            _count: {
                select: {
                    boards: true,
                },
            },
        },
    });

    await prisma.activity.create({
        data: {
            action: ActivityAction.CREATE,
            objectId: project.id,
            objectType: ActivityObject.PROJECT,
            userId: user.id,
            creatorId: user.id,
        },
    });

    const result: PostResult = project;

    return res.status(200).json({ result });
});

export default router.handler();
