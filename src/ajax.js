const Ajax = {
    xhr : null,
    request : function (url, method, data, success, failure) {
        if (!this.xhr){
            this.xhr = window.ActiveX ? new ActiveXObject("Microsoft.XMLHTTP"): new XMLHttpRequest();
        }

        var self = this.xhr;

        self.onreadystatechange = function () {
            if (self.readyState === 4 && self.status === 200){
                // the request is complete, parse data and call callback
                var response = JSON.parse(self.responseText);
                success(response);
            } else if (self.readyState === 4) { // something went wrong but complete
                failure();
            }
        };

        this.xhr.open(method, url, true);
        
        if (method === "POST"){
            console.log(`AJAX Post: ${url}`)
            this.xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            this.xhr.setRequestHeader('Content-Type', 'application/json');
            this.xhr.send(JSON.stringify(data));
        } else {
            console.log(`AJAX Get: ${url}`)
            this.xhr.send();
        }
    },
};

export default Ajax;