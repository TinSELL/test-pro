var PAIRS = [
  ['g1.ios.30tb.ai.pro.m', 'g1.ai.ultra.3months_ip_90p.acq'],
  ['g1.ios.20tb.m.v2',     'g1.20tb.3months_ip_90p.acq']
];

var url  = ($request && $request.url) || '';
var hdrs = ($response && $response.headers) || {};
var ct   = (hdrs['Content-Type'] || hdrs['content-type'] || '').toLowerCase();

var body = $response && $response.body;
if (body === null || body === undefined) body = '';
if (typeof body !== 'string') body = String(body);

var rawLen = body.length;

var found = body.match(/g1\.[A-Za-z0-9_.-]{2,60}/g) || [];
var uniq = [], seen = {};
for (var i = 0; i < found.length && uniq.length < 12; i++) {
  if (!seen[found[i]]) { seen[found[i]] = 1; uniq.push(found[i]); }
}

var hits = 0;
for (var j = 0; j < PAIRS.length; j++) {
  var parts = body.split(PAIRS[j][0]);
  if (parts.length > 1) { hits += parts.length - 1; body = parts.join(PAIRS[j][1]); }
}

var isHtml = ct.indexOf('html') >= 0 || /<\/body>/i.test(body);
if (isHtml) {
  var bar = '<div style="position:fixed;left:0;right:0;top:0;z-index:2147483647;'
    + 'background:#000;color:#0f0;font:11px/1.45 ui-monospace,Menlo,monospace;'
    + 'padding:6px 8px;white-space:pre-wrap;word-break:break-all;opacity:.93">'
    + 'G1PROBE len=' + rawLen + ' hits=' + hits + ' ids=' + found.length
    + '\nURL ' + url.replace(/[<>&]/g, function (c) { return { '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]; })
    + '\nCT  ' + (ct || '(none)')
    + '\n' + (uniq.length ? uniq.join('\n') : '(no g1.* id inside this document)')
    + '</div>';
  body = /<\/body>/i.test(body) ? body.replace(/<\/body>/i, bar + '</body>') : body + bar;
}

console.log('[G1PROBE] ' + url + ' ct=' + ct + ' len=' + rawLen + ' ids=' + found.length + ' hits=' + hits);
$done({ body: body });
