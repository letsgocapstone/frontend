// src/app/components/ParentComponent.tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import InfoBox from './InfoBox'; // InfoBox 컴포넌트 import
import { Poi } from './InfoBox'; // Poi 타입을 InfoBox에서 import

const ParentComponent = () => {
  const [poi, setPoi] = useState<Poi | null>(null); // Poi | null로 타입을 설정하여 null을 허용
  const router = useRouter(); // 페이지 이동을 위한 useRouter 훅

  // API에서 실제 데이터 받아오기 (예시로 fetch 사용)
  useEffect(() => {
    const fetchPlaceData = async () => {
      const response = await fetch('/api/places/12345'); // 실제 API 엔드포인트로 대체
      const data = await response.json();
      setPoi(data); // poi 데이터 상태 업데이트
    };
    
    fetchPlaceData();
  }, []);

  // 페이지 이동을 처리하는 함수
  const handleMoreClick = (placeId: number) => {
    router.push(`/place/${placeId}`); // 해당 PLACE ID로 상세보기 페이지로 이동
  };

  // poi 데이터가 로딩 중이면 로딩 화면 표시
  if (!poi) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <InfoBox poi={poi} onMoreClick={() => handleMoreClick(poi.placeId)} />
    </div>
  );
};

export default ParentComponent;
