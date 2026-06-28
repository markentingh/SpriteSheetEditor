function Slider({ label, value, onChange, min, max, step = 1, showValue = true, className = "", onMouseUp, onTouchEnd }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label} {showValue && <span className="text-purple-400">{value}</span>}
        </label>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        onMouseUp={onMouseUp}
        onTouchEnd={onTouchEnd}
        className={`w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider ${className}`}
        style={{
          background: `linear-gradient(to right, rgb(147, 51, 234) 0%, rgb(147, 51, 234) ${((value - min) / (max - min)) * 100}%, rgb(55, 65, 81) ${((value - min) / (max - min)) * 100}%, rgb(55, 65, 81) 100%)`
        }}
      />
      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: rgb(192, 132, 252);
          cursor: pointer;
          border: 2px solid rgb(147, 51, 234);
          transition: all 0.15s ease;
        }
        .slider::-webkit-slider-thumb:hover {
          background: rgb(216, 180, 254);
          transform: scale(1.1);
        }
        .slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: rgb(192, 132, 252);
          cursor: pointer;
          border: 2px solid rgb(147, 51, 234);
          transition: all 0.15s ease;
        }
        .slider::-moz-range-thumb:hover {
          background: rgb(216, 180, 254);
          transform: scale(1.1);
        }
      `}</style>
    </div>
  )
}

export default Slider
