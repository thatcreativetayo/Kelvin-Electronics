const read = (value: string | undefined) => (value && value.trim().length > 0 ? value.trim() : undefined);

export const siteUrl = read(process.env.NEXT_PUBLIC_SITE_URL) ?? "http://localhost:3000";

export const sanityEnv = {
  projectId: read(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID),
  dataset: read(process.env.NEXT_PUBLIC_SANITY_DATASET),
  apiVersion: read(process.env.NEXT_PUBLIC_SANITY_API_VERSION) ?? "2025-01-01",
  readToken: read(process.env.SANITY_API_READ_TOKEN),
  studioUrl: read(process.env.NEXT_PUBLIC_SANITY_STUDIO_URL) ?? "/studio",
};

export const supabaseEnv = {
  url: read(process.env.NEXT_PUBLIC_SUPABASE_URL),
  anonKey: read(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  serviceRoleKey: read(process.env.SUPABASE_SERVICE_ROLE_KEY),
};

export const cloudinaryEnv = {
  cloudName: read(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME),
  apiKey: read(process.env.CLOUDINARY_API_KEY),
  apiSecret: read(process.env.CLOUDINARY_API_SECRET),
  uploadFolder: read(process.env.CLOUDINARY_UPLOAD_FOLDER) ?? "cloud/products",
};

export const integrations = {
  sanity: Boolean(sanityEnv.projectId && sanityEnv.dataset),
  sanityWritable: Boolean(sanityEnv.projectId && sanityEnv.dataset && sanityEnv.readToken),
  supabase: Boolean(supabaseEnv.url && supabaseEnv.anonKey),
  supabaseAdmin: Boolean(supabaseEnv.url && supabaseEnv.serviceRoleKey),
  cloudinary: Boolean(cloudinaryEnv.cloudName && cloudinaryEnv.apiKey && cloudinaryEnv.apiSecret),
};

/** Everything a production checkout needs before it may accept an order. */
export const checkoutRequirements = [
  { key: "NEXT_PUBLIC_SUPABASE_URL", ready: Boolean(supabaseEnv.url) },
  { key: "SUPABASE_SERVICE_ROLE_KEY", ready: Boolean(supabaseEnv.serviceRoleKey) },
  { key: "PAYMENT_PROVIDER_SECRET_KEY", ready: Boolean(read(process.env.PAYMENT_PROVIDER_SECRET_KEY)) },
];

export const checkoutConfigured = checkoutRequirements.every((item) => item.ready);
