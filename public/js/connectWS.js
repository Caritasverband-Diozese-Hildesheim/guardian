const socket = new WebSocket('ws://localhost:8080');

// Connection opened
socket.addEventListener('open', function (event) {
    socket.send('Hello Server!');
});

// Listen for messages
socket.addEventListener('message', function (event) {
    console.log(event.data);
    if (event.data === "Hello Client!") {
        fetch('http://localhost:5000/ping')
            .then(response => {
                console.log(response.status)
                if (response.status === 200) {
                    return response.json();
                }
                else
                    alert('Server not reachable')
                    let data ={};
                    return data.message="";
            })
            .then(data => {
                if (data.message === "pong") {

                    window.location="http://localhost:5000";
                }
            })
            .catch ((err) => {
                alert('Server not reachable')
                    let data ={};
                    return data.message="";
            })
    }
});




