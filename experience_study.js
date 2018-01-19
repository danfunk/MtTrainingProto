

var EXPERIENCE_STUDY = (function () {
    var my = {};

    my.letters_to_remove = 2; // number of missing letters to complete in the term.
    my.total_scenarios = 24;  // How many scenarios should be randomly selected out of the full set?
    my.block_size = 4; // Number of items in block
    my.question_type = "yes_no";  // Can be yes_no, mc1, or mc2.
    my.traget = "jspsych-target";
    my.base_url = "/js/training";
    my.post_url = "/jspsych";
    my.redirect_url = "/jspsych/continue";
    my.sessionIndex = 1;

    // This score is incremented for every correct answer and displayed
    // to the user.
    var score_letters = 0;
    var score_questions = 0;
    var progress = -1;
    var vivid_response;
    var followup_count = 0;

    my.execute = function() {
        if(my.base_url.slice(-1) !== '/') my.base_url = my.base_url + "/";
        parse_data(my.base_url + "scenarios/scenarios.csv", parse_complete);
    };

    function parse_data(url, callBack) {
        Papa.parse(url, {
            download: true,
            dynamicTyping: true,
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
                callBack(results.data);
            }
        });
    }

    function parse_complete(data) {
        updateProgress();
        updateScore();
        build_timeline(data);
    }

    /**
     * Randomize array element order in-place.
     * Using Durstenfeld shuffle algorithm. (taken from Stackoverflow - Laurens Holst)
     */
    function shuffleArray(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }

    // DISPLAY SCORE AND PROGRESS
    // ***************

    function updateScore() {
        document.getElementById('score').textContent = "Score: " + (score_letters + score_questions);
    }

    function updateProgress() {
        progress++;
        document.getElementById('progress').textContent =
            "Completed : " + progress + " of " + my.total_scenarios;
    }


    // This is called when we complete parsing the CSV file (see parseData above),
    // and will in tern build all the trials.
    function build_timeline(scenarios) {

        /***********************************************
         * STATIC TRIALS
         ***********************************************/
            // An introduction / instructions
        var introduction = {
                type: 'html-button-response',
                choices: ['Continue'],
                stimulus: function () {
                    return (
                        "<div class='piIntro'> " +
                        "<img src='" + my.base_url + "images/compass-blue.png' > " +
                        "<p>In this part of the program, you will read/listen to a series of very " +
                        "short stories. </p> " +
                        "<br clear='all'> " +
                        "<b>For each story:</b> " +
                        "<ul> " +
                        "<li>Listen or read carefully and <i>really imagine</i> yourself in the situation described. " +
                        "We will show you how to do this with a fun \"Lemon\" exercise</li>" +
                        "<li>Remember, even if the story describes you reacting in a way that you would not usually react, please " +
                        "try to picture yourself responding in the way the story describes. </li> " +
                        "<li>There will be an incomplete word at the end of each paragraph. </li> " +
                        "<li>Press the key on the keyboard that complete the word.  </li> " +
                        "<li>When you correctly complete the word you will move on to the next screen and be asked a " +
                        "question about the story. </li> " +
                        "</ul> " +
                        "</div>"
                    )
                },
                on_finish: function(data){ data.stimulus = "introduction" }
            };

        var lemon_exercise = {
            type: 'instructions',
            show_clickable_nav: true,
            pages: [
                '<h1>Welcome to the "Lemon" exercise.</h1> <p>The purpose of this quick exercise is to demonstrate what imagination-based thinking is.</p><p>You will go through what imagining seeing, touching, and smelling a lemon is like.</p><p>Please imagine it as if you are really experiencing it.</p>',
                '<h1>First-person perspective</h1> <p>In this exercise, and throughout the training program, please remember to imagine what is happening through <i>your own eyes</i> (picture on the left), not as an outside observer (picture on the right) ...</p>' +
                    '<div style="margin:auto"><img src="images/lemon/firstperson.png" style="padding: 20px 20px 20px 20px;"><img style="padding: 20px 20px;" src="images/lemon/secondperson.png"></div>',
                '<h1>Ok, lets begin:</h1> <h1>Imagine you are holding the lemon in your hand.</h1>',
                '<p><i>Do you feel it\'s shape and weight in your hand?</i></p>',
                '<h1>Now you are shining a light on the lemon...</h1>',
                '<p><i>Do you see the way lumpy texture of the skin?</i></p>',
                '<h1>Now you scratch the skin with your fingernail...</h1>',
                '<p><i>Bringing it to your nose, can you smell the fresh zesty juice from the skin?</i></p>',
                '<h1>Now imagine you cut the lemon in half, and you bring one half of it up for a closer look ...</h1>',
                '<p><i>Notice the shape of the segments, and how the flesh looks</i></p>',
                '<h1>Now you suddenly squeeze the lemon and juice squirts into your eyes...</h1>',
                '<p><i>Does it sting?</i></p>',
                '<h1>That was the lemon exercise, you did it!</h1> <p>Don\'t worry if you didn\'t experience all of the sensations strongly, this is completely normal and tends to differ between people.</p>' +
                    '<p>Now Please rate your experience on the next page.</p>' +
                    '<img src="images/lemon/lemon.png" style="margin: auto; padding: 20px 20px 20px 20px;">'
            ]
        };

        var vividness = {
            type: 'html-button-response',
            is_html: true,
            stimulus: 'How vividly did you imagine yourself in the scenario?',
            choices: ['Not at all', 'Somewhat', 'Moderately', 'Very', 'Totally'],
            on_finish: function (trial_data) {
                vivid_response = trial_data.button_pressed > 2;
                trial_data.stimulus = "vividness"
            }
        };

        var rank_options = ["1", "2", "3", "4", "5", "6"];
        var rank_experiences = {
            preamble: "In this task you encountered several types of scenarios. Please rank them " +
            "for how engaging/fun it was to imagine each type (1=most engaging/fun; 6 = least engaging/fun) :",
            type: 'survey-multi-choice',
            questions: [
                {prompt: "<i>Reading</i> the story only", options: rank_options, required:true, horizontal: true},
                {prompt: "<i>Listening</i> to the story only", options: rank_options, required:true, horizontal: true},
                {prompt: "Seeing a picture + <i>reading</i> the story", options: rank_options, required:true, horizontal: true},
                {prompt: "Seeing a picture + <i>listening</i> to the story", options: rank_options, required:true, horizontal: true},
                {prompt: "Seeing a picture + hearing background noise + <i>reading</i> the story", options: rank_options, required:true, horizontal: true},
                {prompt: "Seeing a picture + hearing background noise + <i>listening</i> to the story", options: rank_options, required:true, horizontal: true},
            ]
        };

        /* create experiment timeline array */
        var timeline = [];
        //timeline.push(lemon_exercise);
        //timeline.push(introduction);
        //timeline.push(lemon_exercise);
        //timeline.push(vividness);

        // Randomize the scenarios
        // scenarios = jsPsych.randomization.sampleWithoutReplacement(scenarios, my.total_scenarios);

        // Scenarios are in order, groups by three types of Auditory (no immersion, image before, and image sound before)
        // followed by three types of Visual.   We want to randomize the occurrence of these 6 different types
        var starts = [1,4,8,12,16,20]
        shuffleArray(starts);
        var new_scenarios = [];
        for (var si = 0; si < starts.length; si++) {
            new_scenarios = new_scenarios.concat(scenarios.slice(starts[si],starts[si]+4))
        }
        //scenarios = new_scenarios;

        scenarios = scenarios.slice(8,12)

        // Loop through the time-line creating scenarios
        var positive = true;
        for (var k = 0; k < scenarios.length; k++) {
            var scenario;
            var paragraph;
            var phrase;
            var immersion;
            var yes_no_correct;
            var mc1_correct;
            var mc2_correct;
            var format;

            paragraph = scenarios[k]['Paragraph'];
            scenario = scenarios[k]['Scenario'];
            format = scenarios[k]['Format'];
            immersion = scenarios[k]['Immersion'];
            positive = true;

            if (positive) {
                phrase = scenarios[k]['PositiveS'];
                yes_no_correct = scenarios[k]['PositiveQ'];
                mc1_correct = scenarios[k]['mc1pos'];
                mc2_correct = scenarios[k]['mc2pos'];
            }

            /***********************************************
             * SCENARIO BASED TRIALS
             ***********************************************/

            var immersion_trial = null;

            if(immersion === "picture") {
                immersion_trial = {
                    type: 'html-button-response',
                    stimulus: "<img class='sound_image' src='images/" + scenario + ".jpg'>",
                    trial_duration: 5000 // Show trial for 5 seconds
                }
            } else if (immersion === "picture_sound") {
                immersion_trial = {
                    type: 'audio-button-response',
                    stimulus: 'sounds/background/' + scenario + '.mp3',
                    trial_duration: 5000, // Show trial for 5 seconds
                    prompt: "<img class='sound_image' src='images/" + scenario + ".jpg'>"
                }
            }

            var main_trial = null;

            if(format === "Auditory") {
                main_trial = {
                    type: 'audio-button-response',
                    stimulus: 'sounds/' + scenario + '.mp3',
                    trial_ends_after_audio: true,
                    prompt: "<img class='sound_image' src='images/" + scenario + ".jpg'>"
                };
            } else {
                main_trial = {
                    type: 'sentence-reveal',
                    paragraph: paragraph
                };
            }

            var phrase_trial = {
                type: 'missing-letters',
                phrase: phrase,
                letters_to_remove: my.letters_to_remove,
                on_finish: function (trial_data) {
                    if (trial_data.correct) score_letters++;
                    updateScore();
                    updateProgress();
                }
            };

            var yes_no = {
                type: 'button-response-correct',
                is_html: true,
                stimulus: scenarios[k]['Questions'],
                choices: ["Yes", "No"],
                correct_choice: yes_no_correct,
                on_finish: function (trial_data) {
                    if (trial_data.correct) score_questions++;
                    updateScore();
                }
            };

            // Vivid Follow up - changes based on response.
            var vividness_followup = {
                type: 'html-button-response',
                choices: ['Continue'],
                stimulus: function () {
                    if (vivid_response) {
                        return (
                            "<div class='vividness_followup'>" +
                            "<h1>Thanks. It's great you're really using your imagination!</h1>" +
                            "<img src='" + my.base_url + "images/lemon/lemon.png'/>" +
                            "</div>"
                        )
                    } return (
                        "<div class='vividness_followup'>" +
                        "<h1>Thanks. Really try to use your imagination!</h1>" +
                        "<img src='" + my.base_url + "images/lemon/lemon.png'/>" +
                        "</div>"
                    )
                },

                cont_btn: "continue",
                on_finish: function (trial_data) {
                    if(vivid_response) {
                        trial_data.stimulus = "Good Job"
                    } else {
                        trial_data.stimulus = "Use Imagination"
                    }
                }
            };


            var followup_options = ["Not at all", "Moderately", "Totally"];
            var multi_choice_trial_1  = {
                type: 'html-slider-response',
                labels: followup_options,
                min: 1,
                max: 5,
                start: 3,
                stimulus: '<h1>How easy was it to imagine the scenario?</h1>',
            };

            var followup_options = ["1: Not at all", "2", "3: Moderately", "4", "5: Totally"];
            var multi_choice_trial_2  = {
                type: 'html-button-response',
                choices: followup_options,
                stimulus: '<h1>How vividly did you imagine the scenario (as if you were really there and experiencing it first hand)?</h1>',
            };

            var multi_choice_trial_3  = {
                type: 'html-button-response',
                choices: ['Not at all', 'Somewhat', 'Moderately', 'Very', 'Totally'],
                stimulus: '<h1>How easy was it to follow the story?</h1>',
            };

            /*
            var multi_choice_trial_1 = {
                type: 'survey-multi-choice',
                data: {'scenario': scenario},
                questions: [
                    {prompt: "How easy was it to imagine the scenario?", options: followup_options, required:true, horizontal: true},
                    {prompt: "How vividly did you imagine the scenario (as if you were really there and experiencing it first hand)?", options: followup_options, required:true, horizontal: true},
                    {prompt: "How easy was it to follow the story?", options: followup_options, required:true, horizontal: true},
                ]
            };
            var multi_choice_trial_2 = {
                type: 'survey-multi-choice',
                data: {'scenario': scenario},
                questions: [
                    {prompt: "To what extent did this story's ending make you see this situation in a new way?", options: followup_options, required:true, horizontal: true},
                    {prompt: "To what extend did this scenario's ending feel possible, like it could really happen?", options: followup_options, required:true, horizontal: true},
                    {prompt: "To what extent did you feel you could relate to the situations that were presented?", options: followup_options, required:true, horizontal: true}
                ]
            };
             */


            // BUILD THE TIMELINE FROM THE COMPONENTS ABOVE.
            // *********************************************

            /*
            if(k%4 === 0 && k !== 0) {
                timeline.push(vividness)
                timeline.push(vividness_followup)
            }
            //timeline.push(paragraph_trial);
            if(immersion_trial !== null) {
                timeline.push(immersion_trial);
            }
            timeline.push(main_trial);
            timeline.push(phrase_trial);
*/
            timeline.push(multi_choice_trial_1);
            timeline.push(multi_choice_trial_2);
            timeline.push(multi_choice_trial_3);
        }
        timeline.push(rank_experiences);

        function saveData(data, callback){

            $.ajax({
                type:'post',
                contentType: 'application/json',
                cache: false,
                url: my.post_url, // this is the path to the above PHP script
                data: data,
                success: callback,
                error: function(XMLHttpRequest, textStatus, errorThrown) {
                    alert("Status: " + textStatus); alert("Error: " + errorThrown);
                }                });
        }

        function redirect() {
            window.location.assign(my.redirect_url);
        }

        // Preload images
        // an array of paths to images that need to be loaded
        /*
        var images = [];
        images.push(my.base_url + "images/finished.png");
        images.push(my.base_url + "images/good-job.png");
        images.push(my.base_url + "images/halfway.png");
        images.push(my.base_url + "images/imagination.png");
        for(var s = 1; s < 5; s++) {
            for(var i = 8; i < 33; i += 8) {
                images.push(my.base_url + "images/s" + s + "/" + i + ".png");
            }
        }

        setTimeout(
        jsPsych.pluginAPI.preloadImages(images, function(){ startExperiment(); }),
        10000);
         */
        startExperiment();

        // Start the experiment.
        function startExperiment() {
            $("#spinner").hide();
            jsPsych.init({
                timeline: timeline,
                display_element:  my.target,
                on_finish: function (data) {
                    window.onbeforeunload = null; // Remove any warnings about leaving the page.
                    jsPsych.data.addProperties({
                        condition: my.condition
                    });
                    saveData(jsPsych.data.dataAsJSON(), redirect)
                }
            });
        }

    }

    return my;
}());













