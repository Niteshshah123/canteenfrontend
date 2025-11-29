import { Toast } from "./Toast";

export const ToastContainer = ({ toasts, removeToast }) => {
  // Map toast types to colors
  const backgroundColors = {
    success: "bg-green-100 border-green-400",
    error: "bg-red-100 border-red-400",
    warning: "bg-yellow-100 border-yellow-400",
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 flex flex-col gap-3 items-center">
      {toasts.map((toast) => {
        const bgClass = backgroundColors[toast.type] || backgroundColors.success;

        return (
          <div
            key={toast.id}
            className={`w-full max-w-sm rounded-lg shadow border p-1 ${bgClass}`}
          >
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        );
      })}
    </div>
  );
};
