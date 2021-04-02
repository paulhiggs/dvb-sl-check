// pauls useful tools
const phlib=require('./phlib/phlib.js')

/* TODO:

 - also look for TODO in the code itself
*/
	  
const ANY_NAMESPACE="$%$!!"

const ErrorList=require("./dvb-common/ErrorList.js")
const dvbi=require("./dvb-common/DVB-I_definitions.js")
const tva=require("./dvb-common/TVA_definitions.js")
const {isJPEGmime, isPNGmime}=require("./dvb-common/MIME_checks.js")
const {isTAGURI}=require("./dvb-common/URI_checks.js")
const {loadCS}=require("./dvb-common/CS_handler.js")

const patterns=require("./dvb-common/pattern_checks.js")

const ISOcountries=require("./dvb-common/ISOcountries.js")
const IANAlanguages=require("./dvb-common/IANAlanguages.js")

// libxmljs2 - github.com/marudor/libxmljs2
const libxml=require("libxmljs2")

const fs=require("fs"), path=require("path")

const DVB_COMMON_DIR="dvb-common", 
      COMMON_REPO_RAW="https://raw.githubusercontent.com/paulhiggs/dvb-common/master/",
      DVB_METADATA="https://dvb.org/metadata/"

const TVA_ContentCS="ContentCS.xml",
	  TVA_ContentCSFilename=path.join(DVB_COMMON_DIR, "tva", TVA_ContentCS),
	  TVA_ContentCSURL=`${COMMON_REPO_RAW}tva/${TVA_ContentCS}`,
	  
	  TVA_FormatCS="FormatCS.xml",
	  TVA_FormatCSFilename=path.join(DVB_COMMON_DIR, "tva", TVA_FormatCS),
	  TVA_FormatCSURL=`${COMMON_REPO_RAW}tva/${TVA_FormatCS}`,

	  TVA_PictureCS="PictureFormatCS.xml",
	  TVA_PictureFormatCSFilename=path.join(DVB_COMMON_DIR, "tva", TVA_PictureCS),
	  TVA_PictureFormatCSURL=`${COMMON_REPO_RAW}tva/${TVA_PictureCS}`,

	  DVB_ContentSubjectCS="DVBContentSubjectCS-2019.xml",
	  DVBI_ContentSubjectFilename=path.join(DVB_COMMON_DIR, "dvbi", DVB_ContentSubjectCS),
	  DVBI_ContentSubjectURL=`${COMMON_REPO_RAW}dvbi/${DVB_ContentSubjectCS}`,
	  
	  DVB_ServiceTypeCS="DVBServiceTypeCS-2019.xml",
	  DVBI_ServiceTypeCSFilename=path.join(DVB_COMMON_DIR, "dvbi", DVB_ServiceTypeCS),
	  DVBI_ServiceTypeCSURL=`${COMMON_REPO_RAW}dvbi/${DVB_ServiceTypeCS}`,

	  DVB_AudioCodecCS2007="2007/AudioCodecCS.xml",
	  DVB_AudioCodecCSFilename=path.join(DVB_COMMON_DIR, "dvb/cs/", DVB_AudioCodecCS),
	  DVB_AudioCodecCSURL=`${DVB_METADATA}cs/${DVB_AudioCodecCS}`,

	  DVB_AudioCodecCS2020="2020/AudioCodecCS.xml",
	  DVB_AudioCodecCS2020Filename=path.join(DVB_COMMON_DIR, "dvb/cs/", DVB_AudioCodecCS2020),
	  DVB_AudioCodecCS2020URL=`${DVB_METADATA}cs/${DVB_AudioCodecCS2020}`,

	  DVB_VideoCodecCS2007="2007/VideoCodecCS.xml",
	  DVB_VideoCodecCSFilename=path.join(DVB_COMMON_DIR, "dvb/cs/", DVB_VideoCodecCS2007),
	  DVB_VideoCodecCSURL=`${DVB_METADATA}cs/${DVB_VideoCodecCS2007}`,

	  DVB_VideoCodecCS2020="2020/VideoCodecCS.xml",
	  DVB_VideoCodecCS2020Filename=path.join(DVB_COMMON_DIR, "dvb/cs", DVB_VideoCodecCS2020),
	  DVB_VideoCodecCS2020URL=`${DVB_METADATA}cs/${DVB_VideoCodecCS2020}`,

	  MPEG_AudioCodingFormatCS="AudioCodingFormatCS.xml",
	  MPEG7_AudioCodingFormatCSFilename=path.join(DVB_COMMON_DIR, "mpeg7", MPEG_AudioCodingFormatCS),
	  MPEG7_AudioCodingFormatCSURL=`${COMMON_REPO_RAW}mpeg7/${MPEG_AudioCodingFormatCS}`,

	  MPEG7_VisualCodingFormatCS="VisualCodingFormatCS.xml",
	  MPEG7_VisualCodingFormatCSFilename=path.join(DVB_COMMON_DIR, "mpeg7", MPEG7_VisualCodingFormatCS),
	  MPEG7_VisualCodingFormatCSURL=`${COMMON_REPO_RAW}mpeg7/${MPEG7_VisualCodingFormatCS}`,

	  MPEG7_AudioPresentationCS="AudioPresentationCS.xml",
	  MPEG7_AudioPresentationCSFilename=path.join(DVB_COMMON_DIR, "mpeg7", MPEG7_AudioPresentationCS),
	  MPEG7_AudioPresentationCSURL=`${COMMON_REPO_RAW}mpeg7/${MPEG7_AudioPresentationCS}`,

	  DVB_AudioConformanceCS="AudioConformancePointsCS.xml",
	  DVB_AudioConformanceCSFilename=path.join(DVB_COMMON_DIR, "dvb/cs/2017", DVB_AudioConformanceCS),
	  DVB_AudioConformanceCSURL=`${DVB_METADATA}cs/2017/${DVB_AudioConformanceCS}`,

	  DVB_VideoConformanceCS="VideoConformancePointsCS.xml",
	  DVB_VideoConformanceCSFilename=path.join(DVB_COMMON_DIR, "dvb/cs/2017", DVB_VideoConformanceCS),
	  DVB_VideoConformanceCSURL=`${DVB_METADATA}cs/2017/${DVB_VideoConformanceCS}`,

	  ISO3166="iso3166-countries.json",
	  ISO3166_Filename=path.join(DVB_COMMON_DIR, ISO3166),
	  ISO3166_URL=`${COMMON_REPO_RAW}${ISO3166}`,

	  DVBI_RecordingInfoCS="dvbi","DVBRecordingInfoCS-2019.xml"
	  DVBI_RecordingInfoCSFilename=path.join(DVB_COMMON_DIR, DVBI_RecordingInfoCS),
	  DVBI_RecordingInfoCSURL=`${COMMON_REPO_RAW}dvbi/${DVBI_RecordingInfoCS}`

const SERVICE_LIST_RM="service list",
      SERVICE_RM="service",
	  SERVICE_INSTANCE_RM="service instance",
      CONTENT_GUIDE_RM="content guide"

var allowedGenres=[], allowedServiceTypes=[], allowedAudioSchemes=[], allowedVideoSchemes=[], 
	allowedAudioConformancePoints=[], allowedVideoConformancePoints=[], RecordingInfoCSvalules=[],
	allowedPictureFormats=[], AudioPresentationCS=[]

var knownCountries=new ISOcountries(false, true)
var knownLanguages=new IANAlanguages()

const IANA_Subtag_Registry_Filename=path.join(DVB_COMMON_DIR, knownLanguages.LanguagesFileName),
      IANA_Subtag_Registry_URL=knownLanguages.LanguagesURL

const DVBI_ServiceListSchemaFilename_v1=path.join(".", "dvbi_v1.0.xsd");
var SLschema_v1;
const DVBI_ServiceListSchemaFilename_v2=path.join(".", "dvbi_v2.0.xsd");
var SLschema_v2;
const DVBI_ServiceListSchemaFilename_v3=path.join(".", "dvbi_v3.0.xsd");
var SLschema_v3;

const SCHEMA_v1=1,
      SCHEMA_v2=2,
	  SCHEMA_v3=3,
	  SCHEMA_unknown= -1;
 
/**
 * determine the schema version (and hence the specificaion version) in use 
 *
 * @param {String} namespace  The namespace used in defining the schema
 * @returns {integer} Representation of the schema version or error code if unknown 
 */
function SchemaVersion(namespace) {
	if (namespace == dvbi.A177v1_Namespace)
		return SCHEMA_v1;
	else if (namespace == dvbi.A177v2_Namespace)
		return SCHEMA_v2;
	else if (namespace == dvbi.A177v3_Namespace)
		return SCHEMA_v3;
	
	return SCHEMA_unknown;
}


// based on the polyfill at https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach 
/*
 * alternate to Array.prototype.forEach that only returns XML tree nodes that are elements
*/
if (!Array.prototype['forEachSubElement']) {

	Array.prototype.forEachSubElement = function(callback, thisArg) {
  
	  if (this == null) { throw new TypeError('Array.prototype.forEachSubElement called on null or undefined'); }
  
	  var T, k;
	  // 1. Let O be the result of calling toObject() passing the
	  // |this| value as the argument.
	  var O = Object(this);
  
	  // 2. Let lenValue be the result of calling the Get() internal
	  // method of O with the argument "length".
	  // 3. Let len be toUint32(lenValue).
	  var len = O.length >>> 0;
  
	  // 4. If isCallable(callback) is false, throw a TypeError exception.
	  // See: https://es5.github.com/#x9.11
	  if (typeof callback !== "function") { throw new TypeError(`${callback} is not a function`); }
  
	  // 5. If thisArg was supplied, let T be thisArg; else let
	  // T be undefined.
	  if (arguments.length > 1) { T = thisArg; }
  
	  // 6. Let k be 0
	  k = 0;
  
	  // 7. Repeat, while k < len
	  while (k < len) {
  
		var kValue;
  
		// a. Let Pk be ToString(k).
		//    This is implicit for LHS operands of the in operator
		// b. Let kPresent be the result of calling the HasProperty
		//    internal method of O with argument Pk.
		//    This step can be combined with c
		// c. If kPresent is true, then
		if (k in O) {
  
		  // i. Let kValue be the result of calling the Get internal
		  // method of O with argument Pk.
		  kValue = O[k];
  
		  // ii. Call the Call internal method of callback with T as
		  // the this value and argument list containing kValue, k, and O.
		  if (T.type()=='element')
		  	callback.call(T, kValue, k, O);
		}
		// d. Increase k by 1.
		k++;
	  }
	  // 8. return undefined
	};
  }


/**
 * constructs an XPath based on the provided arguments
 *
 * @param {string} SCHEMA_PREFIX   Used when constructing Xpath queries
 * @param {string} elementName     The name of the element to be searched for
 * @param {int} index              The instance of the named element to be searched for (if specified)
 * @returns {string} the XPath selector
 */
function xPath(SCHEMA_PREFIX, elementName, index=null) {
	return `${SCHEMA_PREFIX}:${elementName}${index?`[${index}]`:""}`
}


