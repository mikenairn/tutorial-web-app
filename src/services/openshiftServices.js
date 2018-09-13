import axios from "axios";

// WIP ONLY, THESE WILL BE REMOVED
const openshiftUrl = 'master.akeating.openshiftworkshop.com';
const token = 'replaceme';

class OpenShiftUser {
  constructor(uid, username) {
    this.uid = uid;
    this.username = username;
  }
}

const OpenShiftWatchEvents = Object.freeze({
  MODIFIED: 'MODIFIED',
  ADDED: 'ADDED',
  DELETED: 'DELETED',
  OPENED: 'OPENED',
  CLOSED: 'CLOSED'
});

class OpenShiftWatchEventListener {
  _handler = () => { };
  _errorHandler = () => { };

  constructor(socket) {
    this._socket = socket;
  }

  init() {
    this._socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this._handler({ type: data.type, payload: data.object });
    }
    this._socket.oncreate = () => this._handler({ type: OpenShiftWatchEvents.OPENED });
    this._socket.onclose = () => this._handler({ type: OpenShiftWatchEvents.CLOSED });
    this._socket.onerror = (err) => this._errorHandler(err);
    return this;
  }

  onEvent(handler) {
    this._handler = handler;
    return this;
  }

  catch(handler) {
    this._errorHandler = handler;
    return this;
  }
}

const currentUser = () => {
  return axios({
    url: `https://${openshiftUrl}/oapi/v1/users/~`,
    headers: {
      authorization: `Bearer ${token}`
    }
  }).then(response => new OpenShiftUser(response.data.metadata.uid, response.data.metadata.name));
}

const get = (res, name) => {
  return axios({
    url: `https://${openshiftUrl}/apis/${res.group}/${res.version}/namespaces/${res.namespace}/${res.name}/${name}`,
    headers: {
      authorization: `Bearer ${token}`
    }
  }).then(response => response.data);
}

const list = (res) => {
  return axios({
    url: `https://${openshiftUrl}/apis/${res.group}/${res.version}/namespaces/${res.namespace}/${res.name}`,
    headers: {
      authorization: `Bearer ${token}`
    }
  }).then(response => response.data);
};

const create = (res, obj) => {
  if (!obj.apiVersion) {
    obj.apiVersion = `${res.group}/${res.version}`;
  }
  return axios({
    url: `https://${openshiftUrl}/apis/${res.group}/${res.version}/namespaces/${res.namespace}/${res.name}`,
    method: 'POST',
    data: obj,
    headers: {
      authorization: `Bearer ${token}`
    }
  }).then(response => response.data);
}

const watch = (res) => {
  const walkthroughsUrl = `wss://${openshiftUrl}/apis/${res.group}/${res.version}/namespaces/${res.namespace}/${res.name}?watch=true`;
  const base64token = window.btoa(token).replace(/=/g, '');
  const socket = new WebSocket(walkthroughsUrl, [`base64url.bearer.authorization.k8s.io.${base64token}`, null]);

  return Promise.resolve(new OpenShiftWatchEventListener(socket).init());
};

export { currentUser, get, create, list, watch, OpenShiftWatchEvents };
