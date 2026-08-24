const ALLOWED_PUSH_HOSTS = ["fcm.googleapis.com", "updates.push.services.mozilla.com", "web.push.apple.com"];

function isAllowedPushEndpoint(endpoint) {
  let url;
  try {
    url = new URL(endpoint);
  } catch {
    return false;
  }
  if (url.protocol !== "https:") return false;
  if (ALLOWED_PUSH_HOSTS.includes(url.hostname)) return true;
  return url.hostname.endsWith(".notify.windows.com");
}

module.exports = { isAllowedPushEndpoint, ALLOWED_PUSH_HOSTS };
