import Button from "@/components/Forms/Button";
import Input from "@/components/Forms/Input";
import Container from "@/components/Sections/Container";

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
        <Container as="footer" className={["bg-dark-700 text-dark-50", "flex flex-col justify-between gap-y-12 py-14 lg:flex-row"]}>
            <section className="flex shrink-0 flex-col gap-5 lg:w-72">
                <Link href="/">
                    <img src="/assets/images/logo.svg" alt="Logo" className="h-8" />
                </Link>

                <h4 className="ts-base">Sleek is the most flexible project management app for your team.</h4>

                <div className="flex gap-7">
                    <IconBrandTwitter />
                    <IconBrandDiscord />
                </div>

                <span className="ts-sm opacity-50">© 2023 Sleek. All Rights Reserved.</span>
            </section>

            <section className="flex flex-col justify-between gap-y-12 md:flex-row">
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
            </section>

            <section className="flex flex-col gap-5 lg:max-w-md">
                <h3 className="ts-xl">Join Our Newsletter</h3>
                <p className="ts-base">Get new updates, insight, and an early promo for our product. Don’t worry we won’t spam you :)</p>

                <div className="flex flex-col gap-4 xl:flex-row">
                    <Input.Large placeholder="Enter Your Email Here" icon={IconMail} />
                    <Button.Large className="xl:w-max">Subscribe</Button.Large>
                </div>
            </section>
        </Container>
    );
}
