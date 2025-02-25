import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "@/hooks/use-debounce";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);

  const debouncedOnChange = useDebouncedCallback((value: string) => {
    onChange(value);
  }, 300);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <div className="relative max-w-sm">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search feedbacks..."
        className="pl-9"
        value={localValue}
        onChange={(e) => {
          setLocalValue(e.target.value);
          debouncedOnChange(e.target.value);
        }}
      />
    </div>
  );
}
