import uuid
from gevent import monkey; monkey.patch_all()

from flask import Flask, request, render_template, send_file
from socketio import socketio_manage
from socketio.namespace import BaseNamespace
from socketio.mixins import BroadcastMixin
from socketio.server import SocketIOServer

class PaintNamespace(BaseNamespace, BroadcastMixin):
    def on_begin(self, x, y):
        self.broadcast_event_not_me('begin', self.session.get('uuid'), x, y)

    def on_stroke(self, x, y):
        self.broadcast_event_not_me('stroke', self.session.get('uuid'), x, y)

    def initialize(self, *args, **kwargs):
        self.session['uuid'] = uuid.uuid1().hex
        super(PaintNamespace, self).initialize(*args, **kwargs)

    def disconnect(self, *args, **kwargs):
        self.broadcast_event_not_me('remove', self.session.get('uuid'))

app = Flask(__name__)
app.config.from_object(__name__)

@app.route('/')
def paint():
    return send_file('paint.html')

@app.route('/paint.js')
def paint_js():
    return send_file('paint.js')

@app.route("/socket.io/<path:path>")
def run_socketio(path):
    socketio_manage(request.environ, {'': PaintNamespace})
    return 'out'

if __name__ == '__main__':
    print 'Listening on http://localhost:8080'
    app.debug = True
    SocketIOServer(('0.0.0.0', 8080), app,
        resource='socket.io', policy_server=False).serve_forever()
