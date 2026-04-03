import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

// Import our new screens
import FoodListScreen from './src/screens/MenuAdmin/FoodListScreen';
import AddFoodScreen from './src/screens/MenuAdmin/AddFoodScreen';
import EditFoodScreen from './src/screens/MenuAdmin/EditFoodScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator 
        initialRouteName="FoodList"
        screenOptions={{
          headerStyle: { backgroundColor: '#FF6C44' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        <Stack.Screen 
          name="FoodList" 
          component={FoodListScreen} 
          options={{ title: 'Menu Management' }} 
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
    </NavigationContainer>
  );
}
