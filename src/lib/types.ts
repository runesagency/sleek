import type { ParsedSSRProps } from "@/lib/utils/parse-ssr-props";
import type {
    cards,
    card_attachments,
    card_checklists,
    card_labels,
    card_timers,
    card_users,
    card_checklist_tasks,
    card_checklist_task_users,
    users,
    labels,
    activities,
    attachments,
    lists,
} from "@prisma/client";

export type List = lists;

export type Card = ParsedSSRProps<
    cards & {
        labels: (card_labels & {
            label: labels | null;
        })[];
        users: (card_users & {
            user: users | null;
        })[];
        activities: (activities & {
            user: users;
        })[];
        attachments: (card_attachments & {
            attachment: attachments;
        })[];
        cover:
            | (card_attachments & {
                  attachment: attachments;
              })
            | null;
        checklists: (card_checklists & {
            tasks: (card_checklist_tasks & {
                users: (card_checklist_task_users & {
                    user: users | null;
                })[];
            })[];
        })[];
        timers: card_timers[];
        creator: users;
    }
>;
