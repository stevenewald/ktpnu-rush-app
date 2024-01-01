const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "https://rush-ktp-default-rtdb.firebaseio.com/",
});
const { GoogleSpreadsheet } = require("google-spreadsheet");
//these are not keys, they are IDs
const cc_signup_doc = new GoogleSpreadsheet(
  "1D3rx9Dbto13zSasmzZsyenWfaNkL7CF99OdTy1OZj_U"
);
const gi_signup_doc = new GoogleSpreadsheet(
  "1cuzwPEZOkMMbnKtjE6hD3riR46qiB-XCLrvSR4KwHoo"
);
const indiv_signup_doc = new GoogleSpreadsheet(
  "1kynwriDoHZLN1XHufx5oyAYuC0EDq1NtZP-nFJ13GtA"
);
const creds = require("./creds.json");
const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  host: "smtp-relay.sendinblue.com",
  port: 587,
  auth: {
    user: functions.config().sendinblue.user,
    pass: functions.config().sendinblue.password,
  },
});

exports.reserveCCTime = functions.https.onCall(async (data, context) => {
  await cc_signup_doc.useServiceAccountAuth(creds);
  await cc_signup_doc.loadInfo();
  const sheet = cc_signup_doc.sheetsByIndex[0];
  await sheet.loadCells("A8:K45");
  const toReserve = sheet.getCell(data.i, data.j);
  if (toReserve.value) {
    console.log("Time already reserved!");
    return false;
  } else {
    toReserve.value = data.name + " (" + data.phone + ")";
    await sheet.saveUpdatedCells();
    rush_users.child(context.auth.uid).update({
      selected_cc_timeslot:
        "Your meeting is with " +
        sheet.getCell(data.i, data.j - 2).value +
        " at " +
        sheet.getCell(data.i, data.j - 1).value +
        ". The timeslot is " +
        sheet.getCell(data.i, 0).value +
        " on Tuesday, April 4th.",
    });
    return true;
  }
});

exports.reserveGITime = functions.https.onCall(async (data, context) => {
  await gi_signup_doc.useServiceAccountAuth(creds);
  await gi_signup_doc.loadInfo();
  const sheet = gi_signup_doc.sheetsByIndex[0];
  await sheet.loadCells("A2:L5");
  var numTimeSignups = sheet.getCell(data.i, 1).value;
  var reserveCol = numTimeSignups + 2;
  console.log(
    "Attempting to reserve row " + data.i + " and column " + reserveCol
  );
  if (sheet.getCell(data.i, reserveCol).value) {
    console.log(
      "Time already reserved by " + sheet.getCell(data.i, reserveCol).value
    );
    reserveCol = 0;
    numTimeSignups = 0;
    for (var j = 2; j < 12; j++) {
      if (!sheet.getCell(data.i, j).value) {
        reserveCol = j;
        break;
      } else {
        numTimeSignups++;
      }
    }
    if (!reserveCol) {
      console.log("Can't reserve time!");
      sheet.getCell(data.i, 1).value = 10;
      await sheet.saveUpdatedCells();
      return false;
    }
  } else {
    console.log("Time not reserved yet, proceeding to reserve it!");
  }
  sheet.getCell(data.i, reserveCol).value = data.name;
  sheet.getCell(data.i, 1).value = numTimeSignups + 1;
  await sheet.saveUpdatedCells();
  rush_users.child(context.auth.uid).update({
    selected_gi_timeslot:
      "Your group interview timeslot is at Tech M345 from " +
      sheet.getCell(data.i, 0).value +
      " on Wednesday, April 5th.",
  });
  return true;
});

exports.getCCTimes = functions.https.onCall(async (data, context) => {
  times = [];
  await cc_signup_doc.useServiceAccountAuth(creds);
  await cc_signup_doc.loadInfo();
  const sheet = cc_signup_doc.sheetsByIndex[0];
  await sheet.loadCells("A8:K45");
  for (var i = 7; i < 45; i += 1) {
    //i is the row
    for (var j = 1; j < 10; j += 3) {
      //j is the col
      if (sheet.getCell(i, j).value && !sheet.getCell(i, j + 2).value) {
        times.push({
          time: sheet.getCell(i, 0).value,
          location: sheet.getCell(i, j + 1).value,
          i: i,
          j: j + 2,
        });
      }
    }
  }
  return times;
});

