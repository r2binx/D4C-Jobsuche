import App from "@/App.vue";
import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import routes from "~pages";
import { JobsStore } from "./store/jobs";

const router = createRouter({
	history: createWebHistory(),
	routes,
});

createApp(App).provide("jobsStore", new JobsStore()).use(router).mount("#app");
