import Project from "@/components/App/DataDisplay/Project";
import MemberList from "@/components/DataDisplay/MemberList";
import { Button } from "@/components/Forms";

import Link from "next/link";

export default function AppUserHomePage() {
    return (
        <main className="flex flex-col gap-10 p-10 md:px-20">
            <section className="flex flex-col gap-5">
                <div className="flex flex-col gap-3">
                    <h2 className="ts-2xl">Organization 001</h2>
                    <p className="ts-sm">A brief description about this organization.</p>
                    <MemberList.Large users={[]} />

                    <Link href={`/app/organization/${"organizationId"}`} className="w-max">
                        <Button.Large fit>See More</Button.Large>
                    </Link>
                </div>

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    <Project />
                    <Project />
                    <Project />
                </div>
            </section>
        </main>
    );
}
