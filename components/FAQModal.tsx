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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
            <div className="glass rounded-2xl p-6 max-w-2xl max-h-[80vh] overflow-y-auto w-full">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-2xl"
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div key={index} className="glass rounded-lg p-4">
                            <h3 className="font-bold text-lg mb-2 text-primary">
                                {faq.question}
                            </h3>
                            <p className="text-slate-300">
                                {faq.answer}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
