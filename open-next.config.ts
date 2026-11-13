import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// ページはすべてビルド時に生成（SSG）し、ISR の revalidate を使っていないため、
// R2 を持たずにビルド成果物をそのまま静的アセットから返す
export default defineCloudflareConfig({
	incrementalCache: staticAssetsIncrementalCache,
	enableCacheInterception: true,
});
