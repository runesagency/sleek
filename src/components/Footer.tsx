import Button from "@/components/Forms/Button";

import { IconBrandDiscord, IconBrandTwitter, IconMail } from "@tabler/icons";

export default function Footer() {
    return (
        <div className="flex justify-around bg-dark-700 px-48 py-14 text-dark-50">
            <div className="flex basis-2/12 flex-col gap-5">
                <img src="/logoipsum-286.svg" className="text-white" alt="logo_ipsum" width="174" height="32" />
                <h1 className="text-base">Sleek is the most flexible project management app for your team.</h1>
                <div className="flex gap-7">
                    <IconBrandTwitter />
                    <IconBrandDiscord />
                </div>
                <h1 className="text-sm opacity-50">© 2023 Sleek. All Rights Reserved.</h1>
            </div>
            <div className="flex justify-between gap-24">
                <div className="flex flex-col gap-4">
                    <h1 className="text-xl">Product</h1>
                    <h1 className="text-base">Home</h1>
                    <h1 className="text-base">Features</h1>
                    <h1 className="text-base">Pricing</h1>
                    <h1 className="text-base">Changelog</h1>
                </div>
                <div className="flex flex-col gap-4">
                    <h1 className="text-xl">Company</h1>
                    <h1 className="text-base">About</h1>
                    <h1 className="text-base">Contact</h1>
                </div>
                <div className="flex flex-col gap-4">
                    <h1 className="text-xl">Compare</h1>
                    <h1 className="text-base">Asana</h1>
                    <h1 className="text-base">Trello</h1>
                    <h1 className="text-base">Notion</h1>
                </div>
            </div>
            <div className="flex basis-2/6 flex-col gap-5">
                <h1 className="text-xl">Join Our Newsletter</h1>
                <h1 className="text-base">Get new updates, insight, and an early promo for our product. Don’t worry we won’t spam you :)</h1>
                <div className="relative flex flex-row gap-4">
                    <input className="shrink-0 basis-2/3 rounded-lg bg-dark-500 py-5 pr-5 pl-10 focus:outline-none" type="text" placeholder="Enter Your Email Here" />
                    <IconMail className="absolute top-1/3 left-2.5" />
                    <Button.Small>Subscribe</Button.Small>
                </div>
            </div>
        </div>
    );
}
