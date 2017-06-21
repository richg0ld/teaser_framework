/* ----------------------------------------------
 * Slider v1.2 JavaScript
 * Author - jhkim88@hanbitsoft.co.kr
 ------------------------------------------------- */

var Slider = (function(window, $){
  function Slider(container, options){
    try{
      this.container = $(container);
    }
    catch(err){
      throw new Error("제이쿼리가 없습니다.")
    }

    this.settings = {
      type : 'default', // 배너타입 : default(기본) / fade(페이드인아웃) / slide(슬라이드) / complex(복합)
      direction : 'horizontal', // 슬라이드 방향 : horizontal(왼쪽에서 오른쪽) / vertical(위에서 아래)
      time : 3500, // 시간
      speed : 250, // 스피드
      current : 0, // 시작하는 값
      auto : true, // 자동여부 : true(자동) / false(수동)
      easing: null, //제이쿼리 이징 값
      pageNumber : false, // 페이지 넘버링 여부
      preventDoubleEvent: false, // 버튼이 슬라이드가 다끝날때까지 비활성화 시킬지 안시킬지
      activeClass : 'on',
      sliderClass : '.slider',
      sliderList : '.slider_list>li',
      dotButton : '.dot',
      listContent : '.content',
      prevButton : '.btn_prev',
      nextButton : '.btn_next',
      playButton : '.btn_play',
      stopButton : '.btn_stop',
      currentSlide : ".current_slide",
      totalSlide : ".total_slide",
      complexObjClasses: null, //여기부터 아래에 있는 프로퍼티는 개인 설정용 슬라이드 옵션 ... 따로물어보셈...ㅎㅎ
      complexObjDelayTimes: null,
      complexObjAnimationSpeed: 500,
      complexObjAnimationStartOptions:null,
      complexObjAnimationEndOptions: null,
      complexObjEasing : null
    };
    if(options) $.extend(this.settings, options);
    this.set();
    this.init();
    this.eventHandler();
  }
  Slider.prototype.set = function(){
    var _this = this;

    this._evtCnt = 0;
    this._curIdx = this.settings.current;
    this._actIdx = this.settings.current;
    this._slideFunc = {
      "default": {
        slideType: this.show,
        prev: this.show,
        next: this.show
      },
      "fade":{
        slideType: this.fade,
        prev: this.fade,
        next: this.fade
      },
      "slide": {
        slideType: this.slide,
        prev: this.rightMove,
        next: this.leftMove
      },
      "complex": {
        slideType: this.complex,
        prev: this.complexRightMove,
        next: this.complexLeftMove
      }
    };
    this.slideFunc = this._slideFunc[this.settings.type]["slideType"];
    this.nextFunc = this._slideFunc[this.settings.type]["next"];
    this.prevFunc = this._slideFunc[this.settings.type]["prev"];

    this.currentPage = this.settings.current+1;
    this.width = this.container.width();
    this.height = this.container.height();
    this.length = this.container.find(this.settings.sliderList).length;
    this.elements = {
      dotButtons: this.container.find(this.settings.dotButton),
      listContents: this.container.find(this.settings.listContent),
      sliderLists: this.container.find(this.settings.sliderList),
      prevButton: this.container.find(this.settings.prevButton),
      nextButton: this.container.find(this.settings.nextButton),
      playButton: this.container.find(this.settings.playButton),
      stopButton: this.container.find(this.settings.stopButton),
      currentSlide: this.container.find(this.settings.currentSlide),
      totalSlide: this.container.find(this.settings.totalSlide),
      contents: function(idx){
        return _this.container
          .find(_this.settings.sliderList)
          .eq(idx).find(_this.settings.listContent);
      }
    };
    this._slideDirection = {"minus": null,"plus" : null,"zero": null};
    this._SlideSizeChk = function(){
      if(this.settings.direction === "horizontal"){
        this._slideDirection.minus = {"left": -this.width};
        this._slideDirection.plus = {"left": this.width};
        this._slideDirection.zero = {"left": 0};
      }else if(this.settings.direction === "vertical"){
        this._slideDirection.minus = {"top": -this.height};
        this._slideDirection.plus = {"top": this.height};
        this._slideDirection.zero = {"top": 0};
      }
    };

    if(this.settings.type === "complex"){
      try{
        if(this.settings.type === "complex" && !this.settings.complexObjDelayTimes) throw new Error("complex 타입의 애니메이션의 오브젝트별 딜레이 시간(complexObjAnimationEndOptions)이 설정 되지 않았습니다.");
        if(this.settings.type === "complex" && !this.settings.complexObjClasses) throw new Error("complex 타입의 애니메이션의 오브젝트(complexObjClasses)가 설정 되지 않았습니다.");
        if(this.settings.type === "complex" && !this.settings.complexObjAnimationStartOptions) throw new Error("complex 타입의 애니메이션 시작 옵션(complexObjAnimationStartOptions)이 설정 되지 않았습니다.");
        if(this.settings.type === "complex" && !this.settings.complexObjAnimationEndOptions) throw new Error("complex 타입의 애니메이션의 끝 옵션(complexObjAnimationEndOptions)이 설정 되지 않았습니다.");
      }
      catch(err){
        throw err;
      }
      this.elements.complexObjClasses = [];
      for(var i=0; i < this.elements.sliderLists.length; i++){
        this.elements.complexObjClasses.push([]);
        for(var j=0; j < this.settings.complexObjClasses.length; j++){
          this.elements.complexObjClasses[i]
            .push(this.elements.sliderLists.eq(i).find(this.settings.complexObjClasses[j]));
        }
      }
    }
  };
  Slider.prototype.init = function(){
    var _this = this;
    this._SlideSizeChk();
    this.elements.sliderLists.eq(this._curIdx).siblings().find(this.settings.listContent).hide();

    if(this.settings.auto){
      this.elements.playButton.hide();
      this.autoPlay();
    }else{
      this.elements.stopButton.hide();
    }
    this.addActiveClass(this.settings.current);
    if(this.settings.pageNumber) {
      this.elements.totalSlide.html(this.length);
      this.elements.currentSlide.html(this.currentPage);
    }
    if(this.settings.type === "complex"){
      var n;

      this.complexAfterFunc = function(idx){
        if($.type(this.settings.complexObjAnimationEndOptions[0]) === "array"){
          for(n = 0;n < this.elements.complexObjClasses[idx].length; n++){
            this.elements.complexObjClasses[idx][n]
              .show()
              .delay(this.settings.complexObjDelayTimes[n])
              .animate(
                this.settings.complexObjAnimationEndOptions[idx][n],
                this.settings.complexObjAnimationSpeed,
                this.settings.complexObjEasing,
                function(){
                  _this._evtCnt += 1;
                  if(_this._evtCnt === _this.elements.complexObjClasses[idx].length) {
                    _this._isPlay = false;
                    _this._evtCnt = 0;
                  }
                }
              );
          }
        }else if($.type(this.settings.complexObjAnimationEndOptions[0]) === "object"){
          for(n = 0;n < this.elements.complexObjClasses[idx].length; n++){
            this.elements.complexObjClasses[idx][n]
              .show()
              .delay(this.settings.complexObjDelayTimes[n])
              .animate(
                this.settings.complexObjAnimationEndOptions[n],
                this.settings.complexObjAnimationSpeed,
                this.settings.complexObjEasing,
                function(){
                  _this._evtCnt += 1;
                  if(_this._evtCnt === _this.elements.complexObjClasses[idx].length) {
                    _this._isPlay = false;
                    _this._evtCnt = 0;
                  }
                }
              );
          }
        }
      };
      this.complexObjInit = function(){
        var i,j;
        if($.type(this.settings.complexObjAnimationEndOptions[0]) === "array"){
          for(i=0;i<this.settings.complexObjAnimationStartOptions.length;i++){
            for(j=0;j < this.settings.complexObjClasses.length;j++) {
              this.elements.listContents.eq(i)
                .children(this.settings.complexObjClasses[j])
                .stop()
                .css(this.settings.complexObjAnimationStartOptions[i][j]);
            }
          }
        }else if($.type(this.settings.complexObjAnimationEndOptions[0]) === "object") {
          for(j=0;j < this.settings.complexObjClasses.length;j++) {
            this.elements.listContents
              .children(this.settings.complexObjClasses[j])
              .stop()
              .css(this.settings.complexObjAnimationStartOptions[j]);
          }
        }
      };
      this.complexClearObj = function(){
        _this.complexObjInit();
        var n;
        if($.type(this.settings.complexObjAnimationEndOptions[0]) === "array"){
          for(n = 0;n < this.elements.complexObjClasses[this._curIdx].length; n++){
            this.elements.listContents.eq(this._curIdx)
              .children(this.settings.complexObjClasses[n])
              .css(this.settings.complexObjAnimationEndOptions[this._curIdx][n]);
          }
        }else if($.type(this.settings.complexObjAnimationEndOptions[0]) === "object"){
          for(n = 0;n < this.elements.complexObjClasses[this._curIdx].length; n++){
            this.elements.listContents.eq(this._curIdx)
              .children(this.settings.complexObjClasses[n])
              .css(this.settings.complexObjAnimationEndOptions[n]);
          }
        }
      };
      this._isPlay = true;
      this.complexObjInit();
      this.complexAfterFunc(this.settings.current);
    }
  };
  Slider.prototype.show = function(idx){
    if(this._curIdx === idx) return;
    this.addActiveClass(idx);
    this.updatePageNumber(idx);
    this.elements.contents(this._curIdx).hide();
    this.elements.contents(idx).show();
    this._curIdx = idx;
  };

  Slider.prototype.fade = function(idx){
    if(this._curIdx === idx) return;
    this.addActiveClass(idx);
    this.elements.listContents.css({'display':'none', 'z-Index':0});
    this.elements.contents(this._curIdx).stop().css({"display":"block", "left": 0, "top": 0}).fadeOut(this.settings.speed);
    this.elements.contents(idx).stop().fadeIn(this.settings.speed);
    this._curIdx = idx;
  };
  Slider.prototype.slide = function(idx){
    if(this._curIdx === idx) return;
    this.addActiveClass(idx);
    idx >= this._curIdx ? this.leftMove(idx) : this.rightMove(idx);
  };
  Slider.prototype.complex = function(idx){
    if(this._curIdx === idx) return;
    this.addActiveClass(idx);
    idx >= this._curIdx ? this.complexLeftMove(idx) : this.complexRightMove(idx);
  };
  Slider.prototype.complexLeftMove = function(idx){
    var _this = this;
    this.evtDoubleChk(function(){
      _this.complexClearObj();
      _this.move(idx,[
          _this._slideDirection.plus,
          _this._slideDirection.zero,
          _this._slideDirection.minus
        ], function(){
          _this.complexAfterFunc(idx);
        }
      );
    });
  };
  Slider.prototype.complexRightMove = function(idx){
    var _this = this;
    this.evtDoubleChk(function(){
      _this.complexClearObj();
      _this.move(idx, [
        _this._slideDirection.minus,
        _this._slideDirection.zero,
        _this._slideDirection.plus
      ], function(){
        _this.complexAfterFunc(idx);
      });
    });
  };
  Slider.prototype.leftMove = function(idx, afterFunc){
    var _this = this;
    this.evtDoubleChk(function(){
      _this.move(idx, [
        _this._slideDirection.plus,
        _this._slideDirection.zero,
        _this._slideDirection.minus
      ], afterFunc);
    });
  };
  Slider.prototype.rightMove = function(idx, afterFunc){
    var _this = this;
    this.evtDoubleChk(function(){
      _this.move(idx, [
        _this._slideDirection.minus,
        _this._slideDirection.zero,
        _this._slideDirection.plus
      ], afterFunc);
    });
  };
  Slider.prototype.move = function(idx, direction, afterFunc){
    var _this = this;
    this.addActiveClass(idx);
    if(this.settings.pageNumber)this.updatePageNumber(idx);
    this.elements.listContents.css({'display':'none', 'z-Index':0});
    this.elements.contents(idx).stop().css({"display":"block", 'z-Index':10}).css(direction[0]);
    this.elements.contents(this._curIdx).stop().css({"display":"block", "left": 0, "top": 0});
    this.elements.contents(idx)
      .animate(direction[1],
        this.settings.speed,
        this.settings.easing
      );
    this.elements.contents(this._curIdx)
      .animate(direction[2],
        this.settings.speed,
        this.settings.easing, function(){
          afterFunc ? afterFunc() : _this._isPlay = false;
        }
      );
    this._curIdx = idx;
  };
  Slider.prototype.addActiveClass = function(idx){
    this.elements.sliderLists.removeClass(this.settings.activeClass);
    this.elements.sliderLists.eq(idx).addClass(this.settings.activeClass);
  };
  Slider.prototype.prev = function(){
    if(this.length === 1) return;
    this._actIdx = this._curIdx-1 < 0 ? this.length-1 : this._curIdx-1;
    this.prevFunc(this._actIdx);
  };
  Slider.prototype.next = function(){
    if(this.length === 1) return;
    this._actIdx = this._curIdx+1 > this.length-1 ? 0 : this._curIdx+1;
    this.nextFunc(this._actIdx);
  };
  Slider.prototype.autoPlay = function(){
    var _this = this;
    if(this.autoTimer){
      clearInterval(this.autoTimer);
    }
    this.autoTimer = setInterval(function(){
      _this.next();
    }, _this.settings.time);
  };
  Slider.prototype.autoStop = function(){
    clearInterval(this.autoTimer);
    this.autoTimer = 0;
  };
  Slider.prototype.updatePageNumber = function(idx){
    this.currentPage=idx+1;
    if(this.settings.pageNumber)this.elements.currentSlide.html(this.currentPage);
  };
  Slider.prototype.evtDoubleChk = function(afterfunc){
    if(this.settings.preventDoubleEvent){
      if(this._isPlay) return;
    }
    this._isPlay = true;
    afterfunc();
  };
  Slider.prototype.eventHandler = function(){
    var _this = this;
    this.elements.dotButtons.on("mouseenter focusin click", function(){
      _this._actIdx = $(this).parent().index();
      _this.slideFunc(_this._actIdx);
    });
    this.elements.prevButton.on("click", function(){
      _this.prev();
    });
    this.elements.nextButton.on("click", function(){
      _this.next();
    });
    this.container.on("mouseenter mouseleave focusin focusout", function(e){
      if(!_this.settings.auto) return;
      e.type === "mouseenter" || e.type === "focusin" ? _this.autoStop() :  _this.autoPlay() ;
    });
    this.elements.playButton.on("click", function(){
      _this.elements.playButton.hide();
      _this.elements.stopButton.show();
      _this.settings.auto = true;
      _this.autoPlay();
    });
    this.elements.stopButton.on("click", function(){
      _this.elements.playButton.show();
      _this.elements.stopButton.hide();
      _this.settings.auto = false;
      _this.autoStop();
    });
    $(window).on("resize",function(){
      _this.width = _this.container.width();
      _this._SlideSizeChk();
    });
  };
  return Slider
})(window, jQuery);
