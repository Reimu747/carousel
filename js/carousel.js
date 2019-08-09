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
    // 定时器
    this.timer = null;
    // carousel宽度、高度
    const CAROUSEL_WIDTH = parseInt(this.$carousel.css("width"));
    const CAROUSEL_HEIGHT = parseInt(this.$carousel.css("height"));

    const LENGTH = this.$imgs.length;

    this.initCarousel = function () {
        // carousel box布局
        this.$carouselBox.css({
            width: (CAROUSEL_WIDTH * (this.$imgs.length + 2)) + "px",
            left: -CAROUSEL_WIDTH + "px",
        });
        // 图片布局
        this.$imgs.each(function () {
            $(this).css("left", ($(this).index() + 1) * parseInt(CAROUSEL_WIDTH));
        });

        this.$circles.css({
            width: (this.$imgs.length * 2 - 1) * 10,
        });

        // 在图片前后添加猫腻图，并重新设置变量
        this.$carouselBox.prepend(this.$imgs.eq(this.$imgs.length - 1).clone().css("left", 0));
        this.$carouselBox.append(this.$imgs.eq(0).clone().css("left", (this.$imgs.length + 1) * parseInt(CAROUSEL_WIDTH)));
        this.$imgs = this.$carousel.find("img");
    };
    this.autoplay = function (pauseTime, moveSpeed) {
        if (pauseTime === undefined) {
            pauseTime = 500;
        }
        if (moveSpeed === undefined) {
            moveSpeed = 1000;
        }
        let me = this;
        this.timer = setInterval(function () {
            me.move("LEFT", moveSpeed);
        }, pauseTime + moveSpeed);
        this.$carousel.mouseenter(function () {
            clearInterval(me.timer);
        });
        this.$carousel.mouseleave(function () {
            clearInterval(me.timer);
            me.timer = setInterval(function () {
                me.move("LEFT", moveSpeed);
            }, pauseTime + moveSpeed);
        });
    };
    this.move = function (dire, speed) {
        if (dire === undefined) {
            dire = "left";
        }
        if (speed === undefined) {
            speed = 1000;
        }

        let str;
        if (dire.toLowerCase() === "left") {
            str = "-=";
        } else if (dire.toLowerCase() === "right") {
            str = "+=";
        } else {
            throw new Error("dire值错误!");
        }

        let cirs = this.$circles;

        if (!this.$carouselBox.is(":animated")) {
            this.$carouselBox.animate({
                left: str + parseInt(CAROUSEL_WIDTH),
            }, speed, function () {
                let indexNow = -(parseInt($(this).css("left")) + CAROUSEL_WIDTH) / CAROUSEL_WIDTH;
                cirs.find("div").each(function () {
                    $(this).css("backgroundColor", "white");
                });
                cirs.find("div").eq(indexNow).css("backgroundColor", "yellow");

                let left = parseInt($(this).css("left"));
                if (left === -CAROUSEL_WIDTH * LENGTH) {
                    $(this).css("left", 0);
                } else if (left === 0) {
                    $(this).css("left", -CAROUSEL_WIDTH * LENGTH);
                }
            });
        }
    };
    this.initBtns = function (speed) {
        if (this.$btns.length === 0) {
            console.log("没有按钮！");
            return;
        }
        if (speed === undefined) {
            speed = 1000;
        }

        let leftBtn = this.$btns.find("div:eq(0)");
        let rightBtn = this.$btns.find("div:eq(1)");
        let me = this;

        let moveLeft = function () {
            me.move("left", speed);
        };
        let moveRight = function () {
            me.move("right", speed);
        };

        leftBtn.click(moveRight);
        rightBtn.click(moveLeft);
    };
    this.moveJump = function (speed, deltaX) {
        if (speed === undefined) {
            speed = 1000;
        }
        if (deltaX === undefined) {
            deltaX = CAROUSEL_WIDTH;
        }

        if (!this.$carouselBox.is(":animated")) {
            this.$carouselBox.animate({
                left: "+=" + deltaX,
            }, speed);
        }
    };
    this.initCirs = function (speed) {
        if (speed === undefined) {
            speed = 1000;
        }

        let me = this;

        this.$circles.find("div").each(function () {
            $(this).click(function () {
                if (!me.$carouselBox.is(":animated")) {
                    let indexNow = -(parseInt(me.$carouselBox.css("left")) + CAROUSEL_WIDTH) / CAROUSEL_WIDTH;
                    me.moveJump(speed, (indexNow - $(this).index()) * CAROUSEL_WIDTH);
                    me.$circles.find("div").each(function () {
                        $(this).css("backgroundColor", "white");
                    });
                    $(this).css("backgroundColor", "yellow");
                }
            });
        });
    };
}