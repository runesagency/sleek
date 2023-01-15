export default function Label({ name, color, className }: { name: string; color: string | null; className?: string }) {
    return (
        <div
            className={`rounded-full bg-dark-800 px-2 py-1 text-xs ${className}`}
            style={{
                backgroundColor: color || undefined,
            }}
        >
            {name}
        </div>
    );
}
