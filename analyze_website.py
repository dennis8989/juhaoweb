"""
網頁分析工具
用於分析網站的技術實現、框架和結構
"""

import requests
from bs4 import BeautifulSoup
import json
from urllib.parse import urlparse
import re
import urllib3

# 禁用 SSL 警告（僅用於分析目的）
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def analyze_website(url):
    """分析指定網站的技術實現"""

    print(f"正在分析: {url}\n")
    print("=" * 60)

    try:
        # 發送請求獲取網頁內容
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        # 嘗試正常請求，如果 SSL 驗證失敗則跳過驗證（僅用於分析）
        try:
            response = requests.get(url, headers=headers, timeout=10, verify=True)
        except requests.exceptions.SSLError:
            print("⚠️  SSL 證書驗證失敗，嘗試跳過驗證...")
            response = requests.get(url, headers=headers, timeout=10, verify=False)
        response.raise_for_status()

        html_content = response.text
        soup = BeautifulSoup(html_content, 'html.parser')

        # 分析結果字典
        analysis = {
            'url': url,
            'status_code': response.status_code,
            'content_type': response.headers.get('Content-Type', ''),
            'server': response.headers.get('Server', ''),
            'technologies': {},
            'structure': {},
            'resources': {}
        }

        # 1. 檢測前端框架和庫
        print("\n📦 檢測到的技術棧:")
        print("-" * 60)

        # React
        if 'react' in html_content.lower() or 'React' in html_content:
            analysis['technologies']['React'] = True
            print("✓ React")

        # Vue.js
        if 'vue' in html_content.lower() or '__vue__' in html_content:
            analysis['technologies']['Vue.js'] = True
            print("✓ Vue.js")

        # Angular
        if 'angular' in html_content.lower() or 'ng-' in html_content:
            analysis['technologies']['Angular'] = True
            print("✓ Angular")

        # jQuery
        if 'jquery' in html_content.lower():
            analysis['technologies']['jQuery'] = True
            print("✓ jQuery")

        # Bootstrap
        if 'bootstrap' in html_content.lower():
            analysis['technologies']['Bootstrap'] = True
            print("✓ Bootstrap")

        # Tailwind CSS
        if 'tailwind' in html_content.lower():
            analysis['technologies']['Tailwind CSS'] = True
            print("✓ Tailwind CSS")

        # Next.js
        if 'next' in html_content.lower() or '_next' in html_content:
            analysis['technologies']['Next.js'] = True
            print("✓ Next.js")

        # 2. 分析 HTML 結構
        print("\n📄 HTML 結構分析:")
        print("-" * 60)

        # 標題
        title = soup.find('title')
        if title:
            analysis['structure']['title'] = title.text.strip()
            print(f"標題: {title.text.strip()}")

        # Meta 標籤
        meta_tags = soup.find_all('meta')
        analysis['structure']['meta_count'] = len(meta_tags)
        print(f"Meta 標籤數量: {len(meta_tags)}")

        # 檢測 viewport meta
        viewport = soup.find('meta', attrs={'name': 'viewport'})
        if viewport:
            print("✓ 響應式設計 (viewport)")

        # 3. 分析 CSS
        print("\n🎨 CSS 分析:")
        print("-" * 60)

        css_links = soup.find_all('link', rel='stylesheet')
        inline_styles = soup.find_all('style')

        analysis['resources']['external_css'] = len(css_links)
        analysis['resources']['inline_css'] = len(inline_styles)

        print(f"外部 CSS 文件: {len(css_links)}")
        print(f"內聯 CSS 區塊: {len(inline_styles)}")

        if css_links:
            print("\n外部 CSS 文件:")
            for i, link in enumerate(css_links[:5], 1):  # 只顯示前5個
                href = link.get('href', '')
                if href:
                    print(f"  {i}. {href}")

        # 4. 分析 JavaScript
        print("\n⚙️ JavaScript 分析:")
        print("-" * 60)

        js_scripts = soup.find_all('script')
        external_js = [s for s in js_scripts if s.get('src')]
        inline_js = [s for s in js_scripts if not s.get('src')]

        analysis['resources']['external_js'] = len(external_js)
        analysis['resources']['inline_js'] = len(inline_js)

        print(f"外部 JS 文件: {len(external_js)}")
        print(f"內聯 JS 區塊: {len(inline_js)}")

        if external_js:
            print("\n外部 JS 文件:")
            for i, script in enumerate(external_js[:5], 1):  # 只顯示前5個
                src = script.get('src', '')
                if src:
                    print(f"  {i}. {src}")

        # 5. 分析圖片資源
        print("\n🖼️ 圖片資源:")
        print("-" * 60)

        images = soup.find_all('img')
        analysis['resources']['images'] = len(images)
        print(f"圖片數量: {len(images)}")

        # 檢測圖片格式
        img_formats = {}
        for img in images:
            src = img.get('src', '')
            if src:
                ext = src.split('.')[-1].lower() if '.' in src else 'unknown'
                img_formats[ext] = img_formats.get(ext, 0) + 1

        if img_formats:
            print("圖片格式分布:")
            for fmt, count in img_formats.items():
                print(f"  .{fmt}: {count}")

        # 6. 檢測特殊功能
        print("\n🔍 特殊功能檢測:")
        print("-" * 60)

        # PWA
        manifest = soup.find('link', rel='manifest')
        if manifest:
            analysis['technologies']['PWA'] = True
            print("✓ Progressive Web App (PWA)")

        # 字體
        font_links = soup.find_all('link', rel='preconnect') + soup.find_all('link', {'href': re.compile(r'fonts?')})
        if font_links:
            print("✓ 自定義字體")

        # 圖標
        favicon = soup.find('link', rel='icon') or soup.find('link', rel='shortcut icon')
        if favicon:
            print("✓ 自定義圖標")

        # 7. 檢測動畫庫
        if 'gsap' in html_content.lower() or 'greensock' in html_content.lower():
            analysis['technologies']['GSAP'] = True
            print("✓ GSAP 動畫庫")

        if 'anime' in html_content.lower() or 'animejs' in html_content.lower():
            analysis['technologies']['Anime.js'] = True
            print("✓ Anime.js 動畫庫")

        if 'three' in html_content.lower() or 'three.js' in html_content.lower():
            analysis['technologies']['Three.js'] = True
            print("✓ Three.js 3D 庫")

        # 8. 響應式設計檢測
        print("\n📱 響應式設計:")
        print("-" * 60)

        if viewport:
            print("✓ 已設置 viewport meta 標籤")

        media_queries = re.findall(r'@media', html_content)
        if media_queries:
            print(f"✓ 檢測到 {len(media_queries)} 個媒體查詢")

        # 9. 性能相關
        print("\n⚡ 性能優化:")
        print("-" * 60)

        preload = soup.find_all('link', rel='preload')
        prefetch = soup.find_all('link', rel='prefetch')
        dns_prefetch = soup.find_all('link', rel='dns-prefetch')

        if preload:
            print(f"✓ 資源預加載 ({len(preload)} 個)")
        if prefetch:
            print(f"✓ 資源預取 ({len(prefetch)} 個)")
        if dns_prefetch:
            print(f"✓ DNS 預解析 ({len(dns_prefetch)} 個)")

        # 10. 總結
        print("\n" + "=" * 60)
        print("📊 分析總結:")
        print("-" * 60)
        print(f"網址: {url}")
        print(f"狀態碼: {response.status_code}")
        if analysis['structure'].get('title'):
            print(f"標題: {analysis['structure']['title']}")
        print(f"檢測到的技術: {', '.join(analysis['technologies'].keys()) if analysis['technologies'] else '未檢測到特定框架'}")

        # 保存詳細結果到 JSON
        with open('website_analysis.json', 'w', encoding='utf-8') as f:
            json.dump(analysis, f, ensure_ascii=False, indent=2)

        print("\n✓ 詳細分析結果已保存到 website_analysis.json")

        return analysis

    except requests.exceptions.RequestException as e:
        print(f"❌ 錯誤: 無法訪問網站 - {e}")
        return None
    except Exception as e:
        print(f"❌ 錯誤: {e}")
        return None

if __name__ == "__main__":
    url = "https://andrewisfrequency.com/"
    analyze_website(url)

