function checkForServer(hostURL) {
    fetch(hostURL + '/ping')
        .then(response => {
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
    checkForServer(hostURL);
    setInterval(() => {
        checkForServer(hostURL);
    }, 10 * 1000);
};



