class Point {

  // 构造函数类似物
  // 当使用 new 关键字创建一个类的实例时，constructor 方法会被自动调用
  constructor(orx, ory, size, colorNum = 0,realColor = ``, canvas, cancelRandPlace = false) {
    // 原始位置
    this.orx = orx;
    this.ory = ory;
    // 圆点大小
    this.size = size;
    // 当前位置
    // 如果是cancelRandPlace，那么之间原点，否则初始化为画布的随机位置
    this.x = cancelRandPlace ? orx : Math.random() * canvas.width;
    this.y = cancelRandPlace ? ory : Math.random() * canvas.height;
    // 下一个移动位置
    this.nx = orx;
    this.ny = ory;
    // 移速
    this.spx = 0;
    this.spy = 0;
    // 透明度
    this.opacity = 0;
    this.canvas = canvas;

    // 颜色
    if(realColor.length !== 0){
      // 如果存在色彩数据，直接调用
      this.color = realColor;
    }else{
      // 将 colorNum 除以 3，然后取整。
    // 这样做的目的是将红、绿、蓝三个通道的值平均化，生成一个灰度值。（RGB三值相等，就是灰色）
    let c = Math.floor(colorNum / 3);
    /** 纯数字rgb值 , 例: `255,255,255` */
    this.color = `${c},${c},${c}`;
    }
    
  }

  update(ParticlePolymerizeFlag = true, options, mx, my) {
    // 接收参数
    // ParticlePolymerizeFlag：布尔值，表示粒子是否处于聚合状态（true 为聚合，false 为散开）。
    // options：配置对象，包含控制粒子行为的参数（如 Thickness、Drag、Ease 等）
    // mx 和 my：鼠标的当前位置（X 和 Y 坐标）

    // 解构变量
    const { Thickness, Drag, Ease, effectParticleMode } = options;
    // Thickness：鼠标影响粒子的范围。
    // Drag：粒子的移动阻力（值越大，移动越慢）。
    // Ease：粒子回到目标位置的缓动效果（值越大，移动越平滑）。
    // effectParticleMode：粒子互动模式（'adsorption' 为吸附，'repulsion' 为排斥）。

    //粒子的移动速度
    // this.x  this.y：粒子的当前位置。
    // this.nx  this.ny：粒子的目标位置（聚合时为原始位置，散开时为随机位置）
    // this.spx  this.spy：粒子的移动速度（X 和 Y 方向）
    // 速度=距离/时间
    this.spx = (this.nx - this.x) / (ParticlePolymerizeFlag ? 30 : 60);
    this.spy = (this.ny - this.y) / (ParticlePolymerizeFlag ? 30 : 60);

    // 粒子原始位置距离当前鼠标位置判断
    let curDx = (mx - this.x),
      curDy = (my - this.y);

    // 鼠标相对点原始位置的直线距离的平方，因为开方比较费性能所以不开
    let d1 = curDx * curDx + curDy * curDy;

    // 鼠标相对点原始位置的距离比例, 小于 1 为在边界外, 等于 1 为刚好在边界上, 大于 1 为在边界内
    // f 为吸引因子，f越大，表示影响权重越高
    let f = Thickness / d1;
    // 如果 f 太小（距离太远），则限制为 0.1，防止影响过小。
    f = f < 0.1 ? 0.1 : f;

    let finalT = 0;

    // 吸附模式
    if (effectParticleMode == 'adsorption') {
      // 防止圆点飞太远，限制f不能超过12
      f = f > 12 ? 12 : f;
      if (f > 0.5 && f <= 1.5) f = 0.5;
    }
    // 排斥模式
    else if (effectParticleMode == 'repulsion') {
      // 防止圆点飞太远
      f = f > 7 ? 7 : f;
    }

    // 结果为弧度，角度 = 弧度 * (180 / Math.PI);
    // 计算原点到 curDx,curDy 坐标点的角度，范围从-180°到180°（360°的另一种表达法）
    // 目的是计算粒子到鼠标的角度
    finalT = Math.atan2(curDy, curDx);
    // 吸引因子 * cos该角度= X分量
    // 吸引因子 * sin该角度= Y分量
    // 吸引因子为斜边（鼠标到粒子的直线距离）
    // sinO = vY/V ; cosO = vX/V ; tanO = vY/vX ; O=arctan(vY/vX)
    let vx = f * Math.cos(finalT),
      vy = f * Math.sin(finalT);

    // 计算出要移动的距离
    if (effectParticleMode) {
      // 如果是吸收模式，则分量为正方向（偏向鼠标）否则为负（远离鼠标）
      let finalX = ((effectParticleMode === 'adsorption' ? vx : -vx) * Drag) + ((this.orx - this.x) * Ease) / 400,
        finalY = ((effectParticleMode === 'adsorption' ? vy : -vy) * Drag) + ((this.ory - this.y) * Ease) / 400;
      // 更新粒子在X/Y方向上的速度
      this.spx += finalX;
      this.spy += finalY;
    }

    // 最终计算
    if (!ParticlePolymerizeFlag && this.opacity > 0) {
      // 粒子仍可见时，按照已有速度向目标移动，并逐渐降低透明度
      this.x -= this.spx;
      this.opacity -= 0.04;

      // 全部隐藏时直接移动到随机位置
      if (this.opacity <= 0) {
        this.x = this.nx;
        this.y = this.ny;
      }
    } else {
      this.x += this.spx;
      if (this.opacity < 1)
        this.opacity += 0.012;
    }
    if (!ParticlePolymerizeFlag && this.opacity > 0) {
      this.y -= this.spy;
    } else {
      this.y += this.spy;
    }
  }

