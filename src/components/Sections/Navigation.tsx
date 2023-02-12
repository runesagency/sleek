import type { ClientSafeProvider } from "next-auth/react";

import Button from "@/components/Forms/Button";
import Input from "@/components/Forms/Input";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useClickOutside, useHash } from "@mantine/hooks";
import { IconDoorEnter, IconLogin, IconMail } from "@tabler/icons";
import clsx from "clsx";
import Link from "next/link";
import { signOut, getProviders, signIn, useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";

export enum AuthHashCode {
    Login = "login",
    Logout = "logout",
    Error = "login-failed",
    Pending = "login-pending",
}

type LoginModalProps = {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
};

const LoginModal = ({ isOpen, setIsOpen }: LoginModalProps) => {
    enum LoginState {
        Loading,
        Success,
        Error,
    }

    const { data: session } = useSession();
    const [, setHash] = useHash();

    const [animationRef] = useAutoAnimate();
    const clickOutsideRef = useClickOutside(() => {
        setIsOpen(false);
        setHash("");
    });

    const [loginProviders, setLoginProviders] = useState<ClientSafeProvider[]>([]);
    const [loginState, setLoginState] = useState<LoginState | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>("");

    const inputRef = useRef<HTMLInputElement>(null);
    const isDisabled = loginState === LoginState.Loading;

    const onLogin = useCallback(async () => {
        const email = inputRef?.current?.value.trim();
        if (!email) return;

        const testEmail = email.match(/^((?!\.)[\w-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/gim);

        if (!testEmail) {
            setLoginState(LoginState.Error);
            setErrorMessage("Please enter a valid email address");
            return;
        }

        setLoginState(LoginState.Loading);

        const res = await signIn("email", {
            email,
            redirect: false,
        });

        if (!res || !res.ok) {
            setLoginState(LoginState.Error);
            setErrorMessage("An error occurred, please try again later");
            return;
        }

        if (res.error) {
            setLoginState(LoginState.Error);
            setErrorMessage(res.error);
            return;
        }

        setLoginState(LoginState.Success);
    }, [LoginState.Error, LoginState.Loading, LoginState.Success]);

    // Close modal when user is logged in (only if modal is open)
    useEffect(() => {
        if (isOpen && session) {
            setIsOpen(false);
            setHash("");
        }
    }, [session, isOpen, setHash, setIsOpen]);

    // Fetch all available login providers
    useEffect(() => {
        if (!isOpen) return;

        getProviders().then((providers) => {
            if (!providers) return;

            const list: ClientSafeProvider[] = [];

            Object.values(providers).map((value) => {
                if (value.id === "credentials") return;
                if (value.id === "email") return;

                list.push(value);
            });

            setLoginProviders(list);
        });
    }, [isOpen]);

    return (
        <section ref={animationRef} className={clsx("inset-0 z-50 flex h-full w-full items-center justify-center duration-200", isOpen ? "fixed bg-dark-800/70" : "relative bg-transparent")}>
            {isOpen && (
                <main ref={clickOutsideRef} className="flex max-w-xl flex-col gap-10 rounded-lg border border-dark-600 bg-dark-700 px-10 py-20 text-white">
                    <div className="flex flex-col gap-5 text-center">
                        <h2 className="heading-3">Log In / Sign Up</h2>
                        <p className="ts-base">Enter using your email or your social account, we will automatically create your account in your first login.</p>
                    </div>

                    {loginProviders.length > 0 && (
                        <div className="flex flex-col gap-5 text-center">
                            {loginProviders.map(({ name, id }) => {
                                const Icon = () => <img src={`https://authjs.dev/img/providers/${id}.svg`} alt={name} loading="lazy" className="mr-2 h-5" />;

                                return (
                                    <Button.Large key={id} icon={Icon} onClick={() => signIn(id)} disabled={isDisabled}>
                                        Login with {name}
                                    </Button.Large>
                                );
                            })}
                        </div>
                    )}

                    <div className="flex flex-col gap-5 text-center">
                        <Input.Large
                            name="email"
                            type="email"
                            placeholder="Email"
                            innerRef={inputRef} //
                            icon={IconMail}
                            onSave={onLogin}
                            saveOnEnter
                            disabled={isDisabled}
                        />

                        <Button.Large icon={IconLogin} onClick={onLogin} disabled={isDisabled}>
                            Log In / Sign In
                        </Button.Large>
                    </div>

                    {loginState !== null && loginState !== LoginState.Loading && (
                        <div
                            className={clsx(
                                "ts-sm rounded-lg p-5 text-dark-50", //
                                loginState === LoginState.Success && "bg-green-600",
                                loginState === LoginState.Error && "bg-red-600"
                            )}
                        >
                            {loginState === LoginState.Success && "We have send a confirmation link to your email, please check your inbox or spam folder."}
                            {loginState === LoginState.Error && errorMessage}
                        </div>
                    )}
                </main>
            )}
        </section>
    );
};

type NavigationProps = {
    className?: string;
};

export default function Navigation({ className }: NavigationProps) {
    const [hash] = useHash();
    const { data: session } = useSession();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const onLogin = useCallback(() => {
        if (!session) setIsModalOpen(true);
    }, [session]);

    const onLogout = useCallback(() => {
        if (session) signOut();
    }, [session]);

    useEffect(() => {
        const parsedHash = hash?.split("?")[0].split("#")[1];

        switch (parsedHash) {
            case AuthHashCode.Login:
                return onLogin();

            case AuthHashCode.Logout:
                return onLogout();

            case AuthHashCode.Error:
                break;

            case AuthHashCode.Pending:
                break;
        }
    }, [hash, onLogin, onLogout]);

    return (
        <nav className={clsx("w-full bg-dark-800 text-dark-50", className)}>
            <main className="ts-base mx-auto flex max-w-screen-3xl justify-between px-48 py-8">
                <div className="flex items-center gap-12">
                    <img src="/logoipsum-286.svg" className="text-white" alt="logo_ipsum" width="174" height="32" />

                    <Link href="/pricing">Pricing</Link>

                    <Link href="/contact">Contact</Link>
                </div>

                <div className="flex items-center gap-5">
                    {session ? (
                        <>
                            <p onClick={onLogout} className="cursor-pointer">
                                Log Out
                            </p>

                            <Link href="/app">
                                <Button.Large icon={IconDoorEnter}>Go to Application</Button.Large>
                            </Link>
                        </>
                    ) : (
                        <Button.Large icon={IconLogin} onClick={onLogin}>
                            Log In / Sign Up
                        </Button.Large>
                    )}
                </div>
            </main>

            <LoginModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} />
        </nav>
    );
}