/**
 * constructs an XPath based on the provided arguments
 * 
 * @param {string} SCHEMA_PREFIX Used when constructing Xpath queries
 * @param {array} elementNames the name of the element to be searched for
 * @returns {string} the XPath selector
 */
 function xPathM(SCHEMA_PREFIX, elementNames) {
	let t=""
	elementNames.forEach(elementName => {
		if (t.length) { t+="/"; first=false;}
		t+=`${SCHEMA_PREFIX}:${elementName}`	
	});
	return t
}


/**
 * determines if a value is in a set of values - simular to 
 *
 * @param {String or Array} values The set of values to check existance in
 * @param {String} value           The value to check for existance
 * @returns {boolean} true if value is in the set of values
 */
function isIn(values, value){
    if (typeof values=="string" || values instanceof String)
        return values==value;
   
    if (Array.isArray(values)) 	
		return values.includes(value)
    
    return false;
}


/**
 * check a language code and log its result
 *
 * @param {string} lang      the language to check
 * @param {string} loc       the 'location' of the element containing the language value
 * @param {Object} errs      the class where errors and warnings relating to the serivce list processing are stored 
 * @param {String} errCode   the error code to be reported
 */
function checkLanguage(lang, loc, errs, errCode) {
	switch (knownLanguages.isKnown(lang)) {
		case knownLanguages.languageUnknown:
			errs.pushCode(errCode?`${errCode}-1`:"CL001", `${loc?loc:"language"} value ${lang.quote()} is invalid`, "invalid language")
			break;
		case knownLanguages.languageRedundant:
			errs.pushCodeW(errCode?`${errCode}-2`:"CL002", `${loc?loc:"language"} value ${lang.quote()} is redundant`, "redundant language")
			break;	
	}
}




/** 
 * determines if the identifer provided complies with the requirements for a service identifier
 * at this stage only IETF RFC 4151 TAG URIs are permitted
 *
 * @param {String} identifier  The service identifier
 * @returns {boolean} true if the service identifier complies with the specification otherwise false
 */ 
function validServiceIdentifier(identifier){
    return isTAGURI(identifier);
}


/** 
 * determines if the identifer provided is unique against a list of known identifiers
 *
 * @param {String} identifier  The service identifier
 * @param {Array} identifiers  The list of known service identifiers
 * @returns {boolean} true if the service identifier is unique otherwise false
 */
function uniqueServiceIdentifier(identifier, identifiers) {
    return !isIn(identifiers, identifier);
}


/**
 * parses the region element, checks the values and adds it and its children (through recursion) to the linear list of region ids
 *
 * @param {String} SL_SCHEMA      Used when constructing Xpath queries
 * @param {String} SCHEMA_PREFIX  Used when constructing Xpath queries
 * @param {Object} Region         The <Region> element to process
 * @param {integer} depth         The current depth in the hierarchial structure of regions
 * @param {Array} knownRegionIDs  The list of region IDs that have been found
 * @param {Object} errs           The class where errors and warnings relating to the serivce list processing are stored 
 */
function addRegion(SL_SCHEMA, SCHEMA_PREFIX, Region, depth, knownRegionIDs, errs) {
	
	if (!Region) {
		errs.pushCode("AR000", "addRegion() called with Region==null")
		return
	}
	
    let regionID=Region.attr(dvbi.a_regionID)?Region.attr(dvbi.a_regionID).value():""
	if (regionID=="")
		regionID="unspecified"
	else {
		if (isIn(knownRegionIDs, regionID)) 
			errs.pushCode("AR003", `Duplicate ${dvbi.a_regionId.attribute()} ${regionID.quote()}`, "duplicate regionID")
		else knownRegionIDs.push(regionID)
	}
    let countryCodesSpecified=Region.attr(dvbi.a_countryCodes)
    if ((depth!=0) && countryCodesSpecified) 
        errs.pushCode("AR004", `${dvbi.a_countryCodes.attribute(Region.name())} not permitted for sub-region ${regionID.quote()}`, "ccode in subRegion")

    if (countryCodesSpecified) {
        let countries=countryCodesSpecified.value().split(",")
        if (countries) 
			countries.forEach(country => {
				if (!knownCountries.isISO3166code(country)) 
					errs.pushCode("AR005", `invalid country code (${country}) for region ${regionID.quote()}`, "invalid country code")
			})
    }

	checkXMLLangs(SL_SCHEMA, SCHEMA_PREFIX, dvbi.e_RegionName, `${dvbi.a_regionID.attribute(dvbi.e_Region)}=${regionID.quote()}`, Region, errs, "AR006")
	
	// <Region><Postcode>
	let pc=0, Postcode, PostcodeErrorMessage="invalid postcode"
	while (Postcode=Region.get(xPath(SCHEMA_PREFIX, dvbi.e_Postcode, ++pc), SL_SCHEMA)) {
		if (!patterns.isPostcode(Postcode.text()))
			errs.pushCode("AR011", `${Postcode.text().quote()} is not a valid postcode`, PostcodeErrorMessage)
	}

    if (depth > dvbi.MAX_SUBREGION_LEVELS) 
        errs.pushCode("AR007", `${dvbi.e_Region.elementize()} depth exceeded (>${dvbi.MAX_SUBREGION_LEVELS}) for sub-region ${regionID.quote()}`, "region depth exceeded")

	let rc=0, RegionChild;
	while (RegionChild=Region.get(xPath(SCHEMA_PREFIX, dvbi.e_Region, ++rc), SL_SCHEMA))
		addRegion(SL_SCHEMA, SCHEMA_PREFIX, RegionChild, depth+1, knownRegionIDs, errs)
}


/** 
 * determines if the identifer provided refers to a valid application being used with the service
 *
 * @param {String} hrefType  The type of the service application
 * @returns {boolean} true if this is a valid application being used with the service else false
 */
function validServiceControlApplication(hrefType) {
	return hrefType==dvbi.APP_IN_PARALLEL || hrefType==dvbi.APP_IN_CONTROL
}

/** 
 * determines if the identifer provided refers to a valid application to be launched when a service is unavailable
 *
 * @param {String} hrefType  The type of the service application
 * @returns {boolean} true if this is a valid application to be launched when a service is unavailable else false
 */
function validServiceUnavailableApplication(hrefType) {
	return hrefType==dvbi.APP_OUTSIDE_AVAILABILITY
}

/** 
 * determines if the identifer provided refers to a valid application launching method
 *
 * @param {String} HowRelated  The service identifier
 * @returns {boolean} true if this is a valid application launching method else false
 */
function validServiceApplication(HowRelated) {
    // return true if the HowRelated element has a 	valid CS value for Service Related Applications (A177 5.2.3)
	// urn:dvb:metadata:cs:LinkedApplicationCS:2019
	if (!HowRelated) return false
    let val=HowRelated.attr(dvbi.a_href)?HowRelated.attr(dvbi.a_href).value():null
	if (!val) return false
    return validServiceControlApplication(val) || validServiceUnavailableApplication(val)
}


/** 
 * determines if the identifer provided refers to a valid DASH media type (single MPD or MPD playlist)
 *
 * @param {String} contentType  The contentType for the file
 * @returns {boolean} true if this is a valid MPD or playlist identifier
 */
function validDASHcontentType(contentType) {
    // per A177 clause 5.2.7.2
    return contentType==dvbi.CONTENT_TYPE_DASH_MPD   
        || contentType==dvbi.CONTENT_TYPE_DVB_PLAYLIST;
}


/**
 * looks for the {index, value} pair within the array of permitted values
 *
 * @param {array} permittedValues  array of allowed value pairs {ver: , val:}
 * @param {any}   version          value to match with ver: in the allowed values or ANY_NAMESPACE
 * @param {any}   value            value to match with val: in the allowed values
 * @returns {boolean} true if {index, value} pair exists in the list of allowed values when namespace is specific or if any val: equals value with namespace is ANY_NAMESPACE, else false
 */
function match(permittedValues, version, value) {
	if (!value || !permittedValues) return false
	if (version==ANY_NAMESPACE) {
		let i=permittedValues.find(elem => elem.value==value)
		return i!=undefined
	}
	else {
		let i=permittedValues.find(elem => elem.ver==version)
		return i && i.val==value
	}
} 
 

/** 
 * determines if the identifer provided refers to a valid banner for out-of-servce-hours presentation
 *
 * @param {String} HowRelated  The banner identifier
 * @param {String} namespace   The namespace being used in the XML document
 * @returns {boolean} true if this is a valid banner for out-of-servce-hours presentation else false
 */
function validOutScheduleHours(HowRelated, namespace) {
    // return true if val is a valid CS value for Out of Service Banners (A177 5.2.5.3)
	return match([ 
		{ver: SCHEMA_v1, val: dvbi.BANNER_OUTSIDE_AVAILABILITY_v1 },
		{ver: SCHEMA_v2, val: dvbi.BANNER_OUTSIDE_AVAILABILITY_v2 },
		{ver: SCHEMA_v3, val: dvbi.BANNER_OUTSIDE_AVAILABILITY_v2 }
		], SchemaVersion(namespace), HowRelated.attr(dvbi.a_href)?HowRelated.attr(dvbi.a_href).value():null) 
}


/** 
 * determines if the identifer provided refers to a valid banner for content-finished presentation
 *
 * @since DVB A177v2
 * @param {String} HowRelated  The banner identifier
 * @param {String} namespace   The namespace being used in the XML document
 * @returns {boolean} true if this is a valid banner for content-finished presentation else false
 */
function validContentFinishedBanner(HowRelated, namespace) {
    // return true if val is a valid CS value for Content Finished Banner (A177 5.2.7.3)
	return match([ 
		{ver: SCHEMA_v2, val: dvbi.BANNER_CONTENT_FINISHED_v2 },
		{ver: SCHEMA_v3, val: dvbi.BANNER_CONTENT_FINISHED_v2 }
		], namespace==ANY_NAMESPACE?namespace:SchemaVersion(namespace), HowRelated.attr(dvbi.a_href)?HowRelated.attr(dvbi.a_href).value():null)
}


/** 
 * determines if the identifer provided refers to a valid service list logo
 *
 * @param {String} HowRelated  The logo identifier
 * @param {String} namespace   The namespace being used in the XML document
 * @returns {boolean} true if this is a valid logo for a service list else false
 */
function validServiceListLogo(HowRelated, namespace) {
    // return true if HowRelated@href is a valid CS value Service List Logo (A177 5.2.6.1)
	return match([ 
		{ver: SCHEMA_v1, val: dvbi.LOGO_SERVICE_LIST_v1 },
		{ver: SCHEMA_v2, val: dvbi.LOGO_SERVICE_LIST_v2 },
		{ver: SCHEMA_v3, val: dvbi.LOGO_SERVICE_LIST_v2 }
		], SchemaVersion(namespace), HowRelated.attr(dvbi.a_href)?HowRelated.attr(dvbi.a_href).value():null)
}


/** 
 * determines if the identifer provided refers to a valid service logo
 *
 * @param {String} HowRelated  The logo identifier
 * @param {String} namespace   The namespace being used in the XML document
 * @returns {boolean} true if this is a valid logo for a service  else false
 */
