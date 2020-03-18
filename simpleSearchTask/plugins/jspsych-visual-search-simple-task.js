/**
 *
 * jspsyc-visual-search-simple-task
 * Hayward Godwin, who adpated the base code from the jspsych-visual-search-circle code with credits below.
 *
 * jspsych-visual-search-circle
 * Josh de Leeuw
 *
 * display a set of objects, with or without a target, equidistant from fixation
 * subject responds to whether or not the target is present
 *
 * based on code written for psychtoolbox by Ben Motz
 *
 * documentation: docs.jspsych.org
 *
 **/

// FROM https://stackoverflow.com/questions/4959975/generate-random-number-between-two-numbers-in-javascript
function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

jsPsych.plugins["visual-search-simple-task"] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('visual-search-simple-task', 'fixation_image', 'image');

  jsPsych.pluginAPI.registerPreload('visual-search-simple-task', ['T0.BMP','T0_A.BMP','T0_B.BMP','T0_C.BMP'], 'image');
  jsPsych.pluginAPI.registerPreload('visual-search-simple-task', ['L0.BMP','L0_A.BMP','L0_B.BMP','L0_C.BMP'], 'image');
  jsPsych.pluginAPI.registerPreload('visual-search-simple-task', ['T8.BMP','T8_A.BMP','T8_B.BMP','T8_C.BMP'], 'image');
  jsPsych.pluginAPI.registerPreload('visual-search-simple-task', ['L8.BMP','L8_A.BMP','L8_B.BMP','L8_C.BMP'], 'image');

  plugin.info = {
    name: 'visual-search-circle',
    description: '',
    parameters: {
      target: {
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: 'Target',
        default: undefined,
        description: 'The image to be displayed.'
      },
      foil: {
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: 'Foil',
        default: undefined,
        description: 'Path to image file that is the foil/distractor.'
      },
      fixation_image: {
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: 'Fixation image',
        default: undefined,
        description: 'Path to image file that is a fixation target.'
      },
      set_size: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Set size',
        default: undefined,
        description: 'How many items should be displayed?'
      },
      target_present: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Target present',
        default: true,
        description: 'Is the target present?'
      },
      target_size: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Target size',
        array: true,
        default: [50, 50],
        description: 'Two element array indicating the height and width of the search array element images.'
      },
      fixation_size: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Fixation size',
        array: true,
        default: [16, 16],
        description: 'Two element array indicating the height and width of the fixation image.'
      },
      target_present_key: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        pretty_name: 'Target present key',
        default: 'j',
        description: 'The key to press if the target is present in the search array.'
      },
      target_absent_key: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        pretty_name: 'Target absent key',
        default: 'f',
        description: 'The key to press if the target is not present in the search array.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'The maximum duration to wait for a response.'
      },
      fixation_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Fixation duration',
        default: 500,
        description: 'How long to show the fixation image for before the search array (in milliseconds).'
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    // PRIMARY TASK TRIAL 
    if (trial.data.task=='primary'){

      // stimuli width, height
      /*var stimh = trial.target_size[0];
      var stimw = trial.target_size[1];
      var hstimh = stimh / 2;
      var hstimw = stimw / 2;*/

      // possible stimulus locations on the circle
      var display_locs = [];
      var possible_display_locs = trial.set_size;

      // GRID OF OBJECT LOCATIONS INSTEAD
      var xCells= 5
      var yCells = 4
      var cellY = 600/yCells
      var cellX = 800/xCells
      var gridCells = [];
      var xNudge = (window.innerWidth - 800)/2;
      var yNudge = (window.innerHeight - 600)/2;

      for (var x = 0; x < xCells; x++){

        var newX = xNudge + (x*cellX) + (cellX / 2) - 25 + randomInteger(-45,45);

        for (var y = 0; y < yCells; y++){

          var newY =  yNudge + (y*cellY) + (cellY / 2) - 25 + randomInteger(-45,45);

          gridCells.push([newX, newY])

        }
      }

      // MAKE A SHUFFLE THING HERE TO PICK THE FIRST 16
      display_locs = jsPsych.randomization.shuffle(gridCells).slice(0,trial.set_size)
      
      display_element.innerHTML += '<div id="jspsych-visual-search-circle-container"></div>';
     
      var paper = display_element.querySelector("#jspsych-visual-search-circle-container");

      // check distractors - array?
      if(!Array.isArray(trial.foil)){
        fa = [];
        for(var i=0; i<trial.set_size; i++){
          fa.push(trial.foil);
        }
        trial.foil = fa;
      }

      show_fixation();

      function show_fixation() {
        // show fixation
        //var fixation = paper.image(trial.fixation_image, fix_loc[0], fix_loc[1], trial.fixation_size[0], trial.fixation_size[1]);
        paper.innerHTML += "<img id='fixation' src='img/T"+trial.target_colour+".BMP' style='position: absolute; left:"+ (xNudge + (800/2) - 25) +"px; top:"+(yNudge + (600/2) - 25)+"px; width: 50px; height:50px; '></img>";

        // wait
        jsPsych.pluginAPI.setTimeout(function() {
          // after wait is over
          // CLEAR OUT THE FIXATION CUE
          document.getElementById("fixation").outerHTML = "";
          show_search_array();
        }, trial.fixation_duration);
      }

      function show_search_array() {

        var targetImages = [];
        var distractorImages = [];

        //console.log(trial.target_colour);

        // SETUP THE ARRAYS OF POSSIBLE IMAGES TO CHOOSE FROM THIS TRIAL
        if (trial.target_colour == 0){
          targetImages = ['T0.BMP','T0_A.BMP','T0_B.BMP','T0_C.BMP'];
          distractorImages = ['L0.BMP','L0_A.BMP','L0_B.BMP','L0_C.BMP'];
        }

        if (trial.target_colour == 8){
          targetImages = ['T8.BMP','T8_A.BMP','T8_B.BMP','T8_C.BMP'];
          distractorImages = ['L8.BMP','L8_A.BMP','L8_B.BMP','L8_C.BMP'];
        }

        // NOW ADD A RANDOMLY ORIENTED TARGET IF ITS A PRESENT TRIAL
        var to_present = [];

        if(trial.target_present){
          var currentTargetImage = jsPsych.randomization.shuffle(targetImages)[0];
          to_present.push(currentTargetImage);
         //console.log(currentTargetImage);
        }

        // WORK OUT WHICH DISTRACTORS TO USE
        var distractorImageNames = jsPsych.randomization.sampleWithReplacement(distractorImages, trial.set_size-to_present.length);

        // ADD TO THE LIST OF STUFF TO PRESENT
        to_present = to_present.concat(distractorImageNames);

        //console.log(to_present);

        for (var i = 0; i < display_locs.length; i++) {

          paper.innerHTML += "<img src='"+'img/'+to_present[i]+"' style='position: absolute; left:"+display_locs[i][0]+"px; top:"+display_locs[i][1]+"px; width:"+trial.target_size[0]+"px; height:"+trial.target_size[1]+"px;'></img>";
          
        }

        // ADD CHOSEN IMAGE NAMES TO DATASET
        jsPsych.data.addProperties({imageNames: JSON.stringify(to_present)});

        var trial_over = false;

        var after_response = function(info) {

          trial_over = true;

          var correct = false;

          if (jsPsych.pluginAPI.compareKeys(info.key,trial.target_present_key) && trial.target_present ||
              jsPsych.pluginAPI.compareKeys(info.key,trial.target_absent_key) && !trial.target_present) {
            correct = true;
          }

          clear_display();

          end_trial(info.rt, correct, info.key);

        }

        var valid_keys = [trial.target_present_key, trial.target_absent_key];

        key_listener = jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: after_response,
          valid_responses: valid_keys,
          rt_method: 'performance',
          persist: false,
          allow_held_key: false
        });

        if (trial.trial_duration !== null) {

          jsPsych.pluginAPI.setTimeout(function() {

            if (!trial_over) {

              jsPsych.pluginAPI.cancelKeyboardResponse(key_listener);

              trial_over = true;

              var rt = null;
              var correct = 0;
              var key_press = null;

              clear_display();

              end_trial(rt, correct, key_press);
            }
          }, trial.trial_duration);

        }

        function clear_display() {
          display_element.innerHTML = '';
        }
      }


      function end_trial(rt, correct, key_press) {

        // data saving
        var trial_data = {
          correct: correct,
          rt: rt,
          key_press: key_press,
          locations: JSON.stringify(display_locs),
          target_present: trial.target_present,
          set_size: trial.set_size
        };

        // go to next trial
        jsPsych.finishTrial(trial_data);
      }

    }

  }; 

  // helper function for determining stimulus locations

  function cosd(num) {
    return Math.cos(num / 180 * Math.PI);
  }

  function sind(num) {
    return Math.sin(num / 180 * Math.PI);
  }

  return plugin;
})();
