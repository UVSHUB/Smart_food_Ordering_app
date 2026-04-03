import React, { useContext } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';

// ── Auth Context ──
import { AuthProvider, AuthContext } from './src/context/AuthContext';

// ── Auth Screens ──
import LoginScreen from './src/screens/Auth/LoginScreen';
import RegisterScreen from './src/screens/Auth/RegisterScreen';

// ── Customer Screens ──
import UserMenuScreen from './src/screens/Home/UserMenuScreen';
import FoodDetailScreen from './src/screens/FoodDetails/FoodDetailScreen';

// ── Admin Screens ──
import FoodListScreen from './src/screens/MenuAdmin/FoodListScreen';
import AddFoodScreen from './src/screens/MenuAdmin/AddFoodScreen';
import EditFoodScreen from './src/screens/MenuAdmin/EditFoodScreen';

// ── Profile Screens ──
import ProfileScreen from './src/screens/Profile/ProfileScreen';
import EditProfileScreen from './src/screens/Profile/EditProfileScreen';

// ── Palette ──
const C = {
  mocha:    '#4A2C2A',
  walnut:   '#6B4226',
  caramel:  '#A0673C',
  cream:    '#FFF8F0',
  milk:     '#FFFFFF',
  fog:      '#F5EDE4',
  textDark: '#2D1810',
  textMuted:'#8C7B6F',
};

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ── Shared header options ──
const screenOptions = {
  headerStyle: { backgroundColor: C.mocha },
  headerTintColor: C.cream,
  headerTitleStyle: { fontWeight: '700', fontSize: 18, letterSpacing: 0.3 },
  headerShadowVisible: false,
  animation: 'slide_from_right',
  contentStyle: { backgroundColor: C.cream },
};

// ── Tab Icon Component ──
const TabIcon = ({ emoji, label, focused }) => (
  <View style={styles.tabIconWrap}>
    <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>
      {emoji}
    </Text>
    <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
      {label}
    </Text>
  </View>
);

// ── Auth Stack ──
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// ── Customer Menu Stack ──
function CustomerStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="UserMenu"
        component={UserMenuScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="FoodDetail"
        component={FoodDetailScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

// ── User Profile Stack ──
function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    </Stack.Navigator>
  );
}

// ── Admin Menu Stack ──
function AdminStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="FoodList"
        component={FoodListScreen}
        options={{ title: '☕  Menu Management' }}
      />
      <Stack.Screen
        name="AddFood"
        component={AddFoodScreen}
        options={{ title: 'Add New Item' }}
      />
      <Stack.Screen
        name="EditFood"
        component={EditFoodScreen}
        options={{ title: 'Edit Item' }}
      />
    </Stack.Navigator>
  );
}

// ── Navigation Wrapper ──
function AppNav() {
  const { isLoading, userToken, user } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.cream }}>
        <ActivityIndicator size="large" color={C.caramel} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {userToken === null ? (
        <AuthStack />
      ) : (
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: styles.tabBar,
            tabBarShowLabel: false,
            tabBarHideOnKeyboard: true,
          }}
        >
          <Tab.Screen
            name="MenuTab"
            component={CustomerStack}
            options={{
              tabBarIcon: ({ focused }) => (
                <TabIcon emoji="🍽️" label="Menu" focused={focused} />
              ),
            }}
          />

          {user && user.isAdmin && (
            <Tab.Screen
              name="ManageTab"
              component={AdminStack}
              options={{
                tabBarIcon: ({ focused }) => (
                  <TabIcon emoji="⚙️" label="Manage" focused={focused} />
                ),
              }}
            />
          )}

          <Tab.Screen
            name="ProfileTab"
            component={ProfileStack}
            options={{
              tabBarIcon: ({ focused }) => (
                <TabIcon emoji="👤" label="Profile" focused={focused} />
              ),
            }}
          />
        </Tab.Navigator>
      )}
    </NavigationContainer>
  );
}

// ── Main App Provider ──
export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <AppNav />
    </AuthProvider>
  );
}

// ── Styles ──
const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: C.milk,
    borderTopWidth: 0,
    height: 72,
    paddingBottom: 8,
    paddingTop: 8,
    shadowColor: C.mocha,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 12,
  },
  tabIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
  },
  tabEmoji: {
    fontSize: 22,
    marginBottom: 4,
    opacity: 0.5,
  },
  tabEmojiActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: C.textMuted,
  },
  tabLabelActive: {
    color: C.walnut,
    fontWeight: '700',
  },
});
