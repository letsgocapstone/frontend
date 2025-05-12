export default function RatingStars({ rating, onChange }: { rating: number; onChange: (value: number) => void }) {
    return (
        <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    onClick={() => onChange(star)}
                    className="text-2xl text-yellow-400 focus:outline-none"
                >
                    {star <= rating ? '★' : '☆'}
                </button>
            ))}
        </div>
    );
}
