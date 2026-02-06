'use client';

/**
 * Google Places Autocomplete Component
 * Uses AutocompleteService + PlacesService for full control over UI
 * Falls back to ViaCEP when Google doesn't return a postal code
 */

import { PiCircleNotch } from 'react-icons/pi';

import { useEffect, useRef, useState, useCallback } from 'react';

interface PlaceDetails {
  streetName: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

interface Prediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

interface GooglePlacesAutocompleteProps {
  onPlaceSelected: (place: PlaceDetails) => void;
  placeholder?: string;
  disabled?: boolean;
}

// Search CEP by street name using our API route (proxies ViaCEP to avoid CORS)
async function searchZipByStreet(state: string, city: string, street: string): Promise<string | null> {
  try {
    const params = new URLSearchParams({ state, city, street });
    const response = await fetch(`/api/location/cep-by-address?${params}`);

    if (!response.ok) return null;

    const data = await response.json();
    return data.cep || null;
  } catch (error) {
    console.error('Error fetching CEP:', error);
    return null;
  }
}

export default function GooglePlacesAutocomplete({
  onPlaceSelected,
  placeholder = 'Digite o endereço',
  disabled = false,
}: GooglePlacesAutocompleteProps) {
  const [inputValue, setInputValue] = useState('');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Load Google Maps
  useEffect(() => {
    const loadGoogleMaps = async () => {
      if (typeof window.google !== 'undefined' && window.google.maps?.places) {
        initServices();
        return;
      }

      const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');

      if (!existingScript) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&language=pt-BR`;
        script.async = true;
        document.head.appendChild(script);

        script.onload = () => initServices();
        script.onerror = () => {
          console.error('Failed to load Google Maps');
          setIsLoading(false);
        };
      } else {
        const checkInterval = setInterval(() => {
          if (typeof window.google !== 'undefined' && window.google.maps?.places) {
            clearInterval(checkInterval);
            initServices();
          }
        }, 100);

        setTimeout(() => {
          clearInterval(checkInterval);
          setIsLoading(false);
        }, 10000);
      }
    };

    const initServices = () => {
      autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
      // Create a dummy div for PlacesService (required by API)
      const dummyDiv = document.createElement('div');
      placesServiceRef.current = new google.maps.places.PlacesService(dummyDiv);
      sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
      setIsLoading(false);
    };

    loadGoogleMaps();
  }, []);

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

  const fetchPredictions = useCallback((input: string) => {
    if (!autocompleteServiceRef.current || !input.trim()) {
      setPredictions([]);
      return;
    }

    autocompleteServiceRef.current.getPlacePredictions(
      {
        input,
        componentRestrictions: { country: 'br' },
        types: ['address'],
        sessionToken: sessionTokenRef.current!,
      },
      (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          setPredictions(
            results.map((r) => ({
              placeId: r.place_id,
              description: r.description,
              mainText: r.structured_formatting.main_text,
              secondaryText: r.structured_formatting.secondary_text,
            }))
          );
          setShowDropdown(true);
        } else {
          setPredictions([]);
        }
      }
    );
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setSelectedIndex(-1);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.length >= 3) {
      debounceRef.current = setTimeout(() => {
        fetchPredictions(value);
      }, 300);
    } else {
      setPredictions([]);
      setShowDropdown(false);
    }
  };

  const handleSelectPlace = async (prediction: Prediction) => {
    setIsFetchingDetails(true);
    setShowDropdown(false);
    setInputValue(prediction.description);

    if (!placesServiceRef.current) {
      setIsFetchingDetails(false);
      return;
    }

    placesServiceRef.current.getDetails(
      {
        placeId: prediction.placeId,
        fields: ['address_components', 'formatted_address', 'geometry'],
        sessionToken: sessionTokenRef.current!,
      },
      async (place, status) => {
        // Create new session token for next search
        sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();

        if (status !== google.maps.places.PlacesServiceStatus.OK || !place) {
          console.error('Failed to get place details:', status);
          setIsFetchingDetails(false);
          return;
        }

        const details = await extractPlaceDetails(place);
        if (details) {
          onPlaceSelected(details);
        }
        setIsFetchingDetails(false);
      }
    );
  };

  const extractPlaceDetails = async (place: google.maps.places.PlaceResult): Promise<PlaceDetails | null> => {
    if (!place.address_components || !place.geometry?.location) {
      return null;
    }

    const components = place.address_components;
    let streetName = '';
    let number = '';
    let neighborhood = '';
    let city = '';
    let state = '';
    let zipCode = '';

    components.forEach((component) => {
      const types = component.types;

      if (types.includes('route')) {
        streetName = component.long_name;
      }
      if (types.includes('street_number')) {
        number = component.long_name;
      }
      if (types.includes('sublocality') || types.includes('sublocality_level_1')) {
        neighborhood = component.long_name;
      }
      if (types.includes('administrative_area_level_2')) {
        city = component.long_name;
      }
      if (types.includes('administrative_area_level_1')) {
        state = component.short_name;
      }
      if (types.includes('postal_code')) {
        zipCode = component.long_name.replace('-', '');
      }
    });

    // Fallbacks for city
    if (!city) {
      const localityComponent = components.find((c) => c.types.includes('locality'));
      if (localityComponent) {
        city = localityComponent.long_name;
      }
    }

    // Fallback for neighborhood
    if (!neighborhood) {
      const politicalComponent = components.find(
        (c) =>
          c.types.includes('political') &&
          !c.types.includes('administrative_area_level_1') &&
          !c.types.includes('administrative_area_level_2') &&
          !c.types.includes('locality')
      );
      if (politicalComponent) {
        neighborhood = politicalComponent.long_name;
      }
    }

    // If no CEP from Google, try ViaCEP
    if (!zipCode && streetName && city && state) {
      const viaCepResult = await searchZipByStreet(state, city, streetName);
      if (viaCepResult) {
        zipCode = viaCepResult;
      }
    }

    return {
      streetName,
      number,
      neighborhood,
      city,
      state,
      zipCode: zipCode.replace(/\D/g, ''),
      latitude: place.geometry.location.lat(),
      longitude: place.geometry.location.lng(),
      formattedAddress: place.formatted_address || '',
    };
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || predictions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < predictions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelectPlace(predictions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => predictions.length > 0 && setShowDropdown(true)}
        placeholder={placeholder}
        disabled={disabled || isLoading}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />

      {(isLoading || isFetchingDetails) && (
        <div className="absolute right-3 top-2.5">
          <PiCircleNotch className="h-4 w-4 animate-spin text-gray-400" />
        </div>
      )}

      {showDropdown && predictions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-10001 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg"
        >
          {predictions.map((prediction, index) => (
            <button
              key={prediction.placeId}
              type="button"
              onClick={() => handleSelectPlace(prediction)}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 ${
                index === selectedIndex ? 'bg-gray-100' : ''
              } ${index === 0 ? 'rounded-t-md' : ''} ${
                index === predictions.length - 1 ? 'rounded-b-md' : ''
              }`}
            >
              <div className="font-medium text-gray-900">{prediction.mainText}</div>
              <div className="text-xs text-gray-500">{prediction.secondaryText}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
