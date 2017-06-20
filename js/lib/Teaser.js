//used closure, IIFE,  constructor pattern
var Teaser = (function(window, document, $, sound, browser){

  //const values
  var
    PAGING_BUTTONS_PROPERTY_NAMES = ["$navigatorButtons", "$menuListButtons"],
    EVENT = {
      CLICK: "click",
      MOUSE_WHEEL: "mousewheel DOMMouseScroll"
    },
    SCENE_LIFE_CYCLE = {
      INIT:"init",
      START:"start",
      END:"end"
    },
    INTERNAL_APP = {
      SOUND: {
        VOLUME: "volume",
        PLAY: "play",
        PAUSE: "pause"
      },
      VIDEO: {
        VOLUME: "volume",
        PLAY: "play",
        PAUSE: "pause"
      }
    },
    CONTROL_CLASS_NAME = {
      MENU: {
        OPEN: "open"
      }
    },
    FIXED_HEIGHT = $("#wrap").height(),
    TEASER_HEIGHT = 998,
    $HTML = $("html, body");

  //modules package container
  var modules = {};

  // new object info
  function Teaser(options, internalAppOptions, plugins){
    this.isIntroStart = false;
    this.isPaging = false;
    this.isAnimating = false;
    this.prevPageIndex = -1;
    this.currentPageIndex = 0;
    this._intro = {};
    this.sceneList = [];
    this.$navigatorButtons = $(options.navigatorButtons);
    this.$menuListButtons = $(options.menuListButtons);
    this.$menuList = $(options.menuList);
    this.$scenesWrapper = $(options.scenesWrapper);
    this.$loadingWrapper = $(options.loadingWrapper);
    this.$menuOpenButton = $(options.menuOpenButton);
    this.$menuCloseButton = $(options.menuCloseButton);
    this.pagingSpeed = options.pagingSpeed || 500;
    this.easing = options.easing;
    this._attachInternalApp(internalAppOptions || {});
    this._addPlugins(plugins || []);
  }

  //method
  Teaser.prototype = {
    loaded: function(target, callback){
      if(!modules.loader) modules.loader = {};
      this._addMoudle("loader", "$wrapper", this.$loadingWrapper);

      if(target === window){
        target.onload = function(){
          callback(modules);
        };
      }else if(typeof target === "function"){
        target(function(){
          callback(modules);
        });
      }

      return this;
    },
    intro: function(intro){
      var _this = this;
      this._intro.start = function(){
        _this.isAnimating = true;
        intro.start(modules, function(){
          _this.isAnimating = false;
          _this._introComp(intro.end);
        });
      };
      return this;
    },
    _introComp: function(end){
      var _this = this;
      this._bindEvent();
      end(modules, function(){
        _this.isAnimating = false;
      });
    },
    _introStart: function(){
      this._intro.start();
    },
    _addPlugins: function(plugins){
      if(plugins.length === 0) return;
      modules.plugins = {};
      $.each(plugins, function(i, v){
        modules.plugins[v.name] = v.plugin;
      });
    },
    _addMoudle: function(type, id, module){
      modules[type][id] = module;
    },
    _bindEvent: function(){
      this._bindSceneClick(PAGING_BUTTONS_PROPERTY_NAMES);
      this._bindSceneScroll();
      this._bindMenuClick();
    },
    _attachInternalApp: function(options){
      if(!options) return;
      if(options.sounds.length !== 0) {
        this._addSounds(options.sounds);
      }
      if(options.videos.length !== 0) {
        this._addVideos(options.videos);
      }
    },
    _addSound: function(options, callback){
      if(!options.init && !options.create) return;
      if(!modules.sounds) modules.sounds = {};
      var settings = options.init;
      var id = options.create.id;
      settings.onready = function(){
        soundManager.createSound(options.create).load();
      };
      soundManager.setup(settings);
      callback(id);
    },
    _addSounds: function(list){
      var _this = this;
      $.each(list, function(i, v){
        _this._addSound(v, function(id){
          _this._addMoudle("sounds", id, {
            _isPlaySound: false,
            isPlaySound: function(){
              return this._isPlaySound
            },
            play: function(){
              soundManager.play(id);
              this._isPlaySound = true;
            },
            pause: function(){
              soundManager.pause(id);
              this._isPlaySound = false;
            },
            toggle: function(){
              soundManager[ this.isPlaySound() ? INTERNAL_APP.SOUND.PAUSE : INTERNAL_APP.SOUND.PLAY ](id);
              this._isPlaySound = !this._isPlaySound;
            }
          });
        });
      });
    },
    _addVideo: function(options, callback){
      if(!modules.videos) modules.videos = {};
      var isLoaded = false;
      var $target = $(options.target);
      var settings = options.init || {};
      settings.onPlayerPlaying = function(){
        if(!isLoaded){
          isLoaded = true;
          $target.tubeplayer(INTERNAL_APP.VIDEO.VOLUME, options.create.volume);
        }
      };
      $target.tubeplayer(settings);
      callback(options.create.id, $target);
    },
    _addVideos: function(list){
      var _this = this;
      $.each(list, function(i, v){
        _this._addVideo(v, function(id, $target){
          modules.videos[id] = {
            play: function(){
              $target.tubeplayer(INTERNAL_APP.VIDEO.PLAY);
            },
            pause: function(){
              if(!_this.isAnimating){
                _this._introStart();
              }
              $target.tubeplayer(INTERNAL_APP.VIDEO.PAUSE);
            }
          }
        });
      });
    },
    _bindSceneClick: function(propsNames){
      var _this = this;
      $.each(propsNames, function(i, v){
        _this[v].on(EVENT.CLICK, function(){
          _this.move($(this).parent().index());
        });
      });
    },
    _bindSceneScroll: function(){
      var _this = this;
      $HTML.on(EVENT.MOUSE_WHEEL, function(e){
        var target = _this.sceneList[_this.currentPageIndex];
        console.log(_this._isCanNext(e, target));
        if(_this._isCanNext(e, target)){
          _this.next();
        }
        if(_this._isCanPrev(e, target)){
          _this.prev();
        }
      });
    },
    _isCanNext: function(event, target){
      console.log($HTML.height() + $(window).scrollTop() , FIXED_HEIGHT)
      return event.originalEvent.wheelDelta < 0 &&
        $HTML.height() + $(window).scrollTop() >= FIXED_HEIGHT &&
        target.$scene.children().height() - target.$scene.scrollTop() === TEASER_HEIGHT
    },
    _isCanPrev: function(event, target){
      return event.originalEvent.wheelDelta > 0 &&
        $HTML.height() + $(window).scrollTop() <= $HTML.height() &&
        $HTML.height() - target.$scene.scrollTop() === $HTML.height()
    },
    _bindMenuClick: function(){
      var _this = this;
      this.$menuOpenButton.on(EVENT.CLICK, function(){
        _this.$menuList.addClass(CONTROL_CLASS_NAME.MENU.OPEN);
      });
      this.$menuCloseButton.on(EVENT.CLICK, function(){
        _this.$menuList.removeClass(CONTROL_CLASS_NAME.MENU.OPEN);
      });
    },
    move: function(index){
      if(this.isPaging || this.isAnimating) return;
      var _this = this;
      this.isPaging = true;
      this.isAnimating = true;
      this.prevPageIndex = this.currentPageIndex;
      this.currentPageIndex = index;
      this._controlScene(this.prevPageIndex, SCENE_LIFE_CYCLE.INIT);
      this._controlScene(this.currentPageIndex, SCENE_LIFE_CYCLE.START);
      this.$scenesWrapper.stop(true, true).animate({top:-(TEASER_HEIGHT*index)}, this.pagingSpeed, this.easing, function(){
        _this._controlScene(_this.currentPageIndex, SCENE_LIFE_CYCLE.END);
        _this.isPaging = false;
      });
    },
    prev: function(){
      var decreasedIndex = this.currentPageIndex-1;
      if(decreasedIndex < 0) return;
      this.move(decreasedIndex);
    },
    next: function(){
      var increasedIndex = this.currentPageIndex+1;
      if(increasedIndex > this.sceneList.length-1) return;
      this.move(increasedIndex);
    },
    _controlScene: function(index, state){
      var _this = this;
      this.sceneList[index][state](modules, function(){
        _this.isAnimating = false;
      });
    },
    attachScene: function(scenes){
      var _this = this;
      $.each(scenes, function (i, v) {
        v.$scene = $(v.className);
        _this.sceneList.push(v);
      });
    }
  };

  //static method
  Teaser.browser = browser;

  //used module pattern
  return Teaser;
})(
  window,
  document,
  jQuery, // Added plugin (tubeplayer, easing)
  soundManager,
  (function(){
    // used IIFE
    var config = {
      isPc : true ,
      isIE9 : false,
      isLowIE7 : false,
      isLowIE8 : false,
      isIOS : false,
      isIpad : false,
      isAndroid : false
    };
    var deviceAgent = {
      version : navigator.userAgent.toLowerCase()
    };
    deviceAgent.ie = deviceAgent.version.indexOf('msie' ) != -1;
    if( deviceAgent.ie ) {
      if (window.navigator.userAgent.search( /trident/i) != -1) {
        if ( parseInt (deviceAgent.version.match( /trident\/(\d.\d)/i )[1 ] , 10 ) < 6 ) config.isIE9 = true; // ie9 이하 브라우저
      } else {
        config.isLowIE7 = true ; // ie7 이하 브라우저
      }
      if ( config.isIE9 || config.isLowIE7 ) config.isLowIE8 = true ; // ie8 이하 브라우저
    }else {}
    return config;
  })()
);

if ( typeof define === "function" && define.amd ) {
  define( "Teaser", [], function() {
    return Teaser;
  });
}