import { LoginView, MonthView } from '../../views';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

export default function AppNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Login" component={LoginView} options={{
                headerShown: false
            }}/>
            <Stack.Screen name="Month" component={MonthView} options={{
                headerShown: false
            }}/>
        </Stack.Navigator>
    );
}