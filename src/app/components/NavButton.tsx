import Image from "next/image";
interface NavButtonProps {
    src: string;
    alt: string;
    width: number;
    height: number;
    text: string;
}
export default function NavButton({ src, alt, text }: Omit<NavButtonProps, 'width' | 'height'>) {
    return (
        <div className="flex flex-col items-center justify-center">
            <div className="w-5 h-5 relative"> {/* 32px x 32px */}
                <Image src={src} alt={alt} fill className="object-contain" />
            </div>
            <div className="text-sm">{text}</div>
        </div>
    );
}
