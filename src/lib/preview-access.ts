// Page access only: never use this flag to authorize backend requests.
// Vite replaces DEV with false in published production builds.
export const previewAccess = import.meta.env.DEV;