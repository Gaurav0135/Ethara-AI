import { useState, useRef, useEffect } from 'react'

const MultiSelectDropdown = ({ options, selectedValues, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleOption = (value) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(v => v !== value))
    } else {
      onChange([...selectedValues, value])
    }
  }

  const selectedOptions = options.filter(opt => selectedValues.includes(opt.value))

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 bg-white cursor-pointer min-h-[42px] flex items-center flex-wrap gap-1.5"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOptions.length === 0 ? (
          <span className="text-slate-400">{placeholder || 'Select options...'}</span>
        ) : (
          selectedOptions.map(opt => (
            <span key={opt.value} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded flex items-center gap-1 shadow-sm">
              {opt.label.split(' ')[0]} {/* Show only name on the chip to save space */}
              <button 
                type="button" 
                onClick={(e) => { e.stopPropagation(); toggleOption(opt.value) }}
                className="hover:text-blue-900 font-bold hover:bg-blue-200 rounded-full w-4 h-4 flex items-center justify-center leading-none"
              >
                &times;
              </button>
            </span>
          ))
        )}
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {options.length === 0 ? (
            <div className="p-3 text-sm text-slate-500 text-center">No options available</div>
          ) : (
            options.map(opt => (
              <div 
                key={opt.value}
                className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center gap-3 border-b border-slate-50 last:border-0"
                onClick={() => toggleOption(opt.value)}
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedValues.includes(opt.value) ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'}`}>
                  {selectedValues.includes(opt.value) && (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                  )}
                </div>
                <span className="text-sm text-slate-700">{opt.label}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default MultiSelectDropdown
