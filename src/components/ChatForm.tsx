"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, ChevronDown, Expand, Minimize } from "lucide-react";
import { MODELS, DEFAULT_MODEL, type ModelId } from "@/lib/models";

interface ChatFormProps {
  onSubmit: (query: string, model: ModelId, stream: boolean) => void;
  disabled?: boolean;
  isCompact?: boolean;
  onCompactToggle?: () => void;
  streaming?: boolean;
  onStreamingToggle?: () => void;
}

export default function ChatForm({ onSubmit, disabled = false, isCompact = false, onCompactToggle, streaming = true, onStreamingToggle }: ChatFormProps) {
  const [q, setQ] = useState("");
  const [selectedModel, setSelectedModel] = useState<ModelId>(DEFAULT_MODEL);
  const [showModels, setShowModels] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowModels(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedModelData = MODELS.find(m => m.id === selectedModel);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (q.trim().length < 3 || disabled) return;
        const query = q.trim();
        setQ("");
        onSubmit(query, selectedModel, streaming);
      }}
      className="flex flex-col gap-2 w-full"
    >
      <div className="flex gap-2 w-full">
        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowModels(!showModels)}
            disabled={disabled}
            className="h-11 px-3 border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-xs font-medium min-w-[120px] transition-colors"
          >
            <span className="truncate">{selectedModelData?.name}</span>
            <ChevronDown className={`h-3 w-3 shrink-0 transition-transform ${showModels ? 'rotate-180' : ''}`} />
          </button>
          {showModels && (
            <div className="absolute bottom-full mb-1 left-0 w-72 bg-background border border-border max-h-80 overflow-y-auto z-50">
              {MODELS.map((model) => (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => {
                    setSelectedModel(model.id);
                    setShowModels(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 hover:bg-accent transition-colors border-b border-border last:border-b-0 ${
                    selectedModel === model.id ? 'bg-accent' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium text-sm">{model.name}</div>
                    {selectedModel === model.id && (
                      <div className="h-1.5 w-1.5 bg-black rounded-full shrink-0" />
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{model.description}</div>
                </button>
              ))}
            </div>
          )}
        </div>
        <Input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ask anything…"
          className="flex-1 h-11"
          disabled={disabled}
          autoComplete="off"
        />
        {onCompactToggle && (
          <div className="flex shrink-0 border border-input h-11">
            <button
              type="button"
              onClick={() => !isCompact && onCompactToggle()}
              disabled={disabled || !isCompact}
              className={`px-3 flex items-center justify-center transition-colors ${
                !isCompact 
                  ? 'bg-black text-white cursor-default' 
                  : 'bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
              title="Full view"
            >
              <Expand className="h-4 w-4" />
            </button>
            <div className="w-px bg-border" />
            <button
              type="button"
              onClick={() => isCompact && onCompactToggle()}
              disabled={disabled || isCompact}
              className={`px-3 flex items-center justify-center transition-colors ${
                isCompact 
                  ? 'bg-black text-white cursor-default' 
                  : 'bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
              title="Compact view"
            >
              <Minimize className="h-4 w-4" />
            </button>
          </div>
        )}
        <Button 
          type="submit" 
          disabled={disabled || q.trim().length < 3}
          size="lg"
          className="px-6 bg-black hover:bg-black/90 text-white disabled:bg-black/50"
        >
          {disabled ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Ask
            </>
          )}
        </Button>
      </div>
      {onStreamingToggle && (
        <div className="flex items-center gap-2 px-1 py-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={streaming}
              onChange={onStreamingToggle}
              disabled={disabled}
              className="h-4 w-4 cursor-pointer disabled:cursor-not-allowed accent-black"
            />
            <span className="text-xs text-muted-foreground">
              Stream responses {streaming ? '(on)' : '(off)'}
            </span>
          </label>
        </div>
      )}
    </form>
  );
}
