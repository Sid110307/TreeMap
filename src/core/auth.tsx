import React from "react";
import Toast from "react-native-toast-message";

import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useRouter } from "expo-router";

import { databaseManager } from "./database";
import { useUserState } from "./state";

export const useAuth = () => {
	const router = useRouter();

	const { user: currentUser, updateUser, updateIsLoggedIn } = useUserState();
	const [loading, setLoading] = React.useState(false);

	const handleGoogleAuth = async () => {
		try {
			setLoading(true);
			if (!(await GoogleSignin.hasPlayServices())) {
				Toast.show({
					type: "error",
					text1: "Error logging in",
					text2: "Google Play Services are not available. Please check your device settings.",
				});
				setLoading(false);

				return;
			}

			const { data: user } = await GoogleSignin.signIn();
			if (!user?.idToken) {
				console.error("Google sign-in failed!");
				Toast.show({
					type: "error",
					text1: "Error logging in",
					text2: "An error occurred while logging in. Please try again later.",
				});

				setLoading(false);
				return;
			}

			const supabaseAuthData = await databaseManager.supabaseDB?.auth.signInWithIdToken({
				provider: "google",
				token: user.idToken,
			});
			if (!supabaseAuthData?.data) {
				Toast.show({
					type: "error",
					text1: `Error logging in (${supabaseAuthData?.error?.code})`,
					text2: "An error occurred while logging in. Please try again later.",
				});

				setLoading(false);
				return;
			}

			Toast.show({ type: "success", text1: "Successfully logged in!" });
			updateUser({
				...currentUser,
				id: supabaseAuthData.data.user?.id ?? "",
				username: user.user.name ?? "",
				email: user.user.email,
				photo: user.user.photo ?? "",
				memberSince: supabaseAuthData.data.user?.created_at ?? new Date().toISOString(),
			});

			updateIsLoggedIn(true);
			router.navigate("/input");
		} catch (error) {
			console.error(error);
			Toast.show({
				type: "error",
				text1: "Error logging in",
				text2: "An error occurred while logging in. Please try again later.",
			});
		} finally {
			setLoading(false);
		}
	};

	return { loading, handleGoogleAuth };
};
