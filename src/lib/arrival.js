// =====================================================================
//  ARRIVAL — the ?arrive= flag on the time-travel links.
//
//  The two sites link to each other through "/future?arrive=2026" and
//  "/?arrive=2006". The parameter exists only so the destination knows
//  to play its transition; a visitor who typed the address in should
//  not sit through a warp they did not trigger.
//
//  It is read once and then removed from the address bar. Three reasons
//  that is worth the four lines: the URL a visitor sees and copies is
//  clean, a reload or a shared link does not replay the animation, and
//  the flag cannot outlive the navigation that set it.
//
//  replaceState, not pushState — this rewrites the entry that is already
//  there rather than adding one, so Back still goes to the other site.
// =====================================================================

export function consumeArrival(year) {
  const params = new URLSearchParams(location.search);
  const arrived = params.get("arrive") === String(year);

  if (params.has("arrive")) {
    params.delete("arrive");
    const query = params.toString();
    history.replaceState(null, "",
      location.pathname + (query ? "?" + query : "") + location.hash);
  }

  return arrived;
}
