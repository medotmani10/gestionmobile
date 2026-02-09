// Removed problematic reference to vite/client to fix build error: Cannot find type definition file for 'vite/client'.
// Manual interface declarations below ensure ImportMeta and ImportMetaEnv remain correctly typed.

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
