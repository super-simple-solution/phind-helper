export {}

declare global {
  interface FetchOptions {
    resource: string
    options: RequestInit
  }
}
