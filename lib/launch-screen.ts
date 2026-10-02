import { LOADING_LINES, LOADING_LINE_MS } from "@/lib/loading-lines";
import { serializeJsonLd } from "@/lib/seo/structured-data";
import { HINT_NAME } from "@/lib/auth/session-token";
import { ADMIN_SIGN_IN_PATH } from "@/lib/auth/admin-next-path";

export const LAUNCH_SCREEN_PATH = "/launch-screen";
export const SIGNATURE_MASK_PATH = "/brand/signature-mask.webp";

const THEMES = {
  dark: { bg: "oklch(0.14 0.008 286)", fg: "oklch(0.97 0.004 286)", muted: "oklch(0.74 0.01 286)" },
  light: { bg: "oklch(0.985 0.004 286)", fg: "oklch(0.19 0.01 286)", muted: "oklch(0.48 0.012 286)" },
};

const STYLES = `
:root{color-scheme:dark;--bg:${THEMES.dark.bg};--fg:${THEMES.dark.fg};--muted:${THEMES.dark.muted}}
:root.light{color-scheme:light;--bg:${THEMES.light.bg};--fg:${THEMES.light.fg};--muted:${THEMES.light.muted}}
html,body{margin:0;height:100%;background:var(--bg);color:var(--fg)}
body{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1.25rem;padding:0 1.5rem;text-align:center;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif}
.mark{display:block;height:3rem;aspect-ratio:540/265;background:currentColor;-webkit-mask:url(${SIGNATURE_MASK_PATH}) center/contain no-repeat;mask:url(${SIGNATURE_MASK_PATH}) center/contain no-repeat}
.spinner{display:block;width:1.75rem;height:1.75rem;border-radius:9999px;border:1px solid color-mix(in oklch,currentColor 20%,transparent);border-top-color:color-mix(in oklch,currentColor 85%,transparent);animation:spin 900ms linear infinite}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.line{margin:0;min-height:1.25rem;font-size:.875rem;line-height:1.25rem;color:var(--muted)}
.line.in{animation:line-in 320ms cubic-bezier(.2,.7,.2,1) both}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes line-in{from{opacity:0;transform:translateY(4px)}}
@media (prefers-reduced-motion:reduce){.spinner,.line.in{animation:none}}
`;

const THEME_SCRIPT = `try{if(localStorage.getItem("theme")==="light")document.documentElement.className="light"}catch(e){}`;

const LINE_SCRIPT = `(function(){
var lines=${serializeJsonLd(LOADING_LINES)};
var index=Math.floor(Math.random()*lines.length);
var el=document.getElementById("line");
function show(){el.textContent=lines[index%lines.length];el.classList.remove("in");void el.offsetWidth;el.classList.add("in")}
show();
setInterval(function(){index+=1;show()},${LOADING_LINE_MS});
var signIn=${serializeJsonLd(ADMIN_SIGN_IN_PATH)};
var signedIn=document.cookie.split("; ").indexOf(${serializeJsonLd(`${HINT_NAME}=1`)})>=0;
var here=location.pathname+location.search;
var target=signedIn||location.pathname===signIn?location.href:signIn+"?next="+encodeURIComponent(here);
if(location.pathname!==${serializeJsonLd(LAUNCH_SCREEN_PATH)})location.replace(target);
})();`;

export function launchScreenHtml(): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Hussain.Art</title>
<script>${THEME_SCRIPT}</script>
<style>${STYLES}</style>
</head>
<body>
<span class="mark" aria-hidden="true"></span>
<span class="spinner" aria-hidden="true"></span>
<span class="sr" role="status">Loading</span>
<p class="line" id="line" aria-hidden="true"></p>
<script>${LINE_SCRIPT}</script>
</body>
</html>
`;
}
