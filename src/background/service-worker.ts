import { NATIVE_HOST_NAME } from "@/constants";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "GET_REMINDERS") {
    Promise.all([
      chrome.runtime.sendNativeMessage(NATIVE_HOST_NAME, { action: "getReminders" }),
      chrome.storage.local.get("listColors"),
    ])
      .then(([nativeResponse, stored]) => {
        sendResponse({ ...nativeResponse, listColors: stored.listColors ?? {} });
      })
      .catch((err) => {
        console.error("[notion-cal] Native host error:", err);
        sendResponse({ success: false, error: String(err) });
      });
    return true;
  }
});
