"use client";

import { OrganizationLayoutContext } from "@/app/app/organization/[id]/OrganizationLayoutContext";
import { Button, Input } from "@/components/Forms";

import { User } from "@prisma/client";
import { IconPlus, IconSearch } from "@tabler/icons-react";
import { useCallback, useContext } from "react";

const User = ({ name, email, roleId }: User) => {
    const convertSecond = useCallback((second: number | string) => {
        const oneMinute = 60;
        const oneHour = 3600;
        const oneDay = 86400;
        const oneMonth = 2592000;
        const oneYear = 31104000;

        let unit = "";
        let value = 0;
        if (typeof second === "number") {
            if (second < oneMinute) {
                unit = "second";
                value = second;
            } else if (second < oneHour) {
                unit = "minute";
                value = Math.floor(second / oneMinute);
            } else if (second < oneDay) {
                unit = "hour";
                value = Math.floor(second / oneHour);
            } else if (second < oneMonth) {
                unit = "days";
                value = Math.floor(second / oneDay);
            } else if (second <= oneYear) {
                unit = "months";
                value = Math.floor(second / oneMonth);
            } else {
                unit = "years";
                value = Math.floor(second / oneYear);
            }
            return `${value} ${unit} ago`;
        } else {
            if (second === "ONLINE") {
                return "Online";
            } else {
                return "err";
            }
        }
    }, []);

    return (
        <div className="flex items-center justify-between">
            <section className="flex shrink-0 basis-2/6 items-center gap-4">
                <img src="https://i.pravatar.cc/200" className="h-8 w-8 rounded-full" alt="avatar" />

                <div className="flex flex-col">
                    <p className="ts-sm">{name}</p>
                    <p className="ts-xs">{email}</p>
                </div>
            </section>

            <section className="w-44 min-w-max text-center">
                <p className="ts-sm">{convertSecond(1000)}</p>
            </section>

            <section className="w-44 min-w-max text-end">
                <select defaultValue={roleId} className="cursor-pointer appearance-none rounded-lg bg-dark-500 p-2 text-center outline-none" name="cars" id="cars" form="carform">
                    <option value="1">Owner</option>
                    <option value="2">Administrator</option>
                    <option value="3">Member</option>
                </select>
            </section>
        </div>
    );
};

export default function Members() {
    const {
        data: { users },
    } = useContext(OrganizationLayoutContext);

    return (
        <div className="flex flex-col gap-10">
            <section className="flex flex-col gap-7">
                <div>
                    <h2 className="ts-xl">Members</h2>
                    <p className="ts-sm w-1/2">Manage members here, or set up a domain, so everyone with allowed email domains can join the organization automatically.</p>
                </div>

                <div className="flex h-11 justify-between">
                    <Button.Large fit icon={IconPlus}>
                        Add New Member
                    </Button.Large>

                    <Input.Large icon={IconSearch} placeholder="Filter by email or name..." />
                </div>
            </section>

            <section className="flex flex-col gap-5">
                <div className="flex justify-between border-b border-dark-600 py-4">
                    <p className="ts-sm shrink-0 basis-2/6">User</p>
                    <p className="ts-sm">Last Active</p>
                    <p className="ts-sm">Organization permissions</p>
                </div>

                {users.map((user, index) => {
                    return <User key={index} {...user} />;
                })}
            </section>
        </div>
    );
}
