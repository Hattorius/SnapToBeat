import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		fs: {
			allow: ["./static/assets"]
		},
		allowedHosts: [
			"a82ea4f71e01.ngrok-free.app"
		]
	}
});
