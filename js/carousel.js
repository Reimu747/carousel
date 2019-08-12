/**
 * 滚动轮播图
 * @param str carousel容器选择器，通过此选择器应定位唯一的carousel元素
 */
function Carousel(str) {
    // carousel容器
    this.$carousel = $(str);
    // carousel box
    this.$carouselBox = this.$carousel.find("div.carousel-box");
    // 图片列表
    this.$imgs = this.$carousel.find("img");
    // 左右按钮
    this.$btns = this.$carousel.find("div.carousel-btns");
    // carousel圆点
    this.$circles = this.$carousel.find("div.carousel-circles");
    this.cirsOldStyle = null;
    this.cirsNewStyle = null;
    // 定时器
    this.timer = null;
    // carousel宽度、高度
    const CAROUSEL_WIDTH = parseInt(this.$carousel.css("width"));
    const CAROUSEL_HEIGHT = parseInt(this.$carousel.css("height"));
    // 图片数量，不包含猫腻图
    const LENGTH = this.$imgs.length;

    /**
     * 初始化carousel
     * @param cirOldStyle 默认圆点样式
     * @param cirNewStyle 高亮圆点样式
     */
    this.initCarousel = function (cirOldStyle, cirNewStyle) {
        // carousel box布局
        this.$carouselBox.css({
            width: (CAROUSEL_WIDTH * (this.$imgs.length + 2)) + "px",
            left: -CAROUSEL_WIDTH + "px",
        });
        // 图片布局
        this.$imgs.each(function () {
            $(this).css("left", ($(this).index() + 1) * parseInt(CAROUSEL_WIDTH));
        });
        // 导入圆点样式
        this.cirsOldStyle = cirOldStyle === undefined ? "default-cir" : cirOldStyle;
        this.cirsNewStyle = cirNewStyle === undefined ? "default-highlight-cir" : cirNewStyle;

        // 在图片前后添加猫腻图，并重新设置变量
        this.$carouselBox.prepend(this.$imgs.eq(this.$imgs.length - 1).clone().css("left", 0));
        this.$carouselBox.append(this.$imgs.eq(0).clone().css("left", (this.$imgs.length + 1) * parseInt(CAROUSEL_WIDTH)));
        this.$imgs = this.$carousel.find("img");
    };
    /**
     * carousel自动轮播
     * @param pauseTime 图片暂停时间
     * @param moveSpeed 动画持续时间
     */
    this.autoplay = function (pauseTime, moveSpeed) {
        if (pauseTime === undefined) {
            pauseTime = 500;
        }
        if (moveSpeed === undefined) {
            moveSpeed = 1000;
        }
        let me = this;

        // 设置定时器，自动轮播
        this.timer = setInterval(function () {
            me.moveOnce("LEFT", moveSpeed);
        }, pauseTime + moveSpeed);
        this.$carousel.mouseenter(function () {
            clearInterval(me.timer);
        });
        this.$carousel.mouseleave(function () {
            clearInterval(me.timer);
            me.timer = setInterval(function () {
                me.moveOnce("LEFT", moveSpeed);
            }, pauseTime + moveSpeed);
        });
    };
    /**
     * carousel移动
     * @param speed 动画持续时间
     * @param deltaX 轮播偏移量
     * @param fn 动画完成后执行函数
     */
    this.move = function (speed, deltaX, fn) {
        if (speed === undefined) {
            speed = 1000;
        }
        if (deltaX === undefined) {
            deltaX = CAROUSEL_WIDTH;
        }
        if (fn === undefined) {
            fn = function () {
            };
        }

        if (!this.$carouselBox.is(":animated")) {
            this.$carouselBox.animate({
                left: "+=" + deltaX,
            }, speed, fn);
        }
    };
    /**
     * carousel单次移动
     * @param dire 移动方向，left向左移动，right向右移动
     * @param speed 动画持续时间
     */
    this.moveOnce = function (dire, speed) {
        if (dire === undefined) {
            dire = "left";
        }
        if (speed === undefined) {
            speed = 1000;
        }

        // 设置轮播偏移量为一个图片宽度
        let deltaX;
        if (dire.toLowerCase() === "left") {
            deltaX = -CAROUSEL_WIDTH;
        } else if (dire.toLowerCase() === "right") {
            deltaX = CAROUSEL_WIDTH;
        } else {
            throw new Error("dire值错误!");
        }

        let me = this;

        this.move(speed, deltaX, function () {
            // 动画完成后轮播到猫腻图时，跳到猫腻图对应的真实图
            let left = parseInt($(this).css("left"));
            if (left === -CAROUSEL_WIDTH * (LENGTH + 1)) {
                $(this).css("left", -CAROUSEL_WIDTH);
            } else if (left === 0) {
                $(this).css("left", -CAROUSEL_WIDTH * LENGTH);
            }

            // 动画完成后，重设圆点样式
            let indexNow = -(parseInt(me.$carouselBox.css("left")) + CAROUSEL_WIDTH) / CAROUSEL_WIDTH;
            me.resetCirs(me.cirsOldStyle, me.cirsNewStyle, indexNow);
        });
    };
    /**
     * 点击按钮事件
     * @param speed 动画持续时间
     */
    this.initBtns = function (speed) {
        if (this.$btns.length === 0) {
            return;
        }
        if (speed === undefined) {
            speed = 1000;
        }

        let leftBtn = this.$btns.find("div:eq(0)");
        let rightBtn = this.$btns.find("div:eq(1)");
        let me = this;

        let moveLeft = function () {
            me.moveOnce("left", speed);
        };
        let moveRight = function () {
            me.moveOnce("right", speed);
        };

        leftBtn.click(moveRight);
        rightBtn.click(moveLeft);
    };
    /**
     * 点击圆点事件
     * @param speed 动画持续时间
     */
    this.initCirs = function (speed) {
        if (this.$circles.length === 0) {
            return;
        }
        if (speed === undefined) {
            speed = 1000;
        }

        let me = this;

        this.$circles.find("div").each(function () {
            $(this).click(function () {
                if (!me.$carouselBox.is(":animated")) {
                    // 轮播偏移量为index值相减 * 图片宽度
                    let indexNow = -(parseInt(me.$carouselBox.css("left")) + CAROUSEL_WIDTH) / CAROUSEL_WIDTH;
                    let clickIndex = $(this).index();
                    let deltaX = (indexNow - clickIndex) * CAROUSEL_WIDTH;
                    // 点击圆点后轮播，并重设圆点样式
                    let move = function () {
                        me.resetCirs(me.cirsOldStyle, me.cirsNewStyle, clickIndex);
                    };
                    me.move(speed, deltaX, move);
                }
            });
        });
    };
    /**
     * 当图片发生变更时，重设carousel圆点的样式
     * @param oldStyle 圆点默认样式
     * @param newStyle 播放到的图片对应的圆点样式
     * @param index 播放到的图片的索引
     */
    this.resetCirs = function (oldStyle, newStyle, index) {
        this.$circles.find("div").each(function () {
            $(this).removeClass(newStyle);
            $(this).addClass(oldStyle);
        });
        this.$circles.find("div").eq(index).removeClass(oldStyle);
        this.$circles.find("div").eq(index).addClass(newStyle);
    };
}
/**
 * 呼吸轮播图
 * @param str carousel容器选择器，通过此选择器应定位唯一的carousel元素
 */
