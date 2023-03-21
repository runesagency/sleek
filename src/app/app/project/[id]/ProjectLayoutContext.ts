import type { ApiMethod } from "@/lib/types";

import { createContext } from "react";

export type ProjectLayoutContextProps = {
    isLoading: boolean;
    data: ApiMethod.Project.GetResult;
    setData: (data: ApiMethod.Project.GetResult) => void;
};

export const defaultProjectLayoutContextValue: ProjectLayoutContextProps = {
    isLoading: true,
    data: {
        id: "",
        boards: [],
        coverAttachmentId: "",
        createdAt: new Date(),
        creatorId: "",
        description: "",
        dueDate: new Date(),
        logoAttachmentId: "",
        modifiedAt: new Date(),
        modifierId: "",
        name: "",
        organizationId: "",
        password: "",
        startDate: new Date(),
        users: [],
    },
    setData: () => {
        throw new Error("setData is not defined");
    },
};

export const ProjectLayoutContext = createContext<ProjectLayoutContextProps>(defaultProjectLayoutContextValue);
