import { memo } from "react";

type LabelProps = {
    name: string;
    color: string | null;
    className?: string;
};

const Label = ({ name, color, className }: LabelProps) => {
    return (
        <div
            className={`rounded-full bg-dark-800 px-2 py-1 text-xs ${className}`}
            style={{
                backgroundColor: color || undefined,
            }}
        >
            {name}
        </div>
    );
};

export default memo(Label);
