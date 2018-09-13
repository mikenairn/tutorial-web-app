import { list, create, watch, currentUser, OpenShiftWatchEvents } from "./openshiftServices";
import { walkthroughTypes } from '../redux/constants';
import { FULFILLED_ACTION } from '../redux/helpers';

const WALKTHROUGH_SERVICES = ['fuse', 'che', 'enmasse-standard'];

const manageUserWalkthrough = (dispatch) => {
  currentUser().then(user => {
    const walkthroughResourceDef = {
      name: 'walkthroughs',
      namespace: buildValidServiceNamespaceName(user.username),
      version: 'v1alpha1',
      group: 'integreatly.aerogear.org'
    };

    findOrCreateUserWalkthrough(walkthroughResourceDef, user)
      .then(walkthrough => {
        dispatch({ type: FULFILLED_ACTION(walkthroughTypes.CREATE_WALKTHROUGH), payload: walkthrough });
        return walkthrough;
      })
      .then(walkthrough => {
        const watchHandler = handleWalkthoughWatchEvent.bind(null, dispatch, walkthrough);
        watchWalkthroughs(walkthroughResourceDef, watchHandler)
      });
  });
}

const findOrCreateUserWalkthrough = (walkthroughResourceDef, user) => {
  return listWalkthroughs(walkthroughResourceDef)
    .then(walkthroughs => {
      const userWalkthrough = walkthroughs.find(walkthrough => walkthrough.name === buildValidWalkthroughName(user.username));
      if (!userWalkthrough) {
        return createWalkthrough(walkthroughResourceDef, WALKTHROUGH_SERVICES);
      }
      return Promise.resolve(userWalkthrough);
    });
}

const listWalkthroughs = (walkthroughResourceDef) => {
  return list(walkthroughResourceDef)
    .then(listResponse => listResponse.items)
    .then(walkthroughs => walkthroughs.map(walkthrough => buildWalkthroughFromOpenShiftResource(walkthrough)));
};

const createWalkthrough = (walkthroughResourceDef, services) => {
  return currentUser().then(user => {
    return create(walkthroughResourceDef, {
      kind: 'Walkthrough',
      metadata: {
        name: buildValidWalkthroughName(user.username)
      },
      spec: {
        services: services,
        userUid: user.uid,
        username: user.username
      }
    }).then(walkthrough => buildWalkthroughFromOpenShiftResource(walkthrough));
  });
}

const watchWalkthroughs = (walkthroughResourceDef, handler) => {
  return watch(walkthroughResourceDef).then(listener => listener.onEvent(handler));
};

const handleWalkthoughWatchEvent = (dispatch, walkthrough, event) => {
  // Ignore any walkthroughs that don't belong to our user
  if (event.payload && event.payload.metadata.name !== buildValidWalkthroughName(walkthrough.username)) {
    return;
  }
  if (event.type === OpenShiftWatchEvents.ADDED || event.type === OpenShiftWatchEvents.MODIFIED) {
    const walkthrough = buildWalkthroughFromOpenShiftResource(event.payload);
    dispatch({
      type: FULFILLED_ACTION(walkthroughTypes.CREATE_WALKTHROUGH),
      payload: walkthrough
    });
  }
  if (event.type === OpenShiftWatchEvents.DELETED) {
    const walkthrough = buildWalkthroughFromOpenShiftResource(event.payload);
    dispatch({
      type: FULFILLED_ACTION(walkthroughTypes.REMOVE_WALKTHROUGH),
      walkthrough
    });
  }
}

const buildWalkthroughFromOpenShiftResource = (rawWalkthrough) => ({
  name: rawWalkthrough.metadata.name,
  namespace: rawWalkthrough.metadata.namespace,
  username: rawWalkthrough.spec.username,
  services: rawWalkthrough.spec.services
});

const buildValidServiceNamespaceName = (username) => {
  return `${username.replace(/@/g, '-').replace(/\./g, '-')}-walkthrough-services`
}

const buildValidWalkthroughName = (username) => {
  return `${username.replace(/@/g, '-').replace(/\./g, '-')}-walkthrough`
}


export { manageUserWalkthrough };
