### 感觉跳转加群有点流氓行为 改成

<img width="1708" height="884" alt="image" src="https://github.com/user-attachments/assets/ca35ae39-6971-4291-b182-28cb292c0353" />


想加群的自己点击添加吧 tg交流群 https://t.me/+ft-zI76oovgwNmRh 

###  Snippets

<img width="1128" height="801" alt="image" src="https://github.com/user-attachments/assets/ae108dd2-c543-4a63-b448-d56d4d520e1d" />

#### 加入多客户端支持 域名/你的uuid即可看见

###  配套工具

| 类型 | 描述 | 链接 |
| :--- | :--- | :--- |
|  **文字教程** | 详细的部署与使用说明博客文章 | [https://joeyblog.net/yuanchuang/1146.html](https://joeyblog.net/yuanchuang/1146.html) |
|  **Workers视频教程** | 直观的操作演示和功能讲解 | https://youtu.be/Rlypv_iswD8 |
|  **Snippets视频教程** | 直观的操作演示和功能讲解 | https://www.youtube.com/watch?v=xeFeH3Akcu8 |

###  部署
	
加入了千呼万唤的订阅每15分钟自动优选一次

#### 🔧 基础配置
| 变量名 | 值 | 说明 |
| :--- | :--- | :--- |
| `u` | `你的 UUID` | **必需**。用于访问订阅和配置管理界面 |
| `p` | `proxyip` | **可选**。自定义ProxyIP地址和端口 |
| `s` | `你的SOCKS5地址` | **可选**。用于将所有出站流量通过 SOCKS5 代理转发，格式为 `user:pass@host:port` 或 `host:port` |
| `d` | `你的订阅地址` | **可选**。不填就是/你的uuid |
| `wk` | `地区代码` | **可选**。手动指定Worker地区，如：`SG`、`HK`、`US`、`JP`等 |

#### 🎯 图形化配置（推荐）
- **KV存储配置**：在Workers中创建KV命名空间，绑定环境变量 `C`
- **访问界面**：部署后访问 `/{你的UUID}` 即可使用图形化配置管理
- **实时生效**：通过界面修改配置无需重新部署，立即生效

#### 🔧 高级控制
| 变量名 | 值 | 说明 |
| :--- | :--- | :--- |
| `yx` | `自定义优选IP/域名` | **可选**。支持节点命名，格式：`1.1.1.1:443#香港节点,8.8.8.8:53#Google DNS` |
| `yxURL` | `优选IP来源URL` | **可选**。自定义优选IP列表来源URL，留空则使用默认地址 |
| `qj` | `no` | **可选**。降级控制，设置为`no`时启用降级模式：CF直连失败→SOCKS5连接→fallback地址 |
| `dkby` | `yes` | **可选**。TLS控制，设置为`yes`时只生成TLS节点，不生成非TLS节点（如80端口） |
| `yxby` | `yes` | **可选**。优选控制，设置为`yes`时关闭所有优选功能，只使用原生地址，不生成优选IP和域名节点 |
| `rm` | `no` | **可选**。地区匹配控制，设置为`no`时关闭地区智能匹配 |
| `apiEnabled` | `yes` | **可选**。API管理开关，设置为`yes`时允许通过API动态管理优选IP（默认关闭） |

#### 📦 KV存储设置（可选但推荐）
1. 在Cloudflare Workers中创建KV命名空间
2. 在Workers设置中绑定KV命名空间，变量名设为 `C`
3. 重新部署Workers
4. 访问 `/{你的UUID}` 即可使用图形化配置管理

#### 🔑 API快速开始
1. https://github.com/byJoey/yx-tools/releases 优选软件
2. **开启API功能**：访问 `/{UUID}` → 找到"允许API管理"→ 选择"开启API管理"→ 保存
3. **添加单个IP**：
```bash
curl -X POST "https://your-worker.workers.dev/{UUID}/api/preferred-ips" \
  -H "Content-Type: application/json" \
  -d '{"ip": "1.2.3.4", "port": 443, "name": "香港节点"}'
```
3. **批量添加IP**：
```bash
curl -X POST "https://your-worker.workers.dev/{UUID}/api/preferred-ips" \
  -H "Content-Type: application/json" \
  -d '[
    {"ip": "1.2.3.4", "port": 443, "name": "节点1"},
    {"ip": "5.6.7.8", "port": 8443, "name": "节点2"}
  ]'
```
4. **一键清空**：
```bash
curl -X DELETE "https://your-worker.workers.dev/{UUID}/api/preferred-ips" \
  -H "Content-Type: application/json" \
  -d '{"all": true}'
```

###  新功能

#### 🎯 图形化配置管理
- **KV存储支持**：使用Cloudflare KV存储持久化配置
- **图形化界面**：访问 `/{你的UUID}` 即可使用配置管理界面
- **实时配置**：无需重新部署，配置立即生效
- **配置优先级**：KV配置 > 环境变量 > 默认值

#### 🚀 API动态管理（新增）
- **API管理**：通过RESTful API动态管理优选IP，无需修改代码
- **批量上报**：支持一次性批量添加多个优选IP
- **一键清空**：支持清空所有优选IP，快速更新列表
- **安全开关**：默认关闭，需在图形界面手动开启API功能
- **自动合并**：API添加的IP与手动配置的yx变量自动合并
- **实时同步**：API添加的IP立即在配置页面显示
- **API端点**：
  - `GET /{UUID}/api/preferred-ips` - 查询优选IP列表
  - `POST /{UUID}/api/preferred-ips` - 添加优选IP（支持单个/批量）
  - `DELETE /{UUID}/api/preferred-ips` - 删除优选IP（支持单个/全部）


#### 🌍 手动指定地区
- **地区选择**：支持手动指定Worker地区，覆盖自动检测
- **设置方式**：`wk=SG` 或通过图形化界面选择
- **支持地区**：US、SG、JP、HK、KR、DE、SE、NL、FI、GB 
- **智能显示**：系统状态会显示"手动指定地区"而非"自动检测"

#### 🏷️ 优选节点命名
- **自定义名称**：支持为优选节点设置自定义名称
- **格式支持**：`IP:端口#节点名称` 或 `IP:端口`（使用默认名称）
- **示例**：`1.1.1.1:443#香港节点,8.8.8.8:53#Google DNS`
- **默认格式**：未设置名称时自动生成 `自定义优选-IP:端口`

#### 📊 系统状态监控
- **实时检测**：显示Worker地区、检测方式、ProxyIP状态
- **智能匹配**：同地区 → 邻近地区 → 其他地区的选择逻辑
- **状态指示**：可视化显示系统运行状态和配置信息

#### 🔧 高级控制选项
- **地区匹配控制**：`rm=no` 关闭地区智能匹配
- **降级控制**：`qj=no` 启用降级模式（CF直连失败→SOCKS5→fallback）
- **TLS控制**：`dkby=yes` 只生成TLS节点，不生成非TLS节点
- **优选控制**：`yxby=yes` 关闭所有优选功能

#### 🎨 多客户端支持
- **订阅格式**：支持Clash、Surge、Sing-box、Loon、V2Ray等
- **自动转换**：根据客户端类型自动生成对应配置
- **一键获取**：图形化界面一键生成订阅链接

#### ⚡ 性能优化
- **智能优选**：每15分钟自动优选一次，保持最佳性能
- **容错机制**：多重备用方案，确保服务稳定性
- **缓存优化**：智能缓存机制，减少重复计算

###  致谢

  * 本项目基于 [zizifn/edgetunnel](https://github.com/zizifn/edgetunnel) 修改，感谢原作者的贡献。
  * 本项目内置ProxyIP 来自CM [[cmliu](https://github.com/cmliu)) ，感谢作者的贡献。
  * 本项目反代IP来着前端独苗kejiland  [[qwer-search](https://github.com/qwer-search)) ，感谢作者的贡献。
## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=byJoey/cfnew&type=Timeline)](https://www.star-history.com/#byJoey/cfnew&Timeline&LogScale)
