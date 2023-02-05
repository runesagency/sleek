import Footer from "@/components/Sections/Footer";
import Button from "@/components/Forms/Button";
import Input from "@/components/Forms/Input";
import Navbar from "@/components/Navbar";
import FAQ from "@/components/Sections/FAQ";

import { IconBuildingCommunity, IconMail, IconPhone } from "@tabler/icons";

export default function PricingPage() {
    return (
        <div>
            <div>
                <Navbar />
            </div>
            <div>
                <div className="flex gap-12 bg-dark-900 py-20 px-48 text-dark-50">
                    <div className="flex shrink-0 basis-3/5 flex-col gap-10">
                        <h1 className="text-4xl">Contact Us</h1>
                        <h1 className="text-xl">Have any inquiry about our product, or wanted to request custom enterprise package? Let’s discuss with us!</h1>
                        <div className="flex flex-col gap-5">
                            <div className="flex gap-5">
                                <div className="flex w-full flex-col gap-4">
                                    <h1 className="text-xl">Your First Name</h1>
                                    <input className="rounded-lg bg-dark-500 p-5 focus:outline-none" type="text" placeholder="Enter your first name here ..." />
                                </div>
                                <div className="flex w-full flex-col gap-4">
                                    <h1 className="text-xl">Your Last Name</h1>
                                    <input className="rounded-lg bg-dark-500 p-5 focus:outline-none" type="text" placeholder="Enter your last name here ..." />
                                </div>
                            </div>
                            <div className="flex flex-col gap-4">
                                <h1 className="text-xl">Email</h1>
                                <input className="shrink-0 rounded-lg bg-dark-500 p-5 focus:outline-none" type="text" placeholder="Enter your email here ..." />
                            </div>
                            <div className="flex flex-col gap-4">
                                <h1 className="text-xl">Do you have anything to say?</h1>
                                <Input placeholder="Your message ..." />
                            </div>
                            <div className="flex flex-col gap-4">
                                <Button.Large>
                                    <h1 className="px-10 py-4 text-sm font-normal">Send your message</h1>
                                </Button.Large>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-6">
                        <div className="h-96">
                            <iframe
                                width="100%"
                                height="100%"
                                id="gmap_canvas"
                                className="rounded-lg"
                                src="https://maps.google.com/maps?q=Jl. Inpres Raya No.5, RT.002/RW.004, Larangan Utara, Kec. Larangan, Kota Tangerang, Banten 15154&t=&z=10&ie=UTF8&iwloc=&output=embed"
                            />
                            <br />
                        </div>
                        <div className="flex flex-col gap-8 rounded-lg bg-dark-700 p-10">
                            <h1 className="text-2xl">Our Contact Information</h1>
                            <div className="flex flex-col gap-5">
                                <div className="flex gap-4">
                                    <IconMail />
                                    <h1 className="text-base">runes@gmail.com</h1>
                                </div>
                                <div className="flex gap-4">
                                    <IconPhone />
                                    <h1 className="text-base">(+62) 813-5446-223</h1>
                                </div>
                                <div className="flex gap-4">
                                    <IconBuildingCommunity />
                                    <h1 className="text-base">Jl.Inpres Raya No.5, RT.002/RW.004, Larangan Utara, Kec. Larangan, Kota Tangerang, Banten 15154</h1>
                                </div>
                            </div>
                        </div>
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
