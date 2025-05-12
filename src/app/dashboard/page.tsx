"use client"

import { useEffect, useState } from "react";
import Map from "../components/Map";
import Nav from "../components/Nav";
import Modal from "../components/Modal"; // Modal 컴포넌트 임포트
import axios from "axios";
import Image from "next/image";

export default function Dashboard() {
    const [token, setToken] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        setToken(storedToken);
        console.log("JWT Token:", storedToken);

        if (storedToken) {
            fetch(`/api/`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${storedToken}`,
                    "Content-Type": "application/json",
                },
            })
                .then(res => res.json())
                .then(data => {
                    console.log("GET / 응답:", data);
                })
                .catch(err => {
                    console.error("GET 요청 실패:", err);
                });
        }
    }, []);

    // 모달 열기
    const openModal = () => setIsModalOpen(true);
    // 모달 닫기
    const closeModal = () => setIsModalOpen(false);

    // 모달에서 장소 등록 처리
    const handlePlaceSubmit = async (placeTitle: string, longitude:number, latitude:number, placeDescription: string, rating:number,imageFile: File) => {
        if (!token) {
            alert("인증된 사용자만 장소를 등록할 수 있습니다.");
            return;
        }

        const formData = new FormData();
        formData.append("placeTitle", placeTitle);
        formData.append("placeDescription", placeDescription);
        formData.append("lng", longitude.toString());
        formData.append("lat", latitude.toString());
        formData.append("rating", rating.toString());
        formData.append("placeImageURL", imageFile);


        try {
            const response = await axios.post(`/api/api/place/add`, formData, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.status === 200) {
                alert("장소가 성공적으로 등록되었습니다.");
                closeModal(); // 모달 닫기
            }
        } catch (error) {
            console.error("장소 등록 실패:", error);
            alert("장소 등록에 실패했습니다. 다시 시도해주세요.");
        }
    };

    return (
        <div className="relative min-h-screen font-[family-name:var(--font-geist-sans)]">
            <div className="absolute inset-0">
                {/* 검색창 */}
                <div className="absolute top-12 left-1/2 transform -translate-x-1/2 z-20 flex space-x-3 items-center">
                    {/* 검색창 박스 */}
                    <div className="flex items-center bg-white px-3 h-12 rounded-xl shadow-md w-72">
                        {/* 돋보기 아이콘 */}
                        <div className="relative w-5 h-5 mr-2">
                            <Image
                                src="/map/search.svg"
                                alt="검색"
                                layout="fill"
                                objectFit="contain"
                            />
                        </div>
                        {/* 입력창 */}
                        <input
                            type="text"
                            placeholder=""
                            className="w-full p-1 border-none focus:outline-none"
                        />
                    </div>

                    {/* 별도 버튼 */}
                    <button
                        onClick={openModal}
                        className="w-12 h-12 bg-[#1C4966] text-white rounded-xl hover:bg-blue-600 focus:outline-none flex justify-center items-center shadow-md"
                    >
                        <div className="relative w-5 h-5">
                            <Image
                                src="/map/addplace.svg"
                                alt="검색"
                                layout="fill"
                                objectFit="contain"
                            />
                        </div>
                    </button>
                </div>



                {/* 지도 컴포넌트 */}
                <Map />

                {/* 모달 열기 버튼 */}
                {/*<button*/}
                {/*    onClick={openModal}*/}
                {/*    className="absolute bottom-30 w-15 right-10 bg-black text-white p-4 rounded-full hover:bg-blue-700 focus:outline-none">*/}
                {/*    +*/}
                {/*</button>*/}
            </div>

            {/* 네비게이션 바 */}
            <div className="fixed bottom-0 left-0 right-0 z-10">
                <Nav />
            </div>

            {/* 모달 컴포넌트 */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSubmit={handlePlaceSubmit}
            />
        </div>

    );
}
