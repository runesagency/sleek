import type { PageProps } from "@/pages/projects/[id]";
import type { ReactNode } from "react";

import Description from "@/components/Board/TaskModal/Description";
import Checklist from "@/components/Board/TaskModal/Checklist";
import Label from "@/components/DataDisplay/Label";
import useCustomEvent from "@/lib/hooks/use-custom-event";
import { Large, Small } from "@/components/Forms/Button";

import { useCallback } from "react";
import { useDebouncedState } from "@mantine/hooks";
import { IconAt, IconBell, IconCalendar, IconDots, IconHourglass, IconMessageDots, IconMoodSmile, IconPaperclip, IconPencil, IconPlus, IconSquare, IconTextCaption, IconTrash } from "@tabler/icons";

type TitleProps = {
    defaultTitle: string;
};

const Title = ({ defaultTitle }: TitleProps) => {
    const [updatedTitle, setUpdatedTitle] = useDebouncedState("", 200);

    const onTitleChange = useCallback(
        (event: React.ChangeEvent<HTMLTextAreaElement>) => {
            event.target.style.height = "0px";
            event.target.style.height = event.target.scrollHeight + "px";

            setUpdatedTitle(event.target.value);
        },
        [setUpdatedTitle]
    );

    const setFocusCursor = useCallback((event: React.FocusEvent<HTMLTextAreaElement>) => {
        const defaultValue = event.target.value;
        event.target.value = "";
        event.target.value = defaultValue;
    }, []);

    return (
        <textarea
            placeholder="Enter Your Card Title Here..."
            rows={1}
            className="hide-scrollbar flex-1 resize-none border-b border-b-dark-600 bg-transparent pb-3 text-left text-3xl font-bold focus:outline-none"
            defaultValue={defaultTitle}
            autoFocus
            onChange={onTitleChange}
            onFocus={setFocusCursor}
        />
    );
};

type SectionProps = {
    children: ReactNode;
    title: string;
};

const Section = ({ children, title }: SectionProps) => {
    return (
        <section className="flex w-full flex-col gap-4">
            <p className="font-semibold">{title}</p>

            {children}
        </section>
    );
};

type InformationProps = {
    label: string;
    children: ReactNode;
    alignStart?: boolean;
};

const Information = ({ label, children, alignStart }: InformationProps) => {
    return (
        <div className={`flex w-full ${alignStart ? "items-start" : "items-center"} justify-start gap-4`}>
            <p className="flex w-44 shrink-0 flex-col justify-center overflow-hidden break-words py-1 font-semibold">{label}</p>

            {children}
        </div>
    );
};

