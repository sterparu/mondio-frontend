import { useState, useRef, useEffect } from 'react';

export const CustomSelect = ({ 
  value, 
  onChange, 
  options, 
  placeholder = 'Selectează...', 
  required = false,
  className = '',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);
  const dropdownRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target) && 
          dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      // Prevent body scroll when modal is open on mobile
      if (isMobile) {
        document.body.style.overflow = 'hidden';
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      if (isMobile) {
        document.body.style.overflow = '';
      }
    };
  }, [isOpen, isMobile]);

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      // Scroll selected option into view
      const selectedOption = dropdownRef.current.querySelector('[data-selected="true"]');
      if (selectedOption) {
        setTimeout(() => {
          selectedOption.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }, 100);
      }
    }
  }, [isOpen, value]);

  const selectedOption = options.find(opt => opt.value === value);

  const handleSelect = (optionValue) => {
    onChange({ target: { value: optionValue } });
    setIsOpen(false);
  };

  const filteredOptions = options.filter(opt => !opt.disabled || opt.value === value);

  return (
    <>
      <div className={`relative ${className}`} ref={selectRef}>
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full px-4 py-3 text-base
            border border-gray-300 rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent 
            transition-all touch-manipulation
            bg-white text-left
            flex items-center justify-between
            min-h-[44px]
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            ${isOpen ? 'ring-2 ring-primary border-primary' : ''}
          `}
        >
          <span className={`flex-1 truncate ${selectedOption ? 'text-gray-900' : 'text-gray-500'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Mobile Bottom Sheet / Desktop Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 z-[99998] bg-black/50 transition-opacity ${
              isMobile ? 'backdrop-blur-sm' : ''
            }`}
            onClick={() => setIsOpen(false)}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          />
          
          {/* Dropdown / Bottom Sheet */}
          <div
            ref={dropdownRef}
            className={`
              fixed z-[99999] bg-white
              ${isMobile 
                ? 'bottom-0 left-0 right-0 rounded-t-2xl shadow-2xl max-h-[70vh]' 
                : 'absolute top-full left-0 right-0 mt-1 rounded-lg shadow-lg border border-gray-300 max-h-60'
              }
              overflow-hidden
              flex flex-col
            `}
            style={{
              position: isMobile ? 'fixed' : 'absolute',
              WebkitOverflowScrolling: 'touch',
              ...(isMobile ? {} : { maxHeight: '240px' })
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {isMobile && (
              <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{placeholder}</h3>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-500 hover:text-gray-700 touch-manipulation"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            <div className={`overflow-y-auto flex-1 ${isMobile ? 'pb-safe' : ''}`}>
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-base text-gray-500 text-center">
                  Nu sunt opțiuni disponibile
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    data-selected={value === option.value}
                    className={`
                      w-full px-4 py-4 text-base text-left
                      active:bg-gray-100
                      transition-colors touch-manipulation
                      min-h-[52px] flex items-center justify-between
                      border-b border-gray-100 last:border-b-0
                      ${value === option.value ? 'bg-primary/10 text-primary font-medium' : 'text-gray-900'}
                      ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    disabled={option.disabled}
                  >
                    <span className="flex-1">{option.label}</span>
                    {value === option.value && (
                      <svg
                        className="w-6 h-6 text-primary flex-shrink-0 ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Hidden native select for form validation */}
      {required && (
        <select
          required
          value={value || ''}
          onChange={() => {}}
          className="absolute opacity-0 pointer-events-none h-0 w-0"
          tabIndex={-1}
        >
          <option value="">{placeholder}</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      )}
    </>
  );
};