  // 在画布上绘制粒子
  render() {
    const ctx = this.canvas.getContext('2d')
    ctx.beginPath();
    // 改变初始位置
    // this.x 和 this.y：粒子的当前位置（X 和 Y 坐标）。this.size：粒子的大小（半径）。
    // 0 和 360：起始角度和结束角度（以弧度表示）。
    ctx.arc(this.x, this.y, this.size, 0, 360);
    // 设置填充颜色
    ctx.fillStyle = `rgba(${this.color},${this.opacity > 1 ? 1 : this.opacity})`;
    // 执行颜色填充
    ctx.fill();
    // 关闭路径，结束绘制。
    ctx.closePath();
  }

  // 更新粒子的目标位置和颜色
  changePos(newX, newY, colorVal,realColor) {
    if (newX)
      this.orx = this.nx = newX
    if (newY)
      this.ory = this.ny = newY
    if (colorVal) {
      if(realColor.length != 0){
        this.color = realColor;
      }else{
        let c = Math.floor(colorVal / 3);
        this.color = `${c},${c},${c}`;
      }
      
    }
  }
}

class DameDaneParticle {
  /**
   * @param {HTMLCanvasElement} canvas 
   * @param {ParticleOptions} options 
   * @param {Function} callback 
   */
  constructor(canvas, options, callback) {
    // 预处理
    const initOptions = {
      renderX: 0,
      renderY: 0,
      spacing: 1,
      size: 1,
      Drag: 0.95,
      Ease: 0.1,
      Thickness: 50,
      validColor: {
        min: 300, max: 765, invert: false
      },
      useColor: false, // 是否启用彩色模式，默认为否
      UseHiPrecision: false, //是否使用更高精度的色彩渲染模式，默认为否（会执行二次渲染）
      cancelParticleAnimation: false
    }
    // 处理可能存在的Undefined值
    for (const i in initOptions) {
      if (typeof options[i] === 'undefined') options[i] = initOptions[i];
    }
    // 平方Thickness值
    options.Thickness *= options.Thickness;

    // 提取options中的src（需渲染的图像路径）
    const { src } = options;

    // 元素宽高
    this.w = canvas.width, this.h = canvas.height;

    /** 传入的 canvas 元素 */
    this.canvasEle = canvas;
    /** 传入的 canvas 元素 2D 上下文 */
    this.ctx = canvas.getContext('2d');

    //设定Canvas长宽为浏览器窗口的视口长宽
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    /** 图片对象 */
    this.IMG = new Image();
    this.IMG.src = src;
    // 图片信息
    this.ImgW = 0, this.ImgH = 0;

    /** 粒子位置信息数组 */
    this.PointArr = [];
    /** 粒子散开聚合标记, `true` 为聚合 */
    this.ParticlePolymerizeFlag = true;

    /** 动画 id */
    this.animeId = -1;

    /** 鼠标位置 X */
    this.mx = 0;
    /** 鼠标位置 Y */
    this.my = 0;

    // 初始化标记
    this.hasInit = false;
    /** 执行了动画触发标记 */
    this.hasDraw = false;

    // options 备份
    this.options = options;

    // 图片加载完成
    this.IMG.onload = () => {
      // 设置解构
      const { renderX, renderY, w, h } = this.options;

      // 渲染起始位置
      this.renderX = renderX;
      this.renderY = renderY;
      // 设定渲染范围宽度和高度，不存在或参数错误则从图像属性中提取
      if (typeof w === 'number') this.ImgW = w;
      else this.ImgW = this.IMG.width;
      if (typeof h === 'number') this.ImgH = h;
      else this.ImgH = Math.floor(this.ImgW * (this.IMG.height / this.IMG.width));

      // 获取数据
      const ele = document.createElement('canvas');
      ele.width = this.ImgW;
      ele.height = this.ImgH;
      // 获取 2D 渲染上下文对象
      const eleCtx = ele.getContext('2d');
      // 临时画布用于在内存中绘制图片，而不会影响页面上显示的画布。
      eleCtx.drawImage(this.IMG, 0, 0, this.ImgW, this.ImgH);
      this._imgArr = eleCtx.getImageData(0, 0, this.ImgW, this.ImgH).data;
      eleCtx.clearRect(0, 0, canvas.width, canvas.height);
      // 第一次初始化图片
      this._InitParticle(this._imgArr, true);
      if (!this.hasDraw) this._Draw2Canvas();
      this.hasInit = true;
      if(this.options.UseHiPrecision===true){ 
        //使用高精度色彩时，触发resize以二次渲染
        setTimeout(()=>{
          window.dispatchEvent(new Event('resize'));
        },550)
      }
      callback && callback();
    }

    /** 鼠标移动监听函数 */
    // 是 Lodash 库中的一个函数，用于节流，即等待多久执行一次，time单位为ms
    // 在指定的时间间隔内，最多执行一次函数调用。这样可以减少函数的调用频率，提高性能。
    // _.throttle(func,time);
    this.$changeMxMy = _.throttle((e) => {
      const cRect = canvas.getBoundingClientRect();
      this.mx = e.clientX - cRect.left + 3;
      this.my = e.clientY - cRect.top + 3;
    }, 20)
    canvas.addEventListener("mousemove", this.$changeMxMy);

    /** 自适应函数 */
    this.$fit = _.throttle(() => {
      canvas = this.canvasEle;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      this._InitParticle();
    }, 10)

    // 窗口自适应
    window.addEventListener('resize', this.$fit);
  }

