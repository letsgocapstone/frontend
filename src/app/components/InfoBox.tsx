// InfoBox.tsx
'use client'

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

export interface Poi {
  title: string;
  description?: string;
  placeImageURL: string;
  placeId: number;
  latitude?: number;
  longitude?: number;
}

interface InfoBoxProps {
  poi: Poi;
  onMoreClick: () => void;
}

const InfoBox = ({ poi, onMoreClick }: InfoBoxProps) => {
  // const router = useRouter(); // 페이지 이동을 위한 useRouter 훅
  const [address, setAddress] = useState<string>(''); // 도로명 주소 상태
  const [liked, setLiked] = useState(false); // 좋아요 상태
  const [bookmarked, setBookmarked] = useState(false); // 북마크 상태
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태 체크

  const description = poi.description || 'example';
  const imageUrl = poi.placeImageURL || '/images.png' // 기본 이미지
    // console.log(poi)

  // 위도와 경도를 도로명 주소로 변환하는 함수
  useEffect(() => {
    if (poi.latitude && poi.longitude) {
      const fetchAddress = async () => {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${poi.latitude},${poi.longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAP_API}`
        );
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          setAddress(data.results[0].formatted_address);
        } else {
          setAddress('주소를 찾을 수 없습니다.');
        }
      };
      fetchAddress();
    }

    // 로그인 상태 체크 (localStorage에서 로그인 여부 확인)
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token); // 토큰이 있으면 로그인 상태로 설정
  }, [poi.latitude, poi.longitude]);

  // 좋아요 버튼 클릭 시
  const handleLike = () => {
    if (!isLoggedIn) {
      alert('로그인 후 좋아요를 눌러주세요.');
      return;
    }
    setLiked(!liked);
  };

  // 북마크 버튼 클릭 시
  const handleBookmark = () => {
    if (!isLoggedIn) {
      alert('로그인 후 북마크를 추가하세요.');
      return;
    }
    setBookmarked(!bookmarked);
  };

  // 상세보기 페이지로 이동
  // const handleMoreClick = () => {
  //   router.push(`/place/${poi.placeId}`); // 해당 PLACE ID로 상세보기 페이지로 이동
  // };

  return (
    <div style={{ maxWidth: '200px', fontFamily: 'Arial, sans-serif' }}>
      <h3 style={{ margin: '0 0 8px', fontSize: '16px' }}>{poi.title}</h3>
      <Image
        src={imageUrl}
        alt={poi.title}
        width={100}
        height={100}
        style={{ width: '100%', borderRadius: '4px', marginBottom: '8px' }}
      />
      <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>{description}</p>
      <p style={{ margin: '8px 0', fontSize: '12px', color: '#777' }}>{address}</p> {/* 도로명 주소 표시 */}

      {/* 상세보기 버튼 */}
      <button onClick={onMoreClick} style={{ marginBottom: '8px', cursor: 'pointer' }}>
        상세보기
      </button>

      {/* 좋아요 버튼 */}
      <button
        onClick={handleLike}
        style={{
          backgroundColor: liked ? 'lightcoral' : 'lightgray',
          padding: '5px 10px',
          borderRadius: '5px',
          marginRight: '5px',
          cursor: 'pointer',
        }}
      >
        좋아요
      </button>

      {/* 북마크 버튼 */}
      <button
        onClick={handleBookmark}
        style={{
          backgroundColor: bookmarked ? 'yellow' : 'lightgray',
          padding: '5px 10px',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        북마크
      </button>
    </div>
  );
};

export default InfoBox;

