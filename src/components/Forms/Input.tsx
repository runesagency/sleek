"use client";

import type { TablerIcon } from "@tabler/icons";

import clsx from "clsx";
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

export type InputProps = Omit<React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, "defaultValue" | "ref" | "className"> & {
    icon?: TablerIcon;
    type?: React.HTMLInputTypeAttribute;
    innerRef?: React.RefObject<HTMLInputElement>;
    defaultValue?: string;
    saveOnEnter?: boolean;
    onClose?: () => void;
    onSave?: (text: string) => void;
    className?: Partial<Record<"input" | "icon" | "container", string>>;
};

const SmallDefault = ({ defaultValue, icon: Icon, onSave, onClose, onChange: onInputChange, saveOnEnter, innerRef, type = "text", className, ...props }: InputProps) => {
    const ref = useRef<HTMLInputElement>(null);
    const { value, onKeyDown, onChange: onChangeHandler } = useInput({ defaultValue, onSave, onClose, saveOnEnter });
    const usedRef = innerRef ?? ref;

    const onIconClick = useCallback(() => {
        usedRef.current?.focus();
    }, [usedRef]);

    const onChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            onChangeHandler(event);
            onInputChange?.(event);
        },
        [onInputChange, onChangeHandler]
    );

    return (
        <div className={clsx("flex items-center gap-3 overflow-hidden rounded-lg bg-dark-500 pl-3", className?.container)}>
            {Icon && (
                <div className={clsx("cursor-pointer py-3", className?.icon)} onClick={onIconClick}>
                    <Icon height={16} width={undefined} className="shrink-0 stroke-dark-50" />
                </div>
            )}

            <input
                ref={usedRef}
                type={type}
                className={clsx("ts-sm w-full bg-transparent py-3 focus:outline-none disabled:cursor-not-allowed disabled:opacity-30", className?.input)}
                placeholder="Enter your value here" //
                value={value}
                onKeyDown={onKeyDown}
                onChange={onChange}
                {...props}
            />
        </div>
    );
};

export const Small = memo(SmallDefault);

const LargeDefault = ({ defaultValue, icon: Icon, onSave, onClose, onChange: onInputChange, saveOnEnter, innerRef, type = "text", className, ...props }: InputProps) => {
    const ref = useRef<HTMLInputElement>(null);
    const { value, onKeyDown, onChange: onChangeHandler } = useInput({ defaultValue, onSave, onClose, saveOnEnter });
    const usedRef = innerRef ?? ref;

    const onIconClick = useCallback(() => {
        usedRef.current?.focus();
    }, [usedRef]);

    const onChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            onChangeHandler(event);
            onInputChange?.(event);
        },
        [onInputChange, onChangeHandler]
    );

    return (
        <div className={clsx("flex items-center gap-3 overflow-hidden rounded-lg bg-dark-500 pl-5", className?.container)}>
            {Icon && (
                <div className={clsx("cursor-pointer py-5", className?.icon)} onClick={onIconClick}>
                    <Icon height={20} width={undefined} className="shrink-0 stroke-dark-50" />
                </div>
            )}

            <input
                ref={usedRef}
                type={type}
                className={clsx("ts-sm w-full bg-transparent py-5 focus:outline-none disabled:cursor-not-allowed disabled:opacity-30", className?.input)}
                placeholder="Enter your value here" //
                value={value}
                onKeyDown={onKeyDown}
                onChange={onChange}
                {...props}
            />
        </div>
    );
};

export const Large = memo(LargeDefault);
