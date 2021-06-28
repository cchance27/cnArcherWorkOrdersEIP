import {layout} from './layout';
import {generateQRDataURL} from './qr';
import style from './cnArcher.css'
import templateLogo from './img/cnArcherLogo.png';
import printer from './img/printer.svg';
import ajax from './ajax'
import { isPPPoE } from './tools'

//import '@webcomponents/webcomponentsjs'; //<--- causes high cpu in edge/ie?

class cnArcherWorkorder extends HTMLElement {
    constructor() {
        super();        
        // Technicians that will be populated into the tech drop down of the modal window.
        this.techNames = this.getAttribute('techs').split(',');

        // Put all our attributes in a object we can pass around and access easily.
        // Some basic cleanup like removing netherlands antilles, and removing - from phone to be compatible with cnArcher import.
        this.archerInfo = {
            esn: this.getAttribute('esn'),
            name: this.getAttribute('name'),
            eip: this.getAttribute('eip'),
            accid: this.getAttribute('accid'),
            address: this.getAttribute('address').replace(/(?:\r\n|\r|\n)/g, ' ').replace(', Netherlands Antilles', ''),
            phone: this.getAttribute('phone'),
            firmware: this.getAttribute('firmware')||'22.2.1',
            package: this.getAttribute('package'),
            company: this.getAttribute('company'),
            username: this.getAttribute('username'),
            password: this.getAttribute('password'), 
            vlan: this.getAttribute('vlan')
        };

        // We want all our styles to be self contained inside a shadowDOM
        this.attachShadow({mode: 'open'});

        // EIP Should have font-awesome if it does bring it in and use that, otherwise fallback to svg icon
        const parentFA = document.querySelector('link[href*="font-awesome"]');
        this.icon = parentFA ? `<i class="fa fa-external-link-square" alt="Generate WorkOrder"></i>` : `<img src=${printer} alt="Generate WorkOrder>`;

        // Create our html for the icon + modal + stylesheet
        this.shadowRoot.innerHTML = `
            ${parentFA ? parentFA.outerHTML : '<!-- No parent EIP Font-Awesome Detected -->'}
            <style>${style}</style>
            ${layout(this.archerInfo, this.icon)}
        `;
    }

    disconnectedCallback() {
        const showBtn = this.shadowRoot.querySelector('#cnArcher-show');
        const archerWindow = this.shadowRoot.querySelector('#cnArcher');
        const printBtn = this.shadowRoot.querySelector('.print-workorder');
        const dt = this.shadowRoot.querySelector('#dt');
        const technician = this.shadowRoot.querySelector('#technician');
        const chkMail = this.shadowRoot.querySelector('#print');
        const chkPrint = this.shadowRoot.querySelector('#mail');

        showBtn.removeEventListener('click');
        archerWindow.removeEventListener('click');
        printBtn.removeEventListener('click');
        dt.removeEventListener('change');
        technician.removeEventListener('change');
        chkPrint.removeEventListener('click');
        chkMail.removeEventListener('click');
    }

