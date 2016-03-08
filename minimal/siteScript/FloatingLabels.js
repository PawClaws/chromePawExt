$(document).ready(function () {

    $(".floating-label-field > input, .floating-label-field > select").each(function () { ToggleFloatingLabel($(this)); });
    $(".floating-label-field > input, .floating-label-field > select").keyup(function () { ToggleFloatingLabel($(this)); });
    $(".floating-label-field > input, .floating-label-field > select").focus(function () { ToggleFloatingLabel($(this)); });
    $(".floating-label-field > input, .floating-label-field > select").blur(function () { ToggleFloatingLabel($(this)); });
    $(".floating-label-field > input, .floating-label-field > select").change(function () { ToggleFloatingLabel($(this)); });
    
    setInterval(function () {
        $.each($(".floating-label-field > input, .floating-label-field > select"), function () { ToggleFloatingLabel($(this)); });
    }, 100);

});

function ToggleFloatingLabel(inputWithFloatingLabel) {

    if (inputWithFloatingLabel.val() != "") {

        inputWithFloatingLabel.siblings("label").addClass("floating-label-with-value");
        inputWithFloatingLabel.addClass("floating-label-input-with-value");

    }
    else {
        inputWithFloatingLabel.siblings("label").removeClass("floating-label-with-value");
        inputWithFloatingLabel.removeClass("floating-label-input-with-value");
    }
}



