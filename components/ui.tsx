import * as React from "react";
import { cn } from "@/lib/utils";

export const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "solid" | "flat" | "light" | "shadow", color?: "primary" | "danger" | "default", size?: "sm" | "md" | "lg", isIconOnly?: boolean, isLoading?: boolean, onPress?: (e: any) => void, radius?: "full" | "lg" | "md" | "sm" | "none" }>(({ className, variant = "solid", color = "default", size = "md", isIconOnly, isLoading, onPress, onClick, children, radius = "xl", ...props }, ref) => {
  return (
    <button
      ref={ref}
      onClick={(e) => {
        if (onPress) onPress(e);
        if (onClick) onClick(e);
      }}
      disabled={isLoading || props.disabled}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:pointer-events-none disabled:opacity-50",
        radius === "full" ? "rounded-full" : radius === "lg" ? "rounded-2xl" : radius === "md" ? "rounded-xl" : radius === "sm" ? "rounded-lg" : "rounded-none",
        size === "sm" ? (isIconOnly ? "h-8 w-8" : "h-8 px-3 text-sm") :
        size === "lg" ? (isIconOnly ? "h-14 w-14" : "h-12 px-8 text-lg") :
        (isIconOnly ? "h-10 w-10" : "h-10 px-4 py-2 text-sm"),
        variant === "solid" && color === "primary" ? "bg-zinc-900 text-white hover:bg-zinc-800" :
        variant === "solid" && color === "danger" ? "bg-red-500 text-white hover:bg-red-600" :
        variant === "solid" && color === "default" ? "bg-zinc-100 text-zinc-900 hover:bg-zinc-200" :
        variant === "flat" && color === "danger" ? "bg-red-100 text-red-600 hover:bg-red-200" :
        variant === "light" && color === "danger" ? "bg-transparent text-red-600 hover:bg-red-50" :
        variant === "light" ? "bg-transparent hover:bg-zinc-100 text-zinc-900" :
        variant === "shadow" ? "bg-zinc-900 text-white shadow-lg hover:bg-zinc-800" :
        "bg-zinc-100 text-zinc-900 hover:bg-zinc-200",
        className
      )}
      {...props}
    >
      {isLoading ? "..." : children}
    </button>
  );
});
Button.displayName = "Button";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { label?: string, value?: string, onValueChange?: (val: string) => void }>(({ className, label, value, onValueChange, onChange, ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-[11px] font-black uppercase tracking-wider text-zinc-500">{label}</label>}
      <input
        ref={ref}
        value={value}
        onChange={(e) => {
          if (onValueChange) onValueChange(e.target.value);
          if (onChange) onChange(e);
        }}
        className={cn(
          "flex h-11 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-[14px] font-bold text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900",
          className
        )}
        {...props}
      />
    </div>
  );
});
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string, value?: string, onValueChange?: (val: string) => void }>(({ className, label, value, onValueChange, onChange, ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-[11px] font-black uppercase tracking-wider text-zinc-500">{label}</label>}
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => {
          if (onValueChange) onValueChange(e.target.value);
          if (onChange) onChange(e);
        }}
        className={cn(
          "flex min-h-[100px] w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-[14px] font-bold text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 resize-y",
          className
        )}
        {...props}
      />
    </div>
  );
});
Textarea.displayName = "Textarea";

export const Select = ({ label, children, value, onChange, className }: any) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-[11px] font-black uppercase tracking-wider text-zinc-500">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange && onChange({ target: { value: e.target.value } })}
        className={cn("flex h-11 w-full flex-row rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-[14px] font-bold text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900", className)}
      >
        {children}
      </select>
    </div>
  );
};

export const SelectItem = ({ value, children }: any) => {
  return <option value={value}>{children}</option>;
};

export const Checkbox = ({ isSelected, onValueChange, children, lineThrough, className }: any) => {
  return (
    <label className={cn("flex items-center gap-3 cursor-pointer", className)}>
      <div className={cn("w-6 h-6 rounded-[8px] border-2 flex items-center justify-center transition-all", isSelected ? "bg-zinc-900 border-zinc-900 text-white" : "border-zinc-300 bg-white")}>
        {isSelected && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="w-4 h-4"><polyline points="20 6 9 17 4 12" /></svg>}
      </div>
      <input type="checkbox" className="hidden" checked={isSelected} onChange={(e) => onValueChange(!isSelected)} />
      {children && <span className={cn("text-sm transition-all duration-300", lineThrough && isSelected && "line-through opacity-40")}>{children}</span>}
    </label>
  );
};

export const Switch = ({ isSelected, onValueChange, children, className }: any) => {
  return (
    <label className={cn("flex items-center gap-3 cursor-pointer", className)}>
      <div className={cn("w-12 h-7 rounded-full transition-colors relative flex items-center shadow-inner", isSelected ? "bg-zinc-900" : "bg-zinc-200")}>
        <div className={cn("w-5 h-5 rounded-full bg-white absolute transition-transform shadow-sm", isSelected ? "transform translate-x-[24px]" : "transform translate-x-1")} />
      </div>
      <input type="checkbox" className="hidden" checked={isSelected} onChange={(e) => onValueChange(!isSelected)} />
      {children && <span className="text-[14px] font-bold text-zinc-900">{children}</span>}
    </label>
  );
};

const ModalContext = React.createContext({ onClose: () => {} });

export const Modal = ({ isOpen, onOpenChange, children, className }: any) => {
  if (!isOpen) return null;
  return (
    <ModalContext.Provider value={{ onClose: () => onOpenChange(false) }}>
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200" onClick={() => onOpenChange(false)}>
        <div 
          className={cn("bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col transform transition-all animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95", className)}
          onClick={e => e.stopPropagation()}
        >
          <div className="w-12 h-1.5 bg-zinc-200 rounded-full mx-auto mt-4 sm:hidden flex-shrink-0" />
          {children}
        </div>
      </div>
    </ModalContext.Provider>
  );
};

export const ModalContent = ({ children }: any) => {
  const { onClose } = React.useContext(ModalContext);
  return typeof children === "function" ? <>{children(onClose)}</> : <>{children}</>;
};
export const ModalHeader = ({ children, className }: any) => <div className={cn("px-6 py-5 pb-2", className)}>{children}</div>;
export const ModalBody = ({ children, className }: any) => <div className={cn("px-6 py-4 overflow-y-auto flex-1 flex flex-col gap-4", className)}>{children}</div>;
export const ModalFooter = ({ children, className }: any) => <div className={cn("px-6 py-5 border-t border-zinc-100 bg-zinc-50", className)}>{children}</div>;

export const ScrollShadow = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("overflow-y-auto", className)} {...props}>
      {children}
    </div>
  );
});
ScrollShadow.displayName = "ScrollShadow";

export const Divider = ({ className, orientation = "horizontal" }: any) => (
  <div className={cn("bg-zinc-200", orientation === "horizontal" ? "w-full h-px" : "w-px h-full", className)} />
);
export const Tabs = ({ children }: any) => <div className="flex gap-2 p-1 bg-zinc-100 rounded-xl">{children}</div>;
export const Tab = ({ children, key, title }: any) => <div className="hidden">{children}</div>;
