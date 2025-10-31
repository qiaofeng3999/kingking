/**
 * =================================================================
 * Nezha-UI 访客信息显示模块
 * @description 获取并显示访客信息，代码更紧凑。
 * =================================================================
 */

// ------------------ 访客信息配置 ------------------
window.VisitorInfoAutoHideDelay = 2600; // 首次加载时自动隐藏的延迟时间 (毫秒)

// ------------------ 工具函数 ------------------
/**
 * 将国家代码转换为国旗Emoji。
 * @param {string} countryCode - 两位的国家代码 (例如 "US")。
 * @returns {string} 对应的国旗Emoji。
 */
function countryCodeToFlagEmoji(countryCode) {
  if (!countryCode || countryCode.length !== 2) return "";
  return String.fromCodePoint(
    ...[...countryCode.toUpperCase()].map((c) => c.charCodeAt(0) + 0x1f1a5)
  );
}

/**
 * 从User Agent中获取操作系统信息。
 * @returns {string} 操作系统名称和位数。
 */
function getOS() {
  const ua = navigator.userAgent;
  const osMap = [
    { r: /Windows NT 10\.0/, n: "Windows 10/11" },
    { r: /Windows NT 6\.3/, n: "Windows 8.1" },
    { r: /Windows NT 6\.2/, n: "Windows 8" },
    { r: /Windows NT 6\.1/, n: "Windows 7" },
    { r: /Mac OS X/, n: "macOS" },
    { r: /Android/, n: "Android" },
    { r: /iPhone|iPad|iPod/, n: "iOS" },
    { r: /Linux/, n: "Linux" },
  ];
  let os = osMap.find(({ r }) => r.test(ua))?.n || "Unknown OS";
  let bit = "";
  if (os.startsWith("Windows"))
    bit = /WOW64|Win64/.test(ua) ? "64-bit" : "32-bit";
  if (os === "macOS") bit = /MacIntel/.test(ua) ? "64-bit" : "32-bit";
  return `${os} ${bit}`.trim();
}

/**
 * 从User Agent中获取浏览器信息。
 * @returns {string} 浏览器名称和版本。
 */
function getBrowser() {
  const ua = navigator.userAgent;
  const browserMap = [
    { r: /Edg\/([\d.]+)/, n: "Edge" },
    { r: /OPR\/([\d.]+)/, n: "Opera" },
    { r: /Chrome\/([\d.]+)/, n: "Chrome", e: /Edg|OPR/ },
    { r: /Firefox\/([\d.]+)/, n: "Firefox" },
    { r: /Version\/([\d.]+).*Safari/, n: "Safari" },
  ];
  for (const { r, n, e } of browserMap) {
    if (e?.test(ua)) continue;
    const match = ua.match(r);
    if (match) return `${n} ${match[1]}`;
  }
  return "Unknown Browser";
}

/**
 * 获取当前本地化的日期和星期。
 * @returns {string} 格式化的日期字符串。
 */
function getCurrentDate() {
  const date = new Date();
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  };
  return date.toLocaleDateString("en-US", options);
}

