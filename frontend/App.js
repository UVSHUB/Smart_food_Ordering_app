import React, { useContext } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';

// ── Auth Context ──
import { AuthProvider, AuthContext } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';

// ── Cart Screen ──
import CartScreen from './src/screens/Cart/CartScreen';

// ── Auth Screens ──
import LoginScreen from './src/screens/Auth/LoginScreen';
import RegisterScreen from './src/screens/Auth/RegisterScreen';

// ── Customer Screens ──
import UserMenuScreen from './src/screens/Home/UserMenuScreen';
import FoodDetailScreen from './src/screens/Home/FoodDetailScreen';
import AddReviewScreen from './src/screens/Home/AddReviewScreen';
import EditReviewScreen from './src/screens/Home/EditReviewScreen';

// ── Payment Screens ──
import PaymentScreen from './src/screens/Payment/PaymentScreen';
import PaymentHistoryScreen from './src/screens/Payment/PaymentHistoryScreen';
import PaymentDetailScreen from './src/screens/Payment/PaymentDetailScreen';
import AdminPaymentScreen from './src/screens/Payment/AdminPaymentScreen';

// ── Admin Screens ──
import FoodListScreen from './src/screens/MenuAdmin/FoodListScreen';
import AddFoodScreen from './src/screens/MenuAdmin/AddFoodScreen';
import EditFoodScreen from './src/screens/MenuAdmin/EditFoodScreen';

// ── Profile Screens ──
import ProfileScreen from './src/screens/Profile/ProfileScreen';
import EditProfileScreen from './src/screens/Profile/EditProfileScreen';

// ── Admin User Management ──
import UserListScreen from './src/screens/UserAdmin/UserListScreen';
import EditUserAdminScreen from './src/screens/UserAdmin/EditUserAdminScreen';

// ── Delivery Screens ──
import DeliveryListScreen   from './src/screens/Delivery/DeliveryListScreen';
import DeliveryDetailScreen from './src/screens/Delivery/DeliveryDetailScreen';
import CreateDeliveryScreen from './src/screens/Delivery/CreateDeliveryScreen';
import UpdateDeliveryScreen from './src/screens/Delivery/UpdateDeliveryScreen';

// ── Palette ──
// ── Ultra Premium Modern Palette ──
const C = {
  primary:     '#FA4A0C', 
  bg:          '#F9F9FB', 
  surface:     '#FFFFFF', 
  textDark:    '#1A1A1A', 
  textMuted:   '#9A9A9D', 
  border:      '#E8E8E8',
};

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ── Shared header options ──
const screenOptions = {
  headerStyle: { backgroundColor: C.surface },
  headerTintColor: C.textDark,
  headerTitleStyle: { fontWeight: '700', fontSize: 18, letterSpacing: 0.3 },
  headerShadowVisible: false,
  animation: 'slide_from_right',
  contentStyle: { backgroundColor: C.bg },
};

// ── Tab Icon Component ──
// ── Tab Icon Component ──
const TabIcon = ({ iconName, label, focused }) => (
  <View style={styles.tabIconWrap}>
    <MaterialIcons 
      name={iconName} 
      size={24} 
      color={focused ? C.primary : C.textMuted} 
      style={{ marginBottom: 4 }}
    />
    <Text style={[styles.tabLabel, focused && styles.tabLabelActive]} numberOfLines={1}>
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
      <Stack.Screen name="UserMenu" component={UserMenuScreen} options={{ headerShown: false }} />
      <Stack.Screen name="FoodDetail" component={FoodDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AddReview" component={AddReviewScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EditReview" component={EditReviewScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Cart" component={CartScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Payment" component={PaymentScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PaymentHistory" component={PaymentHistoryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PaymentDetail" component={PaymentDetailScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

// ── User Profile Stack ──
function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="PaymentHistory" component={PaymentHistoryScreen} />
      <Stack.Screen name="PaymentDetail" component={PaymentDetailScreen} />
    </Stack.Navigator>
  );
}

// ── Admin Menu Stack ──
function AdminFoodStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions} initialRouteName="FoodList">
      <Stack.Screen name="FoodList" component={FoodListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AddFood" component={AddFoodScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EditFood" component={EditFoodScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminPayments" component={AdminPaymentScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

// ── Admin User Management Stack ──
function AdminUserStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions} initialRouteName="UserList">
      <Stack.Screen
        name="UserList"
        component={UserListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditUserAdmin"
        component={EditUserAdminScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

// ── Delivery Stack ──
function DeliveryStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions} initialRouteName="DeliveryList">
      <Stack.Screen name="DeliveryList"   component={DeliveryListScreen}   options={{ headerShown: false }} />
      <Stack.Screen name="DeliveryDetail" component={DeliveryDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CreateDelivery" component={CreateDeliveryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="UpdateDelivery" component={UpdateDeliveryScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

// ── Navigation Wrapper ──
function AppNav() {
  const { isLoading, userToken, user } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg }}>
        <ActivityIndicator size="large" color={C.primary} />
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
                <TabIcon iconName="restaurant-menu" label="Menu" focused={focused} />
              ),
            }}
          />

          {user && user.isAdmin && (
            <>
              <Tab.Screen
                name="ManageFoodTab"
                component={AdminFoodStack}
                options={{
                  tabBarIcon: ({ focused }) => (
                    <TabIcon iconName="settings" label="Food" focused={focused} />
                  ),
                }}
              />
              <Tab.Screen
                name="ManageUserTab"
                component={AdminUserStack}
                options={{
                  tabBarIcon: ({ focused }) => (
                    <TabIcon iconName="people" label="Users" focused={focused} />
                  ),
                }}
              />
            </>
          )}

          <Tab.Screen
            name="ProfileTab"
            component={ProfileStack}
            options={{
              tabBarIcon: ({ focused }) => (
                <TabIcon iconName="person" label="Profile" focused={focused} />
              ),
            }}
          />

          <Tab.Screen
            name="DeliveryTab"
            component={DeliveryStack}
            options={{
              tabBarIcon: ({ focused }) => (
                <TabIcon iconName="local-shipping" label="Delivery" focused={focused} />
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
      <CartProvider>
        <StatusBar style="dark" />
        <AppNav />
      </CartProvider>
    </AuthProvider>
  );
}

// ── Styles ──
const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: C.surface,
    borderTopWidth: 1,
    borderTopColor: C.border,
    height: Platform.OS === 'ios' ? 86 : 70,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingTop: 10,
  },
  tabIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: C.textMuted,
  },
  tabLabelActive: {
    color: C.primary,
    fontWeight: '800',
  },
});
