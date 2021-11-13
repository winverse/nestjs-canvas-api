var app = new Vue({
  el: '#v-app',
  data: {
    text: '',
    messages: [],
    socket: null,
    lastPoint: null,
    ctx: null,
  },
  methods: {
    mouseMove(e) {
      if (e.buttons) {
      let { lastPoint, ctx } = this;
        if (!lastPoint) {
          this.lastPoint = { x: e.offsetX, y: e.offsetY };
          return;
        }
        
        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.stroke();
        this.lastPoint = { x: e.offsetX, y: e.offsetY };
      }
    },
    lastPointReset(e) {
      this.lastPoint = null;
    },
    onKeyDown(e) {
      let canvas = document.querySelector('canvas');

      if (e.key === 'Backspace') {
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    },
    getCanvas() {
      let canvas = document.querySelector('canvas');
      const context = canvas.getContext('2d');

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      context.clearRect(0, 0, canvas.width, canvas.height);
      this.ctx = context;
      console.log('created canvas!');
    },
    connect() {
      this.socket = io('http://localhost:8000', { path: '/websockets'})
      this.socket.on('msgToClient', (msg) => {
        this.receiveMessage(msg);
      })
      console.log('connected!');
    },
  },
})

app.connect();
app.getCanvas();

window.onresize = app.getCanvas;
window.onmousemove = app.mouseMove;
window.onmouseup = app.lastPointReset;
window.onkeydown = app.onKeyDown;s