function validServiceLogo(HowRelated, namespace) {
    // return true if val is a valid CS value Service Logo (A177 5.2.6.2)
	return match([
		{ver: SCHEMA_v1, val: dvbi.LOGO_SERVICE_v1},
		{ver: SCHEMA_v2, val: dvbi.LOGO_SERVICE_v2},
		{ver: SCHEMA_v3, val: dvbi.LOGO_SERVICE_v2}
		], SchemaVersion(namespace), HowRelated.attr(dvbi.a_href)?HowRelated.attr(dvbi.a_href).value():null)
}


/** 
 * determines if the identifer provided refers to a valid content guide source logo
 *
 * @param {String} HowRelated  The logo identifier
 * @param {String} namespace   The namespace being used in the XML document
 * @returns {boolean} true if this is a valid logo for a content guide source else false
 */
function validContentGuideSourceLogo(HowRelated, namespace) {
    // return true if val is a valid CS value Service Logo (A177 5.2.6.3)
	return match([
		{ver: SCHEMA_v1, val: dvbi.LOGO_CG_PROVIDER_v1},
		{ver: SCHEMA_v2, val: dvbi.LOGO_CG_PROVIDER_v2},
		{ver: SCHEMA_v3, val: dvbi.LOGO_CG_PROVIDER_v2}
		], SchemaVersion(namespace), HowRelated.attr(dvbi.a_href)?HowRelated.attr(dvbi.a_href).value():null)
}


/**
 * verifies if the specified logo is valid according to specification
 *
 * @param {Object} HowRelated    The <HowRelated> subelement (a libxmls ojbect tree) of the <RelatedMaterial> element
 * @param {Object} Format        The <Format> subelement (a libxmls ojbect tree) of the <RelatedMaterial> element
 * @param {Object} MediaLocator  The <MediaLocator> subelement (a libxmls ojbect tree) of the <RelatedMaterial> element
 * @param {Object} errs          The class where errors and warnings relating to the serivce list processing are stored 
 * @param {string} Location      The printable name used to indicate the location of the <RelatedMaterial> element being checked. used for error reporting
*/
function checkValidLogo(HowRelated, Format, MediaLocator, errs, Location) {
    // irrespective of the HowRelated@href, all logos have specific requirements
    if (!HowRelated)
        return;

    let isJPEG=false, isPNG=false    
    // if <Format> is specified, then it must be per A177 5.2.6.1, 5.2.6.2 or 5.2.6.3 -- which are all the same
    if (Format) {
        let subElems=Format.childNodes(), 
		    hasStillPictureFormat=false
        if (subElems) subElems.forEachSubElement(child => {
            if (child.name()==dvbi.e_StillPictureFormat) {
                hasStillPictureFormat=true;
                if (!child.attr(dvbi.a_horizontalSize)) 
                    errs.pushCode("VL010", 
						`${dvbi.a_horizontalSize.attribute()} not specified for ${tva.e_RelatedMaterial.elementize()}${tva.e_Format.elementize()}${dvbi.e_StillPictureFormat.elementize()} in ${Location}`, 
						`no ${dvbi.a_horizontalSize.attribute()}`)
                if (!child.attr(dvbi.a_verticalSize)) 
                    errs.pushCode("VL011", 
						`${dvbi.a_verticalSize.attribute()} not specified for ${tva.e_RelatedMaterial.elementize()}${tva.e_Format.elementize()}${dvbi.e_StillPictureFormat.elementize()} in ${Location}`, 
						`no ${dvbi.a_verticalSize.attribute()}`)
                if (child.attr(dvbi.a_href)) {
                    let href=child.attr(dvbi.a_href).value()
					switch (href) {
						case dvbi.JPEG_IMAGE_CS_VALUE:
							isJPEG=true
							break
						case dvbi.PNG_IMAGE_CS_VALUE:
							isPNG=true
							break
						default:
							InvalidHrefValue(href, `${tva.e_RelatedMaterial.elementize()}${tva.e_Format.elementize()}${dvbi.e_StillPictureFormat.elementize()}`, Location, errs, "VL012")
					}
                } 
            }
        });
        if (!hasStillPictureFormat) 
            errs.pushCode("VL014", `${dvbi.e_StillPictureFormat.elementize()} not specified for ${tva.e_Format.elementize()} in ${Location}`, "no StillPictureFormat");
    }

    if (MediaLocator) {
        let subElems=MediaLocator.childNodes(), hasMediaURI=false
        if (subElems) subElems.forEachSubElement(child => {
            if (child.name()==tva.e_MediaUri) {
                hasMediaURI=true;
				
                if (child.attr(tva.a_contentType)) {
                    let contentType=child.attr(tva.a_contentType).value();
                    if (!isJPEGmime(contentType) && !isPNGmime(contentType))
                        errs.pushCode("VL022", 
							`invalid ${tva.a_contentType.attribute()} ${contentType.quote()} specified for ${tva.e_RelatedMaterial.elementize()}${tva.e_MediaLocator.elementize()} in ${Location}`, 
							`invalid ${tva.a_contentType.attribute(tva.e_MediaUri)}`)
                    if (Format && ((isJPEGmime(contentType) && !isJPEG) || (isPNGmime(contentType) && !isPNG))) 
                        errs.pushCode("VL023", `conflicting media types in ${tva.e_Format.elementize()} and ${tva.e_MediaUri.elementize()} for ${Location}`, "conflicting mime types")
				}
				if (!patterns.isHTTPURL(child.text())) 
					errs.pushCode("VL024", `invalid URL ${child.text().quote()} specified for ${child.name().elementize()}`, "invalid resource URL")
            }
        });
        if (!hasMediaURI) 
			NoMediaLocator("logo", Location, errs, "VL025")
    }
    else errs.pushCode("VL026", `${tva.e_MediaLocator} not specified for ${tva.e_RelatedMaterial.elementize()} in ${Location}`, `no ${tva.e_MediaLocator}`)
}


/**
 * verifies if the specified application is valid according to specification
 *
 * @param {Object} MediaLocator  The <MediaLocator> subelement (a libxmls ojbect tree) of the <RelatedMaterial> element
 * @param {Object} errs          The class where errors and warnings relating to the serivce list processing are stored 
 * @param {string} Location      The printable name used to indicate the location of the <RelatedMaterial> element being checked. used for error reporting
 */
function checkSignalledApplication(MediaLocator, errs, Location) {
	
	const validApplicationTypes=[dvbi.XML_AIT_CONTENT_TYPE, dvbi.HTML5_APP, dvbi.XHTML_APP]
	
    if (!MediaLocator) 
		NoMediaLocator("application", Location, errs, "SA001");
	else {
        let subElems=MediaLocator.childNodes(), hasMediaURI=false
        if (subElems) subElems.forEachSubElement(child => {
            if (child.name()==tva.e_MediaUri) {
                hasMediaURI=true;
                if (child.attr(tva.a_contentType)) {
					if (!isIn(validApplicationTypes, child.attr(tva.a_contentType).value)) 
                        errs.pushCodeW("SA003", 
							`${tva.a_contentType.attribute()} ${child.attr(tva.a_contentType).value().quote()} is not DVB AIT for ${tva.e_RelatedMaterial.elementize()}${tva.e_MediaLocator.elementize()} in ${Location}`, 
							`invalid ${tva.a_contentType.attribute(tva.e_MediaUri)}`)
				}
				if (!patterns.isHTTPURL(child.text())) 
					errs.pushCode("SA004", `invalid URL ${child.text().quote()} specified for ${child.name().elementize()}`, "invalid resource URL")
            }
        });
        if (!hasMediaURI) 
			NoMediaLocator("application", Location, errs, "SA005");
    }
}


/**
 * verifies if the specified RelatedMaterial element is valid according to specification (contents and location)
 *
 * @param {Object} RelatedMaterial   The <RelatedMaterial> element (a libxmls ojbect tree) to be checked
 * @param {Object} errs              The class where errors and warnings relating to the serivce list processing are stored 
 * @param {string} Location          The printable name used to indicate the location of the <RelatedMaterial> element being checked. used for error reporting
 * @param {string} LocationType      The type of element containing the <RelatedMaterial> element. Different validation rules apply to different location types
 * @param {string} SCHEMA_NAMESPACE  The namespace of XML document
 * @param {string} errcode			 The prefix to use for any errors found
 * @returns {string} an href value if valid, else ""
 */
function validateRelatedMaterial(RelatedMaterial, errs, Location, LocationType, SCHEMA_NAMESPACE, errcode=null) {
	let rc=""
	if (!RelatedMaterial) {
		errs.pushCode(errcode?`${errcode}-1`:"RM000", "validateRelatedMaterial() called with RelatedMaterial==null", "invalid args")
		return rc;
	}
	
    let HowRelated=null, Format=null, MediaLocator=[]
	let elems=RelatedMaterial.childNodes()
	if (elems) elems.forEachSubElement(elem => {
		switch (elem.name()) {
			case tva.e_HowRelated:
				HowRelated=elem
				break
			case tva.e_Format:
				Format=elem
				break
			case tva.e_MediaLocator:
				MediaLocator.push(elem)
				break
		}
	})
	
    if (!HowRelated) {
        errs.pushCode(errcode?`${errcode}-1`:"RM001", `${tva.e_HowRelated.elementize()} not specified for ${tva.e_RelatedMaterial.elementize()} in ${Location}`, `no ${tva.e_HowRelated}`)
		return rc
    }

	if (HowRelated.attr(dvbi.a_href)) {	
		switch (LocationType) {
			case SERVICE_LIST_RM: 
				if (validServiceListLogo(HowRelated, SCHEMA_NAMESPACE)) {
					rc=HowRelated.attr(dvbi.a_href).value()
					MediaLocator.forEach(locator => 
						checkValidLogo(HowRelated, Format, locator, errs, Location))
				}
				else
					InvalidHrefValue(HowRelated.attr(dvbi.a_href).value(), tva.e_RelatedMaterial.elementize(), Location, errs, errcode?`${errcode}-11`:"RM011")	
				break;
			case SERVICE_RM:
			case SERVICE_INSTANCE_RM:
				if (validContentFinishedBanner(HowRelated, ANY_NAMESPACE) && (SchemaVersion(SCHEMA_NAMESPACE)==SCHEMA_v1)) 
					errs.pushCode(errcode?`${errcode}-21`:"RM021", 
						`${HowRelated.attr(dvbi.href).value().quote()} not permitted for ${SCHEMA_NAMESPACE.quote()} in ${Location}`, "invalid CS value")
				
				if (validOutScheduleHours(HowRelated, SCHEMA_NAMESPACE) || validContentFinishedBanner(HowRelated, SCHEMA_NAMESPACE) || validServiceApplication(HowRelated) || validServiceLogo(HowRelated, SCHEMA_NAMESPACE)) {
					rc=HowRelated.attr(dvbi.a_href).value()
					if (validServiceLogo(HowRelated, SCHEMA_NAMESPACE) || validOutScheduleHours(HowRelated, SCHEMA_NAMESPACE))
						MediaLocator.forEach(locator =>
							checkValidLogo(HowRelated, Format, locator, errs, Location));
					if (validServiceApplication(HowRelated))
						MediaLocator.forEach(locator =>
							checkSignalledApplication(locator, errs, Location));
				}
				else 
					InvalidHrefValue(HowRelated.attr(dvbi.a_href).value(), tva.e_RelatedMaterial.elementize(), Location, errs, errcode?`${errcode}-22`:"RM022")
				break;
			case CONTENT_GUIDE_RM:
				if (validContentGuideSourceLogo(HowRelated, SCHEMA_NAMESPACE)) {
					rc=HowRelated.attr(dvbi.a_href).value()
					MediaLocator.forEach(locator =>
						checkValidLogo(HowRelated, Format, locator, errs, Location))
				}
				else
					InvalidHrefValue(HowRelated.attr(dvbi.a_href).value(), tva.e_RelatedMaterial.elementize(), Location, errs, errcode?`${errcode}-31`:"RM031")
				break;
		}
	}
	return rc
}


