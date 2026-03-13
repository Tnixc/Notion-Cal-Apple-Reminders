import { installRouter } from "@/content/router";
import "@/content/routes/get-calendar-lists";
import "@/content/routes/get-events";

installRouter();
console.log("[notion-cal] Router installed");
