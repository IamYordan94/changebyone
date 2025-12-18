'use client';

import FeedbackMessage from './FeedbackMessage';

interface SuccessMessageProps {
  message: string;
}

export default function SuccessMessage({ message }: SuccessMessageProps) {
  return <FeedbackMessage type="success" message={message} />;
}

