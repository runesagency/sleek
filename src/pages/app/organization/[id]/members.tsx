import { Button, Input } from "@/components/Forms";

import { IconPlus, IconSearch } from "@tabler/icons";
import { useCallback } from "react";

type UserProps = {
    index: number;
    name: string;
    email: string;
    lastActive: number | string;
    perms: number;
};

const User = ({ index, name, email, lastActive, perms }: UserProps) => {
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
            <div className="flex shrink-0 basis-2/6 items-center gap-4">
                <img src={"https://i.pravatar.cc/200?img=" + index} className="h-8 w-8 rounded-full" alt="avatar" />
                <div className="flex flex-col">
                    <p className="ts-sm">{name}</p>
                    <p className="ts-xs">{email}</p>
                </div>
            </div>
            <div className="w-44 min-w-max text-center">
                <p className="ts-sm">{convertSecond(lastActive)}</p>
            </div>
            <div className="w-44 min-w-max text-end">
                <select defaultValue={perms} className="cursor-pointer appearance-none rounded-lg bg-dark-500 p-2 text-center outline-none" name="cars" id="cars" form="carform">
                    <option value="1">Owner</option>
                    <option value="2">Administrator</option>
                    <option value="3">Member</option>
                </select>
            </div>
        </div>
    );
};

export default function Members() {
    const dummyUsersData = [
        {
            name: "El Abror",
            email: "mohamad.el@gmail.com",
            lastActive: 70,
            perms: 1,
        },
        {
            name: "Jajang Nurjaman",
            email: "djajangpersib@gmail.com",
            lastActive: 103300,
            perms: 2,
        },
        {
            name: "Edward Joe",
            email: "edward@gmail.com",
            lastActive: "ONLINE",
            perms: 3,
        },
        {
            name: "Andre Taulany",
            email: "taulany@gmail.com",
            lastActive: 2592342,
            perms: 3,
        },
        {
            name: "Sule Prikitiw",
            email: "prikitiww@gmail.com",
            lastActive: 31104000,
            perms: 3,
        },
        {
            name: "Angelia Clarent",
            email: "angelc@gmail.com",
            lastActive: 442355,
            perms: 3,
        },
        {
            name: "Yadi Sembako",
            email: "yadisk@gmail.com",
            lastActive: 42345,
            perms: 3,
        },
        {
            name: "Asep Knalpot",
            email: "asep@gmail.com",
            lastActive: 311040002,
            perms: 3,
        },
    ];

    return (
        <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-7">
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
            </div>
            <div className="flex flex-col gap-5">
                <div className="flex justify-between border-b border-dark-600 py-4">
                    <h3 className="ts-sm shrink-0 basis-2/6">User</h3>
                    <h3 className="ts-sm">Last Active</h3>
                    <h3 className="ts-sm">Organization permissions</h3>
                </div>
                {dummyUsersData.map((val, idx) => {
                    return <User key={idx} index={idx} name={val.name} email={val.email} lastActive={val.lastActive} perms={val.perms} />;
                })}
            </div>
        </div>
    );
}
