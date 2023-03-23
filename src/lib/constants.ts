export const DefaultRolesIds = {
    // User
    SUPER_ADMIN: "super-admin",
    USER: "user",

    // Organization
    ORGANIZATION_ADMIN: "organization-admin",
    ORGANIZATION_MANAGER: "organization-manager",
    ORGANIZATION_MEMBER: "organization-member",

    // Project
    PROJECT_ADMIN: "project-admin",
    PROJECT_MEMBER: "project-member",

    // Board
    BOARD_ADMIN: "board-admin",
    BOARD_MEMBER: "board-member",
    BOARD_GUEST: "board-guest",
} as const;

export const DefaultStorageIds = {
    LOCAL: "local",
} as const;

export const Routes = {
    Home: "/",
    Pricing: "/pricing",
    Contact: "/contact",
    App: "/app",
    Organization: (id: string) => `/app/organization/${id}`,
    Project: (id: string) => `/app/project/${id}`,
    Board: (id: string) => `/app/board/${id}`,
} as const;

export const ApiRoutes = {
    Auth: "/api/auth",

    OrganizationCollections: "/api/organizations",
    Organization: (id: string) => `/api/organizations/${id}`,

    ProjectCollections: "/api/projects",
    Project: (id: string) => `/api/projects/${id}`,

    BoardCollections: "/api/boards",
    Board: (id: string) => `/api/boards/${id}`,

    ListCollections: "/api/lists",
    List: (id: string) => `/api/lists/${id}`,

    CardCollections: "/api/cards",
    Card: (id: string) => `/api/cards/${id}`,
} as const;
