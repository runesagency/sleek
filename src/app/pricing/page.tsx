"use client";

import { Slider, Switch } from "@/components/Forms";
import Container from "@/components/Sections/Container";
import FAQ from "@/components/Sections/FAQ";
import Footer from "@/components/Sections/Footer";
import Navigation from "@/components/Sections/Navigation";
import { Routes } from "@/lib/constants";
import { MenuAlignment, MenuAnchor, MenuDirection, MenuFormVariant, MenuVariant, useMenu } from "@/lib/menu";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { IconBuilding, IconBuildingStore, IconCheck, IconX } from "@tabler/icons";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

const Pricing = () => {
    const { openMenu } = useMenu();

    const [autoAnimateRef] = useAutoAnimate();
    const [isEnterprise, setIsEnterprise] = useState(false);
    const [pricePerMember, setPricePerMember] = useState(1);
    const [quantity, setQuantity] = useState(1);

    const priceOptions = useMemo(
        () => ({
            enterprise: {
                icon: IconBuilding,
                name: "Enterprise",
                description: "For companies that have 50 members or more",
                price: quantity * 3,
                min: 50,
                max: 300,
                step: 300 / 12,
            },
            smallTeam: {
                icon: IconBuildingStore,
                name: "Small Team",
                description: "A package dedicated to small teams with under 50 members.",
                price: quantity * pricePerMember,
                min: 1,
                max: 49,
                step: 1,
            },
        }),
        [pricePerMember, quantity]
    );

    const { price, step, max, min, icon: Icon, name, description } = useMemo(() => (isEnterprise ? priceOptions.enterprise : priceOptions.smallTeam), [isEnterprise, priceOptions]);

    const onPackageTypeChange = useCallback(
        (isEnterprise: boolean) => {
            setIsEnterprise(isEnterprise);

            const { max: newMax, min: newMin } = isEnterprise ? priceOptions.enterprise : priceOptions.smallTeam;

            if (quantity > newMax) {
                setQuantity(newMax);
            } else if (quantity < newMin) {
                setQuantity(newMin);
            }
        },
        [priceOptions.enterprise, priceOptions.smallTeam, quantity]
    );

    const onQuantityChange = useCallback((quantity: number) => {
        setQuantity(quantity);
    }, []);

    const onPricingMenu = useCallback(
        (e: React.MouseEvent) => {
            openMenu(e, {
                type: MenuVariant.Forms,
                alignment: MenuAlignment.Center,
                anchor: MenuAnchor.Element,
                direction: MenuDirection.Bottom,
                title: "Name your price",
                submitButtonLabel: "Save",
                lists: [
                    {
                        id: "price-per-member",
                        type: MenuFormVariant.Input,
                        label: "Price Per Member",
                        props: {
                            type: "number",
                        },
                    },
                ],
                onSubmit(values: { "price-per-member": string }) {
                    const price = parseInt(values["price-per-member"]);

                    if (price) {
                        setPricePerMember(price);
                    }
                },
            });
        },
        [openMenu]
    );

    return (
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
                        <Switch onChange={onPackageTypeChange} />
                        <p className="ts-2xl">Enterprise</p>
                    </div>

                    <p ref={autoAnimateRef} className="ts-base lg:w-4/5">
                        {isEnterprise ? (
                            "For companies with more than 50 users, you will be given a package for the number of members that can join."
                        ) : (
                            <>
                                For teams with under 50 members, you will be charged for each member that joins.&nbsp;
                                <span className="font-bold underline">You also name a fair price for each member that joins your team.</span>
                            </>
                        )}
                    </p>
                </section>
            </aside>

            {/* Package */}
            <aside className="w-full xl:max-w-xl">
                <div className="sticky top-8 flex h-max w-full flex-col justify-center gap-8 rounded-3xl bg-dark-700 py-8 px-10">
                    <section className="flex flex-col gap-3">
                        <div ref={autoAnimateRef} className="flex items-center gap-8">
                            <Icon size={48} className="shrink-0" />
                            <h4 className="heading-4 flex-1">{name}</h4>
                        </div>

                        <p className="ts-xl">{description}</p>
                    </section>

                    <section className="flex flex-col gap-2">
                        <Slider min={min} max={max} step={step} value={quantity} onChange={onQuantityChange} />

                        <div className="ts-sm flex items-center justify-between">
                            <span>{min}</span>
                            <span>{max}</span>
                        </div>
                    </section>

                    <section className="flex flex-col">
                        <p className="ts-base">Get full access for {quantity} team members at just:</p>

                        <div className="flex flex-wrap items-baseline gap-1">
                            <h3 className="heading-2 w-max">USD$ {price}</h3>
                            <span className="ts-base w-max">/ Month</span>
                        </div>

                        {isEnterprise ? (
                            <span className="ts-sm">
                                Need more than {max} members?&nbsp;
                                <Link href={Routes.Contact} className="underline">
                                    Contact Us
                                </Link>
                            </span>
                        ) : (
                            <span className="ts-sm">
                                *Assuming the price of 1 member is <b>${pricePerMember}</b>.&nbsp;
                                <button className="cursor-pointer underline duration-200 hover:opacity-50" onClick={onPricingMenu}>
                                    Name a Fair Price
                                </button>
                            </span>
                        )}
                    </section>
                </div>
            </aside>
        </Container>
    );
};

const Comparison = () => {
    type ComparisonData = {
        feature: string;
        other: boolean | string;
        own: boolean | string;
    };

    const comparisonData: ComparisonData[] = [
        {
            feature: "Starting Price",
            other: "$3/user/month",
            own: "$1/user/month",
        },
        {
            feature: "Folder",
            other: false,
            own: true,
        },
        {
            feature: "Kanban View",
            other: false,
            own: true,
        },
        {
            feature: "Calendar View",
            other: false,
            own: true,
        },
    ];

    return (
        <div className="flex flex-col">
            <div className="grid grid-cols-3 border border-transparent border-b-dark-600 px-8 py-5 lg:grid-cols-4">
                <h3 className="ts-2xl shrink-0 lg:col-span-2">Feature</h3>
                <h3 className="ts-2xl text-center">Other Products</h3>
                <img src="/assets/images/logo.svg" alt="Logo" className="mx-auto h-8" />
            </div>

            {comparisonData?.map(({ feature, other, own }, index) => (
                <div key={index} className="grid grid-cols-3 px-8 py-5 lg:grid-cols-4">
                    <p className="ts-base shrink-0 lg:col-span-2">{feature}</p>

                    {[other, own].map((value, index) => {
                        if (typeof value === "boolean") {
                            return (
                                <div key={index} className="mx-auto">
                                    {value ? (
                                        <IconCheck className="stroke-dark-50" /> //
                                    ) : (
                                        <IconX className="stroke-dark-400" />
                                    )}
                                </div>
                            );
                        } else {
                            return (
                                <p key={index} className="ts-base text-center">
                                    {value}
                                </p>
                            );
                        }
                    })}
                </div>
            ))}
        </div>
    );
};

export default function PricingPage() {
    return (
        <main className="box-border flex h-full w-full flex-col bg-dark-800 text-dark-50">
            <Navigation />

            {/* Hero */}
            <Pricing />

            {/* Comparison */}
            <Container className={["hidden bg-dark-900 md:block", "flex flex-col gap-14 py-20"]}>
                <h3 className="heading-3 text-center">Others vs Sleek: How Do They Compare?</h3>
                <Comparison />
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
