import { useContext, useEffect } from 'react';
import { SocketContext } from '../../contexts/SocketContext';
import { X, Info, CheckCircle, AlertCircle } from 'lucide-react';

export const NotificationToast = () => {
  const { notifications, clearNotification } = useContext(SocketContext);

  useEffect(() => {
    // Auto-clear notifications after 5 seconds
    notifications.forEach((notification) => {
      const timer = setTimeout(() => {
        clearNotification(notification.id);
      }, 5000);
      return () => clearTimeout(timer);
    });
  }, [notifications]);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
      {notifications.slice(0, 3).map((notification) => (
        <div
          key={notification.id}
          className={`${getBgColor(notification.type)} border rounded-lg shadow-lg p-4 flex items-start space-x-3 animate-slide-in-right`}
        >
          {getIcon(notification.type)}
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {notification.message}
            </p>
          </div>
          <button
            onClick={() => clearNotification(notification.id)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

