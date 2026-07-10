declare module '#auth-utils' {
  interface User {
    login: string;
    id: number;
    name?: string;
    avatar_url?: string;
    bio?: string;
  }

  interface UserSession {
    loggedInAt?: string;
  }
}
export {};
