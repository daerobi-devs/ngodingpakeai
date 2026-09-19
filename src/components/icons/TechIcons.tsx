import React from 'react';

// 1. Official Next.js Vector Logo
export const NextJsLogo: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 180 180" className={className} xmlns="http://www.w3.org/2000/svg">
    <circle cx="90" cy="90" r="90" fill="#000000" />
    <path
      d="M149.508 157.52L69.142 54H54V125.97H66.1136V69.3836L139.999 164.845C143.333 162.614 146.509 160.165 149.508 157.52Z"
      fill="#FFFFFF"
    />
    <path d="M115 54H127.142V126H115V54Z" fill="#FFFFFF" />
  </svg>
);

// 2. Official Node.js Hexagon Vector Logo
export const NodeJsLogo: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 256 289" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M128 0L256 73.9V215.1L128 289L0 215.1V73.9L128 0Z" fill="#5FA04E" />
    <path d="M128 73.9L192 110.8V178.2L128 215.1L64 178.2V110.8L128 73.9Z" fill="#FFFFFF" />
    <path d="M128 100L168 123V169L128 192L88 169V123L128 100Z" fill="#5FA04E" />
  </svg>
);

// 3. Official Supabase Lightning Vector Logo
export const SupabaseLogo: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 109 113" className={className} xmlns="http://www.w3.org/2000/svg">
    <path
      d="M63.7076 110.284C60.8481 113.885 55.0703 111.905 54.9809 107.314L53.9739 55.541H97.1065C104.992 55.541 109.194 64.8327 103.957 70.7397L63.7076 110.284Z"
      fill="#3ECF8E"
    />
    <path
      d="M45.297 2.71603C48.1565 -0.884877 53.9343 1.09503 54.0237 5.68593L55.0307 57.459H11.8981C4.0127 57.459 -0.189569 48.1673 5.04781 42.2603L45.297 2.71603Z"
      fill="#249361"
    />
  </svg>
);

// 4. Official Docker Whale Vector Logo
export const DockerLogo: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M13.983 11.078h1.838v1.838h-1.838v-1.838zm-2.451 0h1.838v1.838h-1.838v-1.838zm-2.451 0h1.838v1.838H9.081v-1.838zm-2.451 0h1.838v1.838H6.63v-1.838zm-2.45 0h1.838v1.838H4.18v-1.838zm7.352-2.451h1.838v1.838h-1.838V8.627zm-2.451 0h1.838v1.838H9.081V8.627zm-2.451 0h1.838v1.838H6.63V8.627zm2.451-2.451h1.838v1.838H9.081V6.176z"
      fill="#2496ED"
    />
    <path
      d="M23.953 11.884c-.426-2.189-2.022-3.085-3.52-2.923-.284-.972-.888-1.745-1.743-2.222l-.478-.266-.312.45c-.655.942-.876 2.073-.623 3.19-.665.344-1.46.544-2.408.544H.5c-.276 0-.5.224-.5.5 0 2.215.704 4.316 1.983 5.918C3.784 19.167 6.643 20.5 10 20.5c7.327 0 13.064-4.872 13.953-8.616z"
      fill="#2496ED"
    />
  </svg>
);

// 5. Official React / React Native Atom Logo
export const ReactLogo: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="-11.5 -10.23174 23 20.46348" className={className} xmlns="http://www.w3.org/2000/svg">
    <circle cx="0" cy="0" r="2.05" fill="#61DAFB" />
    <g stroke="#61DAFB" strokeWidth="1" fill="none">
      <ellipse rx="11" ry="4.2" />
      <ellipse rx="11" ry="4.2" transform="rotate(60)" />
      <ellipse rx="11" ry="4.2" transform="rotate(120)" />
    </g>
  </svg>
);

// 6. Official FastAPI Teal Lightning Logo
export const FastApiLogo: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 128 128" className={className} xmlns="http://www.w3.org/2000/svg">
    <circle cx="64" cy="64" r="64" fill="#05998B" />
    <path d="M68.5 28L36 71h25l-4.5 29L88.5 57h-25l5-29z" fill="#FFFFFF" />
  </svg>
);

