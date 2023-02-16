import type { ButtonProps } from "@/components/Forms/Button";
import type { CheckboxProps } from "@/components/Forms/Checkbox";
import type { InputProps } from "@/components/Forms/Input";
import type { TextareaProps } from "@/components/Forms/Textarea";
import type { labels as Label, users as User } from "@prisma/client";
import type { TablerIcon } from "@tabler/icons";

export enum MenuVariant {
    Context = "context",
    MemberList = "member-list",
    LabelList = "label-list",
    Forms = "forms",
}

export type MenuVariantType = MenuVariantContext | MenuVariantMemberList | MenuVariantLabelList | MenuVariantForm;

/**
 * ------------------------------
 * Menu Variant: Context
 * ------------------------------
 */

export type MenuVariantContext = {
    type: MenuVariant.Context;
    lists: MenuVariantContextItem[];
};

export type MenuVariantContextItem = {
    name: string;
    icon: TablerIcon;
} & (
    | {
          href: string;
          onClick?: never;
      }
    | {
          onClick: () => void;
          href?: never;
      }
);

/**
 * ------------------------------
 * Menu Variant: Member List
 * ------------------------------
 */

export type MenuVariantMemberList = {
    type: MenuVariant.MemberList;
    lists: User[];
    onClick: (user: User) => void;
};

/**
 * ------------------------------
 * Menu Variant: Label List
 * ------------------------------
 */

export type MenuVariantLabelList = {
    type: MenuVariant.LabelList;
    lists: Label[];
    onClick: (label: Label) => void;
};

/**
 * ------------------------------
 * Menu Variant: Forms
 * ------------------------------
 */

export type MenuVariantForm = {
    type: MenuVariant.Forms;
    lists: MenuVariantFormItem[];
    onSubmit: (values: Record<string, string>) => void;
};

export type MenuVariantFormItem = MenuFormVariantType & {
    id: string;
    label: string;
};

export enum MenuFormVariant {
    Input = "input",
    Checkbox = "checkbox",
    Button = "button",
    Textarea = "textarea",
}

export type MenuFormVariantType =
    | {
          type: MenuFormVariant.Input;
          props: InputProps;
      }
    | {
          type: MenuFormVariant.Checkbox;
          props: CheckboxProps;
      }
    | {
          type: MenuFormVariant.Button;
          props: ButtonProps;
      }
    | {
          type: MenuFormVariant.Textarea;
          props: TextareaProps;
      };

/**
 * ------------------------------
 * Menu Context
 * ------------------------------
 */

export enum MenuPosition {
    Element = "element",
    Cursor = "cursor",
}

export type MenuContextOpenProps = MenuVariantType & { isOpen: true };

export type MenuContextCloseProps = {
    isOpen: false;
    type: null;
    lists: null;
};

export type MenuContextProps = (MenuContextOpenProps | MenuContextCloseProps) & {
    // Generate a random id for each menu instance, on toggle menu,
    // if the id is the same, then close the menu, otherwise open the menu
    instanceId: string;
    offset: React.MutableRefObject<{ x: number; y: number }>;
    targetRef: React.MutableRefObject<HTMLElement | null>;
    targetPosition: React.MutableRefObject<MenuPosition>;
    clientCoordinates: React.MutableRefObject<{ x: number; y: number }>;
    setOpen: (isOpen: boolean) => void;
    setInstanceId: (id: string) => void;
    setTargetRef: (ref: HTMLElement) => void;
    setOffset: (x: number, y: number) => void;
    setClientCoordinates: (x: number, y: number) => void;
    setTargetPosition: (position: MenuPosition) => void;
    setVariant: (variant: MenuVariantType) => void;
};
