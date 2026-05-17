import React from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuthStore } from "@/store/authStore";
import AuthStack from "./AuthStack";
import MainTabs from "./MainTabs";
import PairScreen from "@/screens/PairScreen";

export type RootStackParamList = {
  Auth: undefined;
  Pair: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { user, couple, loading } = useAuthStore();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0f0f0f", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#e11d48" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : !couple || couple.status !== "active" ? (
          <>
            <Stack.Screen name="Pair" component={PairScreen} />
            <Stack.Screen name="Main" component={MainTabs} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="Pair" component={PairScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
