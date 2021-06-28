export function layout(archerInfo, icon) {
    return `
    <a href="#" class="black-link" id="cnArcher-show">${icon}</a>
    <div id="cnArcher" class="cnArcher-window hide">
        <div class="cnArcher-block">
            <div class="cnArcher-preview">
                <img id="previewImg" class="hide"></img>
            </div>
            <div class="title">cn<strong>Archer</strong></div>
            <div class="subtitle">Workorder Creation</div>
            <div class="esn">${archerInfo.esn}</div>
            <div class="customer-info">
                <div class="name">${archerInfo.name}</div>
                <div class="account">${archerInfo.eip}</div>
                <div class="phone">${archerInfo.phone}</div>
                <div class="address">${archerInfo.address}</div>
            </div>
            <div class="option-info">
                <div class="entry">Date</div> <input class="widebox" type="date" id="dt" name="datetime" />
                <div class="entry">Technician</div> <select class="widebox" name="technician" id="technician"></select>
                <div class="entry">Filters</div> <select class="widebox" name="filters" id="filters">
                    <option disabled>Select...</option>
                    <option value="pppoe">PPPoE</option>
                    <option value="static">Static/CPN</option>
                </select>
                <div class="entry-wide">Installation Note</div>
                <textarea name="notes" id="note"></textarea>
                <div class="check-options">
                <div>Mail <input id="mail" type="checkbox" checked /></div> <div>Print <input id="print" type="checkbox" checked /></div>
                </div>
            </div>
            <a href="#" class="print-workorder">Print & Send</a>
        </div>
    </div>
    <div id="cnArcherPrintArea" class="hide"></div>`;
}