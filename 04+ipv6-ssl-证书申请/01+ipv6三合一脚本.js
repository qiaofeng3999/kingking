// 代码用的老王发的代码 然后二开创造
// 不会用就加tg群https://t.me/yifang_chat

export default {
  async fetch(request, env, ctx) {
      const url = new URL(request.url);
      const path = url.pathname;

      // 处理 API 请求：支持 POST (/api/add-ssl) 和 GET (/?...)
      if (
          (path === '/api/add-ssl' && request.method === 'POST') ||
          (path === '/' && request.method === 'GET' && url.searchParams.has('zoneId'))
      ) {
          return handleApiRequest(request, url.searchParams, env);
      }
      // API 接口：批量添加 NS
      if (path === '/api/add-dns' && request.method === 'POST') {
          return handleDnsRequest(request, env);
      }

      // 返回 HTML 页面 (仅当是根路径的 GET 请求且没有API参数时)
      return new Response(getHTML(), {
          headers: {
              'Content-Type': 'text/html; charset=utf-8',
          },
      });
  },
};

// 统一处理 API 请求（支持 POST Body 和 GET Query Params） - SSL部分
async function handleApiRequest(request, queryParams, env) {
  let email = env.EMAIL; // 从环境变量获取
  let api_key = env.API_KEY; // 从环境变量获取
  let zone_id, enabled, certificate_authority;

  try {
      if (request.method === 'POST') {
          // POST 请求：从请求体中解析 JSON
          const body = await request.json();
          zone_id = body.zone_id;
          enabled = true; 
          certificate_authority = body.certificate_authority || "ssl_com"; 
      } else if (request.method === 'GET') {
          // GET 请求：从 URL 查询参数中获取
          zone_id = queryParams.get('zoneId');
          enabled = queryParams.get('enabled') === 'true';
          certificate_authority = queryParams.get('ca') || "ssl_com";
      }

      // 验证必需的输入
      if (!email || !api_key) {
          return new Response(JSON.stringify({
              success: false,
              errors: ['后端环境变量 EMAIL 和 API_KEY 必须设置']
          }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' }
          });
      }
      if (!zone_id) {
          return new Response(JSON.stringify({
              success: false,
              errors: ['区域ID是必需的']
          }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' }
          });
      }
      
      // 验证并设置 CA 默认值
      const validCAs = ["ssl_com", "lets_encrypt", "google", "sectigo"];
      const caToUse = validCAs.includes(certificate_authority) ? certificate_authority : "ssl_com";

      // 调用 Cloudflare API
      const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zone_id}/ssl/universal/settings`, {
          method: 'PATCH',
          headers: {
              'X-Auth-Email': email,
              'X-Auth-Key': api_key,
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              enabled: enabled,
              certificate_authority: caToUse
          }),
      });

      const result = await response.json();

      // 为 API 调用返回 JSON 响应
      return new Response(JSON.stringify(result), {
          headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST',
              'Access-Control-Allow-Headers': 'Content-Type',
          },
      });

  } catch (error) {
      return new Response(JSON.stringify({
          success: false,
          errors: [{ message: `请求失败: ${error.message || '未知错误'}` }]
      }), {
          status: 500,
          headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
          }
      });
  }
}

// 批量添加 NS 记录
async function handleDnsRequest(request, env) {
  try {
    let email = env.EMAIL; // 从环境变量获取
    let api_key = env.API_KEY; // 从环境变量获取
    const { zone_id, record_name, ns_targets } = await request.json();
    if (!email || !api_key) {
      return jsonResponse({ success: false, errors: ['后端环境变量 EMAIL 和 API_KEY 必须设置'] }, 500);
    }
    if (!zone_id || !record_name || !ns_targets || ns_targets.length === 0)
      return jsonResponse({ success: false, errors: ['区域ID、记录名称和 NS 目标都是必需的'] }, 400);

    const added = [];
    const failed = [];

    for (const ns_target of ns_targets) {
      const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${zone_id}/dns_records`, {
        method: 'POST',
        headers: {
          'X-Auth-Email': email,
          'X-Auth-Key': api_key,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'NS',
          name: record_name,
          content: ns_target.trim(),
          ttl: 3600,
        }),
      });

      const result = await res.json();
      if (result.success) added.push(ns_target);
      else failed.push({ ns_target, error: result.errors?.[0]?.message || '未知错误' });
    }

    return jsonResponse({ success: failed.length === 0, added, failed });
  } catch (error) {
    return jsonResponse({ success: false, errors: [`请求失败: ${error.message}`] }, 500);
  }
}

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// getHTML 函数 - 整合后的页面
function getHTML() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>IP6.ARPA域名自动添加SSL证书 & 管理后台</title>
  <meta name="description" content="一键为您的 IP6.ARPA 反向解析域名自动申请和配置 Cloudflare 通用 SSL 证书，同时提供 IP6.ARPA 域名生成工具和 NS 记录管理。">
  <link rel="icon" href="https://tunnelbroker.net/favicon.ico" type="image/ico">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer" />
  <style>
    * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    
    body {
        background: url('https://pan.811520.xyz/icon/bg_light.webp') no-repeat center/cover;
        color: #333;
        min-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 10px;
    }
    
    .container {
        background: rgba(255, 255, 255, 0.3);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border-radius: 12px;
        box-shadow: 8px 8px 15px rgba(0, 0, 0, 0.15);
        width: 100%;
        max-width: 840px;
        padding: 30px;
        margin: 30px;
    }
    
    h1 {
      text-align: center;
      margin-bottom: 25px;
      color: white;
      font-size: 36px;
      position: relative;
      padding-bottom: 15px;
      text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.7); 
    }
 
    /* CSS for two-column layout */
    .form-row {
        display: flex;
        justify-content: space-between;
        gap: 20px;
        margin-bottom: 20px;
    }
    
    .form-group.half-width {
        flex: 1;
        margin-bottom: 0;
    }
    
    .ca-select-style {
        width: 100%; 
        padding: 12px 15px; 
        border: 2px solid #e0e0e0; 
        border-radius: 8px; 
        font-size: 16px;
        transition: all 0.3s;
    }
    
    .ca-select-style:focus {
        border-color: #3498db;
        box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
        outline: none;
    }
     
    .registration-buttons {
      display: flex;
      justify-content: space-between;
      gap: 15px;
      margin-bottom: 25px;
   }

    .register-btn {
        flex: 1;
        display: block;
        background: #0D627E;
        color: white;
        text-align: center;
        text-decoration: none;
        border-radius: 8px;
        padding: 10px 15px;
        font-size: 16px;
        font-weight: 600;
        transition: all 0.3s;
        box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.15);
    }
    
    .register-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    }
    
    .form-group {
        margin-bottom: 20px;
    }
    
    label {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
        color: #2c3e50;
    }
    
    input[type="text"], 
    input[type="email"],
    .ca-select-style {
        width: 100%;
        padding: 12px 15px;
        background: rgba(255, 255, 255, 0.35); 
        backdrop-filter: blur(5px);
        -webkit-backdrop-filter: blur(5px);
        border: 1px solid rgba(255, 255, 255, 0.4); 
        border-radius: 8px; 
        font-size: 16px;
        color: #2c3e50;
        transition: all 0.3s;
    }
    
    .ca-select-style {
        height: 48px;
    }

    input[type="text"]:focus, 
    input[type="email"]:focus,
    .ca-select-style:focus {
        border-color: #3498db;
        box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
        outline: none;
        background: rgba(255, 255, 255, 0.5); 
    }
    
    .error {
        border-color: #e74c3c !important;
        box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.2) !important;
    }
    
    .error-message {
        color: #e74c3c;
        font-size: 14px;
        margin-top: 5px;
        display: none;
    }
    
    .btn {
        background: #0D627E;
        color: white;
        border: none;
        border-radius: 8px;
        padding: 14px 20px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        width: 100%;
        transition: all 0.3s;
        display: flex;
        justify-content: center;
        align-items: center;
        box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.15);
    }
    
    .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }
    
    .btn:active {
        transform: translateY(0);
    }
    
    .btn-small {
        width: auto;
        padding: 10px 15px;
    }
    
    .spinner {
        display: none;
        width: 20px;
        height: 20px;
        border: 3px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: spin 1s ease-in-out infinite;
        margin-right: 10px;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    .result {
        margin-top: 20px;
        padding: 15px;
        border-radius: 8px;
        display: none;
        text-align: center;
        font-weight: 600;
    }
    
    .success {
        background-color: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
    }
    
    .error-result {
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
    }
    
    .info-box {
        background: rgba(255, 255, 255, 0.35);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border-left: 4px solid #3498db;
        padding: 15px;
        margin-top: 25px;
        border-radius: 8px;
    }
    
    .info-box h2 {
        color: #2c3e50;
        margin-bottom: 10px;
        font-size: 20px;
    }
    
    .info-box p {
        font-size: 14px;
        line-height: 1.5;
        color: #34495e;
    }

    .footer {
      text-align: center;
      margin-top: 20px;
      font-size: 14px;
      color: #444;
    }
    .footer a {
      color: inherit;
      text-decoration: none;
      transition: color 0.3s;
    }
    .footer a:hover {
     color: #3498db;
    }
    .separator {
      padding: 0 5px; 
      color: inherit; 
      display: inline-block;
    }

    /* NS 表单特定样式 */
    .flex-row { 
        display: flex; 
        gap: 5px; 
        align-items: center; 
    }
    .flex-row input { 
        flex: 1; 
    }
    .flex-row select { 
        width: 100px; 
    }
    .flex-row button { 
        width: 100px; 
        padding: 10px; 
    }
    textarea {
        width: 100%;
        padding: 12px 15px;
        background: rgba(255, 255, 255, 0.35); 
        backdrop-filter: blur(5px);
        -webkit-backdrop-filter: blur(5px);
        border: 1px solid rgba(255, 255, 255, 0.4); 
        border-radius: 8px; 
        font-size: 16px;
        color: #2c3e50;
        transition: all 0.3s;
        height: 100px;
        resize: vertical;
    }
    textarea:focus {
        border-color: #3498db;
        box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
        outline: none;
        background: rgba(255, 255, 255, 0.5); 
    }

    /* 响应式调整：在小屏幕上变回单列布局 */
    @media (max-width: 600px) {
      .form-row { flex-direction: column; gap: 0; }
      .form-group.half-width { margin-bottom: 20px; }
      .flex-row { flex-direction: column; }
      .footer { font-size: 0.8em; }
    }  
  </style>
</head>
<body>
  <div class="container">
    <h1>IP6.ARPA域名自动添加SSL证书 & 管理后台</h1>
    
    <div class="registration-buttons">
      <a href="https://tb.netassist.ua" class="register-btn" target="_blank">ip6.arpa 注册地址1</a>
      <a href="https://dns.he.net" class="register-btn" target="_blank">ip6.arpa 注册地址2</a>
      <a href="https://tunnelbroker.net/" class="register-btn" target="_blank">ip6.arpa 注册地址3</a>
    </div>
    
    <!-- SSL 表单 -->
    <h2 style="color: white; text-align: center; margin-bottom: 20px;">添加 SSL证书</h2>
    <form id="ssl-form">
      <div class="form-row">
          <div class="form-group half-width">
              <label for="zone-id">区域ID (Zone ID)</label>
              <input type="text" id="zone-id" placeholder="请输入您的区域ID">
              <div class="error-message" id="zone-id-error">请输入区域ID</div>
          </div>
          
          <div class="form-group half-width">
              <label for="ca-select">证书颁发机构 (CA)</label>
              <select id="ca-select" class="ca-select-style">
                  <option value="ssl_com">SSL.com (默认)</option>
                  <option value="lets_encrypt">Let's Encrypt</option>
                  <option value="google">Google Trust Services</option>
                  <option value="sectigo">Sectigo</option>
              </select>
          </div>
      </div>

      <button type="submit" class="btn" id="submit-btn">
          <div class="spinner" id="spinner"></div>
          <span id="btn-text">添加SSL证书</span>
      </button>
    </form>
    
    <!-- NS 表单 -->
    <h2 style="color: white; text-align: center; margin: 30px 0 20px 0;">批量添加 NS 记录</h2>
    <form id="dns-form">
      <div class="form-row">
          <div class="form-group half-width">
              <label for="dns-zone-id">Zone ID</label>
              <input type="text" id="dns-zone-id" placeholder="Zone ID">
          </div>
          
          <div class="form-group half-width">
              <label for="dns-name">记录名称 (可自定义或生成随机)</label>
              <div class="flex-row">
                  <input type="text" id="dns-name" placeholder="记录名称">
                  <select id="segment-count">
                      <option value="1">1 段</option>
                      <option value="2">2 段</option>
                      <option value="3">3 段</option>
                      <option value="4">4 段</option>
                      <option value="random">随机 1~4 段</option>
                  </select>
                  <button type="button" class="btn btn-small" id="gen-random-ip">随机生成</button>
              </div>
          </div>
      </div>
      <div class="form-group">
          <label for="dns-targets">NS 名称服务器 (每行一个)</label>
          <textarea id="dns-targets" placeholder="每行一个 NS 名称服务器"></textarea>
      </div>
      <button type="button" class="btn" id="dns-btn">批量添加 NS</button>
    </form>
    
    <div class="result" id="result-message"></div>

    <!-- 域名生成工具 -->
    <div class="info-box">
      <h2>IP6.ARPA 域名生成工具</h2>
      <div class="form-row" style="margin-top: 15px;">
        <div class="form-group half-width">
          <label for="ipv6-cidr">输入 IPv6 CIDR 地址</label>
          <input type="text" id="ipv6-cidr" placeholder="请输入 IPv6 CIDR, 例如: 2001:DB8::/48">
          <div class="error-message" id="ipv6-cidr-error">请输入有效的 IPv6 CIDR</div>
        </div>
        <div class="form-group half-width">
          <label for="generated-domain">生成的 IP6.ARPA 域名</label>
          <input type="text" id="generated-domain" readonly placeholder="生成结果将显示在这里">
        </div>
      </div>
      <button type="button" class="btn" id="generate-btn">生成 IP6.ARPA 域名</button>
    </div>    

    <div class="info-box">
      <h2>API GET 调用示例 (SSL)</h2>
      <p style="font-size: 14px; margin-bottom: 10px;">证书颁发机构 (ca) 支持：<code>ssl_com</code>、<code>lets_encrypt</code>、<code>google</code>、<code>sectigo</code>。<strong>注意：ip6.arpa 域名通常仅支持 <code>ssl_com</code>。</strong> Email 和 API Key 已配置在后端环境变量中。</p>
      <pre style="background: rgba(255, 255, 255, 0.7); padding: 10px; border-radius: 6px; font-size: 14px; overflow-x: auto; color: #000;">https://worker地址/?zoneId=...&enabled=true&ca=ssl_com</pre>
    </div>

    <div class="footer">
      Copyright 2025
    </div>
  </div>

  <script>
  // ==========================================================
  // 域名生成逻辑 (支持随机子域名生成)
  // ==========================================================
  
  // 辅助函数：将缩写的 IPv6 地址 (如 2001:db8::1) 展开为完整的 32 位十六进制字符串
  function expandIpv6(ipv6) {
    ipv6 = ipv6.toLowerCase();
  
    // 检查是否有 '::' 缩写
    if (!ipv6.includes('::')) {
      // 没有缩写，直接填充并连接
      return ipv6.split(':').map((block) => block.padStart(4, '0')).join('');
    }
  
    const parts = ipv6.split('::');
    const leftBlocks = parts[0].split(':').filter(Boolean);
    const rightBlocks = parts[1].split(':').filter(Boolean);
  
    const existingBlocksCount = leftBlocks.length + rightBlocks.length;
    const zeroBlocksCount = 8 - existingBlocksCount;
  
    if (zeroBlocksCount < 0) {
      throw new Error('IPv6 地址块过多，格式错误。');
    }
  
    const zeroPadding = Array(zeroBlocksCount).fill('0000').join('');
  
    // 填充左侧和右侧的块，然后合并
    const fullLeft = leftBlocks.map((block) => block.padStart(4, '0')).join('');
    const fullRight = rightBlocks.map((block) => block.padStart(4, '0')).join('');
  
    return fullLeft + zeroPadding + fullRight;
  }
  
  // 辅助函数：生成指定长度的随机十六进制字符串
  function randomHex(length) {
    let result = '';
    const characters = '0123456789abcdef';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }
  
  // 生成给定 CIDR 范围内的一个随机 IPv6 地址的反向域名 (IP6.ARPA)。
  function getRandomIpv6InCidr(cidr) {
    const parts = cidr.split('/');
  
    if (parts.length !== 2) {
      throw new Error('CIDR 格式不正确，请使用 IP/前缀长度 格式。');
    }
  
    const ipv6 = parts[0].trim();
    const prefixLength = parseInt(parts[1], 10);
  
    if (isNaN(prefixLength) || prefixLength < 0 || prefixLength > 128 || prefixLength % 4 !== 0) {
      throw new Error('前缀长度无效，必须是 4 的倍数 (例如: /32, /48, /64)。');
    }
  
    // 1. 获取完整的 32 字符十六进制地址
    const fullHex = expandIpv6(ipv6);
  
    // 2. 计算前缀和随机部分长度 (每个字符代表 4 位)
    const hexCharsInPrefix = prefixLength / 4;
    const hexCharsInRandom = 32 - hexCharsInPrefix;
  
    // 3. 截取固定的网络前缀部分
    const networkPrefix = fullHex.substring(0, hexCharsInPrefix);
  
    // 4. 生成主机 ID 的随机部分
    const randomHostId = randomHex(hexCharsInRandom);
  
    // 5. 组合完整的 32 位随机 IPv6 地址 (十六进制)
    const randomFullHex = networkPrefix + randomHostId;
  
    // 6. 计算反向域名 (只反转前缀部分)
    // 注意：ip6.arpa 域名通常只包含网络前缀部分。
    const arpaPrefix = networkPrefix;
    const reversed = arpaPrefix.split('').reverse().join('.');
  
    return reversed + '.ip6.arpa';
  }

  // NS 随机生成
  function getRandomHex() {
    const hexChars = '0123456789abcdef';
    return hexChars[Math.floor(Math.random() * 16)];
  }

  function generateRandomIP(segments) {
    const segs = [];
    const count = segments === 'random' ? Math.floor(Math.random() * 4) + 1 : parseInt(segments);
    for (let i = 0; i < count; i++) {
      segs.push(getRandomHex());
    }
    return segs.join('.');
  }
  
  // ==========================================================
  // DOM 交互逻辑 (包含 localStorage)
  // ==========================================================
  
  // 辅助函数：从本地存储加载 CIDR
  function loadSavedCidr() {
    const savedCidr = localStorage.getItem('ipv6Cidr');
    if (savedCidr) {
      document.getElementById('ipv6-cidr').value = savedCidr;
    }
  }
  
  // 辅助函数：保存 CIDR 到本地存储
  function saveCidr(cidr) {
    localStorage.setItem('ipv6Cidr', cidr);
  }
  
  // 辅助函数：显示字段错误
  function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(fieldId + '-error');
  
    field.classList.add('error');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    if (!document.querySelector('.error:focus')) {
      field.focus();
    }
  }
  
  // 辅助函数：重置所有错误状态
  function resetErrors() {
    const errorFields = document.querySelectorAll('.error');
    const errorMessages = document.querySelectorAll('.error-message');
    errorFields.forEach((field) => {
      field.classList.remove('error');
    });
    errorMessages.forEach((message) => {
      message.style.display = 'none';
    });
  }
  
  // 辅助函数：显示操作结果
  function showResult(message, type) {
    const resultElement = document.getElementById('result-message');
    resultElement.textContent = message;
    resultElement.className = 'result';
    resultElement.classList.add(type === 'success' ? 'success' : 'error-result');
    resultElement.style.display = 'block';
    resultElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  
  // 辅助函数：执行复制操作 (仅使用 Clipboard API)
  async function copyTextToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.warn('Clipboard API 复制失败或权限被拒绝:', err);
        return false;
      }
    } else {
      console.warn('浏览器不支持 navigator.clipboard API。');
      return false;
    }
  }

  // 通用 post 函数 for DNS
  async function post(url, data) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (e) {
      return { success: false, errors: ['请求失败: ' + e.message] };
    }
  }
  
  // ==========================================================
  // 页面初始化和事件监听
  // ==========================================================
  document.addEventListener('DOMContentLoaded', function () {
    // 1. 加载保存的 CIDR
    loadSavedCidr();
  
    // 2. 监听 CIDR 输入，实时保存
    document.getElementById('ipv6-cidr').addEventListener('input', function (e) {
      saveCidr(e.target.value.trim());
    });
  
    // 3. 事件监听：IPv6 域名生成 (调用随机生成函数)
    document.getElementById('generate-btn').addEventListener('click', async function () {
      resetErrors();
      const cidrInput = document.getElementById('ipv6-cidr');
      const domainOutput = document.getElementById('generated-domain');
      const cidr = cidrInput.value.trim();
      domainOutput.value = '';
  
      if (!cidr) {
        showError('ipv6-cidr', '请输入 IPv6 CIDR 地址。');
        return;
      }
  
      try {
        // 使用新的随机生成函数
        const generatedDomain = getRandomIpv6InCidr(cidr);
        domainOutput.value = generatedDomain;
  
        // 复制操作
        const copySuccess = await copyTextToClipboard(generatedDomain);
  
        // 给出反馈
        if (copySuccess) {
          showResult('IP6.ARPA 域名生成成功，并已自动复制到剪贴板。域名: ' + generatedDomain, 'success');
        } else {
          showResult('IP6.ARPA 域名生成成功！自动复制失败，请手动复制。域名: ' + generatedDomain, 'success');
        }
      } catch (error) {
        // 捕获生成抛出的错误
        showError('ipv6-cidr', error.message || '生成域名失败，请检查CIDR格式。');
        showResult('生成失败: ' + (error.message || '未知错误'), 'error');
      }
    });

    // 4. 事件监听：SSL 提交
    document.getElementById('ssl-form').addEventListener('submit', async function (e) {
      e.preventDefault();
  
      // 获取输入值
      const zoneId = document.getElementById('zone-id').value.trim();
      const caSelect = document.getElementById('ca-select').value;
  
      // 重置错误状态
      resetErrors();
  
      // 验证输入
      let isValid = true;
      if (!zoneId) {
        showError('zone-id', '请输入区域ID');
        isValid = false;
      }
      if (!isValid) return;
  
      // 显示加载状态
      document.getElementById('spinner').style.display = 'block';
      document.getElementById('btn-text').textContent = '添加中...';
      document.getElementById('submit-btn').disabled = true;
  
      try {
        // 发送请求到 Worker API
        const response = await fetch('/api/add-ssl', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            zone_id: zoneId,
            certificate_authority: caSelect,
          }),
        });
  
        const data = await response.json();
  
        // 显示结果
        if (data.success) {
          showResult('证书添加成功，请10分钟后在Cloudflare该域名里检查SSL/TLS证书', 'success');
        } else {
          let errorMsg = '添加证书失败';
          if (data.errors && data.errors.length > 0) {
            errorMsg += ': ' + (data.errors[0].message || JSON.stringify(data.errors[0]));
          } else if (data.errors) {
            errorMsg += ': ' + JSON.stringify(data.errors);
          }
          showResult(errorMsg, 'error');
        }
      } catch (error) {
        showResult('请求失败，请检查网络连接', 'error');
        console.error('Error:', error);
      } finally {
        // 隐藏加载状态
        document.getElementById('spinner').style.display = 'none';
        document.getElementById('btn-text').textContent = '添加SSL证书';
        document.getElementById('submit-btn').disabled = false;
      }
    });

    // 5. 事件监听：DNS 提交
    document.getElementById('dns-btn').addEventListener('click', async()=>{
      const zone_id = document.getElementById('dns-zone-id').value.trim();
      const record_name = document.getElementById('dns-name').value.trim();
      const ns_targets = document.getElementById('dns-targets').value.split(/\\n/).map(v=>v.trim()).filter(v=>v);
      if(!zone_id||!record_name||ns_targets.length===0) return showResult('请填写完整信息', 'error');
      showResult('正在添加 NS...', 'success');
      const data = await post('/api/add-dns',{zone_id,record_name,ns_targets});
      if(data.success) showResult('✅ NS 添加成功: '+data.added.join(','), 'success');
      else showResult('❌ 添加失败: '+(data.failed.map(f=>f.ns_target+':'+f.error).join('; ')||'未知错误'), 'error');
    });

    // 6. 事件监听：随机生成 NS 名称
    document.getElementById('gen-random-ip').addEventListener('click', ()=>{
      const segments = document.getElementById('segment-count').value;
      const randomIP = generateRandomIP(segments);
      document.getElementById('dns-name').value = randomIP;
    });
  });
  </script>
</body>
</html>`;
}