// 7. Official PostgreSQL Elephant Logo
export const PostgresLogo: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 500 500" className={className} xmlns="http://www.w3.org/2000/svg">
    <path
      d="M247.6 15.6C120.3 15.6 16.7 119.2 16.7 246.5c0 102.3 66.8 189 159.2 219.8 11.5 2.1 15.7-5 15.7-11.1 0-5.5-.2-23.7-.3-42.9-64.4 14-78-27.3-78-27.3-10.5-26.7-25.7-33.8-25.7-33.8-21-14.4 1.6-14.1 1.6-14.1 23.2 1.6 35.4 23.8 35.4 23.8 20.6 35.4 54.1 25.2 67.3 19.3 2.1-15 8.1-25.2 14.7-31-51.4-5.8-105.5-25.7-105.5-114.4 0-25.3 9-46 23.8-62.2-2.4-5.8-10.3-29.4 2.3-61.3 0 0 19.4-6.2 63.7 23.8 18.5-5.1 38.3-7.7 58-7.8 19.7.1 39.5 2.7 58 7.8 44.2-30 63.6-23.8 63.6-23.8 12.7 31.9 4.8 55.5 2.4 61.3 14.8 16.2 23.8 36.9 23.8 62.2 0 88.9-54.2 108.5-105.8 114.2 8.3 7.1 15.7 21.2 15.7 42.8 0 30.9-.3 55.8-.3 63.4 0 6.2 4.2 13.3 15.9 11C416.7 435.3 483.3 348.7 483.3 246.5 483.3 119.2 379.7 15.6 247.6 15.6z"
      fill="#336791"
    />
  </svg>
);

// 8. Official Expo / EAS Logo
export const EasLogo: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="6" fill="#000020" />
    <path
      d="M5.5 17.5L12 6.5L18.5 17.5H15.5L12 11.5L8.5 17.5H5.5Z"
      fill="#FFFFFF"
    />
  </svg>
);

// 9. Official Vue.js Logo
export const VueLogo: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 261.76 226.69" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M161.096.001l-30.225 52.351L100.647.001H-.005l130.877 226.688L261.749.001z" fill="#41B883" />
    <path d="M161.096.001l-30.225 52.351L100.647.001H52.246l78.626 136.181L209.479.001z" fill="#34495E" />
  </svg>
);

// 10. Official Svelte Logo
export const SvelteLogo: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 98.1 118" className={className} xmlns="http://www.w3.org/2000/svg">
    <path
      d="M91.2 19.7C80.4 4.5 59.9-2.7 41.5 2.5c-15.6 4.4-27.8 16.4-32.3 31.7-4.1 14.1-1.3 29.5 7.6 41.2l6.9-4.8c-7.1-9.3-9.3-21.5-6-32.6 3.6-12.1 13.2-21.6 25.5-25.1 14.5-4.1 30.6 1.6 39.1 13.6 7.9 11.2 7.7 26.2-.6 37.2-2.7 3.6-6.4 6.7-10.8 9l-11.8 6.2c-5.7 3-10.4 7.2-13.6 12.3-7.5 11.9-6.8 27.4 1.7 38.6 10.8 14.2 29.6 20.2 46.8 15 13.6-4.1 24.3-14.1 28.9-27.1 4.5-12.9 2.5-27.2-5.4-38.3l-6.9 4.8c6.3 8.8 7.9 20.2 4.3 30.5-3.6 10.3-12.1 18.2-22.9 21.5-13.6 4.1-28.5-.7-37-11.9-6.7-8.9-7.3-21.1-1.3-30.5 2.5-4 6.3-7.3 10.8-9.6l11.8-6.2c5.7-3 10.5-7.3 13.8-12.5 8.7-13.7 8.3-31.5-1.1-44.8z"
      fill="#FF3E00"
    />
  </svg>
);

// 11. Official Astro Logo
export const AstroLogo: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 2L6 20h2.5l1.5-4.5h4L15.5 20H18L12 2zm-1 11l1-3.5 1 3.5h-2z"
      fill="#FF5D01"
    />
    <circle cx="12" cy="7" r="1.5" fill="#BC52EE" />
  </svg>
);

