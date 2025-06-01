'use client'

import { useEffect, useState, useRef } from 'react';
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import InfoBox from './InfoBox';
import { createRoot } from 'react-dom/client';
import {
    APIProvider, Map, MapCameraChangedEvent, AdvancedMarker,
    Pin, useMap
} from '@vis.gl/react-google-maps';
import type {Marker} from '@googlemaps/markerclusterer';
import { useRouter } from 'next/navigation';

// Map 컴포넌트 내부



interface resDto {
    poi: resPoi[];
}

interface resPoi {
    latitude: number;
    longitude: number;
    placeTitle: string;
    placeImageURL: string;
    userid: number;
    placeId: number;
    tags: string[]; // ⬅️ 추가

}

interface Poi {
    key: string;
    location: google.maps.LatLngLiteral;
    title: string;
    placeId: number;
    tags: string[]; // ⬅️ 추가
}
interface PlaceDto {
    latitude: number;
    longitude: number;
    placeTitle: string;
    placeId: number;
    tags: string[];
    // other fields...
};

const distanceInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // km 단위
};


export async function loadPlace(lat: number, lng: number) {
    // const url = `/api/load_location?lat=${lat}&lng=${lng}`;
    // console.log("👉 요청 URL:", url); // 요청 URL 확인용 로그

    const res = await fetch(`/api/load_location?lat=${lat}&lng=${lng}`, {
    // const res = await fetch(`/api/load_location?lat=3&lng=49.22`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });

    if (res.ok){
        // console.log("hi");
        const data = await res.json();
        console.log("res: ", data);
        return data;
    }
    return "error";
}



export default function CustomeMap({ reloadTrigger,filterTag }: { reloadTrigger: boolean; filterTag: string; }) {
    const router = useRouter();
    const [userCenter, setUserCenter] = useState<{ lat: number, lng: number } | null>(null);
    const [lastPosition, setLastPosition] = useState<{ lat: number, lng: number } | null>(null);
    const [textContent, setTextContent] = useState('위치 파악 중…');
    const [point, setPoint] = useState<Poi[] | null>(null);


    useEffect(() => {
        if (!navigator.geolocation) {
            setTextContent("browser doesn't offers this function");
            console.log(textContent);
        } else {
            const getCurrentLocation = async () => {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const pos = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        };
                        setTextContent("현재 위치를 가져옴");
                        setUserCenter(pos);
                        setLastPosition(pos); // 최초 위치 저장
                        try {
                            const places: resDto = await loadPlace(pos.lat, pos.lng);
                            // console.log(places.poi);
                            const placepoi: Poi[] = (places.poi || []).map((p: PlaceDto) => ({
                                key: Math.random().toString(36).substring(2, 10),
                                location: { lat: p.latitude, lng: p.longitude },
                                title: p.placeTitle,
                                placeId: p.placeId,
                                tags:p.tags ||[]
                            }));
                            // console.log(placepoi);
                            setPoint(placepoi);
                            // console.log('근처 장소 데이터:', places.poi);
                            setLastPosition(pos); // 마지막 위치 업데이트
                        } catch (error) {
                            console.error('장소 로딩 실패:', error);
                        }
                    },
                    () => {
                        setTextContent("현재 위치를 가져올 수 없음");
                    }
                );
            };
            getCurrentLocation();
        }
    }, [reloadTrigger]);



    const PoiMarkers = (props: { pois: Poi[]; filterTag: string }) => {
        const map = useMap();
        const [markers, setMarkers] = useState<{[key: string]: Marker}>({});
        const clusterer = useRef<MarkerClusterer | null>(null);
        const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);


        // Initialize MarkerClusterer, if the map has changed
        useEffect(() => {
            if (!map) return;
            if (!clusterer.current) {
                clusterer.current = new MarkerClusterer({map});
            }
            if (!infoWindowRef.current) {
                infoWindowRef.current = new google.maps.InfoWindow();
            }
        }, [map]);

        // Update markers, if the markers array has changed
        useEffect(() => {
            if (!clusterer.current) return;

            // 클러스터 초기화
            clusterer.current.clearMarkers();

            // filteredPois 기준으로 마커만 추가
            const filteredMarkers = filteredPois
                .map(poi => markers[poi.key])
                .filter(marker => marker !== undefined);

            clusterer.current.addMarkers(filteredMarkers);
        }, [props.filterTag, markers]);


        const setMarkerRef = (marker: Marker | null, key: string) => {
            if (marker && markers[key]) return;
            if (!marker && !markers[key]) return;

            setMarkers(prev => {
                if (marker) {
                    return {...prev, [key]: marker};
                } else {
                    const newMarkers = {...prev};
                    delete newMarkers[key];
                    return newMarkers;
                }
            });
        };
        const handleMoreClick = (placeId: number) => {
            router.push(`/place/${placeId}`);
        };
        // const handleMarkerClick = (poi: Poi) => {
        //     if (map && infoWindowRef.current) {
        //         console.log("current: ",poi.placeId);
        //         const container = document.createElement('div');
        //         createRoot(container).render(<InfoBox poi={poi} onMoreClick={() => handleMoreClick(poi.placeId)} />);
        //         infoWindowRef.current.setContent(container);
        //         infoWindowRef.current.setPosition(poi.location);
        //         infoWindowRef.current.open(map);
        //
        //     } else {
        //         // Create new InfoWindow if it does not exist
        //         console.log(poi.placeId);
        //         infoWindowRef.current = new google.maps.InfoWindow();
        //         const container = document.createElement('div');
        //         createRoot(container).render(<InfoBox poi={poi} onMoreClick={() => handleMoreClick(poi.placeId)} />);
        //         infoWindowRef.current.setContent(container);
        //         infoWindowRef.current.setPosition(poi.location);
        //         infoWindowRef.current.open(map);
        //
        //     }
        // };
        const handleMarkerClick = (poi: Poi) => {
            if (!map) return;

            if (!infoWindowRef.current) {
                infoWindowRef.current = new google.maps.InfoWindow();
            }

            const container = document.createElement('div');
            createRoot(container).render(
                <InfoBox poi={poi} onMoreClick={() => handleMoreClick(poi.placeId)} />
            );

            infoWindowRef.current.setContent(container);
            infoWindowRef.current.setPosition(poi.location);
            infoWindowRef.current.open(map);
        };

        const normalizedFilterTag = props.filterTag.trim().toLowerCase();
        const filteredPois = props.pois.filter(poi => {
            if (normalizedFilterTag === "") return true;
            const match = poi.tags.some(tag => tag.toLowerCase().includes(normalizedFilterTag));
            console.log(`poi: ${poi.title}, tags: ${poi.tags.join(", ")}, match: ${match}`);
            return match;
        });




        return (
            <>
                <AdvancedMarker
                    key="center"
                    position={userCenter}
                >
                    <Pin background={'#000'} glyphColor={'#fff'} borderColor={'#fff'} />
                </AdvancedMarker>

                {filteredPois.map((poi: Poi) => {
                    const isMatched = poi.tags.some(tag =>
                        tag.toLowerCase().includes(props.filterTag.trim().toLowerCase())
                    );

                    return (
                        <AdvancedMarker
                            key={poi.key}
                            position={poi.location}
                            ref={marker => setMarkerRef(marker, poi.key)}
                            onClick={() => handleMarkerClick(poi)}
                        >
                            <Pin
                                background={isMatched ? '#FF5733' : '#1C4966'} // 일치 시 주황, 기본은 네이비
                                glyphColor="#fff"
                                borderColor="#fff"
                            />
                        </AdvancedMarker>
                    );
                })}
            </>
        );

    };

    const handleCameraChange = async (ev: MapCameraChangedEvent) => {
        const newCenter = ev.detail.center;
        console.log('📍 지도 중심 변경됨:', newCenter.lat, newCenter.lng);

        if (lastPosition) {
            const distance = distanceInKm(lastPosition.lat, lastPosition.lng, newCenter.lat, newCenter.lng);
            if (distance > 20) {
                setPoint([]);
                try {
                    const places:resDto = await loadPlace(newCenter.lat, newCenter.lng);
                    // console.log(places.poi);
                    const placepoi:Poi[] = places.poi.map((p:PlaceDto)=> ({
                        key:Math.random().toString(36).substring(2, 10),
                        location:{lat: p.latitude, lng: p.longitude},
                        title:p.placeTitle,
                        placeId:p.placeId,
                        tags:p.tags ||[]
                    }));
                    // console.log(placepoi);
                    setPoint(placepoi);

                    // console.log('근처 장소 데이터:', places);
                    // setPoint(places);
                    setLastPosition({ lat: newCenter.lat, lng: newCenter.lng }); // 마지막 위치 업데이트
                } catch (error) {
                    console.error('장소 로딩 실패:', error);
                }
            }
        }
    };


    return (
        // <div className="grid items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <div className='w-full h-full'>
            <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAP_API!} onLoad={() => console.log('Maps API has loaded.')}>
                {userCenter && (<Map
                    defaultZoom={15}
                    defaultCenter={userCenter}
                    mapId='b60b691782b3237'
                    onCameraChanged={handleCameraChange}
                    scaleControl={false}
                    fullscreenControl={false}
                    rotateControl={false}
                    mapTypeControl={false}
                    zoomControl={false}
                    streetViewControl={false}

                >
                    {/*{userCenter && (*/}
                    {/*    <AdvancedMarker*/}
                    {/*        key="current-location"*/}
                    {/*        position={userCenter}>*/}
                    {/*        <Pin background={'#FBBC04'} glyphColor={'#000'} borderColor={'#000'} />*/}
                    {/*    </AdvancedMarker>*/}
                    {/*)}*/}
                    {point && <PoiMarkers pois={point} filterTag={filterTag} />}
                </Map>)}
            </APIProvider>
        </div>
        // </div>
    )
}