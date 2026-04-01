import Button from "./Button";

export const ConfirmModal = ({
  showConfirmModal,
  handleConfirmModal,
  action,
  heading,
  body,

  // ✅ defaults
  confirmText = "Yes",
  cancelText = "No",
  showCancel = true,
  variant = "default",
}) => {

  const variants = {
    default: "from-blue-500 to-blue-700",
    success: "from-green-500 to-green-600",
    danger: "from-red-500 to-red-600",
    info: "from-indigo-500 to-indigo-600",
  };

  return (
    <>
      {showConfirmModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50"
          onClick={() => handleConfirmModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className={`text-white rounded-t-lg px-5 py-3 flex justify-between items-center`}
              style={{  background:"var(--bg-gradient)"}}
            >
              <h3 className="text-lg font-semibold">{heading}</h3>
              <button
                onClick={() => handleConfirmModal(false)}
                className="w-8 h-8 rounded-full bg-white text-red-500 hover:bg-red-500 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 text-gray-700">
              {body}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 pb-4">
              {showCancel && (
                <Button
                  onClick={() => handleConfirmModal(false)}
                  className="bg-gray-500 hover:bg-gray-700 text-white px-5 py-2 rounded"
                >
                  {cancelText}
                </Button>
              )}

              <Button
                onClick={action}
                className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2 rounded"
              >
                {confirmText}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
