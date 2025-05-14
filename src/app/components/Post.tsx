import Image from 'next/image';
import Comment from './Comment';
import Avatar from './Avatar';

interface CommentType {
    id: number;
    author: string;
    content: string;
    timestamp: string;
}

interface PostProps {
    title: string;
    imageUrl: string;
    timestamp: string;
    content: string;
    author: string;
    comments: CommentType[];
}

export default function Post({
                                 title,
                                 imageUrl,
                                 timestamp,
                                 content,
                                 author,
                                 comments,
                             }: PostProps) {
    return (
        <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6">
            <h1 className="text-2xl font-bold mb-2">{title}</h1>
            <div className="flex items-center text-sm text-gray-500 mb-4">
                <Avatar name={author} />
                <span className="ml-2">{author}</span> · <span className="ml-2">{timestamp}</span>
            </div>
            <Image src={imageUrl} alt="Post image" width={600} height={300} className="rounded-md mb-4" />
            <p className="text-gray-800 mb-6">{content}</p>

            <h2 className="text-lg font-semibold mb-2">댓글</h2>
            <div className="space-y-4">
                {comments.map((comment) => (
                    <Comment key={comment.id} {...comment} />
                ))}
            </div>
        </div>
    );
}
