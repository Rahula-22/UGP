import React, { useMemo } from 'react';
import { Heart } from 'lucide-react';

function DailyPositiveMessage() {
  const message = useMemo(() => {
    const messages = [
      {
        text: 'You are not alone.',
        author: 'Remember',
      },
      {
        text: 'Healing takes time. Be patient with yourself.',
        author: 'Wellness Tip',
      },
      {
        text: 'Small progress is still progress.',
        author: 'Your Journey',
      },
      {
        text: 'Your feelings are valid.',
        author: 'Self-Compassion',
      },
      {
        text: 'Every day is a fresh start.',
        author: 'Mindfulness',
      },
      {
        text: 'You deserve kindness, especially from yourself.',
        author: 'Self-Care',
      },
      {
        text: 'It\'s okay to ask for help.',
        author: 'Strength',
      },
      {
        text: 'Your mental health matters.',
        author: 'Priority',
      },
      {
        text: 'You are stronger than you think.',
        author: 'Resilience',
      },
      {
        text: 'One breath at a time. You\'ve got this.',
        author: 'Calm',
      },
    ];
    const idx = Math.abs(Math.floor(Date.now() / (1000 * 60 * 60 * 24))) % messages.length;
    return messages[idx];
  }, []);

  return (
    <div className="rounded-3xl border border-gray-200/70 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8">
      <div className="flex items-center gap-2 mb-6">
        <Heart className="h-5 w-5 text-pink-600" />
        <div className="text-base font-extrabold tracking-tight text-gray-900">Today's Positive Message</div>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-pink-50/80 via-white to-rose-50/60 p-8 ring-1 ring-pink-200/60">
        <div className="text-center">
          <div className="text-5xl mb-4">✨</div>
          <div className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 leading-relaxed">
            "{message.text}"
          </div>
          <div className="text-sm font-semibold text-gray-600">
            — {message.author}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 p-5 ring-1 ring-emerald-200/60">
        <div className="text-xs font-semibold text-emerald-800 mb-2">💡 Today's Micro-Action</div>
        <div className="text-sm leading-relaxed text-emerald-900">
          Choose one small act of self-compassion today. It could be:
          <ul className="mt-2 space-y-1 text-emerald-800">
            <li>• Drink a glass of water mindfully</li>
            <li>• Take three deep breaths</li>
            <li>• Say something kind to yourself</li>
            <li>• Step outside for a moment</li>
            <li>• Reach out to someone safe</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default DailyPositiveMessage;
