import type { User } from "@prisma/client";

import Avatar from "@/components/Miscellaneous/Avatar";

type MemberListProps = {
    users: User[];
    max?: number;
    className?: string;
};

const Small = ({ users, max }: MemberListProps) => {
    return (
        <div className="flex shrink-0 -space-x-1">
            {users.map((user, i) => {
                if (!user || (max && i > max)) return null;

                const title = max ? (i !== max - 1 ? user.name : `+${users.length - max}`) : "";

                return <Avatar key={i} className="h-6 w-6 rounded-full border border-dark-600 object-cover object-center" seed={title} />;
            })}
        </div>
    );
};

const Large = ({ users, max }: MemberListProps) => {
    return (
        <div className="flex shrink-0 -space-x-2">
            {users.map((user, i) => {
                if (!user || (max && i > max)) return null;

                const title = max ? (i !== max - 1 ? user.name : `+${users.length - max}`) : "";

                return <Avatar key={i} className="h-10 w-10 rounded-full border border-dark-600 object-cover object-center" seed={title} />;
            })}
        </div>
    );
};

const MemberList = {
    Small,
    Large,
};

export default MemberList;
