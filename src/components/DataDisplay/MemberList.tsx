import type { User } from "@prisma/client";

import Avatar from "@/components/Miscellaneous/Avatar";

type MemberListProps = {
    users: User[];
    max?: number;
    className?: string;
    /**
     * When using min, if the number of users is less than min, it will be padded with empty avatars.
     */
    min?: number;
};

const Small = ({ users, max, min }: MemberListProps) => {
    let shadowAvatarCount = 0;

    if (min && users.length < min) {
        shadowAvatarCount = min - users.length;
    }

    return (
        <div className="flex shrink-0 -space-x-1">
            {users.map((user, i) => {
                if (!user || (max && i > max)) return null;

                const title = max ? (i !== max - 1 ? user.name : `+${users.length - max}`) : "";

                return <Avatar key={i} className="h-6 w-6 rounded-full border border-dark-600 object-cover object-center" seed={title} />;
            })}

            {[...Array(shadowAvatarCount)].map((_, i) => (
                <div key={i} className="h-6 w-6 rounded-full border border-dark-600 bg-dark-700 object-cover object-center" />
            ))}
        </div>
    );
};

const Large = ({ users, max, min }: MemberListProps) => {
    let shadowAvatarCount = 0;

    if (min && users.length < min) {
        shadowAvatarCount = min - users.length;
    }

    return (
        <div className="flex shrink-0 -space-x-2">
            {users.map((user, i) => {
                if (!user || (max && i > max)) return null;

                const title = max ? (i !== max - 1 ? user.name : `+${users.length - max}`) : "";

                return <Avatar key={i} className="h-10 w-10 rounded-full border border-dark-600 object-cover object-center" seed={title} />;
            })}

            {[...Array(shadowAvatarCount)].map((_, i) => (
                <div key={i} className="h-10 w-10 rounded-full border border-dark-600 bg-dark-700 object-cover object-center" />
            ))}
        </div>
    );
};

const MemberList = {
    Small,
    Large,
};

export default MemberList;
