import Avatar from './Avatar';

interface CommentProps {
    author: string;
    content: string;
    timestamp: string;
}

export default function Comment({ author, content, timestamp }: CommentProps) {
    return (
        <div className="flex items-start gap-3">
            <Avatar name={author} />
            <div>
                <div className="text-sm font-semibold">{author}</div>
                <div className="text-gray-600">{content}</div>
                <div className="text-xs text-gray-400">{timestamp}</div>
            </div>
        </div>
    );
}
