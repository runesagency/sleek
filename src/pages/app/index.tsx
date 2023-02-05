import Project from "@/components/App/DataDisplay/Project";
import AppPageLayout from "@/components/App/Layout/AppPageLayout";
import MemberList from "@/components/DataDisplay/MemberList";
import Button from "@/components/Forms/Button";

import Link from "next/link";

export default function AppUserHomePage() {
    return (
        <AppPageLayout className="flex flex-col gap-10 px-20 py-10">
            <section className="flex flex-col gap-5">
                <div className="flex flex-col gap-3">
                    <h2 className="ts-2xl">Organization 001</h2>
                    <p className="ts-sm">A brief description about this organization.</p>
                    <MemberList.Large users={[]} />

                    <Link href={`/app/organization/${"organizationId"}`}>
                        <Button.Large fit>See More</Button.Large>
                    </Link>
                </div>

                <div className="grid grid-cols-3 gap-5">
                    <Project />
                    <Project />
                    <Project />
                </div>
            </section>
        </AppPageLayout>
    );
}