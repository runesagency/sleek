import type { ApiRequest, ApiResponse } from "@/lib/types";
import type { Board } from "@prisma/client";

import { DefaultRolesIds } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { authorizationMiddleware } from "@/lib/utils/api-middlewares";
import { getUserPermissionsForProject } from "@/lib/utils/get-user-permission";

import { ActivityAction, ActivityObject } from "@prisma/client";
import { createRouter } from "next-connect";
import { z } from "zod";

const router = createRouter<ApiRequest, ApiResponse>();

router.use(authorizationMiddleware);

// ------------------ POST /api/boards ------------------

export type PostResult = Board;

export type PostSchemaType = z.infer<typeof PostSchema>;

const PostSchema = z.object({
    name: z.string(),
    projectId: z.string(),
});

router.post(async (req, res) => {
    const parsedBody = PostSchema.safeParse(req.body);

    if (!parsedBody.success) {
        return res.status(400).json({
            error: parsedBody.error,
        });
    }

    const { name, projectId } = parsedBody.data;
    const user = req.user;

    const { permissions, error: permissionError } = await getUserPermissionsForProject(user.id, projectId);

    if (permissionError) {
        return res.status(403).json({
            error: permissionError,
        });
    }

    if (!permissions.CREATE_BOARD) {
        return res.status(403).json({
            error: {
                message: "You don't have permission to create a board",
                name: "ClientError",
            },
        });
    }

    const board = await prisma.board.create({
        data: {
            name,
            creatorId: user.id,
            projectId,
            users: {
                create: {
                    userId: user.id,
                    roleId: DefaultRolesIds.BOARD_ADMIN,
                },
            },
        },
    });

    await prisma.activity.create({
        data: {
            action: ActivityAction.CREATE,
            objectId: board.id,
            objectType: ActivityObject.BOARD,
            userId: user.id,
            creatorId: user.id,
        },
    });

    const result: PostResult = board;

    return res.status(200).json({ result });
});

export default router.handler();
