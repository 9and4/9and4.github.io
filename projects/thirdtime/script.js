
let workTime = 0; // 当前工作时间（秒）
let restTime = 0; // 当前休息时间（秒）
let totalTime = 30; // 用户输入的总时长（分钟），默认30分钟
let remainingTotalTime = totalTime * 60; // 剩余总时间（秒），初始为总时长
let earnedRestTime = 0; // 已挣得的休息时间（秒）
let isWorking = false; // 是否正在工作
let isResting = false; // 是否正在休息
let interval; // 计时器
let isDarkMode = false; // 是否暗黑模式

let isInDebt = false; // 记录是否处于欠费状态
let debtAlpha = 0; // 当前欠费透明度
const maxDebtAlpha = 1; // 最大欠费透明度

let presenceInterval; // 用于存储定时器

// 初始化设置
let { presenceEnabled, selectedPresemceSound, intervalMinutes, selectedDebtSound, selectedWorkBGM, selectedRestBGM, selectedOverSound } = loadSettings();
let noticeAudio = new Audio(localStorage.getItem('selectedPresemceSound') || 'notification/ienba-notification.wav'); 
let alertAudio = new Audio(localStorage.getItem('selectedDebtSound') || 'notification/software-interface-start.wav'); //默认欠费提示音
let OverAudio = new Audio(localStorage.getItem('selectedOverSound') || 'notification/joepayne-clean-and-pompous-fanfare-trumpet.mp3'); //默认计时结束提示音
let workAudio = new Audio(localStorage.getItem('selectedWorkBGM') || 'bgm/wall-clock-tick-tock.wav');
let restAudio = new Audio(localStorage.getItem('selectedRestBGM') || 'bgm/small-waves-harbor-rocks.wav');

// 设置背景音循环播放
workAudio.loop = true;
restAudio.loop = true;

// 展开或折叠“设置”界面
function toggleSettings() {
    const settingsSection = document.getElementById('settings');
    settingsSection.classList.toggle('expanded');
}

// 展开或折叠“鸣谢”界面
function toggleThx() {
    const thxSection = document.getElementById('thx');
    thxSection.classList.toggle('expanded');
}

// 切换复选框
function toggleCheckbox() {
    const checkbox = document.getElementById('presence-toggle');
    checkbox.checked = !checkbox.checked;
}

// 加载用户设置
function loadSettings() {
    const presenceEnabled = localStorage.getItem('presenceEnabled') === 'true';
    const selectedPresemceSound = localStorage.getItem('selectedPresemceSound') || 'notification/ienba-notification.wav'; // 默认 presence 提示音
    const intervalMinutes = parseInt(localStorage.getItem('intervalMinutes'), 10) || 5;
    const selectedDebtSound = localStorage.getItem('selectedDebtSound') || 'notification/software-interface-start.wav'; // 默认欠费提示音
    const selectedOverSound = localStorage.getItem('selectedOverSound') || 'notification/joepayne-clean-and-pompous-fanfare-trumpet.mp3'; // 默认计时完毕提示音
    const selectedWorkBGM = localStorage.getItem('selectedWorkBGM') || 'bgm/wall-clock-tick-tock.wav'; // 默认工作背景音乐
    const selectedRestBGM = localStorage.getItem('selectedRestBGM') || 'bgm/small-waves-harbor-rocks.wav'; // 默认休息背景音乐

    // 更新界面
    document.getElementById('presence-toggle').checked = presenceEnabled;
    document.getElementById('presence-sound-select').value = selectedPresemceSound;
    document.getElementById('interval-input').value = intervalMinutes;
    document.getElementById('debt-sound-select').value = selectedDebtSound; // 设置欠费提示音
    document.getElementById('over-sound-select').value = selectedOverSound; // 设置计时完毕提示音 
    document.getElementById('work-bgm-select').value = selectedWorkBGM; // 设置工作背景音乐
    document.getElementById('rest-bgm-select').value = selectedRestBGM; // 设置休息背景音乐

    return { presenceEnabled, selectedPresemceSound, intervalMinutes, selectedDebtSound, selectedWorkBGM, selectedRestBGM, selectedOverSound };
}