/**
 * checks that all the @xml:lang values for an element are unique and that only one instace of the element does not contain an xml:lang attribute
 *
 * @param {String} SL_SCHEMA        Used when constructing Xpath queries
 * @param {String} SCHEMA_PREFIX    Used when constructing Xpath queries
 * @param {String} elementName      The multilingual XML element to check
 * @param {String} elementLocation  The descriptive location of the element being checked (for reporting)
 * @param {Object} node             The XML tree node containing the element being checked
 * @param {Object} errs             The class where errors and warnings relating to the serivce list processing are stored 
 * @param {String} errCode          The error code to be reported
 */
function checkXMLLangs(SL_SCHEMA, SCHEMA_PREFIX, elementName, elementLocation, node, errs, errCode=null) {
	if (!node) {
		errs.pushCode(errCode?`${errcode}-0`:"XL000", "checkXMLLangs() called with node==null", "invalid args")
		return;
	}
    let elementLanguages=[], i=0, elem
    while (elem=node.get(xPath(SCHEMA_PREFIX, elementName, ++i), SL_SCHEMA)) {
		let lang=elem.attr(dvbi.a_lang)?elem.attr(dvbi.a_lang).value():"unspecified"
        if (isIn(elementLanguages, lang)) 
            errs.pushCode(errCode?`${errcode}-1`:"XL001", `xml:lang=${lang.quote()} already specifed for ${elementName.elementize()} for ${elementLocation}`, "duplicate @xml:lang")
        else elementLanguages.push(lang);

        //if lang is specified, validate the format and value of the attribute against BCP47 (RFC 5646)
		if (lang!="unspecified") 
			checkLanguage(lang, "xml:lang", errs, errCode?`${errcode}-2`:"XL002")
    }
}


/**
 * checks of the object provided is empty, either contains no values or properties
 *
 * @param {Object} obj  The item (array, string, object) to be checked
 * @returns {boolean} true if the object being checked is empty
 */
