// Cloudflare Worker 脚本：Universal SSL 启用工具 + IP6.ARPA 域名生成工具（环境变量版本）
//
// === 安全配置：使用环境变量存储凭证 ===
// - 在 Cloudflare Dashboard > Workers > 你的 Worker > Settings > Variables 添加：
//   - CLOUDFLARE_EMAIL = 'your@email.com'
//   - CLOUDFLARE_API_KEY = 'your_global_api_key'
//
// === 部署后，硬编码凭证已移除，提高安全性 ===
// === 整合说明：根路径显示功能选择面板；/ssl 处理 SSL 启用；/arpa 处理 IP6.ARPA 生成 ===

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 从环境变量获取凭证（安全方式）
    const CLOUDFLARE_EMAIL = env.CLOUDFLARE_EMAIL;
    const CLOUDFLARE_API_KEY = env.CLOUDFLARE_API_KEY;

    // 验证环境变量（仅 SSL 路径需要）
    if ((path === '/ssl' || path === '/ssl-result') && (!CLOUDFLARE_EMAIL || !CLOUDFLARE_API_KEY)) {
      return new Response(`
        <!DOCTYPE html>
        <html lang="zh">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>配置错误</title>
          <style>* { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; color: #333; } .container { background: rgba(255, 255, 255, 0.95); border-radius: 16px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2); width: 100%; max-width: 400px; padding: 40px; text-align: center; } h1 { color: #2c3e50; margin-bottom: 20px; font-size: 28px; } .error { margin-top: 20px; padding: 15px; border-radius: 8px; font-weight: 600; background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }</style>
        </head>
        <body>
          <div class="container">
            <h1>配置错误</h1>
            <div class="error">后台环境变量未设置，请检查 CLOUDFLARE_EMAIL 和 CLOUDFLARE_API_KEY</div>
          </div>
        </body>
        </html>
      `, { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    if (request.method === 'GET' && path === '/') {
      // 返回主面板：功能选择
      return new Response(`
        <!DOCTYPE html>
        <html lang="zh">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Cloudflare 工具面板</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
              min-height: 100vh; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              padding: 20px; 
              color: #333; 
            }
            .container { 
              background: rgba(255, 255, 255, 0.95); 
              border-radius: 16px; 
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2); 
              width: 100%; 
              max-width: 500px; 
              padding: 40px; 
              text-align: center; 
            }
            h1 { 
              color: #2c3e50; 
              margin-bottom: 30px; 
              font-size: 32px; 
              position: relative; 
            }
            h1::after { 
              content: ''; 
              position: absolute; 
              bottom: -10px; 
              left: 50%; 
              transform: translateX(-50%); 
              width: 80px; 
              height: 3px; 
              background: linear-gradient(90deg, #667eea, #764ba2); 
              border-radius: 2px; 
            }
            .tool-card { 
              background: white; 
              border-radius: 12px; 
              padding: 24px; 
              margin: 20px 0; 
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); 
              transition: transform 0.3s, box-shadow 0.3s; 
              text-decoration: none; 
              display: block; 
              color: #333; 
            }
            .tool-card:hover { 
              transform: translateY(-4px); 
              box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15); 
            }
            .tool-card h3 { 
              color: #2c3e50; 
              margin-bottom: 8px; 
              font-size: 20px; 
            }
            .tool-card p { 
              color: #666; 
              line-height: 1.5; 
              margin-bottom: 16px; 
            }
            .tool-card .icon { 
              font-size: 24px; 
              margin-bottom: 12px; 
              display: block; 
            }
            .ssl-icon { color: #28a745; }
            .arpa-icon { color: #17a2b8; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Cloudflare 工具面板</h1>
            <a href="/ssl" class="tool-card">
              <span class="icon ssl-icon">🔒</span>
              <h3>启用 Universal SSL</h3>
              <p>输入 Zone ID，一键启用 SSL 证书（需配置环境变量）。</p>
            </a>
            <a href="/arpa" class="tool-card">
              <span class="icon arpa-icon">🌐</span>
              <h3>IP6.ARPA 域名生成</h3>
              <p>输入 IPv6 CIDR，快速生成逆向 DNS 域名。</p>
            </a>
          </div>
        </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    if (request.method === 'GET' && path === '/ssl') {
      // SSL 启用表单
      return new Response(`
        <!DOCTYPE html>
        <html lang="zh">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Cloudflare Universal SSL 启用工具</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
              min-height: 100vh; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              padding: 20px; 
              color: #333; 
            }
            .container { 
              background: rgba(255, 255, 255, 0.95); 
              border-radius: 16px; 
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2); 
              width: 100%; 
              max-width: 400px; 
              padding: 40px; 
              text-align: center; 
            }
            h1 { 
              color: #2c3e50; 
              margin-bottom: 20px; 
              font-size: 28px; 
              position: relative; 
            }
            h1::after { 
              content: ''; 
              position: absolute; 
              bottom: -10px; 
              left: 50%; 
              transform: translateX(-50%); 
              width: 60px; 
              height: 3px; 
              background: linear-gradient(90deg, #667eea, #764ba2); 
              border-radius: 2px; 
            }
            p { 
              margin-bottom: 20px; 
              color: #555; 
              line-height: 1.5; 
            }
            form { margin-top: 20px; }
            label { 
              display: block; 
              margin-bottom: 8px; 
              font-weight: 600; 
              color: #2c3e50; 
              text-align: left; 
            }
            input[type="text"] { 
              width: 100%; 
              padding: 12px 16px; 
              border: 2px solid #e0e0e0; 
              border-radius: 8px; 
              font-size: 16px; 
              transition: all 0.3s; 
            }
            input[type="text"]:focus { 
              border-color: #667eea; 
              outline: none; 
              box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); 
            }
            button { 
              width: 100%; 
              padding: 14px; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
              color: white; 
              border: none; 
              border-radius: 8px; 
              font-size: 16px; 
              font-weight: 600; 
              cursor: pointer; 
              transition: all 0.3s; 
              margin-top: 20px; 
            }
            button:hover { 
              transform: translateY(-2px); 
              box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3); 
            }
            .back-link { 
              display: inline-block; 
              margin-top: 20px; 
              color: #667eea; 
              text-decoration: none; 
              font-weight: 500; 
            }
            .back-link:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>启用 Universal SSL</h1>
            <p>输入你的 <strong>Zone ID</strong>，然后点击提交。</p>
            <form method="POST" action="/ssl">
              <label for="zoneId">Zone ID</label>
              <input type="text" id="zoneId" name="zoneId" required placeholder="例如: 023e105f4ecef8ad9ca31a8372d0c353">
              <button type="submit">提交申请</button>
            </form>
            <a href="/" class="back-link">← 返回面板</a>
          </div>
        </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    if (request.method === 'POST' && path === '/ssl') {
      try {
        // 解析表单数据
        const formData = await request.formData();
        const zoneId = formData.get('zoneId');

        if (!zoneId) {
          return new Response(`
            <!DOCTYPE html>
            <html lang="zh">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>结果</title>
              <style>* { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; color: #333; } .container { background: rgba(255, 255, 255, 0.95); border-radius: 16px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2); width: 100%; max-width: 400px; padding: 40px; text-align: center; } h1 { color: #2c3e50; margin-bottom: 20px; font-size: 28px; } .result { margin-top: 20px; padding: 15px; border-radius: 8px; font-weight: 600; } .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; } .back-link { display: inline-block; margin-top: 20px; color: #667eea; text-decoration: none; font-weight: 500; } .back-link:hover { text-decoration: underline; }</style>
            </head>
            <body>
              <div class="container">
                <h1>申请结果</h1>
                <div class="result error">错误：请提供 Zone ID</div>
                <a href="/ssl" class="back-link">返回重新申请</a>
                <a href="/" class="back-link" style="margin-left: 10px;">返回面板</a>
              </div>
            </body>
            </html>
          `, { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
        }

        // API 配置：使用 X-Auth-Key（Global Key 方式）
        const apiUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/ssl/universal/settings`;
        const headers = {
          'X-Auth-Email': CLOUDFLARE_EMAIL,
          'X-Auth-Key': CLOUDFLARE_API_KEY,
          'Content-Type': 'application/json'
        };
        const body = JSON.stringify({
          enabled: true,
          certificate_authority: 'ssl_com'
        });

        // 调用 Cloudflare API
        const apiResponse = await fetch(apiUrl, {
          method: 'PATCH',
          headers: headers,
          body: body
        });

        const result = await apiResponse.json();

        // 返回结果页面（简化显示）
        let statusMsg = '';
        let statusClass = 'error';
        if (result.success) {
          statusMsg = '✅ Universal SSL 已成功启用！（几分钟后生效）';
          statusClass = 'success';
        } else {
          statusMsg = '❌ 启用失败：' + (result.errors && result.errors.length > 0 ? result.errors[0].message : '未知错误');
        }

        return new Response(`
          <!DOCTYPE html>
          <html lang="zh">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>结果</title>
            <style>* { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; color: #333; } .container { background: rgba(255, 255, 255, 0.95); border-radius: 16px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2); width: 100%; max-width: 400px; padding: 40px; text-align: center; } h1 { color: #2c3e50; margin-bottom: 20px; font-size: 28px; } .result { margin-top: 20px; padding: 15px; border-radius: 8px; font-weight: 600; } .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; } .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; } .back-link { display: inline-block; margin-top: 20px; color: #667eea; text-decoration: none; font-weight: 500; } .back-link:hover { text-decoration: underline; }</style>
          </head>
          <body>
            <div class="container">
              <h1>申请结果</h1>
              <div class="result ${statusClass}">${statusMsg}</div>
              <a href="/ssl" class="back-link">返回重新申请</a>
              <a href="/" class="back-link" style="margin-left: 10px;">返回面板</a>
            </div>
          </body>
          </html>
        `, {
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });

      } catch (error) {
        return new Response(`
          <!DOCTYPE html>
          <html lang="zh">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>结果</title>
            <style>* { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; color: #333; } .container { background: rgba(255, 255, 255, 0.95); border-radius: 16px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2); width: 100%; max-width: 400px; padding: 40px; text-align: center; } h1 { color: #2c3e50; margin-bottom: 20px; font-size: 28px; } .result { margin-top: 20px; padding: 15px; border-radius: 8px; font-weight: 600; } .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; } .back-link { display: inline-block; margin-top: 20px; color: #667eea; text-decoration: none; font-weight: 500; } .back-link:hover { text-decoration: underline; }</style>
          </head>
          <body>
            <div class="container">
              <h1>申请结果</h1>
              <div class="result error">错误：${error.message}（检查 Key/Email 或 Zone ID）</div>
              <a href="/ssl" class="back-link">返回重新申请</a>
              <a href="/" class="back-link" style="margin-left: 10px;">返回面板</a>
            </div>
          </body>
          </html>
        `, { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      }
    }

    if (request.method === 'GET' && path === '/arpa') {
      // IP6.ARPA 生成工具（纯客户端）
      const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>IP6.ARPA 域名生成工具</title>
<style>
body {
  font-family: "Segoe UI", "PingFang SC", sans-serif;
  background: linear-gradient(to bottom right, #e3f2fd, #f4f9ff);
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  margin: 0;
}
.container {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  padding: 28px 36px;
  width: 580px;
  text-align: center;
  border: 1px solid #d7e3f3;
}
.header {
  background-color: #0d77a8;
  color: white;
  font-weight: bold;
  padding: 12px;
  border-radius: 10px;
  margin-bottom: 20px;
}
h2 {
  color: #0d77a8;
  margin-bottom: 22px;
}
label {
  font-weight: bold;
  display: block;
  margin-bottom: 8px;
  color: #333;
  text-align: left;
}
input {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #bcd6f0;
  font-size: 15px;
  margin-bottom: 20px;
  box-sizing: border-box;
}
button {
  background-color: #0d77a8;
  color: white;
  border: none;
  padding: 12px 18px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
}
button:hover {
  background-color: #0b5f87;
}
.result-box {
  background: #f6fbff;
  border: 1px solid #cde3f9;
  border-radius: 8px;
  margin-top: 16px;
  padding: 14px;
  text-align: left;
  font-family: monospace;
  word-wrap: break-word;
  color: #00334d;
}
.success {
  display: flex;
  align-items: center;
  color: green;
  font-weight: bold;
  margin-top: 10px;
  justify-content: center;
}
.success span {
  margin-left: 6px;
}
.copy-btn {
  background: #0d77a8;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  margin-top: 8px;
  cursor: pointer;
}
.copy-btn.copied {
  background: #2e8d4f;
}
.error {
  color: red;
  font-weight: bold;
  margin-top: 10px;
}
.back-link {
  display: inline-block;
  margin-top: 20px;
  color: #0d77a8;
  text-decoration: none;
  font-weight: 500;
}
.back-link:hover { text-decoration: underline; }
</style>
</head>
<body>
  <div class="container">
    <div class="header">IP6.ARPA 域名生成工具</div>
    <h2>输入 IPv6 CIDR 生成域名</h2>

    <label for="cidr">输入 IPv6 CIDR 地址</label>
    <input id="cidr" placeholder="例如：2001:470:8:2c1::/64 或 2001:470:e252::/48">

    <button id="generate">生成 IP6.ARPA 域名</button>

    <div id="resultArea" style="display:none;">
      <div class="result-box" id="resultBox"></div>
      <button class="copy-btn" id="copyBtn">复制</button>
      <div class="success" id="successMsg" style="display:none;">✅<span>生成成功</span></div>
    </div>

    <div id="error" class="error" style="display:none;"></div>
    <a href="/" class="back-link">← 返回面板</a>
  </div>

<script>
function expandIPv6(addr) {
  addr = addr.trim().toLowerCase();
  if (addr.includes('%')) addr = addr.split('%')[0];
  const parts = addr.split('::');
  if (parts.length > 2) throw new Error('IPv6 格式错误');
  let left = parts[0] ? parts[0].split(':').filter(Boolean) : [];
  let right = parts[1] ? parts[1].split(':').filter(Boolean) : [];
  const missing = 8 - (left.length + right.length);
  if (missing < 0) throw new Error('地址段超出');
  const zeros = new Array(missing).fill('0');
  const full = [...left, ...zeros, ...right].map(p => p.padStart(4,'0'));
  return full.join(':');
}

function cidrToArpa(cidr) {
  if (!cidr.includes('/')) throw new Error('请输入 CIDR');
  const [addr, prefixStr] = cidr.split('/');
  const prefix = parseInt(prefixStr,10);
  if (isNaN(prefix) || prefix % 4 !== 0) throw new Error('仅支持前缀为 4 的倍数（如 /48 /64）');
  const expanded = expandIPv6(addr);
  const hex = expanded.replace(/:/g, '');
  const nibbleCount = prefix / 4;
  const relevant = hex.substring(0, nibbleCount);
  return relevant.split('').reverse().join('.') + '.ip6.arpa';
}

const btn = document.getElementById('generate');
const res = document.getElementById('resultArea');
const box = document.getElementById('resultBox');
const err = document.getElementById('error');
const success = document.getElementById('successMsg');
const copyBtn = document.getElementById('copyBtn');

btn.onclick = () => {
  err.style.display = 'none';
  res.style.display = 'none';
  success.style.display = 'none';
  try {
    const val = document.getElementById('cidr').value.trim();
    const out = cidrToArpa(val);
    box.textContent = out;
    res.style.display = 'block';
    success.style.display = 'flex';
  } catch (e) {
    err.textContent = '错误：' + e.message;
    err.style.display = 'block';
  }
};

copyBtn.onclick = async () => {
  try {
    await navigator.clipboard.writeText(box.textContent);
    copyBtn.textContent = '已复制';
    copyBtn.classList.add('copied');
    setTimeout(() => {
      copyBtn.textContent = '复制';
      copyBtn.classList.remove('copied');
    }, 1500);
  } catch {
    alert('复制失败，请手动复制');
  }
};
</script>
</body>
</html>`;
      return new Response(html, {
        headers: { "content-type": "text/html;charset=utf-8" },
      });
    }

    // 默认重定向到根路径
    return Response.redirect(new URL('/', request.url));
  }
};