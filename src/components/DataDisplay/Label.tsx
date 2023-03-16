import clsx from "clsx";

type LabelProps = {
    name: string;
    color: string | null;
    className?: string;
};

const Label = ({ name, color, className }: LabelProps) => {
    return (
        <div
            className={clsx("ts-xs rounded-full bg-dark-800 px-2 py-1", className)}
            style={{
                backgroundColor: color || undefined,
            }}
        >
            {name}
        </div>
    );
};

export default Label;
