import { useEffect, useRef, useState } from "react";

export const CustomSelect = ({
  options = [],
  placeholder = "Select Option",
  onChange,
  value, 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // const filteredOptions = options.filter((opt) =>
  //   opt.label.toLowerCase().includes(search.toLowerCase())
  // );

  const filteredOptions = options.filter((opt) =>
  String(opt?.label ?? "")
    .toLowerCase()
    .includes(search.toLowerCase())
);


  const handleSelect = (option) => {
    onChange?.(option);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Select box */}
      <div
        className="border rounded-lg bg-white cursor-pointer border-sky-500 px-3 py-2 text-sm shadow-sm"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {value ? value.label : <span className="text-gray-400">{placeholder}</span>}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute w-full mt-1 border bg-white z-10">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full border-b px-3 py-2 outline-none text-sm"
          />

          <ul className="max-h-40 overflow-y-auto">
            {filteredOptions.length ? (
              filteredOptions.map((opt) => (
                <li
                  key={opt.value}
                  onClick={() => handleSelect(opt)}
                  className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-sm"
                >
                  {opt.label}
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-gray-500 text-sm">No results</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
