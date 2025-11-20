import React from "react";

interface AffirmationCardProps {
  className?: string;
}

const affirmations = [
  "You are amazing just the way you are! 🌟 Every word you say is important and every sound you make is beautiful. Today is going to be filled with fun learning and lots of smiles! 😊",
  "You have a superpower called learning! 🦸‍♂️ Every time you try, you get stronger and smarter. Your voice is unique and wonderful - let's make some magic together! ✨",
  "You are brave, you are strong, and you are learning something new every day! 💪 Your words matter and your sounds are music to our ears. Let's have an adventure today! 🚀",
  "You are a star that shines brighter with every word you speak! ⭐ Your courage to try new sounds makes you a hero. Today we'll discover amazing things together! 🌈",
  "You are filled with endless possibilities! 🌟 Every sound you make is a step toward something wonderful. Your voice is a gift - let's make it even more beautiful today! 🎵",
  "You are growing stronger and smarter with every word! 🌱 Your determination to learn makes you unstoppable. Today we'll celebrate every sound you make! 🎉",
  "You are a champion of learning! 🏆 Every word you say shows how brave and clever you are. Your voice is powerful - let's make it even more amazing! 💫",
  "You are a wonderful learner with a heart full of courage! Every sound you make brings joy and wonder. Today we'll explore the magic of your voice! 🪄",
  "You are capable of amazing things! 🌟 Your words have the power to brighten someone's day. Let's make today filled with fun sounds and happy learning! 😄",
  "You are a bright light that makes the world more beautiful! ✨ Every word you speak is a treasure. Today we'll discover the magic of communication together! 🎭",
];

const getDailyAffirmation = () => {
  const today = new Date();
  const start = new Date(today.getFullYear(), 0, 0);
  const diff = today.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const affirmationIndex = dayOfYear % affirmations.length;
  return affirmations[affirmationIndex];
};

const AffirmationCard = ({ className = "" }: AffirmationCardProps) => {
  return (
    <div
      className={`bg-[#FFF9E6] border border-[#FFE9B5] rounded-2xl shadow-sm px-6 py-5 transition-all duration-300 transform hover:scale-[1.01] hover:shadow-lg ${className}`}
    >
      <p className="text-base font-semibold text-slate-800 mb-1">Affirmation for the day</p>
      <p className="text-lg text-slate-700 leading-relaxed">{getDailyAffirmation()}</p>
    </div>
  );
};

export default AffirmationCard;

