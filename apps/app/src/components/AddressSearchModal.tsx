'use client';

import GooglePlacesAutocomplete from '@/components/GooglePlacesAutocomplete';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/shadcn/dialog';

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

interface AddressSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPlaceSelected: (place: PlaceDetails) => void;
}

export default function AddressSearchModal({
  open,
  onOpenChange,
  onPlaceSelected,
}: AddressSearchModalProps) {
  function handlePlaceSelected(place: PlaceDetails) {
    onPlaceSelected(place);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Buscar endereço</DialogTitle>
          <DialogDescription>
            Digite seu endereço para encontrarmos automaticamente
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <GooglePlacesAutocomplete
            onPlaceSelected={handlePlaceSelected}
            placeholder="Digite seu endereço..."
          />
          <p className="text-xs text-gray-500">
            Comece a digitar e selecione uma das opções sugeridas
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
