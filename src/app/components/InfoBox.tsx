// InfoBox.tsx
// 'use client'

import React from 'react';
import Image from 'next/image'
import {useRouter} from "next/navigation";

export interface Poi {
    title: string;
    description?: string;
    imageUrl?: string;
    placeId: number;
}

const InfoBox = ({ poi, onMoreClick }: { poi: Poi,onMoreClick: () => void }) => {
    // const router = useRouter();

    const description = poi.description || 'example';
    const imageUrl = poi.imageUrl || '/images.png'; // Next.js 기본 이미지 경로

    return (
        <div style={{ maxWidth: '200px', fontFamily: 'Arial, sans-serif' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '16px' }}>{poi.title}</h3>
            <Image
                src={imageUrl}
                alt={poi.title}
                width={100}
                height={100}
                // style={{ width: '100%', borderRadius: '4px', marginBottom: '8px' }}
            />
            <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>{description}</p>
            <button onClick={onMoreClick}><p>더보기</p></button>
            {/*<button onClick={()=>{*/}
            {/*    router.push(`/place?pid=${poi.placeId}`);*/}

            {/*}}><p>더보기</p></button>*/}

        </div>
    );
};

export default InfoBox;
