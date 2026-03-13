import React, { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';

interface Country {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
}

const COUNTRIES: Country[] = [
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨', dialCode: '+593' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', dialCode: '+57' },
  { code: 'PE', name: 'Perú', flag: '🇵🇪', dialCode: '+51' },
  { code: 'US', name: 'USA', flag: '🇺🇸', dialCode: '+1' },
  { code: 'ES', name: 'España', flag: '🇪🇸', dialCode: '+34' },
  { code: 'MX', name: 'México', flag: '🇲🇽', dialCode: '+52' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', dialCode: '+54' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', dialCode: '+56' },
];

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  label?: string;
}

const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChange, required, label }) => {
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Detect country by IP
    const detectCountry = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        if (data.country_code) {
          const found = COUNTRIES.find(c => c.code === data.country_code);
          if (found) setSelectedCountry(found);
        }
      } catch (e) {
        console.warn('Country detection failed', e);
      }
    };
    detectCountry();
  }, []);

  // Sync internal state with external value if needed
  useEffect(() => {
    if (value && value.includes(' ')) {
      const [dial, ...rest] = value.split(' ');
      const found = COUNTRIES.find(c => c.dialCode === dial);
      if (found) {
        setSelectedCountry(found);
        setPhoneNumber(rest.join(''));
      }
    } else {
      setPhoneNumber(value);
    }
  }, [value]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setPhoneNumber(raw);
    onChange(`${selectedCountry.dialCode} ${raw}`);
  };

  const selectCountry = (country: Country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    onChange(`${country.dialCode} ${phoneNumber}`);
  };

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && '*'}
        </label>
      )}
      <div className="flex shadow-sm rounded-md overflow-hidden border border-gray-300 focus-within:ring-2 focus-within:ring-vandora-emerald focus-within:border-vandora-emerald">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-r border-gray-300 hover:bg-gray-100 transition-colors"
        >
          <img 
            src={`https://flagcdn.com/w40/${selectedCountry.code.toLowerCase()}.png`}
            alt={selectedCountry.name}
            className="w-6 h-auto shadow-sm"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              const span = (e.target as HTMLImageElement).nextSibling as HTMLElement;
              if (span) span.style.display = 'inline';
            }}
          />
          <span className="text-xl leading-none hidden">{selectedCountry.flag}</span>
          <span className="text-sm font-medium text-gray-600">{selectedCountry.dialCode}</span>
        </button>

        <input
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          required={required}
          placeholder="000 000 000"
          className="block w-full px-3 py-2 sm:text-sm focus:outline-none"
        />
      </div>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 mt-1 w-64 bg-white shadow-xl rounded-md border border-gray-200 py-1 max-h-60 overflow-auto">
            {COUNTRIES.map((country) => (
              <button
                key={country.code}
                type="button"
                onClick={() => selectCountry(country)}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <img 
                  src={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png`}
                  alt={country.name}
                  className="w-5 h-auto shadow-sm"
                />
                <span className="flex-1 text-left">{country.name}</span>
                <span className="text-gray-400">{country.dialCode}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PhoneInput;
