"use client";

import type { ClientSafeProvider } from "next-auth/react";
import type { TypeOptions } from "react-toastify";

import { Button, Input } from "@/components/Forms";
import Container from "@/components/Sections/Container";
import { Routes } from "@/lib/constants";

import { useClickOutside, useHash } from "@mantine/hooks";
import { IconDoorEnter, IconLogin, IconMail } from "@tabler/icons-react";
import clsx from "clsx";
import Link from "next/link";
import { signOut, getProviders, signIn, useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

export enum AuthHashCode {
    Login = "login",
    Logout = "logout",
    Error = "login-failed",
    Pending = "login-pending",
}

type LoginModalProps = {
    isOpen: boolean;
    closeModal: () => void;
};

const LoginModal = ({ isOpen, closeModal }: LoginModalProps) => {
    const { data: session } = useSession();
    const [, setHash] = useHash();

    const [loginProviders, setLoginProviders] = useState<ClientSafeProvider[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const clickOutsideRef = useClickOutside(() => {
        closeModal();
        setHash("");
    });

    const filteredLoginProviders = loginProviders.filter((provider) => provider.id !== "email" && provider.id !== "credentials");
    const isEmailLoginAvailable = loginProviders.find((provider) => provider.id === "email");

    const onLogin = useCallback(async (e: React.MouseEvent | string) => {
        if (typeof e !== "string") {
            e.preventDefault();
        }

        const email = inputRef?.current?.value.trim();
        if (!email) return;

        const testEmail = email.match(/^((?!\.)[\w-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/gim);

        if (!testEmail) {
            toast.error("Please enter a valid email address");
            return;
        }

        setIsLoading(true);

        const res = await signIn("email", {
            email,
            redirect: false,
        });

        if (!res || !res.ok) {
            toast.error("An error occurred, please try again later");
            setIsLoading(false);
            return;
        }

        if (res.error) {
            toast.error(res.error);
            setIsLoading(false);
            return;
        }

        toast.success("We have send a confirmation link to your email, please check your inbox or spam folder.");
        setIsLoading(false);
    }, []);

    // Close modal when user is logged in (only if modal is open)
    useEffect(() => {
        if (isOpen && session) {
            toast.success("You have been logged in successfully");
            closeModal();
            setHash("");
        }
    }, [session, isOpen, setHash, closeModal]);

    // Fetch all available login providers
    useEffect(() => {
        if (!isOpen) return;

        getProviders()
            .then((providers) => {
                if (!providers) return;

                const list: ClientSafeProvider[] = [];

                Object.values(providers).map((value) => {
                    list.push(value);
                });

                setLoginProviders(list);
            })
            .catch(() => {
                toast.error("An error occurred while fetching login providers, please try again later.");
            });
    }, [isOpen]);

    return (
        <section className="fixed inset-0 z-50 flex h-full w-full items-center justify-center bg-dark-800/70 duration-200">
            <main ref={clickOutsideRef} className="animate-fade-up flex max-w-xl flex-col gap-10 rounded-lg border border-dark-600 bg-dark-700 px-10 py-20 text-dark-50">
                <div className="flex flex-col gap-5 text-center">
                    <h2 className="heading-3">Log In / Sign Up</h2>
                    <p className="ts-base">Enter using your email or your social account, we will automatically create your account in your first login.</p>
                </div>

                {filteredLoginProviders.length > 0 && (
                    <div className="flex flex-col gap-5 text-center">
                        {filteredLoginProviders.map(({ name, id }) => {
                            const Icon = () => <img src={`https://authjs.dev/img/providers/${id}.svg`} alt={name} loading="lazy" className="mr-2 h-5" />;

                            return (
                                <Button.Large key={id} icon={Icon} onClick={() => signIn(id)} disabled={isLoading}>
                                    Login with {name}
                                </Button.Large>
                            );
                        })}
                    </div>
                )}

                {isEmailLoginAvailable && (
                    <div className="flex flex-col gap-5 text-center">
                        <Input.Large
                            name="email"
                            type="email"
                            placeholder="Email"
                            innerRef={inputRef} //
                            icon={IconMail}
                            onSave={onLogin}
                            saveOnEnter
                            disabled={isLoading}
                        />

                        <Button.Large icon={IconLogin} onClick={onLogin} disabled={isLoading}>
                            Log In / Sign In
                        </Button.Large>
                    </div>
                )}
            </main>
        </section>
    );
};

type NavigationProps = {
    className?: string;
};

const Navigation = ({ className }: NavigationProps) => {
    const [hash, setHash] = useHash();
    const { data: session } = useSession();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const onLogin = useCallback(() => {
        if (!session) setIsModalOpen(true);
    }, [session]);

    const onLogout = useCallback(() => {
        if (session) {
            signOut({
                redirect: false,
            });

            toast.success("You have been logged out successfully");
        }
    }, [session]);

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    useEffect(() => {
        const parsedHash = hash?.split("?")[0].split("#")[1];
        const params = hash?.split("?")[1]?.split("&");
        const errorCode = params?.find((param) => param.startsWith("error="))?.split("=")[1];

        const notify = (id: string, message: string, type: TypeOptions) => {
            toast.dismiss(id);

            setTimeout(() => {
                toast(message, {
                    toastId: id,
                    type,
                });
            }, 50);
        };

        const notifyErrorIfExist = (errorMessages: Record<string, string>) => {
            if (errorCode) {
                const errorMessage = errorMessages[errorCode.toLowerCase()] || errorMessages.default;
                notify(errorCode, errorMessage, "error");
            }
        };

        switch (parsedHash) {
            case AuthHashCode.Login: {
                const errorMessages = {
                    default: "Unable to sign in, please try again later.",
                    signin: "Try signing in with a different account.",
                    oauthsignin: "Try signing in with a different account.",
                    oauthcallback: "Try signing in with a different account.",
                    oauthcreateaccount: "Try signing in with a different account.",
                    emailcreateaccount: "Try signing in with a different account.",
                    callback: "Try signing in with a different account.",
                    oauthaccountnotlinked: "To confirm your identity, sign in with the same account you used originally.",
                    emailsignin: "The e-mail could not be sent.",
                    credentialssignin: "Sign in failed. Check the details you provided are correct.",
                    sessionrequired: "Please sign in to access this page.",
                };

                notifyErrorIfExist(errorMessages);
                onLogin();

                break;
            }

            case AuthHashCode.Logout: {
                onLogout();
                break;
            }

            case AuthHashCode.Error: {
                const errorMessages = {
                    default: "An error occurred, please try again later.",
                    accessdenied: "You do not have permission to sign in.",
                    verification: "It may have been used already or it may have expired.",
                    configuration: "There is a problem with the server configuration. Please contact the administrator.",
                };

                notifyErrorIfExist(errorMessages);
                setHash("");

                break;
            }

            case AuthHashCode.Pending: {
                notify(AuthHashCode.Pending, "A sign in link has been sent to your email address. Please check your email.", "success");
                setHash("");

                break;
            }
        }
    }, [hash, setHash, onLogin, onLogout]);

    return (
        <Container as="nav" className={[clsx("relative z-50", className), "ts-base flex justify-between py-8"]}>
            <div className="flex items-center gap-12">
                <Link href={Routes.Home}>
                    <img src="/assets/images/logo.svg" alt="Logo" className="h-8" />
                </Link>

                <Link href={Routes.Pricing} className="hidden md:block">
                    Pricing
                </Link>

                <Link href={Routes.Contact} className="hidden md:block">
                    Contact
                </Link>
            </div>

            <div className="hidden items-center gap-5 md:flex">
                {session ? (
                    <>
                        <p onClick={onLogout} className="cursor-pointer">
                            Log Out
                        </p>

                        <Link href={Routes.App}>
                            <Button.Large icon={IconDoorEnter}>Go to Application</Button.Large>
                        </Link>
                    </>
                ) : (
                    <Button.Large icon={IconLogin} onClick={onLogin}>
                        Log In / Sign Up
                    </Button.Large>
                )}
            </div>

            {isModalOpen && <LoginModal isOpen={isModalOpen} closeModal={closeModal} />}
        </Container>
    );
};

export default Navigation;
