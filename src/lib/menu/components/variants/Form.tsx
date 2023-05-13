import type { MenuVariantForm, MenuVariantFormItem } from "@/lib/menu";
import type { MenuSharedProps } from "@/lib/menu/components/Menu";

import { Button, Input, Checkbox, Textarea } from "@/components/Forms";
import { MenuFormVariant as MenuFormVariantSelection } from "@/lib/menu";

import { IconChevronLeft } from "@tabler/icons-react";
import { memo, useCallback, useState } from "react";

type MenuFormComponentItemProps = MenuVariantFormItem & {
    setValue: (id: string, value: unknown) => void;
};

const MenuFormComponentItem = ({ id, label, props, type, setValue }: MenuFormComponentItemProps) => {
    const onChange = useCallback(
        (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { value } = e.currentTarget;

            setValue(id, value);
        },
        [id, setValue]
    );

    const onCheckboxChange = useCallback(
        (checked: boolean) => {
            setValue(id, checked);
        },
        [id, setValue]
    );

    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={id} className="ts-sm">
                {label}
            </label>

            {type === MenuFormVariantSelection.Input && <Input.Large onChange={onChange} id={id} {...props} />}
            {type === MenuFormVariantSelection.Textarea && <Textarea onChange={onChange} id={id} {...props} />}
            {type === MenuFormVariantSelection.Button && <Button.Large {...props} />}
            {type === MenuFormVariantSelection.Checkbox && <Checkbox onChange={onCheckboxChange} {...props} />}
        </div>
    );
};

type MenuFormComponentProps = MenuSharedProps & Omit<MenuVariantForm, "type">;

const MenuFormComponent = ({ lists, onSubmit: onFormSubmit, onBack, title, innerRef, closeMenu, submitButtonLabel, ...props }: MenuFormComponentProps) => {
    const [values, setValues] = useState<Record<string, unknown>>({});

    const onReturnBack = useCallback(() => {
        if (!onBack) return;

        onBack(closeMenu);
    }, [closeMenu, onBack]);

    const onValueSet = useCallback((id: string, value: unknown) => {
        setValues((prev) => ({
            ...prev,
            [id]: value,
        }));
    }, []);

    const onSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();

            if (!onFormSubmit) return;

            onFormSubmit(values as never);
            closeMenu();
        },
        [closeMenu, onFormSubmit, values]
    );

    return (
        <section ref={innerRef} {...props} className="flex w-72 flex-col overflow-hidden rounded-lg border border-dark-600 bg-dark-700 text-dark-50">
            <header className="flex items-center justify-between gap-2 bg-dark-600 px-5 py-2">
                {onBack ? <IconChevronLeft height={20} width={undefined} className="cursor-pointer duration-200 hover:opacity-75" onClick={onReturnBack} /> : <div />}

                <span className="ts-sm">{title || "Form"}</span>

                <div />
            </header>

            <form onSubmit={onSubmit} className="grid gap-5 p-5">
                {lists.map((props, index) => (
                    <MenuFormComponentItem key={index} {...props} setValue={onValueSet} />
                ))}

                <Button.Large type="submit">{submitButtonLabel ?? "Submit"}</Button.Large>
            </form>
        </section>
    );
};

export default memo(MenuFormComponent);
