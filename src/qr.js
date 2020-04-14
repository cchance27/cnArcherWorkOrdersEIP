import QRious from 'qrious';

// Generate a QR Code from the various fields.
// Returns: DataURL
function generateQRDataURL(archerInfo, dt, tech) {
return new QRious({
    level: 'L',
    size: 400,
    backgroundAlpha: 0.0,
    value: qrContent(archerInfo, dt, tech)
  }).toDataURL('image/png');;
}

//This is the content of our qrCode
function qrContent(archerInfo, installDate, technician) {

  let mainPhone = archerInfo.phone;
  // Our phone field can have more than 1 entry seperated by commas, however the QR only accepts 1 phone number.
  if (mainPhone.indexOf(',') > 0) {
    mainPhone = mainPhone.split(',')[0];
  };

  // Phone numbers aren't allowed to include - in the qr code for cnArcher.
  mainPhone = mainPhone.replace(/-/g, "");

  return `
  { 
    "type":"cnArcherWO",
    "product": "canopy",
    "id": "${archerInfo.eip}",
    "name": "${archerInfo.name}",
    "address": "${archerInfo.address}",
    "phone": "${mainPhone}",
    "mode": "automated",
    "sm_name": "${archerInfo.name} (${archerInfo.eip})",
    "security": "aaa",
    "aaa_user_type": "mac_hyphen",
    "aaa_pass": "",
    "aaa_phase1": "eapMSChapv2",
    "aaa_phase2": "mschapv2",
    "aaa_identity": "anonymous",
    "aaa_realm": "canopy.net",
    "nat": false,
    "ip_setting": "dhcp",
    "comments": "Install ${installDate} by ${technician}", 
    "firmware": "${archerInfo.firmware}"
  }`;
}

export {generateQRDataURL}