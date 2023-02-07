import Button from "@/components/Forms/Button";
import Input from "@/components/Forms/Input";

import { IconBrandDiscord, IconBrandTwitter, IconMail } from "@tabler/icons";
import Link from "next/link";

type FooterSectionProps = {
    title: string;
    links: {
        title: string;
        href: string;
    }[];
};

const FooterSection = ({ title, links }: FooterSectionProps) => {
    return (
        <section className="flex w-32 shrink-0 flex-col gap-4">
            <h4 className="ts-xl">{title}</h4>

            {links.map(({ title, href }, index) => (
                <Link key={index} href={href} className="ts-base">
                    {title}
                </Link>
            ))}
        </section>
    );
};

export default function Footer() {
    return (
        <footer className="w-full bg-dark-700 text-dark-50">
            <main className="mx-auto flex max-w-screen-3xl justify-between px-48 py-14">
                <section className="flex w-72 shrink-0 flex-col gap-5">
                    <img src="/logoipsum-286.svg" className="h-8 w-max text-white" alt="Logo" />

                    <h4 className="ts-base">Sleek is the most flexible project management app for your team.</h4>

                    <div className="flex gap-7">
                        <IconBrandTwitter />
                        <IconBrandDiscord />
                    </div>

                    <span className="ts-sm opacity-50">© 2023 Sleek. All Rights Reserved.</span>
                </section>

                <FooterSection
                    title="Product"
                    links={[
                        { title: "Home", href: "/" },
                        { title: "Features", href: "/features" },
                        { title: "Pricing", href: "/pricing" },
                        { title: "Changelog", href: "/changelog" },
                    ]}
                />

                <FooterSection
                    title="Company"
                    links={[
                        { title: "About", href: "/about" },
                        { title: "Contact", href: "/contact" },
                    ]}
                />

                <FooterSection
                    title="Compare"
                    links={[
                        { title: "Asana", href: "/compare/asana" },
                        { title: "Trello", href: "/compare/trello" },
                        { title: "Notion", href: "/compare/notion" },
                    ]}
                />

                <section className="flex max-w-lg flex-col gap-5">
                    <h3 className="ts-xl">Join Our Newsletter</h3>
                    <p className="ts-base">Get new updates, insight, and an early promo for our product. Don’t worry we won’t spam you :)</p>

                    <div className="flex gap-4">
                        <Input.Large placeholder="Enter Your Email Here" icon={IconMail} />
                        <Button.Large fit>Subscribe</Button.Large>
                    </div>
                </section>
            </main>
        </footer>
    );
}
