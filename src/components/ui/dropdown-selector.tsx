import { useState, useRef, useEffect, type ReactNode } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from './badge';

export interface DropdownOption {
  id: number | string;
  label: string;
  description?: string;
  secondary?: string;
  badge?: { text: string; variant?: 'secondary' | 'outline' | 'destructive' | 'default' };
  disabled?: boolean;
}

interface DropdownSelectorProps {
  options: DropdownOption[];
  selected: DropdownOption | null;
  onSelect: (option: DropdownOption) => void;
  onClear?: () => void;
  placeholder: string;
  disabled?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  triggerIcon?: ReactNode;
  isLoading?: boolean;
  triggerHeight?: 'sm' | 'md' | 'lg';
  renderRightIcon?: (isOpen: boolean) => ReactNode;
  renderItemRightIcon?: (option: DropdownOption) => ReactNode;
  itemDisabled?: (option: DropdownOption) => boolean;
  onItemClick?: (option: DropdownOption, e: React.MouseEvent) => void;
}

export function DropdownSelector({
  options,
  selected,
  onSelect,
  onClear,
  placeholder,
  disabled = false,
  searchPlaceholder = 'Buscar...',
  emptyMessage = 'No se encontraron resultados',
  triggerIcon,
  isLoading = false,
  triggerHeight = 'md',
  renderRightIcon,
  renderItemRightIcon,
  itemDisabled = () => false,
  onItemClick,
}: DropdownSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const searchTermRef = useRef(searchTerm);

  const PAGE_SIZE = 5;

  // Update ref when search term changes
  useEffect(() => {
    searchTermRef.current = searchTerm;
  }, [searchTerm]);

  // Handle search change and reset pagination
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    // Reset page to 0 when search changes
    setPage(0);
  };

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opt.id.toString() === searchTerm
  );

  const totalPages = Math.ceil(filteredOptions.length / PAGE_SIZE);
  const paginatedOptions = filteredOptions.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
        setPage(0);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (option: DropdownOption) => {
    onSelect(option);
    setIsOpen(false);
    setSearchTerm('');
    setPage(0);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClear?.();
  };

  const handleItemClick = (option: DropdownOption, e: React.MouseEvent) => {
    if (itemDisabled(option)) return;
    if (onItemClick) {
      onItemClick(option, e);
    } else {
      handleSelect(option);
    }
  };

  if (isLoading) {
    return (
      <div className={cn(
        "w-full animate-pulse rounded-xl bg-muted",
        triggerHeight === 'sm' && "h-12",
        triggerHeight === 'md' && "h-14",
        triggerHeight === 'lg' && "h-16"
      )} />
    );
  }

  const triggerHeights = {
    sm: 'h-12',
    md: 'h-14',
    lg: 'h-16',
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <div
        ref={triggerRef}
        onClick={() => !selected && !disabled && setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between w-full px-4 rounded-xl border-2 cursor-pointer transition-all shadow-sm",
          triggerHeights[triggerHeight],
          selected
            ? "bg-background border-primary/30 cursor-default"
            : !disabled
              ? "bg-background hover:border-border cursor-pointer"
              : "opacity-60 cursor-not-allowed bg-muted border-transparent",
          isOpen && selected && "border-primary ring-4 ring-primary/10"
        )}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={cn(
            "p-2 rounded-lg transition-colors shrink-0",
            selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}>
            {triggerIcon}
          </div>
          <div className="flex flex-col items-start text-left flex-1 min-w-0">
            <span className={cn(
              "text-sm font-bold truncate",
              selected ? "text-foreground" : "text-muted-foreground"
            )}>
              {selected ? selected.label : placeholder}
            </span>
            {selected && (
              <span className="text-[10px] text-primary uppercase font-black tracking-wider">
                {selected.description}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!selected && !disabled && <AlertCircle className="size-4 text-amber-500" />}
          {selected ? (
            <button
              onClick={handleClear}
              className="rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8 flex items-center justify-center transition-colors"
              type="button"
            >
              <span className="sr-only">Limpiar</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          ) : (
            renderRightIcon ? renderRightIcon(isOpen) : (
              <ChevronDown className={cn(
                "size-4 shrink-0 opacity-50 transition-transform",
                isOpen && "rotate-180"
              )} />
            )
          )}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="bg-popover border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200"
          style={dropdownStyle}
        >
          {/* Search header */}
          <div className="p-2 border-b border-border bg-muted/30">
            <input
              ref={searchInputRef}
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full text-sm py-1.5 px-3 rounded-lg border border-input bg-background outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Options list */}
          <div className="max-h-60 overflow-y-auto">
            {paginatedOptions.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                {emptyMessage}
              </div>
            ) : (
              paginatedOptions.map((option) => {
                const isOptionDisabled = itemDisabled(option);
                return (
                  <div
                    key={option.id}
                    onClick={(e) => handleItemClick(option, e)}
                    className={cn(
                      "px-4 py-3 cursor-pointer flex justify-between items-center border-b border-border/50 last:border-0 transition-colors",
                      isOptionDisabled && "opacity-50 cursor-not-allowed",
                      !isOptionDisabled && "hover:bg-muted",
                      selected?.id === option.id && "bg-muted"
                    )}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="size-10 bg-muted rounded-lg flex items-center justify-center text-muted-foreground font-bold text-xs shrink-0">
                        #{option.id}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{option.label}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {option.secondary && (
                            <span className="text-primary font-semibold text-sm">{option.secondary}</span>
                          )}
                          {option.badge && (
                            <Badge
                              variant={option.badge.variant || 'secondary'}
                              className="text-[9px] uppercase font-bold px-1.5 py-0"
                            >
                              {option.badge.text}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    {renderItemRightIcon ? (
                      renderItemRightIcon(option)
                    ) : !isOptionDisabled && (
                      <div className="size-8 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-2 border-t border-border bg-muted/30">
              <button
                onClick={(e) => { e.stopPropagation(); setPage(p => Math.max(0, p - 1)); }}
                disabled={page === 0}
                className={cn(
                  "px-2 py-1 text-xs font-medium rounded hover:bg-primary/10 transition-colors",
                  page === 0 && "opacity-30 pointer-events-none"
                )}
                type="button"
              >
                ◀
              </button>
              <span className="text-xs text-muted-foreground">
                {page + 1}/{totalPages}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); setPage(p => Math.min(totalPages - 1, p + 1)); }}
                disabled={page >= totalPages - 1}
                className={cn(
                  "px-2 py-1 text-xs font-medium rounded hover:bg-primary/10 transition-colors",
                  page >= totalPages - 1 && "opacity-30 pointer-events-none"
                )}
                type="button"
              >
                ▶
              </button>
            </div>
          )}

          {/* Footer hint */}
          <div className="p-2 bg-primary text-primary-foreground text-center text-[10px] font-bold uppercase tracking-widest">
            Click en un item para seleccionarlo
          </div>
        </div>
      )}
    </div>
  );
}
