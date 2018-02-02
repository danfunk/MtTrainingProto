var EXPERIENCE_STUDY = (function () {
            var my = {};

            my.letters_to_remove = 2; // number of missituationrs to complete in the term.
            my.total_scenarios = 24;  // How many scenarios should be randomly selected out of the full set?
            my.block_size = 4; // Number of items in block
            my.question_type = "yes_no";  // Can be yes_no, mc1, or mc2.
            my.traget = "jspsych-target";
            my.base_url = "/js/training";
            my.post_url = "/jspsych";
            my.redirect_url = "/jspsych/continue";
            my.sessionIndex = 1;

            var turkInfo = jsPsych.turk.turkInfo();

            // generate a random subject ID with 15 characters
            var subject_id = jsPsych.randomization.randomID(15);

            function getParameterByName(name) {
                url = window.location.href;
                name = name.replace(/[\[\]]/g, "\\$&");
                var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                    results = regex.exec(url);
                if (!results) return null;
                if (!results[2]) return '';
                return decodeURIComponent(results[2].replace(/\+/g, " "));
            }

            // record the condition assignment in the jsPsych data
            // this values are added to every trial to track participation.
            jsPsych.data.addProperties({
                subject: subject_id,
                turk_work_id: getParameterByName('turk_work_id')
            });

            // This score is incremented for every correct answer and displayed
            // to the user.
            var score_letters = 0;
            var score_questions = 0;
            var progress = -1;
            var vivid_response;
            var followup_count = 0;

            my.execute = function () {
                if (my.base_url.slice(-1) !== '/') my.base_url = my.base_url + "/";
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

            function updateBanner(content) {
                document.getElementById('banner').textContent = content;
            }

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
                                "<p> In this study, you will see a set of short stories. All stories will start with the story's title, so you know what the story is about. " +
                                "The stories will be presented in different formats, sometimes including pictures and sounds.</p> " +
                                "<br clear='all'> " +
                                "<b>For each story:</b> " +
                                "<ul> " +
                                "<li><b>Please</b> <i>imagine</i> yourself in the situation described in each story. " +
                                "<li>Remember, even if the story describes you reacting in a way that you would not usually react, please " +
                                "try to picture yourself responding in the way the story describes. </li> " +
                                "<li>There will be an incomplete word at the end of each story. </li> " +
                                "<li>Click the letter that completes each word. </li> " +
                                "<li>When you correctly complete the word you will move on to the next screen and be asked a " +
                                "question about the story. </li> " +
                                "</ul> " +
                                "<p><b>Before we start, please make sure your sound volume is turned on.</b></p>" +
                                "</div>"
                            )
                        },

                        on_finish: function (data) {
                            data.stimulus = "introduction"
                        }
                    };

                var consent = {
                    type: 'html-button-response',
                    choices: ['I agree'],
                    stimulus: "<div class='details'><h1>Consent</h1>" +
                    "<p>This study examines how people react to various computer programs, and looks at how reading and " +
                    "listening to stories affect how the story is experienced. It takes about 30 minutes.</p>" +
                    "<p>It consists of questionnaires in which you describe your thoughts and mood and interpret various " +
                    "situations, and a task in which you read brief stories, answer questions, and might be asked to complete " +
                    "word fragments. For some participants, being asked questions about their thoughts and mood can be temporarily distressing.</p>" +
                    "<p>You will receive feedback at the end with more detail about the study&#39;s rationale and design.</p>" +
                    "Remember that participation in this study is voluntary, and you may end your participation at any time by " +
                    "closing the study window. Contact Bethany Teachman bat5x@virginia.edu if you have any questions about the study.</p>" +
                    "<p><b>Who to contact about your rights in the study:</b><br/>" +
                    "Tonya Moon, Chair, Institutional Review Board for the Social and Behavioral Sciences , One Morton Dr " +
                    "Suite 500 University of Virginia, P.O. Box 800392, Charlottesville, VA 22908-0392 " +
                    "Telephone: (434) 924-5999; Email: irbsbshelp@virginia.edu; Website: www.virginia.edu/vprgs/irb </p>" +
                    "<p><b>By clicking the button below you are indicating that you have read the informed consent " +
                    "statement above and agree to participate. </b></p></div>"
                };

                var debrief = {
                    type: 'html-button-response',
                    choices: ['Finish'],
                    stimulus: "<div class='details'><h1>Debrief</h1>" +
                    "<h1>Variations in Reading and Listening to Stories Online: Study Information</h1>" +
                    "<h1>(Before leaving page, click &quot;Finish&quot; below to earn Mturk credit)</h1>" +
                    "<p>We are currently studying a new way to reduce anxiety. This new way to reduce anxiety is based on " +
                    "cognitive models of anxiety, which state that anxious people tend to interpret ambiguous situations as " +
                    "threatening. Ambiguous situations are situations that can be interpreted in multiple ways (e.g., either" +
                    " positively or negatively). It has been proposed that the tendency to interpret things in a threatening way " +
                    "plays a role in the onset of, and recovery from, anxiety problems. The new way to reduce anxiety in this study" +
                    " is designed to lead to healthier interpretations related to social various daily situations.</p>" +
                    "<p>Previous laboratory-based studies have shown that making interpretations more positive and less " +
                    "negative can reduce anxiety. In the current study, we are evaluating if it is possible to change " +
                    "interpretations over the Internet. We are also testing several variations that may affect the strength of these" +
                    " interventions. During this study, you read or listened to stories after seeing pictures or pictures and " +
                    "background noises (these are designed to increase your ability to imagine the stories and to increase your " +
                    "engagement in the task.)</p>" +
                    "<p> Previous laboratory-based studies have shown that making interpretations more positive and less negative " +
                    "can reduce anxiety. In the current study, you may have been selected for this study because you reported " +
                    "some anxiety on the initial questions that helped determine your eligibility. This does not mean " +
                    "you have an anxiety disorder.  However, if you feel especially concerned about your anxiety, or would like to " +
                    "talk to someone about the problems you might be having, please follow the mental health resources link on " +
                    "this site: https://implicit.harvard.edu/implicit/user/pimh/linkinfo.html</p>" +
                    "<p>If you are interested in learning more about changing thinking patterns, see the following websites:</p>" +
                    "<ul> <li>http://www.apa.org/monitor/2011/11/behavior-change.aspx</li> " +
                    "<li>http://www.economist.com/node/18276234</li></ul>" +
                    "<p>If you have any questions about this study, please email Bethany Teachman at bat5x@virginia.edu. In " +
                    "addition, if you have any concerns about any aspect of the experiment, you may contact Tonya R. Moon, Ph.D., " +
                    "Chair, Institutional Review Board for the Social and Behavioral Sciences. Email: irbsbshelp@virginia.edu  " +
                    "Website: www.virginia.edu/vprgs/irb</p></div>"
                };

                var final = {
                    type: 'html-button-response',
                        choices: ['All Done'],
                        stimulus: function () {
                        return (
                            "<h1>You are all done! </h1>" +
                            "<h1>Please enter the following code in Mechanical Turk to show you have completed the study: </h1>" +
                            "<h1>" + subject_id + "</h1>"
                        )
                    }
                }

                var lemon_exercise = {
                    type: 'instructions',
                    show_clickable_nav: true,
                    pages: ["<div class='details'>" +
                    '<h1>In this task you will read or listen to a series of short stories. We will ask you to imagine yourself in the situation described in each story.</h1>' +
                    "<h1>Before we begin, we\'d like to walk you through a brief imagination exercise.</h1>",
                        '<h1>Welcome to the "Lemon" exercise.</h1> <p>The purpose of this quick exercise is to demonstrate what imagination-based thinking is.</p><p>You will go through what imagining seeing, touching, and smelling a lemon is like.</p><p>Please imagine it as if you are really experiencing it.</p>',
                        '<h1>First-person perspective</h1> <p>In this exercise, and throughout the training program, please remember to imagine what is happening through <i>your own eyes</i> (picture on the left), not as an outside observer (picture on the right) ...</p>' +
                        '<div style="display: flex; justify-content: center;"><img src="images/lemon/firstperson.png" style="padding: 20px 20px 20px 20px;"><img src="images/lemon/secondperson.png" style="padding: 20px 20px 20px 20px;"></div>',
                        '<h1>Ok, let\'s begin:</h1> <h1>Imagine you are holding the lemon in your right hand, and you can feel its shape and its weight.</h1>' +
                        '<p><i>(Please take a few seconds to imagine this)</i></p>',
                        '<h1>Now imagine you are shining a light on the lemon, and you can see the waxy and lumpy texture of the yellow skin.</h1>' +
                        '<p><i>(Please take a few seconds to imagine this)</i></p>',
                        '<h1>Now imagine that you scratch the skin with your fingernail, then you bring the lemon up to your nose, and you can smell the fresh zesty juice from the skin.</h1>' +
                        '<p><i>(Please take a few seconds to imagine this)</i></p>',
                        '<h1>Now imagine that you cut the lemon in half, and you bring one half of it up for a closer look. You can see the juicy flesh in the shape of segments that look like a wagon wheel.</h1>' +
                        '<p><i>(Please take a few seconds to imagine this)</i></p>',
                        '<h1>Now imagine that you squeeze the lemon and some of the juice squirts right into your eyes, and it is really stinging, making your eyes water.</h1>' +
                        '<p><i>(Please take a few seconds to imagine this)</i></p>',
                        '<h1>That was the lemon exercise!</h1> <p><i>Don\'t worry if you didn\'t experience all of the sensations strongly, this is completely normal.</i></p>' +
                        '<img src="images/lemon/lemon_2.png" style="margin: auto; padding: 20px 20px 20px 20px;"></div>'
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

                var rank_options = ["1", "2", "3", "4", "5"];
                var rank_experiences = {
                    preamble: "In this task you encountered several types of scenarios. Please rate them " +
                    "for how engaging/fun it was to imagine each type (1 = least engaging/fun; 5 = most engaging/fun):",
                    type: 'survey-multi-choice',
                    questions: [
                        {
                            prompt: "<b>READING</b> the story only",
                            options: rank_options,
                            required: true,
                            horizontal: true
                        },
                        {
                            prompt: "Seeing a <b>PICTURE</b> + <b>READING</b> the story",
                            options: rank_options,
                            required: true,
                            horizontal: true
                        },
                        {
                            prompt: "Seeing a <b>PICTURE</b> + hearing a <b>BACKGROUND SOUND</b> + <b>READING</b> the story",
                            options: rank_options,
                            required: true,
                            horizontal: true
                        },
                        {
                            prompt: "<b>LISTENING</b> to the story only",
                            options: rank_options,
                            required: true,
                            horizontal: true
                        },
                        {
                            prompt: "Seeing a <b>PICTURE</b> + <b>LISTENING</b> to the story",
                            options: rank_options,
                            required: true,
                            horizontal: true
                        },
                        {
                            prompt: "Seeing a <b>PICTURE</b> + hearing a <b>BACKGROUND SOUND</b> + <b>LISTENING</b> to the story",
                            options: rank_options,
                            required: true,
                            horizontal: true
                        },
                    ]
                };

                var close_eyes_trial = {
                    type: 'html-button-response',
                    choices: ['1 (not at all)', '2 (sometimes)', '3 (always)'],
                    stimulus:  'When you were LISTENING to the stories, did you close your eyes?'
                };


                /* create experiment timeline array */
                var timeline = [];
                timeline.push(consent);
                timeline.push(lemon_exercise);
                timeline.push(introduction);

                // Randomize the scenarios
                // scenarios = jsPsych.randomization.sampleWithoutReplacement(scenarios, my.total_scenarios);

                // Scenarios are in order, groups by three types of Auditory (no immersion, image before, and image sound before)
                // followed by three types of Visual.   We want to randomize the occurrence of these 6 different types
                var starts = [0, 4, 8, 12, 16, 20];
                shuffleArray(starts);
                var new_scenarios = [];
                for (var si = 0; si < starts.length; si++) {
                    new_scenarios = new_scenarios.concat(scenarios.slice(starts[si], starts[si] + 4))
                }
                scenarios = new_scenarios;

                // Loop through the time-line creating scenarios
                var positive = true;
                for (var k = 0; k < scenarios.length; k++) {
                    var scenario;
                    var paragraph;
                    var phrase;
                    var immersion;
                    var title;
                    var yes_no_correct;
                    var mc1_correct;
                    var mc2_correct;
                    var format;

                    paragraph = scenarios[k]['Paragraph'];
                    scenario = scenarios[k]['Scenario'];
                    format = scenarios[k]['Format'];
                    immersion = scenarios[k]['Immersion'];
                    title = scenarios[k]['Title'];
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

                    var introduction_text = "For the next 4 stories, you will ";
                    var banner_text = "";
                    switch (immersion) {
                        case("picture"):
                            banner_text = "Picture + ";
                            introduction_text += "see a PICTURE related to the story before you ";
                            break;
                        case("picture_sound"):
                            banner_text = "Picture and Sound + ";
                            introduction_text += "see a PICTURE and listen to a BACKGROUND SOUND before you ";
                            break;
                        default:
                            introduction_text += "";
                    }
                    switch (format) {
                        case("Auditory"):
                            banner_text += "Listening to the Story";
                            introduction_text += "LISTEN to the story. ";
                            break;
                        default:
                            banner_text += "Reading the Story";
                            introduction_text += "READ the story. ";
                    }

                    // An introduction / instructions
                    var section_intro = {
                        type: 'html-button-response',
                        choices: ['Continue'],
                        my_banner_text: banner_text,
                        stimulus: "<div class='piIntro'> " +
                        "<img src='" + my.base_url + "images/compass-blue.png' > " +
                        "<p>" + introduction_text + "</p>" +
                        "</div>",
                        on_finish: function (data) {
                            data.stimulus = "experience_introduction";
                            updateBanner(this.my_banner_text)
                        }
                    };


                    var immersion_trial = null;

                    if (immersion === "picture") {
                        immersion_trial = {
                            type: 'html-button-response',
                            stimulus: "<h1 class='title'>Story: " + title + "</h1><img class='sound_image' src='images/" + scenario + ".jpg'>",
                            trial_duration: 5000, // Show trial for 5 seconds
                            data: {immersion: immersion, format: format, scenario: scenario}
                        }
                    } else if (immersion === "picture_sound") {
                        immersion_trial = {
                            type: 'audio-button-response',
                            stimulus: 'sounds/background/' + scenario + '.mp3',
                            trial_duration: 5000, // Show trial for 5 seconds
                            prompt: "<h1 class='title'>Story: " + title + "</h1><img class='sound_image' src='images/" + scenario + ".jpg'>",
                            data: {immersion: immersion, format: format, scenario: scenario}
                        }
                    } else {
                        immersion_trial = {
                            type: 'html-button-response',
                            stimulus: "<h1 class='title'>Story: " + title + "</h1>",
                            trial_duration: 5000,
                            data: {immersion: immersion, format: format, scenario: scenario}
                        }
                    }

                    var main_trial = null;

                    if (format === "Auditory") {
                        main_trial = {
                            type: 'audio-button-response',
                            stimulus: 'sounds/' + scenario + '.mp3',
                            trial_ends_after_audio: true,
                            prompt: '<p>Please listen ...</p>',
                            data: {immersion: immersion, format: format, scenario: scenario}
                        };
                    } else {
                        main_trial = {
                            type: 'sentence-reveal',
                            paragraph: paragraph,
                            data: {immersion: immersion, format: format, scenario: scenario}
                        };
                    }

                    var phrase_trial = {
                        type: 'missing-letters',
                        phrase: phrase,
                        letters_to_remove: my.letters_to_remove,
                        data: {immersion: immersion, format: format, scenario: scenario},
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

                    var choices = ['1. Not at all', '2. Somewhat', '3. Moderately', '4. Very', '5. Totally']

                    var multi_choice_trial_1 = {
                        type: 'html-button-response',
                        choices: choices,
                        stimulus: '<h1>How <b>vividly</b> did you imagine the scenario (as if you were really there and experiencing it first-hand)?</h1>',
                        data: {immersion: immersion, format: format, scenario: scenario}
                    };
                    var multi_choice_trial_2 = {
                        type: 'html-button-response',
                        choices: choices,
                        stimulus: '<h1>How easy was it to <b>follow</b> the story?</h1>',
                        data: {immersion: immersion, format: format, scenario: scenario}
                    };
                    var multi_choice_trial_3 = {
                        type: 'html-button-response',
                        choices: choices,
                        stimulus: '<h1>To what extent did this story\'s ending make you see this situation in <b>a new way</b>?</h1>',
                        data: {immersion: immersion, format: format, scenario: scenario}
                    };
                    var multi_choice_trial_4 = {
                        type: 'html-button-response',
                        choices: choices,
                        stimulus: '<h1>To what extent did this scenario\'s ending feel <b>possible</b>, like it could really happen?</h1>',
                        data: {immersion: immersion, format: format, scenario: scenario}
                    };
                    var multi_choice_trial_5 = {
                        type: 'html-button-response',
                        choices: choices,
                        stimulus: '<h1>To what extent did you feel you could <b>relate</b> to the situations that were presented?</h1>',
                        data: {immersion: immersion, format: format, scenario: scenario}
                    };


                    // Vivid Follow up - changes based on response.
                    var stimulus;
                    switch (k) {
                        case 4:
                            stimulus = "<h1>Well done.</h1>" +
                                "<h1>Remember, imagine the scenario as if you are experiencing it through your own eyes.</h1>";
                            break;
                        case 8:
                            stimulus = "<h1>Nice Work.</h1>" +
                                "<h1>Take time to visualize each situation.</h1>";
                            break;
                        case 12:
                            stimulus = "<h1>Good job.</h1>" +
                                "<h1>Remember, try to imagine the stories as vividly as you can.</h1>";
                            break;
                        case 16:
                            stimulus = "<h1>You're doing great. </h1>" +
                                "<h1>Keep focusing on the stories and imagine them from your own eyes.</h1>"
                            break;
                        default:
                            stimulus = "<h1>Almost there. </h1>" +
                                "<h1>Keep imagining as vividly as you can. </h1>"
                            break;
                    }
                    var vividness_followup = {
                        type: 'html-button-response',
                        choices: ['Continue'],
                        stimulus: "<div class='vividness_followup'>" +
                        stimulus +
                        "<img src='" + my.base_url + "images/lemon/lemon_" + (k / 4) + ".png'/>" +
                        "</div>"
                    };

                    // BUILD THE TIMELINE FROM THE COMPONENTS ABOVE.
                    // *********************************************

                    if (k % 4 === 0 && k !== 0) {
                        timeline.push(vividness_followup)
                    }

                    if (k % 4 === 0) {
                        timeline.push(section_intro);
                    }

                    timeline.push(immersion_trial);

                    timeline.push(main_trial);
                    timeline.push(phrase_trial);

                    timeline.push(multi_choice_trial_1);
                    timeline.push(multi_choice_trial_2);
                    timeline.push(multi_choice_trial_3);
                    timeline.push(multi_choice_trial_4);
                    timeline.push(multi_choice_trial_5);
                }
                timeline.push(rank_experiences);
                timeline.push(close_eyes_trial);
                timeline.push(debrief);
                timeline.push(final);

                function saveData() {
                    var xhr = new XMLHttpRequest();
                    xhr.open('POST', 'write_data.php'); // change 'write_data.php' to point to php script.
                    xhr.setRequestHeader('Content-Type', 'application/json');
                    xhr.onload = function () {
                        if (xhr.status == 200) {
                            var response = JSON.parse(xhr.responseText);
                            console.log(response.success);
                        }
                    };
                    xhr.send(jsPsych.data.get().json());
                    jsPsych.turk.submitToTurk({
                        code: turkInfo.workerId
                    });
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
                        display_element: my.target,
                        on_finish: function (data) {
                            window.onbeforeunload = null; // Remove any warnings about leaving the page.
                            jsPsych.data.addProperties({
                                condition: my.condition
                            });
                            saveData();


                        }
                    });
                }


            }

            return my;
        }
        ()
    )
;













