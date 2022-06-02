import App from "@/App.vue";
import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import routes from "~pages";
import { Jobs } from "./store/jobs";

const router = createRouter({
	history: createWebHistory(),
	routes,
});

const app = createApp(App);
const jobsStore = new Jobs();
app.provide("jobsStore", jobsStore);

app.use(router);
app.mount("#app");
