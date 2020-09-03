// エンコーダー
let encoder;
// キャンバス
let canvas;
let context;
// ビデオ，出力画像
let video;
let output;
// サイズ
let [width, height] = [200, 150];
// カメラストリーム
let cameraStream = null;
// タイマー，インターバル
let timer = 100;
const interval = 100;

const init = () => {
  // エンコーダー（100 ミリ間隔，ループ）
  encoder = new GIFEncoder();
  encoder.setDelay(interval);
  encoder.setRepeat(0);
  // キャンバスの取得
  canvas = document.getElementById("videoCanvas");
  context = canvas.getContext("2d");
  // ビデオ
  video = document.getElementById("video");
  video.muted = true;
  video.controls = true;
  // 出力画像
  output = document.getElementById("output");
  // キャンバス，動画，出力画像のサイズをセット
  setSize();
  // ボタンの無効化
  disabledButtons(true, true, true);
}

const setSource = () => {
  // 動画ファイル / カメラの切り替え
  if (document.getElementById("file").checked) {
    // カメラの切断
    if (cameraStream !== null) {
      cameraStream.getVideoTrack()[0].stop();
      cameraStream = null;
      video.srcObject = null;
    }
    document.getElementById("message").innerText = "未接続";
  } else {
    // カメラの接続
    var media = navigator.mediaDevices.getUserMedia({
      // 映像のみ（1280 × 720）
      audio: false,
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    }).then(stream => {
      // カメラからの映像をビデオにセット
      video.srcObject = stream;
      video.autoplay = true;
      cameraStream = stream;
      document.getElementById("message").innerText = "接続";
      // 開始ボタンの有効化
      disabledButtons(false, true, true);
    }).catch(error =>{
      document.getElementById("message").innerText = error;
    });
  }
}

const loadVideo = files => {
  // 動画ファイルをビデオにセット
  videoFile = files[0];
  video.src = URL.createObjectURL(videoFile);
  video.autoplay = false;
  video.onloadeddata = () => {
    // 開始ボタンの有効化
    disabledButtons(false, true, true);
  }
  video.onended = () => {
    stopEncord();
  }
  document.getElementById("file").checked = true;
}

const setSize = () => {
  // サイズの変更
  width = document.getElementById("width").value;
  height = document.getElementById("height").value;

  [canvas.width, canvas.height] = [width, height];
  [video.width, video.height] = [width, height];
  [output.width, output.height] = [width, height];
  encoder.setSize(width, height);
}

const startEncord = () => {
  // エンコード開始
  encoder.start();
  video.play();
  output.classList.add("hide");
  timer = setInterval(addFrame, interval);
  // 開始ボタンの無効化，停止ボタンの有効化
  disabledButtons(true, false, true);
}

const addFrame = () => {
  // フレームの追加
  const [sw, sh] = [video.videoWidth, video.videoHeight];
  let [dx, dy, dw, dh] = [0, 0, width, height];

  if (sw > sh) {
    // 横長
    dh = dw * sh / sw;
    dy = (height - dh) / 2;
  } else {
    // 縦長
    dw = height * sw / sh;
    dx = (width - dw) / 2;
  }
  context.fillStyle = "#FFFFFF";
  context.fillRect(0, 0, width, height);
  context.drawImage(video, 0, 0, sw, sh, dx, dy, dw, dh);
  encoder.addFrame(context);
}

const stopEncord = () => {
  // エンコード終了
  clearInterval(timer);
  video.pause();
  encoder.finish();
  // アニメーション GIF の表示
  const bin = encoder.stream().getData();
  output.src = `data: image/gif; base64, ${encode64(bin)}`;
  output.classList.remove("hide");
  // 開始ボタン，保存ボタンの有効化，停止ボタンの無効化
  disabledButtons(false, true, false);
}

const saveGIF = () => {
  // アニメーション GIF を名前をつけて保存（ダウンロード）
  const fileName = window.prompt("ファイル名を入力してください", "video.gif");
  if (fileName != null) encoder.download(fileName);
}

const disabledButtons = (start, stop, save) => {
  // 開始ボタン，停止ボタン，保存ボタンの有効化 / 無効化
  document.getElementById("start").disabled = start;
  document.getElementById("stop").disabled = stop;
  document.getElementById("save").disabled = save;
}