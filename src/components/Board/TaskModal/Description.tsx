import type EasyMDE from "easymde";

import { Large as ButtonLarge } from "@/components/Forms/Button";
import MarkdownEditor from "@/components/Miscellaneous/MarkdownEditor";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

type DescriptionProps = {
    text: string | null;
    onUpdate: (description: string | null) => void;
};

export default function Description({ text, onUpdate }: DescriptionProps) {
    const editor = useRef<EasyMDE | null>(null);
    const [open, setOpen] = useState(false);
    const [previousValue, setPreviousValue] = useState(text ?? "");

    useEffect(() => {
        // Update the card description when the editor is closed
        if (editor.current && !open) {
            const value = editor.current.value().trim();

            if (value !== previousValue) {
                onUpdate(value || null);
                setPreviousValue(value);
            }
        }
    }, [open, previousValue, onUpdate]);

    if (!open) {
        return (
            <div onClick={() => setOpen(true)}>
                <ReactMarkdown className="prose prose-invert">{text ?? "*No description provided, click here to edit*"}</ReactMarkdown>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <MarkdownEditor innerRef={editor} defaultValue={text ?? undefined} options={{ status: false }} />
            <ButtonLarge onClick={() => setOpen(false)}>Save</ButtonLarge>
        </div>
    );
}
