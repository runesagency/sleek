"use client";

import { IconArrowBackUp, IconDots, IconPencil, IconSquare, IconTrash } from "@tabler/icons";
import ReactMarkdown from "react-markdown";

type ActivityProps = {
    sender: string;
    content?: string;
    timestamp: Date;
    details?: string;
};

const Activity = ({ sender, content, timestamp, details }: ActivityProps) => {
    return (
        <article className="group/activity flex flex-col gap-3">
            <div className="flex items-center gap-2">
                <section className="flex flex-1 items-center gap-2 duration-200 group-hover/activity:opacity-80">
                    <img src="https://picsum.photos/200?" className="h-8 w-8 rounded-full" alt="avatar" />

                    <p>
                        <b>{sender}</b> {details}
                    </p>

                    <IconSquare className="h-1 w-1 rounded-full bg-dark-50/50" />

                    <p className="ts-xs opacity-50">{timestamp.toString()}</p>
                </section>

                <section className="hidden shrink-0 items-center gap-4 rounded-lg bg-dark-600 px-3 py-2 group-hover/activity:flex">
                    <IconPencil height={20} width={undefined} />
                    <IconArrowBackUp height={20} width={undefined} />
                    <IconTrash height={20} width={undefined} />
                    <IconDots height={20} width={undefined} />
                </section>
            </div>

            {content && <ReactMarkdown className="duration-200 group-hover/activity:opacity-80">{content}</ReactMarkdown>}
        </article>
    );
};

export default Activity;