function initVisitorInfo() {
  // (重构) 并行获取两个数据源，然后合并
  const ipinfoPromise = fetch("https://ipinfo.io/json/")
    .then((res) => res.json())
    .catch((err) => {
      console.warn("获取 ipinfo.io 信息失败:", err);
      return {}; // 失败时返回空对象，不中断流程
    });

  const ipapiPromise = fetch("https://ipapi.co/json/")
    .then((res) => res.json())
    .catch((err) => {
      console.warn("获取 ipapi.co 信息失败:", err);
      return {}; // 失败时返回空对象
    });

  Promise.all([ipinfoPromise, ipapiPromise])
    .then(([ipinfoData, ipapiData]) => {
      // 合并数据：ipapi作为补充，ipinfo作为主要来源（会覆盖同名字段）
      const mergedData = { ...ipapiData, ...ipinfoData };
      displayVisitorInfo(mergedData);
    })
    .catch((err) => {
      console.error("无法获取任何访客信息:", err);
      displayVisitorInfo({}); // 极端情况下使用空数据展示
    });

  // (重构) 改为函数声明以支持提升，供fetch调用
  function displayVisitorInfo(data) {
    // =================================================================
    // 1. 创建并填充信息容器 (Create and Populate Info Container)
    // =================================================================
    const container = document.createElement("div");
    document.body.appendChild(container);
    let btn = null; // 声明按钮变量以在函数作用域内访问

    // 基本样式 (Base Styles)
    Object.assign(container.style, {
      position: "fixed",
      zIndex: "1000",
      padding: "10px",
      borderRadius: "5px",
      fontSize: "14px",
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
      display: "none", // 默认隐藏 (Hidden by default)
    });

    // 填充内容 (Populate Content)
    const flag = countryCodeToFlagEmoji(data.country || "");
    let countryFullName = "";
    if (data.country) {
      try {
        // 使用 Intl.DisplayNames 获取国家全称 (英文)
        countryFullName = new Intl.DisplayNames(["en"], {
          type: "region",
        }).of(data.country);
      } catch (e) {
        console.warn(`无法获取国家名称: ${data.country}`, e);
        countryFullName = data.country; // 降级为国家代码
      }
    }
    const asnInfo = data.asn || data.org || "N/A";
    const infoContent = [
      {
        name: "Country",
        value: `${flag} ${countryFullName} ${data.region || ""} ${
          data.city || ""
        }`.trim(),
        icon: "icon-earth-full",
      },
      {
        name: "Date",
        value: getCurrentDate(),
        icon: "icon-calendar-days",
      },
      {
        name: "IP Info",
        value: data.ip || "Unknown",
        icon: "icon-location-dot",
      },
      {
        name: "ASN",
        value: asnInfo,
        icon: "icon-shenfengzheng",
      }, // 新增ASN信息
      { name: "System", value: getOS(), icon: "icon-hollow-computer" },
      { name: "Browser", value: getBrowser(), icon: "icon-guge" },
    ];

    // 使用 innerHTML 和模板字符串大幅简化 DOM 创建
    container.innerHTML = infoContent
      .map(
        (item) => `
        <div style="display: flex; align-items: center; margin-bottom: 2px;">
          <i class="iconfont ${item.icon}" style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;"></i>
          <span style="font-weight: bold; margin-left: 4px;">${item.name}:&nbsp;</span>
          <span>${item.value}</span>
        </div>`
      )
      .join("");

    // =================================================================
    // 2. 主题适配 (Theme Adaptation)
    // =================================================================
    const updateTheme = () => {
      // 优先使用 <html> 的 data-theme 属性，其次是 class，最后是系统设置
      const theme = document.documentElement.getAttribute("data-theme");
      const isDark =
        theme === "dark" ||
        document.documentElement.classList.contains("dark") ||
        (theme !== "light" &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);

      Object.assign(container.style, {
        backgroundColor: isDark
          ? "rgba(30, 30, 30, 0.85)"
          : "rgba(255, 255, 255, 0.85)",
        color: isDark ? "#fff" : "#333",
      });
      container.querySelectorAll("i.iconfont").forEach((icon) => {
        icon.style.color = isDark ? "#ffffff" : "#242c36";
      });

      // (新增) 如果按钮存在，则更新其背景颜色
      if (btn) {
        btn.style.backgroundColor = isDark ? "#2d363d" : "#4f6980";
      }
    };

    // 首次加载时更新主题
    updateTheme();
    // 监听系统主题变化
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", updateTheme);
    // 监听自定义的主题切换事件（来自 initThemeAutoSwitch）
    document.documentElement.addEventListener("themechange", updateTheme);

    // 新增：使用 MutationObserver 监听主题变化，以兼容Nezha面板的手动主题切换
    const themeObserver = new MutationObserver(updateTheme);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class"],
    });

    // =================================================================
    // 3. 根据设备类型设置显示逻辑 (Device-specific Display Logic)
    // =================================================================
    if (window.innerWidth > 768) {
      /**
       * -----------------------------------------------------------------
       * 电脑端显示逻辑 (Desktop View Logic)
       * - 信息框固定在右下角。
       * - 有一个可点击的按钮来切换信息框的显示/隐藏。
       * - 首次加载时自动显示3秒后隐藏，按钮变为半透明。
       * -----------------------------------------------------------------
       */

      // 设置容器位置
      Object.assign(container.style, {
        right: "20px",
        bottom: "20px",
        width: "auto",
      });

      // 创建切换按钮
      btn = document.createElement("button");
      const icon = document.createElement("i");
      icon.className = "iconfont icon-footprint-full";
      Object.assign(icon.style, { color: "#ffffff", fontSize: "22px" });
      Object.assign(btn.style, {
        position: "fixed",
        right: "20px",
        bottom: "20px",
        zIndex: "1100",
        transition: "opacity 0.3s, background-color 0.3s ease", // (修改) 新增背景颜色过渡
        cursor: "pointer",
        // backgroundColor 由 updateTheme 控制
        border: "none",
        boxShadow: "0 2px 8px rgba(45,54,61,.5)",
        width: "40px", // 【按钮宽度】在这里修改按钮的宽度
        height: "40px", // 【按钮高度】在这里修改按钮的高度
        padding: "0",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      });
      btn.append(icon);
      document.body.append(btn);

      // (新增) 首次创建按钮后，立即应用一次主题颜色
      updateTheme();

      // 定义显示/隐藏逻辑
      const handleClickOutside = (e) =>
        !container.contains(e.target) && hideContainer();

      const showContainer = ({ autoHide = false } = {}) => {
        container.style.display = "block";
        container.style.opacity = "1"; // 确保完全显示
        container.style.transition = "opacity 0.3s ease"; // 添加过渡效果
        btn.style.display = "none";

        if (autoHide) {
          clearTimeout(window._autoHideTimer); // 清除旧的计时器
          window._autoHideTimer = setTimeout(
            hideContainer,
            window.VisitorInfoAutoHideDelay || 2600
          );
        } else {
          setTimeout(
            () => document.addEventListener("click", handleClickOutside),
            0
          );
        }
      };

      const hideContainer = () => {
        // 先设置一个短暂的过渡效果
        container.style.transition = "opacity 0.3s ease";
        container.style.opacity = "0";

        // 延迟隐藏容器，等待淡出效果完成
        setTimeout(() => {
          container.style.display = "none";
          btn.style.display = "flex";
          btn.style.opacity = "1";
          document.removeEventListener("click", handleClickOutside);

          // 完全匹配音乐播放器的延迟时间
          window._opacityTimer = setTimeout(() => {
            if (container.style.display === "none") btn.style.opacity = "0.3";
          }, 2600);
        }, 300);
      };

      // 绑定事件
      btn.onclick = (e) => {
        e.stopPropagation();
        showContainer({ autoHide: false });
      };
      btn.onmouseenter = () => {
        btn.style.opacity = "1";
      };
      btn.onmouseleave = () => {
        if (container.style.display === "none") btn.style.opacity = "0.3";
      };

      // (新增) 页面可见性变化处理，修复切回标签页时的显示问题
      document.addEventListener("visibilitychange", () => {
        if (document.hidden || window.innerWidth <= 768) {
          return; // 只在桌面端且页面可见时操作
        }

        // 当页面恢复可见时，像首次加载一样，自动展开面板并延时收起
        showContainer({ autoHide: true });
      });

      // 初始显示
      showContainer({ autoHide: true });

      // 监听窗口大小变化
      window.addEventListener("resize", () => {
        if (window.innerWidth > 768) {
          btn.style.display =
            container.style.display === "none" ? "flex" : "none";
        } else {
          // 如果缩小到手机尺寸，隐藏桌面端元素
          btn.style.display = "none";
          document.removeEventListener("click", handleClickOutside);
          // 注意：此处的逻辑并未完全切换到手机模式，仅做隐藏处理
        }
      });
    } else {
      /**
       * -----------------------------------------------------------------
       * 手机端显示逻辑 (Mobile View Logic)
       * - 首次访问时，信息框在底部弹出显示3秒，然后自动消失。
       * - 消失后，恢复为原版逻辑：滚动到页面最底部时才显示。
       * -----------------------------------------------------------------
       */

      // 1. 首次加载时动画显示
      Object.assign(container.style, {
        position: "fixed",
        left: "0",
        bottom: "0",
        width: "100%",
        display: "block",
        transition: "opacity 0.5s ease-in-out, transform 0.5s ease-in-out",
        transform: "translateY(0)",
        opacity: "1",
      });

      // 2. 3秒后动画消失
      setTimeout(() => {
        container.style.opacity = "0";
        container.style.transform = "translateY(100%)";

        // 3. 动画结束后，切换为滚动到底部显示
        setTimeout(() => {
          Object.assign(container.style, {
            position: "absolute",
            display: "none",
            opacity: "1",
            transform: "translateY(0)",
          });
          container.style.bottom = ""; // 移除fixed定位的bottom属性

          window.addEventListener("scroll", () => {
            container.style.display =
              window.scrollY + window.innerHeight >=
              document.body.scrollHeight
                ? "block"
                : "none";
          });
        }, 500); // 等待淡出动画完成
      }, window.VisitorInfoAutoHideDelay || 2000); // 使用配置的时间
    }
  }
}

// ================================================================
// 自动初始化
// ================================================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initVisitorInfo);
} else {
  initVisitorInfo();
}
