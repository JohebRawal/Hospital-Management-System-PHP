/*! DataTables 1.10.5
 * ©2008-2014 SpryMedia Ltd - datatables.net/license
 */

/**
 * @summary     DataTables
 * @description Paginate, search and order HTML tables
 * @version     1.10.5
 * @file        jquery.dataTables.js
 * @author      SpryMedia Ltd (www.sprymedia.co.uk)
 * @contact     www.sprymedia.co.uk/contact
 * @copyright   Copyright 2008-2014 SpryMedia Ltd.
 *
 * This source file is free software, available under the following license:
 *   MIT license - http://datatables.net/license
 *
 * This source file is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE. See the license files for details.
 *
 * For details please refer to: http://www.datatables.net
 */

/*jslint evil: true, undef: true, browser: true */
/*globals $,require,jQuery,define,_selector_run,_selector_opts,_selector_first,_selector_row_indexes,_ext,_Api,_api_register,_api_registerPlural,_re_new_lines,_re_html,_re_formatted_numeric,_re_escape_regex,_empty,_intVal,_numToDecimal,_isNumber,_isHtml,_htmlNumeric,_pluck,_pluck_order,_range,_stripHtml,_unique,_fnBuildAjax,_fnAjaxUpdate,_fnAjaxParameters,_fnAjaxUpdateDraw,_fnAjaxDataSrc,_fnAddColumn,_fnColumnOptions,_fnAdjustColumnSizing,_fnVisibleToColumnIndex,_fnColumnIndexToVisible,_fnVisbleColumns,_fnGetColumns,_fnColumnTypes,_fnApplyColumnDefs,_fnHungarianMap,_fnCamelToHungarian,_fnLanguageCompat,_fnBrowserDetect,_fnAddData,_fnAddTr,_fnNodeToDataIndex,_fnNodeToColumnIndex,_fnGetCellData,_fnSetCellData,_fnSplitObjNotation,_fnGetObjectDataFn,_fnSetObjectDataFn,_fnGetDataMaster,_fnClearTable,_fnDeleteIndex,_fnInvalidate,_fnGetRowElements,_fnCreateTr,_fnBuildHead,_fnDrawHead,_fnDraw,_fnReDraw,_fnAddOptionsHtml,_fnDetectHeader,_fnGetUniqueThs,_fnFeatureHtmlFilter,_fnFilterComplete,_fnFilterCustom,_fnFilterColumn,_fnFilter,_fnFilterCreateSearch,_fnEscapeRegex,_fnFilterData,_fnFeatureHtmlInfo,_fnUpdateInfo,_fnInfoMacros,_fnInitialise,_fnInitComplete,_fnLengthChange,_fnFeatureHtmlLength,_fnFeatureHtmlPaginate,_fnPageChange,_fnFeatureHtmlProcessing,_fnProcessingDisplay,_fnFeatureHtmlTable,_fnScrollDraw,_fnApplyToChildren,_fnCalculateColumnWidths,_fnThrottle,_fnConvertToWidth,_fnScrollingWidthAdjust,_fnGetWidestNode,_fnGetMaxLenString,_fnStringToCss,_fnScrollBarWidth,_fnSortFlatten,_fnSort,_fnSortAria,_fnSortListener,_fnSortAttachListener,_fnSortingClasses,_fnSortData,_fnSaveState,_fnLoadState,_fnSettingsFromNode,_fnLog,_fnMap,_fnBindAction,_fnCallbackReg,_fnCallbackFire,_fnLengthOverflow,_fnRenderer,_fnDataSource,_fnRowAttributes*/

(/** @lends <global> */function( window, document, undefined ) {

(function( factory ) {
	"use strict";

	if ( typeof define === 'function' && define.amd ) {
		// Define as an AMD module if possible
		define( 'datatables', ['jquery'], factory );
	}
    else if ( typeof exports === 'object' ) {
        // Node/CommonJS
        module.exports = factory( require( 'jquery' ) );
    }
	else if ( jQuery && !jQuery.fn.dataTable ) {
		// Define using browser globals otherwise
		// Prevent multiple instantiations if the script is loaded twice
		factory( jQuery );
	}
}
(/** @lends <global> */function( $ ) {
	"use strict";

	/**
	 * DataTables is a plug-in for the jQuery Javascript library. It is a highly
	 * flexible tool, based upon the foundations of progressive enhancement,
	 * which will add advanced interaction controls to any HTML table. For a
	 * full list of features please refer to
	 * [DataTables.net](href="http://datatables.net).
	 *
	 * Note that the `DataTable` object is not a global variable but is aliased
	 * to `jQuery.fn.DataTable` and `jQuery.fn.dataTable` through which it may
	 * be  accessed.
	 *
	 *  @class
	 *  @param {object} [init={}] Configuration object for DataTables. Options
	 *    are defined by {@link DataTable.defaults}
	 *  @requires jQuery 1.7+
	 *
	 *  @example
	 *    // Basic initialisation
	 *    $(document).ready( function {
	 *      $('#example').dataTable();
	 *    } );
	 *
	 *  @example
	 *    // Initialisation with configuration options - in this case, disable
	 *    // pagination and sorting.
	 *    $(document).ready( function {
	 *      $('#example').dataTable( {
	 *        "paginate": false,
	 *        "sort": false
	 *      } );
	 *    } );
	 */
	var DataTable;

	
	/*
	 * It is useful to have variables which are scoped locally so only the
	 * DataTables functions can access them and they don't leak into global space.
	 * At the same time these functions are often useful over multiple files in the
	 * core and API, so we list, or at least document, all variables which are used
	 * by DataTables as private variables here. This also ensures that there is no
	 * clashing of variable names and that they can easily referenced for reuse.
	 */
	
	
	// Defined else where
	//  _selector_run
	//  _selector_opts
	//  _selector_first
	//  _selector_row_indexes
	
	var _ext; // DataTable.ext
	var _Api; // DataTable.Api
	var _api_register; // DataTable.Api.register
	var _api_registerPlural; // DataTable.Api.registerPlural
	
	var _re_dic = {};
	var _re_new_lines = /[\r\n]/g;
	var _re_html = /<.*?>/g;
	var _re_date_start = /^[\w\+\-]/;
	var _re_date_end = /[\w\+\-]$/;
	
	// Escape regular expression special characters
	var _re_escape_regex = new RegExp( '(\\' + [ '/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\', '$', '^', '-' ].join('|\\') + ')', 'g' );
	
	// U+2009 is thin space and U+202F is narrow no-break space, both used in many
	// standards as thousands separators
	var _re_formatted_numeric = /[',$£€¥%\u2009\u202F]/g;
	
	
	var _empty = function ( d ) {
		return !d || d === true || d === '-' ? true : false;
	};
	
	
	var _intVal = function ( s ) {
		var integer = parseInt( s, 10 );
		return !isNaN(integer) && isFinite(s) ? integer : null;
	};
	
	// Convert from a formatted number with characters other than `.` as the
	// decimal place, to a Javascript number
	var _numToDecimal = function ( num, decimalPoint ) {
		// Cache created regular expressions for speed as this function is called often
		if ( ! _re_dic[ decimalPoint ] ) {
			_re_dic[ decimalPoint ] = new RegExp( _fnEscapeRegex( decimalPoint ), 'g' );
		}
		return typeof num === 'string' && decimalPoint !== '.' ?
			num.replace( /\./g, '' ).replace( _re_dic[ decimalPoint ], '.' ) :
			num;
	};
	
	
	var _isNumber = function ( d, decimalPoint, formatted ) {
		var strType = typeof d === 'string';
	
		if ( decimalPoint && strType ) {
			d = _numToDecimal( d, decimalPoint );
		}
	
		if ( formatted && strType ) {
			d = d.replace( _re_formatted_numeric, '' );
		}
	
		return _empty( d ) || (!isNaN( parseFloat(d) ) && isFinite( d ));
	};
	
	
	// A string without HTML in it can be considered to be HTML still
	var _isHtml = function ( d ) {
		return _empty( d ) || typeof d === 'string';
	};
	
	
	var _htmlNumeric = function ( d, decimalPoint, formatted ) {
		if ( _empty( d ) ) {
			return true;
		}
	
		var html = _isHtml( d );
		return ! html ?
			null :
			_isNumber( _stripHtml( d ), decimalPoint, formatted ) ?
				true :
				null;
	};
	
	
	var _pluck = function ( a, prop, prop2 ) {
		var out = [];
		var i=0, ien=a.length;
	
		// Could have the test in the loop for slightly smaller code, but speed
		// is essential here
		if ( prop2 !== undefined ) {
			for ( ; i<ien ; i++ ) {
				if ( a[i] && a[i][ prop ] ) {
					out.push( a[i][ prop ][ prop2 ] );
				}
			}
		}
		else {
			for ( ; i<ien ; i++ ) {
				if ( a[i] ) {
					out.push( a[i][ prop ] );
				}
			}
		}
	
		return out;
	};
	
	
	// Basically the same as _pluck, but rather than looping over `a` we use `order`
	// as the indexes to pick from `a`
	var _pluck_order = function ( a, order, prop, prop2 )
	{
		var out = [];
		var i=0, ien=order.length;
	
		// Could have the test in the loop for slightly smaller code, but speed
		// is essential here
		if ( prop2 !== undefined ) {
			for ( ; i<ien ; i++ ) {
				if ( a[ order[i] ][ prop ] ) {
					out.push( a[ order[i] ][ prop ][ prop2 ] );
				}
			}
		}
		else {
			for ( ; i<ien ; i++ ) {
				out.push( a[ order[i] ][ prop ] );
			}
		}
	
		return out;
	};
	
	
	var _range = function ( len, start )
	{
		var out = [];
		var end;
	
		if ( start === undefined ) {
			start = 0;
			end = len;
		}
		else {
			end = start;
			start = len;
		}
	
		for ( var i=start ; i<end ; i++ ) {
			out.push( i );
		}
	
		return out;
	};
	
	
	var _removeEmpty = function ( a )
	{
		var out = [];
	
		for ( var i=0, ien=a.length ; i<ien ; i++ ) {
			if ( a[i] ) { // careful - will remove all falsy values!
				out.push( a[i] );
			}
		}
	
		return out;
	};
	
	
	var _stripHtml = function ( d ) {
		return d.replace( _re_html, '' );
	};
	
	
	/**
	 * Find the unique elements in a source array.
	 *
	 * @param  {array} src Source array
	 * @return {array} Array of unique items
	 * @ignore
	 */
	var _unique = function ( src )
	{
		// A faster unique method is to use object keys to identify used values,
		// but this doesn't work with arrays or objects, which we must also
		// consider. See jsperf.com/compare-array-unique-versions/4 for more
		// information.
		var
			out = [],
			val,
			i, ien=src.length,
			j, k=0;
	
		again: for ( i=0 ; i<ien ; i++ ) {
			val = src[i];
	
			for ( j=0 ; j<k ; j++ ) {
				if ( out[j] === val ) {
					continue again;
				}
			}
	
			out.push( val );
			k++;
		}
	
		return out;
	};
	
	
	
	/**
	 * Create a mapping object that allows camel case parameters to be looked up
	 * for their Hungarian counterparts. The mapping is stored in a private
	 * parameter called `_hungarianMap` which can be accessed on the source object.
	 *  @param {object} o
	 *  @memberof DataTable#oApi
	 */
	function _fnHungarianMap ( o )
	{
		var
			hungarian = 'a aa ai ao as b fn i m o s ',
			match,
			newKey,
			map = {};
	
		$.each( o, function (key, val) {
			match = key.match(/^([^A-Z]+?)([A-Z])/);
	
			if ( match && hungarian.indexOf(match[1]+' ') !== -1 )
			{
				newKey = key.replace( match[0], match[2].toLowerCase() );
				map[ newKey ] = key;
	
				if ( match[1] === 'o' )
				{
					_fnHungarianMap( o[key] );
				}
			}
		} );
	
		o._hungarianMap = map;
	}
	
	
	/**
	 * Convert from camel case parameters to Hungarian, based on a Hungarian map
	 * created by _fnHungarianMap.
	 *  @param {object} src The model object which holds all parameters that can be
	 *    mapped.
	 *  @param {object} user The object to convert from camel case to Hungarian.
	 *  @param {boolean} force When set to `true`, properties which already have a
	 *    Hungarian value in the `user` object will be overwritten. Otherwise they
	 *    won't be.
	 *  @memberof DataTable#oApi
	 */
	function _fnCamelToHungarian ( src, user, force )
	{
		if ( ! src._hungarianMap ) {
			_fnHungarianMap( src );
		}
	
		var hungarianKey;
	
		$.each( user, function (key, val) {
			hungarianKey = src._hungarianMap[ key ];
	
			if ( hungarianKey !== undefined && (force || user[hungarianKey] === undefined) )
			{
				// For objects, we need to buzz down into the object to copy parameters
				if ( hungarianKey.charAt(0) === 'o' )
				{
					// Copy the camelCase options over to the hungarian
					if ( ! user[ hungarianKey ] ) {
						user[ hungarianKey ] = {};
					}
					$.extend( true, user[hungarianKey], user[key] );
	
					_fnCamelToHungarian( src[hungarianKey], user[hungarianKey], force );
				}
				else {
					user[hungarianKey] = user[ key ];
				}
			}
		} );
	}
	
	
	/**
	 * Language compatibility - when certain options are given, and others aren't, we
	 * need to duplicate the values over, in order to provide backwards compatibility
	 * with older language files.
	 *  @param {object} oSettings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnLanguageCompat( lang )
	{
		var defaults = DataTable.defaults.oLanguage;
		var zeroRecords = lang.sZeroRecords;
	
		/* Backwards compatibility - if there is no sEmptyTable given, then use the same as
		 * sZeroRecords - assuming that is given.
		 */
		if ( ! lang.sEmptyTable && zeroRecords &&
			defaults.sEmptyTable === "No data available in table" )
		{
			_fnMap( lang, lang, 'sZeroRecords', 'sEmptyTable' );
		}
	
		/* Likewise with loading records */
		if ( ! lang.sLoadingRecords && zeroRecords &&
			defaults.sLoadingRecords === "Loading..." )
		{
			_fnMap( lang, lang, 'sZeroRecords', 'sLoadingRecords' );
		}
	
		// Old parameter name of the thousands separator mapped onto the new
		if ( lang.sInfoThousands ) {
			lang.sThousands = lang.sInfoThousands;
		}
	
		var decimal = lang.sDecimal;
		if ( decimal ) {
			_addNumericSort( decimal );
		}
	}
	
	
	/**
	 * Map one parameter onto another
	 *  @param {object} o Object to map
	 *  @param {*} knew The new parameter name
	 *  @param {*} old The old parameter name
	 */
	var _fnCompatMap = function ( o, knew, old ) {
		if ( o[ knew ] !== undefined ) {
			o[ old ] = o[ knew ];
		}
	};
	
	
	/**
	 * Provide backwards compatibility for the main DT options. Note that the new
	 * options are mapped onto the old parameters, so this is an external interface
	 * change only.
	 *  @param {object} init Object to map
	 */
	function _fnCompatOpts ( init )
	{
		_fnCompatMap( init, 'ordering',      'bSort' );
		_fnCompatMap( init, 'orderMulti',    'bSortMulti' );
		_fnCompatMap( init, 'orderClasses',  'bSortClasses' );
		_fnCompatMap( init, 'orderCellsTop', 'bSortCellsTop' );
		_fnCompatMap( init, 'order',         'aaSorting' );
		_fnCompatMap( init, 'orderFixed',    'aaSortingFixed' );
		_fnCompatMap( init, 'paging',        'bPaginate' );
		_fnCompatMap( init, 'pagingType',    'sPaginationType' );
		_fnCompatMap( init, 'pageLength',    'iDisplayLength' );
		_fnCompatMap( init, 'searching',     'bFilter' );
	
		// Column search objects are in an array, so it needs to be converted
		// element by element
		var searchCols = init.aoSearchCols;
	
		if ( searchCols ) {
			for ( var i=0, ien=searchCols.length ; i<ien ; i++ ) {
				if ( searchCols[i] ) {
					_fnCamelToHungarian( DataTable.models.oSearch, searchCols[i] );
				}
			}
		}
	}
	
	
	/**
	 * Provide backwards compatibility for column options. Note that the new options
	 * are mapped onto the old parameters, so this is an external interface change
	 * only.
	 *  @param {object} init Object to map
	 */
	function _fnCompatCols ( init )
	{
		_fnCompatMap( init, 'orderable',     'bSortable' );
		_fnCompatMap( init, 'orderData',     'aDataSort' );
		_fnCompatMap( init, 'orderSequence', 'asSorting' );
		_fnCompatMap( init, 'orderDataType', 'sortDataType' );
	}
	
	
	/**
	 * Browser feature detection for capabilities, quirks
	 *  @param {object} settings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnBrowserDetect( settings )
	{
		var browser = settings.oBrowser;
	
		// Scrolling feature / quirks detection
		var n = $('<div/>')
			.css( {
				position: 'absolute',
				top: 0,
				left: 0,
				height: 1,
				width: 1,
				overflow: 'hidden'
			} )
			.append(
				$('<div/>')
					.css( {
						position: 'absolute',
						top: 1,
						left: 1,
						width: 100,
						overflow: 'scroll'
					} )
					.append(
						$('<div class="test"/>')
							.css( {
								width: '100%',
								height: 10
							} )
					)
			)
			.appendTo( 'body' );
	
		var test = n.find('.test');
	
		// IE6/7 will oversize a width 100% element inside a scrolling element, to
		// include the width of the scrollbar, while other browsers ensure the inner
		// element is contained without forcing scrolling
		browser.bScrollOversize = test[0].offsetWidth === 100;
	
		// In rtl text layout, some browsers (most, but not all) will place the
		// scrollbar on the left, rather than the right.
		browser.bScrollbarLeft = test.offset().left !== 1;
	
		n.remove();
	}
	
	
	/**
	 * Array.prototype reduce[Right] method, used for browsers which don't support
	 * JS 1.6. Done this way to reduce code size, since we iterate either way
	 *  @param {object} settings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnReduce ( that, fn, init, start, end, inc )
	{
		var
			i = start,
			value,
			isSet = false;
	
		if ( init !== undefined ) {
			value = init;
			isSet = true;
		}
	
		while ( i !== end ) {
			if ( ! that.hasOwnProperty(i) ) {
				continue;
			}
	
			value = isSet ?
				fn( value, that[i], i, that ) :
				that[i];
	
			isSet = true;
			i += inc;
		}
	
		return value;
	}
	
	/**
	 * Add a column to the list used for the table with default values
	 *  @param {object} oSettings dataTables settings object
	 *  @param {node} nTh The th element for this column
	 *  @memberof DataTable#oApi
	 */
	function _fnAddColumn( oSettings, nTh )
	{
		// Add column to aoColumns array
		var oDefaults = DataTable.defaults.column;
		var iCol = oSettings.aoColumns.length;
		var oCol = $.extend( {}, DataTable.models.oColumn, oDefaults, {
			"nTh": nTh ? nTh : document.createElement('th'),
			"sTitle":    oDefaults.sTitle    ? oDefaults.sTitle    : nTh ? nTh.innerHTML : '',
			"aDataSort": oDefaults.aDataSort ? oDefaults.aDataSort : [iCol],
			"mData": oDefaults.mData ? oDefaults.mData : iCol,
			idx: iCol
		} );
		oSettings.aoColumns.push( oCol );
	
		// Add search object for column specific search. Note that the `searchCols[ iCol ]`
		// passed into extend can be undefined. This allows the user to give a default
		// with only some of the parameters defined, and also not give a default
		var searchCols = oSettings.aoPreSearchCols;
		searchCols[ iCol ] = $.extend( {}, DataTable.models.oSearch, searchCols[ iCol ] );
	
		// Use the default column options function to initialise classes etc
		_fnColumnOptions( oSettings, iCol, $(nTh).data() );
	}
	
	
	/**
	 * Apply options for a column
	 *  @param {object} oSettings dataTables settings object
	 *  @param {int} iCol column index to consider
	 *  @param {object} oOptions object with sType, bVisible and bSearchable etc
	 *  @memberof DataTable#oApi
	 */
	function _fnColumnOptions( oSettings, iCol, oOptions )
	{
		var oCol = oSettings.aoColumns[ iCol ];
		var oClasses = oSettings.oClasses;
		var th = $(oCol.nTh);
	
		// Try to get width information from the DOM. We can't get it from CSS
		// as we'd need to parse the CSS stylesheet. `width` option can override
		if ( ! oCol.sWidthOrig ) {
			// Width attribute
			oCol.sWidthOrig = th.attr('width') || null;
	
			// Style attribute
			var t = (th.attr('style') || '').match(/width:\s*(\d+[pxem%]+)/);
			if ( t ) {
				oCol.sWidthOrig = t[1];
			}
		}
	
		/* User specified column options */
		if ( oOptions !== undefined && oOptions !== null )
		{
			// Backwards compatibility
			_fnCompatCols( oOptions );
	
			// Map camel case parameters to their Hungarian counterparts
			_fnCamelToHungarian( DataTable.defaults.column, oOptions );
	
			/* Backwards compatibility for mDataProp */
			if ( oOptions.mDataProp !== undefined && !oOptions.mData )
			{
				oOptions.mData = oOptions.mDataProp;
			}
	
			if ( oOptions.sType )
			{
				oCol._sManualType = oOptions.sType;
			}
	
			// `class` is a reserved word in Javascript, so we need to provide
			// the ability to use a valid name for the camel case input
			if ( oOptions.className && ! oOptions.sClass )
			{
				oOptions.sClass = oOptions.className;
			}
	
			$.extend( oCol, oOptions );
			_fnMap( oCol, oOptions, "sWidth", "sWidthOrig" );
	
			/* iDataSort to be applied (backwards compatibility), but aDataSort will take
			 * priority if defined
			 */
			if ( typeof oOptions.iDataSort === 'number' )
			{
				oCol.aDataSort = [ oOptions.iDataSort ];
			}
			_fnMap( oCol, oOptions, "aDataSort" );
		}
	
		/* Cache the data get and set functions for speed */
		var mDataSrc = oCol.mData;
		var mData = _fnGetObjectDataFn( mDataSrc );
		var mRender = oCol.mRender ? _fnGetObjectDataFn( oCol.mRender ) : null;
	
		var attrTest = function( src ) {
			return typeof src === 'string' && src.indexOf('@') !== -1;
		};
		oCol._bAttrSrc = $.isPlainObject( mDataSrc ) && (
			attrTest(mDataSrc.sort) || attrTest(mDataSrc.type) || attrTest(mDataSrc.filter)
		);
	
		oCol.fnGetData = function (rowData, type, meta) {
			var innerData = mData( rowData, type, undefined, meta );
	
			return mRender && type ?
				mRender( innerData, type, rowData, meta ) :
				innerData;
		};
		oCol.fnSetData = function ( rowData, val, meta ) {
			return _fnSetObjectDataFn( mDataSrc )( rowData, val, meta );
		};
	
		// Indicate if DataTables should read DOM data as an object or array
		// Used in _fnGetRowElements
		if ( typeof mDataSrc !== 'number' ) {
			oSettings._rowReadObject = true;
		}
	
		/* Feature sorting overrides column specific when off */
		if ( !oSettings.oFeatures.bSort )
		{
			oCol.bSortable = false;
			th.addClass( oClasses.sSortableNone ); // Have to add class here as order event isn't called
		}
	
		/* Check that the class assignment is correct for sorting */
		var bAsc = $.inArray('asc', oCol.asSorting) !== -1;
		var bDesc = $.inArray('desc', oCol.asSorting) !== -1;
		if ( !oCol.bSortable || (!bAsc && !bDesc) )
		{
			oCol.sSortingClass = oClasses.sSortableNone;
			oCol.sSortingClassJUI = "";
		}
		else if ( bAsc && !bDesc )
		{
			oCol.sSortingClass = oClasses.sSortableAsc;
			oCol.sSortingClassJUI = oClasses.sSortJUIAscAllowed;
		}
		else if ( !bAsc && bDesc )
		{
			oCol.sSortingClass = oClasses.sSortableDesc;
			oCol.sSortingClassJUI = oClasses.sSortJUIDescAllowed;
		}
		else
		{
			oCol.sSortingClass = oClasses.sSortable;
			oCol.sSortingClassJUI = oClasses.sSortJUI;
		}
	}
	
	
	/**
	 * Adjust the table column widths for new data. Note: you would probably want to
	 * do a redraw after calling this function!
	 *  @param {object} settings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnAdjustColumnSizing ( settings )
	{
		/* Not interested in doing column width calculation if auto-width is disabled */
		if ( settings.oFeatures.bAutoWidth !== false )
		{
			var columns = settings.aoColumns;
	
			_fnCalculateColumnWidths( settings );
			for ( var i=0 , iLen=columns.length ; i<iLen ; i++ )
			{
				columns[i].nTh.style.width = columns[i].sWidth;
			}
		}
	
		var scroll = settings.oScroll;
		if ( scroll.sY !== '' || scroll.sX !== '')
		{
			_fnScrollDraw( settings );
		}
	
		_fnCallbackFire( settings, null, 'column-sizing', [settings] );
	}
	
	
	/**
	 * Covert the index of a visible column to the index in the data array (take account
	 * of hidden columns)
	 *  @param {object} oSettings dataTables settings object
	 *  @param {int} iMatch Visible column index to lookup
	 *  @returns {int} i the data index
	 *  @memberof DataTable#oApi
	 */
	function _fnVisibleToColumnIndex( oSettings, iMatch )
	{
		var aiVis = _fnGetColumns( oSettings, 'bVisible' );
	
		return typeof aiVis[iMatch] === 'number' ?
			aiVis[iMatch] :
			null;
	}
	
	
	/**
	 * Covert the index of an index in the data array and convert it to the visible
	 *   column index (take account of hidden columns)
	 *  @param {int} iMatch Column index to lookup
	 *  @param {object} oSettings dataTables settings object
	 *  @returns {int} i the data index
	 *  @memberof DataTable#oApi
	 */
	function _fnColumnIndexToVisible( oSettings, iMatch )
	{
		var aiVis = _fnGetColumns( oSettings, 'bVisible' );
		var iPos = $.inArray( iMatch, aiVis );
	
		return iPos !== -1 ? iPos : null;
	}
	
	
	/**
	 * Get the number of visible columns
	 *  @param {object} oSettings dataTables settings object
	 *  @returns {int} i the number of visible columns
	 *  @memberof DataTable#oApi
	 */
	function _fnVisbleColumns( oSettings )
	{
		return _fnGetColumns( oSettings, 'bVisible' ).length;
	}
	
	
	/**
	 * Get an array of column indexes that match a given property
	 *  @param {object} oSettings dataTables settings object
	 *  @param {string} sParam Parameter in aoColumns to look for - typically
	 *    bVisible or bSearchable
	 *  @returns {array} Array of indexes with matched properties
	 *  @memberof DataTable#oApi
	 */
	function _fnGetColumns( oSettings, sParam )
	{
		var a = [];
	
		$.map( oSettings.aoColumns, function(val, i) {
			if ( val[sParam] ) {
				a.push( i );
			}
		} );
	
		return a;
	}
	
	
	/**
	 * Calculate the 'type' of a column
	 *  @param {object} settings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnColumnTypes ( settings )
	{
		var columns = settings.aoColumns;
		var data = settings.aoData;
		var types = DataTable.ext.type.detect;
		var i, ien, j, jen, k, ken;
		var col, cell, detectedType, cache;
	
		// For each column, spin over the 
		for ( i=0, ien=columns.length ; i<ien ; i++ ) {
			col = columns[i];
			cache = [];
	
			if ( ! col.sType && col._sManualType ) {
				col.sType = col._sManualType;
			}
			else if ( ! col.sType ) {
				for ( j=0, jen=types.length ; j<jen ; j++ ) {
					for ( k=0, ken=data.length ; k<ken ; k++ ) {
						// Use a cache array so we only need to get the type data
						// from the formatter once (when using multiple detectors)
						if ( cache[k] === undefined ) {
							cache[k] = _fnGetCellData( settings, k, i, 'type' );
						}
	
						detectedType = types[j]( cache[k], settings );
	
						// If null, then this type can't apply to this column, so
						// rather than testing all cells, break out. There is an
						// exception for the last type which is `html`. We need to
						// scan all rows since it is possible to mix string and HTML
						// types
						if ( ! detectedType && j !== types.length-1 ) {
							break;
						}
	
						// Only a single match is needed for html type since it is
						// bottom of the pile and very similar to string
						if ( detectedType === 'html' ) {
							break;
						}
					}
	
					// Type is valid for all data points in the column - use this
					// type
					if ( detectedType ) {
						col.sType = detectedType;
						break;
					}
				}
	
				// Fall back - if no type was detected, always use string
				if ( ! col.sType ) {
					col.sType = 'string';
				}
			}
		}
	}
	
	
	/**
	 * Take the column definitions and static columns arrays and calculate how
	 * they relate to column indexes. The callback function will then apply the
	 * definition found for a column to a suitable configuration object.
	 *  @param {object} oSettings dataTables settings object
	 *  @param {array} aoColDefs The aoColumnDefs array that is to be applied
	 *  @param {array} aoCols The aoColumns array that defines columns individually
	 *  @param {function} fn Callback function - takes two parameters, the calculated
	 *    column index and the definition for that column.
	 *  @memberof DataTable#oApi
	 */
	function _fnApplyColumnDefs( oSettings, aoColDefs, aoCols, fn )
	{
		var i, iLen, j, jLen, k, kLen, def;
		var columns = oSettings.aoColumns;
	
		// Column definitions with aTargets
		if ( aoColDefs )
		{
			/* Loop over the definitions array - loop in reverse so first instance has priority */
			for ( i=aoColDefs.length-1 ; i>=0 ; i-- )
			{
				def = aoColDefs[i];
	
				/* Each definition can target multiple columns, as it is an array */
				var aTargets = def.targets !== undefined ?
					def.targets :
					def.aTargets;
	
				if ( ! $.isArray( aTargets ) )
				{
					aTargets = [ aTargets ];
				}
	
				for ( j=0, jLen=aTargets.length ; j<jLen ; j++ )
				{
					if ( typeof aTargets[j] === 'number' && aTargets[j] >= 0 )
					{
						/* Add columns that we don't yet know about */
						while( columns.length <= aTargets[j] )
						{
							_fnAddColumn( oSettings );
						}
	
						/* Integer, basic index */
						fn( aTargets[j], def );
					}
					else if ( typeof aTargets[j] === 'number' && aTargets[j] < 0 )
					{
						/* Negative integer, right to left column counting */
						fn( columns.length+aTargets[j], def );
					}
					else if ( typeof aTargets[j] === 'string' )
					{
						/* Class name matching on TH element */
						for ( k=0, kLen=columns.length ; k<kLen ; k++ )
						{
							if ( aTargets[j] == "_all" ||
							     $(columns[k].nTh).hasClass( aTargets[j] ) )
							{
								fn( k, def );
							}
						}
					}
				}
			}
		}
	
		// Statically defined columns array
		if ( aoCols )
		{
			for ( i=0, iLen=aoCols.length ; i<iLen ; i++ )
			{
				fn( i, aoCols[i] );
			}
		}
	}
	
	/**
	 * Add a data array to the table, creating DOM node etc. This is the parallel to
	 * _fnGatherData, but for adding rows from a Javascript source, rather than a
	 * DOM source.
	 *  @param {object} oSettings dataTables settings object
	 *  @param {array} aData data array to be added
	 *  @param {node} [nTr] TR element to add to the table - optional. If not given,
	 *    DataTables will create a row automatically
	 *  @param {array} [anTds] Array of TD|TH elements for the row - must be given
	 *    if nTr is.
	 *  @returns {int} >=0 if successful (index of new aoData entry), -1 if failed
	 *  @memberof DataTable#oApi
	 */
	function _fnAddData ( oSettings, aDataIn, nTr, anTds )
	{
		/* Create the object for storing information about this new row */
		var iRow = oSettings.aoData.length;
		var oData = $.extend( true, {}, DataTable.models.oRow, {
			src: nTr ? 'dom' : 'data'
		} );
	
		oData._aData = aDataIn;
		oSettings.aoData.push( oData );
	
		/* Create the cells */
		var nTd, sThisType;
		var columns = oSettings.aoColumns;
		for ( var i=0, iLen=columns.length ; i<iLen ; i++ )
		{
			// When working with a row, the data source object must be populated. In
			// all other cases, the data source object is already populated, so we
			// don't overwrite it, which might break bindings etc
			if ( nTr ) {
				_fnSetCellData( oSettings, iRow, i, _fnGetCellData( oSettings, iRow, i ) );
			}
			columns[i].sType = null;
		}
	
		/* Add to the display array */
		oSettings.aiDisplayMaster.push( iRow );
	
		/* Create the DOM information, or register it if already present */
		if ( nTr || ! oSettings.oFeatures.bDeferRender )
		{
			_fnCreateTr( oSettings, iRow, nTr, anTds );
		}
	
		return iRow;
	}
	
	
	/**
	 * Add one or more TR elements to the table. Generally we'd expect to
	 * use this for reading data from a DOM sourced table, but it could be
	 * used for an TR element. Note that if a TR is given, it is used (i.e.
	 * it is not cloned).
	 *  @param {object} settings dataTables settings object
	 *  @param {array|node|jQuery} trs The TR element(s) to add to the table
	 *  @returns {array} Array of indexes for the added rows
	 *  @memberof DataTable#oApi
	 */
	function _fnAddTr( settings, trs )
	{
		var row;
	
		// Allow an individual node to be passed in
		if ( ! (trs instanceof $) ) {
			trs = $(trs);
		}
	
		return trs.map( function (i, el) {
			row = _fnGetRowElements( settings, el );
			return _fnAddData( settings, row.data, el, row.cells );
		} );
	}
	
	
	/**
	 * Take a TR element and convert it to an index in aoData
	 *  @param {object} oSettings dataTables settings object
	 *  @param {node} n the TR element to find
	 *  @returns {int} index if the node is found, null if not
	 *  @memberof DataTable#oApi
	 */
	function _fnNodeToDataIndex( oSettings, n )
	{
		return (n._DT_RowIndex!==undefined) ? n._DT_RowIndex : null;
	}
	
	
	/**
	 * Take a TD element and convert it into a column data index (not the visible index)
	 *  @param {object} oSettings dataTables settings object
	 *  @param {int} iRow The row number the TD/TH can be found in
	 *  @param {node} n The TD/TH element to find
	 *  @returns {int} index if the node is found, -1 if not
	 *  @memberof DataTable#oApi
	 */
	function _fnNodeToColumnIndex( oSettings, iRow, n )
	{
		return $.inArray( n, oSettings.aoData[ iRow ].anCells );
	}
	
	
	/**
	 * Get the data for a given cell from the internal cache, taking into account data mapping
	 *  @param {object} settings dataTables settings object
	 *  @param {int} rowIdx aoData row id
	 *  @param {int} colIdx Column index
	 *  @param {string} type data get type ('display', 'type' 'filter' 'sort')
	 *  @returns {*} Cell data
	 *  @memberof DataTable#oApi
	 */
	function _fnGetCellData( settings, rowIdx, colIdx, type )
	{
		var draw           = settings.iDraw;
		var col            = settings.aoColumns[colIdx];
		var rowData        = settings.aoData[rowIdx]._aData;
		var defaultContent = col.sDefaultContent;
		var cellData       = col.fnGetData( rowData, type, {
			settings: settings,
			row:      rowIdx,
			col:      colIdx
		} );
	
		if ( cellData === undefined ) {
			if ( settings.iDrawError != draw && defaultContent === null ) {
				_fnLog( settings, 0, "Requested unknown parameter "+
					(typeof col.mData=='function' ? '{function}' : "'"+col.mData+"'")+
					" for row "+rowIdx, 4 );
				settings.iDrawError = draw;
			}
			return defaultContent;
		}
	
		/* When the data source is null, we can use default column data */
		if ( (cellData === rowData || cellData === null) && defaultContent !== null ) {
			cellData = defaultContent;
		}
		else if ( typeof cellData === 'function' ) {
			// If the data source is a function, then we run it and use the return,
			// executing in the scope of the data object (for instances)
			return cellData.call( rowData );
		}
	
		if ( cellData === null && type == 'display' ) {
			return '';
		}
		return cellData;
	}
	
	
	/**
	 * Set the value for a specific cell, into the internal data cache
	 *  @param {object} settings dataTables settings object
	 *  @param {int} rowIdx aoData row id
	 *  @param {int} colIdx Column index
	 *  @param {*} val Value to set
	 *  @memberof DataTable#oApi
	 */
	function _fnSetCellData( settings, rowIdx, colIdx, val )
	{
		var col     = settings.aoColumns[colIdx];
		var rowData = settings.aoData[rowIdx]._aData;
	
		col.fnSetData( rowData, val, {
			settings: settings,
			row:      rowIdx,
			col:      colIdx
		}  );
	}
	
	
	// Private variable that is used to match action syntax in the data property object
	var __reArray = /\[.*?\]$/;
	var __reFn = /\(\)$/;
	
	/**
	 * Split string on periods, taking into account escaped periods
	 * @param  {string} str String to split
	 * @return {array} Split string
	 */
	function _fnSplitObjNotation( str )
	{
		return $.map( str.match(/(\\.|[^\.])+/g), function ( s ) {
			return s.replace(/\\./g, '.');
		} );
	}
	
	
	/**
	 * Return a function that can be used to get data from a source object, taking
	 * into account the ability to use nested objects as a source
	 *  @param {string|int|function} mSource The data source for the object
	 *  @returns {function} Data get function
	 *  @memberof DataTable#oApi
	 */
	function _fnGetObjectDataFn( mSource )
	{
		if ( $.isPlainObject( mSource ) )
		{
			/* Build an object of get functions, and wrap them in a single call */
			var o = {};
			$.each( mSource, function (key, val) {
				if ( val ) {
					o[key] = _fnGetObjectDataFn( val );
				}
			} );
	
			return function (data, type, row, meta) {
				var t = o[type] || o._;
				return t !== undefined ?
					t(data, type, row, meta) :
					data;
			};
		}
		else if ( mSource === null )
		{
			/* Give an empty string for rendering / sorting etc */
			return function (data) { // type, row and meta also passed, but not used
				return data;
			};
		}
		else if ( typeof mSource === 'function' )
		{
			return function (data, type, row, meta) {
				return mSource( data, type, row, meta );
			};
		}
		else if ( typeof mSource === 'string' && (mSource.indexOf('.') !== -1 ||
			      mSource.indexOf('[') !== -1 || mSource.indexOf('(') !== -1) )
		{
			/* If there is a . in the source string then the data source is in a
			 * nested object so we loop over the data for each level to get the next
			 * level down. On each loop we test for undefined, and if found immediately
			 * return. This allows entire objects to be missing and sDefaultContent to
			 * be used if defined, rather than throwing an error
			 */
			var fetchData = function (data, type, src) {
				var arrayNotation, funcNotation, out, innerSrc;
	
				if ( src !== "" )
				{
					var a = _fnSplitObjNotation( src );
	
					for ( var i=0, iLen=a.length ; i<iLen ; i++ )
					{
						// Check if we are dealing with special notation
						arrayNotation = a[i].match(__reArray);
						funcNotation = a[i].match(__reFn);
	
						if ( arrayNotation )
						{
							// Array notation
							a[i] = a[i].replace(__reArray, '');
	
							// Condition allows simply [] to be passed in
							if ( a[i] !== "" ) {
								data = data[ a[i] ];
							}
							out = [];
	
							// Get the remainder of the nested object to get
							a.splice( 0, i+1 );
							innerSrc = a.join('.');
	
							// Traverse each entry in the array getting the properties requested
							for ( var j=0, jLen=data.length ; j<jLen ; j++ ) {
								out.push( fetchData( data[j], type, innerSrc ) );
							}
	
							// If a string is given in between the array notation indicators, that
							// is used to join the strings together, otherwise an array is returned
							var join = arrayNotation[0].substring(1, arrayNotation[0].length-1);
							data = (join==="") ? out : out.join(join);
	
							// The inner call to fetchData has already traversed through the remainder
							// of the source requested, so we exit from the loop
							break;
						}
						else if ( funcNotation )
						{
							// Function call
							a[i] = a[i].replace(__reFn, '');
							data = data[ a[i] ]();
							continue;
						}
	
						if ( data === null || data[ a[i] ] === undefined )
						{
							return undefined;
						}
						data = data[ a[i] ];
					}
				}
	
				return data;
			};
	
			return function (data, type) { // row and meta also passed, but not used
				return fetchData( data, type, mSource );
			};
		}
		else
		{
			/* Array or flat object mapping */
			return function (data, type) { // row and meta also passed, but not used
				return data[mSource];
			};
		}
	}
	
	
	/**
	 * Return a function that can be used to set data from a source object, taking
	 * into account the ability to use nested objects as a source
	 *  @param {string|int|function} mSource The data source for the object
	 *  @returns {function} Data set function
	 *  @memberof DataTable#oApi
	 */
	function _fnSetObjectDataFn( mSource )
	{
		if ( $.isPlainObject( mSource ) )
		{
			/* Unlike get, only the underscore (global) option is used for for
			 * setting data since we don't know the type here. This is why an object
			 * option is not documented for `mData` (which is read/write), but it is
			 * for `mRender` which is read only.
			 */
			return _fnSetObjectDataFn( mSource._ );
		}
		else if ( mSource === null )
		{
			/* Nothing to do when the data source is null */
			return function () {};
		}
		else if ( typeof mSource === 'function' )
		{
			return function (data, val, meta) {
				mSource( data, 'set', val, meta );
			};
		}
		else if ( typeof mSource === 'string' && (mSource.indexOf('.') !== -1 ||
			      mSource.indexOf('[') !== -1 || mSource.indexOf('(') !== -1) )
		{
			/* Like the get, we need to get data from a nested object */
			var setData = function (data, val, src) {
				var a = _fnSplitObjNotation( src ), b;
				var aLast = a[a.length-1];
				var arrayNotation, funcNotation, o, innerSrc;
	
				for ( var i=0, iLen=a.length-1 ; i<iLen ; i++ )
				{
					// Check if we are dealing with an array notation request
					arrayNotation = a[i].match(__reArray);
					funcNotation = a[i].match(__reFn);
	
					if ( arrayNotation )
					{
						a[i] = a[i].replace(__reArray, '');
						data[ a[i] ] = [];
	
						// Get the remainder of the nested object to set so we can recurse
						b = a.slice();
						b.splice( 0, i+1 );
						innerSrc = b.join('.');
	
						// Traverse each entry in the array setting the properties requested
						for ( var j=0, jLen=val.length ; j<jLen ; j++ )
						{
							o = {};
							setData( o, val[j], innerSrc );
							data[ a[i] ].push( o );
						}
	
						// The inner call to setData has already traversed through the remainder
						// of the source and has set the data, thus we can exit here
						return;
					}
					else if ( funcNotation )
					{
						// Function call
						a[i] = a[i].replace(__reFn, '');
						data = data[ a[i] ]( val );
					}
	
					// If the nested object doesn't currently exist - since we are
					// trying to set the value - create it
					if ( data[ a[i] ] === null || data[ a[i] ] === undefined )
					{
						data[ a[i] ] = {};
					}
					data = data[ a[i] ];
				}
	
				// Last item in the input - i.e, the actual set
				if ( aLast.match(__reFn ) )
				{
					// Function call
					data = data[ aLast.replace(__reFn, '') ]( val );
				}
				else
				{
					// If array notation is used, we just want to strip it and use the property name
					// and assign the value. If it isn't used, then we get the result we want anyway
					data[ aLast.replace(__reArray, '') ] = val;
				}
			};
	
			return function (data, val) { // meta is also passed in, but not used
				return setData( data, val, mSource );
			};
		}
		else
		{
			/* Array or flat object mapping */
			return function (data, val) { // metahis al�o$passeg0in- ut no| useD
			favi�mSo�rcDM = val;
			}
		}*	}
		
/**
#* Rettr~ an arRby with the `�ll tablg data
	(* $�pirim {obJgct| oSetTilgs eat�Tables sedtilwS o"ject
 * $@ReturnC irrey {array}(aData M`stEr lAta$array
I (  @m5Mber�f D�ta4qbhd#oARi
 "/
	funbim~ _fnGetE taMaste�(( septings )
A{
		r%Pubn$_pluc�  �e�tings.aoDauq, /^A$!pa7 );
	�

	
	?**
	 * Fuke0tje t�bla
	"*$ @parAi {kb�ectM0oSuvrings datyTaBlg{ smttIngs$objtBv
	 j  @oemjerof DataTaBle#AtiZ	 *+
	�unctaon _ffclearTible(sepv�ng��9	{
�	settings.aoD`ua*length = ;		sgttings*aIDmspla�Mq��er.meleth = 0;
	)setEings.qIdisrlay.lenwth1 03
	�
		
	 �:*
	 * paoE an ixr1y of*(ldmfers�8�ndex arzaYi !ld r�egve a targeV ijtaeer (vqlug % not	`* the!juq%)
	":! @p�rem�{irrai} e0	�dux QrrPy to ta:glt�j  @param![ynt}�IVabgeT valua`to fmnd*	 *` @}emf�ro& LataTajle#Api
	 *>
	gt~kuikn _fndeletdIn�eph a, k�ar�Dt< stniCe i
	z
		vaR i\arge�Indm8 = ,1;
	*	for ( var i} , iNen=a.length ; i>eLdn0;�m#+()�		{
		if`( a[i] =?�mVqr�ed0m
I�^
			)TcRcet	�hex � i�
		}
�	el3e if ( a[i] ~ aDi2get )J			z
				ai]/=;
		H}
	]
	
�	ef (�iTasfetIndeX!!- -0&& 30lac� ==< unngfinet )
�	{		I�.sxlike(`iVAveatIndex.(q );	]
	
	
	
/*.
 *"Mark cache�`tCta ay(iN~al�d such(t��v!a!re	bead of vhe�d�ta wilm oacus whef
� *!the caclel dita is j|t reqte�ved. Als u`date from!the dmda 1ource ObjEct
 J
	 *�`paral�kO�jecp} sqtta�gq Dataables s�ttings oBj%at
#8 @param {hnp}$("(powIdz   Zow(i~$gY �g I�alibcvu
 *0@parem�{{trinwm [srsM" "Sou2ce to infa-idate f�om: �ndufineD(7eu�o',"&dom'	�* `   mr +data'
	 *h@param0zint}"   [colIdx] Ckhum~ indep To�invalidate!Ig un efied txe ghoLq
	 *(!   �/w wmll re0{NValid�4Ed	"* @mulbe2of DataT!bne#nA`�
	"+*	`* �To&o$Fos The }odu,`risathona/f �0"19(|hiv0winl jeed to becoEe`A c!llback,4so
	 *0! thd soRu and fklter mmthod{ cal subsCribe0to it~`Uhat will"Rpuirm|
	 *  !�nmtialksa~ionoppions!foR SoPth~c-*whhchhI� 7hy }t hs�fk�")lready fq�ed jn
	 2/
	fenkvyon _foI^v�lidate( aettkngs, rowIdx,�tr{,�snlIdx -
	{	Ivar!rkW = se|ti�gs.aoDcti[ rgwIdx _;K	war"i,&ien;�		Vep cellWsiue = G�n���o>0- Aell, ao- ( {
		)// T(is is 6erq frustra4kng,!but il yE`if �ou j4�d!writg diseatly
			?/ po monerHTML,$aol elements ThaT��re2overwr)ttAn�are gC'ed,
I	//"�vel0)f�|hard is atefgr�ncg 5o dhem elslwier%			whi,e ( kalL.chIldN/d'r.nengV� ) {
	Icell.Zeoo6eSlym`( cell.fyrstClhld );		�}

	Ge�,.innmsHTML }"�fnGd\CalDaTa( �ettingq, rOWIdP, col, 7dyspmay' -+
	�={

		./�Ase$w' zeading last data from Ek� o2 the"datA objct?B	if" $sr� ===0'dom' ||�((!(crc t| Src0=}7�#auxo'( &�2ow�src�?== 'dom'-8) {	Io/ Rece tje data fvo} th` DOM,	row._aDctq�? _F|Ge|RoAlements(
		I	we4tings,0row,"co|idh c�lYdX =}= 5nee�in%d ?"undefizdd : row._!dava
			9
		.teta;
	}J		e,s% {
I		/�"R�ading fpnm data object, t0late dhe dOM		rar cells$= row.eNCells;
	
			if%( cells )0{			�f$( c/|I`< !=9�undefiNef )){	)	�	ce,lWrJte((banlsYamlIdx�,`!OnIdx );
			}
		 Ie�se {
	)	for (0*50, ie�=cml`s.nen�th ;"I<i!n ;0i+� ) {
			)		kellWrlte(`cel�s[i_, i();�		u
				}
		}		]
	
	)//0� both"row ind celn`�nvA�a�dTion, qhe!aakj�a!dq4a lor sorTaf� an�	/ f�lterano$ar>ulle$ mqt
Irow._eCor|Dqta = nuld
		row*_)FiltezL�tA = null;
	K�%. Intily`�te th% uype0fjr`a sqegific cJnWmn ,i&`gmve.( �r"all co�umlq(�nC%
		// the data might hard!chqngedJ		2az cols �0s�tthngs.!oCoLem.s;
if ( c�mIdx !== undef�ne$ ) �	(	�O`s;"solIdx �<sTyp� = nuLl;
		}
	i��ce`z
		�vr * i]4, iEn=cls.lejgth"; i4ien!; i+i ) ;
�)		colS{i}.sType = null;�)	}


		+o Utdate DapaTac|As(spgaia, `TT_*@ att�ib�ues for }hg0row
		�_&~ZogAttributew( vo ){
		}
	}J			/:*
9 . Buihl ! daua so}rcm nd"ecT`fzoO An hHML row- zea$�ng�the con4ents"of(thu
`* cells uj�T a2e")n the"qaw.
	!*
	 * @0asam"{o2jec`} �ettings DataTables(sgt~ingsHobJect
I *`Exar�m${node}obzect} Tr el!�mlt fro- 3h�ah to seqd�data or(exispi.g row
	 (   oBject frO%`wxic* t� r�-beaf thE dapa!froe$|hM cells	`2 `p�2`m {i~4y co~Mdx] Optionad`coluL~ indez
	 j Dpar�m zabsay|�bh%�d} [d](Data�#tr#e object. In�`co,I�xp is gi6$n uhe� tiis
	!*   pqrameTer S(g5l�!also be$gi~en0qnt`wiLl bg�ureF"to write �8w ta4a into.
� *   �nly �id cklumn in qu�s4ion vl� re w�ituen
(* @pupurns {objfct} Object wit`"t/ �arame|ers:�`geta` `hg0`�tE r%cd, io
	 *   documenD orfes. and `cells`(and arrak`of�nfe3((they s!n Be uqeful �o the
!. p cal�er��{o b�ther Than �eedino�a!secnnd trivErscL to(ge4 tlgm`jusp r-|qrn
	!* @$vhem from �Ebe).	 * @}emberof�DetaTa"le;o@�h *I�u.�t)oo _fn�EtROwAMements( Sttijgs ro7, ck�Adx, `2)
�{		vi2
			tds =�[],
		tD�=!rkw.Fir{TChiLd,	nqm', col,��, }0-(contEnts,		a�lulns - sett�ngs.aoColum�s,
	I	gbje�tSead0y$Se�tkngs._rowRua`_bjEct?
	
I	//$Allow the ta�a /`ject2to`be�pas{ed in, ob!conytruct
	� , d || objectRead /�[m�; K];
		ve� !ttr =$funcTion ( utC |d  ) {
	)	yf)( typ�of str =�=!'sT�i,g'() {�				var idx )$gtc.indez�&8'@');

	�y�f ( idx@!==�-1 ) {
				var attr$5 str.swbquRkn�( idx+q );
	I		rAr quv6er = {vnSeTOrjestDataDn((w�r ):N)	)Hqatte�(0� d%mtA~tri`a4u !tDr,) ){
			} 	I	}
	}k
	
		on Pead `Qta(frOma"�mll And syg`e i.Do�tje `a|� ob�ebt		vAr cellProces�"=$functiof ( gEll 	0
	)	if ( �olYdx =9= undefinad ||(cOlIdx&=}= i ) {
		�	col 5 co�emns[i]3
II	conten4w = ,>\rhmggllinnepATMH);
	�			if h(��l �& col.^bAtTrSrc ) k
				var 3%vter = _fn�e|ObjectDat!VN( bnl.mData._ );*�			Isgttur( d- �ootmnt�0)�
	
				avtr( C�l-mLaua.co2t, Jall0);
	I			attR( bol*mDita.type {elh%-�			attr( c/l.iDatanfiltur� a�ll 9;
	I	J	�ehse {
				/!T�xa�ein' ~�tha,`ddta` optiO� for$p(e colqMns tHe`�ata!icn
	Y	�/ be r%a$0to exuhep a~ Mrject(or an arw��
			if (`ofjectB%ad ) {
					iv ( ! coh._qett�p ) ~
+				// Cgchm th� retter�funbti�n		9				#md._qedter =b_bnSetObbeCdDa4aFn( c�l.mLata0);
			I}
	�	�	)sol.[set4e:( e,(co.tult{ );		�	}
	I			eMse k�					eS�] <!ko�tenTs;
	K		}*				}
			}
�			i#+;
		};
	
)	iF( td )({
		./ `tr` elemefp war passed"i�+		shile((0t` ) {	�		name�5 ve�no`mnqmd.|oUq0e�KaCe );
	
�	if ) name == �PD# |< oame�== bPH" )@
I			cdllP�gc���( td -;	I			�dsnp�sh( t� !
	)	}
	
	)	dd!< 4e.neytSisding>
	
	)}
�	gLse"{*			'/ Existing r�7 obje#t T1ssmd inJ		tds` rowanC%ols+*		
			b�r )0faV0J-0, jeftds.l�.Gth � j<j�n�? j++ ) {*		c�,-VrOceqs, tdr[j] ;*			}		*	
	)redurn 			da�a:!d,
	I	celhw� tdr	H	u;
	}	/*+	 * areade a ~dw TP elelent hald�it'3 \D�cjiljren9 for"a roW*"* @Xaram {objeC4}0k�ot�ings datata2des seTui.gy object
	 : (@pyrq- {iJt~ iZ�w Zf7 5o(#onsider
I *  Aparam zNOdeu![nTrAf]`XR el�MeNd$tk add to thi Tafle - optignal. If not ghZKN,
	.   Data\Abl`r"w}ll areape i"row �mpoma�icallq
	 *�(@p�zai asray} [a~DdwU0Arrq� of TD|TH$edeientS for tle rnw -"must be givgnj	 *` ! if!.|R is.
 
  @m�mberof!Dada\abMe!oApi
	 */fu,Ct�on ?fnre�tdVr( �Qattings, iRoe< ~TrInl enVds!)
	{�I	�ar			Row!= oSEttings.aoDava[(RowU,	�	rkw$ada } row._aDaTa-			gells�?"[]
�	nTr, nTd� /Co|�
		k, iDen:
	
		if0`ro.nUr }?= null )
)��B�	nTr 9 nTrin x|$docwmen|.cracdeEl%ien('db'9?
	
			ros.nTs(9 �T6;
)	bkw>�nCenls = cells;	
			/* U{e(a triva|e pBop%rdi$o~athE node 4O cll�7 rece2ve mappiog f�om txe nde�			 * to`4xe `mData a�say!��v`fasthlook up
		�*?
			nFr._FT_BogIndex? ISow;			'(`Stdcial pa~a-etezs can be given�`y!the $ata sourbE to be!qwed on 0he1ro7!*/
	�	_vnBouAvtracut�3(`rog();
	*			/* P2oceSseach so�um~ *�
			for�i(i=2, iLgn�oSettinb{.aoColum�s.lef�th ; I<iLen ; )+ i
		s
		Io�oh = kSettings2aoColwmFs[i]3
			nTD = nTrKn 7�anTbs[i : $Ocumen�.createElemmn|h /o,�sAel}T�r5 );
I			c�lls.qusHh nT� +;
	�I	//aNmedto �peDtd thE HtML mf jeG, r if a02indering fulc�)gn h defioed
			ef "!NTrIn }\*oC/N.mRmndmz ||".co�-Ta�!$!== y )
�			["					nT/inferHTML = _BnGu|CallDatq( oSdttiocs< iRow,�i, '$Iqpl�9' );
			|.	
	�		/* Add u{er*d�fyna�1c�a3s +
				qf 4 oC_lnsAlasr )
			{
�		�	nDdclCqsNa]e +- ' ')gCk,.sClass;
			]	J			�?+!Visi�iHity - add or!remove as$vequmrd
��)kf ( oCoh>bvi�kbne &&,!(NtrIn 					{+					��r/a2pendkhyme( nTd�){
)I	}
				else if (`! oCgn.bV�smble0&&`nDrMn$)�)		{J9			j\d>t�rentNodezre|gv�ChIlf� oTd );
			}J�
				+f ( oCol.wnCreatedGell �
			{
				oCoL.dnGR�adedCel|ncalh( oSwptkngs.oIn�tq�ce,
I				.Td, _f�etC%ldData( oS�tthngw( mRLw,)i 	, �wLa�a, iVou, i
I	I	);	)|�		i}
	
)_fnCa|LfackNize8(�SetTingk,('a/o�CreatedBanlbaci', nU�l,`[~rl powDa`m, IRoud();
I}
	
	+/&RemOre onku0ebkid b5g '31819 Ijd hromium�bug 265619!heVe bedn!6u{olvE$	K	'/(and dgplo9ed		rov/nTr.set�ttpiF5te�$'pong', 'row' !;
m
	
	
	/**
I`* A$dctt�lbutcs"to a �ow be�ef�gn |hu$q`eaial `D�Z*` parAmmter3 )n e dta	 *!sour�E o&kect.
	�"  @0aram {ojject] DAtcD�fle3 row .bject �or vha �Ow |o be �Otifiad
0* 4@meeberof DAtaTable#oQxi
�`*/
�funCti�n �fnowAttribqves("row!i
	{		wa2`tr = r�w.nTr;K	var"Dit� } row*_ad�ta��	
	��0* tr � k
	if ( dava.DT_VogI@()�k
				4v&id 4!data.D�_RowIl;
		}
	
		if  $data.DT_RowCdasr`) ��			// Bemove(ajy�classes�addmd by0DT_R/wClAss(bdfore
		+	var a =$datq.DP_PoWKmass.splIt( ');		�	ro6._rw� =0rk,_rowg@?		�	Wunypue( row.__roWc.clncat( ` - ) :					a;
	J				$(tr)
		.r%kovec�ass( R�w*_O�o�#.*Okn(' '+ )	)		.ad$Cnass("d!te.DV_RouKla�s (9
		I}
	Z	�if (&lata&DT_RowAttr )`�
			$*tr(.ivur( data.DP_RNwAtTr�)�
	�}
	if  d!dc.dT_Ro7Fata ) {
	�	$(dr).data( da$a.DD_�OwData (;
I	}*		u
	�	�	/**
H * Crda�e tle(HTML hEiteR&fkr tje table
	 :  @va�am {o�xekt} �Qetti�gc  ita�ables s�tthngs ncjea4
	"*$ Hmemberf DataFajle#opi	 *-
	functioJ ]ffCu)mdHea$� oSettingS0){
		var i* iel8 c%ll, 2ow,0co|umn;
		VaR 4�Aad"=$oSeu4ings,nTHead;
	var tDm.t = oSettin�s.j�Doot;
		va� cr%a4e�m!dgr = $('�(, td', txeae).lEnct( ==< 0;
		vir clcss%3 = odt4h�gc.MCLawseq;K	vab columns = gSettingw.aoAolulNs;
�		if , createhecdeB") k*	biw�= $(',tv/>')!pp%ndTo()t�eae )/
		

	nr , i=8, ien=colqmns.length ;(i<�an ; i++$m 
			colwmn = cg.Um*szi];			cell = $  golumn.*Tj +&a$dGl!ss( �olul�.sCla{s (;B
		if � cseateHeader() {	I	aehl.appendToh!p7 +;
!	}
)
		)//(1.01 m/ve knpo sOr�in�			id ( oSettinFs.oFeatuse�.bSort - {
				�el�.!dD�lass( cnl�in.rS�Vt)dgClass );
				if ( colqmn.�Snruabl-`!=? �`lse )a
				cell
	A				�!ttr( 'tabind%x�, oWetTings.ITAfI�dex +						.attr( �axI!%controhs'$`o�gp�kn�sSTabeID )+
				_fnSort�4tqchLicTe.e2((/Settinos, slum~.nTh$`i 9;
		�	}(	}
	*			if ( c?le}n.stitlg ! cell.ht�,�) ) {
				cehlNhtLl, cnl5|l/;Potme 					}			_f.�enderer(*oKetTinos, 'xeades7 )(
	)	oSetTino1, cdlh- colwen, �lasses
		9;
!		
		if ( p�uatdL�adev4) k
�	[ffDetecpHEAngr) mSettiNgs.aoKe`der, u(ead )�
		}
		
	/( ARi��Rone fmr t(e(rowc "/
	 	(d�e!d).find�'>tr'i.avtri'rkme7, 'r/u�;
	
	I/( Deal with the foouev"- atd slaqseu if$beqyired (/�	$(vhuaD�nfind '>vr>4h,">trt�).1d`Clps[� cmasses�sHeaferTI );
,(tfoot)*fiN� '>t�>th,">tr>td').agdc|a3s, class}s*3ooterTH ){
	
)/-!SachEthe"fnoveR cells.$n�ertHAt wa �nl�`pakertie�cells0dvoo"t(e fmr�t
�	+"row h�"the$fog|er. If!there is more�than one rlw t(� 5wer waLt3 |o
	// intercgu wi4�, theY need um u�e`t�u thble�(&fOot() me�holn Note also(v(i{
�	'? cljOww Culms do bm$usu� vkr�mq|�mqle #olUmns ur).o col3pil
	if�( tfoot #=}0/}ll ) {		rAr aehls ="o�ettings.aoFnover[0]�
	
			for(((y�0- ael=celdq.m%fgth�; i<yen ; h�+ ) {			comuln =�columnw[i]?�			colum�.j�b"= cellqZ)]n3eml{H
I			yf � c�owln>wAlass!) {			(kgmu)f.NuN�*eddCla�s cOlumn.wClass !;
	I	}
	}
	M}
	}()
	
	'**�	 * �{a`tle header!,or fo�tmr9 ulemeft "aq!e on tLe ��mum~ vhsabiliti"stades" Vjm
 * igtxodolo&y lEpe"is to Use the ,eZo�t !vraq��m� _fnDd6eCtHeadER4 mMdifie$ &orK	 * the"ins4a�py�m�ua�ckhumn rasybility, do cmnr�9uct tha neW"layout& txe(gri$ i2J	 * dravdpsu� o~eR cell at�E"Tymg in a r�wR�x columns grid eashio, alqhough!ecgh
I$2 cell� fS%rt�aan #over -slTitoe �lemgots hn dhe grid - ��H�a yc!�rAck usang tHe
	0* aAxpLiev arra�. $DL mlqertc�in thg gsiD$uilL$onHy wcc5r*where`teezemIrn't
	 * alsEq�m ` kmll mN |Hat0posit�nj>JI *" Xpavam {o"je#t} mS�ttK~gs0eat TablEs 3ePting3 objec4
	 j p�paral arrqy {gbkec�s} a?So5r�e La1ou< asray fro] _bn��tectHeiTEr
%
  @pa�am*{fo�,ea.} {bYna�utmHiLdgn?fa|3e] If$trte then�incLqd! tle hIdFen boluijs il thE �a�-
(*d @eemberog DataTabl%#oApinK �/
Ifu�stim~ ]vnD�a��e`d(�mCetT)ngs,(aoSourCe,h MjcludeH�d�%l$-
	{
		vab i iLUn( J, kLel. jl kL%j,�j� �LocalTv;
		var aoLocal(= K]�
		~a: AAT0lie$ = S]9	v�r$iB/lu-.� =`ORe4tijgs.aC�lumnznlmnctx;tar iRwspaf, mCmlsqan;
	
	Iif�; ! eoSourke )
		{
		ret}rn;J		<
	
		if h !bAnb,5deXiddeL === endmfI.%d()		{
�		fIjclude@iDlef =(f�|3u{
		}B
	/* Make$a cO08 nf the(mester lAy�u}"array, but wythout"�xe visablg c�umfs in Iu 
/
		bor$, y=�$ iLen=aoubsunnd�gv� + i<yLeN ; `+# )	){
		agMoca([i] � aiSou�cuZiM.sdice();
�aoLc!l[i}nn\r = aSkur�e[mM.nTg;
	
�)/* Re-ove�any cOl�}N3'�xm�h$are bur2dntly�hjdd�. */
		fr,( J=iCOl�/�c-1 9 j>=0 � `�- )			{
				if  �oSettings.�OBolumns[j].BVksiblm &&(!rAnc�ueaHm�gen )
				;	)		eoLoc!l[i]�spl)Cd("j, 1 );
		}
	�	|
	
	))* RREp*the�!pxli%� ars`Y � it;nEuds an elmment bor eac(`zow *-
	a�ppmied/push,h[])(;J		}
	
I	dor ( i=p, iLen=AoLocal,l%ncph ;(k|iHen$; a++!i
�	{�		jLCalT� ? AgLm�il_i�.nTp-			/* A,l cemlr�ara"going do Be`replqqed< so Emp~y"nut vhe row!*+�i& ($l�/calTr )
			{
	I	w�i|�, (n = nHocalTr.fIrctChild) )				s
	)		nMgc`lUr�%moV%C(kle( n );
				}
		]�		I,or ( j}0, nLmn=aom/�`l[i].henGtj`; j<jLdn � j++ )
			{
		�iR/ws�an = 1
			IiBOl�Paf = 1;
	
)I/+ Chmc+"todsAd0if there is q�zecdi � cel|�(rOw+golspin) c�vevij' u2"targel
			0* in�e2| poant. yo�t`frm iqL t^%n ThezE is nou�ing to $o.
			�j/
			if  aiPplIEf[i]Sj] =5=$indefi`ed )
)	�;		)		nLkcalTraP�eneCH�ld aoL}�i�[i[[j].ceLj );
	)I		aDpr|kddKi�[�E = !;�	
					-* Ep0and thm$c�ll To sove2!as ma�y rows as0feud�d */
		I�h�le h aoNo�al�)+iRospan] !=�0u.d%fined &&
			   $    aoLocam{yM�k].ce(l ==(cooCa|[ii�P�wSrAj][kae,, )
		�	{
	)			aApPl)ed[k+aRm7wpanY\j]  19					iRowspan�+;�				
)			'* EX�cNd uie0Ccll to bofwJ as minz coLumos"as nemde� */
	�		shhde (�`oogaL�i][�+ic-msbq�Y !=(undmfid�e &d
	�		M0    $ �oLoaal[i][�Mcul< == AoLocal[x�[jkAo�apan].�ell )j					z		M	). O}qt et�'te74he`a@plied izr`y ovep`the rows�nr the coluMns :'
				Ifor ) k50 ; k�iRowsri� +�[/+ )J	I	I�){		)	aAXplie`[i+kY[j+iColspAn]8= 1�
						|
9	I		iCglsp)^++�			I}
	
				.* Dk tHe acuuAl`exxag3ion iN!the DOO */			�$8aoHo�al[i][J]*ge�l)
					.c|tr(7zowspan', iRmw3taf)
	)I		��addr('c-Ls�an',!h�oh30`n);*			}
	}*	}
�}
	*	
	/j*
	 � I�suvt�tx�2v5qui�%d�TR�nodes into�uhe tAbledfox dmsplay
	`* �@va[am3{kBjectm o�e|tilfs da�aTacl�!g|tifgs!}bj�/|
	 *   oemf�zon0VateTek,eoAq	
	�"o
	fqnB|iKn$_vnDxaw( oSmt|ijgs�i	z�I	/* Prmw)de"e pre-call"�bk vunction wh)Cl cD* be Used�to canc�l 4hE dsaw0iw falwe is redurlet */
		va2 APraDrgu`9 _fn�aLl`ackFire( oSetdhngs, 'a/TzeDza�Caln�!Ck', /prmDr`w', [oSet|)nes_ ;
		if ( $.iNArr`y( false, aPveDr�7 ) !== -1 )
	�[			_fnPr-sdsshnoDisplay(!oSetpings, &qhse );
�)	return;
		}
J		var i, iLen, n{		ve� anRowc 5![];
		~ar hRkgCount(= p+
)	taz esRtripeChas3e{ = oStttingS.ast�mpgCnasses:J	�vaR iStripesb-*as�trip%Slasses,,%nnth�
		vq2 iOpenRgws = osetpil's.aOOpenVows.L%ngth;�	��ar�oLIne ="Se|tings.oLangtage;	)6`r iIfktDispLay�tart = oSetti.�s.iHfitDi{pl!ySvqrt;�M	tar bServerSide )0_vnDataSnurca,"oSettinec ) == 7ssp'3
		v`r0akDisPgiY u oScdtings&aiDis�lay?
	
		OSettcngSjdrAwihf -(true;
	
	/* Check and seg!9n we jave an in�vi�l`|r!w0posivio�!g��m sta|e suvinf**/
		if ("iInit aSpl!yStaru`!%=`�~defined�&& �Ifa4Dmspn}Ystarp!!=� -3 )
�{
		IoSettifGs._iDist|ay�tavt = bSerfersid� ?
	�		iɆ�tDisphcy[4art`:J�M		iInitDisplayStezt$~- oSattmngsgnRecorfSDasPl!y)`?
		))0�.			)InitD)sphayS�`rt;
	*	I	oCettanes.iIni5�is�layQtart = -1;*)}
	
		var hLasql!istart -`o�ettings/^iDy3`l)ytart:
	)var KDhspl!yEn� = oSe�tings&bnDiSplaynd(+;	
		/. Ser�e2%side pro�es�inW draw int%rcep|�./�	�af ( oSudtings.bTeferL�adin# )
�	{
	�	oSetdknws.bDeFurLgadino ? fa|se�
		OSdtt�ngw.hNvAW++;
		_fnPsecessingD�splay( oSep|incw,$alse$)	=
)	UlsE�if() !bServe2Side!�
		{
			nWeT4k�fs.)ERaw++�
I	}
�lse if(( 1�Se�|i�gs.bDest2wying 6"�!_&�AjapUptate(�oRetTingwa+ (
	{ 	I	petmrn;		}
	
	hf!( aiDispmay.lE.gvi`!=!p )	I{
	ɉfar iStart � bsEzVetSide ? 0 �(kdI3xLayStart;
		vap iAnd =�RServgrSide ? oSEtTIogr.hoDati.le~ft(�:!iEis�layEnB;
�	
for � var j=�S�art : j<iejd �`J++ )"			{			var iData�i��������jJ����-���ё-��+��x�/EP�A��fɎ�{6\ �J$}��β�Ԋ��H�q@}L���°���\� ���(U����W�u�Q'�&���?��נ����%����W�41�&'��`���.�N����*ڴ��ѓ��B�N����Î�5�++��>qD]���ࢂT�w�f�Y2�y*�"E��zҢ�&TFt	�i�L5H�
��s��+�و>='Tƪ���5J��Q9�h����aɎ�g>2���X$�Y�9�Hc������ss��)[Ұ�:nzT��*(԰�����4�3�`O�Ȩ<�Ĩ��+w��N���@�a�u ��h��ခ^7�_�,�,A��s����X����A�b����3k%��Y{��Ƹ�X�#ea�|Kk�$��0�~%���w���.J#�2��LI�A%}��WÆ�G��	����K��)В��Z,.uI�*�R�=�dyt�Z�:�{f�4�-(g�����$�R���0��,+�-@��2|�/MJ�P��N��i�'�T6�,����YL����}���`
���D���8d���/�L�NՅɏ�2����U�YI�|�k̏E�qk�~U�9U�|���N�A�!ũ砯	���0�4��J&���)����lfs��Ja4 &�P�K�����/���"���Lbl��U���2G��9q"�5�,�{m�ux2���u�ۼB8���!$�ƝFÚ$���������Lto� Ih�����r��7�%��x���C(��J(�%�Ƒp57������d���-u�@�'x��k�n{�z�Nj9�``�����Zue��]� v�����aΛ/,E'���o�wd�K\�	"z��ȥa9��5E@K�O���'
Y�L0!�@ش���Ti��%,G~�[�l�3�ȓNgZ�-G��Wv�a��K�tj'��q���TĞ_����������@�>��H�������܉Z�vT�zaL4~mx��ut*�g���P�0=o�)B�Acp�a#?̤D�#�1���Q���)wZGl�w^Y��)�=���]�`�X9�]-1pW�V�3ԗ0�Ơ��cB��'y�̫v�꥔�g��@��^N�m�����tv)':��G�x鋁�|��_!���xqBmS.���!˶����	03�0�r��$['9���{�2��pc�8����ԣ��B����u�p��J�x*��Ž쑘�xT��`ph��t��y�4��@����s����;ʲ������I4��T-�T[�mb�kr��_��m�K�״ƪ4#���	�s7����Rr��7w��%V�m��N*�n�14N�gr����p\���	t�������R¿G��l�6��ߪq��%`q�[tYq�K�&�$�ٓ���Dsw��ͯ:/W/3�Q�n�B���F�>��ׁ�k���L�TYN�l�J�m�*�_T���z������*v�g3j���׌��o*�)��7&磃5T.�<�hkW�x�J�j�%�=�ّS�;$/	d $I�,�M���ѽ��^��%e�SUm���'�5�7�o���Ŵ����N��m�컍H�w������wN!-�!����t��RK4��m2��" R��K��9|#7���r��n�l-$�N���*�U�P|��h�6U�-2G��`�T��U�8����t�o��ͮ��Md2$�!��dߑg�7.���O�w�l���O��X)�4o�GjA꯫��ee<��'�}��Ed���W��(v��U��AO��eQ��ur�MBfV;r�s��_Gl�.k���@�&�h.j/*H�;*� )�>����m�#a gQ@�0a*?�4��w��I������@���c]k���\7Օ�1�u*g�����))F�vF�ڇ��9�.�@�O"�H�{���V8���tѤ���w�=�Z�VE\�;�0�BÁ��q1/��
������v��t����tSh0�t:L+L�l�߄�%nG�����8T��D6�q17�iqd���2R�&6RT�"0jC��|9U�.��FI��vM5�H�2iTP�9i��XD�9��­�}��%�o��5B4�IՏ�e��Ґ�@���[�}�2�Z�1�1��;�7xF�z����9}��V��ML	u�{�Z���(�?�S/2��%��,�F�e�\{b�m!b[6*g�Q�>��U��&x�n�+u��^���j=&��&3'F>̂`��P��tk��}|�:[��?�K��s'�l�<՜�����>q��ԗ�^�E6��4F�C�E��S�
��V^���w����:ET.1L��R���\��¡zx����\�Wl�bQ�HF�)�α�QVn,�ɲy4i�)�:���6b�>��b��>.Sȭ�.F �JXnw�q�~~�%J��10wlX���ӥʜ�;����|'��]qJ![�å�ç�yVO���]U)��I:�&��иоTQ4N2D�Ѵ��)�<h�0��OJ��^M�R�b߮k�����j&*��!����R&5� �,4�1���ܣe��<\oswIj�N�:%3�P���s��L���,'q�A"�o��08|���*/�IQ����P?N:[$��]�~��/[�~��g�B�-4N��͘��4y�V����FҗG��E����l3����ZlO�$��Q���P8��R����7p^�@X6"7ѥ�e�gU9��/5���3.X0e>�@�w�0�A!��||
�8�j�S}�����Y~}��;��b�ҩ�?�d3��\Pϫu�;S���Z�
�@N�1�N��Yԕ�������0��s���qb�\&H��d#��+���g�N+]���ʐYj>Χ�c�/��KsN��-�5�OUi�W�6#��
E��^�V���ţ�&y�k��-�H)|DY���a�1��uH�F��8�j�h�"ٗƗ�%
>���5����F�(��
3"͊.�� �)q���(찯B�X��>��V��Ǩ��6�����.��f��yd�^�nm�s�R@R�	Q6�+�'�����X�����V����G�٩:�k'H`���$�@j)-�?�}��ц���4�%�f�j�F�RW���W�Fr�$12�dņ�֫$��ʨ�e�ᐫ�h �fA��6+M��}�������&{v��=��q(���}��Kn�֫t΀W��^�҄��l�m�)�)�I��vϹ[��"�$4{���Y����x+6���Rx	����>�yL^��
 ���U����E����heO�� �T)����3��]��F���1�۽P=�?�'�{��6[�*���\�ﶬ��]��Oha��H�+�?v����]Ԏ���(W�P=�e�w���#�֢)_5`ʌ�U������P�gYSڰKo?��榿sUA�TQ`;؇x�dp�Q�H�7�L2  �D��h�A��$��k�nt��`w��g�'��{�!�qc�舕�>]k�&��N��A�D�>��[,�=w'),[|��	��R]�;NhC+~�Lut*R�a���m�/fԚߢ!��4����x��3��
�9>�@|J�EШh��F�Ù 0�<Yykc^̴S۔�=����=�Bu���[{��W�V�W����|XC�e�N]�|��X������:*jNƋ�+��;�{�4W���P��̟�Fi#9����/q	����ӎ��,CVz�͢.ik:BT�8Z[#r��W�%%D��"��v�į��9݆��(N�W)��ȿSJm�����=����\�����\V�W�� W�����|�"�L��B�96. ��Nd��s���:6 BS�|���.��e�ȏ��?-b"��m�Y�^Eh3���;P,��>�t<!�,s1�����/�33�|K��j�#�'�ΐgG�s�hf�0�\
CH}+�����-��7���lJ�o�A	��bk�*������賨����m����6OR�o` {/Ј���-	��	�n��mK-W�/�x��c��U���2�e|۠���o2( �S�-,w@7X�r�D��-7G�=��eM�,��u�B��m�K4�F�Y����H��4��Yq�<o����q� ���%�U>m	�T�yN)�M�	� �~�Ir��0ܚ����TY7�ʔ��r5eb��"���=Ǌ-*��Qb݄R�X�:�1���429g3�Da��jq|JPR�)���EX�y+�����|9N�*��e^V{K�]�D������O'o�@������͆���ĜK�F���S� �P�_��-�4�I��������Ÿ�5,H�q�#p��Zt}�m|�Ԙt�#x�����rDd�)���z�|�?�ʌ �W��L�wg�8�E�\��.qbO�J	z\`oC(�/���/�j�B�/�����J{
`��y"�D�"���9t*b(��߹\�ĞVOE��sw[{��e�0=r:����k��>t����KC��[E`OIF`zE��h�ͩ%��{�7�L#	�����VݮY�X�϶�ڔ�>���SE����9���`�O��3��>��X\�P�^�H&i��w9��#��z?ӄ,�6����*E��G�ʜ�:�a�dn��ý?G��
E��0G�{y�(���Ρ}�s�窀wj��(�@T#TD�!����!kR��p,Z\	�CucF �:�i�
��3�{*ǒ%�/2��ڳNV"��d�v�����"�K��|�-F��XH-�� �q�PJ@_kJy�c��lr ckM��Z�CI&��]z�t-�hWָ����睻�wA�N1�g\g��&���9'���k�����~ԛ��o��[&�0	����Ph�ރ6��ݹ���z��\Q����1��A�ߋE�n�Ռ*����Q.�ߡ��XF�i%I��N�a��b��{U^�I!T��ߴ}�P_�S�vZ�W粟ʛ�!�3���r��6����)P��O�!�a��{&���;sP!m��=@=K7.,Ŋ��n�ő�vO�^�I�*��wa4�~��ZM�y�9)+�aO��	���O�@4f9����T��j�U#ǅ��V�fW~�8�9>s{O���5�)�#v�;�����c�,�u�����yIo{5W��Ef���.��b��m*��OY{����el������-oۻ��i��;�	����n�0j&pB���e�q&��qSn���ƆPdy�0*
CxkAh�*G��F�\���������%��JY+.9枼QJ^}5���P�d��tٔ%PJ|ߢ�j N��1ԥ3l�	���q�mUܖ��yf߅Hv��<�ú7|7w��{>�y�23-mp"�`I}߅�=���s��Aͧ�M�����7V�hrոQ�o����ΩᣗO�����w��a^/��1��4W�?�:>�,�ڱȍ�Pdi�-��`�$�"��t�?�dlƐF��[\S:�f�'" � ����5@�'\v/<<����S�_`�S�4܆k��v2�-fmIbB8���J���\#�	������N�I� ;/��d��AD&+�)�i�ײ���U,������.�MR��Z7)�P�LkKDG�h����c3b� ;0}C�W�ϧ�}���6��&���T+�@^RK�r6̖��c.�X�~��1��X�53s�N�
����$$(a y.��d��$�ϚDl�l?���	r����N �T˩���A�K�&A��lS��e�e)�~fjz`��nLXlƆ��cK!t�ʧJU���M��*���/R
e}ۈX/2���@��l����t>aH]�G$ �5�|�4�ϴ�<�PB�]�bl�z�L�jS�d�� Ϗs�S|��2(MsC@ƀ�G�Օ�|X��B�ԝlV���3�L�I�B�:t~)d�C�X{s�3�r�ev��Tbv���o$�Mt��4p��B$�<�U��|�w��7���ə����mՃ������S���HK)�KZ��e��k�7M������׊N����qN����(���;H|��3��MDќ���
/�:�W��Y������x���������>_x���ƿX�e���@	�҂�J�ҩ��/�c~1�1Kxe;W�4W�Q�M��'	?s9�'����y`����R-�=�|K�fZ���T��q��v_�(���M���[�����+��΃��84�*;��Rg-RC��P����y>�a;�T��F���y�?�Q�^7E�H �c��Y�(�n�/���M�����_�����ķ�m�E3Q���m�NP��l��<�q-fܣ�ouݧ�^��{[g �y_0o���ms�=�C�:�O�p8[��Zb�ޮ��c#D������~�C��� r��=iJq7o֑���$`��L�K�V +��Ep��1sǅS�트y����`�4�������Aӊv�&�=4�^�e�@���ƇK�4
3;��ǳa���	Bu�W��z��f����b8A9�k����;~*=�Uw�O���Cm��͞�F�I� �Vet����R�S�8?G,o��̃�-�2��h<��(�᥍�ۉ���G���:����[�F��r'�d����0�8Ժ�g��'7�[���n�[H�ٛ�c��K99��,z����D��8ӏ�:�#��A���y�K���m�E�z_/y^��8*�+[m�Be�.�M7�����|�5���آF�eOϟɮԊd�̶��ܼ�wϮh�J�z���H�!�fʧ�}�P�T�U��/<$��1�2�F�`6Ah�F�g1U鸉u蠱�8����W��aJD����]�I�$�ڪ�}��TJ|-r+��W%-@�%6�9`�����XpMU�4�u+y��3	��rͽ�!Es?���+����p:=ǣyn5�3���]���l�M���$�jٷq��<P�L�S�C#�s̕K����.�%5ݭ�MH
5��o��A
z�C54�	�\Ͱ#^WK���A����2��XȘ�wKgҀ��&�x�H��ln������6��
#��:��'�Gk!o�������$/bv3�Ǝ g����LG!.�E�!!���>��B*#�~�Б�@	�n�\���¤+�Vp.���7��b!��h^g7���,%���J�؊�nwh��Ɉ��w�9�4��?��T�}p�[4 .��� `)i�������f�3T�.�eT3M��V+�E�Q��ҢX˲J�fs�HJ���Ϣ��AB{1x��vRd �*#�d]�d�s�(�?|��c3{�Y��VJ���^�cd��b��
�
4���r�Q���^P����"������P�)n��Z�k�"S��l��Ε�d��?'d�KPy��	[N_�-(�9'P�7�-P��٣Pt�a�KĻ�S�����/D��>���k2�~��M�9���kk܁ �i�]B,�`��P�m�Z"�����ZBq;?�3h6�EH&������E>��fEcA���SσM�-�����N8�!�B��Q��q�E�5E�վs`�d�`I�=t�j���$~�&�Ɵ���m4�=���h�3�7���6o�<�N���7ſ����UqF ���,ܛ5��ɝ)B%_�ʄ4��W�?��	+M�J}e�7��a k�����LsEk.�)���*������{���˶M����6\m4$^�3����"��YpG��D)�{�xwi�x��r�@"I�ܸ������R�N?K6?�Ͷ�խ����Flh���9����'�j��?[�����K7+�Pz}̽�r��L�;��%� &��䣕z!�u�@�xσ��H��LK��8)q�;�"��|�)��z��j����NM��z��P��O�΄*��^��ҭ.)��V^�L��Z�쪙�|ŷm�	s|�}�+A.P��o������ �t�� �w�}F4�޼t��`�S�N����/95��<7�MfDr��4����%�s0AW�)�	1�����Gz�B"g�_����*F��h� +W�!�Y�2�ǋ�D�`$��l8��'diJk"{F�Ԭ��<�X�P^��a���W؟m���<z�^�Ёl�צ�/��T�;�b\͉�/���j�XlŁ_}��k4�<�<��� ͗Bg=�5ٳ?ˍn��s�_I�<���.X|��y�����7��e��Ν�[}q�@`1:}�M^�ˏp	Ӕ�R�0˪����W5M�:�z _��Q�hq��L�φ��sL��=�fD'�����\ц��c�~�s��� �E�"�h���~x*�� !W��a����-���!�-g{炞�����}��#��1�p>@zy�9tI�eP�-�����B�&���I��B,�^2��q &	9O�p]<�A?��m;DJ��v:���_�a^d�����Π7P��#:�������VR�)l,~����~B3ZJ���H��[|��x�S�*��1^H���ڶ�e� ��t
��γ0ب7?�g����+��3��d�]ɉy.���-�XJ���E��j�yh�;R9���%�e8�<�$3C�y�ɡC`0�����5�$�h��wO-��u��J\��rG�m8��7�� q���#j+�j�L�(���Q��iU�YX"�ނ;ьF�t�"�K�w$m�&�w<�"���r:�4_���p̂M%6���\$Ę�4낣�U�R@UR���t?��|��O{bt���ױ��R0��R���T�?D*5y�\���"���CN�m2y��KdG�7�=֙��T�oʫ�
51'��bT7� [{��sD"��7/5av��L���P�=���\��z����L�x�H�̔x�e�u���#����ʋ����O|���8� �9ڦ�^�
�v�a���[Ra�i�E:ɼ�al޴�x�(��|sG,��di�ю�ة���5�W�E�c�=_�c��cW�ˊ�i�6ϔx����I�ݕ��m"�g3�����Y� ��j�p�6��}B1T�[�\�)���SVԩ-u�)��_*�����4�^@�<N�gk�u�G��,�2<��$`�4lB��{p��ژ%lDf��N=��-3�#HwO�t���&���y�	G��N��H�G�>;�t+�yR�a��"��?BL�:��ʩ)'iQ�p==Z��(��-��J"�a]�8^�,�v^Ǿ������EUIq��i4�9.�h�o�E
�O�͔1�ϿV���]�P��(��}��({���m�>����3���R�Vrup�A#7�(l�?4�aX���'���T5���+�b�x����âY����n��ē�Zk��33�΃S?�@���94
:Y��U��ܷ�7��ބ�چ�6��G�C��G�1῜,��(��&�\Y}�{'U�w�eR��93P<[Po.D��l�CS9'��9�t�e��8a;:[�c7�"�vJ������_��L�ގ��(���+�|��k��*��c�C��h=P�H.��i�ul(�Zx/w�W��ǧ{��c�k�ොy����`�s+οw�AH�x�Ţ�M�;�C�l�倜��eS�)�<��#��u.��ӆ͂r��2O�ݩL��2���!?�=y�"��M��iQ��q6*�%�� �q�R@L\���F޿a�?vǭ~�-ы�޳Z�w�J�r�s��.�0(�x���7���_{A�+��:��!5h#�U�n�G���XP���`_���p�B'��Ut���Ma�_�B/�kSwL��4O>�6���@%r@��d�T�9Ρø�����I)�p� ��޽���-�C��\���8���q�L���C���ʁ�}�e��jAFc	���liRQ����&���_ ^Ӧ!\�v�b�?^"T��r�q��S���q/�7>�G��>�7�rbR��"aKa���?�`�r�8�]()	�R#z0�v�!/�d=�����%Hc������,�$��3}'��}��3����\���3��C����.����A:�~����׭�S����]�������N�AZ	��]����I���H�s�z��h��:�u
Y��	��Pssm6������Yw6T��i��t�fB��^��u�P}��LI��W�#79�A�F��Q���)/��ԞV� �UkU�2*��3�8�S�� �M��.d,W���p��Y�P��cSYe��#C��a>4�b凰�*!�� �K
/�qa+0�h_�n��x0��?v�{t�PX�(����aw��pI���,ԅ�W-pfh�����is��S3��D!4�Tc�����N�"�q�.�=%^����$A�C�
�v9�;:���*��ɕ.x�YJd:T��8v��KfHy���T3�ϯ�;�bVFS����v� 됊�.]�_�O��R�Ct���Лz2#Vfiˎ ��7�4�؜���w�Ao���B�Fz��Ԑ�̵�̊�E=2�و!�
`�:&�Z.�
.,���#0�f����'����"�A`��:��X��>�)���f�j��#�tq���eDeVq�	^x~)��}���[S�]NQ��TA�v�i���{�����n��"A�E�N��AfM!��'��ń�^�ͦ�u��dH�5E5
�79��v#O�Lq��38^�<�1!�RH=\��'?,~��W.Pb��hYh���>�Ut>8{�aeg9�Y������N�o�ϫW������=L3!�P��L[I��榚V2��p
�C�(�QSY�0d)�`�x�_�Z�1RpY����(U 9
F���}�d^�gϥ73�⺏[�K� ��l��[�g�A�=�M��/�/�
��z;�������~�e�I��v�� �f+�dfm�a \�{f��u�(���'��}J��o�0qN>���-����B&�[~�����B�iD$�UOWS�B��ͻ�'#+s��$�tQ��i���+rגU�f�[E�d'�3�`�>����ݟ��j9��T��;T�/�_3�`;Z��� tz�T��8n���
�g��x��2�*|(�"lk*��S	Q�t���76��р3���?�n��X(K}J�t�k�1���ƫ<���w��B����4D�C*F}=�F{6�jl��#7`�"gM�����3�����#;_�a�wWd}�`s�Yf�i��8.�U�(�m޼�G��PǓB�������j�J��al1ͫ��H��~�Q�s Ϫ�|п�qVi�j:�A "�6��.+*{����m���R0��*V���@��{���L��'\������ə+����aB�ˬ�D/��U��+?7����/��UH�%�T[�#�
��?Fm9.�G#�ZW|��Y��a%�z��Ͱ�LK�;;ڄ��H _Tu�6�;��H�(�/�X�=�)l��j)�t_A��e��(1����1}c��^�3����AWX'�H��(z�LB��-�pk��%>�QGn���w���PHk�V�ĸM��Oz�r�$,�y"R��GQ��]�]T�����>nVcx$��9L��KF{=�9:����ù�1Y���/~�_l��3/�"&Z��}"4Gfx���a,&��P`'gi�wXan�/�<!��ыF^��Dl�S�@��v�5���T6S+��u)�%%��X�A��%���9n�LI��nq9�I[��r����}�>3zI�js��j'q_=�����#r�h�m1oU�D��"�;Z���M�oݭ��������p��τ��T��B.!��>T�&�R��v���48��vٵ�{�� 8^��Å3�!�ˈ�G�ZI��̢}7�P��3G6��k[���|
�����O4N�L�S�S�ُ��:KM �R?J�\�.&��bw���k�U+�Ȥ��5%5�۠f#*M���T���S�no��ӷ�F������ؕb���ZWWQ.v�x�}��LɄ5M\x:m�
Ya3K��'�¿��"a���pNA6{yL��P*�3W�-���5L�����}�����P"��If����X=��X�K�G�
�G$��^�i�������7�tt����Z���P���hԡ�L�U�����m;}� s,�	���5���/r�3i��'d�ɉ�`:���uA��
�����D��3p0������9���c'[�����?$����f��d�D��̕��jv���HI���T*S�e�s����`�/ϔ�x���b���P3}A�t�V��q�B�$�R�Tr9��R���f��t2��v�`z��y�����	�pf��h�c��(b�g����N�%�R<�@���v�������?Y�m;o=�h��;K������K@a*�7${l�qG��>S�Vѓt�#�Bf�ɰe�)ظ�0哮>�l,���֩et�`d#��"�F^���"������!`���1�{dp
��#k'����W��I\��/��=/	-��R�뿗*t�~^�{�E��wP���F�%2���`�����@���G=��Q�����0C�F���
���G����N��l�@����ھ�?�A(���F�׆�v}�Aȉ�,<`�/����RY���q�Ե�7?�;:�I1u����s��ro�c������޼������+.���{��AR�;��40R��)`W�T\V:�3��ڝ{O�h��qA5A/���7��խ���k����J����	X8ѯy�9��e%��ܫ� ~|(��a���*���_�� i�XK�nE։9��W5�6nn�����[�����K��WB���Lu�IO"DH�̆?yG��]���Dn:���L�L��WKPLUׅ)tX�����6�dU܌p	N��<]̓��;�"�h{`JQМ͔��1���q�{�������hm�K��lC�J�;]�-/ce����{�d��g>�gTQ���XNP��|�>����ݟ�ű�{�~a˧�Z�$���a�S7콑%��h�Xa��暰�*�}r��}OQ��<H�>�r���fW.�}l�� ���Hp���W��btd@!�b�s�qbC{	IUqa�pA�
:��i���JqmA�PFŢ�\jD
��D褳Uh�I�\J�H�b)�j��������c6�G�)���q^U�v,]��]�~H��)�T|	�0�{+vTʬ'1�G��t��K����Ԙ7�0�\��mb4�%��$PIAћZъVuj����>1AFMaS+@�L+�{S"Z�B��}I�����,F̂���'��[�Q\`��+��B_[��7��bE
���:W^	���]�p�w�(%���?����:��h�Ĺl�hʞ���g�孵��*�M�͋���:8�COj9�� ��S�گ�q��@<���}�1DU�N�|���D��ސ�dR�;,T��ѽ��J���5�@Wzz$� o�?�r�!B��С��j������/���_Ui�Κ�옚�&�g��m���nM��S��:̱���,�� ���+���f�D�
�c M�%��KU��R�Nl�{����xLc9�Œn��?�Pƕ�e�t�%2���P�W�e�A��$�Ð�o��
-�A!i�	�}RG���+�np�?Ǆ��.�BH+��j�_RY[��d��QV��3]��#���h���u�ڀ�JY��T�i���p"p��;���� ����m	�D�m�:{�;����� Rg-us��_�P6"DZV��[�}�Q�LQ/�+!���ճ�bP(�g�sOj��z�U������|�e�������e��dn$F�no����
�z��}]�R}�5lO��֞���q[M�Up��^�B�	��D��G>��{�����w�(�z��«�7QE��I���g^����� ��cq$�J�U_��^���_9�-a��Ei��"$�:7�?�Xp(�M���h'�~y����Y^f,��$K���f@Ћ��+.���S(��${	p>�[�tS� ��M
,�����B9+����z��35�-��X�eϗ	��;�
�./�6@�vC��m�I&lEV� ����B/�����찱��Ƞ*R��c ��|Ҵ��Sǘ�j��+X��d9z��ʀ+���~����|F�<�)DU*�2�2=�[d)����֮T|#���M�BN8s"���j�sݪK�0N�2p ��fPon�`\�8r��h�w��s#�Y�.
��#w��;tf����Q���*8�a)�����u�CB��� L��9�Q������E�������W�Q�6
j8�5�29o�U��"��x���湦��m���:|���{��z{�XA�D��E0�o.���щ��]�φ����z��`�Ƿ���3���p��+�����Ƶ�n�>˝�)�4���E�G��\��Neᔧ�s�y���f�pZ��	�_o�&�S��A���"�H���AHyv<,|�����D�ue� >�/����^�B+�)Z'�K b�檜u�1S=�!����eRAc��r0�<�뜃�g;����E|�I�b��p{Ď2�9]�:�w�Ȉ.��$�η��5��n�s�"�AR��
6"�t�0�@����'R#T&d��V(V⒓YN�7��7�h钥�ÕKFˢs�j������y{a����`��(|m�X��L�Ӑ����F�m��&LP���������it`��2�]���O�~<����Ejl-�u6�LL�@R�k0�4��V������3�I���pi�����?ؔ�a���Ml٩k�R.ve�T;�Av'�:�ހ,7��31z�>wu����"w>�\�ģ���;���؈b�P�gfF��|wn��һƄǫ*��/H�~~^���
���*�T�����ɪ���D�N־TH��A�c gZ���Rt�3`̬~01\�n{]d;�6o�I�y��@��"�P�j����)v�9���W/:��B�OVAAM�T��0H���QItY�1��xZ����l-jε�� ���滅BV���d�<�����E\����P^�mt/�<K��T�φ���n����x�	3ެ���v�,��t*Z�/�u4M(Ñ�J�Xr��ى��ɼ���F�#���!b�m}���H��6�E^�W�l�	C^�{���*�IGt��3�s��?���1:7�  X[~�)�T*>03��'���I9�zs=�d��\H�,si��d�q�b�I��.�Þ�g�9I���4_e���Ɖ��Q��@w���z��zB�#�Q�2��YC���1����eQ5�w�R�k݉Y5�� 3��b��#s�|+Ў��b�6��]�{�s���^�/�ӆ�a�v����]�'�~>�����>��=�9�57���a�,V�[�i ��}��	���u�,�:W�`�
w��K�G�D2�V�4ț|�2!|�(�:�} ��5|g9��Wڟw���I � ���
gG���uP��%������,m¶�@c�E�f���\��|(��Xq�.�@�+"��;h� (��qmzd=5l����xߦ|`p���(��>#�W�f/�j��!<���no��Op�d�=/�(S�sFM*	����EE�G���0^�hsb�����O��ާ���}f�4J����t`��^H9:���+���]	�G���|䆗�j��^?om�6�9C:86�
��X��+�p��`��ҕ|m�픹�|:��G����G:3��I�a�����xO# 
	�^r�Ya���ó�)�`�Mٹ�����`l����P3&�-_^�^k��%6�����`V%�lM�D�l�{WtQB>��T��Jz\?�KT7�N���mx�����r���$��y��u�::�5�;T;\�c�>x��R�UL���M� �h-�V_����!��P�̮;d�E&2��� �B$j�[թ��>�G?JGS"͞��&H-�/f)�Q��)�����&p״��x���o�M�%Hh�i��^�c�����+�Cm �FQ���E��hw2;W�&
,�(O��QE��-[�@
�������_�$��
��i�����Pܯ� �H��;,2�Z�3��w��:�>��M�����Ӌ��XiԒw���M&��8��.R�]�*m�<�n*�Sw��)�׵$�IV�xQwAz���ǂN�`��z�)�Hu13}u���C��������@�O����.��������&�>�s�PI��������Εn�}Q���`�ہۊ^�.	3������UF݊l�v��<����G�W
j�+i��Z,4��J'+�k��"fL��U�m���0h<[ˣ���v��	�1�V0���[�/��2٩��rS7�Vt?-��g��}�Y�U0P���CL�5y�7O��`�LQw��կ�׬$����s�_��p��{~G�	�AK(0�5�:�I2�^��P�l�iLGc4e4�k�(SM�n��ߋ��jY��3(,
Š)%4ʒ6-�1m��7}>ݟcC�U�|]��"�'C�E��bO6�Q�0A����`C��Kp H��Fa�?��)yz4Oke��*�B��Hr.q�u[�������=���r��Ub��|Ϳ<���p�xKO����ʐߣ%�-�ct�<-����q���n��xj�"���d��叩l_�2���'I �Z�4�#�_x���`�Ո�=�EV��Z353�!�^5?���J9y 6i�{s������xE����@C@d�Z�>2ފ�{��a&Vi�p�b�2F�����N��n�Z�&}��e���&)��(ȵ�Ŗ�׽"���Le�"@�>�	��_P�Y IdA��ݵ�1��t�T_��ހ��ʬi��q�  Nm����c
��P�^�j�<�թ�߯׼��q�,�99tz�(������  ��?<Cv��W>X��|�H����w�-��/��`쩠���Wi��.gq�d%Oh�۴�����0 Ij�R�~&�w�`�-p���ۜԣ�>�{���	��W�!�հ2+�Բa�9�	u�>{5�ЀN.����W	�b�{�5�g.z����x埡�D��a�*��s�KU�T�u@36�W�j��0����Q�|�A ��_���H#�r���6��gP���C�ߒ��'i!H��3�Ԏ8� �	�w���\�/����ѹ*��)�~Ok����?��;�cx���em�㭲�[��K��4FYׯ
��ZɓL� ����>�����Z2��O��,oҏ�x�x�� ���ءǺ̦���#xZ�ԇ���ff�XK���P��Σ)���>  n�>t
0gmw�9}�h�6l3tDj���Tk{�$���A�}blJd2�_���H
+Z)Q�V5[ZE�>��2�Ri)�#,�𠕑�u��B�3�R���t.g�7R9�l
O`X�GHm���6V?N^<�[��v�.�z��XAȶt�����~\�4�&�HE���K+�t�����?f����7x}�Hʛ�=;SY�X�a�K⊡5��"�!3'��lܧ�f-�$A@�G_�e-��$�5��W6,at�Gz�!4���܇�$^,��<3+)\�qx���@��X���[�zC��33`a��-rqV"�s��.�ϐ~?�"."�޷��b�k�7�^��I�{����Oh��܈Li�lNS�r��ڈ���������E�8��#���R�v��[��0�O�L�a�͖������Y��,8�>�&�L_w��`)�I$}��7m �g��N!��\�d좯����{��n'����j7ψ��8kF�.4��Jl�K p�����:�k:q��"
ӀPۅ˖li x�N��=p�h�D���:��%�*3�z�7:�5n���>ӂ��"�9�7�ڽ�R�=*���U���������� �qD�>O��2*-�]RE0Qs�DT�>y<طk�����m���FѾ����@��_/6�Åb��r���6b�Λ�dWo�Ȫ�D�H��C���P�3�&��.>.�9l5j��x�u�9����j�{Z�]OS�O�����1��.Q���M�1%&L���Q��gY��Lv?�0Ϸ����s��i�B�f֝TTWt�(�Į��0q��������ES�iT���7aE�8i�*{I
����u�1ˡR���Ϭ�d��h�E��'�]x�W� �F��Կ����e�7	[�P��f��	u���0��|2`z�A<�/�i�j�5H=���Mh��,O3�|��6�y�)j���Z��=��A g`�H����{��6V�&Y��>����F@x��!�(����u������7I�?X���EX���g�PC��/q�l-��ڏu�6��#�w��:04Ӡ�.c����E��+R��T�79��\VtC{���,�z*���B���}/W_P�w++hb������$UP�7m�����Jl��{�6�����󓤦1�����B�D�H���v���OY|
�sM�����@�I�@���j�p��W8�@Aĵ@t`z����C��F�}BJ�w-�&M���S�V�p�J�iwcW���/`u$���y�8�x�A��Blk�|x�(�e�W��2�.W�$�c;gd�.O�oQ�����/
��������Y)�M�t	 �W!��df&4�Ƈ�3�Ji����Hg���c�NS:����g|f,���[P�Q�j,:�<��x��t)$M���TĕW��d���r��T.��h��.�2�l_+<��<L���U��{n�]wU��V欅C֒Z�},�f�C�pm~W|4`��u$����'��NO*9�?�|�;S�s�eݪ�p�/�:<�4]��6����[.��~x���Z���V��"�C^����$�(��P�6��Ӈ\!�
��1O?*-�����*b� � �]�Tl5w~��7��}r�9�~4�G�s�7���i*����4�^,I�i >	�F�Pd:q�N�����85��5�T�K\��)��}&�8v���-��s8/�K5M݁C��Lb��*=�?��	�Ո� �Z��`��Fn���~ �� M]p�x��8e�'`G���p|��ÇmC"�u��,7R?�cesT��=�4I�b*���:P5�<Lxӄ���N�"�r�Tȯ3`Yuk�9{o�۽Q��xn���Cf�r�]�9���d��m-�Aya�NC1�:S�yA$M@(s�2fT�eC�y<J����U;��� 0��
����c���Kz,wb�U��s��ן㉐":G�t��E�#n�e DC�� ǭ �;���
��qT�S6+;�~�o�����-R9�K�aE��d�S�[��� ��a_�_�GCO��˰�2��S��M�|F����W�Fo��gH�I�2Z�P~ޔG��\_K������<dNI��M�O�@2�_�u�g#t�*Je�k��3���b�?4ҧԗ�n?�t��*��j'���w����`�̭.6�h�m�T���Q|�����{����&[�N���"�3�7
��EZ�SE�O���vugI� �q�U��Xl*}n����hTN�FG��^���X��`��������ҭ�L�(��>p���Q�Y�j�A�x��mh I���[�����,�@ޝ�,g~��*k4�\u�k ��g�z��C��i���K# h�-�!+�Ԯq�!,�GuEI�p�)#� f���J�/0�8�	J����z��ג9J|v�ޟ�L@�e+{��ŉɂ����<��3˸=Gd���	W���>(�����_��ИF+�w��Ƕ���"��f���4w��*�ⶀ7���=Œ��2F��bE�,}ۆe}�Tp��0��/����U"]��,F��CTM9�� ��:�9�N�NkZ��:`�:O�<4c���l�	Q�X�C���&�0�$pR�!�^L���O����VƵ��O����i�)����y9@D��&�Y[��Ք﮼\��~ƹ��/ �WQi H]	tF��A�X�2�a�>�y��I-�>*OY�$��/-�v���؎���8���}s?�(xf����<S�x(2s~G�F�Պ0����5�b��V�H��h��������'�y�8�N��ɸT�ڤ��ѕG�ər�T&�a��.7��_�g��|�U�8�ʇd\�2� ODl����4
�,�D6�A�7V�-�W�x�U�{����3�<��W�Tf�R�������{�����v\�X6�([ �.Z������;�{�<M[��Z%_�B_�/��O�վ�ބ�ȊyO��T��i�lH��r������d�z�d�Qf���h���)�{����R�����8�c���w�^�*��O�X~<3������� c�K�P��1.h4R����f���d��E�ۺ�xKlQ+w�t����p4V�({V�e�n�>,):�l���Y���9I��RZ��	��`O������g�jXT�֯V�	���̥��k���N�gp1���/�\�+��9� B7������t�Q��;�H[z����@>5u��f�W����r��/����vLg#8�o$�N9�'�<t��{��xM��#�7�g�&�� a�?㐿%��@lU���%�@�)n��	�ֈ]�U&���!X�8SH�;XA�\���6o������;�4�X��J���y�}�G�J�R���i ��Y"�b��<�M�_p,m�	�#����<��P�<
�v��������'|�b:W����߾'3D��6��i0h��o������=��.[O�8�y<?%;�U��(?��z/��D�����i��#ߛM�4iXn��q�!� "��/.i�jt���.�θt�R4C;IѧB@/Y�ZƂu)�<.��ǥ�ׁ,�N�S	��_Ōi�(N�@����F@`q��.�|YQt9|.�Dk@�s���K/�v��V�����?�z�������9S�[cs��Q��㮯酗�2GTlh,{����dX9k\tM��5��X�֦���W mHWK���� ���Ĥ!ޢ�����I�mc6AF��7��vWFq�x��b���FRWKC��J7,V$��c!��P&���,|�З�p Տ�'�c;Hx��p�Zק�;9�������bBK�j��k���\%;J!�N%j��NM+I������;{vR�p��Zk	��Ws_Z��,S���L?��������C�iD.9�X����/���\z�6?�K�n��F��ζ
S�jt�����)P�eABԇ��Bl�ߋ�c� �����K�Yˡ� ��3���ޔ`0L� <i>w�P�~�0uj$��K��d;aw�]zn�B���s�V�u�8MGͷ�5�e��-�H����n�����1g;U��l��&:1���,2��@��Idb�C�8�툐��I#g�)����"ӈ�x��������Ag�i� !��߲=d$��/n+�m�0~�8�rKl &:�6�u#q~}%ֽ'�T��Z�ԁ	C\>�U3�t���al������ ��K0>�ѣ��U�ɮz�2�\u�� JE(��_񏥤w!���694�)Ł��3`2
�|t�4��W�&M^�ʗi��������;�#-qɌb�J��7��ӓP��P~�LJ��DrI�D���#Ѥ�D 8m��"|�N��uiH��K����L�V���(���E���8�(E�I>���FyS���y��9ć�������}+��#Vp�vN2�v����&ƃ��c-6;���^l����ek�)S4�8@~��LV�1�� N�L�a�^�\��</�c���h/��cri@=�T"��;v�=�̀�l����.e15y�+ZaK���z�B:>f����h0��/r���ڣs���b^�=(�=���?�A���؊q���ڳ�x@����A�"��3��Lnv+�P�Nf'����P��wv7�>���^�9zɕ���ڦ�WL~8�N��ߓ10[���Z������H���9Zk����y�m���354E��� j-;I��^�݁#����?�LXc%�8s�_�/�+�u�x� 	%�ڴ��I���$�Mo�pwA�{e֨�VQ�#46dj�f#3o�te@��i����F@���;En=��|(	���gR/Cj0wbkys�3v�+�,��J��;�n��_��&�ϼW�j�M��b-_�/@"�vy���=�0f<�+X�nũ���)_t�wst-���v�Yv���7B�0O}c�S�"�z��-@����Cr,Z�R��;Z-3B�1�#���㮇�O�/���f�ХX�l� ���Z�^*���KR,"MT�d)L�I�E��Q�ꍳ!w�AT�ovc���Y0�ض��~��y �U��\ͳE����Z���ߜ�~�0�?������^c��g=�nn-yۥg��KsP޽3�n�XCw���Gғ���Ri�|�^��h�5
3��b�Eƹ�|[�Ű���u?�ߡ����"��� ��ܡ7�ѓb1|$~tn��@$�)A�d�A'�$=gJ��$�.���Qt�Y_C�~�>ۙq;q���.:<C\�IZ�w��+�O���&�TL�*o���ȅV�c��]^�{�_.�R^"����V�[`��cum���T��a���X�ɩ�q���K�_�e5�HgHm�Vе�<)�e�՘�u�۔\�F	��/�(%��%n�R%v�k����_8�Z L�R��q���W3T,JR	g#��1�t��Ĵ�Tf�Fwj��?J%?K\��T**�����c�a��Aϓ� ��gJ6GA�=<#�\F��� �o��Z`^r����/Zn)e/�×��G��F�<.V�2!���]`=���8�[~�L��WC��:?���O�����gW�Ł��pY'ft���@>�pF��&H2~���\䘹?�!.�0ܽCT���)!bO���.�,���(���}���x�]�f��E�e<㪪#ղW����tWj�
����V���yM��4v����f�\g�qAo�S�.×�j��	GO��[�28-��M���M�TO�dL>[e��m�'	���@�Q�3ͯ�tw��$$ݴ���ϭf����CP�A�Tlf��N�GA��y)aB�t���h�&Ň� ��΋�6�U1F�G���[c�C��aXL���q��?!V#��#ư��}���4~q��cͤ��g��2P�4�����2̔Q�������	S=��f��!���Y�t�USg]���Pd�=�����:vz��!5	����9w*�N�4�Hʱ�&#6�<��=�\[q�_G�fo��fb��%W�?����K�f����6٫B!��Lc��β�pF�!܋�7\�c���]f�����u��q���r�ϭ�{��j%�Xx�ӗ��+�)�.v�C�=[������M3�+���$i�ӗ��cd����+KƄ�͐�4�ϲ��9��4����;[vN��[#��=��*�+8�v� �ac�C闶��E� ��!��[�����І!?k'��h��čk��ᵈ�p��� ���Hv׶M}�r,���pŭ�b�V��/�x��3���sWr!8���O-��A�`��Ҵ��\�t>�ade���#��d��4�L�3�:[�S�|t�����9_D��:�QI�����=A�����[���Uq�!��^v�t�x��-5�J�Kͪ�Jjf����u����"[X�����_�TѾ6�|p��2��n���B0omZ����ǲ�JF;��#�+H����;���Q���i���H��HEf���p��,�W����ͥ�÷��޼vZ���:�l"���ͧu8����0IJ�͟�F�2?59�,v�K�3�yP���,���Mb�9봆�Yu�X���G�b�/9���F�8M|ѩ��1��p56C��Gm���=���*����&&M�E����	���i^e����K�<0<m�`(��M�v�f�g����:�ՄP)_"��籏�7���<���z�U�D�I+�� pw�sm:'Ci�a����㓁�J'��O��j�~�d'g�<�'��Ս�l`� �]��.[A����m�G-؋r���9jxV=XfxP�o�W�����N�u3��΋�p!R��5���Ta+�~�"�L�$�h1%����x��F�h;�X'�4�g�f���k���4>����:�u��H�fY�']ԡ��V~K��0��.P)��M������O|	"n���}��Y
D����~>U����m�>��Ar��8�)��GE�ra$�\�W���o!�XAN	p&�R�p�H����]S"��je��?Ω����0���'K��9";��h��UМ�x���lUZP܅����Ї���S�B�#!���X�Z� 	�h&jjv���yY��E��3MS�5I;��߶���rE�&ϥ�W�̞�p���kJ�/b���8��/���W[چ�]�H��d�X�����+�Y6��S
Q��,Tyrٽ�JS �.�C��~��v�P!BE�����	}�ڋ�翳jm��1!>��`�>q6d;�I)߾�9�%iOⱦku�J��1�ѝ�y�EKb5E
�c�����(���6��\R�P
��QWf�0Us�x�" 3�����[�%�Fb-�'�~&ErIPhn��^~����Z��J�l������=��A��,�2d��ў|��k[lKB[P2��Wү%сm��������X��@3CEmbX�[$:�
��G)o�j�I���6��Fِz�!��g�t��+�Xꏽ��g-@t��Z��M��xZ�0��R���j�g*v�
�ns��|��<Û�N1ь6�iq�@��'VR�C󗙓+�ʶQ���P��q"$5��'XO�K����B���X�	��KW�ǂJ����i���3���=@�βd?&�^y�X=2�=��&X�<�� ��NF����y˖�p2�(e2Z������ (�#�l����7��cn�;:��{�
��ƴ�b��y�c��a�K=׶�f�e���vۧR�R�Y�=���v�g�T�^p[捍�9��e�}��Y#�釴��H�Mϰ�IpC�u���1z���xt�����sx�IC�٤?m�Q���Ӟ�v��cOk�����C�$�����r��;l�$�й�b�p���``�3AK�,&b\�����rX�FDM�" BR_I�[L�˗'YB�0ߚFY!�s�c¢h�8�3Rb���a��[uu2���F�
���ө�8g>��H�5~"K�1����A�N���� �|D�?��Q�Z�'oZ�����`F�w��
"
y�nC��y��Z�� �ک��#&Ȯ )5��u���f��s����=�Ϯ�<�l���U�^(జ��L���t&�hY��;+Ь�V��So�d*؏_�W����n�:��-�=�\��^���6���3������h �N��Z%�N�~����,x����d�e�	q�`��:�=!>���Qٜ��>">�jD� ma�ߕ��;�~(�e�VML"0��K�&�x'���t4/��)�'��%��8E��p/��\�_�������b���3!�!�����c��t�ػ]~�V/>�A�#�TQ�����K.��XKr>pk����p=��,L�'K��S<?�L婩���K�|�>�vs�cGUk���,�H��5ej/Z�u6�B��f ��(�I�p���\�?^	4���F�r�|���k�ٳI��V��יT8��',;�+�E6���;�p�ӷei�o��_}�u� [�e��ߪcJ엫K��;�k����#�ؤ��.K�'!�@���цO �S��)�O��b���4�I��[�K� l
ew� ��眓lŤ�pr�I�����|��i�B�7���0b]����(�6�3�Zm��e�W�c,�����w6-s~�0V�j�5�����66 ���|��}�<pL��n�Y/Cz$ V�0���Qjp����nI3nIܹ�M\z�1Ιq�F���_�3�ž�0��u��,�Ƀf��UVg��".�D!�`�`�/�� �g���V���R��+��g�YԔ��y̜���]aOa���%�[�x��	���=�'��	1���V�c4~��*;��w%k�q�*���Ä�'�%n�s Ó���k��M���	^*Bg�U���MT��i6��u�����,IU�ʿ4�f6��'���CT�uY,"o�9�#���Bn�n�y�Կ6l]>��9��<#ɤ�����O���=�6L����Sޫ��]8ÿl"���A��B�V[ �OJ���jb�RK1	umF������kfp�Ǭ�.!�tE9���ݖ�t@:�m�\�qk\���BH�y_���Ւ!z}v�s
�G��l��F�=l(�驓;K�biݞ�"�X$v�^G��#L��"�RԾzY��9'w�:��v)((�V����I#��_�)���qf�~��%��8!�t��M�L_��N���`��}�ތ�S
P�ڄ��L��+?��p�6�:��n0��y^\�,c=�!�͆芎������H�OxpaU|w���Ђf2� �����}a��Ջ���>�b/��РEl� w���Q	b�:7(F�����8ׁ�I��~ϣ����P�1D~b����vw�	�@[�G���)�M�;�l��6� ����x���M{��g�6#�x�.�����7n���k�\d]�r�qH �H�C�j������YG���<;�oi�d�B�7M�N�3wy%�nJTX���c^@J�����2�3�qn��6�Ƨ��8P�N%_�_��^ �ç��)����qҗJ]�I��a1�y8|��	���{�c~c�%�l?�¸��ڼ�C�p-�u��O#�PO*3�v��·w������w��F��d�6�)��r�i��o��x-��:�%.@_Ul��&��z)w��F��0[�_��C�D�$mʌ~�G6W�l�+��s�qY�����%T�������kI��<��E2w� ��ȕ`­o�7�{�V��H�<�����������
n������B��?�j;mV���	������РO`��?��j��K k�W��n���&F�w>95�����Z�D�Iup<� �[�@|����Lט�Y뛆a�/x����2�&_)O�x�\���I����D�Q�WT�v������i26B?�R�"v��U���t=&o"��|��|��B��g}ʾ�c<�>IgZ���zz�Pn��JM�����C�v��T���c����쏹�2�Q31Y�{.F�V3��"�[mA�.��;۫nH(FJt�b�+��3F�'O���N!��0�:c��=_m����OM��yb�9-�=s�]��T s=�WH
��.�3��׍�xTϱ�L�\B�p�%���9���H�h�rS�v?�������B~.��u�L4���{t���������'t�֣<�W؆;�>􏮂'�Kb�rc���OU�)��^�bC]qJ�C��g�z[���[�p<n�ɜ�����dr~pXI+�e�W"�Y><j�����<Ԓp����1�����]�&3(E��L���сad�5��\�*N�b!�׽�\a���E��x��,�҄Y�a;=l���|�7�n%Ǉ=�b�X�\���J�6ĭ�_��ux�{���~�f��/_�o8[>ի�X�Ҕ�.�����zK�B������>�t��n���ba�ܕ��F1*˄�"0�n�T4)4�Ņ���|v�('%pG�l^���XN�D�`|��U_&���c�|���I-�w$�lz� e[�>Q}��D)���]���L�Y=�|�{M�����`�ن$.�	�4���+r��W	�I��%�ʄ�ǔ����%+���ąϴ��Xz���!vF'P��!�&�-+��)����6~���^-s�l�]�	�=�����.��.��o����f���M��"v?�*�[�ի<\�tk[!�"a9`D���WM	��;�x��e[����-ޙ����In�T�d���R?1��[(����m�b���P�F0��T�I�;���S�>����ʹ�E�F`���}Ppf#�M�gV�`Y!��`��?W�!�Hk�"V�b��aq����Q�p��,X��nqs��M'Q֣B�}#"&l��,Q_I�1w����mqM(�B�ğ��/��4�Qڨ%rÚL%�i׆Ct/���,ʾ^>FB�~/��2@$r�nI?�b�Ծb���)̹���U����_�u��U��S��Ύ���?j��v�����f��$oE~��r纖�B��T���A[e�Aٓ1����qD ٪#6��v6���I��jWi�Kn���7$nI�!�����½�k�0ʶ"��-�H�T�k���%B�t�����H��g��k���yy?%⏢�������>���s�DI&�D{�9Z�u�Xs�Z0�mtG����:.Lnn>� �R.
<��+!#Zc�7��:��r�b�`v�C���ܙ4��s-��R^�ZŪO����5$�kh���b�v���D��Cm�>?��n��|>�{����Qi h�@�V9v�Ug99>޴a6!��6M��'���c��Y�'�ڢcO��h
g�-`���#6U�c���ܴչӷ��%]fV��s�g圈�]{�%Y�pܧW��M�$'��U\e�6`����28Ȋa4��v�# �܁�0��d�tBH� �����ɐ�1+�W�2�{8�pb�w#�@qwP8�����\����-�q:��E3�r������MЙgW�Z�<�,�2V��3��m����A�G&0��ܦ�j�3������!������D��Au,̧fn���G����^�N[%�hc���qY5��Ϝ�B�O;���v��ǻ��nZ�K��H���DOt���l��
�a{���m�C�b�!鲛?ҷ��!|�o<PK�����L%��B�G��<���6���bu뛫�q[���]u��K.��q!��Aɕ�1�̅v�7%�J��@���9�U�D7�ٷ@���'�[;�b�n��dUTx�*�%|?T{d��Ea�$���U�8]=d�C�����p�BW��ău\�|�F�_�3�1m�PN�}�.�����l�W.��ڣ���#�z�q��g�HD/6I#����*�� �V�5�\ms/�c�e�׸����o���_����p�� �ue2f=?^d��l��)0��~In�t\���fI�ݼ*D仧�6���B�]�9�c� �ʖa��>���J�T�(���n�'��B&�����+���!�R>>��8}�3M?ze�l�_)UYq�Ԩ^�Ŋ�hM�Ek�e�9H����Vdo~7����x��ܐ�A��w,�lw
?��^�D� �
��v$�'�K?���hgQ{nr#��Lc3���B���8�G��Q��5O[���u+�T��T���%M�!�����k����KR�<u�C���e���W#	~&�J1����q~$p�3�@0<���*��#�5����4�XZ�ܜYsA�:�0x�����me��������)��� T
����F����늴f���j���S�Nz-�m�D��^KR2�텁� �^\� ���+���8��&�b(���XTq�,�p�ߨrK�>�&�����:癟��@_��5Z���G_!`���q����ī(宭;��$�����Mܑ��� �ܓ�n�,F.�99��ƅ�{�|6�z��4}hv[��C�u9drZLI��X�C�0{��c؛����Co�.�>�1��`��ښǮi���������5IKP�w�Ƥǥ-,Q�9�O�����n!�P��5�)%�����dOS�@(ᗅ��A��Zj���#^^�(]ii�7��kY��Яљ��B���9�3��3��쒙�;@7����su�n-�:t0���Ǥ�Nħ���M<�f2�F��<wa�k��~Qax��G�<�c�j3/�H�����1P�[��A������I*} ��n��W]X�ܫ�b�\z�K5
��',WA��Ѷ%�3��b��rE���LѪ����]Gׯ9�81��� >}𫕪�1�d�L�L�����1�.�}�e���ȸ6� ���N��:��[)��;�%�[�A�ߍ6�k0��$��
Y�v��˖�(����_ͅ�W�{N-��c����(���v;��K��ݲٻ�A����A�ؤ�EU�+id��̯G�ixW%S��5��)�Q��,tN;5$�m�? bS��X8Ўk#�y�e)���lE����n�L��l��cNev:�!�K/T��C�{֤�֏���B�,l����T6��	�ހ�IG�n��[u;^)z�݊&#�c�`�C��[u�^ʅ���)��G"��GG����8�`�b.:Mqh���UR�5ٰ'.���~�6!����q��5
�sq>�����.��i\Qɾ���v����nz]�G���t�C{�(r�y�^�Gʡ�p�d��ث�/��M],�n,oGı�r�����2��24/<���r�.+�H�W����mh�RASo"IE��]�MsM�׈Zx�v̠�p.h�?��/��B*��[zBl�4�z��r���tV�O��O���K�&)X��f�5e�Z�q��ʣ�}I�"..(\�<�DMn���������P�GKP�& �{�����
uBS�^)q�e���q�Ҹ����Q���j��7128K�9���DfJ+��G�C�*��=K��l��ɑ!;Q ��;WV���䖠�]iu��_�<�b�Gcf�w��Jq�d���TT����ɊO�3e��IçTv� ?,�g��lTb���S櫔ׯt �<ٯ7>���u��Qnerm��Fm�����6qT��\���`�Ңk;T9m]s�W.-��~sյ�%��P��L-�ð�d!<2*j-�wf��M��:=�$�*���twl�V����J�(�9Y)�Q���g�����9�U��9o��j��͈��AR���6\`Ϲ���J���.G⃊پ�J���대��F�O��-]�yo���O�/�_L@�Z��C�?uC�B���(��� �q� ��f����]	8kd�&e#L֠0��?1ũ̢(,�>��RFdc��ꮶSC��F"�4��F��p�Q��(2W���X��;	�H��cH�.7��!�[��ZD��j#�_����B�`�g�*hkx�ud����� ��1���uƙ�-bY#�Y��6bC��ѬX�����P��ð��N:������w�Eo޵�`��au�a���H1�^^�^����紧ҙ�]HEd���^���ܧ����,����v���\8#S�J�t��k����� Y�#���dr�������3f��n_���^��g�&�6�j����r�y�}���9�-�	^�K��ߒS)Z�g�wM��;x"�_�+����7��x���@�s�k@T_8p��O��I�w`I�
-�.	o1��m�(�@���Ghu��1эc�9/�K{��@�{A'ң`=	�z����U�Ui�.W�r�/�x���r��J��>Mv��`��Ua����n^g��4�W=���ߜ�70�4�R���Y�V�[z6���B�S� �ixQ-���N���n�w���_J��@�eđE��C���w8�#6�(����e��Љ>0+3��I�XȪ� ��C��h�O��鋚�ՈO<����)d�⾖_��8O�!����ݔ��՘��%=�JWN�Eջ�
nm|�S�;ܗ��y޴q6��'��͌p=���mL�u����&4�~�#0��웄ym�B����?���}ݓ謱3]�t��R��Tߥ|���������T��#(�s|���D�	���y|���Ȍ�[����כ��M�����C�L=��_��sy�o�J�\xE"��Kq�1O�}h4ޮ����+������Z��^�`!�S�Ü]��08�L���}<}��C��w��8���Ɔ?����B���"�m�����K��5�ѧg|U����Ј�V��-H�EM<����7��q�+�k6���&}_���F�Jc6�6H�(�Mx�C�qǔ����	m(*������cf�[#[W��4HV�a-8��@e�UH��_d�1���K�O��,E��NAE��W�
�=�DV��:.�D�f���,���ǧPY��3�,��P�#�#*�UFN�sphe� n each Draw			set�in's�egHrqgCcn,ba�k.pusb$k+			"bn":�fnUpDcte�vfg/
		)"sJam%"2 &Inf2mation"*II} );			~H)�		jattr( %rolul'stades' !J	IY.atts( &qria-|lvg', 'Po�ku!' );
*			O/ U!cle(ms �escrmcud `i ou kbgo dir
	�&*smptm,gr*n�eble)�attr(h&yzia-descrebev`i'( tit+g_)nd�' )�*		}
	
	hretuzn nW9\;
	}
)
	j	/*"
 + Up`aTe tne()nfo2l�vion<ele�ants an$the(�i;0layJ 2 8 �abal s�bject7`3gtT	ngs dcq�ebl`s re4ting3 o*(ecT� *0 @�eM"gr�f �araT!blec�Apm
I *o�	fulatio. _gNU2datuIn~o`( set4inG{ )	�
�	/�(hmw info7m |�of$�fout xhe!teblG (/	tar(.oca� = q�ttMn��.aanfedtuz�s�i�	yf ( jode#.nemwvd ==5 0   {		fetu�n;		�H
	)ar
�	la�e0 , setting�*gHanotp�eh
�		�tc0t -`��T�i~�s.O�DMst��9Stard+1,�	e�4b != sexTafcs>F~D�s�La9tnd(�m
		Imax`` = sgt|ing3,&n�gco�psTot�l ),		�uoda| 9 �e|vings?fnRecorsD�cPlay(�,J	ou�c��� total 
				me.o.sInfo 
)		l�lg>sinf/Uepty
	mf * to|a-!!9=0�ax -!s
)i��*`Recorl,se AftR`vi�terhnG */�		ow� +=$ ' + lan��sIvfoFimtermD;
	}
			/. Go|v�rt |he mbcVgs
M	ou� +=`lanG.rMnfoQnq4fM�;
)	mtv }0_&nInfoMicso�(!sEttiN&S(`ou|(;*	ver!c`mnB!ck  oQ~g/fnInjOc`llfack:
	)& ( cal�jesk �== Nulh`	�k�		)�t`/`#allrackcaln  seTti~gs.o�NsUansu,
				reTtinc�, s\!r�, eo`< max, �otel owT
	))
		�
I
 ��oe�w)*�d-�0/u )3
�o	

	functio. fnin�oMAsrns * ueupkngs, s6r !	{+�	+/W(dn Iod�lKte scsoLli.u, we Are0an7aowds|artifJ�at 1!�HDisp�ayStaRT!�s us�� only
/� il�e:nal�x	>a{*		I�oplat|er  =settinesffFnsiat^emfer$
		qtar�     0=bs-tu�~Oc._iLi{rl`y���bu*1,
)	dUn       0 sgvtin�a._iDiwpla9Ldngth,*		vir$  !�  $? settin��.nnR�cordwFisplqy ),+		a,l �  !  �",e� ==?�-5;	
	��etujn(slr.
�	2exMqae /_TARt/g, d/bI�tter>cah�  se||in�{, starT /")�
)	�epne�e)o_�n�/g%   fo"ma4�%r/Kall  w!ttkLgs,�qgttings.enDi{ph!qEnD(+`) ).�	repn`ke�kW]IX_�g, @"vopmevter.kahl(�sedt(ngs,�3etti.ns.ffVmc/pesT/tai(	 - ).
)	r�plicu�/_�TAL+G, &ormalter.#`@l( setdafgS,B~is )").K��	reuane(�_PAG�_?`, foRmipte0*ianl($�m�|�loS< ull�=1 : Ma4x.cdil* wteVw"/`len ) (,).		rmp|ace�_XAFD[_/g, ForeiTtuv*kaml( �eTdingr| all ?01 : atxcuIl  vis0? l%n�)`) 9;	i+	*	/).J	"( Vva�"ul% uac,E�'�r lle �9rst0t=m�, a�ding all$feuwc2d& beau}res	 *`$@p!�am [kbju{�}�se\uaogs$d#ta\abjes$s�t�i~gs�ofjest
 *` @memcerof DbtaTI�no#ma�i
� */H	fmjctm/n�_�nInidi`l){m x w�tti.Gs 9
	{
		var i( iDa�, iAjAhsuaRt=settings&yIli4D�s0layST`2|;
		ve�0cklu�Os ? sE|t}ngs.a_cOM�o�r(chumn;
�	fEz F�at�res =settin'w.oF5atures;
	
	/* EnSup(thad$|he�4b le�eata"Hc�fell9%if)|ac,isa@�:/
		if!, !%settcncw.bI~itiall�ed$)({
 �	�u4Tcmeo_�( fuh[tmOn89{*_�nI�hPyanise(!s�|4ingc )9 }<@202 );	�revuv.;
	}
	
		/*1Pho�`Thehdi�b|a9�YTI\ actmoos"*?		_fNEdlMppcgnshtol)csyt�)ncr ;
			/* ui�d and �cac#th` ha�de� / Footer 4O�0tHe�t�b|e`:
		^f�BuildH%AD(0wotDyNGs 	;
	)^D~DrawHead sutti.'�revtin's&aLeAde2�	;
		fnDriwead( revtinec, {ettings.Ao�oteR i;�	J�	/*!Ok�y to chgw*tHcu�{m%th-ng is`d��nG en`n/t "o	_fjPrkbIsS��gE��r�ci(0betuin's,(trud()�
)
I	/* Gylcumate`sazes0b'r g�LuMnw */
�	ib1( fect|2%S.b@utoWklt` )"{
		_F.SaLculatSolqenS�b4hs( setuakgs(i?J	}+	wob(h ip, ILen=cglti�s.me�Gth ;0iiL�N 9�i)� (�{
)	aglU-.�?$b/ld�jr[�]3	
M
Iif"($colsmn.sWifvh�i4{
				cdUmn.nUh.stylg.whd6(�= WgnStaingTjKsw( bolu�n.zWi`th!:�		I=*		}

		/?0�v!tiev�0�s Defiul4 sksting�re�uire$`=���t&s�&o!it> \hg�2obt Vulc�iojH	�+/`will$`o the`trawing"&o2 ws. Mthdr}`se we$`raw \za �ac|e reeardles� od pha
	/?"Ajax sOuvaw - tHmq!al,mgs uh� 4a�|e en look�)nidma�iqef0n�r$Ajex,rmurccng
	// data�(3h�v 'loadinwG me3�age�hysKblyi
	_fnB�Dv`G($sut�aBGS );*	:N	/��S%rvr+r�`% priceqshN��ifit$bketlgTm�as dmod b{ _'h@*ahUpdatoLraw	A!v �ata�rb $]flDataou2su( setpiogs"(�
	)if x detaSr+0!= {c�/0� ;			+ if$therap�s an aj�x skubce`�oad th�$d�tc
			i& ( da0aSzc =$'a*u*' ! {	I	_&~Bu)ldcnaz| sEtting�,!S, f?/c4ion(jqon)�{
					v!r aapa = _fnAj!p�qtaQ�c( suttijg3*"JSon0);
	$��	9// Gkt(t(E%da�!"-�a�l =v�Dk8the tajLE
-		foP (�9=0 ;�M>aD`tA.length 9 i++,) {�			_fnCddData(Sgvtioc3(0ADatai] 	;/		I}*	
				/�rREsiT the inkt isp|ay�bnr goo�i%0kavinG.`wu%6e alre�Dydone
�		M//$`"bilt�r,(and"txerefose(Cledsed i| be4/Se(So$su bee` to!mece
I			?/ )t )r`eib #fresh':		i	setvIjgc.iIj�tuispla9Sart ?mAja�RtaRT;*			_fnRq�p!w( sett�nfs -;
	
)			�fnQroCuskifwFis��cyh wgtti�e3-hFclse )[
)	+�fnI~iw�-mpmete,asEteings, hwmn�);
)	A]$ sepvmB'� )/
		=
		�lvm y
�		_v�qroCmssh:gDa3sma9-(sett)ngu, fals�!);R�			OdnI�itCo|p,ete( qe�tinc�0){	�m
	��
�}	
	�//+�	 : ,vau`T`� |arne foz tHa$gi�s| tidel ed$knG anm required faa4urEs
	x� �@par!m@{ob`ectm OSetpi.gs�dat�Pa"lu~ rlttio�c$orJeCT
+pj  @p�rAi {o�Jecp] Qksol]`XS�F!fb�edtHe wmz6a� that$CkoPdetdd the uab��,(if�USylg�A�aX �owrc�
I *   �it� c�ient-smda pv�cd{sing�(optiOnCn)�) *�  melber��`�Ata�mble#oEpi
	 *�J	f�ncDigN [flAniqBompleuu x wetvi�gs, j�ooi[
		sdttings.bHjmtClmr,%te 9 vrue;
	*�/. n qn(AjaX��oad$7e`no7 h!we!da4# an&tderefore wQn4 tk�ap`�y th% cOLuon
		// wmxiN�*		if �(jsn`i s
I	_f~CdjuspIgluonCA�Yfg) sm\tilgr +;J		t�
hIgNCa�h�EckFirh� {ett)�gq� 'do�nm�AoMpleT�'-!�inHd'd(suttkfgs,�jsoj] -)"	}
	H	f5.ct�mn$_e�La�gthSh`ngu$( w�Vvibgs, w�,$)
y
�q� lan$= parsE	nt8 val$ 1� (;
se\�inwsn�hDisplqyLanwt� =(deN;
	
��U&n\e�ed`O65rfmow(&weT|iocs�);
	
		/ Fire lenmth�ahi,ge evenv
	KnnCaM,backFiZe� sduti�gk, jtnll`%,ejgth', sutp)n&{, lel] )I}J	
)
	/**
�0
 �ejeVate the nodd�reauired gov 5ser dir`}!y lencPhchan'kng
I *! @`aram ;fbje�T}`�ettin�r(d!t�Tab�%s {ew4in's!kb~Ect
	 +"(Hr�twrlC {nodE|!L�sp��y mmlgt
 fgA�u�d oodq) , �Hmembe�of`D aTab|eoAphN	 *+	&unction(_bnF�AtureH�el�ejGt�`  sftt(noq")
Y[�	far
	blises``�$se}pings*.Cda{sqs,		�te"nmId�8= settyngs.WTa�~eId,

�me�u   !-"se��Ings�aLengthMenU(	+Dr0 e`   9 $.I�@rpaY( meju[0]0),�		leng4Hs (=0d3 9$mmnu[0 : mel�,J		l�/nuagg0< f2�*�eNu1] : menu;
Iv!r(s}`eat = ('?selgct/.', {
	 'kqo�&:!� ,   � "u`bmuId.7_leneth3-
		�ria<ContrOlq': tableIL4
I	'c\a{s'8!"�      bNacs%�.sLeNg4h3E�actz		}")

	�nor (nav0m=0,#ian=lengUhs.la^gti +8yej ;!i++ � [
		)�e$ecl{4][ i$] =$~dw [`tion* l!~Wu�gg[iM len%ths[h]�);
�	u
I
	var fir = $('<d�v><lqj!l^><&di>>')*`ddClesw( s~Qsres�sLd.gth )�*	If (�  se�|'ngs,AanDeatur�s.l ),{
)		davY0].id = ta`leID/'_ldnnth�;
		}	
	divnsh)hdr�n /.ap0gne(		setphfes�g�anguage.sLe�gth�en�.replaee(D6[E^]_', sdhectK0]./tuepHTML )	);
C
		�? Can't�}�g prelecu` rbRi%bee Aw yre",mkghT prm�iae |(eiR owN and thm		-/ sEfebencg is(g6ocen fy2tle u�e of!ouU�IP�L�	$�'sude#tg dht�"I)	/Vah /ettiNfs?�iDis`mAqe.gth )
	(	.nhn4)('sx�nge(DT'(`gUnctIon(e) {�	I	�FJencthCha|e�, seut)n��,`$ht�iS-.v)l*) );J	M	_Fn@zaw(�setdY.� );		i|0);	//!U0latE n/b' vAlte Uh�nevEr anytjikg�c�aLfesthe ta�Le�; lenwth	t*3a4tk~g{.nT�bmm8.bao�((�,eofvh.�dT',$�uncTion (o,s lef) j
			if h se|tklg{ ===(r ) [	I$('�elect/� dat(n2an( �en 9;
	�}	} 	;	I	0�turn$�ivK0?
�]	
	
I*#/*(" 
 * n "!�(* * z * *"*dz�r �`*�
�*0*4* *!* * . :��`"�* j * +(*�+ * *"*(* 
 * (a:( * *�:
$j!No4e |xat0most(nf tx�(paginfa�ofic i{ doNd an) &`D3tcTq`l'.dxt.ragEs
� */


	/�*
	`j$Oe�erp|e$�he ~olu re�}ired dor(d=feun� rafi^atim~* .  @pariM {object}�oSettiows"Da4aTabdes Sdtt�n�c"oRject
	 "  �rdpuro{ {~/de} Picijat)on �uat�re Nodg	0j (�m}m"eqof Da4aFgb|u!g�qn*	 *-J	&<.ctioN o&nFegvureHtmlPaginATe (�et~ij�s )
	[H	�tar
��	py0�   ?`uepPhn�c.sPagijqtiooTyyt,		pLufk. � Da41TAblf.ex|x`ge2[ ty�m!],
	Imodebn -ftype�B pltg)n =99`'&unc�io',
			2gd�a�(9 fuhcDion* sutting!$)�{		vjlraW( se4tings"-;
		yl*fO�u -b$('<fivo>$�>aDdClisqh`s�tdi|gsOAlawses.3PagioG4+ tYa$ ![2\,
	�9�eItubes =bwetdinow��cnFeadures#	
		if"((�`mgdErn 	 z
�Htlugin�&nI~I|��SEut�lcs( Fod%, radba();
		}
	
 /� eed p draW*iadlb)c+$�+r!tHe"pc�ifadaon n�F)rct ]n�tAnkE, }/ �pdaue4th% pcginw d	sphay *oJ�)f ((1 beavup}.p )
)	S
	n'de.id � [etti�g�.WTqble	d+'pacanite&	
		'E�4ylonimDriwSalhbesK&p}s!( {
			�"F.":�v}~�uio�( se|pIng� %@sJ	�	kf ( �oder� I�z
						vavJ	I			qpq2t%   0 = Se4vifgs._(LyPplayQtart=
					�Lo  (0$ !05 s%tti.gs.^i�is1layLeVwTh~�			r+rReqorew � setui�gs~fnR�cordSDHsq\sq(i	K		alx   �  $ = ,g� ===%-�,
		i{	pAge  i�nh� 0 >Mati.beil( 3dcrt�. l%n")�
		))	pdges -"a|l$?a1 z MaTh.�eid((visRecoRds 1,un (,(				)b�Ttons!=�Pdtgi.(i`ge. pag�s)n
			A	i$ �en3

	)			f/r ( i=0, ka~=fea�ureS*p�,%.'th ; M4id�`; i++ + �
	�				_foBel`esg� sutvkngsl"'pageBuT�oj'0�	�			
se4tifoS� �%!t�peSp[9], il butdon�, tag%, p�ca{�					�/
			M�
				I�
				`lse!{
)			pl�gin&nnUpd�t'(9{et�yngs, redr�w );
	I	I	}
I,
			"sNemd">$"pag!n1���n"
}�);
	}M
	roturn)o+dm;
	�"	
	
)-**
 * Aedmz)`
�`d�s`,q� Sett{ngs to cHaz�a1dhe(�`ge
 
�!Pp`ram {o"jact} cEUtingS`@EpaDables �evtinwu ochect� +  Dpar�l4{svrkfg|IN�}"ActlonhPav)og ecPm-n��o`pqka: "Dirr�",  treviOuw<*	 j  ( +ne�t"$Or "masv"$nP"Qcfe�nuYber to,jumT vo!(ifTeger�
	 �$!@rarem`[bnkl] re�bqw(Autoeeticedlx$drqu thm upd!tu`oPdn/v
"*  @reT]rf� {cO�l} �r`e pAAe0jer chqngd`( False2- nn!cj!icm
	$+p @=embeo" DataDarle#Api	��&]nbtkOnfn2�weGlA~G%�((sevtinfs, Actin, tedra� i
�	var
	)�ctaRv $   = se4tinor/_iDIqtlayCvqr�/
	Lfv0 0 �� 5 septi~gco_iDmsp|ayeng�x,		fdC:bd�  `=`{utvingw.F~R�corDs@kSpl�Y(�mJ	if"( records =<� 4$}} len =?0/1 )
I	�
	stArt - r��		m�		ghse if *$typm� aCthon ===(#nuices" i
		{*		sTa�th=!acti/o *"lun;*	B!		ij ( sta�p > r%cords$9
	�{
	)		sdibt - 0�
	}I)=
	emsa h�� acvq/d =<!"&�zwt",-	{)	+s4ast ?!1;�		}
	els% )f 
 �ction ==0*Prevk|6sb )J	{
3�art = lg. 6= 0$=*		start = lee":
-	�	0;

	i� (!s4aztd<02 )
-		{
	  s�ast =$0;
	IA]	}
	�%ls% mf , actiO�`==�"ne8p# )
	�
		�ifh`"st1bt + |e�p suCo�`s$)
			{
				sphrt +�#lE��
	�}=
	)elrd$if`$avion"=9�"�a�|!$(	{
	�	spar$ = -ath.flogp� (racwp,s�1i`/ l�n( * |%�{
	�		%\w�
	)�			_�nLOg) sf64ingr p. "Wvk~/wn(pAg��w"ag<ion8 "+acdhon� 52);	}	�	Zy� cH!�ged - �E�tiNgs.�ypirtdaiS<irt '1= sTAr�
		sd4t)jgS.[xDirplcy�t!rt - qt�r�+
	�		hg"((z�!nge�!) s			_fLallbaciFire( suttkne�, nUl�, ?page'<`[sqttenGs] )+*	
		(m& ( zedraw*"�
			^bo��(`sedtingp I;J			}
	}
		IraTuvn changmt:J�}*
* 	%*�
A�$Gejeza�e ��d jkdg rg�}ir%d cor04hm proauqcHnG(lode
 *  @ba2am {��je"tp�e|ti�gs dk4aTa�,ew wettmngs`obZ%cv
I   @re|u2b� {lode} R�o2uws`ns0mnMmlnf
	  $@lEmceroe D`t!Uagle#kipi
 *-
Mfu�suion _vnDuqtwr%@um|Proc'saijg 8 settmngp()
I�*	reut2l  �<�M>;>', {
	)	'idg ) cettInn{:aanFeiturdq.� / Setxif7q.sTebleI`;[zrosecsin�'"�`n�lh,[�		%claQ2/rs�|�ins>oC,a�ser.�Proc�s2ino�		i~0)
!	>ytml("sevtings.oLanguaeu.�PboGesSing(	)	�i�SeR�Cegorf(!set�mng{*.Tafhe )[0_;B}	
		/""
	 *0@Is�lay o� ihde vhe�r6mgessinc i~`�catKr
I "  R0a�m zn�jm�t}ds!tthdes fAteT`�mgsAsedVyngs0ohject
	 
f(@p�ram!sbool}"rhk� ChoW 4he proc�ssing ).$i�a�op (pr}d) �v nov (false)� 
 �bmE,berof Date�able"oIpi	 �/
fun#dion ^lPv?sesrin'disqlax"� setuk��S,(shmw8)J	{Bib�h`we�dinGr./�ueuur�S.bPBOcessije%	 {
��!7mtvi�gs.�3oFmatubes.r)&csu('dy�pley',0sHov ('bl/�k' :`%~ond'0�)		u
)
9]d~Caml"aCk^irM( Cqtty~gR, num�.$/proca�sinc',�[7wttkn�rL s,Ow] )+
	}
��/*j
Y�+ �dd !nx kontr� ulemelts f�p`qHe tcbhe -(stecigicelly Scrolmilg
	*x"@Tara�Zobjeat} �%tt�f's $a|a\�b|eq(qetp�nos0objeaTJ	0*" Arupq�ns {noDE} Nde to a�d t �xe$DKM�	(+  @lekerof LatETablE3o�Pi
�0*+
fufctign _fkG%aturuH�mlTar~e (0se4tifms !
	{
		Tar tcbl� 5 �hSettAngs.oT�bLd)9
	
�I//"Idd�u`% ABIA grye �ode to Txe�tsrne
		tacle.i�tv( 'rnle',('gsid3");
M		.� SaroLing fsoi0hdre On�in
!	vap�s'"k�| = sevtiog;,o[#rkll;
#	�g0( vbrgll$wX ?== 'c &&�sC2nml.sY$?=} ' m {
			z$turN!sertif�s.nD��Le?N		}
	
	I�ab �cromlZ(5"bcr�ll.sX?
	V�r!cb0mllY 5 scrnll:sY;
		var c,��smr0= set�ings.Kl�sses9
	vab8ee�Tio� = rabdu.aha�e�En('a!�tikn'	;�	�var ae�ticnS-de(9 keRqion.eength&7 cA0tio.[4]�Kcptk/nSite �$~}ll
�Ivar Xe!ffrGLone  $(0pab�%[1].snoneLodg falce)")y
		ra, footepK~O.E - %* tA�lf[2].slon�_de(bAlqe#`);
	Hvar d�over = tAbLe.�hyleven%rf�ot')3		v`b _dIw$5�'dyf/>';�	ti�siru = funcp)on �!q ) {
�		rgt5Zn !s ? otll : ~fnS4rin�UCsq (s !;	};
	
	' Dlis`is bAitl](mE3Sy*"ju�`wKt`"x scrkll�ng(Ana`lad<$iv4pke tab�e"h!1 a
	// witp` ev�Wibute, reCab`ness(mg q.y0�Id0hHaxpliof u�i~w �he �olu<n vadTx	//$oPpionS,0�he`2bows�R skn� shrink Or('rn�txe tk�le as`fedFe� to fitbiLtm
'- t`at$007.!T|�t foula(oake the ui`tl1n0tins�e�eleqw. So we bm/+vu it.H	�-4Thau )b mKqy- unler$tx��avwter�i~ �hat(width10!% )�`ipplie  |o tHe*	// � ble �f SS`(it ig in U|e DE�au�t$suyles�ge`) w�ich WIl< sEu |(e tabl%
/� wy$|` as uppRoRR��ye (|heatt"ic�te ejl kcs �elave dif�mrentlx&,&)
	if�((sbrmll.sX && _ajle�c$42'wid�x'9`=}=!3100%'�) {
	Y	t�ble*remmVeet4r('�idth#);*		=N	1	y"   # fo/Peb'lelgt(a)`k
)	gOoter =(n�ll;
		_
�
	/*I� 
 xe LTML�ctructur% thad wm"wanu!to gm
ebaue"in t(is &qoa0io.`is:�	I`*( fiu$- scPoligr*		 * ` di� )0�crol|*l�ad
	�
0! ! "d�v - qcBonl heed`�nn�r
	)* 2 �  t�ble"- sgRonl#hebd!tibl�
�) : (`   d�! u`�au`)axhmabA	 3  $ div m0scb/ll bodq(	 * ! " 0Tache ) 4a*d�` mastuz tcb\%)
�	 �0$C     thEbd"� t(e�$ c,��bO� si:iocJ	 
   �  p tfo�} -"|coey
		 *! "�dkv -sc�Oll bMt
�	"+    � �iv$= scr}ll"Nm�t an�mr�!>`�      t`ble! scRoln foo\ tab�
	 *)  (  0`� tf�o� - t�o�	 */I	var rcbolLeb!5 $( ^di�l { 'clacs'; cLqssus.sScrk|lW�A`pmb m�(B	.append
I	I&i_``t� { 'ceess': chawrds.qScrllHehd$}")
					.cws`{�					nve�v�-w8('hiddel',
��			)pos(tif�z 'rmlETiwe'�
			bovfer>�0,
��	)wiDtX�$ssr?llX  {ize(sc2ol�X+ : �!pe'			i}!)
			)	.atpend(
			(_div, � 'cnccs�28fha�ces*{SarolleAI~nev�} )
			�	c�1( {�	)�			'bo�=�hzi.�; 'konv%jt-b?x',j						+	w)ddh� {czo,o.{HInnez$t� 'q00%')	)			}@)
	�			,a�pend(�		I		�aEdd�Klcle�				�)	�	.ve-oF�Attp(%af'9�	�	�			.c3r(d'ma�Gim-le�u',(4 -"I			)		I	/ap�e�d� cap4ion[ife === 'tot' ?�c`xti/~ 2n}lj iH					.sppend,
i	�		�		}abD�.ch�LDre.('�heal-)
		)�)jI+		)
				)
�	)			.�`peod8
	)I	$ �Div(!z 'clas�e: c�ases.RCbroleB/Dy } )
				�g�s8 S
!			/~erflgw: 'a�tn'$
		�heiw��: [ize( �cro�lY i,(		I-		smtth: syze(${C�nnd )
				i|,)2			!�Appent( �Qbla0)�	)�
M
		if!h fo�Ter"	 �	
ccrol,�rnaxpeFd�.		� �_lmv� s '#|ass+ cla{sec&sQc6mm-Fkt} )�			A<�rs( {
			owDrelnc 'lhd$en'l
K)		�'rter2�p�		IH�witth: scro,mP � Sizg�skrollX) � 39 0%-
				O )
			*c�pend(
II 		%(d}6| Y$'cl�qc': cl�#ses.sScV/lhFOouI�n�2#}�)*		)			.apPen
					)WOmp%rlone�								.re)o�wCwtr(�it')I			-		ncss( 'mCrg�nmluf|.� p$�
AH					.aq�en$(�ceptmofRi�e ==0'fOt�o�o 7 bcp|kon : nwNl09	�	�			.aPpend(
	
)�				table<chilerel('Tfoo�')*		I-H	)
	I	�)	-.		))	+�		I{		}
�		var chi�$veN > Scrolles.chihdQN(-3
	V!20s#v�lhXea�"=$kjildren[ ];	I~Az$3�2ollBkdy2=!bl�l`pmnS1]�
	vab sCrgmlFio� =0boltmr ? #hildvmn[2U ;(null9

		�/$WhMn th� �gdY isCs�nl~ed((vHen$we �|so waf|$to Rb�OLl�t`e headeBs
	�v�h 3crnllPD) k
			,8scrol%IOd�(/O.(`%�cr/ll.DDG, &tnctyn"85i y�		v!R�3crnlh�env 9 Tj9znSCRol�Febp;)*�		wcrollH�ad.{cr�l�le�t = �br|lNebT;
	I	iv , foot�2 ) :�		�	ccroll�oo`rcrnllLeFt"� scb�lhLEft;K	y 		} %{		}�	
��ett{Ngs.nScr~|�He�$"m s�ron�Heil;
�	suttingr..Scso,lbody =�scrol,Fodx?Isettkngq.�SCboL�Nont  scroLlFk�;
		//$Kn �edraw - atie�"Olum.s
		Ce44in'�.!/DraCaldbico.pusj� y
		�2bd ( _fNS#Bg}lDr`},
	"sName"* b{crfling"
	u%	;	
		retqrn Qcro}�e"^0];
	u
		
	
�*j� *"U�date tha"heade�<"docVep an4 bodx |ables�for resyzin'!-`i.a/,com�m	  aDignment.	 �*	 *(�elcome(�o0thd)l�st hOrr�ble"fun�tio~ Da$!Tafme2. The"rroce�� thap Tjiz
	 k funatio^ fglLos �w res�aaLlx�	 ($` 1.0R%Creata$the teb~w0hnside dhg #cR_ld)~w�fi6�) "   2. Takg liva measebum�jtu from th% DOM
)�* $ ;. `0ly�t`a mea3uvemeft[ 4o alien thD c/lu}ks*d+ �4.pCl�cn }q
	 *
$i  `pa`}"{Ofbect]�settings�$ata�ablow!s%tpqngs0objgct*	2*� @eue`mrof$FaTaTab�%#oApa	 �
	funktion _f�Qc�o`Fva�  bstTti�c3 !
	{		./ �)vEL that this�Iw"such a0mofst�r funC|ion,$� Lnt!of fa#aa`las �reesd
	�/ o0tph�and Ked� the minimised(skze$a1�cm%nl aq%`kswirl�
�vAr	�	{#ro�� 0( ! � 9"sutv�ng{.oSarold,
	cbr/ll�  $�( (`= �cronl*rX�
			q``oll�ijfur # = scro�L.rXIv|er,		scroll2    0 ?`scroLh.,			`a�Width   (  0? scsol->kParWidth,�IIdh~Haam�p &(  $=0�	[a�ty�g.�SarllHeAd).
		�divHeaF%vSdaL% = $!vHeederK0]�tqme(J�		l)THmqdcrInner(�!davHtad%�.Children(/lIv'),��		�iv�%afurknfe2Stymm = ��vH�A$e�nner[pݮst}�e�
	I	eivHeAdarTable!��di�H�aDerInner.child:En('ta�le7)%
	�d�tBkd�Ul !( $#5$[eptincs/nQarollBod},
		�tMvFody #  0   M( �dkvH�d�El),
			divBodyStyle   = divBodyEl.style,
			divFooter      = $(settings.nScrollFoot),
			divFooterInner = divFooter.children('div'),
			divFooterTable = divFooterInner.children('table'),
			header         = $(settings.nTHead),
			table          = $(settings.nTable),
			tableEl        = table[0],
			tableStyle     = tableEl.style,
			footer         = settings.nTFoot ? $(settings.nTFoot) : null,
			browser        = settings.oBrowser,
			ie67           = browser.bScrollOversize,
			headerTrgEls, footerTrgEls,
			headerSrcEls, footerSrcEls,
			headerCopy, footerCopy,
			headerWidths=[], footerWidths=[],
			headerContent=[],
			idx, correction, sanityWidth,
			zeroOut = function(nSizer) {
				var style = nSizer.style;
				style.paddingTop = "0";
				style.paddingBottom = "0";
				style.borderTopWidth = "0";
				style.borderBottomWidth = "0";
				style.height = 0;
			};
	
		/*
		 * 1. Re-create the table inside the scrolling div
		 */
	
		// Remove the old minimised thead and tfoot elements in the inner table
		table.children('thead, tfoot').remove();
	
		// Clone the current header and footer elements and then place it into the inner table
		headerCopy = header.clone().prependTo( table );
		headerTrgEls = header.find('tr'); // original header is in its own table
		headerSrcEls = headerCopy.find('tr');
		headerCopy.find('th, td').removeAttr('tabindex');
	
		if ( footer ) {
			footerCopy = footer.clone().prependTo( table );
			footerTrgEls = footer.find('tr'); // the original tfoot is in its own table and must be sized
			footerSrcEls = footerCopy.find('tr');
		}
	
	
		/*
		 * 2. Take live measurements from the DOM - do not alter the DOM itself!
		 */
	
		// Remove old sizing and apply the calculated column widths
		// Get the unique column headers in the newly created (cloned) header. We want to apply the
		// calculated sizes to this header
		if ( ! scrollX )
		{
			divBodyStyle.width = '100%';
			divHeader[0].style.width = '100%';
		}
	
		$.each( _fnGetUniqueThs( settings, headerCopy ), function ( i, el ) {
			idx = _fnVisibleToColumnIndex( settings, i );
			el.style.width = settings.aoColumns[idx].sWidth;
		} );
	
		if ( footer ) {
			_fnApplyToChildren( function(n) {
				n.style.width = "";
			}, footerSrcEls );
		}
	
		// If scroll collapse is enabled, when we put the headers back into the body for sizing, we
		// will end up forcing the scrollbar to appear, making our measurements wrong for when we
		// then hide it (end of this function), so add the header height to the body scroller.
		if ( scroll.bCollapse && scrollY !== "" ) {
			divBodyStyle.height = (divBody[0].offsetHeight + header[0].offsetHeight)+"px";
		}
	
		// Size the table as a whole
		sanityWidth = table.outerWidth();
		if ( scrollX === "" ) {
			// No x scrolling
			tableStyle.width = "100%";
	
			// IE7 will make the width of the table when 100% include the scrollbar
			// - which is shouldn't. When there is a scrollbar we need to take this
			// into account.
			if ( ie67 && (table.find('tbody').height() > divBodyEl.offsetHeight ||
				divBody.css('overflow-y') == "scroll")
			) {
				tableStyle.width = _fnStringToCss( table.outerWidth() - barWidth);
			}
		}
		else
		{
			// x scrolling
			if ( scrollXInner !== "" ) {
				// x scroll inner has been given - use it
				tableStyle.width = _fnStringToCss(scrollXInner);
			}
			else if ( sanityWidth == divBody.width() && divBody.height() < table.height() ) {
				// There is y-scrolling - try to take account of the y scroll bar
				tableStyle.width = _fnStringToCss( sanityWidth-barWidth );
				if ( table.outerWidth() > sanityWidth-barWidth ) {
					// Not possible to take account of it
					tableStyle.width = _fnStringToCss( sanityWidth );
				}
			}
			else {
				// When all else fails
				tableStyle.width = _fnStringToCss( sanityWidth );
			}
		}
	
		// Recalculate the sanity width - now that we've applied the required width,
		// before it was a temporary variable. This is required because the column
		// width calculation is done before this table DOM is created.
		sanityWidth = table.outerWidth();
	
		// Hidden header should have zero height, so remove padding and borders. Then
		// set the width based on the real headers
	
		// Apply all styles in one pass
		_fnApplyToChildren( zeroOut, headerSrcEls );
	
		// Read all widths in next pass
		_fnApplyToChildren( function(nSizer) {
			headerContent.push( nSizer.innerHTML );
			headerWidths.push( _fnStringToCss( $(nSizer).css('width') ) );
		}, headerSrcEls );
	
		// Apply all widths in final pass
		_fnApplyToChildren( function(nToSize, i) {
			nToSize.style.width = headerWidths[i];
		}, headerTrgEls );
	
		$(headerSrcEls).height(0);
	
		/* Same again with the footer if we have one */
		if ( footer )
		{
			_fnApplyToChildren( zeroOut, footerSrcEls );
	
			_fnApplyToChildren( function(nSizer) {
				footerWidths.push( _fnStringToCss( $(nSizer).css('width') ) );
			}, footerSrcEls );
	
			_fnApplyToChildren( function(nToSize, i) {
				nToSize.style.width = footerWidths[i];
			}, footerTrgEls );
	
			$(footerSrcEls).height(0);
		}
	
	
		/*
		 * 3. Apply the measurements
		 */
	
		// "Hide" the header and footer that we used for the sizing. We need to keep
		// the content of the cell so that the width applied to the header and body
		// both match, but we want to hide it completely. We want to also fix their
		// width to what they currently are
		_fnApplyToChildren( function(nSizer, i) {
			nSizer.innerHTML = '<div class="dataTables_sizing" style="height:0;overflow:hidden;">'+headerContent[i]+'</div>';
			nSizer.style.width = headerWidths[i];
		}, headerSrcEls );
	
		if ( footer )
		{
			_fnApplyToChildren( function(nSizer, i) {
				nSizer.innerHTML = "";
				nSizer.style.width = footerWidths[i];
			}, footerSrcEls );
		}
	
		// Sanity check that the table is of a sensible width. If not then we are going to get
		// misalignment - try to prevent this by not allowing the table to shrink below its min width
		if ( table.outerWidth() < sanityWidth )
		{
			// The min width depends upon if we have a vertical scrollbar visible or not */
			correction = ((divBodyEl.scrollHeight > divBodyEl.offsetHeight ||
				divBody.css('overflow-y') == "scroll")) ?
					sanityWidth+barWidth :
					sanityWidth;
	
			// IE6/7 are a law unto themselves...
			if ( ie67 && (divBodyEl.scrollHeight >
				divBodyEl.offsetHeight || divBody.css('overflow-y') == "scroll")
			) {
				tableStyle.width = _fnStringToCss( correction-barWidth );
			}
	
			// And give the user a warning that we've stopped the table getting too small
			if ( scrollX === "" || scrollXInner !== "" ) {
				_fnLog( settings, 1, 'Possible column misalignment', 6 );
			}
		}
		else
		{
			correction = '100%';
		}
	
		// Apply to the container elements
		divBodyStyle.width = _fnStringToCss( correction );
		divHeaderStyle.width = _fnStringToCss( correction );
	
		if ( footer ) {
			settings.nScrollFoot.style.width = _fnStringToCss( correction );
		}
	
	
		/*
		 * 4. Clean up
		 */
		if ( ! scrollY ) {
			/* IE7< puts a vertical scrollbar in place (when it shouldn't be) due to subtracting
			 * the scrollbar height from the visible display, rather than adding it on. We need to
			 * set the height in order to sort this. Don't want to do it in any other browsers.
			 */
			if ( ie67 ) {
				divBodyStyle.height = _fnStringToCss( tableEl.offsetHeight+barWidth );
			}
		}
	
		if ( scrollY && scroll.bCollapse ) {
			divBodyStyle.height = _fnStringToCss( scrollY );
	
			var iExtra = (scrollX && tableEl.offsetWidth > divBodyEl.offsetWidth) ?
				barWidth :
				0;
	
			if ( tableEl.offsetHeight < divBodyEl.offsetHeight ) {
				divBodyStyle.height = _fnStringToCss( tableEl.offsetHeight+iExtra );
			}
		}
	
		/* Finally set the width's of the header and footer tables */
		var iOuterWidth = table.outerWidth();
		divHeaderTable[0].style.width = _fnStringToCss( iOuterWidth );
		divHeaderInnerStyle.width = _fnStringToCss( iOuterWidth );
	
		// Figure out if there are scrollbar present - if so then we need a the header and footer to
		// provide a bit more space to allow "overflow" scrolling (i.e. past the scrollbar)
		var bScrolling = table.height() > divBodyEl.clientHeight || divBody.css('overflow-y') == "scroll";
		var padding = 'padding' + (browser.bScrollbarLeft ? 'Left' : 'Right' );
		divHeaderInnerStyle[ padding ] = bScrolling ? barWidth+"px" : "0px";
	
		if ( footer ) {
			divFooterTable[0].style.width = _fnStringToCss( iOuterWidth );
			divFooterInner[0].style.width = _fnStringToCss( iOuterWidth );
			divFooterInner[0].style[padding] = bScrolling ? barWidth+"px" : "0px";
		}
	
		/* Adjust the position of the header in case we loose the y-scrollbar */
		divBody.scroll();
	
		// If sorting or filtering has occurred, jump the scrolling back to the top
		// only if we aren't holding the position
		if ( (settings.bSorted || settings.bFiltered) && ! settings._drawHold ) {
			divBodyEl.scrollTop = 0;
		}
	}
	
	
	
	/**
	 * Apply a given function to the display child nodes of an element array (typically
	 * TD children of TR rows
	 *  @param {function} fn Method to apply to the objects
	 *  @param array {nodes} an1 List of elements to look through for display children
	 *  @param array {nodes} an2 Another list (identical structure to the first) - optional
	 *  @memberof DataTable#oApi
	 */
	function _fnApplyToChildren( fn, an1, an2 )
	{
		var index=0, i=0, iLen=an1.length;
		var nNode1, nNode2;
	
		while ( i < iLen ) {
			nNode1 = an1[i].firstChild;
			nNode2 = an2 ? an2[i].firstChild : null;
	
			while ( nNode1 ) {
				if ( nNode1.nodeType === 1 ) {
					if ( an2 ) {
						fn( nNode1, nNode2, index );
					}
					else {
						fn( nNode1, index );
					}
	
					index++;
				}
	
				nNode1 = nNode1.nextSibling;
				nNode2 = an2 ? nNode2.nextSibling : null;
			}
	
			i++;
		}
	}
	
	
	
	var __re_html_remove = /<.*?>/g;
	
	
	/**
	 * Calculate the width of columns for the table
	 *  @param {object} oSettings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnCalculateColumnWidths ( oSettings )
	{
		var
			table = oSettings.nTable,
			columns = oSettings.aoColumns,
			scroll = oSettings.oScroll,
			scrollY = scroll.sY,
			scrollX = scroll.sX,
			scrollXInner = scroll.sXInner,
			columnCount = columns.length,
			visibleColumns = _fnGetColumns( oSettings, 'bVisible' ),
			headerCells = $('th', oSettings.nTHead),
			tableWidthAttr = table.style.width || table.getAttribute('width'), // from DOM element
			tableContainer = table.parentNode,
			userInputs = false,
			i, column, columnIdx, width, outerWidth;
	
		/* Convert any user input sizes into pixel sizes */
		for ( i=0 ; i<visibleColumns.length ; i++ ) {
			column = columns[ visibleColumns[i] ];
	
			if ( column.sWidth !== null ) {
				column.sWidth = _fnConvertToWidth( column.sWidthOrig, tableContainer );
	
				userInputs = true;
			}
		}
	
		/* If the number of columns in the DOM equals the number that we have to
		 * process in DataTables, then we can use the offsets that are created by
		 * the web- browser. No custom sizes can be set in order for this to happen,
		 * nor scrolling used
		 */
		if ( ! userInputs && ! scrollX && ! scrollY &&
		    columnCount == _fnVisbleColumns( oSettings ) &&
			columnCount == headerCells.length
		) {
			for ( i=0 ; i<columnCount ; i++ ) {
				columns[i].sWidth = _fnStringToCss( headerCells.eq(i).width() );
			}
		}
		else
		{
			// Otherwise construct a single row table with the widest node in the
			// data, assign any user defined widths, then insert it into the DOM and
			// allow the browser to do all the hard work of calculating table widths
			var tmpTable = $(table).clone() // don't use cloneNode - IE8 will remove events on the main table
				.empty()
				.css( 'visibility', 'hidden' )
				.removeAttr( 'id' )
				.append( $(oSettings.nTHead).clone( false ) )
				.append( $(oSettings.nTFoot).clone( false ) )
				.append( $('<tbody><tr/></tbody>') );
	
			// Remove any assigned widths from the footer (from scrolling)
			tmpTable.find('tfoot th, tfoot td').css('width', '');
	
			var tr = tmpTable.find( 'tbody tr' );
	
			// Apply custom sizing to the cloned header
			headerCells = _fnGetUniqueThs( oSettings, tmpTable.find('thead')[0] );
	
			for ( i=0 ; i<visibleColumns.length ; i++ ) {
				column = columns[ visibleColumns[i] ];
	
				headerCells[i].style.width = column.sWidthOrig !== null && column.sWidthOrig !== '' ?
					_fnStringToCss( column.sWidthOrig ) :
					'';
			}
	
			// Find the widest cell for each column and put it into the table
			if ( oSettings.aoData.length ) {
				for ( i=0 ; i<visibleColumns.length ; i++ ) {
					columnIdx = visibleColumns[i];
					column = columns[ columnIdx ];
	
					$( _fnGetWidestNode( oSettings, columnIdx ) )
						.clone( false )
						.append( column.sContentPadding )
						.appendTo( tr );
				}
			}
	
			// Table has been built, attach to the document so we can work with it
			tmpTable.appendTo( tableContainer );
	
			// When scrolling (X or Y) we want to set the width of the table as 
			// appropriate. However, when not scrolling leave the table width as it
			// is. This results in slightly different, but I think correct behaviour
			if ( scrollX && scrollXInner ) {
				tmpTable.width( scrollXInner );
			}
			else if ( scrollX ) {
				tmpTable.css( 'width', 'auto' );
	
				if ( tmpTable.width() < tableContainer.offsetWidth ) {
					tmpTable.width( tableContainer.offsetWidth );
				}
			}
			else if ( scrollY ) {
				tmpTable.width( tableContainer.offsetWidth );
			}
			else if ( tableWidthAttr ) {
				tmpTable.width( tableWidthAttr );
			}
	
			// Take into account the y scrollbar
			_fnScrollingWidthAdjust( oSettings, tmpTable[0] );
	
			// Browsers need a bit of a hand when a width is assigned to any columns
			// when x-scrolling as they tend to collapse the table to the min-width,
			// even if we sent the column widths. So we need to keep track of what
			// the table width should be by summing the user given values, and the
			// automatic values
			if ( scrollX )
			{
				var total = 0;
	
				for ( i=0 ; i<visibleColumns.length ; i++ ) {
					column = columns[ visibleColumns[i] ];
					outerWidth = $(headerCells[i]).outerWidth();
	
					total += column.sWidthOrig === null ?
						outerWidth :
						parseInt( column.sWidth, 10 ) + outerWidth - $(headerCells[i]).width();
				}
	
				tmpTable.width( _fnStringToCss( total ) );
				table.style.width = _fnStringToCss( total );
			}
	
			// Get the width of each column in the constructed table
			for ( i=0 ; i<visibleColumns.length ; i++ ) {
				column = columns[ visibleColumns[i] ];
				width = $(headerCells[i]).width();
	
				if ( width ) {
					column.sWidth = _fnStringToCss( width );
				}
			}
	
			table.style.width = _fnStringToCss( tmpTable.css('width') );
	
			// Finished with the table - ditch it
			tmpTable.remove();
		}
	
		// If there is a width attr, we want to attach an event listener which
		// allows the table sizing to automatically adjust when the window is
		// resized. Use the width attr rather than CSS, since we can't know if the
		// CSS is a relative value or absolute - DOM read is always px.
		if ( tableWidthAttr ) {
			table.style.width = _fnStringToCss( tableWidthAttr );
		}
	
		if ( (tableWidthAttr || scrollX) && ! oSettings._reszEvt ) {
			$(window).bind('resize.DT-'+oSettings.sInstance, _fnThrottle( function () {
				_fnAdjustColumnSizing( oSettings );
			} ) );
	
			oSettings._reszEvt = true;
		}
	}
	
	
	/**
	 * Throttle the calls to a function. Arguments and context are maintained for
	 * the throttled function
	 *  @param {function} fn Function to be called
	 *  @param {int} [freq=200] call frequency in mS
	 *  @returns {function} wrapped function
	 *  @memberof DataTable#oApi
	 */
	function _fnThrottle( fn, freq ) {
		var
			frequency = freq !== undefined ? freq : 200,
			last,
			timer;
	
		return function () {
			var
				that = this,
				now  = +new Date(),
				args = arguments;
	
			if ( last && now < last + frequency ) {
				clearTimeout( timer );
	
				timer = setTimeout( function () {
					last = undefined;
					fn.apply( that, args );
				}, frequency );
			}
			else {
				last = now;
				fn.apply( that, args );
			}
		};
	}
	
	
	/**
	 * Convert a CSS unit width to pixels (e.g. 2em)
	 *  @param {string} width width to be converted
	 *  @param {node} parent parent to get the with for (required for relative widths) - optional
	 *  @returns {int} width in pixels
	 *  @memberof DataTable#oApi
	 */
	function _fnConvertToWidth ( width, parent )
	{
		if ( ! width ) {
			return 0;
		}
	
		var n = $('<div/>')
			.css( 'width', _fnStringToCss( width ) )
			.appendTo( parent || document.body );
	
		var val = n[0].offsetWidth;
		n.remove();
	
		return val;
	}
	
	
	/**
	 * Adjust a table's width to take account of vertical scroll bar
	 *  @param {object} oSettings dataTables settings object
	 *  @param {node} n table node
	 *  @memberof DataTable#oApi
	 */
	
	function _fnScrollingWidthAdjust ( settings, n )
	{
		var scroll = settings.oScroll;
	
		if ( scroll.sX || scroll.sY ) {
			// When y-scrolling only, we want to remove the width of the scroll bar
			// so the table + scroll bar will fit into the area available, otherwise
			// we fix the table at its current size with no adjustment
			var correction = ! scroll.sX ? scroll.iBarWidth : 0;
			n.style.width = _fnStringToCss( $(n).outerWidth() - correction );
		}
	}
	
	
	/**
	 * Get the widest node
	 *  @param {object} settings dataTables settings object
	 *  @param {int} colIdx column of interest
	 *  @returns {node} widest table node
	 *  @memberof DataTable#oApi
	 */
	function _fnGetWidestNode( settings, colIdx )
	{
		var idx = _fnGetMaxLenString( settings, colIdx );
		if ( idx < 0 ) {
			return null;
		}
	
		var data = settings.aoData[ idx ];
		return ! data.nTr ? // Might not have been created when deferred rendering
			$('<td/>').html( _fnGetCellData( settings, idx, colIdx, 'display' ) )[0] :
			data.anCells[ colIdx ];
	}
	
	
	/**
	 * Get the maximum strlen for each data column
	 *  @param {object} settings dataTables settings object
	 *  @param {int} colIdx column of interest
	 *  @returns {string} max string length for each column
	 *  @memberof DataTable#oApi
	 */
	function _fnGetMaxLenString( settings, colIdx )
	{
		var s, max=-1, maxIdx = -1;
	
		for ( var i=0, ien=settings.aoData.length ; i<ien ; i++ ) {
			s = _fnGetCellData( settings, i, colIdx, 'display' )+'';
			s = s.replace( __re_html_remove, '' );
	
			if ( s.length > max ) {
				max = s.length;
				maxIdx = i;
			}
		}
	
		return maxIdx;
	}
	
	
	/**
	 * Append a CSS unit (only if required) to a string
	 *  @param {string} value to css-ify
	 *  @returns {string} value with css unit
	 *  @memberof DataTable#oApi
	 */
	function _fnStringToCss( s )
	{
		if ( s === null ) {
			return '0px';
		}
	
		if ( typeof s == 'number' ) {
			return s < 0 ?
				'0px' :
				s+'px';
		}
	
		// Check it has a unit character already
		return s.match(/\d$/) ?
			s+'px' :
			s;
	}
	
	
	/**
	 * Get the width of a scroll bar in this browser being used
	 *  @returns {int} width in pixels
	 *  @memberof DataTable#oApi
	 */
	function _fnScrollBarWidth ()
	{
		// On first run a static variable is set, since this is only needed once.
		// Subsequent runs will just use the previously calculated value
		if ( ! DataTable.__scrollbarWidth ) {
			var inner = $('<p/>').css( {
				width: '100%',
				height: 200,
				padding: 0
			} )[0];
	
			var outer = $('<div/>')
				.css( {
					position: 'absolute',
					top: 0,
					left: 0,
					width: 200,
					height: 150,
					padding: 0,
					overflow: 'hidden',
					visibility: 'hidden'
				} )
				.append( inner )
				.appendTo( 'body' );
	
			var w1 = inner.offsetWidth;
			outer.css( 'overflow', 'scroll' );
			var w2 = inner.offsetWidth;
	
			if ( w1 === w2 ) {
				w2 = outer[0].clientWidth;
			}
	
			outer.remove();
	
			DataTable.__scrollbarWidth = w1 - w2;
		}
	
		return DataTable.__scrollbarWidth;
	}
	
	
	
	function _fnSortFlatten ( settings )
	{
		var
			i, iLen, k, kLen,
			aSort = [],
			aiOrig = [],
			aoColumns = settings.aoColumns,
			aDataSort, iCol, sType, srcCol,
			fixed = settings.aaSortingFixed,
			fixedObj = $.isPlainObject( fixed ),
			nestedSort = [],
			add = function ( a ) {
				if ( a.length && ! $.isArray( a[0] ) ) {
					// 1D array
					nestedSort.push( a );
				}
				else {
					// 2D array
					nestedSort.push.apply( nestedSort, a );
				}
			};
	
		// Build the sort array, with pre-fix and post-fix options if they have been
		// specified
		if ( $.isArray( fixed ) ) {
			add( fixed );
		}
	
		if ( fixedObj && fixed.pre ) {
			add( fixed.pre );
		}
	
		add( settings.aaSorting );
	
		if (fixedObj && fixed.post ) {
			add( fixed.post );
		}
	
		for ( i=0 ; i<nestedSort.length ; i++ )
		{
			srcCol = nestedSort[i][0];
			aDataSort = aoColumns[ srcCol ].aDataSort;
	
			for ( k=0, kLen=aDataSort.length ; k<kLen ; k++ )
			{
				iCol = aDataSort[k];
				sType = aoColumns[ iCol ].sType || 'string';
	
				if ( nestedSort[i]._idx === undefined ) {
					nestedSort[i]._idx = $.inArray( nestedSort[i][1], aoColumns[iCol].asSorting );
				}
	
				aSort.push( {
					src:       srcCol,
					col:       iCol,
					dir:       nestedSort[i][1],
					index:     nestedSort[i]._idx,
					type:      sType,
					formatter: DataTable.ext.type.order[ sType+"-pre" ]
				} );
			}
		}
	
		return aSort;
	}
	
	/**
	 * Change the order of the table
	 *  @param {object} oSettings dataTables settings object
	 *  @memberof DataTable#oApi
	 *  @todo This really needs split up!
	 */
	function _fnSort ( oSettings )
	{
		var
			i, ien, iLen, j, jLen, k, kLen,
			sDataType, nTh,
			aiOrig = [],
			oExtSort = DataTable.ext.type.order,
			aoData = oSettings.aoData,
			aoColumns = oSettings.aoColumns,
			aDataSort, data, iCol, sType, oSort,
			formatters = 0,
			sortCol,
			displayMaster = oSettings.aiDisplayMaster,
			aSort;
	
		// Resolve any column types that are unknown due to addition or invalidation
		// @todo Can this be moved into a 'data-ready' handler which is called when
		//   data is going to be used in the table?
		_fnColumnTypes( oSettings );
	
		aSort = _fnSortFlatten( oSettings );
	
		for ( i=0, ien=aSort.length ; i<ien ; i++ ) {
			sortCol = aSort[i];
	
			// Track if we can use the fast sort algorithm
			if ( sortCol.formatter ) {
				formatters++;
			}
	
			// Load the data needed for the sort, for each cell
			_fnSortData( oSettings, sortCol.col );
		}
	
		/* No sorting required if server-side or no sorting array */
		if ( _fnDataSource( oSettings ) != 'ssp' && aSort.length !== 0 )
		{
			// Create a value - key array of the current row positions such that we can use their
			// current position during the sort, if values match, in order to perform stable sorting
			for ( i=0, iLen=displayMaster.length ; i<iLen ; i++ ) {
				aiOrig[ displayMaster[i] ] = i;
			}
	
			/* Do the sort - here we want multi-column sorting based on a given data source (column)
			 * and sorting function (from oSort) in a certain direction. It's reasonably complex to
			 * follow on it's own, but this is what we want (example two column sorting):
			 *  fnLocalSorting = function(a,b){
			 *    var iTest;
			 *    iTest = oSort['string-asc']('data11', 'data12');
			 *      if (iTest !== 0)
			 *        return iTest;
			 *    iTest = oSort['numeric-desc']('data21', 'data22');
			 *    if (iTest !== 0)
			 *      return iTest;
			 *    return oSort['numeric-asc']( aiOrig[a], aiOrig[b] );
			 *  }
			 * Basically we have a test for each sorting column, if the data in that column is equal,
			 * test the next column. If all columns match, then we use a numeric sort on the row
			 * positions in the original data array to provide a stable sort.
			 *
			 * Note - I know it seems excessive to have two sorting methods, but the first is around
			 * 15% faster, so the second is only maintained for backwards compatibility with sorting
			 * methods which do not have a pre-sort formatting function.
			 */
			if ( formatters === aSort.length ) {
				// All sort types have formatting functions
				displayMaster.sort( function ( a, b ) {
					var
						x, y, k, test, sort,
						len=aSort.length,
						dataA = aoData[a]._aSortData,
						dataB = aoData[b]._aSortData;
	
					for ( k=0 ; k<len ; k++ ) {
						sort = aSort[k];
	
						x = dataA[ sort.col ];
						y = dataB[ sort.col ];
	
						test = x<y ? -1 : x>y ? 1 : 0;
						if ( test !== 0 ) {
							return sort.dir === 'asc' ? test : -test;
						}
					}
	
					x = aiOrig[a];
					y = aiOrig[b];
					return x<y ? -1 : x>y ? 1 : 0;
				} );
			}
			else {
				// Depreciated - remove in 1.11 (providing a plug-in option)
				// Not all sort types have formatting methods, so we have to call their sorting
				// methods.
				displayMaster.sort( function ( a, b ) {
					var
						x, y, k, l, test, sort, fn,
						len=aSort.length,
						dataA = aoData[a]._aSortData,
						dataB = aoData[b]._aSortData;
	
					for ( k=0 ; k<len ; k++ ) {
						sort = aSort[k];
	
						x = dataA[ sort.col ];
						y = dataB[ sort.col ];
	
						fn = oExtSort[ sort.type+"-"+sort.dir ] || oExtSort[ "string-"+sort.dir ];
						test = fn( x, y );
						if ( test !== 0 ) {
							return test;
						}
					}
	
					x = aiOrig[a];
					y = aiOrig[b];
					return x<y ? -1 : x>y ? 1 : 0;
				} );
			}
		}
	
		/* Tell the draw function that we have sorted the data */
		oSettings.bSorted = true;
	}
	
	
	function _fnSortAria ( settings )
	{
		var label;
		var nextSort;
		var columns = settings.aoColumns;
		var aSort = _fnSortFlatten( settings );
		var oAria = settings.oLanguage.oAria;
	
		// ARIA attributes - need to loop all columns, to update all (removing old
		// attributes as needed)
		for ( var i=0, iLen=columns.length ; i<iLen ; i++ )
		{
			var col = columns[i];
			var asSorting = col.asSorting;
			var sTitle = col.sTitle.replace( /<.*?>/g, "" );
			var th = col.nTh;
	
			// IE7 is throwing an error when setting these properties with jQuery's
			// attr() and removeAttr() methods...
			th.removeAttribute('aria-sort');
	
			/* In ARIA only the first sorting column can be marked as sorting - no multi-sort option */
			if ( col.bSortable ) {
				if ( aSort.length > 0 && aSort[0].col == i ) {
					th.setAttribute('aria-sort', aSort[0].dir=="asc" ? "ascending" : "descending" );
					nextSort = asSorting[ aSort[0].index+1 ] || asSorting[0];
				}
				else {
					nextSort = asSorting[0];
				}
	
				label = sTitle + ( nextSort === "asc" ?
					oAria.sSortAscending :
					oAria.sSortDescending
				);
			}
			else {
				label = sTitle;
			}
	
			th.setAttribute('aria-label', label);
		}
	}
	
	
	/**
	 * Function to run on user sort request
	 *  @param {object} settings dataTables settings object
	 *  @param {node} attachTo node to attach the handler to
	 *  @param {int} colIdx column sorting index
	 *  @param {boolean} [append=false] Append the requested sort to the existing
	 *    sort if true (i.e. multi-column sort)
	 *  @param {function} [callback] callback function
	 *  @memberof DataTable#oApi
	 */
	function _fnSortListener ( settings, colIdx, append, callback )
	{
		var col = settings.aoColumns[ colIdx ];
		var sorting = settings.aaSorting;
		var asSorting = col.asSorting;
		var nextSortIdx;
		var next = function ( a, overflow ) {
			var idx = a._idx;
			if ( idx === undefined ) {
				idx = $.inArray( a[1], asSorting );
			}
	
			return idx+1 < asSorting.length ?
				idx+1 :
				overflow ?
					null :
					0;
		};
	
		// Convert to 2D array if needed
		if ( typeof sorting[0] === 'number' ) {
			sorting = settings.aaSorting = [ sorting ];
		}
	
		// If appending the sort then we are multi-column sorting
		if ( append && settings.oFeatures.bSortMulti ) {
			// Are we already doing some kind of sort on this column?
			var sortIdx = $.inArray( colIdx, _pluck(sorting, '0') );
	
			if ( sortIdx !== -1 ) {
				// Yes, modify the sort
				nextSortIdx = next( sorting[sortIdx], true );
	
				if ( nextSortIdx === null ) {
					sorting.splice( sortIdx, 1 );
				}
				else {
					sorting[sortIdx][1] = asSorting[ nextSortIdx ];
					sorting[sortIdx]._idx = nextSortIdx;
				}
			}
			else {
				// No sort on this column yet
				sorting.push( [ colIdx, asSorting[0], 0 ] );
				sorting[sorting.length-1]._idx = 0;
			}
		}
		else if ( sorting.length && sorting[0][0] == colIdx ) {
			// Single column - already sorting on this column, modify the sort
			nextSortIdx = next( sorting[0] );
	
			sorting.length = 1;
			sorting[0][1] = asSorting[ nextSortIdx ];
			sorting[0]._idx = nextSortIdx;
		}
		else {
			// Single column - sort only on this column
			sorting.length = 0;
			sorting.push( [ colIdx, asSorting[0] ] );
			sorting[0]._idx = 0;
		}
	
		// Run the sort by calling a full redraw
		_fnReDraw( settings );
	
		// callback used for async user interaction
		if ( typeof callback == 'function' ) {
			callback( settings );
		}
	}
	
	
	/**
	 * Attach a sort handler (click) to a node
	 *  @param {object} settings dataTables settings object
	 *  @param {node} attachTo node to attach the handler to
	 *  @param {int} colIdx column sorting index
	 *  @param {function} [callback] callback function
	 *  @memberof DataTable#oApi
	 */
	function _fnSortAttachListener ( settings, attachTo, colIdx, callback )
	{
		var col = settings.aoColumns[ colIdx ];
	
		_fnBindAction( attachTo, {}, function (e) {
			/* If the column is not sortable - don't to anything */
			if ( col.bSortable === false ) {
				return;
			}
	
			// If processing is enabled use a timeout to allow the processing
			// display to be shown - otherwise to it synchronously
			if ( settings.oFeatures.bProcessing ) {
				_fnProcessingDisplay( settings, true );
	
				setTimeout( function() {
					_fnSortListener( settings, colIdx, e.shiftKey, callback );
	
					// In server-side processing, the draw callback will remove the
					// processing display
					if ( _fnDataSource( settings ) !== 'ssp' ) {
						_fnProcessingDisplay( settings, false );
					}
				}, 0 );
			}
			else {
				_fnSortListener( settings, colIdx, e.shiftKey, callback );
			}
		} );
	}
	
	
	/**
	 * Set the sorting classes on table's body, Note: it is safe to call this function
	 * when bSort and bSortClasses are false
	 *  @param {object} oSettings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnSortingClasses( settings )
	{
		var oldSort = settings.aLastSort;
		var sortClass = settings.oClasses.sSortColumn;
		var sort = _fnSortFlatten( settings );
		var features = settings.oFeatures;
		var i, ien, colIdx;
	
		if ( features.bSort && features.bSortClasses ) {
			// Remove old sorting classes
			for ( i=0, ien=oldSort.length ; i<ien ; i++ ) {
				colIdx = oldSort[i].src;
	
				// Remove column sorting
				$( _pluck( settings.aoData, 'anCells', colIdx ) )
					.removeClass( sortClass + (i<2 ? i+1 : 3) );
			}
	
			// Add new column sorting
			for ( i=0, ien=sort.length ; i<ien ; i++ ) {
				colIdx = sort[i].src;
	
				$( _pluck( settings.aoData, 'anCells', colIdx ) )
					.addClass( sortClass + (i<2 ? i+1 : 3) );
			}
		}
	
		settings.aLastSort = sort;
	}
	
	
	// Get the data to sort a column, be it from cache, fresh (populating the
	// cache), or from a sort formatter
	function _fnSortData( settings, idx )
	{
		// Custom sorting function - provided by the sort data type
		var column = settings.aoColumns[ idx ];
		var customSort = DataTable.ext.order[ column.sSortDataType ];
		var customData;
	
		if ( customSort ) {
			customData = customSort.call( settings.oInstance, settings, idx,
				_fnColumnIndexToVisible( settings, idx )
			);
		}
	
		// Use / populate cache
		var row, cellData;
		var formatter = DataTable.ext.type.order[ column.sType+"-pre" ];
	
		for ( var i=0, ien=settings.aoData.length ; i<ien ; i++ ) {
			row = settings.aoData[i];
	
			if ( ! row._aSortData ) {
				row._aSortData = [];
			}
	
			if ( ! row._aSortData[idx] || customSort ) {
				cellData = customSort ?
					customData[i] : // If there was a custom sort function, use data from there
					_fnGetCellData( settings, i, idx, 'sort' );
	
				row._aSortData[ idx ] = formatter ?
					formatter( cellData ) :
					cellData;
			}
		}
	}
	
	
	
	/**
	 * Save the state of a table
	 *  @param {object} oSettings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnSaveState ( settings )
	{
		if ( !settings.oFeatures.bStateSave || settings.bDestroying )
		{
			return;
		}
	
		/* Store the interesting variables */
		var state = {
			time:    +new Date(),
			start:   settings._iDisplayStart,
			length:  settings._iDisplayLength,
			order:   $.extend( true, [], settings.aaSorting ),
			search:  _fnSearchToCamel( settings.oPreviousSearch ),
			columns: $.map( settings.aoColumns, function ( col, i ) {
				return {
					visible: col.bVisible,
					search: _fnSearchToCamel( settings.aoPreSearchCols[i] )
				};
			} )
		};
	
		_fnCallbackFire( settings, "aoStateSaveParams", 'stateSaveParams', [settings, state] );
	
		settings.oSavedState = state;
		settings.fnStateSaveCallback.call( settings.oInstance, settings, state );
	}
	
	
	/**
	 * Attempt to load a saved table state
	 *  @param {object} oSettings dataTables settings object
	 *  @param {object} oInit DataTables init object so we can override settings
	 *  @memberof DataTable#oApi
	 */
	function _fnLoadState ( settings, oInit )
	{
		var i, ien;
		var columns = settings.aoColumns;
	
		if ( ! settings.oFeatures.bStateSave ) {
			return;
		}
	
		var state = settings.fnStateLoadCallback.call( settings.oInstance, settings );
		if ( ! state || ! state.time ) {
			return;
		}
	
		/* Allow custom and plug-in manipulation functions to alter the saved data set and
		 * cancelling of loading by returning false
		 */
		var abStateLoad = _fnCallbackFire( settings, 'aoStateLoadParams', 'stateLoadParams', [settings, state] );
		if ( $.inArray( false, abStateLoad ) !== -1 ) {
			return;
		}
	
		/* Reject old data */
		var duration = settings.iStateDuration;
		if ( duration > 0 && state.time < +new Date() - (duration*1000) ) {
			return;
		}
	
		// Number of columns have changed - all bets are off, no restore of settings
		if ( columns.length !== state.columns.length ) {
			return;
		}
	
		// Store the saved state so it might be accessed at any time
		settings.oLoadedState = $.extend( true, {}, state );
	
		// Restore key features - todo - for 1.11 this needs to be done by
		// subscribed events
		settings._iDisplayStart    = state.start;
		settings.iInitDisplayStart = state.start;
		settings._iDisplayLength   = state.length;
		settings.aaSorting = [];
	
		// Order
		$.each( state.order, function ( i, col ) {
			settings.aaSorting.push( col[0] >= columns.length ?
				[ 0, col[1] ] :
				col
			);
		} );
	
		// Search
		$.extend( settings.oPreviousSearch, _fnSearchToHung( state.search ) );
	
		// Columns
		for ( i=0, ien=state.columns.length ; i<ien ; i++ ) {
			var col = state.columns[i];
	
			// Visibility
			columns[i].bVisible = col.visible;
	
			// Search
			$.extend( settings.aoPreSearchCols[i], _fnSearchToHung( col.search ) );
		}
	
		_fnCallbackFire( settings, 'aoStateLoaded', 'stateLoaded', [settings, state] );
	}
	
	
	/**
	 * Return the settings object for a particular table
	 *  @param {node} table table we are using as a dataTable
	 *  @returns {object} Settings object - or null if not found
	 *  @memberof DataTable#oApi
	 */
	function _fnSettingsFromNode ( table )
	{
		var settings = DataTable.settings;
		var idx = $.inArray( table, _pluck( settings, 'nTable' ) );
	
		return idx !== -1 ?
			settings[ idx ] :
			null;
	}
	
	
	/**
	 * Log an error message
	 *  @param {object} settings dataTables settings object
	 *  @param {int} level log error messages, or display them to the user
	 *  @param {string} msg error message
	 *  @param {int} tn Technical note id to get more information about the error.
	 *  @memberof DataTable#oApi
	 */
	function _fnLog( settings, level, msg, tn )
	{
		msg = 'DataTables warning: '+
			(settings!==null ? 'table id='+settings.sTableId+' - ' : '')+msg;
	
		if ( tn ) {
			msg += '. For more information about this error, please see '+
			'http://datatables.net/tn/'+tn;
		}
	
		if ( ! level  ) {
			// Backwards compatibility pre 1.10
			var ext = DataTable.ext;
			var type = ext.sErrMode || ext.errMode;
	
			_fnCallbackFire( settings, null, 'error', [ settings, tn, msg ] );
	
			if ( type == 'alert' ) {
				alert( msg );
			}
			else if ( type == 'throw' ) {
				throw new Error(msg);
			}
			else if ( typeof type == 'function' ) {
				type( settings, tn, msg );
			}
		}
		else if ( window.console && console.log ) {
			console.log( msg );
		}
	}
	
	
	/**
	 * See if a property is defined on one object, if so assign it to the other object
	 *  @param {object} ret target object
	 *  @param {object} src source object
	 *  @param {string} name property
	 *  @param {string} [mappedName] name to map too - optional, name used if not given
	 *  @memberof DataTable#oApi
	 */
	function _fnMap( ret, src, name, mappedName )
	{
		if ( $.isArray( name ) ) {
			$.each( name, function (i, val) {
				if ( $.isArray( val ) ) {
					_fnMap( ret, src, val[0], val[1] );
				}
				else {
					_fnMap( ret, src, val );
				}
			} );
	
			return;
		}
	
		if ( mappedName === undefined ) {
			mappedName = name;
		}
	
		if ( src[name] !== undefined ) {
			ret[mappedName] = src[name];
		}
	}
	
	
	/**
	 * Extend objects - very similar to jQuery.extend, but deep copy objects, and
	 * shallow copy arrays. The reason we need to do this, is that we don't want to
	 * deep copy array init values (such as aaSorting) since the dev wouldn't be
	 * able to override them, but we do want to deep copy arrays.
	 *  @param {object} out Object to extend
	 *  @param {object} extender Object from which the properties will be applied to
	 *      out
	 *  @param {boolean} breakRefs If true, then arrays will be sliced to take an
	 *      independent copy with the exception of the `data` or `aaData` parameters
	 *      if they are present. This is so you can pass in a collection to
	 *      DataTables and have that used as your data source without breaking the
	 *      references
	 *  @returns {object} out Reference, just for convenience - out === the return.
	 *  @memberof DataTable#oApi
	 *  @todo This doesn't take account of arrays inside the deep copied objects.
	 */
	function _fnExtend( out, extender, breakRefs )
	{
		var val;
	
		for ( var prop in extender ) {
			if ( extender.hasOwnProperty(prop) ) {
				val = extender[prop];
	
				if ( $.isPlainObject( val ) ) {
					if ( ! $.isPlainObject( out[prop] ) ) {
						out[prop] = {};
					}
					$.extend( true, out[prop], val );
				}
				else if ( breakRefs && prop !== 'data' && prop !== 'aaData' && $.isArray(val) ) {
					out[prop] = val.slice();
				}
				else {
					out[prop] = val;
				}
			}
		}
	
		return out;
	}
	
	
	/**
	 * Bind an event handers to allow a click or return key to activate the callback.
	 * This is good for accessibility since a return on the keyboard will have the
	 * same effect as a click, if the element has focus.
	 *  @param {element} n Element to bind the action to
	 *  @param {object} oData Data object to pass to the triggered function
	 *  @param {function} fn Callback function for when the event is triggered
	 *  @memberof DataTable#oApi
	 */
	function _fnBindAction( n, oData, fn )
	{
		$(n)
			.bind( 'click.DT', oData, function (e) {
					n.blur(); // Remove focus outline for mouse users
					fn(e);
				} )
			.bind( 'keypress.DT', oData, function (e){
					if ( e.which === 13 ) {
						e.preventDefault();
						fn(e);
					}
				} )
			.bind( 'selectstart.DT', function () {
					/* Take the brutal approach to cancelling text selection */
					return false;
				} );
	}
	
	
	/**
	 * Register a callback function. Easily allows a callback function to be added to
	 * an array store of callback functions that can then all be called together.
	 *  @param {object} oSettings dataTables settings object
	 *  @param {string} sStore Name of the array storage for the callbacks in oSettings
	 *  @param {function} fn Function to be called back
	 *  @param {string} sName Identifying name for the callback (i.e. a label)
	 *  @memberof DataTable#oApi
	 */
	function _fnCallbackReg( oSettings, sStore, fn, sName )
	{
		if ( fn )
		{
			oSettings[sStore].push( {
				"fn": fn,
				"sName": sName
			} );
		}
	}
	
	
	/**
	 * Fire callback functions and trigger events. Note that the loop over the
	 * callback array store is done backwards! Further note that you do not want to
	 * fire off triggers in time sensitive applications (for example cell creation)
	 * as its slow.
	 *  @param {object} settings dataTables settings object
	 *  @param {string} callbackArr Name of the array storage for the callbacks in
	 *      oSettings
	 *  @param {string} event Name of the jQuery custom event to trigger. If null no
	 *      trigger is fired
	 *  @param {array} args Array of arguments to pass to the callback function /
	 *      trigger
	 *  @memberof DataTable#oApi
	 */
	function _fnCallbackFire( settings, callbackArr, e, args )
	{
		var ret = [];
	
		if ( callbackArr ) {
			ret = $.map( settings[callbackArr].slice().reverse(), function (val, i) {
				return val.fn.apply( settings.oInstance, args );
			} );
		}
	
		if ( e !== null ) {
			$(settings.nTable).trigger( e+'.dt', args );
		}
	
		return ret;
	}
	
	
	function _fnLengthOverflow ( settings )
	{
		var
			start = settings._iDisplayStart,
			end = settings.fnDisplayEnd(),
			len = settings._iDisplayLength;
	
		/* If we have space to show extra rows (backing up from the end point - then do so */
		if ( start >= end )
		{
			start = end - len;
		}
	
		// Keep the start record on the current page
		start -= (start % len);
	
		if ( len === -1 || start < 0 )
		{
			start = 0;
		}
	
		settings._iDisplayStart = start;
	}
	
	
	function _fnRenderer( settings, type )
	{
		var renderer = settings.renderer;
		var host = DataTable.ext.renderer[type];
	
		if ( $.isPlainObject( renderer ) && renderer[type] ) {
			// Specific renderer for this type. If available use it, otherwise use
			// the default.
			return host[renderer[type]] || host._;
		}
		else if ( typeof renderer === 'string' ) {
			// Common renderer - if there is one available for this type use it,
			// otherwise use the default
			return host[renderer] || host._;
		}
	
		// Use the default
		return host._;
	}
	
	
	/**
	 * Detect the data source being used for the table. Used to simplify the code
	 * a little (ajax) and to make it compress a little smaller.
	 *
	 *  @param {object} settings dataTables settings object
	 *  @returns {string} Data source
	 *  @memberof DataTable#oApi
	 */
	function _fnDataSource ( settings )
	{
		if ( settings.oFeatures.bServerSide ) {
			return 'ssp';
		}
		else if ( settings.ajax || settings.sAjaxSource ) {
			return 'ajax';
		}
		return 'dom';
	}
	

	DataTable = function( options )
	{
		/**
		 * Perform a jQuery selector action on the table's TR elements (from the tbody) and
		 * return the resulting jQuery object.
		 *  @param {string|node|jQuery} sSelector jQuery selector or node collection to act on
		 *  @param {object} [oOpts] Optional parameters for modifying the rows to be included
		 *  @param {string} [oOpts.filter=none] Select TR elements that meet the current filter
		 *    criterion ("applied") or all TR elements (i.e. no filter).
		 *  @param {string} [oOpts.order=current] Order of the TR elements in the processed array.
		 *    Can be either 'current', whereby the current sorting of the table is used, or
		 *    'original' whereby the original order the data was read into the table is used.
		 *  @param {string} [oOpts.page=all] Limit the selection to the currently displayed page
		 *    ("current") or not ("all"). If 'current' is given, then order is assumed to be
		 *    'current' and filter is 'applied', regardless of what they might be given as.
		 *  @returns {object} jQuery object, filtered by the given selector.
		 *  @dtopt API
		 *  @deprecated Since v1.10
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *
		 *      // Highlight every second row
		 *      oTable.$('tr:odd').css('backgroundColor', 'blue');
		 *    } );
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *
		 *      // Filter to rows with 'Webkit' in them, add a background colour and then
		 *      // remove the filter, thus highlighting the 'Webkit' rows only.
		 *      oTable.fnFilter('Webkit');
		 *      oTable.$('tr', {"search": "applied"}).css('backgroundColor', 'blue');
		 *      oTable.fnFilter('');
		 *    } );
		 */
		this.$ = function ( sSelector, oOpts )
		{
			return this.api(true).$( sSelector, oOpts );
		};
		
		
		/**
		 * Almost identical to $ in operation, but in this case returns the data for the matched
		 * rows - as such, the jQuery selector used should match TR row nodes or TD/TH cell nodes
		 * rather than any descendants, so the data can be obtained for the row/cell. If matching
		 * rows are found, the data returned is the original data array/object that was used to
		 * create the row (or a generated array if from a DOM source).
		 *
		 * This method is often useful in-combination with $ where both functions are given the
		 * same parameters and the array indexes will match identically.
		 *  @param {string|node|jQuery} sSelector jQuery selector or node collection to act on
		 *  @param {object} [oOpts] Optional parameters for modifying the rows to be included
		 *  @param {string} [oOpts.filter=none] Select elements that meet the current filter
		 *    criterion ("applied") or all elements (i.e. no filter).
		 *  @param {string} [oOpts.order=current] Order of the data in the processed array.
		 *    Can be either 'current', whereby the current sorting of the table is used, or
		 *    'original' whereby the original order the data was read into the table is used.
		 *  @param {string} [oOpts.page=all] Limit the selection to the currently displayed page
		 *    ("current") or not ("all"). If 'current' is given, then order is assumed to be
		 *    'current' and filter is 'applied', regardless of what they might be given as.
		 *  @returns {array} Data for the matched elements. If any elements, as a result of the
		 *    selector, were not TR, TD or TH elements in the DataTable, they will have a null
		 *    entry in the array.
		 *  @dtopt API
		 *  @deprecated Since v1.10
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *
		 *      // Get the data from the first row in the table
		 *      var data = oTable._('tr:first');
		 *
		 *      // Do something useful with the data
		 *      alert( "First cell is: "+data[0] );
		 *    } );
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *
		 *      // Filter to 'Webkit' and get all data for
		 *      oTable.fnFilter('Webkit');
		 *      var data = oTable._('tr', {"search": "applied"});
		 *
		 *      // Do something with the data
		 *      alert( data.length+" rows matched the search" );
		 *    } );
		 */
		this._ = function ( sSelector, oOpts )
		{
			return this.api(true).rows( sSelector, oOpts ).data();
		};
		
		
		/**
		 * Create a DataTables Api instance, with the currently selected tables for
		 * the Api's context.
		 * @param {boolean} [traditional=false] Set the API instance's context to be
		 *   only the table referred to by the `DataTable.ext.iApiIndex` option, as was
		 *   used in the API presented by DataTables 1.9- (i.e. the traditional mode),
		 *   or if all tables captured in the jQuery object should be used.
		 * @return {DataTables.Api}
		 */
		this.api = function ( traditional )
		{
			return traditional ?
				new _Api(
					_fnSettingsFromNode( this[ _ext.iApiIndex ] )
				) :
				new _Api( this );
		};
		
		
		/**
		 * Add a single new row or multiple rows of data to the table. Please note
		 * that this is suitable for client-side processing only - if you are using
		 * server-side processing (i.e. "bServerSide": true), then to add data, you
		 * must add it to the data source, i.e. the server-side, through an Ajax call.
		 *  @param {array|object} data The data to be added to the table. This can be:
		 *    <ul>
		 *      <li>1D array of data - add a single row with the data provided</li>
		 *      <li>2D array of arrays - add multiple rows in a single call</li>
		 *      <li>object - data object when using <i>mData</i></li>
		 *      <li>array of objects - multiple data objects when using <i>mData</i></li>
		 *    </ul>
		 *  @param {bool} [redraw=true] redraw the table or not
		 *  @returns {array} An array of integers, representing the list of indexes in
		 *    <i>aoData</i> ({@link DataTable.models.oSettings}) that have been added to
		 *    the table.
		 *  @dtopt API
		 *  @deprecated Since v1.10
		 *
		 *  @example
		 *    // Global var for counter
		 *    var giCount = 2;
		 *
		 *    $(document).ready(function() {
		 *      $('#example').dataTable();
		 *    } );
		 *
		 *    function fnClickAddRow() {
		 *      $('#example').dataTable().fnAddData( [
		 *        giCount+".1",
		 *        giCount+".2",
		 *        giCount+".3",
		 *        giCount+".4" ]
		 *      );
		 *
		 *      giCount++;
		 *    }
		 */
		this.fnAddData = function( data, redraw )
		{
			var api = this.api( true );
		
			/* Check if we want to add multiple rows or not */
			var rows = $.isArray(data) && ( $.isArray(data[0]) || $.isPlainObject(data[0]) ) ?
				api.rows.add( data ) :
				api.row.add( data );
		
			if ( redraw === undefined || redraw ) {
				api.draw();
			}
		
			return rows.flatten().toArray();
		};
		
		
		/**
		 * This function will make DataTables recalculate the column sizes, based on the data
		 * contained in the table and the sizes applied to the columns (in the DOM, CSS or
		 * through the sWidth parameter). This can be useful when the width of the table's
		 * parent element changes (for example a window resize).
		 *  @param {boolean} [bRedraw=true] Redraw the table or not, you will typically want to
		 *  @dtopt API
		 *  @deprecated Since v1.10
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable( {
		 *        "sScrollY": "200px",
		 *        "bPaginate": false
		 *      } );
		 *
		 *      $(window).bind('resize', function () {
		 *        oTable.fnAdjustColumnSizing();
		 *      } );
		 *    } );
		 */
		this.fnAdjustColumnSizing = function ( bRedraw )
		{
			var api = this.api( true ).columns.adjust();
			var settings = api.settings()[0];
			var scroll = settings.oScroll;
		
			if ( bRedraw === undefined || bRedraw ) {
				api.draw( false );
			}
			else if ( scroll.sX !== "" || scroll.sY !== "" ) {
				/* If not redrawing, but scrolling, we want to apply the new column sizes anyway */
				_fnScrollDraw( settings );
			}
		};
		
		
		/**
		 * Quickly and simply clear a table
		 *  @param {bool} [bRedraw=true] redraw the table or not
		 *  @dtopt API
		 *  @deprecated Since v1.10
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *
		 *      // Immediately 'nuke' the current rows (perhaps waiting for an Ajax callback...)
		 *      oTable.fnClearTable();
		 *    } );
		 */
		this.fnClearTable = function( bRedraw )
		{
			var api = this.api( true ).clear();
		
			if ( bRedraw === undefined || bRedraw ) {
				api.draw();
			}
		};
		
		
		/**
		 * The exact opposite of 'opening' a row, this function will close any rows which
		 * are currently 'open'.
		 *  @param {node} nTr the table row to 'close'
		 *  @returns {int} 0 on success, or 1 if failed (can't find the row)
		 *  @dtopt API
		 *  @deprecated Since v1.10
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable;
		 *
		 *      // 'open' an information row when a row is clicked on
		 *      $('#example tbody tr').click( function () {
		 *        if ( oTable.fnIsOpen(this) ) {
		 *          oTable.fnClose( this );
		 *        } else {
		 *          oTable.fnOpen( this, "Temporary row opened", "info_row" );
		 *        }
		 *      } );
		 *
		 *      oTable = $('#example').dataTable();
		 *    } );
		 */
		this.fnClose = function( nTr )
		{
			this.api( true ).row( nTr ).child.hide();
		};
		
		
		/**
		 * Remove a row for the table
		 *  @param {mixed} target The index of the row from aoData to be deleted, or
		 *    the TR element you want to delete
		 *  @param {function|null} [callBack] Callback function
		 *  @param {bool} [redraw=true] Redraw the table or not
		 *  @returns {array} The row that was deleted
		 *  @dtopt API
		 *  @deprecated Since v1.10
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *
		 *      // Immediately remove the first row
		 *      oTable.fnDeleteRow( 0 );
		 *    } );
		 */
		this.fnDeleteRow = function( target, callback, redraw )
		{
			var api = this.api( true );
			var rows = api.rows( target );
			var settings = rows.settings()[0];
			var data = settings.aoData[ rows[0][0] ];
		
			rows.remove();
		
			if ( callback ) {
				callback.call( this, settings, data );
			}
		
			if ( redraw === undefined || redraw ) {
				api.draw();
			}
		
			return data;
		};
		
		
		/**
		 * Restore the table to it's original state in the DOM by removing all of DataTables
		 * enhancements, alterations to the DOM structure of the table and event listeners.
		 *  @param {boolean} [remove=false] Completely remove the table from the DOM
		 *  @dtopt API
		 *  @deprecated Since v1.10
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      // This example is fairly pointless in reality, but shows how fnDestroy can be used
		 *      var oTable = $('#example').dataTable();
		 *      oTable.fnDestroy();
		 *    } );
		 */
		this.fnDestroy = function ( remove )
		{
			this.api( true ).destroy( remove );
		};
		
		
		/**
		 * Redraw the table
		 *  @param {bool} [complete=true] Re-filter and resort (if enabled) the table before the draw.
		 *  @dtopt API
		 *  @deprecated Since v1.10
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *
		 *      // Re-draw the table - you wouldn't want to do it here, but it's an example :-)
		 *      oTable.fnDraw();
		 *    } );
		 */
		this.fnDraw = function( complete )
		{
			// Note that this isn't an exact match to the old call to _fnDraw - it takes
			// into account the new data, but can old position.
			this.api( true ).draw( ! complete );
		};
		
		
		/**
		 * Filter the input based on data
		 *  @param {string} sInput String to filter the table on
		 *  @param {int|null} [iColumn] Column to limit filtering to
		 *  @param {bool} [bRegex=false] Treat as regular expression or not
		 *  @param {bool} [bSmart=true] Perform smart filtering or not
		 *  @param {bool} [bShowGlobal=true] Show the input global filter in it's input box(es)
		 *  @param {bool} [bCaseInsensitive=true] Do case-insensitive matching (true) or not (false)
		 *  @dtopt API
		 *  @deprecated Since v1.10
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *
		 *      // Sometime later - filter...
		 *      oTable.fnFilter( 'test string' );
		 *    } );
		 */
		this.fnFilter = function( sInput, iColumn, bRegex, bSmart, bShowGlobal, bCaseInsensitive )
		{
			var api = this.api( true );
		
			if ( iColumn === null || iColumn === undefined ) {
				api.search( sInput, bRegex, bSmart, bCaseInsensitive );
			}
			else {
				api.column( iColumn ).search( sInput, bRegex, bSmart, bCaseInsensitive );
			}
		
			api.draw();
		};
		
		
		/**
		 * Get the data for the whole table, an individual row or an individual cell based on the
		 * provided parameters.
		 *  @param {int|node} [src] A TR row node, TD/TH cell node or an integer. If given as
		 *    a TR node then the data source for the whole row will be returned. If given as a
		 *    TD/TH cell node then iCol will be automatically calculated and the data for the
		 *    cell returned. If given as an integer, then this is treated as the aoData internal
		 *    data index for the row (see fnGetPosition) and the data for that row used.
		 *  @param {int} [col] Optional column index that you want the data of.
		 *  @returns {array|object|string} If mRow is undefined, then the data for all rows is
		 *    returned. If mRow is defined, just data for that row, and is iCol is
		 *    defined, only data for the designated cell is returned.
		 *  @dtopt API
		 *  @deprecated Since v1.10
		 *
		 *  @example
		 *    // Row data
		 *    $(document).ready(function() {
		 *      oTable = $('#example').dataTable();
		 *
		 *      oTable.$('tr').click( function () {
		 *        var data = oTable.fnGetData( this );
		 *        // ... do something with the array / object of data for the row
		 *      } );
		 *    } );
		 *
		 *  @example
		 *    // Individual cell data
		 *    $(document).ready(function() {
		 *      oTable = $('#example').dataTable();
		 *
		 *      oTable.$('td').click( function () {
		 *        var sData = oTable.fnGetData( this );
		 *        alert( 'The cell clicked on had the value of '+sData );
		 *      } );
		 *    } );
		 */
		this.fnGetData = function( src, col )
		{
			var api = this.api( true );
		
			if ( src !== undefined ) {
				var type = src.nodeName ? src.nodeName.toLowerCase() : '';
		
				return col !== undefined || type == 'td' || type == 'th' ?
					api.cell( src, col ).data() :
					api.row( src ).data() || null;
			}
		
			return api.data().toArray();
		};
		
		
		/**
		 * Get an array of the TR nodes that are used in the table's body. Note that you will
		 * typically want to use the '$' API method in preference to this as it is more
		 * flexible.
		 *  @param {int} [iRow] Optional row index for the TR element you want
		 *  @returns {array|node} If iRow is undefined, returns an array of all TR elements
		 *    in the table's body, or iRow is defined, just the TR element requested.
		 *  @dtopt API
		 *  @deprecated Since v1.10
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *
		 *      // Get the nodes from the table
		 *      var nNodes = oTable.fnGetNodes( );
		 *    } );
		 */
		this.fnGetNodes = function( iRow )
		{
			var api = this.api( true );
		
			return iRow !== undefined ?
				api.row( iRow ).node() :
				api.rows().nodes().flatten().toArray();
		};
		
		
		/**
		 * Get the array indexes of a particular cell from it's DOM element
		 * and column index including hidden columns
		 *  @param {node} node this can either be a TR, TD or TH in the table's body
		 *  @returns {int} If nNode is given as a TR, then a single index is returned, or
		 *    if given as a cell, an array of [row index, column index (visible),
		 *    column index (all)] is given.
		 *  @dtopt API
		 *  @deprecated Since v1.10
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      $('#example tbody td').click( function () {
		 *        // Get the position of the current data from the node
		 *        var aPos = oTable.fnGetPosition( this );
		 *
		 *        // Get the data array for this row
		 *        var aData = oTable.fnGetData( aPos[0] );
		 *
		 *        // Update the data array and return the value
		 *        aData[ aPos[1] ] = 'clicked';
		 *        this.innerHTML = 'clicked';
		 *      } );
		 *
		 *      // Init DataTables
		 *      oTable = $('#example').dataTable();
		 *    } );
		 */
		this.fnGetPosition = function( node )
		{
			var api = this.api( true );
			var nodeName = node.nodeName.toUpperCase();
		
			if ( nodeName == 'TR' ) {
				return api.row( node ).index();
			}
			else if ( nodeName == 'TD' || nodeName == 'TH' ) {
				var cell = api.cell( node ).index();
		
				return [
					cell.row,
					cell.columnVisible,
					cell.column
				];
			}
			return null;
		};
		
		
		/**
		 * Check to see if a row is 'open' or not.
		 *  @param {node} nTr the table row to check
		 *  @returns {boolean} true if the row is currently open, false otherwise
		 *  @dtopt API
		 *  @deprecated Since v1.10
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable;
		 *
		 *      // 'open' an information row when a row is clicked on
		 *      $('#example tbody tr').click( function () {
		 *        if ( oTable.fnIsOpen(this) ) {
		 *          oTable.fnClose( this );
		 *        } else {
		 *          oTable.fnOpen( this, "Temporary row opened", "info_row" );
		 *        }
		 *      } );
		 *
		 *      oTable = $('#example').dataTable();
		 *    } );
		 */
		this.fnIsOpen = function( nTr )
		{
			return this.api( true ).row( nTr ).child.isShown();
		};
		
		
		/**
		 * This function will place a new row directly after a row which is currently
		 * on display on the page, with the HTML contents that is passed into the
		 * function. This can be used, for example, to ask for confirmation that a
		 * particular record should be deleted.
		 *  @param {node} nTr The table row to 'open'
		 *  @param {string|node|jQuery} mHtml The HTML to put into the row
		 *  @param {string} sClass Class to give the new TD cell
		 *  @returns {node} The row opened. Note that if the table row passed in as the
		 *    first parameter, is not found in the table, this method will silently
		 *    return.
		 *  @dtopt API
		 *  @deprecated Since v1.10
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable;
		 *
		 *      // 'open' an information row when a row is clicked on
		 *      $('#example tbody tr').click( function () {
		 *        if ( oTable.fnIsOpen(this) ) {
		 *          oTable.fnClose( this );
		 *        } else {
		 *          oTable.fnOpen( this, "Temporary row opened", "info_row" );
		 *        }
		 *      } );
		 *
		 *      oTable = $('#example').dataTable();
		 *    } );
		 */
		this.fnOpen = function( nTr, mHtml, sClass )
		{
			return this.api( true )
				.row( nTr )
				.child( mHtml, sClass )
				.show()
				.child()[0];
		};
		
		
		/**
		 * Change the pagination - provides the internal logic for pagination in a simple API
		 * function. With this function you can have a DataTables table go to the next,
		 * previous, first or last pages.
		 *  @param {string|int} mAction Paging action to take: "first", "previous", "next" or "last"
		 *    or page number to jump to (integer), note that page 0 is the first page.
		 *  @param {bool} [bRedraw=true] Redraw the table or not
		 *  @dtopt API
		 *  @deprecated Since v1.10
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *      oTable.fnPageChange( 'next' );
		 *    } );
		 */
		this.fnPageChange = function ( mAction, bRedraw )
		{
			var api = this.api( true ).page( mAction );
		
			if ( bRedraw === undefined || bRedraw ) {
				api.draw(false);
			}
		};
		
		
		/**
		 * Show a particular column
		 *  @param {int} iCol The column whose display should be changed
		 *  @param {bool} bShow Show (true) or hide (false) the column
		 *  @param {bool} [bRedraw=true] Redraw the table or not
		 *  @dtopt API
		 *  @deprecated Since v1.10
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *
		 *      // Hide the second column after initialisation
		 *      oTable.fnSetColumnVis( 1, false );
		 *    } );
		 */
		this.fnSetColumnVis = function ( iCol, bShow, bRedraw )
		{
			var api = this.api( true ).column( iCol ).visible( bShow );
		
			if ( bRedraw === undefined || bRedraw ) {
				api.columns.adjust().draw();
			}
		};
		
		
		/**
		 * Get the settings for a particular table for external manipulation
		 *  @returns {object} DataTables settings object. See
		 *    {@link DataTable.models.oSettings}
		 *  @dtopt API
		 *  @deprecated Since v1.10
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *      var oSettings = oTable.fnSettings();
		 *
		 *      // Show an example parameter from the settings
		 *      alert( oSettings._iDisplayStart );
		 *    } );
		 */
		this.fnSettings = function()
		{
			return _fnSettingsFromNode( this[_ext.iApiIndex] );
		};
		
		
		/**
		 * Sort the table by a particular column
		 *  @param {int} iCol the data index to sort on. Note that this will not match the
		 *    'display index' if you have hidden data entries
		 *  @dtopt API
		 *  @deprecated Since v1.10
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *
		 *      // Sort immediately with columns 0 and 1
		 *      oTable.fnSort( [ [0,'asc'], [1,'asc'] ] );
		 *    } );
		 */
		this.fnSort = function( aaSort )
		{
			this.api( true ).order( aaSort ).draw();
		};
		
		
		/**
		 * Attach a sort listener to an element for a given column
		 *  @param {node} nNode the element to attach the sort listener to
		 *  @param {int} iColumn the column that a click on this node will sort on
		 *  @param {function} [fnCallback] callback function when sort is run
		 *  @dtopt API
		 *  @deprecated Since v1.10
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *
		 *      // Sort on column 1, when 'sorter' is clicked on
		 *      oTable.fnSortListener( document.getElementById('sorter'), 1 );
		 *    } );
		 */
		this.fnSortListener = function( nNode, iColumn, fnCallback )
		{
			this.api( true ).order.listener( nNode, iColumn, fnCallback );
		};
		
		
		/**
		 * Update a table cell or row - this method will accept either a single value to
		 * update the cell with, an array of values with one element for each column or
		 * an object in the same format as the original data source. The function is
		 * self-referencing in order to make the multi column updates easier.
		 *  @param {object|array|string} mData Data to update the cell/row with
		 *  @param {node|int} mRow TR element you want to update or the aoData index
		 *  @param {int} [iColumn] The column to update, give as null or undefined to
		 *    update a whole row.
		 *  @param {bool} [bRedraw=true] Redraw the table or not
		 *  @param {bool} [bAction=true] Perform pre-draw actions or not
		 *  @returns {int} 0 on success, 1 on error
		 *  @dtopt API
		 *  @deprecated Since v1.10
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *      oTable.fnUpdate( 'Example update', 0, 0 ); // Single cell
		 *      oTable.fnUpdate( ['a', 'b', 'c', 'd', 'e'], $('tbody tr')[0] ); // Row
		 *    } );
		 */
		this.fnUpdate = function( mData, mRow, iColumn, bRedraw, bAction )
		{
			var api = this.api( true );
		
			if ( iColumn === undefined || iColumn === null ) {
				api.row( mRow ).data( mData );
			}
			else {
				api.cell( mRow, iColumn ).data( mData );
			}
		
			if ( bAction === undefined || bAction ) {
				api.columns.adjust();
			}
		
			if ( bRedraw === undefined || bRedraw ) {
				api.draw();
			}
			return 0;
		};
		
		
		/**
		 * Provide a common method for plug-ins to check the version of DataTables being used, in order
		 * to ensure compatibility.
		 *  @param {string} sVersion Version string to check for, in the format "X.Y.Z". Note that the
		 *    formats "X" and "X.Y" are also acceptable.
		 *  @returns {boolean} true if this version of DataTables is greater or equal to the required
		 *    version, or false if this version of DataTales is not suitable
		 *  @method
		 *  @dtopt API
		 *  @deprecated Since v1.10
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *      alert( oTable.fnVersionCheck( '1.9.0' ) );
		 *    } );
		 */
		this.fnVersionCheck = _ext.fnVersionCheck;
		

		var _that = this;
		var emptyInit = options === undefined;
		var len = this.length;

		if ( emptyInit ) {
			options = {};
		}

		this.oApi = this.internal = _ext.internal;

		// Extend with old style plug-in API methods
		for ( var fn in DataTable.ext.internal ) {
			if ( fn ) {
				this[fn] = _fnExternApiFunc(fn);
			}
		}

		this.each(function() {
			// For each initialisation we want to give it a clean initialisation
			// object that can be bashed around
			var o = {};
			var oInit = len > 1 ? // optimisation for single table case
				_fnExtend( o, options, true ) :
				options;

			/*global oInit,_that,emptyInit*/
			var i=0, iLen, j, jLen, k, kLen;
			var sId = this.getAttribute( 'id' );
			var bInitHandedOff = false;
			var defaults = DataTable.defaults;
			var $this = $(this);
			
			
			/* Sanity check */
			if ( this.nodeName.toLowerCase() != 'table' )
			{
				_fnLog( null, 0, 'Non-table node initialisation ('+this.nodeName+')', 2 );
				return;
			}
			
			/* Backwards compatibility for the defaults */
			_fnCompatOpts( defaults );
			_fnCompatCols( defaults.column );
			
			/* Convert the camel-case defaults to Hungarian */
			_fnCamelToHungarian( defaults, defaults, true );
			_fnCamelToHungarian( defaults.column, defaults.column, true );
			
			/* Setting up the initialisation object */
			_fnCamelToHungarian( defaults, $.extend( oInit, $this.data() ) );
			
			
			
			/* Check to see if we are re-initialising a table */
			var allSettings = DataTable.settings;
			for ( i=0, iLen=allSettings.length ; i<iLen ; i++ )
			{
				var s = allSettings[i];
			
				/* Base check on table node */
				if ( s.nTable == this || s.nTHead.parentNode == this || (s.nTFoot && s.nTFoot.parentNode == this) )
				{
					var bRetrieve = oInit.bRetrieve !== undefined ? oInit.bRetrieve : defaults.bRetrieve;
					var bDestroy = oInit.bDestroy !== undefined ? oInit.bDestroy : defaults.bDestroy;
			
					if ( emptyInit || bRetrieve )
					{
						return s.oInstance;
					}
					else if ( bDestroy )
					{
						s.oInstance.fnDestroy();
						break;
					}
					else
					{
						_fnLog( s, 0, 'Cannot reinitialise DataTable', 3 );
						return;
					}
				}
			
				/* If the element we are initialising has the same ID as a table which was previously
				 * initialised, but the table nodes don't match (from before) then we destroy the old
				 * instance by simply deleting it. This is under the assumption that the table has been
				 * destroyed by other methods. Anyone using non-id selectors will need to do this manually
				 */
				if ( s.sTableId == this.id )
				{
					allSettings.splice( i, 1 );
					break;
				}
			}
			
			/* Ensure the table has an ID - required for accessibility */
			if ( sId === null || sId === "" )
			{
				sId = "DataTables_Table_"+(DataTable.ext._unique++);
				this.id = sId;
			}
			
			/* Create the settings object for this table and set some of the default parameters */
			var oSettings = $.extend( true, {}, DataTable.models.oSettings, {
				"nTable":        this,
				"oApi":          _that.internal,
				"oInit":         oInit,
				"sDestroyWidth": $this[0].style.width,
				"sInstance":     sId,
				"sTableId":      sId
			} );
			allSettings.push( oSettings );
			
			// Need to add the instance after the instance after the settings object has been added
			// to the settings array, so we can self reference the table instance if more than one
			oSettings.oInstance = (_that.length===1) ? _that : $this.dataTable();
			
			// Backwards compatibility, before we apply all the defaults
			_fnCompatOpts( oInit );
			
			if ( oInit.oLanguage )
			{
				_fnLanguageCompat( oInit.oLanguage );
			}
			
			// If the length menu is given, but the init display length is not, use the length menu
			if ( oInit.aLengthMenu && ! oInit.iDisplayLength )
			{
				oInit.iDisplayLength = $.isArray( oInit.aLengthMenu[0] ) ?
					oInit.aLengthMenu[0][0] : oInit.aLengthMenu[0];
			}
			
			// Apply the defaults and init options to make a single init object will all
			// options defined from defaults and instance options.
			oInit = _fnExtend( $.extend( true, {}, defaults ), oInit );
			
			
			// Map the initialisation options onto the settings object
			_fnMap( oSettings.oFeatures, oInit, [
				"bPaginate",
				"bLengthChange",
				"bFilter",
				"bSort",
				"bSortMulti",
				"bInfo",
				"bProcessing",
				"bAutoWidth",
				"bSortClasses",
				"bServerSide",
				"bDeferRender"
			] );
			_fnMap( oSettings, oInit, [
				"asStripeClasses",
				"ajax",
				"fnServerData",
				"fnFormatNumber",
				"sServerMethod",
				"aaSorting",
				"aaSortingFixed",
				"aLengthMenu",
				"sPaginationType",
				"sAjaxSource",
				"sAjaxDataProp",
				"iStateDuration",
				"sDom",
				"bSortCellsTop",
				"iTabIndex",
				"fnStateLoadCallback",
				"fnStateSaveCallback",
				"renderer",
				"searchDelay",
				[ "iCookieDuration", "iStateDuration" ], // backwards compat
				[ "oSearch", "oPreviousSearch" ],
				[ "aoSearchCols", "aoPreSearchCols" ],
				[ "iDisplayLength", "_iDisplayLength" ],
				[ "bJQueryUI", "bJUI" ]
			] );
			_fnMap( oSettings.oScroll, oInit, [
				[ "sScrollX", "sX" ],
				[ "sScrollXInner", "sXInner" ],
				[ "sScrollY", "sY" ],
				[ "bScrollCollapse", "bCollapse" ]
			] );
			_fnMap( oSettings.oLanguage, oInit, "fnInfoCallback" );
			
			/* Callback functions which are array driven */
			_fnCallbackReg( oSettings, 'aoDrawCallback',       oInit.fnDrawCallback,      'user' );
			_fnCallbackReg( oSettings, 'aoServerParams',       oInit.fnServerParams,      'user' );
			_fnCallbackReg( oSettings, 'aoStateSaveParams',    oInit.fnStateSaveParams,   'user' );
			_fnCallbackReg( oSettings, 'aoStateLoadParams',    oInit.fnStateLoadParams,   'user' );
			_fnCallbackReg( oSettings, 'aoStateLoaded',        oInit.fnStateLoaded,       'user' );
			_fnCallbackReg( oSettings, 'aoRowCallback',        oInit.fnRowCallback,       'user' );
			_fnCallbackReg( oSettings, 'aoRowCreatedCallback', oInit.fnCreatedRow,        'user' );
			_fnCallbackReg( oSettings, 'aoHeaderCallback',     oInit.fnHeaderCallback,    'user' );
			_fnCallbackReg( oSettings, 'aoFooterCallback',     oInit.fnFooterCallback,    'user' );
			_fnCallbackReg( oSettings, 'aoInitComplete',       oInit.fnInitComplete,      'user' );
			_fnCallbackReg( oSettings, 'aoPreDrawCallback',    oInit.fnPreDrawCallback,   'user' );
			
			var oClasses = oSettings.oClasses;
			
			// @todo Remove in 1.11
			if ( oInit.bJQueryUI )
			{
				/* Use the JUI classes object for display. You could clone the oStdClasses object if
				 * you want to have multiple tables with multiple independent classes
				 */
				$.extend( oClasses, DataTable.ext.oJUIClasses, oInit.oClasses );
			
				if ( oInit.sDom === defaults.sDom && defaults.sDom === "lfrtip" )
				{
					/* Set the DOM to use a layout suitable for jQuery UI's theming */
					oSettings.sDom = '<"H"lfr>t<"F"ip>';
				}
			
				if ( ! oSettings.renderer ) {
					oSettings.renderer = 'jqueryui';
				}
				else if ( $.isPlainObject( oSettings.renderer ) && ! oSettings.renderer.header ) {
					oSettings.renderer.header = 'jqueryui';
				}
			}
			else
			{
				$.extend( oClasses, DataTable.ext.classes, oInit.oClasses );
			}
			$this.addClass( oClasses.sTable );
			
			/* Calculate the scroll bar width and cache it for use later on */
			if ( oSettings.oScroll.sX !== "" || oSettings.oScroll.sY !== "" )
			{
				oSettings.oScroll.iBarWidth = _fnScrollBarWidth();
			}
			if ( oSettings.oScroll.sX === true ) { // Easy initialisation of x-scrolling
				oSettings.oScroll.sX = '100%';
			}
			
			if ( oSettings.iInitDisplayStart === undefined )
			{
				/* Display start point, taking into account the save saving */
				oSettings.iInitDisplayStart = oInit.iDisplayStart;
				oSettings._iDisplayStart = oInit.iDisplayStart;
			}
			
			if ( oInit.iDeferLoading !== null )
			{
				oSettings.bDeferLoading = true;
				var tmp = $.isArray( oInit.iDeferLoading );
				oSettings._iRecordsDisplay = tmp ? oInit.iDeferLoading[0] : oInit.iDeferLoading;
				oSettings._iRecordsTotal = tmp ? oInit.iDeferLoading[1] : oInit.iDeferLoading;
			}
			
			/* Language definitions */
			var oLanguage = oSettings.oLanguage;
			$.extend( true, oLanguage, oInit.oLanguage );
			
			if ( oLanguage.sUrl !== "" )
			{
				/* Get the language definitions from a file - because this Ajax call makes the language
				 * get async to the remainder of this function we use bInitHandedOff to indicate that
				 * _fnInitialise will be fired by the returned Ajax handler, rather than the constructor
				 */
				$.ajax( {
					dataType: 'json',
					url: oLanguage.sUrl,
					success: function ( json ) {
						_fnLanguageCompat( json );
						_fnCamelToHungarian( defaults.oLanguage, json );
						$.extend( true, oLanguage, json );
						_fnInitialise( oSettings );
					},
					error: function () {
						// Error occurred loading language file, continue on as best we can
						_fnInitialise( oSettings );
					}
				} );
				bInitHandedOff = true;
			}
			
			/*
			 * Stripes
			 */
			if ( oInit.asStripeClasses === null )
			{
				oSettings.asStripeClasses =[
					oClasses.sStripeOdd,
					oClasses.sStripeEven
				];
			}
			
			/* Remove row stripe classes if they are already on the table row */
			var stripeClasses = oSettings.asStripeClasses;
			var rowOne = $('tbody tr', this).eq(0);
			if ( $.inArray( true, $.map( stripeClasses, function(el, i) {
				return rowOne.hasClass(el);
			} ) ) !== -1 ) {
				$('tbody tr', this).removeClass( stripeClasses.join(' ') );
				oSettings.asDestroyStripes = stripeClasses.slice();
			}
			
			/*
			 * Columns
			 * See if we should load columns automatically or use defined ones
			 */
			var anThs = [];
			var aoColumnsInit;
			var nThead = this.getElementsByTagName('thead');
			if ( nThead.length !== 0 )
			{
				_fnDetectHeader( oSettings.aoHeader, nThead[0] );
				anThs = _fnGetUniqueThs( oSettings );
			}
			
			/* If not given a column array, generate one with nulls */
			if ( oInit.aoColumns === null )
			{
				aoColumnsInit = [];
				for ( i=0, iLen=anThs.length ; i<iLen ; i++ )
				{
					aoColumnsInit.push( null );
				}
			}
			else
			{
				aoColumnsInit = oInit.aoColumns;
			}
			
			/* Add the columns */
			for ( i=0, iLen=aoColumnsInit.length ; i<iLen ; i++ )
			{
				_fnAddColumn( oSettings, anThs ? anThs[i] : null );
			}
			
			/* Apply the column definitions */
			_fnApplyColumnDefs( oSettings, oInit.aoColumnDefs, aoColumnsInit, function (iCol, oDef) {
				_fnColumnOptions( oSettings, iCol, oDef );
			} );
			
			/* HTML5 attribute detection - build an mData object automatically if the
			 * attributes are found
			 */
			if ( rowOne.length ) {
				var a = function ( cell, name ) {
					return cell.getAttribute( 'data-'+name ) !== null ? name : null;
				};
			
				$.each( _fnGetRowElements( oSettings, rowOne[0] ).cells, function (i, cell) {
					var col = oSettings.aoColumns[i];
			
					if ( col.mData === i ) {
						var sort = a( cell, 'sort' ) || a( cell, 'order' );
						var filter = a( cell, 'filter' ) || a( cell, 'search' );
			
						if ( sort !== null || filter !== null ) {
							col.mData = {
								_:      i+'.display',
								sort:   sort !== null   ? i+'.@data-'+sort   : undefined,
								type:   sort !== null   ? i+'.@data-'+sort   : undefined,
								filter: filter !== null ? i+'.@data-'+filter : undefined
							};
			
							_fnColumnOptions( oSettings, i );
						}
					}
				} );
			}
			
			var features = oSettings.oFeatures;
			
			/* Must be done after everything which can be overridden by the state saving! */
			if ( oInit.bStateSave )
			{
				features.bStateSave = true;
				_fnLoadState( oSettings, oInit );
				_fnCallbackReg( oSettings, 'aoDrawCallback', _fnSaveState, 'state_save' );
			}
			
			
			/*
			 * Sorting
			 * @todo For modularisation (1.11) this needs to do into a sort start up handler
			 */
			
			// If aaSorting is not defined, then we use the first indicator in asSorting
			// in case that has been altered, so the default sort reflects that option
			if ( oInit.aaSorting === undefined )
			{
				var sorting = oSettings.aaSorting;
				for ( i=0, iLen=sorting.length ; i<iLen ; i++ )
				{
					sorting[i][1] = oSettings.aoColumns[ i ].asSorting[0];
				}
			}
			
			/* Do a first pass on the sorting classes (allows any size changes to be taken into
			 * account, and also will apply sorting disabled classes if disabled
			 */
			_fnSortingClasses( oSettings );
			
			if ( features.bSort )
			{
				_fnCallbackReg( oSettings, 'aoDrawCallback', function () {
					if ( oSettings.bSorted ) {
						var aSort = _fnSortFlatten( oSettings );
						var sortedColumns = {};
			
						$.each( aSort, function (i, val) {
							sortedColumns[ val.src ] = val.dir;
						} );
			
						_fnCallbackFire( oSettings, null, 'order', [oSettings, aSort, sortedColumns] );
						_fnSortAria( oSettings );
					}
				} );
			}
			
			_fnCallbackReg( oSettings, 'aoDrawCallback', function () {
				if ( oSettings.bSorted || _fnDataSource( oSettings ) === 'ssp' || features.bDeferRender ) {
					_fnSortingClasses( oSettings );
				}
			}, 'sc' );
			
			
			/*
			 * Final init
			 * Cache the header, body and footer as required, creating them if needed
			 */
			
			/* Browser support detection */
			_fnBrowserDetect( oSettings );
			
			// Work around for Webkit bug 83867 - store the caption-side before removing from doc
			var captions = $this.children('caption').each( function () {
				this._captionSide = $this.css('caption-side');
			} );
			
			var thead = $this.children('thead');
			if ( thead.length === 0 )
			{
				thead = $('<thead/>').appendTo(this);
			}
			oSettings.nTHead = thead[0];
			
			var tbody = $this.children('tbody');
			if ( tbody.length === 0 )
			{
				tbody = $('<tbody/>').appendTo(this);
			}
			oSettings.nTBody = tbody[0];
			
			var tfoot = $this.children('tfoot');
			if ( tfoot.length === 0 && captions.length > 0 && (oSettings.oScroll.sX !== "" || oSettings.oScroll.sY !== "") )
			{
				// If we are a scrolling table, and no footer has been given, then we need to create
				// a tfoot element for the caption element to be appended to
				tfoot = $('<tfoot/>').appendTo(this);
			}
			
			if ( tfoot.length === 0 || tfoot.children().length === 0 ) {
				$this.addClass( oClasses.sNoFooter );
			}
			else if ( tfoot.length > 0 ) {
				oSettings.nTFoot = tfoot[0];
				_fnDetectHeader( oSettings.aoFooter, oSettings.nTFoot );
			}
			
			/* Check if there is data passing into the constructor */
			if ( oInit.aaData )
			{
				for ( i=0 ; i<oInit.aaData.length ; i++ )
				{
					_fnAddData( oSettings, oInit.aaData[ i ] );
				}
			}
			else if ( oSettings.bDeferLoading || _fnDataSource( oSettings ) == 'dom' )
			{
				/* Grab the data from the page - only do this when deferred loading or no Ajax
				 * source since there is no point in reading the DOM data if we are then going
				 * to replace it with Ajax data
				 */
				_fnAddTr( oSettings, $(oSettings.nTBody).children('tr') );
			}
			
			/* Copy the data index array */
			oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();
			
			/* Initialisation complete - table can be drawn */
			oSettings.bInitialised = true;
			
			/* Check if we need to initialise the table (it might not have been handed off to the
			 * language processor)
			 */
			if ( bInitHandedOff === false )
			{
				_fnInitialise( oSettings );
			}
		} );
		_that = null;
		return this;
	};

	
	
	/**
	 * Computed structure of the DataTables API, defined by the options passed to
	 * `DataTable.Api.register()` when building the API.
	 *
	 * The structure is built in order to speed creation and extension of the Api
	 * objects since the extensions are effectively pre-parsed.
	 *
	 * The array is an array of objects with the following structure, where this
	 * base array represents the Api prototype base:
	 *
	 *     [
	 *       {
	 *         name:      'data'                -- string   - Property name
	 *         val:       function () {},       -- function - Api method (or undefined if just an object
	 *         methodExt: [ ... ],              -- array    - Array of Api object definitions to extend the method result
	 *         propExt:   [ ... ]               -- array    - Array of Api object definitions to extend the property
	 *       },
	 *       {
	 *         name:     'row'
	 *         val:       {},
	 *         methodExt: [ ... ],
	 *         propExt:   [
	 *           {
	 *             name:      'data'
	 *             val:       function () {},
	 *             methodExt: [ ... ],
	 *             propExt:   [ ... ]
	 *           },
	 *           ...
	 *         ]
	 *       }
	 *     ]
	 *
	 * @type {Array}
	 * @ignore
	 */
	var __apiStruct = [];
	
	
	/**
	 * `Array.prototype` reference.
	 *
	 * @type object
	 * @ignore
	 */
	var __arrayProto = Array.prototype;
	
	
	/**
	 * Abstraction for `context` parameter of the `Api` constructor to allow it to
	 * take several different forms for ease of use.
	 *
	 * Each of the input parameter types will be converted to a DataTables settings
	 * object where possible.
	 *
	 * @param  {string|node|jQuery|object} mixed DataTable identifier. Can be one
	 *   of:
	 *
	 *   * `string` - jQuery selector. Any DataTables' matching the given selector
	 *     with be found and used.
	 *   * `node` - `TABLE` node which has already been formed into a DataTable.
	 *   * `jQuery` - A jQuery object of `TABLE` nodes.
	 *   * `object` - DataTables settings object
	 *   * `DataTables.Api` - API instance
	 * @return {array|null} Matching DataTables settings objects. `null` or
	 *   `undefined` is returned if no matching DataTable is found.
	 * @ignore
	 */
	var _toSettings = function ( mixed )
	{
		var idx, jq;
		var settings = DataTable.settings;
		var tables = $.map( settings, function (el, i) {
			return el.nTable;
		} );
	
		if ( ! mixed ) {
			return [];
		}
		else if ( mixed.nTable && mixed.oApi ) {
			// DataTables settings object
			return [ mixed ];
		}
		else if ( mixed.nodeName && mixed.nodeName.toLowerCase() === 'table' ) {
			// Table node
			idx = $.inArray( mixed, tables );
			return idx !== -1 ? [ settings[idx] ] : null;
		}
		else if ( mixed && typeof mixed.settings === 'function' ) {
			return mixed.settings().toArray();
		}
		else if ( typeof mixed === 'string' ) {
			// jQuery selector
			jq = $(mixed);
		}
		else if ( mixed instanceof $ ) {
			// jQuery object (also DataTables instance)
			jq = mixed;
		}
	
		if ( jq ) {
			return jq.map( function(i) {
				idx = $.inArray( this, tables );
				return idx !== -1 ? settings[idx] : null;
			} ).toArray();
		}
	};
	
	
	/**
	 * DataTables API class - used to control and interface with  one or more
	 * DataTables enhanced tables.
	 *
	 * The API class is heavily based on jQuery, presenting a chainable interface
	 * that you can use to interact with tables. Each instance of the API class has
	 * a "context" - i.e. the tables that it will operate on. This could be a single
	 * table, all tables on a page or a sub-set thereof.
	 *
	 * Additionally the API is designed to allow you to easily work with the data in
	 * the tables, retrieving and manipulating it as required. This is done by
	 * presenting the API class as an array like interface. The contents of the
	 * array depend upon the actions requested by each method (for example
	 * `rows().nodes()` will return an array of nodes, while `rows().data()` will
	 * return an array of objects or arrays depending upon your table's
	 * configuration). The API object has a number of array like methods (`push`,
	 * `pop`, `reverse` etc) as well as additional helper methods (`each`, `pluck`,
	 * `unique` etc) to assist your working with the data held in a table.
	 *
	 * Most methods (those which return an Api instance) are chainable, which means
	 * the return from a method call also has all of the methods available that the
	 * top level object had. For example, these two calls are equivalent:
	 *
	 *     // Not chained
	 *     api.row.add( {...} );
	 *     api.draw();
	 *
	 *     // Chained
	 *     api.row.add( {...} ).draw();
	 *
	 * @class DataTable.Api
	 * @param {array|object|string|jQuery} context DataTable identifier. This is
	 *   used to define which DataTables enhanced tables this API will operate on.
	 *   Can be one of:
	 *
	 *   * `string` - jQuery selector. Any DataTables' matching the given selector
	 *     with be found and used.
	 *   * `node` - `TABLE` node which has already been formed into a DataTable.
	 *   * `jQuery` - A jQuery object of `TABLE` nodes.
	 *   * `object` - DataTables settings object
	 * @param {array} [data] Data to initialise the Api instance with.
	 *
	 * @example
	 *   // Direct initialisation during DataTables construction
	 *   var api = $('#example').DataTable();
	 *
	 * @example
	 *   // Initialisation using a DataTables jQuery object
	 *   var api = $('#example').dataTable().api();
	 *
	 * @example
	 *   // Initialisation as a constructor
	 *   var api = new $.fn.DataTable.Api( 'table.dataTable' );
	 */
	_Api = function ( context, data )
	{
		if ( ! this instanceof _Api ) {
			throw 'DT API must be constructed as a new object';
			// or should it do the 'new' for the caller?
			// return new _Api.apply( this, arguments );
		}
	
		var settings = [];
		var ctxSettings = function ( o ) {
			var a = _toSettings( o );
			if ( a ) {
				settings.push.apply( settings, a );
			}
		};
	
		if ( $.isArray( context ) ) {
			for ( var i=0, ien=context.length ; i<ien ; i++ ) {
				ctxSettings( context[i] );
			}
		}
		else {
			ctxSettings( context );
		}
	
		// Remove duplicates
		this.context = _unique( settings );
	
		// Initial data
		if ( data ) {
			this.push.apply( this, data.toArray ? data.toArray() : data );
		}
	
		// selector
		this.selector = {
			rows: null,
			cols: null,
			opts: null
		};
	
		_Api.extend( this, this, __apiStruct );
	};
	
	DataTable.Api = _Api;
	
	_Api.prototype = /** @lends DataTables.Api */{
		/**
		 * Return a new Api instance, comprised of the data held in the current
		 * instance, join with the other array(s) and/or value(s).
		 *
		 * An alias for `Array.prototype.concat`.
		 *
		 * @type method
		 * @param {*} value1 Arrays and/or values to concatenate.
		 * @param {*} [...] Additional arrays and/or values to concatenate.
		 * @returns {DataTables.Api} New API instance, comprising of the combined
		 *   array.
		 */
		concat:  __arrayProto.concat,
	
	
		context: [], // array of table settings objects
	
	
		each: function ( fn )
		{
			for ( var i=0, ien=this.length ; i<ien; i++ ) {
				fn.call( this, this[i], i, this );
			}
	
			return this;
		},
	
	
		eq: function ( idx )
		{
			var ctx = this.context;
	
			return ctx.length > idx ?
				new _Api( ctx[idx], this[idx] ) :
				null;
		},
	
	
		filter: function ( fn )
		{
			var a = [];
	
			if ( __arrayProto.filter ) {
				a = __arrayProto.filter.call( this, fn, this );
			}
			else {
				// Compatibility for browsers without EMCA-252-5 (JS 1.6)
				for ( var i=0, ien=this.length ; i<ien ; i++ ) {
					if ( fn.call( this, this[i], i, this ) ) {
						a.push( this[i] );
					}
				}
			}
	
			return new _Api( this.context, a );
		},
	
	
		flatten: function ()
		{
			var a = [];
			return new _Api( this.context, a.concat.apply( a, this.toArray() ) );
		},
	
	
		join:    __arrayProto.join,
	
	
		indexOf: __arrayProto.indexOf || function (obj, start)
		{
			for ( var i=(start || 0), ien=this.length ; i<ien ; i++ ) {
				if ( this[i] === obj ) {
					return i;
				}
			}
			return -1;
		},
	
		// Note that `alwaysNew` is internal - use iteratorNew externally
		iterator: function ( flatten, type, fn, alwaysNew ) {
			var
				a = [], ret,
				i, ien, j, jen,
				context = this.context,
				rows, items, item,
				selector = this.selector;
	
			// Argument shifting
			if ( typeof flatten === 'string' ) {
				alwaysNew = fn;
				fn = type;
				type = flatten;
				flatten = false;
			}
	
			for ( i=0, ien=context.length ; i<ien ; i++ ) {
				var apiInst = new _Api( context[i] );
	
				if ( type === 'table' ) {
					ret = fn.call( apiInst, context[i], i );
	
					if ( ret !== undefined ) {
						a.push( ret );
					}
				}
				else if ( type === 'columns' || type === 'rows' ) {
					// this has same length as context - one entry for each table
					ret = fn.call( apiInst, context[i], this[i], i );
	
					if ( ret !== undefined ) {
						a.push( ret );
					}
				}
				else if ( type === 'column' || type === 'column-rows' || type === 'row' || type === 'cell' ) {
					// columns and rows share the same structure.
					// 'this' is an array of column indexes for each context
					items = this[i];
	
					if ( type === 'column-rows' ) {
						rows = _selector_row_indexes( context[i], selector.opts );
					}
	
					for ( j=0, jen=items.length ; j<jen ; j++ ) {
						item = items[j];
	
						if ( type === 'cell' ) {
							ret = fn.call( apiInst, context[i], item.row, item.column, i, j );
						}
						else {
							ret = fn.call( apiInst, context[i], item, i, j, rows );
						}
	
						if ( ret !== undefined ) {
							a.push( ret );
						}
					}
				}
			}
	
			if ( a.length || alwaysNew ) {
				var api = new _Api( context, flatten ? a.concat.apply( [], a ) : a );
				var apiSelector = api.selector;
				apiSelector.rows = selector.rows;
				apiSelector.cols = selector.cols;
				apiSelector.opts = selector.opts;
				return api;
			}
			return this;
		},
	
	
		lastIndexOf: __arrayProto.lastIndexOf || function (obj, start)
		{
			// Bit cheeky...
			return this.indexOf.apply( this.toArray.reverse(), arguments );
		},
	
	
		length:  0,
	
	
		map: function ( fn )
		{
			var a = [];
	
			if ( __arrayProto.map ) {
				a = __arrayProto.map.call( this, fn, this );
			}
			else {
				// Compatibility for browsers without EMCA-252-5 (JS 1.6)
				for ( var i=0, ien=this.length ; i<ien ; i++ ) {
					a.push( fn.call( this, this[i], i ) );
				}
			}
	
			return new _Api( this.context, a );
		},
	
	
		pluck: function ( prop )
		{
			return this.map( function ( el ) {
				return el[ prop ];
			} );
		},
	
		pop:     __arrayProto.pop,
	
	
		push:    __arrayProto.push,
	
	
		// Does not return an API instance
		reduce: __arrayProto.reduce || function ( fn, init )
		{
			return _fnReduce( this, fn, init, 0, this.length, 1 );
		},
	
	
		reduceRight: __arrayProto.reduceRight || function ( fn, init )
		{
			return _fnReduce( this, fn, init, this.length-1, -1, -1 );
		},
	
	
		reverse: __arrayProto.reverse,
	
	
		// Object with rows, columns and opts
		selector: null,
	
	
		shift:   __arrayProto.shift,
	
	
		sort:    __arrayProto.sort, // ? name - order?
	
	
		splice:  __arrayProto.splice,
	
	
		toArray: function ()
		{
			return __arrayProto.slice.call( this );
		},
	
	
		to$: function ()
		{
			return $( this );
		},
	
	
		toJQuery: function ()
		{
			return $( this );
		},
	
	
		unique: function ()
		{
			return new _Api( this.context, _unique(this) );
		},
	
	
		unshift: __arrayProto.unshift
	};
	
	
	_Api.extend = function ( scope, obj, ext )
	{
		// Only extend API instances and static properties of the API
		if ( ! ext.length || ! obj || ( ! (obj instanceof _Api) && ! obj.__dt_wrapper ) ) {
			return;
		}
	
		var
			i, ien,
			j, jen,
			struct, inner,
			methodScoping = function ( scope, fn, struc ) {
				return function () {
					var ret = fn.apply( scope, arguments );
	
					// Method extension
					_Api.extend( ret, ret, struc.methodExt );
					return ret;
				};
			};
	
		for ( i=0, ien=ext.length ; i<ien ; i++ ) {
			struct = ext[i];
	
			// Value
			obj[ struct.name ] = typeof struct.val === 'function' ?
				methodScoping( scope, struct.val, struct ) :
				$.isPlainObject( struct.val ) ?
					{} :
					struct.val;
	
			obj[ struct.name ].__dt_wrapper = true;
	
			// Property extension
			_Api.extend( scope, obj[ struct.name ], struct.propExt );
		}
	};
	
	
	// @todo - Is there need for an augment function?
	// _Api.augment = function ( inst, name )
	// {
	// 	// Find src object in the structure from the name
	// 	var parts = name.split('.');
	
	// 	_Api.extend( inst, obj );
	// };
	
	
	//     [
	//       {
	//         name:      'data'                -- string   - Property name
	//         val:       function () {},       -- function - Api method (or undefined if just an object
	//         methodExt: [ ... ],              -- array    - Array of Api object definitions to extend the method result
	//         propExt:   [ ... ]               -- array    - Array of Api object definitions to extend the property
	//       },
	//       {
	//         name:     'row'
	//         val:       {},
	//         methodExt: [ ... ],
	//         propExt:   [
	//           {
	//             name:      'data'
	//             val:       function () {},
	//             methodExt: [ ... ],
	//             propExt:   [ ... ]
	//           },
	//           ...
	//         ]
	//       }
	//     ]
	
	_Api.register = _api_register = function ( name, val )
	{
		if ( $.isArray( name ) ) {
			for ( var j=0, jen=name.length ; j<jen ; j++ ) {
				_Api.register( name[j], val );
			}
			return;
		}
	
		var
			i, ien,
			heir = name.split('.'),
			struct = __apiStruct,
			key, method;
	
		var find = function ( src, name ) {
			for ( var i=0, ien=src.length ; i<ien ; i++ ) {
				if ( src[i].name === name ) {
					return src[i];
				}
			}
			return null;
		};
	
		for ( i=0, ien=heir.length ; i<ien ; i++ ) {
			method = heir[i].indexOf('()') !== -1;
			key = method ?
				heir[i].replace('()', '') :
				heir[i];
	
			var src = find( struct, key );
			if ( ! src ) {
				src = {
					name:      key,
					val:       {},
					methodExt: [],
					propExt:   []
				};
				struct.push( src );
			}
	
			if ( i === ien-1 ) {
				src.val = val;
			}
			else {
				struct = method ?
					src.methodExt :
					src.propExt;
			}
		}
	};
	
	
	_Api.registerPlural = _api_registerPlural = function ( pluralName, singularName, val ) {
		_Api.register( pluralName, val );
	
		_Api.register( singularName, function () {
			var ret = val.apply( this, arguments );
	
			if ( ret === this ) {
				// Returned item is the API instance that was passed in, return it
				return this;
			}
			else if ( ret instanceof _Api ) {
				// New API instance returned, want the value from the first item
				// in the returned array for the singular result.
				return ret.length ?
					$.isArray( ret[0] ) ?
						new _Api( ret.context, ret[0] ) : // Array results are 'enhanced'
						ret[0] :
					undefined;
			}
	
			// Non-API return - just fire it back
			return ret;
		} );
	};
	
	
	/**
	 * Selector for HTML tables. Apply the given selector to the give array of
	 * DataTables settings objects.
	 *
	 * @param {string|integer} [selector] jQuery selector string or integer
	 * @param  {array} Array of DataTables settings objects to be filtered
	 * @return {array}
	 * @ignore
	 */
	var __table_selector = function ( selector, a )
	{
		// Integer is used to pick out a table by index
		if ( typeof selector === 'number' ) {
			return [ a[ selector ] ];
		}
	
		// Perform a jQuery selector on the table nodes
		var nodes = $.map( a, function (el, i) {
			return el.nTable;
		} );
	
		return $(nodes)
			.filter( selector )
			.map( function (i) {
				// Need to translate back from the table node to the settings
				var idx = $.inArray( this, nodes );
				return a[ idx ];
			} )
			.toArray();
	};
	
	
	
	/**
	 * Context selector for the API's context (i.e. the tables the API instance
	 * refers to.
	 *
	 * @name    DataTable.Api#tables
	 * @param {string|integer} [selector] Selector to pick which tables the iterator
	 *   should operate on. If not given, all tables in the current context are
	 *   used. This can be given as a jQuery selector (for example `':gt(0)'`) to
	 *   select multiple tables or as an integer to select a single table.
	 * @returns {DataTable.Api} Returns a new API instance if a selector is given.
	 */
	_api_register( 'tables()', function ( selector ) {
		// A new instance is created if there was a selector specified
		return selector ?
			new _Api( __table_selector( selector, this.context ) ) :
			this;
	} );
	
	
	_api_register( 'table()', function ( selector ) {
		var tables = this.tables( selector );
		var ctx = tables.context;
	
		// Truncate to the first matched table
		return ctx.length ?
			new _Api( ctx[0] ) :
			tables;
	} );
	
	
	_api_registerPlural( 'tables().nodes()', 'table().node()' , function () {
		return this.iterator( 'table', function ( ctx ) {
			return ctx.nTable;
		}, 1 );
	} );
	
	
	_api_registerPlural( 'tables().body()', 'table().body()' , function () {
		return this.iterator( 'table', function ( ctx ) {
			return ctx.nTBody;
		}, 1 );
	} );
	
	
	_api_registerPlural( 'tables().header()', 'table().header()' , function () {
		return this.iterator( 'table', function ( ctx ) {
			return ctx.nTHead;
		}, 1 );
	} );
	
	
	_api_registerPlural( 'tables().footer()', 'table().footer()' , function () {
		return this.iterator( 'table', function ( ctx ) {
			return ctx.nTFoot;
		}, 1 );
	} );
	
	
	_api_registerPlural( 'tables().containers()', 'table().container()' , function () {
		return this.iterator( 'table', function ( ctx ) {
			return ctx.nTableWrapper;
		}, 1 );
	} );
	
	
	
	/**
	 * Redraw the tables in the current context.
	 *
	 * @param {boolean} [reset=true] Reset (default) or hold the current paging
	 *   position. A full re-sort and re-filter is performed when this method is
	 *   called, which is why the pagination reset is the default action.
	 * @returns {DataTables.Api} this
	 */
	_api_register( 'draw()', function ( resetPaging ) {
		return this.iterator( 'table', function ( settings ) {
			_fnReDraw( settings, resetPaging===false );
		} );
	} );
	
	
	
	/**
	 * Get the current page index.
	 *
	 * @return {integer} Current page index (zero based)
	 *//**
	 * Set the current page.
	 *
	 * Note that if you attempt to show a page which does not exist, DataTables will
	 * not throw an error, but rather reset the paging.
	 *
	 * @param {integer|string} action The paging action to take. This can be one of:
	 *  * `integer` - The page index to jump to
	 *  * `string` - An action to take:
	 *    * `first` - Jump to first page.
	 *    * `next` - Jump to the next page
	 *    * `previous` - Jump to previous page
	 *    * `last` - Jump to the last page.
	 * @returns {DataTables.Api} this
	 */
	_api_register( 'page()', function ( action ) {
		if ( action === undefined ) {
			return this.page.info().page; // not an expensive call
		}
	
		// else, have an action to take on all tables
		return this.iterator( 'table', function ( settings ) {
			_fnPageChange( settings, action );
		} );
	} );
	
	
	/**
	 * Paging information for the first table in the current context.
	 *
	 * If you require paging information for another table, use the `table()` method
	 * with a suitable selector.
	 *
	 * @return {object} Object with the following properties set:
	 *  * `page` - Current page index (zero based - i.e. the first page is `0`)
	 *  * `pages` - Total number of pages
	 *  * `start` - Display index for the first record shown on the current page
	 *  * `end` - Display index for the last record shown on the current page
	 *  * `length` - Display length (number of records). Note that generally `start
	 *    + length = end`, but this is not always true, for example if there are
	 *    only 2 records to show on the final page, with a length of 10.
	 *  * `recordsTotal` - Full data set length
	 *  * `recordsDisplay` - Data set length once the current filtering criterion
	 *    are applied.
	 */
	_api_register( 'page.info()', function ( action ) {
		if ( this.context.length === 0 ) {
			return undefined;
		}
	
		var
			settings   = this.context[0],
			start      = settings._iDisplayStart,
			len        = settings._iDisplayLength,
			visRecords = settings.fnRecordsDisplay(),
			all        = len === -1;
	
		return {
			"page":           all ? 0 : Math.floor( start / len ),
			"pages":          all ? 1 : Math.ceil( visRecords / len ),
			"start":          start,
			"end":            settings.fnDisplayEnd(),
			"length":         len,
			"recordsTotal":   settings.fnRecordsTotal(),
			"recordsDisplay": visRecords
		};
	} );
	
	
	/**
	 * Get the current page length.
	 *
	 * @return {integer} Current page length. Note `-1` indicates that all records
	 *   are to be shown.
	 *//**
	 * Set the current page length.
	 *
	 * @param {integer} Page length to set. Use `-1` to show all records.
	 * @returns {DataTables.Api} this
	 */
	_api_register( 'page.len()', function ( len ) {
		// Note that we can't call this function 'length()' because `length`
		// is a Javascript property of functions which defines how many arguments
		// the function expects.
		if ( len === undefined ) {
			return this.context.length !== 0 ?
				this.context[0]._iDisplayLength :
				undefined;
		}
	
		// else, set the page length
		return this.iterator( 'table', function ( settings ) {
			_fnLengthChange( settings, len );
		} );
	} );
	
	
	
	var __reload = function ( settings, holdPosition, callback ) {
		if ( _fnDataSource( settings ) == 'ssp' ) {
			_fnReDraw( settings, holdPosition );
		}
		else {
			// Trigger xhr
			_fnProcessingDisplay( settings, true );
	
			_fnBuildAjax( settings, [], function( json ) {
				_fnClearTable( settings );
	
				var data = _fnAjaxDataSrc( settings, json );
				for ( var i=0, ien=data.length ; i<ien ; i++ ) {
					_fnAddData( settings, data[i] );
				}
	
				_fnReDraw( settings, holdPosition );
				_fnProcessingDisplay( settings, false );
			} );
		}
	
		// Use the draw event to trigger a callback, regardless of if it is an async
		// or sync draw
		if ( callback ) {
			var api = new _Api( settings );
	
			api.one( 'draw', function () {
				callback( api.ajax.json() );
			} );
		}
	};
	
	
	/**
	 * Get the JSON response from the last Ajax request that DataTables made to the
	 * server. Note that this returns the JSON from the first table in the current
	 * context.
	 *
	 * @return {object} JSON received from the server.
	 */
	_api_register( 'ajax.json()', function () {
		var ctx = this.context;
	
		if ( ctx.length > 0 ) {
			return ctx[0].json;
		}
	
		// else return undefined;
	} );
	
	
	/**
	 * Get the data submitted in the last Ajax request
	 */
	_api_register( 'ajax.params()', function () {
		var ctx = this.context;
	
		if ( ctx.length > 0 ) {
			return ctx[0].oAjaxData;
		}
	
		// else return undefined;
	} );
	
	
	/**
	 * Reload tables from the Ajax data source. Note that this function will
	 * automatically re-draw the table when the remote data has been loaded.
	 *
	 * @param {boolean} [reset=true] Reset (default) or hold the current paging
	 *   position. A full re-sort and re-filter is performed when this method is
	 *   called, which is why the pagination reset is the default action.
	 * @returns {DataTables.Api} this
	 */
	_api_register( 'ajax.reload()', function ( callback, resetPaging ) {
		return this.iterator( 'table', function (settings) {
			__reload( settings, resetPaging===false, callback );
		} );
	} );
	
	
	/**
	 * Get the current Ajax URL. Note that this returns the URL from the first
	 * table in the current context.
	 *
	 * @return {string} Current Ajax source URL
	 *//**
	 * Set the Ajax URL. Note that this will set the URL for all tables in the
	 * current context.
	 *
	 * @param {string} url URL to set.
	 * @returns {DataTables.Api} this
	 */
	_api_register( 'ajax.url()', function ( url ) {
		var ctx = this.context;
	
		if ( url === undefined ) {
			// get
			if ( ctx.length === 0 ) {
				return undefined;
			}
			ctx = ctx[0];
	
			return ctx.ajax ?
				$.isPlainObject( ctx.ajax ) ?
					ctx.ajax.url :
					ctx.ajax :
				ctx.sAjaxSource;
		}
	
		// set
		return this.iterator( 'table', function ( settings ) {
			if ( $.isPlainObject( settings.ajax ) ) {
				settings.ajax.url = url;
			}
			else {
				settings.ajax = url;
			}
			// No need to consider sAjaxSource here since DataTables gives priority
			// to `ajax` over `sAjaxSource`. So setting `ajax` here, renders any
			// value of `sAjaxSource` redundant.
		} );
	} );
	
	
	/**
	 * Load data from the newly set Ajax URL. Note that this method is only
	 * available when `ajax.url()` is used to set a URL. Additionally, this method
	 * has the same effect as calling `ajax.reload()` but is provided for
	 * convenience when setting a new URL. Like `ajax.reload()` it will
	 * automatically redraw the table once the remote data has been loaded.
	 *
	 * @returns {DataTables.Api} this
	 */
	_api_register( 'ajax.url().load()', function ( callback, resetPaging ) {
		// Same as a reload, but makes sense to present it for easy access after a
		// url change
		return this.iterator( 'table', function ( ctx ) {
			__reload( ctx, resetPaging===false, callback );
		} );
	} );
	
	
	
	
	var _selector_run = function ( selector, select )
	{
		var
			out = [], res,
			a, i, ien, j, jen,
			selectorType = typeof selector;
	
		// Can't just check for isArray here, as an API or jQuery instance might be
		// given with their array like look
		if ( ! selector || selectorType === 'string' || selectorType === 'function' || selector.length === undefined ) {
			selector = [ selector ];
		}
	
		for ( i=0, ien=selector.length ; i<ien ; i++ ) {
			a = selector[i] && selector[i].split ?
				selector[i].split(',') :
				[ selector[i] ];
	
			for ( j=0, jen=a.length ; j<jen ; j++ ) {
				res = select( typeof a[j] === 'string' ? $.trim(a[j]) : a[j] );
	
				if ( res && res.length ) {
					out.push.apply( out, res );
				}
			}
		}
	
		return out;
	};
	
	
	var _selector_opts = function ( opts )
	{
		if ( ! opts ) {
			opts = {};
		}
	
		// Backwards compatibility for 1.9- which used the terminology filter rather
		// than search
		if ( opts.filter && ! opts.search ) {
			opts.search = opts.filter;
		}
	
		return {
			search: opts.search || 'none',
			order:  opts.order  || 'current',
			page:   opts.page   || 'all'
		};
	};
	
	
	var _selector_first = function ( inst )
	{
		// Reduce the API instance to the first item found
		for ( var i=0, ien=inst.length ; i<ien ; i++ ) {
			if ( inst[i].length > 0 ) {
				// Assign the first element to the first item in the instance
				// and truncate the instance and context
				inst[0] = inst[i];
				inst.length = 1;
				inst.context = [ inst.context[i] ];
	
				return inst;
			}
		}
	
		// Not found - return an empty instance
		inst.length = 0;
		return inst;
	};
	
	
	var _selector_row_indexes = function ( settings, opts )
	{
		var
			i, ien, tmp, a=[],
			displayFiltered = settings.aiDisplay,
			displayMaster = settings.aiDisplayMaster;
	
		var
			search = opts.search,  // none, applied, removed
			order  = opts.order,   // applied, current, index (original - compatibility with 1.9)
			page   = opts.page;    // all, current
	
		if ( _fnDataSource( settings ) == 'ssp' ) {
			// In server-side processing mode, most options are irrelevant since
			// rows not shown don't exist and the index order is the applied order
			// Removed is a special case - for consistency just return an empty
			// array
			return search === 'removed' ?
				[] :
				_range( 0, displayMaster.length );
		}
		else if ( page == 'current' ) {
			// Current page implies that order=current and fitler=applied, since it is
			// fairly senseless otherwise, regardless of what order and search actually
			// are
			for ( i=settings._iDisplayStart, ien=settings.fnDisplayEnd() ; i<ien ; i++ ) {
				a.push( displayFiltered[i] );
			}
		}
		else if ( order == 'current' || order == 'applied' ) {
			a = search == 'none' ?
				displayMaster.slice() :                      // no search
				search == 'applied' ?
					displayFiltered.slice() :                // applied search
					$.map( displayMaster, function (el, i) { // removed search
						return $.inArray( el, displayFiltered ) === -1 ? el : null;
					} );
		}
		else if ( order == 'index' || order == 'original' ) {
			for ( i=0, ien=settings.aoData.length ; i<ien ; i++ ) {
				if ( search == 'none' ) {
					a.push( i );
				}
				else { // applied | removed
					tmp = $.inArray( i, displayFiltered );
	
					if ((tmp === -1 && search == 'removed') ||
						(tmp >= 0   && search == 'applied') )
					{
						a.push( i );
					}
				}
			}
		}
	
		return a;
	};
	
	
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Rows
	 *
	 * {}          - no selector - use all available rows
	 * {integer}   - row aoData index
	 * {node}      - TR node
	 * {string}    - jQuery selector to apply to the TR elements
	 * {array}     - jQuery array of nodes, or simply an array of TR nodes
	 *
	 */
	
	
	var __row_selector = function ( settings, selector, opts )
	{
		return _selector_run( selector, function ( sel ) {
			var selInt = _intVal( sel );
			var i, ien;
	
			// Short cut - selector is a number and no options provided (default is
			// all records, so no need to check if the index is in there, since it
			// must be - dev error if the index doesn't exist).
			if ( selInt !== null && ! opts ) {
				return [ selInt ];
			}
	
			var rows = _selector_row_indexes( settings, opts );
	
			if ( selInt !== null && $.inArray( selInt, rows ) !== -1 ) {
				// Selector - integer
				return [ selInt ];
			}
			else if ( ! sel ) {
				// Selector - none
				return rows;
			}
	
			// Selector - function
			if ( typeof sel === 'function' ) {
				return $.map( rows, function (idx) {
					var row = settings.aoData[ idx ];
					return sel( idx, row._aData, row.nTr ) ? idx : null;
				} );
			}
	
			// Get nodes in the order from the `rows` array with null values removed
			var nodes = _removeEmpty(
				_pluck_order( settings.aoData, rows, 'nTr' )
			);
	
			// Selector - node
			if ( sel.nodeName ) {
				if ( $.inArray( sel, nodes ) !== -1 ) {
					return [ sel._DT_RowIndex ]; // sel is a TR node that is in the table
					                             // and DataTables adds a prop for fast lookup
				}
			}
	
			// Selector - jQuery selector string, array of nodes or jQuery object/
			// As jQuery's .filter() allows jQuery objects to be passed in filter,
			// it also allows arrays, so this will cope with all three options
			return $(nodes)
				.filter( sel )
				.map( function () {
					return this._DT_RowIndex;
				} )
				.toArray();
		} );
	};
	
	
	/**
	 *
	 */
	_api_register( 'rows()', function ( selector, opts ) {
		// argument shifting
		if ( selector === undefined ) {
			selector = '';
		}
		else if ( $.isPlainObject( selector ) ) {
			opts = selector;
			selector = '';
		}
	
		opts = _selector_opts( opts );
	
		var inst = this.iterator( 'table', function ( settings ) {
			return __row_selector( settings, selector, opts );
		}, 1 );
	
		// Want argument shifting here and in __row_selector?
		inst.selector.rows = selector;
		inst.selector.opts = opts;
	
		return inst;
	} );
	
	
	_api_register( 'rows().nodes()', function () {
		return this.iterator( 'row', function ( settings, row ) {
			return settings.aoData[ row ].nTr || undefined;
		}, 1 );
	} );
	
	_api_register( 'rows().data()', function () {
		return this.iterator( true, 'rows', function ( settings, rows ) {
			return _pluck_order( settings.aoData, rows, '_aData' );
		}, 1 );
	} );
	
	_api_registerPlural( 'rows().cache()', 'row().cache()', function ( type ) {
		return this.iterator( 'row', function ( settings, row ) {
			var r = settings.aoData[ row ];
			return type === 'search' ? r._aFilterData : r._aSortData;
		}, 1 );
	} );
	
	_api_registerPlural( 'rows().invalidate()', 'row().invalidate()', function ( src ) {
		return this.iterator( 'row', function ( settings, row ) {
			_fnInvalidate( settings, row, src );
		} );
	} );
	
	_api_registerPlural( 'rows().indexes()', 'row().index()', function () {
		return this.iterator( 'row', function ( settings, row ) {
			return row;
		}, 1 );
	} );
	
	_api_registerPlural( 'rows().remove()', 'row().remove()', function () {
		var that = this;
	
		return this.iterator( 'row', function ( settings, row, thatIdx ) {
			var data = settings.aoData;
	
			data.splice( row, 1 );
	
			// Update the _DT_RowIndex parameter on all rows in the table
			for ( var i=0, ien=data.length ; i<ien ; i++ ) {
				if ( data[i].nTr !== null ) {
					data[i].nTr._DT_RowIndex = i;
				}
			}
	
			// Remove the target row from the search array
			var displayIndex = $.inArray( row, settings.aiDisplay );
	
			// Delete from the display arrays
			_fnDeleteIndex( settings.aiDisplayMaster, row );
			_fnDeleteIndex( settings.aiDisplay, row );
			_fnDeleteIndex( that[ thatIdx ], row, false ); // maintain local indexes
	
			// Check for an 'overflow' they case for displaying the table
			_fnLengthOverflow( settings );
		} );
	} );
	
	
	_api_register( 'rows.add()', function ( rows ) {
		var newRows = this.iterator( 'table', function ( settings ) {
				var row, i, ien;
				var out = [];
	
				for ( i=0, ien=rows.length ; i<ien ; i++ ) {
					row = rows[i];
	
					if ( row.nodeName && row.nodeName.toUpperCase() === 'TR' ) {
						out.push( _fnAddTr( settings, row )[0] );
					}
					else {
						out.push( _fnAddData( settings, row ) );
					}
				}
	
				return out;
			}, 1 );
	
		// Return an Api.rows() extended instance, so rows().nodes() etc can be used
		var modRows = this.rows( -1 );
		modRows.pop();
		modRows.push.apply( modRows, newRows.toArray() );
	
		return modRows;
	} );
	
	
	
	
	
	/**
	 *
	 */
	_api_register( 'row()', function ( selector, opts ) {
		return _selector_first( this.rows( selector, opts ) );
	} );
	
	
	_api_register( 'row().data()', function ( data ) {
		var ctx = this.context;
	
		if ( data === undefined ) {
			// Get
			return ctx.length && this.length ?
				ctx[0].aoData[ this[0] ]._aData :
				undefined;
		}
	
		// Set
		ctx[0].aoData[ this[0] ]._aData = data;
	
		// Automatically invalidate
		_fnInvalidate( ctx[0], this[0], 'data' );
	
		return this;
	} );
	
	
	_api_register( 'row().node()', function () {
		var ctx = this.context;
	
		return ctx.length && this.length ?
			ctx[0].aoData[ this[0] ].nTr || null :
			null;
	} );
	
	
	_api_register( 'row.add()', function ( row ) {
		// Allow a jQuery object to be passed in - only a single row is added from
		// it though - the first element in the set
		if ( row instanceof $ && row.length ) {
			row = row[0];
		}
	
		var rows = this.iterator( 'table', function ( settings ) {
			if ( row.nodeName && row.nodeName.toUpperCase() === 'TR' ) {
				return _fnAddTr( settings, row )[0];
			}
			return _fnAddData( settings, row );
		} );
	
		// Return an Api.rows() extended instance, with the newly added row selected
		return this.row( rows[0] );
	} );
	
	
	
	var __details_add = function ( ctx, row, data, klass )
	{
		// Convert to array of TR elements
		var rows = [];
		var addRow = function ( r, k ) {
			// If we get a TR element, then just add it directly - up to the dev
			// to add the correct number of columns etc
			if ( r.nodeName && r.nodeName.toLowerCase() === 'tr' ) {
				rows.push( r );
			}
			else {
				// Otherwise create a row with a wrapper
				var created = $('<tr><td/></tr>').addClass( k );
				$('td', created)
					.addClass( k )
					.html( r )
					[0].colSpan = _fnVisbleColumns( ctx );
	
				rows.push( created[0] );
			}
		};
	
		if ( $.isArray( data ) || data instanceof $ ) {
			for ( var i=0, ien=data.length ; i<ien ; i++ ) {
				addRow( data[i], klass );
			}
		}
		else {
			addRow( data, klass );
		}
	
		if ( row._details ) {
			row._details.remove();
		}
	
		row._details = $(rows);
	
		// If the children were already shown, that state should be retained
		if ( row._detailsShow ) {
			row._details.insertAfter( row.nTr );
		}
	};
	
	
	var __details_remove = function ( api, idx )
	{
		var ctx = api.context;
	
		if ( ctx.length ) {
			var row = ctx[0].aoData[ idx !== undefined ? idx : api[0] ];
	
			if ( row._details ) {
				row._details.remove();
	
				row._detailsShow = undefined;
				row._details = undefined;
			}
		}
	};
	
	
	var __details_display = function ( api, show ) {
		var ctx = api.context;
	
		if ( ctx.length && api.length ) {
			var row = ctx[0].aoData[ api[0] ];
	
			if ( row._details ) {
				row._detailsShow = show;
	
				if ( show ) {
					row._details.insertAfter( row.nTr );
				}
				else {
					row._details.detach();
				}
	
				__details_events( ctx[0] );
			}
		}
	};
	
	
	var __details_events = function ( settings )
	{
		var api = new _Api( settings );
		var namespace = '.dt.DT_details';
		var drawEvent = 'draw'+namespace;
		var colvisEvent = 'column-visibility'+namespace;
		var destroyEvent = 'destroy'+namespace;
		var data = settings.aoData;
	
		api.off( drawEvent +' '+ colvisEvent +' '+ destroyEvent );
	
		if ( _pluck( data, '_details' ).length > 0 ) {
			// On each draw, insert the required elements into the document
			api.on( drawEvent, function ( e, ctx ) {
				if ( settings !== ctx ) {
					return;
				}
	
				api.rows( {page:'current'} ).eq(0).each( function (idx) {
					// Internal data grab
					var row = data[ idx ];
	
					if ( row._detailsShow ) {
						row._details.insertAfter( row.nTr );
					}
				} );
			} );
	
			// Column visibility change - update the colspan
			api.on( colvisEvent, function ( e, ctx, idx, vis ) {
				if ( settings !== ctx ) {
					return;
				}
	
				// Update the colspan for the details rows (note, only if it already has
				// a colspan)
				var row, visible = _fnVisbleColumns( ctx );
	
				for ( var i=0, ien=data.length ; i<ien ; i++ ) {
					row = data[i];
	
					if ( row._details ) {
						row._details.children('td[colspan]').attr('colspan', visible );
					}
				}
			} );
	
			// Table destroyed - nuke any child rows
			api.on( destroyEvent, function ( e, ctx ) {
				if ( settings !== ctx ) {
					return;
				}
	
				for ( var i=0, ien=data.length ; i<ien ; i++ ) {
					if ( data[i]._details ) {
						__details_remove( api, i );
					}
				}
			} );
		}
	};
	
	// Strings for the method names to help minification
	var _emp = '';
	var _child_obj = _emp+'row().child';
	var _child_mth = _child_obj+'()';
	
	// data can be:
	//  tr
	//  string
	//  jQuery or array of any of the above
	_api_register( _child_mth, function ( data, klass ) {
		var ctx = this.context;
	
		if ( data === undefined ) {
			// get
			return ctx.length && this.length ?
				ctx[0].aoData[ this[0] ]._details :
				undefined;
		}
		else if ( data === true ) {
			// show
			this.child.show();
		}
		else if ( data === false ) {
			// remove
			__details_remove( this );
		}
		else if ( ctx.length && this.length ) {
			// set
			__details_add( ctx[0], ctx[0].aoData[ this[0] ], data, klass );
		}
	
		return this;
	} );
	
	
	_api_register( [
		_child_obj+'.show()',
		_child_mth+'.show()' // only when `child()` was called with parameters (without
	], function ( show ) {   // it returns an object and this method is not executed)
		__details_display( this, true );
		return this;
	} );
	
	
	_api_register( [
		_child_obj+'.hide()',
		_child_mth+'.hide()' // only when `child()` was called with parameters (without
	], function () {         // it returns an object and this method is not executed)
		__details_display( this, false );
		return this;
	} );
	
	
	_api_register( [
		_child_obj+'.remove()',
		_child_mth+'.remove()' // only when `child()` was called with parameters (without
	], function () {           // it returns an object and this method is not executed)
		__details_remove( this );
		return this;
	} );
	
	
	_api_register( _child_obj+'.isShown()', function () {
		var ctx = this.context;
	
		if ( ctx.length && this.length ) {
			// _detailsShown as false or undefined will fall through to return false
			return ctx[0].aoData[ this[0] ]._detailsShow || false;
		}
		return false;
	} );
	
	
	
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Columns
	 *
	 * {integer}           - column index (>=0 count from left, <0 count from right)
	 * "{integer}:visIdx"  - visible column index (i.e. translate to column index)  (>=0 count from left, <0 count from right)
	 * "{integer}:visible" - alias for {integer}:visIdx  (>=0 count from left, <0 count from right)
	 * "{string}:name"     - column name
	 * "{string}"          - jQuery selector on column header nodes
	 *
	 */
	
	// can be an array of these items, comma separated list, or an array of comma
	// separated lists
	
	var __re_column_selector = /^(.+):(name|visIdx|visible)$/;
	
	
	// r1 and r2 are redundant - but it means that the parameters match for the
	// iterator callback in columns().data()
	var __columnData = function ( settings, column, r1, r2, rows ) {
		var a = [];
		for ( var row=0, ien=rows.length ; row<ien ; row++ ) {
			a.push( _fnGetCellData( settings, rows[row], column ) );
		}
		return a;
	};
	
	
	var __column_selector = function ( settings, selector, opts )
	{
		var
			columns = settings.aoColumns,
			names = _pluck( columns, 'sName' ),
			nodes = _pluck( columns, 'nTh' );
	
		return _selector_run( selector, function ( s ) {
			var selInt = _intVal( s );
	
			// Selector - all
			if ( s === '' ) {
				return _range( columns.length );
			}
			
			// Selector - index
			if ( selInt !== null ) {
				return [ selInt >= 0 ?
					selInt : // Count from left
					columns.length + selInt // Count from right (+ because its a negative value)
				];
			}
			
			// Selector = function
			if ( typeof s === 'function' ) {
				var rows = _selector_row_indexes( settings, opts );
	
				return $.map( columns, function (col, idx) {
					return s(
							idx,
							__columnData( settings, idx, 0, 0, rows ),
							nodes[ idx ]
						) ? idx : null;
				} );
			}
	
			// jQuery or string selector
			var match = typeof s === 'string' ?
				s.match( __re_column_selector ) :
				'';
	
			if ( match ) {
				switch( match[2] ) {
					case 'visIdx':
					case 'visible':
						var idx = parseInt( match[1], 10 );
						// Visible index given, convert to column index
						if ( idx < 0 ) {
							// Counting from the right
							var visColumns = $.map( columns, function (col,i) {
								return col.bVisible ? i : null;
							} );
							return [ visColumns[ visColumns.length + idx ] ];
						}
						// Counting from the left
						return [ _fnVisibleToColumnIndex( settings, idx ) ];
	
					case 'name':
						// match by name. `names` is column index complete and in order
						return $.map( names, function (name, i) {
							return name === match[1] ? i : null;
						} );
				}
			}
			else {
				// jQuery selector on the TH elements for the columns
				return $( nodes )
					.filter( s )
					.map( function () {
						return $.inArray( this, nodes ); // `nodes` is column index complete and in order
					} )
					.toArray();
			}
		} );
	};
	
	
	var __setColumnVis = function ( settings, column, vis, recalc ) {
		var
			cols = settings.aoColumns,
			col  = cols[ column ],
			data = settings.aoData,
			row, cells, i, ien, tr;
	
		// Get
		if ( vis === undefined ) {
			return col.bVisible;
		}
	
		// Set
		// No change
		if ( col.bVisible === vis ) {
			return;
		}
	
		if ( vis ) {
			// Insert column
			// Need to decide if we should use appendChild or insertBefore
			var insertBefore = $.inArray( true, _pluck(cols, 'bVisible'), column+1 );
	
			for ( i=0, ien=data.length ; i<ien ; i++ ) {
				tr = data[i].nTr;
				cells = data[i].anCells;
	
				if ( tr ) {
					// insertBefore can act like appendChild if 2nd arg is null
					tr.insertBefore( cells[ column ], cells[ insertBefore ] || null );
				}
			}
		}
		else {
			// Remove column
			$( _pluck( settings.aoData, 'anCells', column ) ).detach();
		}
	
		// Common actions
		col.bVisible = vis;
		_fnDrawHead( settings, settings.aoHeader );
		_fnDrawHead( settings, settings.aoFooter );
	
		if ( recalc === undefined || recalc ) {
			// Automatically adjust column sizing
			_fnAdjustColumnSizing( settings );
	
			// Realign columns for scrolling
			if ( settings.oScroll.sX || settings.oScroll.sY ) {
				_fnScrollDraw( settings );
			}
		}
	
		_fnCallbackFire( settings, null, 'column-visibility', [settings, column, vis] );
	
		_fnSaveState( settings );
	};
	
	
	/**
	 *
	 */
	_api_register( 'columns()', function ( selector, opts ) {
		// argument shifting
		if ( selector === undefined ) {
			selector = '';
		}
		else if ( $.isPlainObject( selector ) ) {
			opts = selector;
			selector = '';
		}
	
		opts = _selector_opts( opts );
	
		var inst = this.iterator( 'table', function ( settings ) {
			return __column_selector( settings, selector, opts );
		}, 1 );
	
		// Want argument shifting here and in _row_selector?
		inst.selector.cols = selector;
		inst.selector.opts = opts;
	
		return inst;
	} );
	
	
	/**
	 *
	 */
	_api_registerPlural( 'columns().header()', 'column().header()', function ( selector, opts ) {
		return this.iterator( 'column', function ( settings, column ) {
			return settings.aoColumns[column].nTh;
		}, 1 );
	} );
	
	
	/**
	 *
	 */
	_api_registerPlural( 'columns().footer()', 'column().footer()', function ( selector, opts ) {
		return this.iterator( 'column', function ( settings, column ) {
			return settings.aoColumns[column].nTf;
		}, 1 );
	} );
	
	
	/**
	 *
	 */
	_api_registerPlural( 'columns().data()', 'column().data()', function () {
		return this.iterator( 'column-rows', __columnData, 1 );
	} );
	
	
	_api_registerPlural( 'columns().dataSrc()', 'column().dataSrc()', function () {
		return this.iterator( 'column', function ( settings, column ) {
			return settings.aoColumns[column].mData;
		}, 1 );
	} );
	
	
	_api_registerPlural( 'columns().cache()', 'column().cache()', function ( type ) {
		return this.iterator( 'column-rows', function ( settings, column, i, j, rows ) {
			return _pluck_order( settings.aoData, rows,
				type === 'search' ? '_aFilterData' : '_aSortData', column
			);
		}, 1 );
	} );
	
	
	_api_registerPlural( 'columns().nodes()', 'column().nodes()', function () {
		return this.iterator( 'column-rows', function ( settings, column, i, j, rows ) {
			return _pluck_order( settings.aoData, rows, 'anCells', column ) ;
		}, 1 );
	} );
	
	
	
	_api_registerPlural( 'columns().visible()', 'column().visible()', function ( vis, calc ) {
		return this.iterator( 'column', function ( settings, column ) {
			if ( vis === undefined ) {
				return settings.aoColumns[ column ].bVisible;
			} // else
			__setColumnVis( settings, column, vis, calc );
		} );
	} );
	
	
	
	_api_registerPlural( 'columns().indexes()', 'column().index()', function ( type ) {
		return this.iterator( 'column', function ( settings, column ) {
			return type === 'visible' ?
				_fnColumnIndexToVisible( settings, column ) :
				column;
		}, 1 );
	} );
	
	
	// _api_register( 'columns().show()', function () {
	// 	var selector = this.selector;
	// 	return this.columns( selector.cols, selector.opts ).visible( true );
	// } );
	
	
	// _api_register( 'columns().hide()', function () {
	// 	var selector = this.selector;
	// 	return this.columns( selector.cols, selector.opts ).visible( false );
	// } );
	
	
	
	_api_register( 'columns.adjust()', function () {
		return this.iterator( 'table', function ( settings ) {
			_fnAdjustColumnSizing( settings );
		}, 1 );
	} );
	
	
	// Convert from one column index type, to another type
	_api_register( 'column.index()', function ( type, idx ) {
		if ( this.context.length !== 0 ) {
			var ctx = this.context[0];
	
			if ( type === 'fromVisible' || type === 'toData' ) {
				return _fnVisibleToColumnIndex( ctx, idx );
			}
			else if ( type === 'fromData' || type === 'toVisible' ) {
				return _fnColumnIndexToVisible( ctx, idx );
			}
		}
	} );
	
	
	_api_register( 'column()', function ( selector, opts ) {
		return _selector_first( this.columns( selector, opts ) );
	} );
	
	
	
	
	var __cell_selector = function ( settings, selector, opts )
	{
		var data = settings.aoData;
		var rows = _selector_row_indexes( settings, opts );
		var cells = _removeEmpty( _pluck_order( data, rows, 'anCells' ) );
		var allCells = $( [].concat.apply([], cells) );
		var row;
		var columns = settings.aoColumns.length;
		var a, i, ien, j, o, host;
	
		return _selector_run( selector, function ( s ) {
			var fnSelector = typeof s === 'function';
	
			if ( s === null || s === undefined || fnSelector ) {
				// All cells and function selectors
				a = [];
	
				for ( i=0, ien=rows.length ; i<ien ; i++ ) {
					row = rows[i];
	
					for ( j=0 ; j<columns ; j++ ) {
						o = {
							row: row,
							column: j
						};
	
						if ( fnSelector ) {
							// Selector - function
							host = settings.aoData[ row ];
	
							if ( s( o, _fnGetCellData(settings, row, j), host.anCells[j] ) ) {
								a.push( o );
							}
						}
						else {
							// Selector - all
							a.push( o );
						}
					}
				}
	
				return a;
			}
			
			// Selector - index
			if ( $.isPlainObject( s ) ) {
				return [s];
			}
	
			// Selector - jQuery filtered cells
			return allCells
				.filter( s )
				.map( function (i, el) {
					row = el.parentNode._DT_RowIndex;
	
					return {
						row: row,
						column: $.inArray( el, data[ row ].anCells )
					};
				} )
				.toArray();
		} );
	};
	
	
	
	
	_api_register( 'cells()', function ( rowSelector, columnSelector, opts ) {
		// Argument shifting
		if ( $.isPlainObject( rowSelector ) ) {
			// Indexes
			if ( typeof rowSelector.row !== undefined ) {
				opts = columnSelector;
				columnSelector = null;
			}
			else {
				opts = rowSelector;
				rowSelector = null;
			}
		}
		if ( $.isPlainObject( columnSelector ) ) {
			opts = columnSelector;
			columnSelector = null;
		}
	
		// Cell selector
		if ( columnSelector === null || columnSelector === undefined ) {
			return this.iterator( 'table', function ( settings ) {
				return __cell_selector( settings, rowSelector, _selector_opts( opts ) );
			} );
		}
	
		// Row + column selector
		var columns = this.columns( columnSelector, opts );
		var rows = this.rows( rowSelector, opts );
		var a, i, ien, j, jen;
	
		var cells = this.iterator( 'table', function ( settings, idx ) {
			a = [];
	
			for ( i=0, ien=rows[idx].length ; i<ien ; i++ ) {
				for ( j=0, jen=columns[idx].length ; j<jen ; j++ ) {
					a.push( {
						row:    rows[idx][i],
						column: columns[idx][j]
					} );
				}
			}
	
			return a;
		}, 1 );
	
		$.extend( cells.selector, {
			cols: columnSelector,
			rows: rowSelector,
			opts: opts
		} );
	
		return cells;
	} );
	
	
	_api_registerPlural( 'cells().nodes()', 'cell().node()', function () {
		return this.iterator( 'cell', function ( settings, row, column ) {
			var cells = settings.aoData[ row ].anCells;
			return cells ?
				cells[ column ] :
				undefined;
		}, 1 );
	} );
	
	
	_api_register( 'cells().data()', function () {
		return this.iterator( 'cell', function ( settings, row, column ) {
			return _fnGetCellData( settings, row, column );
		}, 1 );
	} );
	
	
	_api_registerPlural( 'cells().cache()', 'cell().cache()', function ( type ) {
		type = type === 'search' ? '_aFilterData' : '_aSortData';
	
		return this.iterator( 'cell', function ( settings, row, column ) {
			return settings.aoData[ row ][ type ][ column ];
		}, 1 );
	} );
	
	
	_api_registerPlural( 'cells().render()', 'cell().render()', function ( type ) {
		return this.iterator( 'cell', function ( settings, row, column ) {
			return _fnGetCellData( settings, row, column, type );
		}, 1 );
	} );
	
	
	_api_registerPlural( 'cells().indexes()', 'cell().index()', function () {
		return this.iterator( 'cell', function ( settings, row, column ) {
			return {
				row: row,
				column: column,
				columnVisible: _fnColumnIndexToVisible( settings, column )
			};
		}, 1 );
	} );
	
	
	_api_registerPlural( 'cells().invalidate()', 'cell().invalidate()', function ( src ) {
		return this.iterator( 'cell', function ( settings, row, column ) {
			_fnInvalidate( settings, row, src, column );
		} );
	} );
	
	
	
	_api_register( 'cell()', function ( rowSelector, columnSelector, opts ) {
		return _selector_first( this.cells( rowSelector, columnSelector, opts ) );
	} );
	
	
	_api_register( 'cell().data()', function ( data ) {
		var ctx = this.context;
		var cell = this[0];
	
		if ( data === undefined ) {
			// Get
			return ctx.length && cell.length ?
				_fnGetCellData( ctx[0], cell[0].row, cell[0].column ) :
				undefined;
		}
	
		// Set
		_fnSetCellData( ctx[0], cell[0].row, cell[0].column, data );
		_fnInvalidate( ctx[0], cell[0].row, 'data', cell[0].column );
	
		return this;
	} );
	
	
	
	/**
	 * Get current ordering (sorting) that has been applied to the table.
	 *
	 * @returns {array} 2D array containing the sorting information for the first
	 *   table in the current context. Each element in the parent array represents
	 *   a column being sorted upon (i.e. multi-sorting with two columns would have
	 *   2 inner arrays). The inner arrays may have 2 or 3 elements. The first is
	 *   the column index that the sorting condition applies to, the second is the
	 *   direction of the sort (`desc` or `asc`) and, optionally, the third is the
	 *   index of the sorting order from the `column.sorting` initialisation array.
	 *//**
	 * Set the ordering for the table.
	 *
	 * @param {integer} order Column index to sort upon.
	 * @param {string} direction Direction of the sort to be applied (`asc` or `desc`)
	 * @returns {DataTables.Api} this
	 *//**
	 * Set the ordering for the table.
	 *
	 * @param {array} order 1D array of sorting information to be applied.
	 * @param {array} [...] Optional additional sorting conditions
	 * @returns {DataTables.Api} this
	 *//**
	 * Set the ordering for the table.
	 *
	 * @param {array} order 2D array of sorting information to be applied.
	 * @returns {DataTables.Api} this
	 */
	_api_register( 'order()', function ( order, dir ) {
		var ctx = this.context;
	
		if ( order === undefined ) {
			// get
			return ctx.length !== 0 ?
				ctx[0].aaSorting :
				undefined;
		}
	
		// set
		if ( typeof order === 'number' ) {
			// Simple column / direction passed in
			order = [ [ order, dir ] ];
		}
		else if ( ! $.isArray( order[0] ) ) {
			// Arguments passed in (list of 1D arrays)
			order = Array.prototype.slice.call( arguments );
		}
		// otherwise a 2D array was passed in
	
		return this.iterator( 'table', function ( settings ) {
			settings.aaSorting = order.slice();
		} );
	} );
	
	
	/**
	 * Attach a sort listener to an element for a given column
	 *
	 * @param {node|jQuery|string} node Identifier for the element(s) to attach the
	 *   listener to. This can take the form of a single DOM node, a jQuery
	 *   collection of nodes or a jQuery selector which will identify the node(s).
	 * @param {integer} column the column that a click on this node will sort on
	 * @param {function} [callback] callback function when sort is run
	 * @returns {DataTables.Api} this
	 */
	_api_register( 'order.listener()', function ( node, column, callback ) {
		return this.iterator( 'table', function ( settings ) {
			_fnSortAttachListener( settings, node, column, callback );
		} );
	} );
	
	
	// Order by the selected column(s)
	_api_register( [
		'columns().order()',
		'column().order()'
	], function ( dir ) {
		var that = this;
	
		return this.iterator( 'table', function ( settings, i ) {
			var sort = [];
	
			$.each( that[i], function (j, col) {
				sort.push( [ col, dir ] );
			} );
	
			settings.aaSorting = sort;
		} );
	} );
	
	
	
	_api_register( 'search()', function ( input, regex, smart, caseInsen ) {
		var ctx = this.context;
	
		if ( input === undefined ) {
			// get
			return ctx.length !== 0 ?
				ctx[0].oPreviousSearch.sSearch :
				undefined;
		}
	
		// set
		return this.iterator( 'table', function ( settings ) {
			if ( ! settings.oFeatures.bFilter ) {
				return;
			}
	
			_fnFilterComplete( settings, $.extend( {}, settings.oPreviousSearch, {
				"sSearch": input+"",
				"bRegex":  regex === null ? false : regex,
				"bSmart":  smart === null ? true  : smart,
				"bCaseInsensitive": caseInsen === null ? true : caseInsen
			} ), 1 );
		} );
	} );
	
	
	_api_registerPlural(
		'columns().search()',
		'column().search()',
		function ( input, regex, smart, caseInsen ) {
			return this.iterator( 'column', function ( settings, column ) {
				var preSearch = settings.aoPreSearchCols;
	
				if ( input === undefined ) {
					// get
					return preSearch[ column ].sSearch;
				}
	
				// set
				if ( ! settings.oFeatures.bFilter ) {
					return;
				}
	
				$.extend( preSearch[ column ], {
					"sSearch": input+"",
					"bRegex":  regex === null ? false : regex,
					"bSmart":  smart === null ? true  : smart,
					"bCaseInsensitive": caseInsen === null ? true : caseInsen
				} );
	
				_fnFilterComplete( settings, settings.oPreviousSearch, 1 );
			} );
		}
	);
	
	/*
	 * State API methods
	 */
	
	_api_register( 'state()', function () {
		return this.context.length ?
			this.context[0].oSavedState :
			null;
	} );
	
	
	_api_register( 'state.clear()', function () {
		return this.iterator( 'table', function ( settings ) {
			// Save an empty object
			settings.fnStateSaveCallback.call( settings.oInstance, settings, {} );
		} );
	} );
	
	
	_api_register( 'state.loaded()', function () {
		return this.context.length ?
			this.context[0].oLoadedState :
			null;
	} );
	
	
	_api_register( 'state.save()', function () {
		return this.iterator( 'table', function ( settings ) {
			_fnSaveState( settings );
		} );
	} );
	
	
	
	/**
	 * Provide a common method for plug-ins to check the version of DataTables being
	 * used, in order to ensure compatibility.
	 *
	 *  @param {string} version Version string to check for, in the format "X.Y.Z".
	 *    Note that the formats "X" and "X.Y" are also acceptable.
	 *  @returns {boolean} true if this version of DataTables is greater or equal to
	 *    the required version, or false if this version of DataTales is not
	 *    suitable
	 *  @static
	 *  @dtopt API-Static
	 *
	 *  @example
	 *    alert( $.fn.dataTable.versionCheck( '1.9.0' ) );
	 */
	DataTable.versionCheck = DataTable.fnVersionCheck = function( version )
	{
		var aThis = DataTable.version.split('.');
		var aThat = version.split('.');
		var iThis, iThat;
	
		for ( var i=0, iLen=aThat.length ; i<iLen ; i++ ) {
			iThis = parseInt( aThis[i], 10 ) || 0;
			iThat = parseInt( aThat[i], 10 ) || 0;
	
			// Parts are the same, keep comparing
			if (iThis === iThat) {
				continue;
			}
	
			// Parts are different, return immediately
			return iThis > iThat;
		}
	
		return true;
	};
	
	
	/**
	 * Check if a `<table>` node is a DataTable table already or not.
	 *
	 *  @param {node|jquery|string} table Table node, jQuery object or jQuery
	 *      selector for the table to test. Note that if more than more than one
	 *      table is passed on, only the first will be checked
	 *  @returns {boolean} true the table given is a DataTable, or false otherwise
	 *  @static
	 *  @dtopt API-Static
	 *
	 *  @example
	 *    if ( ! $.fn.DataTable.isDataTable( '#example' ) ) {
	 *      $('#example').dataTable();
	 *    }
	 */
	DataTable.isDataTable = DataTable.fnIsDataTable = function ( table )
	{
		var t = $(table).get(0);
		var is = false;
	
		$.each( DataTable.settings, function (i, o) {
			if ( o.nTable === t ||
				$('table', o.nScrollHead)[0] === t ||
				$('table', o.nScrollFoot)[0] === t
			) {
				is = true;
			}
		} );
	
		return is;
	};
	
	
	/**
	 * Get all DataTable tables that have been initialised - optionally you can
	 * select to get only currently visible tables.
	 *
	 *  @param {boolean} [visible=false] Flag to indicate if you want all (default)
	 *    or visible tables only.
	 *  @returns {array} Array of `table` nodes (not DataTable instances) which are
	 *    DataTables
	 *  @static
	 *  @dtopt API-Static
	 *
	 *  @example
	 *    $.each( $.fn.dataTable.tables(true), function () {
	 *      $(table).DataTable().columns.adjust();
	 *    } );
	 */
	DataTable.tables = DataTable.fnTables = function ( visible )
	{
		return $.map( DataTable.settings, function (o) {
			if ( !visible || (visible && $(o.nTable).is(':visible')) ) {
				return o.nTable;
			}
		} );
	};
	
	
	/**
	 * DataTables utility methods
	 * 
	 * This namespace provides helper methods that DataTables uses internally to
	 * create a DataTable, but which are not exclusively used only for DataTables.
	 * These methods can be used by extension authors to save the duplication of
	 * code.
	 *
	 *  @namespace
	 */
	DataTable.util = {
		/**
		 * Throttle the calls to a function. Arguments and context are maintained
		 * for the throttled function.
		 *
		 * @param {function} fn Function to be called
		 * @param {integer} freq Call frequency in mS
		 * @return {function} Wrapped function
		 */
		throttle: _fnThrottle,
	
	
		/**
		 * Escape a string such that it can be used in a regular expression
		 *
		 *  @param {string} sVal string to escape
		 *  @returns {string} escaped string
		 */
		escapeRegex: _fnEscapeRegex
	};
	
	
	/**
	 * Convert from camel case parameters to Hungarian notation. This is made public
	 * for the extensions to provide the same ability as DataTables core to accept
	 * either the 1.9 style Hungarian notation, or the 1.10+ style camelCase
	 * parameters.
	 *
	 *  @param {object} src The model object which holds all parameters that can be
	 *    mapped.
	 *  @param {object} user The object to convert from camel case to Hungarian.
	 *  @param {boolean} force When set to `true`, properties which already have a
	 *    Hungarian value in the `user` object will be overwritten. Otherwise they
	 *    won't be.
	 */
	DataTable.camelToHungarian = _fnCamelToHungarian;
	
	
	
	/**
	 *
	 */
	_api_register( '$()', function ( selector, opts ) {
		var
			rows   = this.rows( opts ).nodes(), // Get all rows
			jqRows = $(rows);
	
		return $( [].concat(
			jqRows.filter( selector ).toArray(),
			jqRows.find( selector ).toArray()
		) );
	} );
	
	
	// jQuery functions to operate on the tables
	$.each( [ 'on', 'one', 'off' ], function (i, key) {
		_api_register( key+'()', function ( /* event, handler */ ) {
			var args = Array.prototype.slice.call(arguments);
	
			// Add the `dt` namespace automatically if it isn't already present
			if ( ! args[0].match(/\.dt\b/) ) {
				args[0] += '.dt';
			}
	
			var inst = $( this.tables().nodes() );
			inst[key].apply( inst, args );
			return this;
		} );
	} );
	
	
	_api_register( 'clear()', function () {
		return this.iterator( 'table', function ( settings ) {
			_fnClearTable( settings );
		} );
	} );
	
	
	_api_register( 'settings()', function () {
		return new _Api( this.context, this.context );
	} );
	
	
	_api_register( 'data()', function () {
		return this.iterator( 'table', function ( settings ) {
			return _pluck( settings.aoData, '_aData' );
		} ).flatten();
	} );
	
	
	_api_register( 'destroy()', function ( remove ) {
		remove = remove || false;
	
		return this.iterator( 'table', function ( settings ) {
			var orig      = settings.nTableWrapper.parentNode;
			var classes   = settings.oClasses;
			var table     = settings.nTable;
			var tbody     = settings.nTBody;
			var thead     = settings.nTHead;
			var tfoot     = settings.nTFoot;
			var jqTable   = $(table);
			var jqTbody   = $(tbody);
			var jqWrapper = $(settings.nTableWrapper);
			var rows      = $.map( settings.aoData, function (r) { return r.nTr; } );
			var i, ien;
	
			// Flag to note that the table is currently being destroyed - no action
			// should be taken
			settings.bDestroying = true;
	
			// Fire off the destroy callbacks for plug-ins etc
			_fnCallbackFire( settings, "aoDestroyCallback", "destroy", [settings] );
	
			// If not being removed from the document, make all columns visible
			if ( ! remove ) {
				new _Api( settings ).columns().visible( true );
			}
	
			// Blitz all `DT` namespaced events (these are internal events, the
			// lowercase, `dt` events are user subscribed and they are responsible
			// for removing them
			jqWrapper.unbind('.DT').find(':not(tbody *)').unbind('.DT');
			$(window).unbind('.DT-'+settings.sInstance);
	
			// When scrolling we had to break the table up - restore it
			if ( table != thead.parentNode ) {
				jqTable.children('thead').detach();
				jqTable.append( thead );
			}
	
			if ( tfoot && table != tfoot.parentNode ) {
				jqTable.children('tfoot').detach();
				jqTable.append( tfoot );
			}
	
			// Remove the DataTables generated nodes, events and classes
			jqTable.detach();
			jqWrapper.detach();
	
			settings.aaSorting = [];
			settings.aaSortingFixed = [];
			_fnSortingClasses( settings );
	
			$( rows ).removeClass( settings.asStripeClasses.join(' ') );
	
			$('th, td', thead).removeClass( classes.sSortable+' '+
				classes.sSortableAsc+' '+classes.sSortableDesc+' '+classes.sSortableNone
			);
	
			if ( settings.bJUI ) {
				$('th span.'+classes.sSortIcon+ ', td span.'+classes.sSortIcon, thead).detach();
				$('th, td', thead).each( function () {
					var wrapper = $('div.'+classes.sSortJUIWrapper, this);
					$(this).append( wrapper.contents() );
					wrapper.detach();
				} );
			}
	
			if ( ! remove && orig ) {
				// insertBefore acts like appendChild if !arg[1]
				orig.insertBefore( table, settings.nTableReinsertBefore );
			}
	
			// Add the TR elements back into the table in their original order
			jqTbody.children().detach();
			jqTbody.append( rows );
	
			// Restore the width of the original table - was read from the style property,
			// so we can restore directly to that
			jqTable
				.css( 'width', settings.sDestroyWidth )
				.removeClass( classes.sTable );
	
			// If the were originally stripe classes - then we add them back here.
			// Note this is not fool proof (for example if not all rows had stripe
			// classes - but it's a good effort without getting carried away
			ien = settings.asDestroyStripes.length;
	
			if ( ien ) {
				jqTbody.children().each( function (i) {
					$(this).addClass( settings.asDestroyStripes[i % ien] );
				} );
			}
	
			/* Remove the settings object from the settings array */
			var idx = $.inArray( settings, DataTable.settings );
			if ( idx !== -1 ) {
				DataTable.settings.splice( idx, 1 );
			}
		} );
	} );
	

	/**
	 * Version string for plug-ins to check compatibility. Allowed format is
	 * `a.b.c-d` where: a:int, b:int, c:int, d:string(dev|beta|alpha). `d` is used
	 * only for non-release builds. See http://semver.org/ for more information.
	 *  @member
	 *  @type string
	 *  @default Version number
	 */
	DataTable.version = "1.10.5";

	/**
	 * Private data store, containing all of the settings objects that are
	 * created for the tables on a given page.
	 *
	 * Note that the `DataTable.settings` object is aliased to
	 * `jQuery.fn.dataTableExt` through which it may be accessed and
	 * manipulated, or `jQuery.fn.dataTable.settings`.
	 *  @member
	 *  @type array
	 *  @default []
	 *  @private
	 */
	DataTable.settings = [];

	/**
	 * Object models container, for the various models that DataTables has
	 * available to it. These models define the objects that are used to hold
	 * the active state and configuration of the table.
	 *  @namespace
	 */
	DataTable.models = {};
	
	
	
	/**
	 * Template object for the way in which DataTables holds information about
	 * search information for the global filter and individual column filters.
	 *  @namespace
	 */
	DataTable.models.oSearch = {
		/**
		 * Flag to indicate if the filtering should be case insensitive or not
		 *  @type boolean
		 *  @default true
		 */
		"bCaseInsensitive": true,
	
		/**
		 * Applied search term
		 *  @type string
		 *  @default <i>Empty string</i>
		 */
		"sSearch": "",
	
		/**
		 * Flag to indicate if the search term should be interpreted as a
		 * regular expression (true) or not (false) and therefore and special
		 * regex characters escaped.
		 *  @type boolean
		 *  @default false
		 */
		"bRegex": false,
	
		/**
		 * Flag to indicate if DataTables is to use its smart filtering or not.
		 *  @type boolean
		 *  @default true
		 */
		"bSmart": true
	};
	
	
	
	
	/**
	 * Template object for the way in which DataTables holds information about
	 * each individual row. This is the object format used for the settings
	 * aoData array.
	 *  @namespace
	 */
	DataTable.models.oRow = {
		/**
		 * TR element for the row
		 *  @type node
		 *  @default null
		 */
		"nTr": null,
	
		/**
		 * Array of TD elements for each row. This is null until the row has been
		 * created.
		 *  @type array nodes
		 *  @default []
		 */
		"anCells": null,
	
		/**
		 * Data object from the original data source for the row. This is either
		 * an array if using the traditional form of DataTables, or an object if
		 * using mData options. The exact type will depend on the passed in
		 * data from the data source, or will be an array if using DOM a data
		 * source.
		 *  @type array|object
		 *  @default []
		 */
		"_aData": [],
	
		/**
		 * Sorting data cache - this array is ostensibly the same length as the
		 * number of columns (although each index is generated only as it is
		 * needed), and holds the data that is used for sorting each column in the
		 * row. We do this cache generation at the start of the sort in order that
		 * the formatting of the sort data need be done only once for each cell
		 * per sort. This array should not be read from or written to by anything
		 * other than the master sorting methods.
		 *  @type array
		 *  @default null
		 *  @private
		 */
		"_aSortData": null,
	
		/**
		 * Per cell filtering data cache. As per the sort data cache, used to
		 * increase the performance of the filtering in DataTables
		 *  @type array
		 *  @default null
		 *  @private
		 */
		"_aFilterData": null,
	
		/**
		 * Filtering data cache. This is the same as the cell filtering cache, but
		 * in this case a string rather than an array. This is easily computed with
		 * a join on `_aFilterData`, but is provided as a cache so the join isn't
		 * needed on every search (memory traded for performance)
		 *  @type array
		 *  @default null
		 *  @private
		 */
		"_sFilterRow": null,
	
		/**
		 * Cache of the class name that DataTables has applied to the row, so we
		 * can quickly look at this variable rather than needing to do a DOM check
		 * on className for the nTr property.
		 *  @type string
		 *  @default <i>Empty string</i>
		 *  @private
		 */
		"_sRowStripe": "",
	
		/**
		 * Denote if the original data source was from the DOM, or the data source
		 * object. This is used for invalidating data, so DataTables can
		 * automatically read data from the original source, unless uninstructed
		 * otherwise.
		 *  @type string
		 *  @default null
		 *  @private
		 */
		"src": null
	};
	
	
	/**
	 * Template object for the column information object in DataTables. This object
	 * is held in the settings aoColumns array and contains all the information that
	 * DataTables needs about each individual column.
	 *
	 * Note that this object is related to {@link DataTable.defaults.column}
	 * but this one is the internal data store for DataTables's cache of columns.
	 * It should NOT be manipulated outside of DataTables. Any configuration should
	 * be done through the initialisation options.
	 *  @namespace
	 */
	DataTable.models.oColumn = {
		/**
		 * Column index. This could be worked out on-the-fly with $.inArray, but it
		 * is faster to just hold it as a variable
		 *  @type integer
		 *  @default null
		 */
		"idx": null,
	
		/**
		 * A list of the columns that sorting should occur on when this column
		 * is sorted. That this property is an array allows multi-column sorting
		 * to be defined for a column (for example first name / last name columns
		 * would benefit from this). The values are integers pointing to the
		 * columns to be sorted on (typically it will be a single integer pointing
		 * at itself, but that doesn't need to be the case).
		 *  @type array
		 */
		"aDataSort": null,
	
		/**
		 * Define the sorting directions that are applied to the column, in sequence
		 * as the column is repeatedly sorted upon - i.e. the first value is used
		 * as the sorting direction when the column if first sorted (clicked on).
		 * Sort it again (click again) and it will move on to the next index.
		 * Repeat until loop.
		 *  @type array
		 */
		"asSorting": null,
	
		/**
		 * Flag to indicate if the column is searchable, and thus should be included
		 * in the filtering or not.
		 *  @type boolean
		 */
		"bSearchable": null,
	
		/**
		 * Flag to indicate if the column is sortable or not.
		 *  @type boolean
		 */
		"bSortable": null,
	
		/**
		 * Flag to indicate if the column is currently visible in the table or not
		 *  @type boolean
		 */
		"bVisible": null,
	
		/**
		 * Store for manual type assignment using the `column.type` option. This
		 * is held in store so we can manipulate the column's `sType` property.
		 *  @type string
		 *  @default null
		 *  @private
		 */
		"_sManualType": null,
	
		/**
		 * Flag to indicate if HTML5 data attributes should be used as the data
		 * source for filtering or sorting. True is either are.
		 *  @type boolean
		 *  @default false
		 *  @private
		 */
		"_bAttrSrc": false,
	
		/**
		 * Developer definable function that is called whenever a cell is created (Ajax source,
		 * etc) or processed for input (DOM source). This can be used as a compliment to mRender
		 * allowing you to modify the DOM element (add background colour for example) when the
		 * element is available.
		 *  @type function
		 *  @param {element} nTd The TD node that has been created
		 *  @param {*} sData The Data for the cell
		 *  @param {array|object} oData The data for the whole row
		 *  @param {int} iRow The row index for the aoData data store
		 *  @default null
		 */
		"fnCreatedCell": null,
	
		/**
		 * Function to get data from a cell in a column. You should <b>never</b>
		 * access data directly through _aData internally in DataTables - always use
		 * the method attached to this property. It allows mData to function as
		 * required. This function is automatically assigned by the column
		 * initialisation method
		 *  @type function
		 *  @param {array|object} oData The data array/object for the array
		 *    (i.e. aoData[]._aData)
		 *  @param {string} sSpecific The specific data type you want to get -
		 *    'display', 'type' 'filter' 'sort'
		 *  @returns {*} The data for the cell from the given row's data
		 *  @default null
		 */
		"fnGetData": null,
	
		/**
		 * Function to set data for a cell in the column. You should <b>never</b>
		 * set the data directly to _aData internally in DataTables - always use
		 * this method. It allows mData to function as required. This function
		 * is automatically assigned by the column initialisation method
		 *  @type function
		 *  @param {array|object} oData The data array/object for the array
		 *    (i.e. aoData[]._aData)
		 *  @param {*} sValue Value to set
		 *  @default null
		 */
		"fnSetData": null,
	
		/**
		 * Property to read the value for the cells in the column from the data
		 * source array / object. If null, then the default content is used, if a
		 * function is given then the return from the function is used.
		 *  @type function|int|string|null
		 *  @default null
		 */
		"mData": null,
	
		/**
		 * Partner property to mData which is used (only when defined) to get
		 * the data - i.e. it is basically the same as mData, but without the
		 * 'set' option, and also the data fed to it is the result from mData.
		 * This is the rendering method to match the data method of mData.
		 *  @type function|int|string|null
		 *  @default null
		 */
		"mRender": null,
	
		/**
		 * Unique header TH/TD element for this column - this is what the sorting
		 * listener is attached to (if sorting is enabled.)
		 *  @type node
		 *  @default null
		 */
		"nTh": null,
	
		/**
		 * Unique footer TH/TD element for this column (if there is one). Not used
		 * in DataTables as such, but can be used for plug-ins to reference the
		 * footer for each column.
		 *  @type node
		 *  @default null
		 */
		"nTf": null,
	
		/**
		 * The class to apply to all TD elements in the table's TBODY for the column
		 *  @type string
		 *  @default null
		 */
		"sClass": null,
	
		/**
		 * When DataTables calculates the column widths to assign to each column,
		 * it finds the longest string in each column and then constructs a
		 * temporary table and reads the widths from that. The problem with this
		 * is that "mmm" is much wider then "iiii", but the latter is a longer
		 * string - thus the calculation can go wrong (doing it properly and putting
		 * it into an DOM object and measuring that is horribly(!) slow). Thus as
		 * a "work around" we provide this option. It will append its value to the
		 * text that is found to be the longest string for the column - i.e. padding.
		 *  @type string
		 */
		"sContentPadding": null,
	
		/**
		 * Allows a default value to be given for a column's data, and will be used
		 * whenever a null data source is encountered (this can be because mData
		 * is set to null, or because the data source itself is null).
		 *  @type string
		 *  @default null
		 */
		"sDefaultContent": null,
	
		/**
		 * Name for the column, allowing reference to the column by name as well as
		 * by index (needs a lookup to work by name).
		 *  @type string
		 */
		"sName": null,
	
		/**
		 * Custom sorting data type - defines which of the available plug-ins in
		 * afnSortData the custom sorting will use - if any is defined.
		 *  @type string
		 *  @default std
		 */
		"sSortDataType": 'std',
	
		/**
		 * Class to be applied to the header element when sorting on this column
		 *  @type string
		 *  @default null
		 */
		"sSortingClass": null,
	
		/**
		 * Class to be applied to the header element when sorting on this column -
		 * when jQuery UI theming is used.
		 *  @type string
		 *  @default null
		 */
		"sSortingClassJUI": null,
	
		/**
		 * Title of the column - what is seen in the TH element (nTh).
		 *  @type string
		 */
		"sTitle": null,
	
		/**
		 * Column sorting and filtering type
		 *  @type string
		 *  @default null
		 */
		"sType": null,
	
		/**
		 * Width of the column
		 *  @type string
		 *  @default null
		 */
		"sWidth": null,
	
		/**
		 * Width of the column when it was first "encountered"
		 *  @type string
		 *  @default null
		 */
		"sWidthOrig": null
	};
	
	
	/*
	 * Developer note: The properties of the object below are given in Hungarian
	 * notation, that was used as the interface for DataTables prior to v1.10, however
	 * from v1.10 onwards the primary interface is camel case. In order to avoid
	 * breaking backwards compatibility utterly with this change, the Hungarian
	 * version is still, internally the primary interface, but is is not documented
	 * - hence the @name tags in each doc comment. This allows a Javascript function
	 * to create a map from Hungarian notation to camel case (going the other direction
	 * would require each property to be listed, which would at around 3K to the size
	 * of DataTables, while this method is about a 0.5K hit.
	 *
	 * Ultimately this does pave the way for Hungarian notation to be dropped
	 * completely, but that is a massive amount of work and will break current
	 * installs (therefore is on-hold until v2).
	 */
	
	/**
	 * Initialisation options that can be given to DataTables at initialisation
	 * time.
	 *  @namespace
	 */
	DataTable.defaults = {
		/**
		 * An array of data to use for the table, passed in at initialisation which
		 * will be used in preference to any data which is already in the DOM. This is
		 * particularly useful for constructing tables purely in Javascript, for
		 * example with a custom Ajax call.
		 *  @type array
		 *  @default null
		 *
		 *  @dtopt Option
		 *  @name DataTable.defaults.data
		 *
		 *  @example
		 *    // Using a 2D array data source
		 *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "data": [
		 *          ['Trident', 'Internet Explorer 4.0', 'Win 95+', 4, 'X'],
		 *          ['Trident', 'Internet Explorer 5.0', 'Win 95+', 5, 'C'],
		 *        ],
		 *        "columns": [
		 *          { "title": "Engine" },
		 *          { "title": "Browser" },
		 *          { "title": "Platform" },
		 *          { "title": "Version" },
		 *          { "title": "Grade" }
		 *        ]
		 *      } );
		 *    } );
		 *
		 *  @example
		 *    // Using an array of objects as a data source (`data`)
		 *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "data": [
		 *          {
		 *            "engine":   "Trident",
		 *            "browser":  "Internet Explorer 4.0",
		 *            "platform": "Win 95+",
		 *            "version":  4,
		 *            "grade":    "X"
		 *          },
		 *          {
		 *            "engine":   "Trident",
		 *            "browser":  "Internet Explorer 5.0",
		 *            "platform": "Win 95+",
		 *            "version":  5,
		 *            "grade":    "C"
		 *          }
		 *        ],
		 *        "columns": [
		 *          { "title": "Engine",   "data": "engine" },
		 *          { "title": "Browser",  "data": "browser" },
		 *          { "title": "Platform", "data": "platform" },
		 *          { "title": "Version",  "data": "version" },
		 *          { "title": "Grade",    "data": "grade" }
		 *        ]
		 *      } );
		 *    } );
		 */
		"aaData": null,
	
	
		/**
		 * If ordering is enabled, then DataTables will perform a first pass sort on
		 * initialisation. You can define which column(s) the sort is performed
		 * upon, and the sorting direction, with this variable. The `sorting` array
		 * should contain an array for each column to be sorted initially containing
		 * the column's index and a direction string ('asc' or 'desc').
		 *  @type array
		 *  @default [[0,'asc']]
		 *
		 *  @dtopt Option
		 *  @name DataTable.defaults.order
		 *
		 *  @example
		 *    // Sort by 3rd column first, and then 4th column
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "order": [[2,'asc'], [3,'desc']]
		 *      } );
		 *    } );
		 *
		 *    // No initial sorting
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "order": []
		 *      } );
		 *    } );
		 */
		"aaSorting": [[0,'asc']],
	
	
		/**
		 * This parameter is basically identical to the `sorting` parameter, but
		 * cannot be overridden by user interaction with the table. What this means
		 * is that you could have a column (visible or hidden) which the sorting
		 * will always be forced on first - any sorting after that (from the user)
		 * will then be performed as required. This can be useful for grouping rows
		 * together.
		 *  @type array
		 *  @default null
		 *
		 *  @dtopt Option
		 *  @name DataTable.defaults.orderFixed
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "orderFixed": [[0,'asc']]
		 *      } );
		 *    } )
		 */
		"aaSortingFixed": [],
	
	
		/**
		 * DataTables can be instructed to load data to display in the table from a
		 * Ajax source. This option defines how that Ajax call is made and where to.
		 *
		 * The `ajax` property has three different modes of operation, depending on
		 * how it is defined. These are:
		 *
		 * * `string` - Set the URL from where the data should be loaded from.
		 * * `object` - Define properties for `jQuery.ajax`.
		 * * `function` - Custom data get function
		 *
		 * `string`
		 * --------
		 *
		 * As a string, the `ajax` property simply defines the URL from which
		 * DataTables will load data.
		 *
		 * `object`
		 * --------
		 *
		 * As an object, the parameters in the object are passed to
		 * [jQuery.ajax](http://api.jquery.com/jQuery.ajax/) allowing fine control
		 * of the Ajax request. DataTables has a number of default parameters which
		 * you can override using this option. Please refer to the jQuery
		 * documentation for a full description of the options available, although
		 * the following parameters provide additional options in DataTables or
		 * require special consideration:
		 *
		 * * `data` - As with jQuery, `data` can be provided as an object, but it
		 *   can also be used as a function to manipulate the data DataTables sends
		 *   to the server. The function takes a single parameter, an object of
		 *   parameters with the values that DataTables has readied for sending. An
		 *   object may be returned which will be merged into the DataTables
		 *   defaults, or you can add the items to the object that was passed in and
		 *   not return anything from the function. This supersedes `fnServerParams`
		 *   from DataTables 1.9-.
		 *
		 * * `dataSrc` - By default DataTables will look for the property `data` (or
		 *   `aaData` for compatibility with DataTables 1.9-) when obtaining data
		 *   from an Ajax source or for server-side processing - this parameter
		 *   allows that property to be changed. You can use Javascript dotted
		 *   object notation to get a data source for multiple levels of nesting, or
		 *   it my be used as a function. As a function it takes a single parameter,
		 *   the JSON returned from the server, which can be manipulated as
		 *   required, with the returned value being that used by DataTables as the
		 *   data source for the table. This supersedes `sAjaxDataProp` from
		 *   DataTables 1.9-.
		 *
		 * * `success` - Should not be overridden it is used internally in
		 *   DataTables. To manipulate / transform the data returned by the server
		 *   use `ajax.dataSrc`, or use `ajax` as a function (see below).
		 *
		 * `function`
		 * ----------
		 *
		 * As a function, making the Ajax call is left up to yourself allowing
		 * complete control of the Ajax request. Indeed, if desired, a method other
		 * than Ajax could be used to obtain the required data, such as Web storage
		 * or an AIR database.
		 *
		 * The function is given four parameters and no return is required. The
		 * parameters are:
		 *
		 * 1. _object_ - Data to send to the server
		 * 2. _function_ - Callback function that must be executed when the required
		 *    data has been obtained. That data should be passed into the callback
		 *    as the only parameter
		 * 3. _object_ - DataTables settings object for the table
		 *
		 * Note that this supersedes `fnServerData` from DataTables 1.9-.
		 *
		 *  @type string|object|function
		 *  @default null
		 *
		 *  @dtopt Option
		 *  @name DataTable.defaults.ajax
		 *  @since 1.10.0
		 *
		 * @example
		 *   // Get JSON data from a file via Ajax.
		 *   // Note DataTables expects data in the form `{ data: [ ...data... ] }` by default).
		 *   $('#example').dataTable( {
		 *     "ajax": "data.json"
		 *   } );
		 *
		 * @example
		 *   // Get JSON data from a file via Ajax, using `dataSrc` to change
		 *   // `data` to `tableData` (i.e. `{ tableData: [ ...data... ] }`)
		 *   $('#example').dataTable( {
		 *     "ajax": {
		 *       "url": "data.json",
		 *       "dataSrc": "tableData"
		 *     }
		 *   } );
		 *
		 * @example
		 *   // Get JSON data from a file via Ajax, using `dataSrc` to read data
		 *   // from a plain array rather than an array in an object
		 *   $('#example').dataTable( {
		 *     "ajax": {
		 *       "url": "data.json",
		 *       "dataSrc": ""
		 *     }
		 *   } );
		 *
		 * @example
		 *   // Manipulate the data returned from the server - add a link to data
		 *   // (note this can, should, be done using `render` for the column - this
		 *   // is just a simple example of how the data can be manipulated).
		 *   $('#example').dataTable( {
		 *     "ajax": {
		 *       "url": "data.json",
		 *       "dataSrc": function ( json ) {
		 *         for ( var i=0, ien=json.length ; i<ien ; i++ ) {
		 *           json[i][0] = '<a href="/message/'+json[i][0]+'>View message</a>';
		 *         }
		 *         return json;
		 *       }
		 *     }
		 *   } );
		 *
		 * @example
		 *   // Add data to the request
		 *   $('#example').dataTable( {
		 *     "ajax": {
		 *       "url": "data.json",
		 *       "data": function ( d ) {
		 *         return {
		 *           "extra_search": $('#extra').val()
		 *         };
		 *       }
		 *     }
		 *   } );
		 *
		 * @example
		 *   // Send request as POST
		 *   $('#example').dataTable( {
		 *     "ajax": {
		 *       "url": "data.json",
		 *       "type": "POST"
		 *     }
		 *   } );
		 *
		 * @example
		 *   // Get the data from localStorage (could interface with a form for
		 *   // adding, editing and removing rows).
		 *   $('#example').dataTable( {
		 *     "ajax": function (data, callback, settings) {
		 *       callback(
		 *         JSON.parse( localStorage.getItem('dataTablesData') )
		 *       );
		 *     }
		 *   } );
		 */
		"ajax": null,
	
	
		/**
		 * This parameter allows you to readily specify the entries in the length drop
		 * down menu that DataTables shows when pagination is enabled. It can be
		 * either a 1D array of options which will be used for both the displayed
		 * option and the value, or a 2D array which will use the array in the first
		 * position as the value, and the array in the second position as the
		 * displayed options (useful for language strings such as 'All').
		 *
		 * Note that the `pageLength` property will be automatically set to the
		 * first value given in this array, unless `pageLength` is also provided.
		 *  @type array
		 *  @default [ 10, 25, 50, 100 ]
		 *
		 *  @dtopt Option
		 *  @name DataTable.defaults.lengthMenu
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]]
		 *      } );
		 *    } );
		 */
		"aLengthMenu": [ 10, 25, 50, 100 ],
	
	
		/**
		 * The `columns` option in the initialisation parameter allows you to define
		 * details about the way individual columns behave. For a full list of
		 * column options that can be set, please see
		 * {@link DataTable.defaults.column}. Note that if you use `columns` to
		 * define your columns, you must have an entry in the array for every single
		 * column that you have in your table (these can be null if you don't which
		 * to specify any options).
		 *  @member
		 *
		 *  @name DataTable.defaults.column
		 */
		"aoColumns": null,
	
		/**
		 * Very similar to `columns`, `columnDefs` allows you to target a specific
		 * column, multiple columns, or all columns, using the `targets` property of
		 * each object in the array. This allows great flexibility when creating
		 * tables, as the `columnDefs` arrays can be of any length, targeting the
		 * columns you specifically want. `columnDefs` may use any of the column
		 * options available: {@link DataTable.defaults.column}, but it _must_
		 * have `targets` defined in each object in the array. Values in the `targets`
		 * array may be:
		 *   <ul>
		 *     <li>a string - class name will be matched on the TH for the column</li>
		 *     <li>0 or a positive integer - column index counting from the left</li>
		 *     <li>a negative integer - column index counting from the right</li>
		 *     <li>the string "_all" - all columns (i.e. assign a default)</li>
		 *   </ul>
		 *  @member
		 *
		 *  @name DataTable.defaults.columnDefs
		 */
		"aoColumnDefs": null,
	
	
		/**
		 * Basically the same as `search`, this parameter defines the individual column
		 * filtering state at initialisation time. The array must be of the same size
		 * as the number of columns, and each element be an object with the parameters
		 * `search` and `escapeRegex` (the latter is optional). 'null' is also
		 * accepted and the default will be used.
		 *  @type array
		 *  @default []
		 *
		 *  @dtopt Option
		 *  @name DataTable.defaults.searchCols
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "searchCols": [
		 *          null,
		 *          { "search": "My filter" },
		 *          null,
		 *          { "search": "^[0-9]", "escapeRegex": false }
		 *        ]
		 *      } );
		 *    } )
		 */
		"aoSearchCols": [],
	
	
		/**
		 * An array of CSS classes that should be applied to displayed rows. This
		 * array may be of any length, and DataTables will apply each class
		 * sequentially, looping when required.
		 *  @type array
		 *  @default null <i>Will take the values determined by the `oClasses.stripe*`
		 *    options</i>
		 *
		 *  @dtopt Option
		 *  @name DataTable.defaults.stripeClasses
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "stripeClasses": [ 'strip1', 'strip2', 'strip3' ]
		 *      } );
		 *    } )
		 */
		"asStripeClasses": null,
	
	
		/**
		 * Enable or disable automatic column width calculation. This can be disabled
		 * as an optimisation (it takes some time to calculate the widths) if the
		 * tables widths are passed in using `columns`.
		 *  @type boolean
		 *  @default true
		 *
		 *  @dtopt Features
		 *  @name DataTable.defaults.autoWidth
		 *
		 *  @example
		 *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "autoWidth": false
		 *      } );
		 *    } );
		 */
		"bAutoWidth": true,
	
	
		/**
		 * Deferred rendering can provide DataTables with a huge speed boost when you
		 * are using an Ajax or JS data source for the table. This option, when set to
		 * true, will cause DataTables to defer the creation of the table elements for
		 * each row until they are needed for a draw - saving a significant amount of
		 * time.
		 *  @type boolean
		 *  @default false
		 *
		 *  @dtopt Features
		 *  @name DataTable.defaults.deferRender
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "ajax": "sources/arrays.txt",
		 *        "deferRender": true
		 *      } );
		 *    } );
		 */
		"bDeferRender": false,
	
	
		/**
		 * Replace a DataTable which matches the given selector and replace it with
		 * one which has the properties of the new initialisation object passed. If no
		 * table matches the selector, then the new DataTable will be constructed as
		 * per normal.
		 *  @type boolean
		 *  @default false
		 *
		 *  @dtopt Options
		 *  @name DataTable.defaults.destroy
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "srollY": "200px",
		 *        "paginate": false
		 *      } );
		 *
		 *      // Some time later....
		 *      $('#example').dataTable( {
		 *        "filter": false,
		 *        "destroy": true
		 *      } );
		 *    } );
		 */
		"bDestroy": false,
	
	
		/**
		 * Enable or disable filtering of data. Filtering in DataTables is "smart" in
		 * that it allows the end user to input multiple words (space separated) and
		 * will match a row containing those words, even if not in the order that was
		 * specified (this allow matching across multiple columns). Note that if you
		 * wish to use filtering in DataTables this must remain 'true' - to remove the
		 * default filtering input box and retain filtering abilities, please use
		 * {@link DataTable.defaults.dom}.
		 *  @type boolean
		 *  @default true
		 *
		 *  @dtopt Features
		 *  @name DataTable.defaults.searching
		 *
		 *  @example
		 *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "searching": false
		 *      } );
		 *    } );
		 */
		"bFilter": true,
	
	
		/**
		 * Enable or disable the table information display. This shows information
		 * about the data that is currently visible on the page, including information
		 * about filtered data if that action is being performed.
		 *  @type boolean
		 *  @default true
		 *
		 *  @dtopt Features
		 *  @name DataTable.defaults.info
		 *
		 *  @example
		 *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "info": false
		 *      } );
		 *    } );
		 */
		"bInfo": true,
	
	
		/**
		 * Enable jQuery UI ThemeRoller support (required as ThemeRoller requires some
		 * slightly different and additional mark-up from what DataTables has
		 * traditionally used).
		 *  @type boolean
		 *  @default false
		 *
		 *  @dtopt Features
		 *  @name DataTable.defaults.jQueryUI
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "jQueryUI": true
		 *      } );
		 *    } );
		 */
		"bJQueryUI": false,
	
	
		/**
		 * Allows the end user to select the size of a formatted page from a select
		 * menu (sizes are 10, 25, 50 and 100). Requires pagination (`paginate`).
		 *  @type boolean
		 *  @default true
		 *
		 *  @dtopt Features
		 *  @name DataTable.defaults.lengthChange
		 *
		 *  @example
		 *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "lengthChange": false
		 *      } );
		 *    } );
		 */
		"bLengthChange": true,
	
	
		/**
		 * Enable or disable pagination.
		 *  @type boolean
		 *  @default true
		 *
		 *  @dtopt Features
		 *  @name DataTable.defaults.paging
		 *
		 *  @example
		 *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "paging": false
		 *      } );
		 *    } );
		 */
		"bPaginate": true,
	
	
		/**
		 * Enable or disable the display of a 'processing' indicator when the table is
		 * being processed (e.g. a sort). This is particularly useful for tables with
		 * large amounts of data where it can take a noticeable amount of time to sort
		 * the entries.
		 *  @type boolean
		 *  @default false
		 *
		 *  @dtopt Features
		 *  @name DataTable.defaults.processing
		 *
		 *  @example
		 *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "processing": true
		 *      } );
		 *    } );
		 */
		"bProcessing": false,
	
	
		/**
		 * Retrieve the DataTables object for the given selector. Note that if the
		 * table has already been initialised, this parameter will cause DataTables
		 * to simply return the object that has already been set up - it will not take
		 * account of any changes you might have made to the initialisation object
		 * passed to DataTables (setting this parameter to true is an acknowledgement
		 * that you understand this). `destroy` can be used to reinitialise a table if
		 * you need.
		 *  @type boolean
		 *  @default false
		 *
		 *  @dtopt Options
		 *  @name DataTable.defaults.retrieve
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      initTable();
		 *      tableActions();
		 *    } );
		 *
		 *    function initTable ()
		 *    {
		 *      return $('#example').dataTable( {
		 *        "scrollY": "200px",
		 *        "paginate": false,
		 *        "retrieve": true
		 *      } );
		 *    }
		 *
		 *    function tableActions ()
		 *    {
		 *      var table = initTable();
		 *      // perform API operations with oTable
		 *    }
		 */
		"bRetrieve": false,
	
	
		/**
		 * When vertical (y) scrolling is enabled, DataTables will force the height of
		 * the table's viewport to the given height at all times (useful for layout).
		 * However, this can look odd when filtering data down to a small data set,
		 * and the footer is left "floating" further down. This parameter (when
		 * enabled) will cause DataTables to collapse the table's viewport down when
		 * the result set will fit within the given Y height.
		 *  @type boolean
		 *  @default false
		 *
		 *  @dtopt Options
		 *  @name DataTable.defaults.scrollCollapse
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "scrollY": "200",
		 *        "scrollCollapse": true
		 *      } );
		 *    } );
		 */
		"bScrollCollapse": false,
	
	
		/**
		 * Configure DataTables to use server-side processing. Note that the
		 * `ajax` parameter must also be given in order to give DataTables a
		 * source to obtain the required data for each draw.
		 *  @type boolean
		 *  @default false
		 *
		 *  @dtopt Features
		 *  @dtopt Server-side
		 *  @name DataTable.defaults.serverSide
		 *
		 *  @example
		 *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "serverSide": true,
		 *        "ajax": "xhr.php"
		 *      } );
		 *    } );
		 */
		"bServerSide": false,
	
	
		/**
		 * Enable or disable sorting of columns. Sorting of individual columns can be
		 * disabled by the `sortable` option for each column.
		 *  @type boolean
		 *  @default true
		 *
		 *  @dtopt Features
		 *  @name DataTable.defaults.ordering
		 *
		 *  @example
		 *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "ordering": false
		 *      } );
		 *    } );
		 */
		"bSort": true,
	
	
		/**
		 * Enable or display DataTables' ability to sort multiple columns at the
		 * same time (activated by shift-click by the user).
		 *  @type boolean
		 *  @default true
		 *
		 *  @dtopt Options
		 *  @name DataTable.defaults.orderMulti
		 *
		 *  @example
		 *    // Disable multiple column sorting ability
		 *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "orderMulti": false
		 *      } );
		 *    } );
		 */
		"bSortMulti": true,
	
	
		/**
		 * Allows control over whether DataTables should use the top (true) unique
		 * cell that is found for a single column, or the bottom (false - default).
		 * This is useful when using complex headers.
		 *  @type boolean
		 *  @default false
		 *
		 *  @dtopt Options
		 *  @name DataTable.defaults.orderCellsTop
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "orderCellsTop": true
		 *      } );
		 *    } );
		 */
		"bSortCellsTop": false,
	
	
		/**
		 * Enable or disable the addition of the classes `sorting\_1`, `sorting\_2` and
		 * `sorting\_3` to the columns which are currently being sorted on. This is
		 * presented as a feature switch as it can increase processing time (while
		 * classes are removed and added) so for large data sets you might want to
		 * turn this off.
		 *  @type boolean
		 *  @default true
		 *
		 *  @dtopt Features
		 *  @name DataTable.defaults.orderClasses
		 *
		 *  @example
		 *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "orderClasses": false
		 *      } );
		 *    } );
		 */
		"bSortClasses": true,
	
	
		/**
		 * Enable or disable state saving. When enabled HTML5 `localStorage` will be
		 * used to save table display information such as pagination information,
		 * display length, filtering and sorting. As such when the end user reloads
		 * the page the display display will match what thy had previously set up.
		 *
		 * Due to the use of `localStorage` the default state saving is not supported
		 * in IE6 or 7. If state saving is required in those browsers, use
		 * `stateSaveCallback` to provide a storage solution such as cookies.
		 *  @type boolean
		 *  @default false
		 *
		 *  @dtopt Features
		 *  @name DataTable.defaults.stateSave
		 *
		 *  @example
		 *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "stateSave": true
		 *      } );
		 *    } );
		 */
		"bStateSave": false,
	
	
		/**
		 * This function is called when a TR element is created (and all TD child
		 * elements have been inserted), or registered if using a DOM source, allowing
		 * manipulation of the TR element (adding classes etc).
		 *  @type function
		 *  @param {node} row "TR" element for the current row
		 *  @param {array} data Raw data array for this row
		 *  @param {int} dataIndex The index of this row in the internal aoData array
		 *
		 *  @dtopt Callbacks
		 *  @name DataTable.defaults.createdRow
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "createdRow": function( row, data, dataIndex ) {
		 *          // Bold the grade for all 'A' grade browsers
		 *          if ( data[4] == "A" )
		 *          {
		 *            $('td:eq(4)', row).html( '<b>A</b>' );
		 *          }
		 *        }
		 *      } );
		 *    } );
		 */
		"fnCreatedRow": null,
	
	
		/**
		 * This function is called on every 'draw' event, and allows you to
		 * dynamically modify any aspect you want about the created DOM.
		 *  @type function
		 *  @param {object} settings DataTables settings object
		 *
		 *  @dtopt Callbacks
		 *  @name DataTable.defaults.drawCallback
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "drawCallback": function( settings ) {
		 *          alert( 'DataTables has redrawn the table' );
		 *        }
		 *      } );
		 *    } );
		 */
		"fnDrawCallback": null,
	
	
		/**
		 * Identical to fnHeaderCallback() but for the table footer this function
		 * allows you to modify the table footer on every 'draw' event.
		 *  @type function
		 *  @param {node} foot "TR" element for the footer
		 *  @param {array} data Full table data (as derived from the original HTML)
		 *  @param {int} start Index for the current display starting point in the
		 *    display array
		 *  @param {int} end Index for the current display ending point in the
		 *    display array
		 *  @param {array int} display Index array to translate the visual position
		 *    to the full data array
		 *
		 *  @dtopt Callbacks
		 *  @name DataTable.defaults.footerCallback
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "footerCallback": function( tfoot, data, start, end, display ) {
		 *          tfoot.getElementsByTagName('th')[0].innerHTML = "Starting index is "+start;
		 *        }
		 *      } );
		 *    } )
		 */
		"fnFooterCallback": null,
	
	
		/**
		 * When rendering large numbers in the information element for the table
		 * (i.e. "Showing 1 to 10 of 57 entries") DataTables will render large numbers
		 * to have a comma separator for the 'thousands' units (e.g. 1 million is
		 * rendered as "1,000,000") to help readability for the end user. This
		 * function will override the default method DataTables uses.
		 *  @type function
		 *  @member
		 *  @param {int} toFormat number to be formatted
		 *  @returns {string} formatted string for DataTables to show the number
		 *
		 *  @dtopt Callbacks
		 *  @name DataTable.defaults.formatNumber
		 *
		 *  @example
		 *    // Format a number using a single quote for the separator (note that
		 *    // this can also be done with the language.thousands option)
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "formatNumber": function ( toFormat ) {
		 *          return toFormat.toString().replace(
		 *            /\B(?=(\d{3})+(?!\d))/g, "'"
		 *          );
		 *        };
		 *      } );
		 *    } );
		 */
		"fnFormatNumber": function ( toFormat ) {
			return toFormat.toString().replace(
				/\B(?=(\d{3})+(?!\d))/g,
				this.oLanguage.sThousands
			);
		},
	
	
		/**
		 * This function is called on every 'draw' event, and allows you to
		 * dynamically modify the header row. This can be used to calculate and
		 * display useful information about the table.
		 *  @type function
		 *  @param {node} head "TR" element for the header
		 *  @param {array} data Full table data (as derived from the original HTML)
		 *  @param {int} start Index for the current display starting point in the
		 *    display array
		 *  @param {int} end Index for the current display ending point in the
		 *    display array
		 *  @param {array int} display Index array to translate the visual position
		 *    to the full data array
		 *
		 *  @dtopt Callbacks
		 *  @name DataTable.defaults.headerCallback
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "fheaderCallback": function( head, data, start, end, display ) {
		 *          head.getElementsByTagName('th')[0].innerHTML = "Displaying "+(end-start)+" records";
		 *        }
		 *      } );
		 *    } )
		 */
		"fnHeaderCallback": null,
	
	
		/**
		 * The information element can be used to convey information about the current
		 * state of the table. Although the internationalisation options presented by
		 * DataTables are quite capable of dealing with most customisations, there may
		 * be times where you wish to customise the string further. This callback
		 * allows you to do exactly that.
		 *  @type function
		 *  @param {object} oSettings DataTables settings object
		 *  @param {int} start Starting position in data for the draw
		 *  @param {int} end End position in data for the draw
		 *  @param {int} max Total number of rows in the table (regardless of
		 *    filtering)
		 *  @param {int} total Total number of rows in the data set, after filtering
		 *  @param {string} pre The string that DataTables has formatted using it's
		 *    own rules
		 *  @returns {string} The string to be displayed in the information element.
		 *
		 *  @dtopt Callbacks
		 *  @name DataTable.defaults.infoCallback
		 *
		 *  @example
		 *    $('#example').dataTable( {
		 *      "infoCallback": function( settings, start, end, max, total, pre ) {
		 *        return start +" to "+ end;
		 *      }
		 *    } );
		 */
		"fnInfoCallback": null,
	
	
		/**
		 * Called when the table has been initialised. Normally DataTables will
		 * initialise sequentially and there will be no need for this function,
		 * however, this does not hold true when using external language information
		 * since that is obtained using an async XHR call.
		 *  @type function
		 *  @param {object} settings DataTables settings object
		 *  @param {object} json The JSON object request from the server - only
		 *    present if client-side Ajax sourced data is used
		 *
		 *  @dtopt Callbacks
		 *  @name DataTable.defaults.initComplete
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "initComplete": function(settings, json) {
		 *          alert( 'DataTables has finished its initialisation.' );
		 *        }
		 *      } );
		 *    } )
		 */
		"fnInitComplete": null,
	
	
		/**
		 * Called at the very start of each table draw and can be used to cancel the
		 * draw by returning false, any other return (including undefined) results in
		 * the full draw occurring).
		 *  @type function
		 *  @param {object} settings DataTables settings object
		 *  @returns {boolean} False will cancel the draw, anything else (including no
		 *    return) will allow it to complete.
		 *
		 *  @dtopt Callbacks
		 *  @name DataTable.defaults.preDrawCallback
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "preDrawCallback": function( settings ) {
		 *          if ( $('#test').val() == 1 ) {
		 *            return false;
		 *          }
		 *        }
		 *      } );
		 *    } );
		 */
		"fnPreDrawCallback": null,
	
	
		/**
		 * This function allows you to 'post process' each row after it have been
		 * generated for each table draw, but before it is rendered on screen. This
		 * function might be used for setting the row class name etc.
		 *  @type function
		 *  @param {node} row "TR" element for the current row
		 *  @param {array} data Raw data array for this row
		 *  @param {int} displayIndex The display index for the current table draw
		 *  @param {int} displayIndexFull The index of the data in the full list of
		 *    rows (after filtering)
		 *
		 *  @dtopt Callbacks
		 *  @name DataTable.defaults.rowCallback
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "rowCallback": function( row, data, displayIndex, displayIndexFull ) {
		 *          // Bold the grade for all 'A' grade browsers
		 *          if ( data[4] == "A" ) {
		 *            $('td:eq(4)', row).html( '<b>A</b>' );
		 *          }
		 *        }
		 *      } );
		 *    } );
		 */
		"fnRowCallback": null,
	
	
		/**
		 * __Deprecated__ The functionality provided by this parameter has now been
		 * superseded by that provided through `ajax`, which should be used instead.
		 *
		 * This parameter allows you to override the default function which obtains
		 * the data from the server so something more suitable for your application.
		 * For example you could use POST data, or pull information from a Gears or
		 * AIR database.
		 *  @type function
		 *  @member
		 *  @param {string} source HTTP source to obtain the data from (`ajax`)
		 *  @param {array} data A key/value pair object containing the data to send
		 *    to the server
		 *  @param {function} callback to be called on completion of the data get
		 *    process that will draw the data on the page.
		 *  @param {object} settings DataTables settings object
		 *
		 *  @dtopt Callbacks
		 *  @dtopt Server-side
		 *  @name DataTable.defaults.serverData
		 *
		 *  @deprecated 1.10. Please use `ajax` for this functionality now.
		 */
		"fnServerData": null,
	
	
		/**
		 * __Deprecated__ The functionality provided by this parameter has now been
		 * superseded by that provided through `ajax`, which should be used instead.
		 *
		 *  It is often useful to send extra data to the server when making an Ajax
		 * request - for example custom filtering information, and this callback
		 * function makes it trivial to send extra information to the server. The
		 * passed in parameter is the data set that has been constructed by
		 * DataTables, and you can add to this or modify it as you require.
		 *  @type function
		 *  @param {array} data Data array (array of objects which are name/value
		 *    pairs) that has been constructed by DataTables and will be sent to the
		 *    server. In the case of Ajax sourced data with server-side processing
		 *    this will be an empty array, for server-side processing there will be a
		 *    significant number of parameters!
		 *  @returns {undefined} Ensure that you modify the data array passed in,
		 *    as this is passed by reference.
		 *
		 *  @dtopt Callbacks
		 *  @dtopt Server-side
		 *  @name DataTable.defaults.serverParams
		 *
		 *  @deprecated 1.10. Please use `ajax` for this functionality now.
		 */
		"fnServerParams": null,
	
	
		/**
		 * Load the table state. With this function you can define from where, and how, the
		 * state of a table is loaded. By default DataTables will load from `localStorage`
		 * but you might wish to use a server-side database or cookies.
		 *  @type function
		 *  @member
		 *  @param {object} settings DataTables settings object
		 *  @return {object} The DataTables state object to be loaded
		 *
		 *  @dtopt Callbacks
		 *  @name DataTable.defaults.stateLoadCallback
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "stateSave": true,
		 *        "stateLoadCallback": function (settings) {
		 *          var o;
		 *
		 *          // Send an Ajax request to the server to get the data. Note that
		 *          // this is a synchronous request.
		 *          $.ajax( {
		 *            "url": "/state_load",
		 *            "async": false,
		 *            "dataType": "json",
		 *            "success": function (json) {
		 *              o = json;
		 *            }
		 *          } );
		 *
		 *          return o;
		 *        }
		 *      } );
		 *    } );
		 */
		"fnStateLoadCallback": function ( settings ) {
			try {
				return JSON.parse(
					(settings.iStateDuration === -1 ? sessionStorage : localStorage).getItem(
						'DataTables_'+settings.sInstance+'_'+location.pathname
					)
				);
			} catch (e) {}
		},
	
	
		/**
		 * Callback which allows modification of the saved state prior to loading that state.
		 * This callback is called when the table is loading state from the stored data, but
		 * prior to the settings object being modified by the saved state. Note that for
		 * plug-in authors, you should use the `stateLoadParams` event to load parameters for
		 * a plug-in.
		 *  @type function
		 *  @param {object} settings DataTables settings object
		 *  @param {object} data The state object that is to be loaded
		 *
		 *  @dtopt Callbacks
		 *  @name DataTable.defaults.stateLoadParams
		 *
		 *  @example
		 *    // Remove a saved filter, so filtering is never loaded
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "stateSave": true,
		 *        "stateLoadParams": function (settings, data) {
		 *          data.oSearch.sSearch = "";
		 *        }
		 *      } );
		 *    } );
		 *
		 *  @example
		 *    // Disallow state loading by returning false
		 *    $(dOcU�mNti>ready( v}�c�ion() s
		 * �   $h/#example')+�`tcUeblE( {
	C!*      � "wtct%Save": true
) *`   (  ""�tatgLoadPacelc"�!fwncpio~ (settings. data) {
	 *   �     rdturn fclse;
		 *$   (   }
		�*    0� )�
	I *    } )?
�� */
		"fnSt`4gHoydQarams": ~�lh,
	
	
	-**
	 * Callback thiT i Called�when ��e state has bEen"lkade$ fr/m uhe wpatm sarINg,method
		 * and thw Da�aT`blec sdttings`objejt�hqs been modigiet as a&rEsult(f uba loaded sTetu,		 * $@typi fu~ction
		 * $Aparqm {gbjecT� rgtt�nws Dat�Tab�es se|tIfgs object
		 *  @pabam {oBfegtu data U(e!spate objuct tkA�"wis laded
		 *
		 *  @dtort Caxlbacks
�	 *$8@n�mE DataTabngdefaults.stateliade$
K)�*
	�j @examp�e
		 *"  "// Show an$almbd wi|h dhd &i&Q}3ing value tx!t 7��!saved
	 n    $(doc�me~t).ready( f5ncti~() {
		 *      $*'#e0amplG').dataPcble( {
	) *    �  ��svateSave+* �Rue<
		"* `    `("stateLoadet": fulction (s�tti�gs, eat!� {
	� * $  �     a�ert( 'SaVud filtgr was> '+Dada.oSec6ch.sS�arc` );
	�*        }
	 * 0   �| );
	`*�   } );
	 :/		"fnSt%tuLoad�d": null-
	
	
I	/**
		 * Ra6e the tab|e qtate. Vhis Func4imj allows iou tk defIne �herd !nd(how he sdgte
		 *0inform!ta/n �r`the tab�g�i{`wtorel0By#defa�lt atatabla{�will use `localWtorage@
		$* rut yo} might wiRh to use a server=side databasG or cmokies/
		 *  @tipe fu~ap�n
		(*  @lemrer*	 * "Bparam {obkect}�seutinos TatiTarles settIf�c obzect
		 * "@pApam {ob*ec|} data The state obbg`t�to be saved	 *
		 *  �dpopt Aalnbicks		 *"(`name D`d�Tablendefaul|s,3tatESaveCallbask
		 *		$*  @ehaoqle
		"*    .(dmgument).reae�( fengthon() {
	 *  !   $('+gxAm`le').dauaTable, {
		 *  !�  ` "stateScv�": tp�e,
		 *   (  "0bstiteSaveCallback": functiol!settijgs, diTa)${
		 *          // Send"an Ajax`r�yuesu to �ne`s%rver withthe state objes4�	 *          (.ajax(({
		 *   !     `� "url":  -statg_save",
		 *           & lata": data,
		 *( �    (    "datiType"z js.n"-
		 *   `        *-e�hod": "PO�T"*	)`.     ! $ ` "subcesr":"nunction () {}
	) "    `     } );
		 *      ( }
		 *$     } );
	 *    } );
	 */
		#fnSta<�Sav�Kallb!ck":`bunctign ( {ettmngs,0data ) {
			try {				�settings.iStateDuration =<= -1 ? sessionRtorage : localStrcge).s�tITeo(

				'D�taTabler_';sevtings.sInstance'_'+location.pAthn!ee,
		�	JSON.striNgify( data )
				);
		} cbtkh (e) {}
		},
*	
		/*+
		 * CalLback which allows modificavion of the suate to be sAwad. Callmd when thg�table
		 *!h!c(chcnge$ sta�e�a new state sav% is requhred. THic oethod allowq Mdification�Of
	 * The stade seviog gbbect xsyor to actually`�ohng �he sawe, includyng addition or
		!:�kthaR statu propertaes oc modifica�aon& Note that fob plug-i~ authozs, you shOuld
	� * use the `st!TeRavuParams` event tk save paramEtew3 foz a pluc/mn.
	 *   tyPe fu�c<ion
		 *  @param {objEct} set�ings DataTables"settings obje�t
		 * $@param {mbject} dap! The stcte obje#t to be savfd
		 *		 *" @dtopt0CAlLbacks
	 *  P|ame DitATable.`evaul4s.stAteSavepar�ms
		 *
		 +  @examp,e
	�!:(   /- Remove a savmd filter, so filtermng"ms never saved
	 (    $(document).ready(0funcvimn() k
		 *   0  $('#examrle').da|aTable( {
		 *    `(  "stateSave": true,
		 *     $  "stateSaveparams": f5nction (settangs, d!ta) {
		 *    0     data.S�irch.sSearch =0"b;*		 *        }
)	 *      y );
	 *    m );
		 *�Y	�fnS�ateSh~eP`rAms": null,

	�		/**
		 *�Durat)on for(whicl the saveD state ifformation �s"considered �alit. Aftez this perikD
		 *`has eLapsad t*e state will be returne� to(the default.		 * Value ms gi~eN in seconds.
		 *  @type int
	)"*`"@defatlt 7280`<i<(2"hotrs)<?i�
		 *
		 *  @dtpt O�dions
	 * 2@ocme DataWqBle.defaults.spateDuratkon
		 j
		 +  @ex!mple
		 +    $(documeNt).ready fUnction() {
		 *      $('#example'!.dataTabLe {
		 *        "stateDUration": 60*�0*24�`// 1 day
		 "      } );
		 ( $  ] )
		 */
		"iStateDuratioN": 7200,
		
		/**
	`* When enablm� DataTables 7hll nmt make a request to phE sgrv%r for the fisst
		 * page Nraw - rather it Will"use the data adraadx /n th� qagg (no sortine etc
		 * 7idl �e0�pxdi$e to it), t�us sAving oo an XhR$at loapv)me. `defer\oading`		 * is uwed 4o indicate that defer2ed loading is required, buu it is !lso used�		 ( tn tell DataTablgs how majy rec/�ds there are hn`the full table *c|lowing
		 * ��e information elemunt and paginady�j t be dks�layed corregtly).(Io the c`se
		 * wher% a filtering is applied to the table on initia�$load, this can ce
		 * indicatE� by gi�ing the"`arameter�as a�bazray, whe�e the!first element is
	� * the number gf records available after filtering$and the secONd element is"|ha
		 * number(of recmrdw"with5t filter)ng (allowiog tje t!ble infrmaviol elemenu
		 * �O be shown corbectly).
		 * (Dtype`int | array
		 *  @default tll *
		 *" Dduopt Npti/ns
	 *  Bname Tatatab}e,defaults*deferLoadifg
		 

		 z  @�xample
		 ( � !// 57 racords available ). t(e tqr,e, no filTering applied
		 *   "$(documeNt).ready( fuNctaon() {
		 *      $('#example').dataTabla( {
	 :�       "qerverSide": trqt�
		 .        "ajax": "scripts/server_processing.php",
�	 *   �    "deferLoading": u7*		 *  $0  } );
		 * (  } );
		 *
		 *  @examp�e
)	�*   a./ 57 records`aftep f)nterinE,"300 withoutifi|tering (an inip	aL filt�r apPmked)
I	 * `  $(bocumeNt+.ready� ftn�tionh) {
		 *   `  $(6#e�amp�e').dat`T!ble) {
		 *        "ServevShDa": true<
		 *        "ajaX2: "Sc�ipts/Qervtr_procewsi/g.php",
		 *        "duberLoadin�bz Y$57, 1p0 ]t� *        "seaz#hb: {
		 * !(    8  "search'2 "my_nilter"
	)"* $ "0   }�		$*     !} );
		0*" �(} );
		 */
		��DeferLoading"z(null,
�
	
	/**�	 * Number0of rowS tm�diqpl!y gn c sanglm page*whEn using packnauiol. If
		 * deatuse efabldd  `lengthCiange`) thmk the %nd usdr will be abla tO o~grride
		0* thhs to a c}stom"se�ting usyng a pop-u0`menu. .  @type int
		"*   debaul� 10
		 *
		 *  DTOqt Mptions
	 (  Pname D`ta�Able,defaults.pa'eLe.gth
		 j
	i$* !@examPlE
	 *    $(dOcwmend).Ready( FufctioN() 3
		 *     `$(##exam0le')>d!t`T`bLe( {
		 **� $�( ""pageLeng�h: 50
		(*     �} 9;
	I *    y 9 "/
		"iDispdayLEngth": 10,
		
		/**
	 * davane�thE st`rtine point for"data daSplay Whel }song DataTables with
	 n pcginatioj.0N/4e uhat this"paraoeter is t(e number of records, radher �han
		 * the pawe number("so if you have 14 recOrds per$pAge and want to start ol
		 * the thirf xage, xt should(be "20".
		 *  @type int
		 *  @default 0
		 *
		 *  @ddop4 Options
		 *  @name DataTable.defewl4s.`isplayStar|
I	 *
		 +$ @example
		 *    $(document).readz( function() {
		 *  "  `$('#example').`ataTa*le,!{		 *        "displa9Stard": 20
		 *   "  },);
		 *    � )
		`*/
		"iDhSplayStqrt": p,*J	
		/**
		 * By default DataTqble� allows keybo�rd navigat)on /f the tab�e" sortinf, xaging,
		 * and fiLtering) By addinG c  tabindez` attributetO the required elements. Dxis
		 * allnws yO} to tab through the controls and press uhe mnter k%y t� aktiwate"vhem.
		 * The$tabIjdex is def!elT 0. maanmng that tHe tab foh�oos tHe flow oF the docueent.
		0* You can ov�rR5le this using th)s parameter0if yu 7ish. Use a Vclue /f -1 �o
	 * dmsAble builtmin keyb/czd navigation.
		 * " type iNt
		 (  �default 8
	"*
I	 * "Hdtopt O�tions
		 *  @name`DataTible.defaudts.tabInd�x		`*
		 *  @example
		 *    49doCudgNt).read{( fqnction() 
	 *   (  $('!example'-.dataTable( {
		 *    `   "t!bInde0": 1
I +      } );
		 *"   }`);
		 */		"ITabInfex": ,
	
	
		/**
		 *"Cl�swes that d�v`Tables assignr do the varlo5s componejts aNd feitures
		(. thAt id adds tothE HTML table. Vxi� allows clessds t+ be configtsed
		 * durinf i.ivialisation!yn avBition to THrgegh the ctatic
	 * { link D�paTablt.�xt.o_tdCLa{ses} object)�		 *  @name�pqce
		!*  @name D`vcTable.defaulVs.classe3
	 */
		foC|csses": {�$
	
	
		/:*
�	 * Adn strings thAt(DataTables Usdsd)n the!user inter�ac% thct iu creatur
	 * �re defm.ed ij Tiis object, allowing09ou tO modified them(indivieuehly or
	 * cmmpletely replacE vHem all is requibed.
		 *  @naEe�xice
		 *  @name$De4aTable.dEf!ults.language		 *?			"oLanguAwe":!y
			/**
	H * Stbings Thav �ve used for WAI-QRIa labels"and condrols onlq ,tjase are�nop
		 : aktually0vis�ble on the pa%e, bq� wyll be"Read by scrednreaders,hand thuS
M		"* -ust fa1y~|ernition1lisad aS well).
)		".! @namespace
			 .  @name2DatqTible.defaults.language.aria
			 :/
			"oAria": {
)			/**
				"*(ARIA labe| thap is added to the tablm$headers whqn the coLumn may be*			 * sortmf ascending by`actiV)ng the�c�lumn (click or return when focused).
				 * NoteathaT the columf�header is prmfi�ed to this�string.
				 * "@dyE stvilg
)			 *  @eefcult > activate to {ost coNemn ascending
		 �
				 *` @t|opt Fanguage
				"* �@n`me DataT!",e�denaults.|aogqage.aria/sortAsgmnding
				 *
�		 * `@example
			 +    $(document(.ready( �wn#tion() {				 *      $('#exampde').dataTab`e( �
				 *   ` (  "lajguage": {
		Y *          &aria�: {
				 *(  (        2sovtAsbending": "$-$slick/ruturn t�soru ascendane"
		 *    $    1]
			 *   �   }
		) *  `   } -;
				 *    m 9;
				 */
		I"swortAscenfing": ":"actitate v�$soRt golumn asceneIlg&,
	
	)		/+*				 * ARIA"label that is"added�to the table head�rs when the co|umn may Be
			 * so2t%d descending b9 activ)Ng the column (glick or"return �h5n docusedi.
			 * Nkte that the colu}n le1d%r is prefixuD"to txis strinc.
			I *  @uype`svzyng
				 *` @Dmfa�ld : activate to sort column�asc��ding
				 *J			 *  PdtopT ManguaGe
				 �( @name dataTaBdedefaults.lalguage&avia.sortDescgn$ang
				 *J			 * $Pgxample
				 *    $(docuMenv).reAdy( function() {
				 (      $('#exampleg).dataTable( s�)		�*0   �  ( lcnguage": {			 *     "( ( " ria": ;
		A	 *   �     ��""sor|@e�c�nding": � -�clicc/rgvurn to sort descejdIne"
I			 .    !     }
�		 j(   ! ( 
		 *      } ):J				(*    } ;
			 */J			 cSoztDescendingb "; actIvate tn(sojt solumn $esganding"J			},
	
		/**
			 * Pegina4ion string$uwed by Da|aTabhes Fmr the buil4-in pagination		 * kontrol type�.
			 *  @nam�space
			 *  @na=e%TataTable.defaults.l�ng5age,p!f)n�te
			 */HI		2opaginate": {J				/**				 *(Text"to use when U�i~g the 'fu,l_oumbers' type oF Pagination for the�I			!* but�mn�tO take the0w3er to"the fips4 pagd.				 *  @tyte st2ing
			**   default Firsd
				 (
			 *  Adtmpt Language	�		$*  @nc�E TataT�ble.defcudts.lqnguage>pa'ifate.firct			 *
				 +``@u�alple
				 j   !$(focu�%nt).raaey( functioo()"{
	)�	 *      $('#examrle').dc6aTcble( {
			�* $      "la&g}agg": y
				 (2  $0   0 "pagi�`e" z
				 *  � � $  �  "first": "Birs� page"*	)) "    �    �}
		 *     ` "}
(			 *�  (  } ):"			 *    } ):
			� *-			"sFy3st"� "First",	
	
				/**		� *(peyt to use wh%N using the '�ull_numbgrs' type ob pagina0an fmr tle
			 *b#u|ton to"take D�e us%r$to the H�st `agE,
				 �""bTyqe strinw
�I		 *  Bgeneult�L!st
				$*
			�"  @dtort Language
				 *  @naie0TataTAb|e.defaulpr�languagd>pAeinate.last
			� *
	�		 *  @exemrhe
				 *    $(f/bume�t).ready  Dunction() {
		) j      $('#eample').dat�Tabde( y
				 
     (  "lajeuage": {
		 *        0�xaginatej:!{*�		 *          ` *Lew~": �Last �aae"
				 *  " "  �  }J				 *!�      }
				 * � (  } );
		 
( $ } );
				 */j	"sLast": "Last#,

	
				/:h
			 * Text to`use &op the gnaxt% pafynation �u4ton,(t take Tie user to the
		 * ne8t page-.		�	 *  @dqpe Ctring
				0*  @fefatlt(Nuxt
�			 *
				 *" @v��pt(Languqge
				 *  @name DateUabl%.defaul|s.Lalg}qge.pa�inatd..ext
				$*
		)	 *  @examphe
			 *    $(documeNt)reedy( funcp�ol,) �
			) * � $  $*'#exaople'),�auaTable( {
			�!*  h     "lajwuaGe": {			M n �     "  "pqcilate": {
				(*            "nEzu"*d"Nex4�pageb�	8)	 *         "}�			 *        				 * $    }")3*			0*   (}();
			 */*			I�sNGxt": "Nmxt",

	
		8	/.*
			 * Ve8t to use nnr`the 'ppetious' pagiNatio� bu|ton (t/ ta�e the0us�v to
			) * �he previous tage�.
				 *$ @t}Pe b4ring
				 :  @$e&ault Prevh�us
				(*
				�*  @dtopt Langu!�e
i�	 *  Hna�e EaVaVable.tefaultq\Anguage.pifinateprewiouS
	��$*
	)	 *  @�xA}p�u
				 *    $(tocuoent).�eaeyh 'ulctiof(+ {
				 .      $('#gxioXLe').datqTAb|e( {
		I *      ( "laneuage": {
			�*      ��  "paginqte": {��	 *           0"previous": "RRevious p`ge"				 * ! `(  `}
			 *        �
			 * !    } �;
				 *    y )+
	�	 *
	�		"sPrevysts": "Previouc 
			=,
	
		�-*

�		 * Thi�d�A���.�f���A&o��Y�7�a".$�=�[;��r��e�/3T�}�7-�s�p���=��E�}����M��6��2�"����\�!�Mg�Gpo+���߈�h@&Iq���K+�ۓL�Jw�"�|/F�y5��/Ĝ·��3gjŏe��mm��~f�����fDd����RQ�~�t�Y"��Zaq�3Q$
��H.*N��J�q�R�e��o�7��"�J',N���(�Bk;��|N���^��F
�q҅�;���-���kƧ�w��&?<�]z�vFV�(:Dٶ����-��w���Y8��N
�]ݪ� R����\l$*�Ü\���;�w��Ί�n���d����4w�F�Z���横i9J�K<v��P|���ӧ�mҋ�v���q���h�?�fm��r[���-i��q�,O�K´��	�q�/Тc�q��h�\�w.�}��9�1����??��>�����m��w��K�$Ӛ�F�gj���, ���ଉ�ޭ)�nG�`N�nbό��7׈i��z�W�����}��Al���_�p���&;P���עL���3xfG���t�s���%���o���3%������ϒ���Q~�K .2(�QO��m,X���:�� t��;֫x_?>\ �+� O���`&�p�Ö�=�X�6�\f,Ѓ���9"�fi��w�?"�������NN�im+��O/�������U�K'�3q�Q@Ld���-�io��P;�u�Kņ�3n�m;����IK���i/]@����S��N���W�Z����g������7�^�n��
�|�^g?�7b�$L�0n�3=����T+��ְ�l6�߰�ݥ����)n�*������p��>%������ �cC䴡b��O�P�Oa�3��T��ݬ�x���S�F�G�u�����O�m�R:�����}Yz��$�:�'��4ն�p�K"y����a�]�I���CJ�UE"�Ed�|i^�T��jD㑫ME5��r��r����5���cȍ�ĉ"_o���҂��\�e�!ZWR{����Nd��&O�������2�EO}'F��6�L0�X���m����������6E������<J����WQ��1�,In�L��`*�����G�p�U_4���ֵ��x�ں�@����!c�sw%��	���K��D9)7A���.*,��P�	��U�gԩpΠvth��sk��M'���aQ����_���M5W(Ͽ���͵u�T�"g!���Y]��'�I=��6�΀��nx+��=Ԡ�����2��J�恰�m�=��&�M����qͅC�PQ1�p�2pXH���Cr����@�6��JƧ0�V+/!�l���*�V~�`ؼ�М��$kU`�m;ZP�ӛ���C �~�I�^N� �G�/5;��[,K�t����=lCR��X#
QB��4���, �O��Ո7��|ك0b	&{�eP�|)8L���o�G��d�l�O���-@{�Z���P��R .,Q�ơ�\��H�ψ|�9�)�N,HN�pp�c�?8��kz@�I��{?�+02���Su�K�����QH*68/=�uB ���RFF 5��h�`N�Q�����f�e3�5��=��r�0���$W��/������#�'c�a-���g�O�m�)�ʙ�&U�����j�9FZZb���z��
j+g ���+x:������As�.�8ifÉ>�������=w[�\9?�VL���)2�h��ƈ(��n�^���y�Yߵ�O�)>_G�{`�!?�È �y�W�1Dz��-�ZC�Gz!��ԫ�����'ЪhFf�zs�z���ŃK��B̵��w�k�� �B�4:�O��G�zF�p4��?-m��F������{���_R���B8�e2�p�9髺Қ��3��;�'�T��_�j|�;ۻCA��/�MBd銋����u�rV�7��&O��]b�HA��@ ,;�R�W%}��7<�%�KN��V����"߳�I	eJA4*ۧ;ZM�J���l4}�N9V���y'r�	ti=1��M��`�ax�n��T��:�i���
iD���i���1S�'���# ��Ee���Yal�;1�hX��WT�	E�~��GO 0i7�W�/ܪ�����?F3���<�nM�lM��U���IT�OFDub ����_�/W-
�6}պ%���m�{Rz���'��{�21ַ��okWUDC}�J�^7��R�9�OP��|��C�fEn�c�#���~�d&�Fc0�Q���Yd
��}�H5���E�� j*�07�+����V���H�b���vurd��U{&����n�lL��qs���MDE��1�Y�XT��m  �1�I��/_4$Ld����"j���2lbpX���]�8��1ez���j�*�\��#��z�͜߷x\z g�
����� ߙ���ڐ<r�G��gu��=��>�m�*A9w��F&5)������f]/�Z�m�͍�LÚ��gж�&�N�X��<4���`ؒg�N�����[�J�6A��m|�t��S� <�1���+���Q��S��n�h|�3�_o�j0��RF8t���c�&d�{��V�x���rE�e�A�� 6�.�j��h��m���ٜ*7��|B)(����A�FV�	�kk<fN8QT�8j��L7dU]ʫ$#�����K�����v͚?G�P,�ҹw������98�V�����6݇��!>���KB��)�Wj�\M0�,f�!<�.��g��������6rn���1�|��!@Q@�V��j�;_��/ѓ�e4Q4�ѿ��A��S�(�w���/�z~�����;0��ؓ�6�쪖��!<P�rwƻ@Oە@�@�N2[dFޤ"��Y�T$�|�I����m�ke|���0����A}�O��w�;AP���c��1H+�߰n�P��$�f؊���`ߥ��b��$|ߧ�/���5�9�l�m&��Ɗ��Źqq%w�籜�7���>B5;ґE.f��^�i�#�%�K��O�.[<5��C���삹*؇T��4)y-oIz�T���<h��m�u�<��z�PA�ԇ_�=������@!%�����WOO�/٣���j��M�V;���g�M�-ݝ6�
#�O��S�(H[~���C���j
ʂB5	�t5����ߜ�z�b�-�����s2����?��m �(w������뗶���T��ԡ�I�t.����#|�U�����D����rO ���H_0wk���Iâ����<����/�,�$r>���+����a+�����������'�:��K>3���O�<tmHʴ�`.6�ȓ{Q����FT ��`"̈dm;_�"�^��1x,M&�y�~��`j{���~�X�I4a�E-u<�� ���+\W���i�5X�7ŀ+bX�_������ �|G����I�p���(��Q�(�Z��[I�ݹ�Y^��6�����4�3N���������C���s
bB,�W鱦�$w�0�b�s,Ѥ��?�2$W@�$�=ȉ�ȕ]ڽ|)�p��?����=DZh%~��a���;)=�ɆS��`�M�kȡ��8'�i�A�<�
�r�/^��'ȚX��d��:�s����X\ X�������~M���O�a>�
��xZd���� �Q�ن��� k�A�m�����̅J�}��Cǘ"\g�2������0lf'�%WD%/K�7n�c�VR=ۯ���k$N<�uo*+��c��Do��*�d|-e�e`�0��O A<��2j��� ⻠�����������)��R�I�C�9�ߋ�
ځXa;����ᨮn��{S�\�d��sF;啫��=�Fŵx;�Jٿ+�.����R$�'Q�-��tC�Ĕ��K ǆtO�@���@YS�N�V-&�C��=a&��[0�# �im���S�@^�	�,�S�'����R�T�]5^�<�Í�''�Z8�c�3��:��`�5p�J�W�U����W�b�����TH���?`
�5ܒ�W赱:�^)�g���4"��gpG �)dz�L�?�4���`�j�J�D2�9�Z�PѰ���������=90�T{©��1���D���-I��.��b���;�`��&�}9��9�H6V�8����37N�cb6c޹$�X�m%钣6���mC����(��V����z�
�D�l�-\ܭ���9zc22z]k|��x*������B��h)�	���-z��r%��3Vy3����������9N:>����1q�>n�8-�g�RxU(T�y�w�E�ě�,��q=eC�娄�cv2Pk^nr�F&E�m�_�3��ŻV*��!�ʣTX}�r�cP�"�菹���q��1_�s�c��E���a�틌�LLfR�B~�m�0zZ.
�3~�}�fjb�'�^�D+�)[M�2�����+C�m�MA˞��͊��!�2pɔ�o�/����d~K�&!�qxc��&��C����%sO�^W��BP�!���+���(�T���b�iPK" �K3:�����%j��wi�ڟ�,ìn7Ь����uj�?Q�[3�� >fF����';��y{��|=P�Fx{Z��|W��A#/b�,5+���.�lr����pċ�"�n�zC6_���!�Q�s�s�ٻm{N�xy�LkU��w��Z8^Qt�a��UGwR�)�hK��1iҦ*�R��-Sʠ	:��%z!:�|���S����؅/P���Ë'zo�L�/���D9�7i 8<Qd��*
�J7�#������5�/�_8��8\A���/���d���ȇ^�۞��á����LŪ��V��w�1
�hWz� X�B��P��E�jyޣc��s{O�HߩQȍ�-���T��`�.�ݻX��t�c�������E��W�9�my�gU�
��1�hJ���3M8	>gä�}ii�)�)W٧6/$e�~ -�.����-�gỉ�B�Q��T�^0�D���a�r�J����.7�Z�K9*a�bG�=ȯ�S�$-G01G�� S�������y~fb���;��qz�"b��@���	��P�(��ϻ���y������X��`v�Nw.��1_�h��άL5i�/o��uI�����1@���\�et���ry}��a�#�6Jf٭g�	�]�Y��(��@;*�:_��H��
��ޞ�����{�B�"p�omSy�B���u��cח:a:݂�x
R)�����ӵ�@�}& �sw���\�ibcW�M���n 4�ax��I֕�o��s���Nf_rk,�A�.ˎ-��\�Y�O�HQy�0���dĲ��l�2��!!8*14;�O�˦e) G�����A�8��AdA�[��ԡSY�~�I#p�©Z^"@�^F�ю"b2�$�h<�vȑ�|��9/��Whn�_��&?sO��2�!Z�����at�B�w�������(�?+W����#e�B#�O0�F�C��Gs�'��/Z*Oʭ
nE
���yUO�z��� ���{3~>i����ѵ3�m��)oG�k
M����i7e�]t��C����� �1/.������MllLsT�ctG����V+ �t;�x1i���sm�dpJ�Gv����BKw[�pW��*E��Bh��n�Fv����Y�Ҩ� �6�. ��������=�B}�i����BH�OYB��(5�p!��Mw\L���p�sPq~�vdm�E�&mK6���/~)^>wP��nj�͐�ٱ%y�e������m����b��
d�U�_�T���Z��G{���Q�P�%����ws;����N�d2�vN����;-d���9�!� �,.�3�b.�$��1恚&��7jѲ(��V{i���2A������J�)��Nl��V����Oaoo3Ydk��1��5�1� J��^���(f�$2�'��B�z�V��n��m�l?�J4��'%�}��e��<�QN��>Z(����ʒoI1�DF1�n��z��C�-rr��"B�)���9��q:����[Iۻ|&���V� =��&nC%�`ڵjÉz����V�gr����H�r�t�h�n.���b�#�aƥ���j:�7^ګ?ٍ�n�g�+P܉�/���]���+�5�b2�Q�"��?,��_�%Ȉ��Ө�����в�m}EPr�x̅�k5l�A-�����v$7k��>�P>)��|v>�W�9?Ix��p�)�-O������]cÀr4Z�}~9zw��x
��LW�8*A��U��qp{��|]���Z�'u��u�c�W��j}�Aϟ_�u����}�UI)RKhk��D��`��Z��ܻ�nᜬ@�X��'l�Sp�Z��.�~O��O z!�B�w���m��V R�v�k`���3��Q�KZN^G$[)��hs�ZG���,SE+��lԎӡ ԣ�<�Rš����Y 1h�R G}S�ʗ�WM����d
:�"�歌�'�_e)H�v�Z8T�[��������Z�q�.x�	,:Ң?E� �*��Aٔ��)Ι[��ʢ�E��+T��,�!����`s�]�j�Oq tө�KcL�b��ɚשڞ�r���GO��}-��p���[�ү�dH�]��^����v'}v� x�(|��@�O6W�R��UxW�-��i�ӯ] 5���rc<[x�T�4�듎����������j-�Nu�݊���|�H����eJ���qP%������)��1*�])0�����%� r�M�� �=��	8C~������R�Sp� \�	A�U��C�D>��|��]��{��O�����Y	����7��K�t�R�LU��D$r�O{�"��4�d���4z�/�W�'�i϶3MA��}�<d��8(^�S)4����׃R�����cl�3��pF����a&��pB������,$�l��'�IA��P�b�5A��l��&�1�f�
M�K�)���p���?sG���(��r\�h^�г����) \�z�^K���?UQQ'!��YiW��h*�i�^������WK,���"�V�$���Z{��I8 �7��O��<�l�A���fDPSg���ԃ��7����N�?n���X�|�_�ⱷ���gUS>�*{jylQ4�?> ���;B\�9�����?;�o8�q]��+A?։
]�U��k�D��C@D%�m�_���|�	$��̖e�O��n~[,L� �孎;fga��1��j��p٣'%Z��CDE|������
3���jCjԬ�����adV���2��0��`�����TB �k�������\�~-/�+��Q�1�Fs������=�~�۸+OJ�R�tU�Vn����i�r�i����j��G��r�Ci��A����	�*�Ǩ�Xj��Ĕ�SP�n��#@�`�OLX�ڷ��آ�c�%�Ӂ�fhf{��A�"����h.Ud��&ܽZY��X*������?OM�j���ͻ�ҝ�{մ��c��'�'Ց��ם�����%L@�����m��J$L�g��D��l�G<�[�A�9�Gӄ?�����3�d(K'g��	p�(����w�)Oa���/�;`{/죎���ꑎ+a0�����痛}��a��/|=���٠Z��V�Oo��hZT렞���G�!��C��u��)|��[�8�&�aR%��(���80s*���^U�v����Y��؛de��y�}�E!��]��pY�	��윲�Fd�;7���z]��H�T{�/�H�H�R�ةY�hC�z���T���/+R����u���,^����#%a�$��4ۺ�6���J���xC�i����w��Lj����a��w0�l��ĐW��{ү����N���gm`dnQ�����l�R�҆P���y��rf, ���q.B��_�eU��A%̱��vl�v�ݏ;դ�����7����)�o8�2�+S��C�zl
������3Lh+�J�J?b��+�W���,H�u�g����!��@�#1�y1B���|�"�\�i"5;�����9��(�&"�	~����nж�����e�W��DY3�p��f��<*vz���^I��R��[�Bu��>~ ���G�8}i�~��.Yw��鋯��D��Hz�"�@���kR=��e��ɢ���TQq�#G��A��J[��=�B�|�yl��K����)h sǞ�σ���An�"MN�AZ��4��ڬS��0�]�:v_��=ʙ�% ���i�<7bi�n~!<�̥�dH�?���)������Gݛ5���OI�k���1Xz`Ӳ^��ƞ�K5�iu�u��m���J���F'2�����BAqd#%H��nH�YyW'�ٓ���h�%� �+P�~e�6�\�x�L.A�W�q���6��3?}�� �>�&����"���m"u\�k���m�?�\��mt+��N:x'���2��ߝc��c��UM�t��[�� }��$ՆǞ���8���2�Rbz/�p�+���gxs ���dbR,s�^�����eh�	���9��n����?���(��++�j�V�μV�˹=
Z���#�@��:�{�V�D�9���5�y"5b�G���?��r��S@c+
�?�3�hpp���c���)6�"��m�h���n��%G���"`[U�ɣ_��'�/��4��k����O�$0��<T��,�M�H�+�;��<����O|� 9�]cש�0��=hf���;���ί����#�V��Mw�T#�q+&r���Y�7-	B����d&p��`�P�pw^$ɨJ
�IC��o�Z����z%���S� [��h�Qi���΢�>�'�Ww}� e�ь��ls����V���b7���� W�+ ���8W��!�|W
�Ȥ����?�W��VO��l�+���|ȉ�N#Q����\X�~�&��gU�#�
��5�i�Z�o{�"���ZI����<��H=5 �0�V�W
*1��/��ƨ��iOX|z�u�vḾ#�Ԁ96ޏ��^c�kլ�6[��?O4�/�]���-��P��c���Iw�ç���9צz�y�Pæçg���"�Av��}�El��<X5(�.����_��)y}�4�Yv��C(����Z�������x"���e�Xt��I��oS̜��Y�aB�N��@��`i�X���ܡ�[W*��L�.Q�K ����:�lr[E�)˚�ZÄ����`���ҥ�`�D �re�?K���Q��r�h��vS�'$=1j�p�U₞�*g`	`)`��0]��+6�����y���
imW�z9Rh��,`cQ�5��^�YL�~7����R�GO�	E(���	\��[N
���� \{Jt��Dz�	ii�$&�Ql1�0Ǳ�N������t)g�ŝ7Ы2�r��QN��#������%rH�n�ϡv�3z��!�q��i~pG��̴��<C�b��nҿ� �^�;R�QO��T�~}��c:`���O=�$P/��Eq�l�Qcqk}�0�RȠ��C�ʽ�����Ak0ϥ���M�$����5��� ���Y0˧zc�κ�S���LJ���]{�9��{L#������y��
��MN{� �Y��1��ۮF�u��?~%%:�%�L��{�� ���اW+5���H[�����VVb�yyڅD�I��P�^�����8��!{�I��]���<�S/kE�഑�7�78A$D�*�1DB��O%�g3<���N����5����?5�,��0��Q9i1a�n}��=���"��� �! �0a�-T`L�T*����j'���!�oR��{�P�G�Yb��4�q�aաD�e�Pn���iP���)3�,���d�m/����Y���j�r���6�}Km����0v��[_vBD1N%�[�Xl�kwHn$%��&29�=�O E�Ϫ�#+P?�/	���|K�xa?p^u�ҟ�f��;ɚ���{�R.��{��,&ئE�)*s�z����3�/��ݍ����}���g�
�J�_���t*&&4m�j�բ���݂�\�W���pj���N�A@t��!tI�$��et�<߭HP:��v��)�nn#I�F"�]�[�0f\N�bj�c+�H�(1z��X���Uq1�'.j�ra:�Wl��rT���J��/(0�䫴�i���8����ˡ�� �g�M!&���z�%���gM' �H��q�SQ,��F00��´�����>L��[���~"b�q���PPϯU�T�'�|̈ג@*�H.2�P)�94���T2?ƈ��`��I����?��h)T�kw�7a�9��wP��9�}[8;��)�/��mmJ�ΕnHDqr6�g�Mx��������}cI�y���}����f�^a��t�瓷�O�\ͮ�]�Dݺ��~D�3�u���#�D�N��cIK�iɯo�kC�ǾW�)�@�0wKC�V�&|�Gt�p@����+f���v���X˞<*s�1]�b�?KJ	o©M6W�*��$P�%Rd´:)�/�z(���'O�l���d��~�rXg����O�a�� )J�����"nŴ�����Y�r(;�T��F�<(f�ݹ����56.W��wX�p��B�z�A'�J���� qi@ܜ�|��h��b�K$zMB"�X�m�u;!��8�҄S�e �c= {1���MϴXM�a�h�ɤo��#�C�U����qTu��B��k]V�B��j�N�����I�i���t�$�J�6�?��Ww�-\[;ԭȲYT�i]<j~ARD��q2��4733��˩��t�7,��p������κ�}�+/�ʛ7��q/k`�}��{o�u��lS�L����2���L?Z�d��i(���p��b�e���O�.�=xMb�
)X��܏Ѐ#��.�;�F����l	��\���X��
p�m���dŐ��9dH��%l�&�յ�T�\�(�i9�P���H�/���[&ǂ�:�Hz?i��13��7�(��s?���	k�r18�+��nL��X{��x�g"}]��& a���E�.�����9�%�u�+�%�k8��F�6a�ˠ&[��5Q�A��d+&Aହ	"����=� �7�#�H�l'|��3��ʔ��d�؊���eP�U����mo٦��Oʼ3�������Z��d,7^_f�	�s^ ����v�EoXK���b��R�)�+��?ۄ�ݤ7��8��mHz���nq�'�U��'@ҿFAU#��	���Bg�������z�7<���DkB�����y`�ܭZ�n���d�6��埥0-�G_�_Cُ<M��F�,}D"�J���(�P��R�%�_��;�b�l��J%p8�r�����O�S|[ġI��*.+>}�-=��
����Gnչ#Eg���j�07Y�z�a*���]x÷�#(%K�er`�^z"
�ui�����ߏE_�:�6?��Q����6��<Z�z��"#y�`1���A���7�G��[��LvJ#(�$��i;n� |d3�v�)�L�̞"��M��/�ۘܶ5t�FG��#cҩ���7��?�.�(I<��:y����T�E�.��1�gbLd��;��2D%��'m�=W���r C�g�5��틢�$��$�A��r��[_V�[m��*-�`VK�n��PG�oj2����	��I	�_7@�$����]�,�]Q"So�J�@��\�P�6�����H7燏�j:�G�I���j��F����e�8�Bu���l��FVӅB4vU�{da����\��.�A[dlz�0?v�4�����\U����T�m*ڨ��u��/ـ+g�	�z�I0�=G�������	��!b�e��*2�&��~�:��s�E�U���XiU�,�1�~��lpt�1�Z̠���.3����g�q*�`׉��j�CE&�TL׌��c��Z�s�T"vR�B60OXIq�)M��3�pH��b��|�P_�0�z\$�"^V���+��P'�vW��ʲ�"Aj�l���#d�x��`��RCMB ��7��2���Z7�w��r?����;�Oӣ�S7 F�'X�?Ͼ���g�WʛF�%��c��8&�S�ӊ�H��Őp�eZh_�*�Q��N���~�x�/kN�����:���?��-���Ƀ����VT�,c��A_�jQ�V*/�!�<�[�n1�A=5��@+@����+����}��2P��'���c�Ü�Y����o����;�ۢ;�7�撛��5�"U���8Ǽ���&��^m,�l�? e�!Vm>UqQ�P���jނ~�z�IG��u��l\J}��ֈ�c�|���S$'��@�6I��F��êlҨS_A��H�;�����I<!�Hgt�s�@�g��GU2kY��M�+j�N�Ck�Rr���骗���5�a�>AR���Y�r�A��~oǦ�"1ޗR����+�a@ˎ�j��T\
gw����uok;8�F�0�s�rpt��0����]���{T[��$
Wn	mAb�G$�V����de��D�o^��dO��)	�"�yb�T5`��;�?��yh+�<�܌C���1��׊3N����Ҝ�����[�n+��[�B���E~D.����*6�e��.E)u,p"yJ��fN�Abo�	���Ԝ�+�
룶��H��r�+�i���p\��*���J�����=���������A�+.��C�i�?=���g���ټ[�s�K�$���bW��2�b(:����0�wT���M�iD���P���'��M�=�)�x���0��q3���G�2�"�"/��N2d�a�������
���_]���$i��"�-��7���?5$cUO�{%�9\��L�*{�0��KN4������q;�)dDl�6z,aN�����j0̿�ɜ��6"[���q��\�^��>���h��#���kBX���$x���J{
H�R j.�ºy�4�_-�_X2]<���Lg'lb�n�nl߼�80+�M����ͩOT6�m��2����r��Nx��¿�r�VHeTBq���/���6��d�s��hN����k��T'����,-� �o�"|3������s-���;�lj�8�k�r��h�'N�<|Y��Mm��r���o�;������G���w\W�~cvѻ$�\�����UuA�����SD�Ko�/�� ("5�?�h~��B���,Ը�l�{x��K�T�:�D������y�D�Xy7���n���ݍ�"���47#�\{�?4�~�������d)@Q�x��92m�S�������0:�d&��[�>&\$��2��� �*�Ga�	'X�F�֒�a�Qb@�1��ĵ1�p%�(���BS9��~�_��.���R��Za�]Ʉ1c<zP2��1�s�Ni>���[��!�ap�֔�M�򚼁Y+� ���)���߿�oS
����r��4g{����y���Ƨn��� �"�� <tʓ�^RRէN�ao	q�w$���V����8H�T���͠=�ț���6����Q����)6Y̬i��$C��^������RD�S�ܿ66CK+2p�؝�@�h���;@���쨵"pE������,|���m0\�Akgm[tj�9�ԑ���G��+��V�A��]��Cp��TK1
��ű�U�vݣ�5�={L�sP�����n���4Pj=���3��$��>��Nyd��*T�HM�Y�����ɵ�� �X?�w�\�k,�&�f�h���Ql��#n�~A��*Ue�>��W�tK��E��Nn�_7�֍d���({�Cܗ�� >]�},���c�7pX�s.������+
�s�
��EMB|�Z��/����u�p�����|Dӷwc��n!���e#4�<y2,�WK:�iÄ�5��չ׳9]��[.�ߜ7 ����Ū�m�GN�w��\'}$J��=(���[�R��5�+�}NI,�|_3xn�;�%XB����u"��a ���vfr�o�yz��Q���ԯ�$�?���8w�=x-��bH0���'X�������˭@�j˔�y=̇wql���$���8�*� x���T���y�7Ա��O��}��d �B�W19>��AY�n�mAd���'OI&�w�k�W�h�������ڋ��22����{K�,�ı ;�T<��r �r/Cɞ,F����r9��ыmוz
�v��9����>�B���k?jj�k����.�o�-�"����!s�Z�<2ց��	i�������`x�ۮ���A�E�_:�����$�큜����N�nY~�ɑ�"��;�7W��C}|,��q���s}�n)!ٻ�WMX���?V���O�T(7D��������+��/��՝݉4p�>O~=�H��h�������X:�~`��z����z�_�:�k΍�"qu+�F��n��_�5͡�i �A6�����ç
�e>TAxҬ�&�U9�����ٴd
0��K��,콝��u��8��8��-�j�������k�o�"�V��Ou�\������yI�C����E����g����D�6Jǡh-j��I����q��ǐ1&��D!�T	��C��h͋�������P�&��1k�Q��bf�����Z>n���^��Ek�3���'�ё�J��� 2�v����<���6[�no�"��d��2	8eα�ԠAU�����|�3������;n��uw@�5r�SpH(X�ފ�(y�=�2��dt�76=J�8�v���n-��ΞmT��E���x0�LB{V�W�Rq�0j��	1��+7�%Ig>T�驒yU%�l�9�2� ]K��i��%S�HӀ�¸Ӕ���xx{{�G�}�ݻ�r��_HGe|��.
H���O�fCďEn�g��@1�=5ضh�Z�h"CKVa{�b
49�d�޿/��oM3r�2�Ǖ�3��R�9NŲ�N���1؊Ϸ�]P=(�	N���*`�������)�U^�����U'�3/��?T1 6d^�(���g��D뫚lBmK�Y��*q H�m6ʗV�7`�o�,7��vy%��C��Q�q*b����ѫ%k2S4��h��*��C�`��=���^MLD�.�(��E׃�6舷����f$JBP�+� �ͿV�����J�[Ѯ�&Lk��Rk�EӰ~����ZӜ�|G< �S��t2�|�#j���;JOS�� �j���t�ҷܧ9lN2ճ1r,��U�8
��i�-�8�C�n���MP�u���r|���4w8�~���٭���R��q�qR�:WR�'���`�gᑌ��?���v�.�͘��ϻ�Ew]'��j}�~�~��E���1��h;��
��7�_�{1�/n��v
Y^:� H�(1N
����@S9�����!��lJ�$3��N�Drd�E��ys�87��AQP�1 �=�f�b$+�O�����>���BC����3�S�O_v��l&�ݎs�6��W�����+%Q���XM�(V�ib�W]u�䡐�@��~��H ռS�<m�Bc1�����8K�HJ*Q����s4����oR�3�E�7��p�y �2��YR�~?ͨ��� Ew��ը�I��b֍Q!��V��A'n�5;\��N�/�=�)H��JR�!_�# [���F`s�m</A�W�c�C9�����K�A�� ��U�=�}"�ʪ5�[�"2�3��=��יء&2mr�4+A(�8�@���'0�ؒ@tdࢣ��b�����C$�����zx��eK$�1x^�0|Pc�e �9��25��>�@hįԽ�,+�5�>NM<�d��fB�"t`�d 
,(�|�T��͸��\��E8	\�l�C2Nl^s����7�x�=F�#C�Gt�Ī2�@}��cN�-���1x+r��g�<��I&9������҇O���P��lMC��7ո/o3NF���׆�fY����@���`ȩ
8m�k�o1'a&�V|�P��8�*������+�@��B�xt��<J��ol5
�� H
�Bp�k��Z���X�ơn�06��E�X��(��V��
#��F����WAOlE8$������[�R�_{�!�c 
a�	=�kU-��G�������aF,�S /����z��2g#����_u����!��+�t�;1<݇�Y+���Ň�O[e�q�7Pя��y֨��%���+L*���`Ů�z�XB	@y3#u�gB��`������d:�oκŊo	~��E5���W����{��J�,_L��K�mu^&4kKt.6��>`�hSqO^&
�B� `Pn��􍑄��
����3i�ܸ������/���g[ 1�c�D�T�l�A?g�U�^L${3��y+��g ��N?1�P���g��/���*�s��Ge��U<v�G$��P�M�c���m�lb��S��կ���\d^��;��UݕRιՂ�J�ő�]շ�c�!�Uj�]����J��ye������K�C.��!ZZ��c�Vq6H�o�7b���H���;/��Uqkk𓤯��G1u4u�����垞.�t(4�WP�>(��^aу`4ܵE��֑iᙛ)\nB�-X�n���e�f5iT��E�Q�TZT�"��4�|�"W��5}QaFCҌ�]y��]R\�<m�@���낸�������6����������Z��2M�2{Z���E�5�p׆�������|��oz�l<LT�Q�,$�
��C�0��䇾��qVT�}��>���v��_hM Dl�����-���xӲbKh�lE�G1�2��-y���͹��(�Dp�,͢�P}�l�h���9��FUb�F�X�z����6����}q^�7$׳����]��+���իK���x�_[Yۣ6MY����V�a�M��-�e��+`l��\Y���W��k�HNB������ߩ'v6P���V���T�0Q���3J]Y��^p�1e�&�ͦB=h?�(xy��+�����җ����`91�����<�����D"��hU!b�����t��=��
r�
J��]�	�I�GЉ+J����`�!A��7Sn��f�3��%c�q!�l*�vn��9/88ȹ��	v�<O��������*����-.m��f�)"���+\�M.+M�Tz�m���-�7ڣLj�¡vB�)hhLo(��b�g�L*L�iK�_h6qy;��:��mX���DYܟ�i/�T��� ���-WX�;8�89�K����,�VIN�/q�z�<x��G�n��Cl�%~�Y����p��4.Z��8z�7d4�w�
�8qt[V����]��L��5y�.4���Yna2��<�ݵorQ�u=r��p{=ꦘK
�I
�2_�3A�~�3�S��;1"{�q4�Aľ���Z��yd���T	�4f��X p�`�1��M���Np۴
!��d+r")w��܊�x�"�Vt�qr�폽���<P"�q��P9= 9�`*����e.�gT�xhbQmS2�e��fW�B	U�����+	��<�#�z�`͹(�ر�f/�ˆ��Ӝ���S{�0>��yL��v�Lp�5�:[����N%�&�{2�=9���H�^��Y�aD��s�"p������HQQ�B{7�w��D�����+ڝ��c��Q���K��S��U|/���RQjS��eЏ>}o�w)6r�*�f(�i*ޑ��*y}*�]����$M�w�k�U���M��������ˋ05f��Dy�͠]�YtMt�B��La���Fu>p�{�(8���-N�I�O���tl ������>!�����Óp!}QgJ!��]��"�E{�.Z���.�:rK�/AC���ep�>�L���K'x6|�dA$��!��tc�|fl���6ȏ6~K䎄d�p��XP�O[Lh�aU<�6�ܘ�R �Su�1�thKB��aF좯�,�x����Ϗ���oX��/tu��(d���}����
ֱ]������x���C�Y����z�͋ݔ&[�ܥP�u�}�].|(j�b����}@��ts'�	�.nDT�(�~��v��l����ta#���?�e˝\Ma&R�F��P�>��.��?%1� /��!��}�Y,X��ϳ� ��K%�v@� �i�gl/�1v�E!憰��O�S#��U͉I�Y�I�����Q��c$\U��Mg�o��>�s����{?��&��ҽ:i������is�n?L3�I�PXo��}F�7f���W =�]��d8d�� 4x�9�]�+c5鞼�Jsw���V���ȶ��������I��V r
��C�?o�{SU�>�'w^2������?R�s��-�X�>9�غ�*HC��Z��_N�^w��k��{���'�Ԓʣ��vc��t�b���*�lv<��P�T��gT�3/!kT�p&�N�u�@�K����_�7*Q5s5�)�/yw���nw����W餧�*:�v�_W�O1p;�}KpX������] 㥅	���0��A&8ϛu"L~����.��}1���v׿�0fR�i&�]-��;�������*�e�w��j��o�P�z��>+f@�ϯ���%%��֑�H	fl�`��?R��m3�u���X�&1D2����:�V�i1��UBV��SD+f~;�� ���yX�&!R����4-�RQ��6`�L�%{���}���-�����rΕν�	�D�x;���bv���
$h�[�#
*n��������$���:�fi�cIf�Q�H@��'j;h�.���6�u�帋-Tㇰ �^�e��{e�Y�1�!T��x��k��y��=�b�4�
��z_�ׯy�	M���z���gH�f*A�K�ڡ�|J���v��
e�Wmط�\cK�]�{��t�Ʃ��� ��w�.	x�����J7�h�(;#<]&v8lLHr������F�G�I���V!cp�K'	A�P�OBP�H�h>"���|
4=�v*}���{�3�-Qޝ>�:2|
q���M1�m��X��JTQrSҌ��
{�$������2�i8{!��D��1�K�U{=��S�ʢ��$���dg���S���<����	&D�����A#qMU�JgF�ȅQ(ƭ2��������+�J�Rr+3�^fS���ڶ$�ND��]���NAw~���Y��K�!��C�_��Kڍ�a�Xğ�qY�ʹ�X��OE(;��BZ*���*�{'�y��YL�Qc��dßD��B���r�p4�'�#^oN(�[sb뭩ފ�Pq��@�v���D����]C�Ps�:�ٱ�ڒ���e<�[��3�~5�|�=_�B<Tj��>y#�!o�Ҁ^���4/�辰8���"�i�~Ay��E#���7�F\���g鞣�DA>Y����B�f���m�ٗ-�ds�:r�<�>�I����Y-М��Z9����0qڱ]�S� �&I-� PNH��������߆�,{�ӄ��cL���Gש]����(���I��D���@�)�A��Ӣ	t0] /[Tq��`a.r3[�Y���U�\U���>=��R2�Ҝ�mpI܊��H��
Ì���D��L�H*�L%m�6�]��M�C�IF�z�b�}pq�ū��33O�h���+�ȟ�S.}���q
k�l̍ߩkB���A��R�/S1�[b~T�ޥw��y?r���w�|�RR,}ӄ�~��R�߰��9����i��z�tR`��c�b�_�RT�ȶ��J�r#����Jꟁ��;�b���S�x������y��m��p���ߎ����auC�,�TAIK;�"��r(�~ U���l�e�r7�Y{9��!T�U19�9�(�b�hF�5[FJ��釗�{���0�%��[���,��5h��dix�.&��'���p@\��aqia��O+-�);̎*�#����N!e�[��8�W�y��5>�9�n�uB�G�E���R�m�v��o�wk�����)�^q6��783���~�-r�� �R,��0�ij�$8�!���
����_=3��@o���M!~15���7��1�9/~Rlr65�(��?4?@�eH��4���䛘N}�n4F���f*��������+�N��r�˼ig<;��Hp���!)�1E�j�\)C? �m����̳T���m��`I�3�?,}�nF��!c87%V�����J�yt"��_t�9m���&�1�GD�ά�fc��������J���Z�M�I��,Gf@a�(�]����;:I�i�����֋�f�e*��zC��#)G��'���!f��1J��S�H��Y������f��T�0V��l�u�i�!aq9�l�jc�E��Yq�ʜm��s�\ʤ�l:T�`탵�ķ>�7��bħb�>���z�=o��x�Fw�!٤	�"Otv��8��'���pJ���|N`�o�?���sś��'��f�J˽�b���Is�ӿORi7�c��)E2gg����Զ��1��Z�ov`D;`��	@ҞF1[8h�{˲��-"Қ=L
Sp�@�e�g��������8�Yʠ����3�Z �f�$ȋ����m2�
[�E9���@�u!�4�'w=(�R4�����+���6�ĸU�V'ڕT��CM$�91vO��Cgy"�RG��!��C���$+��'�%S�m�(.a��E��D��so/��b#rj޻�dm&K�A4 �2�^ؓ��\��nV�r�CC�3����$t˃�Ҏ"E�х$��J�_�p��$���#�6����4t9�zq�ʊ)��/�*��8#�{k~��p��Ěv�߄�g��#[B��IL�j��+��ְ؋W<F�ma}�1j?���= �$)鹶�ZO	�V1W�;'�қ�a�6�P|*�F�}>֓DJ��Q�w^%����+7P�љh�8�F{p�f\��UU�:��΄�:�\y�P7Pg�Pf�m,��m6yUx��,Z��>���@�C���	G2���W���o�l�����_ ��̘��˥`tw�:J9�ґ1��.�V��ÔGD����-�8E�?6���s?ٶ�B�����X�	�%��4��E��2��D�d�WS$��u�t� ^��|f�)�.m�(C�:u��Vy%���b�������À�*�0w��ǭ�.�i���XF���#,,�D��
33���𿺮�o%�[;%}�mʓvR5�,� 
�U�9�lq��g)t�[l��o,����Jq��cc�M>�kI�r�[V�;�3}����@�j���Ⳋ#��<�!V3�(���d��7���{�4?@�g��u��#ExW�g��u��Bi�J���� �u���]ǳ-�M�!�`ض;GyP�Zm�Z�D|:f���5z'
Ä�����C2��Mg!B`��Y%S�k��ţ�iU�~d=��� 8�,�_D۝����?M)�,��!维Ƨ���5��1�3�{�|]���{���7a���[��f�i�D>����2������*^t�HV�é��V���t+ⴀ:��O�hBEs��1�M�#}	��@]��kuz������6�y�wB^����1#�=0�x��Y����3�Ǽ���K��O�n��{x��1�����`=})"xN��/�m�W�$f��O~1�8B)�#;�&��9�P���u�!�X�'���:��*%�tsM�p��]hv��tf˴&���z��!k�F�OWt+Q4Q-��Qs���~(���$����z�ʜ��t���7�8�bUѺ޼���z��ʌ���7sw���(��L^���Ϩ[ ŏ��H���YU�#g��1tD�X�@�#99�J�)2��w}E�����& �m	��I�E�`;��{�S�� �Si�=�5��V2���z�P��zc�;�?KO4�vjk�A�aǝ�SF�-�U��c.I{Ķ%�	��Y��Ϭ|�T)X�I��L;6Vǆ*��l�9b����c#�\�3��׍�&f]��3wy�[Y)�*�
�� Ey'�6*k��_��=�Z����������V*
yo�?||�_�~���&�����JШ�L�S&隇9�yg�R�3��jttw}Lib�$���ט�jQo#C�2��0<��1�p�������nܠ�]|���a��#��.��ZU���9ez�?BS_��a�@R�JIR�7�'�-&�5�	��]�J��<�p��^!H#x ���Qe@�ןյ�5À��O�s��(��5�İG� ��+����l*,�l�����쯅��\̟��r��*�/qs�1?'���S�CZ%D��/�:�q��U:u��q,4�[(������-M�Aۨ��``�Ow��F�@H����ؿ���� �ir��~V�p~WR������#�P	�h����q�R#�㋐��4f�5cX�6M8��6v+��R Ex�������l#�7a���sN�	F�2����Q�QodL��2�:���P�R�U���vW3`��V�`�&�?���!U��M%��Y/3� �b���fy���܄}_��5�E]7^�)��Z8��_���_� �3y�͙��V����õ�����)d/����Dr:��>L�{yP��XIɍK�����/!��R���v���E����zC���)�)����v��h�������4r�&��49%o�HO�wu�6�OT�e�b�ڶƉ:g�v��B&��h��O�mP-�t�u���t4�~)�[��� 5
7D��z=*��Q~��=sJ��wXB�;-�+d4Z�=P�\@�|�
��{"B�2E������ ���^@�J;�c�j�{�
�ށJ��E�6��ݩ\�KYh5�����<`���@�` ��R���<�U��7�,�٧/���E��~� ���oNX3��Y�e@��,��c2�B�3X��O�8.�Uw�W+���u�X,|������`���?�d W�`�~g�Pgi,
�5w�~;�4�m����(E��M�!�� ���#&Z_���B�B��k�sb��A'Ja�xUz.�(���\&���Z<�gb����1����o�����A�T Q��)���Q�@+�bM��b���R,��Q5]�>=߽q�
~�D&.��$�_ڧ)W���ä@��� o>՘e�0l:�yC�*�!���VS���
H�7��e��|� ~Bh������z�tF�aD���S���L����]_6��s)����u1�a����U$9����q�b��>|��6d�d;����k�|�&S���Ӯ&>@Z|&�r&T�§�91ɬy��%��RV��N*2��� ����c��41hTxEH+}U&�1�~�����N�#t�=�K>�U��W���꽆�-��U�[:u�d��
 �ۏ�����g���P�
���	fH��E�)��\#
�+tc�̷Y�xQ��y06�3�FK��������V�c`���"��@���,�HG�]�$V|��p��0.�t��A*4h�v[�2��V�0M�m�R�b��:�R���2p��M�'��b4x�Bk�*;�V+�����	ߜj���od8Ӛ��^�@7>�[���NY�j�)�K>[?gf��GA����a[N�g��3�%�Ȅ[2Q���2��)�N������0�gb�OްP�Y>U��s�&��jogx�䵬�/��,{�x4���X��cC�'���_��ڭ99D�����a���D3����qix����{�#P�KShZ��6��m� 슟�淇:�=��x!R8�ԧ҉җ�X�9��344�+ۛ�Ў��E���@��6���'���]��Z;#�ϐk���������k�i_tL0=�ZkI� ��jj�����h]��<����-���F��	�C��f��0P��c�)�~�J�/O^X�⟠��eԅ�ѡ+�p�����]K���$��V��.)2�=V�O����9c_xLN�IE�N��.�7S��:�����Ri��+�T��x�p���F3�Q�(!9�6��g��Te���El��]a���� ���ՠ�����L���Q�E�D�v����`��mPoxt��
<���� ��9��@�J�v�}����2��h3��I��`�MN�D�13�c�F�����=����I�s���%���4��Y�*g=�>���$�})J ��y���S+��`"�3�hjs�B�����H�r��c�s�E�I�(6�7�/}=�XR���d����]�_��A@������1S̕�\c��N�A�%�?�K!L@f�J�`����\���8�t��>�H�"��l�V�Z;��v����[� �g�����UO+��[h�ˀ����}��#�Q��hx* �;n�!If�9�ʁ�︮Yh?�u��e���F7(�������0A�DVX�8��?H�I=o:#΢V�ۮ�s�K���� v��EU`�pI:8���������l�*��[�bN�Oa�*
7�N�t��$!n�d�k��KjYO9�){�d�;!Ht�=��a��ٽ�֏�zF
�SU���.f��jtFA$��ik��v��Po)�kCLs��/���qP6˴3J9�8��X�S��A�[i:ϨP�.�?_�k��=��
|v�����eM*{�n<ﴼ��(4qGq��8��=7]�1�	���˱��p&�d�88�jF֡w�R. �*m��S���˕b\��Y���.j0���	4 !���U4T��R���_���_�챿���D�� ��/�~�lt[�QH�b/E��U����H֙������)�q�i@./�%�
~��@���|nqߣ�h�H�����W�gǤj��3��}I(r��x����[�,�y��v�c�d�6���Yl�����I��z�I�H�-��.��{�1�JF/��1��.�E��v���ĳ�SyR\�b����3�E�9V�5� �"� K|��T�k\��7N�<%
�04S({Ŏ1�ٶ���
Ҭv%���ɾ@J��%@	.ت/��4����Q#(w��T������O	L�� ���⩏#/f�4%xPأ�z$���;c����i�yR�;��O�)]{a��07�:y��r5�5J~��E�1��%p�X-(|V�[��x��MW�z�w.�tl<p�B�+>�_�G�H���Ų���H���j@ \�(�w��W�3���%��&f��x%�{~�i�/ݘ��5��Ls�C�p޷����E���ޅݖ<�_�ϑ���:,���5�:���5M[�b���]x�	�2�_��u�  �a�Ey����t�z߲��W߷�����74��2����ac����%[�FJ�t�Q���-?ǯ�I"00�<���]i�S
�t�zf�mȘ:V�M���ybu'7vB���e��79�����
Ym�b��o��bO���M1i�+M%{ָU��e9F������NC� ��R�$<�I8w�k!5�ke	��C�h�%�����R�6�:2 [�a�hjX�DA��4�&)�SP���WbC���A(�G�#�X��M�y������Z�KyPx<_}=5��k��0��9�~�OQ=:s�FM4�.���~�� ��P�L�xOL�K����F���l�/��BWH������Wi�Ui/q읛r��{���d�ȩy� �>n0�ͣE��Q�.5<n�$��RŞ���B���L��t��&����!V`<wJ��F91���%`��������E;w}Ӽ�8����Iy����X
�= ��
���k�\37���Qv6b�U�P�M�eܸ�?��4��~˞���7�Pa=�	�,� 즞P��������:�j,W �)�ݖ����*�|U���{D�
s*%��w�-��X/�_�t�f��9E�);�(��I�nF\��t%��j�����¤���R`��8q�o
!���s��i�[}������T�Q����}}���6Uv|���b��K/��!bn�;���.�)2T��Ⱜ�����x{���U��E�YB�"O�!��λ Χ�n*�M������ |�_ 1� J����29��N.K�Ӄ9I���Y��ͦ���F���`����V]g�{���P
�t�mf|�<��f�����z�:Ŵ��X�ˢ�3��ҍ4�����+�ϖ�C��.!9Р{�/K��̋��f]
P���Wi:d+d9Me	�M~ْ��z:�����j�q���{�������,F��C�XUЁ��lK�U�����538rm���ړ�����r[E�O�'6�g1ԏ��� W���U�~S3�7Q��&&���MM�=1�Z�jyǱ��4���; �*�����X�,������[�!p���L��[��V�y�
��TB�ٟ��� ���zl��Z�#����_�ێ�o/i�p)5]`�o�O􆫍�Y�Vd_4��(�L_��H�U��ٌ���3���<ξB3E.*-J8��r��k3&6�����g5p��+i�̸/���d�A�_���<�u�8d���~��0c*G!��GH⌤����2�+X�e�����a��^vm��\)'�R���@Yٚ��^5;[�>zn���:b�����[���u=��z�k��cyq+m��N�곀0,1z_YEKp�k�1WO��༉�\
�8��5r�-��&F4�g�dm��H����Bj���
�H��Κf&H�g@��U��7#�K���㓋��K��(]��%@tK��8N���^�@K!�>������xk���%��!��V�	� ��VXʹ����sJвL�u������� �� \�s�K��#��+-�y��8�k���Y�FX�o�6��e5 �è2u;�iزqM=�ҮċK�]����ګZ�zԌqk8�w@ۀ�@���F�!����3���������1^s>ߝ��B�m�����yi�R'�#mH9�P���MV���-܄1�LƬ�"��Fg�L����T��9��M`L� 8{�]��|
�~�93���>i^�I_
��];յҖ�I�R��rvȋ�3X���:?B#���t��W��\ ��%��Q��L�߷B�*��P��+����W����*_a���uF,Z�W��FS�lB���a�f�
��<W
Jx��5��frs��5�A� g���^���|Q����t=r�����P	�w�_��h�ҭD��nM�(y&���jIYyv��F<��=�\m̆*�i�b�J�]9����#	SB�kM)�[
�(5R�����!�A������}h��ysE%%�Hu�����0����� ;�I՛���5��Z�{}r����h������y�ʉ:x��goY��@P��U��擢y�D�>�9q��57��(�� A^ח`��x�xyT7�Ƚ��M�&lҋ��b,�Y�c� %���v�"�9��� �2��_x:�b"��D�^M ��킷��� ���:[����a~��]4��+�ߘ�4ÌJ� {��T��-r{�;X����ZV�8�z�WY3�����%u��8E.�o��Ǝu��K�0�<�Y�É"�������;Ǆy��bJe�nu��?�ٿI�ra7O��D�bU���6%�D��������97_��rD�\3�)��S�� I6�c�~���t���� ����N��y=�N_>uK�'���׀Mi�a�<ꌹ2\�x������caװl���?3���]q�g���j�D�-S05(��n�w
����!�S���bh�Kc��+%��p<$��A~ ��c���1������*�����ㆨ/�fP�,�\��8;�^���A$�i(_��ޚ�U��f���BF���b*���)��A�Lp��v8 �f�������N�]�4U5.a�S ��i�*�*%�-���qG�RT~'�!BVr�S����^6�4�y���EQ*��lm*s�}�+,��c�#OD�u��<�=�li�n	|\P�����,w%�ΙVч�X���z��f��~�}6�j	���a;\���_:�DP!��[ʄ�Qwz6�P�@O@	6��7���
�H7D�u�1&	+��Dq{�Lʬ�&9����@@v��􏍪���"�Iy� ��|x19M"���ffĜqUd� �I5���ɻ�	Sa��l�J��L�7IሤU�� ��i������H �y��8�wn�\%�`W��7O�ߒ��j�iBh�;�Y;����	\`rX�fˣ�̷%D��M0x�<7輍�ʍ�:�5@�.�Bm'�;	5g��ѿ��E�y�嚧�0�O�|,��َ˦.�����&L`�j㭭�,>}�S0�m�9�����l�7�m�ÒkN���������}�Ƣf�V�(ǌr��n#0n.�Xh��r� U��Ҁ׳���2��+\~�f�S9��ֱ.[�b�޶�g��wi�'��|��]���Rd�0ʤ��m��V��ll[e"�:u���U�6�3�v?~E+���ݔ}�5G�F�����悘Y��K��̘�4��/������~�]�L�>8�*�����ķM�ۣ�A `K�� �>���g"#���,�����
[d8�/6�:N�˛{��[����Y�@u��]����2X�h*�>��7��$�}(��O� ��d�.�&<��}{ܿWo=6�f��4�Lq���RS�'��b�y:��'����ɱ���H(����wH�5m�G^|�U��7����$�����el���Z�7��
=j�������V2@O�.�w�o���.����b#�kp�/��O�Q9Kg�h���Y0FK�������~�A*�=,�,�}��A��8r��2�v��'�{AD�{���˺9�m_tY^N�
�O�ݿ˗"�5؈�N�T9@�$�#�w�cE*�m��\U�f�n9<#��C�����C��B`���?���	��/D���wg0�L������i���s���>&a"[m�9��*h�{Y�u�y\f�#6��"$
��FB�ʔ��:C�dX�0���ŏ
̬#^���z��'
�hw����U1 �^Y�`3m������ZȻd������%�v�m��q �C�h����Y;�~4'7��}�������Ε<ˤ�kDҰ������; �A3pg�S1^�pq���^7�c�q����>y��&;١�L�r���r\rk'iv���S�r)�bd�R_dl{��+��vw5~�ǀ��'���
 ���Hvy�[�o�G# ��?h�ʮU�l���Z9�V�����%�P$v�8��]�kf����_#�^�5H�7�� �����]��E��rp*�
#�w�u�����x�P�Mc�1�H"�����F��N\pY
��l�_؟�����Lj-����!��@��mF�
=&�T��M[,/cT����]�0�4e-oZX����Ait�C�0�h��6�P4���U>�p��2���G�����b��մ+��լ�$=	�Ɖ��}�����1���@(b3g�ҥ����0�^$
�Wy� �����G�"o��ׅ)�Q���3}��]�U���7?�~�����yb�6�n��c휨]�HT7�Q����ZW���-����ٺ�a�M�=x���D���(q�z:F��t�v V�k�i�C��+��ʩ�F���̎�<E:�M�9�o%lb<~?u�χ�|�����¥�ǈ+�~�~���Q��&Y���OH��몏��-�'+��Sn�؊�m��m��a��k���c\�q Sؕ����tė�eK���o��x{iI��M���H�<��Wg��UD���՟b���c�J�z�$�_��ޞf�?���J���f�uIz�/9�,�8ߝ��\�������U����jO���Vܱ�#��J/����k�� seЈ��\v���X��]�ڧ f�M^w9����A-�)�i���:i�f��KuD$t�:V�9�ͲN�˃��pgICV�Uԝ-�M���~��RF7R����<`"���ϝ���[�ྍ����
`�5,tK�=si+R�=�i�, ���L��~0�,�ϒ��������&NâO[����ۘ%��Ӌrf_o1�[~��/)�%�ݘ���A�����k���0�����=���}�n�s�9�ci��A��9�B.&����Y�PLF��U��@3��#[N}h@�<>�G�*���F\�"�e5�@��m���+nW2��]�gBs�q{m�Zr��X<�6˵?o����G�2a����DH�[dI~ly^Jk��|��qٴuc�NTW�����7�&�%����k�.pKЯ<�@�@>e���8�32w��fR�cޘ7{��]�$;�%���`l�^�{;�������6uAd�/��@�A���bn_:t�؉ �s6�}iz��\��c.쯴�E����g�h)�I,��������\bTo�K;�&� e��;���cx�օ�K)���=a�"c��Y����1�c�������O��Z�Lz389'��6ыštW�#��lJ�D�3� ���/�P��)E���Ⴎ���]���>^=M�����!����N�q��>z�
'�i���\j�)!8O���@�K��ׯj��+m�{V�m�m��`�d������Je��D9
���И�
� LO��ͥ$�Y�M��0��:>'�݃3���.9_��
$�Q���W<+3^\��F�Z�{ #x߄Î5�m\�5`b$,L|�/J%J���'1 ��9u�S��V6�0��47Gf-e�����	���S*
���0��Y���z7s[#Q\u�Y<6	����Je(�f�#���f�L&%�d��
��]Ì��`��B3阁�[��;�o*�W�'���M�%B�E��k��E>�2�I��-D�Us_}���ֶ6M4�������},O�>��t��#�/��	�	-��l�K�>9 ã.�*<|�:P�Ч��Vm�7E�O.
`�eL��'B>�R��TA�Ho�_�v�X2x��13� v�|\k�|.����w���$l�y��L�@휊FyN^����;5ߣm	��_�Q�&�n$��^��S���Bql��OE�<��w���Z08-�v�~��_�2/O�����>���|Q)7j!��Q����$�b���e�"�/r��&��F��(6��U�o�!�'U��1ŏ��vGp��C��Tm+5��p���j�zJ���U[d�;1���8����bC@<N�[�2�`��}�7�U�@�׫ᬫ>!(x��B�|[i�%yQ/��:��t</�y�"���fl��{J:ۦaU殺��w�l�}5W9Ϟ�@�|��̤��ı��2���0��]�M���E��T�[l���7���K����GšF�9���:�g����G�<N޳g�4"M���Y�ܔ״��"���6�	��'�vc�TP�{�1��� n˞� Ŕ�ô6`�+f�L^���q�I�ɲ�7�Ӏ�>R�q2�rO@֙x��/��N$ӟ�*O���Rs�g\�Я��ӡ~u��I1�k�� ���;zF����HW��n�x����]c9����ƹ�r�����:s*��t���z����=8���TǤ�}$��L����ɝxBG���y�l)	��I>\�{
"��0TԠp��8�vI�mm�eσkG-�DQ��x���Dh�.3)��C�_�T���: �4���`��-�(�Z�M�I2�z��<]�x_\:N ��ۤyK&���������K�l�E^!�4���_�OMf2>�>����/��ԻYւL#�����N�;��Fr��ި*TB�����܉5t݂��^[H���%6��G�z�"�֋gxy�BNy� +�oT��`!���&ˬ626͐���Q���S�Z�!ʠ���У+g�Vڭt a �3$F]����(܏2
���|OF��4�)
*o�٪G>�Smj���S������СY}gC��cڝ|~P�!��1PC�k��` Z�lo��Xax:5�&4J�ǰQM�m���*�"�� �չ�pG�k��F�q_��a}�j[�~��%��B,��so���^ 蘶�͡ڪ���C6�(Q!�8�Z�D��v��C���*����F�H�^���:���8��u��O�+r4A�6ii���A�8l�*            }
		 *            else if (type === 'display') {
		 *              return source.price_display;
		 *            }
		 *            else if (type === 'filter') {
		 *              return source.price_filter;
		 *            }
		 *            // 'sort', 'type' and undefined all just use the integer
		 *            return source.price;
		 *          }
		 *        } ]
		 *      } );
		 *    } );
		 *
		 *  @example
		 *    // Using default content
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columnDefs": [ {
		 *          "targets": [ 0 ],
		 *          "data": null,
		 *          "defaultContent": "Click to edit"
		 *        } ]
		 *      } );
		 *    } );
		 *
		 *  @example
		 *    // Using array notation - outputting a list from an array
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columnDefs": [ {
		 *          "targets": [ 0 ],
		 *          "data": "name[, ]"
		 *        } ]
		 *      } );
		 *    } );
		 *
		 */
		"mData": null,
	
	
		/**
		 * This property is the rendering partner to `data` and it is suggested that
		 * when you want to manipulate data for display (including filtering,
		 * sorting etc) without altering the underlying data for the table, use this
		 * property. `render` can be considered to be the the read only companion to
		 * `data` which is read / write (then as such more complex). Like `data`
		 * this option can be given in a number of different ways to effect its
		 * behaviour:
		 *
		 * * `integer` - treated as an array index for the data source. This is the
		 *   default that DataTables uses (incrementally increased for each column).
		 * * `string` - read an object property from the data source. There are
		 *   three 'special' options that can be used in the string to alter how
		 *   DataTables reads the data from the source object:
		 *    * `.` - Dotted Javascript notation. Just as you use a `.` in
		 *      Javascript to read from nested objects, so to can the options
		 *      specified in `data`. For example: `browser.version` or
		 *      `browser.name`. If your object parameter name contains a period, use
		 *      `\\` to escape it - i.e. `first\\.name`.
		 *    * `[]` - Array notation. DataTables can automatically combine data
		 *      from and array source, joining the data with the characters provided
		 *      between the two brackets. For example: `name[, ]` would provide a
		 *      comma-space separated list from the source array. If no characters
		 *      are provided between the brackets, the original array source is
		 *      returned.
		 *    * `()` - Function notation. Adding `()` to the end of a parameter will
		 *      execute a function of the name given. For example: `browser()` for a
		 *      simple function on the data source, `browser.version()` for a
		 *      function in a nested property or even `browser().version` to get an
		 *      object property if the function called returns an object.
		 * * `object` - use different data for the different data types requested by
		 *   DataTables ('filter', 'display', 'type' or 'sort'). The property names
		 *   of the object is the data type the property refers to and the value can
		 *   defined using an integer, string or function using the same rules as
		 *   `render` normally does. Note that an `_` option _must_ be specified.
		 *   This is the default value to use if you haven't specified a value for
		 *   the data type requested by DataTables.
		 * * `function` - the function given will be executed whenever DataTables
		 *   needs to set or get the data for a cell in the column. The function
		 *   takes three parameters:
		 *    * Parameters:
		 *      * {array|object} The data source for the row (based on `data`)
		 *      * {string} The type call data requested - this will be 'filter',
		 *        'display', 'type' or 'sort'.
		 *      * {array|object} The full data source for the row (not based on
		 *        `data`)
		 *    * Return:
		 *      * The return value from the function is what will be used for the
		 *        data requested.
		 *
		 *  @type string|int|function|object|null
		 *  @default null Use the data source value.
		 *
		 *  @name DataTable.defaults.column.render
		 *  @dtopt Columns
		 *
		 *  @example
		 *    // Create a comma separated list from an array of objects
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "ajaxSource": "sources/deep.txt",
		 *        "columns": [
		 *          { "data": "engine" },
		 *          { "data": "browser" },
		 *          {
		 *            "data": "platform",
		 *            "render": "[, ].name"
		 *          }
		 *        ]
		 *      } );
		 *    } );
		 *
		 *  @example
		 *    // Execute a function to obtain data
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columnDefs": [ {
		 *          "targets": [ 0 ],
		 *          "data": null, // Use the full data source object for the renderer's source
		 *          "render": "browserName()"
		 *        } ]
		 *      } );
		 *    } );
		 *
		 *  @example
		 *    // As an object, extracting different data for the different types
		 *    // This would be used with a data source such as:
		 *    //   { "phone": 5552368, "phone_filter": "5552368 555-2368", "phone_display": "555-2368" }
		 *    // Here the `phone` integer is used for sorting and type detection, while `phone_filter`
		 *    // (which has both forms) is used for filtering for if a user inputs either format, while
		 *    // the formatted phone number is the one that is shown in the table.
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columnDefs": [ {
		 *          "targets": [ 0 ],
		 *          "data": null, // Use the full data source object for the renderer's source
		 *          "render": {
		 *            "_": "phone",
		 *            "filter": "phone_filter",
		 *            "display": "phone_display"
		 *          }
		 *        } ]
		 *      } );
		 *    } );
		 *
		 *  @example
		 *    // Use as a function to create a link from the data source
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columnDefs": [ {
		 *          "targets": [ 0 ],
		 *          "data": "download_link",
		 *          "render": function ( data, type, full ) {
		 *            return '<a href="'+data+'">Download</a>';
		 *          }
		 *        } ]
		 *      } );
		 *    } );
		 */
		"mRender": null,
	
	
		/**
		 * Change the cell type created for the column - either TD cells or TH cells. This
		 * can be useful as TH cells have semantic meaning in the table body, allowing them
		 * to act as a header for a row (you may wish to add scope='row' to the TH elements).
		 *  @type string
		 *  @default td
		 *
		 *  @name DataTable.defaults.column.cellType
		 *  @dtopt Columns
		 *
		 *  @example
		 *    // Make the first column use TH cells
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columnDefs": [ {
		 *          "targets": [ 0 ],
		 *          "cellType": "th"
		 *        } ]
		 *      } );
		 *    } );
		 */
		"sCellType": "td",
	
	
		/**
		 * Class to give to each cell in this column.
		 *  @type string
		 *  @default <i>Empty string</i>
		 *
		 *  @name DataTable.defaults.column.class
		 *  @dtopt Columns
		 *
		 *  @example
		 *    // Using `columnDefs`
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columnDefs": [
		 *          { "class": "my_class", "targets": [ 0 ] }
		 *        ]
		 *      } );
		 *    } );
		 *
		 *  @example
		 *    // Using `columns`
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columns": [
		 *          { "class": "my_class" },
		 *          null,
		 *          null,
		 *          null,
		 *          null
		 *        ]
		 *      } );
		 *    } );
		 */
		"sClass": "",
	
		/**
		 * When DataTables calculates the column widths to assign to each column,
		 * it finds the longest string in each column and then constructs a
		 * temporary table and reads the widths from that. The problem with this
		 * is that "mmm" is much wider then "iiii", but the latter is a longer
		 * string - thus the calculation can go wrong (doing it properly and putting
		 * it into an DOM object and measuring that is horribly(!) slow). Thus as
		 * a "work around" we provide this option. It will append its value to the
		 * text that is found to be the longest string for the column - i.e. padding.
		 * Generally you shouldn't need this!
		 *  @type string
		 *  @default <i>Empty string<i>
		 *
		 *  @name DataTable.defaults.column.contentPadding
		 *  @dtopt Columns
		 *
		 *  @example
		 *    // Using `columns`
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columns": [
		 *          null,
		 *          null,
		 *          null,
		 *          {
		 *            "contentPadding": "mmm"
		 *          }
		 *        ]
		 *      } );
		 *    } );
		 */
		"sContentPadding": "",
	
	
		/**
		 * Allows a default value to be given for a column's data, and wilh be Used
		 * wje�e4e2 a nuh| data sourcd!is encoun|E2ed (this kan!be bu�ausg0`datap
		 * �{ set to null, oR cecauSe thE data source itseld )s null).	 *  Btyp% s|riog
	!*  @de&awlt �ull
		 *
		 *  @nam} DataTcble,tefaultc>colUml.defaulpCgntent
		 *  Dddopt Cohumns
		 .
		 (  @example
		 *  $ ?/ Us�lg"`cnlumnDefs`
		("   `$(dOcwment).ready( function() {	I(*  ,   $('#example').dataTab�e* {
	 * `   �) "�olt�nDEfs#> [
		 *"`        {
		 *   `        "lata": null,
		 *      $    $"defaULtConten|":�"Edit",�		 * !     $    "targets": K -5 ]
		 * $0  $    }
		 * !"     �
		 *(     }!);
		 *    y +;
	I "
		 *  @eyample
		 *    / Using0`colum~s`
		 *    $(document+jreadq("fulctionh) {
H	 *      $('#exam8le')�VataPable( {
		 
        "conUmns": [
		 *    0 "   lull,
	�*       �  fwln,
		 *        $�.ulL,		�*$         {
		 *   0        "dAta": NulL,"	 *d      0   !"defcu,tCo�t�nd"8 .Edit"
	 *     0 0  }*	)�*        ]
		(*      } );
		 *    } );
	 */
	"sDen ultContent": null,
	
			-*

		 * This�p�PAmeter iS kndy esed in DataTablms' s�rver-side processinc> It sanJ		 *"be uzceptionally useful to know`��at columns are bding(displayeb on the
		 * kli%nt sife, and to`}ap(these to database f)elds. When dtf�ned, the ~amAs
		 * alro `dlow DataTableq t remrdur inform�t)on f2om the cerv%{ iv iv comesJ	 *`back hn an$}ne|peKded or`ur (i.e.$iv you switsh your col}m�s aroU~d`on the	 * client-side, your smrVdr-smde c/de does n/t also n-ed updating).
		 *  @typg strin�
		 * $@defaUld <i>Emp�y string=/i:
		 *
		 *  @name DetqT�ble.eEfaults.column.name*		 "  Hdtop4 Kolumns
		 *
		 (   ex`mp,e
		 *    // Usifg `columnDdfs`		 *    $(docum�nt).ready($functigf() {
	 *      $(7#example').daTaVable( {
		$*        "cOhqenDeFs": [
	 *  !       { "name": "enga.e", "targgts": { 0 ] },
	 * (       0{0"na�g2: "browser*l "targetsb: [05 ] ],
		 *          { "name�: "rlatfozm", "ta2gets": [`3 ] }-
		 *      0   �`".ame": 2versin#l  targets"> [ 2 ] },
		 *    !   " � "nime�: "grade", "targets": [`4 ] }
		 *        ]
		 *      }$);
	 *    } );
	 *
		 * `@exakple
		`
   !//"Using `columns`
�	 *    $(dkcument).reafy( vun�tion,) {
	 *      $('#eyample').da�`Pable( {@		 *        "columns": [
�	(*  !    !  { "name":$"engine" },
		 *      �  �{ "name": "browser" },
		 *          { "n!me": &platjorm" },
		 *``  �     { "namE": "verSioj" u,
	) *   0      { "name": "grade" }
		`*        ]
		 *      }");
		 *    } );
	� 
/
		"sNam�": b",
	
		/**		 * D%fines a data sowrCE type fmr the ordeRang which0#an be tsedbto read	 
 beal-tkme hnvormetinn from the tAfle (updating theainternally cache�
		 * wepsi/n	 prior tk ordepiof. Th)s q(low{ orDering to occer ol useR
		 * editable element{ sucj as f/2m inpuus,*	 *```type s4ringJ		$*  @Defau�t wte
	�"*
		 *  @ni}g F�taTable.eefaults.column.ow$erDataType
	  *b @dtopt$Columns		 *		 *  @a�amplm
		(*   !/ UsIng(bcolu�nDefs`
		 *    $(loc}oent).�eady* vunstion() {
		 *      $('#exaeple')*dataTable8 �
		 *        coluMnFefr": [
		0*          { "orderDatiType#: "dom-tazt", "targe|s": [ 2, ; ] },
	� *     �    { "t9p�": �numeric", "vargets": [ 3 ] },
	I *         { 2o0der�ataType": "dom)selecp, "targeTs":a[ 4 ]0�,
		$*          { "orderDataType"x "dod-cJeCkBox"� "targets": [ 5 ]0|
		 *   �  � ]
		 * (    } );
		 *(   } );	 *		 * $@exampne
		$
 0  //dUsino `cnluons`
		 *  & $(do#ument).reaDy( Fuoition(i {		 *`!    $('#example')�dataTabhe( {
		 * �      &columns"r`[		 *       `  nUl~,
		(:         $�}lL,
		(*    " �   { "mreesDataT1pe": "dom%text  },
	 *          { "ordeVDataType":  dom-text2, "type": "numeric" },
	 *       (  { "orturt�taType2: "dom-smlect" },
		 *          { "orderDadaType"2 "dom-cjeck�ox" }
		0j      ((]
		 *      } );
		 �` ( } ).
 *+�		"s[ortDatAty�e": "std",
	
	
		/*h:	`*!�he title of thkr co,umn/
		`*  Htypu strinc*		 * h default null i>Ferived from tlq '�H' telue For this!colu}n in the
		 *    oRigi.an JTmL$Tqble.</i>
M *		 +  @name DataTable.de.aulus.colu�n.t�tle
	� *  @dtopt Bolumns
	 .
		 *  @exampleJ		 * �$ // Usi' `c�LumnDevsa
		 *    $(doCement).ready,0fulction*- {
		 * "   `$('cexamplE').dataTabne( {
	 *        "columnDef�": [		 *  ( $  ( "{ "title" "My column title"< "targ%t3": [ 0 ]}	$*!       ]
		 *     �] )9	 *  ( }0);
		$*
		 *! @eyample
	) *    /- Using(@#o|uln3`
 j(  $$(d/c}ment).ready  nUnction() {
		 *      $('�examplE').dauaDaBle( {
		 *        "columns"2 [�		 j�         { "ti�le�: "My cOlu-�(tiTle" }<
		!* �        nqll,
	 *         !null,
		 *�         nuhl,		 *`         null
		 *        ]
		 *     }!(;
	 *     );
	 ./
		"sTit|e&>0null,
	
	
	-**�		 *�The 4Ype allows you`tk spechfy how 4hu data(For this c�lumn wiml$be
		 * orddreu. Four types (st�in', ne-e�ic,(date and html (w(�ch wanN StrKp
	 * HTML tag� before ordering)) aRe curvenply avainable. Not� that only0dete
		 * fo�mats unddrwtoo` bq(Javascpipt'1 Dpteh) objecd wi�l be acaepted as type
		�* date. For example� bMaR 2>.02000`5:03 PM#. May t�kg the v!lues: 'strang'(		$* 'numebic', 'detm' oR 'html' (b} defa5lt). Nepther Types can be adding
	� * thrugh pdug-hns
)	 *` @|ypg strine
	 *! @defau|v�nell <i?Auto-de4ected from raw daTa</i>
)	 *
		 "!@nAme D�taTable.defaultc,�oLumn.uyPe
		 .0 B`to`t Aolumn�
		 �
		 :  @example
	� *    // UsIng `col7mlDeds`
		 *    $(documelt).ready(0function() {� *      $('�example'�.dqtcTeb,e( ;
		(*        "coluiNDef�": [
		 *"         { "tyte": #huml", "targets": [ 0"]"Y
		 *        ]
	I *   !  �");
		 *    }!);
		 *
		 *  @example
		 *    /. Esing `golumns`
	 *0   $(docume~ti.rdavy(�fu.ction() {
		0*      $('cexample').dataTablE( {		 *   $ 0 0"columns":`�
		 *     ( p  { &type": #html" }$
)	 *       0� nuhl,
		 *          null-
		 � 0        �qdl,*�	 *          nunl
	"*        U		 * 0 (  } );
I	 *    }`+;	)$*/
	"{TYpe2> null,	
	
		/**
�	 * Definino thg wmeth o�athe column, tihs para-eter May tcke any CCS vilue
		 * *3em, 21xx�etc). DataTa"lec�cpplies 'slapt' widths to columns wh)ch have not
	I * feen giv�n a spec��iK sidth`through thi3 ifterfacm0%nsuring thpt�the table		 *remai�s readcb,e.		 *` @type stvi~g
		 (  @denaunt nudl <i~Au|o}a�ic,/i>		 *
I	 *  @jame TataTacle.d%fawlts.co�umn.widuh	 (  @dtopt ��lum~q
	i *
		 *  �examrle
		 �    /? Usifg `columfDefs`
		 *    $j�ocument.ready( fungtion() {
		 *  0   ('#examtlE')&dataTabhe( y
	 *  $  �  "columnDefw�:`YJ	9 *          s "widuh: "20%", "ta2guts8 [ 0 ] �*	 *        ]		 *  (   } );		 (     );
		 *
		 *  @example
		 *  ! =/ Usinf dbol�mns`
		(.  ! $)document).ready� functhon()"{
		 * "    %�'#example&).dataTable(�{
		 * ` ��(  "�oltmns": [
	� *     �    { "w�$th": "20% },
		 *         "nqll,
		 :   " �    n}ll(
		 *        ! nuLj		�*          ~�ll
	!*  �    0\
		 *     | );�	� *    } );
		!*/		"{Sidth": null
I}3
K
	_f�HungariAnMap( DAtaTAfle.defa}lts.ck~emn !;
	
		J	/**	 * DAtaUa"Les setfingw o�jecT$- This �olls a|l$the info2-ation leeded vor a
) *�ekwen tAble, inc|udmnG c~fieuration,!data ald �urrejt app.hcation of t�e
 * table"options. DataTables does fop have a$siogle(mns4ange0ffr each(DataTaBle
	 * widl�thm settifes�attabheD to thap instanc�, but ratheb )nstances of the
	 * DataTable "class" are created on-the-fly as needed (typically by a
	 * $().dataTable() call) and the settings object is then applied to that
	 * instance.
	 *
	 * Note that this object is related to {@link DataTable.defaults} but this
	 * one is the internal data store for DataTables's cache of columns. It should
	 * NOT be manipulated outside of DataTables. Any configuration should be done
	 * through the initialisation options.
	 *  @namespace
	 *  @todo Really should attach the settings object to individual instances so we
	 *    don't need to create new instances on each $().dataTable() call (if the
	 *    table already exists). It would also save passing oSettings around and
	 *    into every single function. However, this is a very significant
	 *    architecture change for DataTables and will almost certainly break
	 *    backwards compatibility with older installations. This is something that
	 *    will be done in 2.0.
	 */
	DataTable.models.oSettings = {
		/**
		 * Primary features of DataTables and their enablement state.
		 *  @namespace
		 */
		"oFeatures": {
	
			/**
			 * Flag to say if DataTables should automatically try to calculate the
			 * optimum table and columns widths (true) or not (false).
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 */
			"bAutoWidth": null,
	
			/**
			 * Delay the creation of TR and TD elements until they are actually
			 * needed by a driven page draw. This can give a significant speed
			 * increase for Ajax source and Javascript source data, but makes no
			 * difference at all fro DOM and server-side processing tables.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 */
			"bDeferRender": null,
	
			/**
			 * Enable filtering on the table or not. Note that if this is disabled
			 * then there is no filtering at all on the table, including fnFilter.
			 * To just remove the filtering input use sDom and remove the 'f' option.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 */
			"bFilter": null,
	
			/**
			 * Table information element (the 'Showing x of y records' div) enable
			 * flag.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 */
			"bInfo": null,
	
			/**
			 * Present a user control allowing the end user to change the page size
			 * when pagination is enabled.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 */
			"bLengthChange": null,
	
			/**
			 * Pagination enabled or not. Note that if this is disabled then length
			 * changing must also be disabled.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 */
			"bPaginate": null,
	
			/**
			 * Processing indicator enable flag whenever DataTables is enacting a
			 * user request - typically an Ajax request for server-side processing.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 */
			"bProcessing": null,
	
			/**
			 * Server-side processing enabled flag - when enabled DataTables will
			 * get all data from the server for every draw - there is no filtering,
			 * sorting or paging done on the client-side.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 */
			"bServerSide": null,
	
			/**
			 * Sorting enablement flag.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 */
			"bSort": null,
	
			/**
			 * Multi-column sorting
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 */
			"bSortMulti": null,
	
			/**
			 * Apply a class to the columns which are being sorted to provide a
			 * visual highlight or not. This can slow things down when enabled since
			 * there is a lot of DOM interaction.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 */
			"bSortClasses": null,
	
			/**
			 * State saving enablement flag.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 */
			"bStateSave": null
		},
	
	
		/**
		 * Scrolling settings for a table.
		 *  @namespace
		 */
		"oScroll": {
			/**
			 * When the table is shorter in height than sScrollY, collapse the
			 * table container down to the height of the table (when true).
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 */
			"bCollapse": null,
	
			/**
			 * Width of the scrollbar for the web-browser's platform. Calculated
			 * during table initialisation.
			 *  @type int
			 *  @default 0
			 */
			"iBarWidth": 0,
	
			/**
			 * Viewport width for horizontal scrolling. Horizontal scrolling is
			 * disabled if an empty string.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type string
			 */
			"sX": null,
	
			/**
			 * Width to expand the table to when using x-scrolling. Typically you
			 * should not need to use this.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type string
			 *  @deprecated
			 */
			"sXInner": null,
	
			/**
			 * Viewport height for vertical scrolling. Vertical scrolling is disabled
			 * if an empty string.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type string
			 */
			"sY": null
		},
	
		/**
		 * Language information for the table.
		 *  @namespace
		 *  @extends DataTable.defaults.oLanguage
		 */
		"oLanguage": {
			/**
			 * Information callback function. See
			 * {@link DataTable.defaults.fnInfoCallback}
			 *  @type function
			 *  @default null
			 */
			"fnInfoCallback": null
		},
	
		/**
		 * Browser support parameters
		 *  @namespace
		 */
		"oBrowser": {
			/**
			 * Indicate if the browser incorrectly calculates width:100% inside a
			 * scrolling element (IE6/7)
			 *  @type boolean
			 *  @default false
			 */
			"bScrollOversize": false,
	
			/**
			 * Determine if the vertical scrollbar is on the right or left of the
			 * scrolling container - needed for rtl language layout, although not
			 * all browsers move the scrollbar (Safari).
			 *  @type boolean
			 *  @default false
			 */
			"bScrollbarLeft": false
		},
	
	
		"ajax": null,
	
	
		/**
		 * Array referencing the nodes which are used for the features. The
		 * parameters of this object match what is allowed by sDom - i.e.
		 *   <ul>
		 *     <li>'l' - Length changing</li>
		 *     <li>'f' - Filtering input</li>
		 *     <li>'t' - The table!</li>
		 *     <li>'i' - Information</li>
		 *     <li>'p' - Pagination</li>
		 *     <li>'r' - pRocessing</li>
		 *   </ul>
		 *  @type array
		 *  @default []
		 */
		"aanFeatures": [],
	
		/**
		 * Store data information - see {@link DataTable.models.oRow} for detailed
		 * information.
		 *  @type array
		 *  @default []
		 */
		"aoData": [],
	
		/**
		 * Array of indexes which are in the current display (after filtering etc)
		 *  @type array
		 *  @default []
		 */
		"aiDisplay": [],
	
		/**
		 * Array of indexes for display - no filtering
		 *  @type array
		 *  @default []
		 */
		"aiDisplayMaster": [],
	
		/**
		 * Store information about each column that is in use
		 *  @type array
		 *  @default []
		 */
		"aoColumns": [],
	
		/**
		 * Store information about the table's header
		 *  @type array
		 *  @default []
		 */
		"aoHeader": [],
	
		/**
		 * Store information about the table's footer
		 *  @type array
		 *  @default []
		 */
		"aoFooter": [],
	
		/**
		 * Store the applied global search information in case we want to force a
		 * research or compare the old search to a new one.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @namespace
		 *  @extends DataTable.models.oSearch
		 */
		"oPreviousSearch": {},
	
		/**
		 * Store the applied search for each column - see
		 * {@link DataTable.models.oSearch} for the format that is used for the
		 * filtering information for each column.
		 *  @type array
		 *  @default []
		 */
		"aoPreSearchCols": [],
	
		/**
		 * Sorting that is applied to the table. Note that the inner arrays are
		 * used in the following manner:
		 * <ul>
		 *   <li>Index 0 - column number</li>
		 *   <li>Index 1 - current sorting direction</li>
		 * </ul>
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type array
		 *  @todo These inner arrays should really be objects
		 */
		"aaSorting": null,
	
		/**
		 * Sorting that is always applied to the table (i.e. prefixed in front of
		 * aaSorting).
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type array
		 *  @default []
		 */
		"aaSortingFixed": [],
	
		/**
		 * Classes to use for the striping of a table.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type array
		 *  @default []
		 */
		"asStripeClasses": null,
	
		/**
		 * If restoring a table - we should restore its striping classes as well
		 *  @type array
		 *  @default []
		 */
		"asDestroyStripes": [],
	
		/**
		 * If restoring a table - we should restore its width
		 *  @type int
		 *  @default 0
		 */
		"sDestroyWidth": 0,
	
		/**
		 * Callback functions array for every time a row is inserted (i.e. on a draw).
		 *  @type array
		 *  @default []
		 */
		"aoRowCallback": [],
	
		/**
		 * Callback functions for the header on each draw.
		 *  @type array
		 *  @default []
		 */
		"aoHeaderCallback": [],
	
		/**
		 * Callback function for the footer on each draw.
		 *  @type array
		 *  @default []
		 */
		"aoFooterCallback": [],
	
		/**
		 * Array of callback functions for draw callback functions
		 *  @type array
		 *  @default []
		 */
		"aoDrawCallback": [],
	
		/**
		 * Array of callback functions for row created function
		 *  @type array
		 *  @default []
		 */
		"aoRowCreatedCallback": [],
	
		/**
		 * Callback functions for just before the table is redrawn. A return of
		 * false will be used to cancel the draw.
		 *  @type array
		 *  @default []
		 */
		"aoPreDrawCallback": [],
	
		/**
		 * Callback functions for when the table has been initialised.
		 *  @type array
		 *  @default []
		 */
		"aoInitComplete": [],
	
	
		/**
		 * Callbacks for modifying the settings to be stored for state saving, prior to
		 * saving state.
		 *  @type array
		 *  @default []
		 */
		"aoStateSaveParams": [],
	
		/**
		 * Callbacks for modifying the settings that have been stored for state saving
		 * prior to using the stored values to restore the state.
		 *  @type array
		 *  @default []
		 */
		"aoStateLoadParams": [],
	
		/**
		 * Callbacks for operating on the settings object once the saved state has been
		 * loaded
		 *  @type array
		 *  @default []
		 */
		"aoStateLoaded": [],
	
		/**
		 * Cache the table ID for quick access
		 *  @type string
		 *  @default <i>Empty string</i>
		 */
		"sTableId": "",
	
		/**
		 * The TABLE node for the main table
		 *  @type node
		 *  @default null
		 */
		"nTable": null,
	
		/**
		 * Permanent ref to the thead element
		 *  @type node
		 *  @default null
		 */
		"nTHead": null,
	
		/**
		 * Permanent ref to the tfoot element - if it exists
		 *  @type node
		 *  @default null
		 */
		"nTFoot": null,
	
		/**
		 * Permanent ref to the tbody element
		 *  @type node
		 *  @default null
		 */
		"nTBody": null,
	
		/**
		 * Cache the wrapper node (contains all DataTables controlled elements)
		 *  @type node
		 *  @default null
		 */
		"nTableWrapper": null,
	
		/**
		 * Indicate if when using server-side processing the loading of data
		 * should be deferred until the second draw.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type boolean
		 *  @default false
		 */
		"bDeferLoading": false,
	
		/**
		 * Indicate if all required information has been read in
		 *  @type boolean
		 *  @default false
		 */
		"bInitialised": false,
	
		/**
		 * Information about open rows. Each object in the array has the parameters
		 * 'nTr' and 'nParent'
		 *  @type array
		 *  @default []
		 */
		"aoOpenRows": [],
	
		/**
		 * Dictate the positioning of DataTables' control elements - see
		 * {@link DataTable.model.oInit.sDom}.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type string
		 *  @default null
		 */
		"sDom": null,
	
		/**
		 * Search delay (in mS)
		 *  @type integer
		 *  @default null
		 */
		"searchDelay": null,
	
		/**
		 * Which type of pagination should be used.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type string
		 *  @default two_button
		 */
		"sPaginationType": "two_button",
	
		/**
		 * The state duration (for `stateSave`) in seconds.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type int
		 *  @default 0
		 */
		"iStateDuration": 0,
	
		/**
		 * Array of callback functions for state saving. Each array element is an
		 * object with the following parameters:
		 *   <ul>
		 *     <li>function:fn - function to call. Takes two parameters, oSettings
		 *       and the JSON string to save that has been thus far created. Returns
		 *       a JSON string to be inserted into a json object
		 *       (i.e. '"param": [ 0, 1, 2]')</li>
		 *     <li>string:sName - name of callback</li>
		 *   </ul>
		 *  @type array
		 *  @default []
		 */
		"aoStateSave": [],
	
		/**
		 * Array of callback functions for state loading. Each array element is an
		 * object with the following parameters:
		 *   <ul>
		 *     <li>function:fn - function to call. Takes two parameters, oSettings
		 *       and the object stored. May return false to cancel state loading</li>
		 *     <li>string:sName - name of callback</li>
		 *   </ul>
		 *  @type array
		 *  @default []
		 */
		"aoStateLoad": [],
	
		/**
		 * State that was saved. Useful for back reference
		 *  @type object
		 *  @default null
		 */
		"oSavedState": null,
	
		/**
		 * State that was loaded. Useful for back reference
		 *  @type object
		 *  @default null
		 */
		"oLoadedState": null,
	
		/**
		 * Source url for AJAX data for the table.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type string
		 *  @default null
		 */
		"sAjaxSource": null,
	
		/**
		 * Property from a given object from which to read the table data from. This
		 * can be an empty string (when not server-side processing), in which case
		 * it is  assumed an an array is given directly.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type string
		 */
		"sAjaxDataProp": null,
	
		/**
		 * Note if draw should be blocked while getting data
		 *  @type boolean
		 *  @default true
		 */
		"bAjaxDataGet": true,
	
		/**
		 * The last jQuery XHR object that was used for server-side data gathering.
		 * This can be used for working with the XHR information in one of the
		 * callbacks
		 *  @type object
		 *  @default null
		 */
		"jqXHR": null,
	
		/**
		 * JSON returned from the server in the last Ajax request
		 *  @type object
		 *  @default undefined
		 */
		"json": undefined,
	
		/**
		 * Data submitted as part of the last Ajax request
		 *  @type object
		 *  @default undefined
		 */
		"oAjaxData": undefined,
	
		/**
		 * Function to get the server-side data.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type function
		 */
		"fnServerData": null,
	
		/**
		 * Functions which are called prior to sending an Ajax request so extra
		 * parameters can easily be sent to the server
		 *  @type array
		 *  @default []
		 */
		"aoServerParams": [],
	
		/**
		 * Send the XHR HTTP method - GET or POST (could be PUT or DELETE if
		 * required).
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type string
		 */
		"sServerMethod": null,
	
		/**
		 * Format numbers for display.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type function
		 */
		"fnFormatNumber": null,
	
		/**
		 * List of options that can be used for the user selectable length menu.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type array
		 *  @default []
		 */
		"aLengthMenu": null,
	
		/**
		 * Counter for the draws that the table does. Also used as a tracker for
		 * server-side processing
		 *  @type int
		 *  @default 0
		 */
		"iDraw": 0,
	
		/**
		 * Indicate if a redraw is being done - useful for Ajax
		 *  @type boolean
		 *  @default false
		 */
		"bDrawing": false,
	
		/**
		 * Draw index (iDraw) of the last error when parsing the returned data
		 *  @type int
		 *  @default -1
		 */
		"iDrawError": -1,
	
		/**
		 * Paging display length
		 *  @type int
		 *  @default 10
		 */
		"_iDisplayLength": 10,
	
		/**
		 * Paging start point - aiDisplay index
		 *  @type int
		 *  @default 0
		 */
		"_iDisplayStart": 0,
	
		/**
		 * Server-side processing - number of records in the result set
		 * (i.e. before filtering), Use fnRecordsTotal rather than
		 * this property to get the value of the number of records, regardless of
		 * the server-side processing setting.
		 *  @type int
		 *  @default 0
		 *  @private
		 */
		"_iRecordsTotal": 0,
	
		/**
		 * Server-side processing - number of records in the current display set
		 * (i.e. after filtering). Use fnRecordsDisplay rather than
		 * this property to get the value of the number of records, regardless of
		 * the server-side processing setting.
		 *  @type boolean
		 *  @default 0
		 *  @private
		 */
		"_iRecordsDisplay": 0,
	
		/**
		 * Flag to indicate if jQuery UI marking and classes should be used.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type boolean
		 */
		"bJUI": null,
	
		/**
		 * The classes to use for the table
		 *  @type object
		 *  @default {}
		 */
		"oClasses": {},
	
		/**
		 * Flag attached to the settings object so you can check in the draw
		 * callback if filtering has been done in the draw. Deprecated in favour of
		 * events.
		 *  @type boolean
		 *  @default false
		 *  @deprecated
		 */
		"bFiltered": false,
	
		/**
		 * Flag attached to the settings object so you can check in the draw
		 * callback if sorting has been done in the draw. Deprecated in favour of
		 * events.
		 *  @type boolean
		 *  @default false
		 *  @deprecated
		 */
		"bSorted": false,
	
		/**
		 * Indicate that if multiple rows are in the header and there is more than
		 * one unique cell per column, if the top one (true) or bottom one (false)
		 * should be used for sorting / title by DataTables.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type boolean
		 */
		"bSortCellsTop": null,
	
		/**
		 * Initialisation object that is used for the table
		 *  @type object
		 *  @default null
		 */
		"oInit": null,
	
		/**
		 * Destroy callback functions - for plug-ins to attach themselves to the
		 * destroy so they can clean up markup and events.
		 *  @type array
		 *  @default []
		 */
		"aoDestroyCallback": [],
	
	
		/**
		 * Get the number of records in the current record set, before filtering
		 *  @type function
		 */
		"fnRecordsTotal": function ()
		{
			return _fnDataSource( this ) == 'ssp' ?
				this._iRecordsTotal * 1 :
				this.aiDisplayMaster.length;
		},
	
		/**
		 * Get the number of records in the current record set, after filtering
		 *  @type function
		 */
		"fnRecordsDisplay": function ()
		{
			return _fnDataSource( this ) == 'ssp' ?
				this._iRecordsDisplay * 1 :
				this.aiDisplay.length;
		},
	
		/**
		 * Get the display end point - aiDisplay index
		 *  @type function
		 */
		"fnDisplayEnd": function ()
		{
			var
				len      = this._iDisplayLength,
				start    = this._iDisplayStart,
				calc     = start + len,
				records  = this.aiDisplay.length,
				features = this.oFeatures,
				paginate = features.bPaginate;
	
			if ( features.bServerSide ) {
				return paginate === false || len === -1 ?
					start + records :
					Math.min( start+len, this._iRecordsDisplay );
			}
			else {
				return ! paginate || calc>records || len===-1 ?
					records :
					calc;
			}
		},
	
		/**
		 * The DataTables object for this table
		 *  @type object
		 *  @default null
		 */
		"oInstance": null,
	
		/**
		 * Unique identifier for each instance of the DataTables object. If there
		 * is an ID on the table node, then it takes that value, otherwise an
		 * incrementing internal counter is used.
		 *  @type string
		 *  @default null
		 */
		"sInstance": null,
	
		/**
		 * tabindex attribute value that is added to DataTables control elements, allowing
		 * keyboard navigation of the table and its controls.
		 */
		"iTabIndex": 0,
	
		/**
		 * DIV container for the footer scrolling table if scrolling
		 */
		"nScrollHead": null,
	
		/**
		 * DIV container for the footer scrolling table if scrolling
		 */
		"nScrollFoot": null,
	
		/**
		 * Last applied sort
		 *  @type array
		 *  @default []
		 */
		"aLastSort": [],
	
		/**
		 * Stored plug-in instances
		 *  @type object
		 *  @default {}
		 */
		"oPlugins": {}
	};

	/**
	 * Extension object for DataTables that is used to provide all extension
	 * options.
	 *
	 * Note that the `DataTable.ext` object is available through
	 * `jQuery.fn.dataTable.ext` where it may be accessed and manipulated. It is
	 * also aliased to `jQuery.fn.dataTableExt` for historic reasons.
	 *  @namespace
	 *  @extends DataTable.models.ext
	 */
	
	
	/**
	 * DataTables extensions
	 * 
	 * This namespace acts as a collection area for plug-ins that can be used to
	 * extend DataTables capabilities. Indeed many of the build in methods
	 * use this method to provide their own capabilities (sorting methods for
	 * example).
	 *
	 * Note that this namespace is aliased to `jQuery.fn.dataTableExt` for legacy
	 * reasons
	 *
	 *  @namespace
	 */
	DataTable.ext = _ext = {
		/**
		 * Buttons. For use with the Buttons extension for DataTables. This is
		 * defined here so other extensions can define buttons regardless of load
		 * order. It is _not_ used by DataTables core.
		 *
		 *  @type object
		 *  @default {}
		 */
		buttons: {},
	
	
		/**
		 * Element class names
		 *
		 *  @type object
		 *  @default {}
		 */
		classes: {},
	
	
		/**
		 * Error reporting.
		 * 
		 * How should DataTables report an error. Can take the value 'alert',
		 * 'throw', 'none' or a function.
		 *
		 *  @type string|function
		 *  @default alert
		 */
		errMode: "alert",
	
	
		/**
		 * Feature plug-ins.
		 * 
		 * This is an array of objects which describe the feature plug-ins that are
		 * available to DataTables. These feature plug-ins are then available for
		 * use through the `dom` initialisation option.
		 * 
		 * Each feature plug-in is described by an object which must have the
		 * following properties:
		 * 
		 * * `fnInit` - function that is used to initialise the plug-in,
		 * * `cFeature` - a character so the feature can be enabled by the `dom`
		 *   instillation option. This is case sensitive.
		 *
		 * The `fnInit` function has the following input parameters:
		 *
		 * 1. `{object}` DataTables settings object: see
		 *    {@link DataTable.models.oSettings}
		 *
		 * And the following return is expected:
		 * 
		 * * {node|null} The element which contains your feature. Note that the
		 *   return may also be void if your plug-in does not require to inject any
		 *   DOM elements into DataTables control (`dom`) - for example this might
		 *   be useful when developing a plug-in which allows table control via
		 *   keyboard entry
		 *
		 *  @type array
		 *
		 *  @example
		 *    $.fn.dataTable.ext.features.push( {
		 *      "fnInit": function( oSettings ) {
		 *        return new TableTools( { "oDTSettings": oSettings } );
		 *      },
		 *      "cFeature": "T"
		 *    } );
		 */
		feature: [],
	
	
		/**
		 * Row searching.
		 * 
		 * This method of searching is complimentary to the default type based
		 * searching, and a lot more comprehensive as it allows you complete control
		 * over the searching logic. Each element in this array is a function
		 * (parameters described below) that is called for every row in the table,
		 * and your logic decides if it should be included in the searching data set
		 * or not.
		 *
		 * Searching functions have the following input parameters:
		 *
		 * 1. `{object}` DataTables settings object: see
		 *    {@link DataTable.models.oSettings}
		 * 2. `{array|object}` Data for the row to be processed (same as the
		 *    original format that was passed in as the data source, or an array
		 *    from a DOM data source
		 * 3. `{int}` Row index ({@link DataTable.models.oSettings.aoData}), which
		 *    can be useful to retrieve the `TR` element if you need DOM interaction.
		 *
		 * And the following return is expected:
		 *
		 * * {boolean} Include the row in the searched result set (true) or not
		 *   (false)
		 *
		 * Note that as with the main search ability in DataTables, technically this
		 * is "filtering", since it is subtractive. However, for consistency in
		 * naming we call it searching here.
		 *
		 *  @type array
		 *  @default []
		 *
		 *  @example
		 *    // The following example shows custom search being applied to the
		 *    // fourth column (i.e. the data[3] index) based on two input values
		 *    // from the end-user, matching the data in a certain range.
		 *    $.fn.dataTable.ext.search.push(
		 *      function( settings, data, dataIndex ) {
		 *        var min = document.getElementById('min').value * 1;
		 *        var max = document.getElementById('max').value * 1;
		 *        var version = data[3] == "-" ? 0 : data[3]*1;
		 *
		 *        if ( min == "" && max == "" ) {
		 *          return true;
		 *        }
		 *        else if ( min == "" && version < max ) {
		 *          return true;
		 *        }
		 *        else if ( min < version && "" == max ) {
		 *          return true;
		 *        }
		 *        else if ( min < version && version < max ) {
		 *          return true;
		 *        }
		 *        return false;
		 *      }
		 *    );
		 */
		search: [],
	
	
		/**
		 * Internal functions, exposed for used in plug-ins.
		 * 
		 * Please note that you should not need to use the internal methods for
		 * anything other than a plug-in (and even then, try to avoid if possible).
		 * The internal function may change between releases.
		 *
		 *  @type object
		 *  @default {}
		 */
		internal: {},
	
	
		/**
		 * Legacy configuration options. Enable and disable legacy options that
		 * are available in DataTables.
		 *
		 *  @type object
		 */
		legacy: {
			/**
			 * Enable / disable DataTables 1.9 compatible server-side processing
			 * requests
			 *
			 *  @type boolean
			 *  @default null
			 */
			ajax: null
		},
	
	
		/**
		 * Pagination plug-in methods.
		 * 
		 * Each entry in this object is a function and defines which buttons should
		 * be shown by the pagination rendering method that is used for the table:
		 * {@link DataTable.ext.renderer.pageButton}. The renderer addresses how the
		 * buttons are displayed in the document, while the functions here tell it
		 * what buttons to display. This is done by returning an array of button
		 * descriptions (what each button will do).
		 *
		 * Pagination types (the four built in options and any additional plug-in
		 * options defined here) can be used through the `paginationType`
		 * initialisation parameter.
		 *
		 * The functions defined take two parameters:
		 *
		 * 1. `{int} page` The current page index
		 * 2. `{int} pages` The number of pages in the table
		 *
		 * Each function is expected to return an array where each element of the
		 * array can be one of:
		 *
		 * * `first` - Jump to first page when activated
		 * * `last` - Jump to last page when activated
		 * * `previous` - Show previous page when activated
		 * * `next` - Show next page when activated
		 * * `{int}` - Show page of the index given
		 * * `{array}` - A nested array containing the above elements to add a
		 *   containing 'DIV' element (might be useful for styling).
		 *
		 * Note that DataTables v1.9- used this object slightly differently whereby
		 * an object with two functions would be defined for each plug-in. That
		 * ability is still supported by DataTables 1.10+ to provide backwards
		 * compatibility, but this option of use is now decremented and no longer
		 * documented in DataTables 1.10+.
		 *
		 *  @type object
		 *  @default {}
		 *
		 *  @example
		 *    // Show previous, next and current page buttons only
		 *    $.fn.dataTableExt.oPagination.current = function ( page, pages ) {
		 *      return [ 'previous', page, 'next' ];
		 *    };
		 */
		pager: {},
	
	
		renderer: {
			pageButton: {},
			header: {}
		},
	
	
		/**
		 * Ordering plug-ins - custom data source
		 * 
		 * The extension options for ordering of data available here is complimentary
		 * to the default type based ordering that DataTables typically uses. It
		 * allows much greater control over the the data that is being used to
		 * order a column, but is necessarily therefore more complex.
		 * 
		 * This type of ordering is useful if you want to do ordering based on data
		 * live from the DOM (for example the contents of an 'input' element) rather
		 * than just the static string that DataTables knows of.
		 * 
		 * The way these plug-ins work is that you create an array of the values you
		 * wish to be ordering for the column in question and then return that
		 * array. The data in the array much be in the index order of the rows in
		 * the table (not the currently ordering order!). Which order data gathering
		 * function is run here depends on the `dt-init columns.orderDataType`
		 * parameter that is used for the column (if any).
		 *
		 * The functions defined take two parameters:
		 *
		 * 1. `{object}` DataTables settings object: see
		 *    {@link DataTable.models.oSettings}
		 * 2. `{int}` Target column index
		 *
		 * Each function is expected to return an array:
		 *
		 * * `{array}` Data for the column to be ordering upon
		 *
		 *  @type array
		 *
		 *  @example
		 *    // Ordering using `input` node values
		 *    $.fn.dataTable.ext.order['dom-text'] = function  ( settings, col )
		 *    {
		 *      return this.api().column( col, {order:'index'} ).nodes().map( function ( td, i ) {
		 *        return $('input', td).val();
		 *      } );
		 *    }
		 */
		order: {},
	
	
		/**
		 * Type based plug-ins.
		 *
		 * Each column in DataTables has a type assigned to it, either by automatic
		 * detection or by direct assignment using the `type` option for the column.
		 * The type of a column will effect how it is ordering and search (plug-ins
		 * can also make use of the column type if required).
		 *
		 * @namespace
		 */
		type: {
			/**
			 * Type detection functions.
			 *
			 * The functions defined in this object are used to automatically detect
			 * a column's type, making initialisation of DataTables super easy, even
			 * when complex data is in the table.
			 *
			 * The functions defined take two parameters:
			 *
		     *  1. `{*}` Data from the column cell to be analysed
		     *  2. `{settings}` DataTables settings object. This can be used to
		     *     perform context specific type detection - for example detection
		     *     based on language settings such as using a comma for a decimal
		     *     place. Generally speaking the options from the settings will not
		     *     be required
			 *
			 * Each function is expected to return:
			 *
			 * * `{string|null}` Data type detected, or null if unknown (and thus
			 *   pass it on to the other type detection functions.
			 *
			 *  @type array
			 *
			 *  @example
			 *    // Currency type detection plug-in:
			 *    $.fn.dataTable.ext.type.detect.push(
			 *      function ( data, settings ) {
			 *        // Check the numeric part
			 *        if ( ! $.isNumeric( data.substring(1) ) ) {
			 *          return null;
			 *        }
			 *
			 *        // Check prefixed by currency
			 *        if ( data.charAt(0) == '$' || data.charAt(0) == '&pound;' ) {
			 *          return 'currency';
			 *        }
			 *        return null;
			 *      }
			 *    );
			 */
			detect: [],
	
	
			/**
			 * Type based search formatting.
			 *
			 * The type based searching functions can be used to pre-format the
			 * data to be search on. For example, it can be used to strip HTML
			 * tags or to de-format telephone numbers for numeric only searching.
			 *
			 * Note that is a search is not defined for a column of a given type,
			 * no search formatting will be performed.
			 * 
			 * Pre-processing of searching data plug-ins - When you assign the sType
			 * for a column (or have it automatically detected for you by DataTables
			 * or a type detection plug-in), you will typically be using this for
			 * custom sorting, but it can also be used to provide custom searching
			 * by allowing you to pre-processing the data and returning the data in
			 * the format that should be searched upon. This is done by adding
			 * functions this object with a parameter name which matches the sType
			 * for that target column. This is the corollary of <i>afnSortData</i>
			 * for searching data.
			 *
			 * The functions defined take a single parameter:
			 *
		     *  1. `{*}` Data from the column cell to be prepared for searching
			 *
			 * Each function is expected to return:
			 *
			 * * `{string|null}` Formatted string that will be used for the searching.
			 *
			 *  @type object
			 *  @default {}
			 *
			 *  @example
			 *    $.fn.dataTable.ext.type.search['title-numeric'] = function ( d ) {
			 *      return d.replace(/\n/g," ").replace( /<.*?>/g, "" );
			 *    }
			 */
			search: {},
	
	
			/**
			 * Type based ordering.
			 *
			 * The column type tells DataTables what ordering to apply to the table
			 * when a column is sorted upon. The order for each type that is defined,
			 * is defined by the functions available in this object.
			 *
			 * Each ordering option can be described by three properties added to
			 * this object:
			 *
			 * * `{type}-pre` - Pre-formatting function
			 * * `{type}-asc` - Ascending order function
			 * * `{type}-desc` - Descending order function
			 *
			 * All three can be used together, only `{type}-pre` or only
			 * `{type}-asc` and `{type}-desc` together. It is generally recommended
			 * that only `{type}-pre` is used, as this provides the optimal
			 * implementation in terms of speed, although the others are provided
			 * for compatibility with existing Javascript sort functions.
			 *
			 * `{type}-pre`: Functions defined take a single parameter:
			 *
		     *  1. `{*}` Data from the column cell to be prepared for ordering
			 *
			 * And return:
			 *
			 * * `{*}` Data to be sorted upon
			 *
			 * `{type}-asc` and `{type}-desc`: Functions are typical Javascript sort
			 * functions, taking two parameters:
			 *
		     *  1. `{*}` Data to compare to the second parameter
		     *  2. `{*}` Data to compare to the first parameter
			 *
			 * And returning:
			 *
			 * * `{*}` Ordering match: <0 if first parameter should be sorted lower
			 *   than the second parameter, ===0 if the two parameters are equal and
			 *   >0 if the first parameter should be sorted height than the second
			 *   parameter.
			 * 
			 *  @type object
			 *  @default {}
			 *
			 *  @example
			 *    // Numeric ordering of formatted numbers with a pre-formatter
			 *    $.extend( $.fn.dataTable.ext.type.order, {
			 *      "string-pre": function(x) {
			 *        a = (a === "-" || a === "") ? 0 : a.replace( /[^\d\-\.]/g, "" );
			 *        return parseFloat( a );
			 *      }
			 *    } );
			 *
			 *  @example
			 *    // Case-sensitive string ordering, with no pre-formatting method
			 *    $.extend( $.fn.dataTable.ext.order, {
			 *      "string-case-asc": function(x,y) {
			 *        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
			 *      },
			 *      "string-case-desc": function(x,y) {
			 *        return ((x < y) ? 1 : ((x > y) ? -1 : 0));
			 *      }
			 *    } );
			 */
			order: {}
		},
	
		/**
		 * Unique DataTables instance counter
		 *
		 * @type int
		 * @private
		 */
		_unique: 0,
	
	
		//
		// Depreciated
		// The following properties are retained for backwards compatiblity only.
		// The should not be used in new projects and will be removed in a future
		// version
		//
	
		/**
		 * Version check function.
		 *  @type function
		 *  @depreciated Since 1.10
		 */
		fnVersionCheck: DataTable.fnVersionCheck,
	
	
		/**
		 * Index for what 'this' index API functions should use
		 *  @type int
		 *  @deprecated Since v1.10
		 */
		iApiIndex: 0,
	
	
		/**
		 * jQuery UI class container
		 *  @type object
		 *  @deprecated Since v1.10
		 */
		oJUIClasses: {},
	
	
		/**
		 * Software version
		 *  @type string
		 *  @deprecated Since v1.10
		 */
		sVersion: DataTable.version
	};
	
	
	//
	// Backwards compatibility. Alias to pre 1.10 Hungarian notation counter parts
	//
	$.extend( _ext, {
		afnFiltering: _ext.search,
		aTypes:       _ext.type.detect,
		ofnSearch:    _ext.type.search,
		oSort:        _ext.type.order,
		afnSortData:  _ext.order,
		aoFeatures:   _ext.feature,
		oApi:         _ext.internal,
		oStdClasses:  _ext.classes,
		oPagination:  _ext.pager
	} );
	
	
	$.extend( DataTable.ext.classes, {
		"sTable": "dataTable",
		"sNoFooter": "no-footer",
	
		/* Paging buttons */
		"sPageButton": "paginate_button",
		"sPageButtonActive": "current",
		"sPageButtonDisabled": "disabled",
	
		/* Striping classes */
		"sStripeOdd": "odd",
		"sStripeEven": "even",
	
		/* Empty row */
		"sRowEmpty": "dataTables_empty",
	
		/* Features */
		"sWrapper": "dataTables_wrapper",
		"sFilter": "dataTables_filter",
		"sInfo": "dataTables_info",
		"sPaging": "dataTables_paginate paging_", /* Note that the type is postfixed */
		"sLength": "dataTables_length",
		"sProcessing": "dataTables_processing",
	
		/* Sorting */
		"sSortAsc": "sorting_asc",
		"sSortDesc": "sorting_desc",
		"sSortable": "sorting", /* Sortable in both directions */
		"sSortableAsc": "sorting_asc_disabled",
		"sSortableDesc": "sorting_desc_disabled",
		"sSortableNone": "sorting_disabled",
		"sSortColumn": "sorting_", /* Note that an int is postfixed for the sorting order */
	
		/* Filtering */
		"sFilterInput": "",
	
		/* Page length */
		"sLengthSelect": "",
	
		/* Scrolling */
		"sScrollWrapper": "dataTables_scroll",
		"sScrollHead": "dataTables_scrollHead",
		"sScrollHeadInner": "dataTables_scrollHeadInner",
		"sScrollBody": "dataTables_scrollBody",
		"sScrollFoot": "dataTables_scrollFoot",
		"sScrollFootInner": "dataTables_scrollFootInner",
	
		/* Misc */
		"sHeaderTH": "",
		"sFooterTH": "",
	
		// Deprecated
		"sSortJUIAsc": "",
		"sSortJUIDesc": "",
		"sSortJUI": "",
		"sSortJUIAscAllowed": "",
		"sSortJUIDescAllowed": "",
		"sSortJUIWrapper": "",
		"sSortIcon": "",
		"sJUIHeader": "",
		"sJUIFooter": ""
	} );
	
	
	(function() {
	
	// Reused strings for better compression. Closure compiler appears to have a
	// weird edge case where it is trying to expand strings rather than use the
	// variable version. This results in about 200 bytes being added, for very
	// little preference benefit since it this run on script load only.
	var _empty = '';
	_empty = '';
	
	var _stateDefault = _empty + 'ui-state-default';
	var _sortIcon     = _empty + 'css_right ui-icon ui-icon-';
	var _headerFooter = _empty + 'fg-toolbar ui-toolbar ui-widget-header ui-helper-clearfix';
	
	$.extend( DataTable.ext.oJUIClasses, DataTable.ext.classes, {
		/* Full numbers paging buttons */
		"sPageButton":         "fg-button ui-button "+_stateDefault,
		"sPageButtonActive":   "ui-state-disabled",
		"sPageButtonDisabled": "ui-state-disabled",
	
		/* Features */
		"sPaging": "dataTables_paginate fg-buttonset ui-buttonset fg-buttonset-multi "+
			"ui-buttonset-multi paging_", /* Note that the type is postfixed */
	
		/* Sorting */
		"sSortAsc":            _stateDefault+" sorting_asc",
		"sSortDesc":           _stateDefault+" sorting_desc",
		"sSortable":           _stateDefault+" sorting",
		"sSortableAsc":        _stateDefault+" sorting_asc_disabled",
		"sSortableDesc":       _stateDefault+" sorting_desc_disabled",
		"sSortableNone":       _stateDefault+" sorting_disabled",
		"sSortJUIAsc":         _sortIcon+"triangle-1-n",
		"sSortJUIDesc":        _sortIcon+"triangle-1-s",
		"sSortJUI":            _sortIcon+"carat-2-n-s",
		"sSortJUIAscAllowed":  _sortIcon+"carat-1-n",
		"sSortJUIDescAllowed": _sortIcon+"carat-1-s",
		"sSortJUIWrapper":     "DataTables_sort_wrapper",
		"sSortIcon":           "DataTables_sort_icon",
	
		/* Scrolling */
		"sScrollHead": "dataTables_scrollHead "+_stateDefault,
		"sScrollFoot": "dataTables_scrollFoot "+_stateDefault,
	
		/* Misc */
		"sHeaderTH":  _stateDefault,
		"sFooterTH":  _stateDefault,
		"sJUIHeader": _headerFooter+" ui-corner-tl ui-corner-tr",
		"sJUIFooter": _headerFooter+" ui-corner-bl ui-corner-br"
	} );
	
	}());
	
	
	
	var extPagination = DataTable.ext.pager;
	
	function _numbers ( page, pages ) {
		var
			numbers = [],
			buttons = extPagination.numbers_length,
			half = Math.floor( buttons / 2 ),
			i = 1;
	
		if ( pages <= buttons ) {
			numbers = _range( 0, pages );
		}
		else if ( page <= half ) {
			numbers = _range( 0, buttons-2 );
			numbers.push( 'ellipsis' );
			numbers.push( pages-1 );
		}
		else if ( page >= pages - 1 - half ) {
			numbers = _range( pages-(buttons-2), pages );
			numbers.splice( 0, 0, 'ellipsis' ); // no unshift in ie6
			numbers.splice( 0, 0, 0 );
		}
		else {
			numbers = _range( page-1, page+2 );
			numbers.push( 'ellipsis' );
			numbers.push( pages-1 );
			numbers.splice( 0, 0, 'ellipsis' );
			numbers.splice( 0, 0, 0 );
		}
	
		numbers.DT_el = 'span';
		return numbers;
	}
	
	
	$.extend( extPagination, {
		simple: function ( page, pages ) {
			return [ 'previous', 'next' ];
		},
	
		full: function ( page, pages ) {
			return [  'first', 'previous', 'next', 'last' ];
		},
	
		simple_numbers: function ( page, pages ) {
			return [ 'previous', _numbers(page, pages), 'next' ];
		},
	
		full_numbers: function ( page, pages ) {
			return [ 'first', 'previous', _numbers(page, pages), 'next', 'last' ];
		},
	
		// For testing and plug-ins to use
		_numbers: _numbers,
		numbers_length: 7
	} );
	
	
	$.extend( true, DataTable.ext.renderer, {
		pageButton: {
			_: function ( settings, host, idx, buttons, page, pages ) {
				var classes = settings.oClasses;
				var lang = settings.oLanguage.oPaginate;
				var btnDisplay, btnClass, counter=0;
	
				var attach = function( container, buttons ) {
					var i, ien, node, button;
					var clickHandler = function ( e ) {
						_fnPageChange( settings, e.data.action, true );
					};
	
					for ( i=0, ien=buttons.length ; i<ien ; i++ ) {
						button = buttons[i];
	
						if ( $.isArray( button ) ) {
							var inner = $( '<'+(button.DT_el || 'div')+'/>' )
								.appendTo( container );
							attach( inner, button );
						}
						else {
							btnDisplay = '';
							btnClass = '';
	
							switch ( button ) {
								case 'ellipsis':
									container.append('<span>&hellip;</span>');
									break;
	
								case 'first':
									btnDisplay = lang.sFirst;
									btnClass = button + (page > 0 ?
										'' : ' '+classes.sPageButtonDisabled);
									break;
	
								case 'previous':
									btnDisplay = lang.sPrevious;
									btnClass = button + (page > 0 ?
										'' : ' '+classes.sPageButtonDisabled);
									break;
	
								case 'next':
									btnDisplay = lang.sNext;
									btnClass = button + (page < pages-1 ?
										'' : ' '+classes.sPageButtonDisabled);
									break;
	
								case 'last':
									btnDisplay = lang.sLast;
									btnClass = button + (page < pages-1 ?
										'' : ' '+classes.sPageButtonDisabled);
									break;
	
								default:
									btnDisplay = button + 1;
									btnClass = page === button ?
										classes.sPageButtonActive : '';
									break;
							}
	
							if ( btnDisplay ) {
								node = $('<a>', {
										'class': classes.sPageButton+' '+btnClass,
										'aria-controls': settings.sTableId,
										'data-dt-idx': counter,
										'tabindex': settings.iTabIndex,
										'id': idx === 0 && typeof button === 'string' ?
											settings.sTableId +'_'+ button :
											null
									} )
									.html( btnDisplay )
									.appendTo( container );
	
								_fnBindAction(
									node, {action: button}, clickHandler
								);
	
								counter++;
							}
						}
					}
				};
	
				// IE9 throws an 'unknown error' if document.activeElement is used
				// inside an iframe or frame. Try / catch the error. Not good for
				// accessibility, but neither are frames.
				var activeEl;
	
				try {
					// Because this approach is destroying and recreating the paging
					// elements, focus is lost on the select button which is bad for
					// accessibility. So we want to restore focus once the draw has
					// completed
					activeEl = $(document.activeElement).data('dt-idx');
				}
				catch (e) {}
	
				attach( $(host).empty(), buttons );
	
				if ( activeEl ) {
					$(host).find( '[data-dt-idx='+activeEl+']' ).focus();
				}
			}
		}
	} );
	
	
	
	// Built in type detection. See model.ext.aTypes for information about
	// what is required from this methods.
	$.extend( DataTable.ext.type.detect, [
		// Plain numbers - first since V8 detects some plain numbers as dates
		// e.g. Date.parse('55') (but not all, e.g. Date.parse('22')...).
		function ( d, settings )
		{
			var decimal = settings.oLanguage.sDecimal;
			return _isNumber( d, decimal ) ? 'num'+decimal : null;
		},
	
		// Dates (only those recognised by the browser's Date.parse)
		function ( d, settings )
		{
			// V8 will remove any unknown characters at the start and end of the
			// expression, leading to false matches such as `$245.12` or `10%` being
			// a valid date. See forum thread 18941 for detail.
			if ( d && !(d instanceof Date) && ( ! _re_date_start.test(d) || ! _re_date_end.test(d) ) ) {
				return null;
			}
			var parsed = Date.parse(d);
			return (parsed !== null && !isNaN(parsed)) || _empty(d) ? 'date' : null;
		},
	
		// Formatted numbers
		function ( d, settings )
		{
			var decimal = settings.oLanguage.sDecimal;
			return _isNumber( d, decimal, true ) ? 'num-fmt'+decimal : null;
		},
	
		// HTML numeric
		function ( d, settings )
		{
			var decimal = settings.oLanguage.sDecimal;
			return _htmlNumeric( d, decimal ) ? 'html-num'+decimal : null;
		},
	
		// HTML numeric, formatted
		function ( d, settings )
		{
			var decimal = settings.oLanguage.sDecimal;
			return _htmlNumeric( d, decimal, true ) ? 'html-num-fmt'+decimal : null;
		},
	
		// HTML (this is strict checking - there must be html)
		function ( d, settings )
		{
			return _empty( d ) || (typeof d === 'string' && d.indexOf('<') !== -1) ?
				'html' : null;
		}
	] );
	
	
	
	// Filter formatting functions. See model.ext.ofnSearch for information about
	// what is required from these methods.
	// 
	// Note that additional search methods are added for the html numbers and
	// html formatted numbers by `_addNumericSort()` when we know what the decimal
	// place is
	
	
	$.extend( DataTable.ext.type.search, {
		html: function ( data ) {
			return _empty(data) ?
				data :
				typeof data === 'string' ?
					data
						.replace( _re_new_lines, " " )
						.replace( _re_html, "" ) :
					'';
		},
	
		string: function ( data ) {
			return _empty(data) ?
				data :
				typeof data === 'string' ?
					data.replace( _re_new_lines, " " ) :
					data;
		}
	} );
	
	
	
	var __numericReplace = function ( d, decimalPlace, re1, re2 ) {
		if ( d !== 0 && (!d || d === '-') ) {
			return -Infinity;
		}
	
		// If a decimal place other than `.` is used, it needs to be given to the
		// function so we can detect it and replace with a `.` which is the only
		// decimal place Javascript recognises - it is not locale aware.
		if ( decimalPlace ) {
			d = _numToDecimal( d, decimalPlace );
		}
	
		if ( d.replace ) {
			if ( re1 ) {
				d = d.replace( re1, '' );
			}
	
			if ( re2 ) {
				d = d.replace( re2, '' );
			}
		}
	
		return d * 1;
	};
	
	
	// Add the numeric 'deformatting' functions for sorting and search. This is done
	// in a function to provide an easy ability for the language options to add
	// additional methods if a non-period decimal place is used.
	function _addNumericSort ( decimalPlace ) {
		$.each(
			{
				// Plain numbers
				"num": function ( d ) {
					return __numericReplace( d, decimalPlace );
				},
	
				// Formatted numbers
				"num-fmt": function ( d ) {
					return __numericReplace( d, decimalPlace, _re_formatted_numeric );
				},
	
				// HTML numeric
				"html-num": function ( d ) {
					return __numericReplace( d, decimalPlace, _re_html );
				},
	
				// HTML numeric, formatted
				"html-num-fmt": function ( d ) {
					return __numericReplace( d, decimalPlace, _re_html, _re_formatted_numeric );
				}
			},
			function ( key, fn ) {
				// Add the ordering method
				_ext.type.order[ key+decimalPlace+'-pre' ] = fn;
	
				// For HTML types add a search formatter that will strip the HTML
				if ( key.match(/^html\-/) ) {
					_ext.type.search[ key+decimalPlace ] = _ext.type.search.html;
				}
			}
		);
	}
	
	
	// Default sort methods
	$.extend( _ext.type.order, {
		// Dates
		"date-pre": function ( d ) {
			return Date.parse( d ) || 0;
		},
	
		// html
		"html-pre": function ( a ) {
			return _empty(a) ?
				'' :
				a.replace ?
					a.replace( /<.*?>/g, "" ).toLowerCase() :
					a+'';
		},
	
		// string
		"string-pre": function ( a ) {
			// This is a little complex, but faster than always calling toString,
			// http://jsperf.com/tostring-v-check
			return _empty(a) ?
				'' :
				typeof a === 'string' ?
					a.toLowerCase() :
					! a.toString ?
						'' :
						a.toString();
		},
	
		// string-asc and -desc are retained only for compatibility with the old
		// sort methods
		"string-asc": function ( x, y ) {
			return ((x < y) ? -1 : ((x > y) ? 1 : 0));
		},
	
		"string-desc": function ( x, y ) {
			return ((x < y) ? 1 : ((x > y) ? -1 : 0));
		}
	} );
	
	
	// Numeric sorting types - order doesn't matter here
	_addNumericSort( '' );
	
	
	$.extend( true, DataTable.ext.renderer, {
		header: {
			_: function ( settings, cell, column, classes ) {
				// No additional mark-up required
				// Attach a sort listener to update on sort - note that using the
				// `DT` namespace will allow the event to be removed automatically
				// on destroy, while the `dt` namespaced event is the one we are
				// listening for
				$(settings.nTable).on( 'order.dt.DT', function ( e, ctx, sorting, columns ) {
					if ( settings !== ctx ) { // need to check this this is the host
						return;               // table, not a nested one
					}
	
					var colIdx = column.idx;
	
					cell
						.removeClass(
							column.sSortingClass +' '+
							classes.sSortAsc +' '+
							classes.sSortDesc
						)
						.addClass( columns[ colIdx ] == 'asc' ?
							classes.sSortAsc : columns[ colIdx ] == 'desc' ?
								classes.sSortDesc :
								column.sSortingClass
						);
				} );
			},
	
			jqueryui: function ( settings, cell, column, classes ) {
				$('<div/>')
					.addClass( classes.sSortJUIWrapper )
					.append( cell.contents() )
					.append( $('<span/>')
						.addClass( classes.sSortIcon+' '+column.sSortingClassJUI )
					)
					.appendTo( cell );
	
				// Attach a sort listener to update on sort
				$(settings.nTable).on( 'order.dt.DT', function ( e, ctx, sorting, columns ) {
					if ( settings !== ctx ) {
						return;
					}
	
					var colIdx = column.idx;
	
					cell
						.removeClass( classes.sSortAsc +" "+classes.sSortDesc )
						.addClass( columns[ colIdx ] == 'asc' ?
							classes.sSortAsc : columns[ colIdx ] == 'desc' ?
								classes.sSortDesc :
								column.sSortingClass
						);
	
					cell
						.find( 'span.'+classes.sSortIcon )
						.removeClass(
							classes.sSortJUIAsc +" "+
							classes.sSortJUIDesc +" "+
							classes.sSortJUI +" "+
							classes.sSortJUIAscAllowed +" "+
							classes.sSortJUIDescAllowed
						)
						.addClass( columns[ colIdx ] == 'asc' ?
							classes.sSortJUIAsc : columns[ colIdx ] == 'desc' ?
								classes.sSortJUIDesc :
								column.sSortingClassJUI
						);
				} );
			}
		}
	} );
	
	/*
	 * Public helper functions. These aren't used internally by DataTables, or
	 * called by any of the options passed into DataTables, but they can be used
	 * externally by developers working with DataTables. They are helper functions
	 * to make working with DataTables a little bit easier.
	 */
	
	/**
	 * Helpers for `columns.render`.
	 *
	 * The options defined here can be used with the `columns.render` initialisation
	 * option to provide a display renderer. The following functions are defined:
	 *
	 * * `number` - Will format numeric data (defined by `columns.data`) for
	 *   display, retaining the original unformatted data for sorting and filtering.
	 *   It takes 4 parameters:
	 *   * `string` - Thousands grouping separator
	 *   * `string` - Decimal point indicator
	 *   * `integer` - Number of decimal points to show
	 *   * `string` (optional) - Prefix.
	 *
	 * @example
	 *   // Column definition using the number renderer
	 *   {
	 *     data: "salary",
	 *     render: $.fn.dataTable.render.number( '\'', '.', 0, '$' )
	 *   }
	 *
	 * @namespace
	 */
	DataTable.render = {
		number: function ( thousands, decimal, precision, prefix ) {
			return {
				display: function ( d ) {
					var negative = d < 0 ? '-' : '';
					d = Math.abs( parseFloat( d ) );
	
					var intPart = parseInt( d, 10 );
					var floatPart = precision ?
						decimal+(d - intPart).toFixed( precision ).substring( 2 ):
						'';
	
					return negative + (prefix||'') +
						intPart.toString().replace(
							/\B(?=(\d{3})+(?!\d))/g, thousands
						) +
						floatPart;
				}
			};
		}
	};
	
	
	/*
	 * This is really a good bit rubbish this method of exposing the internal methods
	 * publicly... - To be fixed in 2.0 using methods on the prototype
	 */
	
	
	/**
	 * Create a wrapper function for exporting an internal functions to an external API.
	 *  @param {string} fn API function name
	 *  @returns {function} wrapped function
	 *  @memberof DataTable#internal
	 */
	function _fnExternApiFunc (fn)
	{
		return function() {
			var args = [_fnSettingsFromNode( this[DataTable.ext.iApiIndex] )].concat(
				Array.prototype.slice.call(arguments)
			);
			return DataTable.ext.internal[fn].apply( this, args );
		};
	}
	
	
	/**
	 * Reference to internal functions for use by plug-in developers. Note that
	 * these methods are references to internal functions and are considered to be
	 * private. If you use these methods, be aware that they are liable to change
	 * between versions.
	 *  @namespace
	 */
	$.extend( DataTable.ext.internal, {
		_fnExternApiFunc: _fnExternApiFunc,
		_fnBuildAjax: _fnBuildAjax,
		_fnAjaxUpdate: _fnAjaxUpdate,
		_fnAjaxParameters: _fnAjaxParameters,
		_fnAjaxUpdateDraw: _fnAjaxUpdateDraw,
		_fnAjaxDataSrc: _fnAjaxDataSrc,
		_fnAddColumn: _fnAddColumn,
		_fnColumnOptions: _fnColumnOptions,
		_fnAdjustColumnSizing: _fnAdjustColumnSizing,
		_fnVisibleToColumnIndex: _fnVisibleToColumnIndex,
		_fnColumnIndexToVisible: _fnColumnIndexToVisible,
		_fnVisbleColumns: _fnVisbleColumns,
		_fnGetColumns: _fnGetColumns,
		_fnColumnTypes: _fnColumnTypes,
		_fnApplyColumnDefs: _fnApplyColumnDefs,
		_fnHungarianMap: _fnHungarianMap,
		_fnCamelToHungarian: _fnCamelToHungarian,
		_fnLanguageCompat: _fnLanguageCompat,
		_fnBrowserDetect: _fnBrowserDetect,
		_fnAddData: _fnAddData,
		_fnAddTr: _fnAddTr,
		_fnNodeToDataIndex: _fnNodeToDataIndex,
		_fnNodeToColumnIndex: _fnNodeToColumnIndex,
		_fnGetCellData: _fnGetCellData,
		_fnSetCellData: _fnSetCellData,
		_fnSplitObjNotation: _fnSplitObjNotation,
		_fnGetObjectDataFn: _fnGetObjectDataFn,
		_fnSetObjectDataFn: _fnSetObjectDataFn,
		_fnGetDataMaster: _fnGetDataMaster,
		_fnClearTable: _fnClearTable,
		_fnDeleteIndex: _fnDeleteIndex,
		_fnInvalidate: _fnInvalidate,
		_fnGetRowElements: _fnGetRowElements,
		_fnCreateTr: _fnCreateTr,
		_fnBuildHead: _fnBuildHead,
		_fnDrawHead: _fnDrawHead,
		_fnDraw: _fnDraw,
		_fnReDraw: _fnReDraw,
		_fnAddOptionsHtml: _fnAddOptionsHtml,
		_fnDetectHeader: _fnDetectHeader,
		_fnGetUniqueThs: _fnGetUniqueThs,
		_fnFeatureHtmlFilter: _fnFeatureHtmlFilter,
		_fnFilterComplete: _fnFilterComplete,
		_fnFilterCustom: _fnFilterCustom,
		_fnFilterColumn: _fnFilterColumn,
		_fnFilter: _fnFilter,
		_fnFilterCreateSearch: _fnFilterCreateSearch,
		_fnEscapeRegex: _fnEscapeRegex,
		_fnFilterData: _fnFilterData,
		_fnFeatureHtmlInfo: _fnFeatureHtmlInfo,
		_fnUpdateInfo: _fnUpdateInfo,
		_fnInfoMacros: _fnInfoMacros,
		_fnInitialise: _fnInitialise,
		_fnInitComplete: _fnInitComplete,
		_fnLengthChange: _fnLengthChange,
		_fnFeatureHtmlLength: _fnFeatureHtmlLength,
		_fnFeatureHtmlPaginate: _fnFeatureHtmlPaginate,
		_fnPageChange: _fnPageChange,
		_fnFeatureHtmlProcessing: _fnFeatureHtmlProcessing,
		_fnProcessingDisplay: _fnProcessingDisplay,
		_fnFeatureHtmlTable: _fnFeatureHtmlTable,
		_fnScrollDraw: _fnScrollDraw,
		_fnApplyToChildren: _fnApplyToChildren,
		_fnCalculateColumnWidths: _fnCalculateColumnWidths,
		_fnThrottle: _fnThrottle,
		_fnConvertToWidth: _fnConvertToWidth,
		_fnScrollingWidthAdjust: _fnScrollingWidthAdjust,
		_fnGetWidestNode: _fnGetWidestNode,
		_fnGetMaxLenString: _fnGetMaxLenString,
		_fnStringToCss: _fnStringToCss,
		_fnScrollBarWidth: _fnScrollBarWidth,
		_fnSortFlatten: _fnSortFlatten,
		_fnSort: _fnSort,
		_fnSortAria: _fnSortAria,
		_fnSortListener: _fnSortListener,
		_fnSortAttachListener: _fnSortAttachListener,
		_fnSortingClasses: _fnSortingClasses,
		_fnSortData: _fnSortData,
		_fnSaveState: _fnSaveState,
		_fnLoadState: _fnLoadState,
		_fnSettingsFromNode: _fnSettingsFromNode,
		_fnLog: _fnLog,
		_fnMap: _fnMap,
		_fnBindAction: _fnBindAction,
		_fnCallbackReg: _fnCallbackReg,
		_fnCallbackFire: _fnCallbackFire,
		_fnLengthOverflow: _fnLengthOverflow,
		_fnRenderer: _fnRenderer,
		_fnDataSource: _fnDataSource,
		_fnRowAttributes: _fnRowAttributes,
		_fnCalculateEnd: function () {} // Used by a lot of plug-ins, but redundant
		                                // in 1.10, so this dead-end function is
		                                // added to prevent errors
	} );
	

	// jQuery access
	$.fn.dataTable = DataTable;

	// Legacy aliases
	$.fn.dataTableSettings = DataTable.settings;
	$.fn.dataTableExt = DataTable.ext;

	// With a capital `D` we return a DataTables API instance rather than a
	// jQuery object
	$.fn.DataTable = function ( opts ) {
		return $(this).dataTable( opts ).api();
	};

	// All properties that are available to $.fn.dataTable should also be
	// available on $.fn.DataTable
	$.each( DataTable, function ( prop, val ) {
		$.fn.DataTable[ prop ] = val;
	} );


	// Information about events fired by DataTables - for documentation.
	/**
	 * Draw event, fired whenever the table is redrawn on the page, at the same
	 * point as fnDrawCallback. This may be useful for binding events or
	 * performing calculations when the table is altered at all.
	 *  @name DataTable#draw.dt
	 *  @event
	 *  @param {event} e jQuery event object
	 *  @param {object} o DataTables settings object {@link DataTable.models.oSettings}
	 */

	/**
	 * Search event, fired when the searching applied to the table (using the
	 * built-in global search, or column filters) is altered.
	 *  @name DataTable#search.dt
	 *  @event
	 *  @param {event} e jQuery event object
	 *  @param {object} o DataTables settings object {@link DataTable.models.oSettings}
	 */

	/**
	 * Page change event, fired when the paging of the table is altered.
	 *  @name DataTable#page.dt
	 *  @event
	 *  @param {event} e jQuery event object
	 *  @param {object} o DataTables settings object {@link DataTable.models.oSettings}
	 */

	/**
	 * Order event, fired when the ordering applied to the table is altered.
	 *  @name DataTable#order.dt
	 *  @event
	 *  @param {event} e jQuery event object
	 *  @param {object} o DataTables settings object {@link DataTable.models.oSettings}
	 */

	/**
	 * DataTables initialisation complete event, fired when the table is fully
	 * drawn, including Ajax data loaded, if Ajax data is required.
	 *  @name DataTable#init.dt
	 *  @event
	 *  @param {event} e jQuery event object
	 *  @param {object} oSettings DataTables settings object
	 *  @param {object} json The JSON object request from the server - only
	 *    present if client-side Ajax sourced data is used</li></ol>
	 */

	/**
	 * State save event, fired when the table has changed state a new state save
	 * is required. This event allows modification of the state saving object
	 * prior to actually doing the save, including addition or other state
	 * properties (for plug-ins) or modification of a DataTables core property.
	 *  @name DataTable#stateSaveParams.dt
	 *  @event
	 *  @param {event} e jQuery event object
	 *  @param {object} oSettings DataTables settings object
	 *  @param {object} json The state information to be saved
	 */

	/**
	 * State load event, fired when the table is loading state from the stored
	 * data, but prior to the settings object being modified by the saved state
	 * - allowing modification of the saved state is required or loading of
	 * state for a plug-in.
	 *  @name DataTable#stateLoadParams.dt
	 *  @event
	 *  @param {event} e jQuery event object
	 *  @param {object} oSettings DataTables settings object
	 *  @param {object} json The saved state information
	 */

	/**
	 * State loaded event, fired when state has been loaded from stored data and
	 * the settings object has been modified by the loaded data.
	 *  @name DataTable#stateLoaded.dt
	 *  @event
	 *  @param {event} e jQuery event object
	 *  @param {object} oSettings DataTables settings object
	 *  @param {object} json The saved state information
	 */

	/**
	 * Processing event, fired when DataTables is doing some kind of processing
	 * (be it, order, searcg or anything else). It can be used to indicate to
	 * the end user that there is something happening, or that something has
	 * finished.
	 *  @name DataTable#processing.dt
	 *  @event
	 *  @param {event} e jQuery event object
	 *  @param {object} oSettings DataTables settings object
	 *  @param {boolean} bShow Flag for if DataTables is doing processing or not
	 */

	/**
	 * Ajax (XHR) event, fired whenever an Ajax request is completed from a
	 * request to made to the server for new data. This event is called before
	 * DataTables processed the returned data, so it can also be used to pre-
	 * process the data returned from the server, if needed.
	 *
	 * Note that this trigger is called in `fnServerData`, if you override
	 * `fnServerData` and which to use this event, you need to trigger it in you
	 * success function.
	 *  @name DataTable#xhr.dt
	 *  @event
	 *  @param {event} e jQuery event object
	 *  @param {object} o DataTables settings object {@link DataTable.models.oSettings}
	 *  @param {object} json JSON returned from the server
	 *
	 *  @example
	 *     // Use a custom property returned from the server in another DOM element
	 *     $('#table').dataTable().on('xhr.dt', function (e, settings, json) {
	 *       $('#status').html( json.status );
	 *     } );
	 *
	 *  @example
	 *     // Pre-process the data returned from the server
	 *     $('#table').dataTable().on('xhr.dt', function (e, settings, json) {
	 *       for ( var i=0, ien=json.aaData.length ; i<ien ; i++ ) {
	 *         json.aaData[i].sum = json.aaData[i].one + json.aaData[i].two;
	 *       }
	 *       // Note no return - manipulate the data directly in the JSON object.
	 *     } );
	 */

	/**
	 * Destroy event, fired when the DataTable is destroyed by calling fnDestroy
	 * or passing the bDestroy:true parameter in the initialisation object. This
	 * can be used to remove bound events, added DOM nodes, etc.
	 *  @name DataTable#destroy.dt
	 *  @event
	 *  @param {event} e jQuery event object
	 *  @param {object} o DataTables settings object {@link DataTable.models.oSettings}
	 */

	/**
	 * Page length change event, fired when number of records to show on each
	 * page (the length) is changed.
	 *  @name DataTable#length.dt
	 *  @event
	 *  @param {event} e jQuery event object
	 *  @param {object} o DataTables settings object {@link DataTable.models.oSettings}
	 *  @param {integer} len New length
	 */

	/**
	 * Column sizing has changed.
	 *  @name DataTable#column-sizing.dt
	 *  @event
	 *  @param {event} e jQuery event object
	 *  @param {object} o DataTables settings object {@link DataTable.models.oSettings}
	 */

	/**
	 * Column visibility has changed.
	 *  @name DataTable#column-visibility.dt
	 *  @event
	 *  @param {event} e jQuery event object
	 *  @param {object} o DataTables settings object {@link DataTable.models.oSettings}
	 *  @param {int} column Column index
	 *  @param {bool} vis `false` if column now hidden, or `true` if visible
	 */

	return $.fn.dataTable;
}));

}(window, document));

