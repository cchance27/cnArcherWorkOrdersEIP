var cnFirstScript = document.getElementsByTagName('script')[0];

var cnJS = document.createElement('script');
cnJS.src = '/adminPortal/cnArcher/bundle.js'; // After our bundle has been loaded for the javascript

cnJS.onload = function () {
  console.log('cnArcher Bundle Loaded...');
  var cnFirmware = "16.2.1";
  var cnDevices = [].slice.call(document.getElementsByClassName('noticeicon'));
  var cnName = document.querySelector("#DetailsContactName").innerText;
  var cnCompany = document.querySelector("#DetailsContactCompany") != null ? document.querySelector("#DetailsContactCompany").innerText : '';
  var cnEIPAcc = document.querySelector("#DetailsParentName") != null ? document.querySelector("#DetailsParentName").innerText : document.querySelector("#CurrentUsername").innerText;
  var cnAccId = document.querySelector("#CurrentAccountID").innerText;
  var cnPhone = document.querySelector("#DetailsPhone").getElementsByTagName("a")[0].innerText;
  var cnAddress = document.querySelector("#DetailsAddress").getElementsByTagName("a")[0].innerText;
  cnDevices.forEach(function (item) {
    if (item.outerHTML.includes('0a-00-3e')) {
      console.log('cnArcher: Found ESN');
      var cnEsn = item.outerHTML.match(/(?:[0-9a-fA-F]{2}-){5}[0-9a-fA-F]{2}/)[0];
      var match = item.outerHTML.match(/Profile: <br\/>(.*?) \(/);
      var cnPackage = match !== null ? match[1] : 'Missing';
      match = item.outerHTML.match(/Password = (.*?)</);
      var cnPass = match !== null ? match[1] : '';
      match = item.outerHTML.match(/User Name = (.*?)</);
      var cnUser = match !== null ? match[1] : '';
      match = item.outerHTML.match(/VlanID = ([\d]{1,3})/);
      var cnVlan = match !== null ? match[1] : '';
      item.insertAdjacentHTML("afterend", "<cn-workorder esn=\"".concat(cnEsn, "\" name=\"").concat(cnName, "\" company=\"").concat(cnCompany, "\" accid=\"").concat(cnAccId, "\" address=\"").concat(cnAddress, "\" eip=\"").concat(cnEIPAcc, "\" phone=\"").concat(cnPhone, "\" package=\"").concat(cnPackage, "\" firmware=\"").concat(cnFirmware, "\" username=\"").concat(cnUser, "\" password=\"").concat(cnPass, "\" vlan=\"").concat(cnVlan, "\"></cn-workorder>"));
    };
  });
};

cnFirstScript.parentNode.insertBefore(cnJS, cnFirstScript);