declare var global: any;
const ACCESS_TOKEN = '';
const file = SpreadsheetApp.openById('');
const log = file.getSheetByName('log');
const db = file.getSheetByName('db');
const pushLineBotUrl = 'https://api.line.me/v2/bot/message/push';

global.doPost = (e): void => {
  var json = JSON.parse(e.postData.contents);
  var UID = json.events[0].source.userId;
  var GID = json.events[0].source.groupId;

  // グループLINEにメッセージをプッシュ送信する場合はグループIDを取得する必要がある
  log.appendRow([new Date(), `GID:${GID}`]);
  log.appendRow([new Date(), `UID:${UID}`]);
};

global.sendBirthday = (): void => {
  // DBから誕生日と名前などのユーザー情報一覧取得
  let nameData = db.getRange(2, 1, db.getLastRow()).getValues();
  nameData.pop();

  let birthdayData = db.getRange(2, 2, db.getLastRow()).getValues();
  birthdayData.pop();

  log.appendRow([new Date(), `userData:${nameData}`]);
  log.appendRow([new Date(), `birthdayData:${birthdayData}`]);

  // 今日が誕生日かどうかチェック
  for (let index = 0; index < birthdayData.length; index++) {
    log.appendRow([new Date(), `userData ${index}:${nameData[index]}`]);
    log.appendRow([new Date(), `birthdayData ${index}:${birthdayData[index]}`]);

    const isBirthday = checkBirthday(birthdayData[index]);
    if (isBirthday) {
      // 誕生日ならメッセージ送信
      pushLineBot(nameData[index]);
      log.appendRow([new Date(), `userId:${nameData[index]} の誕生日LINE 送信完了！`]);
    }
  }
};

/* 誕生日チェック **/
function checkBirthday(day): Boolean {
  var dayDate = new Date(day);
  var birthday = dayDate.getFullYear() + '/' + (dayDate.getMonth() + 1) + '/' + dayDate.getDate();

  if (birthday.slice(5, 9) == getDayFormat().slice(5, 9)) {
    log.appendRow([new Date(), `birthday:${birthday.slice(5, 9)}`]);
    log.appendRow([new Date(), `getDayFormat().slice(5, 9):${getDayFormat().slice(5, 9)}`]);
    return true;
  } else {
    return false;
  }
}

/* 現在の年月日取得 **/
function getDayFormat(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}/${month}/${day}`;
}

/* BotがLINE送信 **/
function pushLineBot(birthUser): void {
  log.appendRow([new Date(), `birthUser:${birthUser}`]);
  UrlFetchApp.fetch(pushLineBotUrl, {
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      Authorization: 'Bearer ' + ACCESS_TOKEN
    },
    method: 'post',
    payload: JSON.stringify({
      to: '',
      messages: [
        {
          type: 'text',
          text: `${String(birthUser)}、誕生日おめでとう！！！`
        },
        {
          type: 'sticker',
          stickerId: '257',
          packageId: '3'
        }
      ]
    })
  });
}