exports.reserveIndivTime = functions.https.onCall(async (data, context) => {
  await indiv_signup_doc.useServiceAccountAuth(creds);
  await indiv_signup_doc.loadInfo();
  const sheet = indiv_signup_doc.sheetsByIndex[0];
  await sheet.loadCells("A3:U14");
  const toReserve = sheet.getCell(data.i, data.j);
  if (toReserve.value) {
    console.log("Time already reserved!");
    return false;
  } else {
    toReserve.value = data.name + " (" + data.phone + ")";
    await sheet.saveUpdatedCells();
    rush_users.child(context.auth.uid).update({
      selected_indiv_timeslot:
        "Your interview is at " +
        sheet.getCell(data.i, data.j+3).value +
        " on " +
        sheet.getCell(data.i, 0).value +
        ".",
    });
    return true;
  }
});

exports.getIndivTimes = functions.https.onCall(async (data, context) => {
  csInterviewers = {"Steve":null, "Alexis":null, "Akash":null, "Eagan":null};
  times = [];
  await indiv_signup_doc.useServiceAccountAuth(creds);
  await indiv_signup_doc.loadInfo();
  const sheet = indiv_signup_doc.sheetsByIndex[0];
  await sheet.loadCells("A3:U14");
  if(data.cs) {
    console.log("Requesting CS times");
  } else {
    console.log("Requesting non cs times");
  }
  for (var i = 2; i < 14; i += 1) {
    //i is the row
    for (var j = 4; j < 21; j += 4) {
      //j is the col
      if (sheet.getCell(i, j).value && sheet.getCell(i,j-1).value && sheet.getCell(i,j-2).value && !sheet.getCell(i, j - 3).value) {
        if(data.cs && (sheet.getCell(i,j-1).value in csInterviewers || sheet.getCell(i,j-2).value in csInterviewers)) {
          times.push({
            time: sheet.getCell(i, 0).value,
            location: sheet.getCell(i, j).value,
            i: i,
            j: j - 3,
          });
        } else if(!data.cs && !(sheet.getCell(i,j-1).value in csInterviewers) && !(sheet.getCell(i, j-2).value in csInterviewers)) {
          times.push({
            time: sheet.getCell(i, 0).value,
            location: sheet.getCell(i, j).value,
            i: i,
            j: j - 3,
          });
        }
      }
    }
  }
  return times;
});

exports.getGITimes = functions.https.onCall(async (data, context) => {
  times = [];
  await gi_signup_doc.useServiceAccountAuth(creds);
  await gi_signup_doc.loadInfo();
  const sheet = gi_signup_doc.sheetsByIndex[0];
  await sheet.loadCells("A2:B5");
  for (var i = 1; i < 5; i += 1) {
    //i is the row
    //j is the col
    if (
      !isNaN(sheet.getCell(i, 1).value) &&
      parseFloat(sheet.getCell(i, 1).value) < 10
    ) {
      times.push({
        time: sheet.getCell(i, 0).value,
        i: i,
        j: -1,
        location: "Tech M345",
      });
    }
  }
  return times;
});

let rush_users = admin.database().ref("rush_users");
exports.beforeAcc = functions.auth.user().beforeCreate(async (user) => {
  if (user.email.includes("northwestern.edu")) {
    console.log("User allowed\n");
    await rush_users
      .child(user.uid)
      .set({ email: user.email, completed_application: false });
    return true;
  }
  console.log("User not allowed\n");
  throw new functions.auth.HttpsError("permission-denied");
});

