function connectForMessages(URL){
    var ws = new WebSocket(URL);
				
    ws.onopen = function() {
        ws.onmessage = function (evt) { 
            if (evt.data === 'Connection to guardian etablished!')
            {
                console.log(evt.data);
            }
            else 
            {
                alert(JSON.parse(evt.data).msg);
            }
         };
    }
}
function checkForServer(hostURL) {
    fetch(hostURL + '/ping')
        .then(response => {
            console.log(response.status)
            if (response.status === 200) {
                return response.json();
            }
            else {
                document.getElementById("message").innerHTML = 'Server not reachable. Please wait, we try again in 10 seconds.';
                let data = {};
                return data.message = "";
            }
        })
        .then(data => {
            if (data.message === "pong") {
                clearInterval();
                window.location = hostURL;
            }
        })
        .catch((err) => {
            document.getElementById("message").innerHTML = 'Server not reachable. Please wait, we try again in 10 seconds.'

            let data = {};
            return data.message = "";
        })
}

function startScanning(hostURL) {
    connectForMessages('ws://localhost:4000/')
    checkForServer(hostURL);
    setInterval(() => {
        checkForServer(hostURL);
    }, 10 * 1000);
};