function isEmpty(obj) {
    for(let key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}


/**
 * Add an error message for missing <xxxDeliveryParameters>
 *
 * @param {String} source     The missing source type
 * @param {String} serviceId  The serviceId whose instance is missing delivery parameters
 * @param {Object} errs       Errors buffer
 * @param {String} errCode    The error code to be reported
 */
function NoDeliveryParams(source, serviceId, errs, errCode=null) {
    errs.pushCode(errCode?errCode:"XX101", `${source} delivery parameters not specified for service instance in service ${serviceId.quote()}`, "no delivery params")
}


/**
 * Add an error message when the @href contains an invalid value
 *
 * @param {String} value    The invalid value for the href attribute
 * @param {String} src      The element missing the @href
 * @param {String} loc      The location of the element
 * @param {Object} errs     Errors buffer
 * @param {String} errCode  The error code to be reported
 */
function InvalidHrefValue(value, src, loc, errs, errCode=null) {
	errs.pushCode(errCode?errCode:"XX103", `invalid ${dvbi.a_href.attribute()}=${value.quote()} specified for ${src} in ${loc}`, "invalid href")
}


/**
 * Add an error message an incorrect country code is specified in transmission parameters
 *
 * @param {String} value    The invalid country code
 * @param {String} src      The transmission mechanism
 * @param {String} loc      The location of the element
 * @param {Object} errs     Errors buffer
 * @param {String} errCode  The error code to be reported
 */
function InvalidCountryCode(value, src, loc, errs, errCode=null) {
	errs.pushCode(errCode?errCode:"XX104", `invalid country code ${value.quote()} for ${src} parameters in ${loc}`, "invalid country code")
}


/**
 * Add an error message an unspecifed target region is used
 *
 * @param {String} region   The unspecified target region
 * @param {String} loc      The location of the element
 * @param {Object} errs     Errors buffer
 * @param {String} errCode  The error code to be reported
 */
function UnspecifiedTargetRegion(region, loc, errs, errCode=null) {
	errs.pushCode(errCode?errCode:"XX105", `${loc} has an unspecified ${dvbi.e_TargetRegion.elementize()} ${region.quote()}`, "target region")	
}


/**
 * Add an error message when the MediaLocator does not contain a MediaUri sub-element
 *
 * @param {String} src      The type of element with the <MediaLocator>
 * @param {String} loc      The location of the element
 * @param {Object} errs     Errors buffer
 * @param {String} errCode  The error code to be reported
 */
function NoMediaLocator(src, loc, errs, errCode=null) {
	errs.pushCode(errCode?errCode:"XX106", `${tva.e_MediaUri.elementize()} not specified for ${src} ${tva.e_MediaLocator.elementize()} in ${loc}`, `no ${tva.e_MediaUri}`)
}


/**
 * Add an error message when an attribite contains an invalid value
 *
 * @param {Object} errs             Errors buffer
 * @param {String} errCode          The error code to be reported
 * @param {String} elementName      The name of element 
 * @param {String} attribName       The name of the attribute with the invalid value
 * @param {String} invValue         The invalid value
 * @param {String} parentElementName The name of the parent element for elementName
 */
function invalidValue(errs, errcode, elementName, attribName, invValue, parentElementName) {
	errs.pushCode(errcode, 
		`Invalid value ${invValue?`${invValue.quote()} `:""} for ${attribName?attribName.attribute(elementName):elementName.elementize()}${parentElementName?` in ${parentElementName.elementize()}`:""}`,
		"invalid value")	
}


/**
 * check if the node provided contains an RelatedMaterial element for a signalled application
 *
 * @param {string} SL_SCHEMA      Used when constructing Xpath queries
 * @param {string} SCHEMA_PREFIX  Used when constructing Xpath queries
 * @param {Object} node           The XML tree node (either a <Service> or a <ServiceInstance>) to be checked
 * @returns {boolean} true if the node contains a <RelatedMaterial> element which signals an application else false
 */
function hasSignalledApplication(SL_SCHEMA, SCHEMA_PREFIX, node) {
	if (node) {
		let i=0, elem;
		while (elem=node.get(xPath(SCHEMA_PREFIX, tva.e_RelatedMaterial, ++i), SL_SCHEMA)) {
			let hr=elem.get(xPath(SCHEMA_PREFIX, tva.e_HowRelated), SL_SCHEMA);
			if (hr && validServiceApplication(hr)) 
				return true;			
		}
	}
    return false;
}


/**
 * perform any validation on a ContentTypeSourceType element
 * 
 * @param {string} SL_SCHEMA         Used when constructing Xpath queries
 * @param {string} SCHEMA_PREFIX     Used when constructing Xpath queries
 * @param {string} SCHEMA_NAMESPACE  The namespace of XML document
 * @param {object} source            The node of the element to check
 * @param {object} loc			     The 'location' in the XML document of the element being checked, if unspecified then this is set to be the name of the parent element
 * @param {Class}  errs              Errors found in validaton
 * @param {string} errCode           Error code prefix to be used in reports, if not present then use local codes
 */
function validateAContentGuideSource(SL_SCHEMA, SCHEMA_PREFIX, SCHEMA_NAMESPACE, source, loc=null, errs, errCode=null) {

	if (!source) {
		errs.pushCode("GS000", "validateAContentGuideSource() called with source==null")
		return;
	}
	loc=loc?loc:source.parent().name().elementize();
	
	checkXMLLangs(SL_SCHEMA, SCHEMA_PREFIX, dvbi.e_Name, loc, source, errs, errCode?`${errcode}c`:"GS003")
	checkXMLLangs(SL_SCHEMA, SCHEMA_PREFIX, dvbi.e_ProviderName, loc, source, errs, errCode?`${errcode}d`:"GS004")
	
	let rm=0, RelatedMaterial;
	while (RelatedMaterial=source.get(xPath(SCHEMA_PREFIX, tva.e_RelatedMaterial, ++rm), SL_SCHEMA))
		validateRelatedMaterial(RelatedMaterial, errs, loc, CONTENT_GUIDE_RM, SCHEMA_NAMESPACE, errCode?`${errcode}-e`:"GS005")
	
	// ContentGuideSourceType::ScheduleInfoEndpoint - should be a URL
	let sie=source.get(xPath(SCHEMA_PREFIX, dvbi.e_ScheduleInfoEndpoint), SL_SCHEMA)
	if (sie && !patterns.isHTTPURL(sie.text()))
		errs.pushCode(errCode?`${errcode}-f`:"GS006", `${dvbi.e_ScheduleInfoEndpoint.elementize()} is not a valid URL`, "not URL")
	
	// ContentGuideSourceType::ProgramInfoEndpoint - should be a URL
	let pie=source.get(xPath(SCHEMA_PREFIX, dvbi.e_ProgramInfoEndpoint), SL_SCHEMA)
	if (pie && !patterns.isHTTPURL(pie.text()))
		errs.pushCode(errCode?`${errcode}-g`:"GS007", `${dvbi.e_ProgramInfoEndpoint.elementize()} is not a valid URL`, "not URL")
	
	// ContentGuideSourceType::GroupInfoEndpoint - should be a URL
	let gie=source.get(xPath(SCHEMA_PREFIX, dvbi.e_GroupInfoEndpoint), SL_SCHEMA)
	if (gie && !patterns.isHTTPURL(gie.text()))
		errs.pushCode(errCode?`${errcode}-h`:"GS008", `${dvbi.e_GroupInfoEndpoint.elementize()} is not a valid URL`, "not URL")
	
	// ContentGuideSourceType::MoreEpisodesEndpoint - should be a URL
	let mee=source.get(xPath(SCHEMA_PREFIX, dvbi.e_MoreEpisodesEndpoint), SL_SCHEMA)
	if (mee && !patterns.isHTTPURL(mee.text()))
		errs.pushCode(errCode?`${errcode}-i`:"GS008", `${dvbi.e_MoreEpisodesEndpoint.elementize()} is not a valid URL}`, "not URL")
}



/**
 * validate the SynopsisType elements 
 *
 * @param {string} SCHEMA              Used when constructing Xpath queries
 * @param {string} SCHEMA_PREFIX       Used when constructing Xpath queries
 * @param {Object} Element             the element whose children should be checked
 * @param {string} ElementName
 * @param {array}  requiredLengths	   @length attributes that are required to be present
 * @param {array}  optionalLengths	   @length attributes that can optionally be present
 * @param {string} parentLanguage	   the xml:lang of the parent element to ProgramInformation
 * @param {Class}  errs                errors found in validaton
 * @param {string} errCode             error code prefix to be used in reports, if not present then use local codes
 */
function ValidateSynopsisType(SCHEMA, SCHEMA_PREFIX, Element, ElementName, requiredLengths, optionalLengths, parentLanguage, errs, errCode=null) {

	function synopsisLengthError(elem, label, length) {
		return `length of ${elementize(`${tva.a_length.attribute(elem)}=${label.quote()}`)} exceeds ${length} characters` }
	function synopsisToShortError(elem, label, length) {
		return `length of ${elementize(`${tva.a_length.attribute(elem)}=${label.quote()}`)} is less than ${length} characters` }
	function singleLengthLangError(elem, length, lang) {
		return `only a single ${elementize(elem)} is permitted per length (${length}) and language (${lang})` }
	function requiredSynopsisError(elem, length) {
		return `a ${elementize(elem)} element with ${tva.a_length.attribute()}=${quote(length)} is required` }
	
	if (!Element) {
		errs.pushCode("SY000", "ValidateSynopsisType() called with Element==null")
		return
	}
	let s=0, ste, hasBrief=false, hasShort=false, hasMedium=false, hasLong=false, hasExtended=false;
	let briefLangs=[], shortLangs=[], mediumLangs=[], longLangs=[], extendedLangs=[];
	while (ste=Element.get(xPath(SCHEMA_PREFIX, ElementName, ++s), SCHEMA)) {
		
		let synopsisLang=GetLanguage(knownLanguages, errs, ste, parentLanguage, false, errcode?`${errcode}-2`:"SY002");
		let synopsisLength=ste.attr(tva.a_length)?ste.attr(tva.a_length).value():null;
		
		if (synopsisLength) {
			let cleanSynopsisLength=ste.text().replace(/(&.+;)/ig,"*")  // replace ENTITY strings with a generic characterSet
			if (isIn(requiredLengths, synopsisLength) || isIn(optionalLengths, synopsisLength)) {
				switch (synopsisLength) {
					case tva.SYNOPSIS_BRIEF_LABEL:
						if (cleanSynopsisLength > tva.SYNOPSIS_BRIEF_LENGTH)
							errs.pushCode(errCode?`${errcode}-10`:"SY010", synopsisLengthError(ElementName, tva.SYNOPSIS_BRIEF_LABEL, tva.SYNOPSIS_BRIEF_LENGTH), "synopsis");
						hasBrief=true;
						break;
					case tva.SYNOPSIS_SHORT_LABEL:
						if (cleanSynopsisLength > tva.SYNOPSIS_SHORT_LENGTH)
							errs.pushCode(errCode?`${errcode}-11`:"SY011", synopsisLengthError(ElementName, tva.SYNOPSIS_SHORT_LABEL, tva.SYNOPSIS_SHORT_LENGTH), "synopsis");
						hasShort=true;
						break;
					case tva.SYNOPSIS_MEDIUM_LABEL:
						if (cleanSynopsisLength > tva.SYNOPSIS_MEDIUM_LENGTH)
							errs.pushCode(errCode?`${errcode}-12`:"SY012", synopsisLengthError(ElementName, tva.SYNOPSIS_MEDIUM_LABEL, tva.SYNOPSIS_MEDIUM_LENGTH), "synopsis");
						hasMedium=true;
						break;
					case tva.SYNOPSIS_LONG_LABEL:
						if (cleanSynopsisLength > tva.SYNOPSIS_LONG_LENGTH)
							errs.pushCode(errCode?`${errcode}-13`:"SY013", synopsisLengthError(ElementName, tva.SYNOPSIS_LONG_LABEL, tva.SYNOPSIS_LONG_LENGTH), "synopsis");
						hasLong=true;
						break;						
					case tva.SYNOPSIS_EXTENDED_LABEL:
						if (cleanSynopsisLength < tva.SYNOPSIS_LENGTH_LENGTH)
							errs.pushCode(errCode?`${errcode}-14`:"SY014", synopsisToShortError(ElementName, tva.SYNOPSIS_EXTENDED_LABEL, tva.SYNOPSIS_LONG_LENGTH), "synopsis");
						hasExtended=true;
						break;
				}
			}
			else
				errs.pushCode(errCode?`${errcode}-15`:"SY015", `${tva.a_length.attribute()}=${quote(synopsisLength)} is not permitted`, "synopsis")
		}
	
		if (synopsisLang && synopsisLength) {
			switch (synopsisLength) {
				case tva.SYNOPSIS_BRIEF_LABEL:
					if (isIn(briefLangs, synopsisLang)) 
						errs.pushCode(errCode?`${errcode}-21`:"SY021", singleLengthLangError(ElementName, synopsisLength, synopsisLang), "synopsis");
					else briefLangs.push(synopsisLang);
					break;
				case tva.SYNOPSIS_SHORT_LABEL:
					if (isIn(shortLangs, synopsisLang)) 
						errs.pushCode(errCode?`${errcode}-22`:"SY022", singleLengthLangError(ElementName, synopsisLength, synopsisLang), "synopsis");
					else shortLangs.push(synopsisLang);
					break;
				case tva.SYNOPSIS_MEDIUM_LABEL:
					if (isIn(mediumLangs, synopsisLang)) 
						errs.pushCode(errCode?`${errcode}-23`:"SY023", singleLengthLangError(ElementName, synopsisLength, synopsisLang), "synopsis");
					else mediumLangs.push(synopsisLang);
					break;
				case tva.SYNOPSIS_LONG_LABEL:
					if (isIn(longLangs, synopsisLang)) 
						errs.pushCode(errCode?`${errcode}-24`:"SY024", singleLengthLangError(ElementName, synopsisLength, synopsisLang), "synopsis");
					else longLangs.push(synopsisLang);
					break;
				case tva.SYNOPSIS_EXTENDED_LABEL:
					if (isIn(extendedLangs, synopsisLang)) 
						errs.pushCode(errCode?`${errcode}-25`:"SY025", singleLengthLangError(ElementName, synopsisLength, synopsisLang), "synopsis");
					else extendedLangs.push(synopsisLang);
					break;
			}
		}
	}
	
	if (isIn(requiredLengths, tva.SYNOPSIS_BRIEF_LABEL) && !hasBrief)
		errs.pushCode(errCode?`${errcode}-31`:"SY031", requiredSynopsisError(tva.SYNOPSIS_BRIEF_LABEL), "synopsis");	
	if (isIn(requiredLengths, tva.SYNOPSIS_SHORT_LABEL) && !hasShort)
		errs.pushCode(errCode?`${errcode}-32`:"SY032",requiredSynopsisError(tva.SYNOPSIS_SHORT_LABEL), "synopsis");	
	if (isIn(requiredLengths, tva.SYNOPSIS_MEDIUM_LABEL) && !hasMedium)
		errs.pushCode(errCode?`${errcode}-33`:"SY022",requiredSynopsisError(tva.SYNOPSIS_MEDIUM_LABEL), "synopsis");	
	if (isIn(requiredLengths, tva.SYNOPSIS_LONG_LABEL) && !hasLong)
		errs.pushCode(errCode?`${errcode}-34`:"SY034",requiredSynopsisError(tva.SYNOPSIS_LONG_LABEL), "synopsis");	
	if (isIn(requiredLengths, tva.SYNOPSIS_EXTENDED_LABEL) && !hasExtended)
		errs.pushCode(errCode?`${errcode}-35`:"SY035",requiredSynopsisError(tva.SYNOPSIS_EXTENDED_LABEL), "synopsis");	
}


/**
 * validate a ServiceInstance element
 *
 * @param {string} SL_SCHEMA             Used when constructing Xpath queries
 * @param {string} SCHEMA_PREFIX         Used when constructing Xpath queries
 * @param {string} SCHEMA_NAMESPACE      The namespace of XML document 
 * @param {object} ServiceInstance       the service instance element to check
 * @param {string} thisServiceId         the identifier of the service 
 * @param {Class}  errs                  errors found in validaton
 */
function validateServiceInstance(SL_SCHEMA, SCHEMA_PREFIX, SCHEMA_NAMESPACE, ServiceInstance, thisServiceId, errs) {
	if (!ServiceInstance) {
		errs.pushCode("SI000", "validateServiceInstance() called with ServiceInstance==null")
		return
	}

	checkXMLLangs(SL_SCHEMA, SCHEMA_PREFIX, dvbi.e_DisplayName, `service instance in service=${thisServiceId.quote()}`, ServiceInstance, errs, "SI010");

	// check @href of <ServiceInstance><RelatedMaterial>
	let rm=0, countControlApps=0, RelatedMaterial
	while (RelatedMaterial=ServiceInstance.get(xPath(SCHEMA_PREFIX, tva.e_RelatedMaterial, ++rm), SL_SCHEMA)) {
		let foundHref=validateRelatedMaterial(RelatedMaterial, errs, `service instance of ${thisServiceId.quote()}`, SERVICE_INSTANCE_RM, SCHEMA_NAMESPACE, "SI020")
		if (foundHref!="" && validServiceControlApplication(foundHref)) 
			countControlApps++
	}
	if (countControlApps>1)
		errs.pushCode("SI021", "only a single service control application can be signalled in a service instance", "multi apps")

	// <ServiceInstance><ContentAttributes>
	let ContentAttributes=ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_ContentAttributes), SL_SCHEMA)
	if (ContentAttributes) {

		// Check ContentAttributes/AudioAttributes - other subelements are checked with schema based validation
		let cp=0, conf
		while (conf=ContentAttributes.get(xPath(SCHEMA_PREFIX, tva.e_AudioAttributes, ++cp), SL_SCHEMA)) {
			
			let children=conf.childNodes()
			if (children) children.forEachSubElement(child => {
				switch (child.name()) {
					case tva.e_Coding:
						if (child.attr(dvbi.a_href) && !isIn(allowedAudioSchemes, child.attr(dvbi.a_href).value())) 
							errs.pushCode("SI052", `invalid ${dvbi.a_href.attribute(child.name())} value for (${child.attr(dvbi.a_href).value()})`, "audio codec")
						break;

					case tva.e_MixType:
						// taken from MPEG-7 AudioPresentationCS
						if (child.attr(dvbi.a_href) && !isIn(AudioPresentationCS, child.attr(dvbi.a_href).value())) 
							errs.pushCode("SI055", `invalid ${dvbi.a_href.attribute(child.name())} value for (${child.attr(dvbi.a_href).value()})`, "audio codec")
						break;
				}
			})
		}
		
		// Check @href of ContentAttributes/AudioConformancePoints
		cp=0
		while (conf=ContentAttributes.get(xPath(SCHEMA_PREFIX, dvbi.e_AudioConformancePoint, ++cp), SL_SCHEMA)) {
			if (conf.attr(dvbi.a_href)) {
				if (!isIn(allowedAudioConformancePoints, conf.attr(dvbi.a_href).value())) 
					errs.pushCode("SI061", `invalid ${dvbi.a_href.attribute(dvbi.e_AudioConformancePoint)} (${conf.attr(dvbi.a_href).value()})`, "audio conf point")
			}	
		}

		// Check ContentAttributes/VideoAttributes - other subelements are checked with schema based validation
		cp=0;
		while (conf=ContentAttributes.get(xPath(SCHEMA_PREFIX, tva.e_VideoAttributes, ++cp), SL_SCHEMA)) {
			let children=conf.childNodes()
			if (children) children.forEachSubElement(child => {
				switch (child.name()) {
					case tva.e_Coding:
						if (child.attr(dvbi.a_href) && !isIn(allowedVideoSchemes, child.attr(dvbi.a_href).value())) 
							errs.pushCode("SI072", `invalid ${dvbi.a_href.attribute(tva.e_VideoAttributes)} (${child.attr(dvbi.a_href).value()})`, "video codec")
						break;
					case tva.e_PictureFormat:
						if (child.attr(dvbi.a_href) && !isIn(allowedPictureFormats, child.attr(dvbi.a_href).value())) 
							errs.pushCode("SI082", `invalid ${dvbi.a_href.attribute(tva.e_PictureFormat)} value (${child.attr(dvbi.a_href).value()})`, tva.e_PictureFormat)
						break;
					case dvbi.e_Colorimetry:
						if (child.attr(dvbi.a_href) && !isIn(dvbi.ALLOWED_COLORIMETRY, child.attr(dvbi.a_href).value())) 
							errs.pushCode("SI084", `invalid ${dvbi.a_href.attribute(tva.e_Colorimetry)} value (${child.attr(dvbi.a_href).value()})`, tva.e_Colorimetry)
						break;
				}
			})
		}

		// Check @href of ContentAttributes/VideoConformancePoints
		cp=0;
		while (conf=ContentAttributes.get(xPath(SCHEMA_PREFIX, dvbi.e_VideoConformancePoint, ++cp), SL_SCHEMA)) { 
			if (conf.attr(dvbi.a_href) && !isIn(allowedVideoConformancePoints, conf.attr(dvbi.a_href).value())) 
				errs.pushCode("SI091", `invalid ${dvbi.a_href.attribute(dvbi.e_VideoConformancePoint)} value (${conf.attr(dvbi.a_href).value()})`, "video conf point")
		}

		// Check ContentAttributes/CaptionLanguage
		cp=0;
		while (conf=ContentAttributes.get(xPath(SCHEMA_PREFIX, tva.e_CaptionLanguage, ++cp), SL_SCHEMA)) { 
			checkLanguage(conf.text(), tva.e_CaptionLanguage.elementize(), errs, "SI101")
		}

		// Check ContentAttributes/SignLanguage
		cp=0;
		while (conf=ContentAttributes.get(xPath(SCHEMA_PREFIX, tva.e_SignLanguage, ++cp), SL_SCHEMA)) { 
			checkLanguage(conf.text(), tva.e_SignLanguage.elementize(), errs, "SI111")
		}
	}
	
	// <ServiceInstance><Availability>
	let Availability=ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_Availability), SL_SCHEMA)
	if (Availability) {
		let Period, p=0
		while (Period=Availability.get(xPath(SCHEMA_PREFIX, dvbi.e_Period, ++p), SL_SCHEMA)) {
			if (Period.attr(dvbi.a_validFrom) && Period.attr(dvbi.a_validTo)) {
				// validTo should be >= validFrom
				let fr=new Date(Period.attr(dvbi.a_validFrom).value()), 
					to=new Date(Period.attr(dvbi.a_validTo).value())
			
				if (to.getTime() < fr.getTime()) 
					errs.pushCode("SI124", `invalid availability period for service ${thisServiceId.quote()}. ${fr}>${to}`, "period start>end")
			}
		}
	}

	// <ServiceInstance><SubscriptionPackage>
	checkXMLLangs(SL_SCHEMA, SCHEMA_PREFIX, dvbi.e_SubscriptionPackage, ServiceInstance.name().elementize(), ServiceInstance, errs, "SI131")
			
	// note that the <SourceType> element becomes optional and in A177v2, but if specified then the relevant
	// delivery parameters also need to be specified
	let SourceType=ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_SourceType), SL_SCHEMA)
	if (SourceType) {
		let v1Params=false
		switch (SourceType.text()) {
			case dvbi.DVBT_SOURCE_TYPE:
				if (!ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_DVBTDeliveryParameters), SL_SCHEMA) ) 
					NoDeliveryParams("DVB-T", thisServiceId, errs, "SI151"); 
				v1Params=true
				break;
			case dvbi.DVBS_SOURCE_TYPE:
				if (!ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_DVBSDeliveryParameters), SL_SCHEMA) ) 
					NoDeliveryParams("DVB-S", thisServiceId, errs, "SI152");
				v1Params=true
				break;
			case dvbi.DVBC_SOURCE_TYPE:
				if (!ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_DVBCDeliveryParameters), SL_SCHEMA) ) 
					NoDeliveryParams("DVB-C", thisServiceId, errs, "SI153");
				v1Params=true
				break;
			case dvbi.DVBDASH_SOURCE_TYPE:
				if (!ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_DASHDeliveryParameters), SL_SCHEMA) ) 
					NoDeliveryParams("DVB-DASH", thisServiceId, errs, "SI154");
				v1Params=true
				break;
			case dvbi.DVBIPTV_SOURCE_TYPE:
				if (!ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_MulticastTSDeliveryParameters), SL_SCHEMA) && !ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_RTSPDeliveryParameters), SL_SCHEMA) ) 
					NoDeliveryParams("Multicast or RTSP", thisServiceId, errs, "SI155");
				v1Params=true
				break;
			case dvbi.DVBAPPLICATION_SOURCE_TYPE:
				// there should not be any <xxxxDeliveryParameters> elements and there should be either a Service.RelatedMaterial or Service.ServiceInstance.RelatedMaterial signalling a service related application
				if (ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_DVBTDeliveryParameters), SL_SCHEMA)
					|| ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_DVBSDeliveryParameters), SL_SCHEMA)
					|| ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_DVBCDeliveryParameters), SL_SCHEMA)
					|| ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_DASHDeliveryParameters), SL_SCHEMA)
					|| ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_SATIPDeliveryParametersDeliveryParameters), SL_SCHEMA)
					|| ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_MulticastTSDeliveryParameters), SL_SCHEMA)
					|| ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_RTSPDeliveryParameters), SL_SCHEMA) ) {
						errs.pushCode("SI156", `Delivery parameters are not permitted for Application service instance in Service ${thisServiceId.quote()}`, "invalid application")
						v1Params=true
					}
					else {
						// no xxxxDeliveryParameters is signalled
						// check for appropriate Service.RelatedMaterial or Service.ServiceInstance.RelatedMaterial
						if (!hasSignalledApplication(SL_SCHEMA, SCHEMA_PREFIX, service) && !hasSignalledApplication(SL_SCHEMA, SCHEMA_PREFIX, ServiceInstance)) 
							errs.pushCode("SI157", `No Application is signalled for ${dvbi.e_SourceType}=${dvbi.DVBAPPLICATION_SOURCE_TYPE.quote()} in Service ${thisServiceId.quote()}`, "no application")
					}
				break;
			default:
				switch (SchemaVersion(SCHEMA_NAMESPACE)) {
					case SCHEMA_v1:
						errs.pushCode("SI158", `${dvbi.e_SourceType.elementize()} ${SourceType.text().quote()} is not valid in Service ${thisServiceId.quote()}`, `invalid ${dvbi.e_SourceType}`)
						break;
					case SCHEMA_v2:
					case SCHEMA_v3:
						if (!ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_OtherDeliveryParameters), SL_SCHEMA))
							errs.pushCode("SI159", 
								`${dvbi.e_OtherDeliveryParameters.elementize()} must be specified with user-defined ${dvbi.e_SourceType} ${SourceType.text().quote()}`, 
								`no ${dvbi.e_OtherDeliveryParameters}`)
						break;
				}
		}
		if (v1Params && SchemaVersion(SCHEMA_NAMESPACE)>=SCHEMA_v2)
			errs.pushCodeW("SI160", `${dvbi.e_SourceType.elementize()} is deprecated in this version`)
	}
	else {
		if (SchemaVersion(SCHEMA_NAMESPACE)==SCHEMA_v1) 
			errs.pushCode("SI161", `${dvbi.e_SourceType.elementize()} not specified in ${dvbi.e_ServiceInstance.elementize()} of service ${thisServiceId.quote()}`, `no ${dvbi.e_SourceType}`)
	}

	// <ServiceInstance><DASHDeliveryParameters>
	let DASHDeliveryParameters=ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_DASHDeliveryParameters), SL_SCHEMA)
	if (DASHDeliveryParameters) {
		let URILoc=DASHDeliveryParameters.get(xPath(SCHEMA_PREFIX, dvbi.e_UriBasedLocation), SL_SCHEMA)
		if (URILoc) {
			let uriContentType=URILoc.attr(dvbi.a_contentType)
			if (uriContentType && !validDASHcontentType(uriContentType.value()))
				errs.pushCode("SI173", 
					`${dvbi.a_contentType.attribute()}=${uriContentType.value().quote()} in service ${thisServiceId.quote()} is not valid`, 
					`no ${dvbi.a_contentType.attribute()} for DASH`)
			
			let URI=DASHDeliveryParameters.get(xPath(SCHEMA_PREFIX, dvbi.e_URI), SL_SCHEMA)
			if (URI && !patterns.isHTTPURL(URI.text()))
				errs.pushCode("SI174", `invalid URL ${URI.text().quote()} specified for ${dvbi.e_URI.elementize()}`, "invalid resource URL")
		}
		
	}

	let haveDVBT=false, haveDVBS=false

	// <ServiceInstance><DVBTDeliveryParameters>			
	let DVBTDeliveryParameters=ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_DVBTDeliveryParameters), SL_SCHEMA)
	if (DVBTDeliveryParameters) {
		haveDVBT=true

		let DVBTtargetCountry=DVBTDeliveryParameters.get(xPath(SCHEMA_PREFIX, dvbi.e_TargetCountry), SL_SCHEMA);
		if (DVBTtargetCountry && !knownCountries.isISO3166code(DVBTtargetCountry.text())) 
			InvalidCountryCode(DVBTtargetCountry.text(), "DVB-T", `service ${thisServiceId.quote()}`, errs, "SI182")
	}

	// <ServiceInstance><DVBCDeliveryParameters>
	let DVBCDeliveryParameters=ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_DVBCDeliveryParameters), SL_SCHEMA);
	if (DVBCDeliveryParameters) {
		let DVBCtargetCountry=ServiceInstance.get(xPathM(SCHEMA_PREFIX, [dvbi.e_DVBCDeliveryParameters, dvbi.e_TargetCountry]), SL_SCHEMA)
		if (DVBCtargetCountry && !knownCountries.isISO3166code(DVBCtargetCountry.text()))  
			InvalidCountryCode(DVBCtargetCountry.text(), "DVB-C", `service ${thisServiceId.quote()}`, errs, "SI191");
	}

	// <ServiceInstance><DVBSDeliveryParameters>
	let DVBSDeliveryParameters=ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_DVBSDeliveryParameters), SL_SCHEMA)
	if (DVBSDeliveryParameters) {
		haveDVBS=true
	}

	// <ServiceInstance><SATIPDeliveryParameters>			
	let SATIPDeliveryParameters=ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_SATIPDeliveryParameters), SL_SCHEMA)
	if (SATIPDeliveryParameters) {
	
		// SAT-IP Delivery Parameters can only exist if DVB-T or DVB-S delivery parameters are specified
		if (!haveDVBT && !haveDVBS)
			errs.pushCode("SI211", 
				`${dvbi.e_SATIPDeliveryParameters.elementize()} can only be specified with ${dvbi.e_DVBSDeliveryParameters.elementize()} or ${dvbi.e_DVBTDeliveryParameters.elementize()}`)
	}

	// <ServiceInstance><RTSPDeliveryParameters>
	let RTSPDeliveryParameters=ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_RTSPDeliveryParameters), SL_SCHEMA)
	if (RTSPDeliveryParameters) {
		let RTSPURL=RTSPDeliveryParameters.get(xPath(SCHEMA_PREFIX, dvbi.e_RTSPURL), SL_SCHEMA)
		if (RTSPURL) {
			if (!patterns.isRTSPURL(RTSPURL.text()))
				errs.pushCode("SI223", `${RTSPURL.text().quote()} is not a valid RTSP URL`, "invalid URL")
		}
	}
	
	// <ServiceInstance><MulticastTSDeliveryParameters>
	let MulticastTSDeliveryParameters=ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_MulticastTSDeliveryParameters), SL_SCHEMA)
	if (MulticastTSDeliveryParameters) {
		
		let IPMulticastAddress=MulticastTSDeliveryParameters.get(xPath(SCHEMA_PREFIX, dvbi.e_IPMulticastAddress), SL_SCHEMA)
		if (IPMulticastAddress) {
			let CNAME=IPMulticastAddress.get(xPath(SCHEMA_PREFIX, dvbi.e_CNAME), SL_SCHEMA)
			if (CNAME) {
				if (!patterns.isDomainName(CNAME.text()))
					errs.pushCode("SI235", `${dvbi.e_IPMulticastAddress.elementize()}${dvbi.e_CNAME.elementize()} is not a valid domain name for use as a CNAME`, "incalid CNAME")
			}
		}
	}
	}


