// RaceAtlas browser-only Supabase project configuration.
// Only browser-safe publishable credentials are exposed here. Never use service_role.
// Public account UI is enabled; Auth redirect allowlist and SMTP delivery still require
// an independent live magic-link smoke test before declaring end-to-end email login verified.
window.RACEATLAS_ACCOUNT_CONFIG={
  enabled:true,
  previewEnabled:true,
  supabaseUrl:'https://lpzndnxloykcthbsqcet.supabase.co',
  publishableKey:'sb_publishable_AE_Qr8VLmWb2020QCOEAKQ_Nl5mZ5Sw'
};