// 页面加载时初始化设置
window.addEventListener('load', () => {
    loadSettings();
});

// 保存 用户设置
document.getElementById('save-settings').addEventListener('click', () => {
    const presenceEnabled = document.getElementById('presence-toggle').checked;
    const selectedPresemceSound = document.getElementById('presence-sound-select').value;
    const intervalMinutes = parseInt(document.getElementById('interval-input').value, 10);
    const selectedDebtSound = document.getElementById('debt-sound-select').value; // 获取用户选择的欠费提示音
    const selectedOverSound = document.getElementById('over-sound-select').value; // 获取用户选择的计时完毕提示音
    const selectedWorkBGM = document.getElementById('work-bgm-select').value; // 获取用户选择的工作背景音乐
    const selectedRestBGM = document.getElementById('rest-bgm-select').value; // 获取用户选择的休息背景音乐

    localStorage.setItem('presenceEnabled', presenceEnabled);
    localStorage.setItem('selectedPresemceSound', selectedPresemceSound);
    localStorage.setItem('intervalMinutes', intervalMinutes);
    localStorage.setItem('selectedDebtSound', selectedDebtSound); // 保存欠费提示音
    localStorage.setItem('selectedOverSound', selectedOverSound); // 保存计时完毕提示音
    localStorage.setItem('selectedWorkBGM', selectedWorkBGM); // 保存工作背景音乐
    localStorage.setItem('selectedRestBGM', selectedRestBGM); // 保存休息背景音乐

    // 更新音频对象的 src
    workAudio.src = selectedWorkBGM || ''; // 如果用户选择关闭背景音乐，src 为空
    restAudio.src = selectedRestBGM || ''; // 如果用户选择关闭背景音乐，src 为空

    // 停止试听音频
    if (previewAudio) {
        previewAudio.pause();
        previewAudio.currentTime = 0;
    }
    
    noticeAudio = new Audio(selectedPresemceSound); // 重新加载 拍拍（presence） 提示音
    alertAudio = new Audio(selectedDebtSound); // 重新加载 欠费提示音
    OverAudio = new Audio(selectedOverSound); // 重新加载 计时完毕提示音

    // 如果正在工作，重新启动 presence 功能
    if (isWorking) {
        stopPresence();
        startPresence();
    }

    alert('设置已保存！');
});

// 添加事件监听器，当用户选择不同的 拍拍 提示音时，播放该提示音
document.getElementById('presence-sound-select').addEventListener('change', (event) => {
    const selectedPresemceSound = event.target.value;
    if (noticeAudio) {
        noticeAudio.pause(); // 停止当前正在播放的提示音
        alertAudio.pause(); 
        OverAudio.pause(); 
        noticeAudio.currentTime = 0; // 重置音频播放位置
        alertAudio.currentTime = 0; 
        OverAudio.currentTime = 0; 
    }
    noticeAudio = new Audio(selectedPresemceSound); // 加载新的提示音
    noticeAudio.play(); // 播放新的提示音
});

// 添加事件监听器，当用户选择不同的 欠费 提示音时，播放该提示音
document.getElementById('debt-sound-select').addEventListener('change', (event) => {
    const selectedDebtSound = event.target.value;
    if (alertAudio) {
        noticeAudio.pause(); // 停止当前正在播放的提示音
        alertAudio.pause(); 
        OverAudio.pause(); 
        noticeAudio.currentTime = 0; // 重置音频播放位置
        alertAudio.currentTime = 0; 
        OverAudio.currentTime = 0; 
    }
    alertAudio = new Audio(selectedDebtSound); // 加载新的提示音
    alertAudio.play(); // 播放新的提示音
});

