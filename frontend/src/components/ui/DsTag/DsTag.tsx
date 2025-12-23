import { ComponentChildren } from 'preact';
import styles from './DsTag.module.scss';
import { cn } from '../../../utils/classNames';

export interface DsTagProps {
	children: ComponentChildren;
	variant?: 'default' | 'accent' | 'success' | 'warning' | 'error';
	size?: 'sm' | 'md' | 'lg';
	rounded?: boolean;
	outline?: boolean;
	className?: string;
	onClick?: () => void;
}

const variantClassMap = {
	default: styles.tagDefault,
	accent: styles.tagAccent,
	success: styles.tagSuccess,
	warning: styles.tagWarning,
	error: styles.tagError,
};

const sizeClassMap = {
	sm: styles.tagSm,
	md: styles.tagMd,
	lg: styles.tagLg,
};

export default function DsTag({
	children,
	variant = 'default',
	size = 'md',
	rounded = true,
	outline = false,
	className,
	onClick,
}: DsTagProps) {
	return (
		<span
			className={cn(
				styles.dsTag,
				variantClassMap[variant],
				sizeClassMap[size],
				rounded && styles.tagRounded,
				outline && styles.tagOutline,
				onClick && styles.tagClickable,
				className
			)}
			onClick={onClick}
			role={onClick ? 'button' : undefined}
			tabIndex={onClick ? 0 : undefined}
		>
			{children}
		</span>
	);
}
