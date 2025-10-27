<h1 align="center">پنل BPB</h1>

#### 🌏 Readme in [English](README.md)

<p align="center">
  <img src="docs/assets/images/panel-overview.jpg">
</p>
<br>

## معرفی

این پروژه یه پنل کاربری برای دسترسی به کانفیگ‌های رایگان، امن و خصوصی **VLESS**، **Trojan** و **Warp** ارائه می‌ده. حتی وقتی دامنه‌ها یا سرویس Warp توسط اپراتورها فیلتر شدن، اتصال رو تضمین می‌کنه. این پنل به دو روش راه‌اندازی می‌شه:

- با **Cloudflare Workers**
- با **Cloudflare Pages**

🌟 اگه **پنل BPB** براتون مفید بوده، با حمایتتون بهم دلگرمی می‌دید 🌟

### USDT (BEP20)

```text
0xbdf15d41C56f861f25b2b11C835bd45dfD5b792F
```

## ویژگی‌ها

- **رایگان و شخصی**: بدون هیچ هزینه‌ای، سرور شما شخصی هست.
- **پنل کاربری ساده**: کار باهاش راحته و تنظیمات و استفاده ازش خیلی آسونه.
- **پروتکل‌های متنوع**: ارائه کانفیگ‌های VLESS، Trojan و Wireguard (Warp).
- **کانفیگ‌های Warp Pro**: کانفیگ‌های Warp بهینه‌شده برای شرایط خاص ایران.
- **پشتیبانی از Fragment**: اتصال حتی در صورت فیلتر شدن دامنه.
- **قوانین مسیریابی کامل**: دور زدن سایت‌های ایرانی، چینی و روسی، مسدود کردن QUIC، محتوای پورن، تبلیغات، بدافزارها، فیشینگ و در زدن سایت‌های تحریمی.
- **زنجیره‌ی Proxy**: می‌تونید یه Proxy زنجیره‌ای از نوع VLESS، Trojan، Shadowsocks، Socks یا http اضافه کنید تا IP ثابت بشه.
- **پشتیبانی از برنامه‌های مختلف**: لینک‌های اشتراک برای برنامه‌های با هسته‌های Xray، Sing-box و Clash-Mihomo.
- **پنل امن با رمز عبور**: پنل محافظت شده با رمز عبور.
- **سفارشی‌سازی کامل**: تنظیم IP تمیز، Proxy IP، سرورهای DNS، انتخاب پورت‌ها و پروتکل‌ها، Warp Endpoint و خیلی امکانات دیگه.

## محدودیت‌ها

- **اتصال UDP**: پروتکل‌های VLESS و Trojan روی Workerها نمی‌تونن UDP رو به‌خوبی پشتیبانی کنن، برای همین به‌صورت پیش‌فرض غیرفعاله (این روی امکاناتی مثل تماس تصویری تلگرام تأثیر می‌ذاره). DNSهای UDP هم پشتیبانی نمی‌شن. به جاش DoH فعاله که امن‌تره.
- **محدودیت تعداد درخواست**: هر Worker برای VLESS و Trojan روزانه 100 هزار درخواست پشتیبانی می‌کنه، که برای 2-3 نفر کافیه. برای اتصال نامحدود می‌تونید از کانفیگ‌های Warp استفاده کنید.

## شروع به کار

- [روش‌های راه‌اندازی](https://bia-pain-bache.github.io/BPB-Worker-Panel/fa/installation/wizard/)
- [راهنمای تنظیمات](https://bia-pain-bache.github.io/BPB-Worker-Panel/fa/configuration/)
- [نحوه‌ی استفاده](https://bia-pain-bache.github.io/BPB-Worker-Panel/fa/usage/)
- [پرسش‌های متداول (FAQ)](https://bia-pain-bache.github.io/BPB-Worker-Panel/en/faq/)

## برنامه‌های پشتیبانی شده

<div dir="rtl">

|       Client        |     Version      | پشتیبانی از Fragment | پشتیبانی از Warp Pro |
| :-----------------: | :--------------: | :------------------: | :------------------: |
|     **v2rayNG**     | 1.10.11 و بالاتر |  :heavy_check_mark:  |  :heavy_check_mark:  |
|     **MahsaNG**     |   14 و بالاتر    |  :heavy_check_mark:  |  :heavy_check_mark:  |
|     **v2rayN**      | 7.14.6 و بالاتر  |  :heavy_check_mark:  |  :heavy_check_mark:  |
|   **v2rayN-PRO**    |   2.0 و بالاتر   |  :heavy_check_mark:  |  :heavy_check_mark:  |
|    **Sing-box**     | 1.12.0 و بالاتر  |  :heavy_check_mark:  |         :x:          |
|    **Streisand**    | 1.6.60 و بالاتر  |  :heavy_check_mark:  |  :heavy_check_mark:  |
|   **Clash Meta**    |                  |         :x:          |  :heavy_check_mark:  |
| **Clash Verge Rev** |                  |         :x:          |  :heavy_check_mark:  |
|     **FLClash**     |                  |         :x:          |  :heavy_check_mark:  |
|   **AmneziaVPN**    |                  |         :x:          |  :heavy_check_mark:  |
|    **WG Tunnel**    |                  |         :x:          |  :heavy_check_mark:  |

</div>

## متغیرهای محیطی (داشبورد کلادفلر)

<div dir="rtl">

|   Variable   |               Usage               |
| :----------: | :-------------------------------: |
|   **UUID**   |      UUID برای پروتکل VLESS       |
| **TR_PASS**  |        پسورد پروتکل Trojan        |
| **PROXY_IP** |   Proxy IP برای VLESS و Trojan    |
|  **PREFIX**  | NAT64 Prefix برای VLESS و Trojan  |
| **SUB_PATH** |     مسیر لینک‌های اشتراک شخصی     |
| **FALLBACK** | دامنه‌ی پوششی برای VLESS و Trojan |
| **DOH_URL**  |    DOH برای عملیات داخلی ورکر     |

</div>

---

## تعداد ستاره‌ها به مرور زمان

[![تعداد ستاره‌ها به مرور زمان](https://starchart.cc/bia-pain-bache/BPB-Worker-Panel.svg?variant=adaptive)](https://starchart.cc/bia-pain-bache/BPB-Worker-Panel)

---

### تشکر ویژه

- نویسنده پروتکل‌های VLESS و Trojan [پروکسی Cloudflare-workers/pages](https://github.com/yonggekkk/Cloudflare-workers-pages-vless)
- نویسنده کد CF-vless [3Kmfi6HP](https://github.com/3Kmfi6HP/EDtunnel)
- نویسنده برنامه IP ترجیحی CF [badafans](https://github.com/badafans/Cloudflare-IP-SpeedTest)، [XIU2](https://github.com/XIU2/CloudflareSpeedTest)
