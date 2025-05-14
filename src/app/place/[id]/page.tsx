'use client'

import Post from "../../components/Post";
import {useParams, useRouter} from 'next/navigation';
// import {router} from "next/client";

export default function PostPage() {
    const router =  useRouter();
    const params = useParams<{ id: string }>();
    const id = params?.id;

    // id가 숫자인지 확인
    const numericId = Number(id);
    if (isNaN(numericId) || numericId < 1 || numericId > 1000) {
        return <div className="text-center mt-10 text-red-500">존재하지 않는 게시글입니다.</div>;
    }

    // 동적으로 mock 게시글 생성
    const post = {
        title: `Next.js 게시글 #${id}`,
        imageUrl: '/images.png',
        timestamp: `2025-05-14 ${String(numericId % 24).padStart(2, '0')}:00`,
        content: `${id}번 게시글의 내용입니다. 이 내용은 동적으로 생성되었습니다.`,
        author: `작성자${numericId % 10}`,
        comments: Array.from({ length: (numericId % 5) + 1 }, (_, i) => ({
            id: i + 1,
            author: `댓글러${i + 1}`,
            content: `${id}번 글에 대한 댓글 ${i + 1}번입니다.`,
            timestamp: `2025-05-14 ${String((numericId + i) % 24).padStart(2, '0')}:30`,
        })),
    };

    return (
        <main className="p-6 bg-gray-100 min-h-screen">
            <button
                onClick={() => router.back()}
                className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                ← 뒤로 가기
            </button>
            <Post {...post} />
        </main>
    );
}
