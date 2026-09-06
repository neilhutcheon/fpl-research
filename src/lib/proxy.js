export const PROXY_TARGETS = [
  {
    prefix: "/api/fpl",
    origin: "https://fantasy.premierleague.com",
    replaceWith: "/api",
  },
  {
    prefix: "/api/draft",
    origin: "https://draft.premierleague.com",
    replaceWith: "/api",
  },
];

export function resolveProxy(pathname) {
  for (const rule of PROXY_TARGETS) {
    if (pathname === rule.prefix || pathname.startsWith(`${rule.prefix}/`)) {
      return {
        origin: rule.origin,
        pathname: `${rule.replaceWith}${pathname.slice(rule.prefix.length)}`,
      };
    }
  }
  return null;
}
