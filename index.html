<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Mine Minerals — Operations Platform</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{--navy:#0f1923;--navy2:#1a2a3a;--gold:#c8a45a;--gold2:#e8c47a;--border:#e2e8f0;--bg:#f4f6f9;--surface:#fff;--text:#1a202c;--muted:#718096;--green:#276749;--green-bg:#f0fff4;--amber:#92400e;--amber-bg:#fffbeb;--red:#9b1c1c;--red-bg:#fff5f5;--blue:#1e3a5f;--blue-bg:#ebf4ff;--purple:#44337a;--purple-bg:#faf5ff;--purple-border:#d6bcfa;--r:6px;--rlg:10px}
body{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--text);font-size:13px}
#login{display:flex;align-items:center;justify-content:center;min-height:100vh;background:var(--navy);padding:20px}
.lcard{background:#fff;border-radius:16px;padding:40px;width:400px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.3)}
.llogo{width:64px;height:64px;object-fit:contain;border-radius:8px;margin:0 auto 16px}
.lco{font-size:16px;font-weight:600;color:var(--navy);margin-bottom:2px}
.ltag{font-size:10px;color:var(--gold);font-weight:600;letter-spacing:.08em;text-transform:uppercase;margin-bottom:24px}
.ldiv{height:1px;background:var(--border);margin:20px 0}
.fr{margin-bottom:11px;text-align:left}
.fr label{display:block;font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.07em;margin-bottom:4px}
.fr input{width:100%;font-family:'DM Sans',sans-serif;font-size:13px;padding:9px 11px;border:1.5px solid var(--border);border-radius:var(--r);outline:none}
.fr input:focus{border-color:var(--navy)}
.lbtn{width:100%;padding:11px;background:var(--navy);color:#fff;border:none;border-radius:var(--r);font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;cursor:pointer;margin-top:4px}
.lbtn:hover{background:var(--navy2)}
.lerr{background:var(--red-bg);border:1px solid #fed7d7;color:var(--red);border-radius:var(--r);padding:9px 12px;font-size:12px;margin-top:10px;display:none;text-align:left}
#app{display:none}
.wrap{max-width:1600px;margin:0 auto;padding:14px}
.hdr{background:var(--navy);display:flex;align-items:stretch;min-height:56px;border-radius:10px 10px 0 0;overflow:hidden}
.hdr-brand{background:var(--navy2);padding:0 18px;display:flex;align-items:center;gap:11px;border-right:1px solid rgba(255,255,255,.07)}
.hdr-logo{width:36px;height:36px;object-fit:contain;border-radius:4px}
.hdr-name{color:#fff;font-size:12px;font-weight:600}
.hdr-sub{color:var(--gold);font-size:10px}
.hdr-mid{flex:1;display:flex;align-items:center;padding:0 18px;gap:10px}
.hdr-tag{background:rgba(200,164,90,.12);border:1px solid rgba(200,164,90,.25);color:var(--gold2);font-size:10px;font-weight:600;padding:3px 10px;border-radius:20px;letter-spacing:.06em;text-transform:uppercase}
.hdr-date{color:rgba(255,255,255,.35);font-size:11px;font-family:'DM Mono',monospace;margin-left:auto}
.hdr-right{display:flex;align-items:center;gap:12px;padding:0 16px;border-left:1px solid rgba(255,255,255,.07)}
.sdot{width:7px;height:7px;border-radius:50%;background:#38a169}
.sdot.syncing{background:var(--gold);animation:blink 1s infinite}
.sdot.err{background:#fc8181}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
.slbl{font-size:10px;color:rgba(255,255,255,.45);font-family:'DM Mono',monospace}
.hdr-uname{color:#fff;font-size:12px;font-weight:500}
.hdr-urole{color:rgba(255,255,255,.4);font-size:10px}
.btn-out{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);color:rgba(255,255,255,.6);font-family:'DM Sans',sans-serif;font-size:11px;padding:5px 12px;border-radius:var(--r);cursor:pointer}
.btn-out:hover{background:rgba(255,255,255,.14);color:#fff}
.nav{background:#fff;border-bottom:2px solid var(--border);display:flex;overflow-x:auto;padding:0 6px}
.nbtn{font-family:'DM Sans',sans-serif;font-size:12px;font-weight:500;padding:0 15px;height:43px;border:none;background:none;cursor:pointer;color:var(--muted);border-bottom:2px solid transparent;margin-bottom:-2px;white-space:nowrap;display:flex;align-items:center;gap:6px}
.nbtn:hover{color:var(--text)}
.nbtn.active{color:var(--navy);border-bottom-color:var(--navy);font-weight:600}
.npip{width:6px;height:6px;border-radius:50%;background:var(--gold);display:none}
.nbtn.active .npip{display:block}
.body{background:var(--bg);padding:17px;border:1px solid var(--border);border-top:none;border-radius:0 0 10px 10px;min-height:480px}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin-bottom:16px}
.kpi{background:#fff;border:1px solid var(--border);border-radius:var(--rlg);padding:13px 15px;position:relative;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.05)}
.kpi::after{content:'';position:absolute;top:0;left:0;right:0;height:3px}
.kpi.cn::after{background:var(--navy)}.kpi.cg::after{background:#38a169}.kpi.cr::after{background:#e53e3e}.kpi.ca::after{background:#d69e2e}.kpi.cb::after{background:#3182ce}.kpi.cgo::after{background:var(--gold)}
.kpi-l{font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.07em;margin-bottom:6px}
.kpi-v{font-size:20px;font-weight:600;font-family:'DM Mono',monospace;line-height:1}
.kpi-s{font-size:10px;color:var(--muted);margin-top:4px}
.card{background:#fff;border:1px solid var(--border);border-radius:var(--rlg);margin-bottom:13px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.05)}
.card-hd{padding:12px 17px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;background:#fafbfc}
.card-hd h3{font-size:13px;font-weight:600;color:var(--navy)}
.card-hd-r{display:flex;gap:7px;align-items:center;flex-wrap:wrap}
.toolbar{padding:9px 17px;border-bottom:1px solid var(--border);display:flex;gap:7px;flex-wrap:wrap;align-items:center;background:#fcfcfd}
.toolbar input,.toolbar select{font-family:'DM Sans',sans-serif;font-size:12px;padding:5px 9px;border:1px solid var(--border);border-radius:var(--r);background:#fff;color:var(--text);outline:none}
.toolbar input{flex:1;min-width:130px}
.toolbar input:focus,.toolbar select:focus{border-color:var(--navy)}
.btn{font-family:'DM Sans',sans-serif;font-size:12px;font-weight:500;padding:5px 13px;border-radius:var(--r);cursor:pointer;border:1px solid var(--border);background:#fff;color:var(--text);white-space:nowrap;display:inline-flex;align-items:center;gap:4px}
.btn:hover{background:#f1f5f9}
.btn-p{background:var(--navy);color:#fff;border-color:var(--navy)}.btn-p:hover{background:var(--navy2)}
.btn-e{background:var(--navy2);color:#fff;border-color:var(--navy2);font-size:11px;padding:4px 11px}.btn-e:hover{background:var(--navy)}
.btn-won{background:#276749;color:#fff;border-color:#276749;font-size:10px;padding:3px 8px}
.btn-won:hover{background:#1e5238}
.btn-sm{font-size:11px;padding:3px 9px}
.btn-g{background:none;border:none;padding:3px 6px;color:var(--muted);cursor:pointer;border-radius:4px;font-size:14px}.btn-g:hover{background:var(--bg);color:var(--text)}
.btn-d{background:none;border:none;padding:3px 6px;color:#fc8181;cursor:pointer;border-radius:4px;font-size:14px}.btn-d:hover{background:var(--red-bg);color:var(--red)}
.tw{overflow-x:auto;overflow-y:auto;max-height:520px}
.tw-compact table{min-width:auto;width:100%}
.tw-compact th{padding:8px 7px;font-size:10px}
.tw-compact td{padding:7px 7px;font-size:11px}
.tw-compact .badge{padding:1px 5px;font-size:9px}
.sticky-col{position:sticky;right:0;background:#fff;box-shadow:-2px 0 4px rgba(0,0,0,.06)}
tr:hover .sticky-col{background:#f8fafc}
table{width:100%;border-collapse:collapse;font-size:12px;table-layout:auto}
.tw table{min-width:900px}
th{text-align:left;font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.07em;padding:10px 16px;border-bottom:1px solid var(--border);background:#fafbfc;white-space:nowrap;position:sticky;top:0;z-index:2}
td{padding:10px 16px;border-bottom:1px solid #f0f2f5;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;vertical-align:middle}
tr:last-child td{border-bottom:none}
tr:hover td{background:#f8fafc}
.mono{font-family:'DM Mono',monospace;font-size:11px}
.badge{display:inline-flex;align-items:center;padding:2px 7px;border-radius:20px;font-size:10px;font-weight:700;letter-spacing:.04em;white-space:nowrap;border:1px solid transparent}
.b-lead{background:var(--blue-bg);color:var(--blue);border-color:#bee3f8}
.b-quoted{background:var(--amber-bg);color:var(--amber);border-color:#fcd34d}
.b-won{background:var(--green-bg);color:var(--green);border-color:#c6f6d5}
.b-lost{background:var(--red-bg);color:var(--red);border-color:#fed7d7}
.b-open{background:var(--blue-bg);color:var(--blue);border-color:#bee3f8}
.b-prog{background:var(--amber-bg);color:var(--amber);border-color:#fcd34d}
.b-done{background:var(--green-bg);color:var(--green);border-color:#c6f6d5}
.b-inv{background:#f7fafc;color:#4a5568;border-color:#e2e8f0}
.b-paid{background:var(--green-bg);color:var(--green);border-color:#c6f6d5}
.b-out{background:var(--amber-bg);color:var(--amber);border-color:#fcd34d}
.b-bu{background:var(--purple-bg);color:var(--purple);border-color:var(--purple-border);font-size:10px}
.b-recv{background:var(--green-bg);color:var(--green);border-color:#c6f6d5}
.b-pend{background:var(--amber-bg);color:var(--amber);border-color:#fcd34d}
.sla-ok{color:#276749;font-weight:700;font-family:'DM Mono',monospace;font-size:11px}
.sla-warn{color:#d97706;font-weight:700;font-family:'DM Mono',monospace;font-size:11px}
.sla-late{color:#c53030;font-weight:700;font-family:'DM Mono',monospace;font-size:11px}
.pp{color:#276749;font-weight:600;font-family:'DM Mono',monospace;font-size:11px}
.pn{color:#c53030;font-weight:600;font-family:'DM Mono',monospace;font-size:11px}
.ob{color:#c53030;font-weight:600}
.mov{position:fixed;inset:0;background:rgba(10,18,26,.6);z-index:1000;display:flex;align-items:center;justify-content:center;padding:16px}
.mbox{background:#fff;border-radius:12px;padding:22px;width:100%;max-width:500px;box-shadow:0 20px 60px rgba(0,0,0,.2);max-height:92vh;overflow-y:auto}
.mtitle{font-size:14px;font-weight:600;color:var(--navy);margin-bottom:15px;padding-bottom:12px;border-bottom:1px solid var(--border)}
.f2{display:grid;grid-template-columns:1fr 1fr;gap:9px}
.mfr{margin-bottom:11px}
.mfr label{display:block;font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.07em;margin-bottom:4px}
.mfr input,.mfr select,.mfr textarea{width:100%;font-family:'DM Sans',sans-serif;font-size:12px;padding:7px 10px;border:1.5px solid var(--border);border-radius:var(--r);outline:none}
.mfr input:focus,.mfr select:focus,.mfr textarea:focus{border-color:var(--navy)}
.mfr textarea{height:52px;resize:vertical}
.mfoot{display:flex;justify-content:flex-end;gap:7px;margin-top:17px;padding-top:13px;border-top:1px solid var(--border)}
.cov{position:fixed;inset:0;background:rgba(10,18,26,.6);z-index:2000;display:flex;align-items:center;justify-content:center;padding:16px}
.cbox{background:#fff;border-radius:12px;padding:22px;width:340px;box-shadow:0 20px 60px rgba(0,0,0,.2)}
.cbox h4{font-size:14px;font-weight:600;color:var(--navy);margin-bottom:7px}
.cbox p{font-size:12px;color:var(--muted);margin-bottom:18px;line-height:1.6}
.cbtns{display:flex;gap:7px;justify-content:flex-end}
.btn-del{background:var(--red-bg);color:var(--red);border:1px solid #fed7d7}.btn-del:hover{background:#fed7d7}
#toast{position:fixed;bottom:18px;right:18px;padding:10px 16px;border-radius:8px;font-size:12px;font-weight:500;z-index:9999;opacity:0;transition:opacity .25s,transform .25s;pointer-events:none;transform:translateY(6px);box-shadow:0 4px 16px rgba(0,0,0,.15)}
#toast.show{opacity:1;transform:translateY(0)}
#toast.ts{background:#276749;color:#fff}
#toast.te{background:#9b1c1c;color:#fff}
#toast.ti{background:var(--navy);color:#fff}
.empty{text-align:center;padding:32px;color:#a0aec0;font-size:12px}
.alert-a{background:var(--amber-bg);border:1px solid #fcd34d;border-radius:var(--r);padding:10px 15px;margin-bottom:13px;display:flex;align-items:center;justify-content:space-between;gap:9px;flex-wrap:wrap;font-size:12px;font-weight:500;color:var(--amber)}
.info-box{background:#f4f6f9;border-radius:6px;padding:11px;margin-bottom:11px;font-size:12px}
.info-box-title{font-weight:600;margin-bottom:5px;color:#0f1923}
.info-box-sub{color:#718096}
</style>
</head>
<body>
<div id="toast"></div>
<div id="login">
  <div class="lcard">
    <img class="llogo" src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAARCAAoACgDASIAAhEBAxEB/8QAGgAAAgMBAQAAAAAAAAAAAAAAAAMBBAUCBv/EACkQAAIBBAEEAQQDAQAAAAAAAAECAAMRBBIhMUFRBSJhcROBkbHR/8QAGAEAAwEBAAAAAAAAAAAAAAAAAAECAwT/xAAhEQACAgICAgMAAAAAAAAAAAAAAQIREiExA0FRsf/aAAwDAQACEQMRAD8A7zRWK8bmpxr3YHWkxNw3PVUB3YkgCZ0eMYJCqSSdADzM/I+R+O47bQE3LrqPf1MfNWjXvgLCk7Gxv3qY2cqrHQXc23fME/bHLbLo4gg18AzHkyWEY5bKbMnXJQfGiGVsU0bixcJJJIHgSv1nksHHWx+bFuBUafmF0E1vff5mSi2V7s9L69CbDhPOuR3OFjV81/y+LNbqhHWrHRHpIHv5m3icZbl51bfVhbqKQdlve/B9j0mzgFuLYVLjBn3sgEbHoPExLALVJEL2P73Gl6QhO/UZHE4e5a4q1RDKG10knsB8dZ9LjNFkiDoCR9TbF57w+Tz0hTqbbGZfN2+TXNX62lNKCoBqRBQBc11ULG7jbv5X0/6Z5YmpVwTa/xL8ZRQAqgADoAJzQhCqC0Xt+TMlpJdFkH4Y//2Q==" alt="MM">
    <div class="lco">Mine Minerals Supplies &amp; Services</div>
    <div class="ltag">Operations Platform</div>
    <div class="ldiv"></div>
    <div class="fr"><label>Username</label><input type="text" id="lu" placeholder="Enter username" autocomplete="username"></div>
    <div class="fr"><label>Password</label><input type="password" id="lp" placeholder="Enter password" autocomplete="current-password"></div>
    <button class="lbtn" id="loginBtn">Sign in</button>
    <div class="lerr" id="lerr">Incorrect username or password.</div>
  </div>
</div>
<div id="app">
<div class="wrap">
  <div class="hdr">
    <div class="hdr-brand">
      <img class="hdr-logo" src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAARCAAoACgDASIAAhEBAxEB/8QAGgAAAgMBAQAAAAAAAAAAAAAAAAMBBAUCBv/EACkQAAIBBAEEAQQDAQAAAAAAAAECAAMRBBIhMUFRBSJhcROBkbHR/8QAGAEAAwEBAAAAAAAAAAAAAAAAAAECAwT/xAAhEQACAgICAgMAAAAAAAAAAAAAAQIREiExA0FRsf/aAAwDAQACEQMRAD8A7zRWK8bmpxr3YHWkxNw3PVUB3YkgCZ0eMYJCqSSdADzM/I+R+O47bQE3LrqPf1MfNWjXvgLCk7Gxv3qY2cqrHQXc23fME/bHLbLo4gg18AzHkyWEY5bKbMnXJQfGiGVsU0bixcJJJIHgSv1nksHHWx+bFuBUafmF0E1vff5mSi2V7s9L69CbDhPOuR3OFjV81/y+LNbqhHWrHRHpIHv5m3icZbl51bfVhbqKQdlve/B9j0mzgFuLYVLjBn3sgEbHoPExLALVJEL2P73Gl6QhO/UZHE4e5a4q1RDKG10knsB8dZ9LjNFkiDoCR9TbF57w+Tz0hTqbbGZfN2+TXNX62lNKCoBqRBQBc11ULG7jbv5X0/6Z5YmpVwTa/xL8ZRQAqgADoAJzQhCqC0Xt+TMlpJdFkH4Y//2Q==" alt="MM">
      <div><div class="hdr-name">Mine Minerals Supplies &amp; Services</div><div class="hdr-sub">Rustenburg &middot; 066 212 2225 &middot; info@mineminerals.co.za</div></div>
    </div>
    <div class="hdr-mid"><span class="hdr-tag">Operations Platform</span><span class="hdr-date" id="hdate"></span></div>
    <div class="hdr-right">
      <div style="display:flex;align-items:center;gap:5px"><div class="sdot" id="sdot"></div><span class="slbl" id="slbl">Ready</span></div>
      <div><div class="hdr-uname" id="uname">-</div><div class="hdr-urole" id="urole">-</div></div>
      <button class="btn-out" id="apiKeyBtn" title="Set Anthropic API Key">🔑 API Key</button>
      <button class="btn-out" id="logoutBtn">Sign out</button>
    </div>
  </div>
  <div class="nav" id="nav">
    <button class="nbtn active" data-tab="dash"><span class="npip"></span>Dashboard</button>
    <button class="nbtn" data-tab="leads"><span class="npip"></span>New Business</button>
    <button class="nbtn" data-tab="orders"><span class="npip"></span>Order Book</button>
    <button class="nbtn" data-tab="drawings"><span class="npip"></span>Drawings</button>
    <button class="nbtn" data-tab="planner"><span class="npip"></span>Planner</button>
    <button class="nbtn" data-tab="buyer"><span class="npip"></span>Buyer Sheet</button>
    <button class="nbtn" data-tab="fin" id="finTab"><span class="npip"></span>Finance</button>
    <button class="nbtn" data-tab="reports"><span class="npip"></span>Reports</button>
    <button class="nbtn" data-tab="wi"><span class="npip"></span>Work Instructions</button>
    <button class="nbtn" data-tab="jcosting" id="jcostTab"><span class="npip"></span>Job Costing</button>
    <button class="nbtn" data-tab="lrates" id="lratesTab"><span class="npip"></span>Labour Rates</button>
  </div>
  <div class="body" id="body"><div class="empty">Loading...</div></div>
</div>
</div>
<script src="app.js?v=14"></script>
</body>
</html>
