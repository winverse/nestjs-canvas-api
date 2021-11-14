const app = new Vue({
  el: '#v-app',
  data: {
    socket: null, // socket
    ctx: null, // canvas context
    lastPoint: null,
    loggedUser: {}, // { id: string, name: string, socketId: string }
    users: [], // { id: string, name: string, socketId: string }[]
    color: 'black',
  },
  methods: {
    broadcast(drawInfo) {
      this.socket.emit('drawInfo', drawInfo);
    },
    draw(drawInfo) {
      if (!drawInfo) return;
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
      if (e.code) {
        this.socket.emit('keydown', e.key);
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
    setSocket() {
      const socket = io('http://localhost:8000', { path: '/websockets/rooms' });
      this.socket = socket;
    },
    async connect() {
      this.socket.on('connection', ({ data }) => {
        if (data.users) {
          console.log(data.users);
          this.users = data.users;
        }
      });

      this.socket.on('draw', ({ data }) => {
        this.draw(data);
      });

      this.socket.on('keydown', ({ data }) => {
        const event = { key: data };
        this.onKeyDown(event);
      });

      this.socket.on('disconnection', ({ data }) => {
        const remainUser = this.users.filter(
          user => user.socketId !== data.socketId,
        );
        this.users = remainUser;
      });
    },
    async login() {
      const {
        data: { loggedUser },
      } = await axios.post('http://localhost:3000/api/rooms/login');
      this.loggedUser = loggedUser;
    },
    async getUsers() {
      const {
        data: { users },
      } = await axios.get('http://localhost:3000/api/users');
      this.users = users;
    },
    async init() {
      await this.login();
      await this.getUsers();
      await this.connect();
    },
  },
});

app.setSocket();
app.init();
app.createCanvas();
// app.clearDB();

window.onresize = app.createCanvas;
window.onmousemove = app.mouseMove;
window.onmouseup = app.lastPointReset;
window.onkeydown = app.onKeyDown;
