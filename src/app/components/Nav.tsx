import NavButton from "./NavButton";

export default function Nav() {
    return (
        <footer className="bg-white mt-12 rounded-t-xl border-white text-center text-gray-600 dark:text-gray-400">
            <div className="grid grid-cols-4 py-5 px-3">
                <NavButton src="/map/user.svg" alt="mycar"  text="마이" />
                <NavButton src="/map/heart.svg" alt="mycar" text="즐겨찾기" />

                <NavButton src="/map/marker.svg" alt="mycar" text="주변" />
                <NavButton src="/map/user.svg" alt="mycar"  text="마이" />
            </div>
        </footer >
    );
}