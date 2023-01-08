import "easymde/dist/easymde.min.css";

import type { Options as EasyMDEOptions } from "easymde";
import type { SimpleMDEReactProps } from "react-simplemde-editor";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";

const SimpleMDE = dynamic(() => import("react-simplemde-editor"), { ssr: false });

type MarkdownEditorProps = {
    defaultValue?: string;
    placeholder?: string;
    options?: EasyMDEOptions;
    onChange?: SimpleMDEReactProps["onChange"];
    onMount?: (instance: EasyMDE) => void;
};

export default function MarkdownEditor({ defaultValue, onChange: onInputChange, placeholder, options, onMount: onComponentMount }: MarkdownEditorProps) {
    const [value, setValue] = useState(defaultValue);

    const onChange = useCallback(
        (value: string, changeObject: CodeMirror.EditorChange | undefined) => {
            setValue(value);
            onInputChange?.(value, changeObject);
        },
        [onInputChange]
    );

    const mdEditorOptions: EasyMDEOptions = useMemo(
        () => ({
            autofocus: true,
            spellChecker: false,
            ...options,
        }),
        [options]
    );

    return <SimpleMDE value={value} onChange={onChange} options={mdEditorOptions} placeholder={placeholder ?? undefined} />;
}
