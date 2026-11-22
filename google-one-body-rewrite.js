/*
 * Google One Body Rewrite — Shadowrocket http-response 脚本
 * 对应 Loon: [Body Rewrite] http-response ^https://one\.google\.com/ai\?
 * 左 = 匹配串，右 = 替换串（按原规则顺序原样照搬）
 */

var PAIRS = [
  ['g1.ios.30tb.ai.pro.m', 'g1.ai.ultra.3months_ip_90p.acq'],
  ['g1.ios.20tb.m.v2',     'g1.20tb.3months_ip_90p.acq']
];

var body = $response && $response.body;
if (body === undefined || body === null) body = '';
if (typeof body !== 'string') body = body.toString();

var hits = 0;
for (var i = 0; i < PAIRS.length; i++) {
  var from = PAIRS[i][0];
  var to = PAIRS[i][1];
  var parts = body.split(from);
  if (parts.length > 1) {
    hits += parts.length - 1;
    body = parts.join(to);
  }
}

console.log('[GoogleOneRewrite] hits=' + hits + ' len=' + body.length);
$done({ body: body });
