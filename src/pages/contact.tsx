import Button from "@/components/Forms/Button";
import Input from "@/components/Forms/Input";
import Textarea from "@/components/Forms/Textarea";
import Container from "@/components/Sections/Container";
import FAQ from "@/components/Sections/FAQ";
import Footer from "@/components/Sections/Footer";
import Navigation from "@/components/Sections/Navigation";

import { IconBuildingCommunity, IconMail, IconPhone } from "@tabler/icons";

export default function ContactPage() {
    const contactInformation = [
        {
            icon: IconMail,
            text: "team@runes.asia",
        },
        {
            icon: IconPhone,
            text: "(+62) 851-5658-2791",
        },
        {
            icon: IconBuildingCommunity,
            text: "Jl. Inpres Raya No.5, RT.002/RW.004, Larangan Utara, Kec. Larangan, Kota Tangerang, Banten 15154",
        },
    ];

    return (
        <main className="box-border flex h-full w-full flex-col bg-dark-900 text-dark-50">
            <Navigation />

            {/* Contact */}
            <Container className={["bg-dark-900", "flex flex-col gap-14 py-20 lg:flex-row"]}>
                {/* Form */}
                <div className="flex flex-1 shrink-0 flex-col gap-10">
                    {/* Head */}
                    <div className="flex flex-col gap-4">
                        <h1 className="heading-2">Contact Us</h1>
                        <h2 className="ts-xl">Have any inquiry about our product, or wanted to request custom enterprise package? Let’s discuss with us!</h2>
                    </div>

                    {/* Form */}
                    <form className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div className="flex flex-col gap-4">
                            <span className="ts-xl">Your First Name</span>
                            <Input.Large placeholder="Enter your first name here ..." />
                        </div>

                        <div className="flex flex-col gap-4">
                            <span className="ts-xl">Your Last Name</span>
                            <Input.Large placeholder="Enter your last name here ..." />
                        </div>

                        <div className="flex flex-col gap-4 md:col-span-2">
                            <span className="ts-xl">Email</span>
                            <Input.Large placeholder="Enter your email here ..." />
                        </div>

                        <div className="flex flex-col gap-4 md:col-span-2">
                            <span className="ts-xl">Do you have anything to say?</span>
                            <Textarea placeholder="Your message ..." />
                        </div>

                        <Button.Large className="md:col-span-2">Send your message</Button.Large>
                    </form>
                </div>

                {/* Information */}
                <div className="flex shrink-0 flex-col gap-6 lg:w-1/3">
                    <iframe
                        className="h-72 w-full rounded-lg border-0 bg-dark-600 lg:flex-1"
                        height={400}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.1398700467807!2d106.71664912196631!3d-6.245291681020062!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69fa750812dba1%3A0x2d06ea61f1935b3b!2sRunes%20-%20Creative%20Studio%20%26%20Agency%20From%20Indonesia!5e0!3m2!1sen!2sus!4v1675771136259!5m2!1sen!2sus"
                    />

                    <div className="flex h-max flex-col gap-8 rounded-lg border border-dark-600 bg-dark-700 p-6 xl:p-10">
                        <h3 className="ts-2xl">Our Contact Information</h3>

                        <section className="flex flex-col gap-5">
                            {contactInformation.map(({ icon: Icon, text }, index) => (
                                <div key={index} className="flex gap-4">
                                    <Icon width={20} className="shrink-0" />

                                    <p className="ts-base">{text}</p>
                                </div>
                            ))}
                        </section>
                    </div>
                </div>
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
