import type { ClientSafeProvider } from "next-auth/react";

import Button from "@/components/Forms/Button";
import Input from "@/components/Forms/Input";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useClickOutside } from "@mantine/hooks";
import { IconDoorEnter, IconLogin, IconMail } from "@tabler/icons";
import clsx from "clsx";
import Link from "next/link";
import { getProviders, signIn, useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";

const SocialIcons = {
    google: () => (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M18.8 10.2083C18.8 9.55825 18.7417 8.93325 18.6333 8.33325H10V11.8833H14.9333C14.7167 13.0249 14.0667 13.9916 13.0917 14.6416V16.9499H16.0667C17.8 15.3499 18.8 12.9999 18.8 10.2083Z"
                fill="#4285F4"
            />

            <path
                d="M10 19.1667C12.475 19.1667 14.55 18.35 16.0667 16.95L13.0917 14.6417C12.275 15.1917 11.2333 15.525 10 15.525C7.61668 15.525 5.59168 13.9167 4.86668 11.75H1.81668V14.1167C3.32501 17.1083 6.41668 19.1667 10 19.1667Z"
                fill="#34A853"
            />

            <path
                d="M4.86668 11.7416C4.68334 11.1916 4.57501 10.6083 4.57501 9.99993C4.57501 9.3916 4.68334 8.80827 4.86668 8.25827V5.8916H1.81668C1.19168 7.12493 0.833344 8.5166 0.833344 9.99993C0.833344 11.4833 1.19168 12.8749 1.81668 14.1083L4.19168 12.2583L4.86668 11.7416Z"
                fill="#FBBC05"
            />

            <path
                d="M10 4.48325C11.35 4.48325 12.55 4.94992 13.5083 5.84992L16.1333 3.22492C14.5417 1.74159 12.475 0.833252 10 0.833252C6.41668 0.833252 3.32501 2.89159 1.81668 5.89159L4.86668 8.25825C5.59168 6.09159 7.61668 4.48325 10 4.48325Z"
                fill="#EA4335"
            />
        </svg>
    ),

    github: () => (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M10 0.246582C4.47833 0.246582 0 4.72408 0 10.2466C0 14.6649 2.865 18.4132 6.83917 19.7357C7.33833 19.8282 7.5 19.5182 7.5 19.2549V17.3932C4.71833 17.9982 4.13917 16.2132 4.13917 16.2132C3.68417 15.0574 3.02833 14.7499 3.02833 14.7499C2.12083 14.1291 3.0975 14.1424 3.0975 14.1424C4.10167 14.2124 4.63 15.1732 4.63 15.1732C5.52167 16.7016 6.96917 16.2599 7.54 16.0041C7.62917 15.3582 7.88833 14.9166 8.175 14.6674C5.95417 14.4132 3.61917 13.5557 3.61917 9.72491C3.61917 8.63241 4.01 7.74075 4.64917 7.04075C4.54583 6.78825 4.20333 5.77075 4.74667 4.39408C4.74667 4.39408 5.58667 4.12575 7.4975 5.41908C8.295 5.19742 9.15 5.08658 10 5.08242C10.85 5.08658 11.7058 5.19742 12.505 5.41908C14.4142 4.12575 15.2525 4.39408 15.2525 4.39408C15.7967 5.77158 15.4542 6.78908 15.3508 7.04075C15.9925 7.74075 16.38 8.63325 16.38 9.72491C16.38 13.5657 14.0408 14.4116 11.8142 14.6591C12.1725 14.9691 12.5 15.5774 12.5 16.5107V19.2549C12.5 19.5207 12.66 19.8332 13.1675 19.7349C17.1383 18.4107 20 14.6632 20 10.2466C20 4.72408 15.5225 0.246582 10 0.246582Z"
                fill="white"
            />
        </svg>
    ),
    discord: () => (
        <svg width="26" height="20" viewBox="0 0 26 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M22.0245 1.675C20.3414 0.8925 18.5419 0.323815 16.6605 0C16.4294 0.415119 16.1595 0.973462 15.9734 1.41762C13.9734 1.11874 11.9918 1.11874 10.0286 1.41762C9.84251 0.973462 9.56643 0.415119 9.33331 0C7.44987 0.323815 5.64824 0.894589 3.96521 1.67914C0.57053 6.77669 -0.349712 11.7476 0.11041 16.648C2.36194 18.3188 4.54394 19.3338 6.68912 19.9979C7.21878 19.2736 7.69116 18.5035 8.09811 17.692C7.32306 17.3994 6.58074 17.0382 5.87933 16.6189C6.06541 16.482 6.24743 16.3387 6.42328 16.1914C10.7014 18.1798 15.3496 18.1798 19.5766 16.1914C19.7545 16.3387 19.9365 16.482 20.1206 16.6189C19.4171 17.0403 18.6727 17.4014 17.8977 17.6941C18.3046 18.5035 18.775 19.2757 19.3067 20C21.4539 19.3358 23.638 18.3209 25.8895 16.648C26.4294 10.9672 24.9672 6.04194 22.0245 1.675ZM8.68094 13.6343C7.3967 13.6343 6.34351 12.4429 6.34351 10.9921C6.34351 9.54132 7.37421 8.34788 8.68094 8.34788C9.98771 8.34788 11.0409 9.53923 11.0184 10.9921C11.0204 12.4429 9.98771 13.6343 8.68094 13.6343ZM17.319 13.6343C16.0347 13.6343 14.9815 12.4429 14.9815 10.9921C14.9815 9.54132 16.0122 8.34788 17.319 8.34788C18.6257 8.34788 19.6789 9.53923 19.6564 10.9921C19.6564 12.4429 18.6257 13.6343 17.319 13.6343Z"
                fill="#ffffff"
            />
        </svg>
    ),
};

type AuthModalProps = {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
};

const AuthModal = ({ isOpen, setIsOpen }: AuthModalProps) => {
    type Provider = ClientSafeProvider & { icon?: () => JSX.Element };

    enum LoginState {
        Loading,
        Success,
        Error,
    }

    const [animationRef] = useAutoAnimate();
    const clickOutsideRef = useClickOutside(() => setIsOpen(false));

    const [loginProviders, setLoginProviders] = useState<Provider[]>([]);
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

    useEffect(() => {
        if (!isOpen) return;

        getProviders().then((providers) => {
            if (!providers) return;

            const list: Provider[] = [];
            const icons = SocialIcons as Record<string, () => JSX.Element>;

            Object.values(providers).map((value) => {
                if (value.id === "credentials") return;
                if (value.id === "email") return;

                list.push({
                    ...value,
                    icon: icons[value.id],
                });
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
                            {loginProviders.map(({ name, id, icon: Icon }) => {
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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data: session } = useSession();

    const onLoginClick = useCallback(() => {
        setIsModalOpen(true);
    }, []);

    useEffect(() => {
        if (session) {
            setIsModalOpen(false);
        }
    }, [session]);

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
                        <Link href="/app">
                            <Button.Large icon={IconDoorEnter}>Go to Application</Button.Large>
                        </Link>
                    ) : (
                        <Button.Large icon={IconLogin} onClick={onLoginClick}>
                            Log In / Sign Up
                        </Button.Large>
                    )}
                </div>
            </main>

            <AuthModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} />
        </nav>
    );
}
