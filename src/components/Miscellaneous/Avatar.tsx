import type { Options } from "@dicebear/core";
import type { DetailedHTMLProps, ImgHTMLAttributes } from "react";

import { initials } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";
import { useMemo } from "react";

type AvatarProps = Omit<DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>, "src" | "loading"> & {
    config?: Partial<initials.Options & Options>;
};

const Avatar = ({ config, alt, ...props }: AvatarProps) => {
    const avatar = useMemo(() => {
        return createAvatar(initials, config).toDataUriSync();
    }, [config]);

    return <img src={avatar} loading="lazy" alt={alt || "Avatar"} {...props} />;
};

export default Avatar;
