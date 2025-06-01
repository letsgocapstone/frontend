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
    const [reloadMap, setReloadMap] = useState(false);

    const [input, setInput] = useState("");
    const [suggestions, setSuggestions] = useState<string[]>([]);

    useEffect(() => {
        if (input.length === 0) {
            setSuggestions([]);
            return;
        }

        const timeoutId = setTimeout(() => {
            fetch(`/api/tags/autocomplete?prefix=${encodeURIComponent(input)}`)
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`HTTP error! status: ${res.status}`);
                    }
                    return res.text();  // 우선 텍스트로 받아서 빈 응답 체크
                })
                .then(text => {
                    if (!text) {
                        setSuggestions([]);
                        return;
                    }
                    try {
                        const data = JSON.parse(text);
                        setSuggestions(data);
                    } catch (e) {
                        console.error('JSON 파싱 에러:', e);
                        setSuggestions([]);
                    }
                })
                .catch(err => {
                    console.error('Fetch 에러:', err);
                    setSuggestions([]);
                });
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [input]);





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
    const handlePlaceSubmit = async (placeTitle: string, longitude:number, latitude:number, placeDescription: string, rating:number,imageFile: File, tags: string[]) => {
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
        tags.forEach(tag => formData.append("tags", tag));

        // formData.append("tags", JSON.stringify(tags));


        try {
            const response = await axios.post(`/api/api/place/add`, formData, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.status === 200) {
                alert("장소가 성공적으로 등록되었습니다.");
                setReloadMap(prev => !prev);
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
                    <div className="flex flex-col items-center bg-white px-3 h-auto rounded-xl shadow-md w-72 relative">
                        {/* 검색창 */}
                        <div className="flex items-center w-full h-12">
                            <div className="relative w-5 h-5 mr-2">
                                <Image
                                    src="/map/search.svg"
                                    alt="검색"
                                    layout="fill"
                                    objectFit="contain"
                                />
                            </div>
                            <input
                                type="text"
                                value={input}
                                className="w-full p-1 border-none focus:outline-none"
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="태그 검색"
                            />
                        </div>

                        {/* 추천 태그 리스트 */}
                        {suggestions.length > 0 && (
                            <ul className="absolute top-full left-0 right-0 bg-white border border-gray-200 mt-1 rounded-md shadow-lg z-30 max-h-48 overflow-y-auto">
                                {suggestions.map((tag) => (
                                    <li
                                        key={tag}
                                        onClick={() => {setInput(tag);setReloadMap(prev => !prev);}}
                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    >
                                        {tag}
                                    </li>
                                ))}
                            </ul>
                        )}
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
                <Map reloadTrigger={reloadMap} filterTag={input}/>

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
