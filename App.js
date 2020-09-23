import React from 'react';
import { LogBox } from 'react-native';
import Main from './components/MainComponent';

LogBox.ignoreLogs(['deprecated','future release']);

export default class App extends React.Component {
  render() {
    return (
      <Main />
    );
  }
}
