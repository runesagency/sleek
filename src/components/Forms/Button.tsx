import type { TablerIcon } from "@tabler/icons";
import type { ButtonHTMLAttributes, DetailedHTMLProps } from "react";

import { memo } from "react";

type ButtonProps = DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
    icon?: TablerIcon;
    fit?: boolean;
};

const Small = ({ children, className, icon: Icon, fit, ...props }: ButtonProps) => {
    return (
        <button
            className={`
                ts-sm flex items-center justify-center gap-2 rounded-lg bg-dark-600 px-3 py-1 text-dark-50 duration-200 hover:opacity-50 
                ${fit ? "w-max" : "w-full"} ${className}
            `}
            {...props}
        >
            {Icon && <Icon height={16} width={undefined} className="shrink-0" />}
            {children}
        </button>
    );
};

const Large = ({ children, className, icon: Icon, fit, ...props }: ButtonProps) => {
    return (
        <button
            className={`
                ts-base flex items-center justify-center gap-2 rounded-lg bg-dark-600 px-4 py-2 text-dark-50 duration-200 hover:opacity-50 
                ${fit ? "w-max" : "w-full"} ${className}
            `}
            {...props}
        >
            {Icon && <Icon height={20} width={undefined} className="shrink-0" />}
            {children}
        </button>
    );
};

const Button = {
    Small: memo(Small),
    Large: memo(Large),
};

export default Button;
