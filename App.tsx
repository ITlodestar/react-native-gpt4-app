import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './components/navigation/AppNavigation';

// TODO: Fix code format word wrap
// TODO: Text goes on new line because it doesn't fit
// because its new Text element

export default function App() {
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}