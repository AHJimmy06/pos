import React from "react";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface HelpButtonProps {
	onClick: () => void;
	className?: string;
}

/**
 * Floating help button. Always visible on screen (fixed positioning),
 * 48x48 px, accessible from keyboard with `?` shortcut too.
 */
export const HelpButton: React.FC<HelpButtonProps> = ({
	onClick,
	className,
}) => {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-label="Abrir ayuda"
			title="Ayuda (?)"
			className={cn(
				"fixed bottom-6 right-6 z-50",
				"size-12 rounded-full shadow-lg",
				"bg-primary text-primary-foreground",
				"hover:bg-primary/90 active:scale-95",
				"transition-all duration-150",
				"flex items-center justify-center",
				className,
			)}
		>
			<HelpCircle className="size-6" aria-hidden="true" />
		</button>
	);
};