exports.publishResults = functions.https.onCall(async (data, context) => {
  const prom = new Promise((resolve, reject) => {
    rush_users.child(context.auth.uid).once("value", (snapshot) => {
      if (!snapshot.val()) {
        return;
      }
      if (!snapshot.val().admin) {
        return;
      }
      rush_users.once("value", async (users_snapshot) => {
        const users = users_snapshot.val();
        for (const uid in users) {
          const user = users[uid];
          if (!user.email || !user.fullName) {
            continue;
          }
          try {
            const mailOptions = {
              from: "KTP Northwestern <rush@ktpnu.com>",
              to: user.email,
              subject: "KTP Application Update",
              html:
                '<!cc_signup_doctype html><html>  <head>    <meta name="viewport" content="width=device-width, initial-scale=1.0">    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">    <title>KTP Application Update</title>    <style>@media only screen and (max-width: 620px) {  table.body h1 {    font-size: 28px !important;    margin-bottom: 10px !important;  }  table.body p,table.body ul,table.body ol,table.body td,table.body span,table.body a {    font-size: 16px !important;  }  table.body .wrapper,table.body .article {    padding: 10px !important;  }  table.body .content {    padding: 0 !important;  }  table.body .container {    padding: 0 !important;    width: 100% !important;  }  table.body .main {    border-left-width: 0 !important;    border-radius: 0 !important;    border-right-width: 0 !important;  }  table.body .btn table {    width: 100% !important;  }  table.body .btn a {    width: 100% !important;  }  table.body .img-responsive {    height: auto !important;    max-width: 100% !important;    width: auto !important;  }}@media all {  .ExternalClass {    width: 100%;  }  .ExternalClass,.ExternalClass p,.ExternalClass span,.ExternalClass font,.ExternalClass td,.ExternalClass div {    line-height: 100%;  }  .apple-link a {    color: inherit !important;    font-family: inherit !important;    font-size: inherit !important;    font-weight: inherit !important;    line-height: inherit !important;    text-decoration: none !important;  }  #MessageViewBody a {    color: inherit;    text-decoration: none;    font-size: inherit;    font-family: inherit;    font-weight: inherit;    line-height: inherit;  }  .btn-primary table td:hover {    background-color: #34495e !important;  }  .btn-primary a:hover {    background-color: #34495e !important;    border-color: #34495e !important;  }}</style>  </head>  <body style="background-color: #f6f6f6; font-family: sans-serif; -webkit-font-smoothing: antialiased; font-size: 14px; line-height: 1.4; margin: 0; padding: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">    <span class="preheader" style="color: transparent; display: none; height: 0; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; mso-hide: all; visibility: hidden; width: 0;">View your application status.</span>    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f6f6f6; width: 100%;" width="100%" bgcolor="#f6f6f6">      <tr>        <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>        <td class="container" style="font-family: sans-serif; font-size: 14px; vertical-align: top; display: block; max-width: 580px; padding: 10px; width: 580px; margin: 0 auto;" width="580" valign="top">          <div class="content" style="box-sizing: border-box; display: block; margin: 0 auto; max-width: 580px; padding: 10px;">            <!-- START CENTERED WHITE CONTAINER -->            <table role="presentation" class="main" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background: #ffffff; border-radius: 3px; width: 100%;" width="100%">              <!-- START MAIN CONTENT AREA -->              <tr>                <td class="wrapper" style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;" valign="top">                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" width="100%">                    <tr>                      <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">                        <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Hello ' +
                user.fullName +
                ',</p>                        <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Please visit the rush portal to view the status of your rush application.</p>                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; box-sizing: border-box; width: 100%;" width="100%">                          <tbody>                            <tr>                              <td align="left" style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding-bottom: 15px;" valign="top">                                <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: auto;">                                  <tbody>                                    <tr>                                      <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; border-radius: 5px; text-align: center; background-color: #3498db;" valign="top" align="center" bgcolor="#3498db"> <a href="https://rush.ktpnu.com" target="_blank" style="border: solid 1px #3498db; border-radius: 5px; box-sizing: border-box; cursor: pointer; display: inline-block; font-size: 14px; font-weight: bold; margin: 0; padding: 12px 25px; text-decoration: none; text-transform: capitalize; background-color: #3498db; border-color: #3498db; color: #ffffff;">Rush Portal</a> </td>                                    </tr>                                  </tbody>                                </table>                              </td>                            </tr>                          </tbody>                        </table>                        <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Please contact rush@ktpnu.com if you have any further questions.</p><br>                        <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Sincerely,<br>KTP Rush Team</p>                      </td>                    </tr></table></td></tr></table></div></td></tr></table></body></html>',
            };
            if (user.dropped && !user.dropped_email_sent) {
              await rush_users.child(uid).update({ dropped_email_sent: true });
              await transporter.sendMail(mailOptions, (erro, info) => {
                if (erro) {
                  console.log(erro.toString());
                } else {
                  console.log("Sent dropped email to " + user.email + "\n");
                }
              });
            } else if (!user.dropped) {
              await transporter.sendMail(mailOptions, (erro, info) => {
                if (erro) {
                  console.log(erro.toString());
                } else {
                  console.log("Sent congrats email to " + user.email + "\n");
                }
              });
            }
          } catch (e) {
            console.log(e);
          }
        }
        console.log("Done sending results!");
        resolve();
      });
    });
  });
  await prom;
  return true;
});