  /**
   * 图片初始化函数，**此项为内置 api， 不建议随便调用**
   * @param {Uint8ClampedArray} ImgData 图片数据数组
   * @param {boolean} rebuildParticle 是否重组图像
   */
  _InitParticle = (ImgData, rebuildParticle = false) => {
    if (!ImgData) ImgData = this._imgArr; // 确保 ImgData 不为空

    let imgW = this.ImgW, imgH = this.ImgH, cnt = 0;

    let arr = this.PointArr;

    let { spacing, size, validColor, cancelParticleAnimation } = this.options, proportion = window.innerHeight / window.outerHeight;
    spacing *= proportion > 0.5 ? proportion : 0.5;

    let r, g, b, val, position;
    const gap = 4;
    for (var h = 0; h < imgH; h += gap) {
      for (var w = 0; w < imgW; w += gap) {
        // 每个像素由 4 个连续的值表示：R、G、B、A
        position = (imgW * h + w) * 4;
          r = ImgData[position],
          g = ImgData[position + 1],
          b = ImgData[position + 2];
        // RGB相加为亮度值
        val = r + g + b
        // 像素符合条件
        if ((validColor.invert && (val <= validColor.min || val >= validColor.max)) || (!validColor.invert && val >= validColor.min && val <= validColor.max)) {
          // 判断是否有前置像素
          if (arr[cnt] && !cancelParticleAnimation) {
            const point = arr[cnt];
            // 如果使用彩色模式，追加色彩
            if(this.options.useColor === true){
              point.changePos(w * spacing + this.renderX, h * spacing + this.renderY, val,`${r},${g},${b}`)
            }else{
              point.changePos(w * spacing + this.renderX, h * spacing + this.renderY, val,``)
            }
            
          }
          else{
            if(this.options.useColor === true){
              arr[cnt] = new Point(w * spacing + this.renderX, h * spacing + this.renderY, size, val,`${r},${g},${b}`, this.canvasEle, this.hasInit || cancelParticleAnimation);
            }else{
              arr[cnt] = new Point(w * spacing + this.renderX, h * spacing + this.renderY, size, val,``, this.canvasEle, this.hasInit || cancelParticleAnimation);
            }
          } 
          cnt++;
        }
      }
    }

    if (cnt < arr.length)
      this.PointArr = arr.splice(0, cnt);

    // 最终位置打乱
    if (rebuildParticle && !cancelParticleAnimation) {
      arr = this.PointArr;
      let len = arr.length, randIndex = 0, tx = 0, ty = 0;
      while (len) {
        randIndex = (Math.floor(Math.random() * len--));
        tx = arr[randIndex].orx, ty = arr[randIndex].ory;

        arr[randIndex].orx = arr[randIndex].nx = arr[len].orx,
          arr[randIndex].ory = arr[randIndex].ny = arr[len].ory;

        arr[len].orx = arr[len].nx = tx,
          arr[len].ory = arr[len].ny = ty;
      }
    }

    // 解决散开后切换图片再聚合时粒子没有从随机位置回到正常位置的问题
    if (!this.ParticlePolymerizeFlag) this.ParticlePolymerize(false);
  }

