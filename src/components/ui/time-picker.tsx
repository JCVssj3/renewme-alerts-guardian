import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimePickerProps {
  value?: string; // HH:MM format
  onChange: (time: string) => void;
  placeholder?: string;
  className?: string;
}

export function TimePicker({ value, onChange, placeholder = "Select time", className }: TimePickerProps) {
  const [hours, setHours] = React.useState(value ? value.split(':')[0] : '09');
  const [minutes, setMinutes] = React.useState(value ? value.split(':')[1] : '00');
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    if (value) {
      const [h, m] = value.split(':');
      setHours(h);
      setMinutes(m);
    }
  }, [value]);

  const handleTimeChange = (newHours: string, newMinutes: string) => {
    const formattedHours = newHours.padStart(2, '0');
    const formattedMinutes = newMinutes.padStart(2, '0');
    onChange(`${formattedHours}:${formattedMinutes}`);
  };

  const formatDisplayTime = (time?: string) => {
    if (!time) return placeholder;
    const [h, m] = time.split(':');
    const hour24 = parseInt(h);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${m} ${ampm}`;
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 15) { // 15-minute intervals
        const hourStr = h.toString().padStart(2, '0');
        const minuteStr = m.toString().padStart(2, '0');
        const time24 = `${hourStr}:${minuteStr}`;
        const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
        const ampm = h >= 12 ? 'PM' : 'AM';
        const display = `${hour12}:${minuteStr} ${ampm}`;
        
        options.push({ value: time24, display });
      }
    }
    return options;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal mobile-tap",
            !value && "text-muted-foreground",
            className
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {formatDisplayTime(value)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-4 space-y-4">
          <div className="text-sm font-medium">Select reminder time</div>
          
          {/* Quick preset times */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: '9:00 AM', value: '09:00' },
              { label: '12:00 PM', value: '12:00' },
              { label: '3:00 PM', value: '15:00' },
              { label: '6:00 PM', value: '18:00' },
            ].map((preset) => (
              <Button
                key={preset.value}
                variant={value === preset.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  onChange(preset.value);
                  setIsOpen(false);
                }}
                className="text-xs"
              >
                {preset.label}
              </Button>
            ))}
          </div>

          {/* Custom time input */}
          <div className="border-t pt-4">
            <Label className="text-xs text-muted-foreground mb-2 block">Custom time</Label>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                min="0"
                max="23"
                value={hours}
                onChange={(e) => {
                  const newHours = Math.max(0, Math.min(23, parseInt(e.target.value) || 0)).toString();
                  setHours(newHours);
                  handleTimeChange(newHours, minutes);
                }}
                className="w-16 text-center"
                placeholder="HH"
              />
              <span className="text-muted-foreground">:</span>
              <Input
                type="number"
                min="0"
                max="59"
                step="5"
                value={minutes}
                onChange={(e) => {
                  const newMinutes = Math.max(0, Math.min(59, parseInt(e.target.value) || 0)).toString();
                  setMinutes(newMinutes);
                  handleTimeChange(hours, newMinutes);
                }}
                className="w-16 text-center"
                placeholder="MM"
              />
            </div>
          </div>

          <Button 
            size="sm" 
            className="w-full" 
            onClick={() => setIsOpen(false)}
          >
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}