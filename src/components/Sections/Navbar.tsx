import Button from "@/components/Forms/Button";

import { IconLogin } from "@tabler/icons";
import Link from "next/link";

export default function Navbar() {
    return (
        <div className="bg-dark-800">
            <div className="flex justify-between px-48 py-8 text-dark-50">
                <div className="flex gap-12">
                    <img src="/logoipsum-286.svg" className="text-white" alt="logo_ipsum" width="174" height="32" />
                    <Link className="flex flex-col justify-center" href="/pricing">
                        Pricing
                    </Link>
                    <Link className="flex flex-col justify-center" href="/contact">
                        Contact
                    </Link>
                </div>
                <div className="flex gap-5">
                    <a className="flex flex-col justify-center" href="#">
                        Log in
                    </a>
                    <div>
                        <Button.Large icon={IconLogin}>Create an Account</Button.Large>
                    </div>
                </div>
            </div>
        </div>
    );
}
