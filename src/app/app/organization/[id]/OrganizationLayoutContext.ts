import type { ApiMethod } from "@/lib/types";

import { createContext } from "react";

export type OrganizationLayoutContextProps = {
    isLoading: boolean;
    data: ApiMethod.Organization.GetResult;
    setData: (data: ApiMethod.Organization.GetResult) => void;
};

export const defaultOrganizationLayoutContextValue: OrganizationLayoutContextProps = {
    isLoading: true,
    data: {
        id: "",
        createdAt: new Date(),
        creatorId: "",
        customRoles: [],
        description: "",
        externalProjects: [],
        logoAttachmentId: "",
        modifiedAt: new Date(),
        modifierId: "",
        name: "",
        ownerId: "",
        projects: [],
        users: [],
    },
    setData: () => {
        throw new Error("setData is not defined");
    },
};

export const OrganizationLayoutContext = createContext<OrganizationLayoutContextProps>(defaultOrganizationLayoutContextValue);
