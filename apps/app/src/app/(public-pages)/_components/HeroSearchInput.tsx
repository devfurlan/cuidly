'use client';

import { Button } from '@/components/ui/shadcn/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/shadcn/tooltip';
import { useGeolocationContext } from '@/contexts/GeolocationContext';
import { useLocationSearch } from '@/hooks/useLocationSearch';
import type { CitySuggestion, LocationSearchResult } from '@/types/location';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  PiCircleNotchBold,
  PiCrosshair,
  PiMagnifyingGlassBold,
  PiMapPin,
} from 'react-icons/pi';
import { toast } from 'sonner';

export default function HeroSearchInput() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [selectedLocation, setSelectedLocation] =
    useState<LocationSearchResult | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    suggestions,
    cepResult,
    isLoading: isSearching,
    isLoadingCities,
    error: searchError,
    handleInputChange: onInputChange,
    selectCity,
    clearResults,
    clearError: clearSearchError,
  } = useLocationSearch();

  const {
    locationResult: geoLocationResult,
    isLoading: isGettingLocation,
    error: geoError,
    requestLocation,
  } = useGeolocationContext();

  // Show geo error as toast (only for manual requests, not initial load)
  useEffect(() => {
    if (geoError && geoError !== 'Permissão negada') {
      toast.error(geoError);
    }
  }, [geoError]);

  // Auto-fill input when geolocation result is available
  useEffect(() => {
    if (geoLocationResult && !inputValue && !selectedLocation) {
      setInputValue(geoLocationResult.formattedAddress);
      setSelectedLocation(geoLocationResult);
    }
  }, [geoLocationResult, inputValue, selectedLocation]);

  // Show search error as toast
  useEffect(() => {
    if (searchError) {
      toast.error(searchError);
      clearSearchError();
    }
  }, [searchError, clearSearchError]);

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Show dropdown when we have results
  useEffect(() => {
    if (suggestions.length > 0 || cepResult) {
      setShowDropdown(true);
    }
  }, [suggestions, cepResult]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setSelectedIndex(-1);

    // Reset selection when user types
    if (selectedLocation) {
      setSelectedLocation(null);
    }

    onInputChange(value);
  };

  const handleSelectCity = (suggestion: CitySuggestion) => {
    const result = selectCity(suggestion);
    setInputValue(suggestion.displayText);
    setSelectedLocation(result);
    setShowDropdown(false);
    clearResults();
  };

  const handleSelectCepResult = (result: LocationSearchResult) => {
    setInputValue(result.formattedAddress);
    setSelectedLocation(result);
    setShowDropdown(false);
    clearResults();
  };

  const handleGeolocation = async () => {
    await requestLocation();

    // The effect will handle updating the input when geoLocationResult changes
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalItems = suggestions.length + (cepResult ? 1 : 0);

    if (e.key === 'Enter' && !showDropdown) {
      e.preventDefault();
      handleSearch();
      return;
    }

    if (!showDropdown || totalItems === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();

      // If CEP result is showing, it's the first item
      if (cepResult && selectedIndex === 0) {
        handleSelectCepResult(cepResult);
      } else {
        // Adjust index if CEP result is present
        const cityIndex = cepResult ? selectedIndex - 1 : selectedIndex;
        if (suggestions[cityIndex]) {
          handleSelectCity(suggestions[cityIndex]);
        }
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const handleSearch = useCallback(() => {
    if (!selectedLocation) {
      toast.error('Por favor, selecione uma localização da lista');
      return;
    }

    const params = new URLSearchParams();

    // Always include city and state
    params.set('city', selectedLocation.city);
    params.set('state', selectedLocation.state);

    // Include coordinates if available (CEP or geolocation)
    if (
      selectedLocation.lat !== undefined &&
      selectedLocation.lng !== undefined
    ) {
      params.set('lat', selectedLocation.lat.toString());
      params.set('lng', selectedLocation.lng.toString());
    }

    // Include address for display
    params.set('address', selectedLocation.formattedAddress);

    router.push(`/cadastro?callbackUrl=/app/babas?${params.toString()}`);
  }, [selectedLocation, router]);

  const isLoading = isLoadingCities || isSearching || isGettingLocation;
  const hasDropdownItems = suggestions.length > 0 || cepResult !== null;

  return (
    <div className="w-full space-y-3">
      <div className="relative flex flex-col gap-2 sm:flex-row">
        {/* Input Container */}
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <PiMapPin className="h-6 w-6 text-gray-400" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => hasDropdownItems && setShowDropdown(true)}
            placeholder="Digite sua cidade ou CEP"
            disabled={isLoadingCities}
            className="h-14 w-full rounded-xl border-2 border-gray-200 bg-white pr-14 pl-12 text-base transition-all outline-none placeholder:text-gray-400 focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            autoComplete="new-password"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            data-form-type="other"
            data-lpignore="true"
            name="location-search-input"
          />

          {/* Right side icons */}
          <div className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-1">
            {isLoading && (
              <div className="p-1.5">
                <PiCircleNotchBold className="h-5 w-5 animate-spin text-fuchsia-500" />
              </div>
            )}

            {!isLoading && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={handleGeolocation}
                    disabled={isGettingLocation}
                    className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-fuchsia-50 hover:text-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <PiCrosshair className="h-5 w-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  Usar minha localização
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Dropdown */}
          {showDropdown && hasDropdownItems && (
            <div
              ref={dropdownRef}
              className="absolute z-50 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-xl"
            >
              {/* CEP Result */}
              {cepResult && (
                <button
                  type="button"
                  onClick={() => handleSelectCepResult(cepResult)}
                  className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-fuchsia-50 ${
                    selectedIndex === 0 ? 'bg-fuchsia-50' : ''
                  } ${suggestions.length === 0 ? 'rounded-xl' : 'rounded-t-xl'}`}
                >
                  <PiMapPin className="mt-0.5 h-5 w-5 shrink-0 text-fuchsia-500" />
                  <div>
                    <div className="font-medium text-gray-900">
                      {cepResult.street ||
                        cepResult.neighborhood ||
                        cepResult.city}
                    </div>
                    <div className="text-sm text-gray-500">
                      {cepResult.neighborhood && cepResult.street
                        ? `${cepResult.neighborhood} - ${cepResult.city}, ${cepResult.state}`
                        : `${cepResult.city} - ${cepResult.state}`}
                    </div>
                  </div>
                </button>
              )}

              {/* City Suggestions */}
              {suggestions.map((suggestion, index) => {
                const actualIndex = cepResult ? index + 1 : index;
                const isFirst = !cepResult && index === 0;
                const isLast = index === suggestions.length - 1;

                return (
                  <button
                    key={suggestion.id}
                    type="button"
                    onClick={() => handleSelectCity(suggestion)}
                    className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-fuchsia-50 ${
                      actualIndex === selectedIndex ? 'bg-fuchsia-50' : ''
                    } ${isFirst ? 'rounded-t-xl' : ''} ${isLast ? 'rounded-b-xl' : ''}`}
                  >
                    <PiMapPin className="mt-0.5 h-5 w-5 shrink-0 text-fuchsia-500" />
                    <div>
                      <div className="font-medium text-gray-900">
                        {suggestion.city}
                      </div>
                      <div className="text-sm text-gray-500">
                        {suggestion.state}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Search Button */}
        <Button
          size={'xl'}
          onClick={handleSearch}
          disabled={isLoading || !selectedLocation}
        >
          <PiMagnifyingGlassBold className="size-5" />
          Buscar Babás
        </Button>
      </div>
    </div>
  );
}
