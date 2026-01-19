'use client';

import { useState } from 'react';

interface FAQModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const faqs = [
    {
        question: "What's the goal?",
        answer: "Transform the starting word into the target word by changing one letter at a time. Each intermediate step must be a valid word."
    },
    {
        question: "How do I win?",
        answer: "Complete the word chain in the fewest steps possible before running out of moves."
    },
    {
        question: "What are hints?",
        answer: "Hints reveal the next word in the optimal solution path. You get 2 hints per puzzle."
    },
    {
        question: "How does the leaderboard work?",
        answer: "Rankings are based on total steps - fewer steps means a better score. Complete all 6 daily puzzles to appear on the overall leaderboard."
    },
    {
        question: "Can I replay previous days?",
        answer: "Yes! Use the 'Previous Games' option in the menu to select any past date."
    },
];

export default function FAQModal({ isOpen, onClose }: FAQModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80">
            <div className="glass rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto w-full mx-2 sm:mx-4">
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold">Frequently Asked Questions</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 sm:p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-xl sm:text-2xl w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center"
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-3 sm:space-y-4">
                    {faqs.map((faq, index) => (
                        <div key={index} className="glass rounded-lg p-3 sm:p-4">
                            <h3 className="font-bold text-base sm:text-lg mb-2 text-primary">
                                {faq.question}
                            </h3>
                            <p className="text-slate-300 text-sm sm:text-base">
                                {faq.answer}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
