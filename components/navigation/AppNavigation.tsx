import { LoginView, HomeView, SettingsView } from '../../views';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

export default function AppNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Login" component={LoginView} options={{
                headerShown: false
            }}/>
            <Stack.Screen name="Home" component={HomeView} options={{
                headerShown: false
            }}/>
            <Stack.Screen name="Settings" component={SettingsView} options={{
                headerShown: false
            }}/>
        </Stack.Navigator>
    );
}