// 添加事件监听器，当用户选择不同的 计时完毕 提示音时，播放该提示音
document.getElementById('over-sound-select').addEventListener('change', (event) => {
    const selectedOverSound = event.target.value;
    if (OverAudio) {
        noticeAudio.pause(); // 停止当前正在播放的提示音
        alertAudio.pause(); 
        OverAudio.pause(); 
        noticeAudio.currentTime = 0; // 重置音频播放位置
        alertAudio.currentTime = 0; 
        OverAudio.currentTime = 0; 
    }
    OverAudio = new Audio(selectedOverSound); // 加载新的提示音
    OverAudio.play(); // 播放新的提示音
});

let previewAudio = null; // 用于试听的音频对象

// 添加事件监听器，当用户选择不同的工作背景音乐时，试听该背景音乐
document.getElementById('work-bgm-select').addEventListener('change', (event) => {
    const selectedWorkBGM = event.target.value;
    if (selectedWorkBGM) {
        playPreview(selectedWorkBGM); // 试听选中的背景音乐
    }
});

// 添加事件监听器，当用户选择不同的休息背景音乐时，试听该背景音乐
document.getElementById('rest-bgm-select').addEventListener('change', (event) => {
    const selectedRestBGM = event.target.value;
    if (selectedRestBGM) {
        playPreview(selectedRestBGM); // 试听选中的背景音乐
    }
});

// 试听背景音乐
function playPreview(audioSrc) {
    if (previewAudio) {
        previewAudio.pause();  // 停止之前的试听
        previewAudio.currentTime = 0;
    }

    // 创建新的试听音频对象
    previewAudio = new Audio(audioSrc);

    // 播放试听
    previewAudio.play();

    // 10 秒后自动停止试听
    setTimeout(() => {
        if (previewAudio && !previewAudio.paused) {
            previewAudio.pause();
            previewAudio.currentTime = 0;
        }
    }, 10000); // 试听时长为 10 秒
}

// 绑定按钮事件
document.getElementById('start-work').addEventListener('click', startWork);
document.getElementById('start-rest').addEventListener('click', startRest);
document.getElementById('pause').addEventListener('click', pause);
document.getElementById('stop').addEventListener('click', stop);
document.getElementById('toggle-dark-mode').addEventListener('click', toggleDarkMode);


// 监听键盘事件
document.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase(); // 获取按下的键（转换为小写）

    switch (key) {
        case 'a': // 开始工作
            document.getElementById('start-work').click();
            break;
        case 's': // 开始休息
            document.getElementById('start-rest').click();
            break;
        case 'q': // 暂停
            document.getElementById('pause').click();
            break;
        case 'c': // 清零
            document.getElementById('stop').click();
            break;
        case 'w': // 切换暗黑模式
            document.getElementById('toggle-dark-mode').click();
            break;
        case 'e': // 保存设置
        document.getElementById('save-settings').click();
        break;
        default:
            break;
    }
});

// 开始工作
function startWork() {
    if (isInDebt) {
        isInDebt = false; // 退出欠费状态
        debtAlpha = 0; // 重置透明度
        resetBackgroundColor(); // 重新设置背景色
    }
    if (!isWorking) {
        isWorking = true;
        isResting = false;
        clearInterval(interval);
        interval = setInterval(updateWorkTime, 1000);

        // 停止休息背景音，播放工作背景音
        restAudio.pause();
        restAudio.currentTime = 0; // 重置播放进度

        // 播放工作背景音（如果用户未选择关闭）
        const selectedWorkBGM = localStorage.getItem('selectedWorkBGM') || 'bgm/wall-clock-tick-tock.wav'; // 默认工作背景音乐
        if (selectedWorkBGM) {
            workAudio.src = selectedWorkBGM;
            workAudio.play();
        }

        // 启动 presence 功能
        startPresence();

        resetBackgroundColor(); // 开始工作计时时，立即触发背景色恢复
        
        document.getElementById('work-timer').style.backgroundColor = 'var(--timer-bg-work)'; // 设置工作计时的背景色
        document.getElementById('work-timer').style.color = 'var(--text-color)'; // 设置工作计时的文字色
        document.getElementById('rest-timer').style.backgroundColor = ''; // 清除休息计时的背景色
        document.getElementById('rest-timer').style.color = ''; // 清除休息计时的背景色
    }
}

