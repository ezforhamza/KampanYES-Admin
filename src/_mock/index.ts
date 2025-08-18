import { setupWorker } from "msw/browser";
import { mockTokenExpired } from "./handlers/_demo";
import { menuList } from "./handlers/_menu";
import { signIn, userList } from "./handlers/_user";
import { getStores, createStore, updateStore, deleteStore, getStoreById } from "./handlers/_store";
import {
	getCollections,
	createCollection,
	updateCollection,
	deleteCollection,
	getCollectionById,
	getCollectionFlyers,
	createFlyer,
	updateFlyer,
	deleteFlyer,
} from "./handlers/_collection";
import { getCategories, createCategory, updateCategory, deleteCategory, getCategoryById } from "./handlers/_category";
import {
	getAppUsers,
	getAppUserById,
	updateAppUser,
	suspendAppUser,
	activateAppUser,
	getAppUserStats,
} from "./handlers/_app-user";
import {
	getNotifications,
	createNotification,
	updateNotification,
	getNotificationById,
	deleteNotification,
	cancelNotification,
	sendNotificationNow,
	getNotificationStatsHandler,
} from "./handlers/_notification";
import { flyerHandlers } from "./handlers/_flyer";

const handlers = [
	signIn,
	userList,
	mockTokenExpired,
	menuList,
	getStores,
	createStore,
	updateStore,
	deleteStore,
	getStoreById,
	getCollections,
	createCollection,
	updateCollection,
	deleteCollection,
	getCollectionById,
	getCollectionFlyers,
	createFlyer,
	updateFlyer,
	deleteFlyer,
	getCategories,
	createCategory,
	updateCategory,
	deleteCategory,
	getCategoryById,
	getAppUsers,
	getAppUserById,
	updateAppUser,
	suspendAppUser,
	activateAppUser,
	getAppUserStats,
	getNotifications,
	createNotification,
	updateNotification,
	getNotificationById,
	deleteNotification,
	cancelNotification,
	sendNotificationNow,
	getNotificationStatsHandler,
	...flyerHandlers,
];
const worker = setupWorker(...handlers);

export { worker };
