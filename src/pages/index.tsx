import type { FeatureProps } from "@/components/Sections/Features";

import { Input, Button } from "@/components/Forms";
import Container from "@/components/Sections/Container";
import FAQ from "@/components/Sections/FAQ";
import Features from "@/components/Sections/Features";
import Footer from "@/components/Sections/Footer";
import Navigation from "@/components/Sections/Navigation";

import { IconDoorEnter, IconFolder, IconLayout, IconMail, IconReload, IconSettings } from "@tabler/icons";
import clsx from "clsx";

type Excellence = {
    title: string;
    description: string;
    pictureUrl: string;
};

type Testimony = {
    name: string;
    position: string;
    text: string;
};

export default function HomePage() {
    const excellences: Excellence[] = [
        {
            title: "Flexibility at its Finest",
            description: "Customize it, anything, like how you want it.",
            pictureUrl: "https://picsum.photos/id/234/500/300",
        },
        {
            title: "Use it Flawlessly",
            description: "Equipped with a lot of shortcuts to make your job easier.",
            pictureUrl: "https://picsum.photos/id/523/500/300",
        },
        {
            title: "Very Reasonable Price",
            description: "The cheapest, yet most feature-rich.",
            pictureUrl: "https://picsum.photos/id/348/500/300",
        },
    ];

    const features: FeatureProps[] = [
        {
            icon: IconLayout,
            title: "View the data in the way you want.",
            description: "Switch between views easily, you can choose whether it’s Kanban, Table, Timeline, or even Date view.",
            buttons: [
                {
                    title: "Kanban View",
                    pictureUrl: "https://picsum.photos/id/100/500/300",
                },
                {
                    title: "Table View",
                    pictureUrl: "https://picsum.photos/id/200/500/300",
                },
                {
                    title: "Timeline View",
                    pictureUrl: "https://picsum.photos/id/300/500/300",
                },
                {
                    title: "Date View",
                    pictureUrl: "https://picsum.photos/id/400/500/300",
                },
            ],
        },
        {
            icon: IconReload,
            title: "Sync your update with your coworker.",
            description: "Your coworker will see what you doing in real time, so don’t worry about that.",
            pictureUrl: "https://picsum.photos/id/234/500/300",
        },
        {
            icon: IconFolder,
            title: "Make it clean.",
            description: "Put that, put this in this folder, and so on, organize the work the way you want.",
            pictureUrl: "https://picsum.photos/id/345/500/300",
        },
        {
            icon: IconSettings,
            title: "Doesn’t like the default customization?",
            description: "Simply change or customize, you get access to every feature we provide so you can make your job easier.",
            pictureUrl: "https://picsum.photos/id/456/500/300",
        },
    ];

    const testimonies: Testimony[] = [
        {
            name: "Brendon Yate",
            position: "Pooper at Microsoft",
            text: "I’ve been writing CSS for over 20 years, and up until 2017, the way I wrote it changed frequently. It’s not a coincidence Tailwind was released the same year. It might look wrong, but spend time with it and you’ll realize semantic CSS was a 20 year mistake.",
        },
        {
            name: "Bill Angliss",
            position: "Pooper at Microsoft",
            text: "My goods arrived this morning via TNT. Exceptional service and a pleasure to do business with you. Many Thanks, Bill Hayne.",
        },
        {
            name: "Raymond Gibbs",
            position: "Pooper at Microsoft",
            text: "First class service! Prompt, efficient order taking and dispatch. Excellent price and fast delivery.",
        },
        {
            name: "Jonson Marimas",
            position: "Pooper at Microsoft",
            text: "Sweet sweet croissant sweet lemon drops gingerbread. Caramels cotton candy cake cookie candy tootsie roll.",
        },
        {
            name: "Jaimie H",
            position: "Pooper at Microsoft",
            text: "Sleek is worth much more than I paid. The best on the net! I would like to personally thank you for your outstanding product. I couldn't have asked for more than this.",
        },
        {
            name: "David Jones",
            position: "Pooper at Microsoft",
            text: "Hi, I got it today.Thanks a lot. Great service. If only everyone in Australia was as good as yours we would live in a lucky country. Sadly we have some crooks around. Have a nice day. Regards, Andrew",
        },
        {
            name: "Michael Holmes",
            position: "Pooper at Microsoft",
            text: "Fantastic, I'm totally blown away by Testimonial Generator.",
        },
        {
            name: "Rennie Brown",
            position: "Pooper at Microsoft",
            text: "Tailwind CSS is the greatest CSS framework on the planet.",
        },
        {
            name: "Frank Abdy",
            position: "Pooper at Microsoft",
            text: "Have been working with CSS for over ten years and Tailwind just makes my life easier. It is still CSS and you use flex, grid, etc. but just quicker to write and maintain.",
        },
    ];

    return (
        <main className="flex h-full w-full flex-col bg-dark-900 text-white">
            <Navigation />

            {/* Hero */}
            <Container className={["relative overflow-x-clip", "flex h-full items-stretch gap-10 py-20 md:!pr-0 lg:gap-20"]}>
                <div className="relative z-20 flex w-full shrink-0 flex-col justify-center gap-8 md:max-w-md xl:max-w-screen-sm">
                    <h1 className="heading-2 xl:heading-1">Make Collaboration Within Your Team Much Faster 🚀</h1>
                    <h2 className="ts-xl md:w-5/6 xl:text-justify">Avoid miscommunication, unnecessary conversations, and wasted time when collaborating with your team using Sleek.</h2>

                    <div className="flex flex-col gap-4 md:flex-row">
                        <Input.Large placeholder="Enter Your Email Here" icon={IconMail} />
                        <Button.Large className="md:w-max">Join Waitlist</Button.Large>
                    </div>
                </div>

                <div className="relative hidden w-full flex-1 md:block">
                    <img src="/assets/images/product-preview.png" alt="" className="relative z-20 h-full w-full rounded-l-lg border border-dark-600 object-cover object-left-top" />
                    <img src="/assets/images/radial.png" alt="" className="absolute top-0 left-0 z-10 max-w-screen-xl -translate-y-1/3 -translate-x-1/3" />
                </div>
            </Container>

            {/* Companies */}
            <Container className={[undefined, "flex flex-col items-center gap-10 pb-20"]}>
                <h4 className="ts-2xl text-center">Loved and used by these companies</h4>

                <div className="flex w-full flex-wrap items-center justify-center gap-10">
                    <img src="https://img.logoipsum.com/255.svg" alt="" className="h-10" />
                    <img src="https://img.logoipsum.com/241.svg" alt="" className="h-10" />
                    <img src="https://img.logoipsum.com/242.svg" alt="" className="h-10" />
                    <img src="https://img.logoipsum.com/238.svg" alt="" className="h-10" />
                    <img src="https://img.logoipsum.com/226.svg" alt="" className="h-10" />
                    <img src="https://img.logoipsum.com/290.svg" alt="" className="h-10" />
                </div>
            </Container>

            {/* Excellences */}
            <Container className={["relative", "grid gap-8 lg:grid-cols-3"]}>
                {excellences.map(({ title, description, pictureUrl }, index) => (
                    <article key={index} className="relative z-20 flex h-full flex-col overflow-hidden rounded-lg border border-dark-600 bg-dark-800">
                        <section className="relative h-64 bg-cover bg-center" style={{ backgroundImage: `url(${pictureUrl})` }}>
                            <div className="absolute z-20 h-full w-full bg-gradient-to-b from-transparent to-dark-800" />
                        </section>

                        <section className="flex flex-col gap-4 p-10">
                            <h4 className="heading-4">{title}</h4>
                            <p className="ts-base">{description}</p>
                        </section>
                    </article>
                ))}

                <div className="absolute bottom-0 left-0 z-10 h-1/4 w-full rounded-t-3xl bg-dark-700" />
            </Container>

            <Features data={features} />

            {/* Testimonies */}
            <Container className={["bg-dark-800", "flex flex-col items-center gap-14 py-20  3xl:px-80"]}>
                <h3 className="heading-3">What Peoples Say</h3>

                <section className="mx-auto grid w-full gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(3)].map((_, colIndex) => (
                        <div key={colIndex} className={clsx("flex flex-col gap-8", colIndex === 2 && "md:hidden lg:flex")}>
                            {testimonies
                                .filter((_, index) => index % 3 === colIndex)
                                .map(({ name, position, text }, index) => (
                                    <article key={index} className="flex flex-col gap-6 rounded-lg border border-dark-500 bg-dark-600 p-8">
                                        <section className="flex items-center gap-3">
                                            <div className="h-12 w-12 shrink-0 rounded-full bg-dark-500" />

                                            <div className="flex flex-col gap-1">
                                                <h5 className="ts-xl">{name}</h5>
                                                <p className="ts-sm opacity-60">{position}</p>
                                            </div>
                                        </section>

                                        <p className="ts-base">{text}</p>
                                    </article>
                                ))}
                        </div>
                    ))}
                </section>
            </Container>

            <FAQ
                className={["bg-dark-800"]}
                data={[
                    {
                        question: "What is Lorem Ipsum?",
                        answer: "Lorem ipsum dolor sit amet, consectetur adipisici elit…’ (complete text) is dummy text that is not meant to mean anything. It is used as a placeholder in magazine layouts, for example, in order to give an impression of the finished document. The text is intentionally unintelligible so that the viewer is not distracted by the content. The language is not real Latin and even the first word Lorem’ does not exist. It is said that the lorem ipsum text has been common among typesetters since the 16th century. (Source: Wikipedia.com).",
                    },
                    {
                        question: "Where can I subscribe to your newsletter?",
                        answer: "We often send out our newsletter with news and great offers. We will never disclose your data to third parties and you can unsubscribe from the newsletter at any time. Subscribe here to our newsletter.",
                    },
                    {
                        question: "Where can I edit my billing and shipping address?",
                        answer: "If you created a new account after or while ordering you can edit both addresses (for billing and shipping) in your customer account.",
                    },
                    {
                        question: "Can I order a free sample copy of a magazine?",
                        answer: "Unfortunately, we’re unable to offer free samples. As a retailer, we buy all magazines from their publishers at the regular trade price. However, you could contact the publisher directly.",
                    },
                    {
                        question: "Are unsold magazines sent back to the publisher?",
                        answer: "We usually sell all copies of the magazines offered in our shop. Some publishers and distributors offer the retailer the option of returning any unsold magazines. However, because our range includes magazines from countries such as Australia, the USA and the United Kingdom, sending them back would involve considerable effort in terms of logistics and would also be very expensive. We therefore choose not to return any unsold magazines. At the same time, this allows us to also offer our customers older or out-of-print magazines.",
                    },
                    {
                        question: "We would like to sell our magazine through your shop but we haven’t yet received an answer",
                        answer: "We receive up to 20 enquiries per week from publishers all around the world. Because we can’t always respond to each one right away, all enquiries are checked and answered in chronological order. It may therefore take several weeks or months from receiving your enquiry to being able to respond to it. However, we always endeavour to answer all enquiries.",
                    },
                ]}
            />

            {/* CTA */}
            <Container className={["relative bg-dark-800", "flex flex-col items-center gap-10 py-20"]}>
                <div className="relative z-20 grid overflow-hidden rounded-lg lg:grid-cols-2">
                    <section className="relative hidden bg-cover bg-center lg:block" style={{ backgroundImage: "url(https://picsum.photos/800/500)" }}>
                        <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent to-dark-500" />
                    </section>

                    <section className="flex flex-col justify-center gap-5 bg-gradient-to-r from-dark-500 to-dark-400 p-10 md:p-20">
                        <h2 className="heading-2">Great teams are those that work together</h2>
                        <p className="ts-xl">What are you waiting for? Join us and share your experience with other users!</p>

                        <Button.Large icon={IconDoorEnter} fit>
                            Join the Force
                        </Button.Large>
                    </section>
                </div>

                <div className="absolute bottom-0 left-0 z-10 h-1/2 w-full rounded-t-3xl bg-dark-700" />
            </Container>

            <Footer />
        </main>
    );
}
