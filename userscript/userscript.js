// ==UserScript==
// @name         DGUT 知行课程定时选择助手
// @namespace    http://tampermonkey.net/
// @version      1.8
// @description  在东莞理工学院知行系统选课页面提供图形化界面，定时自动选择课程，处理二次确认，并尝试应对后续步骤。
// @author       twj0
// @match        https://zxs.dgut.edu.cn/h5/applyClass*
// @grant        GM_addStyle
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // --- Hyper-Realistic Click Simulation Function ---
    function simulateHyperRealisticClick(element) {
        if (!element) return;
        const eventOptions = { bubbles: true, cancelable: true, view: unsafeWindow };
        ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach(type => {
            element.dispatchEvent(new MouseEvent(type, eventOptions));
        });
        console.log(`[Hyper-Realistic Click v1.8] Dispatched event sequence on:`, element);
    }

    // --- Main initialization function ---
    function initializeScript() {
        if (document.getElementById('course-grabber-panel')) return;
        const keyElementSelector = '.list-cell';
        const interval = setInterval(() => {
            if (document.querySelector(keyElementSelector)) {
                clearInterval(interval);
                console.log('[Course Grabber] Key element detected. Initializing UI.');
                createUI();
                setTimeout(scanAndPopulateCourses, 500);
            }
        }, 500);
    }

    // --- 1. 创建并注入UI界面 (v1.8 Update) ---
    function createUI() {
        const panel = document.createElement('div');
        panel.id = 'course-grabber-panel';
        panel.innerHTML = `
            <h3>课程定时助手 v1.8</h3>
            <div class="form-group">
                <label for="course-select">选择课程:</label>
                <select id="course-select"><option value="">请扫描课程列表...</option></select>
                <button id="scan-courses-btn">扫描/刷新</button>
            </div>
            <div class="form-group">
                <label for="target-date">抢课日期:</label>
                <input type="date" id="target-date">
            </div>
            <div class="form-group">
                <label for="target-time">抢课时间 (时:分:秒):</label>
                <input type="time" id="target-time" step="1">
            </div>
            <div class="form-group">
                <label for="click-offset">提前点击 (毫秒):</label>
                <input type="number" id="click-offset" value="200" placeholder="应对网络延迟, e.g., 200">
            </div>
            <button id="start-timer-btn">✅ 武装并启动定时</button>
            <div id="status-panel">状态: 未启动</div>
            <div id="countdown-timer"></div>
            <small class="time-notice">请务必确保您的电脑时间与互联网时间同步!</small>
        `;
        document.body.appendChild(panel);

        // 设置默认时间
        document.getElementById('target-date').value = '2025-09-20';
        document.getElementById('target-time').value = '12:30:00';

        document.getElementById('scan-courses-btn').addEventListener('click', scanAndPopulateCourses);
        document.getElementById('start-timer-btn').addEventListener('click', startTimer);
    }

    // --- 2. 扫描并填充课程 ---
    function scanAndPopulateCourses() {
        console.log("正在扫描课程...");
        const courseSelect = document.getElementById('course-select');
        courseSelect.innerHTML = '<option value="">扫描中...</option>';
        const courseSpans = document.querySelectorAll('.list-cell .flex span.text-ellipsis');
        if (courseSpans.length === 0) {
            courseSelect.innerHTML = '<option value="">未找到课程</option>';
            return;
        }
        courseSelect.innerHTML = '';
        const courseNames = new Set();
        courseSpans.forEach(span => {
            const courseName = span.textContent.trim();
            if (courseName && !courseNames.has(courseName)) {
                courseNames.add(courseName);
                const option = new Option(courseName, courseName);
                courseSelect.appendChild(option);
            }
        });
        updateStatus('课程列表已刷新!', 'blue');
    }

    // --- 3. 启动定时器 ---
    let mainInterval = null;
    function startTimer() {
        if (mainInterval) clearInterval(mainInterval);
        const selectedCourseName = document.getElementById('course-select').value;
        const targetDate = document.getElementById('target-date').value;
        const targetTime = document.getElementById('target-time').value;
        const offset = parseInt(document.getElementById('click-offset').value, 10) || 0;

        if (!selectedCourseName || !targetDate || !targetTime) {
            updateStatus('错误: 请选择课程并设置完整的抢课时间!', 'red');
            return;
        }

        const targetTimestamp = new Date(`${targetDate}T${targetTime}`).getTime();
        if (isNaN(targetTimestamp)) {
            updateStatus('错误: 无效的时间格式!', 'red');
            return;
        }

        updateStatus(`武装待命, 目标: [${selectedCourseName}]`, 'green');

        mainInterval = setInterval(() => {
            const currentTime = new Date().getTime();
            const triggerTime = targetTimestamp - offset;
            const remainingTime = triggerTime - currentTime;

            if (remainingTime > 0) {
                const totalSeconds = Math.floor(remainingTime / 1000);
                const hours = Math.floor(totalSeconds / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);
                const seconds = totalSeconds % 60;
                document.getElementById('countdown-timer').textContent = `倒计时: ${hours}时 ${minutes}分 ${seconds}秒`;
            } else {
                document.getElementById('countdown-timer').textContent = '时间到! 执行操作...';
                clearInterval(mainInterval);
                mainInterval = null;
                triggerPrimaryClick(selectedCourseName);
            }
        }, 50);
    }

    // --- 4. 触发首次点击 ("办理") ---
    function triggerPrimaryClick(courseName) {
        updateStatus(`正在精确查找 [${courseName}] 的办理按钮...`, 'orange');
        const allCourseSpans = document.querySelectorAll('.list-cell .flex span.text-ellipsis');
        let applyButton = null;
        allCourseSpans.forEach(span => {
            if (span.textContent.trim() === courseName) {
                const targetCell = span.closest('.list-cell');
                if (targetCell) {
                    const innerDivs = targetCell.querySelectorAll('div');
                    for (const div of innerDivs) {
                        const hasDirectText = Array.from(div.childNodes).some(node =>
                            node.nodeType === Node.TEXT_NODE && node.textContent.trim() === '办 理'
                        );
                        if (hasDirectText) { applyButton = div; break; }
                    }
                }
            }
        });

        if (applyButton) {
            simulateHyperRealisticClick(applyButton);
            updateStatus(`已点击“办理”, 等待确认弹窗...`, 'blue');
            handleConfirmationPopup(courseName);
        } else {
            updateStatus(`失败! 未能找到 [${courseName}] 的“办理”按钮.`, 'red');
        }
    }

    // --- 5. 处理二次确认弹窗 ---
    function handleConfirmationPopup(courseName) {
        const confirmButtonSelector = '.van-dialog__confirm';
        const checker = setInterval(() => {
            const confirmButton = document.querySelector(confirmButtonSelector);
            if (confirmButton) {
                clearInterval(checker);
                simulateHyperRealisticClick(confirmButton);
                updateStatus(`已点击“确认”, 启动最终步骤监视器...`, '#00C851');
                watchForNextStep(courseName); // <--- 启动新的观察者
            }
        }, 50);
    }

    // --- 6. [NEW in v1.8] 使用 MutationObserver 监视并处理后续步骤 ---
    function watchForNextStep(courseName) {
        updateStatus(`监视器已激活, 等待最终确认界面...`, 'purple');
        const observer = new MutationObserver((mutationsList, obs) => {
            // 查找可能的新弹窗中的确认/提交按钮
            // 这里的选择器需要根据实际出现的弹窗来调整
            const finalConfirmButton = document.querySelector('.some-new-dialog .confirm-button, .another-popup .submit-btn, [role="dialog"] button:last-child');

            if (finalConfirmButton) {
                console.log('检测到最终确认按钮!', finalConfirmButton);
                updateStatus(`[成功] 已为 [${courseName}] 点击最终确认!`, 'darkgreen');
                simulateHyperRealisticClick(finalConfirmButton);
                obs.disconnect(); // 任务完成，停止观察
                return;
            }

            // 也可以在这里检测失败信息，例如“名额已满”
            const failureMessage = document.querySelector('.van-toast--text');
            if (failureMessage && failureMessage.textContent.includes('已满')) {
                 updateStatus(`[失败] 课程 [${courseName}] 名额已满!`, 'red');
                 obs.disconnect();
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        // 设置一个超时，以防万一什么都没发生，避免观察器永久运行
        setTimeout(() => {
            observer.disconnect();
            console.log('监视器超时，自动停止。');
        }, 10000); // 10秒后自动停止
    }


    // --- 7. 更新状态显示 ---
    function updateStatus(message, color) {
        const statusPanel = document.getElementById('status-panel');
        if (statusPanel) {
            statusPanel.textContent = `状态: ${message}`;
            statusPanel.style.color = color;
        }
    }

    // --- 8. 注入CSS样式 ---
    GM_addStyle(`
        #course-grabber-panel { position: fixed; top: 10px; right: 10px; width: 320px; background-color: #f9f9f9; border: 1px solid #ccc; border-radius: 8px; padding: 15px; z-index: 9999; box-shadow: 0 4px 8px rgba(0,0,0,0.2); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; font-size: 14px; }
        #course-grabber-panel h3 { margin-top: 0; text-align: center; color: #333; }
        #course-grabber-panel .form-group { margin-bottom: 12px; }
        #course-grabber-panel label { display: block; margin-bottom: 5px; font-weight: bold; color: #555; }
        #course-grabber-panel input, #course-grabber-panel select { width: 100%; padding: 8px; box-sizing: border-box; border-radius: 4px; border: 1px solid #ddd; }
        #course-grabber-panel button { width: 100%; padding: 10px; border: none; border-radius: 4px; color: white; cursor: pointer; font-size: 16px; margin-top: 5px; }
        #scan-courses-btn { background-color: #007BFF; }
        #scan-courses-btn:hover { background-color: #0056b3; }
        #start-timer-btn { background-color: #28a745; }
        #start-timer-btn:hover { background-color: #1e7e34; }
        #status-panel { margin-top: 15px; padding: 10px; background-color: #e9ecef; border-radius: 4px; text-align: center; font-weight: bold; }
        #countdown-timer { margin-top: 10px; text-align: center; font-size: 16px; color: #dc3545; font-weight: bold; }
        .time-notice { display: block; text-align: center; margin-top: 10px; font-size: 12px; color: #6c757d; }
    `);

    // --- 9. 脚本主入口 ---
    initializeScript();
})();