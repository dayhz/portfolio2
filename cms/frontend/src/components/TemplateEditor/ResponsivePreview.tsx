import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Monitor, Tablet, Smartphone } from 'lucide-react';

interface Device {
  name: string;
  width: number;
  height: number;
  icon: React.ComponentType<any>;
}

const DEVICES: Device[] = [
  { name: 'Desktop', width: 1920, height: 1080, icon: Monitor },
  { name: 'Tablet', width: 768, height: 1024, icon: Tablet },
  { name: 'Mobile', width: 375, height: 667, icon: Smartphone },
];

interface ResponsivePreviewProps {
  children: React.ReactNode;
}

export const ResponsivePreview: React.FC<ResponsivePreviewProps> = ({ children }) => {
  const [selectedDevice, setSelectedDevice] = useState<Device>(DEVICES[0]);

  return (
    <div className="flex flex-col h-full">
      {/* Device Toolbar */}
      <div className="flex items-center justify-center gap-2 p-4 bg-gray-100 border-b">
        {DEVICES.map((device) => {
          const Icon = device.icon;
          return (
            <Button
              key={device.name}
              variant={selectedDevice.name === device.name ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDevice(device)}
              className="flex items-center gap-2"
            >
              <Icon className="w-4 h-4" />
              {device.name}
            </Button>
          );
        })}
        
        <div className="ml-4 text-sm text-gray-600">
          {selectedDevice.width} × {selectedDevice.height}px
        </div>
      </div>

      {/* Preview Container */}
      <div className="flex-1 flex items-center justify-center p-4 bg-gray-50">
        <div
          className="bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300"
          style={{
            width: Math.min(selectedDevice.width, window.innerWidth - 100),
            height: Math.min(selectedDevice.height, window.innerHeight - 200),
            maxWidth: '100%',
            maxHeight: '100%',
          }}
        >
          <div className="w-full h-full overflow-auto">
            <div
              style={{
                width: selectedDevice.width,
                minHeight: selectedDevice.height,
                transform: `scale(${Math.min(
                  (window.innerWidth - 100) / selectedDevice.width,
                  (window.innerHeight - 200) / selectedDevice.height,
                  1
                )})`,
                transformOrigin: 'top left',
              }}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};