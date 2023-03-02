"use client";

import type { AvatarFullConfig, NiceAvatarProps } from "react-nice-avatar";

import { useMemo } from "react";
import NiceAvatar, { genConfig } from "react-nice-avatar";

type AvatarProps = NiceAvatarProps & {
    seed?: string | AvatarFullConfig;
};

const Avatar = ({ seed, ...props }: AvatarProps) => {
    const config = useMemo(() => genConfig(seed), [seed]);

    return <NiceAvatar {...config} {...props} />;
};

export default Avatar;
