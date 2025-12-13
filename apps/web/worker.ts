
export interface Env {
	ASSETS: Fetcher;
}

/**
 * MIME type mappings for common file extensions
 * Used as fallback when ASSETS binding doesn't provide Content-Type
 */
const MIME_TYPES: Record<string, string> = {
	// Text files
	'.html': 'text/html;charset=UTF-8',
	'.css': 'text/css;charset=UTF-8',
	'.js': 'application/javascript;charset=UTF-8',
	'.mjs': 'application/javascript;charset=UTF-8',
	'.json': 'application/json;charset=UTF-8',
	'.xml': 'application/xml;charset=UTF-8',
	'.txt': 'text/plain;charset=UTF-8',
	
	// Images
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.gif': 'image/gif',
	'.webp': 'image/webp',
	'.ico': 'image/x-icon',
	'.bmp': 'image/bmp',
	
	// Fonts
	'.woff': 'font/woff',
	'.woff2': 'font/woff2',
	'.ttf': 'font/ttf',
	'.otf': 'font/otf',
	'.eot': 'application/vnd.ms-fontobject',
	
	// Media
	'.mp4': 'video/mp4',
	'.webm': 'video/webm',
	'.mp3': 'audio/mpeg',
	'.wav': 'audio/wav',
	'.ogg': 'audio/ogg',
	
	// Documents
	'.pdf': 'application/pdf',
	'.zip': 'application/zip',
	'.tar': 'application/x-tar',
	'.gz': 'application/gzip',
};

/**
 * Determines the MIME type for a given file path
 * @param path - The URL pathname
 * @returns MIME type string or null if not found
 */
function getMimeType(path: string): string | null {
	const lowerPath = path.toLowerCase();
	const ext = lowerPath.substring(lowerPath.lastIndexOf('.'));
	return MIME_TYPES[ext] || null;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const response = await env.ASSETS.fetch(request);

		// Check if Content-Type header is missing
		const contentType = response.headers.get("Content-Type");
		if (!contentType) {
			const url = new URL(request.url);
			const mimeType = getMimeType(url.pathname);

			// If we found a matching MIME type, set it
			if (mimeType) {
				const newHeaders = new Headers(response.headers);
				newHeaders.set("Content-Type", mimeType);

				return new Response(response.body, {
					status: response.status,
					statusText: response.statusText,
					headers: newHeaders,
				});
			}
		}

		// Return original response if Content-Type exists or no MIME type match found
		return response;
	},
};
