import type { PageProps } from "@/pages/projects/[id]";

import useCustomEvent from "@/lib/hooks/use-custom-event";

import { useDebouncedState } from "@mantine/hooks";
import { IconCheck, IconDots, IconPlus } from "@tabler/icons";
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

    const dummyLabels = ["🤑", "Cuan Gede", "Front End 😁", "Pokoknya Kerjain", "( ͡° ͜ʖ ͡°)", "12-04-2026", "Missed IT!", "!!!Important"];
    const dummyActions = ["Subscribe", "Join", "Archive", "Share", "Move", "Copy"];

    if (!card) return null;

    return (
        <section className="fixed top-0 left-0 flex h-screen w-screen items-center justify-center">
            <div className="absolute top-0 left-0 h-full w-full bg-dark-900 opacity-50" onClick={() => setCard(null)} />

            <div className="relative z-20 flex w-full max-w-4xl flex-col gap-8 rounded-md bg-dark-700 p-10">
                <div className="flex">
                    <textarea
                        placeholder="Enter Your Card Title Here..."
                        rows={1}
                        className="hide-scrollbar basis-11/12 resize-none bg-transparent text-left text-3xl font-bold focus:outline-none"
                        defaultValue={card.name}
                        autoFocus
                        onFocus={(e) => setCursorPosTitle(e)}
                        onChange={onTitleChange}
                    />
                    <button className="items-center justify-center rounded-xl bg-dark-600 px-4 py-3">Subscribe</button>
                </div>

                <hr className="border-dark-600" />

                <div>
                    <div className="mb-4 flex">
                        <div className="flex w-1/4">
                            <p className="flex flex-col justify-center">Created By</p>
                        </div>
                        <div className="flex">
                            <img src="https://ui-avatars.com/api/?name=Asep+Sukamiskin+Sudrajat" alt="avatar" className="h-10 w-10 rounded-full" />
                            <p className="ml-5 flex flex-col justify-center">Asep Sukamiskin Sudrajat</p>
                        </div>
                    </div>
                    <div className="mb-4 flex">
                        <div className="flex w-1/4">
                            <p className="flex flex-col justify-center">Assigned to</p>
                        </div>
                        <div className="flex">
                            <div className="flex -space-x-2">
                                {Array(7)
                                    .fill(0)
                                    .map((_, i) => (
                                        <img
                                            key={i}
                                            src={`https://picsum.photos/200?random=${i}`}
                                            alt="avatar"
                                            className={"box-border h-10 w-10 rounded-full border border-dark-600 object-cover object-center"}
                                        />
                                    ))}
                            </div>
                            <p className="ml-2 flex flex-col justify-center">+69 Member</p>
                            <button className="ml-2">
                                <IconPlus className="rounded-full bg-white p-1" color={"black"} />
                            </button>
                        </div>
                    </div>
                    <div className="mb-4 flex">
                        <div className="flex w-1/4">
                            <p className="flex flex-col justify-center">Start Date &#8594; Due Date</p>
                        </div>
                        <div className="flex">
                            <p className="flex flex-col justify-center">Put Button Here</p>
                        </div>
                    </div>
                    <div className="mb-4 flex">
                        <div className="flex w-1/4">
                            <p className="flex flex-col justify-center">Timer</p>
                        </div>
                        <div className="flex">
                            <p className="flex flex-col justify-center">Put Button Here</p>
                        </div>
                    </div>
                    <div className="mb-4 flex">
                        <div className="flex w-1/4">
                            <p className="flex flex-col">Labels</p>
                        </div>
                        <div className="flex w-3/4 flex-wrap items-center gap-2">
                            {dummyLabels.map((val, i) => (
                                <span key={i} className="items-center justify-center rounded-full bg-dark-800 px-2 py-1">
                                    {val}
                                </span>
                            ))}
                            <button className="ml-2">
                                <IconPlus className="rounded-full bg-white p-1" color={"black"} />
                            </button>
                        </div>
                    </div>
                </div>

                <hr className="border-dark-600" />

                <div>
                    <div className="mb-4 flex w-1/4">
                        <p className="flex flex-col justify-center">Actions</p>
                    </div>
                    <div className="flex gap-2">
                        {dummyActions.map((val, i) => (
                            <button key={i} className="items-center justify-center rounded-xl bg-dark-600 px-4 py-3">
                                {val}
                            </button>
                        ))}
                    </div>
                </div>

                <hr className="border-dark-600" />

                <div>
                    <div className="mb-4 flex w-1/4">
                        <p className="flex flex-col justify-center">Checklists</p>
                    </div>
                    <div className="mb-5 flex justify-between">
                        <h1 className="text-xl font-bold">Preparation</h1>
                        <div className="flex gap-2">
                            <button>
                                <IconPlus />
                            </button>
                            <button>
                                <IconDots />
                            </button>
                        </div>
                    </div>
                    <CheckListProgress valueProgress={50} />
                    <CheckBox isChecked={false} />
                </div>

                <div className="flex flex-wrap gap-4" />
            </div>
        </section>
    );
}

type CheckBoxProps = {
    isChecked: boolean;
};

function CheckBox({ isChecked }: CheckBoxProps) {
    const [checked, setChecked] = useState(isChecked);

    const handleClick = () => {
        if (checked) {
            setChecked(false);
        } else {
            setChecked(true);
            console.log(checked);
        }
    };

    return (
        <div onClick={handleClick} className="inline-block cursor-pointer px-3">
            <div className={"relative flex flex-row gap-2"}>
                <input checked={checked} className="peer flex h-6 w-6 appearance-none flex-col justify-center rounded-lg bg-dark-50 checked:bg-dark-600" type={"checkbox"} id={"checkbox1"} />
                <IconCheck className="absolute left-0 hidden peer-checked:block " />
                <p>Create a Figma account</p>
            </div>
        </div>
    );
}

type CheckListProgressProps = {
    valueProgress: number;
};

function CheckListProgress({ valueProgress }: CheckListProgressProps) {
    return (
        <div className="relative mb-4">
            <div className="h-[6px] w-full rounded-full bg-dark-500" />
            <div style={{ width: `${valueProgress}%` }} className={`absolute top-0 h-[6px] rounded-full bg-dark-50 `} />
        </div>
    );
}
