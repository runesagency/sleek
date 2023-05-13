"use client";

import { IconDots, IconMessageDots, IconPencil, IconTrash } from "@tabler/icons-react";

type AttachmentProps = {
    title: string;
    timestamp: Date;
};

const Attachment = ({ title, timestamp }: AttachmentProps) => {
    return (
        <div className="flex w-48 flex-col gap-4">
            <img src="https://picsum.photos/200/300" alt="attCover" className="h-36 w-full rounded-xl" />

            <div className="flex w-full flex-col gap-3">
                <p title={title} className="ts-base truncate font-medium">
                    {title}
                </p>

                <span className="ts-sm truncate">{timestamp.toString()}</span>

                <div className="flex gap-5 pt-2">
                    <IconPencil />
                    <IconMessageDots />
                    <IconTrash />
                    <IconDots />
                </div>
            </div>
        </div>
    );
};

export default Attachment;