function CarouselBreath(str) {
    let carousel = new Carousel(str);
    // 当前显示的图片索引
    carousel.idx = 0;
    // 锁，为false时禁止进行轮播动画
    carousel.lock = true;
    // carousel宽度、高度
    const CAROUSEL_WIDTH = parseInt(carousel.$carousel.css("width"));
    const CAROUSEL_HEIGHT = parseInt(carousel.$carousel.css("height"));
    // 图片数量
    const LENGTH = carousel.$imgs.length;
    /**
     * 重设carousel初始化器
     * @param cirOldStyle 默认圆点样式
     * @param cirNewStyle 高亮原点样式
     */
    carousel.initCarousel = function (cirOldStyle, cirNewStyle) {
        // carousel box布局
        // 宽度为一张图片的宽度，左偏移量为0
        this.$carouselBox.css({
            width: CAROUSEL_WIDTH,
            left: 0,
        });
        // 图片布局
        // 所有图片左偏移量为0，除第一张图片外，其余图片的display值设为none
        this.$imgs.each(function () {
            $(this).css("left", 0);
            if ($(this).index() !== 0) {
                $(this).css("display", "none");
            }
        });
        // 导入圆点样式
        this.cirsOldStyle = cirOldStyle === undefined ? "default-cir" : cirOldStyle;
        this.cirsNewStyle = cirNewStyle === undefined ? "default-highlight-cir" : cirNewStyle;
    };
    /**
     * 重设carousel移动方法
     * @param speed 动画持续时间
     * @param index 要显示的图片索引
     * @param fn 动画完成后的回调函数
     */
    carousel.move = function (speed, index, fn) {
        if (speed === undefined) {
            speed = 1000;
        }
        if (index === undefined) {
            index = this.idx === LENGTH - 1 ? this.idx + 1 : 0;
        }
        if (fn === undefined) {
            fn = function () {
            };
        }

        if (this.lock) {
            this.lock = false;
            this.$imgs.eq(this.idx).fadeOut(speed / 2, function () {
                carousel.$imgs.eq(index).fadeIn(speed / 2, function () {
                    // 开锁，重设当前图片索引
                    carousel.lock = true;
                    carousel.idx = index;
                    fn();
                });
            });
        }
    };
    /**
     * 重设carousel单次移动方法
     * @param dire 移动方向，left向左移动，right向右移动
     * @param speed 动画持续时间
     */
    carousel.moveOnce = function (dire, speed) {
        if (dire === undefined) {
            dire = "left";
        }
        if (speed === undefined) {
            speed = 1000;
        }

        // 设置将要展示的图片索引
        let index = this.idx;
        if (dire.toLowerCase() === "left") {
            index = index === LENGTH - 1 ? 0 : index + 1;
        } else if (dire.toLowerCase() === "right") {
            index = index === 0 ? LENGTH - 1 : index - 1;
        } else {
            throw new Error("dire值错误!");
        }

        this.move(speed, index, function () {
            // 动画完成后，重设圆点样式
            carousel.resetCirs(carousel.cirsOldStyle, carousel.cirsNewStyle, index);
        });
    };
    /**
     * 重设点击圆点事件
     * @param speed 动画持续时间
     */
    carousel.initCirs = function (speed) {
        if (this.$circles.length === 0) {
            return;
        }
        if (speed === undefined) {
            speed = 1000;
        }

        this.$circles.find("div").each(function () {
            $(this).click(function () {
                if (carousel.lock) {
                    let index = $(this).index();
                    // 点击圆点后轮播，并重设圆点样式
                    let move = function () {
                        carousel.resetCirs(carousel.cirsOldStyle, carousel.cirsNewStyle, index);
                    };
                    carousel.move(speed, index, move);
                }
            });
        });
    };
    return carousel;
}
/**
 * 碎片轮播图
 * @param str carousel容器选择器，通过此选择器应定位唯一的carousel元素
 */
