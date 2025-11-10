"""
詳細網頁分析工具
獲取並分析網站的完整 HTML 結構
"""

import requests
from bs4 import BeautifulSoup
import urllib3
import json

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def get_detailed_analysis(url):
    """獲取網站的詳細 HTML 內容並分析"""

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }

    try:
        response = requests.get(url, headers=headers, timeout=10, verify=False)
        response.raise_for_status()

        html_content = response.text
        soup = BeautifulSoup(html_content, 'html.parser')

        print("=" * 80)
        print("📋 完整 HTML 結構分析")
        print("=" * 80)

        # 1. 完整的 HTML 結構
        print("\n📄 完整 HTML 內容:")
        print("-" * 80)
        print(html_content[:2000])  # 顯示前 2000 個字符
        if len(html_content) > 2000:
            print(f"\n... (總共 {len(html_content)} 個字符)")

        # 2. 詳細的 head 部分
        print("\n\n🔍 HEAD 部分詳細分析:")
        print("-" * 80)
        head = soup.find('head')
        if head:
            print(head.prettify())

        # 3. 詳細的 body 部分
        print("\n\n📦 BODY 部分詳細分析:")
        print("-" * 80)
        body = soup.find('body')
        if body:
            print(body.prettify()[:3000])  # 顯示前 3000 個字符
            if len(str(body)) > 3000:
                print(f"\n... (總共 {len(str(body))} 個字符)")

        # 4. 所有 script 標籤
        print("\n\n⚙️ 所有 Script 標籤:")
        print("-" * 80)
        scripts = soup.find_all('script')
        for i, script in enumerate(scripts, 1):
            print(f"\n[{i}]")
            if script.get('src'):
                print(f"  類型: 外部腳本")
                print(f"  來源: {script.get('src')}")
            else:
                print(f"  類型: 內聯腳本")
                content = script.string or ""
                print(f"  內容長度: {len(content)} 字符")
                if content:
                    print(f"  前 200 字符: {content[:200]}")
            if script.get('type'):
                print(f"  類型屬性: {script.get('type')}")

        # 5. 所有 link 標籤
        print("\n\n🔗 所有 Link 標籤:")
        print("-" * 80)
        links = soup.find_all('link')
        for i, link in enumerate(links, 1):
            print(f"\n[{i}]")
            print(f"  rel: {link.get('rel')}")
            print(f"  href: {link.get('href')}")
            if link.get('type'):
                print(f"  type: {link.get('type')}")

        # 6. 檢測構建工具
        print("\n\n🛠️ 構建工具檢測:")
        print("-" * 80)

        # 檢測 Vite（文件名包含 hash）
        if '/assets/' in html_content and any(char.isupper() for char in html_content if '/assets/' in html_content):
            print("✓ 可能使用 Vite 構建工具（基於文件名 hash 模式）")

        # 檢測 webpack
        if 'webpack' in html_content.lower():
            print("✓ 檢測到 Webpack")

        # 檢測 Parcel
        if 'parcel' in html_content.lower():
            print("✓ 檢測到 Parcel")

        # 7. 檢測特殊庫
        print("\n\n📚 特殊庫檢測:")
        print("-" * 80)

        # flock.js 分析
        if 'flock.js' in html_content:
            print("✓ 檢測到 ~flock.js（可能是分析或追蹤工具）")

        # 保存完整 HTML
        with open('website_html.html', 'w', encoding='utf-8') as f:
            f.write(html_content)
        print("\n✓ 完整 HTML 已保存到 website_html.html")

        # 保存結構化數據
        analysis_data = {
            'url': url,
            'html_length': len(html_content),
            'scripts': [
                {
                    'src': s.get('src'),
                    'type': s.get('type'),
                    'is_inline': not bool(s.get('src')),
                    'content_length': len(s.string or "") if not s.get('src') else 0
                }
                for s in scripts
            ],
            'links': [
                {
                    'rel': link.get('rel'),
                    'href': link.get('href'),
                    'type': link.get('type')
                }
                for link in links
            ],
            'meta_tags': [
                {
                    'name': m.get('name'),
                    'property': m.get('property'),
                    'content': m.get('content')
                }
                for m in soup.find_all('meta')
            ]
        }

        with open('detailed_analysis.json', 'w', encoding='utf-8') as f:
            json.dump(analysis_data, f, ensure_ascii=False, indent=2)

        print("✓ 詳細分析數據已保存到 detailed_analysis.json")

        return analysis_data

    except Exception as e:
        print(f"❌ 錯誤: {e}")
        return None

if __name__ == "__main__":
    url = "https://andrewisfrequency.com/"
    get_detailed_analysis(url)

