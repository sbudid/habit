declare module '#auth-utils' {
  interface User {
    id: number;
    login: string;
    name?: string | null;
    email?: string | null;
    bio?: string | null;
    avatar_url?: string | null;
    html_url?: string | null;
    type?: string | null;

    // GitHub OAuth still works if you decide to keep it for dev/admin.
    node_id?: string;
    gravatar_id?: string;
    url?: string;
    followers_url?: string;
    following_url?: string;
    gists_url?: string;
    starred_url?: string;
    subscriptions_url?: string;
    organizations_url?: string;
    repos_url?: string;
    events_url?: string;
    received_events_url?: string;
    user_view_type?: string;
    site_admin?: boolean;
    company?: string | null;
    blog?: string;
    location?: string;
    hireable?: boolean;
    twitter_username?: string;
    notification_email?: string;
    public_repos?: number;
    public_gists?: number;
    followers?: number;
    following?: number;
    created_at?: string;
    updated_at?: string;
  }
}

export {};
