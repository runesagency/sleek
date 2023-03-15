import tailwindConfig from "tailwind.config";

import { useCallback, useState } from "react";
import RSwitch from "react-switch";

export default function Switch() {
    const [checked, setChecked] = useState(false);

    const onCheck = useCallback(() => {
        setChecked((prev) => !prev);
    }, []);

    return <RSwitch checked={checked} onChange={onCheck} checkedIcon={false} uncheckedIcon={false} onColor={tailwindConfig.theme.extend.colors.dark[500]} />;
}
