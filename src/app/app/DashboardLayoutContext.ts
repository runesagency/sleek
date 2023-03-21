import type { ApiMethod } from "@/lib/types";

import { createContext } from "react";

export type DashboardLayoutContextProps = {
    isLoading: boolean;
    data: ApiMethod.CurrentUser.GetResult;
    setData: (data: ApiMethod.CurrentUser.GetResult) => void;
};

export const defaultDashboardLayoutContextValue: DashboardLayoutContextProps = {
    isLoading: true,
    data: {
        createdAt: new Date(),
        email: "",
        id: "",
        language: "",
        modifiedAt: new Date(),
        name: "",
        organizations: [],
        roleId: "",
        subscribeByDefault: false,
        subscribeToEmail: false,
        username: "",
        coverAttachmentId: "",
        imageAttachmentId: "",
        phone: "",
        verifiedAt: new Date(),
    },
    setData: () => {
        throw new Error("setData is not defined");
    },
};

export const DashboardLayoutContext = createContext<DashboardLayoutContextProps>(defaultDashboardLayoutContextValue);
