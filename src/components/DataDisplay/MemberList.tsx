import Avatar from "@/components/Miscellaneous/Avatar";

type User = {
    name: string;
};

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
    let shownUsers = users;

    if (min && users.length < min) {
        shadowAvatarCount = min - users.length;
    }

    if (max) {
        if (users.length > max) {
            shownUsers = users.slice(0, max - 1);

            shownUsers.push({
                name: `+${users.length - max}`,
            });
        }
    }

    return (
        <div className="flex shrink-0 -space-x-1">
            {shownUsers.map(({ name }, i) => (
                <Avatar key={i} className="h-6 w-6 rounded-full border border-dark-600 object-cover object-center" seed={name} />
            ))}

            {[...Array(shadowAvatarCount)].map((_, i) => (
                <div key={i} className="h-6 w-6 rounded-full border border-dark-600 bg-dark-700 object-cover object-center" />
            ))}
        </div>
    );
};

const Large = ({ users, max, min }: MemberListProps) => {
    let shadowAvatarCount = 0;
    let shownUsers = users;

    if (min && users.length < min) {
        shadowAvatarCount = min - users.length;
    }

    if (max) {
        if (users.length > max) {
            shownUsers = users.slice(0, max - 1);

            shownUsers.push({
                name: `+${users.length - max}`,
            });
        }
    }

    return (
        <div className="flex shrink-0 -space-x-2">
            {users.map(({ name }, i) => (
                <Avatar key={i} className="h-10 w-10 rounded-full border border-dark-600 object-cover object-center" seed={name} />
            ))}

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