export default function TaskModal() {
    const { data: card, setData: setCard } = useCustomEvent<PageProps["cards"][0]>("card-clicked", false);

    if (!card) return null;

    return (
        <section className="fixed top-0 left-0 flex h-full min-h-screen w-screen flex-col items-center justify-start overflow-auto">
            {/* Use this blocker instead useClickOutside hooks to prevent outside click bug when editing description using React SimpleMDE editor */}
            <div className="fixed top-0 left-0 z-10 h-full w-full bg-dark-900/50" onClick={() => setCard(null)} />

            <br />

            <div className="relative z-20 mt-10 flex h-max w-full max-w-4xl flex-col gap-7 rounded-md bg-dark-700 p-10">
                {/* Title */}
                <section className="flex w-full items-start justify-center gap-5">
                    <Title defaultTitle={card.name} />

                    <Large icon={IconBell} fit>
                        Subscribe
                    </Large>
                </section>

                {/* Information */}
                <section className="flex w-full flex-col gap-4">
                    <Information label="Created By">
                        <div className="flex items-center gap-3">
                            <img src="https://ui-avatars.com/api/?name=Asep+Sukamiskin+Sudrajat" alt="avatar" className="h-10 w-10 rounded-full" />
                            <p className="flex flex-col justify-center">Asep Sukamiskin Sudrajat</p>
                        </div>
                    </Information>

                    <Information label="Assigned to">
                        <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                                {Array(7)
                                    .fill(0)
                                    .map((_, i) => (
                                        <img
                                            key={i}
                                            src={`https://picsum.photos/200?random=${i}`}
                                            alt="avatar"
                                            className="box-border h-10 w-10 shrink-0 rounded-full border-2 border-dark-700 object-cover object-center"
                                        />
                                    ))}
                            </div>

                            <p>+69 Member</p>

                            <button className="shrink-0 rounded-full bg-white p-2">
                                <IconPlus height={12} width={12} className="stroke-dark-800 stroke-2" />
                            </button>
                        </div>
                    </Information>

                    <Information label="Start Date &#8594; Due Date">
                        <div className="flex w-full items-center gap-2">
                            <Small icon={IconCalendar} fit>
                                01 Jan 2023 - 03:39
                            </Small>

                            <span>&#8594;</span>

                            <Small icon={IconCalendar} fit>
                                35 Feb 3069 - 05:44
                            </Small>
                        </div>
                    </Information>

                    <Information label="Timer">
                        <Small icon={IconHourglass} fit>
                            01:34:49
                        </Small>
                    </Information>

                    <Information label="Labels" alignStart>
                        <div className="flex flex-wrap items-center gap-3">
                            {["🤑", "Cuan Gede", "Front End 😁", "Pokoknya Kerjain", "( ͡° ͜ʖ ͡°)", "12-04-2026", "Missed IT!", "!!!Important"].map((val, i) => (
                                <Label key={i} name={val} className="!text-sm" />
                            ))}

                            <button className="shrink-0 rounded-full bg-white p-2">
                                <IconPlus height={12} width={12} className="stroke-dark-800 stroke-2" />
                            </button>
                        </div>
                    </Information>
                </section>

                <hr className="border-dark-600" />

                {/* Actions */}
                <Section title="Actions">
                    <div className="flex gap-2">
                        <Large icon={IconBell} fit>
                            Subscribe
                        </Large>
                    </div>
                </Section>

                <hr className="border-dark-600" />

                {/* Checklists */}
                <Section title="Checklists">
                    <Checklist />

                    <Large icon={IconPlus}>Add New Checklist</Large>
                </Section>

                <hr className="border-dark-600" />

                {/* Description */}
                <Section title="Description">
                    <Description text="# 123" />
                </Section>

                <hr className="border-dark-600" />
                {/* Attachment */}
                <div className="flex w-1/4">
                    <p className="flex flex-col justify-center">Attachments</p>
                </div>
                <div>
                    <div className="mb-4 flex gap-4 overflow-x-auto">
                        <AttachmentComponent title="filename.exe" timestamp="29 February 3045 - 10:30 PM" />
                        <AttachmentComponent title="KONSOOOOOOOOOOL.mp4" timestamp="17 August 1945 - 06:09 AM" />
                    </div>
                    <button className="items-center justify-center rounded-xl bg-dark-600 px-3 py-1 text-sm">Add New Task</button>
                </div>

                <hr className="border-dark-600" />
                {/* Activities */}
                <div className="flex w-1/4">
                    <p className="flex flex-col justify-center">Activities</p>
                </div>
                <div className="flex flex-col gap-4">
                    <ActivityAnouncement id={1} sender="Asep Sukamiskin Sudrajat" content="created this card." timestamp="17 Agustus 1945" />
                    <ActivityAnouncement id={2} sender="Asep Sukamiskin Sudrajat" content="added 76 members to this card." timestamp="20 November 1999" />
                    <ActivityComment id={1} sender="Jamaluddin" content="Hi Mr. Asep, can you explain how this things works?" timestamp="11 September 2001" />
                    <ActivityComment
                        id={2}
                        sender="Asep Sukamiskin Sudrajat"
                        content="Thank you for your response Mr. Jamal, so for the authentication things, you only need to use JWT system so the session can be catched on client side, hope you understand what i meant ✌."
                        timestamp="08 August 2003"
                    />
                    <ActivityAnouncement id={3} sender="Budi Septiani" content="added new attachment (JWT Flow) to this card." timestamp="30 Seconds Ago" />
                    <ActivityComment id={3} sender="Ucup Barbara" content="I think your attachment isn't what Mr. Asep meant, @Budi Septiani." timestamp="Just Now" />
                </div>
                <div className="flex flex-col gap-4">
                    <textarea defaultValue="" placeholder="Write a comment ..." className="hide-scrollbar w-full resize-none rounded-xl bg-dark-500 p-4 text-left text-sm outline-none" rows={3} />
                    <div className="flex justify-between">
                        <button className="items-center justify-center rounded-xl bg-dark-600 px-4 py-3">Add Comment</button>
                        <div className="flex gap-2">
                            <IconPaperclip />
                            <IconMoodSmile />
                            <IconAt />
                            <IconTextCaption className="h-6 w-6 rounded-md border-2" />
                        </div>
                    </div>
                </div>
                <div />
                {/* <div className="flex flex-wrap gap-4" /> */}
            </div>

            <br />
        </section>
    );
}

type AttachmentComponentProps = {
    title: string;
    timestamp: string;
};

function AttachmentComponent({ title, timestamp }: AttachmentComponentProps) {
    return (
        <div className="flex flex-none flex-col gap-2">
            <img src="https://picsum.photos/200/300" alt="attCover" className="h-32 w-48 rounded-xl" />
            <p className=" font-medium">{title}</p>
            <p className="text-sm">{timestamp}</p>
            <div className="flex gap-2">
                <IconPencil />
                <IconMessageDots />
                <IconTrash />
                <IconDots />
            </div>
        </div>
    );
}

type ActivityAnnouncementProps = {
    id: number;
    sender: string;
    content: string;
    timestamp: string;
};

function ActivityAnouncement({ id, sender, content, timestamp }: ActivityAnnouncementProps) {
    return (
        <div className="flex gap-2">
            <img src="https://picsum.photos/200?" className="h-8 w-8 rounded-full" alt="avatar" />
            <p className="flex flex-col justify-center">{sender}</p>
            <p className="flex flex-col justify-center font-light">{content}</p>
            <span className="flex flex-row gap-2 font-light">
                <IconSquare className="mt-3.5 h-1 w-1 rounded-full border bg-dark-50 opacity-50" />
                <p className="flex flex-col justify-center text-xs text-dark-50 opacity-50">{timestamp}</p>
            </span>
        </div>
    );
}

function ActivityComment({ id, sender, content, timestamp }: ActivityAnnouncementProps) {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex gap-2">
                <img src="https://picsum.photos/200?" className="h-8 w-8 rounded-full" alt="avatar" />
                <p className="flex flex-col justify-center">{sender}</p>
                <span className="flex flex-row justify-center gap-2 font-light">
                    <IconSquare className="mt-3.5 h-1 w-1 rounded-full border bg-dark-50 opacity-50" />
                    <p className="flex flex-col justify-center text-xs text-dark-50 opacity-50">{timestamp}</p>
                </span>
            </div>
            <div>
                <p className="flex flex-col justify-center font-light">{content}</p>
            </div>
        </div>
    );
}