/**
 * validate a XML document gainst the specified schema (included schemas must be in the same directory)
 * 
 * @param {Document} XML the XML document to check
 * @param {Document} XSD the schema
 * @param {object} errs array to record any errors
 * @param {string} errCode the error code to report with each error 
 */
function SchemaCheck( XML, XSD, errs, errCode) {
	if (!XML.validate(XSD)) 
		XML.validationErrors.forEach(ve => {
			let s=ve.toString().split('\r')
			s.forEach(err => errs.pushCode(errCode, err, 'schema error'))
		})
}


/**
 * validate the service list and record any errors
 *
 * @param {String} SLtext  The service list text to be validated
 * @param {Class} errs     Errors found in validaton
 */
module.exports.doValidateServiceList = function(SLtext, errs) {
	let SL=null
	if (SLtext) try {
		SL=libxml.parseXmlString(SLtext);
	} catch (err) {
		errs.pushCode("SL001", `XML parsing failed: ${err.message}`, "malformed XML")
	}
	if (!SL || !SL.root()) {
		errs.pushCode("SL002", "SL is empty")
		return;
	}
	
	let SL_SCHEMA={}, 
		SCHEMA_PREFIX=SL.root().namespace().prefix(), 
		SCHEMA_NAMESPACE=SL.root().namespace().href()
		SL_SCHEMA[SCHEMA_PREFIX]=SCHEMA_NAMESPACE;

	if (SL.root().name() !== dvbi.e_ServiceList) {
		errs.pushCode("SL003", `Root element is not ${dvbi.e_ServiceList.elementize()}`, 'schema error');
		return;
	}

	if (SchemaVersion(SCHEMA_NAMESPACE)==SCHEMA_unknown) {
		errs.pushCode("SL004", `Unsupported namespace ${SCHEMA_NAMESPACE.quote()}`, 'schema error');
		return;
	}

	switch (SchemaVersion(SCHEMA_NAMESPACE)) {
		case SCHEMA_v1:
			SchemaCheck(SL, SLschema_v1, errs, "SL005-1")
			break;
		case SCHEMA_v2:
			SchemaCheck(SL, SLschema_v2, errs, "SL005-2")
			break;
		case SCHEMA_v3:
			SchemaCheck(SL, SLschema_v3, errs, "SL005-3")
			break;		
	}

	checkXMLLangs(SL_SCHEMA, SCHEMA_PREFIX, dvbi.e_Name, dvbi.e_ServiceList, SL, errs, "SL020");
	checkXMLLangs(SL_SCHEMA, SCHEMA_PREFIX, dvbi.e_ProviderName, dvbi.e_ServiceList, SL, errs, "SL030");

	//check <ServiceList><RelatedMaterial>
	let rm=0, countControlApps=0, RelatedMaterial
	while (RelatedMaterial=SL.get(xPath(SCHEMA_PREFIX, tva.e_RelatedMaterial, ++rm), SL_SCHEMA)) {
		let foundHref=validateRelatedMaterial(RelatedMaterial, errs, "service list", SERVICE_LIST_RM, SCHEMA_NAMESPACE, "SL040")
		if (foundHref!="" && validServiceControlApplication(foundHref)) 
			countControlApps++	
	}

	if (countControlApps>1)
		errs.pushCode("SL041", "only a single service control application can be signalled in a service", "multi apps")
		
	// check <ServiceList><RegionList> and remember regionID values
	let knownRegionIDs=[], RegionList=SL.get(xPath(SCHEMA_PREFIX, dvbi.e_RegionList), SL_SCHEMA)
	if (RegionList) {
		// recurse the regionlist - Regions can be nested in Regions
		let r=0, Region
		while (Region=RegionList.get(xPath(SCHEMA_PREFIX, dvbi.e_Region, ++r), SL_SCHEMA)) 
			addRegion(SL_SCHEMA, SCHEMA_PREFIX, Region, 0, knownRegionIDs, errs);
	}

	//check <ServiceList><TargetRegion>
	let tr=0, TargetRegion
	while (TargetRegion=SL.get(xPath(SCHEMA_PREFIX, dvbi.e_TargetRegion, ++tr), SL_SCHEMA)) 
		if (!isIn(knownRegionIDs, TargetRegion.text())) 
			UnspecifiedTargetRegion(TargetRegion.text(), "service list", errs, "SL060");

	// <ServiceList><LCNTableList> is checked below, after the services are enumerated

	//check service list <ContentGuideSourceList>
	let ContentGuideSourceIDs=[],
	    CGSourceList=SL.get(`//${xPath(SCHEMA_PREFIX, dvbi.e_ContentGuideSourceList)}`, SL_SCHEMA)
	if (CGSourceList) {
		let cgs=0, CGSource
		while (CGSource=CGSourceList.get(xPath(SCHEMA_PREFIX, dvbi.e_ContentGuideSource, ++cgs), SL_SCHEMA)) {

			validateAContentGuideSource(SL_SCHEMA, SCHEMA_PREFIX, SCHEMA_NAMESPACE, CGsource, 
				`${dvbi.e_ServiceList}.${dvbi.e_ContentGuideSourceList}.${dvbi.e_ContentGuideSource}[${cgs}]`, errs, "SL070")
			
			if (CGSource.attr(dvbi.a_CGSID)) {
				if (isIn(ContentGuideSourceIDs, CGSource.attr(dvbi.a_CGSID).value()))
					errs.pushCode("SL071", 
						`duplicate ${dvbi.a_CGSID.attribute(dvbi.a_CGSID)} (${CGSource.attr(dvbi.a_CGSID).value()}) in service list`, `duplicate ${dvbi.a_CGSID.attribute()}`)
				else ContentGuideSourceIDs.push(CGSource.attr(dvbi.a_CGSID).value());
			}
		}
	}

	// check  elements in <ServiceList><ContentGuideSource>
	let slGCS=SL.get(xPath(SCHEMA_PREFIX, dvbi.e_ContentGuideSource), SL_SCHEMA)
	if (slGCS) 
		validateAContentGuideSource(SL_SCHEMA, SCHEMA_PREFIX, SCHEMA_NAMESPACE, slGCS, `${dvbi.e_ServiceList}.${dvbi.e_ContentGuideSource}`, errs, "SL080")

	// this should not happen if the XML document has passed schema validation
	if (SL.get(xPath(SCHEMA_PREFIX, dvbi.e_ContentGuideSourceList), SL_SCHEMA) && SL.get(xPath(SCHEMA_PREFIX, dvbi.e_ContentGuideSource), SL_SCHEMA))
		errs.pushCode("SL081", `cannot specify both ${dvbi.e_ContentGuideSourceList.elementize()} and ${dvbi.e_ContentGuideSource.elementize()}`, "source and ref")

	errs.set("num services", 0);

	// check <Service>
	let s=0, service, knownServices=[], thisServiceId
	while (service=SL.get(`//${xPath(SCHEMA_PREFIX, dvbi.e_Service, ++s)}`, SL_SCHEMA)) {
		// for each service
		errs.set("num services", s);
		thisServiceId=`service-${s}`;  // use a default value in case <UniqueIdentifier> is not specified
		
		let serviceOptionalElements=[dvbi.e_ServiceInstance, dvbi.e_TargetRegion, tva.e_RelatedMaterial, dvbi.e_ServiceGenre, dvbi.e_ServiceType, dvbi.e_RecordingInfo, dvbi.e_ContentGuideSource, dvbi.e_ContentGuideSourceRef, dvbi.e_ContentGuideServiceRef]
		if (SchemaVersion(SCHEMA_NAMESPACE) > SCHEMA_v2)
			serviceOptionalElements.push(dvbi.e_ServiceDescription)
		
		// check <Service><UniqueIdentifier>
		let uID=service.get(xPath(SCHEMA_PREFIX, dvbi.e_UniqueIdentifier), SL_SCHEMA)
		if (uID) {
			thisServiceId=uID.text();
			if (!validServiceIdentifier(thisServiceId)) 
				errs.pushCode("SL110", `${thisServiceId.quote()} is not a valid service identifier`, "invalid tag")
			if (!uniqueServiceIdentifier(thisServiceId, knownServices)) 
				errs.pushCode("SL111", `${thisServiceId.quote()} is not unique`, "non unique id")
			knownServices.push(thisServiceId);			
		}

		//check <Service><ServiceInstance>
		let si=0, ServiceInstance
		while (ServiceInstance=service.get(xPath(SCHEMA_PREFIX, dvbi.e_ServiceInstance, ++si), SL_SCHEMA)) 
			validateServiceInstance(SL_SCHEMA, SCHEMA_PREFIX, SCHEMA_NAMESPACE, ServiceInstance, thisServiceId, errs)	

		//check <Service><TargetRegion>
		let tr=0, TargetRegion
		while (TargetRegion=service.get(xPath(SCHEMA_PREFIX, dvbi.e_TargetRegion, ++tr), SL_SCHEMA)) 
			if (!isIn(knownRegionIDs, TargetRegion.text())) 
				UnspecifiedTargetRegion(TargetRegion.text(), `service ${thisServiceId.quote()}`, errs, "SL130")

		checkXMLLangs(SL_SCHEMA, SCHEMA_PREFIX, dvbi.e_ServiceName, `service ${thisServiceId.quote()}`, service, errs, "SL140")
		checkXMLLangs(SL_SCHEMA, SCHEMA_PREFIX, dvbi.e_ProviderName, `service ${thisServiceId.quote()}`, service, errs, "SL141")

		//check <Service><RelatedMaterial>
		let rm=0, RelatedMaterial
		while (RelatedMaterial=service.get(xPath(SCHEMA_PREFIX, tva.e_RelatedMaterial, ++rm), SL_SCHEMA)) 
			validateRelatedMaterial(RelatedMaterial, errs, `service ${thisServiceId.quote()}`, SERVICE_RM, SCHEMA_NAMESPACE, "SL150"); 

		//check <Service><ServiceGenre>
		let ServiceGenre=service.get(xPath(SCHEMA_PREFIX, dvbi.e_ServiceGenre), SL_SCHEMA)
		if (ServiceGenre) {
			if (ServiceGenre.attr(dvbi.a_href) && !isIn(allowedGenres, ServiceGenre.attr(dvbi.a_href).value()) && !isIn(tva.ALL_GENRE_TYPES, ServiceGenre.attr(tva.a_type).value())) 
				errs.pushCode("SL161", 
					`service ${thisServiceId.quote()} has an invalid ${dvbi.a_href.attribute(dvbi.e_ServiceGenre)} ${ServiceGenre.attr(dvbi.a_href).value().quote()}`, 
					`invalid ${dvbi.e_ServiceGenre}`)
		}

		//check <Service><ServiceType>                    
		let ServiceType=service.get(xPath(SCHEMA_PREFIX, dvbi.e_ServiceType), SL_SCHEMA)
		if (ServiceType) {
			if (ServiceType.attr(dvbi.a_href) && !isIn(allowedServiceTypes, ServiceType.attr(dvbi.a_href).value())) 
				errs.pushCode("SL164", 
					`service ${thisServiceId.quote()} has an invalid ${dvbi.e_ServiceType.elementize()} (${ServiceType.attr(dvbi.a_href).value()})`, `invalid ${dvbi.e_ServiceType}`)
		}

		// check <Service><ServiceDescription>
		ValidateSynopsisType(SL_SCHEMA, SCHEMA_PREFIX, service, tva.e_ServiceDescription, [], [tva.SYNOPSIS_LENGTH_BRIEF, tva.SYNOPSIS_LENGTH_SHORT, tva.SYNOPSIS_LENGTH_MEDIUM, tva.SYNOPSIS_LENGTH_LONG, tva.SYNOPSIS_LENGTH_EXTENDED], "***", errs, "SL170") 

		// check <Service><RecordingInfo>
		let RecordingInfo=service.get(xPath(SCHEMA_PREFIX, dvbi.e_RecordingInfo), SL_SCHEMA)
		if (RecordingInfo) {
			if (RecordingInfo.attr(dvbi.a_href) && !isIn(RecordingInfoCSvalules, RecordingInfo.attr(dvbi.a_href).value())) 
				errs.pushCode("SL181", `invalid ${dvbi.e_RecordingInfo.elementize()} value ${RecordingInfo.attr(dvbi.a_href).value().quote()} for service ${thisServiceId}`, `invalid ${dvbi.e_RecordingInfo}`)
		}

		// check <Service><ContentGuideSource>
		let sCG=service.get(xPath(SCHEMA_PREFIX, dvbi.e_ContentGuideSource), SL_SCHEMA)
		if (sCG) 
			validateAContentGuideSource(SL_SCHEMA, SCHEMA_PREFIX, SCHEMA_NAMESPACE, sCG, `${dvbi.e_ContentGuideSource.elementize()} in service ${thisServiceId}`, errs, "SL190")

		//check <Service><ContentGuideSourceRef>
		let sCGref=service.get(xPath(SCHEMA_PREFIX, dvbi.e_ContentGuideSourceRef), SL_SCHEMA)
		if (sCGref) {
			if (!isIn(ContentGuideSourceIDs, sCGref.text())) 
				errs.pushCode("SL200", `content guide reference ${sCGref.text().quote()} for service ${thisServiceId.quote()} not specified`, "unspecified content guide source")
		}
	}        

	// check <Service><ContentGuideServiceRef>
	// issues a warning if this is not a reference to another service or is a reference to self
	s=0;
	while (service=SL.get(`//${xPath(SCHEMA_PREFIX, dvbi.e_Service, ++s)}`, SL_SCHEMA)) {
		let CGSR=service.get(xPath(SCHEMA_PREFIX, dvbi.e_ContentGuideServiceRef), SL_SCHEMA);
		if (CGSR) {
			let uniqueID=service.get(xPath(SCHEMA_PREFIX, dvbi.e_UniqueIdentifier), SL_SCHEMA);
			if (!isIn(knownServices, CGSR.text())) 
				errs.pushCodeW("SL220", 
					`${dvbi.e_ContentGuideServiceRef.elementize()}=${CGSR.text().quote()}${uniqueID?(` in service ${uniqueID.text().quote()}`):""} does not refer to another service`, 
					`invalid ${dvbi.e_ContentGuideServiceRef.elementize()}`)
			if (uniqueID && (CGSR.text()==uniqueID.text()))
				errs.pushCodeW("SL221", `${dvbi.e_ContentGuideServiceRef.elementize()} is self`, `self ${dvbi.e_ContentGuideServiceRef.elementize()}`)
		}
	}

	// check <ServiceList><LCNTableList>
	let LCNtableList=SL.get(`//${xPath(SCHEMA_PREFIX, dvbi.e_LCNTableList)}`, SL_SCHEMA)
	if (LCNtableList) {
		let l=0, LCNTable
		while (LCNTable=LCNtableList.get(xPath(SCHEMA_PREFIX, dvbi.e_LCNTable, ++l), SL_SCHEMA)) {
			
			// <LCNTable><TargetRegion>
			let tr=0, TargetRegion, lastTargetRegion=""
			while (TargetRegion=LCNTable.get(xPath(SCHEMA_PREFIX, dvbi.e_TargetRegion, ++tr), SL_SCHEMA)) {
				if (!isIn(knownRegionIDs, TargetRegion.text())) 
					errs.pushCode("SL240", `${dvbi.e_TargetRegion.elementize()} ${TargetRegion.text()} in ${dvbi.e_LCNTable.elementize()} is not defined`, "undefined region")
				lastTargetRegion=TargetRegion.text();
			}
			
			// <LCNTable><SubscriptionPackage>
			checkXMLLangs(SL_SCHEMA, SCHEMA_PREFIX, dvbi.e_SubscriptionPackage, dvbi.e_LCNTable, LCNTable, errs, "SL250");
			
			// <LCNTable><LCN>
			let LCNNumbers=[], e=0, LCN
			while (LCN=LCNTable.get(xPath(SCHEMA_PREFIX, dvbi.e_LCN, ++e), SL_SCHEMA)) {
				
				// LCN@channelNumber
				if (LCN.attr(dvbi.a_channelNumber)) {
					let chanNum=LCN.attr(dvbi.a_channelNumber).value()	

					if (isIn(LCNNumbers, chanNum)) 
						errs.pushCode("SL262", `duplicated channel number ${chanNum} for ${dvbi.e_TargetRegion.elementize()} ${lastTargetRegion}`, "duplicate channel number")
					else LCNNumbers.push(chanNum);
				}

				// LCN@serviceRef
				if (LCN.attr(dvbi.a_serviceRef) && !isIn(knownServices, LCN.attr(dvbi.a_serviceRef).value())) 
					errs.pushCode("SL263", `LCN reference to unknown service ${LCN.attr(dvbi.a_serviceRef).value()}`, "LCN unknown services")
			}
		}
	}
}


