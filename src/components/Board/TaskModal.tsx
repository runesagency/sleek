import type { PageProps } from "@/pages/projects/[id]";

import useCustomEvent from "@/lib/hooks/use-custom-event";

import { useDebouncedState } from "@mantine/hooks";
import { IconAt, IconCheck, IconDots, IconMessageDots, IconMoodSmile, IconPaperclip, IconPencil, IconPlus, IconSquare, IconTextCaption, IconTrash } from "@tabler/icons";
import { useCallback, useEffect, useState } from "react";

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

    const [dummyChecklists, setDummyChecklists] = useState([
        {
            id: 1,
            title: "Preparation",
            dummyChecklistData: [
                {
                    id: 1,
                    label: "Create a Figma account",
                    isChecked: false,
                },
                {
                    id: 2,
                    label: "Verify the account",
                    isChecked: true,
                },
                {
                    id: 3,
                    label: "Kill People",
                    isChecked: false,
                },
                {
                    id: 4,
                    label: "Kill God",
                    isChecked: false,
                },
            ],
        },
        {
            id: 2,
            title: "Concepting",
            dummyChecklistData: [
                {
                    id: 1,
                    label: "🎈 Find more reference about the design",
                    isChecked: false,
                },
                {
                    id: 2,
                    label: "Verify the account",
                    isChecked: true,
                },
            ],
        },
    ]);

    const addDummyChecklists = (id: number) => {
        // dummyChecklists.splice(dummyChecklists.map((e) => e.id).indexOf(id) + 1, 0, {
        //     id: 3,
        //     title: "Prep",
        //     dummyChecklistData: [
        //         {
        //             id: 1,
        //             label: "🎈 Find more reference about the design",
        //             isChecked: false,
        //         },
        //         {
        //             id: 2,
        //             label: "Verify the account",
        //             isChecked: true,
        //         },
        //     ],
        // });
        setDummyChecklists([
            ...dummyChecklists,
            {
                id: 3,
                title: "Prep",
                dummyChecklistData: [
                    {
                        id: 1,
                        label: "🎈 Find more reference about the design",
                        isChecked: false,
                    },
                    {
                        id: 2,
                        label: "Verify the account",
                        isChecked: true,
                    },
                ],
            },
        ]);
    };

    if (!card) return null;

    return (
        <section className="fixed top-0 left-0 flex h-screen w-screen items-center justify-center">
            <div className="absolute top-0 left-0 h-full w-full bg-dark-900 opacity-50" onClick={() => setCard(null)} />

            <div className="relative z-20 flex h-full w-full max-w-4xl flex-col gap-8 overflow-y-scroll rounded-md bg-dark-700 p-10">
                {/* Title */}
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
                {/* Information */}
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
                                            className="box-border h-10 w-10 rounded-full border border-dark-600 object-cover object-center"
                                        />
                                    ))}
                            </div>
                            <p className="ml-2 flex flex-col justify-center">+69 Member</p>
                            <button className="ml-2">
                                <IconPlus className="rounded-full bg-white p-1" color="black" />
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
                                <IconPlus className="rounded-full bg-white p-1" color="black" />
                            </button>
                        </div>
                    </div>
                </div>

                <hr className="border-dark-600" />
                {/* Actions */}
                <div className="flex w-1/4">
                    <p className="flex flex-col justify-center">Actions</p>
                </div>
                <div className="flex gap-2">
                    {dummyActions.map((val, i) => (
                        <button key={i} className="items-center justify-center rounded-xl bg-dark-600 px-4 py-3">
                            {val}
                        </button>
                    ))}
                </div>

                <hr className="border-dark-600" />
                {/* Checklists */}
                <div className="flex w-1/4">
                    <p className="flex flex-col justify-center">Checklists</p>
                </div>
                {dummyChecklists.map((val, i) => (
                    <ChecklistsComponent key={i} addFunc={addDummyChecklists} data={dummyChecklists[i]} />
                ))}

                <hr className="border-dark-600" />
                {/* Description */}
                <div className="flex w-1/4">
                    <p className="flex flex-col justify-center">Description</p>
                </div>
                <div className="flex gap-2">INPUTT</div>

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
        </section>
    );
}

