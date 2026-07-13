"use client";

import { useMemo, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { XIcon, ChevronDownIcon } from "lucide-react";
import type { Tag } from "@/types/database";

interface TagMultiSelectProps {
  availableTags: Tag[];
  defaultSelected?: string[];
}

export function TagMultiSelect({ availableTags, defaultSelected = [] }: TagMultiSelectProps) {
  const [selected, setSelected] = useState<string[]>(defaultSelected);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const knownNames = useMemo(() => new Set(availableTags.map((t) => t.name)), [availableTags]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return availableTags;
    return availableTags.filter((t) => t.name.toLowerCase().includes(q));
  }, [availableTags, query]);

  const canCreate = query.trim().length > 0 && !knownNames.has(query.trim()) && !selected.includes(query.trim());

  function toggle(name: string) {
    setSelected((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));
  }

  function addNew() {
    const name = query.trim();
    if (!name) return;
    setSelected((prev) => (prev.includes(name) ? prev : [...prev, name]));
    setQuery("");
  }

  function remove(name: string) {
    setSelected((prev) => prev.filter((n) => n !== name));
  }

  return (
    <div className="flex flex-col gap-2">
      {selected.map((name) => (
        <input key={name} type="hidden" name="tags" value={name} />
      ))}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <button
              type="button"
              className="flex min-h-8 w-full flex-wrap items-center gap-1 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm"
            >
              {selected.length === 0 && <span className="text-muted-foreground">Select tags...</span>}
              {selected.map((name) => (
                <Badge key={name} variant="secondary" className="gap-1">
                  {name}
                  <span
                    role="button"
                    tabIndex={-1}
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(name);
                    }}
                  >
                    <XIcon className="size-3" />
                  </span>
                </Badge>
              ))}
              <ChevronDownIcon className="ml-auto size-4 shrink-0 text-muted-foreground" />
            </button>
          }
        />
        <PopoverContent className="w-64 p-2" align="start">
          <Input
            placeholder="Search or add a tag..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canCreate) {
                e.preventDefault();
                addNew();
              }
            }}
            className="mb-2"
          />
          <div className="flex max-h-48 flex-col gap-1 overflow-y-auto">
            {filtered.map((tag) => (
              <label
                key={tag.id}
                className="flex cursor-default items-center gap-2 rounded-md px-1.5 py-1 text-sm hover:bg-accent"
              >
                <Checkbox
                  checked={selected.includes(tag.name)}
                  onCheckedChange={() => toggle(tag.name)}
                />
                {tag.name}
              </label>
            ))}
            {filtered.length === 0 && !canCreate && (
              <p className="px-1.5 py-1 text-sm text-muted-foreground">No tags found.</p>
            )}
            {canCreate && (
              <button
                type="button"
                onClick={addNew}
                className="rounded-md px-1.5 py-1 text-left text-sm hover:bg-accent"
              >
                Create &quot;{query.trim()}&quot;
              </button>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
