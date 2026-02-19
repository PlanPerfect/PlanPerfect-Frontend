import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Box, Flex, Heading, Text, Textarea, VStack, HStack, IconButton, Button, Image, Dialog, Portal, CloseButton } from "@chakra-ui/react";
import { Send, Sparkles, Loader2, Paperclip, X, Download } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ref, onValue, off } from "firebase/database";
import { database } from "@/firebase";
import LandingBackground from "../../assets/LandingBackground.png";
import ShowToast from "@/Extensions/ShowToast";
import server from "../../../networking";

const renderInline = text => {
	if (!text) return text;
	const regex = /(\*\*[^*\n]+?\*\*|\*[^*\n]+?\*|`[^`\n]+?`)/g;
	const segments = text.split(regex);
	return segments.map((seg, i) => {
		if (seg.startsWith("**") && seg.endsWith("**")) {
			return (
				<strong key={i} style={{ fontWeight: 700, color: "rgba(255,255,255,1)" }}>
					{seg.slice(2, -2)}
				</strong>
			);
		}
		if (seg.startsWith("*") && seg.endsWith("*") && !seg.startsWith("**")) {
			return <em key={i}>{seg.slice(1, -1)}</em>;
		}
		if (seg.startsWith("`") && seg.endsWith("`")) {
			return (
				<code
					key={i}
					style={{
						background: "rgba(255,255,255,0.12)",
						padding: "1px 5px",
						borderRadius: "3px",
						fontFamily: "monospace",
						fontSize: "0.88em"
					}}
				>
					{seg.slice(1, -1)}
				</code>
			);
		}
		return seg;
	});
};

const renderMessageContent = content => {
	if (!content) return null;
	const elements = [];
	const normalizedContent = content
		.replace(/\r\n/g, "\n")
		.replace(/([:;])\s+(\d+\.\s+)/g, "$1\n$2")
		.replace(/([:;])\s+([•*-]\s+)/g, "$1\n$2")
		.replace(/\s-\s(?=[A-Z0-9])/g, "\n- ");
	const lines = normalizedContent.split("\n");

	for (let i = 0; i < lines.length; i += 1) {
		const key = `line-${i}`;
		let trimmed = lines[i].trim();

		if (/^\d+\.$/.test(trimmed)) {
			let nextLineIndex = i + 1;
			while (nextLineIndex < lines.length && lines[nextLineIndex].trim() === "") {
				nextLineIndex += 1;
			}
			if (nextLineIndex < lines.length) {
				const nextText = lines[nextLineIndex].trim();
				if (nextText && !/^(\d+\.|[-*•]\s|#{1,3}\s)/.test(nextText)) {
					trimmed = `${trimmed} ${nextText}`;
					i = nextLineIndex;
				}
			}
		}
		if (/^[•*-]$/.test(trimmed)) {
			let nextLineIndex = i + 1;
			while (nextLineIndex < lines.length && lines[nextLineIndex].trim() === "") {
				nextLineIndex += 1;
			}
			if (nextLineIndex < lines.length) {
				const nextText = lines[nextLineIndex].trim();
				if (nextText && !/^(\d+\.|[-*•]\s|#{1,3}\s)/.test(nextText)) {
					trimmed = `${trimmed} ${nextText}`;
					i = nextLineIndex;
				}
			}
		}

		if (trimmed.startsWith("### ")) {
			elements.push(
				<Text key={key} fontWeight="700" fontSize="0.95em" color="rgba(255,255,255,0.98)" mt={2} mb={0.5}>
					{renderInline(trimmed.slice(4))}
				</Text>
			);
		} else if (trimmed.startsWith("## ")) {
			elements.push(
				<Text key={key} fontWeight="700" fontSize="1.05em" color="rgba(255,255,255,0.98)" mt={2} mb={1}>
					{renderInline(trimmed.slice(3))}
				</Text>
			);
		} else if (trimmed.startsWith("# ")) {
			elements.push(
				<Text key={key} fontWeight="700" fontSize="1.15em" color="rgba(255,255,255,0.98)" mt={2} mb={1}>
					{renderInline(trimmed.slice(2))}
				</Text>
			);
		} else if (/^([-*]|•)\s+/.test(trimmed)) {
			elements.push(
				<Flex key={key} gap={2} align="flex-start" pl={2} mb={0.5}>
					<Text color="rgba(255,215,0,0.8)" flexShrink={0} lineHeight="1.8">
						•
					</Text>
					<Text color="rgba(255,255,255,0.95)" lineHeight="1.8">
						{renderInline(trimmed.replace(/^([-*]|•)\s+/, ""))}
					</Text>
				</Flex>
			);
		} else if (/^\d+\.\s+/.test(trimmed)) {
			const m = trimmed.match(/^(\d+)\.\s+(.*)/);
			elements.push(
				<Flex key={key} gap={2} align="flex-start" pl={2} mb={0.5}>
					<Text color="rgba(255,215,0,0.8)" flexShrink={0} lineHeight="1.8">
						{m[1]}.
					</Text>
					<Text color="rgba(255,255,255,0.95)" lineHeight="1.8">
						{renderInline(m[2])}
					</Text>
				</Flex>
			);
		} else if (trimmed === "") {
			elements.push(<Box key={key} h="0.4em" />);
		} else {
			elements.push(
				<Text key={key} color="rgba(255,255,255,0.95)" lineHeight="1.8">
					{renderInline(trimmed)}
				</Text>
			);
		}
	}

	return <Box textAlign="left">{elements}</Box>;
};

const titleCase = str =>
	(str || "")
		.split(" ")
		.map(w => w.charAt(0).toUpperCase() + w.slice(1))
		.join(" ");

const OUTPUT_CATEGORIES = [
	{ key: "Web Searches", label: "Web Searches" },
	{ key: "Generated Images", label: "Generated Images" },
	{ key: "Generated Floor Plans", label: "Generated Floor Plans" },
	{ key: "Extracted Colors", label: "Color Palettes" },
	{ key: "Detected Furniture", label: "Detected Furniture" },
	{ key: "Classified Style", label: "Classified Styles" },
	{ key: "Recommendations", label: "Recommendations" }
];

const OUTPUT_BRANCH_TO_CATEGORY = {
	"Outputs/Web Searches": "Web Searches",
	"Outputs/Generated Images": "Generated Images",
	"Outputs/Generated Floor Plans": "Generated Floor Plans",
	"Outputs/Extracted Colors": "Extracted Colors",
	"Outputs/Detected Furniture": "Detected Furniture",
	"Outputs/Classified Style": "Classified Style",
	"Outputs/Recommendations": "Recommendations"
};

const createInitialAgentMessage = () => ({
	role: "assistant",
	content: "Welcome to Le'Orchestra. What would you like me to help you with?",
	timestamp: new Date(),
	isThinking: false
});

const buildMessagesFromSteps = steps => {
	if (!Array.isArray(steps) || steps.length === 0) return null;

	const messages = [];
	for (const step of steps) {
		if (!step || typeof step !== "object") continue;
		const { type, content, timestamp } = step;

		if (type === "user_query" && typeof content === "string" && content.trim()) {
			messages.push({
				role: "user",
				content: content.trim(),
				timestamp: timestamp ? new Date(timestamp) : new Date()
			});
		} else if (type === "response" && typeof content === "string" && content.trim()) {
			messages.push({
				role: "assistant",
				content: content.trim(),
				timestamp: timestamp ? new Date(timestamp) : new Date()
			});
		}
	}

	return messages.length > 0 ? messages : null;
};

function ImageDownloadButton({ onDownload, label }) {
	const [isDownloading, setIsDownloading] = useState(false);

	const handleClick = async e => {
		e.preventDefault();
		e.stopPropagation();
		if (isDownloading) return;
		setIsDownloading(true);
		try {
			await onDownload();
		} finally {
			setIsDownloading(false);
		}
	};

	return (
		<Button
			mt={2}
			w="100%"
			size="xs"
			disabled={isDownloading}
			onPointerDown={e => e.preventDefault()}
			onMouseDown={e => e.preventDefault()}
			onClick={handleClick}
			aria-label={`Download ${label}`}
			borderRadius="md"
			bg="rgba(255, 255, 255, 0.14)"
			border="1px solid rgba(255, 255, 255, 0.28)"
			backdropFilter="blur(10px) saturate(160%)"
			WebkitBackdropFilter="blur(10px) saturate(160%)"
			opacity={isDownloading ? 0.75 : 1}
			cursor={isDownloading ? "not-allowed" : "pointer"}
			color="white"
			fontSize="xs"
			fontWeight="600"
			_hover={isDownloading ? {} : { bg: "rgba(255, 255, 255, 0.22)" }}
		>
			{
				<Flex align="center" gap={2}>
					<Download size={13} color="white" />
					<Text as="span" color="white" fontSize="xs">
						Download Image
					</Text>
				</Flex>
			}
		</Button>
	);
}

function ThumbnailDownloadButton({ onDownload, label, isFurniture = false }) {
	const [isDownloading, setIsDownloading] = useState(false);

	const handleClick = async e => {
		e.preventDefault();
		e.stopPropagation();
		if (isDownloading) return;
		setIsDownloading(true);
		try {
			await onDownload();
		} finally {
			setIsDownloading(false);
		}
	};

	return (
		<IconButton
			size="xs"
			variant="ghost"
			colorPalette="whiteAlpha"
			disabled={isDownloading}
			onPointerDown={e => e.preventDefault()}
			onMouseDown={e => e.preventDefault()}
			onClick={handleClick}
			aria-label={`Download ${label}`}
			flexShrink={0}
			minW={isFurniture ? "28px" : "24px"}
			h={isFurniture ? "28px" : "24px"}
			p={0}
			borderRadius={isFurniture ? 10 : "full"}
			bg="rgba(255, 255, 255, 0.14)"
			border="1px solid rgba(255, 255, 255, 0.28)"
			backdropFilter="blur(8px) saturate(160%)"
			WebkitBackdropFilter="blur(8px) saturate(160%)"
			opacity={isDownloading ? 0.75 : 1}
			cursor={isDownloading ? "not-allowed" : "pointer"}
			_hover={isDownloading ? {} : { bg: "rgba(255, 255, 255, 0.22)" }}
		>
			<Download size={isFurniture ? 14 : 10} color="white" />
		</IconButton>
	);
}

function OutputImageCard({ src, alt, maxH = "300px", onDownload }) {
	return (
		<Flex justify="center" align="center" w="100%">
			<Box display="inline-flex" flexDirection="column" alignItems="stretch" w="fit-content" maxW="100%">
				<Image
					src={src}
					alt={alt}
					color="white"
					borderRadius="md"
					w="100%"
					h="auto"
					maxH={maxH}
					maxW="100%"
					objectFit="contain"
					crossOrigin="anonymous"
					style={{ color: "white" }}
					fallback={
						<Text color="white" fontSize="sm" textAlign="center" py={2}>
							Image unavailable
						</Text>
					}
				/>
				<ImageDownloadButton onDownload={() => onDownload(src, alt)} label={alt} />
			</Box>
		</Flex>
	);
}

function AgentPage() {
	const { user } = useAuth();
	const navigate = useNavigate();

	const [historyLoaded, setHistoryLoaded] = useState(false);

	const [messages, setMessages] = useState([createInitialAgentMessage()]);
	const [inputValue, setInputValue] = useState("");
	const [isProcessing, setIsProcessing] = useState(false);
	const [currentStep, setCurrentStep] = useState("Thinking...");
	const [uploadedFiles, setUploadedFiles] = useState([]);
	const [outputs, setOutputs] = useState(null);
	const [outputCategoryRecency, setOutputCategoryRecency] = useState({});
	const [showOutputs, setShowOutputs] = useState(false);
	const messagesEndRef = useRef(null);
	const textareaRef = useRef(null);
	const fileInputRef = useRef(null);
	const outputsScrollRef = useRef(null);
	const messagePreviewUrlsRef = useRef(new Set());
	const [liveSteps, setLiveSteps] = useState([]);
	const [showAgentStatus, setShowAgentStatus] = useState(false);
	const [isClearingSession, setIsClearingSession] = useState(false);
	const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
	const [currentAgentModel, setCurrentAgentModel] = useState("");

	const glassPanelStyle = {
		position: "relative",
		isolation: "isolate",
		background: "rgba(255, 255, 255, 0.08)",
		border: "1px solid rgba(255, 255, 255, 0.15)",
		boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.12)",
		transform: "translateZ(0)",
		backfaceVisibility: "hidden",
		WebkitBackfaceVisibility: "hidden",
		_before: {
			content: '""',
			position: "absolute",
			inset: 0,
			pointerEvents: "none",
			borderRadius: "inherit",
			backdropFilter: "blur(22px) saturate(165%)",
			WebkitBackdropFilter: "blur(22px) saturate(165%)",
			transform: "translateZ(0)"
		}
	};

	useEffect(() => {
		if (!user?.uid) return;

		let cancelled = false;

		const loadHistory = async () => {
			try {
				const response = await server.post("/agent/get-session", { uid: user.uid });
				if (cancelled) return;

				const session = response?.data;

				const rebuilt = buildMessagesFromSteps(session?.steps);
				if (rebuilt) {
					setMessages(rebuilt);
				}

				const sessionOutputs = session?.Outputs;
				if (sessionOutputs && typeof sessionOutputs === "object") {
					const hasOutputs = Object.values(sessionOutputs).some(arr => Array.isArray(arr) && arr.length > 0);
					if (hasOutputs) {
						setOutputs(sessionOutputs);
						setShowOutputs(true);
					}
				}
			} catch (err) {
				if (!cancelled) {
					console.warn("[AgentPage] Could not load session history:", err);
				}
			} finally {
				if (!cancelled) {
					setHistoryLoaded(true);
				}
			}
		};

		loadHistory();

		return () => {
			cancelled = true;
		};
	}, [user?.uid]);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, currentStep]);

	const fetchCurrentAgentModel = async () => {
		try {
			const response = await server.get("/agent/current-agent-model");
			setCurrentAgentModel(response.data.model);
		} catch (err) {
			setCurrentAgentModel("");
		}
	};

	useEffect(() => {
		fetchCurrentAgentModel();
	}, []);

	useEffect(() => {
		if (!user?.uid) return;

		const currentStepRef = ref(database, `Users/${user.uid}/Agent/current_step`);

		const unsubscribe = onValue(
			currentStepRef,
			snapshot => {
				const step = snapshot.val();
				if (!step) return;

				setCurrentStep(step);

				if (step !== "Done!") {
					setLiveSteps(prev => {
						if (prev.length > 0 && prev[prev.length - 1].step === step) return prev;
						return [...prev, { step, timestamp: new Date().toISOString(), status: "active" }];
					});
				} else {
					setLiveSteps(prev => prev.map(s => ({ ...s, status: "complete" })));
				}

				if (step === "Done!") {
					setIsProcessing(false);
				} else if (step !== "Thinking...") {
					setIsProcessing(true);
				}
			},
			error => {
				console.error("❌ [FIREBASE ERROR]:", error);
			}
		);

		return () => off(currentStepRef);
	}, [user?.uid]);

	useEffect(() => {
		if (!user?.uid) return;

		const statusRef = ref(database, `Users/${user.uid}/Agent/status`);

		const unsubscribe = onValue(statusRef, snapshot => {
			const status = snapshot.val();
			setIsProcessing(status === "running");
		});

		return () => off(statusRef);
	}, [user?.uid]);

	useEffect(() => {
		if (!user?.uid) return;

		const outputsRef = ref(database, `Users/${user.uid}/Agent/Outputs`);

		const unsubscribe = onValue(outputsRef, snapshot => {
			const outputsData = snapshot.val();
			if (!outputsData) return;
			setOutputs(outputsData);
			const hasOutputs = Object.values(outputsData).some(arr => Array.isArray(arr) && arr.length > 0);
			if (hasOutputs) setShowOutputs(true);
		});

		return () => off(outputsRef);
	}, [user?.uid]);

	useEffect(() => {
		if (!user?.uid) return;

		const stepsRef = ref(database, `Users/${user.uid}/Agent/steps`);
		onValue(stepsRef, snapshot => {
			const rawSteps = snapshot.val();
			const steps = Array.isArray(rawSteps) ? rawSteps : rawSteps ? Object.values(rawSteps) : [];
			const nextRecency = {};

			steps.forEach((step, index) => {
				if (!step || step.type !== "tool_result") return;
				const content = step.content && typeof step.content === "object" ? step.content : null;
				const outputBranch = content && typeof content.output_branch === "string" ? content.output_branch : "";
				const categoryKey = OUTPUT_BRANCH_TO_CATEGORY[outputBranch];
				if (!categoryKey) return;

				const parsedTimestamp = Date.parse(step.timestamp || "");
				const rank = Number.isFinite(parsedTimestamp) ? parsedTimestamp : index;
				if (!Number.isFinite(nextRecency[categoryKey]) || rank > nextRecency[categoryKey]) {
					nextRecency[categoryKey] = rank;
				}
			});

			setOutputCategoryRecency(nextRecency);
		});

		return () => off(stepsRef);
	}, [user?.uid]);

	useEffect(() => {
		if (isProcessing) {
			setShowAgentStatus(true);
		} else if (!isProcessing && liveSteps.length > 0) {
			setShowAgentStatus(false);
			setLiveSteps([]);
		}
	}, [isProcessing]);

	const adjustTextareaHeight = () => {
		const textarea = textareaRef.current;
		if (textarea) {
			textarea.style.height = "auto";
			textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
		}
	};

	useEffect(() => {
		adjustTextareaHeight();
	}, [inputValue]);

	const handleFileSelect = e => {
		const ALLOWED = ["image/png", "image/jpeg", "image/jpg"];
		const selectedFiles = Array.from(e.target.files || []);
		const files = selectedFiles.filter(f => {
			if (ALLOWED.includes(f.type.toLowerCase())) return true;
			ShowToast("error", `Unsupported file: ${f.name}`, "Only PNG and JPG/JPEG images are allowed.");
			return false;
		});

		if (files.length === 0) {
			e.target.value = "";
			return;
		}

		if (selectedFiles.length > 1) {
			ShowToast("warning", "Only one file allowed", "Using the first valid image.");
		}

		setUploadedFiles([files[0]]);
		e.target.value = "";
	};

	const removeFile = index => {
		setUploadedFiles(prev => prev.filter((_, i) => i !== index));
	};

	const canSend = inputValue.trim().length > 0 && !isProcessing && !isClearingSession;

	const handleSend = async () => {
		if (!canSend) return;

		const queryToSend = inputValue;
		const filesToSend = uploadedFiles;
		let imagePreviewUrl = "";
		if (filesToSend.length > 0) {
			imagePreviewUrl = URL.createObjectURL(filesToSend[0]);
			messagePreviewUrlsRef.current.add(imagePreviewUrl);
		}

		const userMessage = {
			role: "user",
			content: queryToSend,
			imagePreviewUrl,
			timestamp: new Date()
		};

		setMessages(prev => [...prev, userMessage]);
		setInputValue("");
		setUploadedFiles([]);
		setIsProcessing(true);
		setLiveSteps([]);
		setShowAgentStatus(false);

		try {
			const formData = new FormData();
			formData.append("uid", user.uid);
			formData.append("query", queryToSend);
			filesToSend.forEach(file => formData.append("files", file));

			const response = await server.post("/agent/execute", formData, {
				headers: { "Content-Type": "multipart/form-data" }
			});

			if (response.data.response) {
				setMessages(prev => [...prev, { role: "assistant", content: response.data.response, timestamp: new Date() }]);
			}

			setIsProcessing(false);
		} catch (err) {
			setIsProcessing(false);

			const detail = err?.response?.data?.detail || err?.response?.data?.error || "";
			if (detail.startsWith("UERROR: ")) {
				ShowToast("error", detail.substring("UERROR: ".length), "Check console for more details.");
			} else if (detail.startsWith("ERROR: ")) {
				ShowToast("error", detail.substring("ERROR: ".length), "Check console for more details.");
			} else {
				ShowToast("error", "An unexpected error occurred", "Check console for more details.");
			}
			console.error("Failed to send message:", err?.response);
		}
	};

	const handleKeyPress = e => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	const handleSwitchToChatMode = () => {
		if (isProcessing || isClearingSession) return;
		navigate("/lumen/chat");
	};

	const getDownloadFileName = useCallback((label, imageUrl) => {
		const safeBase =
			String(label || "image")
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, "-")
				.replace(/^-+|-+$/g, "") || "image";
		let extension = ".png";

		try {
			const { pathname } = new URL(imageUrl);
			const extMatch = pathname.match(/\.(png|jpe?g|webp|gif|bmp|svg)$/i);
			if (extMatch) extension = extMatch[0].toLowerCase();
		} catch (_) {}

		return `${safeBase}${extension}`;
	}, []);

	const restoreOutputsScrollPosition = useCallback(scrollTop => {
		if (!Number.isFinite(scrollTop)) return;
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				if (outputsScrollRef.current) {
					outputsScrollRef.current.scrollTop = scrollTop;
				}
			});
		});
	}, []);

	const triggerDownload = useCallback((href, fileName) => {
		const link = document.createElement("a");
		link.href = href;
		link.download = fileName;
		link.rel = "noopener noreferrer";
		link.target = "_blank";
		link.click();
	}, []);

	const handleDownloadImage = useCallback(
		async (imageUrl, label = "image") => {
			if (!imageUrl) return;
			const fileName = getDownloadFileName(label, imageUrl);
			const startScrollTop = outputsScrollRef.current?.scrollTop;
			restoreOutputsScrollPosition(startScrollTop);

			try {
				const response = await fetch(imageUrl, { mode: "cors" });
				if (!response.ok) throw new Error(`Image fetch failed: ${response.status}`);
				const blob = await response.blob();
				const blobUrl = window.URL.createObjectURL(blob);
				triggerDownload(blobUrl, fileName);
				setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
			} catch (_) {
				triggerDownload(imageUrl, fileName);
			} finally {
				restoreOutputsScrollPosition(startScrollTop);
			}
		},
		[getDownloadFileName, restoreOutputsScrollPosition, triggerDownload]
	);

	const releaseMessagePreviewUrls = useCallback(() => {
		messagePreviewUrlsRef.current.forEach(previewUrl => URL.revokeObjectURL(previewUrl));
		messagePreviewUrlsRef.current.clear();
	}, []);

	const handleOpenClearDialog = () => {
		if (isProcessing || isClearingSession || !user?.uid) return;
		setIsClearDialogOpen(true);
	};

	const resetLocalSessionState = () => {
		releaseMessagePreviewUrls();
		setMessages([createInitialAgentMessage()]);
		setInputValue("");
		setUploadedFiles([]);
		setOutputs(null);
		setOutputCategoryRecency({});
		setShowOutputs(false);
		setCurrentStep("Thinking...");
		setLiveSteps([]);
		setShowAgentStatus(false);
		if (fileInputRef.current) fileInputRef.current.value = "";
	};

	useEffect(() => {
		const handleGlobalKeyDown = e => {
			const tag = document.activeElement?.tagName?.toLowerCase();
			const isEditable = document.activeElement?.isContentEditable;
			if (tag === "input" || tag === "textarea" || tag === "select" || isEditable) return;

			if (e.ctrlKey || e.metaKey || e.altKey) return;
			if (e.key.length > 1) return;

			if (textareaRef.current && !isProcessing && !isClearingSession) {
				textareaRef.current.focus();
			}
		};

		document.addEventListener("keydown", handleGlobalKeyDown);
		return () => document.removeEventListener("keydown", handleGlobalKeyDown);
	}, [isProcessing, isClearingSession]);

	useEffect(() => {
		return () => {
			releaseMessagePreviewUrls();
		};
	}, [releaseMessagePreviewUrls]);

	const handleClearSession = async () => {
		if (isProcessing || isClearingSession || !user?.uid) return;

		setIsClearingSession(true);
		try {
			const response = await server.post("/agent/clear-session", { uid: user.uid });
			if (!response?.data?.success) {
				ShowToast("error", "Failed to clear session", "Please try again.");
				return;
			}

			resetLocalSessionState();
			setIsClearDialogOpen(false);
			ShowToast("success", "Session cleared", "Your new session is ready.");
		} catch (err) {
			const detail = err?.response?.data?.detail || err?.response?.data?.error || "";
			if (detail.startsWith("UERROR: ")) {
				ShowToast("error", detail.substring("UERROR: ".length), "Check console for more details.");
			} else if (detail.startsWith("ERROR: ")) {
				ShowToast("error", detail.substring("ERROR: ".length), "Check console for more details.");
			} else {
				ShowToast("error", "Failed to clear session", "Check console for more details.");
			}
			console.error("Failed to clear session:", err?.response || err);
		} finally {
			setIsClearingSession(false);
		}
	};

	const formatModelName = modelString => {
		const modelName = modelString.split("/")[1] || modelString;

		if (modelName.includes("llama")) {
			const match = modelName.match(/llama-(\d+\.\d+)-(\d+b)/i);
			if (match) {
				return `Llama ${match[1]} ${match[2].toUpperCase()}`;
			}
		} else if (modelName.includes("gemini")) {
			const match = modelName.match(/gemini-(\d+\.\d+)-(\w+)/i);
			if (match) {
				return `Gemini ${match[1]} ${match[2].charAt(0).toUpperCase() + match[2].slice(1)}`;
			}
		}

		return modelName.charAt(0).toUpperCase() + modelName.slice(1);
	};

	const renderOutputs = useCallback(() => {
		if (!outputs) return null;
		const sortedCategories = [...OUTPUT_CATEGORIES].sort((a, b) => {
			const aRank = Number.isFinite(outputCategoryRecency[a.key]) ? outputCategoryRecency[a.key] : Number.NEGATIVE_INFINITY;
			const bRank = Number.isFinite(outputCategoryRecency[b.key]) ? outputCategoryRecency[b.key] : Number.NEGATIVE_INFINITY;
			if (aRank === bRank) return 0;
			return bRank - aRank;
		});

		return (
			<VStack align="stretch" gap={4} w="100%">
				{sortedCategories.map(category => {
					const items = outputs[category.key];
					if (!items || !Array.isArray(items) || items.length === 0) return null;
					const orderedItems = [...items].reverse();
					const outputCardPadding = 3;
					const categoryImageMaxH = category.key === "Generated Floor Plans" ? "560px" : "300px";
					const isClassifiedStylesCategory = category.key === "Classified Style";

					return (
						<Box key={category.key}>
							<Flex align="center" gap={2} mb={3}>
								<Heading size="sm" color="white">
									{category.label}
								</Heading>
								<Text color="rgba(255, 255, 255, 0.5)" fontSize="xs">
									({items.length})
								</Text>
							</Flex>

							{isClassifiedStylesCategory ? (
								<Box display="grid" gridTemplateColumns="repeat(2, minmax(0, 1fr))" gap={3}>
									{orderedItems.map((item, idx) => {
										const styleLabel = typeof item === "object" && item !== null ? item.style || item.label || item.name || "" : typeof item === "string" ? item : "";
										const styleImageSrc = typeof item === "object" && item !== null ? item.image_url || item.url || "" : "";

										return (
											<Box key={idx} bg="rgba(255, 255, 255, 0.05)" borderRadius="lg" p={2} border="1px solid rgba(255, 255, 255, 0.1)">
												{styleImageSrc && <OutputImageCard src={styleImageSrc} alt={styleLabel || `Style ${idx + 1}`} maxH="180px" onDownload={handleDownloadImage} />}
												{styleLabel && (
													<Text color="rgba(255, 255, 255, 0.9)" fontSize="sm" fontWeight="600" textAlign="center" mt={styleImageSrc ? 2 : 0}>
														{styleLabel}
													</Text>
												)}
											</Box>
										);
									})}
								</Box>
							) : (
								<VStack align="stretch" gap={3}>
									{orderedItems.map((item, idx) => (
										<Box key={idx} bg="rgba(255, 255, 255, 0.05)" borderRadius="lg" p={outputCardPadding} border="1px solid rgba(255, 255, 255, 0.1)">
											{typeof item === "string" && item.startsWith("http") ? (
												<OutputImageCard src={item} alt={`${category.label} ${idx + 1}`} maxH={categoryImageMaxH} onDownload={handleDownloadImage} />
											) : typeof item === "string" ? (
												<Text color="rgba(255, 255, 255, 0.8)" fontSize="sm">
													{item}
												</Text>
											) : typeof item === "object" && item !== null ? (
												<VStack align="stretch" gap={2}>
													{item.query && (
														<>
															<Text color="rgba(255, 255, 255, 0.6)" fontSize="xs" fontWeight="600" textAlign="left">
																Query: {item.query}
															</Text>
															{typeof item.result === "string" ? (
																<Box textAlign="left">{renderMessageContent(item.result)}</Box>
															) : (
																<Text color="rgba(255, 255, 255, 0.85)" fontSize="sm" textAlign="left" lineHeight="1.7">
																	{String(item.result ?? "")}
																</Text>
															)}
														</>
													)}

													{item.style && (
														<>
															{item.image_url && <OutputImageCard src={item.image_url} alt="Style classification" maxH="200px" onDownload={handleDownloadImage} />}
															<Text color="rgba(255, 255, 255, 0.8)" fontSize="sm" fontWeight="600">
																{item.style}
															</Text>
														</>
													)}

													{item.furniture && Array.isArray(item.furniture) && (
														<>
															{item.image_url && <OutputImageCard src={item.image_url} alt="Furniture detection" maxH="200px" onDownload={handleDownloadImage} />}
															<VStack align="stretch" gap={2}>
																{item.furniture.map((furn, i) => (
																	<Flex key={i} gap={3} align="center" justify="space-between" w="100%">
																		<Flex align="center" gap={3} minW={0}>
																			{furn.url && (
																				<Flex justify="center" flexShrink={0}>
																					<Box w="44px" h="44px">
																						<Image
																							src={furn.url}
																							alt={furn.name}
																							w="44px"
																							h="44px"
																							objectFit="cover"
																							borderRadius="md"
																							crossOrigin="anonymous"
																							fallback={<Box w="44px" h="44px" bg="rgba(255,255,255,0.1)" borderRadius="md" />}
																						/>
																					</Box>
																				</Flex>
																			)}
																			<Text color="rgba(255, 255, 255, 0.9)" fontSize="sm" flexShrink={1} minW={0} textAlign="left">
																				{titleCase(furn.name)}
																			</Text>
																		</Flex>
																		{furn.url && <ThumbnailDownloadButton onDownload={() => handleDownloadImage(furn.url, furn.name || "furniture")} label={furn.name || "furniture image"} isFurniture />}
																	</Flex>
																))}
															</VStack>
														</>
													)}

													{item.colors && Array.isArray(item.colors) && (
														<>
															{item.image_url && <OutputImageCard src={item.image_url} alt="Color palette source" maxH="200px" onDownload={handleDownloadImage} />}
															<Flex gap={2} flexWrap="wrap" justify="center" w="100%">
																{item.colors.map((color, i) => (
																	<Box key={i} textAlign="center">
																		<Box w="40px" h="40px" bg={color.hex || color} borderRadius="md" border="1px solid rgba(255, 255, 255, 0.2)" mb={1} />
																		<Text color="rgba(255, 255, 255, 0.6)" fontSize="xs">
																			{color.hex || color}
																		</Text>
																	</Box>
																))}
															</Flex>
														</>
													)}

													{item.url && !item.furniture && !item.colors && !item.style && !item.query && (
														<OutputImageCard src={item.url} alt={`${category.label} ${idx + 1}`} maxH={categoryImageMaxH} onDownload={handleDownloadImage} />
													)}
												</VStack>
											) : null}
										</Box>
									))}
								</VStack>
							)}
						</Box>
					);
				})}
			</VStack>
		);
	}, [outputs, outputCategoryRecency, handleDownloadImage]);

	const renderedOutputs = useMemo(() => renderOutputs(), [renderOutputs]);

	const backgroundEl = (
		<Box
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				backgroundImage: `url(${LandingBackground})`,
				backgroundSize: "cover",
				backgroundPosition: "center",
				backgroundRepeat: "no-repeat",
				zIndex: -1
			}}
		/>
	);

	if (!historyLoaded) return <>{backgroundEl}</>;

	return (
		<>
			{backgroundEl}

			<Flex h="82vh" direction="column" w="100%" py={{ base: 4, md: 6 }} mt={-6}>
				<Box mb={4} w="100%" ml={3}>
					<Flex align="center" justify="space-between" mx="auto" w="100%">
						<Flex align="center" gap={3}>
							<Box bg="linear-gradient(135deg, rgba(212, 175, 55, 0.3), rgba(255, 215, 0, 0.3))" p={3} borderRadius="xl" border="1px solid rgba(255, 255, 255, 0.15)" boxShadow="0 8px 24px rgba(31, 38, 135, 0.15)">
								<Sparkles size={24} color="#FFD700" />
							</Box>
							<VStack align="start" gap={0}>
								<Heading size={{ base: "lg", md: "xl" }} color="white" fontWeight="700" letterSpacing="-0.02em">
									Le'Orchestra
								</Heading>
								<Text fontSize={{ base: "xs", md: "sm" }} color="rgba(255, 255, 255, 0.6)">
									Autonomous Agentic AI Design Assistant
									{currentAgentModel && (
										<>
											{" • "}
											Powered by {formatModelName(currentAgentModel)}
										</>
									)}
								</Text>
							</VStack>
						</Flex>

						<HStack gap={2} mr={5}>
							<Box
								as="button"
								onClick={handleOpenClearDialog}
								disabled={isProcessing || isClearingSession}
								position="relative"
								bg="rgba(255, 255, 255, 0.22)"
								border="1px solid rgba(255, 255, 255, 0.45)"
								borderRadius="full"
								px={{ base: 3, md: 4 }}
								py={{ base: 2, md: 2.5 }}
								color="white"
								fontSize={{ base: "xs", md: "sm" }}
								fontWeight="600"
								cursor={isProcessing || isClearingSession ? "not-allowed" : "pointer"}
								opacity={isProcessing || isClearingSession ? 0.5 : 1}
								transition="all 0.25s ease, box-shadow 0.25s ease"
								whiteSpace="nowrap"
								overflow="hidden"
								boxShadow="0 4px 14px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
								_hover={
									isProcessing || isClearingSession
										? {}
										: {
												bg: "rgba(255, 255, 255, 0.3)",
												border: "1px solid rgba(255, 255, 255, 0.65)",
												transform: "translateY(-2px)"
											}
								}
								_active={isProcessing || isClearingSession ? {} : { transform: "translateY(0)" }}
							>
								<Text as="span">{isClearingSession ? "Clearing..." : "Clear Session"}</Text>
							</Box>

							<Box
								as="button"
								onClick={handleSwitchToChatMode}
								position="relative"
								disabled={isProcessing || isClearingSession}
								bg="linear-gradient(135deg, rgba(212, 175, 55, 0.52), rgba(255, 215, 0, 0.52))"
								border="1px solid rgba(212, 175, 55, 0.78)"
								borderRadius="full"
								px={{ base: 3, md: 5 }}
								py={{ base: 2, md: 2.5 }}
								color="white"
								fontSize={{ base: "xs", md: "sm" }}
								fontWeight="600"
								cursor={isProcessing || isClearingSession ? "not-allowed" : "pointer"}
								opacity={isProcessing || isClearingSession ? 0.5 : 1}
								transition="all 0.4s ease, box-shadow 0.4s ease"
								whiteSpace="nowrap"
								overflow="hidden"
								boxShadow="0 4px 15px rgba(212, 175, 55, 0.34), inset 0 1px 0 rgba(255, 255, 255, 0.3)"
								_hover={
									isProcessing || isClearingSession
										? {}
										: {
												bg: "linear-gradient(135deg, rgba(212, 175, 55, 0.68), rgba(255, 215, 0, 0.68))",
												border: "1px solid rgba(255, 215, 0, 0.95)",
												transform: "translateY(-2px) scale(1.02)",
												boxShadow: "0 8px 25px rgba(212, 175, 55, 0.4), 0 0 20px rgba(255, 215, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)"
											}
								}
								_active={
									isProcessing || isClearingSession
										? {}
										: {
												transform: "translateY(0) scale(0.98)",
												boxShadow: "0 2px 10px rgba(212, 175, 55, 0.3), inset 0 2px 4px rgba(0, 0, 0, 0.1)"
											}
								}
							>
								<Flex align="center" gap={2}>
									<Sparkles size={16} style={{ animation: "pulse 2s ease-in-out infinite" }} />
									<Text as="span">Switch to Chat Mode</Text>
								</Flex>
							</Box>
						</HStack>
					</Flex>
				</Box>

				<Flex gap={4} flex="1" overflow="hidden" w="100%">
					{/* Chat Area */}
					<Box flex="1" borderRadius={{ base: 20, md: 28 }} {...glassPanelStyle} overflow="hidden" display="flex" flexDirection="column" transition="box-shadow 0.3s ease, border-color 0.3s ease">
						<Box
							flex="1"
							overflowY="auto"
							p={{ base: 4, md: 6, lg: 8 }}
							position="relative"
							zIndex={1}
							css={{
								"&::-webkit-scrollbar": { width: "6px" },
								"&::-webkit-scrollbar-track": { background: "transparent" },
								"&::-webkit-scrollbar-thumb": {
									background: "rgba(255, 255, 255, 0.2)",
									borderRadius: "10px"
								},
								"&::-webkit-scrollbar-thumb:hover": { background: "rgba(255, 255, 255, 0.3)" }
							}}
						>
							<VStack gap={6} align="stretch" w="100%">
								{messages.map((message, idx) => (
									<Box key={idx} animation="fadeInUp 0.4s ease-out" w="100%">
										{message.role === "user" ? (
											<Flex justify="flex-end" w="100%">
												<Flex align="stretch" gap={2} w="100%" justify="flex-end" maxW={{ base: "85%", md: "75%", lg: "65%", xl: "55%" }}>
													{message.imagePreviewUrl && (
														<Box
															flexShrink={0}
															alignSelf="stretch"
															style={{ aspectRatio: "1 / 1" }}
															borderRadius="lg"
															overflow="hidden"
															border="1px solid rgba(255, 255, 255, 0.22)"
															bg="rgba(255, 255, 255, 0.08)"
															minW={{ base: "48px", md: "56px" }}
															maxW={{ base: "78px", md: "90px" }}
														>
															<Image src={message.imagePreviewUrl} alt="Uploaded image preview" w="100%" h="100%" objectFit="cover" />
														</Box>
													)}
													<Box
														flex={message.imagePreviewUrl ? 1 : undefined}
														minW={message.imagePreviewUrl ? 0 : undefined}
														maxW="100%"
														bg="linear-gradient(135deg, rgba(212, 175, 55, 0.25), rgba(255, 215, 0, 0.25))"
														border="1px solid rgba(212, 175, 55, 0.4)"
														borderRadius="2xl"
														p={{ base: 4, md: 5 }}
														boxShadow="0 4px 20px rgba(212, 175, 55, 0.15)"
													>
														<Box fontSize={{ base: "sm", md: "md" }} lineHeight="1.7">
															{renderMessageContent(message.content)}
														</Box>
													</Box>
												</Flex>
											</Flex>
										) : (
											<VStack align="stretch" gap={3} w="100%">
												<Flex align="start" gap={3} w="100%">
													<Box bg="rgba(255, 215, 0, 0.15)" p={2} borderRadius="lg" flexShrink={0} mt={1}>
														<Sparkles size={20} color="#FFD700" />
													</Box>
													<Box flex="1" maxW="100%">
														<Box bg="rgba(255, 255, 255, 0.08)" border="1px solid rgba(255, 255, 255, 0.12)" borderRadius="2xl" p={{ base: 4, md: 5 }} textAlign="left">
															<Box fontSize={{ base: "sm", md: "md" }} lineHeight="1.8" textAlign="left">
																{renderMessageContent(message.content)}
															</Box>
														</Box>
													</Box>
												</Flex>
											</VStack>
										)}
									</Box>
								))}

								{showAgentStatus && (
									<Box animation="fadeInUp 0.4s ease-out" w="100%">
										<Flex align="start" gap={3} w="100%">
											<Box bg="rgba(255, 215, 0, 0.15)" p={2} borderRadius="lg" flexShrink={0} mt={1}>
												<Sparkles size={20} color="#FFD700" />
											</Box>
											<Box flex="1" maxW="100%">
												<Box bg="rgba(255, 255, 255, 0.08)" border="1px solid rgba(255, 255, 255, 0.12)" borderRadius="2xl" p={{ base: 4, md: 5 }}>
													<Flex align="center" justify="flex-start" mb={liveSteps.length > 0 ? 4 : 2}>
														<Flex align="center" gap={2}>
															<Text color="rgba(255, 255, 255, 0.7)" fontSize="sm" fontWeight="600" letterSpacing="0.02em">
																AGENT ORCHESTRATION
															</Text>
															{isProcessing && currentStep !== "Done!" && (
																<Flex align="center" gap={2}>
																	<Box w="6px" h="6px" borderRadius="full" bg="#FFD700" animation="pulse 2s ease-in-out infinite" />
																	<Text color="#FFD700" fontSize="xs" fontWeight="600">
																		PROCESSING
																	</Text>
																</Flex>
															)}
														</Flex>
													</Flex>

													{liveSteps.length > 0 && (
														<VStack gap={3} align="stretch">
															{liveSteps.map((step, i) => {
																const isLastStep = i === liveSteps.length - 1;
																const isActive = isLastStep && isProcessing && currentStep !== "Done!";

																return (
																	<Flex
																		key={i}
																		align="center"
																		gap={3}
																		style={{
																			animation: `stepFadeIn 0.35s ease-out ${i * 0.06}s both`
																		}}
																	>
																		<Box
																			w="20px"
																			h="20px"
																			borderRadius="full"
																			border={isActive ? "2px solid #FFD700" : "2px solid #00FF9D"}
																			bg={isActive ? "rgba(255, 215, 0, 0.2)" : "rgba(0, 255, 157, 0.2)"}
																			display="flex"
																			alignItems="center"
																			justifyContent="center"
																			flexShrink={0}
																			transition="all 0.3s ease"
																		>
																			{isActive ? (
																				<Flex w="100%" h="100%" align="center" justify="center" lineHeight="1">
																					<Loader2
																						size={10}
																						color="#FFD700"
																						style={{
																							animation: "spin 1s linear infinite",
																							display: "block",
																							transformOrigin: "center center"
																						}}
																					/>
																				</Flex>
																			) : (
																				<Flex w="100%" h="100%" align="center" justify="center" lineHeight="1">
																					<Box w="8px" h="8px" borderRadius="full" bg="#00FF9D" display="block" />
																				</Flex>
																			)}
																		</Box>
																		<Text color={isActive ? "#FFD700" : "rgba(255, 255, 255, 0.9)"} fontSize="sm" fontWeight={isActive ? "600" : "400"} transition="color 0.3s ease">
																			{step.step}
																		</Text>
																	</Flex>
																);
															})}
														</VStack>
													)}

													{isProcessing && liveSteps.length === 0 && (
														<Flex align="center" gap={3}>
															<Loader2 size={16} color="#FFD700" style={{ animation: "spin 1s linear infinite" }} />
															<Text color="rgba(255, 255, 255, 0.7)" fontSize="sm">
																Initializing...
															</Text>
														</Flex>
													)}
												</Box>
											</Box>
										</Flex>
									</Box>
								)}

								<div ref={messagesEndRef} />
							</VStack>
						</Box>

						<Box borderTop="1px solid rgba(255, 255, 255, 0.1)" p={{ base: 4, md: 5, lg: 6 }} bg="rgba(0, 0, 0, 0.2)" w="100%" position="relative" zIndex={1}>
							{uploadedFiles.length > 0 && (
								<Box mb={3}>
									<Flex gap={2} flexWrap="wrap">
										{uploadedFiles.map((file, idx) => (
											<Flex key={idx} align="center" gap={2} bg="rgba(255, 255, 255, 0.08)" border="1px solid rgba(255, 255, 255, 0.15)" borderRadius="lg" p={2} pr={3}>
												<Box bg="rgba(255, 215, 0, 0.2)" p={2} borderRadius="md">
													<Paperclip size={14} color="#FFD700" />
												</Box>
												<Text color="rgba(255, 255, 255, 0.8)" fontSize="xs" maxW="150px" isTruncated>
													{file.name}
												</Text>
												<IconButton size="xs" variant="ghost" colorPalette="whiteAlpha" onClick={() => removeFile(idx)} aria-label="Remove file" borderRadius={10} _hover={{ background: "rgba(255,255,255,0.1)" }}>
													<X size={14} color="white" />
												</IconButton>
											</Flex>
										))}
									</Flex>
								</Box>
							)}

							<Box w="100%">
								<Flex gap={3} align="stretch" w="100%">
									<Box
										flex="1"
										bg="rgba(255, 255, 255, 0.08)"
										border="1px solid rgba(255, 255, 255, 0.15)"
										borderRadius="2xl"
										p={1}
										transition="all 0.3s ease"
										display="flex"
										alignItems="center"
										_focusWithin={{
											border: "1px solid rgba(255, 215, 0, 0.4)",
											boxShadow: "0 0 0 3px rgba(255, 215, 0, 0.1)"
										}}
									>
										<input ref={fileInputRef} type="file" onChange={handleFileSelect} style={{ display: "none" }} accept="image/png, image/jpeg, .png, .jpg, .jpeg" />

										<IconButton
											size="sm"
											colorPalette="whiteAlpha"
											variant="ghost"
											onClick={() => fileInputRef.current?.click()}
											disabled={isProcessing}
											aria-label="Attach file"
											ml={1}
											borderRadius={11}
											color="white"
											_hover={{ backgroundColor: "rgba(255,255,255,0.1)" }}
										>
											<Paperclip size={20} color="white" />
										</IconButton>

										<Textarea
											ref={textareaRef}
											value={inputValue}
											onChange={e => setInputValue(e.target.value)}
											onKeyDown={handleKeyPress}
											placeholder="Ask me to help with something..."
											bg="transparent"
											border="none"
											color="white"
											fontSize={{ base: "sm", md: "md" }}
											resize="none"
											minH="16px"
											maxH="200px"
											rows={1}
											py={2}
											px={3}
											lineHeight="1.5"
											disabled={isProcessing}
											_placeholder={{ color: "rgba(255, 255, 255, 0.4)" }}
											_focus={{ outline: "none", boxShadow: "none" }}
											_disabled={{ opacity: 0.5, cursor: "not-allowed" }}
										/>
									</Box>

									<Box
										as="button"
										onClick={handleSend}
										bg={canSend ? "linear-gradient(135deg, #D4AF37, #FFD700)" : "rgba(255, 255, 255, 0.1)"}
										px={4}
										borderRadius="xl"
										cursor={canSend ? "pointer" : "not-allowed"}
										opacity={canSend ? 1 : 0.4}
										transition="all 0.3s ease"
										disabled={!canSend}
										boxShadow={canSend ? "0 4px 20px rgba(212, 175, 55, 0.3)" : "none"}
										display="flex"
										alignItems="center"
										justifyContent="center"
										_hover={
											canSend
												? {
														transform: "translateY(-2px)",
														boxShadow: "0 6px 25px rgba(212, 175, 55, 0.4)"
													}
												: {}
										}
										_active={canSend ? { transform: "translateY(0)" } : {}}
									>
										{isProcessing ? <Loader2 size={20} color="white" style={{ animation: "spin 1s linear infinite" }} /> : <Send size={20} color="white" />}
									</Box>
								</Flex>
							</Box>
						</Box>
					</Box>

					{showOutputs && (
						<Box w="400px" borderRadius={{ base: 20, md: 28 }} {...glassPanelStyle} overflow="hidden" display="flex" flexDirection="column" animation="fadeIn 0.24s ease-out" flexShrink={0}>
							<Flex align="center" p={4} borderBottom="1px solid rgba(255, 255, 255, 0.1)" bg="rgba(0, 0, 0, 0.2)" position="relative" zIndex={1}>
								<Heading size="sm" color="white">
									Agent Ensemble
								</Heading>
							</Flex>

							<Box
								ref={outputsScrollRef}
								flex="1"
								overflowY="auto"
								p={4}
								position="relative"
								zIndex={1}
								css={{
									"&::-webkit-scrollbar": { width: "6px" },
									"&::-webkit-scrollbar-track": { background: "transparent" },
									"&::-webkit-scrollbar-thumb": {
										background: "rgba(255, 255, 255, 0.2)",
										borderRadius: "10px"
									},
									"&::-webkit-scrollbar-thumb:hover": {
										background: "rgba(255, 255, 255, 0.3)"
									}
								}}
							>
								{renderedOutputs}
							</Box>
						</Box>
					)}
				</Flex>
			</Flex>

			<Dialog.Root
				placement="center"
				motionPreset="scale"
				open={isClearDialogOpen}
				onOpenChange={e => {
					if (isClearingSession) return;
					setIsClearDialogOpen(e.open);
				}}
			>
				<Portal>
					<Dialog.Backdrop bg="blackAlpha.700" backdropFilter="blur(3px)" />
					<Dialog.Positioner>
						<Dialog.Content borderRadius="2xl" bg="rgba(18, 18, 18, 0.92)" backdropFilter="blur(10px)" border="1px solid rgba(255, 255, 255, 0.18)" p={5} maxW="420px" boxShadow="0 20px 50px rgba(0,0,0,0.45)">
							<Dialog.CloseTrigger asChild>
								<CloseButton size="sm" position="absolute" top="12px" right="12px" color="white" disabled={isClearingSession} _hover={{ background: "transparent" }} />
							</Dialog.CloseTrigger>

							<VStack align="stretch" gap={4}>
								<Box>
									<Heading size="md" color="white" mb={2}>
										Clear Agent Session?
									</Heading>
									<Text color="rgba(255,255,255,0.75)" fontSize="sm" lineHeight="1.6">
										This will remove your current chat history, uploaded files, and output panel for this session.
									</Text>
								</Box>

								<HStack justify="flex-end" gap={2}>
									<Box
										as="button"
										onClick={() => setIsClearDialogOpen(false)}
										disabled={isClearingSession}
										px={4}
										py={2}
										borderRadius="lg"
										border="1px solid rgba(255,255,255,0.25)"
										bg="rgba(255,255,255,0.08)"
										color="white"
										fontSize="sm"
										fontWeight="600"
										cursor={isClearingSession ? "not-allowed" : "pointer"}
										opacity={isClearingSession ? 0.5 : 1}
										_hover={isClearingSession ? {} : { bg: "rgba(255,255,255,0.14)" }}
									>
										Cancel
									</Box>

									<Box
										as="button"
										onClick={handleClearSession}
										disabled={isClearingSession}
										px={4}
										py={2}
										borderRadius="lg"
										border="1px solid rgba(255, 140, 140, 0.55)"
										bg="rgba(255, 90, 90, 0.2)"
										color="white"
										fontSize="sm"
										fontWeight="700"
										cursor={isClearingSession ? "not-allowed" : "pointer"}
										opacity={isClearingSession ? 0.65 : 1}
										_hover={
											isClearingSession
												? {}
												: {
														bg: "rgba(255, 90, 90, 0.3)"
													}
										}
									>
										{isClearingSession ? "Clearing..." : "Clear Session"}
									</Box>
								</HStack>
							</VStack>
						</Dialog.Content>
					</Dialog.Positioner>
				</Portal>
			</Dialog.Root>

			<style>
				{`
          @keyframes fadeInUp {
            from { opacity: 0; }
            to   { opacity: 1; }
          }

          @keyframes stepFadeIn {
            from { opacity: 0; }
            to   { opacity: 1; }
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to   { opacity: 1; }
          }

          @keyframes spin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }

          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50%       { opacity: 0.5; }
          }
        `}
			</style>
		</>
	);
}

export default AgentPage;
