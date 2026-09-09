import React, { useState, useMemo } from 'react';
import { Search, X, Check, Globe } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { COUNTRY_LANGUAGES, CountryLanguage, translate } from '../data/languages';

interface LanguageSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LanguageSelectModal: React.FC<LanguageSelectModalProps> = ({ isOpen, onClose }) => {
  const { language, setLanguage, t } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');

  const regions = ['All', 'Popular', 'Asia', 'Europe', 'Americas', 'Middle East', 'Africa'];

  const filteredLanguages = useMemo(() => {
    return COUNTRY_LANGUAGES.filter((item) => {
      const matchesSearch =
        item.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.countryCode.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedRegion === 'All') return true;
      if (selectedRegion === 'Popular') return Boolean(item.popular);
      return item.region === selectedRegion;
    });
  }, [searchQuery, selectedRegion]);

  if (!isOpen) return null;

  const handleSelectLanguage = (lang: CountryLanguage) => {
    setLanguage(lang.code);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-neutral-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center">
              <Globe size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base text-neutral-900 leading-tight">
                {t('select_language')}
              </h3>
              <p className="text-[11px] text-neutral-400">
                {COUNTRY_LANGUAGES.length} countries & languages supported
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-neutral-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search_country_lang')}
              className="w-full pl-9 pr-8 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-hidden focus:border-rose-700 focus:bg-white transition-all text-neutral-800 placeholder-neutral-400"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-0.5"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar mt-2.5 pt-0.5 pb-0.5">
            {regions.map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap font-medium transition-all ${
                  selectedRegion === region
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        {/* Languages List */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-neutral-50">
          {filteredLanguages.length === 0 ? (
            <div className="py-12 text-center text-neutral-400 text-xs">
              <Globe size={32} className="mx-auto text-neutral-300 mb-2 stroke-[1.5]" />
              No country or language matched your search
            </div>
          ) : (
            filteredLanguages.map((item) => {
              const isSelected = language === item.code || (language === 'en' && item.code === 'en') || (language === 'bn' && item.code === 'bn');
              return (
                <button
                  key={item.code}
                  onClick={() => handleSelectLanguage(item)}
                  className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between transition-colors text-left ${
                    isSelected
                      ? 'bg-rose-50/70 border border-rose-200/70'
                      : 'hover:bg-neutral-50 active:bg-neutral-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl leading-none select-none">{item.flag}</span>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-sm text-neutral-900 leading-tight">
                          {item.nativeName}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-500 font-semibold uppercase">
                          {item.countryCode}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        {item.country} • {item.name}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-rose-700 text-white flex items-center justify-center shadow-xs">
                      <Check size={14} className="stroke-[2.5]" />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer Note */}
        <div className="p-3 bg-neutral-50 border-t border-neutral-100 text-center">
          <p className="text-[10px] text-neutral-400">
            Interface language updates immediately upon selection
          </p>
        </div>
      </div>
    </div>
  );
};
