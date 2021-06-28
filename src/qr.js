import QRious from 'qrious';
import { isPPPoE } from './tools'

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
    "firmware": "${archerInfo.firmware}",
    "staging_config": ${isPPPoE(archerInfo) ? JSON.stringify(stagingPPPoE()) : JSON.stringify(stagingStatic())}
  }`;
}

function stagingPPPoE() {
  return {"userParameters":{"networkConfig":{"packetFilterPppoe":0,"packetFilterArp":1,"packetFilterUser1":1,"packetFilterSnmpIpv6":1,"packetFilterSmb":1,"packetFilterOtherIpv4":1,"packetFilterAllOthers":1,"packetFilterBootpServer":1,"packetFilterBootpClientIpv6":1,"packetFilterMulticastIpv6":1,"packetFilterAllIpv6Others":1,"packetFilterSnmp":1,"packetFilterUser3":1,"packetFilterSmbIpv6":1,"packetFilterAllIpv4":1,"packetFilterBootpServerIpv6":1,"packetFilterUser2":1,"packetFilterAllIpv6":1,"packetFilterBootpClient":1,"packetFilterMulticastIpv4":1,"packetFilterBPDU":1,"packetFilterDirection":1}}}
}

function stagingStatic() {
  return {"userParameters":{"networkConfig":{"packetFilterPppoe":0,"packetFilterArp":0,"packetFilterUser1":0,"packetFilterSnmpIpv6":0,"packetFilterSmb":0,"packetFilterOtherIpv4":0,"packetFilterAllOthers":0,"packetFilterBootpServer":0,"packetFilterBootpClientIpv6":0,"packetFilterMulticastIpv6":0,"packetFilterAllIpv6Others":0,"packetFilterSnmp":0,"packetFilterUser3":0,"packetFilterSmbIpv6":0,"packetFilterAllIpv4":0,"packetFilterBootpServerIpv6":0,"packetFilterUser2":0,"packetFilterAllIpv6":0,"packetFilterBootpClient":0,"packetFilterMulticastIpv4":0,"packetFilterBPDU":0,"packetFilterDirection":1}}}
}

export {generateQRDataURL}