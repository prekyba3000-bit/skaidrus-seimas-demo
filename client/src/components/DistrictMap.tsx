import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Leaflet with React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface DistrictMapProps {
  districtName: string;
  districtNumber: number;
}

export function DistrictMap({ districtName, districtNumber }: DistrictMapProps) {
  const [geoData, setGeoData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch the specific district's GeoJSON
    // For the demo, we'll use our mock file
    fetch('/district.json')
      .then(res => res.json())
      .then(data => {
        setGeoData(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to load map data", err);
        setIsLoading(false);
      });
  }, []);

  const mapCenter: [number, number] = [54.710, 25.350]; // Approximate center of Antakalnis
  const zoomLevel = 12;

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Rinkimų Apygarda
            </CardTitle>
            <CardDescription>
              {districtName} apygarda Nr. {districtNumber}
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            Vilniaus miestas
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0 h-[400px] relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <MapContainer 
            center={mapCenter} 
            zoom={zoomLevel} 
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {geoData && (
              <GeoJSON 
                data={geoData} 
                style={() => ({
                  color: 'var(--primary)',
                  weight: 2,
                  opacity: 0.8,
                  fillColor: 'var(--primary)',
                  fillOpacity: 0.2
                })}
              />
            )}
            <Marker position={mapCenter}>
              <Popup>
                <div className="text-center">
                  <strong>{districtName}</strong><br />
                  Apygarda Nr. {districtNumber}
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        )}
      </CardContent>
    </Card>
  );
}
