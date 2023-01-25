import type { DetailedHTMLProps, InputHTMLAttributes } from "react";

import { memo, useCallback, useState } from "react";

type InputProps = Omit<DetailedHTMLProps<InputHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>, "defaultValue" | "ref"> & {
    innerRef?: React.Ref<HTMLTextAreaElement>;
    defaultValue?: string;
    saveOnEnter?: boolean;
    onClose?: () => void;
    onSave?: (text: string) => void;
};

const Input = ({ defaultValue, onSave: onValueSaved, onClose, saveOnEnter, innerRef, ...props }: InputProps) => {
    const [value, setValue] = useState(defaultValue ?? "");

    const onSave = useCallback(() => {
        if (value) {
            onValueSaved?.(value);
        }

        onClose?.();
    }, [onValueSaved, onClose, value]);

    const onKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (saveOnEnter && event.key === "Enter" && event.shiftKey === false) {
                event.preventDefault();
                onSave();
            }

            if (event.key === "Escape") {
                event.preventDefault();
                onClose?.();
            }
        },
        [onClose, onSave, saveOnEnter]
    );

    const onChange = useCallback(
        (event: React.ChangeEvent<HTMLTextAreaElement>) => {
            setValue(event.target.value);
        },
        [setValue]
    );

    return (
        <textarea
            ref={innerRef}
            className="rounded-lg bg-dark-500 p-5 focus:outline-none"
            placeholder="Enter your card title here" //
            value={value}
            rows={3}
            onKeyDown={onKeyDown}
            onChange={onChange}
            {...props}
        />
    );
};

export default memo(Input);