// 12. Official Flutter Logo
export const FlutterLogo: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 166 202" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M166 99.4L66.7 0H0l116.3 116.3L166 99.4z" fill="#42A5F5" />
    <path d="M166 166.7L101.4 102 66.7 136.7l64.6 64.7H166v-.7z" fill="#0D47A1" />
    <path d="M66.7 136.7L101.4 102 0 1.3V72l66.7 64.7z" fill="#42A5F5" />
  </svg>
);

// 13. Official Golang Logo
export const GoLogo: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M1.5 11.5c0-.8.7-1.5 1.5-1.5h6c.8 0 1.5.7 1.5 1.5s-.7 1.5-1.5 1.5H3c-.8 0-1.5-.7-1.5-1.5zm0-4c0-.8.7-1.5 1.5-1.5h4c.8 0 1.5.7 1.5 1.5s-.7 1.5-1.5 1.5H3c-.8 0-1.5-.7-1.5-1.5zm0 8c0-.8.7-1.5 1.5-1.5h4c.8 0 1.5.7 1.5 1.5s-.7 1.5-1.5 1.5H3c-.8 0-1.5-.7-1.5-1.5zm11.5-4c0-3.6 2.9-6.5 6.5-6.5 2.1 0 4 .1 5.5 1.8l-2 2c-.9-1-2.1-1.3-3.5-1.3-2.2 0-4 1.8-4 4s1.8 4 4 4c1.8 0 3-1 3.5-2.2H18v-2.5h6.5v8c-1.8 1.8-4.2 2.7-7 2.7-4.7 0-8.5-3.8-8.5-8.5z"
      fill="#00ADD8"
    />
  </svg>
);

// 14. Official Python Logo
export const PythonLogo: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 110 110" className={className} xmlns="http://www.w3.org/2000/svg">
    <path
      d="M54.3 0C24.4 0 26.2 13 26.2 13l.03 13.5h28.6v4.1H15s-14.7 1.7-14.7 31.6c0 29.8 12.8 28.7 12.8 28.7h7.6v-10.7s-.4-12.8 12.6-12.8h28.4s12.2-.2 12.2-12v-43S76.1 0 54.3 0zm-15.6 8.3c2.7 0 4.9 2.2 4.9 4.9s-2.2 4.9-4.9 4.9-4.9-2.2-4.9-4.9 2.2-4.9 4.9-4.9z"
      fill="#3776AB"
    />
    <path
      d="M55.7 110c29.9 0 28.1-13 28.1-13l-.03-13.5H55.2v-4.1h39.8s14.7-1.7 14.7-31.6c0-29.8-12.8-28.7-12.8-28.7h-7.6v10.7s.4 12.8-12.6 12.8H48.3s-12.2.2-12.2 12v43s-2.2 12.4 19.6 12.4zm15.6-8.3c-2.7 0-4.9-2.2-4.9-4.9s2.2-4.9 4.9-4.9 4.9 2.2 4.9 4.9-2.2 4.9-4.9 4.9z"
      fill="#FFD43B"
    />
  </svg>
);

// 15. Official Laravel Logo
export const LaravelLogo: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M20.9 6.2l-8.6-5a.6.6 0 00-.6 0L3.1 6.2a.6.6 0 00-.3.5v10.6a.6.6 0 00.3.5l8.6 5a.6.6 0 00.6 0l8.6-5a.6.6 0 00.3-.5V6.7a.6.6 0 00-.3-.5zM12 2.3l7.5 4.4L12 11.1 4.5 6.7 12 2.3zm-8 5.6l7.4 4.3v8.7L4 16.6V7.9zm9.2 13V12.2l7.4-4.3v8.7l-7.4 4.3z"
      fill="#FF2D20"
    />
  </svg>
);

// 16. Official MySQL Logo
export const MySqlLogo: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"
      fill="#00758F"
    />
    <path d="M12 6a6 6 0 00-6 6c0 2.22 1.21 4.16 3 5.2V15a4 4 0 01-1-3 4 4 0 014-4 4 4 0 014 4c0 1.1-.45 2.1-1.17 2.83l1.41 1.41A6 6 0 0012 6z" fill="#F29111" />
  </svg>
);