function CarouselFragment(str) {
    let carousel = new Carousel(str);
    // 当前显示的图片索引
    carousel.idx = 0;
    // 锁，为false时禁止进行轮播动画
    carousel.lock = true;
    // carousel宽度、高度
    const CAROUSEL_WIDTH = parseInt(carousel.$carousel.css("width"));
    const CAROUSEL_HEIGHT = parseInt(carousel.$carousel.css("height"));
    // 图片数量
    const LENGTH = carousel.$imgs.length;
    /**
     * 重设carousel初始化器
     * @param cirOldStyle 默认圆点样式
     * @param cirNewStyle 高亮原点样式
     * @param row 碎片行数
     * @param col 碎片列数
     */
    carousel.initCarousel = function (cirOldStyle, cirNewStyle, row, col) {
        // carousel box布局
        // 宽度为一张图片的宽度，左偏移量为0
        this.$carouselBox.css({
            width: CAROUSEL_WIDTH,
            left: 0,
        });
        // 图片布局
        // 所有图片左偏移量为0，除第一张图片外，其余图片的display值设为none
        this.$imgs.each(function () {
            $(this).css("left", 0);
            if ($(this).index() !== 0) {
                $(this).css("display", "none");
            }
        });
        // 导入圆点样式
        this.cirsOldStyle = cirOldStyle === undefined ? "default-cir" : cirOldStyle;
        this.cirsNewStyle = cirNewStyle === undefined ? "default-highlight-cir" : cirNewStyle;
        // 碎片数量，默认2行2列
        this.col = col === undefined ? 2 : col;
        this.row = row === undefined ? 2 : row;
        // 碎片容器
        this.arr = [];
        for (let i = 0; i < this.row; i++) {
            for (let j = 0; j < this.col; j++) {
                let block = $("<div></div>");
                block.css({
                    width: 0,
                    height: 0,
                    position: "absolute",
                    left: j * CAROUSEL_WIDTH / this.col,
                    top: i * CAROUSEL_HEIGHT / this.row,

                    backgroundRepeat: "no-repeat",
                    backgroundPosition: (-j * CAROUSEL_WIDTH / this.col) + "px " + (-i * CAROUSEL_HEIGHT / this.row) + "px",
                    backgroundSize: CAROUSEL_WIDTH,

                    display: "none",
                });
                this.$carouselBox.prepend(block);
                this.arr.push(block);
            }
        }
    };
    /**
     * 重设carousel移动方法
     * @param speed 动画持续时间
     * @param index 要显示的图片索引
     * @param fn 动画完成后的回调函数
     */
    carousel.move = function (speed, index, fn) {
        if (speed === undefined) {
            speed = 1000;
        }
        if (index === undefined) {
            index = this.idx === LENGTH - 1 ? this.idx + 1 : 0;
        }
        if (fn === undefined) {
            fn = function () {
            };
        }
        if (this.lock) {
            this.lock = false;
            carousel.initFragments(index);
            carousel.showFragments(speed);
            setTimeout(function () {
                carousel.hideFragments(index);
                carousel.lock = true;
                carousel.idx = index;
                fn();
            }, speed);
        }
    };
    /**
     * 重设carousel单次移动方法
     * @param dire 移动方向，left向左移动，right向右移动
     * @param speed 动画持续时间
     */
    carousel.moveOnce = function (dire, speed) {
        if (dire === undefined) {
            dire = "left";
        }
        if (speed === undefined) {
            speed = 1000;
        }

        // 设置将要展示的图片索引
        let index = this.idx;
        if (dire.toLowerCase() === "left") {
            index = index === LENGTH - 1 ? 0 : index + 1;
        } else if (dire.toLowerCase() === "right") {
            index = index === 0 ? LENGTH - 1 : index - 1;
        } else {
            throw new Error("dire值错误!");
        }

        this.move(speed, index, function () {
            // 动画完成后，重设圆点样式
            carousel.resetCirs(carousel.cirsOldStyle, carousel.cirsNewStyle, index);
        });
    };
    /**
     * 初始化碎片
     * @param index 要显示的图片的索引
     */
    carousel.initFragments = function (index) {
        // 设置碎片的样式
        this.arr.forEach(function (v) {
            let location = carousel.$imgs.eq(index)[0].src;
            $(v).css("display", "block");
            $(v).css("backgroundImage", "url(\"" + location + "\")");
        });
    };
    /**
     * 碎片展开
     * @param speed 动画持续的时间
     */
    carousel.showFragments = function (speed) {
        // 碎片展开
        this.arr.forEach(function (v) {
            $(v).animate({
                width: CAROUSEL_WIDTH / carousel.col,
                height: CAROUSEL_HEIGHT / carousel.row,
            }, 300 + Math.random() * (speed - 310));
        });
    };
    /**
     * 隐藏碎片
     * @param index 要显示的图片的索引
     */
    carousel.hideFragments = function (index) {
        // 显示对应的图片
        carousel.$imgs.eq(carousel.idx).css("display", "none");
        carousel.$imgs.eq(index).css("display", "block");
        // 隐藏碎片
        $.each(carousel.arr, function (i, v) {
            v.css({
                backgroundImage: "none",
                width: 0,
                height: 0,
            });
        });
    };
    /**
     * 重设点击圆点事件
     * @param speed 动画持续时间
     */
    carousel.initCirs = function (speed) {
        if (this.$circles.length === 0) {
            return;
        }
        if (speed === undefined) {
            speed = 1000;
        }

        this.$circles.find("div").each(function () {
            $(this).click(function () {
                if (carousel.lock) {
                    let index = $(this).index();
                    // 点击圆点后轮播，并重设圆点样式
                    let move = function () {
                        carousel.resetCirs(carousel.cirsOldStyle, carousel.cirsNewStyle, index);
                    };
                    carousel.move(speed, index, move);
                }
            });
        });
    };

    return carousel;
}