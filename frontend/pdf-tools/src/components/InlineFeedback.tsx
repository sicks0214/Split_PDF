interface InlineFeedbackProps {
  type: 'success' | 'error' | 'info';
  message: string;
}

export default function InlineFeedback({ type, message }: InlineFeedbackProps) {
  const styles = {
    success: 'bg-green-50 text-green-800',
    error: 'bg-red-50 text-red-800',
    info: 'bg-blue-50 text-blue-800'
  };

  const icons = {
    success: '✓',
    error: '✗',
    info: 'ⓘ'
  };

  return (
    <div className={`p-4 rounded-lg flex items-center space-x-2 ${styles[type]}`}>
      <span>{icons[type]}</span>
      <span>{message}</span>
    </div>
  );
}
