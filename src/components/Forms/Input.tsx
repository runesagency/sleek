import type { DetailedHTMLProps, HTMLInputTypeAttribute, InputHTMLAttributes } from "react";

import { memo, useCallback, useState } from "react";

type InputProps = Omit<DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, "defaultValue" | "ref"> & {
    type?: HTMLInputTypeAttribute;
    innerRef?: React.Ref<HTMLInputElement>;
    defaultValue?: string;
    saveOnEnter?: boolean;
    onClose?: () => void;
    onSave?: (text: string) => void;
};

const Input = ({ defaultValue, onSave: onValueSaved, onClose, saveOnEnter, innerRef, type = "text", ...props }: InputProps) => {
    const [value, setValue] = useState(defaultValue ?? "");

    const onSave = useCallback(() => {
        if (value) {
            onValueSaved?.(value);
        }

        onClose?.();
    }, [onValueSaved, onClose, value]);

    const onKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLInputElement>) => {
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
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setValue(event.target.value);
        },
        [setValue]
    );

    return (
        <input
            ref={innerRef}
            type={type}
            className="rounded-lg bg-dark-500 p-5 focus:outline-none"
            placeholder="Enter your card title here" //
            value={value}
            onKeyDown={onKeyDown}
            onChange={onChange}
            {...props}
        />
    );
};

export default memo(Input);
