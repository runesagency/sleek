import type { Role } from "@prisma/client";

export type Permissions = {
    [K in keyof Role as K extends `${Uppercase<string>}_${Uppercase<string>}` ? K : never]: Role[K];
};

export const parseRoleToPermissions = (role: Role): Permissions => {
    return Object.keys(role).reduce((acc, rawKey) => {
        const key = rawKey as keyof Permissions;

        const isKeyPermission = key.match(/^[A-Z]+_[A-Z]+$/);

        if (isKeyPermission) {
            acc[key] = role[key];
        }

        return acc;
    }, {} as Permissions);
};
