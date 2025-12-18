import { registerRootComponent } from 'expo';

import App from './App';
const API_URL = 'http://192.168.1.73:3001';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
