import type { ButtonProps } from "@/components/Forms/Button";
import type { CheckboxProps } from "@/components/Forms/Checkbox";
import type { InputProps } from "@/components/Forms/Input";
import type { TextareaProps } from "@/components/Forms/Textarea";
import type { labels as Label, users as User } from "@prisma/client";
import type { TablerIcon } from "@tabler/icons";

import { createContext } from "react";

export enum ControlledMenuFormVariant {
    Input = "input",
    Checkbox = "checkbox",
    Button = "button",
    Textarea = "textarea",
}

export type ControlledMenuFormVariantType =
    | {
          type: ControlledMenuFormVariant.Input;
          props: InputProps;
      }
    | {
          type: ControlledMenuFormVariant.Checkbox;
          props: CheckboxProps;
      }
    | {
          type: ControlledMenuFormVariant.Button;
          props: ButtonProps;
      }
    | {
          type: ControlledMenuFormVariant.Textarea;
          props: TextareaProps;
      };

export enum ControlledMenuVariant {
    ContextMenu = "context-menu",
    MemberList = "member-list",
    LabelList = "label-list",
    Forms = "forms",
}

export type ControlledMenuVariantType =
    | {
          type: ControlledMenuVariant.ContextMenu;
          lists: {
              id: string;
              name: string;
              icon: TablerIcon;
          }[];
      }
    | {
          type: ControlledMenuVariant.MemberList;
          lists: User[];
      }
    | {
          type: ControlledMenuVariant.LabelList;
          lists: Label[];
      }
    | {
          type: ControlledMenuVariant.Forms;
          lists: (ControlledMenuFormVariantType & {
              id: string;
              label: string;
          })[];
      };

export enum TargetPosition {
    Element = "element",
    Cursor = "cursor",
}

export type ControlledMenuContextProps = {
    // Generate a random id for each menu instance, on toggle menu, if the id is the same,
    // then close the menu, otherwise open the menu
    instanceId: string;
    targetRef: React.MutableRefObject<HTMLElement | null>;
    targetPosition: React.MutableRefObject<TargetPosition>;
    offset: React.MutableRefObject<{ x: number; y: number }>;
    clientCoordinates: React.MutableRefObject<{ x: number; y: number }>;
    setOpen: (isOpen: boolean) => void;
    setInstanceId: (id: string) => void;
    setTargetRef: (ref: HTMLElement) => void;
    setOffset: (x: number, y: number) => void;
    setClientCoordinates: (x: number, y: number) => void;
    setTargetPosition: (position: TargetPosition) => void;
    setVariant: (variant: ControlledMenuVariantType) => void;
} & (
    | ({ isOpen: true } & ControlledMenuVariantType)
    | {
          isOpen: false;
          type: null;
          lists: null;
      }
);

const defaultUninitializedFunction = () => {
    throw new Error("ControlledMenuContext is not initialized");
};

const defaultRefValue = <T>(value: T): React.MutableRefObject<T> => ({
    current: value,
});

export const ContextMenuContext = createContext<ControlledMenuContextProps>({
    instanceId: "",
    isOpen: false,
    type: null,
    lists: null,
    targetRef: defaultRefValue(null),
    offset: defaultRefValue({ x: 0, y: 0 }),
    clientCoordinates: defaultRefValue({ x: 0, y: 0 }),
    targetPosition: defaultRefValue(TargetPosition.Element),
    setOpen: defaultUninitializedFunction,
    setVariant: defaultUninitializedFunction,
    setInstanceId: defaultUninitializedFunction,
    setTargetRef: defaultUninitializedFunction,
    setClientCoordinates: defaultUninitializedFunction,
    setTargetPosition: defaultUninitializedFunction,
    setOffset: defaultUninitializedFunction,
});

export { default as useContextMenu } from "./use-context-menu";