// 启动 presence 功能
function startPresence() {
    presenceInterval = setInterval(() => {
        noticeAudio.play(); // 播放提醒音频
    }, intervalMinutes * 60 * 1000); // 每xx分钟触发一次
}

// 停止 presence 功能
function stopPresence() {
    clearInterval(presenceInterval);
}

// 开始休息
function startRest() {
    if (!isResting) {
        isResting = true;
        isWorking = false;
        clearInterval(interval);

        interval = setInterval(updateRestTime, 1000);

        // 停止 presence 功能
        stopPresence();

        // 停止工作背景音，播放休息背景音
        workAudio.pause();
        workAudio.currentTime = 0; // 重置播放进度

        // 播放休息背景音（如果用户未选择关闭）
        const selectedRestBGM = localStorage.getItem('selectedRestBGM') || 'bgm/small-waves-harbor-rocks.wav'; // 默认休息背景音乐
        if (selectedRestBGM) {
            restAudio.src = selectedRestBGM;
            restAudio.play();
        }

        // 设置休息计时的背景色
        document.getElementById('rest-timer').style.backgroundColor = 'var(--timer-bg-rest)';
        document.getElementById('rest-timer').style.color = 'var(--text-color)'; // 设置休息计时的文字色
        document.getElementById('work-timer').style.backgroundColor = ''; // 清除工作计时的背景色
        document.getElementById('work-timer').style.color = ''; // 清除工作计时的文字色
    }
}

// 暂停
function pause() {
    clearInterval(interval);
    isWorking = false;
    isResting = false;

    // 停止所有背景音
    if (workAudio && !workAudio.paused) {
        workAudio.pause();
        workAudio.currentTime = 0; // 重置播放进度
    }
    if (restAudio && !restAudio.paused) {
        restAudio.pause();
        restAudio.currentTime = 0; // 重置播放进度
    }

    // 停止 presence 功能
    stopPresence();
}

// 停止
function stop() {
    clearInterval(interval);
    workTime = 0;
    restTime = 0;
    earnedRestTime = 0;
    remainingTotalTime = totalTime * 60; // 重置剩余总时间
    isWorking = false;
    isResting = false;
    updateDisplay();
    updateProgressBar();
    resetBackgroundColor();

    // 停止所有背景音
    if (workAudio && !workAudio.paused) {
        workAudio.pause();
        workAudio.currentTime = 0; // 重置播放进度
    }
    if (restAudio && !restAudio.paused) {
        restAudio.pause();
        restAudio.currentTime = 0; // 重置播放进度
    }

    // 停止 presence 功能
    stopPresence();
}


// 重置背景色
function resetBackgroundColor() {
    if (debtAlpha > 0) {
        debtAlpha = Math.max(debtAlpha - 0.1, 0); // 每次减少 0.1 的透明度
        const debtColor = isDarkMode
            ? `rgba(255, 69, 0, ${debtAlpha})` // 暗黑模式欠费背景色
            : `rgba(255, 165, 0, ${debtAlpha})`; // 亮色模式欠费背景色

        // 使用 CSS 渐变背景叠加红色
        document.body.style.background = `
            linear-gradient(${debtColor}, ${debtColor}),
            var(--background-color)
        `;

        // 如果透明度还未降到 0，继续减少
        setTimeout(resetBackgroundColor, 100); // 每 100ms 减少一次透明度
    } else {
        // 如果透明度已经降到 0，完全恢复背景色
        document.body.style.background = 'var(--background-color)';
    }
}

