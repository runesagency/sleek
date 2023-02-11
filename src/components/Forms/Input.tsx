import type { TablerIcon } from "@tabler/icons";
import type { DetailedHTMLProps, HTMLInputTypeAttribute, InputHTMLAttributes } from "react";

import { useRef, memo, useCallback, useState } from "react";

type UseInputOptions = {
    defaultValue?: string;
    saveOnEnter?: boolean;
    onSave?: (value: string) => void;
    onClose?: () => void;
};

const useInput = ({ defaultValue, onSave: onValueSaved, onClose, saveOnEnter }: UseInputOptions) => {
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

    const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value);
    }, []);

    return {
        value,
        setValue,
        onSave,
        onKeyDown,
        onChange,
    };
};

type InputProps = Omit<DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, "defaultValue" | "ref" | "onChange"> & {
    icon?: TablerIcon;
    type?: HTMLInputTypeAttribute;
    innerRef?: React.RefObject<HTMLInputElement>;
    defaultValue?: string;
    saveOnEnter?: boolean;
    onClose?: () => void;
    onSave?: (text: string) => void;
};

const Small = ({ defaultValue, icon: Icon, onSave, onClose, saveOnEnter, innerRef, type = "text", ...props }: InputProps) => {
    const ref = useRef<HTMLInputElement>(null);
    const { value, onKeyDown, onChange } = useInput({ defaultValue, onSave, onClose, saveOnEnter });
    const usedRef = innerRef ?? ref;

    const onIconClick = useCallback(() => {
        usedRef.current?.focus();
    }, [usedRef]);

    return (
        <div className="flex items-center overflow-hidden rounded-lg bg-dark-500">
            {Icon && (
                <div className="cursor-pointer py-3 pl-3 pr-1.5" onClick={onIconClick}>
                    <Icon height={16} width={undefined} className="shrink-0 stroke-white" />
                </div>
            )}

            <input
                ref={usedRef}
                type={type}
                className="ts-sm w-full bg-transparent py-3 pl-1.5 pr-3 focus:outline-none disabled:cursor-not-allowed disabled:opacity-30"
                placeholder="Enter your card title here" //
                value={value}
                onKeyDown={onKeyDown}
                onChange={onChange}
                {...props}
            />
        </div>
    );
};

const Large = ({ defaultValue, icon: Icon, onSave, onClose, saveOnEnter, innerRef, type = "text", ...props }: InputProps) => {
    const ref = useRef<HTMLInputElement>(null);
    const { value, onKeyDown, onChange } = useInput({ defaultValue, onSave, onClose, saveOnEnter });
    const usedRef = innerRef ?? ref;

    const onIconClick = useCallback(() => {
        usedRef.current?.focus();
    }, [usedRef]);

    return (
        <div className="flex items-center overflow-hidden rounded-lg bg-dark-500">
            {Icon && (
                <div className="cursor-pointer py-5 pl-5 pr-1.5" onClick={onIconClick}>
                    <Icon height={20} width={undefined} className="shrink-0 stroke-white" />
                </div>
            )}

            <input
                ref={usedRef}
                type={type}
                className="ts-sm w-full bg-transparent py-5 pl-1.5 pr-5 focus:outline-none disabled:cursor-not-allowed disabled:opacity-30"
                placeholder="Enter your card title here" //
                value={value}
                onKeyDown={onKeyDown}
                onChange={onChange}
                {...props}
            />
        </div>
    );
};

const Input = {
    Small: memo(Small),
    Large: memo(Large),
};

export default Input;
