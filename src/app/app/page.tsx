"use client";

import { DashboardLayoutContext } from "@/app/app/DashboardLayoutContext";
import MemberList from "@/components/DataDisplay/MemberList";
import { Button } from "@/components/Forms";
import { Routes } from "@/lib/constants";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import Link from "next/link";
import { useContext } from "react";

export default function AppUserHomePage() {
    const [autoAnimateRef] = useAutoAnimate();

    const { isLoading, data } = useContext(DashboardLayoutContext);

    return (
        <main ref={autoAnimateRef} className="flex flex-col gap-10 p-10 md:px-20">
            {isLoading
                ? [...Array(5)].map((_, index) => (
                      <section key={index} className="flex flex-col gap-5">
                          <div className="flex flex-col gap-3">
                              <div className="animate-shimmer h-8 w-40 rounded-lg bg-dark-700" />
                              <div className="animate-shimmer h-5 w-20 rounded-lg bg-dark-700" />
                          </div>

                          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                              {[...Array(3)].map((_, index) => (
                                  <div key={index} className="animate-shimmer h-40 w-full rounded-lg bg-dark-700" />
                              ))}
                          </div>
                      </section>
                  ))
                : data.map(({ id, name, description, users }, index) => (
                      <section key={index} className="flex flex-col gap-12 rounded-lg border border-dark-600 bg-dark-800 p-10">
                          <div className="flex flex-col gap-4">
                              <h2 className="ts-2xl">{name}</h2>
                              <p className="ts-sm">{description || "No Description Available"}</p>

                              <MemberList.Large users={users} min={5} />
                          </div>

                          <Link href={Routes.Organization(id)} className="w-max">
                              <Button.Large fit>See More</Button.Large>
                          </Link>
                      </section>
                  ))}
        </main>
    );
}
