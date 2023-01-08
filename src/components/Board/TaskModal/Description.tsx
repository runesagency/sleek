import { Large as ButtonLarge } from "@/components/Forms/Button";
import MarkdownEditor from "@/components/Miscellaneous/MarkdownEditor";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

type DescriptionProps = {
    text: string;
};

export default function Description({ text }: DescriptionProps) {
    const [open, setOpen] = useState(false);

    if (!open) {
        return (
            <div onClick={() => setOpen(true)}>
                <ReactMarkdown className="prose prose-invert">{text}</ReactMarkdown>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <MarkdownEditor defaultValue={text} options={{ status: false }} />
            <ButtonLarge onClick={() => setOpen(false)}>Save</ButtonLarge>
        </div>
    );
}