  /** 绘制到 canvas，**此项为内置 api， 不建议随便调用** */
  _Draw2Canvas = () => {
    this.hasDraw = true
    const w = this.canvasEle.width, h = this.canvasEle.height;
    this.ctx.clearRect(0, 0, w, h);
    this.PointArr.forEach(
      /** @param {Point} point */
      (point) => {
        point.update(this.ParticlePolymerizeFlag, this.options, this.mx, this.my);
        point.render();
      })
    requestAnimationFrame(this._Draw2Canvas);
  }

  /**
    * 散开聚合控制
    * @param {boolean | undefined} flag 控制是否聚合，不传入则以当前状态取反
    */
  ParticlePolymerize(flag) {
    if (typeof flag === 'boolean') this.ParticlePolymerizeFlag = flag;
    else this.ParticlePolymerizeFlag = !this.ParticlePolymerizeFlag;
    this.PointArr.forEach(
      /** @param {Point} point */
      (point) => {
        point.nx = this.ParticlePolymerizeFlag ? point.orx : Math.random() * this.canvasEle.width;
        point.ny = this.ParticlePolymerizeFlag ? point.ory : Math.random() * this.canvasEle.height;
      });
  }



  /**
    * 修改展示的图片，未设置的项会继承上一张图片的设置
    * @param {string} src 图片路径
    * @param {ParticleOptions} options 选项设置，不传入则继承上一次的设置
    */
  ChangeImg(src, options) {
    this.IMG.src = src;
    // 如果 options 中没有 useColor，则设置默认值为 false，并取消高精度渲染模式
    if (typeof options.useColor === 'undefined') {
      options.useColor = false;
      options.validColor= { //恢复默认色彩范围
        min: 300,
        max: 765,
        invert: false
      }
      if(typeof options.UseHiPrecision === 'undefined'){
        options.UseHiPrecision = false;
      }
    }
    // 替换设置
    if (options) {
      for (const i in options) {
        this.options[i] = options[i];
      }
    }
    if(this.options.UseHiPrecision===true){ 
      //使用高精度色彩时，触发resize以二次渲染
      setTimeout(()=>{
        window.dispatchEvent(new Event('resize'));
      },550)
    }
  }

  /** 预销毁当前实例，销毁对象前请通过此方法解绑监听事件与清除画布 */
  PreDestory(callback) {
    this.canvasEle.removeEventListener('mousemove', this.$changeMxMy);
    window.removeEventListener('resize', this.$fit);
    cancelAnimationFrame(this.animeId);
    this.PointArr = [];
    this.ctx.clearRect(0, 0, this.canvasEle.width, this.canvasEle.height);

    callback && callback();
  }
}
