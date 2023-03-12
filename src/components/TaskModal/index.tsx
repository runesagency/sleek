"use client";

import type { BoardCard } from "@/app/app/board/[id]/layout";
import type { ReactNode } from "react";

import { BoardLayoutContext } from "@/app/app/board/[id]/layout";
import Label from "@/components/DataDisplay/Label";
import MemberList from "@/components/DataDisplay/MemberList";
import { Button, Textarea } from "@/components/Forms";
import Avatar from "@/components/Miscellaneous/Avatar";
import Activity from "@/components/TaskModal/Activity";
import Attachment from "@/components/TaskModal/Attachment";
import Checklist from "@/components/TaskModal/Checklist";
import Description from "@/components/TaskModal/Description";
import Title from "@/components/TaskModal/Title";

import { IconAt, IconBell, IconCalendar, IconHourglass, IconId, IconMoodSmile, IconPaperclip, IconPlus } from "@tabler/icons";
import clsx from "clsx";
import { useContext, useCallback, memo } from "react";

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
        <div className={clsx("flex w-full justify-start gap-4", alignStart ? "items-start" : "items-center")}>
            <p className="flex w-44 shrink-0 flex-col justify-center overflow-hidden break-words py-1 font-semibold">{label}</p>

            {children}
        </div>
    );
};

const TaskModal = () => {
    const { activeCard: card, setCards, cards, setActiveCard } = useContext(BoardLayoutContext);

    const updateCard = useCallback(
        async (newData: Partial<BoardCard>) => {
            if (!card) return;

            const foundCardIndex = cards.findIndex(({ id }) => id === card.id);
            if (foundCardIndex === -1) return;

            const updatedCards = [...cards];
            updatedCards[foundCardIndex] = { ...card, ...newData };

            setCards(updatedCards);

            await fetch(`/api/cards/${card.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(card),
            });
        },
        [card, cards, setCards]
    );

    const onTitleUpdate = useCallback(
        (newTitle: string) => {
            updateCard({ title: newTitle });
        },
        [updateCard]
    );

    const onDescriptionUpdate = useCallback(
        (newDescription: string | null) => {
            updateCard({ description: newDescription });
        },
        [updateCard]
    );

    const onModalClose = useCallback(() => {
        setActiveCard(undefined);
    }, [setActiveCard]);

    if (!card) return null;

    // count total timer from card.timers, count between start and end date, if there's no end date then keep the count going
    const totalTimer = card.timers.reduce((acc, timer) => {
        const start = new Date(timer.startedAt);
        const end = timer.endedAt ? new Date(timer.endedAt) : new Date();

        return acc + (end.getTime() - start.getTime());
    }, 0);

    return (
        <section className="fixed top-0 left-0 flex h-full min-h-screen w-screen flex-col items-center justify-start overflow-auto">
            {/* Use this blocker instead useClickOutside hooks to prevent outside click bug when editing description using React SimpleMDE editor */}
            <div className="fixed top-0 left-0 z-10 h-full w-full bg-dark-900/50" onClick={onModalClose} />

            <br />

            <div className="relative z-20 mt-10 flex h-max w-full max-w-4xl flex-col gap-7 rounded-md bg-dark-700 p-10">
                {/* Title */}
                <section className="flex w-full items-start justify-center gap-5">
                    <Title defaultTitle={card.title} onUpdate={onTitleUpdate} />

                    <Button.Large icon={IconBell} fit>
                        Subscribe
                    </Button.Large>
                </section>

                {/* Information */}
                <section className="flex w-full flex-col gap-4">
                    <Information label="Created By">
                        <div className="flex items-center gap-3">
                            {card.creator ? (
                                <>
                                    <Avatar seed={card.creator.name} className="h-10 w-10 rounded-full" />
                                    <p>{card.creator.name}</p>
                                </>
                            ) : (
                                <p className="italic">User Not Found</p>
                            )}
                        </div>
                    </Information>

                    <Information label="Assigned to">
                        <div className="flex items-center gap-2">
                            {card.users.length > 0 && (
                                <>
                                    <MemberList.Large users={card.users} max={10} />
                                    {card.users.length > 10 && <p>+{card.users.length - 10} Members</p>}
                                </>
                            )}

                            <button className="shrink-0 rounded-full bg-dark-50 p-2">
                                <IconPlus height={12} width={12} className="stroke-dark-800 stroke-2" />
                            </button>
                        </div>
                    </Information>

                    <Information label="Start Date &#8594; Due Date">
                        <div className="flex w-full items-center gap-2">
                            <Button.Small icon={IconCalendar} fit>
                                {card.startDate ? card.startDate.toString() : "No Start Date"}
                            </Button.Small>

                            <span>&#8594;</span>

                            <Button.Small icon={IconCalendar} fit>
                                {card.dueDate ? card.dueDate.toString() : "No Due Date"}
                            </Button.Small>
                        </div>
                    </Information>

                    <Information label="Timer">
                        <Button.Small icon={IconHourglass} fit>
                            {totalTimer}
                        </Button.Small>
                    </Information>

                    <Information label="Labels" alignStart>
                        <div className="flex flex-wrap items-center gap-3">
                            {card.labels.map(({ label }, i) => {
                                return <Label key={i} name={label.name} color={label.color} className="!text-sm" />;
                            })}

                            <button className="shrink-0 rounded-full bg-dark-50 p-2">
                                <IconPlus height={12} width={12} className="stroke-dark-800 stroke-2" />
                            </button>
                        </div>
                    </Information>
                </section>

                <hr className="border-dark-600" />

                {/* Checklists */}
                <Section title="Checklists">
                    {card.checklists.map((checklist, i) => (
                        <Checklist key={i} data={checklist} />
                    ))}

                    <Button.Large icon={IconPlus}>Add New Checklist</Button.Large>
                </Section>

                <hr className="border-dark-600" />

                {/* Description */}
                <Section title="Description">
                    <Description text={card.description} onUpdate={onDescriptionUpdate} />
                </Section>

                <hr className="border-dark-600" />

                {/* Attachment */}
                <Section title="Attachments">
                    {card.attachments.length > 0 && (
                        <div className="mb-4 flex gap-4 overflow-x-auto">
                            {card.attachments.map(({ attachment, addedAt }, i) => (
                                <Attachment key={i} title={attachment.title} timestamp={addedAt} />
                            ))}
                        </div>
                    )}

                    <Button.Small fit>Add New Attachment</Button.Small>
                </Section>

                <hr className="border-dark-600" />

                {/* Activities */}
                <Section title="Activities">
                    <div className="flex flex-col gap-7">
                        {card.activities.map(({ activity, user, message, createdAt }, i) => (
                            <Activity key={i} sender={user.name} details={activity || undefined} content={message || undefined} timestamp={createdAt} />
                        ))}

                        <section className="flex flex-col gap-3">
                            <Textarea placeholder="Write a comment..." />

                            <div className="flex items-center justify-between">
                                <Button.Large fit>Add Comment</Button.Large>

                                <div className="flex items-center gap-4">
                                    <IconPaperclip height={20} />
                                    <IconMoodSmile height={20} />
                                    <IconAt height={20} />
                                    <IconId height={20} />
                                </div>
                            </div>
                        </section>
                    </div>
                </Section>
            </div>

            <br />
        </section>
    );
};

export default memo(TaskModal);