// 17. Official MongoDB Logo
export const MongoLogo: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 1.5c-4.5 5.5-7 9.5-7 13.5 0 4.2 3.2 7.5 7 7.5s7-3.3 7-7.5c0-4-2.5-8-7-13.5z"
      fill="#47A248"
    />
    <path
      d="M12 22.5c-.2 0-.4 0-.6-.1 0 0-3.4-3.5-3.4-8 0-3.5 2-7.1 4-9.9v18z"
      fill="#13AA52"
    />
  </svg>
);

// 18. Official SQLite Logo
export const SqliteLogo: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 2C6.5 2 2 4.5 2 7.5v9C2 19.5 6.5 22 12 22s10-2.5 10-5.5v-9C22 4.5 17.5 2 12 2zm0 3c4.4 0 8 1.8 8 2.5s-3.6 2.5-8 2.5-8-1.8-8-2.5 3.6-2.5 8-2.5zm0 14c-4.4 0-8-1.8-8-2.5v-2.1c2 .9 4.8 1.6 8 1.6s6-.7 8-1.6v2.1c0 .7-3.6 2.5-8 2.5z"
      fill="#003B57"
    />
    <circle cx="12" cy="7.5" r="2" fill="#00A2ED" />
  </svg>
);

// 19. Official Redis Logo
export const RedisLogo: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M21.5 6.5L12 1.5 2.5 6.5l9.5 5 9.5-5zm0 5.5L12 17l-9.5-5v3.5l9.5 5 9.5-5V12zm0-2.8l-9.5 5-9.5-5 1.5-.8 8 4.2 8-4.2 1.5.8z"
      fill="#DC382D"
    />
  </svg>
);

// 20. Official Cloudflare Logo
export const CloudflareLogo: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M18.6 11.2c-.4-2.8-2.8-5-5.7-5-2.2 0-4.1 1.2-5.1 3-.3 0-.5-.1-.8-.1-2.2 0-4 1.8-4 4 0 .3 0 .5.1.7C1.3 14.3 0 15.9 0 18c0 2.8 2.2 5 5 5h13.5c3 0 5.5-2.5 5.5-5.5 0-2.8-2.1-5.1-4.9-5.4-.1-.3-.3-.6-.5-.9z"
      fill="#F38020"
    />
    <path d="M18.5 13H7c-.6 0-1 .4-1 1s.4 1 1 1h11.5c.6 0 1-.4 1-1s-.4-1-1-1z" fill="#FAAD3F" />
  </svg>
);

// 21. Official AWS Logo
export const AwsLogo: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M18.5 14.5c-2.8 2-6.5 3-10.2 3-4.8 0-9.2-1.7-12.8-4.5-.3-.2-.1-.6.3-.5 3.5 1.4 7.4 2.2 11.5 2.2 3.4 0 7.1-.7 10.5-2.2.4-.2.9.2.7.6zm3.3-1.6c-.4-.5-2.5-.2-3.8.3-.3.1-.4-.1-.1-.3 1.8-1.3 4.7-1.1 5.3-.3.5.7-.3 3.6-2.1 5.2-.2.2-.4.1-.3-.2.5-1.2 1.3-3.9 1-4.7z"
      fill="#FF9900"
    />
    <path
      d="M6.8 5.7L4.5 13h2.3l.5-1.8h2.6l.5 1.8h2.3L10.4 5.7H6.8zm1.2 4.1l.7-2.6.7 2.6H8z"
      fill="#232F3E"
    />
  </svg>
);

// 22. Official Kubernetes Logo
export const K8sLogo: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 2L2 7.8v9.9L12 23.5l10-5.8V7.8L12 2zm0 3.3l6.5 3.8v7.5L12 20.3l-6.5-3.7V9.1L12 5.3z"
      fill="#326CE5"
    />
    <circle cx="12" cy="12" r="3" fill="#326CE5" />
  </svg>
);
