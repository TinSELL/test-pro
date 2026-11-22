(function () {

  var DEBUG_BANNER = false;   // 排查时改 true
  var PAIRS = [
    ['g1.ios.30tb.ai.pro.m', 'g1.ai.ultra.3months_ip_90p.acq'],
    ['g1.ios.20tb.m.v2',     'g1.20tb.3months_ip_90p.acq']
  ];

  function bail(why) {
    console.log('[G1] pass-through: ' + why);
    try { $done({}); } catch (e) {}
  }

  try {
    var res  = $response || {};
    var url  = ($request && $request.url) || '';
    var hdrs = res.headers || {};
    var ct   = String(hdrs['Content-Type'] || hdrs['content-type'] || '').toLowerCase();
    var body = res.body;

    if (body === null || body === undefined) return bail('empty body');
    if (typeof body !== 'string') body = String(body);
    if (!body.length) return bail('zero length');

    // 二进制/压缩残留：一个字都不要碰
    if (/[\u0000-\u0008\u000e-\u001f]/.test(body.slice(0, 512))) return bail('binary body');

    var orig = body;
    var hits = 0;
    for (var i = 0; i < PAIRS.length; i++) {
      var parts = body.split(PAIRS[i][0]);
      if (parts.length > 1) { hits += parts.length - 1; body = parts.join(PAIRS[i][1]); }
    }

    var injected = false;
    if (DEBUG_BANNER) {
      var isHtml = ct.indexOf('html') >= 0 || (/<html[\s>]/i.test(body) && /<\/body>/i.test(body));
      if (isHtml) {
        var ids = (orig.match(/g1\.[A-Za-z0-9_.-]{2,60}/g) || []);
        var uniq = [], seen = {};
        for (var j = 0; j < ids.length && uniq.length < 12; j++) {
          if (!seen[ids[j]]) { seen[ids[j]] = 1; uniq.push(ids[j]); }
        }
        var bar = '<div style="position:fixed;left:0;right:0;top:0;z-index:2147483647;'
          + 'background:#000;color:#0f0;font:11px/1.45 ui-monospace,Menlo,monospace;'
          + 'padding:6px 8px;white-space:pre-wrap;word-break:break-all;opacity:.93">'
          + 'G1PROBE len=' + orig.length + ' hits=' + hits + ' ids=' + ids.length
          + '\nURL ' + url.replace(/[<>&]/g, function (c) { return { '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]; })
          + '\nCT  ' + (ct || '(none)')
          + '\n' + (uniq.length ? uniq.join('\n') : '(no g1.* id inside this document)')
          + '</div>';
        body = body.replace(/<\/body>/i, bar + '</body>');
        injected = true;
      }
    }

    if (!hits && !injected) return bail('nothing to change');

    console.log('[G1] ok url=' + url + ' hits=' + hits + ' banner=' + injected);
    $done({ body: body });

  } catch (e) {
    bail('exception: ' + e);
  }

})();
