(function() {
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||    // name has changed in Webkit
                                      window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
            var id = window.setTimeout(function() {
                callback(currTime + timeToCall);
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }
}());
var getFlag = function(id) {
    return document.getElementById(id); //获取元素引用
}
var extend = function(des, src) {
    for (p in src) {
        des[p] = src[p];
    }
    return des;
}
var userAll = null;
var Ball = function(diameter,obj) {
    var ball = document.createElement("div");
    ball.className = obj.id;
    with(ball.style) {
        width = height = diameter + 'px';
        position = 'absolute';
        backgroundImage = 'url('+obj.headimgurl+')';
    }
    return ball;
}
var Screen = function(cid, config) {
    //先创建类的属性
    var self = this;
    if (!(self instanceof Screen)) {
        return new Screen(cid, config)
    }
    config = extend(Screen.Config, config) //configj是extend类的实例    self.container=getFlag(cid);            //窗口对象
    self.container = getFlag(cid);
    self.ballsnum = config.ballsnum;
    self.diameter = config.diameter; //球的直径
    self.radius = self.diameter / 2;
    self.spring = config.spring; //球相碰后的反弹力
    self.bounce = config.bounce; //球碰到窗口边界后的反弹力
    self.gravity = config.gravity; //球的重力
    self.balls = []; //把创建的球置于该数组变量
    self.timer = null; //调用函数产生的时间id
    self.L_bound = 0; //container的边界
    self.R_bound = self.container.clientWidth; //document.documentElement.clientWidth || document.body.clientWidth 兼容性
    self.T_bound = 0;
    self.B_bound = self.container.clientHeight;
};
Screen.Config = { //为属性赋初值
    ballsnum: 10,
    spring: 0.8,
    bounce: -0.9,
    gravity: 0.05,
    diameter: 50
};
Screen.prototype = {
    initialize: function() {
        var self = this;
        self.createBalls();
        self.hitBalls()
        self.timer = setInterval(function() { self.hitBalls() }, 20)
    },
    createBalls: function() {
        var self = this,
            num = self.ballsnum;
        var frag = document.createDocumentFragment(); //创建文档碎片，避免多次刷新       
        for (i = 0; i < num; i++) {
            var ball = new Ball(self.diameter,userAll[i]);
            //var ball=new Ball(self.diameter,clss[ Math.floor(Math.random()* num )]);//这里是随机的10个小球的碰撞效果
            ball.diameter = self.diameter;
            ball.radius = self.radius;
            ball.style.left = (Math.random() * self.R_bound) + 'px'; //球的初始位置，
            ball.style.top = (Math.random() * self.B_bound) + 'px';
            ball.vx = Math.random() * 6 - 3;
            ball.vy = Math.random() * 6 - 3;
            frag.appendChild(ball);
            self.balls[i] = ball;
        }
        self.container.appendChild(frag);
    },
    hitBalls: function() {
        var self = this,
            num = self.ballsnum,
            balls = self.balls;
        for (i = 0; i < num - 1; i++) {
            var ball1 = self.balls[i];
            ball1.x = ball1.offsetLeft + ball1.radius; //小球圆心坐标
            ball1.y = ball1.offsetTop + ball1.radius;
            for (j = i + 1; j < num; j++) {
                var ball2 = self.balls[j];
                ball2.x = ball2.offsetLeft + ball2.radius;
                ball2.y = ball2.offsetTop + ball2.radius;
                dx = ball2.x - ball1.x; //两小球圆心距对应的两条直角边
                dy = ball2.y - ball1.y;
                var dist = Math.sqrt(dx * dx + dy * dy); //两直角边求圆心距
                var misDist = ball1.radius + ball2.radius; //圆心距最小值
                if (dist <= misDist) {
                    //假设碰撞后球会按原方向继续做一定的运动，将其定义为运动A   
                    var angle = Math.atan2(dy, dx);
                    //当刚好相碰，即dist=misDist时，tx=ballb.x, ty=ballb.y
                    tx = ball1.x + Math.cos(angle) * misDist;
                    ty = ball1.y + Math.sin(angle) * misDist;
                    //产生运动A后，tx > ballb.x, ty > ballb.y,所以用ax、ay记录的是运动A的值
                    ax = (tx - ball2.x) * self.spring;
                    ay = (ty - ball2.y) * self.spring;
                    //一个球减去ax、ay，另一个加上它，则实现反弹
                    ball1.vx -= ax;
                    ball1.vy -= ay;
                    ball2.vx += ax;
                    ball2.vy += ay;
                }
            }
        }
        for (i = 0; i < num; i++) {
            self.moveBalls(balls[i]);
        }
    },
    moveBalls: function(ball) {
        var self = this;
        ball.vy += self.gravity;
        ball.style.left = (ball.offsetLeft + ball.vx) + 'px';
        ball.style.top = (ball.offsetTop + ball.vy) + 'px';
        //判断球与窗口边界相碰，把变量名简化一下
        var L = self.L_bound,
            R = self.R_bound,
            T = self.T_bound,
            B = self.B_bound,
            BC = self.bounce;
        if (ball.offsetLeft < L) {
            ball.style.left = L;
            ball.vx *= BC;
        } else if (ball.offsetLeft + ball.diameter > R) {
            ball.style.left = (R - ball.diameter) + 'px';
            ball.vx *= BC;
        } else if (ball.offsetTop < T) {
            ball.style.top = T;
            ball.vy *= BC;
        }
        if (ball.offsetTop + ball.diameter > B) {
            ball.style.top = (B - ball.diameter) + 'px';
            ball.vy *= BC;
        }
    }
}




