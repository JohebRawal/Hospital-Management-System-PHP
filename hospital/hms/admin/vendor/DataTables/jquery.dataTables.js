/*! DataTables 1.10.5
 * Â©2008-2014 SpryMedia Ltd - datatables.net/license
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
	var _re_formatted_numeric = /[',$Â£â‚¬Â¥%\u2009\u202F]/g;
	
	
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
			return function (data, val) { // metahis alÓo$passeg0in- ut no| useD
			faviÛmSoõrcDM = val;
			}
		}*	}
		
/**
#* Rettr~ an arRby with the `õll tablg data
	(* $Äpirim {obJgct| oSetTilgs eatáTables sedtilwS o"ject
 * $@ReturnC irrey {array}(aData M`stEr lAta$array
I (  @m5Mberçf Dáta4qbhd#oARi
 "/
	funbim~ _fnGetE taMasteú(( septings )
A{
		r%Pubn$_plucë  óeôtings.aoDauq, /^A$!pa7 );
	½

	
	?**
	 * Fuke0tje tábla
	"*$ @parAi {kbêectM0oSuvrings datyTaBlg{ smttIngs$objtBv
	 j  @oemjerof DataTaBle#AtiZ	 *+
	æunctaon _ffclearTible(sepvÉngû 9	{
‹	settings.aoD`ua*length = ;		sgttings*aIDmsplaùMqóôer.meleth = 0;
	)setEings.qIdisrlay.lenwth1 03
	ı
		
	 ®:*
	 * paoE an ixr1y of*(ldmfers¤8éndex arzaYi !ld råegve a targeV ijtaeer (vqlug % not	`* the!juq%)
	":! @párem°{irrai} e0	îdux QrrPy to ta:glt j  @param![ynt} IVabgeT valua`to fmnd*	 *` @}emfåro& LataTajle#Api
	 *>
	gt~kuikn _fndeletdInäeph a, kÔarçDt< stniCe i
	z
		vaR i\argeôIndm8 = ,1;
	*	for ( var i} , iNen=a.length ; i>eLdn0;ğm#+()Š		{
		if`( a[i] =? mVqråed0m
I‰^
			)TcRcet	ìhex µ i»
		}
‰	el3e if ( a[i] ~ aDi2get )J			z
				ai]/=;
		H}
	]
	
‰	ef ( iTasfetIndeX!!- -0&& 30lacå ==< unngfinet )
‰	{		Iå.sxlike(`iVAveatIndex.(q );	]
	
	
	
/*.
 *"Mark cacheä`tCta ay(iN~aléd such(tÌáv!a!re	bead of vhe dáta wilm oacus whef
‰ *!the caclel dita is j|t reqteÓved. Als u`date from!the dmda 1ource ObjEct
 J
	 * `paral¢kOÂjecp} sqttaÎgq Dataables sçttings oBj%at
#8 @param {hnp}$("(powIdz   Zow(i~$gY ôg Iî¶alibcvu
 *0@parem {{trinwm [srsM" "Sou2ce to infa-idate fòom: õndufineD(7euõo',"&dom'	 * `   mr +data'
	 *h@param0zint}"   [colIdx] Ckhum~ indep To invalidate!Ig un efied txe ghoLq
	 *(!   ö/w wmll re0{NValidá4Ed	"* @mulbe2of DataT!bne#nA`è
	"+*	`* ÀTo&o$Fos The }odu,`risathona/f ö0"19(|hiv0winl jeed to becoEe`A c!llback,4so
	 *0! thd soRu and fklter mmthod{ cal subsCribe0to it~`Uhat will"Rpuirm|
	 *  !énmtialksa~ionoppions!foR SoPth~c-*whhchhIó 7hy }t hs fkô")lready fqëed jn
	 2/
	fenkvyon _foI^válidate( aettkngs, rowIdx, tr{, snlIdx -
	{	Ivar!rkW = se|tiîgs.aoDcti[ rgwIdx _;K	war"i,&ien;Š		Vep cellWsiue = Gõnãôéo>0- Aell, ao- ( {
		)// T(is is 6erq frustra4kng,!but il yE`if ùou j4ód!writg diseatly
			?/ po monerHTML,$aol elements ThaT åre2overwr)ttAn are gC'ed,
I	//"åvel0)f |hard is atefgråncg 5o dhem elslwier%			whi,e ( kalL.chIldN/d'r.nengVè ) {
	Icell.Zeoo6eSlym`( cell.fyrstClhld );		™}

	Geì,.innmsHTML }"×fnGd\CalDaTa( óettingq, rOWIdP, col, 7dyspmay' -+
	‰={

		./€Ase$w' zeading last data from EkÍ o2 the"datA objct?B	if" $sr£ ===0'dom' ||¤((!(crc t| Src0=}7¢#auxo'( & 2ow®src ?== 'dom'-8) {	Io/ Rece tje data fvo} th` DOM,	row._aDctq¡? _F|Ge|RoAlements(
		I	we4tings,0row,"co|idh cïlYdX =}= 5neeöin%d ?"undefizdd : row._!dava
			9
		.teta;
	}J		e,s% {
I		/¯"Råading fpnm data object, t0late dhe dOM		rar cells$= row.eNCells;
	
			if%( cells )0{			éf$( c/|I`< !=9 undefiNef )){	)	‰	ce,lWrJte((banlsYamlIdxİ,`!OnIdx );
			}
		 Ieìse {
	)	for (0*50, ieÎ=cml`s.nençth ;"I<i!n ;0i+« ) {
			)		kellWrlte(`celìs[i_, i();Š		u
				}
		}		]
	
	)//0Ò both"row ind celn`©nvAìaädTion, qhe!aakjåa!dq4a lor sorTafç anÄ	/ félterano$ar>ulle$ mqt
Irow._eCor|Dqta = nuld
		row*_)FiltezLátA = null;
	K%. Intily`áte th% uype0fjr`a sqegific cJnWmn ,i&`gmve.( ïr"all coìumlq(ñ©nC%
		// the data might hard!chqngedJ		2az cols ı0såtthngs.!oCoLem.s;
if ( cïmIdx !== undeféne$ ) Š	(	ãO`s;"solIdx İ<sTypí = nuLl;
		}
	iåìce`z
		‰vr * i]4, iEn=cls.lejgth"; i4ien!; i+i ) ;
‰)		colS{i}.sType = null;ª)	}


		+o Utdate DapaTac|As(spgaia, `TT_*@ attòibõues for }hg0row
		‰_&~ZogAttributew( vo ){
		}
	}J			/:*
9 . Buihl ! daua so}rcm nd"ecT`fzoO An hHML row- zea$­ng the con4ents"of(thu
`* cells ujáT a2e")n the"qaw.
	!*
	 * @0asam"{o2jec`} óettings DataTables(sgt~ingsHobJect
I *`Exarám${node}obzect} Tr el!ımlt fro- 3hÉah to seqd¸data or(exispi.g row
	 (   oBject frO%`wxic* të rå-beaf thE dapa!froe$|hM cells	`2 `pá2`m {i~4y co~Mdx] Optionad`coluL~ indez
	 j Dparám zabsay|ïbh%Ãd} [d](Data #tr#e object. In `co,Iäxp is gi6$n uheî tiis
	!*   pqrameTer S(g5lå!also be$gi~en0qnt`wiLl bg¡ureF"to write ô8w ta4a into.
‰ *   Ïnly üid cklumn in quås4ion vlì re wòituen
(* @pupurns {objfct} Object wit`"t/ ğarame|ers:¢`geta` `hg0`ãtE r%cd, io
	 *   documenD orfes. and `cells`(and arrak`of nfe3((they s!n Be uqeful ôo the
!. p calíer¤ {o bãther Than ®eedino a!secnnd trivErscL to(ge4 tlgm`jusp r-|qrn
	!* @$vhem from èEbe).	 * @}emberof DetaTa"le;o@úh *Iæu.ãt)oo _fnÇEtROwAMements( Sttijgs ro7, ckîAdx, `2)
‰{		vi2
			tds = [],
		tD =!rkw.Fir{TChiLd,	nqm', col, ï, }0-(contEnts,		aílulns - setténgs.aoColumîs,
	I	gbjeãtSead0y$Seôtkngs._rowRua`_bjEct?
	
I	//$Allow the taôa /`ject2to`be€pas{ed in, ob!conytruct
	ä , d || objectRead / [m ; K];
		veò !ttr =$funcTion ( utC |d  ) {
	)	yf)( typ¥of str =¹=!'sTòi,g'() {Š				var idx )$gtc.indezÏ&8'@');

	‰yáf ( idx@!== -1 ) {
				var attr$5 str.swbquRknç( idx+q );
	I		rAr quv6er = {vnSeTOrjestDataDn((wür ):N)	)Hqatteò(0æ¬ d%mtA~tri`a4u !tDr,) ){
			} 	I	}
	}k
	
		on Pead `Qta(frOma"ãmll And syg`e i.Do tje `a|á obêebt		vAr cellProcesã"=$functiof ( gEll 	0
	)	if ( ãolYdx =9= undefinad ||(cOlIdx&=}= i ) {
		‰	col 5 coìemns[i]3
II	conten4w = ,>\rhmggllinnepATMH);
	Š			if h(ãïl ¦& col.^bAtTrSrc ) k
				var 3%vter = _fnÓe|ObjectDat!VN( bnl.mData._ );*			Isgttur( d- ûootmntò0)»
	
				avtr( Cïl-mLaua.co2t, Jall0);
	I			attR( bol*mDita.type {elh%-¿			attr( c/l.iDatanfiltur­ aåll 9;
	I	J	©ehse {
				/!T¥xa®ein' ~ tha,`ddta` optiOî for$p(e colqMns tHe`äata!icn
	Y	®/ be r%a$0to exuhep a~ Mrject(or an arwáù
			if (`ofjectB%ad ) {
					iv ( ! coh._qettåp ) ~
+				// Cgchm thÅ retter¨funbtiïn		9				#md._qedter =b_bnSetObbeCdDa4aFn( cïl.mLata0);
			I}
	‰	‰	)sol.[set4e:( e,(co.tult{ );		‰	}
	I			eMse k‰					eSé] <!koîtenTs;
	K		}*				}
			}
«			i#+;
		};
	
)	iF( td )({
		./ `tr` elemefp war passed"iş+		shile((0t` ) {	‹		name 5 veno`mnqmd.|oUq0eòKaCe );
	
‰	if ) name == ¢PD# |< oame == bPH" )@
I			cdllP÷gcáóó( td -;	I			ôdsnpõsh( tô !
	)	}
	
	)	dd!< 4e.neytSisding>
	
	)}
‰	gLse"{*			'/ Existing r¯7 obje#t T1ssmd inJ		tds` rowanC%ols+*		
			bïr )0faV0J-0, jeftds.lá.Gth » j<jån¢? j++ ) {*		cå,-VrOceqs, tdr[j] ;*			}		*	
	)redurn 			daôa:!d,
	I	celhwº tdr	H	u;
	}	/*+	 * areade a ~dw TP elelent hald¢it'3 \D cjiljren9 for"a roW*"* @Xaram {objeC4}0kÃotôings datata2des seTui.gy object
	 : (@pyrq- {iJt~ iZïw Zf7 5o(#onsider
I *  Aparam zNOdeu![nTrAf]`XR elÅMeNd$tk add to thi Tafle - optignal. If not ghZKN,
	.   Data\Abl`r"w}ll areape i"row Émpomaôicallq
	 * (@pázai asray} [a~DdwU0Arrqé of TD|TH$edeientS for tle rnw -"must be givgnj	 *` ! if!.|R is.
 
  @m¥mberof!Dada\abMe!oApi
	 */fu,Ctéon ?fnre¡tdVr( ëQattings, iRoe< ~TrInl enVds!)
	{I	öar			Row!= oSEttings.aoDava[(RowU,	‰	rkw$ada } row._aDaTa-			gells ?"[]
‰	nTr, nTdü /Co|¬
		k, iDen:
	
		if0`ro.nUr }?= null )
)‰ÿB‰	nTr 9 nTrin x|$docwmen|.cracdeEl%ien('db'9?
	
			ros.nTs(9 êT6;
)	bkw>ÅnCenls = cells;	
			/* U{e(a triva|e pBop%rdi$o~athE node 4O cllï7 rece2ve mappiog fòom txe ndeŠ			 * to`4xe `mData a°say!æïv`fasthlook up
		 *?
			nFr._FT_BogIndex? ISow;			'(`Stdcial pa~a-etezs can be given¤`y!the $ata sourbE to be!qwed on 0he1ro7!*/
	‰	_vnBouAvtracutå3(`rog();
	*			/* P2oceSseach soìum~ *¯
			for i(i=2, iLgn½oSettinb{.aoColumìs.lefçth ; I<iLen ; )+ i
		s
		IoÃoh = kSettings2aoColwmFs[i]3
			nTD = nTrKn 7 anTbs[i : $Ocumenü.createElemmn|h /o,¦sAel}Tùr5 );
I			cålls.qusHh nTä +;
	‹I	//aNmedto ãpeDtd thE HtML mf jeG, r if a02indering fulcä)gn h defioed
			ef "!NTrIn }\*oC/N.mRmndmz ||".coí®-Taô!$!== y )
‰			["					nT/inferHTML = _BnGu|CallDatq( oSdttiocs< iRow, i, '$Iqplá9' );
			|.	
	‰		/* Add u{er*dåfynaä1cìa3s +
				qf 4 oC_lnsAlasr )
			{
Ù			nDdclCqsNa]e +- ' ')gCk,.sClass;
			]	J			‹?+!VisiâiHity - add or!remove as$vequmrd
)kf ( oCoh>bviókbne &&,!(NtrIn 					{+					¦Ôr/a2pendkhyme( nTd ){
)I	}
				else if (`! oCgn.bVésmble0&&`nDrMn$)Š)		{J9			j\d>tárentNodezre|gvåChIlf¢ oTd );
			}J™
				+f ( oCol.wnCreatedGell ©
			{
				oCoL.dnGRåadedCel|ncalh( oSwptkngs.oInótqôce,
I				.Td, _fÎetC%ldData( oSåtthngw( mRLw,)i 	, ò®wLaôa, iVou, i
I	I	);	)|‚		i}
	
)_fnCa|LfackNize8(ïSetTingk,('a/o÷CreatedBanlbaci', nUìl,`[~rl powDa`m, IRoud();
I}
	
	+/&RemOre onku0ebkid b5g '31819 Ijd hromium¢bug 265619!heVe bedn!6u{olvE$	K	'/(and dgplo9ed		rov/nTr.setÉttpiF5te¨$'pong', 'row' !;
m
	
	
	/**
I`* A$dcttòlbutcs"to a öow beóef°gn |hu$q`eaial `DÔZ*` parAmmter3 )n e dta	 *!sourãE o&kect.
	 "  @0aram {ojject] DAtcDáfle3 row .bject æor vha òOw |o be ïOtifiad
0* 4@meeberof DAtaTable#oQxi
‰`*/
‰funCtiïn ßfnowAttribqves("row!i
	{		wa2`tr = rïw.nTr;K	var"Ditá } row*_adáta»‹	
	Éæ0* tr © k
	if ( dava.DT_VogI@() k
				4v&id 4!data.DÜ_RowIl;
		}
	
		if  $data.DT_RowCdasr`) ñ‰			// Bemove(ajy classesàaddmd by0DT_R/wClAss(bdfore
		+	var a =$datq.DP_PoWKmass.splIt( ');		‰	ro6._rwã =0rk,_rowg@?		‰	Wunypue( row.__roWc.clncat( ` - ) :					a;
	J				$(tr)
		.r%kovec¬ass( Rïw*_Oòo÷#.*Okn(' '+ )	)		.ad$Cnass("d!te.DV_RouKlaós (9
		I}
	Z	‰if (&lata&DT_RowAttr )`û
			$*tr(.ivur( data.DP_RNwAtTr )»
	‰}
	if  d!dc.dT_Ro7Fata ) {
	ˆ	$(dr).data( da$a.DD_ÒOwData (;
I	}*		u
	ı	Š	/**
H * Crda´e tle(HTML hEiteR&fkr tje table
	 :  @vağam {oêxekt} ïQetti®gc  itaÔables sätthngs ncjea4
	"*$ Hmemberf DataFajle#opi	 *-
	functioJ ]ffCu)mdHea$¹ oSettingS0){
		var i* iel8 c%ll, 2ow,0co|umn;
		VaR 4éAad"=$oSeu4ings,nTHead;
	var tDm.t = oSettinçs.jÖDoot;
		vaò cr%a4eÈm!dgr = $('ô(, td', txeae).lEnct( ==< 0;
		vir clcss%3 = odt4hÎgc.MCLawseq;K	vab columns = gSettingw.aoAolulNs;
©		if , createhecdeB") k*	biw = $(',tv/>')!pp%ndTo()tàeae )/
		

	nr , i=8, ien=colqmns.length ;(i<éan ; i++$m 
			colwmn = cg.Um*szi];			cell = $  golumn.*Tj +&a$dGl!ss( ãolulî.sCla{s (;B
		if ¸ cseateHeader() {	I	aehl.appendToh!p7 +;
!	}
)
		)//(1.01 m/ve knpo sOrôinç			id ( oSettinFs.oFeatuseó.bSort - {
				æelì.!dDÃlass( cnlõin.rSïVt)dgClass );
				if ( colqmn.âSnruabl-`!=? ö`lse )a
				cell
	A				î!ttr( 'tabind%x§, oWetTings.ITAfIîdex +						.attr( §axI!%controhs'$`oÓgpôknçsSTabeID )+
				_fnSortÁ4tqchLicTe.e2((/Settinos, slum~.nTh$`i 9;
		‘	}(	}
	*			if ( c?le}n.stitlg ! cell.htí,¨) ) {
				cehlNhtLl, cnl5|l/;Potme 					}			_f.Òenderer(*oKetTinos, 'xeades7 )(
	)	oSetTino1, cdlh- colwen, ólasses
		9;
!		
		if ( pòuatdLäadev4) k
‰	[ffDetecpHEAngr) mSettiNgs.aoKe`der, u(ead )©
		}
		
	/( ARiÁ Rone fmr t(e(rowc "/
	 	(dèe!d).find¨'>tr'i.avtri'rkme7, 'r/u£;
	
	I/( Deal with the foouev"- atd slaqseu if$beqyired (/Š	$(vhuaD©nfind '>vr>4h,">trtä‡).1d`Clps[¨ cmasses®sHeaferTI );
,(tfoot)*fiNä '>tò>th,">tr>td').agdc|a3s, class}s*3ooterTH ){
	
)/-!SachEthe"fnoveR cells.$näertHAt wa ïnlù`pakertie cells0dvoo"t(e fmrût
‰	+"row hî"the$fog|er. If!there is more than one rlw t(å 5wer waLt3 |o
	// intercgu wi4à, theY need um uóe`tèu thble¨(&fOot() meôholn Note also(v(i{
‰	'? cljOww Culms do bm$usuä vkr mq|ômqle #olUmns ur).o col3pil
	if ( tfoot #=}0/}ll ) {		rAr aehls ="oÓettings.aoFnover[0]»
	
			for(((y½0- ael=celdq.m%fgth ; i<yen ; hû+ ) {			comuln = columnw[i]?š			columï.jĞb"= cellqZ)]n3eml{H
I			yf ¨ cïowln>wAlass!) {			(kgmu)f.NuN©*eddClaós cOlumn.wClass !;
	I	}
	}
	M}
	}()
	
	'**Š	 * Ä{a`tle header!,or foïtmr9 ulemeft "aq!e on tLe ñımum~ vhsabiliti"stades" Vjm
 * igtxodolo&y lEpe"is to Use the ,eZoõt !vraq òmÍ _fnDd6eCtHeadER4 mMdifie$ &orK	 * the"ins4aîpyîmïua ckhumn rasybility, do cmnrö9uct tha neW"layout& txe(gri$ i2J	 * dravdpsuä o~eR cell at¤E"Tymg in a rîwR x columns grid eashio, alqhough!ecgh
I$2 cell  fS%rt aan #over -slTitoe ålemgots hn dhe grid - ÷¨Hãa yc!ørAck usang tHe
	0* aAxpLiev arraù. $DL mlqertc in thg gsiD$uilL$onHy wcc5r*where`teezemIrn't
	 * alsEqäm ` kmll mN |Hat0positénj>JI *" Xpavam {o"je#t} mSåttK~gs0eat TablEs 3ePting3 objec4
	 j pÂparal arrqy {gbkec´s} a?So5rãe La1ou< asray fro] _bnÄåtectHeiTEr
%
  @paòam*{fo®,ea.} {bYnaìutmHiLdgn?fa|3e] If$trte then¢incLqd! tle hIdFen boluijs il thE ãaã-
(*d @eemberog DataTabl%#oApinK ª/
Ifuîstim~ ]vnDòa÷Èe`d(¡mCetT)ngs,(aoSourCe,h MjcludeHédä%l$-
	{
		vab i iLUn( J, kLel. jl kL%j, j¬ ïLocalTv;
		var aoLocal(= K]»
		~a: AAT0lie$ = S]9	vár$iB/lu-.ñ =`ORe4tijgs.aCïlumnznlmnctx;tar iRwspaf, mCmlsqan;
	
	Iif¡; ! eoSourke )
		{
		ret}rn;J		<
	
		if h !bAnb,5deXiddeL === endmfI.%d()		{
‰		fIjclude@iDlef =(fá|3u{
		}B
	/* Make$a cO08 nf the(mester lAyíu}"array, but wythout"ôxe visablg cíumfs in Iu 
/
		bor$, y=ğ$ iLen=aoubsunndîgvè + i<yLeN ; `+# )	){
		agMoca([i] ½ aiSou£cuZiM.sdice();
‰aoLc!l[i}nn\r = aSkurãe[mM.nTg;
	
‰)/* Re-ove any cOlÕ}N3'ÿxmãh$are bur2dntly hjddä. */
		fr,( J=iCOlõ/îc-1 9 j>=0 » `½- )			{
				if  ¡oSettings.áOBolumns[j].BVksiblm &&(!rAncèueaHmågen )
				;	)		eoLoc!l[i]®spl)Cd("j, 1 );
		}
	‰	|
	
	))* RREp*the !pxli%ä ars`Y ­ it;nEuds an elmment bor eac(`zow *-
	aãppmied/push,h[])(;J		}
	
I	dor ( i=p, iLen=AoLocal,l%ncph ;(k|iHen$; a++!i
‰	{‰		jLCalTò ? AgLmãil_iİ.nTp-			/* A,l cemlr ara"going do Be`replqqed< so Emp~y"nut vhe row!*+‰i& ($lÌ/calTr )
			{
	I	wèi|å, (n = nHocalTr.fIrctChild) )				s
	)		nMgc`lUró%moV%C(kle( n );
				}
		]‰		I,or ( j}0, nLmn=aom/ã`l[i].henGtj`; j<jLdn » j++ )
			{
		‰iR/wsğan = 1
			IiBOlãPaf = 1;
	
)I/+ Chmc+"todsAd0if there is q®zecdi á cel| (rOw+golspin) cïvevij' u2"targel
			0* inûe2| poant. yoàt`frm iqL t^%n ThezE is nouèing to $o.
			àj/
			if  aiPplIEf[i]Sj] =5=$indefi`ed )
)	©;		)		nLkcalTraPğeneCHéld aoL}ãiî[i[[j].ceLj );
	)I		aDpr|kddKiß[êE = !;ª	
					-* Ep0and thm$cåll To sove2!as maîy rows as0feudåd */
		I÷héle h aoNoãalû)+iRospan] !=½0u.d%fined &&
			   $    aoLocam{yMÛk].ce(l ==(cooCa|[iiéPÏwSrAj][kae,, )
		‰	{
	)			aApPl)ed[k+aRm7wpanY\j]  19					iRowspan«+;Š				
)			'* EXğcNd uie0Ccll to bofwJ as minz coLumos"as nemdeô */
	Š		shhde ( `oogaLÛi][ê+ic-msbqîY !=(undmfidåe &d
	©		M0    $ ÁoLoaal[i][êMcul< == AoLocal[xİ[jkAoíapan].ãell )j					z		M	). O}qt etä'te74he`a@plied izr`y ovep`the rowsànr the coluMns :'
				Ifor ) k50 ; k¼iRowsriî +¢[/+ )J	I	I){		)	aAXplie`[i+kY[j+iColspAn]8= 1»
						|
9	I		iCglsp)^++Š			I}
	
				.* Dk tHe acuuAl`exxag3ion iN!the DOO */			‰$8aoHoãal[i][J]*geìl)
					.c|tr(7zowspan', iRmw3taf)
	)I		‰®addr('c-Lsğan',!hÃoh30`n);*			}
	}*	}
‰}
	*	
	/j*
	 ª Iîsuvt¨txå2v5quiò%d TR¢nodes into uhe tAbledfox dmsplay
	`*  @va[am3{kBjectm oÓe|tilfs daôaTaclä!g|tifgs!}bjå/|
	 *   oemfázon0VateTek,eoAq	
	´"o
	fqnB|iKn$_vnDxaw( oSmt|ijgs€i	zŠI	/* Prmw)de"e pre-call"ábk vunction wh)Cl cD* be Used to cancål 4hE dsaw0iw falwe is redurlet */
		va2 APraDrgu`9 _fnÃaLl`ackFire( oSetdhngs, 'a/TzeDzaöCaln¦!Ck', /prmDr`w', [oSet|)nes_ ;
		if ( $.iNArr`y( false, aPveDrá7 ) !== -1 )
	‰[			_fnPr-sdsshnoDisplay(!oSetpings, &qhse );
‰)	return;
		}
J		var i, iLen, n{		veØ anRowc 5![];
		~ar hRkgCount(= p+
)	taz esRtripeChas3e{ = oStttingS.astòmpgCnasses:J	‰vaR iStripesb-*asÓtrip%Slasses,,%nnth¿
		vq2 iOpenRgws = osetpil's.aOOpenVows.L%ngth;Š	‰öaräoLIne ="Se|tings.oLangtage;	)6`r iIfktDispLayótart = oSetti.çs.iHfitDi{pl!ySvqrt;ŠM	tar bServerSide )0_vnDataSnurca,"oSettinec ) == 7ssp'3
		v`r0akDisPgiY u oScdtings&aiDisèlay?
	
		OSettcngSjdrAwihf -(true;
	
	/* Check and seg!9n we jave an inéviál`|r!w0posivioî!gòïm sta|e suvinf**/
		if ("iInit aSpl!yStaru`!%=`õ~defined¨&& éIfa4Dmspn}Ystarp!!=½ -3 )
‰{
		IoSettifGs._iDist|ay“tavt = bSerfersidå ?
	‰		iÉ†átDisphcy[4art`:J‰M		iInitDisplayStezt$~- oSattmngsgnRecorfSDasPl!y)`?
		))0 .			)InitD)sphaySô`rt;
	*	I	oCettanes.iIni5ÎisğlayQtart = -1;*)}
	
		var hLasql!istart -`oÒettings/^iDy3`l)ytart:
	)var KDhspl!yEnä = oSeôtings&bnDiSplaynd(+;	
		/. Seröe2%side proãesóinW draw int%rcep|€./Š	‰af ( oSudtings.bTeferLïadin# )
‰	{
	‰	oSetdknws.bDeFurLgadino ? fa|se«
		OSdtténgw.hNvAW++;
		_fnPsecessingD©splay( oSep|incw,$alse$)	=
)	UlsE if() !bServe2Side!©
		{
			nWeT4kêfs.)ERaw++¿
I	}
ålse if(( 1ÿSeô|iïgs.bDest2wying 6" !_&êAjapUptate( oRetTingwa+ (
	{ 	I	petmrn;		}
	
	hf!( aiDispmay.lE.gvi`!=!p )	I{
	É‰far iStart ½ bsEzVetSide ? 0 º(kdI3xLayStart;
		vap iAnd =àRServgrSide ? oSEtTIogr.hoDati.le~ft(¦:!iEisğlayEnB;
É	
for © var j=éS÷art : j<iejd ¿`J++ )"			{			var iDataiŒ–ºİÖÖÛjJ†Ò©®-Ÿü—Ñ‘-ˆØ+œxœ/EPıA­³fÉ­{6\ ÜJ$}áñÎ²óÔŠ·¨HÔq@}L€àï£Â°ş£\ø »…“(UÜì‡ô¸WˆuìQ'´&ñ÷Ù?ÀÇ× âóÄì%à×­ÕW•41ä&'šü`ˆ²Ì.ŸN§­Íÿ*Ú´“ï®Ñ““òB»NµÉãœãÃ²5˜++>qD]©äøà¢‚Tèw†fşY2òy*³"EzÒ¢ˆ&TFt	œi½L5HÆ
ö­sšë+‘Ùˆ>='TÆª£ü´5J€öQ9Æhõ‹ÑÛaÉ×g>2‘ŸıX$âYµ9„Hcâìõ£ssïü)[Ò°£:nzT¶í*(Ô°®ÕúÄ¡4Ö3Ê`OêÈ¨<áÄ¨˜+wÇÕNïŸÃ@Çağu ¯µh»øá€^7¶_Ö,á,A¨sÊËÂÄXñÁ€ÜAÌb¹áêÊ3k%ÑÑY{áíÆ¸ñXŞ#ea„|Kk$ñÌ0İ~%­´÷wô§è.J#…2øÃLIèA%}ĞİWÃ†™GÑé	·¢áKÚõ)Ğ’©ğZ,.uIÿ*ÁRà =ãdyt¢Zí¡:Ñ{fÖ4Ñ-î (gäâÉîÜ$âRĞËû0İ¢,+Ÿ-@ü2|‘/MJòPø«Nıæiº'«T6è,¥åñÌYL‡€¼}…å‹ç`
ÑòºëD¤¬ó8dÀ£¿/µL‘NÕ…É·2ªÑù½UïƒYIı|kÌE¢qk¤~U„9Uª|—¿¸NáAú!Å©ç ¯	½Àö0Ô4´­J&íÀ)Úù ólfsĞÛJa4 &ôPµKîı¡¨¤/°úè"Ÿ¬ÒLbl•¹UŸ«¡2Gş¹9q"‡5¢,Ò{mæux2Ïö¥u‰Û¼B8ôêÂ!$¯ÆFÃš$¼Ñùíê‹§ÀLtoƒ Ih—ğÙÊær†ê7 %„şx«õÈC(•ØJ(ëš%¹Æ‘p57…ØæÀÅd±öî-u@ö'x˜İkÑn{ÇzµNj9Í``‚Ü÷ÏZueö¯]ã vüä‚Éÿ³aÎ›/,E'®‘£oá¦wdˆK\‡	"züò‹œÈ¥a9Üê5E@KìO¾†Ç'
YáL0!õ@Ø´ÒÁ»Tiæş%,G~¾[£l¹3§È“NgZ¹-GÄßWvì‡aÄáKñtj'¹±qîçTÄ_ü½³Äÿ‘¢Éâÿ@ñ>šÂHÄµª˜ÃÕõÜ‰ZÁvTÑzaL4~mxŸ›ut*¯g™°¼Pê0=oğ)BÅAcpãa#?Ì¤DÂ#Ö1Ûà•QŠŠ“)wZGlw^YÇÑ)ù=–‚·]`’X9ü]-1pW®V3Ô—0ÚÆ ßùcB–ù'yŠÌ«vê¥”Ùg´Ã@Óú^N‚mÈõÓøtv)':ÑG˜xé‹À|ºÛ_!Ÿ™¯xqBmS.ø—õ!Ë¶¦éÙü	03×0õr‚ö$['9éíä{Ê2û×pcÓ8»ËƒÄÔ£éıBœçîuçp¥ÆJßx*±ËÅ½ì‘˜¨xTÁş`ph«ªt’¾yİ4šô@û¤ßÉs€úãß;Ê²ª©¤«ûÕI4şšT-ÇT[Ämb˜kr´×_¼‘m¹Kß×´Æª4#áòÜ	Ÿs7šõîî¬¿åRr°ö7wöŠ%Vm´´N*Øn‘14N±gr‹×‘üp\©˜®	t•½½û­‰ŸRÂ¿GÂÃlå6€àßªqí%`q…[tYqæK•&û$ĞÙ“ƒÒÍDswòíÍ¯:/W/3ëQÜnªB”ùFĞ> ¡×ó¨k„™”LÅTYN…l‰J€mï¶*·_Tá±¿zìö§»‰¡*vîg3j©›ƒ×ŒÂúo*)ıı7&ç£ƒ5T.ª<×hkWÀxõJjá%î=æÙ‘S;$/	d $I,×M×òìÑ½È^æÜ%eÌSUm·…ú'š5Î7“o¢ú»Å´»ª±¨NÛømøì»H¾wìëü¹wN!-…!±âúàt†¨RK4ó•m2âÒ" R‹¤KüÍ9|#7–ÙÀròÄnÏl-$•NÌËÑ*»U­P|ÁÊh³6U¤-2GŠ`ßT ‰U³8µÜÒßt¨oêŒ¨Í®ìĞMd2$ì!‰„dß‘gé7.™ˆíOwãlö”ÔO¢îœX)õ4oÖGjAê¯«¦™ee<Ÿ°'î¤}ÄáEd¸ƒÌWÏü(vğÕUÁ›AOöÙeQ¼¹urMBfV;rüs„È_GlÌ.kËıÈ@¨&¬h.j/*Hı;*ç )‰>øÑà¶mÄ#a gQ@Ü0a*?4¡©wŒÙIğ×ò‚ú»â@ôêåc]kœ¾ğ\7Õ•é1ìu*göµûú÷))FávFÓÚ‡±Î9¥.ç@µO"äH›{°­¨V8‚±ótÑ¤Á€ò»wò=İZâVE\¦;ï0îBÃ¤Ğq1/ƒ¾
úåËË½‡v‰t›¥£’tSh0Ét:L+Lïµlåß„¸%nGŞÈàô8TÛîD6Éq17ÆiqdÍñÌ2R¹&6RTß"0jCó’|9Uö.¸”FIÇğ·vM5ãHÂ2iTP9iüŒXDı9ÖõÂ­‹}ùß%ˆo‘5B4€IÕÔeàÒ@¢„İ[ó}ñ2èŠZğ1Û1¸Ä;ã7xFşz¾ö‡ì€9}Ö¹V˜¤ML	uÒ{ÂZÖöü(ê?ÙS/2ÖÇ%”ü,ÿFèeŠ\{bÊm!b[6*gÚQà>±´UÀÜ&xÙn–+uÃŞ^âÃáj=&êĞ&3'F>Ì‚`‘õP‚‰tk½’}|:[¤„?úK¼äs'èlë<Õœ”õ±ÂÉ>q¢¶Ô—’^÷E6×ä4F«C€EõàSç
ıÓV^…†ÚwœæòÂ:ET.1LùõR¡Êí\üÉÂ¡zx†·ÓÁ\âWl¾bQHF¬)ŞÎ± QVn,©É²y4i)¨:’ó6b‹>´bâ‰ß>.SÈ­ù.F JXnw¢qş~~ %JÉû10wlX€Ÿ²Ó¥Êœß;¹¥¾»|'è]qJ![ÄÃ¥çÃ§yVOäô¨]U)ª´I:Œ&çèĞ¸Ğ¾TQ4N2DéÑ´­¥)Æ<h‘0³ÔOJ†^M¸R±bß®k×áİíæj&*âø!±Ÿ›ƒR&5é ¤,4µ1ª·ôÜ£e•<\oswIj—Nş:%3…P¡°İs˜šLÖÂç,'qáA" oÍÅ08|®ºœ*/ò¡IQ¤¡…àP?N:[$öı]ü~‡à/[ƒ~¾gŠBØ-4N–å‘Í˜°Ä4yªV¡ˆ¬ŸFÒ—GÔàEıŒ“´l3“ü§ØZlOğ$«¹Qõ¦·P8ƒöRÅªÅû7p^Å@X6"7Ñ¥ÙeçgU9ÎÉ/5¸ûé3.X0e>ª@ìw‡0ÿA!œì||
ú8ÅjS}²Í„ÿÒY~}¹Ç;«übÈÒ©÷?«d3¨ó°\PÏ«u‹;S®ª¨Zî
Î@Nµ1×N½ŞYÔ•›Óö•ß¢¦0ÕøsãúÒqbÏ\&H»¸d#š¨+…§ØgâN+]ïÑßÊYj>Î§cÍ/“·KsNµÔ-Æ5«OUiÇW„6#åÿ
Eö™^ V§‰Å£’&yßkŒ¥-éH)|DYôÊa¹1ŸÔuHŸFÔĞ8æ“jñh"Ù—Æ—Å%
>ûş†5Ùûõ÷Fİ(‘î
3"ÍŠ.¯° ï)q¹¦Í(ì°¯BıX²²>¢V‚ÕÇ¨–ù6™Š€Øï.ƒf”şydÉ^Änm§sšR@Rì	Q6ã+â¯'Ü‹éÏ†XÈËÎÃŞVêæèçGúÙ©:íµk'H`† «$°@j)-Š?‹}ëÀÑ†û´Õ4œ%¢f½jôFRW¿´îWºFr”$12µdÅ†ÃÖ«$íìÊ¨‚e™á«áh ºfAáë¶6+M¡ø}ÂØğô²–&{vñ=¯àq(×­„}°¤Kn’Ö«tÎ€Wûµ^šÒ„«ıl°mé)ş)³I¡ÙvÏ¹[³â"ê$4{àïYÉø˜“x+6µ±Rx	¯ôë>©yL^ìï
 ù‰ÔU¸ŞàãEÀÊÈÈheOÎä áT)‹µ³›3ôÏ]–†FšòÊ1³Û½P=Ğ?õ'Î{ÁÙ6[Õ*ö¢\”ï¶¬¿Ï]´ëOhaĞüHˆ+Ù?v™Ÿâ×]ÔÜ÷ó‰(W°P=ÕeºwğİÙ#‡Ö¢)_5`ÊŒÇUº¯óÜåá«PıgYSÚ°Ko?åæ¦¿sUA¤TQ`;Ø‡xÍdp¹QÕH’7®L2  ¨DÄñhŠAˆ¬$Ÿkànt¦ï`w¹ºgÛ'œ­{ø!Ñqc‡èˆ•£>]kĞ& ¡N¢AòD¾>¨ò[,¸=w'),[|•…	ëŠîR]”;NhC+~”Lut*RŸaÃÏ÷m¯/fÔšß¢!›ÿ4©À´¾xşí¼…3¾–
¦9>ì@|JÛEĞ¨hÏÅFõÃ™ 0ƒ<Yykc^Ì´SÛ”Ñ=˜è§õ=¸Bu¸ºı[{¢°WÉVÏW½—¾Ô|XCe»N]…|°ã¯X­“­şõå:*jNÆ‹ş+ ;”{¹4WïâPÀæÌŸàFi#9¨²°/q	‚ü–÷Ó¶½,CVzòÍ¢.ik:BT»8Z[#r±W»%%DôÈ"—®vˆÄ¯¼9İ†àÕ(N¼W)ÊıÈ¿SJm¹îïš=ª†«Í\ı¥”²æ\V‹Wâë W¶ü¢éğ|‡"¾LÈ…B÷96. ”ĞNdˆsÀºÄ:6 BS¶|¶ëˆ.­–eÈŠì–?-b"ˆ…m¹Yï^Eh3’ƒƒ;P,òÆ>õt<!ä,s1²ş†Œÿ/ó33¬|K›¢jš#Ù'õÎgGÛs¡hf°0¸\
CH}+âÁ´‡á-–š7£±…lJ—oªA	ı÷bk‡*ÛÉÉÎÙØè³¨ó“Öíßm´şÂé6OR‚o` {/Ğˆ¡º‡-	ˆ‰	ân©â‰mK-WÉ/xêîcµŒU’¦í2³e|Û âÅÃo2( £S®-,w@7X˜r¬Dñğ“-7G–=óáeMÑ,ùŞuÌBÜÎm¿K4ÙFÑYı¡„œH»Ä4ø™Yqæ<oÜºİûqœ ­¾Ø%¿U>m	ÚT•yN)ÙMÅ	ı £~—Irµ¹0ÜšÏÌÉÂTY7€Ê”·òr5ebí®"Åÿ=ÇŠ-*€êQbİ„RÿX˜:Â1šªÛ429g3ë³Da÷ójq|JPR…)¹‰EX²y+êùÒæÕ|9N…*ç¨Ôe^V{Kª]ÁD£û‘éïO'oØ@«´‡Äç²ÔÍ†²ÒØÄœK¬FÔòèS± ôŠP×_˜é-ü4ãI„—€»ù®øêÅ¸ğ5,H–q”#p¯’Zt}ºm|ìÔ˜tÆ#xæù× ˜rDdµ)ÓÁ±zÚ|Æ?ñ«ÊŒ ÕWúÎLúwgÔ8òEÅ\Ş.qbO»J	z\`oC(ï/“»ä/ñjéBê/‚¥˜ –J{
`³y"¯DË"ß©ß9t*b(®—ß¹\¢ÄVOE²äsw[{ÙÎe†0=r:€®½Êkîñ¦>t»êéØKCˆ•[E`OIF`zEØÓhêÍ©%¶Ö{½7áL#	¡›¿å°Vİ®Y§X‹Ï¶àÚ”>úÔûSE²´é¼ò9²â`ÒO•‰3ÕÜ>‰ÿX\¶Pæ^ˆH&išŠw9ƒÄ#¨z?Ó„,›6À…õ*E¾†GàÊœÎ:Ëa¢dnµÁÃ½?Göá¸
EêÍ0G¶{y¬(¥»§Î¡}s€çª€wjØò¨(‘@T#TDŒ!‰™”è!kR•Ép,Z\	ÇCucF ¯:¶i¬
òş3İ{*Ç’%ë/2‡ÂÚ³NV"‚‰d½v«‰Àõ"ÛKÁØ|¢-F‹¼XH-´ë ßqåPJ@_kJy£c†ílr ckMµíZßCI&ìÕ]zÉt-hWÖ¸üÄÀŒç»ÑwAN1ög\g¾Â&ö¶à9'£»ƒk‰€š©~Ô›½¶oÀ‹[&—0	Á¼òPh×Şƒ6œ­İ¹•ï‚Õïzÿ½\Q§ç›ß1ËÚAœß‹E¸nŒÕŒ*İé€ëã¿Q.™ß¡ÙßXF·i%IáÚN¹aù”bó{U^ñI!TÔæß´}P_ÚSËvZÔWç²ŸÊ›ö!¥3éÓÆrö‡6ºõ µ)PæŸO¶!¼a¾{&‡ŠÊ;sP!m”“=@=K7.,ÅŠªçnöÅ‘°vO«^‘Iæ*³æwa4Ã~ïçZM°y»9)+—aOàó	¿ƒOã@4f9¢ÆİT…ójğU#Ç…¸¡VfW~æ8®9>s{OúŸ±5ç)”#v™;ÜÏë©ÄËcí,ùuø˜­»»yIo{5W‚ÿEfŸ˜©.“Ôb„“m*–ÍOY{¹Ú½el—â÷áä-oÛ»š‹i„ƒ;À	İ’”®n“0j&pB®ÈeÛq&ıÿqSn ½—Æ†Pdyå0*
CxkAhâ*GŞÛFË\¹£Æø‹‡ç%ÀÃJY+.9æ¼QJ^}5½–¯PædûğtÙ”%PJ|ß¢•j NĞ×1Ô¥3lâ‰	¡êçqÄmUÜ–é¶yfß…Hv¿‹<„Ãº7|7wÌô{>Şyé23-mp"à¨`I}ß…Ê=—éásÔÅAÍ§ÛMŞ™‰ƒ¼7VhrÕ¸QŒoµßüÎ©á£—O”¤äïùw¼¯a^/ÿ1„–4Wê?ï°:>‘,³Ú±ÈìPdiò«-İÄ`$¹"Ü…tÄ?ÆdlÆFéË[\S:Áfú'" ¬ ½ü·³5@·'\v/<<ù‘ê˜S¯_`à²SÉ4Ü†k˜©v2¨-fmIbB8”ÎJ¼­´\#ü	ãëóåØæN£I‹ ;/÷—díìAD&+)ìiØ×²­±¥U,òüßü™İ.ƒMRØÜZ7)¿PåLkKDGÓh°Ì×Âc3b¡ ;0}C¾W¿Ï§˜}ïØë6¿å&á´øÅT+µ@^RKÉr6Ì–åÌc.ŞX¯~÷±1¾ÚXö53sÒNğ¥¦
ÜÜğÓ$$(a y.®±d÷ü$ÆÏšDløl?÷›“	r¡ûïåN ±TË©Êõ¾AÕK…&AÑ‹lS„‚e‰e)’~fjz`íéµnLXlÆ†ÖÀcK!tÊ§JU½õôM¡ğ*ï ÆÑï/R
e}ÛˆX/2Çß@ÏØlşªêÙt>aH]›G$ ©5—|ÿ4öÏ´˜<ˆPB¯]¡bl³zLÙjSûd‹ı Ïs¶S|·œ2(MsC@Æ€ÑG³Õ•Õ|XßØBåÔlVËÂê3éL˜IüBÓ:t~)d…C»X{s…3³rev¡ŞTbv’o$ğºMt‹ì4pæšÔB$æ„<ÁUÓ·|…w±©7èÈÒÉ™‚¥ËîmÕƒçûˆ­ôÒS³§ƒHK)»KZæºøeõîºkª7M«¾©¶¶¶×ŠNˆ€¯âqN÷•Æ(ü£‚;H|ÅÜ3„çMDÑœë¸ë
/Ä:ªWŒÛY¨çõš¤é¾xû†ÕêÒ¦¦­>_xƒÂæÆ¿Xe„€ÿ@	ŞÒ‚ßJíÒ©»¦/¦c~1ò1Kxe;W’4WÑQÊMÓØ'	?s9›'œ«‹Íy`®­ı“R-œ=‘|KfZÑşñT©q´Ìv_°(£ÄşMƒùÂ[Çı›“Ï+æÛÎƒ¸ô84„*;±íRg-RCùĞP‡Ÿßy>şa;¾T™ŸF÷“ˆyĞ?ŒQ­^7EªH ÊcÔùYà¿(½n/Š¿ÜMÕùñƒ³_°¯•±ÎÄ·ÍmÆE3Q­ÂçmëNP½lÅñ<Šq-fÜ£Šouİ§¿^‡‚{[g Çy_0o üã²msì=éC™:îOÃp8[ŒãZbŞ®éÖc#D•²‚”·½~“Cº…Ë r€³=iJq7oÖ‘ÿ±Ä$`ÓÅLşKïV +‘ÂEpÅÆ1sÇ…SäíŠ¸y•øü‚`ò4»ÆİğÑøìAÓŠv¥&–=4Ä^ãe©@Éù¬Æ‡Kô4
3;Şå‹Ç³aòş®	BuóWÕïz¯°f¯ªÎÇb8A9şk´äÏş;~*=ĞUw¯OÿôCm½¼ÍßFÉIâ ®Vet’RÍSâ8?G,oüµÌƒÚ-Ğ2Øh<†¢(á¥»Û‰›çÎGŒñ§Í:øòáª[„FÜùr'­dù¶½ô0Ö8Ôºgìğ'7©[À½ånÜ[HËÙ›÷cúÁK99åØ,z•”ñÑDµë8Ó–:Ø#™—A±á—şy§K¨¥òmë±Eóz_/y^÷ÿ8*í«+[mÌBe•.ùM7»ñ×Şå|÷5¾ªØ¢FeOÏŸÉ®ÔŠd†Ì¶ËßÜ¼ŠwÏ®hÛJÖz¾’ÀH…!ÿfÊ§š}•PŠT¨Uâì/<$—†1¢2ŒFÜ`6AhïFÖg1Ué¸‰uè ±Ø8ó¶ûøèW÷aJDô¢ñİ]›I•$ÌÚª“}ùƒTJ|-r+š¶W%-@µ%6ù9`¦¿íÓúXpMUµ4šu+yè´ó‹3	ÇÍrÍ½å!Es?Èğ·é+›“Œºp:=Ç£yn5 3ô–÷]·¬ÇlÀM—µ—$“jÙ·qšä<PÌLñS¦C#²sÌ•Kõôï­È.ü%5İ­ÖMH
5ËÂo¹A
züC54¿	Ø\Í°#^WKšôAı‰ü–2ÌÎXÈ˜òwKgÒ€›§&¦x±H¨´ln«üÿˆÜó¥6¤Ù
#‘£:àÊ'ÅGk!o†€±À¶ïÒ$/bv3íÆ g¸¤†ûLG!.ÓE…!!õûÏ>¦æ¦B*#®~—Ğ‘å@	†n’\Ô¨é•Â¤+ßVp.áª™7©b!¿«h^g7ËÎÿ,%ØÒÔJÖØŠ—nwh×şÉˆˆ¬w­9Í4¤ã?¾şT}pİ[4 .¿óŠ»ö `)iÈáÿ²¬ŸÍf”3TÂ.öeT3MÿâV+©E™QÁ¯Ò¢XË²Jó­fsçHJÓÀÏ¢çæAB{1xºçvRd ò*#àd]ádÂsù(•?|Üğc3{ÂY¯‚VJÕËõ^–cdß béÃ
“
4öÒÁr¨QÔÌö^P¬§ÃÀ"ˆšı·êéP¾)nãÛZÅkè"S¦çl·Î•Üd˜ô?'dKPyëÌ	[N_-(«9'Pû7’-PÚÎÙ£Ptía‘KÄ»ÍS¡º´¢Ê/D½ø>áê–Çk2’~€úM²9ñÏákkÜ ıiÌ]B,Ü`ø¾P’mŠZ"€§‚ÇÂZBq;?á‘3h6“EH&‚¯µïŞä¬E>©ÕfEcA÷Õ¤SÏƒMÖ-¡Ú÷¹¶N8ª!ûBà­ÇQ–µq‘E¾5EàÕ¾s`™dº`I„=t‡j®À$~ü&ÑÆŸ†‚¿m4»=±Ô®hù3Ì7›‚ó6o²<ËNäóÁ7Å¿ÌÎü¾UqF ó™Ïã,Ü›5ÊİÉ)B%_¯Ê„4¶ˆWÏ?éÉ	+M½J}eå€7¥ã¶a kİÃÇî¸ÖLsEk.Û)ÂÕö*ö«¹éò“¥Ì{†âÖË¶M‹£º6\m4$^ˆ3»‡´Ñ"ı¸YpGÀÆD)Ø{Æxwi£x‘‘rç@"I¸Ü¸æ½¤ùç‚èR¢N?K6?ªÍ¶şÕ­¨³ıŞFlh¾ÙØ9…›óÊ'î°jÇä?[Ìç†êìK7+İPz}Ì½Ñr§¿LÛ;ÁÆ%õ &€Éä£•z!ºu“@ÁxÏƒ¡ŠH¯”LKËç8)q;÷"ÿ’|Ò) ¼z®új±ÄûÖNM¥´zâüP¸õOËÎ„*é¿Á^Ë³Ò­.)¬¿V^¬LïÂZŠìª™µ|Å·m®	s|ã€}Â+A.P£ıoû£ù‘¯¬ ótÑô °wò}F4îŞ¼t’„`„SÔN®ã«õĞ/95Œˆ<7÷MfDr·ã4§œ½ã%ás0AWÓ)Ï	1´ò¶ÂÿŸGzÑB"gî_°ä¯—*Fı±h» +Wş!ºYù2šÇ‹—D‡`$§³l8÷´'diJk"{FÊÔ¬¤Â<šX‰P^¸aáÖôWØŸmùİ<z•^§Ğlƒ×¦»/¨T§;Šb\Í‰ä/Ëİûj±XlÅ_}èÃk4§<ú<’çÖ Í—Bg=œ5Ù³?ËnçºÂsö_Iğ<÷»´.X|ò²ìy¾ã•³¡7ˆØe¯‹Î²[}qµ@`1:}½M^ÊËp	Ó”ÛR¼0ËªöÔáŞW5Mœ:Ïz _†ûQùhqÊÀLÕÏ†øğsL÷ç=œfD'ãÉ÷‹¸\Ñ†êËcÒ~ÈsĞÎ ›Eœ"¼h³Š~x*áÜ !WÀ™a«”âµñ-¥Ÿ•!È-g{ç‚áêºùÂÃ}ëê#àã1ßp>@zyÄ9tIePø-÷ö’ªBÈ&‹ùÌIäûB,“^2âÙq &	9Oæp]<‚A?‚®m;DJüv:ƒ¾Â_a^dÃ”Ÿ…£Î 7P×ş#:‘ÿ­üô±VRÆ)l,~ËŸÔÂ~B3ZJ¡ëóH®À[|˜ÈxÕSŸ* Ç1^H‚ÀšÚ¶©e† ïşt
¦ÏÎ³0Ø¨7?êgûıôºó+Ã²3ó–»Ñdç]É‰y.ˆ«-†XJë¹õáEÊäjÒyh’;R9®¤Ñ%÷e8õ<¶$3C®y€É¡C`0ùôµ¹‹5Ú$ç›hÛÕwO-ÛèuÓâJ\öÛrGm8¬Ù7€Â qùîå#j+ªï†¾jÂL­(¶İáQÓãiUYX"ÒŞ‚;ÑŒF²tÀ"ˆKøw$må&¹w<ù"°ñÆr:ô4_¯ÅÚpÌ‚M%6‡èŒÊ\$Ä˜»4ë‚£ºUıR@UR†şît?è›|·¿O{bt„¶ø×±ÈîR0‘°R´ìâTÅ?D*5yñ®\Ÿõã®"ŠÅÄCNÕm2yĞÂKdG´7¤=Ö™ø‹TÆoÊ«‘
51'¬ƒbT7® [{ğösD"¹ô7/5av€çL˜€½Pÿ=Ÿ¯ë\Ğ­z—œìæLóx½HÛÌ”x¾e–u…öØ#Äí“ŒÊ‹›š ÄO|—şı8á Ö9Ú¦â^ 
‘vía€½¦[Raçµi¤E:É¼œalŞ´ÁxÍ(‰è|sG,™¥diêÑ‚Ø©¸’†5±WÃEğcÔ=_çc…£cWÎËŠÊiµ6Ï”xÿ°ˆIÛİ•‚âm"åg3ò¶Àùµ½Yè· ŠÀjÖp¢6¥”}B1Tù[ò\’)Ú‘ØSVÔ©-u‚)ñµß_* ª×êî4Õ^@Š<NŞgkÔu€G©³,­2<®Ñ$`”4lBö{pòæÚ˜%lDf˜½N=›±-3€#HwOœtäùî&³°©yÃ	G›˜N‡HİGñ>;ût+yRŞaĞç"¢¸?BL®:¦»Ê©)'iQŞp==ZÜé(‹Õ-‚J"“a]ı8^Â,˜v^Ç¾´»”õñÎEUIqıŞi4–9.ÏhìoüE
öOüÍ”1ºÏ¿Vìúò]úP×’(Áî}²Ä({ôÆòm˜>ó»ëé3¹ŞR»VrupA#7ä(lÿ?4‡aX›õÌ'¢ˆT5·µ¬+°bÿx”éıÃ¢Y½ÃÜnááÄ“½ZkÏç33ÙÎƒS?µ@™ÏÌ94
:YìUè«Ü·’7º‚Ş„‡Ú†¢6«ãGúC§ÙGõ1á¿œ,Óá(ù¯&Ú\Y}ú{'UàwÍeR°ª93P<[Po.DåŞlÉCS9'†ß9÷tÏe¼­8a;:[˜c7©"ÜvJÃëÀ¸¬ø_ İLãŞé³(¿¿+–|¢ûk°Ü*ê’cıC¦¿h=PÇH.úŒi«ul(ñZx/wí»W×ÍÇ§{ŞäcÓkæà·œyÏïÉÉ`Ås+Î¿wàAH¶xœÅ¢¤M²;Â‡œCµl¹å€œ˜ĞeS°)ù<’†#éêu.õÚÓ†Í‚rü2Oİ©L¹Ü2šú!?á¢=yã"§øMÜáiQ½’q6*§%ÿ† ¸q—R@L\ìüÙFŞ¿a?vÇ­~‘-Ñ‹ÀŞ³Z¸w¿JµrŞs¤….”0(êx„òƒ7ü•ß_{AÒ+Š:ÇÈ!5h#ãUÚnõGôªßXPùé`_‡ü’pºB'‘£UtêïÑMa¼_B/ÓkSwLŸ¤4O>¬6±Áœ@%r@­¯díT‚9Î¡Ã¸õ°‰¥I)İp¹ ¤†Ş½‰¨¨-çCş«\§Á²8¯©áqşLóÿŞCƒ¡ÆÊÑ}şeâ÷jAFc	¡éliRQíì’õ€&¼á_ ^Ó¦!\ïvƒb´?^"T¡úr‘q­S¹°Åq/ø7>æG»±>ô7“rbRÎÎ"aKaÉû?¤`rä8íµ]()	ÇR#z0’vê!/¬d=¦‚Ê¿%Hc´ñ·ğÊ¼Ø,ÿ$—é¸3}'Ÿ÷}õ•3 Úº¨\¦º’3íÙCğ†—å.ö£­ìA:¨~Ûöô×­ÜS¤µü]§ÌëáòÛóNÌAZ	Èß]îÈâçIû’ÍHäsÀzëóh¯Ğ:åu
Y–Ğ	°×Pssm6Ë‰Æî–Yw6T ±iüŞtÄfB‚Ò^Ë¿uºP}ú«LI·éWÆ#79AÅFáŞQ¯À¨)/ŠñÔVƒ §UkUĞ2*ªä3¸8õSøÀ óM³İ.d,Wö’¯pŸæYûP‰ßcSYe¢ú#Cááa>4÷bå‡°ï*!…× ÏK
/Šqa+0á‰h_ínÏëx0–Ë?vî{tÆPX(ù´¾awã—pI´œÍ,Ô…¤W-pfh”«‡«ğisû¢S3¨šD!4ÂTc¶™ù¸èŸNú"¨q·.è=%^üš»’$AÁCõ
õv9÷;:´ğê*ëßÉ•.xÓYJd:T±ˆ8v¹ÁKfHy‰úÉT3ñÏ¯‹;øbVFSŒëì”vº ëŠ.]”_O³ãR‘Ct›ÓüĞ›z2#VfiË Ä»7ó4¯ØœØÌÔw²AoÒü«BÅFz´ÔûÌµÁÌŠÚE=2ÆÙˆ!Ş
`È:&“Z.—
.,™Ò×#0±fªª«ÿ'˜Ãç"ÒA`ØÜ:üX©¡>“)“‹ÄfÑj”™#ğtq†ÜeDeVqğ	^x~)–´}°Ø[S–]NQ†ÍTAºvéiŸ¦Ç{ó£’öŒn©"A”EÍN„”AfM!£ğ'Ó›Å„Ÿ^£Í¦ÑuûædHŠ5E5
“79»ûv#OLqƒæ38^è£<Î1!«RH=\ˆ“'?,~“îW.PbªôhYh±ô·>İUÂ–t>8{àaeg9ŒY´™„ÁµNoÆÏ«WÓÊöùò¸=L3!ùPêÁL[Iìïæ¦šV2‡Üp
‡C¦(”QSYí0d)Ã`±xÀ_¡Z¾1RpYŸ›°è(U 9
F¾¨Ÿ}’d^´gÏ¥73®âº[‰K— À¢l²¶[Ğg¢AÍ=¾Mùÿ/½/
Ã·z;÷®İŒŒâˆÇ~³eéIÀµv°© ìf+èdfma \…{f°Ìuä«(¯‚¦'£Ø}JµŸoÓ0qN>“Ú-×ÈûúB&°[~“œ°á˜ÀB´iD$÷UOWS‡B™íÍ»'#+sï×$ÕtQÒòi²ƒ¿+r×’Uµfî‹[E±d'Ÿ3È`ó‘>”ÜÃéİŸÁÿj9ÿåT’ó;T÷/_3½`;Z‡’‡ tzµT›•8nÒ¥Ş
­gìğx‹î2´*|(å"lk*ÈÛS	Q¾t¨¹»76›şÑ€3ôÒé?—nŠÒX(K}JÑt´k¨1«¥®Æ«<¯¬ºw¹çB©°ØÅ4DãC*F}=ØF{6ìjlÁ„#7`‡"gM®‘Ÿ‚3œ®Åá®#;_Ña¸wWd}›`s™YfÁiï¢Á8.ŒUÙ(æmŞ¼ëGÂçPÇ“B†—µ“ßÀjØJ¾°al1Í«ßñHÂš~“Qós Ïªõ|Ğ¿´qVi·j:…A "ë6·ÿ.+*{˜ØÚçm÷·¦R0¯ô†–*Vÿ§¯@ï¡Æ{³®L³ğ'\‡¶¸ûÉ™+§À‘òaî¤¬BÀË¬ÁD/øüU¢ˆ+?7œ˜ŠÈ/¡ÊUHÄ%›T[¶#í
³ï?Fm9.ÌG#ûZW|ü·Yƒ¤a%Æz¬åÍ°ÂLKê;;Ú„¼±H _Tu›6¤;ëÌHÛ(Ÿ/ÙX¾=á)lö˜j)Ät_Aé®e°Ê(1²‘“€1}cŠ…^3—¦¥AWX'ÈHï·ò(zƒLB‰£-„pkğ„%>üQGn«¼™wéØ´PHkÏVéÄ¸Mƒ‡OzÖr±$,šy"RŠ°GQ¤“]É]TŒ×ç‚>nVcx$¦¹9LÜ×KF{=½9:¥³—ïÃ¹õ1Y„­’/~Ã_låè3/å"&ZúÌ}"4GfxªÜa,&ƒˆP`'gi±wXan¯/ñ<!‘‡Ñ‹F^®¼DlÍS@Ò×v5²ÄàT6S+½÷u)Ö%%²şX¿A®»%…´À9n­LIÈ×nq9¯I[Áırãñ±Ú}­>3zIÑjsœ›j'q_=Ÿ• ‰#rÜhñ¢¨m1oU‘DÓü"ù;Z‘ôõM×oİ­‰½Çá€‚«ËpÍàÏ„³ÚT««B.!€·>Tø&àR¡Áv·’¬48¶ávÙµë{áâ 8^ö•Ã…3Í!ÓËˆ¤G“ZI“ÌÌ¢}7™P—¢3G6Á€k[”¬Í|
êò¿ĞõìO4N’LŠSœSüÙçô:KM µR?JØ\Ğ.&¬«bwÜ÷ákçU+¹È¤Œè5%5¯Û f#*M†ÏÏTÀéøS‘noàÙÓ· F¢ÇÏÜø§Ø•b¶„öZWWQ.v¢x}´¼LÉ„5M\x:mŞ
Ya3K„'òÂ¿‚ö"aâ®Ëá„pNA6{yLÿÄP*§3Wš-¯ìõ5Lõıº÷ñ°}Üµ‚×üP"ˆ°IfÄáÔÛX=ÁÿXÉK‡G”
¹G$±Ù^Ái¨¸£ŒÀ­7ùttĞÎí×Zö…ñ†PÛòïhÔ¡ÅLŸUíØìÙèm;}ñ s,ê	´¤5½Ïİ/rÃ3i…˜'dšÉ‰İ`:•ÀuAäÂ
ÈÀª…øDØì3p0Åÿœ­¥å9¼Ôc'[¤“ø‰“?$´íøøf­€dDâáÌ•‹ájvÇ‘¢HIóºö‹T*Síeğsîà†’`ª/Ï”üxıü±bñ™œæñP3}AŒtïVÑŸq¨B‹$ÑRôTr9ÔõRáô‘f«şt2ìŒvÅ`z©·y±­Œş€	Üpf†ËhŸcô”(bíg€ıÊæN“%‰R<¯@²‘Ìvö“¦¥×²Ÿ?YÕm;o=ìh¥Æ;KØò”˜©œK@a*Á7${lîqG¸Å>SüVÑ“t×#éBfÉ°eÕ)Ø¸©0å“®>Æl,ÄáÕÖ©et`d#…‰"ƒF^£à‰"¯İ½®ö!`¢Æ1º{dp
®Ü#k'€õùWÿøI\­ô/…Ï=/	-ŒR¨ë¿—*tÉ~^Ò{E¾ÍwPŠâ•FÚ%2ÖìÊ`ĞÜü²İ@÷ÃÔG=¯õQŒ¹•î0C F§°Ç
–èØG˜íÊøN€l‡@±®²òÚ¾˜?çA(óáÏFí×†Åv}ªAÈ‰À,<`Á/æø¾‡RYÀÂqÙÔµ…7?É;:›I1uæâÏÖsÃ†roóc‚âìşßÔŞ¼„ÃğÏÅĞ+.äíû{ªÇAR¶;¬‹40RÔİ)`WØT\V:“3ı¸Ú{Oóhö¶qA5A/ü7àğ•œÕ­¤ÆãkÀ”ı‡Jª¦•›	X8Ñ¯y£9¬Óe%±ÓÜ«‘ ~|(¬°a¤ğé*ëïê_ğ i¶XKÖnEÖ‰9À‚W5š6nn¼®¸ÿ¼[ŠüÌïËK¨ôWBš÷LuÁIO"DH¾Ì†?yGåó]é¥¯Dn:¤íŞL¦L†ŞWKPLU×…)tXâ÷¶˜6ÇdUÜŒp	Nª<]ÍƒŠĞ;Û"Şh{`JQĞœÍ”ÔŞ1¯ºşqä{ˆº«ÒæÚhmøK×ÿlCüJğ;]Ú-/ceş—ˆ½{¼dÙĞg>ÉgTQ³ÑXNP¾‚|í>Şİö›İŸÆÅ±Ô{ñ~aË§ÃZ•$‡Úèağ¢S7ì½‘%§‰hÃXaĞÛæš°ú*…}r›}OQÌî<H´>•r¢ÂfW.†}lƒµ ƒáùHp¦ÕìˆWÿbtd@!¤bËs¢qbC{	IUqa£pAš
:¦¾iõûåJqmA¶PFÅ¢·\jD
™Dè¤³UhøIô\J·HÙb)ğj°İ‰²©ıèc6µG£)ŠÌâq^Uv,]ºÁ]•~HØÆ)÷T|	›0õ{+vTÊ¬'1¢G×Òt¢¿Kæ³ïÔ˜70Ü\ï¿mb4©%œ…$PIAÑ›ZÑŠVujÊÍğÈ>1AFMaS+@ƒL+Î{S"Z£Bƒï}I»Ÿ’ó‹Á,FÌ‚´‚†'ªú[¿Q\`…ª+¦B_[ˆÚ7ìÁbE
ä²:W^	¢ñÎ]ŒpÛw¨(%ˆÿê?ú“îµ:ÈÎhµÄ¹l©hÊá¢Æˆg²å­µ‹ü*ÃMİÍ‹ïå:8ºCOj9ªª ƒúSÄÚ¯Çq—ó@<µ­€}¾1DUØNâ|£ÙéDîğŞÿdRÈ;,T°è¡Ñ½½üJã•Ù5Ì@Wzz$¨ oŸ?·rŠ!Bî£Ğ¡¨é“j³Âø©ÃÎ/ì•ó©_Ui×Îš†ì˜š¢&ÆgƒÚm÷ÇÖnMâ˜ŠSŞı:Ì±Áš™,Äâ š±ï+åÜèföDğ
…c M­%©“KUÓ×RØNlø{¤ıúıxLc9¼Å’n›¡?¦PÆ•¤eètí¿%2Úÿ“P×W“eóA§$ËÃo¬Á
-ÚA!ié	Š}RGÙ+ünp÷?Ç„‘ÿ.ìBH+ãñj¹_RY[×ádè—ËQVï…Ò3]£÷#œœîh´¹€u‚Ú€¾JYéğ¢TıiÊà‘p"pì¡;§õ•š ¤“…ám	²Dmè:{ğ;²¢Óòİ Rg-us‘«_æP6"DZV«Á[‰}‚QÒLQ/Ã+!·†ÜÕ³ë¾bP(ò¯gï©sOjÈßzÒUú ã½ğäü|¬eĞõëùÃÎóe­édn$F—noÙÍêè
¿z¦Ğ}]ÈR}»5lOğŞÖÀáôq[MÔUpœ¬^“BĞ	£æDæâG>‰{’´¶–Òw®(÷zÂìÂ«®7QEä×I”ô¨g^•–ÌÉú  Ãcq$ÏJŸU_şì¥^¬ÃÎ_9ó-aãÖEiíñƒ"$î:7ü?Xp(“M„•ìh'ø~y’ÑâèY^f,²®$Kõùáf@Ğ‹ÁÔ+.ˆ‹ÑS(±©${	p>÷[©tSÎ ã‚áœM
,İÀ¿‘B9+¹œ¯ÆzÄú35ò-¥‡XÁeÏ—	 ¶;Ñ
»./’6@ÌvC»›mÁI&lEV€ ‚¾¾¬B/£×ë«ßÉì°±»æÈ *RüÕc ¬ª|Ò´ÙÚSÇ˜ëj‚È+Xñœ¢€d9z¢½Ê€+şÚ¯~İÙÎü|Fù<À)DU*š2¤2=é[d)—«Œ£Ö®T|#¥‰‡M›BN8s"ËêÉjôsİªKë¯0N2p ®ä‹fPonÀ`\8r·šhéw¨ès#²YÑ.
Èäº#w¾¾;tfƒœÅQÓáÔ*8Äa)„¾İÌåuÜCB»ÁÇ Lßä9—Qÿõ¨ÏßãE¦°½Î§•óWÅQ‡6
j8¶5†29oå°UÚ“"™µx–£æ¹¦ıÿm ¿›:|Œ“È{Íèz{°XAâD¾°E0èo.¬ÑïÑ‰Éò¦]ãÏ†Î»ë‡õzñ¼á` Ç·¡œÖ3ŒÈÕpç”â+ˆÒ÷²ì»Æµán”>Ëû)ü4æİEºGƒ˜\‰áNeá”§›sœyş‘÷f‡pZ¯ş	­_oè&­SŒºA§ûå"H°ØÆAHyv<,|–©ëüµDÁue¨ >´/œª×È^áB+à)Z'©K b«æªœuâ1S=Ô!œÖéÄeRAc²Är0¦<óëœƒÁg;ÈÀö™E|I¬bºñ•p{Ä2ƒ9]µ:ÏwÀÈˆ.äÇ$ÉÎ··5ÃÒnôs×"òARÔí
6"Ştì0‡@÷†õè'R#T&d¸çV(Vâ’“YNá‡7¿Ç7¯hé’¥ä¶Ã•KFË¢sæ¨j–ƒ§Òÿúy{a¬‰ˆñ`÷•(|mßXáÙL²Ó±©ÜğF‡m—±&LPà­–Àó¿³–it`¨‚2å]€ñ®ÉO~<”ÀğEjl-­u6šLLÈ@RÅk0Ù4ÀÌVç«±ƒùç3ìIÊÒípiı«‘´Ö?Ø” aı‡¡MlÙ©k”R.veÌT;öAv'ÿ:ÃŞ€,7ïí¤31z›>wu÷¡×"w>ü\—Ä£¿çğº;ìªØˆbéP¯gfFÏì|wn‰ïÒ»Æ„Ç«*ü/Hê‚~~^‹·¹
‡½š*ÄT½–Éø¾Éªèä’ìD¥NÖ¾THµAĞc gZÃä…ÇRt±3`Ì¬~01\Ån{]d;î6o´I¾y“á€@£š"ÏPšjúŒËĞ)v¯9•Ü×W/:˜òBüOVAAM¹T±¬0Hø×ˆQItYö1Œ¢xZğí¨³¼l-jÎµ‰ˆ ›Šñæ»…BVÆâdğ<øÉö‘¨E\˜’¯P^µmt/º<Kü¥TÌÏ†¶õ±nıÇø¾xø	3Ş¬ìæÑvå¦,ÈËt*Z/Èu4M(Ã‘âJÃXr„Ù‰ñÍÉ¼ÜÿÂFÿ#†Òíª°!bÉm}ĞæêH¹ö6äE^šWÆl…	C^å{Á¯À*âIGt¦ï3Ïs³—?«ôÏ1:7”  X[~)ÇT*>03©'Ÿ¢I9Ôzs=µdªº\H¸,siŠÓdÌq¢b¦IïÀ.¹Ã¢g­9Iøğë4_eö¬îÆ‰ôÓQªÒ@w¯¸–z æzBß#Qã•2öûYC…Öä1¬Œ…¬eQ5äwÕR‡kİ‰Y5¶Î 3¡şbÓô#sØ|+Ğ¥Ûbà6–ç]Š{Ùs·•Œ^ñ/âÓ†Öaêv›¨ª•]¦'~> ©ªÃÒ>¥ò›˜=‰9‚57Éó¸Šûa,V»[é“i ©†}Ğİ	‰æ“uØ,ú:W`®
wŒÔKÊG–D2”Vˆ4È›|¡2!|é(ï:} øà5|g9–ĞWÚŸw‹ØÒI ¥ †Ÿ¾
gGôåëuP’—%Òèõà¾’,mÂ¶ê@c§Eùf ¡œ\¥ç|(¤îXq¦.¿@ô+"úó‹;hÖ (›èqmzd=5lğØúëxß¦|`pŠú§(ÏÅ># Wôf/éj»ú!<…™‰noŸÆOpÏd§=/…(SÍsFM*	“ÈÑìEEİGğô¸0^¸hsbÔøğş¦O½¤Ş§æÇç}fÁ4Jš±æ¥t`šñ˜¿^H9:ª–Ë+Ÿ½]	•G˜™÷|ä†—Üj¦¸^?om»69C:86¨
®ÕX†‚+ÔpĞç`¡ĞÒ•|mìí”¹®|:¨™G¿Îş—G:3ßÚIİaŒù‘şïxO# 
	÷^ròYaˆÉøÃ³È)Ó`™MÙ¹‡»º’Ñ`l½…ñ·ÜP3&›-_^˜^k¢Ï%6†ŸªÆ÷`V%›lMàD×lª{WtQB>áTùèJz\?üKT7ÌN½mxĞì¶ïòör¿Ïê$¤Ûyéäu·::™5µ;T;\Íc±>x¾ñR­UL»ŒÈMÚ Ğh-ÂV_ù ú”!éØP‹Ì®;d¢E&2×ğˆ ¼B$jı[Õ©Ç°>G?JGS"ÍŠ™&H-–/f)ÏQªà)ºß×Æ«&p×´äæx™ã˜oÃMÒ%Hh¸iìÿ^ĞcÕõ®¯«+ÂCm ³FQ­ˆáE£Èhw2;W·&
,é(Oø³QEâñ-[ @
ÚÀ‹ÜÖñ_ë“$ùã
ÙÂi²ÊÁ°ÃPÜ¯— ¬Hëó;,2¥Z‰3­Úw×Ô:Ó>ú­M¼»ìÆøÓ‹³—XiÔ’wıÒÙM&Èæ8Éı.R¾]²*m¼<än*ªSw•Û)×µ$ñ·IV˜xQwAzŞ×è’Ç‚Nï`¥ÄzÈ)‹Hu13}u‚ÛC¥şËïç‹Œ­@ŠO¹„Íç.½­ôÃêéùì&»>ƒs“PIÏİİæ‚±°ÛÎ•n™}QûÀ¶`ÔÛÛŠ^¨.	3¬Ê“ ‡şUFİŠlÏvÏ”<û±ù¨GŸW
j‰+i±³Z,4™¤J'+·kÀî"fLÄ÷U™müä¬0h<[Ë£¿vçŸÜ	1ºV0ŞÑÆ[³/³É2Ù©ªrS7ÊVt?-ÅègäÀ}÷YéU0PóßCL 5y´7O°¤`LQwšôÕ¯€×¬$³¯î×s¥_•èp³{~Gö	îAK(0»5¶:œI2­^•PÆlïiLGc4e4ökŠ(SMØn¿î®–íß‹­†jY˜î3(,
Å )%4Ê’6-‘1m€Ã7}>İŸcCçUä|]ÏØ"µ'C´Eø‡bO6ôQá0A´ùµ`Cµ€Kp HÛÒFaÌ?±¿)yz4Okeôö*¹B«Hr.q‡u[û¨ áİóò=ú‡»rõ·UbÅÕ|Í¿<õ²ˆp˜xKOÂÔÚêÊß£%»-ct¢<-õ‰ÛqñÜün£ØxjÜ"èÏüd¯¥å©l_÷2òæÉ'I âZˆ4¢#—_xòşÈ`Õˆÿ=ÃEVàãZ353ã!€^5?ÙÇJ9y 6i×{s¸ ¦¥ŒòxEª˜Äğ@C@dãZå>2ŞŠ{ùîa&ViÓpÙb‚2F¦‡ùóŠÇNÑén™ZÃ&}çÅe¯À&)•¼(ÈµíÅ–ğ×½"´°¬LeŠ"@‰>™	ª_P€Y IdA·Ãİµì1ğ’áªtÂT_ÏõŞ€èúÊ¬içëq¥  Nmû—ªc
­»PØ^§jš<ÈÕ©¹ß¯×¼ûÄq,š99tzÎ(¹ø“şœ–  âà¹?<CvÛåW>XíŞ|øHîñ÷Òwå-àà/ö©`ì© ©ŠWi µ.gqªd%OhºÛ´Í—Æ0 IjŒR¡~&ãwï`Ô-pÀÄÅÛœÔ£÷>Ø{¨úÎ	´×Wø!‡Õ°2+ŒÔ²aÛ9»	u>{5şĞ€N.şì±òW	ÍbÉ{ú5¸g.z”±‹úxåŸ¡ÍDùìaŞ*às¬KU²T†u@36®WÓjÉğ0®‘ˆšQ¨|¡A ›â_­¦ÕH#¯ròÅâ’6—¥gPáÂäC½ß’ø¤'i!H¬Ë3¤Ô8á‚ ò	ÚwªÖ\¹/ú²åâÑ¹*ûğ)¯~OkÁŒÂÿ»?™×;çcx”¶emàã­²·[«¯KÜé4FY×¯
ÏÈZÉ“L§ ‡›™Ğ>€˜¬õóZ2áÑOŒ›,oÒ¨xšxè ®˜¿Ø¡ÇºÌ¦‰ª—#xZšÔ‡íûˆffºXKûÓÈPÃÌÎ£)ı§Ê>  nå¥>t
0gmwÇ9}Œh®6l3tDj—ùÕTk{ı$„”ÔA¿}blJd2Œ_·ÀìH
+Z)Q—V5[ZE…>·äµ2‰Ri)Ì#,„ğ •‘ºu ÁB´3ÀRæöât.gØ7R9³l
O`XèGHm´Ğû6V?N^<İ[éÿvê‚.ëzş™XAÈ¶t·¾‚åÎ~\Ÿ4è€&áHE´éÖK+Ñt¶ôà—?fôÌ÷İ7x}¸HÊ›¯=;SY´XîaĞKâŠ¡5õ"Ş!3'À×lÜ§”f-Ó$A@ĞG_›e-Ü$à5œ—W6,at†GzŞ!4¼ÁÓÜ‡$^,å­í<3+)\ñqxšø³@©ºXŒò¤ã[±zC£ò…‘33`aî€æ-rqV"­sÿ.‘Ï~?²"."Ş·éèbákĞ7·^ø¦I‡{œ»ÏOhÔßÜˆLi¡lNS²ráéÚˆ¾¨¤è¹ÔÛèèÇE¦8ˆÃ#®Œí¶‘R×vÛ[ñù0•Oå½LıaâÍ–à’·íç˜ÁYŠ”,8é>´&L_w¥«`)×I$}«š7m «gúßN!²›\ıdì¢¯Ú×ØÓ{«ôn'ã­…¼j7ÏˆŠ¿8kF™.4¬¯JlæK p›©ù•:«k:q¼Æ"
Ó€PÛ…Ë–li xÉN²ş=p©h…DÏó×:Ÿà%Ù*3˜zˆ7:Á5näÁ>Ó‚’¶"Ì9º7ã³Ú½ôR=*¹¯ÒU¶•­Óèæ¦ßêÃä ­qD×>O„ğ2*-¡]RE0QsûDT™>y<Ø·k¡šÍÕ×m¾ŸŠFÑ¾¤Åóö@ş_/6İÃ…bï—ér‡š«6bàÎ›ÚdWoÊÈª¶D¶HèÕC¶ØĞP›3õ&âì‹.>.“9l5jÏêxŞuÏ9«ç’½üj­{ZÒ]OSİOıª—1 Ë.QÇäìMÚ1%&L®ùQÿ¦gY¯îLv?Ñ0Ï·õ˜Óñ¨s±‰i´BfÖTTWtû(øÄ®ÇÅ0qı¿™İû‹éÖES—iTîÁ­7aEé8i¼*{I
ƒ¿×ãuÔ1Ë¡R®ÒëÏ¬Ídñ×h•EÜÙ'ù]xÇWÅ ¥F¯®Ô¿µŞÀÑe¡7	[²P‹çfšŞ	u‚Õõ0˜Ä|2`zÆA</ÏiÅjš5H=–¨Mhííœ,O3‘|åí6Ûy¸)j”ƒéZøÓ=Š÷A g`HıÉöğ{§6V&Y°°>òô’F@xĞ«!‘(ûÁ€u£½åùçç7Iß?XÌôìEX÷Œ—gäPC¾²/qºl-á÷Úuõ6ôé#Èwš:04Ó Ó.cÚ’ıºE·¥+R­T¬79Ñá\VtC{Öû,Ûz*šƒ¸B‚·Ì}/W_Pàw++hbÀ¨õ†ª‰$UP†7mú»ô±ŠJl¨¢{«6ÄİÑıÕó“¤¦1üş¤ÑBD¹H¾ÎÏvËÚşOY|
äsM³¦ñÅó@¦I¥@‚£³jäpËÇW8á@AÄµ@t`zóÙå–âCî¿ÀFË}BJúw-Ú&MÈÊşSë¨VèpùJ…iwcWˆª‰/`u$Ùåñy‰8ä†xåA¥ªBlk¯|x˜(°eßW‰Î2¹.Wõ$¤c;gd¶.O oQ²‹§ûÑ/
´èÏ×åÈšY)ËMät	 üW!df&4ÿÆ‡—3ÌJi¯¸«ÜHgŸ²cNS:· •¶g|f,ª•–[P±Qëj,:¶<¬±x´ùt)$M¹õÏTÄ•W–Æd‰·r–ÙT.å÷hë».ù2‹l_+<–â<L¯¬ìU‚ş{nß]wUÍÔVæ¬…CÖ’Z },éfÂCÆpm~W|4`µã§u$œø©í·'“şNO*9¶?‡|Ó;S…sÇeİªÚp¨/ğ:<İ4]ÑÅ6šµşÅ[.ûä~xÈşZ€çùVš"æC^»‡©ş$„(‰åPÕ6ÅõÓ‡\!§
°²1O?*-˜ÿµ·Ÿ*b´ ß ä]‹Tl5w~¬ˆ7´ì}r…9à~4¹Gâsé7öùöi*Á’šù4Ó^,Ié¹i >	‚FÕPd:qÂNà•¨«Ë85ºÓ5ÇTŞK\£¾)ËÇ}&Ù8v Ç-·¤s8/¡K5MİCÂúLbÕó*=£?ıÚ	ÈÕˆÒ òZúÿ`ŒFnÖúá~ —† M]pßxùü8eœ'`G²ì×p|–·Ã‡mC"¼uğê,7R?ÜcesT•=›4I¼b*ŠÆï‚:P5ø<LxÓ„ı­¶N¶"ÕrŠTÈ¯3`Yuk‹9{o´Û½Q§xnğöÍCÂ›f³rª]á9½ØÅd¯†m-ûAyaæNC1Ò:SÀyA$M@(så2fTßeCñy<J÷›™‰U;˜óî 0ëù
”‡òÄcˆê¹²Kz,wb±UÁŸsã×Ÿã‰":G¢t¢¦E #nãe DCÎæ” Ç­ ;™¿Ÿ
„óqTÆS6+;õ~Àoÿä€Á¬à-R9ßK¸aE´œd…SË[ ¬È üò¼a_É_äGCOÆáË°İ2ŠSšàM |F—§ ¼W¡FoÃç±gHÚIô2ZôP~Ş”GØä\_K¡äöúŠî<dNIûîM½Oª@2®_éuîg#t*Je«kÄ3˜¨ìb—?4Ò§Ô—§n?¢t€*ë«èj'¡øÊw›ò­ç`·Ì­.6Îh°móTıæQ|ÎÚ÷£{ÁñÜ&[ãN¥›ê"¦3„7
—…EZáSEÏOº»övugI– Äq®UÍâXl*}nèÇŞ¨hTNÊFG¹’^Ù´XÅñ`®Íı›ª¥ÂÒ­ÅLÈ(Üä‡>pº÷ìQÇY j®Aªxñ´émh I–€¼[ÿ†‹˜³,™@Şª,g~õ¬*k4•\u‘k ¤ŒgízŸC°ÓiÁğóK# h-„!+ÖÔ®q‡!,œGuEIÎp)#ƒ fˆ¨JÁ/0¥8·	JáÕËÒzºï×’9J|v¬ŞŸœL@ße+{÷äÅ‰É‚ªûÎÛ<Â½3Ë¸=GdƒÃè	W©Óæ>(íïÉşì_©›Ğ˜F+ÇwŒ÷Ç¶ËÍÌ"¥—f¶ìó4wÿÚ*â¶€7»ôµ=Å’¼á2FüçbEØ,}Û†e}âTpÍÿ0ìÿ/¸Ø©ÒU"]”Á,F–æCTM9›Ş ÓÀ:9©NŠNkZ¼•:`Ä:OÂ<4cÉ×ælñ	Q±XÇCÎêÍ&ı0ß$pR½!ú^L’‘°O¯çßîVÆµ³îOø¿À‡iÊ)Æúòy9@D¦£&»Y[ĞÕ”ï®¼\¹’~Æ¹ / WQi H]	tFÇAĞX¤2Èa­>©y¬I-÷>*OY$óÎ/-v¨í‹ÎØ¬Œê®8‘´À}s?Ø(xf«ñÛ<Sx(2s~GÃFŠÕŠ0şÃêÆ5Ôb·óV×H•–h½¾«ˆ’â‘ãæ'Äy°8¬NâàÉ¸TğÚ¤Š™Ñ•G©É™r˜T&ÿaÿÏ.7íÄ_¾gñ÷|ÊUÑ8¦Ê‡d\Ó2™ ODlğÀº4
à,øD6£Aì7V-äWŞxªU¢{¯Œ¡3°<ø×W®Tf™R´º·•¯{€¶±Ûv\·X6è([ ¥.Z¸‹÷°ıâ;¶{Í<M[ş©Z%_‘B_Ş/«æ¥OîÕ¾ãŞ„‡ÈŠyOŞÉTí½§€i©lHürîœèŞŞÑèdáz–dìQfö›İhî“Ÿ­»¬)©{íˆúÅRú³êÔÙ8Àc»•Üw^«*¬ûO÷X~<3˜ ª»í¶Á cÁK«Põî¿1.h4R°‚ùøf¿Åd÷¥EÛº­xKlQ+w›t¸şöé•p4VÏ({V›eín¿>,):†léÔYáº’9I¦¢RZĞÇ	’ïˆ`OÇú¦À±±gÔjXT©Ö¯Vù	Êää¥Ì¥ƒ‚k¦®˜N¼gp1£Ë/ÿ\ü+…æ9ô B7ÇÒÊ„›ÉtßQ„;åH[z¬ªõÆ@>5uçÕfWéôº”r¿è/¬ôë‚ävLg#8­o$©N9´'<tÂö{‚ƒxM§Ó#¼7Ègğ&ÍÓ a?ã¿%ô¬@lU¡ùÆ%ğš¾@­)nª‡	Öˆ]‡U&¦ŒÑ!X·8SHóˆ;XA¤\ûøî6o¿ØèØÿ;¤4³X…±Jªêòºyÿ}£Gğœ¬J¢Ræçòi ‡êY"ãbœï<¬MŞ_p,m×	Ä#à‘Ğ±<ëPÂ<
¦v’¦¦†¨·š'|b:W„êæÈß¾'3D–©6ßÈi0hûõoÿ‹™ŠÖ=µ¨.[O³8y<?%;âUØÈ(?¢ßz/íÜDù¤šœâi»×#ß›Më4iXnğÈqø!î "¿‹/.i¦jtÍÁè.ìÎ¸tÜR4C;IÑ§B@/Y–ZÆ‚u)‡<.³÷Ç¥ğ×,®NÎS	ª_ÅŒiì(NÇ@åëïF@`qçú.Ü|YQt9|.ÛDk@¿sº­¸K/¹v¥ˆVŒ÷­ÁÊ?´zø¤ª—º¶ß9SŠ[cs”¸Q™êã®¯é…—Û2GTlh,{¹”®ÙdX9k\tMĞÿ5ı¡XÏÖ¦ù•W mHWKÊ£©† ıßå¦Ä¤!Ş¢Ãö„Û¦Imc6AFâù7¾•vWFq´xñ¸Ûbë¿FRWKCáÖJ7,V$úŸc!‰ÅP&Ÿş§,|òĞ—£p Õ„'ßc;HxÌpçZ×§å;9ª¨ò ˜àìÍbBK›jÏ…k¯’•\%;J!ôN%jşNM+I”å´€‡Ø;{vRËp¸ÏZk	úWs_Z’æ,Sñ‹ÕL?‰ÏúŒ•åÚÊCéiD.9ØX›áÿ€/ùò\zµ6?“K¨nş¼FùªÎ¶
S jt¼‹Ôå¡×)PôeABÔ‡š¥Blßß‹§cü ³®ŒØKYË¡® µ‡3ˆ…Ş”`0L½ <i>wÑP›~ˆ0uj$ÉÜK·d;aw¸]znòBœ¹ësÎVãuÜ8MGÍ· 5³e€ƒ-ÏH¥Š¶‡n±¡®¢1g;UíúlÇß&:1¦Œ«,2°Æ@–×IdbÄCÅ8ƒíˆ­°I#gæ)·šñ"Óˆ­x½Ëı¹‹Øç´ÂAgìiä !„Ìß²=d$…÷/n+·mç0~´8şrKl &:›6u#q~}%Ö½'ËTè¬ZùÔ	C\>ÃU3÷t±ùûal¡£¸ŸÁ …ÉK0>àÑ£ãõUôÉ®zâ2©\uû… JE(Ùã_ñ¥¤w!ÁÃ694Ã)ÅÔ3`2
’|tÏ4¿¶W»&M^çÊ—iû€æ¤à’•;è#-qÉŒbë¡Jß7ÓöÓ“P¹ÈP~ò™LJÕÔDrIºDà’ñ#Ñ¤µD 8méò"|şNñ•ò´uiHƒìK’×ÅĞLœV¹–Æ(¤ÔEøòœ¡Ö8ÿ(E¢I>¸ôªFyS—ßí†y¥Å9Ä‡¢¥ı¿ØäŞ}+™†#VpğvN2évÿµ¾&Æƒ•¡c-6;¤áĞ^l¡Õş–ekù)S4Ê8@~ºıLV¤1Çó NÙLŸa÷^Ö\àƒ</Œcô³½h/¶Äcri@=ûT"ùğ;vº=ÂÍ€´l±ßš•.e15y‹+ZaK¸ŒÒzÌB:>f–şÙÃh0•»/r®íŞÚ£sğ¾ù‘b^Õ=(ù=š‘Û?‹AøõŞØŠq’ıÚ³x@éÉÃÄA" ¬3ÌLnv+­P±Nf'ßŞäíPÅ±wv7Ù>â ÚØ^ó‹9zÉ•ˆäÉÚ¦ã¹WL~8äN±ß“10[™í„ZŠÊèØøƒHÀ‡…9ZkŸ‡·Âyä¦m‰ËÖ354E·…õ j-;Ií¥ê^ºİ#¸•¯•?LXc%«8sŞ_Ğ/°+–uõxÍ 	%‹Ú´áßI­¥Œ$¨MoüpwAÁ{eÖ¨¶VQ¡#46djŠf#3o¶te@ÚÚi†Ÿ¦ØF@ş¨Ã;En=ôî|(	ÎĞógR/Cj0wbkys˜3vë+ä,»J’ú;Ínó×_Áè&Ï¼WöjâM³÷b-_ã/@"«vyª—ó=â0f<¬+XênÅ©ƒ›‹)_t…wst-ŒğÕvŞYvãùõ7B®0O}cÃSÖ"zçû-@–èíÒCr,Z´R±ğ;Z-3Bµ1‡#°¹³ã®‡•Oï‰/Ïéæ…fÇĞ¥Xöl¯ ¿ÀÌZÄ^*…ú‘KR,"MT«d)L“IÍE©¢Q£ê³!wÒATšovc€™óY0ÈØ¶¶©~Ášy «U’\Í³E¦º¤ÑZñ§áßœĞ~ù0†?˜¿æ¢ï…ÜÔ^cˆŞg=¡nn-yÛ¥gˆÃKsPŞ½3únÿXCw°ÏÖGÒ“¯ƒıRiÎ|‘^šÊh‰5
3ÈÏb¨EÆ¹¿|[öÅ°‡†öu?¶ß¡˜³ƒ"ñ’ò›â ÜÜ¡7‹Ñ“b1|$~tn½È@$Ô)A»d–A'Í$=gJ¯$å.¸ÜÂï’¾Qt¥Y_CÌ~ÿ>Û™q;q¥Ù€.:<C\¦IZ¬w§Ğ+á¨O³àÈ&áTLØ*o‚¯ï¤È…V¡c›×]^®{¹_.×R^"Ó¹ôˆVœ[`—ÿcum¬ëûTš÷aåû³XùÉ©îqôŒİK²_£e5HgHm¶VĞµ¿<)¸eàÕ˜uøÛ”\€F	¼/Œ(%ñ×%næ®R%v¬k¹Ë®›_8Z LæR’á˜qª×“W3T,JR	g#…ğ1òt°ˆÄ´ËTfŠFwj‰‘?J%?K\ëé¾T**Ÿãò‘¥çÄcŒaøÜAÏ“ğ †çgJ6GAñ™=<#±\FÚÛä ‡o¾ÃZ`^r›•ëÚ/Zn)e/öÃ—è´†G ğFú<.VÜ2!ø¹]`=õÓ8Ñ[~•LùéWCŒì:?¸©“Oš©¢«gWÚÅ³¿pY'ft“áó@>ãpF‘§&H2~ùĞê\ä˜¹?!.ë0Ü½CT‰¤Ö)!bOâã.ƒ,Èìò(…´¹}–ÿ³xç]µfÊÂEÜe<ãªª#Õ²Wš‚ÙätWjÄ
¨ıéVùÁyM˜³4v¾¹“ˆfÓ\géqAoıS–.Ã—ÀjŸË	GO‘é[æ28-Ô§M¤íıMİTO£dL>[e…Õm£'	‘½µ@ãQ´3Í¯¶tw¼„$$İ´Œ¸ÛÏ­f”»ãÁCPƒATlfÛN GAíïy)aBÔtô¦¯h¸&Å‡¡ »€Î‹ñ6šU1FÆG¨‹¼[cüCÒ…aXLøØûq—Ï?!V#±—#Æ°ÿ¼}Ÿ•™4~q»ºcÍ¤ü½gĞò2P¤4Š‡…2Ì”Qã™Ôúöº•	S=àâf·Ï!ßÛê¯YÌtÙUSg]©¨¿PdÆ=ËÜßĞù:vzêºù!5	²—Ë9w*ÿNÁ4¬HÊ±ì&#6²<®»=Î\[qœ_G½foøêfbô±%Wñ?ªåÈïK“fàŠ‰§6Ù«B!«…LcŠÅÎ²èpF!Ü‹±7\µc¢Á¡]f ¢ ‚´uÃëqµ î¦rìÏ­„{¥ãj%ÌXxÓ—ÙÕ+¶)ó›.vğCç­=[ıƒª×ğ• M3‚+À¤Ì$iÃÓ—š‹cd£ı³+KÆ„™Í 4­Ï²Ïé9˜›4£”­É;[vN‡Í[#ïâ=£*€+8é‹v˜ îacÓCé—¶ÓöE÷ ˆ£!®º[ÎÌûÀĞ†!?k'òˆ¡åhÇàÄkûÁáµˆîp¸óè éƒÃîŸHv×¶M}˜r,×îpÅ­¢bêVı€/µxüÿ3ƒ¾ÜsWr!8Îë½O-¦úAÔ`˜áÒ´Ãë\Ùt>¾ade¹‹â#üŒd¨4ÄLË3”:[‚Sä|tˆıò½9_Dß:ÊQIªñşÛó=Aèß‘[¿ƒ€Uqğ!â¼ô^v¨tšx†´-5ÜJKÍª®Jjfñò¼×Åu¨ÀäÛ"[Xƒú„Æş_ğTÑ¾6|p«ô2şànú€ÚB0omZ’³ÉÇ²áJF;óË#å+H¹šçÈ;ƒáó½Q‘iößÆH›òHEfÄ¹ÿpƒ°,¼W­»—·Í¥×Ã·ıŞ¼vZ­¤§:ël"”ø©Í§u8¼ô×Æ0IJ™ÍŸ½F­2?59ô,vˆK3íyPîÔó,û©¯Mb”9ë´†²Yu»X‚»âG¤b/9‡ÖßF½8M|Ñ©Ò1îıp56C’Gm“íÿ=£óç*‡ªŒ¨&&MáE‡¾üõ	¯åÙi^eÀøäòKÙ<0<mš`(îÓM†vfÚgîüşõ:„Õ„P)_"Áòç±Œ7ßĞæ<»êz­UÆDI+˜é pw˜sm:'CiÀa±È×Ãã“áJ'¥O˜ˆjŒ~›d'gÖ<ü'˜ÔÕ£l`½ ¡]¥ã.[Aõ•Áñ¢míG-Ø‹rÕÒ9jxV=XfxP¢o­W”µ³Íò¼N°u3¿°Î‹Âp!RÒÌ5œçòTa+Ä~í¾¨"©L€$‰h1%ÿó”ŒxçíF­h;ŒX'í4±g¼fÛÄãk÷‡4>§Ãê:²uŸ®HòfY¦']Ô¡ÖãV~K“0éã.P)“MåüÒï¢åO|	"n†ºõ}ÿËY
DˆşÿÏ~>U’ÿ‚mú>¶ˆAr×Õ8å)ÚíºGEra$†\„Wüão!òXAN	p&¾R€p²H²‹¢]S"Óõje¸Ú?Î©”ÁñÑ0Ïïİ'KÑ÷9";ÓîhœûUĞœîx–´úlUZPÜ…¸İÖÇĞ‡†öÛS’B#!©­­X­Z’ 	Üh&jjvì‹ÇêyYªäEê”è3MS€5I;Ìß¶°ÈÊrEî&Ï¥ƒWçÌàpùkJÍ/bŠ‰×8÷ã/‚›ÑW[Ú†]°HÓöd¯XĞÿ‰´+ÎY6ì¬ÙS
QšÑ,TyrÙ½”JS „.æ¸CîË~÷Év“P!BE°Ñü—¼	}ËÚ‹³ç¿³jm§£1!>ÔÂ`›>q6d;ßI)ß¾¥9ª%iOâ±¦kuÕJ á1·Ñé±yİEKb5E
Øc£¾¶¡(×åğ¼6°ê\RâP
†ãQWfË0Usåxç" 3—ºÃÀê[È%›Fb-Â'Ú~&ErIPhnîô^~ºè³ñĞZ¨„JÅlîóÿœ¦ã=öíA÷•,Ø2d„Ñ|ğ°ƒñk[lKB[P2¡WÒ¯%Ñm™ƒ»ãâáııXäÚ@3CEmbX¼[$:í
¦¤G)oìj®Işö€6ÒÄFÙzõ!õ“gÍtøû+§Xê½ş»g-@t¤ÎZóŒïM·…xZ­0¶óRÛÉjºg*v°
nsÃå|èÈ<Ã›±N1ÑŒ6ì”iqô@Ğ÷'VRíCó—™“+üÊ¶Qç÷ÛP¨øq"$5Óİ'XOKÌù–‡BÁ ¶Xé	ÛÃKWÑÇ‚J­³Üiéû 3™ïÁ=@êÎ²d?&Á^yX=2ƒ=ÉÕ&X‰<‘ª “ªNF¦ƒ£ĞyË–ªp2ñ(e2ZœüåœØ (á#íl×“ŒÕ7¢cn‡;:çí{á
²ÔÆ´b…ğy§c¹İaŸK=×¶ÿfÑeäövÛ§R¶RôY½=ˆëËv¸g×Tß^p[æô9£ÀeÇ}ÙåY#ûé‡´¥öH×MÏ°¯IpC®u·•ğ1zçÁíxtœ¹çı sxøIC½Ù¤?mÍQ©µÄÓ˜v¼µcOkô©ÈõCô$´¦¡Ûòrüæ¬;l²$ÈĞ¹‘b™p££¿``™3AKì,&b\÷¢›‚rXçFDM•" BR_I[L‘Ë—'YBÉ0ßšFY!ÉsîcÂ¢hı8˜3Rb»‰ÂaøË[uu2ú´FÎ
ÕçÕÓ©Í8g>ÇÏHÄ5~"K¡1øÖİ×A•N±üñˆË  |D?øÿQ¥Zú'oZµïú¬¨`FÚwÅá
"
yŞnCù™yââZ‰Å ıÚ©Å¿#&È® )5µÕu—æ™âfªìsâ Áü™=—Ï®•<”låäÕUá^(à°œ˜šL“©£t&ˆhYšÎ;+Ğ¬ÜVÎ–So±d*Ø_ÒWş€ÀÇn£:©-Ê=›\×´^¤”¥6Ö¿Ñ3ê×®“¿´h ³Nû°Z%ÇN¬~ùû õ,xøñ÷åde¢	q‹`Œ©:ê=!>×ÂQÙœ„„>">ƒjD“ ma†ß•çú;~(ñeçVML"0ÓâKŸ&‹x'»‰t4/²¯)Ò'û©%ßÀ8EÃçp/©ÿ\º_˜¸çãòû÷b³Åñ3!û!àš›¿¶cŒ½túØ»]~ŒV/>®A¡#«TQëîã·˜ßK.šXKr>pk‘Îşíp=”¿,Lä'K »S<?ÜLå©©‹Kç|º>½vsócGUkİÀË,×H©­5ej/ZÑu6¬BáÎf õ¥(IÌpëÜá\£?^	4ûÏçFÛrÍ|ˆ÷Şk›Ù³IÇìVÀó×™T8Ö',;ù+¦E6åŠ×;¿pÊÓ·eiÍo…â_}Ïuµ [şeÿä‹ßªcJì—«K»;çk‚Åùâ#œØ¤úÌ.Kß'!ß@€ûğÑ†O êSš¾)ÊO¯ãbõÎä4«Iÿ³[¦K£ l
ew« µ‚çœ“lÅ¤µpré˜I‚ŸÍâ|ÈêiŞB‡7™Ì0b]¢Ï(±6Ã3ÛZmÜe¬Wôc,†ñÈğw6-s~£0V‰jä5°‡¶¦ô66 Ÿêß|§×}ı<pL¡núY/Cz$ VáŠ0„ˆšQjpÀû‚ênI3nIÜ¹°M\z–1Î™q FâöÇ_ú3—Å¾ú0êíuŸ—,ÒÉƒfòUVgˆå".ïD!®`œ`¨/×é ügšœè“V‰ĞÈRÛà+°ßgĞYÔ”­åyÌœ¬û]aOaÖéå%²[Šxî´	¿± =Û'¥–	1»ûˆVŒc4~Ãõ*;¼w%kıqø*ìæüÃ„ç'Ş%ns Ã“º”kÓåM·³Ô	^*Bg¨Uª‚ıMT¡ğ‘i6í­ŸüuÿÆøùŒ,IUÊÊ¿4á‹f6é¯'ÍÓÿCT¬uY,"oáœ9ø#±¥äBn§n¬yÄÔ¿6l]>ü¹9°è<#É¤ıÅÄõ¼OÊÌï=¡6L´¯°«SŞ«¶ç]8Ã¿l"€îõA«ÖBáV[ ˜OJ£øjb–RK1	umFßäòøáÜkfpÇ¬İ.!tE9şÀ˜İ–¦t@:å¥mà¹\Êqk\åÖûBH–y_¾ïæÕ’!z}vªs
÷Gò…×lû—F×=l(áé©“;K…biİ·"¤X$vË^G‘ª#L÷ú"‚RÔ¾zY€ã9'wİ:ªªv)((—Vô±ĞI#—ş_Ÿ)œşŸqf¹~‹Í%æÉ8!¯t¬MšL_±¾Næ´åÂ`ë—ë}™ŞŒÛS
PÚ„ŒÓL‘û+?·±p§6¡:Ín0çÀy^\«,c=ñ!ïÂ™Í†èŠ€ÉÆÀéåHOxpaU|w„»‹Ğ‚f2ú Ùı‘°°}aˆ™Õ‹Àßû>·b/ÊÍĞ Eló wÎœ²Q	bİ:7(F¿¤±ó·ó8×Iåù~Ï£¿¬«Pâ1D~bŸ»¡¡vwÉ	š@[«Gâ³­)äµM­;Úlª•6€ ¤ü‚Ùxº¦ M{¾gË6#÷xø.ßÌú¢¬7nƒŠök€\d]£rØqH ûHÓCûj«Á§ÃêYG²’è<;äoièdçBÏ7Mï¦Nİ3wy%ênJTX½›óc^@JÍ÷Îêƒã¿2Ë3†qn÷Í6Æ§Ïå8P¯N%_¿_À¹^ ‰Ã§‹“)´Óí›ãqÒ—J]âI¶´a1ıy8|Àç	ë£Âî{…c~c´%œl?êÂ¸×ßÚ¼âCÍp-u´·O#­PO*3˜vëöÎ‡w†­ƒ‡ãw“ºF‘Äd¯6í)²µr×iœ¶oè¸Òx-·è:Á%.@_UlœÁ&úÓz)wÈÃF¹÷0[²_ÕÌCÀD´$mÊŒ~£G6Wâ’lˆ+ãs‡qY¡»ÓÎÖ%T‰±òôË×çkI©‹<âñE2w“ ™ïÈ•`Â­o‰7˜{‡V—×HÑ<¾»çÑøÿ÷Ÿàì
nÚÅÀüæ¡ó¬Bçî?÷j;mVˆæœš	äóÀùÃĞ O`ü­?¢ˆjîëœK kìW™ën¹Ì&F w>95å©÷¨àZ¢D©Iup<¨ ·[Ì@|–¥¶«L×˜›Yë›†a¹/x¬š2Å&_)Oà½xÓ\‡éßIõßœ¬D£QWT¸v€·´ÄÇi26B?ÏRä"vÄùU‹³Àt=&o"Åş|Ä|÷íB¹‘g}Ê¾é¹c<Ç>IgZš‰Üzz€PnæáJM¥â áÚCøvæğTúøÏc›¡¿¢ì¹Ú2ĞQ31Y§{.F®V3·Ù"Á[mAĞ.ğ;Û«nH(FJt¹bç+œİ3Fº'OĞì¼ÈN!Âô0˜:c–®=_m³Âƒ®OMİûyb‡9-Ä=sé]ùşT s=ÙWH
û†.›3Õß×ùxTÏ±›Lø\Báp°%ïÁŸ9ãÊîH°hrSşv?ìßû›õ†ìB~.å™uûL4“ñ”{tµİÖ¹¯şˆ'tÆÖ£<ßWØ†;¦>ô®‚'ÃKbórc…øÈOUÜ)—Û^ç“bC]qJüC¤¬gİz[Ó“Â[Àp<nÖÉœÜ¹Á·dr~pXI+ÈeÎW"ÀY><j‚öŒºÒ<Ô’päûî‰ö1÷İ¹”Ğ]Î&3(EáÉLÁèêœÑad¬5ß\»*Næ›b!½×½Â\a÷”E‘êx§Ø,üÒ„Yäa;=lºöå|—7Én%Ç‡=ÔbûX¯\ÒåêJÆ6Ä­˜_€¾uxÈ{òİ’~äfˆ²/_©o8[>Õ«üXåÒ”¾.¢—”¢ÜzK‰B¶ÚàŒ‡>ÏtğŞnŞıñ°ba¤Ü•ßÄF1*Ë„Ü"0•n“T4)4–Å…Úï û|vÎ('%pGíl^›µŒXNñD³`|ììU_&“Ñüc¿|üÜI-Êw$šlz“ e[ã’>Q}·»D)”€Å]…ÉäLY=º|€{M—ôÀ©¹`Ù†$.Ñ	í4°«–+rí‡W	ÿI—ê%ËÊ„¯Ç”š¼‡%+öƒ±Ä…Ï´ñğXzùÊù!vF'P¼Û!Ş&-+»Ñ)¬•Ì»6~œú•^-s©lâ]æ	…=øŠ¨æ.‡í.’ıoÌúÇìf»›ÙM•È"v?é*«[ÙÕ«<\Ûtk[!¼"a9`Dˆ¨­WM	§˜;ëxÒ§e[°“£¸-Ş™‘¥ºIn‘T·dô¯İR?1ÿ[(‰úêœm•báPÅF0Ÿ»TêI«;•€ìS°>¶Æ¢Ê¹˜E‹F`¹Çı}Ppf#ÓM‡gVŠ`Y!˜Ÿ`şŸ?W™!ÈHk¡"Vb¹aqó‘ÕŸQÙp™ÿ,X€ÖnqsÅÏM'QÖ£Bá}#"&lô´,Q_IÛ1w˜ş†mqM(ÏBÄÄŸ—“/¦ı4‚QÚ¨%rÃšL%ªi×†Ct/‰œı,Ê¾^>FBŠ~/•æ2@$r¢nI?‘bë”Ô¾bş‰)Ì¹¯ë›¹U¢½†§_±u²ÁUÚğS’ùÎ¿£‹?j²ÊvŸğ•ŒÃfäà¡$oE~ÚÈrçº–¡B¨šT“¢÷A[eôAÙ“1¦Œ¦öqD Ùª#6ÈÃv6ÎÚÏI–ËjWi“Kn†—×7$nI¢!ıêåÎ÷Â½âk­0Ê¶"ùÍ-÷HĞTªkÓá½ó%B’tªé»“õÓH¿Îg™k’ÚÊyy?%â¢Åà›š…ª>Î¢øs†DI&éD{9Z¸u¸Xs•Z0¶mtG†æôØ:.Lnn>® »R.
<áÙ+!#ZcÕ7×Í:ÊœrğbÕ`v´CĞÓàÜ™4œŞs-ˆùR^µZÅªO—‹´ö5$ákh•íóbÔv†ì¶ÇDª¼Cm½>?åúnŞ÷|>¡{è³Ê³²Qi h£@ëV9v»Ug99>Ş´a6!ßÊ6M’'Èä˜c“ÍYÚ'ŸÚ¢cO©åh
gå-`Ã¦€#6Uüc¬©Ü´Õ¹Ó·¦Ë%]fVª¬sµgåœˆ¼]{Õ%YpÜ§WªšMÏ$'ïíU\eë6`ªº½†28ÈŠa4Œã°vÓ# ·Üé0õã dötBHş ŸÈ®ŠšÉ1+ÉWæ2å{8°pbéw#¹@qwP8ó€¸”†ú\»øš-ìq:©ûE3„rƒïõ„¨MĞ™gWòZ‘<æŸ,…2V½–3¥ÌmşºäAÖG&0òÜ¦„j¸3ˆ‘ ÊÄŞ!’¥Å×ĞÕD»ÅAu,Ì§fn¦á·G‹ó¤…^²N[%Àhcİ…ïqY5…éÏœB½O;í»ÉövéÌÇ»ÙšnZKşĞH‚èØDOtÿÇëlç«é
­a{©ü˜mCŸb„!é²›?Ò·¡Ñ!|åo<PKĞİúÇÿL%°ëB…G¹<‚Â6å¸©buë›«ğ«›q[‘»ğ]uæ—ÖK.°ğq!ÍÒAÉ•â1¹Ì…v7%¢J½§@²¶¨9´U¾D7 Ù·@’ßà'ô[;ëb¬n÷ˆdUTxÀ*³%|?T{d©ŒEaïµ$ÖáÁUñ¬8]=dŞC÷¡óÕÒp­BW›¡Äƒu\ë|ÅFë_×3è“1mËPN²}„.†ö²š‹l¥W.øÚ£÷ÿ#ÀzÎq¶gŒHD/6I#õ¤¨Á*€Š „Vş5ı\ms/ácĞe©×¸áÇÚ×o—š°_ü»¯p¶ó ­ue2f=?^d‚ÿlùå)0Èù~Inòt\ÒõàfIĞİ¼*Dä»§÷6ÅşBæ]Ä9Üc ¶Ê–a˜“>ı‘ŞJå¿TŸ(¯Òn¯'ØäB&À–¬°È+öÌ÷!«R>>·ì8}É3M?zeÇl _)UYq°Ô¨^½ÅŠÃhM«Ekïeä9H¤ƒçÎVdo~7¹ óéx‹†ÜAÚïw,÷lw
?‡•^˜D³ ±
¹µv$³'´K?¥ïÎhgQ{nr#Ò¥Lc3àôåªB äÀ8éG€ˆQñî5O[´u+ßTõÅT€ü˜%MÉ!˜½–îŒßkäÈ÷œKRÕ<uêC€ïÛe°¾ÆW#	~&¡J1¾Ô÷Âq~$p·3º@0<ò˜¥Ğî*èÖ#Ş5ˆ½‡ƒ4˜XZ÷ÜœYsAë:Ë0x¹§„×meùø¹ÑæëşÀ)›ìÁ T
¥¥ÏF¸…«ŞëŠ´fÔ…ıj†°ÉSà¼Nz-²m‘D‹²^KR2Ší…É ^\ô ¿±è+íüİ8›ì&–b(÷åXTqÀ,¸pÍß¨rKÏ>«&´ª«Èÿ:ç™ŸüÒ@_¼™5Z×îşG_!`¹¢q‚„×ò…Ä«(å®­;Éİ$‘ÇĞöïMÜ‘šğÙ ŸÜ“–nì,F. 99Üè²Æ…à{”|6Óz¸4}hv[±îCÔu9drZLI³äX¡Có0{ÊàcØ›‰îùšCo².Ê>¡1œ§`™îÚšÇ®iÁœÆãıœ˜‹Å5IKPí“w·Æ¤Ç¥-,Q†9ßO•şãó™ïn!€PÆæˆ5¨)%ˆğà‹ëdOS©@(á—…ïÉAÂğZj÷°ñ#^^¾(]iií7ş×kYŠÑĞ¯Ñ™¡¶Bã—ş”9ı3 ö3‡ì’™Ÿ;@7ıƒ­¥suµn-­:t0’¨ˆÇ¤ï¦NÄ§ë‘ÑM<‰f2öFãü<wa©k¸²~Qax“ŞGÜ<ûcûj3/ÀHØıáÿ‘1PÀ[¡»AÆÓÿö®I*} ©çn…ÍW]X˜Ü«µbµ\z‰K5
€ø',WÂ–A‘øÑ¶%Á3èÔbŸ÷rE¬Á”LÑª¡Åø²]G×¯9Ï81üĞÕ >}ğ«•ªã1Æd×LäL¸ÉêÍÅ1è.æ}àeëµŠÈ¸6Ï ¬û NĞä:‹¹[)İğ;„%†[ÉAÙß6¡k0’Ô$¼ï
YÓv–øË–ñ(äççÑ_Í…ÚW¸{N-ÀcÊ¬’â(ƒˆv;©×Käâİ²Ù»ÆA´’±A‡Ø¤şEU¡+idÛëƒÌ¯Gé–ixW%Sì§î5†ı)ØQ¸ƒ,tN;5$›m‹? bSÃÅX8Ğk#´yße)ŒšÇlE¶àñÍnñL‹ôl·¹cNev:é!üK/TÄC¶{Ö¤ÖĞú·Bü,lÈÅ•T6úÑ	ıŞ€äIG×n™Ç[u;^)z£İŠ&#ôc`òCî³à[u½^Ê…Ëñ)¯êG"œöGGï¦ÄÈÈ8¥`¥b.:Mqh•“üURÿ5Ù°'.¿úá~š6!…û£ğqø5
Ìsq>òóÁ»æ.Öôi\QÉ¾³çœvƒ¡Ëänz]ıGúÆÍtÒC{İ(rÈy¯^GÊ¡¡pÖdˆÆØ«ò/õÈM],„n,oGÄ±árœ¥¯ë2ûî24/<½ rÔ.+¸HÁW˜‹ÎØmhRASo"IEîë]½MsMÀ×ˆZx–vÌ ûp.hÀ?¦É/úÅB*¦À[zBl°4z–Œr´†‹tV®O‘şO¨ÄÏK÷&)X„ÿfí5e‹Z©q‹±Ê£}Iª"..(\„<İDMnÅÚü¡İÿ›¶PòGKPŞ& Ù{°óáÆ‚
uBSÛ^)q¾eßãáqøÒ¸¦¢çëQ¡ÉĞj°ß7128KÌ9çÁDfJ+şÊG£Cğ*§ı=KÒÂlí×É‘!;Q ğ;WV€„âä– ï]iu»È_é<Âb®Gcfæw¤™Jq¢dÌŞTTéÄ÷ÙÉŠO§3eÁóIÃ§Tv¦ ?,¹g”ŒlTbÕâ‰â¢Sæ«”×¯t ó‰<Ù¯7>ÓòÓu‚òQnerm–ÈFmúº¥Ç6qTñÉ\©÷¢`äÒ¢k;T9m]sÊW.-ı¸~sÕµ¬%ªÑP¥‚L-ÃÃ°Ğd!<2*j-‚wf”ŞM­È:=æ$*¾ãŠætwl¹V¨°–ìJË(Ù9Y)îQ½ÌûgªŠ‚¸ª9ûU³æ9o«j¾úÍˆ—¾ARÙãÚ6\`Ï¹®ãï›™JÁ›Ù.GâƒŠÙ¾ÏJ²÷¯ëŒ€„šF€Oö‹-]yo‰“ÓOã/ì§_L@úZ°ñCî?uCäB‚¼Ã(Á¼ ıqî ıÌfœÀµ‘]	8kd &e#LÖ 0óáª?1Å©Ì¢(,ª>ùŒRFdc­îê®¶SCØğF"´4ÒíF¼÷pÁQ¢À(2W‘ğXÑù;	¬H‡ÒcHı.7©ß!¤[ã•²ZDú©j#ƒ_ÿüıûBÄ`Ÿgõ*hkxÜud¡Íø¶é Áâ1¯…·uÆ™Ş-bY#ËY’ 6bCİÈÑ¬X’ñìæ“P‘åÃ°âòN:¨õÑı©Øw¨EoŞµØ`ÆäauÀa¬ÑØH1ä^^å^ÿ„‹ ç´§Ò™­]HEdûÏÊ^µ÷èÜ§÷›ëŸÅ,Ëñó³ôv’çâ\8#S³Jötüÿkã°£ºÂ Yµ#•àÀdr¹äãÇ±ÿë3füøn_ó‚ÿÏ^’„g€&Ó6új’ ı™r®y }»‹9±-í	^’K†Ïß’S)Z¯g©wMş;x"½_á+Àš·Ò7úxˆ˜â@Ÿs¹k@T_8pøñO†¹I…w`IĞ
-î.	o1ôÃm¸(Š@³»GhuÉì1Ñcõ9/öK{²Ş@å{A'Ò£`=	ÅzšµñU¢Uiè.W”r²/Øx±ŒŞrı¡JÎö>Mv‰¢`ìUaÀ®¬n^gÄÆ4ÉW=ı–¾ßœ‡70Ë4ÅRÛÀèY½Vç[z6Õ÷ÀBßS× €ixQ-¦çêNŒ‘n¾wöéè¦_J‘ä@ÏeÄ‘E¶Cñ•ßĞw8#6§(üò§÷ìeÀĞ‰>0+3ƒ I˜XÈª¶ ¿‚CöhíO…ãé‹š¦ÕˆO<ÀŠóÎ)dÃâ¾–_’Ì8Oš!€øüøİ”¡úÕ˜Ñâ%=ìJWN¢EÕ»Ã
nm|òSÛ;Ü—˜ÏyŞ´q6…”'ÓñÍŒp=‘ìÙmLÎu¾ù¡ø&4ÿ~™#0ªúì›„ymèB¨ÛÑó?ËÁ¿}İ“è¬±3]ûtºªR¶ï¬Tß¥|¸¼Äø¤’îéÜT‚#(šs|—äDÅ	èï¶y|ÓêÊÈŒÉ[‡üú×›ñŒM¾·°™CßL=‚_¶¤syúo‡Jé´\xE"ÃÃKqû1O×}h4Ş®Ğ«§+÷»ùÿŠZÎÈ^¯`!€SÖÃœ]í©é08¤L»ñ¨}<}®ŠC²öwÿ8—úŸÆ†?”¸¾¤B¶®Ø"•mâÚîš×²KÅº5½Ñ§g|U­¯ıĞˆêV¶Ã-HôEM<®£›€7“šqé+²k6Ÿçî&}_îØÓFşJc6Ş6HÆ(ôMx‰C‰qÇ”›àÓå¼	m(*·Á¨‚Õócf°[#[WÌ4HVa-8Ö@e¸UH­û_d®1–×¢K©O“ı,EòïNAE»½Wõ
¢=¶DVÇ×:.éDİfÄÓĞ,³ó¬Ç§PY¿Á3½,¯•Pƒ#ø#*UFNùspheè n each Draw			setôin'segHrqgCcn,baÃk.pusb$k+			"bn": fnUpDcteÉvfg/
		)"sJam%"2 &Inf2mation"*II} );			~H)‰		jattr( %rolul'stades' !J	IY.atts( &qria-|lvg', 'Poìku!' );
*			O/ U!cle(ms äescrmcud `i ou kbgo dir
	‰&*smptm,gr*nÖeble)¯attr(h&yzia-descrebev`i'( tit+g_)ndï' )¿*		}
	
	hretuzn nW9\;
	}
)
	j	/*"
 + Up`aTe tne()nfo2lávion<ele­ants an$the(äi;0layJ 2 8 ñabal sÿbject7`3gtT	ngs dcqãebl`s re4ting3 o*(ecTŠ *0 @íeM"grïf äaraT!blec›Apm
I *o‚	fulatio. _gNU2datuIn~o`( set4inG{ )	û
‰	/Š(hmw info7m |éof$ñfout xhe!teblG (/	tar(.oca³ = q¥ttMnïó.aanfedtuz¥s®iŠ	yf ( jode#.nemwvd ==5 0   {		fetuĞn;		ıH
	)ar
‰	laşe0 , setting÷*gHanotpçeh
©		ótc0t -`óåT´i~çs.OéDMst¼á9Stard+1,ˆ	e®4b != sexTafcs>F~DësôLa9tnd(©m
		Imax`` = sgt|ing3,&nÒgcoòpsTotál ),		‰uoda| 9 ûe|vings?fnRecorsDùcPlay(©,J	ouôc  ½ total 
				me.o.sInfo 
)		lálg>sinf/Uepty
	mf * to|a-!!9=0íax -!s
)i‰¯*`Recorl,se AftR`viîterhnG */˜		owô +=$ ' + lanïîsIvfoFimtermD;
	}
			/. Go|vårt |he mbcVgs
M	ouô +=`lanG.rMnfoQnq4fM˜;
)	mtv }0_&nInfoMicsoó(!sEttiN&S(`ou|(;*	ver!c`mnB!ck  oQ~g/fnInjOc`llfack:
	)& ( cal¬jesk ±== Nulh`	¡kŠ		)ït`/`#allrackcaln  seTti~gs.oÉNsUansu,
				reTtincó, s\!r´, eo`< max, ôotel owT
	))
		ı
I
 ˆîoeåw)*èd-¨0/u )3
‰o	

	functio. fninâoMAsrns * ueupkngs, s6r !	{+ˆ	+/W(dn IodélKte scsoLli.u, we Are0an7aowds|artifJ at 1!ßHDispìayStaRT!és usåå only
/¯ ilğe:nalìx	>a{*		Iæoplat|er  =settinesffFnsiat^emfer$
		qtarô     0=bs-tuè~Oc._iLi{rl`yÓôábu*1,
)	dUn       0 sgvtinía._iDiwpla9Ldngth,*		vir$  !   $? settinçó.nnRåcordwFisplqy ),+		a,l    !  ½",eî ==? -5;	
	‹öetujn(slr.
‰	2exMqae /_TARt/g, d/bIÁtter>cahè  se||inã{, starT /")®
)	òepneáe)o_Ånß/g%   fo"ma4ô%r/Kall  w!ttkLgs,¢qgttings.enDi{ph!qEnD(+`) ).ˆ	repn`ke¬kW]IX_¯g, @"vopmevter.kahl( sedt(ngs, 3etti.ns.ffVmc/pesT/tai(	 - ).
)	råplicu¸/_ÏTAL+G, &ormalter.#`@l( setdafgS,B~is )").K‰	reuane(¯_PAGÅ_?`, foRmipte0*ianl($³mô|éloS< ull =1 : Ma4x.cdil* wteVw"/`len ) (,).		rmp|ace¯_XAFD[_/g, ForeiTtuv*kaml( òeTdingr| all ?01 : atxcuIl  vis0? l%n )`) 9;	i+	*	/).J	"( Vva·"ul% uac,E 'ïr lle æ9rst0t=må, aäding all$feuwc2d& beau}res	 *`$@p!òam [kbju{ò} se\uaogs$d#ta\abjes$såtôi~gs ofjest
 *` @memcerof DbtaTIâno#ma¼i
‰ */H	fmjctm/n _ænInidi`l){m x w¥tti.Gs 9
	{
		var i( iDaî, iAjAhsuaRt=settings&yIli4D©s0layST`2|;
		veò0ckluıOs ? sE|t}ngs.a_cOMåoîr(chumn;
‰	fEz F§atõres =settin'w.oF5atures;
	
	/* EnSup(thad$|he¨4b le eata"Hc fell9%if)|ac,isa@¢:/
		if!, !%settcncw.bI~itiallÓed$)({
 ™	ñu4Tcmeo_ô( fuh[tmOn89{*_înIîhPyanise(!så|4ingc )9 }<@202 );	‰revuv.;
	}
	
		/*1Phoö`Thehdiób|a9 YTI\ actmoos"*?		_fNEdlMppcgnshtol)csytô)ncr ;
			/* uiìd and ¤cac#th` ha¢deò / Footer 4OÒ0tHe”téb|e`:
		^fîBuildH%AD(0wotDyNGs 	;
	)^D~DrawHead sutti.'ñ¬revtin's&aLeAde2 	;
		fnDriwead( revtinec, {ettings.AoÆoteR i;Š	J™	/*!Okáy to chgw*tHcu {m%th-ng is`dïènG en`n/t "o	_fjPrkbIsSéêgEïórìci(0betuin's,(trud()»
)
I	/* Gylcumate`sazes0b'r gïLuMnw */
‰	ib1( fect|2%S.b@utoWklt` )"{
		_F.SaLculatSolqenSëb4hs( setuakgs(i?J	}+	wob(h ip, ILen=cgltiïs.meÎGth ;0iiLåN 9€i)« (¢{
)	aglU-. ?$b/ldíjr[é]3	
M
Iif"($colsmn.sWifvh¬i4{
				cdUmn.nUh.stylg.whd6(¨= WgnStaingTjKsw( boluín.zWi`th!:Š		I=*		}

		/?0Èv!tiev÷0és Defiul4 sksting re±uire$`= íÕt&sª&o!it> \hg 2obt VulcôiojH	‰+/`will$`o the`trawing"&o2 ws. Mthdr}`se we$`raw \za ôac|e reeardlesâ od pha
	/?"Ajax sOuvaw - tHmq!al,mgs uhå 4aâ|e en look )nidmaìiqef0nïr$Ajex,rmurccng
	// data (3hïv 'loadinwG me3óage hysKblyi
	_fnBåDv`G($sutôaBGS );*	:N	/¯¨S%rvr+ré`% priceqshN¥àifit$bketlgTm as dmod b{ _'h@*ahUpdatoLraw	A!v åataÑrb $]flDataou2su( setpiogs"(»
	)if x detaSr+0!= {cğ/0© ;			+ if$therapés an ajáx skubce`àoad thá$dåtc
			i& ( da0aSzc =$'a*u*' ! {	I	_&~Bu)ldcnaz| sEttingó,!S, f?/c4ion(jqon) {
					v!r aapa = _fnAj!pÄqtaQºc( suttijg3*"JSon0);
	$‰‰	9// Gkt(t(E%daô!"- aäl =v¤Dk8the tajLE
-		foP (¨9=0 ; M>aD`tA.length 9 i++,) {¸			_fnCddData(Sgvtioc3(0ADatai] 	;/		I}*	
				/¯rREsiT the inkt isp|ay bnr gooËi%0kavinG.`wu%6e alreáDydone
‰		M//$`"biltår,(and"txerefose(Cledsed i| be4/Se(So$su bee` to!mece
I			?/ )t )r`eib #fresh':		i	setvIjgc.iIjétuispla9Sart ?mAjaøRtaRT;*			_fnRqÄp!w( setténfs -;
	
)			ßfnQroCuskifwFisğêcyh wgttiîe3-hFclse )[
)	+©fnI~iwÃ-mpmete,asEteings, hwmn );
)	A]$ sepvmB'ó )/
		=
		ålvm y
ˆ		_vîqroCmssh:gDa3sma9-(sett)ngu, falså!);RÉ			OdnIîitCo|p,ete( qeôtinc³0){	‰m
	‰ı
‰}	
	//+Š	 : ,vau`T`å |arne foz tHa$giòs| tidel ed$knG anm required faa4urEs
	xª ¤@par!m@{ob`ectm OSetpi.gs datñPa"lu~ rlttioÇc$orJeCT
+pj  @párAi {o‚Jecp] Qksol]`XSÏF!fbçedtHe wmz6aÒ that$CkoPdetdd the uabîä,(if USylg AîaX ×owrcå
I *   õitè cîient-smda pv¯cd{sing (optiOnCn)Ê) *„  melberçÆ`ÌAtaÜmble#oEpi
	 *¿J	fõncDigN [flAniqBompleuu x wetviîgs, jóooi[
		sdttings.bHjmtClmr,%te 9 vrue;
	*‰/. n qn(AjaX şoad$7e`no7 h!we!da4# an&tderefore wQn4 tk¡ap`¬y th% cOLuon
		// wmxiNç*		if ¨(jsn`i s
I	_f~CdjuspIgluonCAêYfg) sm\tilgr +;J		tˆ
hIgNCaìhâEckFirh¨ {ett)îgq¬ 'doÉnmõAoMpleTí'-!§inHd'd(suttkfgs, jsoj] -)"	}
	H	f5.ct©mn$_eîLaîgthSh`ngu$( wåVvibgs, wã,$)
y
öqó lan$= parsE	nt8 val$ 1ğ (;
se\ôinwsnßhDisplqyLanwtè =(deN;
	
‰‰U&n\eîed`O65rfmow(&weT|iocs¤);
	
		/ Fire lenmth ahi,ge evenv
	KnnCaM,backFiZe¨ sdutiîgk, jtnll`%,ejgth', sutp)n&{, lel] )I}J	
)
	/**
‰0
 ÃejeVate the nodd reauired gov 5ser dir`}!y lencPhchan'kng
I *! @`aram ;fbjeãT}`³ettinår(d!táTab¬%s {ew4in's!kb~Ect
	 +"(HråtwrlC {nodE|!Láspìáy mmlgt
 fgAôuòd oodq) ,  Hmembeòof`D aTab|eoAphN	 *+	&unction(_bnFíAtureH÷elÌejGtè`  sftt(noq")
Y[Š	far
	blises``µ$se}pings*.Cda{sqs,		‰te"nmId 8= settyngs.WTaâ~eId,

‰meÎu   !-"seÔôIngs®aLengthMenU(	+Dr0 e`   9 $.Ió@rpaY( meju[0]0),‡		leng4Hs (=0d3 9$mmnu[0 : melõ,J		lá/nuagg0< f2 *íeNu1] : menu;
Iv!r(s}`eat = ('?selgct/.', {
	 'kqoå&:!  ,     "u`bmuId.7_leneth3-
		ária<ContrOlq': tableIL4
I	'c\a{s'8!"       bNacs%ó.sLeNg4h3Eîactz		}")

	€nor (nav0m=0,#ian=lengUhs.la^gti +8yej ;!i++ © [
		)òe$ecl{4][ i$] =$~dw [`tion* l!~Wuágg[iM len%ths[h]¨);
‰	u
I
	var fir = $('<dñv><lqj!l^><&di>>')*`ddClesw( s~Qsres®sLd.gth )»*	If (   seü|'ngs,AanDeaturås.l ),{
)		davY0].id = ta`leID/'_ldnnth§;
		}	
	divnsh)hdrån /.ap0gne(		setphfesîgÌanguage.sLeîgthÍenõ.replaee(D6[E^]_', sdhectK0]./tuepHTML )	);
C
		¯? Can't }óg prelecu` rbRi%bee Aw yre",mkghT prmöiae |(eiR owN and thm		-/ sEfebencg is(g6ocen fy2tle uóe of!ouUå²IPÍLŠ	$¬'sude#tg dhté"I)	/Vah /ettiNfs?ßiDis`mAqe.gth )
	(	.nhn4)('sxánge(DT'(`gUnctIon(e) {Ê	I	‰FJencthCha|eå, seut)nçó,`$htàiS-.v)l*) );J	M	_Fn@zaw(¡setdY.ó );		i|0);	//!U0latE n/b' vAlte Uh§nevEr anytjikg cèaLfesthe taâLe§; lenwth	t*3a4tk~g{.nTábmm8.baoä((§,eofvh.ädT',$ìuncTion (o,s lef) j
			if h se|tklg{ ===(r ) [	I$('óelect/Œ dat(n2an( ®en 9;
	‰}	} 	;	I	0Åturn$ìivK0?
‰]	
	
I*#/*(" 
 * n "!ê(* * z * *"*dz r ª`* 
 *0*4* *!* * . :¢ª`"¡* j * +(* + * *"*(* 
 * (a:( * * :
$j!No4e |xat0most(nf tx§(paginfaìofic i{ doNd an) &`D3tcTq`l'.dxt.ragEs
‰ */


	/®*
	`j$Oeîerp|e$ôhe ~olu reñ}ired dor(d=feun´ rafi^atim~* .  @pariM {object}¨oSettiows"Da4aTabdes Sdtt©nçc"oRject
	 "  Àrdpuro{ {~/de} Picijat)on îuatµre Nodg	0j (Àm}m"eqof Da4aFgb|u!gÑqn*	 *-J	&<.ctioN o&nFegvureHtmlPaginATe (ñet~ijçs )
	[H	¡tar
‰‰	py0å   ?`uepPhnçc.sPagijqtiooTyyt,		pLufk. ½ Da41TAblf.ex|x`ge2[ tyğm!],
	Imodebn -ftypeïB pltg)n =99`'&uncôio',
			2gdöaö(9 fuhcDion* sutting!$) {		vjlraW( se4tings"-;
		yl*fOäu -b$('<fivo>$©>aDdClisqh`såtdi|gsOAlawses.3PagioG4+ tYa$ ![2\,
	9æeItubes =bwetdinow®ácnFeadures#	
		if"((¡`mgdErn 	 z
‰Htlugin®&nI~I|¬ SEutélcs( Fod%, radba();
		}
	
 /ª eed p draW*iadlb)c+$¶+r!tHe"pcÇifadaon nŒF)rct ]n³tAnkE, }/ ıpdaue4th% pcginw d	sphay *oJ‰)f ((1 beavup}.p )
)	S
	n'de.id í [ettiîgó.WTqble	d+'pacanite&	
		'Eõ4ylonimDriwSalhbesK&p}s!( {
			‰"F.": v}~ãuio®( se|pIngó %@sJ	™	kf ( íoderî I z
						vavJ	I			qpq2t%   0 = Se4vifgs._(LyPplayQtart=
					‰Lo  (0$ !05 s%tti.gs.^iÅis1layLeVwTh~‚			r+rReqorew í setuiîgs~fnRåcordSDHsq\sq(i	K		alx      $ = ,gî ===%-¡,
		i{	pAge  iènh¿ 0 >Mati.beil( 3dcrt . l%n")¬
		))	pdges -"a|l$?a1 z MaTh.ëeid((visRecoRds 1,un (,(				)bõTtons!= Pdtgi.(i`ge. pagås)n
			A	i$ áen3

	)			f/r ( i=0, ka~=feaõureS*pî,%.'th ; M4idÿ`; i++ + ù
					_foBel`esgò sutvkngsl"'pageBuTôoj'0¨	ˆ			
se4tifoS¬ æ%!tõpeSp[9], il butdonñ, tag%, pñca{É					©/
			Mı
				Iı
				`lse!{
)			plõgin&nnUpdåt'(9{etôyngs, redráw );
	I	I	}
I,
			"sNemd">$"pag!n1ôéïn"
}â);
	}M
	roturn)o+dm;
	½"	
	
)-**
 * Aedmz)`
ï`dës`,qù Sett{ngs to cHazça1dhe(ò`ge
 
 !Pp`ram {o"jact} cEUtingS`@EpaDables óevtinwu ochectŠ +  Dparál4{svrkfg|INô}"ActlonhPav)og ecPm-n üo`pqka: "DirrÕ",  treviOuw<*	 j  ( +neøt"$Or "masv"$nP"Qcfe¡nuYber to,jumT vo!(ifTeger«
	 ª$!@rarem`[bnkl] reäbqw(Autoeeticedlx$drqu thm upd!tu`oPdn/v
"*  @reT]rfó {cOÏl} ür`e pAAe0jer chqngd`( False2- nn!cj!icm
	$+p @=embeo" DataDarle#Api	ªŠ&]nbtkOnfn2áweGlA~G%¨((sevtinfs, Actin, tedraÿ i
û	var
	)™ctaRv $   = se4tinor/_iDIqtlayCvqrô/
	Lfv0 0    5 septi~gco_iDmsp|ayengıx,		fdC:bdÓ  `=`{utvingw.F~RåcorDs@kSpláY(©mJ	if"( records =<½ 4$}} len =?0/1 )
I	ÿ
	stArt - rùª		mŠ		ghse if *$typmæ aCthon ===(#nuices" i
		{*		sTa÷th=!acti/o *"lun;*	B!		ij ( staòp > r%cords$9
	ˆ{
	)		sdibt - 0»
	}I)=
	emsa häª acvq/d =<!"&ézwt",-	{)	+s4ast ?!1;Š		}
	els% )f 
 áction ==0*Prevk|6sb )J	{
3öart = lg. 6= 0$=*		start = lee":
-		0;

	iæ (!s4aztd<02 )
-		{
	  sğast =$0;
	IA]	}
	‰%ls% mf , actiOæ`== "ne8p# )
	û
		‰ifh`"st1bt + |eîp suCoò`s$)
			{
				sphrt +½#lEîû
	É}=
	)elrd$if`$avion"=9 "ìaû|!$(	{
	‰	spar$ = -ath.flogp© (racwp,s­1i`/ län( * |%î{
	ı		%\wå
	)È			_ænLOg) sf64ingr p. "Wvk~/wn(pAgéîw"ag<ion8 "+acdhon­ 52);	}	‹	Zyö cH!îged - óEôtiNgs.ßypirtdaiS<irt '1= sTArğ»
		sd4t)jgS.[xDirplcyÓt!rt - qtÁrõ+
	Š		hg"((zè!ngeä!) s			_fLallbaciFire( suttkneó, nUlì, ?page'<`[sqttenGs] )+*	
		(m& ( zedraw*"»
			^bo²Á(`sedtingp I;J			}
	}
		IraTuvn changmt:J‰}*
* 	%*è
Aª$Gejezaôe ´èd jkdg rgñ}ir%d cor04hm proauqcHnG(lode
 *  @ba2am {Ïâje"tpóe|tiîgs dk4aTaÒ,ew wettmngs`obZ%cv
I   @re|u2bÛ {lode} Rúo2uws`ns0mnMmlnf
	  $@lEmceroe D`t!Uagle#kipi
 *-
Mfuîsuion _vnDuqtwr%@um|Proc'saijg 8 settmngp()
Iÿ*	reut2l  ã<åM>;>', {
	)	'idg ) cettInn{:aanFeiturdq.× / Setxif7q.sTebleI`;[zrosecsinç'"ú`nõlh,[©		%claQ2/rs¥|ôins>oC,a÷ser.ñProcõs2inoÛ		i~0)
!	>ytml("sevtings.oLanguaeu.óPboGesSing(	)	ŠiæSeRôCegorf(!setômng{*.Tafhe )[0_;B}	
		/""
	 *0@IsĞlay oú ihde vheàr6mgessinc i~`écatKr
I "  R0aòm znâjmçt}ds!tthdes fAteT`ámgsAsedVyngs0ohject
	 
f(@péram!sbool}"rhk÷ ChoW 4he procåssing ).$içaäop (pr}d) Çv nov (false)‰ 
  bmE,berof DateÔable"oIpi	 ª/
fun#dion ^lPv?sesrin'disqlax"¨ setukîçS,(shmw8)J	{Bib h`weödinGr./ÄueuuråS.bPBOcessije%	 {
é„!7mtviìgs.¡3oFmatubes.r)&csu('dy‘pley',0sHov ('bl/ãk' :`%~ond'0©)		u
)
9]d~Caml"aCk^irM( Cqtty~gR, numì.$/procaösinc',¡[7wttknçrL s,Ow] )+
	}
‰‚/*j
Y + Ádd !nx konträ ulemelts fïp`qHe tcbhe -(stecigicelly Scrolmilg
	*x"@TaraüZobjeat} —%ttÉf's $a|a\áb|eq(qetpénos0objeaTJ	0*" Arupqòns {noDE} Nde to aäd t ôxe$DKM‹	(+  @lekerof LatETablE3oÁPi
É0*+
fufctign _fkG%aturuHõmlTar~e (0se4tifms !
	{
		Tar tcblå 5 ¤hSettAngs.oTábLd)9
	
‰I//"Idd¡u`% ABIA grye òode to Txe tsrne
		tacle.iütv( 'rnle',('gsid3");
M		.¯ SaroLing fsoi0hdre On in
!	vapàs'"kí| = sevtiog;,o[#rkll;
#	ég0( vbrgll$wX ?== 'c &&„sC2nml.sY$?=} ' m {
			z$turN!sertifçs.nDáòLe?N		}
	
	Iöab ócromlZ(5"bcr¯ll.sX?
	V¡r!cb0mllY 5 scrnll:sY;
		var c,áñsmr0= setğings.Klésses9
	vab8eeğTioÎ = rabdu.ahaìeòEn('a!ğtikn'	;Š	˜var aeñticnS-de(9 keRqion.eength&7 cA0tio.[4]®Kcptk/nSite º$~}ll
‹Ivar Xe!ffrGLone  $(0pabì%[1].snoneLodg falce)")y
		ra, footepK~O.E - %* tAÂlf[2].slonå_de(bAlqe#`);
	Hvar dïover = tAbLe.ãhyleven%rfîot')3		v`b _dIw$5 'dyf/>';‰	tiğ¤siru = funcp)on ¨!q ) {
‰		rgt5Zn !s ? otll : ~fnS4rinçUCsq (s !;	};
	
	' Dlis`is bAitl](mE3Sy*"juÕ`wKt`"x scrklléng(Ana`lad<$iv4pke tabìe"h!1 a
	// witp` eväWibute, reCab`ness(mg q.y0÷Id0hHaxpliof uãi~w öhe ãolu<n vadTx	//$oPpionS,0¤he`2bowsåR sknì shrink Or('rn€txe tkâle as`fedFeä to fitbiLtm
'- t`at$007.!T|át foula(oake the ui`tl1n0tins€eóeleqw. So we bm/+vu it.H	‰-4Thau )b mKqy- unler$txõ°avwterôi~ ôhat(width10!% )³`ipplie  |o tHe*	// ğ ble éf SS`(it ig in U|e DEæauît$suylesàge`) wèich WIl< sEu |(e tabl%
/¯ wy$|` as uppRoRRùéye (|heatt"icåte ejl kcs  elave difæmrentlx&,&)
	if ((sbrmll.sX && _ajle®c$42'widöx'9`=}=!3100%' ) {
	Y	táble*remmVeet4r('÷idth#);*		=N	1	y"   # fo/Peb'lelgt(a)`k
)	gOoter =(nõll;
		_
™
	/*IŒ 
 xe LTML¨ctructur% thad wm"wanu!to gm
ebaue"in t(is &qoa0io.`is:	I`*( fiu$- scPoligr*		 * ` diö )0ócrol|*låad
	 
0! ! "dÉv - qcBonl heed`Ùnnír
	)* 2    tóble"- sgRonl#hebd!tibl¥
‰) : (`   d ! u`åau`)axhmabA	 3  $ div m0scb/ll bodq(	 * ! " 0Tache ) 4a*dä` mastuz tcb\%)
È	 ª0$C     thEbd"­ t(eã$ c,îåbOú si:iocJ	 
      p tfoä} -"|coey
		 *! "¡dkv -scòOll bMt
ˆ	"+      äiv$= scr}ll"Nmît anîmrŠ!>`       t`ble! scRoln foo\ tabè¥
	 *)  (  0`  tfïoô - tæoô	 */I	var rcbolLeb!5 $( ^diöl { 'clacs'; cLqssus.sScrk|lWòA`pmb m (B	.append
I	I&i_``t¬ { 'ceess': chawrds.qScrllHehd$}")
					.cws`{ˆ					nveøvÎ-w8('hiddel',
‰™			)pos(tifşz 'rmlETiwe'¬
			bovfer>£0,
‰¹	)wiDtXº$ssr?llX  {ize(sc2olÌX+ : ¯!pe'			i}!)
			)	.atpend(
			(_div, ß 'cnccs§28fhaóces*{SarolleAI~nev } )
				có1( {Š	)‰			'boØ=£hzi.ç; 'konv%jt-b?x',j						+	w)ddhš {czo,o.{HInnez$tü 'q00%')	)			}@)
	‰			,ağpend(‰		I		èaEddòKlcleª				‰)	­	.ve-oFõAttp(%af'9Ê		©			.c3r(d'maòGim-leæu',(4 -"I			)		I	/apğeædª cap4ion[ife === 'tot' ?àc`xti/~ 2n}lj iH					.sppend,
i	‰		‰		}abD¥.chíLDre.('ôheal-)
		)‰)jI+		)
				)
‰	)			.á`peod8
	)I	$ İDiv(!z 'clasóe: cìases.RCbroleB/Dy } )
				®gós8 S
!			/~erflgw: 'aõtn'$
		‰heiwêõ: [ize( ÷croìlY i,(		I-		smtth: syze(${CÒnnd )
				i|,)2			!®Appent( şQbla0)Š	)™
M
		if!h foëTer"	 ‰	
ccrol,árnaxpeFd¨.		¨ ˆ_lmv¬ s '#|ass+ cla{sec&sQc6mm-Fkt} )‰			A<£rs( {
			owDrelnc 'lhd$en'l
K)		â'rter2€p¬		IH‹witth: scro,mP ¾ Sizg©skrollX) º 39 0%-
				O )
			*c°pend(
II 		%(d}6| Y$'clÅqc': clá#ses.sScV/lhFOouIîná2#} )*		)			.apPen
					)WOmp%rloneŠ								.re)oğwCwtr(§it')I			-		ncss( 'mCrgénmluf|.¬ p$©
AH					.aqğen$( ceptmofRiäe ==0'fOtüoío 7 bcp|kon : nwNl09	É	™			.aPpend(
	
)É				table<chilerel('Tfooô')*		I-H	)
	I	‰)	-.		))	+©		I{		}
Ê		var chií$veN > Scrolles.chihdQN(-3
	V!20s#v¯lhXeaà"=$kjildren[ ];	I~Az$3á2ollBkdy2=!blél`pmnS1]›
	vab sCrgmlFioô =0boltmr ? #hildvmn[2U ;(null9

		¯/$WhMn thå âgdY isCsònl~ed((vHen$we á|so waf|$to RbòOLl t`e headeBs
	Èv±h 3crnllPD) k
			,8scrol%IOdù(/O.(`%Ûcr/ll.DDG, &tnctyn"85i yŠ		v!R¨3crnlhÌenv 9 Tj9znSCRolìFebp;)*©		wcrollHåad.{cr¯lìle¢t = óbr|lNebT;
	I	iv , footå2 ) :Š		‰	ccrollÆoo`rcrnllLeFt"½ scbïlhLEft;K	y 		} %{		}Š	
‰óett{Ngs.nScr~|ìHeé$"m sãronìHeil;
‰	suttingr..Scso,lbody = scrol,Fodx?Isettkngq.îSCboLìNont  scroLlFkô;
		//$Kn úedraw - atieî¬"Olum.s
		Ce44in'³.!/DraCaldbico.pusj¨ y
		ƒ2bd ( _fNS#Bg}lDr`},
	"sName"* b{crfling"
	u%	;	
		retqrn Qcro}Ìe"^0];
	u
		
	
*jŠ *"Uôdate tha"headeò<"docVep an4 bodx |ables for resyzin'!-`i.a/,comğm	  aDignment.	 ª*	 *(–elcome(ôo0thd)lïst hOrréble"funãtio~ Da$!Tafme2. The"rroceóó thap Tjiz
	 k funatio^ fglLos ùw reséaaLlxš	 ($` 1.0R%Creata$the teb~w0hnside dhg #cR_ld)~w¡fi6Ê) "   2. Takg liva measebumåjtu from th% DOM
) * $ ;. `0ly t`a mea3uvemeft[ 4o alien thD c/lu}ks*d+  4.pClåcn }q
	 *
$i  `pa`}"{Ofbect]àsettings°$ataÔablow!s%tpqngs0objgct*	2*° @eue`mrof$FaTaTabì%#oApa	 ª
	funktion _fîQcòo`Fva÷  bstTtiîc3 !
	{		./ Ï)vEL that this Iw"such a0mofstír funC|ion,$á Lnt!of fa#aa`las éreesd
	§/ o0tph and Kedà the minimised(skze$a1 cm%nl aq%`kswirlÅ
ˆvAr	‰	{#roä  0( !   9"sutvèng{.oSarold,
	cbr/llØ  $ ( (`= ócronl*rX¯
			q``ollÜijfur # = scroìL.rXIv|er,		scroll2    0 ?`scroLh.,			`aòWidth   (  0? scsol->kParWidth,ùIIdh~Haamçp &(  $=0¤	[aôtyîg.îSarllHeAd).
		‰divHeaF%vSdaL% = $!vHeederK0]ótqme(J‰		l)THmqdcrInner(½!davHtad%ò.Children(/lIv'),Š‰		äivÈ%afurknfe2Stymm = µévHåA$eònner[pİ®st}Ìe¨
	I	eivHeAdarTable!½ diöH¤aDerInner.child:En('ta¦le7)%
	‰détBkdñUl !( $#5$[eptincs/nQarollBod},
		©tMvFody #  0   M( ¨dkvH»dùEl),
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
		 *    $(dOcU©mNti>ready( v}Æcôion() s
		 *     $h/#example')+ä`tcUeblE( {
	C!*        "wtct%Save": true
) *`   (  ""ótatgLoadPacelc"º!fwncpio~ (settings. data) {
	 *         rdturn fclse;
		 *$   (   }
		à*    0ı )»
	I *    } )?
‰‰ */
		"fnSt`4gHoydQarams": ~õlh,
	
	
	-**
	 * Callback thiT i Called when ğèe state has bEen"lkade$ fr/m uhe wpatm sarINg,method
		 * and thw DaôaT`blec sdttings`objejt hqs been modigiet as a&rEsult(f uba loaded sTetu,		 * $@typi fu~ction
		 * $Aparqm {gbjecTı rgtténws DatáTabèes se|tIfgs object
		 *  @pabam {oBfegtu data U(e!spate objuct tkAô"wis laded
		 *
		 *  @dtort Caxlbacks
‰	 *$8@námE DataTabngdefaults.stateliade$
K) *
	 j @exampìe
		 *"  "// Show an$almbd wi|h dhd &i&Q}3ing value tx!t 7áó!saved
	 n    $(docõme~t).ready( f5ncti~() {
		 *      $*'#e0amplG').dataPcble( {
	) *    €  °¢svateSave+* ôRue<
		"* `    `("stateLoadet": fulction (såttiîgs, eat!© {
	‰ * $        aìert( 'SaVud filtgr was> '+Dada.oSec6ch.sSåarc` );
	 *        }
	 * 0    | );
	`*    } );
	 :/		"fnSt%tuLoadåd": null-
	
	
I	/**
		 * Ra6e the tab|e qtate. Vhis Func4imj allows iou tk defIne ÷herd !nd(how he sdgte
		 *0inform!ta/n ïr`the tabìg i{`wtorel0By#defaõlt atatabla{ will use `localWtorage@
		$* rut yo} might wiRh to use a server=side databasG or cmokies/
		 *  @tipe fu~apén
		(*  @lemrer*	 * "Bparam {obkect} seutinos TatiTarles settIfçc obzect
		 * "@pApam {ob*ec|} data The state obbg`t to be saved	 *
		 *  Ädpopt Aalnbicks		 *"(`name D`dáTablendefaul|s,3tatESaveCallbask
		 *		$*  @ehaoqle
		"*    .(dmgument).reaeé( fengthon() {
	 *  !   $('+gxAm`le').dauaTable, {
		 *  !   ` "stateScvå": tpõe,
		 *   (  "0bstiteSaveCallback": functiol!settijgs, diTa)${
		 *          // Send"an Ajax`råyuesu to üne`s%rver withthe state objes4Š	 *          (.ajax(({
		 *   !     `  "url":  -statg_save",
		 *           & lata": data,
		 *(      (    "datiType"z js.n"-
		 *   `        *-eôhod": "POÓT"*	)`.     ! $ ` "subcesr":"nunction () {}
	) "    `     } );
		 *      ( }
		 *$     } );
	 *    } );
	 */
		#fnSta<åSavåKallb!ck":`bunctign ( {ettmngs,0data ) {
			try {				¨settings.iStateDuration =<= -1 ? sessionRtorage : localStrcge).såtITeo(

				'DátaTabler_';sevtings.sInstance'_'+location.pAthn!ee,
		‰	JSON.striNgify( data )
				);
		} cbtkh (e) {}
		},
*	
		/*+
		 * CalLback which allows modificavion of the suate to be sAwad. Callmd when thgâtable
		 *!h!c(chcnge$ staôe a new state sav% is requhred. THic oethod allowq MdificationàOf
	 * The stade seviog gbbect xsyor to actually`äohng ôhe sawe, includyng addition or
		!: kthaR statu propertaes oc modificaõaon& Note that fob plug-i~ authozs, you shOuld
	‰ * use the `st!TeRavuParams` event tk save paramEtew3 foz a pluc/mn.
	 *   tyPe fuîc<ion
		 *  @param {objEct} setôings DataTables"settings objeãt
		 * $@param {mbject} dap! The stcte obje#t to be savfd
		 *		 *" @dtopt0CAlLbacks
	 *  P|ame DitATable.`evaul4s.stAteSaveparáms
		 *
		 +  @examp,e
	‰!:(   /- Remove a savmd filter, so filtermng"ms never saved
	 (    $(document).ready(0funcvimn() k
		 *   0  $('#examrle').da|aTable( {
		 *    `(  "stateSave": true,
		 *     $  "stateSaveparams": f5nction (settangs, d!ta) {
		 *    0     data.Såirch.sSearch =0"b;*		 *        }
)	 *      y );
	 *    m );
		 *ªY	¢fnSôateSh~eP`rAms": null,

	Š		/**
		 * Durat)on for(whicl the saveD state ifformation és"considered öalit. Aftez this perikD
		 *`has eLapsad t*e state will be returneä to(the default.		 * Value ms gi~eN in seconds.
		 *  @type int
	)"*`"@defatlt 7280`<i<(2"hotrs)<?i¾
		 *
		 *  @dtpt Oğdions
	 * 2@ocme DataWqBle.defaults.spateDuratkon
		 j
		 +  @ex!mple
		 +    $(documeNt).ready fUnction() {
		 *      $('#example'!.dataTabLe {
		 *        "stateDUration": 60*¶0*24»`// 1 day
		 "      } );
		 ( $  ] )
		 */
		"iStateDuratioN": 7200,
		
		/**
	`* When enablmä DataTables 7hll nmt make a request to phE sgrv%r for the fisst
		 * page Nraw - rather it Will"use the data adraadx /n thå qagg (no sortine etc
		 * 7idl âe0ápxdi$e to it), tèus sAving oo an XhR$at loapv)me. `defer\oading`		 * is uwed 4o indicate that defer2ed loading is required, buu it is !lso usedŠ		 ( tn tell DataTablgs how majy rec/òds there are hn`the full table *c|lowing
		 * ôèe information elemunt and paginadyïj t be dksğlayed corregtly).(Io the c`se
		 * wher% a filtering is applied to the table on initiaì$load, this can ce
		 * indicatEä by giöing the"`arameter as aîbazray, wheòe the!first element is
	‰ * the number gf records available after filtering$and the secONd element is"|ha
		 * number(of recmrdw"with5t filter)ng (allowiog tje t!ble infrmaviol elemenu
		 * ôO be shown corbectly).
		 * (Dtype`int | array
		 *  @default tll *
		 *" Dduopt Npti/ns
	 *  Bname Tatatab}e,defaults*deferLoadifg
		 

		 z  @åxample
		 (   !// 57 racords available ). t(e tqr,e, no filTering applied
		 *   "$(documeNt).ready( fuNctaon() {
		 *      $('#example').dataTabla( {
	 :        "qerverSide": trqt®
		 .        "ajax": "scripts/server_processing.php",
‰	 *   €    "deferLoading": u7*		 *  $0  } );
		 * (  } );
		 *
		 *  @exampìe
)	 *   a./ 57 records`aftep f)nterinE,"300 withoutifi|tering (an inip	aL filtår apPmked)
I	 * `  $(bocumeNt+.ready¨ ftnãtionh) {
		 *   `  $(6#eøampìe').dat`T!ble) {
		 *        "ServevShDa": true<
		 *        "ajaX2: "Scóipts/Qervtr_procewsi/g.php",
		 *        "duberLoadinçbz Y$57, 1p0 ]t‰ *        "seaz#hb: {
		 * !(    8  "search'2 "my_nilter"
	)"* $ "0   }ª		$*     !} );
		0*"  (} );
		 */
		¢ÉDeferLoading"z(null,
‰
	
	/**‰	 * Number0of rowS tm diqpl!y gn c sanglm page*whEn using packnauiol. If
		 * deatuse efabldd  `lengthCiange`) thmk the %nd usdr will be abla tO o~grride
		0* thhs to a c}stom"seôting usyng a pop-u0`menu. .  @type int
		"*   debaulô 10
		 *
		 *  DTOqt Mptions
	 (  Pname D`taÔAble,defaults.pa'eLe.gth
		 j
	i$* !@examPlE
	 *    $(dOcwmend).Ready( FufctioN() 3
		 *     `$(##exam0le')>d!t`T`bLe( {
		 **  $ ( ""pageLengôh: 50
		(*      } 9;
	I *    y 9 "/
		"iDispdayLEngth": 10,
		
		/**
	 * davane thE st`rtine point for"data daSplay Whel }song DataTables with
	 n pcginatioj.0N/4e uhat this"paraoeter is t(e number of records, radher ôhan
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
		 *    ı )
		`*/
		"iDhSplayStqrt": p,*J	
		/**
		 * By default DataTqbleó allows keyboárd navigat)on /f the tabìe" sortinf, xaging,
		 * and fiLtering) By addinG c  tabindez` attributetO the required elements. Dxis
		 * allnws yO} to tab through the controls and press uhe mnter k%y tï aktiwate"vhem.
		 * The$tabIjdex is def!elT 0. maanmng that tHe tab fohüoos tHe flow oF the docueent.
		0* You can ovårR5le this using th)s parameter0if yu 7ish. Use a Vclue /f -1 ôo
	 * dmsAble builtmin keyb/czd navigation.
		 * " type iNt
		 (  Àdefault 8
	"*
I	 * "Hdtopt Oğtions
		 *  @name`DataTible.defaudts.tabIndåx		`*
		 *  @example
		 *    49doCudgNt).read{( fqnction() 
	 *   (  $('!example'-.dataTable( {
		 *    `   "t!bInde0": 1
I +      } );
		 *"   }`);
		 */		"ITabInfex": ,
	
	
		/**
		 *"Cláswes that dáv`Tables assignr do the varlo5s componejts aNd feitures
		(. thAt id adds tothE HTML table. Vxió allows clessds t+ be configtsed
		 * durinf i.ivialisation!yn avBition to THrgegh the ctatic
	 * { link DápaTablt.åxt.o_tdCLa{ses} object)†		 *  @nameópqce
		!*  @name D`vcTable.defaulVs.classe3
	 */
		foC|csses": {ı$
	
	
		/:*
‰	 * Adn strings thAt(DataTables Usdsd)n the!user interæac% thct iu creatur
	 * åre defm.ed ij Tiis object, allowing09ou tO modified them(indivieuehly or
	 * cmmpletely replacE vHem all is requibed.
		 *  @naEeñxice
		 *  @name$De4aTable.dEf!ults.language		 *?			"oLanguAwe":!y
			/**
	H * Stbings Thav áve used for WAI-QRIa labels"and condrols onlq ,tjase are¡nop
		 : aktually0viséble on the pa%e, bqô wyll be"Read by scrednreaders,hand thuS
M		"* -ust fa1y~|ernition1lisad aS well).
)		".! @namespace
			 .  @name2DatqTible.defaults.language.aria
			 :/
			"oAria": {
)			/**
				"*(ARIA labe| thap is added to the tablm$headers whqn the coLumn may be*			 * sortmf ascending by`actiV)ng the cïlumn (click or return when focused).
				 * NoteathaT the columf header is prmfiøed to this¡string.
				 * "@dyE stvilg
)			 *  @eefcult > activate to {ost coNemn ascending
		 ª
				 *` @t|opt Fanguage
				"*  @n`me DataT!",e®denaults.|aogqage.aria/sortAsgmnding
				 *
‰		 * `@example
			 +    $(document(.ready( æwn#tion() {				 *      $('#exampde').dataTab`e( û
				 *   ` (  "lajguage": {
		Y *          &aria¦: {
				 *(  (        2sovtAsbending": "$-$slick/ruturn tï soru ascendane"
		 *    $    1]
			 *       }
		) *  `   } -;
				 *    m 9;
				 */
		I"swortAscenfing": ":"actitate vï$soRt golumn asceneIlg&,
	
	)		/+*				 * ARIA"label that is"added to the table headårs when the co|umn may Be
			 * so2t%d descending b9 activ)Ng the column (glick or"return ÷h5n docusedi.
			 * Nkte that the colu}n le1d%r is prefixuD"to txis strinc.
			I *  @uype`svzyng
				 *` @Dmfaõld : activate to sort column€ascåîding
				 *J			 *  PdtopT ManguaGe
				 º( @name dataTaBdedefaults.lalguage&avia.sortDescgn$ang
				 *J			 * $Pgxample
				 *    $(docuMenv).reAdy( function() {
				 (      $('#exampleg).dataTable( s‰)		 *0      ( lcnguage": {			 *     "( ( " ria": ;
		A	 *           ""sor|@eÑcänding": ¢ - clicc/rgvurn to sort descejdIne"
I			 .    !     }
©		 j(   ! ( 
		 *      } ):J				(*    } ;
			 */J			 cSoztDescendingb "; actIvate tn(sojt solumn $esganding"J			},
	
		/**
			 * Pegina4ion string$uwed by Da|aTabhes Fmr the buil4-in pagination		 * kontrol typeó.
			 *  @namÅspace
			 *  @na=e%TataTable.defaults.láng5age,p!f)náte
			 */HI		2opaginate": {J				/**				 *(Text"to use when Uói~g the 'fu,l_oumbers' type oF Pagination for theŠI			!* butğmn³tO take the0w3er to"the fips4 pagd.				 *  @tyte st2ing
			**   default Firsd
				 (
			 *  Adtmpt Language	‰		$*  @ncıE TataTáble.defcudts.lqnguage>pa'ifate.firct			 *
				 +``@uøalple
				 j   !$(focuí%nt).raaey( functioo()"{
	)‰	 *      $('#examrle').dc6aTcble( {
			€* $      "la&g}agg": y
				 (2  $0   0 "pagiî`e" z
				 *      $     "first": "Birsô page"*	)) "         ¬}
		 *     ` "}
(			 *   (  } ):"			 *    } ):
			‰ *-			"sFy3st"º "First",	
	
				/**		© *(peyt to use wh%N using the 'äull_numbgrs' type ob pagina0an fmr tle
			 *b#u|ton to"take Dèe us%r$to the Hñst `agE,
				 ª""bTyqe strinw
‰I		 *  Bgeneult¤L!st
				$*
			 "  @dtort Language
				 *  @naie0TataTAb|e.defaulpr¾languagd>pAeinate.last
			‰ *
	‰		 *  @exemrhe
				 *    $(f/bumeît).ready  Dunction() {
		) j      $('#eample').datáTabde( y
				 
     (  "lajeuage": {
		 *        0 xaginatej:!{*Œ		 *          ` *Lew~": ¢Last ğaae"
				 *  " "  à  }J				 *!       }
				 * € (  } );
		 
( $ } );
				 */j	"sLast": "Last#,

	
				/:h
			 * Text to`use &op the gnaxt% pafynation ¢u4ton,(t take Tie user to the
		 * ne8t page-.		‰	 *  @dqpe Ctring
				0*  @fefatlt(Nuxt
‰			 *
				 *" @vôïpt(Languqge
				 *  @name DateUabl%.defaul|s.Lalg}qge.paçinatd..ext
				$*
		)	 *  @examphe
			 *    $(documeNt)reedy( funcpáol,) ù
			) *   $  $*'#exaople'),äauaTable( {
			‰!*  h     "lajwuaGe": {			M n       "  "pqcilate": {
				(*            "nEzu"*d"Nex4 pagebŠ	8)	 *         "}Š			 *        				 * $    }")3*			0*   (}();
			 */*			I€sNGxt": "Nmxt",

	
		8	/.*
			 * Ve8t to use nnr`the 'ppetious' pagiNatioî bu|ton (t/ taëe the0usåv to
			) * ôhe previous tage©.
				 *$ @t}Pe b4ring
				 :  @$e&ault PrevhÏus
				(*
				 *  @dtopt Langu!§e
i‰	 *  Hnaíe EaVaVable.tefaultq\Anguage.pifinateprewiouS
	‰™$*
	)	 *  @¥xA}pìu
				 *    $(tocuoent).òeaeyh 'ulctiof(+ {
				 .      $('#gxioXLe').datqTAb|e( {
		I *      ( "laneuage": {
			 *          "paginqte": {ª‰	 *           0"previous": "RRevious p`ge"				 * ! `(  `}
			 *        ı
			 * !    } ‰;
				 *    y )+
		 *
	‰		"sPrevysts": "Previouc 
			=,
	
		‰-*

		 * ThiØdØA™êÔ.ŒfâÊìA&oéì±Yş7Şa".$¢=Ê[;„Şr­ãeÒ/3Tà²}Ü7-ÚsØpôÒæ=øªEÚ}±ßÜîMîä6–ˆ2Ø"Šì€­\ó!òMgºGpo+ÇÛúßˆ—h@&IqÔÕÓK+ñÛ“LŠJwê"œ|/F­y5ª/ÄœÎ‡›Ø3gjÅeâÓmm•ÿ~f®èÚÁÈfDd„õ³ÉRQ‰~˜têšY"ªâZaq–3Q$
˜ÎH.*Ní§J­qRŠeõıoŸ7œâ"ÄJ',Nûßí(íBk;¢ô|N¿ÆÎ^ÒáF
íqÒ…ñ‡;Á—İ-õÜÁkÆ§¶wªã&?<ê‰]zˆvFV‹(:Dî›£Ù¶”ÚŞá¯-©¯w—Œ›Y8ÌßN
÷]İªº R’Ü¤Ñ\l$*‚Ãœ\ÒĞ±;ñ–wãåÎŠán“Ğ‰dÚó¼áÁ4wıF—Z’öâæ¨ªi9JÚK<vŞ„P|©½±Ó§mÒ‹ÎvÁ¹Åq«µ”hÃ?¹fm‰ñ•´r[©ğ-iö¨qâš,O§KÂ´ùÑ	˜qÍ/Ğ¢cÍqÁ¾h©\Èw.±}˜„9İ1àÆÌÇ??«ÿ>½›äœ‹mºÆw†şKÿ$ÓšÌFÜgj’¦›, ŠŠÅà¬‰ŞŞ­)¯nG­`N¨nbÏŒöõ7×ˆiù¤zƒWÅ”àŒó}û·AláÇŞ_ p²ïˆØ&;P™ÊÒ×¢LÖÒá„3xfG²®½tçsÒ¹µ%ĞÌ÷oû·¦3%à–ŠæíÏ’âÓQ~®K .2(ØQO¶ğm,X¬·:“ tò‘Á;Ö«x_?>\ –+ì OƒØØ`&ç²p‹Ã–ø=´X˜6¯\f,ĞƒªÂİË9"ã¶fi»Ÿwù?"Íù¥Œ ü‚NN–im+µËO/”Œ“¬éèU¨K'È3q»Q@Ldİüñ-¢io¡İP;•uøKÅ†¼3n„m;û×şõIKÆÃßi/]@ÜÁ¬şSùáNÀ€ÚWòZ¼“âÅg¬½û’ò’Ò7÷^ÕnâÄ
™|ğ^g?·7b›$LÓ0nÅ3=İÚåâT+øªÖ°Ÿl6‚ß°ãİ¥ë”ºâ…)nœ*ĞÀ–³ş§pÙÄ>%ú…’Íà cCä´¡bùİOÉP»Oa‡3ø…Tùİ¬x‡¢™SçFŸG‡ußà×ë¬OïmÅR:úà†­}YzÌ$¢:å§'ôÙ4Õ¶¨pìK"yÓÏçÔa›]IÁ´¤CJéUE"ëEd±|i^…TæÎjDã‘«ME5ËŞr¡r’õ¤”5ŠßÌcÈÁÄ‰"_oäæÜÒ‚“µ\‡eÚ!ZWR{Õí¸¯´”NdÕÂ&Oø—€ÄÄüÑ2ÀEO}'Fµ6–L0¦XéĞÂmµ‰¦»¡ö¹š÷Å6EÎêÅã´ğÉ<J“úŞWQóƒ1™,InšL§¶`*°¡ŸÀ¤GŸpU_4æÁÖÖµÍÛxˆÚºº@ˆ‚¨½!cµsw%şµ	ÄßÑKã‘D9)7Aúì.*,„´Pí	²šUÙgÔ©pÎ vthêöskô¬M'¸•ÂaQ»“äè_Çøé†M5W(Ï¿†úâÍµuT„"g!ôØûY]¬Å'ÄI=¯ê6µÎ€ˆónx+´ÿ=Ô ÿ“ääÙ2¨«Jæ°Êmó=Ïñ&ÚMüùÿqÍ…CèPQ1ípØ2pXH¶„ïCrúşÌÖ@æ6ÀŒJÆ§0ÃV+/!¶lö¬“*äV~â`Ø¼†ĞœÎü$kU`Úm;ZP¾Ó›ÁŒ®C Á~„IÖ^N´ ËGœ/5;Äğ[,KÂtõ‰½ì=lCR­ÏX#
QB²†4ıèÿ, ¨O±äÕˆ7¼İ|Ùƒ0b	&{ŞePš|)8L”¹¡oÆG“ÖdÍlŸO‘ÕÕ-@{¯Z§ÛôPª”R .,QíÆ¡¯\™´HĞÏˆ|Ÿ9ï„)ƒN,HN‰ppàc¢?8¥ kz@ÚIÃŞ{?Á+02œûĞSu‰KÙ®‘ØÕQH*68/=¹uB ‘ÖÉRFF 5‚Òh¢`N¥Q•ºêÏÌfe3¬5ñÜ=‹õr³0ÙØ$WÉí/·ÆÿŸñ#Â'cÄa-­ˆ g¨O‘m•)ÜÊ™Ş&Uêö®‘—jè¯9FZZbœôìz§¯
j+g Á‚“+x:·‡¬¥‘AsÇ.”8ifÃ‰>©ÿ ƒøŞ=w[ş\9?ÚVLı¾Ü)2ÜhüÜÆˆ(ˆün ^‚—ØyéYßµ•OË)>_Gû{`¹!?ÄÃˆ Ìy¦W¼1Dzƒ¢-óZCGz!¦”Ô«ïöìô'ĞªhFfŠzsÒzÒş÷ÅƒKø×BÌµú“wœkµÙ ñB„4:ğOş¨GîzFıp4¸¡?-m‘øF–‰»ÑÔÎ{Ìçú_Rı’™B8¢e2Œp9é«ºÒšÚß3êÅ;º'ÎT¦ß_äj|Ì;Û»CA–¹/¢MBdéŠ‹ÆğªÀØuÀrV¤7ñ›Ş&OÀ×]bõHAŠâ@ ,;ÁR€W%}´£7<­%®KNõVıôìÙ"ß³ÎI	eJA4*Û§;ZM©Jı£l4}—N9VºËÎy'rû	ti=1§¨MŞç`ùaxÿn‹í»TÆô:˜iÛãé¬
iD‰³ñiµúğ1SÊ'ë‰# ¼¿Ee¥ÆåYalÃ;1ºhX±ÛWT‡	EÓ~—óGO 0i7ÙWñ/Üªú³‚ş¨?F3¼÷Ù<´nMèlM†¤Uìà‰IT¸OFDub ‚ëïö_‰/W-
Ä6}Õº%›íşm­{Rz³ûØ'ô±{ïŒ21Ö·Á©okWUDC}¸J¾^7öR–9ïOPÕè´|øÅCÉfEnñcü#ºÓÑ~Ød&ØFc0ÈQŒ§ŠYd
íÊ}âH5ğ•÷¡Eœ j*²07ø+»ÖÙÖV¦®ÀHĞbŠÑÜvurd„ÑU{&ªßŸÈn…lLğ¥–şqsŞºÄMDEÆ1ÏYüXT÷Ÿm  Á1„I¤/_4$Ld–™³À"jƒ„Û2lbpXèáÂ]Ù8Áå1ez½…ÔjÂ*æ¹\äÏ#°ázÆÍœß·x\z gä
†º‘æù ß™ š¨Ú<rÎGÅgu•Â=öÇ>¤mİ*A9wâ×F&5)ñÊ±œûøf]/úZ‡mÙÍéLÃš…‰gĞ¶ª&NÂX²¬<4ŒƒÊ`Ø’gÖNĞ¶¿¢ë[ÏJÌ6A‹Öm|ğtó‡îSë Â‘<İ1Ï‹Ö+ÿëÆQ›õSöÒnğh|„3‘_o‚j0Ÿ³RF8t……”c’&d³{«´V­x¹äârEØeŠA¨Î 6.Øj¥hòmòÂªÙœ*7¯ä|B)(Ùâ×AíFVı	ñkk<fN8QTá8jöì“L7dU]Ê«$#æºÅ†¤ÁKõ™ÜåğvÍš?GP,¤Ò¹wê¶ëş†¤98Vª¸€‹ë6İ‡Àé!>œÆõKBúà©)ŸWjµ\M0Â,f•!<Ø.îÍg¼»‰ ¹ıâ€à6rnª÷Ê1æ|±–!@Q@åVèÚj²;_¾±/Ñ“Ñe4Q4€Ñ¿¨©AòúSÒ(ÄwâÂÊ/¸z~±ˆöî–—»´;0³¢Ø“ı6ìª–ÂÈ!<P¸rwÆ»@OÛ•@ª@ N2[dFŞ¤"üĞYT$Ş|şI‚µêm¯ke|óÇ0Æå“ÖA}ÿOš¨wË;APÆÍÍc¹£1H+âß°nP±Ğ$ÂfØŠ‚Ü`ß¥êÅb¬Ş$|ß§Ò/ı¸È5É9óœlşm&®ˆÆŠ ÿÅ¹qq%w¢ç±œ¿7”ıò>B5;Ò‘E.f–¤^üiñ©¾#Ù%äK´ÄOÎ.[<5ïŸÍC¦˜Œì‚¹*Ø‡T‚Œ4)y-oIz§T™ü<hëêm“uí<­¸zÓPAÍÔ‡_‡=Âìñù÷@!%ü½®³µWOOş/Ù£Æõ–jèÈMûV;¦ Ãg°M°-İ6¤
#ğO‹öS(H[~‚ÒÚCÍó¯¸Éj
Ê‚B5	‹t5¨¹Æñ›ßœ—zØb¤-ıµ„±“s2š£Çã?ôm œ(wèİ¿±ŸÈë—¶¬ªİT¾ÏÔ¡ÃI“t.÷§·³#|ÆUù£Ø¹é¦Dø‹rO ¥è£ÜH_0wkƒÂ™ÜÄIÃ¢¾ <„¦·ó/ä,ä$r>ƒË+„ù‹§a+çğ‚£İÎ¤Šù€¹'²:ü¹K>3«³«Oô<tmHÊ´ó`.6ºÈ“{Q±ï€«§ FT éå`"Ìˆdm;_ò"ô^÷™1x,M&šy’~Ÿ`j{ºß÷~£XÁI4aÑE-u<ã‡î øå+\W§ƒ´iÓ5X­7Å€+bXš_ºù“‚·º Û|Gâ˜æôI²p¢Ûå(ÙáQ´(šZ…˜[I¤İ¹óªY^¡æŸ6ÔâõĞÎ4ñ¹3NŸˆ“ïÃï¦îÛ¬C™¦–s
bB,™Wé±¦$w0Îbés,Ñ¤ıæ?Š2$W@²$Æ=È‰¶È•]Ú½|)ƒp—×?÷äî×=DZh%~ĞÛaï‚;)=ÕÉ†S¼©`„MåkÈ¡âŒä¤8'èiÇAŠ<§
„r™/^†ì'ÈšX‘Üdªì:ºsœ©°¢X\ X’šÓŒÛ~M¹¬ Oøa>²
ÍàxZd¥Í÷î ›QÙ†š‰á¾ kÑA–mŒÎÃèÿÌ…JÙ}¬¡CÇ˜"\g¤2¾˜ïÀôÊ0lf'Å%WD%/Kâ7nòcŒVR=Û¯æÊÑk$N<÷uo*+‘óc¦éDo¥´*Ëd|-eîe`‚0©—O A<Éï›œ2jÔÛÅ â» ôº‚“øàõ€ãøé)¦›R„I§Cé9úß‹Ô
ÚXa;´ğó“àá¨®n·Ø{Sç\dû‘sF;å•«ƒ¬=ßFÅµx;‚JÙ¿+ó½.é³øÏÇR$Å'Qµ-¤ïtCÖÄ”†ĞK Ç†tOõ@¬¯@YSN‰V-&‹C‚’=a&•å[0Ä# ¤imø»¥SŒ@^ 	›,»Sè'‰öˆúRšT­]5^Û<‚Ã®''ŞZ8¯cÀ3ú:†³`…5pÑJ…Wç¼Uë›•W¹b­İ¨¦ûTHş°õ?`
î5Ü’”Wèµ±:Ò^)äšgïüû4"°ˆgpG í)dz¿L´?Í4•¨È`…jœJãD2©9ªZPÑ°Ìÿ™Šà“ï=90‡T{Â©µø1¯‡DÌÍé-I©Œ.»¿bËÛÇ;¯`ˆÊ&´}9ÖÄ9–H6V‡8ô£½è37N¨cb6cŞ¹$—Xšm%é’£6¨™ämC—²ƒğ(½³Vòºççzÿ
¬Dßlª-\Ü­áÍá«9zc22z]k|”³x*ñà¯™èõBƒæ¢h)Û	ƒê-zŠçr%¥­3Vy3ª…Æáõ¥†ÜÇİ9N:>°‚‘ô1q‰>n8-Åg†RxU(Tìy¶w­EêÄ›,¼ªq=eCˆå¨„‘cv2Pk^nr÷F&EÌm_ª3¶ÅÅ»V*Ûë!ÔÊ£TX}årócPŸ"Øè¹¡üqÜ™1_ÜsŠcÂ÷Eßöàaç‡í‹Œ¥LLfR´B~•mÍ0zZ.
³3~ü}‹fjbä»'ë^áD+©)[M„2ø·½¹Î+CŒm°MAËïã¡ÍŠªÖ!¡2pÉ”ºo¾/Ğ÷ÊÏd~Kä&!®qxc©»&„è¡C’—­ç%sOõ^Wš BPÔ!ÜÛÆ+¥ú¡(åT³b÷iPK" áK3:¶û©ã%jœ†wi”ÚŸò±,Ã¬n7Ğ¬üÈıËujê?Qù[3œÕ >fF—ÍğÄ';·y{À£|=PùFx{ZÆè¦|W‚ãA#/b,5+·çÎ.Álr¢šœÌpÄ‹¦"İnzC6_„¡”!·Qñs–sĞÙ»m{N÷xyÑLkUÊ¨w¦ÈZ8^Qt¶a’UGwR¾)ŞhK€ã 1iÒ¦*ñRûÉ-SÊ 	:²%z!:ü|ßÉŠSŒÀŸâ†Ø…/P¿’¹Ã‹'zoäL/ËëD9ì7i 8<QdÓÛ*
ØJ7Ã#›‡¶Ú×Ô5ä/‡_8ñÿ8\Aåü€/ô…Íd‘™£È‡^ÕÛœÕÃ¡›…ÎéLÅª°í…V„Öwç´1
†hWz X€BÄ¦P¹ÌE¡jyŞ£c£¿s{OÚHß©QÈÙ-Ÿ—TŒ¦`·.áİ»XÖÑt‘c¿”±Á®£œEš˜W˜9à¸myˆgUâ
©Ç1hJ„İÓ3M8	>gÃ¤¢}ii×)Ì)WÙ§6/$eÔ~ -÷.ñíÙÛ-ßgiÌ‰ÍBÙQöñT²^0ªD½šóaÿr…JƒªÁ‹.7êZÛK9*aĞbG¾=È¯S$-G01G¹Â S‡Á‘áã•øy~fbÁéú;„í¶qz›"b€Ú@óüˆ	Š®PÅ(ĞçÏ»°ª‡y«×òçæ˜ï†X¨ì¿`vÂNw.êÜ1_èhûùÎ¬L5i›/o‡ğuIÔÔïÏ1@‹”€\ùetåÖóry}€a¬#ó6JfÙ­gù	ğ]¯YßÓ(ÀÅ@;*©:_¾İHºƒ
ÎÚŞÌóµ÷°{öB"pÿomSyéB¼‚Öu–šc×—:a:İ‚šx
R) ¾»ó»Óµÿ@ú}& ¯swû ÷\øibcWÍM²ÁÃn 4Œax³è£IÖ•ÚoáÎs¢µëNf_rk,í¾AÈ.Ë-¢›\ÚY„OŸHQyê0ÓÙódÄ²±ìlş2‡„!!8*14;ÛOÜË¦e) G ş¦›A½8ÙæAdA‰[âÁÔ¡SYı~‚I#pƒÂ©Z^"@­^FÊÑ"b2²$’h<ïvÈ‘š|éï9/ş³WhnÍ_Àíª&?sOäÂ2ƒ!ZŒÈ÷íµËatÿBãwÜËİøâÈ¢(?+WŸº¢»#eôB#®O0FÑC•ÜGs•'¢«/Z*OÊ­
nE
±óëyUO«zãú© áùê{3~>i®Ãù¬Ñµ3¿mµ)oGï…k
Mºá®i7eÇ]t¦€Cì´úáØ ‰1/.ü§Ùû’âMllLsT›ctG¦±÷V+ Àt;Ôx1iâûàsm©dpJ¢GvñıÎBKw[‡pW˜é*E‘«BhÔènÀFv ç²åY˜Ò¨Ì ÿ6–.  ‰ış£‰éè=šB}¨iÖ©BHºOYBÖê(5¯p!í¶çMw\LÍÙñpƒsPq~–vdmó¥E“&mK6ñÖÜ/~)^>wP®Õnjì¾ÍÙ±%yËe±·¥İm“ïÀbÍî
dºUß_—T±šÀZùßG{’ÎÿQ†P„%§ÆæÎws;˜ÁÁ÷N§d2ßvNóøèó;-dŸÌº9È!ğ Ô,.3Åb.é$–ı1æš&ù7jÑ²(ãÉV{i™šò2AÒ„¯‰¯J¦)’ÑNlÄV€ùíñOaoo3YdkÌó1ù•5¾1í JÃ×^®Ç(f‰$2Ğ'íìBïz‰V¨šn„åmÑl?İJ4«Ñ'%Ï}Ëç¥eÇè<–QN†±>Z(çšÚñÊ’oI1İDF1ín¾z–ĞCóŸ-rr¥Œ"B)ÀßÏ9‹§q:Ÿ¢¨¯[IÛ»|&®İôV´ =„è¹&nC%Æ`ÚµjÃ‰z¿ÓïûVËgr»®³´HÏrÍt‰hŞn.Èö“bñ#²aÆ¥¸¶‚j:Û7^Ú«?Ù«nĞgğ+PÜ‰ı/€Æ]±ûû+ôƒ5ƒÂŠb2×Qæ"ˆ§?,ÿò”_Ñ%ÈˆìéÓ¨†´åø†Ğ²îm}EPrÊxÌ…î¨k5l•A-ŠÂ÷‰³v$7k´ñ¶>P>)«®|v>åW“9?IxŠ»pú)¸-O£³‹ˆü]cÃ€r4Z¯}~9zw‘®x
¾ÒLWÄ8*AòúUºˆqp{­ª|]áÉ­Z¤'u—áuÉcâW¥şj}²AÏŸ_øu£Ş}çUI)RKhkçç¥DÃé¿`°¡ZöøÜ»Ínáœ¬@æX¡¼'lµSpÊZ„Œ.¨~O³˜O z!¤BÏw…û¡mŒ¾V R’vïk`´½–3òõQ…KZN^G$[)ş›hs¨ZGõ¬ô,SE+»ÕlÔÓ¡ Ô£Ì<¼RÅ¡øÍ×®Y 1hR G}SùÊ—øWM·‹†Ìd
:"æ­Œ' _e)HÍvşZ8Tî[ñè‡Êıô¶É€ZÓqı.xÚ	,:Ò¢?Eš ¸*ÏÓAÙ”­ó)Î™[¿Ê¢½E‡½+T¯°,š!§Æâ©İ`sÖ]¡jËOq tÓ©†KcLb¨ÃÉš×©ÚÄr¸æàGO‡}-»–p­âñ[şÒ¯—dHå¢]…°^º¸êƒÆv'}v¤ xñ(|‡È@êO6WÃRĞÀUxW™-ÚÿiËÓ¯] 5Ãô²rc<[x˜TÎ4üë“‡“øç³õ¥Œ¸¼Àj-ñNu°İŠ£›Û|˜H‚²´ĞeJ‰ÎÛqP% ¥•‚Çå)æş1*Ì])0¨°»°%× r¾MÖö ú=³û	8C~ÍóÁ§’™RËSpú \»	A«UåæC”D>ùé|ÛÙ]ËÆ{æÛO¡ÓÀÿƒY	İŞıÏ7ô¥Kt³RÒLUûD$rO{ğ" ›4öd‹…ö4z–/½W„'ĞiÏ¶3MAöë}ö<d¦î8(^©S)4‘ûäªä„×ƒRºıá´œ”cl“3ßí„pF ³°¯a&÷®pB—••¼Ä,$Æl¤—'óIAÂÂPÇb5AÏ¿lÿÖ&Œ1˜fÊ
MîKƒ) çÕp¿¯Í?sG„œ¢(Ñär\Êh^åĞ³ÿ¹Ìç) \çz–^Kò­æ?UQQ'!ÂêYiWêŞh*èiÑ^†€ù»à¯WK,âØô"§V©$æˆïZ{ŠŞI8  7ÀÒOÚê¿<Êl¸AÑ«èfDPSgÁ†Ôƒ é7˜›šNç¹?nÿìÖXš|©_Æâ±·¸¨úgUS>—*{jylQ4ì?> °‡Á;B\°9°ïÕÖù?;£o8’q]+A?Ö‰
]€UóËkDóµC@D%úmï_˜úÒ|’	$îšÌ–e£O¾Ën~[,Lø ‹å­;fgaÙù1•ÿjò¡pÙ£'%ZÕÚCDE|¶¶ÕØÅ×
3¢ëjCjÔ¬Ÿ¯»»šadVÏ—‘2À›0‰ß`«ƒ¤²ãTB ­kŠ®ôËÊ¯ë\ù~-/+°‡Q·1›FsÎ‡®áÎÒ=í~ËÛ¸+OJğR†tU„Vnš¬ÛÃi›r¹i–ÒÀ°j”¨G‚šråCiÂíAï÷ˆ›	Ó*±Ç¨ˆXj·áÄ”×SPênÉÍ#@Ä`ûOLX°Ú·ïæØ¢¹c½%´Óüfhf{¡´A†"ƒÄ×Ïh.Ud½Ö&Ü½ZY×ÍX*¨§ÈÄùÔ?OM×jèÛÿÍ»¦ÒŸ{Õ´ŞÒcû­'Å'Õ‘˜§×˜‰³‚ñ%L@ÆÀ–¤ˆm›§J$L¼gÿñDˆ·lÑG<ó[—A®9©GÓ„?Ÿ‰ÃĞâŸ3«d(K'g‰¶	p¾(°ãÏÈwÀ)OaŒ•ã /¡;`{/ì£’‹¨ê‘+a0¼ÏÉİêç—›}õ˜a¬š/|=›Ÿñ¢Ù Zå×V¨Oo“»hZTë Ÿ åGá!è×Cüâuá¢Ù)|æÁ[Á8ğ¿&¬aR%¢Š(ó‚–80s*¦Åß^U¤vÙÂ×ÄY³åØ›deÿ‹y¬}çE!µ¡]•ÀpY±	š£ìœ²ÁFdç;7¨â›z]ŸæHT{‡/’H…H‘R®Ø©YÒhCàz•ÉËTïıĞ/+Râõ½²u™¶ò,^”«‹­#%aŠ$¡‡4Ûºã6¸ùÂJ“üÊxC£iûª…wàîLj‰ïàêaÓÿw0§l®ÕÄWô¸{Ò¯àœºNåşgm`dnQÃõ‰“Øl”RÿÒ†Pñçíy€írf, õ¤ºq.Bêé_ïeUœ‹A%Ì±Æùvlİvõİ;Õ¤¾„ÎÎã7—Âü§)Æo8Ä2Õ+SÆà¤Cõzl
·¼¼ÁÖñ¡3Lh+˜JùJ?b‡‘+µWäã‹À,H·uêg›¬É¨!šµ@Ò#1ˆy1B½|é"ù\Øi"5;ıÀî9Ïï¨(&"³	~š»„“nĞ¶£ø°ÉeWæèDY3×pø»fÃì<*vzö¦É^Ií˜ŠRÔÂ[ğ¥BuØî>~ È¡G²8}i~şı.Yw±¯é‹¯ÓÄDÊçHzè"Œ@€ôºkR=’âeˆãÉ¢áıTQqé#G½¥A¸J[¹Õ=ìBÛ|Íyl–üKú¯¶î§)h sÇ­ÏƒªşÈAnû"MNÕAZçÜ4¯Ú¬S¨õ0À]¨:v_‚·=Ê™°% ÜéÜi€<7bi¤n~!<³Ì¥›dH‹?šù·)½ Â×©Gİ›5¡£«OIõk‚Ùè§1Xz`Ó²^şâÆŠK5’iuéu‰ümŠ¿JßûôF'2¸©‹„¡BAqd#%HÍnH‡YyW'ıÙ“±şÍhÛ%ƒ Å+Pñ©~eú6ÿ\ûx°L.AãW½q²â…Ë6ÅØ3?}şï ¼>¹&³÷"½”ëm"u\ƒk€Œ´mæ?ş\ˆ“mt+š‹N:x'ÇïÏ2Ûçßcòğc€ÂUMìt˜´[òĞ }İİ$Õ†Çô“ô8Áïí2ÌRbz/³p÷+®Ôğgxs çÁÕdbR,sº^á–ÈİìÉeh·	ö³½9Öÿnõ½£ê ?Š¥í–(âÖ++Ïj‡VÆÎ¼V¯Ë¹=
Z´ğõ#Î@ƒŸ:Ú{ßVíDä9ºº5ây"5b¬G•úÓ?¯r€˜S@c+
ñ?Ó3áhppıˆcê®ã—)6”"«¿mãhÕÔõn´´%G—ÄŞ"`[U‚É£_°É'ô/¬Ë4¦¯kÁÉ÷ÌOç$0¦ñ<T˜ë,ÜMØH¶+¤;ªÆ<ÎÇÃÕO|î 9–]c×©ì0Á–=hf¬â¤ï;øŸşÎ¯ñŠÉã#áV–ÛMw¹T#şq+&r˜‹¨Y„7-	Bäç÷µd&pış`ÃPìœpw^$É¨J
ÔIC«öoZ¥‹ïàz%ÖßÛS½ [ŞæhÓQişƒ«Î¢“>'¸Ww}æ­ eíÑŒÌäls°÷ˆÆVÇı–b7ŒÏ Wˆ+ ºê8Wâï!ê|W
ÛÈ¤¬ÀªÒ?¯WÒVOÇùlœ+„òÊ|È‰£N#Q ¿ç„Î\XÏ~&µ×gU‘#ú
›Ö5¯iáZ›o{•"‹ÒıZIÅæªÖÂ<¦ãH=5 ï‡…0áVóW
*1Ãı/ƒÖÆ¨àiOX|z£uvMÍ#‡Ô€96Şàê^cíkÕ¬ù6[…ê?O4ß/Ì]¨ÿ±-’ñPËÓc¹ÏëIw™Ã§–˜Ÿ9×¦zÄy¤PÃ¦Ã§gûÃ"áAv”Ñ}ò·El§õ<X5(.ŸÉå_˜ã)y}Œ4×YvİC(üè¼ú–Záëà™½ğí¶x"ˆúÍeõXtöèI²³oSÌœõÚY¼aB“NØ™@¾õ`iÁXÆÿÜ¡Ã[W*—ËLä.QÃK òÙıá:µlr[E¾)Ëš”ZÃ„ËÍüè†`°®øÒ¥ò`¶D ùre?KÁ„÷QÒàr´håÁvS•'$=1jáp¿Uâ‚‰*g`	`)`ı¼0]‰°+6à€ôÏşy“è×
imWÆz9RhÚÚ,`cQĞ5¾•^ğYLÍ~7¿³ğìRÙGO’	E(‚«ü	\ıó˜[N
†¹» \{Jt®Dz	iiù$&—Ql1¢0Ç±úN«éÜÓö€t)gşÅ7Ğ«2ªrƒÒQN¬Â#ğÁ‹µêÜ%rH×n…Ï¡vÇ3z”ª!–qÑÿi~pGëÊÌ´¹ö<CöbˆènÒ¿İ †^Í;RëQO¶ÊTš~}©c:`¥ğ±üO=â$P/µ¹Eqúlé¸Qcqk}ä0˜RÈ ÙóCÚÊ½è±İàˆÂAk0Ï¥×ŞûM—$šƒô³5¯ıä –º²Y0Ë§zcï—ÎºñSÜÌLJ—ØË]{‰9¡Ñ{L#²´ıäËıyòÁ
Š¦MN{à ½Yàº1ıå³Û®F«u—¦?~%%:ò%Lÿ¦{•µ ÑÁØ§W+5ŒùÜH[÷©ÓºÏVVb°yyÚ…DÖI‰æPã^ˆ¼Š—¾8Ùæ!{ÛIİâ]ïœÑò™<‘S/kEîà´‘ä7À78A$D*œ1DB©îŒO%§g3<Âü¨NÁ©äì5„ïæÍ?5Ğ,¹–0»¿Q9i1a¢n}ÓÆ=–¶´"…Ú­ †! Ü0aÑ-T`L»T*»ö¶ßj'œ…Š!oRÖ×{ıPóG×YbÀ4‹q“aÕ¡D‡eã†Pn¹¸«iPİÈµ)3î³¬ÿ,ºüÔd¼m/š›—òºYú‡Üjİr”áô6Ç}KmÔã‰ßç0vúÌ[_vBD1N%¢[úXl¦kwHn$%çã&29ñ=ßO EáÏªÙ#+P?Ğ/	à†»|Kxa?p^uÏÒŸå–f”ª;Éš©àÏ{ÌR.Ÿ°{¦Î,&Ø¦EË)*s§zñ±‰®3/ßçİ¬êÿë}ÀÃõgÑ
ÈJî_››ìt*&&4mâj Õ¢ÛÕÓİ‚°\ÍW¡çîpj¯µ³N¥A@tÓÑ!tIÇ$ÑÔet <ß­HP:ÿ…v¨)›nn#I¢F"Ÿ]„[³0f\N§bjÅc+ÉH”(1zãÒXà‰¬Uq1Î'.j£ra:†WlĞÓrT¢ÇôJÅè/(0Òä«´ŸiùÿŒ8¿…òË¡š¸ Âg¼M!&İãzÍ%¿Š¸gM' àH¦¢qºSQ,¥‹F00ÜÕÂ´—Ğíü¯>L‡„[¬¿Œ~"bq¯­¿PPÏ¯UœTïª'±|Ìˆ×’@*íH.2áP)ü94ûıÔT2?ÆˆŸ­`ºñI¨‡Ã?í©÷h)T„kwñ7a§9ŒìwP·ã”9Ã}[8;ıÏ)î¹/«ùmmJäÎ•nHDqr6èg Mx©ÕÁ˜û‹ô—}cI—yÉ—÷}û­‡”f²^aôìtñšç“·éO°\Í®ğ]ñDİº©Ó~D¯3u’´Ô#‚DN’ÅcIK£iÉ¯oç§kCñÇ¾W¬)Ù@É0wKCªVÕ&|ÈGtŒp@ú¤°+füªÀv©ß¥XË<*s–1]µb‡?KJ	oÂ©M6W´*ì‡Æ$Pü%RdÂ´:)ş/ê¤z(¿ãò'OçlÏşÚdÀó¾~ârXg—Íä»şOÊaº” )JìÊÓÁ‚"nÅ´¤õ“çëYúr(;»Tµ¤F—<(fíİ¹æÂøå56.WîÆwXŞp§ÉBÔzÇA'æJ¶Ööó™ qi@ÜœĞ|ÉØhô bèK$zMB"ä®XÉm³u;!âß8äÒ„Sç‡e …c= {1Ê­†MÏ´XMÆaØhÊÉ¤o¦æ#¬C–UÊó¶ÄqTuïÌBË±k]VñB‰éjâ¶Nº˜úÏI±iÀÅtÈ$¨J‰6›?çİWwé-\[;Ô­È²YTi]<j~ARDÃÊq2Îæ4733ªÓË©–ÈtÜ7,¨»pøÊßÿ ÿÎº×}Ñ+/ªÊ›7ı¥q/k`´}ßÉ{oóu¹ÃlS“LéÔ¡æ2õ”‘L?ZÂ˜ìdÆêi(¦pêb™eµÜÊO¾.Ù=xMbº
)XáıÜĞ€#¹”.Â;œFı›„”l	ÛÒ\ìèãX³º
pœmªÖôdÅÄåˆ9dH±¾%lº&îÕµªTÏ\Ã(Ği9íP‡’’Hô/«°Ê[&Ç‚È:ÛHz?iÒÁ13õ´7›(ÜÃs?®ÎŞ	k–r18¶+önLÜçX{òÛx©g"}]ÓŞ& aĞııEä.€àëãÆ9Ú%šu»+ª%Æk8ú¿F—6a™Ë &[ÎÅ5QƒA¶Çd+&Aà¬¹	"¾Èî‚Ò=û €7Ï#Hîl'|üØ3ü”Ê”ÜàdØŠÇÎöePÄU›Á¢¢moÙ¦ğæOÊ¼3€şéìıëZóád,7^_f£	Äs^ ‚Ëô•v–EoXKşÂÍb£ËRœ)ã+âÃ?Û„ñİ¤7µÒ8ñ²ÂmHz®êìnqœ'êUÎ÷'@Ò¿FAU#áÓ	•†³Bg¾á†ÆñŸı½zá7<ë¨÷ƒDkBá™ÄòÔÕy`÷Ü­Zínğ‰ÛdÒ6½íåŸ¥0-–G_ˆ_CÙ<MÅÉF—,}D"¨JºÃ(ØPÆóR˜%Û_ÌÂ;ÆbÇlÔÔJ%p8ŒrìïŞÏìŒOÊS|[Ä¡IŠ*.+>}íƒ-=ì‡Ï
‰ÀãÖGnÕ¹#Egµµ¦jñ¶07Yêz“a*¸õ]xÃ·“#(%K•er`”^z"
•ui‘¹²€ÓßE_À:‡6?˜¼Q§ØÙü6³ı<ZÏzğˆ"#y´`1—ø¨A›À£7ãGáí[õÿLvJ#($ÎÀi;n¶ |d3à¯v ) LÕÌ"ªµM¢µ/ÎÛ˜Ü¶5t‘FG‹‰#cÒ©Éßğ’7ßù?Û.Ó(I<†ş:yõÅõ„TE«.ˆé›1¬gbLd¢é;”—2D%˜¦'mş=WÊÿ”r Cßgæ5Êíí‹¢®$Á½$ôAÀr—–[_VÊ[m”¹*-É`VK“n¸PG˜oj2¢‡¤±	›ıI	ó_7@ê$–Øßï]ñ,ê]Q"So„JÊ@ \¦P6Íÿ¸H7ç‡·j:ÃGÏI¯¥Üjº×FÁ³ŠeÖ8–BuÀ¥à¦l¤şFVÓ…B4vUÜ{daï»ş”¥\ÿœ.æA[dlzø0?v˜4ºàä´ÑÂ\UÌû˜›Tm*Ú¨¢üu©Ç/Ù€+gÍ	¤zÊI0¯=G¢è…ü”ä³Úë	Šö!b eúÎ*2á&Ú÷~Ş:½s·E†Uª¯¼XiU²,Ç1—~½Élpt×1ãZÌ ÍÎÛ.3ˆµ€gíq*õ`×‰ĞjùCE&ûTL×ŒªÙc¥–Z”s˜T"vRßB60OXIqí†)MÛÔ3ÖpH·íbõÆ|ØP_Ş0·z\$õ"^Vü¶ª+†©P'°vW™úÊ²±"Ajßl·ÙÎ#dºx­·`¨¼RCMB Ç7Àê2ğ’ÜïZ7wÅŞr?®»¡¼;®OÓ£S7 Fâ'X¬?Ï¾Å¢óg°WÊ›FØ%À”c­ú8&¹SÌÓŠ±H±ªÅpÀeZh_—*×Q€ñNû‹®~»x´/kNíıÙøÀ:Ÿ–Ÿ?¸É-—½¦Éƒ•¯–VT±,cğ»ãA_˜jQ¼V*/…!¹<‰[ßn1ãŠA=5´Ü@+@”ø±È+‰½ò›ç}š•2P×'•ŒŠcÜÃœ¼Y£‚¨´o°¥šº;–Û¢; 7Òæ’›æ†é5È"U‘øÅ8Ç¼çõî&âé^m,…l¼? e¬!Vm>UqQıPª“ôjŞ‚~ëz§IG‘uÊí°l\J}“ç”Öˆ·cì|ˆ‚“S$'öí@ß6IƒFÇşÃªlÒ¨S_A¸ÏHğ•;·²ÆòàI<!€Hgt»s@ˆgÏŞGU2kY–…Mß+j¶N´CkóRrª¶éª—­•ï5Éaâ>ARâîöYîrÌAº·~oÇ¦Ş"1Ş—R‘œŞŸ+Òa@Ë§jÈì‡T\
gwŒËıºuok;8¯F°0ğsºrpt£Ğ0°Œ¡—]ëĞä{T[¤$
Wn	mAbÍG$ûVãùäÍde³¸Dèo^¼ï—dOİû)	"šybÔT5`­±;ÿ?—¬yh+ª<üÜŒC–¢Ä1’û×Š3NÈù²ÒœÚÕ×æë²[õn+·Ò[¾Bù¯ÆE~D.£÷ò†¸*6‹e¡º.E)u,p"yJéûfN÷Abo£	®üæÔœÅ+º
ë£¶¦¨H•ír·+ºiœéèp\Ïß*±…°JôÏõ»í¯=êÓıƒû¤ŞÎıA+.ıÜC¦iŞ?=·ı¯gĞÊºÙ¼[¹søK·$Ã¼ùbWÕ–2îb(:´ª¨Õ0…wT¼œ×MåiDª°§P¿Êì'ÿæMü=ä)£x¬øÁ0—‘q3¦¨àG2û"š"/öÉN2d‚aøš¬•ıÑ
ûÃÂ_]ÏîË$iíê"«-ú—7µ¹Î?5$cUO­{%°9\³¾Lô*{İ0š’KN4¥Œ„±à¾èq;¶)dDlœ6z,aN³óØÓüj0Ì¿ÒÉœæ¿â6"[Õóåqö¥\Î^öÅ>ú‘³hœä•#¯û˜kBX¨ó$x¹œ¸J{
Hó½“R j.µÂºyâ4¦_-‚_X2]<¾‹æLg'lb™n¿nlß¼ 80+‘MŒÍôÍ©OT6Ám«Ú2‹€¢år¬ÑNxÿƒÂ¿òrVHeTBqØëó/°óı6­î²dås„ÏhN€ˆöék¾ÌT'øÊïå,-§ ¶o¹"|3­†÷ÑÜÏs-¢Ïş;Ílj¸8çkërÂÆh©'N©<|Yœ×Mm’¼r‘öoÄ;­ŒÎö­ôG„¡w\W€~cvÑ»$¹\¯õÕUuAøê–úSDÌKoà/§ç ("5é?¢h~íÀBƒçÅ,Ô¸Ğl¿{xÃŞKT©:ì“D˜ÄäÑëúy¥DËXy7ó÷nïÙÀİõ"°²õ47#ö\{…?4ã~”ª¹€ÿd)@Q†x™­92mêS¹Á¯áÿ·Ñ0:Ûd&¿£[Ù>&\$Ÿ»2—ÏÚ Ê*ùGa	'XıFÎÖ’áaˆQb@½1ÈÕÄµ1¢p%Ú(İãùBS9¹ù~°_«….¤¸ÈR™§Za²]É„1c<zP2µä1és¥Ni>¶±¨[¥Î!‘ap€Ö”ôMØòš¼Y+š ù‡ù)‘ßíß¿ÉoS
ª³äürâó4g{ò­¾¨y¸ëÙÆ§nğ‰ "ôØ <tÊ“Ç^RRÕ§NÜao	q©w$ö²V€ÌÁğ8HšTòÍíÍ =“È›ÏÏâ6Œõ¨¥Q·‚£·)6YÌ¬i·±$CÍş^Åæäş¬ŒRDÇS¾Ü¿66CK+2p†Ø@°h’úİ;@¾ –ì¨µ"pE®¸—§¦»,|¬ØĞm0\é¼Akgm[tjø9ÚÔ‘³åîµG³î+ñÂV¦A…]¨­CpúÖTK1
ì‰ä¼Å±¯Uøvİ£Ó5°={L‰sP©ªîõÇn÷›‚4Pj=©Ñ3é¨ş$à>¼âNyd²*TóHMÖY›€§‰¯ÉµïÍ İX?„wÍ\¾k,–&¥föh ÛÙQléšÀ#nì~A÷Ü*Ueã>ïûW£tK®î¿EÓÑNnØ_7ôÖd¯ÚÊ({ôCÜ—ë¶¥ >]’},›…÷cè7pXšs.ø„ø¤ö+
Üsô
ÖÖEMB|ÿZ÷‡/¹• uòpìêÑïø|DÓ·wcĞÕn!öù£e#4Ø<y2,©WK:‘iÃ„5ÄÍÕ¹×³9]˜›[.µßœ7 †ÿšİÅªömÈGNÁwåâ\'}$J˜®=(¿‹ô[ëRæ›Ï5­+ù}NI,„|_3xn¾;€%XBü÷¨§u"úãa êÄºvfr‹oyz•İQİ¥•Ô¯÷$Õ?ÿ’÷8w¾=x-ñöbH0‘Êãœ'Xºø‚â’ÑğçˆË­@·jË”³y=Ì‡wql •Ù$î®õ8Ú*ú xêêğ©ªTŒŸùyÆ7Ô±µÜOá²ÿ}öò¦d çBÙW19>¸AY†n¶mAd§Ü'OI&øw¹k¬W·h§Ÿ÷ÆÍïñ™–Ú‹´û22€ãÛá{K¢,ƒÄ± ;€T<…Ïr ºr/CÉ,F¹½˜™r9¸éÑ‹m×•z
€vû÷9áÌ¨â>ƒBÅÂõk?jjúk…†¼û.Ìo-î"Àÿö!s°Zı<2Öó¯ç	i“Ê“òëÓ`xÄÛ®­Â˜äAƒEÔ_:‡”–öÃ$¢íœä©ÒÿÿNŸnY~˜É‘í"ƒå;«7WçÈC}|,²İq¿Às}µn)!Ù»ğWMX¬Š¥?VÀ³…OT(7DÀñıîşƒ¾©+×á³/€°Õİ‰4pê>O~=ÖHäçh«©û¢º†X:³~`Úâzªæşz¯_š:¦kÎ©"qu+»F™³n‚Ó_5Í¡âi …A6¤×ë¹çîÃ§
îe>TAxÒ¬¤&ÄU9ø¢Ñ×æÙ´d
0­ùK±™,ì½ŞéuƒÇ8úÇ8õÔ-jñéòı–Îák¾o‡"ïVÎÏOu¾\¯‚ş«yI¥CàÙ¸ŸEÿŒ…™gô›õDÇ6JÇ¡h-j–®IÇãÂŠ–ßqôõÇ1&ÎD!¿T	òôCìúhÍ‹µİ‡±şÍÔP&èÑ1kõQ›ãµbfÿìõÌZ>n¦©ç^š–Ekâ3®×Î'şÑ‘ÑJ¯ª† 2ïv‘‚ÂŸ<÷¬¾6[¯noó"õ¨díŞ2	8eÎ±ÖÔ AU¢‰ı™|º3Ì³¯Áõõ;nûuw@“5rîSpH(XïŞŠê(y“=©2µ’dtÒ76=JÜ8êv›š†n-šÒÎmTÂĞEÊ¸ñx0şLB{V²WRqÑ0jäƒÂ	1“õ+7ä%Ig>T„é©’yU%álÓ92¼ ]KÖËiùÅ%S©HÓ€ÉÂ¸Ó”ˆƒÃxx{{ÙG³}Ûİ»¯r¡ _HGe|öÜ.
Hè¼OœfCÄEnógÛ@1‚=5Ø¶hÁZĞh"CKVa{Êb
49ËdÜŞ¿/ µoM3rÄ2ŸÇ•¼3ÅëRÆ9NÅ²ªNªíÔ1ØŠÏ·è]P=(Ñ	N‹½Ú*`œÌĞÎÇıß)¬U^ŒÂÄùÀU'ê3/×İ?T1 6d^ˆ(‰şÎg¨ÔDë«šlBmKôYŒæ*q Høm6Ê—Vê¤7`éo›,7¶Çvy% ¦CûQ²q*bµ½à’Ñ«%k2S4şhû*ÊåCÔ`¸ì=¼¸^MLD‰.“(ËúE×ƒÜ6èˆ·Éÿíİf$JBPÑ+¶ ¬Í¿V«¥¨áæJÎ[Ñ®½&LkÃíRkòEÓ°~¢§ã¿èZÓœĞ|G< °Sû«t2”|±#j™¸Ú;JOSÄş ¨j±“ñtÒ·Ü§9lN2Õ³1r,êæUç8
Æàiø-Ú8¶Cğn·úMPÔu¡ìúr|üö†4w8¤~ÑÀíÙ­·›×Rªq¿qR‡:WR‚'ÿ¡ö`Ôgá‘ŒÄæ€?’õÇvñ.ÈÍ˜©ÀÏ»×Ew]'Êñj}­~Û~‚ùEğÎã1„’h;©İ
›å7Ü_É{1œ/nív
Y^:ö HË(1N
¼¼šäª@S9ŞşËß!˜•lJ¡$3¯˜NÈDrdè…E¸ÉysÂ87¨ÒAQPì1 °=òf‡b$+OÏõ”İ>Åü¬BCì½º×3ˆS™O_v§¹l&¿İsñ6®¬Wïûø»ó+%Q‹¥üXMú(V©ibïW]ußä¡å@ïß~¤šH Õ¼S…<mæBc1ŒˆÈè¦Ç8K—HJ*Q„ÎÊ¸s4ğ¤ÎËéoRé3ÖEª7º¯p’y î”2ßèYRò~?Í¨ïğ»Ç Ewÿ•Õ¨ëIùÏbÖQ!¾ıVÁÏA'nù5;\ôÎN½/ö=â)H„£JRÛ!_â½# [ÅïŞF`sÍm</AÑWécÔC9ˆéúŠÏK£Aå§÷ ØùU¾=•}"“Êª5¸[ô"2ö3°=òğ×™Ø¡&2mr4+A(Û8…@™³'0êØ’@tdà¢£ğ¾§úbş’÷â§ÏC$¿„ùøzxúeK$—1x^Ø0|PcÙe Ô9£À25‰ã˜>Æ@hÄ¯Ô½¾,+¹5¸>NM<ëd„¦fBµ"t`¼d 
,(×|ÉTÈôÍ¸ê\äˆôE8	\®lC2Nl^s‹Œ¿¶7íxş=F½#CGtÜÄª2Í@}Á¤cNŒ-–”Ó1x+rîgç<¿ŸI&9¤şù‘„ËÒ‡O½ØãPúülMCµı7Õ¸/o3NFªÇ°×†ÇfYû×À¢@Ûëã`È©
8mİkòo1'a&ãV|ßP–º8ş*èÙÿª¦·+ñ@¾¥BÑxt›<Jàol5
¦ë£ H
§Bp¨kŸ±Z¤©ÀXïÆ¡n06ĞÅEóXÙö(ãğV·Ì
#ãÛFŠ³­¤WAOlE8$ú—™ä[Rğ¸_{‰!Òc 
a»	=ÉkU-Œ‰G˜«ú´ÕàaF,ŒS /ƒÀÖØz­‡2g#«á”_u´·…³!Õè+Öt»;1<İ‡µY+”¹Å‡ÜO[eàq’7PÑçyÖ¨»¬%‘ì+L*×šá`Å®ÛzÜXB	@y3#uÜgB¤€`Œé«¯Š›d:±oÎºÅŠo	~”ûE5•ÚÛW¤â›Ë{ƒ¾Jö,_L‹KÓmu^&4kKt.6’>`êhSqO^&
¹B„ `Pn¬Æô‘„‹ã
çù·3iÉÜ¸©äŒßÄÁÄ/ï¸µg[ 1¢c¼DÈT¹lşA?gÛU«^L${3ˆ¥y+ÎÂg £ÃN?1Pˆ™´gäØ/ºûç*ésÃ³GeøÎU<v…G$ø«PÙM½cëÁ²mälb·ËSº’Õ¯–õ¤\d^ùË;ÃõUİ•RÎ¹Õ‚ÓJ´Å‘ƒ]Õ·Òc™!ßUj­]²±›½J­yeÇŒ°ÍÕÉKÚC.Œ!ZZéÔcİVq6HÍo‰7b¤…ÈH¢ºµ;/¯‘Uqkkğ“¤¯…©G1u4uªú•ËÇå.øt(4WPı>(Õç^aÑƒ`4ÜµE¤ÿÖ‘iá™›)\nBî-Xnš¢”e’f5iTŸŠE‚QœTZTŠ"Ì4|ä"WÜõ5}QaFCÒŒã]yÌÜ]R\î<m¾@ÑÄÀë‚¸”ÎôéğŸÑ6”Åü¨¸†ºô¹ÈZ¦„2MÌ2{Z«ĞŞEÎ5 p×†ÎÑ÷™ˆ¶Š|£øoz®l<LT«Q¸,$é
„‹C¬0ÛŞä‡¾¢çqVT¾}¬¤>û·»v±µ_hM Dlÿñ·—ó-†èÍxÓ²bKhŞlEêG1Ê2›•-y‘ÉßÍ¹¸¹(ïDpÅ,Í¢ÄP}†l£h¦–ñµ9òÙFUb¡FëX©z€×¿Ñ6Â÷À“}q^Ó7$×³ó±´ù†°]ûƒ+³—€Õ«KÃí„xê_[YÛ£6MYµ²£óVaıM÷²-â‹eâ‚+`l„Ä\YÛéêW¯ÍkÔHNBµ®¦ƒàğß©'v6P½•ÀV£ÿ‡T”0Q¿áÚ3J]YÂ^p”1eä&‚Í¦B=h?÷(xyì¶•+‡¥¤ˆÒ—ÿÿ™½`91ŸÆû…„<¬÷õ»æD"ë¢hU!bî—úÌÇÇt½¶=ú
rÍ
J”¬]ç	ñI‹GĞ‰+Jüäßó`¡!A«7SnŸ¥f3•¸%cõq!Ùl*Övn³¨9/88È¹­	vÇ<Oşˆ™ã®ÛÀª­*êÍ®ÿ-.mÂİf‘)"õÉå+\ğ¨M.+MõTz‘m†Š’-Â7Ú£LjîÂ¡vBÉ)hhLo(Ìá¯bËgàL*L²iKÂ_h6qy;—:èÏmX…»ØDYÜŸœi/”TÃùŸ ÉÖú-WX³;8Ô89Kü¨—¹,œVIN„/qÿzÄ<x¢ÙGŸnøïClÒ%~ÆYÓöÓÒpÕÚ4.Z¡ñ8z7d4íwà
Á8qt[V­±©]êÄLÎÛ5y§.4¥®ıYna2Àş<†İµorQÄu=röÂp{=ê¦˜K
ØI
’2_’3A~3áS™œ;1"{ƒq4ÇAÄ¾²îçŒZ›×ydÀÏÚT	„4f¦îX pº`š1­ŞM»‚ÓNpÛ´
!§Âd+r")wîèÜŠàxÁ"üVtqréí½¼®ñ<P"¨q¾ëP9= 9÷`*ÛÚÈÊe.µgTÎxhbQmS2œeÈó±•fW‹B	Uˆ¤³³+	¶ò<•#îz’`Í¹(ìØ±ëf/áË†ŠÔÓœ¸¡”S{0>óüyL¾ŸvLp§5ÿ:[ìÂàN%¯&ï‡{2ò=9—ÄïH¨^™ĞYˆaDşä€sĞ"pœ¶…è‰ÍÓHQQÑB{7ÒwàãD»Èÿíä+Ú‰½cûĞQØÂKÇ×SöøU|/Ì÷§RQjS´ï“eĞ>}o³w)6rğ*éf(ïi*Ş‘¬¢*y}*Ï]œÿ$M†w¸kæUˆÁıMàååĞúô“Ë‹05f¹ªDyÍ ]ëYtMtµBÔÎLaûŠäFu>p˜{˜(8şÀ²-NIùO÷Í¦tl ¸·’ãÓØ>!‚“øä¤Ã“Â†p!}QgJ!Ùş]Ì¨"ÌE{´.Z£‚ì.î:rK¹/AC¹»ïepˆ>ùL›£íK'x6|©dA$§Ì!ÁÊtcÄ|fl‚×å6È6~Kä„d¿p¦«XP®O[LhùaU<½6íÜ˜®R şSu‚1¾thKBÇ»aFì¢¯­,Ğxâù„§Ï‹ÏÃoXÛĞ/tu‘ü(d ¬¯}ïÂ÷‹
Ö±]°æğáèÁxòõÅCŠYƒ”ÍÄz˜Í‹İ”&[óºÜ¥PÈu”}æ¶].|(jÏbú„ĞÊ}@ËÉts'ó	˜.nDTŒ(Ú~§v†Õl¾°‘è–ta#ú“í?eË\Ma&R„Fú•Pø>‡.àç?%1° /’í¤!·°}Y,XÅîÏ³£ ÏK%ãv@ ûi¥gl/ı1vóE!æ†°™õOğS#ÂåUÍ‰I™Y¹I‘µšQÊÖc$\U«¯MgôoŸ­>®sõõşã{?Úò&™ÜÒ½:iø§“‚”Âisşn?L3ğIĞPXo•ˆ}Fê¥7fø“W =©]¤„d8d œ 4x¢9Á]Ê+c5é¼×Jsw‹ë˜îVš¹¨È¶–»ù¯ÅëúIÎÀV r
„±Có?o²{SUÒ>'w^2’ Ïäª¢?RßsÚà-ÅX>9ïØºÒ*HCŒ¬Z†à_NÃ^w¸³k‰…{ÎÚÜ'ÀÔ’Ê£ıvc›t¶bÇ¥¡*lv<éüP—T¸ëgT³3/!kTÜp&êNÇuÔ@œKŠÒóé_Å7*Q5s5 )³/ywÖğánwÁ¸ÎWé¤§œ*:ñvÌ_W·O1p;à¢}KpX¯ú´Ê] ã¥…	Ø÷ğ0¿„A&8Ï›u"L~µçãÑ.õı}1şëìv×¿…0fRŞi&¦]-ºÂ;ı¹ªáÂÜê*çe™wˆéjÿÜoˆPzêé>+f@êÏ¯®…¼%%œüÖ‘€H	fl¾`ƒ—?RÈòm3“uê‰ØûX»&1D2‡ ‡:ØVği1‚ìUBV†ŒSD+f~;€¦ ¾±÷yXÙ&!Rİşñ¼Å4-RQô§6`øLş%{¢§}¡‡›-±Âùå¤rÎ•Î½Ü	èDëx;øÍ×bv©ÖÊ
$hÓ[Ÿ#
*nùœœ™”ô¦•$ÎØ:¡fiŞcIf¦Q’H@³ƒ'j;hŸ.à¼ÁÛ6Üuéå¸‹-Tã‡° õ^‚eÖÂ{eÌY®1Û!T‘§xºÂkœyøò=¤bà4í
Œ¬z_©×¯y¥	MóŞázºí­gHäf*A»K€Ú¡Â›Í|Jƒ«Æv÷‡
eÚWmØ·á\cK]Æ{´°tÇÆ©äØô  –wÑ.	x¤“‰‘J7Ñh–(;#<]&v8lLHrŞìÿ±è FóGÒI‡ÎÎV!cp—K'	AøPıOBP¸Hh>"áı‹|
4=Úv*}àËÒ{ó3Ö-QŞ>©:2|
q»üŞM1ûmáˆ„XøÅJTQrSÒŒ°Æ
{îŸ$•ôªöÁ¦2‹i8{!¬éDúÃ1€KğU{=œSÁÊ¢ãå‹$™°Òdgú¬ÎSïÎ¸<˜–Ñğ	&D×äˆş¸¨A#qMUÊJgFÉÈ…Q(Æ­2µï˜À™·¹ é+ÉJè‚Rr+3¡^fSÛğ“ìÚ¶$ÓNDçÄ]ïö—NAw~ÅÈäY¬±K×!íóC˜_äÈKÚÇa½XÄŸÉqYğÊ¹ÿXöOE(;ÀªBZ*ÚÕã*„{'İyöşYLıQcŸëdÃŸDÓıBˆ­rùp4ü'ˆ#^oN(Š[sbë­©ŞŠ·Pq‘´@”v±—®D‹–Ô]C‰PsÜ:òÙ±ã¹Ú’§¬ì…e<ò[¦á3ñ~5‰|§=_¾B<TjúŠ>y#Ù!oƒÒ€^ÉÑò4/ğ­è¾°8¬Çù"—iû~Ay€¡E#„»©7‡F\¸ëî¶gé£öDA>Y·ªú¥BÚf‹Êöm‡Ù—-ûds±:rÁ<†>–I …ÛúY-ĞœşÉZ9àÉËè0qÚ±]·Sá ²&I-ì PNH–ÆÓâ·œšŞß†Ğ,{ÇÓ„¶½cL€¼ƒG×©]óƒšõí(ĞÄI´øD™„¡@)³A§”Ó¢	t0] /[Tq†Û`a.r3[ËY° ‡Uä™\U˜ºŸ>=ŠÚR2„ÒœìmpIÜŠáÈHÁ–
ÃŒ³üòDñêL«H*™L%mŸ6«]ƒ›M‚CëIF·z”b¬}pq›Å«†ê33Oïhá+‹ÈŸ©S.}®‘ÿq
k‡lÌß©kB«ëA™åRı/S1ş[b~T»Ş¥wîÒy?rÿ£ÍwŞ|âRR,}Ó„§~¯ÍR£ß°Ïé9˜òÿ”iÏùzœtR`éÓc§b_ŒRTïÈ¶î›J×r#÷úJêŸÿË;Æb”Ã²SÁxê­ÁŠ²’›yìüm¤¨p‘Õßó®÷ëâauC¡,¾TAIK;Ğ"–×r(ú~ Uûœ¸lˆeür7‘Y{9Ìò!T§U19§9(búhFÛ5[FJ¹½é‡—²{çÒ™0å%¹¸[¯‚»,º¨5h¼ádix¦.&èğ'ÑãÓp@\éá¨aqia“ÜO+-î);Ì*¼#ö²úÜN!e¾[ÿ™8ŸWºy¤¼5>ó9›nôuBòGE’ûšRëm˜véòo‡wk¯¤ŒúØ)÷^q6îÕ783ÿ­ç~ó€-r‰Ç ûR,†á0ijš$8ì!¶íÌ
€ÿ«ğ_=3áå@oÍôÿM!~15–‚î7úÙ1¾9/~Rlr65ï(±ã?4?@ıeH±ö4’­èä›˜N}n4F”ŠÕf*†Êû×úüô„Ï+¶NÆÖr£Ë¼ig<;çşHp†Òè!)Ô1Eïj¹\)C? mÑã½ÔøÌ³T‚Âƒ¨Óm¿ `Iô3”?,}ÂƒƒnFáô!c87%Vô¸¬ßÛJéyt"ãì_t‘9mÜãğ&à1”GDÍÎ¬€fc¾õªÇÙö±èJè©ÔZñMÎIÜĞ,Gf@aâ(§]¾ÈÇ;:I‘i¸¤ÁÏóÖ‹¡fóe*¹zCıò#)Gû'êû÷!f¬1JšˆS¿HœÇY±”Àô½ŸfãûTõ0V£ò¿lê´uÙi’!aq9«lÅjcŞEõÛYqıÊœm¦sÂ\Ê¤±l:Tò˜`íƒµºÄ·>¸7§ÖbÄ§b©>š¾Ìzá=oöÊx°Fw²!Ù¤	â"Otv¬Ş8ìì¡'¸†ëpJÅÉÓ|N`oœ?¨ªçsÅ›ğ˜'¥õfÃJË½bÖè‹ÌIsİÓ¿ORi7cš’)E2gg¼­éíÔ¶—ğ1ÙÄZ÷ov`D;`Õò	@ÒF1[8hˆ{Ë²Ãó-"Òš=L
Spô@†e©gÁ°ö”…àê8‘YÊ ®ÔÁ¦3ŸZ ßfª$È‹¥‚ãëm2ò“®
[ÉE9öÖé@‡u!û4¨'w=(½R4¦ÖŸ¨¾+ÜŞú6ëÄ¸UãV'Ú•TáóŠCM$â91vO³ãCgy"ïRGÄà»!€ÚCüˆà$+ÄÃ'ğ%S¢mõ(.a´öEßèDºèso/åÜb#rjŞ»çdm&K•A4 š2’^Ø“úÚ\Á‘nV›rÎCCë3ºşÍØ$tËƒÎÒ"EÑ…$û®Jİ_‘pËı$°ı†#™6¯©šÑ4t9”zq©ÊŠ)‡/´*À‰8#ï{k~®pÁòÄšvÔß„gıç#[B¼¦ILíj†®+ÜãÖ°Ø‹W<F‰ma}İ1j?¨õÑ= ·$)é¹¶ŒZO	¼V1WÈ;'ÆÒ›«aÎ6ĞP|*öF¿}>Ö“DJôíQ¥w^%†„ï€ã+7PâÑ™hœ8ÀF{pîf\ÄçUUË:œóÎ„®:È\y–P7Pg¼Pf¬m,²m6yUx¾¨,Z¡¹>œ¿’@ıCÙÔÎ	G2Œ®ÒWêÊûo¶l·„˜ìä_ ¿ôÌ˜ó†×Ë¥`twä¨:J9…Ò‘1˜š.ìVœÈÃ”GDÿúÕ¬-…8E¯?6œ¼ñ„s?Ù¶Bã£éíçœê²X‰	§%Ê‚4ÿE²2‘’D°d¨WS$‰Äu˜t¿ ^ºç|fÎ)ò­.m°(Có“:u üVy%ÑØËb£àÊÀ¾„ªÃ€å*±0w´«Ç­¯.¯i³„øXFÂí†Á#,,©D§Ì
33ÙÊÑğ¿º®Õo%Ò[;%}ÛmÊ“vR5 ,Ñ 
ëUÂ9šlq’Ùg)t»[lèÉo,²¸€åJqêëccşM>kIµr­[VÍ;„3}»©û‚@¼jäöÓâ³Š#†…<œ!V3˜(§ª³d³Ø7öññ{‰4?@ógˆáuÚê#ExWŸgÀ¦u‡ıBişJ—É˜ ÊuÈ¸ƒ]Ç³-®MØ!š`Ø¶;GyPZmïZ‰D|:f¸üœ5z'
Ã„ŒÑ¸¼ÏC2”Mg!B`ÊâY%S°k´İÅ£›iU€~d=Ïûî 8È,Ø_DÛìíı?M)º,ëà!ç»´Æ§ÔÆá5”1Õ3å{ó|]®ìÚ{á² 7a§Îó[ÜñfËiD>şÒöÓ2¬®…‚îÈ*^t®HVöÃ©£•V Ğt+â´€:¬íOôhBEsù±1†Má#}	Á£@]ŞkuzÎşİÿ”±6œyşwB^Üìı1#±=0Ûx¸—Y÷Ñğ¯3ğÇ¼ÚØK¤Ošn’{xÕ1Çÿ´`=})"xNö…/¼m©Wİ$f’¥O~1›8B)§#;÷&³×9äPµ¸ßuë!‡X×'¯¯ü:ãÏ*%ÁtsMpøÄ]hvÂtfË´&Ññæ€z†ã©!këFîOWt+Q4Q-¦ÄQsóÎğ~(ÉËÀ$‘àŸåz³Êœ“Ütã‚ı‰7ù8bUÑºŞ¼ãÁ­z¹¸ÊŒÓá7sw„‚ğ(ÃáL^»šÀÏ¨[ ÅœÅHçªÖĞYUÎ#g³®1tDöXã@×#99÷J›)2¹úw}E°ÖÍü& äm	ÉøIµEº`;ˆ—{ÓS‹ñ¡ ŠSiÓ=É5úÒV2…óê£zµP©ázc ;Ç?KO4°vjkÊAÚaÇ¸SF¯-ÜUÖc.I{Ä¶%ó‚–	äùYŸˆÏ¬|¿T)X¥IûöL;6VÇ†*»˜l‘9béØÈŞc#ˆ\ˆ3ç•Âš¤×¤&f]âª3wy­[Y)Ò*‡
‹± Ey'Å6*kß²_‘ç=ÙZ¢¸Äâãú„—çÓV*
yoú?||_Ó~¨îœË&’‹ÂñâJĞ¨ÎLËS&éš‡9 yg¨RÃ3øØjttw}Lib•$‘¾¬×˜‡jQo#Cö2ıí³0<™ì1‚pô‡„·úúšnÜ š]|íƒ´şaÿË#ÚÌ.ÍİZU¡Äß9ezŞ?BS_ºïaç@R©JIRÎ7'õ-&€5Æ	‰Ş]«JşÙ<˜p½^!H#x ‹‰¢Qe@×ŸÕµœ5Ã€Úí¹‹OÌsÈÛ(›ï5Ä°GÚ ·§+’Š¥şl*,“l‚öõÆ‡ì¯…Òû\ÌŸ¶¬röÑ*©/qs1?'üÍ¯S“CZ%D²À/å‰:„q»òU:uúÈq,4÷[(‰×¦˜½³-MÙAÛ¨°``ïOw½ìFº@H–Œ„‡Ø¿™¿ı€ …ir¦§~VÈp~WR¨¶ûÆåÎ#ÌP	Îh©øûŠqıR#¼ã‹é¼4fƒ5cXÆ6M8óØ6v+òÓR Exÿïïúº£‹l#È7a€’ÌsNÈ	Fî§2ü´°œQÂQodL®©2Û:Ä°ûP—RßU¢úØvW3`íæV®`&î?™’•!U¦”M%ÜÊY/3µ ÷b™Î²fy×îŠÜ„}_Õò5ÁE]7^¨)ª°Z8»è_ãä¾–_ó Õ3yüÍ™«•Véò ÁÃµ÷ËÕòÕ)d/¾­üÕDr:Å>LÃ{yP¬ÍXIÉKÑñ¹ Æòµó²/!ŞÌRÎåìv®ÑäEæÉ×zCø‡ì)÷)ªœ¿êv¨¼h•¬ààæÁ¬4rµ&æ49%oHO·wuÉ6—OTÿeËbÚÚ¶Æ‰:gvÚáB&ïÖhñ¢õO¼mP-¨tu‡Îÿt4€~)á[£›é 5
7Dÿšz=*›“Q~èÛ=sJ«ÙwXBŠ;-Ô+d4Z‡=Põ\@ì|Ş
Ê…{"Bç2E«ªşÿ‡² ¼‰ç^@¾J;¸cšjÏ{Ü
íŞJËùE6÷Ãİ©\¸KYh5„¾ıÊå<`õ»ü@Ï` ø¦RåŞò<‹Uöõ7,’Ù§/Á‚EŸ~Ñ „àøoNX3­ÂYŠe@º±,…±c2ÁBÙ3X™õOó8.êUwøW+Óı¨u®X,|«‘­¢Áù`­×ı?·d W©`~g›Pgi,
5wÔ~;ñ4¼m¼üöé(EïàMº!ô¾ ª”À#&Z_ëÉBêBÆák±sbùã”A'Jaä±xUz.°(İÎÔ\&¡°ÅZ<ôgbÉÁÑü1°µë÷oæ¾ãÎëéAÍT Q’Õ)¶¸‘Qô@+óbMĞ÷bìÜØR,ÿÎQ5]İ>=ß½qù
~ËD&.é²$§_Ú§)W¢µƒÃ¤@€¬ö o>Õ˜eÆ0l:ÿyCá*â!ŠãñVS–œş
HÈ7Á…eö•|¨ ~Bh“ÀÉøƒ¥ztF‰aDíí“ÅSøúL²üªë]_6›„s)Åèãæ¤u1ÏaøÚù×U$9Ìîú€qb›Ñ>|¶“6dªd;ÆıâÖk×|æ&SÊ¸‚Ó®&>@Z|&¼r&T›Â§ñ91É¬yÓÎ%—›RV´N*2ÁªŒ û¤å˜ÙcÔĞ41hTxEH+}U&í1«~ø£õãˆç€Ná#tº=ÊK>”U¾­Wäîªê½†¾-ØêU¸[:u¼dÿÅ
 àÛàŒƒè…óg´Õ¥Pó¸€
§¢å	fHæãE½)ıÛ\#
ê+tcÏÌ·Y”xQ’üy06°3ãFK€áÚÂßÈ÷ÌV c`’âË"ş¶@”úÔ,©HGû]º$V|ÇìpŸÀ0.ƒt‰ŠA*4h„v[2şéVù0MïmÏRÂb¦®:’Rø¯›2pçáM³'°Öb4xâBkÛ*;ÈV+ó­‹Â½	ßœjøÀÈod8ÓšåÚ^º@7>ˆ[ŸãÎNY×j˜)ÄK>[?gfÅĞGAïîŠÇa[Nòg¤°3‘%ûÈ„[2Q³çÍ2®ä°)ŠNâÀÿÔà÷0˜gbÏOŞ°PÂY>Uêòsò&““jogxĞäµ¬è«/º«,{°x4Úü­XÂæ§cC¿'µÕş_ä–ÙÚ­99Dí ëğÛÆa­…¨D3ÓéêçqixıÓñÑ{Ú#PÄKShZõ¹6‡å‚m— ìŠŸÉæ·‡:ğ=ï•‹x!R8ôÔ§Ò‰Ò—ÜXØ9²‚344É+Û›­Ğ¶ãE°³—@àŸ6´ùå›'ï¢ŞÚ]‚¤Z;#ÃÏkšõ©€¡«üî¥k®i_tL0=øZkI¡ ˜êjjŒûçö¶h]Ôÿ<ãîğï-¯ˆñFÖİ	´Cƒˆf†ì­0P¾ŞcÂ)£~ºJä/O^XÄâŸ  íœeÔ…¦Ñ¡+µp¾˜ˆìù]K±´²$ºÃVøìº.)2•=VîO¨ÕÖş9c_xLN„IE²N©¶.”7Sˆè:ˆü‹áRiƒĞ+TƒÎx‘pò­„ÎÇF3¿QÔ(!9ö6½¤gí¦…Teµ¹·El»‰]a¾šÄÓ °ìó¸Õ ª¸ßï«L¾·QÚEêD§vÉšÁé`”—mPoxt“«
<”·ú Èë9†È@áJóv­}ŠŸûñ2Êşh3úÂIÑğ›`ÄMNúDŒ13®c…F«”–‹=ÎàöIØsºïÔ%ì¤ì·4–óY•*g= >®Äñ$‰})J «ØyÑ£’S+ö¶`"ø3êhjsÔB¸Õâ„ãéH£r¦°cÒsÛEİIí(6©7÷/}=ùXR“ü½d¶Õ÷‡]ñ_ÍàA@¨¶‘Îï1SÌ•¡\cØÈNAÙ%ë?àK!L@f­Jè`„ÕËè\«ªò¾ƒ8Ùt>€H˜"¶lÔV’Z;ÙÈv´ÈÍÂ[ñ ÿg‘¯®½×UO+±“[h‚Ë€¸¾í§É}ïà#±QÛÓhx* ’;n¸!If­9äÊ¶ï¸®Yh?¶u§Óe•œ×F7(•Šš‹°Ç0A¿DVX¯8ì±Ï?H¬I=o:#Î¢VùÛ®Ôs›KÓò‹˜ v“øEU`pI:8”è×òŒ¦Ìï¡®êl¿*ïü[bNâOa¶*
7ŸNùt¿ı$!nÀd—k“¬KjYO9è){Äd‚;!Ht²=¯­aíêÙ½‚ÖázF
öSU¶ø‘.fşƒjtFA$–ikƒçvº¡Po)‚kCLs„Î/ÿœÀqP6Ë´3J9È8©üX¢SĞÒAÛ[i:Ï¨På.?_¯kÆì=³í‘
|vıŸËö‚eM*{ûn<ï´¼”à(4qGq›ú8Ã=7]1	‰ô±Ë±íÔp&İdÈ88°jFÖ¡wöR. *m“éSÿ­ÌË•b\ŸğYêğÏ.j0ƒ½Ê	4 !”¸¡U4TÔîR³¥î_›ìç_Ğì±¿ı¦¨Dü§ ¿Ê/~ìlt[îQHºb/EÎáU›¬©²HÖ™ÆÏú™ƒ)÷qƒi@./%Ù
~£‘@«Í|nqß£–hÔHıÂƒşßWÖgÇ¤j²ÿ3ÒÃ}I(r´Ãxà‹‹İ[¶,Øy‘³v×c¥d–6ïÑİYlŸ©î¬Ô×IƒùzøIñHë-šô‰.ÿ×{ƒ1ËJF/ÕÎ1€Å.ÓE±vËØäÄ³µSyR\³b½İÏş3€E­9Vè5ä Í"§ K|‰ŞT k\§¤7N<%
İ04S({Å1ŞÙ¶ÖÁ©
Ò¬v%©™ÛÉ¾@JÏÕ%@	.Øª/µ©4¨¹ çQ#(wæğT´“‹£şO	L’Ú ®ñöâ©#/f÷4%xPØ£«z$é˜„;c¡ñ’¹çš÷i´yR;ü€Oé)]{aü£07ü:y†İr5–5J~ÁÖE¥1³š%pÖX-(|Vµ[Ÿ¾xõ•MWƒzàw.´tl<p¢B“+>È_ÆG™Hä÷Å²ÇæÄH¥…ªj@ \·(¯w§Wğ3¶«%õª&fÔÄx%å{~üiá/İ˜¡²5äÏLsÜC½pŞ·ãÍ‰åEû©“Ş…İ–<¼_àÏ‘šÂ:,Äãø5:€Ï5M[b€¦]x×	Ö2Á_­óu¼  ¨a™EyšÜßÆt§zß²·Wß·Æ÷„’Ô74’2Õá‹Á–acé¸ß©ü%[¤FJítÍQòÁÙ-?Ç¯³I"00Á<ÙøÅ]iØS
Ğtõzf¸mÈ˜:V¬M‰Ïİybu'7vB×èÕe§¼79ÑÉæá™
YmbŸøoİÄbOµ‹ôM1iì+M%{Ö¸UÒe9Fœ±–æäíNC àÃRì$<ôI8wËk!5™ke	¼”CÜh›%šı­ÕêR˜6¸:2 [òahjXàDA¸4Û&)„SP¯ğ©WbC¡ÌA(‘GÚ#·XàšM¯y¹™¡­öÇZKyPx<_}=5Ík‡Ê0†‹9…~ÈOQ=:s†FM4’.ú›Ø~Ë¯ ÚìPŸL°xOL‚KŒºÛFól½/¯ÙBWH²¸ô®„WiUi/qì›r„‚{×ò¶÷dôÈ©yí ì>n0òˆÍ£E¶Q˜.5<nŸ$úRÅšé…ÂB­¯L¯Ít©ú&¯öÓÁ!V`<wJÁF91ıı %`ÜèÂŒñá°öùØòE;w}Ó¼Ë8…—ËIyÄô°ş­X
€= †ğ
‡õÂkç\37ûÄÎQv6bãU˜P‡MÿeÜ¸?¬û4¤Â~ËğÌ½7¡Pa=ö	È,è ì¦Pïõ¤‡âû©ê:±j,W ¾)¡İ–¨¯²Ÿ*Æ|UÃÏß{Dÿ
s*%öwª-öãX/ß_ıtífØı9EÖ);(ê—IšnF\¤ñ¡¿t%âãj£”°ˆ§Â¤ù’ÂR`Óê8qÄo
!œ«ìsìñi”[}¡»®Û×ĞTóQú­»}}şİÎ6Uv|˜±ÆbüıK/ˆ!bnÿ;¿ç«İ.•)2T§Ãâ°¬šÎà†Šx{´¢U‹ÒE±YBç"OÕ!¼ãÎ» Î§Ên*ˆMş¡¤†Ÿ× |©_ 1ß J°ƒ®è29¯—N.K®Óƒ9IˆÍYˆšÍ¦©ùŸFœ¶¨`ùîçV]g³{ß‰ğP
Ît§mf|ÿ<›óf†¨¹ıızÀ:Å´ÔØX”Ë¢¬3÷…Ò4‘Óç‚¥â+¾Ï–ˆC•ä.!9Ğ {é/KÛçÌ‹ÚÎf]
P¼ÿ÷Wi:d+d9Me	µM~Ù’€“z:¼ïĞâàj®q°”ç{ÙäÏı”¦ä¿,FéÆC¤XUĞ¿ lK Uôüõšö538rmÂôºÚ“…™ˆíır[E‹Oİ'6‡g1Ô”§’ W§ÙU±~S3ª7Q–¢&&ïûïMM¨=1ÌZÚjyÇ±÷ì4«€¢; Ù*—ªÄÎøX ,éôØæå•[¥!p›‚ÿLßï[¯¨Vœy˜
ÃäTBĞÙŸ‡öØ ¾Øzl¥Z¨#£ÒàòŒ_ÎÛÓo/ißp)5]`Ğo€Oô†«Y»Vd_4†(¿L_¦“HUßÈÙŒ¾¤®3ûÕ£<Î¾B3E.*-J8±¹r±ºk3&6°×ÒÉøg5pô©+i›Ì¸/ùªØdäAÈ_¹Òì‚<Îuª8d•¸ë“~ú”0c*G!êĞGHâŒ¤åÀö¹2â+Xâe‹‹™ôËaÍãƒ^vmÖü\)'îR…öº@YÙšËß^5;[È>zn€Óá:b²¦íß[õ–u=õàzk¾ïcyq+mşNÆê³€0,1z_YEKpÉkä1WOŠºà¼‰ó\
Š8—Â5r»-Œ¢&F4gªdmÙH€ëÁ¯Bj‘Óó
ÂH÷Îšf&HÇg@¼›U±Á7#…K¿èã“‹ÂíK•¹(]à%@tKá×8NÄúÙ^@K!¯>¡¯ıòÔÍxk‹ı%‚!‘¹VÄ	ê ƒğVXÊ¹Ö¼§²sJĞ²LäuëìÅéı… ‚á \™s×K™ò#•˜+-ùyâà8à»kÄÎÎY¶FXoø6¼·e5 ¨Ã¨2u;íiØ²qM=Ò®Ä‹KÉ]õ™ şÚ«ZäzÔŒqk8õw@Û€€@“ûïF•!¬ıó÷3¡˜®íü¿®ñ1^s>ßëBçm°¤çş¢yiğR'ñ#mH9ÏP¦»­MV¨·ü-Ü„1ŒLÆ¬˜"áÍFgòLŒƒ¯ÏT¦…9¿âM`L¬ 8{Î]ÏÚ|
©~íŒ93ºáÆ>i^×I_
ó];ÕµÒ–‰I±RûrvÈ‹Ä3Xğ›·:?B#ü€t±èW’ä‚\ Èù% ¦Q–°LÏß·BĞ*ëÎPÄÀ+ÅÈñÜW‘²‹ı*_aëÅÃuF,Z•WëôFSİlB¡ºça†f˜
àô<W
JxáÖ5‹àfrsÀµ5ÇAø gæ¿àÕ^Óº´|Q÷ıö›t=rª¯‘òP	°w€_ÉöhïÒ­DÜûnMÛ(y&±Œ˜jIÂ—Yyv¿³F<À€=­\mÌ†*ÏiÈbÂJê]9›ÿ#	SBákM)¯[
í(5R´ÌÛÙá!ÛAàÄÈ¬ßÏ}hÜîysE%%ôHušÏâäú0²€ˆÌ ;•IÕ›°¹ó®5âïZ±{}r€”ºÄh¸‹‡ˆ’‰yÖÊ‰:x‹ígoY…@PÓâU¹Õæ“¢yíDŠ>ê9qÍé57õË(ì A^×—`×Óxã¬xyT7ˆÈ½­ÚMŸ&lÒ‹Š¯b,ˆYùcƒ %¬ú‰v¤"Ä9® ¨ 2¨_x:ºb"ú°D×^M ó÷í‚·ªÈÔ ŠÉæ:[½îÔèa~ãü]4¢ô+Çß˜…4ÃŒJÈ {ÕßT½Á-r{¯;X½’ŞñZV8ÙzÃWY3ƒ‘ºõù%u§Ÿ8E.¡oøĞÆu¡ÜKŠ0Ñ<ÌY§Ã‰"ÿÁö£ÿêÏ;Ç„y‚ÇbJeå˜nuÁ¾?ÆÙ¿Iüra7OõêD•bU»¦§6%ÉD±¦Á³Áã½97_İ‹rD‘\3Ğ)£¢S© I6—c°~‘â³ñt±’™™ Á‡à†N¾°y=×N_>uKõ'õ‘¢×€Mi¿aÏ<êŒ¹2\ÃxßĞÈØîca×°lä’ä?3¤— ]q“g§Õ“j¦D‹-S05(¹×næ¤w
®µ¾¸!’SŒ•Îbh€Kc´Ç+%òÑp<$—ÚA~ £Ñcù“‘1±µ˜€”¬*úª‹©°ã†¨/çfP,İ\Ã‹8;¶^ÌÖØA$ñi(_®µŞšöU·­f‹ôBFÃ“áb*”¶Ö)ˆùA¨Lpúv8 ìfñŸàƒìèªµNÉ]›4U5.aÌS Éâi†*é*%ÿ-¬‚ºqG›RT~'Ö!BVrÒS‡íïè©^6‰4éyæ•ÄEQ*–Ÿlm*sŸ}×+,ğc®#ODu³Î<Š=°li°n	|\PØĞëşå,w%…Î™VÑ‡ŸX©§şz‹ûféæ~Ÿ}6Ïj	«ÀËa;\¤ÏÛ_:ŒDP!¦[Ê„¨Qwz6âPÓ@O@	6À®7°”Ë
–H7Dİu“1&	+³°Dq{‚LÊ¬Â&9–é÷Ğ@@v›Çôª°ƒØ"¹Iy² ¤|x19M"ÏÎôffÄœqUdÉ €I5ƒäÉ»Š	Sa«Ël©JóÜLÒ7Iáˆ¤Uû¼ ñ®÷iÀÊ÷ã¤‚H çy¢í§8é´wnØ\%˜`WàÉ7OÂß’°ïj×iBh¬;—Y;÷¢Æ	\`rX£fË£âÌ·%D¦ÊM0xÀ<7è¼ĞÊ¤:†5@ù.€Bm';	5gåæÑ¿áñµEòyÅåš§ñ0êO¤|,•ıÙË¦.ÚğĞä&L`jã­­,>}éS0Šm¿9õ¼‚®Íl7ÎmÁÃ’kNÙïÊ÷†ïõª•}¨Æ¢f†VŞ(ÇŒràÀn#0n.’Xh†ÿrû UÖÁÒ€×³ÁÁÂ2Áø+\~ÁfS9ãÖ±.[¢béŞ¶Êgè°Âwi€'ª¯|¶ì] Ùğ½²Rdû0Ê¤üämÜ•Vªôll[e"ë:uø´½Uü6´3Àv?~E+¡üİ”}ñ5GĞFÁì÷Ïæ‚˜YàŸKÌ˜Œ4Îê/¼úæ“éƒÎÀ~›]óL»>8›* ıæÅØÄ·MØÛ£ÂA `K¾¼ ğ>ƒøÍg"#¯¸”,œŒ‹íÛ
[d8¾/6ô:NæË›{À¹[ğ‚ôîY×@u—ù]Ğá÷î2Xh*¹>åé7İÿ$ß}(–ÁOì ‘Òd“.&<šó}{Ü¿Wo=6ˆf¨¾4ñ´LqùüíRS '×ßbÄy:•Ü'»Š›É±ËÍ•H(’–¥‰wHç5mçG^|ˆU¹·7¹òïü$‰íø„©el»²ÖZ˜7€
=jÃõ°ìÕÚìV2@Oí½.Éwí­oÿÜ.¾µúÀb#÷kpö/´‹OÛQ9KgÚh˜êY0FKñÉÍÒòƒ¡~†A*ä=,È, }¦¥AˆÛ8rÒÔ2 v´œ'’{AD¿{¬äÛËº9²m_tY^N÷
€O×İ¿Ë—"Ñ5Øˆ¼NŞT9@®$Ä#èwcE*†mĞñ\UÈføn9<#ÛÉC º—›ÖC†¹B`¯÷éƒ?’ûø	›‰/D«ÿ¢wg0áL™ãÍş¿÷iº„Şsù¦Ê>&a"[mÅ9îÑ*hî{YŸuy\f˜#6®€"$
ıµFBÊ”³Ş:CÙdXˆ0õßËÅ
Ì¬#^Îÿ´z”å'
ÔhwØÌúñU1 ¯^Yğ`3m¤Ü«˜¹ÖZÈ»d„¾õåÍÁ%ØvËmŞëq ĞC¤h¨¦‡Y;—~4'7’}ü¶òö¡ëÎ•<Ë¤£kDÒ°”ØÖÎçõ; ïA3pg¦S1^›pqõ£ó^7Ïcç¡q‘ØŞì>yÍ¦&;Ù¡„Lìr³ÆÜr\rk'iv½ÉÀS‡r)Ábd“R_dl{ç²+évw5~ìÇ€¡'¾ÕÔ
 šâÈHvy¿[øoÎG# ’Œ?hç’Ê®Uğl¨ì¦Z9ÂVû®é%ÓP$v‹8ƒÙ]ókf…œ÷ó_#œ^ò¤5H‰7Ÿ¿ ¹²Ëé]¨êE‘ğrp*Ö
#òwÖuŒœ½»Äx×P¡Mcë1£H"¾½ûÃàFÿ›N\pY
ë×l‰_ØŸÕÏŞ†Lj-Êı‘ª!íÄ@üßmFË
=&’T±›M[,/cT¿èŠí]0Ğ4e-oZXªŠ÷¯Ait€C‡0ÔhÍâ6µP4•ºœU>p²£2Åú•Gûöú°†bûÕ´+¨¨Õ¬¹$=	®Æ‰§Ê}…€¯êæ1¾Šƒ@(b3gëÒ¥ş†Õã0â^$
Wy¶ îŸ‰ŒGˆ"oõ³×…)¹QÁà¨ê3}˜æ]ÔUÎóÏ7?…~õ“ì‡ÙÌyb¾6—n»Æcíœ¨]»HT7·Q¤ÁêˆZWÔíÈ-¡ËóÉÙºâÂaÆMÂ=xãôä€DÑå(q§z:F·¸t„v VµkÖiêCÚï+ˆòÊ©êF‚æÅÌø<E:²MÕ9ğo%lb<~?uÇÏ‡×|¦èèáÚÂ¥ıÇˆ+…~Ó~¿ö‡Qöü&Yüâ† OH›ëª‹Ç-Ä'+³Sn¿ØŠ¼móômƒ©aÉîkıô§c\¦q SØ•÷¡©—tÄ—€eKø¸æoüßx{iIçÿM©¦ıH¾<‘WgõûUD·€ØÕŸbı±ˆcŒJízó$ø_ş”Şfõ?ÙÇÃJÒò«¿Ôf˜uIz¢/9¥,­8ßØĞ\öÿğ‚øü“U”£ÈÓjO‹ ĞVÜ±²# éJ/é•ÌêçkáÔ seĞˆ©ì\vúÿ›XÉÀ]”Ú§ fM^w9œÍ¸ŸA-Æ)ùi‹ùÇ:i–fâÍKuD$t¥:V¶9ŠÍ²NÓËƒ›ópgICV’UÔ-ôMÕìç~Š¢RF7R—Á¶Ø<`"ïÿÊÏõ‡ì„[“à¾½Œ
`Û5,tKë=si+Ré=iâ, ¤®L…ñ~0ò,ó²ŒÏ’”ÚÙÃëñ„û¢&NÃ¢O[èí¼©ºíÛ˜%‡­Ó‹rf_o1ñ[~éÌ/)%Ğİ˜£ËÅAÂÌ‡Ğk›ø«0¥Š¥¤=áêÓ}ÿnÓs²9Äci»»A–ÿ9­B.&­•©öY©PLF‡ÓUøÖ@3îĞ#[N}h@ì<>ëGÊ*ÿ†õF\”"‚e5@Ûm­èô+nW2àú]¹gBs¡q{móZrÊüX<6Ëµ?oûö´GÜ2a€Ë’DH’[dI~ly^Jkšà|³ŸqÙ´ucƒNTW´Š‘µÎ7½&%ˆº‡ºkè.pKĞ¯<È@¬@>e¾öâš8ä32wÁßfR›cŞ˜7{©ï]ç$;ã%°Âã•`l†^¦{;É×¯¼¹«Ç6uAdÙ/ ù@AµÉòbn_:tâØ‰ És6€}izšš\êœÊc.ì¯´ÄEÆà•ägÑh)€I,ûı”Ãöò¬åÌ\bTo‹K;&¿ eì¹«;ºÔÉcxèÖ…ëK)Üß=aÓ"c‘œYÎóÙõ1©cÚÕâÅõ‰O®ÂZòLz389'İâ6Ñ‹Å¡tWá#–•lJã³Dû3ª ´“à/ûP§ƒ)EÇÄÊá‚® ôş]„£…>^=MÃøÚÓ!†ãæŠÀN¦qÛÈ>z¡
'†iæ¬İ\jù)!8Où¤ì@ùKÖÿ×¯j­×+mª{Väm†m¢ğ`´dÈ¬¯È“ÇJe¼ÈD9
Éû¦Ğ˜¾
ı LOÌçÍ¥$ïY›Mşü0·©:>'îİƒ3İùÂ.9_›à
$ò”Q·«®W<+3^\©äFÌZª{ #xß„Ã5£m\Ş5`b$,L|—/J%JÅÁ¶'1 à™9uşS‹®V6•0…¤47Gf-eú¡ÒÑì€	ŒüîS*
†Ñâ‰0°äYŒ§Äz7s[#Q\uÆY<6	½Á‚´Je(ßfş#–ˆfšL&%šd¬œ
­ò]ÃŒÄÒ`êêB3é˜ò[½¾;öo*ËWˆ'èîùM%B¸EéúkÃãˆE>¡2ÚIÈÂ-DÏUs_}óÏéÖ¶6M4Ÿö÷…­î¹},OÀ>«Ét®Ò#Ö/Ô÷	Ğ	-ºl§KÚ>9 Ã£.¾*<|—:P·Ğ§ı‰VmÌ7EãŸO.
`ıeL”'B>²R•ÔTAûHoÍ_Óv­X2xÊ×13† v|\kÃ|.ÎÁ®ÖwôĞö$l—yõòLÖ@íœŠFyN^¯ûå;5ß£m	ªã£_ôQÛ&Ìn$”Á^òóSø¨üBqlö§OEÑ<ƒéw¬ôZ08-ÑvÍ~¹_ä2/O¡„÷Ñ>ÏÚ¾|Q)7j!ñòQ«˜«í˜$÷b…ùÊeâ"„/r¡â&•öFŠ¼(6ªìUãoò!°'U‡1Å‰´vGp‰¶Cı¡Tm+5ÄİpóÚàjï‡zJ­²äU[d‡;1™ó³€8ëÉ©bC@<Nä[à2¡`ô‘}´7êµU±@‹×«á¬«>!(xÀ¯Bµ|[i%yQ/àä:®€t</³yî"¦¦×flüÎ{J:Û¦aUïª–‘áwİlö}5W9Ïğ@ñ|°ÇÌ¤á½Ä±¡˜2‰²½0šÓ]ÿMâùÕEí‚T·[lçÓı7÷˜ÂK±­ä’¢GÅ¡F©9¨Ì :¼g˜öƒëG<NŞ³g¥4"MªÀéY¶Ü”×´úÎ"èÂú6Ã	âó'¨vc†TP{¹1‡¯ö nËï Å”Ã´6`ª+f†L^ñ½“şq²IÉÉ²º7ØÓ€ë£>R¥q2èrO@Ö™x«“/ßâN$ÓŸ×*OœĞåRsg\ÇĞ¯åÏÓ¡~uùÁI1Îk®¼ ³†¹;zF²îõöHWÅĞn÷x¥£ßÕ]c9éõş¡Æ¹¬r¿ñÄÉÜ:s*–õtãÂàzÁÀ€”=8¤ô–ÀTÇ¤ğ}$­ÌLèÇİæÉxBG¤âÎyïl)	êİI>\ê{
"‘0TÔ p·ã8ÜvIÕmmúeÏƒkG-ğDQüÆxÆá¢ÃDh¼.3)‰ÖCÙ_ñTîûı: ı4ªÏ`¶Ò-š(ˆZMãI2­z¦Ä<]›x_\:N ƒ¡Û¤yK&¼‰×ñú¤ˆóÒKĞl€E^!¬4×Èã_øOMf2> >ù’ˆŒ/äŒÔÔ»YÖ‚L#ú¢²ó¹Nˆ;¡Fr£±Ş¨*TB“ÿ¸÷Ü‰5tİ‚¬å^[H°Ÿã%6‰ÆGz¾"ÇÖ‹gxy BNyè +ûoTŒå`!§ô„É&Ë¬626ÍÖÅ×Qèô²SíZÅ!Ê —¡¿Ğ£+géVÚ­t a œ3$F]á„äìÊ(Ü2
„Ùô|OFÌß4ø)
*oıÙªG>·Smj É°S¹ç´àÇşĞ¡Y}gC—¥cÚ|~PÖ!ÌÔ1PCûk’‚` Z·loÈÏXax:5ø&4JÔÇ°QMŒm±¡·*è­"ˆ ¸Õ¹‹pGk¹ÎF»q_ˆña}ìj[ÿ~«ó’%ŠËB,üıso…•˜^ è˜¶ñÍ¡Úª…»üC6ğ¦²(Q!¡8ÊZÛDğÚvè¦ôCëÎÅ*µŠêşF§Hè^´ó½¥:†³Ú8ëÀuˆÌOŠ+r4A×6ii«™ÆA8lİ*            }
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
		 * wjeîe4e2 a nuh| data sourcd!is encoun|E2ed (this kan!be buÃausg0`datap
		 * é{ set to null, oR cecauSe thE data source itseld )s null).	 *  Btyp% s|riog
	!*  @de&awlt îull
		 *
		 *  @nam} DataTcble,tefaultc>colUml.defaulpCgntent
		 *  Dddopt Cohumns
		 .
		 (  @example
		 *  $ ?/ Usálg"`cnlumnDefs`
		("   `$(dOcwment).ready( function() {	I(*  ,   $('#example').dataTabìe* {
	 * `    ) "ãoltínDEfs#> [
		 *"`        {
		 *   `        "lata": null,
		 *      $    $"defaULtConten|":°"Edit",Š		 * !     $    "targets": K -5 ]
		 * $0  $    }
		 * !"     İ
		 *(     }!);
		 *    y +;
	I "
		 *  @eyample
		 *    / Using0`colum~s`
		 *    $(document+jreadq("fulctionh) {
H	 *      $('#exam8le')®VataPable( {
		 
        "conUmns": [
		 *    0 "   lull,
	 *       €  fwln,
		 *        $ .ulL,		 *$         {
		 *   0        "dAta": NulL,"	 *d      0   !"defcu,tCoîtånd"8 .Edit"
	 *     0 0  }*	) *        ]
		(*      } );
		 *    } );
	 */
	"sDen ultContent": null,
	
			-*

		 * This páPAmeter iS kndy esed in DataTablms' sårver-side processinc> It sanJ		 *"be uzceptionally useful to know`÷èat columns are bding(displayeb on the
		 * kli%nt sife, and to`}ap(these to database f)elds. When dtféned, the ~amAs
		 * alro `dlow DataTableq t remrdur informát)on f2om the cerv%{ iv iv comesJ	 *`back hn an$}ne|peKded or`ur (i.e.$iv you switsh your col}mîs aroU~d`on the	 * client-side, your smrVdr-smde c/de does n/t also n-ed updating).
		 *  @typg strinç
		 * $@defaUld <i>Empôy string=/i:
		 *
		 *  @name DetqTáble.eEfaults.column.name*		 "  Hdtop4 Kolumns
		 *
		 (   ex`mp,e
		 *    // Usifg `columnDdfs`		 *    $(documånt).ready($functigf() {
	 *      $(7#example').daTaVable( {
		$*        "cOhqenDeFs": [
	 *  !       { "name": "enga.e", "targgts": { 0 ] },
	 * (       0{0"naíg2: "browser*l "targetsb: [05 ] ],
		 *          { "name¢: "rlatfozm", "ta2gets": [`3 ] }-
		 *      0   û`".ame": 2versin#l  targets"> [ 2 ] },
		 *    !   " û "nime£: "grade", "targets": [`4 ] }
		 *        ]
		 *      }$);
	 *    } );
	 *
		 * `@exakple
		`
   !//"Using `columns`
‰	 *    $(dkcument).reafy( vunãtion,) {
	 *      $('#eyample').daô`Pable( {@		 *        "columns": [
‰	(*  !    !  { "name":$"engine" },
		 *          { "name": "browser" },
		 *          { "n!me": &platjorm" },
		 *``        { "namE": "verSioj" u,
	) *   0      { "name": "grade" }
		`*        ]
		 *      }");
		 *    } );
	É 
/
		"sNamå": b",
	
		/**		 * D%fines a data sowrCE type fmr the ordeRang which0#an be tsedbto read	 
 beal-tkme hnvormetinn from the tAfle (updating theainternally cacheä
		 * wepsi/n	 prior tk ordepiof. Th)s q(low{ orDering to occer ol useR
		 * editable element{ sucj as f/2m inpuus,*	 *```type s4ringJ		$*  @Defauìt wte
	‰"*
		 *  @ni}g FátaTable.eefaults.column.ow$erDataType
	  *b @dtopt$Columns		 *		 *  @aøamplm
		(*   !/ UsIng(bcoluénDefs`
		 *    $(loc}oent).òeady* vunstion() {
		 *      $('#exaeple')*dataTable8 û
		 *        coluMnFefr": [
		0*          { "orderDatiType#: "dom-tazt", "targe|s": [ 2, ; ] },
	‰ *     €    { "t9på": ²numeric", "vargets": [ 3 ] },
	I *         { 2o0derÄataType": "dom)selecp, "targeTs":a[ 4 ]0ı,
		$*          { "orderDataType"x "dod-cJeCkBox"¬ "targets": [ 5 ]0|
		 *      ° ]
		 * (    } );
		 *(   } );	 *		 * $@exampne
		$
 0  //dUsino `cnluons`
		 *  & $(do#ument).reaDy( Fuoition(i {		 *`!    $('#example')®dataTabhe( {
		 *        &columns"r`[		 *       `  nUl~,
		(:         $î}lL,
		(*    "     { "mreesDataT1pe": "dom%text  },
	 *          { "ordeVDataType":  dom-text2, "type": "numeric" },
	 *       (  { "orturtãtaType2: "dom-smlect" },
		 *          { "orderDadaType"2 "dom-cjeckâox" }
		0j      ((]
		 *      } );
		 ª` ( } ).
 *+Š		"s[ortDatAtyğe": "std",
	
	
		/*h:	`*!Ähe title of thkr co,umn/
		`*  Htypu strinc*		 * h default null i>Ferived from tlq 'ÔH' telue For this!colu}n in the
		 *    oRigi.an JTmL$Tqble.</i>
M *		 +  @name DataTable.de.aulus.coluìn.tétle
	‰ *  @dtopt Bolumns
	 .
		 *  @exampleJ		 *  $ // Usi' `cïLumnDevsa
		 *    $(doCement).ready,0fulction*- {
		 * "   `$('cexamplE').dataTabne( {
	 *        "columnDefó": [		 *  ( $  ( "{ "title" "My column title"< "targ%t3": [ 0 ]}	$*!       ]
		 *      ] )9	 *  ( }0);
		$*
		 *! @eyample
	) *    /- Using(@#o|uln3`
 j(  $$(d/c}ment).ready  nUnction() {
		 *      $('£examplE').dauaDaBle( {
		 *        "columns"2 [Š		 j          { "tiôle¢: "My cOlu-Î(tiTle" }<
		!*          nqll,
	 *         !null,
		 *          nuhl,		 *`         null
		 *        ]
		 *     }!(;
	 *     );
	 ./
		"sTit|e&>0null,
	
	
	-**Š		 * The 4Ype allows you`tk spechfy how 4hu data(For this cïlumn wiml$be
		 * orddreu. Four types (stòin', ne-eòic,(date and html (w(éch wanN StrKp
	 * HTML tagó before ordering)) aRe curvenply avainable. Notå that only0dete
		 * foòmats unddrwtoo` bq(Javascpipt'1 Dpteh) objecd wiìl be acaepted as type
		 * date. For exampleª bMaR 2>.02000`5:03 PM#. May tàkg the v!lues: 'strang'(		$* 'numebic', 'detm' oR 'html' (b} defa5lt). Nepther Types can be adding
	‰ * thrugh pdug-hns
)	 *` @|ypg strine
	 *! @defau|v nell <i?Auto-de4ected from raw daTa</i>
)	 *
		 "!@nAme D taTable.defaultc,ãoLumn.uyPe
		 .0 B`to`t Aolumnó
		 ª
		 :  @example
	‰ *    // UsIng `col7mlDeds`
		 *    $(documelt).ready(0function() {‰ *      $('£example'¨.dqtcTeb,e( ;
		(*        "coluiNDefó": [
		 *"         { "tyte": #huml", "targets": [ 0"]"Y
		 *        ]
	I *   !  ı");
		 *    }!);
		 *
		 *  @example
		 *    /. Esing `golumns`
	 *0   $(docume~ti.rdavy(°fu.ction() {
		0*      $('cexample').dataTablE( {		 *   $ 0 0"columns":`Û
		 *     ( p  { &type": #html" }$
)	 *       0  nuhl,
		 *          null-
		 ª 0        îqdl,*É	 *          nunl
	"*        U		 * 0 (  } );
I	 *    }`+;	)$*/
	"{TYpe2> null,	
	
		/**
‰	 * Definino thg wmeth oæathe column, tihs para-eter May tcke any CCS vilue
		 * *3em, 21xx¤etc). DataTa"lec cpplies 'slapt' widths to columns wh)ch have not
	I * feen givån a specéæiK sidth`through thi3 ifterfacm0%nsuring thpt the table		 *remaiês readcb,e.		 *` @type stvi~g
		 (  @denaunt nudl <i~Au|o}aôic,/i>		 *
I	 *  @jame TataTacle.d%fawlts.coìumn.widuh	 (  @dtopt Ãÿlum~q
	i *
		 *  Àexamrle
		 ª    /? Usifg `columfDefs`
		 *    $jäocument.ready( fungtion() {
		 *  0   ('#examtlE')&dataTabhe( y
	 *  $  €  "columnDefw¢:`YJ	9 *          s "widuh: "20%", "ta2guts8 [ 0 ] ı*	 *        ]		 *  (   } );		 (     );
		 *
		 *  @example
		 *  ! =/ Usinf dbolõmns`
		(.  ! $)document).readyè functhon()"{
		 * "    %¨'#example&).dataTable( {
		 * `  ¡(  "ãoltmns": [
	ˆ *          { "wé$th": "20% },
		 *         "nqll,
		 :   "      n}ll(
		 *        ! nuLj		 *          ~õll
	!*       0\
		 *     | );Š	‰ *    } );
		!*/		"{Sidth": null
I}3
K
	_fîHungariAnMap( DAtaTAfle.defa}lts.ck~emn !;
	
		J	/**	 * DAtaUa"Les setfingw oâjecT$- This èolls a|l$the info2-ation leeded vor a
) * ekwen tAble, inc|udmnG c~fieuration,!data ald ãurrejt app.hcation of tèe
 * table"options. DataTables does fop have a$siogle(mns4ange0ffr each(DataTaBle
	 * widl€thm settifes attabheD to thap instancå, but ratheb )nstances of the
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

