export default function Modal({ open, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
      {/* <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-[90%] max-w-md animate-slideUp">
        {children}
      </div> */}
      <div className="bg-white text-black rounded-2xl p-6 w-[90%] max-w-md animate-slideUp">
        {children}
      </div>
    </div>
  );
}