    connectedCallback() {
        // Cache location of all our various objects
        const showBtn = this.shadowRoot.querySelector('#cnArcher-show');
        const archerWindow = this.shadowRoot.querySelector('#cnArcher');
        const printBtn = this.shadowRoot.querySelector('.print-workorder');
        const notes = this.shadowRoot.querySelector('#note');
        const dt = this.shadowRoot.querySelector('#dt');
        const filters = this.shadowRoot.querySelector('#filters');
        const technician = this.shadowRoot.querySelector('#technician');
        const printContent = this.shadowRoot.querySelector('#cnArcherPrintArea');
        const previewImg = this.shadowRoot.querySelector('#previewImg');
        const chkMail = this.shadowRoot.querySelector('#mail');
        const chkPrint = this.shadowRoot.querySelector('#print');

        // Checkbox options
        chkMail.addEventListener('click', changeChecks)
        chkPrint.addEventListener('click', changeChecks)

        changeChecks()

        function changeChecks() {
            if (chkMail.checked && chkPrint.checked) { printBtn.textContent = "Print & Send"; printBtn.disabled = false; }
            if (!chkMail.checked && chkPrint.checked) { printBtn.textContent = "Print Workorder"; printBtn.disabled = false; }
            if (chkMail.checked && !chkPrint.checked) { printBtn.textContent = "Mail Workorder"; printBtn.disabled = false; }
            if (!chkMail.checked && !chkPrint.checked) { printBtn.textContent = "Disabled"; printBtn.disabled = true; }
        }

        // create a local link to the archerInfo so that we don't have to 
        const archerInfo = this.archerInfo;

        // Set our filter type based on if we're pppoe or not
        isPPPoE(archerInfo) ? setDropDownToValue(filters, "pppoe") : setDropDownToValue(filters, "static");

        // Set default date field value (we need to get iso format but want todays local date, so need some work to avoid momentjs import)
        var tzoffset = (new Date()).getTimezoneOffset() * 60000; // offset in milliseconds
        var localISODate = (new Date(Date.now() - tzoffset)).toISOString().split('T')[0];
        dt.value = localISODate;
        
        // Create a blank entry in the technician.
        const blank = document.createElement("option");
        blank.selected = true;
        blank.disabled = true;
        blank.appendChild(document.createTextNode("Select..."));
        technician.appendChild(blank);
        
        // Fill in the technicians in the option drop down from the techNames array.
        this.techNames.forEach(tech => {
            var tOpt = document.createElement("option", { value: tech });
            tOpt.appendChild(document.createTextNode(tech));
            technician.appendChild(tOpt);
        });

        // Wire-up onClick events
        showBtn.addEventListener('click', showArcher)
        archerWindow.addEventListener('click', clickOutsideArcher)
        printBtn.addEventListener('click', clickPrintBtn);

        // Wire-up onChange events
        technician.addEventListener('change', technicianChanged);
        dt.addEventListener('change', dateChanged);

        function setDropDownToValue(s, v) {
            for ( var i = 0; i < s.options.length; i++ ) {        
                if ( s.options[i].value == v ) {
                    s.options[i].selected = true;
                    return;
                }
            }
        }

        // Event for print button clicked on Modal
        function clickPrintBtn() {
            // Check if either of our fields are invalid
            if (!validDate() || !validTech()) return;
            
            if (chkMail.checked) {
                emailWorkorder()
            }

            if (chkPrint.checked) {
                // Display our print able div area
                printContent.classList.remove('hide');
                
                // Generate a qr QR Code and copy it to the printable workorder
                let qrImg = new Image;
                qrImg.src = generateQRDataURL(archerInfo, dt.value, technician.value);

                // Load our logo to put into the template output
                let templateImg = new Image;
                templateImg.src = templateLogo;

                // We use imgCnt to make sure we only print once both images are loaded properly
                let imgCnt = 0;
                qrImg.onload = () => {
                    imgCnt++;
                    printWorkorder(imgCnt, qrImg, templateImg);
                }
                templateImg.onload = () => {
                    imgCnt++;
                    printWorkorder(imgCnt, qrImg, templateImg);
                }
            }
        }

        // Return if we selected a valid technician, and set invalid technician field
        function validTech() { 
            let check = technician.value != "Select...";
            if (check) {
                technician.classList.remove('invalid');
            } else {
                technician.classList.add('invalid');
            }
            return check;
        }

        // Return if the selected date is in the future, and set invalid state of date field
        function validDate() { 
            var tzoffset = (new Date()).getTimezoneOffset() * 60000; // offset in milliseconds
            var localISODate = (new Date(Date.now() - tzoffset)).toISOString().split('T')[0];
            let check = new Date(dt.value) >= new Date(localISODate);
            
            if (check) {
                dt.classList.remove('invalid');
            } else {
                dt.classList.add('invalid');
            }
            return check; 
        }

        // Event when the technician is changed
        function technicianChanged() {
            // Check if either of our fields are invalid
            if (!validTech() || !validDate()) return;

            previewImg.classList.add('hide');
            previewImg.src = generateQRDataURL(archerInfo, dt.value, technician.value);
            previewImg.onload = () => { previewImg.classList.remove('hide'); }
        }

        // Event when the date is changed
        function dateChanged() {
             // Check if either of our fields are invalid
             if (!validDate() || !validTech()) return;

            previewImg.classList.add('hide');
            previewImg.src = generateQRDataURL(archerInfo, dt.value, technician.value);
            previewImg.onload = () => { previewImg.classList.remove('hide'); }
        }

        function emailWorkorder() {
               // Send mail
               ajax.request("/AdminPortal862/send.cnmail", "POST", {
                "name": archerInfo.name,
                "Date": dt.value,
                "Tech": technician.value,
                "TechEmail": technician.value,
                "ESN": archerInfo.esn,
                "Company": archerInfo.company,
                "EIP": archerInfo.eip,
                "Account": archerInfo.accid,
                "Phones": archerInfo.phone,
                "Address": archerInfo.address,
                "Package": archerInfo.package,
                "vlan": archerInfo.vlan,
                "Username": archerInfo.username, 
                "Password": archerInfo.password,
                "Notes": notes.value,
                "Firmware": archerInfo.firmware
            }, 
            () => {
                console.log("Mail Sent!");
                printBtn.textContent = "Mail Sent!";
                printBtn.disabled = true;
            }, 
            () => {
                console.log("Mail Failure!")
                printBtn.textContent = "Mail Failure!";
                printBtn.disabled = true;
            })
        }

        // Generate the image will be printed and then throw it to a popup window and trigger print
        function printWorkorder(imgCnt, qrImg, templateLogo) {
            // When both images are loaded go ahead and print
            if (imgCnt == 2) {
                let ctxDataUrl = generateCanvasImageDataUrl(qrImg, templateLogo)

                // Open a new window to generate the printable workorder
                let printWindow = window.open('', 'WorkorderWindow', '');

                // Create an image and convert canvas from html2canvas to a DataURL for printing
                let outputImg = printWindow.document.createElement('img');
                outputImg.src = ctxDataUrl;
                outputImg.onload = () => {
                    // Add DataURL Image to the printer window document.
                    printWindow.document.body.appendChild(outputImg);

                    // Trigger a print on the popup window, and immediately close it, the print will be syncronous so until the print is finished it won't
                    setTimeout(() => {
                        printWindow.print();
                        printWindow.close();
                    }, 0);

                    // Hide the div on the page that represents the print content
                    printContent.classList.add('hide');
                }
            }
        }

        function generateCanvasImageDataUrl(qrImg, templateLogo) {
            let cv = document.createElement('canvas');
                cv.width = 1600;
                cv.height = 1400;

                let ctx = cv.getContext('2d');
                ctx.fillStyle = 'black';

                ctx.font = 'bold 36px poppins';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                ctx.fillText(dt.value, 300, 200)

                // Add the cnArcher logo
                ctx.drawImage(templateLogo, 50, 50);
                ctx.drawImage(qrImg, 700, 50, 400, 400)

                let rowSpacing = 40;
                let rowStart = 250;

                // Print the values at top column
                ctx.textBaseline = 'bottom';
                ctx.font = '28px poppins';
                ctx.textAlign = 'left';
                ctx.fillText(technician.value, 190, rowStart + (rowSpacing * 1));
                ctx.fillText(archerInfo.esn, 190, rowStart + (rowSpacing * 3));
                ctx.fillText(archerInfo.name, 190, rowStart + (rowSpacing * 4));
                ctx.fillText(archerInfo.company, 190, rowStart + (rowSpacing * 5));
                ctx.fillText(archerInfo.eip, 190, rowStart + (rowSpacing * 6));
                ctx.fillText(archerInfo.accid, 190, rowStart + (rowSpacing * 7));
                ctx.fillText(archerInfo.phone, 190, rowStart + (rowSpacing * 8));
                ctx.fillText(archerInfo.package, 190, rowStart + (rowSpacing * 9));
                canvasWrap(ctx, archerInfo.address, 190, rowStart + (rowSpacing * 10), 850, rowSpacing);

                // Depending on the vlan show static or pppoe on workorder
                if (isPPPoE(archerInfo)) {
                    ctx.fillText("PPPoE", 190, rowStart + (rowSpacing * 12));
                    ctx.fillText(archerInfo.username, 190, rowStart + (rowSpacing * 13));
                    ctx.fillText(archerInfo.password, 760, rowStart + (rowSpacing * 13));
                } else {
                    ctx.fillText("Static IP", 190, rowStart + (rowSpacing * 12));
                    ctx.fillText(archerInfo.vlan, 190, rowStart + (rowSpacing * 13));
                }

                canvasWrap(ctx, notes.value, 50, rowStart + (rowSpacing * 16), 1000, rowSpacing);

                // Print the labels for the top column
                ctx.font = 'bold 28px poppins';
                ctx.textAlign = 'right';
                ctx.fillText('Technician :', 180, rowStart + (rowSpacing * 1));
                ctx.fillText('ESN :', 180, rowStart + (rowSpacing * 3));
                ctx.fillText('Name :', 180, rowStart + (rowSpacing * 4));
                ctx.fillText('Company :', 180, rowStart + (rowSpacing * 5));
                ctx.fillText('EngageIP :', 180, rowStart + (rowSpacing * 6));
                ctx.fillText('AccountID :', 180, rowStart + (rowSpacing * 7));
                ctx.fillText('Phone :', 180, rowStart + (rowSpacing * 8));
                ctx.fillText('Package :', 180, rowStart + (rowSpacing * 9));
                ctx.fillText('Address :', 180, rowStart + (rowSpacing * 10));

                ctx.fillText("Type :", 180, rowStart + (rowSpacing * 12));
                if (archerInfo.vlan == "20") {
                    ctx.fillText("Username :", 180, rowStart + (rowSpacing * 13));
                    ctx.fillText("Password :", 750, rowStart + (rowSpacing * 13));
                } else {
                    ctx.fillText("VLAN :", 180, rowStart + (rowSpacing * 13));
                }

                ctx.textAlign = 'left';
                ctx.fillText('Customer Service Notes', 50, rowStart + (rowSpacing * 15));
                return cv.toDataURL('image/png');
        }

        // Wrapping of text on a canvas to a specific width
        function canvasWrap(ctx, text, x, y, maxWidth, lineHeight) {
            var words = text.split(' ');
            var line = '';
    
            for(var n = 0; n < words.length; n++) {
              var testLine = line + words[n] + ' ';
              var metrics = ctx.measureText(testLine);
              var testWidth = metrics.width;
              if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, y);
                line = words[n] + ' ';
                y += lineHeight;
              }
              else {
                line = testLine;
              }
            }
            ctx.fillText(line, x, y);
          }

        // Background onClick Event: Close modal
        function clickOutsideArcher(e) { 
            // Check if we're clicking on the actual outside overlay element before closing;
            if ((e.target || e.srcElement).id === 'cnArcher') archerWindow.classList.add('hide'); 
        }

        // Open Button onClick Event: Show the archer modal
        function showArcher() { 
            archerWindow.classList.remove('hide'); 
            changeChecks();
        }
    }
}

// Create our custom element that generats the icon and modal
customElements.define('cn-workorder', cnArcherWorkorder)