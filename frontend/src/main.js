import App from "@/App.vue";
import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import routes from "~pages";
import { AwsAuthService } from "./lib/AwsAuthService.ts";
import { AssociativeStore } from "./store/associativeStore";
import { IndexStore } from "./store/indexStore";

const router = createRouter({
	history: createWebHistory(),
	routes,
});

const app = createApp(App);
app.provide("jobResultStore", new IndexStore());
app.provide("jobDetailStore", new AssociativeStore());
const authService = new AwsAuthService();
app.provide("AwsAuthService", authService);
app.use(router).mount("#app");
authService.init();
