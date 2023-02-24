import type { Prisma, User, UserAccount, UserSession } from "@prisma/client";
import type { NextAuthOptions } from "next-auth";
import type { AdapterAccount, Adapter, AdapterUser, AdapterSession } from "next-auth/adapters";
import type { Provider } from "next-auth/providers";

import { AuthHashCode } from "@/components/Sections/Navigation";
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
            providerAccountId: account.providerAccountId,
            userId: account.userId,
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
            sessionToken: session.sessionToken,
            userId: session.userId,
            expires: session.expiredAt,
        };

        return parsedSession;
    };

    return {
        createUser: async (data) => {
            const defaultRole = await prisma.role.findFirst({
                where: {
                    name: "User",
                    level: "USER",
                },
            });

            if (!defaultRole) {
                throw new Error("No default role found for new users.");
            }

            const newUser = await prisma.user.create({
                data: {
                    email: data.email,
                    name: data.name ?? "Guest",
                    verifiedAt: data.emailVerified,
                    roleId: defaultRole.id,
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

        getUserByAccount: async ({ provider, providerAccountId }) => {
            const account = await prisma.userAccount.findUnique({
                where: {
                    provider_providerAccountId: {
                        provider,
                        providerAccountId: providerAccountId,
                    },
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
                    email: email,
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

        linkAccount: async ({ providerAccountId, userId, id_token, expires_at, ...data }) => {
            const linkedAccount = await prisma.userAccount.create({
                data: {
                    ...data,
                    tokenId: id_token,
                    userId: userId,
                    providerAccountId: providerAccountId,
                    expiredAt: expires_at,
                },
            });

            if (linkedAccount) {
                return parseUserAccount(linkedAccount);
            }

            return null;
        },

        unlinkAccount: async ({ provider, providerAccountId }) => {
            const unlinkedAccount = await prisma.userAccount.delete({
                where: {
                    provider_providerAccountId: {
                        provider,
                        providerAccountId: providerAccountId,
                    },
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
                    sessionToken: sessionToken,
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
                    sessionToken: sessionToken,
                    userId: userId,
                },
            });

            return parseUserSession(newSession);
        },

        updateSession: async ({ sessionToken, expires, userId }) => {
            const updatedSession = await prisma.userSession.update({
                where: {
                    sessionToken: sessionToken,
                },
                data: {
                    expiredAt: expires,
                    sessionToken: sessionToken,
                    userId: userId,
                },
            });

            return parseUserSession(updatedSession);
        },

        deleteSession: async (sessionToken) => {
            const deletedSession = await prisma.userSession.delete({
                where: {
                    sessionToken: sessionToken,
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

        useVerificationToken: async (identifierToken) => {
            try {
                const verificationToken = await prisma.verificationToken.delete({
                    where: {
                        identifier_token: identifierToken,
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

    if (process.env.EMAILSMTPHOST && process.env.EMAILSMTPPORT && process.env.EMAILSMTPUSER && process.env.EMAILSMTPPASSWORD && process.env.EMAILFROM) {
        providers.push(
            EmailProvider({
                server: {
                    host: process.env.EMAILSMTPHOST,
                    port: process.env.EMAILSMTPPORT,
                    auth: {
                        user: process.env.EMAILSMTPUSER,
                        pass: process.env.EMAILSMTPPASSWORD,
                    },
                },
                from: process.env.EMAILFROM,
            })
        );
    }

    if (process.env.DISCORDCLIENTID && process.env.DISCORDCLIENTSECRET) {
        providers.push(
            DiscordProvider({
                clientId: process.env.DISCORDCLIENTID,
                clientSecret: process.env.DISCORDCLIENTSECRET,
            })
        );
    }

    if (process.env.GOOGLECLIENTID && process.env.GOOGLECLIENTSECRET) {
        providers.push(
            GoogleProvider({
                clientId: process.env.GOOGLECLIENTID,
                clientSecret: process.env.GOOGLECLIENTSECRET,
            })
        );
    }

    return providers;
};

if (!process.env.NEXTAUTHSECRET) {
    throw new Error("NEXTAUTHSECRET variable is not defined in .env file.");
}

export const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTHSECRET,
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
