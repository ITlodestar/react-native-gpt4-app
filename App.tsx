import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './components/navigation/AppNavigation';

export default function App() {

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}