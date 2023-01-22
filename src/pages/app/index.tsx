import Link from "next/link";

export default function Home() {
    return (
        <main className="flex h-full max-h-screen min-h-screen w-screen flex-col items-center overflow-auto bg-slate-900 text-white">
            <div className="flex w-full items-center justify-between bg-slate-800/75 px-20 py-5">
                <img src="https://britonenglish.co.id/images/logo-light.png" alt="Logo" className="h-8" />

                <div className="flex items-center gap-8">
                    <span>people</span>
                    <span>notifications</span>

                    <div className="flex items-center gap-4 rounded-md bg-slate-700 px-3.5 py-2">
                        <img src="https://picsum.photos/200" alt="User Image" className="h-7 rounded-full" />
                        <p className="text-sm font-semibold">John Doe</p>
                    </div>
                </div>
            </div>

            <div className="grid w-full grid-cols-5 gap-8 py-5 px-20">
                {Array(16)
                    .fill(0)
                    .map((_, i) => (
                        <Link
                            key={i}
                            href={`/projects/${i + 1}`}
                            className="relative flex aspect-square w-full flex-col justify-end gap-2 rounded-md bg-cover bg-center p-5 duration-200 hover:opacity-75"
                            style={{
                                backgroundImage: `url(https://picsum.photos/200?random=${i}1)`,
                            }}
                        >
                            <div className="absolute top-0 left-0 h-full w-full rounded-md bg-black/20" />

                            <img src={`https://picsum.photos/200?random=${i}`} alt="Company Logo" className="h-14 w-14 rounded-full" />

                            <h1 className="text-xl font-bold">Company Name</h1>
                        </Link>
                    ))}
            </div>
        </main>
    );
}
