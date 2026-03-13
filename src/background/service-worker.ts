const API_BASE = "https://calendar-api.notion.so/";

chrome.webRequest.onCompleted.addListener(
  (details) => {
    console.log("[notion-cal] Request completed:", details.url);
  },
  { urls: [`${API_BASE}*`] },
);

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "NOTION_EVENTS_INTERCEPTED") {
    console.log("[notion-cal] Intercepted events:", message.payload);
    // TODO: process events and sync to Apple Reminders
  }
  sendResponse({ ok: true });
  return true;
});
