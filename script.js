function timeToIndex(timeStr) {
  // 未入力の場合
  if (!timeStr) {
    return null;
  }

  // "HH:MM" を分解
  const parts = timeStr.split(":");
  const hour = parseInt(parts[0], 10);
  const minute = parseInt(parts[1], 10);

  // 分に変換
  const totalMinutes = hour * 60 + minute;

  // 8:00 (480分) との差
  let diffMinutes = totalMinutes - 480;

  // index 計算
  let index = Math.floor(diffMinutes / 15);

  // 正規化
  if (index < 0) index = 0;
  if (index > 55) index = 55;

  return index;
}
document.getElementById("calcBtn").addEventListener("click", function () {
  const startIdx = timeToIndex(document.getElementById("startTime").value);
  const amIdx = timeToIndex(document.getElementById("amLeave").value);
  const pmIdx = timeToIndex(document.getElementById("pmStart").value);
  const endIdx = timeToIndex(document.getElementById("endTime").value);

  if (startIdx === null || endIdx === null) {
    alert("出勤時刻と退勤時刻を入力してください");
    return;
  }

  const result = calcOvertime(startIdx, amIdx, pmIdx, endIdx);
  if (!result) return;

  document.getElementById("earlyResult").textContent = result.early.toFixed(2);
  document.getElementById("lunchResult").textContent = result.lunch.toFixed(2);
  document.getElementById("afterResult").textContent = result.after.toFixed(2);
  document.getElementById("totalResult").textContent = result.total.toFixed(2);
});
function calcOvertime(startIdx, amIdx, pmIdx, endIdx) {
  let early = 0;
  let lunch = 0;
  let after = 0;

  // --- 早出残業 ---
  if (startIdx === 0) {
    early = 0.25;
  }

  // --- 昼休憩短縮残業 ---
  // 午前半休・午後半休でない場合のみ
  if (amIdx !== null && pmIdx !== null) {
    const diff = pmIdx - amIdx;
    if (diff < 0) {
      alert("午前退勤と午後出勤の入力が不正です");
      return null;
    }

    if (diff === 0) lunch = 1.75;
    else if (diff === 1) lunch = 1.50;
    else if (diff === 2) lunch = 1.25;
    else if (diff === 3) lunch = 1.00;
    else if (diff === 4) lunch = 0.75;
    else if (diff === 5) lunch = 0.50;
    else if (diff === 6) lunch = 0.25;
    else lunch = 0;
  }

  // --- 退勤後残業 ---
  if (endIdx > 42) {
    after = (endIdx - 42) * 0.25;
  }

  const total = early + lunch + after;

  return {
    early,
    lunch,
    after,
    total
  };
}

document.getElementById("clearBtn").addEventListener("click", function () {
  // 入力欄をクリア
  document.getElementById("startTime").value = "";
  document.getElementById("amLeave").value = "";
  document.getElementById("pmStart").value = "";
  document.getElementById("endTime").value = "";

  // 結果表示を初期化
  document.getElementById("earlyResult").textContent = "0.00";
  document.getElementById("lunchResult").textContent = "0.00";
  document.getElementById("afterResult").textContent = "0.00";
  document.getElementById("totalResult").textContent = "0.00";
});