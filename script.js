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

  const result = calcOvertime(startIdx, amIdx, pmIdx, endIdx);
  if (!result) return;

  // 結果表示
  document.getElementById("earlyResult").textContent = result.early.toFixed(2);
  document.getElementById("lunchResult").textContent = result.lunch.toFixed(2);
  document.getElementById("afterResult").textContent = result.after.toFixed(2);
  document.getElementById("totalResult").textContent = result.total.toFixed(2);

  // --- 午後半休相当メッセージの表示制御 ---
  const halfHolidayNote = document.getElementById("halfHolidayNote");

  // 初期状態は非表示
  halfHolidayNote.style.display = "none";

  // 午後半休相当の条件
  if (
    endIdx === null &&
    startIdx !== null &&
    amIdx !== null &&
    pmIdx === null
  ) {
    halfHolidayNote.style.display = "block";
  }
});

function calcOvertime(startIdx, amIdx, pmIdx, endIdx) {
  let early = 0;
  let lunch = 0;
  let after = 0;

  // --- 条件判定 ---
  const hasStart = startIdx !== null;
  const hasAmLeave = amIdx !== null;
  const hasPmStart = pmIdx !== null;
  const hasEnd = endIdx !== null;

  // 午後半休相当（v1.2 定義）
  const isAfternoonHalfHoliday =
    !hasEnd && hasStart && hasAmLeave && !hasPmStart;

  // --- 早出残業 ---
  if (startIdx === 0) {
    early = 0.25;
  }

  // --- 昼休憩短縮残業 ---
  if (hasAmLeave && hasPmStart) {
    const diff = pmIdx - amIdx;
    if (diff < 0) {
      alert("午後出勤が午前退勤より早いです");
      return null;
    }

    if (diff === 0) lunch = 1.75;
    else if (diff === 1) lunch = 1.50;
    else if (diff === 2) lunch = 1.25;
    else if (diff === 3) lunch = 1.00;
    else if (diff === 4) lunch = 0.75;
    else if (diff === 5) lunch = 0.50;
    else if (diff === 6) lunch = 0.25;
  }

  // --- 基準退勤・実退勤の決定 ---
  let baseEndIdx = 42;     // 通常勤務 18:30
  let actualEndIdx = null;

  if (hasEnd) {
    actualEndIdx = endIdx;
  } else if (isAfternoonHalfHoliday) {
    baseEndIdx = 18;       // 12:30
    actualEndIdx = amIdx;  // 午前退勤を実退勤とみなす
  }

  // --- 退勤後残業 ---
  if (actualEndIdx !== null && actualEndIdx >= baseEndIdx) {
    after = (actualEndIdx - baseEndIdx) * 0.25;
  }

  return {
    early,
    lunch,
    after,
    total: early + lunch + after
  };
}


document.getElementById("clearBtn").addEventListener("click", function () {
  // 入力欄を即クリア
  document.getElementById("startTime").value = "";
  document.getElementById("amLeave").value = "";
  document.getElementById("pmStart").value = "";
  document.getElementById("endTime").value = "";

  // 対象の数値要素
  const numbers = document.querySelectorAll(".result-number");

  // いったん下に消す
  numbers.forEach(el => {
    el.classList.remove("reset-in");
    el.classList.add("reset-out");
  });

  // 少し待って 0.00 を上から出す
  setTimeout(() => {
    numbers.forEach(el => {
      el.textContent = "0.00";
      el.classList.remove("reset-out");
      el.classList.add("reset-in");
    });
  }, 250);

  // 元の位置に戻す
  setTimeout(() => {
    numbers.forEach(el => {
      el.classList.remove("reset-in");
    });
  }, 450);

  // 午後半休メッセージも消す
  const note = document.getElementById("halfHolidayNote");
  if (note) note.style.display = "none";
});