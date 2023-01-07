import type { ReactNode } from "react";

import dynamic from "next/dynamic";
import React from "react";

// eslint-disable-next-line react/jsx-no-useless-fragment
const NoSSR = ({ children }: { children: ReactNode }) => <>{children}</>;

export default dynamic(() => Promise.resolve(NoSSR), {
    ssr: false,
});
