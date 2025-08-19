import Logo from "@/components/logo";
import { GLOBAL_CONFIG } from "@/global-config";
import SettingButton from "@/layouts/components/setting-button";
import { useUserToken } from "@/store/userStore";
import { Navigate } from "react-router";
import LoginForm from "./login-form";
import { LoginProvider } from "./providers/login-provider";

function LoginPage() {
	const token = useUserToken();

	if (token.accessToken) {
		return <Navigate to={GLOBAL_CONFIG.defaultRoute} replace />;
	}

	return (
		<div className="relative flex min-h-svh bg-background">
			<div className="flex flex-col gap-4 p-6 md:p-10 w-full">
				<div className="flex justify-center gap-2">
					<div className="flex items-center gap-2 font-medium cursor-pointer">
						<Logo size={28} />
						<span>{GLOBAL_CONFIG.appName}</span>
					</div>
				</div>
				<div className="flex flex-1 items-center justify-center">
					<div className="w-full max-w-xs">
						<LoginProvider>
							<LoginForm />
						</LoginProvider>
					</div>
				</div>
			</div>

			<div className="absolute right-2 top-0 flex flex-row">
				{/* <LocalePicker /> */}
				<SettingButton />
			</div>
		</div>
	);
}
export default LoginPage;
