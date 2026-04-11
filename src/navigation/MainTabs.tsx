import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";
import DashboardScreen from "@/screens/DashboardScreen";
import BondingScreen from "@/screens/BondingScreen";
import CompatibilityScreen from "@/screens/CompatibilityScreen";
import CheckInScreen from "@/screens/CheckInScreen";
import ProfileScreen from "@/screens/ProfileScreen";

export type MainTabParamList = {
  Dashboard: undefined;
  Bonding: undefined;
  Compatibility: undefined;
  CheckIn: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Dashboard: "✦",
    Bonding: "🕯️",
    Compatibility: "🔮",
    CheckIn: "💬",
    Profile: "👤",
  };
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.4 }}>
      {icons[label] ?? "•"}
    </Text>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#0A0A0A",
          borderTopColor: "rgba(255,255,255,0.1)",
          borderTopWidth: 0.5,
          height: 80,
          paddingBottom: 24,
          paddingTop: 8,
        },
        tabBarActiveTintColor: "#f43f5e",
        tabBarInactiveTintColor: "rgba(255,255,255,0.4)",
        tabBarLabelStyle: { fontSize: 10, fontWeight: "600" },
        tabBarIcon: ({ focused }) => (
          <TabIcon label={route.name} focused={focused} />
        ),
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarLabel: "Home" }}
      />
      <Tab.Screen
        name="Bonding"
        component={BondingScreen}
        options={{ tabBarLabel: "Bond" }}
      />
      <Tab.Screen
        name="Compatibility"
        component={CompatibilityScreen}
        options={{ tabBarLabel: "Compat" }}
      />
      <Tab.Screen
        name="CheckIn"
        component={CheckInScreen}
        options={{ tabBarLabel: "Check-In" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: "You" }}
      />
    </Tab.Navigator>
  );
}
