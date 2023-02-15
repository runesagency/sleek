import { IconCheck } from "@tabler/icons";
import clsx from "clsx";
import { memo, useCallback, useState } from "react";

export type CheckboxProps = {
    defaultChecked?: boolean;
    onChange?: (checked: boolean) => void;
};

const Checkbox = ({ defaultChecked, onChange }: CheckboxProps) => {
    const [checked, setChecked] = useState(defaultChecked);

    const handleClick = useCallback(() => {
        setChecked(!checked);
        onChange?.(!checked);
    }, [checked, onChange]);

    return (
        <div onClick={handleClick} className={clsx("flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-lg hover:opacity-75", checked ? "bg-dark-600" : "bg-dark-50")}>
            {checked && <IconCheck height={16} width={undefined} className="stroke-dark-50" />}
        </div>
    );
};

export default memo(Checkbox);
