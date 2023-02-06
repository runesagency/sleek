import type { Prisma, users, user_accounts, user_sessions } from "@prisma/client";
import type { NextAuthOptions } from "next-auth";
import type { AdapterAccount, Adapter, AdapterUser, AdapterSession } from "next-auth/adapters";

import { prisma } from "@/lib/prisma";

import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";

const AuthAdapter = (): Adapter => {
    const parseUser = (user: users) => {
        const parsedUser: AdapterUser = {
            ...user,

            // different from the default model
            emailVerified: user.verified_at,
        };

        return parsedUser;
    };

    const parseUserAccount = (account: user_accounts) => {
        const parsedAccount: AdapterAccount = {
            ...account,

            // different from the default model
            providerAccountId: account.provider_account_id,
            userId: account.user_id,
            expires_at: account.expired_at ?? undefined,
            id_token: account.token_id ?? undefined,

            // same, just altering null to undefined
            access_token: account.access_token ?? undefined,
            refresh_token: account.refresh_token ?? undefined,
            scope: account.scope ?? undefined,
            session_state: account.session_state ?? undefined,
            token_type: account.token_type ?? undefined,
        };

        return parsedAccount;
    };

    const parseUserSession = (session: user_sessions) => {
        const parsedSession: AdapterSession = {
            ...session,

            // different from the default model
            sessionToken: session.session_token,
            userId: session.user_id,
            expires: session.expired_at,
        };

        return parsedSession;
    };

    return {
        createUser: async (data) => {
            const defaultRole = await prisma.roles.findFirst({
                where: {
                    name: "User",
                    level: "USER",
                },
            });

            const newUser = await prisma.users.create({
                data: {
                    email: data.email,
                    name: data.name ?? "Guest",
                    verified_at: data.emailVerified,
                    role_id: defaultRole?.id as string,
                },
            });

            return parseUser(newUser);
        },

        getUser: async (id) => {
            const user = await prisma.users.findUnique({
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
            const user = await prisma.users.findUnique({
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
            const account = await prisma.user_accounts.findUnique({
                where: {
                    provider_provider_account_id: {
                        provider,
                        provider_account_id: providerAccountId,
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
            const updatedUser = await prisma.users.update({
                where: {
                    id,
                },
                data: {
                    name: name ?? undefined,
                    email: email,
                    verified_at: emailVerified ?? undefined,
                },
            });

            return parseUser(updatedUser);
        },

        deleteUser: async (id) => {
            const deletedUser = await prisma.users.delete({
                where: {
                    id,
                },
            });

            return parseUser(deletedUser);
        },

        linkAccount: async ({ providerAccountId, userId, id_token, expires_at, ...data }) => {
            const linkedAccount = await prisma.user_accounts.create({
                data: {
                    ...data,
                    token_id: id_token,
                    user_id: userId,
                    provider_account_id: providerAccountId,
                    expired_at: expires_at,
                },
            });

            if (linkedAccount) {
                return parseUserAccount(linkedAccount);
            }

            return null;
        },

        unlinkAccount: async ({ provider, providerAccountId }) => {
            const unlinkedAccount = await prisma.user_accounts.delete({
                where: {
                    provider_provider_account_id: {
                        provider,
                        provider_account_id: providerAccountId,
                    },
                },
            });

            if (unlinkedAccount) {
                return parseUserAccount(unlinkedAccount);
            }

            return undefined;
        },

        getSessionAndUser: async (sessionToken) => {
            const session = await prisma.user_sessions.findUnique({
                where: {
                    session_token: sessionToken,
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
            const newSession = await prisma.user_sessions.create({
                data: {
                    expired_at: expires,
                    session_token: sessionToken,
                    user_id: userId,
                },
            });

            return parseUserSession(newSession);
        },

        updateSession: async ({ sessionToken, expires, userId }) => {
            const updatedSession = await prisma.user_sessions.update({
                where: {
                    session_token: sessionToken,
                },
                data: {
                    expired_at: expires,
                    session_token: sessionToken,
                    user_id: userId,
                },
            });

            return parseUserSession(updatedSession);
        },

        deleteSession: async (sessionToken) => {
            const deletedSession = await prisma.user_sessions.delete({
                where: {
                    session_token: sessionToken,
                },
            });

            return parseUserSession(deletedSession);
        },

        createVerificationToken: async (data) => {
            const newVerificationToken = await prisma.verification_tokens.create({
                data,
            });

            return newVerificationToken;
        },

        useVerificationToken: async (identifier_token) => {
            try {
                const verificationToken = await prisma.verification_tokens.delete({
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

export const authOptions: NextAuthOptions = {
    adapter: AuthAdapter(),
    secret: process.env.NEXTAUTH_SECRET,
    theme: {
        colorScheme: "dark",
    },
    providers: [
        EmailProvider({
            server: process.env.EMAIL_SERVER,
            from: process.env.EMAIL_FROM,
        }),
    ],
};

export default NextAuth(authOptions);