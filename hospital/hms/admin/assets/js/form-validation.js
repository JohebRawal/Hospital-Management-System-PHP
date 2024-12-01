var FormValidator = function () {
	"use strict";
	var validateCheckRadio = function (val) {
        $("input[type='radio'], input[type='checkbox']").on('ifChecked', function(event) {
			$(this).parent().closest(".has-error").removeClass("has-error").addClass("has-success").find(".help-block").hide().end().find('.symbol').addClass('ok');
		});
    }; 
    // function to initiate Validation Sample 1
    var runValidator1 = function () {
        var form1 = $('#form');
        var errorHandler1 = $('.errorHandler', form1);
        var successHandler1 = $('.successHandler', form1);
        $.validator.addMethod("FullDate", function () {
            //if all values are selected
            if ($("#dd").val() != "" && $("#mm").val() != "" && $("#yyyy").val() != "") {
                return true;
            } else {
                return false;
            }
        }, 'Please select a day, month, and year');
        $('#form').validate({
            errorElement: "span", // contain the error msg in a span tag
            errorClass: 'help-block',
            errorPlacement: function (error, element) { // render error placement for each input type
                if (element.attr("type") == "radio" || element.attr("type") == "checkbox") { // for chosen elements, need to insert the error after the chosen container
                    error.insertAfter($(element).closest('.form-group').children('div').children().last());
                } else if (element.attr("name") == "dd" || element.attr("name") == "mm" || element.attr("name") == "yyyy") {
                    error.insertAfter($(element).closest('.form-group').children('div'));
                } else {
                    error.insertAfter(element);
                    // for other inputs, just perform default behavior
                }
            },
            ignore: "",
            rules: {
                firstname: {
                    minlength: 2,
                    required: true
                },
                lastname: {
                    minlength: 2,
                    required: true
                },
                email: {
                    required: true,
                    email: true
                },
                password: {
                    minlength: 6,
                    required: true
                },
                password_again: {
                    required: true,
                    minlength: 5,
                    equalTo: "#password"
                },
              
                gender: {
                    required: true
                },
               
                city: {
                    required: true
                },
               
            },
            messages: {
                firstname: "Please specify your first name",
                lastname: "Please specify your last name",
                email: {
                    required: "We need your email address to contact you",
                    email: "Your email address must be in the format of name@domain.com"
                },
                gender: "Please check a gender!"
            },
            
            invalidHandler: function (event, validator) { //display error alert on form submit
                successHandler1.hide();
                errorHandler1.show();
            },
            highlight: function (element) {
                $(element).closest('.help-block').removeClass('valid');
                // display OK icon
                $(element).closest('.form-group').removeClass('has-success').addClass('has-error').find('.symbol').removeClass('ok').addClass('required');
                // add the Bootstrap error class to the control group
            },
            unhighlight: function (element) { // revert the change done by hightlight
                $(element).closest('.form-group').removeClass('has-error');
                // set error class to the control group
            },
            success: function (label, element) {
                label.addClass('help-block valid');
                // mark the current input as valid and display OK icon
                $(element).closest('.form-group').removeClass('has-error').addClass('has-success').find('.symbol').removeClass('required').addClass('ok');
            },
            submitHandler: function (form) {
                successHandler1.show();
                errorHandler1.hide();
                // submit form
                //$('#form').submit();
            }
        });
    };
    // function to initiate Validation Sample 2
    var runValidator2 = function () {
        var form2 = $('#form2');
        var errorHandler2 = $('.errorHandler', form2);
        var successHandler2 = $('.successHandler', form2);
        $.validator.addMethod("getEditorValue", function () {
            $("#editor1").val($('#form2 .summernote').code());
            if ($("#editor1").val() != "" && $("#editor1").val().replace(/(<([^>]+)>)/ig, "") != "") {
                $('#editor1').val('');
                return true;
            } else {
                return false;
            }
        }, 'This field is required.');
        form2.validate({
            errorElement: "span", // contain the error msg in a small tag
            errorClass: 'help-block',
            errorPlacement: function (error, element) { // render error placement for each input type
                if (element.attr("type") == "radio" || element.attr("type") == "checkbox") { // for chosen elements, need to insert the error after the chosen container
                    error.insertAfter($(element).closest('.form-group').children('div').children().last());
                } else if (element.hasClass("ckeditor")) {
                    error.appendTo($(element).closest('.form-group'));
                } else {
                    error.insertAfter(element);
                    // for other inputs, just perform default behavior
                }
            },
            ignore: "",
            rules: {
                firstname2: {
                    minlength: 2,
                    required: true
                },
                lastname2: {
                    minlength: 2,
                    required: true
                },
                email2: {
                    required: true,
                    email: true
                },
                occupation: {
                    required: true
                },
                dropdown: {
                    required: true
                },
                services: {
                    required: true,
                    minlength: 2
                },
                creditcard: {
                    required: true,
                    creditcard: true
                },
                url: {
                    required: true,
                    url: true
                },
                zipcode2: {
                    required: true,
                    number: true,
                    minlength: 5
                },
                city2: {
                    required: true
                },
                editor1: "getEditorValue",
                editor2: {
                    required: true
                }
            },
            messages: {
                firstname: "Please specify your first name",
                lastname: "Please specify your last name",
                email: {
                    required: "We need your email address to contact you",
                    email: "Your email address must be in the format of name@domain.com"
                },
                services: {
                    minlength: jQuery.validator.format("Please select  at least {0} types of Service")
                }
            },
            invalidHandler: function (event, validator) { //display error alert on form submit
                successHandler2.hide();
                errorHandler2.show();
            },
            highlight: function (element)0{
  (       †     (ele}en|+.c|osest®g.help•block')*bdmo6eCdass('valid);
    "  !" †!®0  // dicpfay OK iconç       $         (eleMdn¥)/kho{u3t('.gorM-group').femoveCl!s{*%hcs-sucCEwr')/addCLe{18'has-erÚcr'a.findh'.3ymjol'+.remÓteClass®'ok'i.addClass(ßreqtiref'!;
 p "`` ` ` $   0-+!add tle Bkot7trAp(esrkr(cl·ss to tiÂ!Control gro}p  0         },
    †  "    u.hiWhlkG`t: funotmon element- {!/ refevt tha$c(angu"done by hight,icht
(         0 "† $(Â¸emant).closast('*fori-g2o}`').remoteSlass('haQ-%rrOr/	3
    !     †    0// sdt er2ob claÎs†po the control GcouJ`    ( ,  A(},
   (     §$ suc'essæ function"(mabel,"eleÔdft) {
     (†       ` labeh.addS~ess('Ëelp,Ílock ∂alid');  $        ` !  //0m`sk the curreot#input as vanid a~d dosplay(OJ ygoo
 $       "  `   $ element).jlosEsp('.&orm-G2oup).rdmove√|asS('hcs-grrob').a¸ml·ss(/hasi{ıccess/).fin|('.Û9mbml'	.rmmofeClaws(grequised').addAmass('oK')+
$   `  " $†"},
    (   0   submitHindLer:!nu~cTin )forl) { $ "  ∞ $  `   "succeÛsHa.dLcr2.showh(
    †     †     erˆmsHandher2.hide(9{
      4         ./13uboit Êor}J    ( ††        //&(3#for-2).surmht((;H            }
  $   ( });
"  `  (0√KÂDJTOR.dksariÌAdtoInline0Ω Ùrue;
    $  0$('teptarda&Kkedhtor').ckedItkR((;
    };
0"  revurn k
  1     /ØmAkn bunktikl to†i~iÙiate tedplctu pa'fsä    !  #)oit: dul#tign†,i {
    †   	valifateKi•#kR`dio();
        ` (sunFal)dAtor1();*        `  "rqnVclifapor2()?J(      hu"   };
}8);