import type { ApiMethod } from "@/lib/types";

import { createContext } from "react";

export type DashboardLayoutContextProps = {
    isLoading: boolean;
    data: ApiMethod.OrganizationList.GetResult;
    setData: (data: ApiMethod.OrganizationList.GetResult) => void;
};

export const defaultDashboardLayoutContextValue: DashboardLayoutContextProps = {
    isLoading: true,
    data: [],
    setData: () => {
        throw new Error("setData is not defined");
    },
};

export const DashboardLayoutContext = createContext<DashboardLayoutContextProps>(defaultDashboardLayoutContextValue);
