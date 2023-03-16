import clsx from "clsx";
import { useCallback, useState } from "react";
import ReactSwitch from "react-switch";

export type SwitchProps = {
    defaultChecked?: boolean;
    disabled?: boolean;
    onChange?: (checked: boolean) => void;
};

export default function Switch({ defaultChecked, onChange, disabled }: SwitchProps) {
    const [checked, setChecked] = useState(defaultChecked ?? false);

    const onCheck = useCallback(() => {
        onChange?.(!checked);
        setChecked((prev) => !prev);
    }, [checked, onChange]);

    return (
        <>
            <style>{`
                .react-switch-bg {
                    background-color: transparent !important;
                }
            `}</style>

            <ReactSwitch
                checked={checked}
                disabled={disabled}
                onChange={onCheck}
                checkedIcon={false}
                uncheckedIcon={false}
                className={clsx("h-max border", checked ? "border-dark-300 bg-dark-400" : "border-dark-400 bg-dark-500")}
            />
        </>
    );
}
