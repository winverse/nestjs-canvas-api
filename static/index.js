Vue.directive('add-class-hover', {
  bind(el, binding, vnode) {
    const { value = '' } = binding;
    el.addEventListener('mouseenter', () => {
      el.classList.add(value);
    });
    el.addEventListener('mouseleave', () => {
      el.classList.remove(value);
    });
  },
  unbind(el, binding, vnode) {
    el.removeEventListener('mouseenter');
    el.removeEventListener('mouseleave');
  },
});

Vue.directive('click-outside', {
  bind: function (el, binding, vnode) {
    el.clickOutsideEvent = function (event) {
      if (!(el == event.target || el.contains(event.target))) {
        vnode.context[binding.expression](event);
      }
    };
    document.body.addEventListener('click', el.clickOutsideEvent);
  },
  unbind: function (el) {
    document.body.removeEventListener('click', el.clickOutsideEvent);
  },
});

const palette = [
  '#000000',
  '#868e96',
  '#fa5252',
  '#e64980',
  '#4c6ef5',
  '#15aabf',
  '#12b886',
  '#40c057',
  '#fab005',
  '#fd7e14',
];

const app = new Vue({
  el: '#v-app',
  data: {
    os: '',
    question: '',
    socket: { game: null, chat: null }, // socket
    isGameStart: false,
    ctx: null, // canvas context
    lastPoint: null,
    loggedUser: {},
    examiner: {},
    users: [], // { id, name, socketId, score, thumbnail, enteredAt, wasExaminer }[]
    color: 'black',
    palette,
    textareaShow: false,
    messages: [], // { name, message, thumbnail, createdAt }
    message: '',
  },
  computed: {
    sortByScore() {
      const array = [...this.users, this.loggedUser];
      const result = [];
      const map = new Map();
      for (const item of array) {
        if (!map.has(item.id)) {
          map.set(item.id, true); // set any value to Map
          result.push(item);
        }
      }
      return result.sort((a, b) => b.score - a.score);
    },
    exceptLoggedUsers() {
      return this.users.filter(user => user.id !== this.loggedUser.id);
    },
  },
  methods: {
    handleDraw(drawInfo) {
      if (!drawInfo) return;
      this.ctx.beginPath();
      this.ctx.moveTo(drawInfo.lastPoint.x, drawInfo.lastPoint.y);
      this.ctx.lineTo(drawInfo.x, drawInfo.y);
      this.ctx.strokeStyle = drawInfo.color;
      this.ctx.lineWidth = 5;
      this.ctx.lineCap = 'round';
      this.ctx.stroke();
    },
    handleMouseMove(e) {
      const domId = e?.target?.getAttribute('id');
      if (e.buttons && domId === 'canvas') {
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

        this.handleDraw(drawInfo);
        this.socket.game.emit('drawInfo', drawInfo);

        this.lastPoint = { x: e.offsetX, y: e.offsetY };
      }
    },
    handleLastPoint() {
      this.lastPoint = null;
    },
    handleColor(color) {
      this.color = color;
    },
    handleKeyDown(e) {
      if (this.textareaShow) return;
      let canvas = document.querySelector('canvas');
      if (e.key === 'Backspace') {
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      if (e.code) {
        this.socket.game.emit('keydown', e.key);
      }
    },
    handleGameStart() {
      console.log('start');
      this.socket.game.emit('gameStart');
      setTimeout(() => new Promise(resolve => resolve()), 0);
      this.isGameStart = true;
    },
    handleGameEnd() {
      this.socket.game.emit('gameEnd');
      setTimeout(() => new Promise(resolve => resolve()), 0);
      this.isGameStart = false;
    },
    handleExaminer() {
      const examiner = this.users
        .filter(user => !user.wasExaminer)
        .sort((a, b) => a.enteredAt - b.enteredAt)[0];

      if (examiner) {
        this.examiner = examiner;
        examiner.wasExaminer = true;
        this.socket.game.emit('setExaminer', {
          examiner,
          question: this.question,
        });
      } else {
        // 초기화
      }
    },
    handleChangeMessage(e) {
      const { value } = e?.target;
      this.message = value;
      if (this.question === value) {
        this.handleGameEnd();
      }
    },
    handleTextareaShow() {
      this.textareaShow = true;
      const textArea = document.getElementById('textarea');
      if (textArea) {
        textarea.focus();
      }
    },
    handleTextareaHide(e) {
      const except = ['no-message', 'textarea', 'fas'].includes(
        e.target.getAttribute('class')?.split(' ')[0],
      );
      if (this.textareaShow && !except) {
        const textArea = document.getElementById('textarea');
        textArea.blur();
        this.textareaShow = false;
        this.message = '';
      }
    },
    async handleSendMessage(e) {
      if (!this.message) return;
      // send Icon click
      const clickSendIcon =
        e.target.getAttribute('class')?.split(' ')[0] === 'fas';

      if (e.keyCode || clickSendIcon) {
        const { name, thumbnail } = this.loggedUser;
        const messageInfo = {
          name,
          thumbnail,
          message: this.message,
          createdAt: dateFns.format(new Date(), 'HH:mm'),
        };

        this.messages.push(messageInfo);
        this.message = '';
        this.socket.chat.emit('sendMessage', messageInfo);

        const textArea = document.getElementById('textarea');
        textArea.focus();

        setTimeout(() => {
          const chatList = document.getElementById('chat-list-box');
          chatList.scrollTop = chatList.scrollHeight;
        }, 0);
      }
    },
    createCanvas() {
      let canvas = document.querySelector('canvas');
      const context = canvas.getContext('2d');
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      context.clearRect(0, 0, canvas.width, canvas.height);
      this.ctx = context;
    },
    handleSocket() {
      const gameSocket = io('http://localhost:8000', {
        path: '/websockets/games',
      });

      const chatSocket = io('http://localhost:8001', {
        path: '/websockets/chat',
      });

      this.socket.game = gameSocket;
      this.socket.chat = chatSocket;
    },
    async handleSocketController() {
      this.socket.game.on('connection', ({ data }) => {
        if (data.users) {
          this.users = data.users;
        }
      });

      this.socket.game.on('draw', ({ data }) => {
        this.handleDraw(data);
      });

      this.socket.game.on('keydown', ({ data }) => {
        const event = { key: data };
        this.handleKeyDown(event);
      });

      this.socket.chat.on('receviedMessage', ({ data }) => {
        this.messages.push(data);

        setTimeout(() => {
          const chatList = document.getElementById('chat-list-box');
          chatList.scrollTop = chatList.scrollHeight;
        }, 0);
      });

      this.socket.game.on('setExaminer', ({ data }) => {
        this.examiner = data.examiner;
        this.question = data.question;
      });

      this.socket.game.on('gameStart', () => {
        this.isGameStart = true;
      });

      this.socket.game.on('gameEnd', () => {
        this.isGameStart = false;
      });

      this.socket.game.on('disconnection', async ({ data }) => {
        const remainUser = this.users;
        this.users = remainUser;
        if (data.id === this.examiner.id) {
          await this.getQuestion();
          this.handleExaminer();
        }
      });
    },
    async login() {
      const {
        data: { loggedUser },
      } = await axios.post('http://localhost:3000/api/games/login');
      this.loggedUser = loggedUser;
    },
    async getUsers() {
      const {
        data: { users },
      } = await axios.get('http://localhost:3000/api/users');
      this.users = users.filter(user => user.id !== this.loggedUser.id);

      if (users.length === 1) {
        await this.getQuestion();
        this.handleExaminer();
      }
    },
    async getQuestion() {
      const {
        data: { question },
      } = await axios.get('http://localhost:3000/api/games/questions');
      this.question = question;
    },
    async getExaminer() {
      const {
        data: { payload },
      } = await axios.get('http://localhost:3000/api/games/examiners');
      this.examiner = payload.examiner;
      this.question = payload.question;
    },
    async init() {
      const { family } = platform.os;

      this.os = family === 'OS X' ? 'mac' : 'window';

      await this.login();
      await this.getUsers();
      await this.handleSocketController();

      if (!this.examiner?.id) {
        await this.getExaminer();
      }
    },
  },
});

app.handleSocket();
app.init();
app.createCanvas();
// app.clearDB();

window.onresize = app.createCanvas;
window.onmousemove = app.handleMouseMove;
window.onmouseup = app.handleLastPoint;
window.onkeydown = app.handleKeyDown;
window.onclick = app.handleTextareaHide;
