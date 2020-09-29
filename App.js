import React from 'react';
import { LogBox } from 'react-native';
import Main from './components/MainComponent';
import { Provider } from 'react-redux';
import { ConfigureStore } from './redux/configureStore';

const store = ConfigureStore();

LogBox.ignoreLogs(['deprecated', 'future release', 'nested']);

export default class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <Main />
      </Provider>);
  }
}
