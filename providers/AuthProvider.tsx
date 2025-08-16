import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import Toast from "react-native-toast-message";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signInWithToken: (idToken: string | null) => Promise<void>;
  handleSignOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
      setLoading(false);
    };

    getSession();

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    GoogleSignin.configure({
      scopes: [process.env.EXPO_PUBLIC_GOOGLE_OAUTH_SCOPES],
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_OAUTH_WEBCLIENTID,
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);


  const signInWithToken = async (idToken: string | null) => {
    if (idToken) {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: idToken,
      });

      if (error) throw new Error(error.message);
      else {
        Toast.show({
          type: "success",
          text1: "Sign-in success",
        });

        if (user) {
          await supabase.from("users").upsert(
            {
              id: user.id,
              email: user.email!,
              preferred_language: "en",
              theme: "light",
            },
            { onConflict: "email", ignoreDuplicates: true }
          );
        }
      }
    } else {
      throw new Error("no ID token present!");
    }
  };

  const handleSignOut = async () => {
    try {
      await GoogleSignin.signOut();
      await supabase.auth.signOut();
      Toast.show({
        type: "success",
        text1: "Sign-out success",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: `Error ${error}`,
      });
    }
  };

  const value = {
    user,
    loading,
    signInWithToken,
    handleSignOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
