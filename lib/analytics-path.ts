// A public gallery's address carries its key (/g/<slug>/<key>). GoatCounter records the
// full path and referrer, so both are cut back to /g/<slug> before they leave the browser.
export const GALLERY_LINK_PATH = /^((?:https?:\/\/[^/]+)?\/g\/[^/?#]+)\/[^?#]*/;

export function countedPath(path: string) {
  return path.replace(GALLERY_LINK_PATH, "$1");
}

// GoatCounter reads `window.goatcounter.path` / `.referrer` (functions get the value it
// would send) each time it counts; this runs before count.js loads.
export const GOATCOUNTER_SETTINGS_SCRIPT = `(function(){var p=new RegExp(${JSON.stringify(GALLERY_LINK_PATH.source)});var cut=function(v){return v?String(v).replace(p,"$1"):v};window.goatcounter=Object.assign(window.goatcounter||{},{path:cut,referrer:cut});})();`;
