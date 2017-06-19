$(function(){
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
    }, [
      //add plugin, you can use this in modules
      {
        name: "kkk",
        plugin: function Plugin(i){

        }
      },
      //S: example
      {
        name: "asdasdasdasdasd",
        plugin: jQuery
      }
      // ...
      //S: example
    ]);

    teaser
      .loaded(function(modules){
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
            start: function(modules){

            },
            end: function(modules){

            }
        },{
            className:".s1",
            init: function(){

            },
            start: function(){

            },
            end: function(){

            }
        },{
            className:".s2",
            init: function(){

            },
            start: function(){

            },
            end: function(){

            }
        },{
            className:".s3",
            init: function(){

            },
            start: function(){

            },
            end: function(){

            }
        },{
            className:".s4",
            init: function(){

            },
            start: function(){

            },
            end: function(){

            }
        }, {
            className:".s5",
            init: function(){

            },
            start: function(){

            },
            end: function(){

            }
        }]);
});
