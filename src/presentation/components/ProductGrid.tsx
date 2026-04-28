import { useState, useRef, useEffect } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useTaxes } from '../hooks/usePOS';
import { usePOSStore } from '../store/usePOSStore';
import { useApplication } from '../context/ApplicationContext';
import { Package, ChevronDown, Plus, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 5;

export const ProductGrid: React.FC = () => {
  const { products, isLoading } = useProducts();
  const { data: taxes } = useTaxes();
  const { useCases } = useApplication();
  const { currentInvoice, setInvoice, selectedClient } = usePOSStore();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toString() === searchTerm
  );

  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);
  const paginatedProducts = filteredProducts.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setPage(0);
  }, [searchTerm]);

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

  const handleAdd = (product: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.hasStock || !selectedClient || !currentInvoice) return;

    try {
      // Filter taxes to only include those associated with this product
      const productTaxes = (taxes || []).filter(t => product.taxIds.includes(t.id));

      const updatedInvoice = useCases.addItem.execute(
        currentInvoice,
        product,
        1,
        productTaxes
      );
      setInvoice(updatedInvoice);
      setIsOpen(false);
      setSearchTerm('');
      setPage(0);
    } catch (error: any) {
      alert(error.message);
    }
  };

  if (isLoading) {
    return <div className="animate-pulse h-16 bg-muted rounded-xl" />;
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <div
        ref={triggerRef}
        onClick={() => selectedClient && setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between h-16 px-4 rounded-xl border-2 cursor-pointer transition-all shadow-sm",
          !selectedClient
            ? "opacity-60 cursor-not-allowed bg-muted border-transparent"
            : "bg-background hover:border-border",
          isOpen && selectedClient && "border-primary ring-4 ring-primary/10"
        )}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={cn(
            "p-2 rounded-lg transition-colors shrink-0",
            selectedClient ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}>
            <Package className="size-5" />
          </div>
          <div className="flex flex-col items-start text-left flex-1 min-w-0">
            <span className={cn(
              "text-sm font-bold truncate",
              selectedClient ? "text-foreground" : "text-muted-foreground"
            )}>
              {!selectedClient ? 'Primero seleccione un cliente' : 'Buscar y agregar productos...'}
            </span>
            {selectedClient && (
              <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">
                Escanee o escriba nombre/ID
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!selectedClient && <AlertCircle className="size-4 text-amber-500" />}
          <ChevronDown className={cn(
            "size-4 shrink-0 opacity-50 transition-transform",
            isOpen && "rotate-180"
          )} />
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
              placeholder="Escribe ID o nombre del producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-sm py-1.5 px-3 rounded-lg border border-input bg-background outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Product list */}
          <div className="max-h-60 overflow-y-auto">
            {paginatedProducts.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                No se encontraron productos
              </div>
            ) : (
              paginatedProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={(e) => product.hasStock && handleAdd(product, e)}
                  className={cn(
                    "px-4 py-3 cursor-pointer flex justify-between items-center border-b border-border/50 last:border-0 transition-colors",
                    !product.hasStock && "opacity-50 cursor-not-allowed",
                    product.hasStock && "hover:bg-muted",
                    selectedClient && "cursor-pointer"
                  )}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="size-10 bg-muted rounded-lg flex items-center justify-center text-muted-foreground font-bold text-xs shrink-0">
                      #{product.id}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{product.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-primary font-semibold text-sm">{product.price.toString()}</span>
                        <Badge
                          variant={product.stock.value > 10 ? "secondary" : product.stock.value > 0 ? "outline" : "destructive"}
                          className="text-[9px] uppercase font-bold px-1.5 py-0"
                        >
                          {product.stock.value} stock
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {product.hasStock ? (
                    <div className="size-8 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0">
                      <Plus className="size-4" />
                    </div>
                  ) : (
                    <span className="text-[9px] text-destructive font-bold uppercase italic shrink-0">Agotado</span>
                  )}
                </div>
              ))
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
            Click en un producto para agregarlo
          </div>
        </div>
      )}
    </div>
  );
};