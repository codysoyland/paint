var socket = io.connect('')
socket.on('connect', function() {
    var canvas = document.getElementById('usercanvas');
    var context = canvas.getContext('2d');

    function getxy(e) {
        if (e.layerX != undefined) {
            return [e.layerX, e.layerY];
        } else if (e.offsetX != undefined) {
            return [e.offsetX, e.offsetY];
        }
    }

    var stroking = false; // LOL
    canvas.addEventListener('mousedown', function(event) {
        var xy = getxy(event)
        context.beginPath();
        context.moveTo(xy[0], xy[1]);
        stroking = true;
        socket.emit('begin', xy[0], xy[1])
    }, false);
    canvas.addEventListener('mousemove', function(event) {
        var xy = getxy(event)
        if (stroking) {
            context.lineTo(xy[0], xy[1]);
            context.stroke();
            socket.emit('stroke', xy[0], xy[1])
        }
    }, false);
    canvas.addEventListener('mouseup',  function(event) {
        var xy = getxy(event)
        if (stroking) {
            context.lineTo(xy[0], xy[1]);
            context.stroke();
            stroking = false;
            socket.emit('stroke', xy[0], xy[1])
        }
    }, false);
})

socket.on('begin', function(uuid, x, y) {
    var canvas = document.getElementById(uuid);
    if (!canvas) {
        var canvas = document.createElement('canvas');
        canvas.id = uuid;
        canvas.width = 640;
        canvas.height = 480;
        document.getElementById('container').insertBefore(canvas, document.getElementById('usercanvas'));
    }
    var context = canvas.getContext('2d');
    context.beginPath()
    context.moveTo(x, y)
})

socket.on('stroke', function(uuid, x, y) {
    var canvas = document.getElementById(uuid);
    var context = canvas.getContext('2d');
    context.lineTo(x, y)
    context.stroke()
})

socket.on('remove', function(uuid) {
    var canvas = document.getElementById(uuid)
    if (canvas) {
        canvas.parentElement.removeChild(canvas)
    }
})
