import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";

export interface WidgetPreset {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  config: any;
}

interface WidgetPresetsProps {
  presets: WidgetPreset[];
  selectedPreset: string | null;
  onSelectPreset: (preset: WidgetPreset) => void;
}

const WidgetPresets: React.FC<WidgetPresetsProps> = ({
  presets,
  selectedPreset,
  onSelectPreset,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {presets.map((preset) => (
        <Card
          key={preset.id}
          className={`overflow-hidden cursor-pointer transition-all ${selectedPreset === preset.id ? "ring-2 ring-primary" : "hover:shadow-md"}`}
          onClick={() => onSelectPreset(preset)}
        >
          <div className="relative">
            <img
              src={preset.thumbnail}
              alt={preset.name}
              className="w-full h-32 object-cover"
            />
            {selectedPreset === preset.id && (
              <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                <Check className="h-4 w-4" />
              </div>
            )}
          </div>
          <CardContent className="p-4">
            <h3 className="font-medium">{preset.name}</h3>
            <p className="text-sm text-muted-foreground">
              {preset.description}
            </p>
            <Button
              variant={selectedPreset === preset.id ? "default" : "outline"}
              size="sm"
              className="mt-2 w-full"
            >
              {selectedPreset === preset.id ? "Selected" : "Select"}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default WidgetPresets;
