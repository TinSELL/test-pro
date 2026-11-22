/*
 * Google One ID 扫描器 — 观察模式
 *
 * 作用：扫 one.google.com 所有解密后的响应体，把里面出现的 g1.* 令牌全部列出来，
 *       用 iOS 通知推送给你。谁命中了、命中在哪个 URL、ID 长什么样，一次看清。
 *
 * 关键安全属性：全程 $done({}) —— 一个字节都不改。页面坏不了。
 *
 * 引擎：Shadowrocket  [Script] http-response + requires-body
 */

(function () {
  var STORE_KEY = "g1scan_last_v1";

  // g1.xxx.yyy.zzz 形式，允许下划线和数字，长度放宽
  var RE_ID = /\bg1\.[a-z0-9_]{1,24}(?:\.[a-z0-9_]{1,40}){1,6}\b/gi;

  function notify(title, subtitle, body) {
    try {
      $notification.post(
        String(title).slice(0, 60),
        String(subtitle).slice(0, 120),
        String(body).slice(0, 300)
      );
    } catch (e) {}
  }

  function shortUrl(u) {
    return String(u || "")
      .replace(/^https:\/\/one\.google\.com/, "")
      .replace(/[?&](f\.sid|bl|soc-app|soc-platform|soc-device|_reqid|rt|otzr|dm|hl)=[^&]*/g, "")
      .replace(/\?$/, "");
  }

  try {
    var url = ($request && $request.url) || "(no request)";
    var body = ($response && $response.body) || "";

    if (typeof body !== "string" || !body.length) {
      $done({});
      return;
    }

    var found = body.match(RE_ID) || [];
    var uniq = [];
    for (var i = 0; i < found.length; i++) {
      var id = String(found[i]).toLowerCase();
      if (uniq.indexOf(id) === -1) uniq.push(id);
    }

    if (uniq.length) {
      var sig = shortUrl(url) + "|" + uniq.join(",");
      var prev = "";
      try { prev = $persistentStore.read(STORE_KEY) || ""; } catch (e) {}

      if (sig !== prev) {
        try { $persistentStore.write(sig, STORE_KEY); } catch (e) {}
        notify(
          "Google One 命中 " + uniq.length + " 个 ID",
          shortUrl(url),
          uniq.join("  ")
        );
      }
    }

    $done({});
  } catch (e) {
    $done({});
  }
})();
