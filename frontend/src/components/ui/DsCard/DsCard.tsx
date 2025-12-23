import { ComponentChildren } from 'preact';
import styles from './DsCard.module.scss';
import { cn } from '../../../utils/classNames';

export interface DsCardProps {
	children: ComponentChildren;
	padding?: 'none' | 'sm' | 'md' | 'lg';
	shadow?: 'none' | 'sm' | 'md' | 'lg';
	border?: boolean;
	hoverable?: boolean;
	fullWidth?: boolean;
	className?: string;
	onClick?: () => void;
	header?: ComponentChildren;
	footer?: ComponentChildren;
	accent?: 'none' | 'top' | 'left' | 'bottom' | 'right';
	accentColor?: string;
}

const paddingClassMap = {
	none: styles.paddingNone,
	sm: styles.paddingSm,
	md: styles.paddingMd,
	lg: styles.paddingLg,
};

const shadowClassMap = {
	none: styles.shadowNone,
	sm: styles.shadowSm,
	md: styles.shadowMd,
	lg: styles.shadowLg,
};

const accentClassMap = {
	none: '',
	top: styles.accentTop,
	left: styles.accentLeft,
	bottom: styles.accentBottom,
	right: styles.accentRight,
};

export default function DsCard({
	children,
	padding = 'md',
	shadow = 'sm',
	border = true,
	hoverable = false,
	fullWidth = false,
	className,
	onClick,
	header,
	footer,
	accent = 'none',
	accentColor,
}: DsCardProps) {
	const hasHeader = header !== undefined;
	const hasFooter = footer !== undefined;
	const isClickable = onClick !== undefined;

	return (
		<div
			className={cn(
				styles.dsCard,
				paddingClassMap[padding],
				shadowClassMap[shadow],
				border && styles.withBorder,
				hoverable && styles.hoverable,
				fullWidth && styles.fullWidth,
				isClickable && styles.clickable,
				accent !== 'none' && accentClassMap[accent],
				className
			)}
			onClick={onClick}
			role={isClickable ? 'button' : undefined}
			tabIndex={isClickable ? 0 : undefined}
			style={accentColor ? { '--accent-color': accentColor } : undefined}
		>
			{hasHeader && <div className={styles.cardHeader}>{header}</div>}

			<div className={styles.cardContent}>{children}</div>

			{hasFooter && <div className={styles.cardFooter}>{footer}</div>}
		</div>
	);
}
