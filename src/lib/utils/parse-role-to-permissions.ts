import type { Permission } from "@/lib/types";
import type { Role } from "@prisma/client";

export const parseRoleToPermissions = (role: Role): Permission => {
    return Object.keys(role).reduce((acc, rawKey) => {
        const key = rawKey as keyof Permission;

        const isKeyPermission = key.match(/^[A-Z]+_[A-Z]+$/);

        if (isKeyPermission) {
            acc[key] = role[key];
        }

        return acc;
    }, {} as Permission);
};
