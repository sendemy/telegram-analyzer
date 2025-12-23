import { useState, useRef } from 'preact/hooks';
import DsTag from './ui/DsTag';
import DsButton from './ui/DsButton';

interface FileUploadProps {
	onFileLoaded: (data: any) => void;
	acceptedFormats?: string[];
	maxSizeMB?: number;
	showPreview?: boolean;
}

export default function FileUpload({
	onFileLoaded,
	acceptedFormats = ['.json', 'application/json'],
	maxSizeMB = 10,
	showPreview = true,
}: FileUploadProps) {
	const [isDragging, setIsDragging] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [fileInfo, setFileInfo] = useState<{
		name: string;
		size: number;
		lastModified: Date;
	} | null>(null);
	const [previewData, setPreviewData] = useState<any>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = (event: Event) => {
		const file = (event.target as HTMLInputElement).files?.[0];
		if (file) {
			processFile(file);
		}
	};

	const handleDragOver = (event: DragEvent) => {
		event.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = (event: DragEvent) => {
		event.preventDefault();
		setIsDragging(false);
	};

	const handleDrop = (event: DragEvent) => {
		event.preventDefault();
		setIsDragging(false);

		const file = event.dataTransfer?.files[0];
		if (file) {
			processFile(file);
		}
	};

	const validateFile = (file: File): boolean => {
		setError(null);

		// Check file type
		const isJsonFile =
			file.type === 'application/json' || file.name.toLowerCase().endsWith('.json');
		if (!isJsonFile) {
			setError('Please upload a valid JSON file');
			return false;
		}

		// Check file size (default 10MB)
		const maxSize = maxSizeMB * 1024 * 1024;
		if (file.size > maxSize) {
			setError(`File size exceeds ${maxSizeMB}MB limit`);
			return false;
		}

		// Check if empty
		if (file.size === 0) {
			setError('File is empty');
			return false;
		}

		return true;
	};

	const processFile = async (file: File) => {
		if (!validateFile(file)) {
			resetFileInput();
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			const fileData = await readFileAsync(file);

			// Store file info
			setFileInfo({
				name: file.name,
				size: file.size,
				lastModified: new Date(file.lastModified),
			});

			// Parse JSON
			let parsedData;
			try {
				parsedData = JSON.parse(fileData);
			} catch (parseError) {
				setError('Invalid JSON format. Please check your file.');
				setIsLoading(false);
				return;
			}

			// Validate it's a Telegram export (basic check)
			if (!parsedData.messages || !Array.isArray(parsedData.messages)) {
				setError('File does not appear to be a valid Telegram chat export');
				setIsLoading(false);
				return;
			}

			// Show preview if enabled
			if (showPreview) {
				setPreviewData({
					messageCount: parsedData.messages.length,
					participants: getParticipants(parsedData.messages),
					dateRange: getDateRange(parsedData.messages),
				});
			}

			// Pass data to parent
			onFileLoaded(parsedData);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to read file');
			console.error('File processing error:', err);
		} finally {
			setIsLoading(false);
		}
	};

	const readFileAsync = (file: File): Promise<string> => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();

			reader.onload = (event) => {
				resolve(event.target?.result as string);
			};

			reader.onerror = () => {
				reject(new Error('Failed to read file'));
			};

			reader.onabort = () => {
				reject(new Error('File reading was aborted'));
			};

			reader.readAsText(file);
		});
	};

	const getParticipants = (messages: any[]): string[] => {
		const participants = new Set<string>();
		messages.forEach((msg) => {
			if (msg.from) {
				participants.add(msg.from);
			}
		});
		return Array.from(participants).slice(0, 10); // Show first 10
	};

	const getDateRange = (messages: any[]): { start: Date | null; end: Date | null } => {
		if (messages.length === 0) return { start: null, end: null };

		const dates = messages
			.filter((msg) => msg.date)
			.map((msg) => new Date(msg.date))
			.filter((date) => !isNaN(date.getTime()));

		if (dates.length === 0) return { start: null, end: null };

		return {
			start: new Date(Math.min(...dates.map((d) => d.getTime()))),
			end: new Date(Math.max(...dates.map((d) => d.getTime()))),
		};
	};

	const resetFileInput = () => {
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
		setFileInfo(null);
		setPreviewData(null);
		setError(null);
	};

	const triggerFileInput = () => {
		fileInputRef.current?.click();
	};

	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	const formatDate = (date: Date): string => {
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	};

	return (
		<div className="file-upload-container">
			{/* File upload area */}
			<div
				className={`file-drop-zone ${isDragging ? 'dragging' : ''} ${error ? 'error' : ''}`}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				onClick={triggerFileInput}
			>
				<input
					ref={fileInputRef}
					type="file"
					accept={acceptedFormats.join(',')}
					onChange={handleFileChange}
					className="file-input"
					aria-label="Upload Telegram chat JSON file"
				/>

				<div className="drop-zone-content">
					{isLoading ? (
						<div className="loading-indicator">
							<div className="spinner"></div>
							<p>Processing file...</p>
						</div>
					) : (
						<>
							<div className="upload-icon">
								<svg
									width="48"
									height="48"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
								>
									<path
										d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
										strokeWidth="2"
										strokeLinecap="round"
									/>
									<polyline
										points="17 8 12 3 7 8"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<line
										x1="12"
										y1="3"
										x2="12"
										y2="15"
										strokeWidth="2"
										strokeLinecap="round"
									/>
								</svg>
							</div>

							<div className="upload-text">
								<h3>Upload Telegram Chat Export</h3>
								<p className="instruction">
									Drag & drop your JSON file here, or{' '}
									<span className="browse-link">browse</span>
								</p>
								<p className="file-requirements">
									Supports: JSON files • Max size: {maxSizeMB}MB
								</p>
							</div>
						</>
					)}
				</div>
			</div>

			{/* Error display */}
			{error && (
				<div className="error-message" role="alert">
					<div className="error-icon">⚠️</div>
					<div className="error-content">
						<strong>Error:</strong> {error}
					</div>
					<DsButton onClick={() => setError(null)} aria-label="Dismiss error">
						&times;
					</DsButton>
				</div>
			)}

			{/* File info preview */}
			{fileInfo && !isLoading && !error && (
				<div className="file-info">
					<div className="file-info-header">
						<h4>Selected File</h4>
						<DsButton onClick={resetFileInput} aria-label="Clear selected file">
							Clear
						</DsButton>
					</div>

					<div className="file-details">
						<div className="file-icon">
							<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
								<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
								<path d="M14 2v6h6" />
							</svg>
						</div>
						<div className="file-meta">
							<div className="file-name">{fileInfo.name}</div>
							<div className="file-size">{formatFileSize(fileInfo.size)}</div>
							<div className="file-modified">
								Modified: {formatDate(fileInfo.lastModified)}
							</div>
						</div>
					</div>

					{/* JSON preview */}
					{showPreview && previewData && (
						<div className="json-preview">
							<div className="preview-header">
								<h5>Chat Preview</h5>
								<DsTag variant="accent">
									{previewData.messageCount.toLocaleString()} messages
								</DsTag>
							</div>

							<div className="preview-stats">
								<div className="stat-item">
									<span className="stat-label">Participants:</span>
									<span className="stat-value">
										{previewData.participants.length > 0
											? previewData.participants.join(', ') +
												(previewData.participants.length === 10
													? '...'
													: '')
											: 'None found'}
									</span>
								</div>

								{previewData.dateRange.start && previewData.dateRange.end && (
									<div className="stat-item">
										<span className="stat-label">Date Range:</span>
										<span className="stat-value">
											{formatDate(previewData.dateRange.start)} —{' '}
											{formatDate(previewData.dateRange.end)}
										</span>
									</div>
								)}
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
