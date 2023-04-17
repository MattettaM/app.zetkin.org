import dynamic from 'next/dynamic';
import { InfoOutlined } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/system';
import { Box, Dialog, Typography } from '@mui/material';
import { FC, useEffect, useState } from 'react';

import 'leaflet/dist/leaflet.css';
import CreateLocationCard from './CreateLocationCard';
import LocationDetailsCard from './LocationDetailsCard';
import LocationSearch from './LocationSearch';
import LocationsModel from 'features/events/models/LocationsModel';
import messageIds from 'features/events/l10n/messageIds';
import { useMessages } from 'core/i18n';
import { ZetkinLocation } from 'utils/types/zetkin';

interface StyleProps {
  isLong: boolean;
}

const useStyles = makeStyles<Theme, StyleProps>(() => ({
  overlay: {
    bottom: ({ isLong }) => (isLong ? 64 : ''),
    display: 'flex',
    justifyContent: 'flex-end',
    justifySelf: 'flex-end',
    margin: 2,
    position: 'absolute',
    right: 32,
    top: 32,
    width: '30%',
    zIndex: 1000,
  },
}));

export type PendingLocation = {
  lat: number;
  lng: number;
};

interface LocationModalProps {
  locations: ZetkinLocation[];
  model: LocationsModel;
  onCreateLocation: (newLocation: Partial<ZetkinLocation>) => void;
  onMapClose: () => void;
  onSelectLocation: (location: ZetkinLocation) => void;
  open: boolean;
  locationId?: number;
}

const Map = dynamic(() => import('./Map'), { ssr: false });
const LocationModal: FC<LocationModalProps> = ({
  locations,
  model,
  onCreateLocation,
  onMapClose,
  onSelectLocation,
  open,
  locationId = null,
}) => {
  const messages = useMessages(messageIds);
  const [searchString, setSearchString] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState(locationId);
  const [pendingLocation, setPendingLocation] = useState<Pick<
    ZetkinLocation,
    'lat' | 'lng'
  > | null>(null);

  const selectedLocation = locations.find(
    (location) => location.id === selectedLocationId
  );

  const isLong = !!pendingLocation || !!selectedLocation;
  const classes = useStyles({ isLong });

  useEffect(() => {
    setSelectedLocationId(locationId);
    setPendingLocation(null);
  }, [open]);

  return (
    <Dialog fullWidth maxWidth="lg" onClose={onMapClose} open={open}>
      <Box padding={2}>
        <Map
          locations={locations}
          onMapClick={(latlng: PendingLocation) => {
            setSelectedLocationId(null);
            setPendingLocation(latlng);
          }}
          onMarkerClick={(locationId: number) => {
            const location = locations.find(
              (location) => location.id === locationId
            );
            if (!location?.lat || !location?.lng) {
              return;
            }
            setPendingLocation(null);
            setSelectedLocationId(location.id);
          }}
          pendingLocation={pendingLocation}
          searchString={searchString}
          selectedLocation={selectedLocation}
        />
        <Box className={classes.overlay}>
          {!selectedLocation && !pendingLocation && (
            <LocationSearch
              onChange={(value: ZetkinLocation) => {
                const location = locations.find(
                  (location) => location.id === value.id
                );
                if (!location?.lat || !location?.lng) {
                  return;
                }
                setSelectedLocationId(location.id);
                setSearchString('');
              }}
              onInputChange={(value) => setSearchString(value || '')}
              onTextFieldChange={(value) => setSearchString(value)}
              options={locations}
            />
          )}
          {selectedLocation && (
            <LocationDetailsCard
              location={selectedLocation}
              model={model}
              onClose={() => {
                setSearchString('');
                setSelectedLocationId(null);
              }}
              onUseLocation={() => {
                onSelectLocation(selectedLocation);
                onMapClose();
              }}
            />
          )}
          {pendingLocation && !selectedLocation && (
            <CreateLocationCard
              onClose={() => {
                setPendingLocation(null);
              }}
              onCreateLocation={(newLocation: Partial<ZetkinLocation>) => {
                onCreateLocation(newLocation);
                setPendingLocation(null);
              }}
              pendingLocation={pendingLocation}
            />
          )}
        </Box>
        <Box alignItems="center" display="flex" paddingTop={1}>
          <InfoOutlined color="secondary" />
          <Typography color="secondary" paddingLeft={1} variant="body2">
            {messages.locationModal.infoText()}
          </Typography>
        </Box>
      </Box>
    </Dialog>
  );
};

export default LocationModal;
