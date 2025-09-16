import requests
import json

# --- 配置区域 ---
# 1. 从您提供的json文件中复制h5-Token
# 这个Token是您访问网站的身份凭证
h5_token = "eyJhbGciOiJIUzUxMiJ9.eyJsb2dpbl91c2VyX2tleSI6IjJmZjM0ODlkLWEyOWEtNDk3Mi04ZDYyLWI2NzVjYmY4NjY0ZiJ9.JR9sCGq8jtSc8Ugh2RtvIiQGOp3yBNRPnjbHY90-0YQeqsjimTiFxheJ73_LDbPPBDzfEVWIwpS4UUvhU8ZiEQ"

# 2. 目标API URL (我们从之前的curl命令中选择一个用于测试)
# 这个接口是用来获取课程列表的
test_url = "https://zxs.dgut.edu.cn/zhixing/manage/macmillanCourseApply/curriculumList?pageNum=1&pageSize=10&className="

# 3. 构造请求头 (Headers)
# 必须包含 Authorization 和 User-Agent，以模拟合法的浏览器请求
headers = {
    # 关键的身份认证信息，格式为 "Bearer <你的token>"
    "Authorization": f"Bearer {h5_token}",
    
    # 模拟一个真实的浏览器User-Agent，防止被服务器拒绝
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
    
    # 从curl命令中借鉴的其他有用header
    "Accept": "application/json, text/plain, */*"
}

# --- 执行请求 ---
print(f"[*] 正在尝试使用Token访问目标URL: {test_url}")

try:
    # 使用 requests.get() 方法发起GET请求，并传入URL和请求头
    response = requests.get(test_url, headers=headers)

    # 检查HTTP响应状态码
    if response.status_code == 200:
        print("\n[+] 请求成功 (状态码: 200)！服务器已接受您的Token。")
        
        # 尝试将返回的文本解析为JSON格式
        try:
            # 使用.json()方法直接解析返回的json数据
            data = response.json()
            print("[+] 服务器返回的数据 (JSON格式):")
            # 使用json.dumps美化输出，方便查看
            print(json.dumps(data, indent=4, ensure_ascii=False))
            
            # 检查返回的数据结构，判断是否真的获取到了课程信息
            if 'rows' in data and 'total' in data:
                print(f"\n[*] 太棒了！成功获取到 {data.get('total', 0)} 条课程数据。这证明使用此session进行操作是完全可行的！")
            else:
                print("\n[*] 注意：虽然请求成功，但返回的数据格式不符合预期，请检查返回内容。")

        except json.JSONDecodeError:
            print("\n[!] 请求成功，但服务器返回的内容不是有效的JSON格式。")
            print("[!] 服务器原始返回内容:")
            print(response.text)

    elif response.status_code == 401:
        print(f"\n[!] 请求失败 (状态码: {response.status_code} Unauthorized)！")
        print("[!] 这意味着您的 h5-Token 可能已过期或无效。请重新登录获取最新的Token。")
        print("[!] 服务器返回信息:", response.text)
        
    else:
        print(f"\n[!] 请求遇到未知错误 (状态码: {response.status_code})。")
        print("[!] 服务器返回信息:", response.text)

except requests.exceptions.RequestException as e:
    print(f"\n[!] 网络请求异常，请检查您的网络连接或目标网站是否可用。")
    print(f"[!] 错误详情: {e}")