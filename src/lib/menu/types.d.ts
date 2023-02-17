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
    title?: string;
    type: MenuVariant.MemberList;
    lists: User[];
    onSelect: (user: User) => void;
    onBack?: () => void;
};

/**
 * ------------------------------
 * Menu Variant: Label List
 * ------------------------------
 */

export type MenuVariantLabelList = {
    title?: string;
    type: MenuVariant.LabelList;
    lists: Label[];
    onSelect: (label: Label) => void;
    onBack?: () => void;
};

/**
 * ------------------------------
 * Menu Variant: Forms
 * ------------------------------
 */

export type MenuVariantForm = {
    title?: string;
    type: MenuVariant.Forms;
    lists: MenuVariantFormItem[];
    submitButtonLabel?: string;
    onSubmit: (values: Record<string, string>) => void;
    onBack?: () => void;
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

export enum MenuAnchor {
    Element = "element",
    Cursor = "cursor",
}

export enum MenuDirection {
    Top = "top",
    Bottom = "bottom",
    Left = "left",
    Right = "right",
}

export enum MenuAlignment {
    Start = "start",
    Center = "center",
    End = "end",
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
    anchor: React.MutableRefObject<MenuAnchor>;
    direction: React.MutableRefObject<MenuDirection>;
    alignment: React.MutableRefObject<MenuAlignment>;
    offset: React.MutableRefObject<{ x: number; y: number }>;
    targetRef: React.MutableRefObject<HTMLElement | null>;
    clientCoordinates: React.MutableRefObject<{ x: number; y: number }>;
    setOpen: (isOpen: boolean) => void;
    setInstanceId: (id: string) => void;
    setVariant: (variant: MenuVariantType) => void;
};
