'use client';

import FeedbackMessage from './FeedbackMessage';

interface ErrorMessageProps {
  message: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return <FeedbackMessage type="error" message={message} />;
}

