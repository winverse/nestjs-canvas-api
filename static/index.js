const app = new Vue({
  el: '#v-app',
  data: {
    text: '',
    messages: [],
    socket: null,
    ctx: null, // canvas context
    lastPoint: null,
    connections: [], // { id: uuid, name: string }
    color: 'black',
  },
  methods: {
    broadcast(drawInfo) {
      this.socket.emit('drawInfo', drawInfo);
    },
    draw(drawInfo) {
      this.ctx.beginPath();
      this.ctx.moveTo(drawInfo.lastPoint.x, drawInfo.lastPoint.y);
      this.ctx.lineTo(drawInfo.x, drawInfo.y);
      this.ctx.strokeStyle = drawInfo.color;
      this.ctx.lineWidth = 5;
      this.ctx.lineCap = 'round';
      this.ctx.stroke();
    },
    mouseMove(e) {
      if (e.buttons) {
        let { lastPoint, ctx } = this;
        if (!lastPoint) {
          this.lastPoint = { x: e.offsetX, y: e.offsetY };
          return;
        }

        const drawInfo = {
          lastPoint,
          x: e.offsetX,
          y: e.offsetY,
          color: this.color,
        };

        this.draw(drawInfo);
        this.broadcast(drawInfo);

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
    createCanvas() {
      let canvas = document.querySelector('canvas');
      const context = canvas.getContext('2d');

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      context.clearRect(0, 0, canvas.width, canvas.height);
      this.ctx = context;
    },
    connect() {
      const socket = io('http://localhost:8000', { path: '/websockets/rooms' });
      this.socket = socket;

      socket.emit('joinRoom');
      socket.on('draw', drawInfo => {
        this.draw(drawInfo.data);
      });
    },
    disconnect() {
      console.log('disConnected');
    },
  },
});

app.connect();
app.createCanvas();

window.onresize = app.createCanvas;
window.onmousemove = app.mouseMove;
window.onmouseup = app.lastPointReset;
window.onkeydown = app.onKeyDown;
