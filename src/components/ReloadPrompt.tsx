import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from './ui/Button';

export function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!offlineReady && !needRefresh) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-6 z-50 p-4 rounded-xl border border-border bg-card shadow-2xl glass animate-in slide-in-from-bottom-5">
      <div className="mb-3 text-sm">
        {offlineReady ? (
          <span>Ứng dụng đã sẵn sàng hoạt động ngoại tuyến.</span>
        ) : (
          <span>Có bản cập nhật mới. Làm mới để cập nhật.</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {needRefresh && (
          <Button size="sm" onClick={() => updateServiceWorker(true)}>
            Làm mới
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={close}>
          Đóng
        </Button>
      </div>
    </div>
  );
}
