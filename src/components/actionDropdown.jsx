    import { useEffect, useRef, useState } from "react";
    import { useNavigate } from "react-router-dom";
   

    export default function ActionDropdown({ merchantId, merchant, onFundReturn,onScheme,onPayinSettlement }) {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    useEffect(() => {
  const handleClickOutside = (event) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target)
    ) {
      setOpen(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

    return (
        <div  ref={dropdownRef} className="relative">
        <button
            onClick={() => setOpen(!open)}
            className=" text-[#1971ba] w-25 border border-blue-200 px-4 py-1.5 rounded-md text-sm font-medium shadow-sm transition"
        >
            Action ▾
        </button>

        {open && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
            <div
                className="px-5 py-3 hover:bg-blue-50 cursor-pointer text-gray-800"
                onClick={() => {
                onFundReturn(merchant);
                setOpen(false);
                }}
            >
                Load Wallet 
            </div>

            <div
                className="px-5 py-3 hover:bg-blue-50 cursor-pointer text-gray-800"
                onClick={() => {
                onPayinSettlement(merchant);
                setOpen(false);
                }}
            >
                Payin Settlement
            </div>            

            {/* other menu items remain the same */}
            <div
                className="px-5 py-3 hover:bg-gray-50 cursor-pointer text-gray-800"
                // onClick={() => { navigate(`/scheme/${merchantId}`); setOpen(false); }}
               onClick={() => {
              if (onScheme) onScheme(merchant);
              setOpen(false);
            }}
            >
                Scheme
            </div>

            {/* <div
                className="px-4 py-2 hover:bg-blue-100  cursor-pointer"
                // onClick={() => navigate(`/topup-statement/${merchantId}`)}
                onClick={() => navigate(`/topup-statement`)}
            >
            Topup  Statement
            </div> */}
            
            {/* <div
                className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                // onClick={() => navigate(`/settlement-payin-statement/${merchantId}`)}
                onClick={() => navigate(`/settlement-payin-statement`)}
            >
            Settlement Payin Statement
            </div> */}
            </div>
        )}
        </div>
    );
    }