/**
 * validate the service list and record any errors
 *
 * @param {String} SLtext  The service list text to be validated
 * @returns {Class} errs     Errors found in validaton
 */
module.exports.validateServiceList = function (SLtext) {
	var errs=new ErrorList()
	this.doValidateServiceList(SLtext, errs)

	return new Promise((resolve, reject) => {
		resolve(errs)
	})
}


/**
 * loads in the configuration files for the validator, loading the appropriate global variables
 * 
 * @param {boolean} useURLs if true then configuration data should be loaded from network locations otherwise, load from local files 
 */
 module.exports.loadDataFiles = function (useURLs) {
	console.log("loading classification schemes...")
    allowedGenres=[]
	loadCS(allowedGenres, useURLs, TVA_ContentCSFilename, TVA_ContentCSURL, false)
	loadCS(allowedGenres, useURLs, TVA_FormatCSFilename, TVA_FormatCSURL, false)
	loadCS(allowedGenres, useURLs, DVBI_ContentSubjectFilename, DVBI_ContentSubjectURL, false)

	loadCS(allowedPictureFormats, useURLs, TVA_PictureFormatCSFilename, TVA_PictureFormatCSURL, false)
   
    allowedServiceTypes=[]
	loadCS(allowedServiceTypes, useURLs, DVBI_ServiceTypeCSFilename, DVBI_ServiceTypeCSURL, false)

    allowedAudioSchemes=[]
	allowedAudioConformancePoints=[]
	loadCS(allowedAudioSchemes, useURLs, DVB_AudioCodecCSFilename, DVB_AudioCodecCSURL, true)
	loadCS(allowedAudioSchemes, useURLs, DVB_AudioCodecCS2020Filename, DVB_AudioCodecCS2020URL, true)  
	loadCS(allowedAudioSchemes, useURLs, MPEG7_AudioCodingFormatCSFilename, MPEG7_AudioCodingFormatCSURL, true)
	loadCS(allowedAudioConformancePoints, useURLs, DVB_AudioConformanceCSFilename, DVB_AudioConformanceCSURL, true)
	
    allowedVideoSchemes=[]
	allowedVideoConformancePoints=[]

	loadCS(allowedVideoSchemes, useURLs, DVB_VideoCodecCSFilename, DVB_VideoCodecCSURL, true)
	loadCS(allowedVideoSchemes, useURLs, DVB_VideoCodecCS2020Filename, DVB_VideoCodecCS2020URL, true)
	loadCS(allowedVideoSchemes, useURLs, MPEG7_VisualCodingFormatCSFilename, MPEG7_VisualCodingFormatCSURL, true)
	loadCS(allowedVideoConformancePoints, useURLs, DVB_VideoConformanceCSFilename, DVB_VideoConformanceCSURL, true)

	AudioPresentationCS=[]
	loadCS(AudioPresentationCS, useURLs, MPEG7_AudioPresentationCSFilename, MPEG7_AudioPresentationCSURL)

	RecordingInfoCSvalules=[];
	loadCS(RecordingInfoCSvalules, useURLs, DVBI_RecordingInfoCSFilename, DVBI_RecordingInfoCSURL);
	
	if (useURLs) 
		knownCountries.loadCountriesFromURL(ISO3166_URL, true);
	else knownCountries.loadCountriesFromFile(ISO3166_Filename, true);
	
	if (useURLs) 
		knownLanguages.loadLanguagesFromURL(IANA_Subtag_Registry_URL, true);
	else knownLanguages.loadLanguagesFromFile(IANA_Subtag_Registry_Filename, true);

	console.log("loading schemas...");
	SLschema_v1=libxml.parseXmlString(fs.readFileSync(DVBI_ServiceListSchemaFilename_v1))
    SLschema_v2=libxml.parseXmlString(fs.readFileSync(DVBI_ServiceListSchemaFilename_v2))
    SLschema_v3=libxml.parseXmlString(fs.readFileSync(DVBI_ServiceListSchemaFilename_v3))
}
