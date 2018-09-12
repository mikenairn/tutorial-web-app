import axios from "axios";
import { list, create, watch } from "./openshiftServices";

const listWalkthroughs = (openshiftUrl, token, namespace) => {
  const walkthroughResource = {
    name: 'walkthroughs',
    namespace: namespace,
    version: 'v1alpha1',
    group: 'integreatly.aerogear.org'
  };
  return list(openshiftUrl, token, walkthroughResource);
};

const createWalkthrough = (openshiftUrl, token, namespace, walkthrough) => {
  const walkthroughResource = {
    name: 'walkthroughs',
    namespace: namespace,
    version: 'v1alpha1',
    group: 'integreatly.aerogear.org'
  };
  return create(openshiftUrl, token, walkthroughResource, {
    kind: 'Walkthrough',
    metadata: {
      name: 'wooopwwop'
    },
    spec: {
      services: ['fuse'],
      username: 'myuser'
    }
  });
}

const watchWalkthroughs = (openshiftUrl, token, namespace) => {
  const walkthroughResource = {
    name: 'walkthroughs',
    namespace: namespace,
    version: 'v1alpha1',
    group: 'integreatly.aerogear.org'
  };
  return watch(openshiftUrl, token, walkthroughResource);
};

export { listWalkthroughs, watchWalkthroughs, createWalkthrough };
