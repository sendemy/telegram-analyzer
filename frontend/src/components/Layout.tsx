import { ComponentChildren } from 'preact';

interface LayoutProps {
	children: ComponentChildren;
	title?: string;
	description?: string;
	showHeader?: boolean;
	showFooter?: boolean;
}

export default function Layout({
	children,
	title = 'Telegram Chat Analyzer',
	description = 'Upload your Telegram chat export (JSON) to visualize statistics and insights',
	showHeader = true,
	showFooter = true,
}: LayoutProps) {
	return (
		<div className="app-layout">
			{/* Header */}
			{showHeader && (
				<header className="app-header">
					<div className="header-content">
						<div className="header-logo">
							<svg width="32" height="32" viewBox="0 0 24 24" fill="#2b5797">
								<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.57-1.38-.93-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.06-.2-.07-.06-.17-.04-.24-.02-.1.02-1.79 1.14-5.06 3.34-.48.33-.92.49-1.31.48-.43-.01-1.27-.25-1.89-.45-.76-.26-1.36-.4-1.31-.85.03-.26.4-.52 1.1-.8.85-.34 2.27-.89 3.93-1.38 5.26-1.53 6.36-1.78 7.08-1.79.16 0 .51.04.74.23.18.15.23.35.25.49.03.14.04.47-.01.73z" />
							</svg>
							<h1>{title}</h1>
						</div>
						<p className="header-description">{description}</p>
					</div>
				</header>
			)}

			{/* Main Content */}
			<main className="app-main">
				<div className="container">{children}</div>
			</main>

			{/* Footer */}
			{showFooter && (
				<footer className="app-footer">
					<div className="footer-content">
						<div className="footer-info">
							<p>Made with ❤️ using Preact & Chart.js</p>
							<p className="footer-note">Your data is processed locally and never leaves your browser.</p>
						</div>
					</div>
				</footer>
			)}
		</div>
	);
}
