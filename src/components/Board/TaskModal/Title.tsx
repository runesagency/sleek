import { useDebouncedValue } from "@mantine/hooks";
import { useCallback, useEffect, useState } from "react";

type TitleProps = {
    defaultTitle: string;
    onUpdate: (title: string) => void;
};

export default function Title({ defaultTitle, onUpdate }: TitleProps) {
    const [invalid, setInvalid] = useState(false);
    const [value, setValue] = useState(defaultTitle);
    const [debouncedValue] = useDebouncedValue(value, 200);

    const onChange = useCallback(
        (event: React.ChangeEvent<HTMLTextAreaElement>) => {
            event.target.style.height = "0px";
            event.target.style.height = event.target.scrollHeight + "px";

            const value = event.target.value;

            setValue(value);
            setInvalid(value.trim().length > 100 || value.trim().length === 0);
        },
        [setValue]
    );

    const setFocusCursor = useCallback((event: React.FocusEvent<HTMLTextAreaElement>) => {
        const defaultValue = event.target.value;
        event.target.value = "";
        event.target.value = defaultValue;

        event.target.style.height = "0px";
        event.target.style.height = event.target.scrollHeight + "px";
    }, []);

    useEffect(() => {
        if (debouncedValue !== defaultTitle && !invalid) {
            onUpdate(debouncedValue);
        }
    }, [debouncedValue, defaultTitle, invalid, onUpdate]);

    return (
        <textarea
            placeholder="Card title should not be empty and should not exceed 100 characters"
            rows={1}
            value={value}
            autoFocus
            onChange={onChange}
            onFocus={setFocusCursor}
            className={`
                hide-scrollbar flex-1 resize-none border-b bg-transparent pb-3 text-left text-3xl font-bold focus:outline-none
                ${invalid ? "border-red-500 text-red-500" : "border-b-dark-600 text-dark-50"}
            `}
        />
    );
}
