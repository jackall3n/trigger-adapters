import { inject } from "@vercel/analytics";
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";

export default {
    extends: DefaultTheme,
    enhanceApp() {
        if (typeof window !== "undefined") {
            inject({
                mode: "production",
                debug: false,
            });
        }
    },
} satisfies Theme;
