import React from 'react';

import { HashRouter as Router, Route } from 'react-router-dom';

import WelcomeScreen from './screens/CompilerScreen/CompilerScreen';

function Routes() {
  return (
    <Router basename="/">
      <Route exact path="/" component={WelcomeScreen} />
    </Router>
  );
}

export default Routes;
