import FAQ from "@/components/Sections/FAQ";
import Footer from "@/components/Sections/Footer";
import Navbar from "@/components/Sections/Navbar";
import Comparison from "@/pages/pricing/comparison";

import { IconBuildingStore } from "@tabler/icons";
import { useState } from "react";

export default function PricingPage() {
    const [isEnterprise, setIsEnterprise] = useState<boolean>(false);
    return (
        <div>
            <div>
                <Navbar />
            </div>
            <div>
                <div className="flex gap-20 bg-dark-800 px-48 py-20 text-dark-50">
                    <div className="flex shrink-0 basis-3/5 flex-col gap-14">
                        <div className="flex flex-col gap-7">
                            <h1 className="text-5xl font-semibold">One Price for All Features, for Small Team or Enterprises.</h1>
                            <h1 className="w-3/4 text-xl">No more different plans with different features, at Sleek, you only need to subscribe to one plan, and get full access to our app.</h1>
                        </div>
                        <div className="flex flex-col gap-5">
                            <div className="flex gap-5">
                                <p className="flex flex-col justify-center">Small Team</p>
                                <div
                                    onClick={() => setIsEnterprise(!isEnterprise)}
                                    className={`h-8 w-20 cursor-pointer rounded-2xl border-2 bg-dark-500 ${!isEnterprise ? "bg-dark-400" : "bg-dark-500"}`}
                                >
                                    <div className={`mt-1 flex h-5 w-5 flex-col justify-center rounded-full bg-dark-50 duration-150 ease-in-out ${!isEnterprise ? "ml-1" : "ml-12"}`} />
                                </div>
                                <p className="flex flex-col justify-center">Enterprise</p>
                            </div>
                            <h1 className="w-3/4 text-base">
                                For teams with under 50 members, you will be charged for each member that joins. Whereas for companies with more than 50 users, you will be given a package for the
                                number of members that can join.
                            </h1>
                        </div>
                    </div>
                    <div className="flex flex-col justify-center gap-5 rounded-3xl bg-dark-700 px-10 py-8">
                        <div className="flex flex-col gap-3">
                            <div className="flex gap-8">
                                <IconBuildingStore size={48} className="shrink-0" />
                                <h1 className="flex flex-col justify-center text-4xl font-semibold">Small Team</h1>
                            </div>
                            <h1 className=" text-xl">A package dedicated to small teams with under 50 members.</h1>
                        </div>
                        <div>
                            <div className="h-2 w-full rounded-xl bg-dark-50">
                                <div className="relative -top-1.5 h-5 w-5 cursor-pointer rounded-full bg-dark-500" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-base">Get full access for 15 team members at just:</h1>
                            <div className="flex">
                                <h1 className="text-5xl font-semibold">
                                    USD$ 49.99 <span className="text-base">/ Month</span>
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Comparison */}
                <div className="bg-dark-900 py-20 px-48 text-dark-50">
                    <div className="flex flex-col gap-14">
                        <div>
                            <h1 className="text-center text-3xl font-semibold">Ipsum vs Wokwow: How Do They Compare?</h1>
                        </div>
                        <Comparison />
                    </div>
                </div>
                {/* FAQ */}
                <div className="bg-dark-900 py-20 px-48 text-dark-50">
                    <div className="flex flex-col gap-14">
                        <div>
                            <h1 className="text-center text-3xl font-semibold">Have Any Questions?</h1>
                        </div>
                        <FAQ />
                    </div>
                </div>
            </div>
            <div>
                <Footer />
            </div>
        </div>
    );
}
