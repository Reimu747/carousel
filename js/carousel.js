/**
 *
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
        // 设置圆点样式
        // this.$circles.css({
        //     width: (this.$imgs.length * 2 - 1) * 10,
        // });
        this.cirsOldStyle = cirOldStyle;
        this.cirsNewStyle = cirNewStyle;

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
            $(this).css(oldStyle);
        });
        this.$circles.find("div").eq(index).css(newStyle);
    };
}