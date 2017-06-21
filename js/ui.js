require.config({
  baseUrl: "js",
  paths: {
    "jquery": "lib/jq-1.10.2.min",
    "Teaser": "lib/Teaser",
    "Slider": "lib/Slider",
    "soundManager": "lib/soundmanager2",
    "easing": "lib/jquery.easing.1.3.min",
    "tubePlayer": "lib/jQuery.tubeplayer.min",
    "domReady": "lib/domReady"
  },
  shim:{
    "easing":{
      deps:['jquery']
    },
    "tubePlayer":{
      deps:['jquery']
    },
    "Slider":{
      deps:['jquery', "easing"]
    },
    "Teaser":{
      deps:["jquery", "soundManager", "tubePlayer", "easing", "Slider"]
    }
  }
});
require([
  "jquery",
  "Teaser",
  "domReady"
], function($, Teaser, domReady) {

  var teaser = new Teaser({
    navigatorButtons: ".t_controller__navigator>ul>li>button",
    menuListButtons: ".t_controller__menu--list>ul>li>button",
    menuList: ".t_controller__menu--list",
    menuOpenButton: ".t_controller__menu>button",
    menuCloseButton: ".t_controller__menu--btn-close",
    scenesWrapper: ".t_scenes",
    loadingWrapper: ".t_loader",
    pagingSpeed: 1000,
    easing: "easeInOutElastic"
  },{
    sounds: [{
      init: {
        url: "js/",
        debugMode: false,
        waitForWindowLoad: true,
        preferFlash: false
      },
      create: {
        id: "teaser_sound",
        url: "sound/Rhythm_Changes.mp3"
      }
    }],
    videos: [{
      target:"#player",
      init: {
        width: 854,
        height: 480,
        autoPlay: !Teaser.browser.isLowIE8,
        initialVideo: "4XX-CS8keoE",
        preferredQuality: "default",
        autoHide: true
      },
      create: {
        id: "teaser_video",
        volume: 30
      }
    }]
  },[
    //add plugin, you can use this in modules
    {
      name: "Slider",
      plugin: Slider
    },
    //S: example
    {
      name: "J$",
      plugin: jQuery
    }
    // ...
    //S: example
  ]);

  teaser
    .ready(function(modules){
      new modules.plugins.Slider(".slider_area", {
          type: "slide",
          auto: false,
          duringSlidePreventEvent:false,
          pageNumber: true
      })
    })
    .loaded(domReady, function(modules){
      modules.loader.$wrapper.fadeOut();
      $(".t-video__btn--close").on("click", function(){
        $(".t-video").hide();
        modules.videos["teaser_video"].pause();
        modules.sounds["teaser_sound"].play();
      });
    })
    .intro({
      start: function(modules, comp){
        setTimeout(function(){
          comp();
        }, 1000);
      },
      end: function(modules){
        //S: example
        $(".t_controller__video button").on("click", function(){
          $(".t-video").show();
          modules.videos["teaser_video"].play();
          modules.sounds["teaser_sound"].pause();
        });
        $(".t_controller__sound button").on("click", function(){
          modules.sounds["teaser_sound"].toggle();
        });
        //E: example
      }
    })
    .attachScene([{
      className:".s0",
      init: function(modules){

      },
      start: function(modules, complete){
        complete();
      },
      end: function(modules, complete){
        complete();
      }
    },{
      className:".s1",
      init: function(modules){

      },
      start: function(modules, complete){
        complete();
      },
      end: function(modules, complete){
        complete();
      }
    },{
      className:".s2",
      init: function(modules){

      },
      start: function(modules, complete){
        complete();
      },
      end: function(modules, complete){
        complete();
      }
    },{
      className:".s3",
      init: function(modules){

      },
      start: function(modules, complete){
        complete();
      },
      end: function(modules, complete){
        complete();
      }
    },{
      className:".s4",
      init: function(modules){

      },
      start: function(modules, complete){
        complete();
      },
      end: function(modules, complete){
        complete();
      }
    },{
      className:".s5",
      init: function(modules){

      },
      start: function(modules, complete){
        complete();
      },
      end: function(modules, complete){
        complete();
      }
    }]);
});