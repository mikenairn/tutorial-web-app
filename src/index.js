import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import 'patternfly/dist/css/patternfly.css';
import 'patternfly/dist/css/patternfly-additions.css';
import './styles/.css/index.css';

import App from './App';
import { baseName } from './routes';
import store from './redux/store';
import { walkthroughTypes } from './redux/constants';
import { listWalkthroughs, watchWalkthroughs, createWalkthrough } from './services/walkthroughServices';
import { PENDING_ACTION, FULFILLED_ACTION, REJECTED_ACTION } from './redux/helpers';

const openshiftHost = 'master.akeating.openshiftworkshop.com';
const namespace = 'eval';
const token = 'REPLACEME';
const MY_WALKTHROUGH = 'woopwoop'
const defaultWalkthrough = {
  name: MY_WALKTHROUGH,
  services: ['fuse', 'che', 'enmasse-standard'],
  username: 'replaceme'
}

store.dispatch({
  type: PENDING_ACTION(walkthroughTypes.LIST_WALKTHROUGH)
});
listWalkthroughs(openshiftHost, token, namespace, store.dispatch)
  .then(walkthroughs => {
    // Let the application know the list job has completed.
    const parsedWalkthroughs = walkthroughs.map(walkthrough => buildWalkthroughFromOpenShiftResource(walkthrough));
    store.dispatch({
      type: FULFILLED_ACTION(walkthroughTypes.LIST_WALKTHROUGH),
      payload: {
        walkthroughs: parsedWalkthroughs
      }
    });

    // If the list items are empty then create a walkthrough instead.
    if (walkthroughs.length === 0 || !parsedWalkthroughs.find(walkthrough => walkthrough.name === MY_WALKTHROUGH)) {
      store.dispatch({
        type: PENDING_ACTION(walkthroughTypes.CREATE_WALKTHROUGH)
      });
      return createWalkthrough(openshiftHost, token, namespace, defaultWalkthrough);
    }
    return
  })
  .catch(err => {
    store.dispatch({
      type: REJECTED_ACTION(walkthroughTypes.LIST_WALKTHROUGH),
      payload: {
        error: err,
        errorMessage: 'Failed to list or create the available walkthroughs'
      }
    })
  })
  .then(() => watchWalkthroughs(openshiftHost, token, namespace, store.dispatch))
  .then(socket => socket.onmessage = handleWalkthoughWatchEvent);

// I NEED A DIVIDER HERE, THIS IS WAY TOO LONG

const handleWalkthoughWatchEvent = (event) => {
  const data = JSON.parse(event.data);
  // For adding and modifying we're doing the same thing, overwriting.
  const walkthrough = buildWalkthroughFromOpenShiftResource(data.object);
  if (data.type === 'ADDED' || data.type === 'MODIFIED') {
    store.dispatch(addWalkthrough(walkthrough));
  }
  if (data.type === 'DELETED') {
    store.dispatch(removeWalkthrough(walkthrough));
    if (walkthrough.name === MY_WALKTHROUGH) {
      console.log('Recreating the walkthrough')
      store.dispatch(addWalkthrough(walkthrough));
      createWalkthrough(openshiftHost, token, namespace, walkthrough);
    }
  }
}

const addWalkthrough = (payload) => ({
  type: FULFILLED_ACTION(walkthroughTypes.CREATE_WALKTHROUGH),
  payload: payload
});

const removeWalkthrough = (payload) => ({
  type: FULFILLED_ACTION(walkthroughTypes.REMOVE_WALKTHROUGH),
  payload
});

const buildWalkthroughFromOpenShiftResource = (rawWalkthrough) => ({
  name: rawWalkthrough.metadata.name,
  namespace: rawWalkthrough.metadata.namespace,
  username: rawWalkthrough.spec.username,
  services: rawWalkthrough.spec.services
});

ReactDOM.render(
  <Provider store={store}>
    <Router basename={baseName}>
      <App />
    </Router>
  </Provider>,
  document.getElementById('root')
);
