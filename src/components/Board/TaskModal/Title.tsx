import { useDebouncedState } from "@mantine/hooks";
import { useCallback, useEffect } from "react";

type TitleProps = {
    defaultTitle: string;
    onChange: (title: string) => void;
};

export default function Title({ defaultTitle, onChange }: TitleProps) {
    const [updatedTitle, setUpdatedTitle] = useDebouncedState(defaultTitle, 200);

    useEffect(() => {
        onChange(updatedTitle);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [updatedTitle]);

    const onTitleChange = useCallback(
        (event: React.ChangeEvent<HTMLTextAreaElement>) => {
            event.target.style.height = "0px";
            event.target.style.height = event.target.scrollHeight + "px";

            setUpdatedTitle(event.target.value);
        },
        [setUpdatedTitle]
    );

    const setFocusCursor = useCallback((event: React.FocusEvent<HTMLTextAreaElement>) => {
        const defaultValue = event.target.value;
        event.target.value = "";
        event.target.value = defaultValue;
    }, []);

    return (
        <textarea
            placeholder="Enter Your Card Title Here..."
            rows={1}
            className="hide-scrollbar flex-1 resize-none border-b border-b-dark-600 bg-transparent pb-3 text-left text-3xl font-bold focus:outline-none"
            defaultValue={defaultTitle}
            autoFocus
            onChange={onTitleChange}
            onFocus={setFocusCursor}
        />
    );
}
