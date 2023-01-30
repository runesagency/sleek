import type { ReactNode } from "react";

import dynamic from "next/dynamic";
import React, { memo } from "react";

// eslint-disable-next-line react/jsx-no-useless-fragment
const NoSSR = ({ children }: { children: ReactNode }) => <>{children}</>;

const NoSSRComponent = dynamic(() => Promise.resolve(NoSSR), {
    ssr: false,
});

export default memo(NoSSRComponent);