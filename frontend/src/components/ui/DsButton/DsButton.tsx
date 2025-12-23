import { ComponentChildren } from 'preact';
import styles from './DsButton.module.scss';
import { cn } from '../../../utils/classNames';

export interface DsButtonProps {
	children: ComponentChildren;
	variant?: 'default' | 'accent';
	size?: 'sm' | 'md' | 'lg';
	type?: 'button' | 'submit' | 'reset';
	disabled?: boolean;
	fullWidth?: boolean;
	loading?: boolean;
	onClick?: (event: MouseEvent) => void;
	className?: string;
}

const variantClassMap = {
	default: styles.buttonDefault,
	accent: styles.buttonAccent,
};

const sizeClassMap = {
	sm: styles.buttonSm,
	md: styles.buttonMd,
	lg: styles.buttonLg,
};

export default function DsButton({
	children,
	variant = 'default',
	size = 'md',
	type = 'button',
	disabled = false,
	fullWidth = false,
	loading = false,
	onClick,
	className,
}: DsButtonProps) {
	const handleClick = (event: MouseEvent) => {
		if (!disabled && !loading && onClick) {
			onClick(event);
		}
	};

	return (
		<button
			type={type}
			className={cn(
				styles.dsButton,
				variantClassMap[variant],
				sizeClassMap[size],
				disabled && styles.buttonDisabled,
				fullWidth && styles.buttonFullWidth,
				loading && styles.buttonLoading,
				className
			)}
			disabled={disabled || loading}
			onClick={handleClick}
			aria-busy={loading}
		>
			{loading && <span className={styles.loadingSpinner} aria-hidden="true" />}
			<span className={cn(styles.buttonContent, loading && styles.contentHidden)}>
				{children}
			</span>
		</button>
	);
}
