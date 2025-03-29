import React from "react";
import Toast from "react-native-toast-message";

import {
	GoogleSignin,
	isErrorWithCode,
	statusCodes,
} from "@react-native-google-signin/google-signin";
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

			const { data: user, type } = await GoogleSignin.signIn();
			if (!user?.idToken) {
				if (type !== "cancelled") {
					console.error("Google sign-in failed!");
					Toast.show({
						type: "error",
						text1: "Error logging in",
						text2: "An error occurred while logging in. Please try again later.",
					});
				}

				setLoading(false);
				return;
			}

			const supabaseAuthData = await databaseManager.supabaseDB?.auth.signInWithIdToken({
				provider: "google",
				token: user.idToken,
			});
			if (!supabaseAuthData?.data?.user) {
				await GoogleSignin.signOut();
				console.error(`Supabase sign-in failed: ${supabaseAuthData?.error}`);
				Toast.show({
					type: "error",
					text1: `Error logging in (${supabaseAuthData?.error?.code ?? "unknown_error"})`,
					text2: "An error occurred while logging in. Please try again later.",
				});

				setLoading(false);
				return;
			}

			updateUser({
				...currentUser,
				id: supabaseAuthData.data.user?.id ?? "",
				username: user.user.name ?? "",
				email: user.user.email,
				photo: user.user.photo ?? "",
				memberSince: supabaseAuthData.data.user?.created_at ?? new Date().toISOString(),
			});
			await databaseManager.supabaseDB
				?.from("Profiles")
				.upsert({
					id: supabaseAuthData.data.user?.id ?? "",
					updated_at: supabaseAuthData.data.user?.created_at ?? new Date().toISOString(),
					username: user.user.name ?? "",
					avatar_url: user.user.photo ?? "",
				})
				.throwOnError();

			Toast.show({ type: "success", text1: "Successfully logged in!" });
			setLoading(false);
			updateIsLoggedIn(true);

			router.replace("/input");
		} catch (error) {
			if (
				isErrorWithCode(error) &&
				[statusCodes.SIGN_IN_CANCELLED, statusCodes.IN_PROGRESS].includes(error.code)
			) {
				setLoading(false);
				return;
			}

			console.error(error);
			Toast.show({
				type: "error",
				text1: "Error logging in",
				text2: "An error occurred while logging in. Please try again later.",
			});

			await GoogleSignin.signOut();
			setLoading(false);
			updateIsLoggedIn(false);
		}
	};

	return { loading, handleGoogleAuth };
};