// --------------------------------------------------------------------Components
// ------------------------Checklists Components
type dummyChecklistT = Array<{
    id: number;
    label: string;
    isChecked: boolean;
}>;

type ChecklistsComponentProps = {
    addFunc: (id: number) => void;
    data: {
        id: number;
        title: string;
        dummyChecklistData: dummyChecklistT;
    };
};

function ChecklistsComponent({ data, addFunc }: ChecklistsComponentProps) {
    const [checkListDummyData, setCheckListDummyData] = useState(data.dummyChecklistData);
    const [register, setRegister] = useState<{ id: number; checked: boolean }[]>([]);

    const [valueProgress, setValueProgress] = useState((checkListDummyData.filter((val) => val.isChecked).length / checkListDummyData.length) * 100);

    const getStat = useCallback((data: { id: number; checked: boolean }) => {
        checkListDummyData.forEach((elem) => {
            if (elem.id === data.id) {
                elem.isChecked = data.checked;
            }
        });
        setCheckListDummyData(checkListDummyData);
        setValueProgress((checkListDummyData.filter((val) => val.isChecked).length / checkListDummyData.length) * 100);
    }, []);

    return (
        <div className="flex flex-col gap-4">
            <div className="mb-5 flex justify-between">
                <h1 className="text-xl font-bold">{data.title}</h1>
                <div className="flex gap-2">
                    <button onClick={() => addFunc(data.id)}>
                        <IconPlus />
                    </button>
                    <button onClick={() => console.log(checkListDummyData)}>
                        <IconDots />
                    </button>
                </div>
            </div>
            <CheckListProgress valueProgress={valueProgress} />
            <div className="flex flex-col gap-4">
                {checkListDummyData.map((val, i) => (
                    <CheckBox key={i} id={val.id} register={register} getStat={getStat} label={val.label} isChecked={val.isChecked} />
                ))}
                <div className="w-1/4">
                    <button className="items-center justify-center rounded-xl bg-dark-600 px-3 py-1 text-sm">Add New Task</button>
                </div>
            </div>
        </div>
    );
}
// ------------------------End Checklists Components

// ------------------------CheckBox Components
type CheckBoxProps = {
    getStat: (data: { id: number; checked: boolean }) => void;
    id: number;
    register: Array<{ id: number; checked: boolean }>;
    label: string;
    isChecked: boolean;
};

function CheckBox({ isChecked, label, getStat, register, id }: CheckBoxProps) {
    const [checked, setChecked] = useState(isChecked);

    const handleClick = useCallback(() => {
        setChecked(!checked);
        getStat({ id: id, checked: !checked });
    }, [checked]);

    useEffect(() => {
        register.push({ id: id, checked: !checked });
    }, []);

    return (
        <div onClick={handleClick} className="inline-block cursor-pointer px-3">
            <div className="relative flex flex-row gap-2">
                <input
                    checked={checked}
                    className="peer flex h-6 w-6 appearance-none flex-col justify-center rounded-lg bg-dark-50 duration-150 ease-in-out checked:bg-dark-600"
                    type="checkbox"
                    id="checkbox1"
                />
                <IconCheck className="absolute left-0 hidden peer-checked:block " />
                <p>{label}</p>
            </div>
        </div>
    );
}
// ------------------------End CheckBox Components

// ------------------------Progress Components
type CheckListProgressProps = {
    valueProgress: number;
};

function CheckListProgress({ valueProgress }: CheckListProgressProps) {
    return (
        <div className="flex gap-2">
            <div className="relative flex w-full grow-0 flex-col justify-center">
                <div className="h-1.5 w-full  rounded-full bg-dark-500" />
                <div style={{ width: valueProgress + "%" }} className="absolute top-1/3 h-1.5 rounded-full bg-dark-50 duration-150 ease-in-out" />
            </div>
            <div className="">
                <p className="flex grow-0 flex-col justify-center text-xs">{Math.round(valueProgress)}%</p>
            </div>
        </div>
    );
}
// -----------------------End Progress Components

// ------------------------Attachment Components
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
// ------------------------End Attachment Components

// ------------------------Activities Components
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
// ------------------------End Activities Components
// --------------------------------------------------------------------End Components
