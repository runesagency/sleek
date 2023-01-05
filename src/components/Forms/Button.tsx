import type { ButtonHTMLAttributes, DetailedHTMLProps } from "react";
import type { TablerIcon } from "@tabler/icons";

type ButtonProps = DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
    icon?: TablerIcon;
};

export const Small = ({ children, className, icon: Icon, ...props }: ButtonProps) => {
    return (
        <button className={`flex w-max items-center justify-center gap-2 rounded-lg bg-dark-600 px-3 py-1 text-sm font-bold text-dark-50 duration-200 hover:opacity-50 ${className}`} {...props}>
            {Icon && <Icon height={16} width={undefined} className="shrink-0" />}
            {children}
        </button>
    );
};
