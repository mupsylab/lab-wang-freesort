let jspsych = new jsPsych({
    display_element: undefined,
    on_finish: () => { 
        jspsych.data.displayData("json");
    },
    on_trial_start: () => { },
    on_trial_finish: () => { },
    on_data_update: () => { },
    on_interaction_data_update: () => { },
    on_close: () => { },
    use_webaudio: true,
    exclusions: {},
    show_progress_bar: false,
    message_progress_bar: "Completion Progress",
    auto_update_progress_bar: true,
    default_iti: 0,
    minimum_valid_rt: 0,
    experiment_width: null,
    override_safe_mode: false,
    case_sensitive_responses: false,
    extensions: [],
    loadPath: "/assets/mupsych",
    autoLoadAssets: true,
    allowRestart: false
});

jspsych.run([{
    type: "html-keyboard-response",
    stimulus: "这是个案例"
}]);