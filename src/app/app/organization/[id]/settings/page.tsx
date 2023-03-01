"use client";

import { Button, Input, Textarea } from "@/components/Forms";

export default function Settings() {
    return (
        <div className="flex gap-10 ">
            <div className="flex w-40 shrink-0 flex-col gap-4">
                <Button.Large>General</Button.Large>
                <Button.Large>Notification</Button.Large>
                <Button.Large>Security</Button.Large>
                <Button.Large>Roles & Permissions</Button.Large>
            </div>

            <div className="flex w-full flex-col gap-8">
                <h2 className="ts-2xl">General Settings</h2>

                <div className="flex flex-col gap-7">
                    <div>
                        <h3 className="ts-base">Organization Title</h3>
                        <p className="ts-sm w-7/12">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam venenatis sapien vel erat ultricies vestibulum sed vitae nulla. </p>
                        <p className="ts-sm w-7/12">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam venenatis sapien vel erat ultricies vestibulum sed vitae nulla. </p>
                    </div>
                    <Input.Large placeholder="Enter your tittle here ..." />
                </div>

                <div className="flex flex-col gap-7">
                    <div>
                        <h3 className="ts-base">Organization Description</h3>
                        <p className="ts-sm w-7/12">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam venenatis sapien vel erat ultricies vestibulum sed vitae nulla. </p>
                    </div>
                    <Textarea rows={5} placeholder="Enter your description here ..." />
                </div>
            </div>
        </div>
    );
}
