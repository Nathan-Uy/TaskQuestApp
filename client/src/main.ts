import { createApp } from "vue";
import { createPinia } from "pinia";
import PrimeVue from "primevue/config";
import ConfirmationService from "primevue/confirmationservice";
import ToastService from "primevue/toastservice";
import Aura from "@primevue/themes/aura";
import { VueQueryPlugin } from "@tanstack/vue-query";
import router from "./router/router";
import App from "./App.vue";
import "primeicons/primeicons.css";
import "./assets/styles/main.css";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(VueQueryPlugin);
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: false,
    },
  },
});
app.use(ConfirmationService);
app.use(ToastService);
app.mount("#app");
