"use client";

import { useEffect, useRef, useState } from "react";
import { FaCamera, FaUpload, FaTimes } from "react-icons/fa";
import RatingStars from "@/app/components/RatingStars";
import Image from 'next/image'


interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (placeTitle: string, longitude:number, latitude:number, placeDescription: string, rating:number,imageFile: File) => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [placeTitle, setPlaceTitle] = useState("");
    const [placeDescription, setPlaceDescription] = useState("");
    const [longitude, setLongitude] = useState(0);
    const [latitude, setLatitude] = useState(0);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const [showVideo, setShowVideo] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [tagInput, setTagInput] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [allTags, setAllTags] = useState(['']);
    const [rating, setRating] = useState(0);
    // const [allTags, setAllTags] = useState(['']);
    // setAllTags(['카페', '주차장', '야경', '뷰맛집']);
    const filteredTags = allTags.filter(tag =>
        tag.includes(tagInput) && !selectedTags.includes(tag)
    );

    const addTag = (tag: string) => {
        if (!selectedTags.includes(tag)) {
            setSelectedTags([...selectedTags, tag]);
            setTagInput('');
        }
    };

    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            addTag(tagInput.trim());
            e.preventDefault();
        }
    };

    const removeTag = (tag: string) => {
        setSelectedTags(selectedTags.filter((t) => t !== tag));
    };

    useEffect(() => {
        setAllTags(['카페', '주차장', '야경', '뷰맛집']);
        setIsMobile(/Mobi|Android/i.test(navigator.userAgent));


        // 위치 정보 가져오기 (한 번만 실행)
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLatitude(pos.coords.latitude);
                setLongitude(pos.coords.longitude);
            },
            () => {
                setPlaceDescription("위치 정보를 가져올 수 없습니다.");
            }
        );
    }, []);

    // 카메라 열기
    const openCamera = async () => {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
        }
        setStream(mediaStream);
        setShowVideo(true);
    };

    // 사진 캡처
    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            ctx?.drawImage(videoRef.current, 0, 0);
            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], "captured.jpg", { type: "image/jpeg" });
                    setImageFile(file);
                    setPreviewUrl(URL.createObjectURL(file));

                    // 캡처 후 스트림 종료
                    stream?.getTracks().forEach((track) => track.stop());
                    setShowVideo(false);
                }
            }, "image/jpeg");
        }
    };

    // 파일 업로드 처리
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    // 제출 시 상태 초기화
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (placeTitle && placeDescription && imageFile) {
            onSubmit(placeTitle, longitude, latitude, placeDescription, rating, imageFile);

            // 폼 제출 후 상태 초기화 (placeDescription 유지)
            setPlaceTitle('');
            setImageFile(null);
            setPreviewUrl(null);
        } else {
            alert("모든 필드를 입력해주세요.");
        }
    };

    // 모달 닫기 시 스트림 종료 및 상태 초기화
    const handleClose = () => {
        stream?.getTracks().forEach((track) => track.stop());
        setStream(null);
        setShowVideo(false);
        onClose();
    };

    // 모달이 열려있지 않으면 렌더링하지 않음
    if (!isOpen) return null;

    return (
        <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl p-6 shadow-2xl max-h-[80%] overflow-y-auto">

        <h2 className="text-xl font-semibold mb-4">📍 장소 등록</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* 장소 이름 입력 */}
                    <div>
                        <label className="block font-medium mb-1">장소 이름</label>
                        <input
                            type="text"
                            value={placeTitle}
                            onChange={(e) => setPlaceTitle(e.target.value)}
                            className="w-full border px-3 py-2 rounded"
                            placeholder="장소 제목 입력"
                        />
                    </div>
                    <div>
                        <label className="block font-medium mb-1">태그 등록</label>

                        {/* 입력창 */}
                        <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleTagKeyDown}
                            placeholder="태그 입력 후 Enter"
                            className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />

                        {/* 자동완성 드롭다운 */}
                        {tagInput && filteredTags.length > 0 && (
                            <ul className="absolute left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-md z-10 max-h-40 overflow-y-auto">
                                {filteredTags.map((tag) => (
                                    <li
                                        key={tag}
                                        onClick={() => addTag(tag)}
                                        className="px-3 py-2 hover:bg-blue-50 cursor-pointer"
                                    >
                                        {tag}
                                    </li>
                                ))}
                            </ul>
                        )}


                        {/* 선택된 태그들 */}
                        <div className="flex flex-wrap gap-2 mt-3">
                            {selectedTags.map((tag) => (
                                <span
                                    key={tag}
                                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                                >
        {tag}
                                    <button onClick={() => removeTag(tag)} className="text-blue-500 hover:text-red-500">
          ×
        </button>
      </span>
                            ))}
                        </div>
                    </div>
                    <label className="block font-medium mb-1">평점</label>
                    <RatingStars rating={rating} onChange={setRating} />


                    {/* 장소 설명 입력 */}
                    <div>
                        <label className="block font-medium mb-1">설명</label>
                        <textarea
                            value={placeDescription}
                            onChange={(e) => setPlaceDescription(e.target.value)}
                            className="w-full border px-3 py-2 rounded"
                            rows={3}
                            required
                        />
                    </div>

                    {/* 이미지 업로드 또는 카메라 사용 */}
                    <div>
                        <label className="block font-medium mb-2">이미지 업로드</label>
                        {isMobile ? (
                            <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={handleFileChange}
                                className="w-full"
                                required
                            />
                        ) : (
                            <div className="flex flex-col items-center space-y-2">
                                {showVideo && (
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        className="rounded w-full max-h-64 border"
                                    />
                                )}

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={openCamera}
                                        className="flex items-center gap-1 bg-gray-700 text-white px-3 py-2 rounded hover:bg-gray-800"
                                    >
                                        <FaCamera /> 카메라 켜기
                                    </button>
                                    <button
                                        type="button"
                                        onClick={capturePhoto}
                                        className="flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
                                    >
                                        📸 사진 찍기
                                    </button>
                                    <label className="flex items-center gap-1 bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 cursor-pointer">
                                        <FaUpload />
                                        사진 업로드
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                    </label>
                                </div>

                                <canvas ref={canvasRef} className="hidden" />
                            </div>
                        )}

                        {/* 이미지 미리보기 */}
                        {previewUrl && (
                            <div className="mt-3">
                                <Image
                                    src={previewUrl}
                                    alt="미리보기"
                                    width={100}
                                    height={100}
                                    className="w-full max-h-60 object-cover rounded border"
                                />
                                <p className="text-sm text-gray-600 mt-1">{imageFile?.name}</p>
                            </div>
                        )}
                    </div>

                    {/* 제출 및 닫기 버튼 */}
                    <div className="flex justify-between mt-4">
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            등록
                        </button>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-600 flex items-center gap-1"
                        >
                            <FaTimes /> 닫기
                        </button>
                    </div>
                </form>
            </div>

    );
};

export default Modal;
