"use client";

interface Props {
  card1: string; // base64
  card2: string;
  card3: string;
}

const cards = [
  { key: "card1" as const, label: "Card Desktop", dims: "1200×630" },
  { key: "card2" as const, label: "Card Mobile", dims: "1080×1920" },
  { key: "card3" as const, label: "Card Mixta", dims: "1200×630" },
];

export default function CardPreview({ card1, card2, card3 }: Props) {
  const data = { card1, card2, card3 };

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <h2 className="text-xl font-bold text-center text-white">Tus cards listas 🎉</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map(({ key, label, dims }) => (
          <div key={key} className="space-y-2">
            <div className="rounded-xl overflow-hidden border border-gray-700 bg-gray-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`data:image/png;base64,${data[key]}`}
                alt={label}
                className="w-full object-contain"
              />
            </div>
            <p className="text-center text-sm text-gray-400">
              <span className="font-medium text-white">{label}</span>{" "}
              <span className="text-xs">{dims}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
