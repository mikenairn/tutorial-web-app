import axios from "axios";

const list = (openshiftUrl, token, res) => {
  return axios({
    url: `https://${openshiftUrl}/apis/${res.group}/${res.version}/namespaces/${res.namespace}/${res.name}`,
    headers: {
      authorization: `Bearer ${token}`
    }
  }).then(response => {
    return response.data.items;
  });
};

const create = (openshiftUrl, token, res, obj) => {
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
  });
}

const watch = (openshiftUrl, token, res) => {
  const walkthroughsUrl = `wss://${openshiftUrl}/apis/${res.group}/${res.version}/namespaces/${res.namespace}/${res.name}?watch=true`;
  const base64token = window.btoa(token).replace(/=/g, '');
  const socket = new WebSocket(walkthroughsUrl, [`base64url.bearer.authorization.k8s.io.${base64token}`, null]);

  return Promise.resolve(socket);
};

export { create, list, watch };
