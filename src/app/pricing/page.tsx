"use client";

import { Switch } from "@/components/Forms";
import Container from "@/components/Sections/Container";
import FAQ from "@/components/Sections/FAQ";
import Footer from "@/components/Sections/Footer";
import Navigation from "@/components/Sections/Navigation";

import { IconBuildingStore, IconCheck, IconX } from "@tabler/icons";
import clsx from "clsx";
import { useState } from "react";

const ComparisonTable = () => {
    const comparisonDummyData = [
        {
            featName: "Starting Price",
            othrProduct: "$500/year for 10 People",
            ourProduct: "$500/year for 10 People",
        },
        {
            featName: "Folder",
            othrProduct: false,
            ourProduct: true,
        },
        {
            featName: "Move Items Between Folders",
            othrProduct: false,
            ourProduct: true,
        },
        {
            featName: "Mover Folders Between Boards",
            othrProduct: false,
            ourProduct: true,
        },
        {
            featName: "Checkbox",
            othrProduct: true,
            ourProduct: true,
        },
        {
            featName: "Kanban View",
            othrProduct: false,
            ourProduct: true,
        },
        {
            featName: "Kanban View",
            othrProduct: false,
            ourProduct: true,
        },
        {
            featName: "Calendar View",
            othrProduct: false,
            ourProduct: true,
        },
    ];

    return (
        <div className="flex flex-col gap-0">
            <div className="flex justify-between border-b border-dark-600 px-8 py-5">
                <h3 className="shrink-0 basis-2/6 text-2xl">Feature</h3>
                <h3 className="text-2xl">Other Products</h3>
                <img src="/logoipsum-286.svg" className="text-dark-50" alt="logo_ipsum" width="174" height="32" />
            </div>

            {comparisonDummyData?.map((val, idx) => (
                <div key={idx} className="flex justify-between px-8 py-5">
                    <div className="shrink-0 basis-2/6">
                        <h1 className="text-base">{val.featName}</h1>
                    </div>
                    {typeof val.othrProduct === "boolean" ? (
                        <>
                            <div className="w-44 min-w-max">{val.othrProduct ? <IconCheck className="mx-auto" /> : <IconX className="mx-auto opacity-50" />}</div>
                            <div className="w-44 min-w-max">{val.ourProduct ? <IconCheck className="mx-auto" /> : <IconX className="mx-auto opacity-50" />}</div>
                        </>
                    ) : (
                        <>
                            <h1 className="text-base">{val.othrProduct}</h1>
                            <h1 className="text-base">{val.ourProduct}</h1>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
};

export default function PricingPage() {
    const [isEnterprise, setIsEnterprise] = useState<boolean>(false);

    return (
        <main className="box-border flex h-full w-full flex-col bg-dark-800 text-dark-50">
            <Navigation />

            {/* Hero */}
            <Container className={["bg-dark-800", "flex flex-col gap-10 py-20 lg:flex-row lg:gap-4 xl:gap-20"]}>
                {/* Description */}
                <aside className="flex flex-col gap-14">
                    {/* Content */}
                    <section className="flex flex-col gap-7">
                        <h1 className="heading-2">One Price for All Features, for Small Team or Enterprises.</h1>
                        <h2 className="ts-xl lg:w-5/6">No more different plans with different features, at Sleek, you only need to subscribe to one plan, and get full access to our app.</h2>
                    </section>

                    {/* Company Type */}
                    <section className="flex flex-col gap-5">
                        <div className="flex gap-5">
                            <p className="ts-2xl">Small Team</p>

                            <Switch />

                            <p className="ts-2xl">Enterprise</p>
                        </div>

                        <p className="ts-base lg:w-4/5">
                            For teams with under 50 members, you will be charged for each member that joins. Whereas for companies with more than 50 users, you will be given a package for the number
                            of members that can join.
                        </p>
                    </section>
                </aside>

                {/* Package */}
                <aside className="w-full xl:max-w-xl">
                    <div className="sticky top-8 flex h-max w-full flex-col justify-center gap-8 rounded-3xl bg-dark-700 py-8 px-10">
                        <section className="flex flex-col gap-3">
                            <div className="flex items-center gap-8">
                                <IconBuildingStore size={48} width={undefined} className="shrink-0" />
                                <h2 className="heading-4">Small Team</h2>
                            </div>

                            <h1 className="ts-xl">A package dedicated to small teams with under 50 members.</h1>
                        </section>

                        <section className="flex flex-col gap-2">
                            <div className="flex h-2 w-full items-center rounded-lg bg-dark-50">
                                <div className="h-8 w-8 translate-x-2/3 cursor-pointer rounded-full bg-dark-50" />
                            </div>

                            <div className="ts-sm flex items-center justify-between">
                                <span>1</span>
                                <span>50</span>
                            </div>
                        </section>

                        <section className="flex flex-col">
                            <p className="ts-base">Get full access for 15 team members at just:</p>

                            <div className="flex flex-wrap items-baseline gap-1">
                                <h3 className="heading-2 w-max">USD$ 49.99</h3>
                                <span className="ts-base w-max">/ Month</span>
                            </div>
                        </section>
                    </div>
                </aside>
            </Container>

            {/* Comparison */}
            <Container className={["bg-dark-900", "flex flex-col gap-14 py-20"]}>
                <h3 className="heading-3 text-center">Ipsum vs Wokwow: How Do They Compare?</h3>

                <ComparisonTable />
            </Container>

            <FAQ
                className={["bg-dark-900"]}
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

            <Footer />
        </main>
    );
}
