import { useState, useEffect } from "react";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { Icon } from "@/components/icon";
import { toast } from "sonner";
import Editor from "@/components/editor";

export default function TermsAndConditions() {
	const [content, setContent] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingContent, setIsLoadingContent] = useState(true);

	// Load existing content on component mount
	useEffect(() => {
		const loadContent = async () => {
			setIsLoadingContent(true);
			try {
				// Fetch terms and conditions from MSW API
				const response = await fetch("/api/legal/terms");
				const result = await response.json();
				
				if (result.success && result.data) {
					setContent(result.data.content);
				} else {
					throw new Error(result.message || "Failed to load content");
				}
			} catch (error) {
				console.error("Error loading content:", error);
				toast.error("Failed to load content");
				
				// Fallback to default content if API fails
				const defaultContent = `
					<h1>Terms and Conditions</h1>
					<p>Welcome to KampanYES. By using our platform, you agree to these terms and conditions.</p>
					
					<h2>1. Acceptance of Terms</h2>
					<p>By accessing and using this application, you accept and agree to be bound by the terms and provision of this agreement.</p>
				`;
				setContent(defaultContent);
			} finally {
				setIsLoadingContent(false);
			}
		};

		loadContent();
	}, []);

	const handleSave = async () => {
		setIsLoading(true);
		const loadingToast = toast.loading("Saving terms and conditions...", {
			description: "Please wait while we update the content.",
		});

		try {
			// Send the HTML content to MSW API
			const response = await fetch("/api/legal/terms", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ content }),
			});

			const result = await response.json();

			if (result.success) {
				toast.success("Terms and conditions saved successfully!", {
					description: "The content has been updated and is now live.",
					id: loadingToast,
				});
			} else {
				throw new Error(result.message || "Failed to save content");
			}
		} catch (error) {
			console.error("Error saving content:", error);
			toast.error("Failed to save content", {
				description: "Please try again or contact support if the problem persists.",
				id: loadingToast,
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleReset = async () => {
		try {
			// Fetch the original content from MSW API
			const response = await fetch("/api/legal/terms");
			const result = await response.json();
			
			if (result.success && result.data) {
				setContent(result.data.content);
				toast.info("Content reset to saved version");
			} else {
				// Fallback to default content if API fails
				const defaultContent = `
					<h1>Terms and Conditions</h1>
					<p>Welcome to KampanYES. By using our platform, you agree to these terms and conditions.</p>
					
					<h2>1. Acceptance of Terms</h2>
					<p>By accessing and using this application, you accept and agree to be bound by the terms and provision of this agreement.</p>
				`;
				setContent(defaultContent);
				toast.info("Content reset to default template");
			}
		} catch (error) {
			console.error("Error resetting content:", error);
			toast.error("Failed to reset content");
		}
	};

	if (isLoadingContent) {
		return (
			<div className="p-6 space-y-6">
				<div className="flex items-center justify-center min-h-[400px]">
					<div className="flex flex-col items-center gap-4">
						<Icon icon="svg-spinners:6-dots-scale-middle" size={32} className="text-primary" />
						<p className="text-text-secondary">Loading content...</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6">
			{/* Page Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-text-primary">Terms and Conditions</h1>
					<p className="text-text-secondary mt-1">Manage your application's terms and conditions</p>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline" onClick={handleReset} disabled={isLoading}>
						<Icon icon="solar:refresh-bold" size={16} className="mr-2" />
						Reset
					</Button>
					<Button onClick={handleSave} disabled={isLoading}>
						{isLoading && <Icon icon="solar:refresh-bold" className="mr-2 h-4 w-4 animate-spin" />}
						<Icon icon="solar:diskette-bold" size={16} className="mr-2" />
						Save Changes
					</Button>
				</div>
			</div>

			{/* Editor Card */}
			<Card>
				<CardContent className="pt-6">
					<div className="space-y-4">
						<Editor
							id="terms-editor"
							value={content}
							onChange={setContent}
							style={{ minHeight: "600px" }}
						/>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