// 更新休息时间
function updateRestTime() {
    if (remainingTotalTime > 0) {
        restTime++;
        earnedRestTime--;
        remainingTotalTime--;

        // 进入欠费模式
        if (earnedRestTime < 0) {
            const debtAmount = Math.abs(earnedRestTime);
            const alpha = Math.min(debtAmount / 10, 1);// 计算透明度
            const debtColor = isDarkMode
                ? `rgba(255, 69, 0, ${alpha})` // 暗黑模式欠费背景色
                : `rgba(255, 165, 0, ${alpha})`; // 亮色模式欠费背景色
            
                // 使用 CSS 渐变背景叠加红色
            document.body.style.background = `
                linear-gradient(${debtColor}, ${debtColor}),
                var(--background-color)
            `;

            // 每次进入欠费模式都播放音频提醒
            if (alertAudio.paused) { // 检查音频是否处于暂停状态
                alertAudio.currentTime = 0; // 重置播放进度
                alertAudio.play(); // 播放音频
            }
        } else {
            // 如果不再欠费，重置背景色
            resetBackgroundColor();
            
        }

        updateDisplay();
        updateProgressBar();
    } else {
        pause(); // 如果挣得休息时间为0或剩余总时间为0，停止计时
        showOverSound(); // 显示计时结束提示
    }
}

// 更新工作时间
function updateWorkTime() {
    if (remainingTotalTime > 0) {
        workTime++;
        earnedRestTime += 1 / 3; // 每工作1秒，挣得1/3秒休息时间
        remainingTotalTime--;

        // 补偿欠费
        //if (earnedRestTime < 0) {
        //    earnedRestTime += 1 / 3; // 补偿欠费
        //}

        earnedRestTime = Math.min(earnedRestTime, workTime / 3);

        updateDisplay();
        updateProgressBar();
    } else {
        pause(); // 如果剩余总时间为0，停止计时
        showOverSound(); // 显示计时结束提示
    }
}

function showOverSound() {
    OverAudio.play(); // 播放提示音

    // 监听音频播放完毕事件
    OverAudio.addEventListener('ended', () => {
        // 弹窗提示
        alert('计时结束！总时长已用尽。');
    }, { once: true });

    // 监听音频加载失败事件
    OverAudio.addEventListener('error', () => {
        // 如果音频加载失败，直接弹窗
        alert('计时结束！总时长已用尽。');
    }, { once: true });
}

// 更新显示
function updateDisplay() {
    // 格式化时间显示
    document.getElementById('current-work-time').textContent = formatTime(workTime);
    document.getElementById('earned-rest-time').textContent = formatTime(earnedRestTime, true); // 允许显示负数
    document.getElementById('remaining-total-time').textContent = formatTime(remainingTotalTime);
}

// 更新进度条
 function updateProgressBar() {
     const progress = ((totalTime * 60 - remainingTotalTime) / (totalTime * 60)) * 100;
     document.getElementById('progress').style.width = `${progress}%`;
     document.getElementById('progress').style.backgroundColor =  isWorking ? 'var(--progress-color-work)' : 'var(--progress-color-rest)';
 }

// 格式化时间为 "时:分:秒"，支持负数
function formatTime(seconds, allowNegative = false) {
    const isNegative = seconds < 0;
    seconds = Math.abs(seconds); // 取绝对值进行计算
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const formattedTime = `${String(hours).padStart(2, '0')} :  ${String(minutes).padStart(2, '0')} :  ${String(secs).padStart(2, '0')}`;
    return isNegative && allowNegative ? `-${formattedTime}` : formattedTime;
}

// 切换暗黑模式
function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);
    resetBackgroundColor();
}

// 监听总时长输入
document.getElementById('total-time').addEventListener('change', (e) => {
    totalTime = parseInt(e.target.value, 10);
    remainingTotalTime = totalTime * 60; // 更新剩余总时间
    updateDisplay();
});
