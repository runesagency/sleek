import { IconCheck, IconX } from "@tabler/icons";

export default function Comparison() {
    const comparisonDummyData = [
        {
            featName: "Starting Price",
            othrProduct: "$500/year for 10 People",
            ourProduct: "$500/year for 10 People",
        },
        {
            featName: "Folder",
            othrProduct: false,
            ourProduct: true,
        },
        {
            featName: "Move Items Between Folders",
            othrProduct: false,
            ourProduct: true,
        },
        {
            featName: "Mover Folders Between Boards",
            othrProduct: false,
            ourProduct: true,
        },
        {
            featName: "Checkbox",
            othrProduct: true,
            ourProduct: true,
        },
        {
            featName: "Kanban View",
            othrProduct: false,
            ourProduct: true,
        },
        {
            featName: "Kanban View",
            othrProduct: false,
            ourProduct: true,
        },
        {
            featName: "Calendar View",
            othrProduct: false,
            ourProduct: true,
        },
    ];

    return (
        <div className="flex flex-col gap-0">
            <div className="flex justify-between border-b border-dark-600 px-8 py-5">
                <h1 className="shrink-0 basis-2/6 text-2xl">Feature</h1>
                <h1 className="text-2xl">Other Products</h1>
                <img src="/logoipsum-286.svg" className="text-white" alt="logo_ipsum" width="174" height="32" />
            </div>
            {comparisonDummyData?.map((val, idx) => (
                <div key={idx} className="flex justify-between px-8 py-5">
                    <div className="shrink-0 basis-2/6">
                        <h1 className="text-base">{val.featName}</h1>
                    </div>
                    {typeof val.othrProduct === "boolean" ? (
                        <>
                            <div className="w-44 min-w-max">{val.othrProduct ? <IconCheck className="mx-auto" /> : <IconX className="mx-auto opacity-50" />}</div>
                            <div className="w-44 min-w-max">{val.ourProduct ? <IconCheck className="mx-auto" /> : <IconX className="mx-auto opacity-50" />}</div>
                        </>
                    ) : (
                        <>
                            <h1 className="text-base">{val.othrProduct}</h1>
                            <h1 className="text-base">{val.ourProduct}</h1>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
}
