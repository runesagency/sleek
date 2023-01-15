import type { DetailedHTMLProps, TextareaHTMLAttributes } from "react";

import { useLocalStorage } from "@mantine/hooks";
import { useCallback, useState, memo } from "react";

type UseValueHandlerReturns = {
    value: string;
    setValue: (value: string) => void;
    removeSavedValue?: () => void;
};

const useValueHandler = (active: boolean, key?: string, defaultValue = ""): UseValueHandlerReturns => {
    const [value, setValue] = useState(defaultValue);
    const [savedValue, setSavedValue, removeSavedValue] = useLocalStorage({
        key: key ?? "textarea",
        defaultValue,
    });

    if (!active) {
        return {
            value,
            setValue,
        };
    } else {
        return {
            value: savedValue,
            setValue: setSavedValue,
            removeSavedValue,
        };
    }
};

type TextareaProps = Omit<DetailedHTMLProps<TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>, "defaultValue" | "ref"> & {
    innerRef?: React.Ref<HTMLTextAreaElement>;
    defaultValue?: string;
    saveOnEnter?: boolean;
    onClose?: () => void;
    onSave?: (text: string) => void;
} & (
        | {
              saveToLocalStorage?: false;
              localStorageKey?: never;
          }
        | {
              saveToLocalStorage: true;
              localStorageKey: string;
          }
    );

const Textarea = ({ defaultValue, saveToLocalStorage, localStorageKey, onSave: onValueSaved, onClose, saveOnEnter, innerRef, ...props }: TextareaProps) => {
    const { value, setValue, removeSavedValue } = useValueHandler(saveToLocalStorage || false, localStorageKey, defaultValue ?? "");

    const onSave = useCallback(() => {
        if (value) {
            onValueSaved?.(value);
        }

        onClose?.();
        removeSavedValue?.();
    }, [onValueSaved, onClose, removeSavedValue, value]);

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

            if (event.target.value === "") {
                removeSavedValue?.();
            }
        },
        [removeSavedValue, setValue]
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

export default memo(Textarea);
