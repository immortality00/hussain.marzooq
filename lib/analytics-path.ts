// A public gallery's address carries its key (/g/<slug>/<key>). GoatCounter records the
// full path and referrer, so both are cut back to /g/<slug> before they leave the browser.
export const GALLERY_LINK_PATH = /^((?:https?:\/\/[^/]+)?\/g\/[^/?#]+)\/[^?#]*/;

export function countedPath(path: string) {
  return path.replace(GALLERY_LINK_PATH, "$1");
}

// JSON.stringify leaves characters that mean something inside an HTML <script> block
// (`<`, `>`) or end a JavaScript line (U+2028/2029); each is written as a \u escape so
// the literal reads the same and can never close the tag or break the line.
const SCRIPT_ESCAPES: Record<string, string> = {
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "\t": "\\t",
  "\0": "\\u0000",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029",
  '"': '\\"',
};

export function scriptStringLiteral(value: string) {
  return `"${value.replace(/[<>/\\\b\f\n\r\t\0\u2028\u2029"]/g, (c) => SCRIPT_ESCAPES[c])}"`;
}

// GoatCounter reads `window.goatcounter.path` / `.referrer` (functions get the value it
// would send) each time it counts; this runs before count.js loads.
export const GOATCOUNTER_SETTINGS_SCRIPT = `(function(){var p=new RegExp(${scriptStringLiteral(GALLERY_LINK_PATH.source)});var cut=function(v){return v?String(v).replace(p,"$1"):v};window.goatcounter=Object.assign(window.goatcounter||{},{path:cut,referrer:cut});})();`;
