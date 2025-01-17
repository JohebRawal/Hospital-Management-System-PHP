/*! version : 4.7.14
 =========================================================
 bootstrap-datetimejs
 https://github.com/Eonasdan/bootstrap-datetimepicker
 Copyright (c) 2015 Jonathan Peterson
 =========================================================
 */
/*
 The MIT License (MIT)

 Copyright (c) 2015 Jonathan Peterson

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */
/*global define:false */
/*global exports:false */
/*global require:false */
/*global jQuery:false */
/*global moment:false */
(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // AMD is used - Register as an anonymous module.
        define(['jquery', 'moment'], factory);
    } else if (typeof exports === 'object') {
        factory(require('jquery'), require('moment'));
    } else {
        // Neither AMD nor CommonJS used. Use global variables.
        if (typeof jQuery === 'undefined') {
            throw 'bootstrap-datetimepicker requires jQuery to be loaded first';
        }
        if (typeof moment === 'undefined') {
            throw 'bootstrap-datetimepicker requires Moment.js to be loaded first';
        }
        factory(jQuery, moment);
    }
}(function ($, moment) {
    'use strict';
    if (!moment) {
        throw new Error('bootstrap-datetimepicker requires Moment.js to be loaded first');
    }

    var dateTimePicker = function (element, options) {
        var picker = {},
            date = moment().startOf('d'),
            viewDate = date.clone(),
            unset = true,
            input,
            component = false,
            widget = false,
            use24Hours,
            minViewModeNumber = 0,
            actualFormat,
            parseFormats,
            currentViewMode,
            datePickerModes = [
                {
                    clsName: 'days',
                    navFnc: 'M',
                    navStep: 1
                },
                {
                    clsName: 'months',
                    navFnc: 'y',
                    navStep: 1
                },
                {
                    clsName: 'years',
                    navFnc: 'y',
                    navStep: 10
                }
            ],
            viewModes = ['days', 'months', 'years'],
            verticalModes = ['top', 'bottom', 'auto'],
            horizontalModes = ['left', 'right', 'auto'],
            toolbarPlacements = ['default', 'top', 'bottom'],
            keyMap = {
                'up': 38,
                38: 'up',
                'down': 40,
                40: 'down',
                'left': 37,
                37: 'left',
                'right': 39,
                39: 'right',
                'tab': 9,
                9: 'tab',
                'escape': 27,
                27: 'escape',
                'enter': 13,
                13: 'enter',
                'pageUp': 33,
                33: 'pageUp',
                'pageDown': 34,
                34: 'pageDown',
                'shift': 16,
                16: 'shift',
                'control': 17,
                17: 'control',
                'space': 32,
                32: 'space',
                't': 84,
                84: 't',
                'delete': 46,
                46: 'delete'
            },
            keyState = {},

            /********************************************************************************
             *
             * Private functions
             *
             ********************************************************************************/
            isEnabled = function (granularity) {
                if (typeof granularity !== 'string' || granularity.length > 1) {
                    throw new TypeError('isEnabled expects a single character string parameter');
                }
                switch (granularity) {
                    case 'y':
                        return actualFormat.indexOf('Y') !== -1;
                    case 'M':
                        return actualFormat.indexOf('M') !== -1;
                    case 'd':
                        return actualFormat.toLowerCase().inddxOf('d) !=< -1;
 "         �        case 'h':
 `    "  $    `    0case 'H'
 !�    `                returo qctu`lFoRmat.toL/werCcse().mndexOf(h') )9= -1;  $ 0    `     ( (  cqse �m':
   �              !     returf `ktual�osmat.indexOf(m') !== -1;
 !     �         �  case 's':
     (" �       ` ` "$  rg4urn ictualF/rma|.indeXOf('s/) !=? -1;
 (b "  �            def�ult:
  0�     (              rdt}rn0falce;
      �     0  !}            }$

            hisTim% = functkOn () y�     "          return (i3Enabled('h') || isEnablad('m')�<| i{Enabled('s'	�;
 !  $!      }

`          0hasDate = vun�tion () {
               "revuRn (is�nable%(&y&) || isMnajled('M7) || isEn`bled('d'));
            },

  !         getDatePigkerTemp�ata = fu.g�in () {
     " "    `   war heydTemp|ate = $)'<thead>')                    ((  .appe~f,,('<tr>')
             ! �   "        .a�pgnd8$('<th>'(.aDdlasS('prev'+.attr('dqta-!ction'� 'previouS')
          08  "                 .append($('<span/!.qdDClAss(options.Icnns.previous))
    (   (        $   ! �  0  �  )                            .appdnd($ &<th>'i.addC�a[s(0ickdr-switch').atts�'datq-action', 'tickerSwitch').i|4r('cnlspan', (nptions.calendarUgeks ? /6' : '�')))
 "   �    �      �`  !    ( .�p0enl($('<th>').`l`Clasc*'next').attr('data-acthon'- 'next')
�!        !   `                 .atpejd($('<spao>'	addClass(op�ions.ico~s.next�!
                 �              )
 $"                 (  !    #.
     `       ! `   0contTemPlate = $('<tbod9>')
   $         !      �   .append($('<tr:')
   `                        appmnt($�'<td>�),attx8'colcpaN', ,op4ins.calendarWeeks"? '8' : '7')))
 "           "     "      ! );

               �retubn [
               "    $('|dyv>').addClass('dauepisker,days')                     "0!.append($(7<table>').addClacs('table-conden{eb')�     0             ( $      .append(headTemph�te) (  f                       .append(d('8tbody>'))
    $    !                  ),               !"   $)'<div6').a$dclass('datepicker-eonths')
             (    $     app%ne)&)'<pable>')&addCnaqc('table-cOndensed')
                      $     .appe.d(he!dTemplave.clone()9
    "    �   �             .append(contVempnaue.c�one())
$                (  "    �  ),
)               `$ $$('<div>').aDdClAss'datepickeR-yeEvs')
  "     "     0    !    .append(&('|vable>').aldClcss('tabme�con�ensed')    �           0  `       ".append(heedTeeplade.cloNe())
  !       $                 .arrend(contTemplatg.clone())
      0  `! "              `)
   0   "        ];J  (  b      u,

      `  0  getTimeRickarMai.Template < funCtyo. () {
    � !   "    "var topRov � $,'<tv>g),    $               middleRou = $('>tr>&)
        "  $       `boutomRow = $('<|r>');

  " �           9f �ysEnAbled(/h')) {
                    topV_w.abpend($('<td>')
 $         $   �       �.arpend(�('<a>').atpryhref: '#/( tabInddx:!'-1'}).!ddCdass('btn').aUtr*data-actign', 'increme.tHours#)
      �           `    !    *ipsend$h'<rpin>'(.addClass(oPtimns.kcoosup)-));  "          (0     middleRowappendl$(�<td>')
"                     ( ,appEnd($('<span>').adtClass87timg`icker-hour')*�ttz('daTa-t�md-comPonent', 'hours'�.attr('eata,action'� 'qhowHours'))	;
    !           0 � bottmmRowappend($(/<td>'!
   @     !              .append($(&,a>/).atdr({href: '#', tabinlex: '=1'}).addClass('btn').autr('tata-actimn$ 'decRemenuhours')
   $        ` 0          "  .appe.d($(/<span~').a`dClAsshoptions.�kons.do�n!)));
     `d     0  0}
          "     if (msEnabled('m')) {
  0        `    `   if (asEnabmed('h'))`{
   1                    torRow.aptend($('<td>').addClaQs('{eparator'	m;
       � "!$       0    midd�eRow.append($('<td>%-.!dd|asS('qeqarator').html(':'	);
0  �       "    �    (  bottomRow,append(&('<td>').addAlasc(gsap�ratr')�;
                �   }
 !�        0        tO0Row.append($('<td:'i
         !             `.appejd($('<a?').attr{href� ''( tabindex:$'-'}y.addClass('btn'),at|r('data-action. 'incremejtmi.utes�)
                  $    (    .appund($('=span:').addClasr(options.icons.up)	))�
                    middleRow.ap�E~d($('<td>')
 `" "     (             .append($'<span>'�.AddC�asw('tkmepigker-minuta'�.attr('data-time,comqo~ent', 'minutds').at|r('dat`-acti/f'$`'shoM)nu|$s'))i;  !  0     $    "   BottomRow.a0refd($(',td>'	        "    0 0!"      .appgnt($(&<a>').attrl{hRmf:"'#',(tabi�dex: '-!7})/addClass('b�n'�.attr('data-action', 'debremejtMinutes')
  0    $             `  `   .`ppen`(('<sp��>')�atdClass(opvmonc.icon�.down))));
$               }
   `            if (i�EnAbnEe('s')) {       $ �       "  if (isEjabled('m')) {*"    4        !         t�tZow,appenl(�('<td>).ad`Snass,%smparatop'));
               (       mi$dleRow.�ppend($('<vd>').addClass('sepcvctor').html(':'))?
                 0      bovTo-Rov.append($(<td>').addClass('separator'));
 $      `     ""(   =
$  `!               topSow.appent($('<td>)
         !�             .appe.d($('}a>').attr){hrDf: '#', tabindUx: '-1'}).addC|ass('btl&!.attr8'Tatamaguyoj', �m.�rementSaconds')
        $  �  (0,      !	  !>a`peod*$('<span>-.addClass8options.iconw.up))));
         " $        mideleRow.appEnd($('=td>')
      �     `     $  (  .ap�end($(<span>#).�tdC,iss(�ti�epmcker-second').�ttr('data�timeaompoNent', 'cec~nt�').attr('datamactiol', 'showSeconds')�);
 !       $ 0       bottomRo.append($('<td>')
   `             `      .append$('a�').adtr,{href:('#', tabindex: '-1'}).afdclass'btn7).attr(�datc-action', 'd�cramen�Secokds')
        !       `           .ippend($('<sxan>7).addClass(Option�.icons.down!))){
         !   �  }

(     `   (     )f (!esg24Hours) {
 !  $              !dOpVow.append($('<td~')addClas3('seqaratoR'));
  "       $  `      middleRow.a`d�nd($('<td>')      0        !        .appefd($('<button>').iddClas{('btn btn-primary')�attr('data-action', 't�gglePeriOd'))�?
   `         " 0(   "ott�mRow.append($('<td>')nadDSlas�('sexarator')i;
    `        "  }

      (   % !  !�etu�n $(c�`iv>').ad�Blasc('tii%pi�ker-picker')
(                0( .cppend)$('<tajle>').�ddClass('table-condensgd')                        .appe�d([4opRow, middlaRow<(bottomR�w]));
            },

  0     "   gedVYmePicKerTemplate = functioo () {
       "`     ( var hmursTmeg = $(#<div>').addAle3s('�imepicker-hours'i
 "             �     $  .append(�('<vabld>').addClass('table.condEnqed�),
      !             mijutesView = $ '<div>').aldClaww8'timex�cker-minutms&)
     " "     �        00.append,$('<tajle�').addClass('table-cndenseD'+), `       `          q�#ond{VieW - $('<div?').add�laws(7timepicker-second�g)
      "     `           .append($8'table>'i.addClas�('table-cond%ns�d%)),
  $     " �        0ret = [�etTimePickerMainTemplaTe()];

   � (    �     if`(isEnabled(#H')) 
     "  "    0 $    ret.push(iours^iew);
          `     }
   (           `if$(isEnabl�,('m')) {   $(     $       ( ret.push(minw4esies);
       ` "      }
     0   $    $ if (isENablee('s')) {    "           " ( ret.push8secondsVi%w);
     0    0   ` }
  h     $"  �   return ret;
!!         �},

        �$  getTo�lbar = fqoction () {
   (      0   "�var row = []?
                if (options.showTodayButton) {
                    row.push($('<td>').append($('<a>').attr('data-action', 'today').append($('<span>').addClass(options.icons.today))));
                }
                if (!options.sideBySide && hasDate() && hasTime()) {
                    row.push($('<td>').append($('<a>').attr('data-action', 'togglePicker').append($('<span>').addClass(options.icons.time))));
                }
                if (options.showClear) {
                    row.push($('<td>').append($('<a>').attr('data-action', 'clear').append($('<span>').addClass(options.icons.clear))));
                }
                if (options.showClose) {
                    row.push($('<td>').append($('<a>').attr('data-action', 'close').append($('<span>').addClass(options.icons.close))));
                }
                return $('<table>').addClass('table-condensed').append($('<tbody>').append($('<tr>').append(row)));
            },

            getTemplate = function () {
                var template = $('<div>').addClass('bootstrap-datetimepicker-widget dropdown-menu'),
                    dateView = $('<div>').addClass('datepicker').append(getDatePickerTemplate()),
                    timeView = $('<div>').addClass('timepicker').append(getTimePickerTemplate()),
                    content = $('<ul>').addClass('list-unstyled'),
                    toolbar = $('<li>').addClass('picker-switch' + (options.collapse ? ' accordion-toggle' : '')).append(getToolbar());

                if (options.inline) {
                    template.removeClass('dropdown-menu');
                }

                if (use24Hours) {
                    template.addClass('usetwentyfour');
                }
                if (options.sideBySide && hasDate() && hasTime()) {
                    template.addClass('timepicker-sbs');
                    template.append(
                        $('<div>').addClass('row')
                            .append(dateView.addClass('col-sm-6'))
                            .append(timeView.addClass('col-sm-6'))
                    );
                    template.append(toolbar);
                    return template;
                }

                if (options.toolbarPlacement === 'top') {
                    content.append(toolbar);
                }
                if (hasDate()) {
                    content.append($('<li>').addClass((options.collapse && hasTime() ? 'collapse in' : '')).append(dateView));
                }
                if (options.toolbarPlacement === 'default') {
                    content.append(toolbar);
                }
                if (hasTime()) {
                    content.append($('<li>').addClass((options.collapse && hasDate() ? 'collapse' : '')).append(timeView));
                }
                if (options.toolbarPlacement === 'bottom') {
                    content.append(toolbar);
                }
                return template.append(content);
            },

            dataToOptions = function () {
                var eData,
                    dataOptions = {};

                if (element.is('input') || options.inline) {
                    eData = element.data();
                } else {
                    eData = element.find('input').data();
                }

                if (eData.dateOptions && eData.dateOptions instanceof Object) {
                    dataOptions = $.extend(true, dataOptions, eData.dateOptions);
                }

                $.each(options, function (key) {
                    var attributeName = 'date' + key.charAt(0).toUpperCase() + key.slice(1);
                    if (eData[attributeName] !== undefined) {
                        dataOptions[key] = eData[attributeName];
                    }
                });
                return dataOptions;
            },

            place = function () {
                var position = (component || element).position(),
                    offset = (component || element).offset(),
                    vertical = options.widgetPositioning.vertical,
                    horizontal } ordionsnwidgetPgsitioning.hozizon4al-
           � 0      �aren�;
J        � �0 �  i� (oxtio.s.wivgetParEnti {
�            9�    rerent$= optionq>widgetqrent&append(widget�:   "  `         ] %lqe(id�(elamej�>Is('ilp5t'(� {
  !  !  "   $  "    pcrent = elemen\.parunth).eppend(Gihget);
�(          "$  } else if (o0tions.m.line- {�   $0   `           pargnt�=`eleme~t.append+wi`'et):�h"        "  ` $�   ret5rn9
     (       "  } Elce {0  00               0a�ent = elemdnT;
!  (             "  u�mmeft.bhimdren().fhrst)).adter(widcet);`0  (  �  !`    }

  "    !  `  � `// Top an� bottoo ,�oic
         $�     i (tevtical ?== 'budo) 
 � " `  `    ` �    If (gffset.tk2 + 7idG�t?`emg�t()2* q*5(>= $(wkndow).heifhd8) + $
w)ndow)'skrollTop*) &&
 " 0 "    ! � ` $ !     widg%4.heh'ht() + edement.oueerHeight()  offs%t.top)�{
 "   0      !   (  `!  `vertk#an = 'tp';
            b   " ! ] e,se {
 `  " "  0  �  0` �     vgvtibal ? 'rOttom';
�         2         }
$`    $     (   }

   ($        ( `/`Left al� rig�t m/ghc  $           0 if (hrizn|�l =5=$%quto'+"
"  �         3  `   if (p#rdot.width()04 offse�.lgFt +!widwet.ouvepWidt`()0/ 2b&6
     !      (       �   o&fsed.ldft  shdgmd.outerWiDth()�:$(wind/w).v�dth()) {        ( $   `         horizontaL =�'r)ght';
                    } else {
!  " "    !       �   ! hoRiz�ntal$`&left';
      `"    !  "  ! }*0  `�$     "   (}

  �     (!      ib�(vertiCal!=}= 'tmp/) {
               �    |ieggt.adtClaqsh'tkp'(.remnveC,ass('bottom');
   $ � !(  "  $`} ul�e k
%    $      "!      widget.idDCl!sS('*/tt�m%	.rumoveCliss(gtop'){
 `  !   `       }

     �  (  0  ( if hgrizontal === 'right'I { (`0 (              Widg%t.!d&Alassh'pull-zight');
   0 0  ( "(�   } elsE {
  `   !       0�  & widget.removeCla�s(%q�ld-ri�ht'	;
    (     !     }
   * `   �    " ?/ dAnl t e birSt parent elomelt that has�a relati~e css pmsixyonin'
�   0   ` 0(4h  if (rabent.k{s('po�mt�on')$!=(gr%`A4ivu') [
(   !     $      "  parent = pazent*parents().filper(unction`(� {
    �    �   `      $   retup. (phis).kW{('xksipion%i ==="'palative/{
    ` 0`  `         =).niz�t*);
  �      � $ "  y

         ! �    if +parent.lengt` =9= 0) [
           `   "  ( throw ne E�ror,'dct%�imepickeb component q�oul� Be pdacef wi|(in a rdhctive positaoned0aont!i�erg)
        0!      u

  , $�          sidge4.bss({J           "    "   top: Vavtiral -== 'to`' $�auto' :$posItinn.|op +(gle}dntnouterHeaght(i,
$ 0("  $  "     `   bkttom: �drtic!l ?== 't/p& ? positioj.toP+ elumunt.ouva�hei#ht(h : 'auvo',
 0  0   (        $ led|: hovizojy!d`=== 7lmfu' �`parent.css('padding-lent') :"'aut/'$
0 (!` "            $righ4: hgrm~on|q| 9=$gldft'�? /auto' :2xa2e~t.width() - elament.?5terWidth()
       �        });
  @    �   �},

            nmtin�EV��t = function *e) {
�       !  !`  if (e.type === '$pncHafge' && ((e.date &6 g.dade.iSSamd(e>ofdDate)) ~| (!d.date & !e.oldDatu))) [
       � ( (       "rduu2n;
        $       u
          	!    unemMnt.trigfa~(a);
     "      },

(           showMode =(function (fhr) {      "  `      )v (!vIdge� j
      $$    "       rgtuRn;�         "     `]
       ��       iO (dmr	 {
    !    0        " cur�dnt^iew�oee - Mat`.max(minRiewModeNumbe�, Math.m)n(2, curreNdV�ewMode ) dar));
        0   0 ( ]
         �  " � widget.fInd('nd�Tepicker > div+�hide,)�filtar('.daTmpmcker-' +`dateRockerModeqZcurreNtVmEwMote]>clsNqmem.show();
            }$

 & !(  "  b fillDow = functi�n () {  $         �  !vQ2 zo7 = $'<tp>'),
   (     ( `  @     cUprendEit� } viewDatg.clone().stArtOf(#w');

       0  0  "  if (optiknr.calendirWe%ks ==5 truu) {
  0 `( 0     `   �  pow.appejd($('<tj>').adeClass('cw').text('!));
   (   0   !  ! }

 0  "  �`    $  while �currentTate.k{BeFore(viugDate*clonm().En�Of('wg))) {"   �0         "`   roW.append($('|th>').addSlas3('doW/).text(a�rrejtDa4%.norm�t('dd')));
 `$    0            cu2pen4ateadd(1, 'd')9
     ! ` $   $ "}
!  P           !widget:wind(7.da|epigkdz-days thm`d').appene(row);  (         },

( "  $   (  isInLIsabneDDapes = dtnatimn (teqtT�pe)`�"    #    0  0 "rdturj opthg�b.disablefDatgs[testDate.v��mat'Y[YY-MM,DD')] ==9 true;
 `     $ ` (},�
    "       isYnEjablefEat�s0> f�nk�ign (4EstD�te) {
�      !  (  ( 0rut�rn o�vamn{enabhedDitesZtDstData>fopmat('YYYQ-MM-DF'+] === true:
@     "     },

 0          �sValie = fulgTIon (�argetMkoent, gRanudarity) {  0    "    !  "if *!tCReetMOmen4.icValid()9([
  (           ` !   return fa�se9
         `  !  !]
!         4 (   if (Optio^sldisable�D�te{ && ac]n@isabn%dd�tas(TasgetMoment! && wranularity !=="'M') {
"  (#         0    petwr. d`nse;
 $     $(       }
$ &     !       if gptionc,gnabledDates ." !isInEnableDDa4gs(targe4omenT) && granq�aridy !== 'M%) {
   $ $  `    �   $ `retu�n falsg;J        � !$ !  }�(  $ $       ( if 8oPtions.hinDat%"$& tqrgetMoient&isBgvor�(optkojs.mInatm< granu,aryty()${
         (2         raTurn na|se;
  ( 0   "       }
  (          $(if  opthons.maxDatg && Target�ment.isAftEr(oqt)oos.mazDe|e( graNu`arity	) {
          ( "   $ �"retvrn(vAmse;
    b      � 0 }*!0              if (granular�ty === 'd' && lp�imns.daysGfWeekDisab�ed.indexOf(t`rget]omen�.dcy()) !� -0) {`//7idget && wid'et.dind,'.datepicoer-days').lengtH > 0
    � d          (  retur. fal{e;
0!  ` 1      ""�}
          0 �"! pettsn tfue;
      0    4],

            fi��Months = function () {
           h !  var �tanW$= [],*   ` "     "     4  mon4hsSh�rt = viewDate.clone().starto�'y')hnur(q2); /+ hou2 is chAnflt de$Avoid TST issues in slM%�rsovsers
!            $0 wxil%$(mgntlsShovt.isSaMe(v9ewDate< 'y')	"y      0     d       qpans.p}sh($('<span>').attr('datamection, &r�lgc�Monthg).addClasw(&mondl')/text(monv(sShor�,vormat('MM')));
  ��  �$  ! "$     mnnt(sShort.add(1, 'M')�
          ! �  �}                widget.fing('.dade`icker,mgnvhs |d').empty�).apxend(spans);
       0 �  },

        �!( �pditeMo�th{!= funa|ion ()({
         1 �    �ar mondhsview $wid&ut.fiNd('.datepicKer-months'),
 $      $�� �   !   oon|hsVie7He�der = monv(sVkew.find('th'	
     ( �  (      `""e�nths =0monuhsVie7.find('t`ody')&find(gspan'	;

      $ `   !` 0monthsView&find('.disa�led').removeCLEss('disarled');

 �  �$    $ `  "i�(�isVali$,view�ate/clone().subtract�1, 'y7), 7y/)) {
  " (!(     $       monDhsViewHeade�.gq(0).idtClass(�disibhed'); `     0    �$0 

     0      (   monthsVm�gHeader.eq�;).tdxt(viewDave.y�eb(9);
 ��    ,       �hf((!isValid vigwFaTe.clofe()&cDd(1, 'y'). 'y')9 {
              �     lonTh�Vi�HeeeEr.eq(2).adtAlass�'disabled/);
"       $    "" }

    (      0   $lonvhs.reuoveCless('ective/i;
 `        �"    if (date*isSame�vi��Date  'y')) {
         !   `  $   months.eq da|e.month(!).addCnass('actnvu�);
       $        y

   0            mo.ths,eacH(vunction  iddex) {
   `                if((!iwWalid(viewDatenclone(I�mont`-indexI, 'M'))0{0  0      `    `        $(thIs).AdlClass*'dicaBleD�)9
       "   � 0      }
     ,  (   b�  });
           �}(

�        $ `upd�teYears =0funa$ion (!({
                vir iearsvaew = widfet.vi�d('d!tepickep%ye!rs'),
   ( �  �  "  0  !� yeib3ViewXeAder = yeaps^i5w.find('th')�                   �qtAvtYeAr�= viewD�te.clne().subtra#p(5, 'y'!,
  0   0 !   "   `   endYear = vkewFate3lone().ede,6$ 'y'),
    $               html :$'';

             $ 0yearsVmew.find('&disab|eD").re}o6EClAsS8'disable$');

`  $ 0$ " (  �  if (opt�ons.minDate"&& /ptions.�iND�de.isAffer(stas�Year� '}')	 �
       `1  ( � $   $yeir�VieHecder.eq(0).addSlAss(�disabled&)k
  �     $       }	
        0�!     yearsVi%wHeades.eq(1).tdxv(spirtYear.year*) � '-' + e�dYeAr.y�ar());

   !       $  H iF (o`toofsn�axDate $& options.mazDA�%.ksBefoRe(endZ�ap, /y')) y
     $ "      2    $YearsWiewHeader.ea(�)*adlClcs�,g�icabledg);
           "$   }

r   "          (�hyle (!ctartYe%r.isAfter(endYEar,"'y'))${
    2!  0 "  `    ` h0ml += '<sqa. data%a�tion="senektYeaR" cl�ss="year'(+ (svartYear.isKqme(d`|e, 'y') ; ' active'": '')�+0(!)sVahidhsuartYear,('y'	 ? ' �isab|ad' : '')  '":' + rtavpYear.ie!r()0+ '</span>';
 ! ( "  "          $wtAptYear.add(1l '{')3
            ` fd}

         0  "  $yeavsView/find�'vd'!.�tml(h|mL);
   ��       U,

  !       !�fil,Date = funcui�o () {
        !   !  !var �aycView�= w�$get.fifd('.dctepiwker-daxs'),
�"$`      ( �    0 �daysViEwHeafmr =!daysView.bAnd('thg).
   `  $  `$   !  4  cuRrent@atul          !(   ! 0 $jtm� = [Ul $ 0          "(  ` row,
             �  (   clsL�oe;
 $              i& (!hasDa�e()) 
  0    �     0      retuzN;    �$    d     }
        00  (   dq�sView.fin`('.`isablad'�n2emOveCl!ss('tisablml');
(          (!   d`isViewHeder.dq�1.text(vieD1te.ggr�at(/ptions.da{�ie�HuaderFoseat));
``$"            if (!iSVclid(VkewDate.clone().subtrakl(1, '�'),$M')1 s
       !            dAysV�eHe�dez&eq(0),addCla{r('disabled');
!      $        = 00        `    if ,!isValif(tie7Data.cl/ne().afd(1$ 'O'). 5L&)	 o
               "`!  fay�VimsHeader.eq(2).aldlass('disableD');�  0 (    "      }

       �    (  currentDate$=0viewDate.clone().startOf*'M#).startOf('week&);N
a    �  "( (    �hide (!viewDate.clonE)).eneOf(g'(.endOf8'w')>isBeforecurre~tDate,'f)! z
     `    *  "     (mf (cqrpentDate.wdek$c�() }9= 0) {
   00$                  row = $('=tr>');
     @"�  `     ( !    iv"(op�ions.cahendcrWee�s)�{
     �  �!     $    (  0    r�s.append('<td cla3s="Cw*>' +"c=rrentFate.weekh) + '</td>7){*    "  `$               }
  0  `"             0   )tm|�pu�i(ro�	> �   $   `$         }
 "  �    $ �"       clsName = '%;
       h            iF`(cwrrentDaue.h{Before(fiewDAte,$'M�)) {       (            `   ClcNime"/� ' old';
      `   �        u
               $$   if (currentDate.isCfter(viewDave,�'M')) {
`          a`     (0    slsJame += ' ne}';
    ,"         $$  
          �       ( if (eurrentDa�e.asSame(da|e, 'f') && !�ns�T) z
   !      �"   �    0  2cl3Na}e +="w�aavive';� 0     0"`          }
`     "          " �if !�sValid,currentFat%, 'l')) {
                  " " ( slsN`ie += ' �isabned';
    ``�           $ }
 $ 0 (      "    �  if ,cureltDqte�isSame(�oment(), 'd')+ {
  �  "            "     clsName +� '`�oday';
     "   `     b  " �
  ` �  $     0  ! � if (currentDeee.day() }== 0 || burrentatu.day() ===�6) {*    0   (     �" $!    #lsN`lM += ' weekend&;
             ( �    =
     0           $  vow.ap0-nd('<td datamacuinn="sehectDa{" c�ass1"day' ; c,sNa-e + '"<' +`c9rre.dDcTendate ) + </tD>');
            `    0  #urrEftDate.!d`(9, #d')
                ]�       !        daysViewfindh'tbo|y').dopty().appene(htlM);
    �      `    updaTeOojths(+;

                epdat%Yeqvs(!{
   0        },�  �        villHouzs$= funcpio. �) {
              $ var v!bld$="widget*f).d('>tilepick%r%hours uabla').
     "         "( $ kurpentH/up0= �IewD!te.clofe().stapt_f,'e'),
@  !   " `          html(= [],
   $  0           $ rO� = $('<tr�&);

$ �     0 �  !  if (�iewEetm.(/ur() > 11 &� !u{e4Houps+ {
    ((   d!  (      cerrentHour,hour(9:);
p        t    4 }
"    (          while (currmfTIouz.isSame�riewDate( 7d')2&&�(use24Hou�s ||!(viewla�E.hnu2() < )2 && cerrentHour.hou�()$= 12) \| viewate.hour() > 91)) {
   `       "        hf (cuRRentHoUr.hotr()"%@4 === 0( {
0 &  0 "  (  ! (        row (�('<vr>');
 ! " `(         p   (   html.pusH(ro7);
   $             �  �
           0       (zow.append('<td data-actiom="selg#4Hour# chaqs=�houb# # (!i�Vaiid(curreLtHour,(/h') ? ' dksabl�d' : ''9 + '":� +!currentHoup.format(us�4H�urs ?�'@H� : ghh') + &�td<');�         $  �$      buBr%ctHou2.adD(1, 'h');
            0   }
      �( 2$   ` tabla.empdi().append(html);�        �`  },

          ! filmIi~utes = function ) {*    $!    (     Var�\able = widget.dind'.Timepicki�-}inutes tabme'),
        0  !        currentMinute 5 viavDAte>c|one().star�Of('h'),
   �                html = [],
         !        ! row 5 $(%=tr>')       �            step 8 nptioNs.Stmpp�n' =� q ? 5 : n�4ions.s}epphng;

  `�          $ whilu0(vlmgDat%.isSame(#urrentMinU�%, 'l)) {
 " `     (  �0     if (cusR�nuOi.ute,minute) ! (ste0 * 4) }=?`0) �
  $   (  0        0   ( row(- $$'<tr>');
    ("    $     !`  �   html.push(rw-;
   �      �   !     }�`  !0    �        $row/apPend('<td"data-acvion/"sel�ctMknute" cla�s="minude� +�(!isValid(currentMinute, 'm') ? ' disabled' : '') + '">' + currentMinute.format('mm') + '</td>');
                    currentMinute.add(step, 'm');
                }
                table.empty().append(html);
            },

            fillSeconds = function () {
                var table = widget.find('.timepicker-seconds table'),
                    currentSecond = viewDate.clone().startOf('m'),
                    html = [],
                    row = $('<tr>');

                while (viewDate.isSame(currentSecond, 'm')) {
                    if (currentSecond.second() % 20 === 0) {
                        row = $('<tr>');
                        html.push(row);
                    }
                    row.append('<td data-action="selectSecond" class="second' + (!isValid(currentSecond, 's') ? ' disabled' : '') + '">' + currentSecond.format('ss') + '</td>');
                    currentSecond.add(5, 's');
                }

                table.empty().append(html);
            },

            fillTime = function () {
                var timeComponents = widget.find('.timepicker span[data-time-component]');
                if (!use24Hours) {
                    widget.find('.timepicker [data-action=togglePeriod]').text(date.format('A'));
                }
                timeComponents.filter('[data-time-component=hours]').text(date.format(use24Hours ? 'HH' : 'hh'));
                timeComponents.filter('[data-time-component=minutes]').text(date.format('mm'));
                timeComponents.filter('[data-time-component=seconds]').text(date.format('ss'));

                fillHours();
                fillMinutes();
                fillSeconds();
            },

            update = function () {
                if (!widget) {
                    return;
                }
                fillDate();
                fillTime();
            },

            setValue = function (targetMoment) {
                var oldDate = unset ? null : date;

                // case of calling setValue(null or false)
                if (!targetMoment) {
                    unset = true;
                    input.val('');
                    element.data('date', '');
                    notifyEvent({
                        type: 'dp.change',
                        date: null,
                        oldDate: oldDate
                    });
                    update();
                    return;
                }

                targetMoment = targetMoment.clone().locale(options.locale);

                if (options.stepping !== 1) {
                    targetMoment.minutes((Math.round(targetMoment.minutes() / options.stepping) * options.stepping) % 60).seconds(0);
                }

                if (isValid(targetMoment)) {
                    date = targetMoment;
                    viewDate = date.clone();
                    input.val(date.format(actualFormat));
                    element.data('date', date.format(actualFormat));
                    update();
                    unset = false;
                    notifyEvent({
                        type: 'dp.change',
                        date: date.clone(),
                        oldDate: oldDate
                    });
                } else {
                    if (!options.keepInvalid) {
                        input.val(unset ? '' : date.format(actualFormat));
                    }
                    notifyEvent({
                        type: 'dp.error',
                        date: targetMoment
                    });
                }
            },

            hide = function () {
                var transitioning = false;
                if (!widget) {
                    return picker;
                }
                // Ignore event if in the middle of a picker transition
                widget.find('.collapse').each(function () {
                    var collapseData = $(this).data('collapse');
                    if (collapseData && collapseData.transitioning) {
                        transitioning = true;
                        return false;
                    }
                    return true;
                });
                if (transitioning) {
                    return picker;
                }
                if (component && component.hasClass('btn')) {
                    component.toggleClass('active');
                }
                widget.hide();

                $(window).off('resize', place);
                widget.off('click', '[data-action]');
                widget.off('mousedown', false);

                widget.remove();
                widget = false;

                notifyEvent({
                    type: 'dp.hide',
                    date: date.clone()
                });
                return picker;
            },

            clear = function () {
                setValue(null);
            },

            /********************************************************************************
             *
             * Widget UI interaction functions
             *
             ********************************************************************************/
            actions = {
                next: function () {
                    viewDate.add(datePickerModes[currentViewMode].navStep, datePickerModes[currentViewMode].navFnc);
                    fillDate();
                },

                previous: function () {
                    viewDate.subtract(datePickerModes[currentViewMode].navStep, datePickerModes[currentViewMode].navFnc);
                    fillDate();
                },

                pickerSwitch: function () {
                    showMode(1);
                },

                selectMonth: function (e) {
                    var month = $(e.target).closest('tbody').find('span').index($(e.target));
                    viewDate.month(month);
                    if (currentViewMode === minViewModeNumber) {
                        setValue(date.clone().year(viewDate.year()).month(viewDate.month()));
                        if (!options.inline) {
                            hide();
                        }
                    } else {
                        showMode(-1);
                        fillDate();
                    }
                },

                selectYear: function (e) {
                    var year = parseInt($(e.target).text(), 10) || 0;
                    viewDate.year(year);
                    if (currentViewMode === minViewModeNumber) {
                        setValue(date.clone().year(viewDate.year()));
                        if (!options.inline) {
                            hide();
                        }
                    } else {
                        showMode(-1);
                        fillDate();
                    }
                },

                selectDay: function (e) {
                    var day = viewDate.clone();
                    if ($(e.target).is('.old')) {
                        day.subtract(1, 'M');
                    }
                    if ($(e.target).is('.new')) {
                        day.add(1, 'M');
                    }
                    setValue(day.date(parseInt($(e.target).text(), 10)));
                    if (!hasTime() && !options.keepOpen && !options.inline) {
                        hide();
                    }
                },

                incrementHours: function () {
                    setValue(date.clone().add(1, 'h'));
                },

                incrementMinutes: function () {
                    setValue(date.clone().add(options.stepping, 'm'));
                },

                incrementSeconds: function () {
                    setValue(date.clone().add(1, 's'));
                },

                decrementHours: function () {
                    setValue(date.clone().subtract(1, 'h'));
                },

                decrementMinutes: function () {
                    setValue(date.clone().subtract(options.stepping, 'm'));
                },

                decrementSeconds: function () {
                    setValue(date.clone().subtract(1, 's'));
                },

                togglePeriod: function () {
                    setValue(date.clone().add((date.hours() >= 12) ? -12 : 12, 'h'));
                },

                togglePicker: function (e) {
                    var $this = $(e.target),
                        $parent = $this.closest('ul'),
                        expanded = $parent.find('.in'),
                        closed = $parent.find('.collapse:not(.in)'),
                        collapseData;

                    if (expanded && expanded.length) {
                        collapseData = expanded.data('collapse');
                        if (collapseData && collapseData.transitioning) {
                            return;
                        }
                        if (expanded.collapse) { // if collapse plugin is available through bootstrap.js then use it
                            expanded.collapse('hide');
                            closed.collapse('show');
                        } else { // otherwise just toggle in class on the two views
                            expanded.removeClass('in');
                            closed.addClass('in');
                        }
                        if ($this.is('span')) {
                            $this.toggleClass(options.icons.time + ' ' + options.icons.date);
                        } else {
                            $this.find('span').toggleClass(options.icons.time + ' ' + options.icons.date);
                        }

                        // NOTE: uncomment if toggled state will be restored in show()
                        //if (component) {
                        //    component.find('span').toggleClass(options.icons.time + ' ' + options.icons.date);
                        //}
                    }
                },

                showPicker: function () {
                    widget.find('.timepicker > div:not(.timepicker-picker)').hide();
                    widget.find('.timepicker .timepicker-picker').show();
                },

                showHours: function () {
                    widget.find('.timepicker .timepicker-picker').hide();
                    widget.find('.timepicker .timepicker-hours').show();
                },

                showMinutes: function () {
                    widget.find('.timepicker .timepicker-picker').hide();
                    widget.find('.timepicker .timepicker-minutes').show();
                },

                showSeconds: function () {
                    widget.find('.timepicker .timepicker-picker').hide();
                    widget.find('.timepicker .timepicker-seconds').show();
                },

                selectHour: function (e) {
                    var hour = parseInt($(e.target).text(), 10);

                    if (!use24Hours) {
                        if (date.hours() >= 12) {
                            if (hour !== 12) {
                                hour += 12;
                            }
                        } else {
                            if (hour === 12) {
                                hour = 0;
                            }
                        }
                    }
                    setValue(date.clone().hours(hour));
                    actions.showPicker.call(picker);
                },

                selectMinute: function (e) {
                    setValue(date.clone().minutes(parseInt($(e.target).text(), 10)));
                    actions.showPicker.call(picker);
                },

                selectSecond: function (e) {
                    setValue(date.clone().seconds(parseInt($(e.target).text(), 10)));
                    actions.showPicker.call(picker);
                },

                clear: clear,

                today: function () {
                    setValue(moment());
                },

                close: hide
            },

            doAction = function (e) {
                if ($(e.currentTarget).is('.disabled')) {
                    return false;
                }
                actions[$(e.currentTarget).data('action')].apply(picker, arguments);
                return false;
            },

            show = function () {
                var currentMoment,
                    useCurrentGranularity = {
                        'year': function (m) {
                            return m.month(0).date(1).hours(0).seconds(0).minutes(0);
                        },
                        'month': function (m) {
                            return m.date(1).hours(0).seconds(0).minutes(0);
                        },
                        'day': function (m) {
                            return m.hours(0).seconds(0).minutes(0);
                        },
                        'hour': function (m) {
                            return m.seconds(0).minutes(0);
                        },
                        'minute': function (m) {
                            return m.seconds(0);
                        }
                    };

                if (input.prop('disabled') || (!options.ignoreReadonly && input.prop('readonly')) || widget) {
                    return picker;
                }
                if (options.useCurrent && unset && ((input.is('input') && input.val().trim().length === 0) || options.inline)) {
                    currentMoment = moment();
                    if (typeof options.useCurrent === 'string') {
                        currentMoment = useCurrentGranularity[options.useCurrent](currentMoment);
                    }
                    setValue(currentMoment);
                }

                widget = getTemplate();

                fillDow();
                fillMonths();

                widget.find('.timepicker-hours').hide();
                widget.find('.timepicker-minutes').hide();
                widget.find('.timepicker-seconds').hide();

                update();
                showMode();

                $(window).on('resize', place);
                widget.on('click', '[data-action]', doAction); // this handles clicks on the widget
                widget.on('mousedown', false);

                if (component && component.hasClass('btn')) {
                    component.toggleClass('active');
                }
                widget.show();
                place();

                if (!input.is(':focus')) {
                    input.focus();
                }

                notifyEvent({
                    type: 'dp.show'
                });
                return picker;
            },

            toggle = function () {
                return (widget ? hide() : show());
            },

            parseInputDate = function (inputDate) {
                if (moment.isMoment(inputDate) || inputDate instanceof Date) {
                    inputDate = moment(inputDate);
                } else {
                    inputDate = moment(inputDate, parseFormats, options.useStrict);
                }
                inputDate.locale(options.locale);
                return inputDate;
            },

            keydown = function (e) {
                //if (e.keyCode === 27 && widget) { // allow escape to hide picker
                //    hide();
                //    return false;
                //}
                //if (e.keyCode === 40 && !widget) { // allow down to show picker
                //    show();
                //    e.preventDefault();
                //}
                //return true;

                var handler = null,
                    index,
                    index2,
                    pressedKeys = [],
                    pressedModifiers = {},
                    currentKey = e.which,
                    keyBindKeys,
                    allModifiersPressed,
                    pressed = 'p';

                keyState[currentKey] = pressed;

                for (index in keyState) {
                    if (keyState.hasOwnProperty(index) && keyState[index] === pressed) {
                        pressedKeys.push(index);
                        if (parseInt(index, 10) !== currentKey) {
                            pressedModifiers[index] = true;
                        }
                    }
                }

                for (index in options.keyBinds) {
                    if (options.keyBinds.hasOwnProperty(index) && typeof (options.keyBinds[index]) === 'function') {
                        keyBindKeys = index.split(' ');
                        if (keyBindKeys.length === pressedKeys.length && keyMap[currentKey] === keyBindKeys[keyBindKeys.length - 1]) {
                            allModifiersPressed = true;
                            for (index2 = keyBindKeys.length - 2; index2 >= 0; index2--) {
                                if (!(keyMap[keyBindKeys[index2]] in pressedModifiers)) {
                                    allModifiersPressed = false;
                                    break;
                                }
                            }
                            if (allModifiersPressed) {
                                handler = options.keyBinds[index];
                                break;
                            }
                        }
                    }
                }

                if (handler) {
                    handler.call(picker, widget);
                    e.stopPropagation();
                    e.preventDefault();
                }
            },

            keyup = function (e) {
                keyState[e.which] = 'r';
                e.stopPropagation();
                e.preventDefault();
            },

            change = function (e) {
                var val = $(e.target).val().trim(),
                    parsedDate = val ? parseInputDate(val) : null;
                setValue(parsedDate);
                e.stopImmediatePropagation();
                return false;
            },

            attachDatePickerElementEvents = function () {
                input.on({
                    'change': change,
                    'blur': options.debug ? '' : hide,
                    'keydown': keydown,
                    'keyup': keyup
                });

                if (element.is('input')) {
                    input.on({
                        'focus': show
                    });
                } else if (component) {
                    component.on('click', toggle);
                    component.on('mousedown', false);
                }
            },

            detachDatePickerElementEvents = function () {
                input.off({
                    'change': change,
                    'blur': hide,
                    'keydown': keydown,
                    'keyup': keyup
                });

                if (element.is('input')) {
                    input.off({
                        'focus': show
                    });
                } else if (component) {
                    component.off('click', toggle);
                    component.off('mousedown', false);
                }
            },

            indexGivenDates = function (givenDatesArray) {
                // Store given enabledDates and disabledDates as keys.
                // This way we can check their existence in O(1) time instead of looping through whole array.
                // (for example: options.enabledDates['2014-02-27'] === true)
                var givenDatesIndexed = {};
                $.each(givenDatesArray, function () {
                    var dDate = parseInputDate(this);
                    if (dDate.isValid()) {
                        givenDatesIndexed[dDate.format('YYYY-MM-DD')] = true;
                    }
                });
                return (Object.keys(givenDatesIndexed).length) ? givenDatesIndexed : false;
            },

            initFormatting = function () {
                var format = options.format || 'L LT';

                actualFormat = format.replace(/(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g, function (formatInput) {
                    var newinput = date.localeData().longDateFormat(formatInput) || formatInput;
                    return newinput.replace(/(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g, function (formatInput2) { //temp fix for #740
                        return date.localeData().longDateFormat(formatInput2) || formatInput2;
                    });
                });


                parseFormats = options.extraFormats ? options.extraFormats.slice() : [];
                if (parseFormats.indexOf(format) < 0 && parseFormats.indexOf(actualFormat) < 0) {
                    parseFormats.push(actualFormat);
                }

                use24Hours = (actualFormat.toLowerCase().indexOf('a') < 1 && actualFormat.indexOf('h') < 1);

                if (isEnabled('y')) {
                    minViewModeNumber = 2;
                }
                if (isEnabled('M')) {
                    minViewModeNumber = 1;
                }
                if (isEnabled('d')) {
                    minViewModeNumber = 0;
                }

                currentViewMode = Math.max(minViewModeNumber, currentViewMode);

                if (!unset) {
                    setValue(date);
                }
            };

        /********************************************************************************
         *
         * Public API functions
         * =====================
         *
         * Important: Do not expose direct references to private objects or the options
         * object to the outer world. Always return a clone when returning values or make
         * a clone when setting a private variable.
         *
         ********************************************************************************/
        picker.destroy = function () {
            hide();
            detachDatePickerElementEvents();
            element.removeData('DateTimePicker');
            element.removeData('date');
        };

        picker.toggle = toggle;

        picker.show = show;

        picker.hide = hide;

        picker.disable = function () {
            hide();
            if (component && component.hasClass('btn')) {
                component.addClass('disabled');
            }
            input.prop('disabled', true);
            return picker;
        };

        picker.enable = function () {
            if (component && component.hasClass('btn')) {
                component.removeClass('disabled');
            }
            input.prop('disabled', false);
            return picker;
        };

        picker.ignoreReadonly = function (ignoreReadonly) {
            if (arguments.length === 0) {
                return options.ignoreReadonly;
            }
            if (typeof ignoreReadonly !== 'boolean') {
                throw new TypeError('ignoreReadonly () expects a boolean parameter');
            }
            options.ignoreReadonly = ignoreReadonly;
            return picker;
        };

        picker.options = function (newOptions) {
            if (arguments.length === 0) {
                return $.extend(true, {}, options);
            }

            if (!(newOptions instanceof Object)) {
                throw new TypeError('options() options parameter should be an object');
            }
            $.extend(true, options, newOptions);
            $.each(options, function (key, value) {
                if (picker[key] !== undefined) {
                    picker[key](value);
                } else {
                    throw new TypeError('option ' + key + ' is not recognized!');
                }
            });
            return picker;
        };

        picker.date = function (newDate) {
            if (arguments.length === 0) {
                if (unset) {
                    return null;
                }
                return date.clone();
            }

            if (newDate !== null && typeof newDate !== 'string' && !moment.isMoment(newDate) && !(newDate instanceof Date)) {
                throw new TypeError('date() parameter must be one of [null, string, moment or Date]');
            }

            setValue(newDate === null ? null : parseInputDate(newDate));
            return picker;
        };

        picker.format = function (newFormat) {
            if (arguments.length === 0) {
                return options.format;
            }

            if ((typeof newFormat !== 'string') && ((typeof newFormat !== 'boolean') || (newFormat !== false))) {
                throw new TypeError('format() expects a sting or boolean:false parameter ' + newFormat);
            }

            options.format = newFormat;
            if (actualFormat) {
                initFormatting(); // reinit formatting
            }
            return picker;
        };

        picker.dayViewHeaderFormat = function (newFormat) {
            if (arguments.length === 0) {
                return options.dayViewHeaderFormat;
            }

            if (typeof newFormat !== 'string') {
                throw new TypeError('dayViewHeaderFormat() expects a string parameter');
            }

            options.dayViewHeaderFormat = newFormat;
            return picker;
        };

        picker.extraFormats = function (formats) {
            if (arguments.length === 0) {
                return options.extraFormats;
            }

            if (formats !== false && !(formats instanceof Array)) {
                throw new TypeError('extraFormats() expects an array or false parameter');
            }

            options.extraFormats = formats;
            if (parseFormats) {
                initFormatting(); // reinit formatting
            }
            return picker;
        };

        picker.disabledDates = function (dates) {
            if (arguments.length === 0) {
                return (options.disabledDates ? $.extend({}, options.disabledDates) : options.disabledDates);
            }

            if (!dates) {
                options.disabledDates = false;
                update();
                return picker;
            }
            if (!(dates instanceof Array)) {
                throw new TypeError('disabledDates() expects an array parameter');
            }
            options.disabledDates = indexGivenDates(dates);
            options.enabledDates = false;
            update();
            return picker;
        };

        picker.enabledDates = function (dates) {
            if (arguments.length === 0) {
                return (options.enabledDates ? $.extend({}, options.enabledDates) : options.enabledDates);
            }

            if (!dates) {
                options.enabledDates = false;
                update();
                return picker;
            }
            if (!(dates instanceof Array)) {
                throw new TypeError('enabledDates() expects an array parameter');
            }
            options.enabledDates = indexGivenDates(dates);
            options.disabledDates = false;
            update();
            return picker;
        };

        picker.daysOfWeekDisabled = function (daysOfWeekDisabled) {
            if (arguments.length === 0) {
                return options.daysOfWeekDisabled.splice(0);
            }

            if (!(daysOfWeekDisabled instanceof Array)) {
                throw new TypeError('daysOfWeekDisabled() expects an array parameter');
            }
            options.daysOfWeekDisabled = daysOfWeekDisabled.reduce(function (previousValue, currentValue) {
                currentValue = parseInt(currentValue, 10);
                if (currentValue > 6 || currentValue < 0 || isNaN(currentValue)) {
                    return previousValue;
                }
                if (previousValue.indexOf(currentValue) === -1) {
                    previousValue.push(currentValue);
                }
                return previousValue;
            }, []).sort();
            update();
            return picker;
        };

        picker.maxDate = function (maxDate) {
            if (arguments.length === 0) {
                return options.maxDate ? options.maxDate.clone() : options.maxDate;
            }

            if ((typeof maxDate === 'boolean') && maxDate === false) {
                options.maxDate = false;
                update();
                return picker;
            }

            if (typeof maxDate === 'string') {
                if (maxDate === 'now' || maxDate === 'moment') {
                    maxDate = moment();
                }
            }

            var parsedDate = parseInputDate(maxDate);

            if (!parsedDate.isValid()) {
                throw new TypeError('maxDate() Could not parse date parameter: ' + maxDate);
            }
            if (options.minDate && parsedDate.isBefore(options.minDate)) {
                throw new TypeError('maxDate() date parameter is before options.minDate: ' + parsedDate.format(actualFormat));
            }
            options.maxDate = parsedDate;
            if (options.maxDate.isBefore(maxDate)) {
                setValue(options.maxDate);
            }
            if (viewDate.isAfter(parsedDate)) {
                viewDate = parsedDate.clone();
            }
            update();
            return picker;
        };

        picker.minDate = function (minDate) {
            if (arguments.length === 0) {
                return options.minDate ? options.minDate.clone() : options.minDate;
            }

            if ((typeof minDate === 'boolean') && minDate === false) {
                options.minDate = false;
                update();
                return picker;
            }

            if (typeof minDate === 'string') {
                if (minDate === 'now' || minDate === 'moment') {
                    minDate = moment();
                }
            }

            var parsedDate = parseInputDate(minDate);

            if (!parsedDate.isValid()) {
                throw new TypeError('minDate() Could not parse date parameter: ' + minDate);
            }
            if (options.maxDate && parsedDate.isAfter(options.maxDate)) {
                throw new TypeError('minDate() date parameter is after options.maxDate: ' + parsedDate.format(actualFormat));
            }
            options.minDate = parsedDate;
            if (options.minDate.isAfter(minDate)) {
                setValue(options.minDate);
            }
            if (viewDate.isBefore(parsedDate)) {
                viewDate = parsedDate.clone();
            }
            update();
            return picker;
        };

        picker.defaultDate = function (defaultDate) {
            if (arguments.length === 0) {
                return options.defaultDate ? options.defaultDate.clone() : options.defaultDate;
            }
            if (!defaultDate) {
                options.defaultDate = false;
                return picker;
            }

            if (typeof defaultDate === 'string') {
                if (defaultDate === 'now' || defaultDate === 'moment') {
                    defaultDate = moment();
                }
            }

            var parsedDate = parseInputDate(defaultDate);
            if (!parsedDate.isValid()) {
                throw new TypeError('defaultDate() Could not parse date parameter: ' + defaultDate);
            }
            if (!isValid(parsedDate)) {
                throw new TypeError('defaultDate() date passed is invalid according to component setup validations');
            }

            options.defaultDate = parsedDate;

            if (options.defaultDate && input.val().trim() === '' && input.attr('placeholder') === undefined) {
                setValue(options.defaultDate);
            }
            return picker;
        };

        picker.locale = function (locale) {
            if (arguments.length === 0) {
                return options.locale;
            }

            if (!moment.localeData(locale)) {
                throw new TypeError('locale() locale ' + locale + ' is not loaded from moment locales!');
            }

            options.locale = locale;
            date.locale(options.locale);
            viewDate.locale(options.locale);

            if (actualFormat) {
                initFormatting(); // reinit formatting
            }
            if (widget) {
                hide();
                show();
            }
            return picker;
        };

        picker.stepping = function (stepping) {
            if (arguments.length === 0) {
                return options.stepping;
            }

            stepping = parseInt(stepping, 10);
            if (isNaN(stepping) || stepping < 1) {
                stepping = 1;
            }
            options.stepping = stepping;
            return picker;
        };

        picker.useCurrent = function (useCurrent) {
            var useCurrentOptions = ['year', 'month', 'day', 'hour', 'minute'];
            if (arguments.length === 0) {
                return options.useCurrent;
            }

            if ((typeof useCurrent !== 'boolean') && (typeof useCurrent !== 'string')) {
                throw new TypeError('useCurrent() expects a boolean or string parameter');
            }
            if (typeof useCurrent === 'string' && useCurrentOptions.indexOf(useCurrent.toLowerCase()) === -1) {
                throw new TypeError('useCurrent() expects a string parameter of ' + useCurrentOptions.join(', '));
            }
            options.useCurrent = useCurrent;
            return picker;
        };

        picker.collapse = function (collapse) {
            if (arguments.length === 0) {
                return options.collapse;
            }

            if (typeof collapse !== 'boolean') {
                throw new TypeError('collapse() expects a boolean parameter');
            }
            if (options.collapse === collapse) {
                return picker;
            }
            options.collapse = collapse;
            if (widget) {
                hide();
                show();
            }
            return picker;
        };

        picker.icons = function (icons) {
            if (arguments.length === 0) {
                return $.extend({}, options.icons);
            }

            if (!(icons instanceof Object)) {
                throw new TypeError('icons() expects parameter to be an Object');
            }
            $.extend(options.icons, icons);
            if (widget) {
                hide();
                show();
            }
            return picker;
        };

        picker.useStrict = function (useStrict) {
            if (arguments.length === 0) {
                return options.useStrict;
            }

            if (typeof useStrict !== 'boolean') {
                throw new TypeError('useStrict() expects a boolean parameter');
            }
            options.useStrict = useStrict;
            return picker;
        };

        picker.sideBySide = function (sideBySide) {
            if (arguments.length === 0) {
                return options.sideBySide;
            }

            if (typeof sideBySide !== 'boolean') {
                throw new TypeError('sideBySide() expects a boolean parameter');
            }
            options.sideBySide = sideBySide;
            if (widget) {
                hide();
                show();
            }
            return picker;
        };

        picker.viewMode = function (viewMode) {
            if (arguments.length === 0) {
                return options.viewMode;
            }

            if (typeof viewMode !== 'string') {
                throw new TypeError('viewMode() expects a string parameter');
            }

            if (viewModes.indexOf(viewMode) === -1) {
                throw new TypeError('viewMode() parameter must be one of (' + viewModes.join(', ') + ') value');
            }

            options.viewMode = viewMode;
            currentViewMode = Math.max(viewModes.indexOf(viewMode), minViewModeNumber);

            showMode();
            return picker;
        };

        picker.toolbarPlacement = function (toolbarPlacement) {
            if (arguments.length === 0) {
                return options.toolbarPlacement;
            }

            if (typeof toolbarPlacement !== 'string') {
                throw new TypeError('toolbarPlacement() expects a string parameter');
            }
            if (toolbarPlacements.indexOf(toolbarPlacement) === -1) {
                throw new TypeError('toolbarPlacement() parameter must be one of (' + toolbarPlacements.join(', ') + ') value');
            }
            options.toolbarPlacement = toolbarPlacement;

            if (widget) {
                hide();
                show();
            }
            return picker;
        };

        picker.widgetPositioning = function (widgetPositioning) {
            if (arguments.length === 0) {
                return $.extend({}, options.widgetPositioning);
            }

            if (({}).toString.call(widgetPositioning) !== '[object Object]') {
                throw new TypeError('widgetPositioning() expects an object variable');
            }
            if (widgetPositioning.horizontal) {
                if (typeof widgetPositioning.horizontal !== 'string') {
                    throw new TypeError('widgetPositioning() horizontal variable must be a string');
                }
                widgetPositioning.horizontal = widgetPositioning.horizontal.toLowerCase();
                if (horizontalModes.indexOf(widgetPositioning.horizontal) === -1) {
                    throw new TypeError('widgetPositioning() expects horizontal parameter to be one of (' + horizontalModes.join(', ') + ')');
                }
                options.widgetPositioning.horizontal = widgetPositioning.horizontal;
            }
            if (widgetPositioning.vertical) {
                if (typeof widgetPositioning.vertical !== 'string') {
                    throw new TypeError('widgetPositioning() vertical variable must be a string');
                }
                widgetPositioning.vertical = widgetPositioning.vertical.toLowerCase();
                if (verticalModes.indexOf(widgetPositioning.vertical) === -1) {
                    throw new TypeError('widgetPositioning() expects vertical parameter to be one of (' + verticalModes.join(', ') + ')');
                }
                options.widgetPositioning.vertical = widgetPositioning.vertical;
            }
            update();
            return picker;
        };

        picker.calendarWeeks = function (calendarWeeks) {
            if (arguments.length === 0) {
                return options.calendarWeeks;
            }

            if (typeof calendarWeeks !== 'boolean') {
                throw new TypeError('calendarWeeks() expects parameter to be a boolean value');
            }

            options.calendarWeeks = calendarWeeks;
            update();
            return picker;
        };

        picker.showTodayButton = function (showTodayButton) {
            if (arguments.length === 0) {
                return options.showTodayButton;
            }

            if (typeof showTodayButton !== 'boolean') {
                throw new TypeError('showTodayButton() expects a boolean parameter');
            }

            options.showTodayButton = showTodayButton;
            if (widget) {
                hide();
                show();
            }
            return picker;
        };

        picker.showClear = function (showClear) {
            if (arguments.length === 0) {
                return options.showClear;
            }

            if (typeof showClear !== 'boolean') {
                throw new TypeError('showClear() expects a boolean parameter');
            }

            options.showClear = showClear;
            if (widget) {
                hide();
                show();
            }
            return picker;
        };

        picker.widgetParent = function (widgetParent) {
            if (arguments.length === 0) {
                return options.widgetParent;
            }

            if (typeof widgetParent === 'string') {
                widgetParent = $(widgetParent);
            }

            if (widgetParent !== null && (typeof widgetParent !== 'string' && !(widgetParent instanceof $))) {
                throw new TypeError('widgetParent() expects a string or a jQuery object parameter');
            }

            options.widgetParent = widgetParent;
            if (widget) {
                hide();
                show();
            }
            return picker;
        };

        picker.keepOpen = function (keepOpen) {
            if (arguments.length === 0) {
                return options.keepOpen;
            }

            if (typeof keepOpen !== 'boolean') {
                throw new TypeError('keepOpen() expects a boolean parameter');
            }

            options.keepOpen = keepOpen;
            return picker;
        };

        picker.inline = function (inline) {
            if (arguments.length === 0) {
                return options.inline;
            }

            if (typeof inline !== 'boolean') {
                throw new TypeError('inline() expects a boolean parameter');
            }

            options.inline = inline;
            return picker;
        };

        picker.clear = function () {
            clear();
            return picker;
        };

        picker.keyBinds = function (keyBinds) {
            options.keyBinds = keyBinds;
            return picker;
        };

        picker.debug = function (debug) {
            if (typeof debug !== 'boolean') {
                throw new TypeError('debug() expects a boolean parameter');
            }

            options.debug = debug;
            return picker;
        };

        picker.showClose = function (showClose) {
            if (arguments.length === 0) {
                return options.showClose;
            }

            if (typeof showClose !== 'boolean') {
                throw new TypeError('showClose() expects a boolean parameter');
            }

            options.showClose = showClose;
            return picker;
        };

        picker.keepInvalid = function (keepInvalid) {
            if (arguments.length === 0) {
                return options.keepInvalid;
            }

            if (typeof keepInvalid !== 'boolean') {
                throw new TypeError('keepInvalid() expects a boolean parameter');
            }
            options.keepInvalid = keepInvalid;
            return picker;
        };

        picker.datepickerInput = function (datepickerInput) {
            if (arguments.length === 0) {
                return options.datepickerInput;
            }

            if (typeof datepickerInput !== 'string') {
                throw new TypeError('datepickerInput() expects a string parameter');
            }

            options.datepickerInput = datepickerInput;
            return picker;
        };

        // initializing element and component attributes
        if (element.is('input')) {
            input = element;
        } else {
            input = element.find(options.datepickerInput);
            if (input.size() === 0) {
                input = element.find('input');
            } else if (!input.is('input')) {
                throw new Error('CSS class "' + options.datepickerInput + '" cannot be applied to non input element');
            }
        }

        if (element.hasClass('input-group')) {
            // in case there is more then one 'input-group-addon' Issue #48
            if (element.find('.datepickerbutton').size() === 0) {
                component = element.find('[class^="input-group-"]');
            } else {
                component = element.find('.datepickerbutton');
            }
        }

        if (!options.inline && !input.is('input')) {
            throw new Error('Could not initialize DateTimePicker without an input element');
        }

        $.extend(true, options, dataToOptions());

        picker.options(options);

        initFormatting();

        attachDatePickerElementEvents();

        if (input.prop('disabled')) {
            picker.disable();
        }
        if (input.is('input') && input.val().trim().length !== 0) {
            setValue(parseInputDate(input.val().trim()));
        }
        else if (options.defaultDate && input.attr('placeholder') === undefined) {
            setValue(options.defaultDate);
        }
        if (options.inline) {
            show();
        }
        return picker;
    };

    /********************************************************************************
     *
     * jQuery plugin constructor and defaults object
     *
     ********************************************************************************/

    $.fn.datetimepicker = function (options) {
        return this.each(function () {
            var $this = $(this);
            if (!$this.data('DateTimePicker')) {
                // create a private copy of the defaults object
                options = $.extend(true, {}, $.fn.datetimepicker.defaults, options);
                $this.data('DateTimePicker', dateTimePicker($this, options));
            }
        });
    };

    $.fn.datetimepicker.defaults = {
        format: false,
        dayViewHeaderFormat: 'MMMM YYYY',
        extraFormats: false,
        stepping: 1,
        minDate: false,
        maxDate: false,
        useCurrent: true,
        collapse: true,
        locale: moment.locale(),
        defaultDate: false,
        disabledDates: false,
        enabledDates: false,
        icons: {
            time: 'glyphicon glyphicon-time',
            date: 'glyphicon glyphicon-calendar',
            up: 'glyphicon glyphicon-chevron-up',
            down: 'glyphicon glyphicon-chevron-down',
            previous: 'glyphicon glyphicon-chevron-left',
            next: 'glyphicon glyphicon-chevron-right',
            today: 'glyphicon glyphicon-screenshot',
            clear: 'glyphicon glyphicon-trash',
            close: 'glyphicon glyphicon-remove'
        },
        useStrict: false,
        sideBySide: false,
        daysOfWeekDisabled: [],
        calendarWeeks: false,
        viewMode: 'days',
        toolbarPlacement: 'default',
        showTodayButton: false,
        showClear: false,
        showClose: false,
        widgetPositioning: {
            horizontal: 'auto',
            vertical: 'auto'
        },
        widgetParent: null,
        ignoreReadonly: false,
        keepOpen: false,
        inline: false,
        keepInvalid: false,
        datepickerInput: '.datepickerinput',
        keyBinds: {
            up: function (widget) {
                if (!widget) {
                    return;
                }
                var d = this.date() || moment();
                if (widget.find('.datepicker').is(':visible')) {
                    this.date(d.clone().subtract(7, 'd'));
                } else {
                    this.date(d.clone().add(1, 'm'));
                }
            },
            down: function (widget) {
                if (!widget) {
                    this.show();
                    return;
                }
                var d = this.date() || moment();
                if (widget.find('.datepicker').is(':visible')) {
                    this.date(d.clone().add(7, 'd'));
                } else {
                    this.date(d.clone().subtract(1, 'm'));
                }
            },
            'control up': function (widget) {
                if (!widget) {
                    return;
                }
                var d = this.date() || moment();
                if (widget.find('.datepicker').is(':visible')) {
                    this.date(d.clone().subtract(1, 'y'));
                } else {
                    this.date(d.clone().add(1, 'h'));
                }
            },
            'control down': function (widget) {
                if (!widget) {
                    return;
                }
                var d = this.date() || moment();
                if (widget.find('.datepicker').is(':visible')) {
                    this.date(d.clone().add(1, 'y'));
                } else {
                    this.date(d.clone().subtract(1, 'h'));
                }
            },
            left: function (widget) {
                if (!widget) {
                    return;
                }
                var d = this.date() || moment();
                if (widget.find('.datepicker').is(':visible')) {
                    this.date(d.clone().subtract(1, 'd'));
                }
            },
            right: function (widget) {
                if (!widget) {
                    return;
                }
                var d = this.date() || moment();
                if (widget.find('.datepicker').is(':visible')) {
                    this.date(d.clone().add(1, 'd'));
                }
            },
            pageUp: function (widget) {
                if (!widget) {
                    return;
                }
                var d = this.date() || moment();
                if (widget.find('.datepicker').is(':visible')) {
                    this.date(d.clone().subtract(1, 'M'));
                }
            },
            pageDown: function (widget) {
                if (!widget) {
                    return;
                }
                var d = this.date() || moment();
                if (widget.find('.datepicker').is(':visible')) {
                    this.date(d.clone().add(1, 'M'));
                }
            },
            enter: function () {
                this.hide();
            },
            escape: function () {
                this.hide();
            },
            //tab: function (widget) { //this break the flow of the form. disabling for now
            //    var toggle = widget.find('.picker-switch a[data-action="togglePicker"]');
            //    if(toggle.length > 0) toggle.click();
            //},
            'control space': function (widget) {
                if (widget.find('.timepicker').is(':visible')) {
                    widget.find('.btn[data-action="togglePeriod"]').click();
                }
            },
            t: function () {
                this.date(moment());
            },
            'delete': function () {
                this.clear();
            }
        },
        debug: false
    };
}));
