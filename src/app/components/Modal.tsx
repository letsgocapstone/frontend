'use client';

import { useEffect, useRef, useState } from "react";
import { FaCamera, FaUpload, FaTimes } from "react-icons/fa";
import RatingStars from "@/app/components/RatingStars";
import Image from 'next/image';
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAP_API!;

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (placeTitle: string, longitude: number, latitude: number, placeDescription: string, rating: number, imageFile: File, tags: string[]) => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [placeTitle, setPlaceTitle] = useState("");
  const [placeDescription, setPlaceDescription] = useState("");
  const [longitude, setLongitude] = useState<number | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [rating, setRating] = useState<number>(0);

  // 태그 관련
  const [tagInput, setTagInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags] = useState<string[]>(['카페', '주차장', '야경', '뷰맛집']);

  const filteredTags = allTags.filter(tag => tag.includes(tagInput) && !selectedTags.includes(tag));

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

  // 카메라 관련
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [showVideo, setShowVideo] = useState(false);

  const openCamera = async () => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) {
      videoRef.current.srcObject = mediaStream;
    }
    setStream(mediaStream);
    setShowVideo(true);
  };

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
          stream?.getTracks().forEach((track) => track.stop());
          setShowVideo(false);
        }
      }, "image/jpeg");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // 위치 초기화
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
      },
      () => {
        console.log("위치 정보를 가져올 수 없습니다.");
      }
    );
  }, []);

  // 좌표를 도로명 주소로 변환
  const handleConvertLatLngToAddress = async () => {
    if (!latitude || !longitude) return;
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`
      );
      const data = await res.json();
      if (data.results.length > 0) {
        setSelectedAddress(data.results[0].formatted_address);
        alert(`선택된 위치의 도로명 주소:\n${data.results[0].formatted_address}`);
      } else {
        alert('주소를 찾을 수 없습니다.');
      }
    } catch (err) {
      console.error('좌표 -> 주소 변환 오류:', err);
    }
  };

  const MarkerWithZoom: React.FC = () => {
    const map = useMap();
    const handleMarkerDrag = (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setLatitude(lat);
        setLongitude(lng);
        if (map) {
          map.setCenter({ lat, lng });
          map.setZoom(18);
        }
      }
    };

    if (!latitude || !longitude) return null;

    return (
      <AdvancedMarker
        position={{ lat: latitude, lng: longitude }}
        draggable={true}
        onDragEnd={handleMarkerDrag}
      >
        <Pin background={'#0E3C56'} glyphColor={'#fff'} borderColor={'#fff'} />
      </AdvancedMarker>
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 필드 값들이 모두 채워져 있는지 체크 (빈 값이 있으면 등록 불가)
    if (!placeTitle || !placeDescription || !imageFile || !latitude || !longitude || selectedTags.length === 0) {
        alert("모든 필드를 입력해주세요.");  // 필수 필드가 비어 있을 경우 경고
        return;  // 경고 후 등록 진행하지 않음
    }

    // 모든 필드가 채워졌으면 onSubmit 호출
    onSubmit(placeTitle, longitude, latitude, placeDescription, rating, imageFile, selectedTags);

    // 등록 완료 후 메시지와 모달 닫기
    alert("장소 등록 완료");
    onClose();  // 모달 닫기
  };



  if (!isOpen) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl p-6 shadow-2xl max-h-[90%] overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4"> 장소 등록</h2>

    
        {/* 장소 입력 */}
        <input
          type="text"
          value={placeTitle}
          onChange={(e) => setPlaceTitle(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-4"
          placeholder="장소 제목 입력"
        />

        {/* 지도 및 마커 */}
        {latitude && longitude && (
          <APIProvider apiKey={GOOGLE_API_KEY}>
            <Map
              mapId="DEMO_MAP_ID"
              defaultCenter={{ lat: latitude, lng: longitude }}
              center={{ lat: latitude, lng: longitude }}
              defaultZoom={16}
              zoomControl={true}
              style={{ width: '100%', height: '300px' }}
              fullscreenControl={false}
              streetViewControl={false}
              mapTypeControl={false}
              gestureHandling="greedy"
              onClick={(e) => {
                if (e.detail.latLng) {
                  setLatitude(e.detail.latLng.lat);
                  setLongitude(e.detail.latLng.lng);
                }
              }}
            >
              <MarkerWithZoom />
            </Map>
          </APIProvider>
        )}

        <button type="button" onClick={handleConvertLatLngToAddress} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-[#0583F2] w-full mt-4 mb-4">
          이 위치로 등록 (주소 확인)
        </button>

        {selectedAddress && <div className="text-sm text-gray-600 border p-2 rounded">{selectedAddress}</div>}

        {/* 태그 등록 */}
        <div>
          <label className="block font-medium mb-1">태그 등록</label>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="태그 입력 후 Enter"
            className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
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
          <div className="flex flex-wrap gap-2 mt-3">
            {selectedTags.map((tag) => (
              <span key={tag} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-sm text-sm flex items-center gap-2 mb-4">
                {tag}
                <button onClick={() => removeTag(tag)} className="text-blue-500 hover:text-red-500">×</button>
              </span>
            ))}
          </div>
        </div>

        {/* 평점 */}
        <label className="block font-medium mb-1">평점</label>
        <RatingStars rating={rating} onChange={setRating} />

        {/* 장소 설명 */}
        <textarea
          value={placeDescription}
          onChange={(e) => setPlaceDescription(e.target.value)}
          className="w-full border px-3 py-2 rounded mt-4 mb-4"
          rows={3}
          placeholder="장소 설명 입력"
        />

        {/* 이미지 업로드 또는 카메라 사용 */}
        <div>
          <label className="block font-medium mb-2">이미지 업로드</label>
          <div className="flex flex-col items-center space-y-2">
            {showVideo && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="rounded w-full max-h-64 border"
              />
            )}

            <div className="flex gap-2 mb-4">
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
                <FaUpload /> 사진 업로드
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            </div>

            <canvas ref={canvasRef} className="hidden" />
          </div>

          {previewUrl && (
            <div className="mt-3">
              <Image src={previewUrl} alt="미리보기" width={100} height={100} className="w-full max-h-60 object-cover rounded border" />
              <p className="text-sm text-gray-600 mt-1">{imageFile?.name}</p>
            </div>
          )}
        </div>

        {/* 제출 및 닫기 버튼 */}
        <div className="flex justify-between mt-4">
        <button
          type="button"  // 'submit'에서 'button'으로 변경
          onClick={handleSubmit}  // 클릭 시 handleSubmit 호출
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-[#0583F2] cursor-pointer"
          >
          등록
        </button>
          <button type="button" onClick={onClose} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-400 flex items-center gap-1 cursor-pointer">
            <FaTimes /> 닫기
          </button>
        </div>
     
    </div>
  );
};

export default Modal;
