// import { onLogin } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes
} from "@react-native-google-signin/google-signin";
import React from "react";
import { useTranslation } from "react-i18next";
import { Image, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";

const AppLogo = "https://fiygsqgbebchajeqfpxe.supabase.co/storage/v1/object/public/app-assets//bhagwan_darshan.png";

function GoogleButton() {
  const { signInWithToken } = useAuth();
  const { isDark } = useTheme();
  return (
    <GoogleSigninButton
      size={GoogleSigninButton.Size.Wide}
      color={
        isDark ? GoogleSigninButton.Color.Dark : GoogleSigninButton.Color.Light
      }
      // style={styles.googleButton}  
      onPress={async () => {
        try {
          await GoogleSignin.hasPlayServices();
          const userInfo = await GoogleSignin.signIn();
          if (!userInfo) throw new Error("no userInfo");
          if (!userInfo.data) throw new Error("no userInfo data");

          signInWithToken(userInfo.data.idToken)

        } catch (error: any) {
          if (error.code === statusCodes.SIGN_IN_CANCELLED) {
            Toast.show({
              type: "error",
              text1: "Sign-in cancelled by user",
            });
            // user cancelled the login flow
          } else if (error.code === statusCodes.IN_PROGRESS) {
            Toast.show({
              type: "info",
              text1: "Signing in...",
            });
            // operation (e.g. sign in) is in progress already
          } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
            Toast.show({
              type: "error",
              text1: "Internet errpr",
            });
          } else {
            Toast.show({
              type: "error",
              text1: `Error ${error}`,
            });
          }
        }
      }}
    />
  );
}

export default function AuthScreen() {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.content}>
        <Image source={{ uri: AppLogo }} style={styles.image} />
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {t("auth.welcome")}
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {t("auth.signInToAccessAllFeatures")}
        </Text>

        {/* <WebGoogleSigninButton /> */}
        <GoogleButton />

        {/* <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleSignIn}
        >
          <Image
            source={{
              uri: "https://imagepng.org/wp-content/uploads/2019/08/google-icon-1.png",
            }}
            style={styles.googleIcon}
          />
          <Text style={styles.googleButtonText}>{"Sign in with google"}</Text>
        </TouchableOpacity> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 24,
  },
  title: {
    fontFamily: "Inter-Bold",
    fontSize: 32,
    marginBottom: 8,
    color: "#1A2C56",
  },
  subtitle: {
    fontFamily: "Inter-Regular",
    fontSize: 18,
    color: "#64748B",
    marginBottom: 32,
    textAlign: "center",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginLeft: 15,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  googleButtonText: {
    fontFamily: "Inter-Medium",
    fontSize: 16,
    color: "#1A2C56",
  },
});
