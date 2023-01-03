import type { PageProps } from "@/pages/projects/[id]";

import useCustomEvent from "@/lib/hooks/use-custom-event";

import { useDebouncedState } from "@mantine/hooks";
import { useCallback, useState } from "react";

export default function TaskModal() {
    const { data: card, setData: setCard } = useCustomEvent<PageProps["cards"][0]>("card-clicked", false);
    const [updatedTitle, setUpdatedTitle] = useDebouncedState("", 200);

    const onTitleChange = useCallback(
        (event: React.ChangeEvent<HTMLTextAreaElement>) => {
            event.target.style.height = "0px";
            event.target.style.height = event.target.scrollHeight + "px";

            setUpdatedTitle(event.target.value);
        },
        [setUpdatedTitle]
    );

    const setCursorPosTitle = useCallback(
        (e: React.FocusEvent<HTMLTextAreaElement>) => {
            const valLength = e.currentTarget.value.length;
            const currentCursor = e.currentTarget.selectionStart;
            const currentCursorEnd = e.currentTarget.selectionEnd;
            if (e.currentTarget.selectionStart !== 0) {
                if (currentCursorEnd) {
                    e.currentTarget.setSelectionRange(currentCursor, currentCursorEnd);
                } else {
                    e.currentTarget.setSelectionRange(currentCursor, currentCursor);
                }
            } else {
                if (currentCursorEnd) {
                    e.currentTarget.setSelectionRange(currentCursor, currentCursorEnd);
                } else {
                    e.currentTarget.setSelectionRange(valLength, valLength);
                }
            }
        },
        [card]
    );

    if (!card) return null;

    return (
        <section className="fixed top-0 left-0 flex h-screen w-screen items-center justify-center">
            <div className="absolute top-0 left-0 h-full w-full bg-dark-900 opacity-50" onClick={() => setCard(null)} />

            <div className="relative z-20 flex w-full max-w-4xl flex-col gap-8 rounded-md bg-dark-700 p-10">
                <textarea
                    id="title"
                    placeholder="Enter Your Card Title Here..."
                    rows={1}
                    className="hide-scrollbar resize-none bg-transparent text-3xl font-bold focus:outline-none"
                    defaultValue={card.name}
                    autoFocus
                    onFocus={(e) => setCursorPosTitle(e)}
                    onChange={onTitleChange}
                />

                <div className="flex flex-wrap gap-4" />
            </div>
        </section>
    );
}
