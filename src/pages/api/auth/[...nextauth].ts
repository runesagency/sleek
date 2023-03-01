import type { Prisma, User, UserAccount, UserSession } from "@prisma/client";
import type { NextAuthOptions } from "next-auth";
import type { AdapterAccount, Adapter, AdapterUser, AdapterSession } from "next-auth/adapters";
import type { Provider } from "next-auth/providers";

import { AuthHashCode } from "@/components/Sections/Navigation";
import { DefaultRolesIds } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";

const getAdapter = (): Adapter => {
    const parseUser = (user: User) => {
        const parsedUser: AdapterUser = {
            ...user,

            // different from the default model
            emailVerified: user.verifiedAt,
        };

        return parsedUser;
    };

    const parseUserAccount = (account: UserAccount) => {
        const parsedAccount: AdapterAccount = {
            ...account,

            // different from the default model
            expiresAt: account.expiredAt ?? undefined,
            idToken: account.tokenId ?? undefined,

            // same, just altering null to undefined
            accessToken: account.accessToken ?? undefined,
            refreshToken: account.refreshToken ?? undefined,
            scope: account.scope ?? undefined,
            sessionState: account.sessionState ?? undefined,
            tokenType: account.tokenType ?? undefined,
        };

        return parsedAccount;
    };

    const parseUserSession = (session: UserSession) => {
        const parsedSession: AdapterSession = {
            ...session,

            // different from the default model
            expires: session.expiredAt,
        };

        return parsedSession;
    };

    return {
        createUser: async (data) => {
            const nameFromEmail = data.email.split("@")[0];

            const newUser = await prisma.user.create({
                data: {
                    email: data.email,
                    name: data.name ?? nameFromEmail,
                    verifiedAt: data.emailVerified,
                    roleId: DefaultRolesIds.USER,
                },
            });

            return parseUser(newUser);
        },

        getUser: async (id) => {
            const user = await prisma.user.findUnique({
                where: {
                    id,
                },
                include: {
                    role: true,
                },
            });

            if (user) {
                return parseUser(user);
            }

            return null;
        },

        getUserByEmail: async (email) => {
            const user = await prisma.user.findUnique({
                where: {
                    email,
                },
            });

            if (user) {
                return parseUser(user);
            }

            return null;
        },

        getUserByAccount: async (provider_providerAccountId) => {
            const account = await prisma.userAccount.findUnique({
                where: {
                    provider_providerAccountId,
                },
                select: {
                    user: true,
                },
            });

            if (account) {
                return parseUser(account.user);
            }

            return null;
        },

        updateUser: async ({ id, email, emailVerified, name }) => {
            const updatedUser = await prisma.user.update({
                where: {
                    id,
                },
                data: {
                    name: name ?? undefined,
                    email,
                    verifiedAt: emailVerified ?? undefined,
                },
            });

            return parseUser(updatedUser);
        },

        deleteUser: async (id) => {
            const deletedUser = await prisma.user.delete({
                where: {
                    id,
                },
            });

            return parseUser(deletedUser);
        },

        linkAccount: async ({ id_token, expires_at, ...data }) => {
            const linkedAccount = await prisma.userAccount.create({
                data: {
                    ...data,
                    tokenId: id_token,
                    expiredAt: expires_at,
                },
            });

            if (linkedAccount) {
                return parseUserAccount(linkedAccount);
            }

            return null;
        },

        unlinkAccount: async (provider_providerAccountId) => {
            const unlinkedAccount = await prisma.userAccount.delete({
                where: {
                    provider_providerAccountId,
                },
            });

            if (unlinkedAccount) {
                return parseUserAccount(unlinkedAccount);
            }

            return undefined;
        },

        getSessionAndUser: async (sessionToken) => {
            const session = await prisma.userSession.findUnique({
                where: {
                    sessionToken,
                },
                include: {
                    user: true,
                },
            });

            if (session) {
                const { user, ...sessionData } = session;

                return {
                    session: parseUserSession(sessionData),
                    user: parseUser(user),
                };
            }

            return null;
        },

        createSession: async ({ expires, sessionToken, userId }) => {
            const newSession = await prisma.userSession.create({
                data: {
                    expiredAt: expires,
                    sessionToken,
                    userId,
                },
            });

            return parseUserSession(newSession);
        },

        updateSession: async ({ sessionToken, expires, userId }) => {
            const updatedSession = await prisma.userSession.update({
                where: {
                    sessionToken,
                },
                data: {
                    expiredAt: expires,
                    sessionToken,
                    userId,
                },
            });

            return parseUserSession(updatedSession);
        },

        deleteSession: async (sessionToken) => {
            const deletedSession = await prisma.userSession.delete({
                where: {
                    sessionToken,
                },
            });

            return parseUserSession(deletedSession);
        },

        createVerificationToken: async (data) => {
            const newVerificationToken = await prisma.verificationToken.create({
                data,
            });

            return newVerificationToken;
        },

        useVerificationToken: async (identifier_token) => {
            try {
                const verificationToken = await prisma.verificationToken.delete({
                    where: {
                        identifier_token,
                    },
                });

                return verificationToken;
            } catch (error) {
                // If token already used/deleted, just return null
                // https://www.prisma.io/docs/reference/api-reference/error-reference#p2025
                if ((error as Prisma.PrismaClientKnownRequestError).code === "P2025") {
                    return null;
                }

                throw error;
            }
        },
    };
};

const getProviders = () => {
    const providers: Provider[] = [];

    if (process.env.EMAIL_SERVER_HOST && process.env.EMAIL_SERVER_PORT && process.env.EMAIL_SERVER_USER && process.env.EMAIL_SERVER_PASSWORD && process.env.EMAIL_FROM) {
        providers.push(
            EmailProvider({
                server: {
                    host: process.env.EMAIL_SERVER_HOST,
                    port: process.env.EMAIL_SERVER_PORT,
                    auth: {
                        user: process.env.EMAIL_SERVER_USER,
                        pass: process.env.EMAIL_SERVER_PASSWORD,
                    },
                },
                from: process.env.EMAIL_FROM,
            })
        );
    }

    if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
        providers.push(
            DiscordProvider({
                clientId: process.env.DISCORD_CLIENT_ID,
                clientSecret: process.env.DISCORD_CLIENT_SECRET,
            })
        );
    }

    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        providers.push(
            GoogleProvider({
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            })
        );
    }

    return providers;
};

if (!process.env.NEXTAUTH_SECRET) {
    throw new Error("NEXTAUTH_SECRET variable is not defined in .env file.");
}

export const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    adapter: getAdapter(),
    providers: getProviders(),
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: `/#${AuthHashCode.Login}`,
        signOut: `/#${AuthHashCode.Logout}`,
        error: `/#${AuthHashCode.Error}`,
        verifyRequest: `/#${AuthHashCode.Pending}`,
        newUser: "/app",
    },
};

export default NextAuth(authOptions);
