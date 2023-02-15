import clsx from "clsx";

export type SwitchButtonProps = {
    active?: boolean;
    children: React.ReactNode;
    onClick?: () => void;
};

export default function SwitchButton({ active = false, onClick, children }: SwitchButtonProps) {
    return (
        <button onClick={onClick} className={clsx("ts-sm border-b-2 px-4 py-3 duration-200 hover:border-b-dark-500", active ? "border-b-dark-400" : "border-b-transparent")}>
            {children}
        </button>
    );
}
