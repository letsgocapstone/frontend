'use client'; 

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { FaHeart, FaBookmark } from 'react-icons/fa';

// 장소 상세 정보 타입 정의
type PlaceDetails = {
  id: number;
  title: string;
  content: string;
  placeImageURL: string;
  latitude: number;
  longtitude: number;
  rating: number;
  tags: string[]; //
  //comments: [];
  placeId: number;
  userId: string;
  createTime: string;
  username: string;
};

// type Comment = {
//   userId: string; // 댓글 작성자의 ID
//   profileImage: string; // 댓글 작성자의 프로필 이미지 URL
//   comment: string; // 댓글 내용
// };

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAP_API;
const token = localStorage.getItem('token');

export default function PlaceDetailPage() {
  const { placeId } = useParams(); // URL에서 placeId 읽기
  const [place, setPlace] = useState<PlaceDetails | null>(null); // 장소 데이터 상태
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  // const [newComment, setNewComment] = useState('');
  const [commentList, setCommentList] = useState<Comment[]>([]); // 댓글 배열 타입 수정
  const [address, setAddress] = useState('');
  // const [visibleComments, setVisibleComments] = useState(3); //표시할 댓글 수수
  // 장소 정보 불러오기 
  useEffect(() => {
    if (!placeId || typeof placeId !== 'string') return;

    const fetchPlace = async () => {
      try {
        setLoading(true);

        const response = await fetch(`/api/api/post/place_id=${placeId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // ❌ 쿠키 기반 인증이면 이 줄 생략해도 됨
          },
          // credentials: 'include', // ✅ 쿠키 전송 허용
        });


        const data = await response.json();
        console.log(data);
        setPlace(data);
        // 좌표를 주소로 변환
        const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${data.latitude},${data.longitude}&key=${GOOGLE_API_KEY}`);
        const geoData = await res.json();
        if (geoData.results.length > 0) {
          setAddress(geoData.results[0].formatted_address);
        } else {
          setAddress('주소를 찾을 수 없습니다.');
        }
        setCommentList(data.comments);
        console.log(commentList);
      } catch (error) {
        console.error('장소 불러오기 실패', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlace();
  }, [placeId]);

  // 북마크 토글
  const handleBookmarkToggle = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인 후 이용해주세요.');
      return;
    }

    if (bookmarked) {
      fetch(`/api/bookmarks/${placeId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    } else {
      fetch(`/api/bookmarks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ placeId }),
      });
    }

    setBookmarked(!bookmarked);
  };

  // //좋아요 토글
  // const handleLikeToggle = async () => {
  //   const token = localStorage.getItem('token');
  //   if (!token) {
  //     alert('로그인 후 좋아요를 눌러주세요.');
  //     return;
  //   }
  //
  //   const response = await fetch(`/api/places/${placeId}/like`, {
  //     method: liked ? 'DELETE' : 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       Authorization: `Bearer ${token}`,
  //     },
  //   });
  //
  //   if (response.ok) {
  //     setLiked(!liked); // UI 상태 업데이트
  //   } else {
  //     alert('좋아요 처리에 실패했습니다.');
  //   }
  // };

  // 댓글 추가
  // const handleAddComment = () => {
  //   const token = localStorage.getItem('token');
  //   if (!token) {
  //     alert('로그인 후 댓글 작성이 가능합니다.');
  //     return;
  //   }

  //   if (!newComment.trim()) return;

  //   fetch(`/api/places/${placeId}/comments`, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       Authorization: `Bearer ${token}`,
  //     },
  //     body: JSON.stringify({ comment: newComment }),
  //   }).then(() => {
  //     setCommentList((prev) => [
  //       ...prev,
  //       { userId: 'user123', profileImage: '/path/to/profile/image.jpg', comment: newComment },
  //     ]);
  //     setNewComment('');
  //   });
  // };

  const handleGoBack = () => {
    history.back();
  };

  if (loading) return <div className="text-center mt-10 text-gray-500">로딩 중...</div>;
  if (!place) return <div className="text-center mt-10 text-red-500">장소를 불러올 수 없습니다.</div>;

  // 상세 정보 렌더링
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={handleGoBack} className="text-blue-600 text-sm mb-4 hover:underline">
        ← 뒤로가기
      </button>

      <div className="bg-white rounded-xl shadow-md overflow-hidden border">
        <div className="p-4 border-b">
          <h3 className="text-xl font-semibold"> {place.title}</h3>
          <div className="text-gray-500 text-sm">
            작성자: {place.username} | 등록일: {new Date(place.createTime).toLocaleDateString()}
          </div>
        </div>

        <div className="w-full h-60 relative">
          <Image
            src={place.placeImageURL}
            alt={place.title}
            layout="fill"
            objectFit="cover"
            className="object-cover"
          />
        </div>

        {address && (
          <div className="p-4 text-gray-500 text-sm border-b">
            {address}
          </div>
        )}

        <div className="p-4 border-b space-y-2">
          <p className="text-gray-700">{place.content}</p>
          <div className="text-yellow-500">⭐ {place.rating}/5</div>

          {/*<div className="flex gap-2 flex-wrap mt-2">*/}
          {/*  {place.tags.map((tag) => (*/}
          {/*    <span*/}
          {/*      key={tag}*/}
          {/*      className="bg-gray-100 text-gray-800 px-3 py-1 rounded-lg text-sm"*/}
          {/*    >*/}
          {/*      #{tag}*/}
          {/*    </span>*/}
          {/*  ))}*/}
          {/*</div>*/}
        </div>

        <div className="p-4 flex items-center gap-4 border-b">
          <button onClick={() => setLiked(!liked)} className="flex items-center gap-1 text-red-500">
            <FaHeart className={liked ? 'fill-red-500' : ''} /> 좋아요
          </button>
          <button onClick={handleBookmarkToggle} className="flex items-center gap-1 text-blue-500">
            <FaBookmark className={bookmarked ? 'fill-blue-500' : ''} /> 저장됨
          </button>
        </div>

        {/* <div className="p-4 space-y-2 border-b">
          <h4 className="font-semibold">후기</h4>
          {commentList.slice(0, visibleComments).map((comment, index) => (
          <div key={index} className="flex items-start space-x-3 mb-4">
    <div className="w-12 h-12 rounded-full overflow-hidden">
      <Image
        src={comment.profileImage} // 사용자 프로필 이미지 URL
        alt="User Profile"
        width={48}
        height={48}
        className="object-cover"
      />
    </div>
    <div className="flex-1">
      <div className="text-gray-700 text-sm font-semibold">{comment.userId}</div>
      <p className="text-gray-600 text-sm">{comment.comment}</p>
    </div>
  </div>
))}
      {commentList.length > visibleComments && (
    <button
      onClick={() => setVisibleComments(visibleComments + 3)} // 댓글을 3개씩 더 보여주기
      className="text-blue-600 text-sm mt-2 hover:underline"
    >
      더 보기
    </button>
  )}

        </div>

        <div className="p-4 flex gap-2">
          <input
            type="text"
            placeholder="방문 후기를 남겨주세요!"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 border rounded px-3 py-1"
          />
          <button
            onClick={handleAddComment}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            등록
          </button>
        </div> */}
      </div>
    </div>
  );
}