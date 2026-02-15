import React, { useContext } from 'react';
import { Image, Text, View } from 'react-native';
import Context from '../context/Context';
import DashboardScreen from './dashboard/DashboardScreen';
import CalculatorToolsScreen from './CalculatorToolsScreen';
import PurityCalculatorScreen from './PurityCalculator';
import PurityGeneratorScreen from './PurityGenerator';
import PurityConverterScreen from './PurityConverter';
import GoldConverter from './GoldConverter';
import ShopRegistration from './ShopRegistration';
import UserRegistration from './UserRegistration';
import ShopsScreen from './screens/ShopsScreen';
import ShopDetailsScreen from './screens/ShopDetailsScreen';
import UsersScreen from './screens/UsersScreen';
import UserDetailsScreen from './screens/UserDetailsScreen';
import HelpScreen from './screens/HelpScreen';
import ProfileScreen from './screens/ProfileScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import EditServiceProviderScreen from './screens/EditServiceProviderScreen';
import EditShopScreen from './screens/EditShopScreen';
import RewardScreen from '../src/screens/RewardScreen';
import LogoImage from '../assets/Picture.png';

import { NavigationContainer, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const HeaderLogo = () => (
  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
    <Image source={LogoImage} style={{ width: 60, height: 60, marginRight: 5 }} />
    <Text style={{ color: 'black', fontSize: 18, fontWeight: 'bold' }}>DHIORA GOLD</Text>
  </View>
);

export default function AppNavigator() {
  const { theme } = useContext(Context);
  const c = theme.colors;

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: { backgroundColor: c.background, borderTopColor: c.border },
          tabBarActiveTintColor: c.accent,
          tabBarInactiveTintColor: c.textSecondary,
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeStack}
          options={{
            tabBarLabel: 'HOME',
            tabBarIcon: ({ color, size }) => <Icon name="home" size={size} color={color} />,
          }}
        />
        <Tab.Screen
          name="Shops"
          component={ShopsStack}
          options={({ route }) => {
            const routeName = getFocusedRouteNameFromRoute(route) ?? 'ShopsList';
            return {
              tabBarLabel: 'SHOPS',
              tabBarIcon: ({ color, size }) => <Icon name="storefront" size={size} color={color} />,
              tabBarStyle:
                routeName === 'Shop Details'
                  ? { display: 'none' }
                  : { backgroundColor: c.background, borderTopColor: c.border },
            };
          }}
        />
        <Tab.Screen
          name="Users"
          component={UsersStack}
          options={({ route }) => {
            const routeName = getFocusedRouteNameFromRoute(route) ?? 'UsersList';
            return {
              tabBarLabel: 'USERS',
              tabBarIcon: ({ color, size }) => <Icon name="groups" size={size} color={color} />,
              tabBarStyle:
                routeName === 'User Details'
                  ? { display: 'none' }
                  : { backgroundColor: c.background, borderTopColor: c.border },
            };
          }}
        />
        <Tab.Screen
          name="Help"
          component={HelpScreen}
          options={{
            tabBarLabel: 'HELP',
            tabBarIcon: ({ color, size }) => <Icon name="help-outline" size={size} color={color} />,
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileStack}
          options={{
            tabBarLabel: 'PROFILE',
            tabBarIcon: ({ color, size }) => <Icon name="person" size={size} color={color} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

function ShopsStack() {
  const { theme } = useContext(Context);
  const c = theme.colors;

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: c.background },
        headerTintColor: c.accent,
      }}
    >
      <Stack.Screen name="ShopsList" component={ShopsScreen} />
      <Stack.Screen name="Shop Details" component={ShopDetailsScreen} />
    </Stack.Navigator>
  );
}

function UsersStack() {
  const { theme } = useContext(Context);
  const c = theme.colors;

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: c.background },
        headerTintColor: c.accent,
      }}
    >
      <Stack.Screen name="UsersList" component={UsersScreen} />
      <Stack.Screen name="User Details" component={UserDetailsScreen} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  const { theme } = useContext(Context);
  const c = theme.colors;

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: c.background },
        headerTintColor: c.accent,
        headerTitleStyle: { color: c.text, fontWeight: 'bold' },
      }}
    >
      <Stack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerTitle: () => <HeaderLogo />, headerStyle: { backgroundColor: '#F8C24D' }, headerTintColor: 'black' }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ headerTitle: () => <HeaderLogo />, headerStyle: { backgroundColor: '#F8C24D' }, headerTintColor: 'black' }}
      />
      <Stack.Screen
        name="Register Shop"
        component={ShopRegistration}
        options={{ headerTitle: () => <HeaderLogo />, headerStyle: { backgroundColor: '#F8C24D' }, headerTintColor: 'black' }}
      />
      <Stack.Screen
        name="Register Service Provider"
        component={UserRegistration}
        options={{ headerTitle: () => <HeaderLogo />, headerStyle: { backgroundColor: '#F8C24D' }, headerTintColor: 'black' }}
      />
      <Stack.Screen
        name="Edit Service Provider"
        component={EditServiceProviderScreen}
        options={{ headerTitle: () => <HeaderLogo />, headerStyle: { backgroundColor: '#F8C24D' }, headerTintColor: 'black' }}
      />
      <Stack.Screen
        name="Edit Shop"
        component={EditShopScreen}
        options={{ headerTitle: () => <HeaderLogo />, headerStyle: { backgroundColor: '#F8C24D' }, headerTintColor: 'black' }}
      />
      <Stack.Screen
        name="Earn Gold"
        component={RewardScreen}
        options={{ headerTitle: 'Earn Gold', headerStyle: { backgroundColor: '#F8C24D' }, headerTintColor: 'black' }}
      />
    </Stack.Navigator>
  );
}

function HomeStack() {
  const { theme } = useContext(Context);
  const c = theme.colors;

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: c.background },
        headerTintColor: c.accent,
        headerTitleStyle: { color: c.text, fontWeight: 'bold' },
      }}
    >
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Calculator Tools" component={CalculatorToolsScreen} />
      <Stack.Screen
        name="Gold Converter"
        component={GoldConverter}
        options={{ headerTitle: () => <HeaderLogo />, headerStyle: { backgroundColor: '#F8C24D' }, headerTintColor: 'black' }}
      />
      <Stack.Screen
        name="Purity Converter"
        component={PurityConverterScreen}
        options={{ headerTitle: () => <HeaderLogo />, headerStyle: { backgroundColor: '#F8C24D' }, headerTintColor: 'black' }}
      />
      <Stack.Screen
        name="Purity Calculator"
        component={PurityCalculatorScreen}
        options={{ headerTitle: () => <HeaderLogo />, headerStyle: { backgroundColor: '#F8C24D' }, headerTintColor: 'black' }}
      />
      <Stack.Screen
        name="Purity Generator"
        component={PurityGeneratorScreen}
        options={{ headerTitle: () => <HeaderLogo />, headerStyle: { backgroundColor: '#F8C24D' }, headerTintColor: 'black' }}
      />
    </Stack.Navigator>
  );
}
