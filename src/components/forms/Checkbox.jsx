function Checkbox({ checked, onChange, className = "", size = "md", label }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  }

  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="hidden"
      />
      <div
        className={`${sizeClasses[size]} flex items-center justify-center rounded border-2 transition-all cursor-pointer ${
          checked 
            ? 'bg-purple-600 border-purple-600 hover:bg-purple-700 hover:border-purple-700' 
            : 'bg-gray-900 border-gray-600 hover:border-purple-500'
        } ${className}`}
      >
        {checked && (
          <svg 
            viewBox="0 0 16 16" 
            fill="none" 
            className="w-full h-full p-0.5"
          >
            <path
              d="M13.5 4L6 11.5L2.5 8"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      {label && <span className="text-gray-300 text-sm whitespace-nowrap">{label}</span>}
    </label>
  )
}

export default Checkbox
