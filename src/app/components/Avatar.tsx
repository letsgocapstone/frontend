interface AvatarProps {
    name: string;
}

export default function Avatar({ name }: AvatarProps) {
    const initials = name.slice(0, 2).toUpperCase();
    return (
        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
            {initials}
        </div>
    );
}
