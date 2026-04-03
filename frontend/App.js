import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import FoodListScreen from './src/screens/MenuAdmin/FoodListScreen';
import AddFoodScreen from './src/screens/MenuAdmin/AddFoodScreen';
import EditFoodScreen from './src/screens/MenuAdmin/EditFoodScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="FoodList"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#4A2C2A',
          },
          headerTintColor: '#FFF8F0',
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
            letterSpacing: 0.3,
          },
          headerShadowVisible: false,
          animation: 'slide_from_right',
          contentStyle: {
            backgroundColor: '#FFF8F0',
          },
        }}
      >
        <Stack.Screen
          name="FoodList"
          component={FoodListScreen}
          options={{
            title: '☕  Menu Management',
          }}
        />
        <Stack.Screen
          name="AddFood"
          component={AddFoodScreen}
          options={{
            title: 'Add New Item',
          }}
        />
        <Stack.Screen
          name="EditFood"
          component={EditFoodScreen}
          options={{
            title: 'Edit Item',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
