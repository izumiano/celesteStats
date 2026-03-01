/// <reference types="vite/client" />

interface ImportMetaEnv {
	VITE_TRACE: string;
	VITE_DO_SERVER_LOG: string;
	VITE_LOG_URL: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
