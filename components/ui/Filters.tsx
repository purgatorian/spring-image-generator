'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import { CalendarIcon, ChevronDown, ChevronUp } from 'lucide-react';

import { Dispatch, SetStateAction } from 'react';
import { DateRange } from 'react-day-picker'; // ✅ Import correct DateRange type

interface FiltersProps {
  filterStatus: string;
  setFilterStatus: Dispatch<SetStateAction<string>>;
  filterMode: string;
  setFilterMode: Dispatch<SetStateAction<string>>;
  dateRange: DateRange | undefined; // ✅ Use DateRange type
  setDateRange: Dispatch<SetStateAction<DateRange | undefined>>;
  costRange: number[];
  setCostRange: Dispatch<SetStateAction<number[]>>;
  filterHasImage: boolean;
  setFilterHasImage: Dispatch<SetStateAction<boolean>>;
  filterHasVideo: boolean;
  setFilterHasVideo: Dispatch<SetStateAction<boolean>>;
}

export default function Filters({
  filterStatus,
  setFilterStatus,
  filterMode,
  setFilterMode,
  dateRange,
  setDateRange,
  costRange,
  setCostRange,
  filterHasImage,
  setFilterHasImage,
  filterHasVideo,
  setFilterHasVideo,
}: FiltersProps) {
  const [isOpen, setIsOpen] = useState(false); // Collapsible state

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="flex justify-start items-center gap-2 cursor-pointer flex-row">
            <CardTitle>Filters</CardTitle>
            {isOpen ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Date Range Picker */}
            <div className="space-y-1">
              <Label>Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-between"
                  >
                    {dateRange?.from && dateRange?.to
                      ? `${format(dateRange.from, 'PP')} - ${format(dateRange.to, 'PP')}`
                      : 'Select Date Range'}
                    <CalendarIcon className="ml-2 w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto">
                  <Calendar
                    mode="range"
                    selected={dateRange ?? undefined} // ✅ Ensure proper type handling
                    onSelect={(
                      range: DateRange | undefined // ✅ Explicitly define type
                    ) =>
                      setDateRange(range || { from: undefined, to: undefined })
                    }
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Cost Slider */}
            <div className="space-y-1">
              <Label>Cost Range ($)</Label>
              <div className="flex flex-col gap-2">
                <Slider
                  min={0}
                  max={1}
                  step={0.01}
                  value={costRange}
                  onValueChange={setCostRange}
                />
                <div className="flex justify-between">
                  <Input
                    type="number"
                    className="w-24"
                    value={costRange[0]}
                    onChange={(e) =>
                      setCostRange([parseFloat(e.target.value), costRange[1]])
                    }
                  />
                  <span>—</span>
                  <Input
                    type="number"
                    className="w-24"
                    value={costRange[1]}
                    onChange={(e) =>
                      setCostRange([costRange[0], parseFloat(e.target.value)])
                    }
                  />
                </div>
              </div>
            </div>

            {/* Status Select */}
            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Mode Select */}
            <div className="space-y-1">
              <Label>Mode</Label>
              <Select value={filterMode} onValueChange={setFilterMode}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="text">Text to Image</SelectItem>
                  <SelectItem value="image">Image to Image</SelectItem>
                  <SelectItem value="clothing">Clothing</SelectItem>
                  <SelectItem value="model">Model</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Image Exists Switch */}
            <div className="flex items-center space-x-2">
              <Switch
                checked={filterHasImage}
                onCheckedChange={setFilterHasImage}
                id="hasImage"
              />
              <Label htmlFor="hasImage">Has Image</Label>
            </div>

            {/* Video Exists Switch */}
            <div className="flex items-center space-x-2">
              <Switch
                checked={filterHasVideo}
                onCheckedChange={setFilterHasVideo}
                id="hasVideo"
              />
              <Label htmlFor="hasVideo">Has Video</Label>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
