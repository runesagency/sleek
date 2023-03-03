"use client";

import { DashboardLayoutContext } from "@/app/app/layout";
import Project from "@/components/App/DataDisplay/Project";
import MemberList from "@/components/DataDisplay/MemberList";
import { Button } from "@/components/Forms";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import Link from "next/link";
import { useContext } from "react";

export default function AppUserHomePage() {
    const [autoAnimateRef] = useAutoAnimate();

    const {
        isLoading,
        data: { organizations },
    } = useContext(DashboardLayoutContext);

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
                : organizations.map(({ id, name, description, users, projects }, index) => {
                      const shadowProjectCount = Math.max(0, 3 - projects.length);

                      return (
                          <section key={index} className="flex flex-col gap-5">
                              <div className="flex flex-col gap-3">
                                  <h2 className="ts-2xl">{name}</h2>

                                  <p className="ts-sm">{description || "No Description Available"}</p>

                                  <MemberList.Large users={users} min={5} />

                                  <Link href={`/app/organization/${id}`} className="w-max">
                                      <Button.Large fit>See More</Button.Large>
                                  </Link>
                              </div>

                              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                                  {projects.map((project, index) => (
                                      <Project key={index} {...project} />
                                  ))}

                                  {[...Array(shadowProjectCount)].map((_, index) => (
                                      <div key={index} className="ts-base flex h-32 w-full items-center justify-center rounded-lg bg-dark-800 opacity-75" />
                                  ))}
                              </div>
                          </section>
                      );
                  })}
        </main>
    );
}
