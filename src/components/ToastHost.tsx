import { useEffect, useState } from 'react';

interface ToastItem {
  id: string;
  message: string;
}

export default function ToastHost() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    function onToast(event: Event) {
      const customEvent = event as CustomEvent<{ message: string }>;
      const message = customEvent.detail?.message;
      if (!message) return;
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setToasts((prev) => [...prev, { id, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, 1800);
    }

    window.addEventListener('moma-toast', onToast);
    return () => window.removeEventListener('moma-toast', onToast);
  }, []);

  return (
    <div className="fixed bottom-4 left-4 z-[60] space-y-2" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div key={toast.id} className="bg-black text-white text-sm px-3 py-2 border border-black">
          {toast.message}
        </div>
      ))}
    </div>
  );
}
