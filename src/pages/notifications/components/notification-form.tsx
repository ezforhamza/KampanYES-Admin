import { useState, useEffect } from "react";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Label } from "@/ui/label";
import { Switch } from "@/ui/switch";
import { Icon } from "@/components/icon";
import { toast } from "sonner";
import type { Notification } from "@/types/notification";
import {
	NotificationType,
	NotificationTargetType,
	NOTIFICATION_TARGET_TYPE_LABELS,
} from "@/types/notification";
import { MOCK_STORES } from "@/_mock/store-data";
import { MOCK_USERS } from "@/_mock/user-data";

interface NotificationFormProps {
	notification?: Notification; // For editing
	onSubmit: (data: any) => Promise<void>;
	onCancel: () => void;
	isLoading?: boolean;
	mode: "create" | "edit";
}

export function NotificationForm({ notification, onSubmit, onCancel, isLoading, mode }: NotificationFormProps) {
	const [formData, setFormData] = useState({
		type: NotificationType.ADMIN_MESSAGE, // Always admin message for manual creation
		title: notification?.title || "",
		message: notification?.message || "",
		targetType: notification?.target.type || NotificationTargetType.ALL_USERS,
		targetUserIds: notification?.target.userIds || [],
		targetStoreId: notification?.target.storeId || "",
		scheduleEnabled: !!notification?.scheduledFor,
		scheduledDate: notification?.scheduledFor ? new Date(notification.scheduledFor).toISOString().slice(0, 16) : "",
		searchTerm: "", // For user search
	});

	const [errors, setErrors] = useState<Record<string, string>>({});
	const [selectedUsers, setSelectedUsers] = useState<string[]>(formData.targetUserIds);

	// Update form when notification prop changes (for edit mode)
	useEffect(() => {
		if (notification) {
			setFormData({
				type: NotificationType.ADMIN_MESSAGE, // Always admin message for manual creation
				title: notification.title,
				message: notification.message,
				targetType: notification.target.type,
				targetUserIds: notification.target.userIds || [],
				targetStoreId: notification.target.storeId || "",
				scheduleEnabled: !!notification.scheduledFor,
				scheduledDate: notification.scheduledFor ? new Date(notification.scheduledFor).toISOString().slice(0, 16) : "",
				searchTerm: "",
			});
			setSelectedUsers(notification.target.userIds || []);
		}
	}, [notification]);

	const updateField = (field: string, value: any) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		// Clear error when user starts typing
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: "" }));
		}
	};

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.title.trim()) {
			newErrors.title = "Title is required";
		}

		if (!formData.message.trim()) {
			newErrors.message = "Message is required";
		}

		if (formData.targetType === NotificationTargetType.CUSTOM_USERS && selectedUsers.length === 0) {
			newErrors.targetUsers = "Please select at least one user";
		}

		if (formData.targetType === NotificationTargetType.STORE_FOLLOWERS && !formData.targetStoreId) {
			newErrors.targetStore = "Please select a store";
		}

		if (formData.scheduleEnabled && !formData.scheduledDate) {
			newErrors.scheduledDate = "Please select a date and time";
		}

		if (formData.scheduleEnabled && formData.scheduledDate) {
			const scheduledDate = new Date(formData.scheduledDate);
			const now = new Date();
			if (scheduledDate <= now) {
				newErrors.scheduledDate = "Scheduled date must be in the future";
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			toast.error("Please fix the errors in the form");
			return;
		}

		try {
			const target = {
				type: formData.targetType,
				...(formData.targetType === NotificationTargetType.CUSTOM_USERS && {
					userIds: selectedUsers,
				}),
				...(formData.targetType === NotificationTargetType.STORE_FOLLOWERS && {
					storeId: formData.targetStoreId,
				}),
			};

			const submitData = {
				type: formData.type,
				title: formData.title.trim(),
				message: formData.message.trim(),
				target,
				...(formData.scheduleEnabled &&
					formData.scheduledDate && {
						scheduledFor: new Date(formData.scheduledDate),
					}),
			};

			await onSubmit(submitData);
		} catch (error) {
			console.error("Error submitting form:", error);
			toast.error("Failed to save notification");
		}
	};

	const handleUserSelection = (userId: string, selected: boolean) => {
		if (selected) {
			setSelectedUsers((prev) => [...prev, userId]);
		} else {
			setSelectedUsers((prev) => prev.filter((id) => id !== userId));
		}
	};

	// Filter users based on search term
	const filteredUsers = MOCK_USERS.filter(
		(user) =>
			user.firstName.toLowerCase().includes(formData.searchTerm.toLowerCase()) ||
			user.lastName.toLowerCase().includes(formData.searchTerm.toLowerCase()) ||
			`${user.firstName} ${user.lastName}`.toLowerCase().includes(formData.searchTerm.toLowerCase()) ||
			user.email.toLowerCase().includes(formData.searchTerm.toLowerCase()),
	);

	return (
		<div className="w-full max-w-none">
			<Card className="border-border bg-card">
				<CardHeader>
					<CardTitle className="text-foreground">
						{mode === "create" ? "Create Notification" : "Edit Notification"}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Title */}
						<div className="space-y-2">
							<Label htmlFor="title" className="text-foreground">
								Title *
							</Label>
							<Input
								id="title"
								value={formData.title}
								onChange={(e) => updateField("title", e.target.value)}
								placeholder="Enter notification title..."
								className={errors.title ? "border-destructive" : ""}
							/>
							{errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
						</div>

						{/* Message */}
						<div className="space-y-2">
							<Label htmlFor="message" className="text-foreground">
								Message *
							</Label>
							<Textarea
								id="message"
								value={formData.message}
								onChange={(e) => updateField("message", e.target.value)}
								placeholder="Enter notification message..."
								rows={4}
								className={errors.message ? "border-destructive" : ""}
							/>
							{errors.message && <p className="text-sm text-destructive">{errors.message}</p>}
						</div>

						{/* Target Audience */}
						<div className="space-y-4">
							<Label className="text-foreground">Target Audience</Label>

							{/* Target Type Selection */}
							<Select
								value={formData.targetType}
								onValueChange={(value) => {
									updateField("targetType", value);
									setSelectedUsers([]);
									updateField("targetStoreId", "");
									updateField("searchTerm", ""); // Clear search when changing target type
								}}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{Object.values(NotificationTargetType).map((targetType) => (
										<SelectItem key={targetType} value={targetType}>
											{NOTIFICATION_TARGET_TYPE_LABELS[targetType]}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							{/* Custom Users Selection */}
							{formData.targetType === NotificationTargetType.CUSTOM_USERS && (
								<div className="space-y-3">
									<Label>Select Users</Label>

									{/* Search Users */}
									<div className="relative">
										<Icon
											icon="solar:magnifer-outline"
											className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
										/>
										<Input
											placeholder="Search users by name or email..."
											value={formData.searchTerm}
											onChange={(e) => updateField("searchTerm", e.target.value)}
											className="pl-9"
										/>
									</div>

									{/* Selected Users Count */}
									{selectedUsers.length > 0 && (
										<div className="flex items-center justify-between text-sm">
											<span className="text-muted-foreground">{selectedUsers.length} user(s) selected</span>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() => setSelectedUsers([])}
												className="text-xs h-auto p-1"
											>
												Clear all
											</Button>
										</div>
									)}

									{/* Users List */}
									<div className="border border-border rounded-md bg-card">
										<div className="max-h-64 overflow-y-auto">
											{filteredUsers.length === 0 ? (
												<div className="p-4 text-center text-muted-foreground">
													{formData.searchTerm ? "No users found matching your search" : "No users available"}
												</div>
											) : (
												<div className="p-2 space-y-1">
													{filteredUsers.slice(0, 50).map((user) => (
														<div key={user.id} className="flex items-center space-x-3 p-2 hover:bg-muted rounded-sm">
															<input
																type="checkbox"
																id={`user-${user.id}`}
																checked={selectedUsers.includes(user.id)}
																onChange={(e) => handleUserSelection(user.id, e.target.checked)}
																className="rounded border-border"
															/>
															<div className="flex-1 min-w-0">
																<Label htmlFor={`user-${user.id}`} className="text-sm font-normal cursor-pointer">
																	<div className="font-medium text-foreground">{user.firstName} {user.lastName}</div>
																	<div className="text-xs text-muted-foreground truncate">{user.email}</div>
																</Label>
															</div>
														</div>
													))}
													{filteredUsers.length > 50 && (
														<div className="p-2 text-center text-xs text-muted-foreground border-t border-border">
															Showing first 50 results. Use search to find specific users.
														</div>
													)}
												</div>
											)}
										</div>
									</div>

									{errors.targetUsers && <p className="text-sm text-destructive">{errors.targetUsers}</p>}
								</div>
							)}

							{/* Store Selection */}
							{formData.targetType === NotificationTargetType.STORE_FOLLOWERS && (
								<div className="space-y-2">
									<Label>Select Store</Label>
									<Select value={formData.targetStoreId} onValueChange={(value) => updateField("targetStoreId", value)}>
										<SelectTrigger className={errors.targetStore ? "border-destructive" : ""}>
											<SelectValue placeholder="Choose a store..." />
										</SelectTrigger>
										<SelectContent>
											{MOCK_STORES.map((store) => (
												<SelectItem key={store.id} value={store.id}>
													{store.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{errors.targetStore && <p className="text-sm text-destructive">{errors.targetStore}</p>}
								</div>
							)}
						</div>

						{/* Scheduling */}
						<div className="space-y-4">
							<div className="flex items-center space-x-2">
								<Switch
									id="schedule"
									checked={formData.scheduleEnabled}
									onCheckedChange={(checked) => {
										updateField("scheduleEnabled", checked);
										if (!checked) {
											updateField("scheduledDate", "");
										}
									}}
								/>
								<Label htmlFor="schedule" className="text-foreground">
									Schedule for later
								</Label>
							</div>

							{formData.scheduleEnabled && (
								<div className="space-y-2">
									<Label htmlFor="scheduledDate" className="text-foreground">
										Scheduled Date & Time
									</Label>
									<Input
										id="scheduledDate"
										type="datetime-local"
										value={formData.scheduledDate}
										onChange={(e) => updateField("scheduledDate", e.target.value)}
										className={`${errors.scheduledDate ? "border-destructive" : ""} [color-scheme:light] dark:[color-scheme:dark]`}
										min={new Date().toISOString().slice(0, 16)}
									/>
									{errors.scheduledDate && <p className="text-sm text-destructive">{errors.scheduledDate}</p>}
								</div>
							)}
						</div>

						{/* Form Actions */}
						<div className="flex items-center justify-end space-x-4 pt-6 border-t border-border">
							<Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
								Cancel
							</Button>
							<Button type="submit" disabled={isLoading}>
								{isLoading ? (
									<>
										<Icon icon="solar:refresh-bold" className="mr-2 h-4 w-4 animate-spin" />
										{mode === "create" ? "Creating..." : "Updating..."}
									</>
								) : (
									<>
										<Icon
											icon={formData.scheduleEnabled ? "solar:calendar-bold" : "solar:play-bold"}
											className="mr-2 h-4 w-4"
										/>
										{formData.scheduleEnabled
											? mode === "create"
												? "Schedule Notification"
												: "Update Schedule"
											: mode === "create"
												? "Send Now"
												: "Update & Send"}
									</>
								)}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
