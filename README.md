# DGUT 知行系统辅助工具

这是一个为东莞理工学院知行系统设计的辅助工具集合，包含一个用于 API 测试的 Python 脚本和一个用于自动化选课的浏览器用户脚本。

## 目录结构

- `py/`: 包含 Python 相关的代码和配置，主要用于测试知行系统的 API 连通性。
- `userscript/`: 包含一个浏览器用户脚本，用于在选课页面提供定时自动选课功能。

## Python 项目 (`py/`)

### 描述
`py/` 目录包含一个 Python 项目，主要用于验证知行系统 API 的可用性，特别是通过 `h5-Token` 进行身份认证。`test.py` 脚本会尝试使用提供的 Token 访问课程列表 API，并打印返回结果，以帮助用户确认 Token 是否有效以及 API 是否正常工作。

### 文件说明
- [`py/pyproject.toml`](py/pyproject.toml): Python 项目的配置，定义了项目依赖和元数据。
- [`py/test.py`](py/test.py):
    - **功能**: 使用 `requests` 库向知行系统的课程列表 API 发送 GET 请求。
    - **认证**: 需要一个 `h5-Token` 作为 `Authorization` 请求头的一部分。
    - **目的**: 验证 `h5-Token` 的有效性，并检查是否能成功获取课程数据。
    - **错误处理**: 包含对 200 (成功)、401 (未授权/Token 过期) 和其他 HTTP 状态码的错误处理，以及网络异常处理。

### 安装

1.  进入 `py/` 目录：
    ```bash
    cd py
    ```
2.  创建并激活虚拟环境（如果尚未创建）：
    ```bash
    python -m venv .venv
    # Windows
    .venv\Scripts\activate
    # macOS/Linux
    source .venv/bin/activate
    ```
3.  安装依赖：
    ```bash
    pip install -e .
    ```

### 使用

1.  **获取 `h5-Token`**:
    *   登录知行系统。
    *   打开浏览器的开发者工具 (F12)。
    *   在“网络” (Network) 标签页中，找到任意一个对 `zxs.dgut.edu.cn` 的请求。
    *   查看请求头 (Request Headers)，找到 `Authorization` 字段，复制 `Bearer ` 后面的 Token 字符串。
    *   将此 Token 粘贴到 [`py/test.py`](py/test.py) 文件中的 `h5_token` 变量。
2.  运行 `test.py` 文件：
    ```bash
    python test.py
    ```
    脚本将输出 API 请求的结果，帮助您判断 Token 是否有效。

## 用户脚本 (`userscript/`)

### 描述
`userscript/` 目录包含一个名为 [`userscript.js`](userscript/userscript.js) 的浏览器用户脚本。该脚本旨在东莞理工学院知行系统的选课页面 (`https://zxs.dgut.edu.cn/h5/applyClass*`) 提供一个图形化界面，实现课程的定时自动选择、处理二次确认弹窗，并尝试监视和应对后续的提交步骤。

### 文件说明
- [`userscript/userscript.js`](userscript/userscript.js):
    - **版本**: v1.8
    - **功能**:
        - **UI 界面**: 在选课页面右侧注入一个可操作的面板，包含课程选择、抢课日期/时间设置、提前点击偏移量等。
        - **课程扫描**: 自动扫描当前页面上的课程列表，并填充到选择器中。
        - **定时器**: 根据用户设定的日期和时间，精确倒计时并在指定时间触发点击操作。
        - **超真实点击模拟**: 使用 `pointerdown`, `mousedown`, `pointerup`, `mouseup`, `click` 等事件序列模拟真实用户点击，以提高成功率。
        - **二次确认处理**: 自动检测并点击选课过程中的二次确认弹窗。
        - **后续步骤监视 (v1.8 新增)**: 使用 `MutationObserver` 监视页面 DOM 变化，以检测并处理选课成功后的最终确认或提交按钮，同时也能检测“名额已满”等失败信息。
        - **样式注入**: 使用 `GM_addStyle` 注入自定义 CSS 样式，美化 UI 界面。

### 使用

1.  **安装用户脚本管理器**:
    *   在您的浏览器（如 Chrome, Firefox, Edge）中安装一个用户脚本管理器扩展，例如 [Tampermonkey](https://www.tampermonkey.net/) 或 [Greasemonkey](https://www.greasemonkey.net/)。
2.  **导入脚本**:
    *   打开您的用户脚本管理器仪表板。
    *   创建一个新脚本，然后将 [`userscript/userscript.js`](userscript/userscript.js) 的全部内容复制并粘贴到新脚本中。
    *   保存脚本。
3.  **访问选课页面**:
    *   导航到东莞理工学院知行系统的选课页面 (`https://zxs.dgut.edu.cn/h5/applyClass*`)。
    *   页面加载后，用户脚本界面将自动显示在页面右侧。
4.  **配置和启动**:
    *   点击“扫描/刷新”按钮以加载当前页面上的课程列表。
    *   从下拉菜单中选择您想要抢的课程。
    *   设置抢课的“抢课日期”和“抢课时间”（精确到秒）。
    *   根据网络延迟，调整“提前点击 (毫秒)”的数值（默认为 200 毫秒）。
    *   点击“✅ 武装并启动定时”按钮。
    *   确保您的电脑时间与互联网时间同步，以保证定时器的准确性。

## 贡献

欢迎提交问题和拉取请求。如果您发现任何 bug 或有改进建议，请随时提出。

## 许可证

[在此处填写您的许可证信息，例如 MIT 或 Apache 2.0]