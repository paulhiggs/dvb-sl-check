// node.js - https://nodejs.org/en/
// express framework - https://expressjs.com/en/4x/api.html
const express=require("express")

/* TODO:

 - also look for TODO in the code itself
*/
const MAX_UNSIGNED_SHORT=65535, 
      MAX_UNSIGNED_INT=  4294967295,
	  MAX_UNSIGNED_LONG= 18446744073709551615
	  
const OTHER_ELEMENTS_OK="!!!"

const ErrorList=require("./dvb-common/ErrorList.js")
const dvbi=require("./dvb-common/DVB-I_definitions.js")
const tva=require("./dvb-common/TVA_definitions.js")
const {isJPEGmime, isPNGmime}=require("./dvb-common/MIME_checks.js")
const {isTAGURI}=require("./dvb-common/URI_checks.js")
const {loadCS}=require("./dvb-common/CS_handler.js")

const ISOcountries=require("./dvb-common/ISOcountries.js")
const IANAlanguages=require("./dvb-common/IANAlanguages.js")

// libxmljs - https://github.com/libxmljs/libxmljs
const libxml=require("libxmljs")

//TODO: validation against schema; package.json: 		"xmllint": "0.1.1",
//const xmllint=require("xmllint")

// morgan - https://github.com/expressjs/morgan
const morgan=require("morgan")

// file upload for express - https://github.com/richardgirges/express-fileupload
const fileupload=require("express-fileupload")


const fs=require("fs"), path=require("path")
//const request=require("request")

// command line arguments - https://github.com/75lb/command-line-args
const commandLineArgs=require('command-line-args')

var XmlHttpRequest=require("xmlhttprequest").XMLHttpRequest

const https=require("https")
const DEFAULT_HTTP_SERVICE_PORT=3010
const keyFilename=path.join(".","selfsigned.key"), certFilename=path.join(".","selfsigned.crt")

const {parse}=require("querystring")

// https://github.com/alexei/sprintf.js
var sprintf=require("sprintf-js").sprintf,
    vsprintf=require("sprintf-js").vsprintf

const TVA_ContentCSFilename=path.join("dvb-common/tva","ContentCS.xml"),
      TVA_FormatCSFilename=path.join("dvb-common/tva","FormatCS.xml"),
      TVA_PictureFormatCSFilename=path.join("dvb-common/tva","PictureFormatCS.xml"),
      DVBI_ContentSubjectFilename=path.join("dvb-common/dvbi","DVBContentSubjectCS-2019.xml"),
      DVBI_ServiceTypeCSFilename=path.join("dvb-common/dvbi","DVBServiceTypeCS-2019.xml"),
      DVB_AudioCodecCSFilename=path.join("dvb-common/dvb","AudioCodecCS.xml"),
      DVB_VideoCodecCSFilename=path.join("dvb-common/dvb","VideoCodecCS.xml"),
      MPEG7_AudioCodingFormatCSFilename=path.join("dvb-common/tva","AudioCodingFormatCS.xml"),
      MPEG7_VisualCodingFormatCSFilename=path.join("dvb-common/tva","VisualCodingFormatCS.xml"),
      DVB_AudioConformanceCSFilename=path.join("dvb-common/dvb","AudioConformancePointsCS.xml"),
      DVB_VideoConformanceCSFilename=path.join("dvb-common/dvb","VideoConformancePointsCS.xml"),
      ISO3166_Filename=path.join("dvb-common","iso3166-countries.json"),
      DVBI_RecordingInfoCSFilename=path.join("dvb-common/dvbi","DVBRecordingInfoCS-2019.xml")

// curl from https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry
const IANA_Subtag_Registry_Filename=path.join("./dvb-common","language-subtag-registry");
const IANA_Subtag_Registry_URL="https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry"

const COMMON_REPO_RAW="https://raw.githubusercontent.com/paulhiggs/dvb-common/master/",
      DVB_METADATA="https://dvb.org/metadata/",
      TVA_ContentCSURL=COMMON_REPO_RAW + "tva/" + "ContentCS.xml",
      TVA_FormatCSURL=COMMON_REPO_RAW + "tva/" + "FormatCS.xml",
      TVA_PictureFormatCSURL=COMMON_REPO_RAW + "tva/" + "PictureFormatCS.xml",
      DVBI_ContentSubjectURL=COMMON_REPO_RAW + "dvbi/" + "DVBContentSubjectCS-2019.xml",
      DVBI_ServiceTypeCSURL=COMMON_REPO_RAW + "dvbi/" + "DVBServiceTypeCS-2019.xml",
      DVB_AudioCodecCSURL=DVB_METADATA + "cs/2007/" + "AudioCodecCS.xml",
      DVB_VideoCodecCSURL=DVB_METADATA + "cs/2007/" + "VideoCodecCS.xml",
      MPEG7_AudioCodingFormatCSURL=COMMON_REPO_RAW + "tva/" + "AudioCodingFormatCS.xml",
      MPEG7_VisualCodingFormatCSURL=COMMON_REPO_RAW + "tva/" + "VisualCodingFormatCS.xml",
      DVB_AudioConformanceCSURL=DVB_METADATA + "cs/2017/" + "AudioConformancePointsCS.xml",
      DVB_VideoConformanceCSURL=DVB_METADATA + "cs/2017/" + "VideoConformancePointsCS.xml",
      ISO3166_URL=COMMON_REPO_RAW + "iso3166-countries.json",
	  DVBI_RecordingInfoCSURL=COMMON_REPO_RAW + "dvbi/" + "DVBRecordingInfoCS-2019.xml"

const SERVICE_LIST_RM="service list",
      SERVICE_RM="service",
      CONTENT_GUIDE_RM="content guide"

var allowedGenres=[], allowedServiceTypes=[], allowedAudioSchemes=[], allowedVideoSchemes=[], 
	allowedAudioConformancePoints=[], allowedVideoConformancePoints=[], RecordingInfoCSvalules=[],
	allowedPictureFormats=[]

var knownCountries=new ISOcountries(false, true)
var knownLanguages=new IANAlanguages()

/*
//TODO: validation against schema
const DVBI_ServiceListSchemaFilename_v1=path.join("schema","dvbi_v1.0.xsd");
var SLschema_v1;
const DVBI_ServiceListSchemaFilename_v2=path.join("schema","dvbi_v2.0.xsd");
var SLschema_v2;
const TVA_SchemaFilename=path.join("schema","tva_metadata_3-1.xsd");
const MPEG7_SchemaFilename=path.join("schema","tva_mpeg7.xsd");
const XML_SchemaFilename=path.join("schema","xml.xsd");
var TVAschema, MPEG7schema, XMLschema;
*/

//const allowed_arguments=["serviceList", ];

/*
 * formatters
 */
String.prototype.quote=function(using='"') {return using+this+using}
String.prototype.elementize=function() {return '<'+this+'>'}
String.prototype.attribute=function(elemName="") {return elemName+'@'+this}


const SCHEMA_v1=1,
      SCHEMA_v2=2,
	  SCHEMA_unknown= -1;
	  
/**
 * determine the schema version (and hence the specificaion version) in use 
 *
 * @param {String] namespace  The namespace used in defining the schema
 * @return {Integer} Representation of the schema version or error code if unknown 
 */
function SchemaVersion(namespace) {
	if (namespace == dvbi.A177v1_Namespace)
		return SCHEMA_v1;
	else if (namespace == dvbi.A177v2_Namespace)
		return SCHEMA_v2;

	return SCHEMA_unknown;
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
	return SCHEMA_PREFIX+":"+elementName+(index?"["+index+"]":"")
}


/**
 * determines if a value is in a set of values - simular to 
 *
 * @param {String or Array} values The set of values to check existance in
 * @param {String} value           The value to check for existance
 * @return {boolean} true if value is in the set of values
 */
function isIn(values, value){
    if (typeof(values) == "string")
        return values==value;
   
    if (typeof(values) == "object") 	
		return values.find(arrayVal => arrayVal==value)
    
    return false;
}


/**
 * check a language code and log its result
 *
 * @param {string} lang      the language to check
 * @param {string} location  the 'location' of the element containing the language value
 * @param {Object} errs      the class where errors and warnings relating to the serivce list processing are stored 
 * @param {String} errCode   the error code to be reported
 */
function checkLanguage(lang, location, errs, errCode) {
	switch (knownLanguages.isKnown(lang)) {
		case knownLanguages.languageUnknown:
			errs.pushCode(errCode?errCode+"-1":"CL001", (location?location+" ":"language ")+"value "+lang.quote()+" is invalid", "invalid language");
			break;
		case knownLanguages.languageRedundant:
			errs.pushCodeW(errCode?errCode+"-2":"CL002", (location?location+" ":"language ")+"value "+lang.quote()+" is redundant", "redundant language");
			break;	
	}
}


/* 
 * convert characters in the string to HTML entities
 *
 * @param {string} str String that should be displayed in HTML
 * @return {string} A string with ENTITY representations of < and >
 */
function HTMLize(str) {
	return str.replace(/</g,"&lt;").replace(/>/g,"&gt;");              
}


/*
//TODO: validation against schema
function loadSchema(into, schemafilename) {
	fs.readFile(schemafilename, {encoding: "utf-8"}, function(err,data){
        if (!err) {
			into=libxml.parseXmlString(data.replace(/(\r\n|\n|\r|\t)/gm,""));
		}
	});
}
*/

/**
 * loads necessary classification schemes for validation
 *
 * @param {boolean} useURLs use network locations as the source rather than local files
 */
function loadDataFiles(useURLs) {
	console.log("loading classification schemes...");
    allowedGenres=[];
	loadCS(allowedGenres, useURLs, TVA_ContentCSFilename, TVA_ContentCSURL);
	loadCS(allowedGenres, useURLs, TVA_FormatCSFilename, TVA_FormatCSURL);
	loadCS(allowedGenres, useURLs, DVBI_ContentSubjectFilename, DVBI_ContentSubjectURL);

	loadCS(allowedPictureFormats, useURLs, TVA_PictureFormatCSFilename, TVA_PictureFormatCSURL);

    
    allowedServiceTypes=[];
	loadCS(allowedServiceTypes, useURLs, DVBI_ServiceTypeCSFilename, DVBI_ServiceTypeCSURL);

    allowedAudioSchemes=[]; allowedAudioConformancePoints=[];
	loadCS(allowedAudioSchemes, useURLs, DVB_AudioCodecCSFilename, DVB_AudioCodecCSURL);
	loadCS(allowedAudioSchemes, useURLs, MPEG7_AudioCodingFormatCSFilename, MPEG7_AudioCodingFormatCSURL);
	loadCS(allowedAudioConformancePoints, useURLs, DVB_AudioConformanceCSFilename, DVB_AudioConformanceCSURL);
	
    allowedVideoSchemes=[]; allowedVideoConformancePoints=[];
	loadCS(allowedVideoSchemes, useURLs, DVB_VideoCodecCSFilename, DVB_VideoCodecCSURL);
	loadCS(allowedVideoSchemes, useURLs, MPEG7_VisualCodingFormatCSFilename, MPEG7_VisualCodingFormatCSURL);
	loadCS(allowedVideoConformancePoints, useURLs, DVB_VideoConformanceCSFilename, DVB_VideoConformanceCSURL);

	RecordingInfoCSvalules=[];
	loadCS(RecordingInfoCSvalules, useURLs, DVBI_RecordingInfoCSFilename, DVBI_RecordingInfoCSURL);
	
	if (useURLs) 
		knownCountries.loadCountriesFromURL(ISO3166_URL, true);
	else knownCountries.loadCountriesFromFile(ISO3166_Filename, true);
	
	if (useURLs) 
		knownLanguages.loadLanguagesFromURL(IANA_Subtag_Registry_URL, true);
	else knownLanguages.loadLanguagesFromFile(IANA_Subtag_Registry_Filename, true);
/*
//TODO: validation against schema
	console.log("loading schemas...");
	//loadSchema(SLschema_v1, DVBI_ServiceListSchemaFilename_v1);
	//loadSchema(SLschema_v2, DVBI_ServiceListSchemaFilename_v2);

    SLschema_v1=fs.readFileSync(DVBI_ServiceListSchemaFilename_v1);
    SLschema_v2=fs.readFileSync(DVBI_ServiceListSchemaFilename_v2);
    TVAschema=fs.readFileSync(TVA_SchemaFilename);
    MPEG7schema=fs.readFileSync(MPEG7_SchemaFilename);
    XMLschema=fs.readFileSync(XML_SchemaFilename);
*/
}


/** 
 * determines if the identifer provided complies with the requirements for a service identifier
 * at this stage only IETF RFC 4151 TAG URIs are permitted
 *
 * @param {String} identifier  The service identifier
 * @return {boolean} true if the service identifier complies with the specification otherwise false
 */ 
function validServiceIdentifier(identifier){
    return isTAGURI(identifier);
}


/** 
 * determines if the identifer provided is unique against a list of known identifiers
 *
 * @param {String} identifier  The service identifier
 * @param (Array} identifiers  The list of known service identifiers
 * @return {boolean} true if the service identifier is unique otherwise false
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
	checkTopElements(SL_SCHEMA, SCHEMA_PREFIX, Region, [], [dvbi.e_RegionName, dvbi.e_Postcode, dvbi.e_WildcardPostcode, dvbi.e_PostcodeRange, dvbi.e_Coordinates, dvbi.e_Region], errs, "AR001")
	checkAttributes(Region, [dvbi.a_regionID], [dvbi.a_countryCodes], errs, "AR002")

    var regionID=Region.attr(dvbi.a_regionID)?Region.attr(dvbi.a_regionID).value():"";
    var countryCodeSpecified=Region.attr(dvbi.a_countryCodes);
	if (regionID!="") {
		if (isIn(knownRegionIDs, regionID)) 
			errs.pushCode("AR003", "Duplicate "+dvbi.a_regionId.attribute()+" "+regionID.quote(), "duplicate regionID");
		else knownRegionIDs.push(regionID);
	}
    if ((depth!=0) && countryCodeSpecified) 
        errs.pushCode("AR004", dvbi.a_countryCodes.attribute(Region.name())+" not permitted for sub-region "+regionID.quote(), "ccode in subRegion");

    if (countryCodeSpecified) {
        var countries=countryCodeSpecified.value().split(",");
        if (countries) countries.forEach(country => {
            if (!knownCountries.isISO3166code(country)) 
                errs.pushCode("AR005", "invalid country code ("+country+") for region "+regionID.quote(), "invalid country code");
        });
    }

    if (depth > dvbi.MAX_SUBREGION_LEVELS) 
        errs.pushCode("AR006", dvbi.e_Region.elementize()+" depth exceeded (>"+dvbi.MAX_SUBREGION_LEVELS+") for sub-region "+regionID.quote(), "region depth exceeded");

    var i=0, RegionChild;
    while ((RegionChild=Region.child(i++)) != null) 
        if (RegionChild.type()==="element" && RegionChild.name()==dvbi.e_Region)      // its a child Region
            addRegion(SL_SCHEMA, SCHEMA_PREFIX, RegionChild, depth+1, knownRegionIDs, errs);
}


/** 
 * determines if the identifer provided refers to a valid application launching method
 *
 * @param {String} HowRelated  The service identifier
 * @return {boolean} true if this is a valid application launching method else false
 */
function validServiceApplication(HowRelated) {
    // return true if val is a valid CS value for Service Related Applications (A177 5.2.3)
    // urn:dvb:metadata:cs:LinkedApplicationCS:2019
    var val=HowRelated.attr(dvbi.a_href)?HowRelated.attr(dvbi.a_href).value():null;
    return val==dvbi.APP_IN_PARALLEL
        || val==dvbi.APP_IN_CONTROL
        || val==dvbi.APP_OUTSIDE_AVAILABILITY;
}


/** 
 * determines if the identifer provided refers to a valid DASH media type (single MPD or MPD playlist)
 *
 * @param {String} contentType  The contentType for the file
 * @return {boolean} true if this is a valid MPD or playlist identifier
 */
function validDASHcontentType(contentType) {
    // per A177 clause 5.2.7.2
    return contentType==dvbi.CONTENT_TYPE_DASH_MPD   
        || contentType==dvbi.CONTENT_TYPE_DVB_PLAYLIST;
}


/** 
 * determines if the identifer provided refers to a valid banner for out-of-servce-hours presentation
 *
 * @param {String} HowRelated  The banner identifier
 * @param {String} namespace   The namespace being used in the XML document
 * @return {boolean} true if this is a valid banner for out-of-servce-hours presentation else false
 */
function validOutScheduleHours(HowRelated, namespace) {
    // return true if val is a valid CS value for Out of Service Banners (A177 5.2.5.3)
    var val=HowRelated.attr(dvbi.a_href)?HowRelated.attr(dvbi.a_href).value():null;
    return (SchemaVersion(namespace)==SCHEMA_v1 && val==dvbi.BANNER_OUTSIDE_AVAILABILITY_v1)
		|| (SchemaVersion(namespace)==SCHEMA_v2 && val==dvbi.BANNER_OUTSIDE_AVAILABILITY_v2);
}


/** 
 * determines if the identifer provided refers to a valid banner for content-finished presentation
 *
 * @since DVB A177v2
 * @param {String} HowRelated  The banner identifier
 * @param {String} namespace   The namespace being used in the XML document
 * @return {boolean} true if this is a valid banner for content-finished presentation else false
 */
function validContentFinishedBanner(HowRelated, namespace) {
    // return true if val is a valid CS value for Content Finished Banner (A177 5.2.7.3)
    var val=HowRelated.attr(dvbi.a_href)?HowRelated.attr(dvbi.a_href).value():null;
    return (SchemaVersion(namespace)==SCHEMA_v2 && val==dvbi.BANNER_CONTENT_FINISHED_v2);
}


/** 
 * determines if the identifer provided refers to a valid service list logo
 *
 * @param {String} HowRelated  The logo identifier
 * @param {String} namespace   The namespace being used in the XML document
 * @return {boolean} true if this is a valid logo for a service list else false
 */
function validServiceListLogo(HowRelated, namespace) {
    // return true if val is a valid CS value Service List Logo (A177 5.2.6.1)
    var val=HowRelated.attr(dvbi.a_href)?HowRelated.attr(dvbi.a_href).value():null;
	return (SchemaVersion(namespace)==SCHEMA_v1 && val==dvbi.LOGO_SERVICE_LIST_v1)
		|| (SchemaVersion(namespace)==SCHEMA_v2 && val==dvbi.LOGO_SERVICE_LIST_v2);
}


/** 
 * determines if the identifer provided refers to a valid service logo
 *
 * @param {String} HowRelated  The logo identifier
 * @param {String} namespace   The namespace being used in the XML document
 * @return {boolean} true if this is a valid logo for a service  else false
 */
function validServiceLogo(HowRelated, namespace) {
    // return true if val is a valid CS value Service Logo (A177 5.2.6.2)
	var val=HowRelated.attr(dvbi.a_href)?HowRelated.attr(dvbi.a_href).value():null;
    return (SchemaVersion(namespace)==SCHEMA_v1 && val==dvbi.LOGO_SERVICE_v1)
		|| (SchemaVersion(namespace)==SCHEMA_v2 && val==dvbi.LOGO_SERVICE_v2);
}


/** 
 * determines if the identifer provided refers to a valid content guide source logo
 *
 * @param {String} HowRelated  The logo identifier
 * @param {String} namespace   The namespace being used in the XML document
 * @return {boolean} true if this is a valid logo for a content guide source else false
 */
function validContentGuideSourceLogo(HowRelated, namespace) {
    // return true if val is a valid CS value Service Logo (A177 5.2.6.3)
    var val=HowRelated.attr(dvbi.a_href)?HowRelated.attr(dvbi.a_href).value():null;
    return (SchemaVersion(namespace)==SCHEMA_v1 && val==dvbi.LOGO_CG_PROVIDER_v1)
		|| (SchemaVersion(namespace)==SCHEMA_v2 && val==dvbi.LOGO_CG_PROVIDER_v2);
}


/**
 * check if the argument is in the correct format for an DVB-I extension identifier
 *
 * @param {string} ext  the signalled extensionName
 * @returns {boolean} true if the signalled extensionName is in the specification defined format, else false
 */
function validExtensionName(ext) {
	const ExtensionRegex=/[A-Za-z\d][A-Za-z\d:\-/\.]*[A-Za-z\d]/g;
    var s=ext.match(ExtensionRegex);
    return s?s[0]===ext:false;
}


/**
 * check if the argument is in the correct format for a TV-Anytime FrameRateType
 *    <pattern value="([0-9]{1,3}(.[0-9]{1,3})?)|([0-9]{1,3}/1.001)"/>
 *
 * @param {string} str  the signalled frameRate
 * @returns {boolean} true if the signalled frameRate is a valid TV-Anytime FrameRateType, else false
 */
function validFrameRate(str) {
	const FrameRateRegex1=/\d{1,3}(\.\d{1,3})?/;
	const FrameRateRegex2=/\d{1,3}\/1\.001/;
	var s1=str.match(FrameRateRegex1), s2=str.match(FrameRateRegex2)
	
	return ((s2 && s2[0]===str) || (s1 && s1[0]===str))
}


/**
 * verifies if the specified logo is valid according to specification
 *
 * @param {Object} HowRelated    The <HowRelated> subelement (a libxmls ojbect tree) of the <RelatedMaterial> element
 * @param {Object} Format        The <Format> subelement (a libxmls ojbect tree) of the <RelatedMaterial> element
 * @param {Object} MediaLocator  The <MediaLocator> subelement (a libxmls ojbect tree) of the <RelatedMaterial> element
 * @param {Object} errs          The class where errors and warnings relating to the serivce list processing are stored 
 * @param {string} Location      The printable name used to indicate the location of the <RelatedMaterial> element being checked. used for error reporting
 * @param {string} LocationType  The type of element containing the <RelatedMaterial> element. Different validation rules apply to different location types
*/
function checkValidLogo(HowRelated, Format, MediaLocator, errs, Location, LocationType) {
    // irrespective of the HowRelated@href, all logos have specific requirements
    if (!HowRelated)
        return;

    var isJPEG=false, isPNG=false;    
    // if <Format> is specified, then it must be per A177 5.2.6.1, 5.2.6.2 or 5.2.6.3 -- which are all the same
    if (Format) {
        var subElems=Format.childNodes(), hasStillPictureFormat=false;
        if (subElems) subElems.forEach(child => {
            if (child.name()==dvbi.e_StillPictureFormat) {
                hasStillPictureFormat=true;
				checkAttributes(child, [dvbi.a_href], [dvbi.a_horizontalSize, dvbi.a_verticalSize], errs, "VL015")
                if (!child.attr(dvbi.a_horizontalSize)) 
                    errs.pushCode("VL010", dvbi.a_horizontalSize.attribute()+" not specified for "+tva.e_RelatedMaterial.elementize()+tva.e_Format.elementize()+dvbi.e_StillPictureFormat.elementize()+" in "+Location, "no "+dvbi.a_horizontalSize.attribute());
                if (!child.attr(dvbi.a_verticalSize)) 
                    errs.pushCode("VL011", dvbi.a_verticalSize.attribute()+" not specified for "+tva.e_RelatedMaterial.elementize()+tva.e_Format.elementize()+dvbi.e_StillPictureFormat.elementize()+" in "+Location, "no "+dvbi.a_verticalSize.attribute());
                if (child.attr(dvbi.a_href)) {
                    var href=child.attr(dvbi.a_href).value();
					switch (href) {
						case dvbi.JPEG_IMAGE_CS_VALUE:
							isJPEG=true
							break
						case dvbi.PNG_IMAGE_CS_VALUE:
							isPNG=true
							break
						default:
							InvalidHrefValue(errs, href, tva.e_RelatedMaterial.elementize()+tva.e_Format.elementize()+dvbi.e_StillPictureFormat.elementize(), Location, "VL012")
					}
    /*              if (href!=dvbi.JPEG_IMAGE_CS_VALUE && href!=dvbi.PNG_IMAGE_CS_VALUE)
						InvalidHrefValue(errs, href, tva.e_RelatedMaterial.elementize()+tva.e_Format.elementize()+dvbi.e_StillPictureFormat.elementize(), Location, "VL012")
                    if (href == dvbi.JPEG_IMAGE_CS_VALUE) isJPEG=true;
                    if (href == dvbi.PNG_IMAGE_CS_VALUE) isPNG=true; */
                } 
            }
        });
        if (!hasStillPictureFormat) 
            errs.pushCode("VL014", dvbi.e_StillPictureFormat.elementize()+" not specified for "+tva.e_Format.elementize()+" in "+Location, "no StillPictureFormat");
    }

    if (MediaLocator) {
        var subElems=MediaLocator.childNodes(), hasMediaURI=false;
        if (subElems) subElems.forEach(child => {
            if (child.name()==tva.e_MediaUri) {
                hasMediaURI=true;
                if (child.attr(dvbi.a_contentType)) {
                   var contentType=child.attr(dvbi.a_contentType).value();
                    if (!isJPEGmime(contentType) && !isPNGmime(contentType))
                        errs.pushCode("VL022", "invalid "+dvbi.a_contentType.attribute()+" "+contentType.quote()+" specified for "+tva.e_RelatedMaterial.elementize()+tva.e_MediaLocator.elementize()+" in "+Location, "invalid "+dvbi.a_contentType.attribute(tva.e_MediaUri));
                    if (Format && ((isJPEGmime(contentType) && !isJPEG) || (isPNGmime(contentType) && !isPNG))) 
                        errs.pushCode("VL023", "conflicting media types in "+tva.e_Format.elementize()+" and "+tva.e_MediaUri.elementize()+" for "+Location, "conflicting mime types");					
				}
				else
                    errs.pushCode("VL021", dvbi.a_contentType.attribute()+" not specified for logo "+tva.e_MediaUri.elementize()+" in "+Location, "unspecified "+dvbi.a_contentType.attribute(tva.e_MediaUri));
            }
        });
        if (!hasMediaURI) 
			NoMediaLocator(errs, "logo", Location, "VL024");
    }
    else 
        errs.pushCode("VL025", tva.e_MediaLocator+" not specified for "+tva.e_RelatedMaterial.elementize()+" in "+Location, "no "+tva.e_MediaLocator);
}


/**
 * verifies if the specified application is valid according to specification
 *
 * @param {Object} HowRelated    The <HowRelated> subelement (a libxmls ojbect tree) of the <RelatedMaterial> element
 * @param {Object} Format        The <Format> subelement (a libxmls ojbect tree) of the <RelatedMaterial> element
 * @param {Object} MediaLocator  The <MediaLocator> subelement (a libxmls ojbect tree) of the <RelatedMaterial> element
 * @param {Object} errs          The class where errors and warnings relating to the serivce list processing are stored 
 * @param {string} Location      The printable name used to indicate the location of the <RelatedMaterial> element being checked. used for error reporting
 * @param {string} LocationType  The type of element containing the <RelatedMaterial> element. Different validation rules apply to different location types
 */
function checkSignalledApplication(HowRelated, Format, MediaLocator, errs, Location, LocationType) {
	
	function validApplicationType(val) {
		return val==dvbi.XML_AIT_CONTENT_TYPE || val==dvbi.HTML5_APP || val==dvbi.XHTML_APP
	}
	
    if (MediaLocator) {
        var subElems=MediaLocator.childNodes(), hasMediaURI=false;
        if (subElems) subElems.forEach(child => {
            if (child.name()==tva.e_MediaUri) {
                hasMediaURI=true;
                if (child.attr(dvbi.a_contentType)) {
					if (!validApplicationType(child.attr(dvbi.a_contentType).value)) 
                        errs.pushCodeW("SA003", dvbi.a_contentType.attribute()+" "+child.attr(dvbi.a_contentType).value().quote()+" is not DVB AIT for "+tva.e_RelatedMaterial.elementize()+tva.e_MediaLocator.elementize()+" in "+Location, "invalid "+dvbi.a_contentType.attribute(tva.e_MediaUri));
				}
				else errs.pushCode("SA002", dvbi.a_contentType.attribute()+" not specified for "+tva.e_MediaUri.elementize()+" in "+Location, "unspecified "+dvbi.a_contentType.attribute(tva.e_MediaUri));
            }
        });
        if (!hasMediaURI) 
			NoMediaLocator(errs, "application", Location, "SA004");
    }
	else
		NoMediaLocator(errs, "application", Location, "SA001");
}


/**
 * verifies if the specified RelatedMaterial element is valid according to specification (contents and location)
 *
 * @param {Object} RelatedMaterial   The <RelatedMaterial> element (a libxmls ojbect tree) to be checked
 * @param {Object} errs              The class where errors and warnings relating to the serivce list processing are stored 
 * @param {string} Location          The printable name used to indicate the location of the <RelatedMaterial> element being checked. used for error reporting
 * @param {string} LocationType      The type of element containing the <RelatedMaterial> element. Different validation rules apply to different location types
 * @param {string} SCHEMA_NAMESPACE  The namespace of XML document
 */
function validateRelatedMaterial(RelatedMaterial, errs, Location, LocationType, SCHEMA_NAMESPACE) {
	if (!RelatedMaterial) {
		errs.pushCode("RM000", "validateRelatedMaterial() called with RelatedMaterial==null", "invalid args")
		return;
	}
	
    var HowRelated=null, Format=null, MediaLocator=[];
    var elem=RelatedMaterial.child(0);
    while (elem) {
        if (elem.name()===tva.e_HowRelated)
            HowRelated=elem;
        else if (elem.name()===tva.e_Format)
            Format=elem;
        else if (elem.name()===tva.e_MediaLocator)
            MediaLocator.push(elem);

        elem=elem.nextElement();
    }

    if (!HowRelated) {
        errs.pushCode("RM001", tva.e_HowRelated.elementize()+" not specified for "+tva.e_RelatedMaterial.elementize()+" in "+Location, "no "+tva.e_HowRelated);
		return;
    }
	checkAttributes(HowRelated, [dvbi.a_href], [], errs, "RM002")

	if (HowRelated.attr(dvbi.a_href)) {
		
		switch (LocationType) {
			case SERVICE_LIST_RM: 
				if (validServiceListLogo(HowRelated,SCHEMA_NAMESPACE)) 
					MediaLocator.forEach(locator => 
						checkValidLogo(HowRelated, Format, locator, errs, Location, LocationType));
				else
					InvalidHrefValue(errs, HowRelated.attr(dvbi.a_href).value(), tva.e_RelatedMaterial.elementize(), Location, "RM010")	
				break;
			case SERVICE_RM:
				if (validContentFinishedBanner(HowRelated, SCHEMA_NAMESPACE) && (SchemaVersion(SCHEMA_NAMESPACE) == SCHEMA_v1)) 
					errs.pushCode("RM020", dvbi.BANNER_CONTENT_FINISHED_v2.quote()+" not permitted for "+SCHEMA_NAMESPACE.quote()+" in "+Location, "invalid CS value");
				
				if (validOutScheduleHours(HowRelated, SCHEMA_NAMESPACE) || validContentFinishedBanner(HowRelated, SCHEMA_NAMESPACE) ||validServiceApplication(HowRelated) || validServiceLogo(HowRelated, SCHEMA_NAMESPACE)) {
					if (validServiceLogo(HowRelated, SCHEMA_NAMESPACE) || validOutScheduleHours(HowRelated, SCHEMA_NAMESPACE))
						MediaLocator.forEach(locator =>
							checkValidLogo(HowRelated, Format, locator, errs, Location, LocationType));
					if (validServiceApplication(HowRelated))
						MediaLocator.forEach(locator =>
							checkSignalledApplication(HowRelated, Format, locator, errs, Location, LocationType));
				}
				else
					InvalidHrefValue(errs, HowRelated.attr(dvbi.a_href).value(), tva.e_RelatedMaterial.elementize(), Location, "RM021");
				break;
			case CONTENT_GUIDE_RM:
				if (validContentGuideSourceLogo(HowRelated, SCHEMA_NAMESPACE)) 
					MediaLocator.forEach(locator =>
						checkValidLogo(HowRelated, Format, locator, errs, Location, LocationType));
				else
					InvalidHrefValue(errs, HowRelated.attr(dvbi.a_href).value(), tva.e_RelatedMaterial.elementize(), Location, "RM030")
				break;
		}
	}
}


/**
 * checks that all the @xml:lang values for an element are unique
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
		errs.pushCode(errCode?errCode+"-0":"XL000", "checkXMLLangs() called with node==null", "invalid args")
		return;
	}
    var elementLanguages=[], i=0, elem;
    while (elem=node.get(xPath(SCHEMA_PREFIX, elementName, ++i), SL_SCHEMA)) {
		var lang=elem.attr(dvbi.a_lang)?elem.attr(dvbi.a_lang).value():"unspecified";
        if (isIn(elementLanguages, lang)) 
            errs.pushCode(errCode?errCode+"-1":"XL001", "xml:lang="+lang.quote()+" already specifed for "+elementName.elementize()+" for "+elementLocation, "duplicate @xml:lang");
        else elementLanguages.push(lang);

        //if lang is specified, validate the format and value of the attribute against BCP47 (RFC 5646)
		if (lang!="unspecified") 
			checkLanguage(lang, "xml:lang", errs, errCode?errCode+"-2":"XL002")
    }
}


/**
 * checks of the object provided is empty, either contains no values or properties
 *
 * @param {Object} obj  The item (array, string, object) to be checked
 * @returns {boolean} true if the object being checked is empty
 */
function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}


// TODO:
function isURL(arg) {
	return true;
}

/**
 * checks of the specified argument matches an RTSP URL
 *  <restriction base="anyURI"><pattern value="rtsp://.*"/></restriction>
 *
 * @param {string} arg  The value whose format is to be checked
 * @returns {boolean} true if the argument is an RTSP URL
 */
function isRTSPURL(arg) {
	if (!(arg && isURL(arg))) return false;
    var s=arg.match(/rtsp:\/\/.*/g);
    return s?s[0]===arg:false;	
}

/**
 * determine if the value provided represents a valid unsignedShort (between 0 and 65535)
 *
 * @param {String}  Value a string containing a integer
 * @returns {boolean} true if the argument represents a positiveInteger - https://www.w3.org/TR/xmlschema-2/#unsignedShort
 */
function isUnsignedShort(arg){
	if (!arg || arg=="") return false;
	var val=parseInt(arg);
	return !(isNaN(val) || val<0 || val>MAX_UNSIGNED_SHORT)
}
/*function isUnsignedShort(value) {
	var x=Number(value);
	if (isNaN(x)) return false
	return (x>=0 && x<=MAX_UNSIGNED_SHORT)
}*/


/**
 * determine if the value provided represents a valid nonNegativeInteger 
 *
 * @param {String}  Value a string containing a integer
 * @returns {boolean} true if the argument represents a positiveInteger - https://www.w3.org/TR/xmlschema-2/#unsignedShort
 */
function isNonNegativeInteger(arg) {
	if (!arg || arg=="") return false;
    var s=arg.match(/\d+/g);
    return s?s[0]===arg:false;	
}


/**
 * determine if the value provided represents a valid positiveInteger (greater than or equal to 1)
 *
 * @param {String}  Value a string containing a integer
 * @returns {boolean} true if the argument represents a positiveInteger - https://www.w3.org/TR/xmlschema-2/#positiveInteger
 */
function isPositiveInteger(value) {
	var x=Number(value);
	if (isNaN(x)) return false
	return (x >= 1)
}


/**
 * determine if the value provided represents a valid unsignedInteger
 *
 * @param {String}  Value a string containing a integer
 * @returns {boolean} true if the argument represents a positiveInteger - https://www.w3.org/TR/xmlschema-2/#unsignedInt
 */
function isUnsignedInt(arg) {
	if (!arg || arg=="") return false;
	var val=parseInt(arg);
	return !(isNaN(val) || val<0 || val>MAX_UNSIGNED_INT)
}


/**
 * determine if the value provided represents a valid unsignedLong
 *
 * @param {String}  Value a string containing a integer
 * @returns {boolean} true if the argument represents a positiveInteger - https://www.w3.org/TR/xmlschema-2/#unsignedInt
 */
function isUnsignedLong(arg) {
	if (!arg || arg=="") return false;
	var val=parseInt(arg);
	return !(isNaN(val) || val<0 || val>MAX_UNSIGNED_LONG)
}


/**
 * constructs HTML output of the errors found in the service list analysis
 *
 * @param {boolean} URLmode    If true ask for a URL to a service list, if false ask for a file
 * @param {Object}  res        The Express result 
 * @param {string}  lastInput  The url of the service list - used to keep the form intact
 * @param {string}  error      a single error message to display on the form, genrrally related to loading the content to validate
 * @param {Object}  errors     the errors and warnings found during the content guide validation
 */
function drawForm(URLmode, res, lastInput=null, error=null, errors=null) {
	
	const FORM_TOP="<html><head><title>DVB-I Service List Validator</title></head><body>";

	const PAGE_HEADING="<h1>DVB-I Service List Validator</h1>";
	const ENTRY_FORM_URL="<form method=\"post\"><p><i>URL:</i></p><input type=\"url\" name=\"SLurl\" value=\"%s\"><input type=\"submit\" value=\"submit\"></form>";

	const ENTRY_FORM_FILE="<form method=\"post\" encType=\"multipart/form-data\"><p><i>FILE:</i></p><input type=\"file\" name=\"SLfile\" value=\"%s\"><input type=\"submit\" value=\"submit\"></form>";

	const RESULT_WITH_INSTRUCTION="<br><p><i>Results:</i></p>";
	const SUMMARY_FORM_HEADER="<table><tr><th>item</th><th>count</th></tr>";
	const FORM_BOTTOM="</body></html>";
	
    res.write(FORM_TOP);    
    res.write(PAGE_HEADING);    
    if (URLmode) 
		res.write(sprintf(ENTRY_FORM_URL, lastInput ? lastInput : ""));
	else res.write(sprintf(ENTRY_FORM_FILE, lastInput ? lastInput : ""));

    res.write(RESULT_WITH_INSTRUCTION);

	if (error) 
		res.write("<p>"+error+"</p>");
	var resultsShown=false;
	if (errors) {
		var tableHeader=false;
		for (var i in errors.counts) {
			if (errors.counts[i]!=0) {
				if (!tableHeader) {
					res.write(SUMMARY_FORM_HEADER);
					tableHeader=true;
				}
				res.write("<tr><td>"+HTMLize(i)+"</td><td>"+errors.counts[i]+"</td></tr>");
				resultsShown=true;
			}
		}
		for (var i in errors.countsWarn) {
			if (errors.countsWarn[i]!=0) {
				if (!tableHeader) {
					res.write(SUMMARY_FORM_HEADER);
					tableHeader=true;
				}
				res.write("<tr><td><i>"+HTMLize(i)+"</i></td><td>"+errors.countsWarn[i]+"</td></tr>");
				resultsShown=true;
			}
		}
		if (tableHeader) res.write("</table>");

		tableHeader=false;
		errors.messages.forEach(function(value) {
			if (!tableHeader) {
				res.write("<table><tr><th>code</th><th>errors</th></tr>");
				tableHeader=true;                    
			}
			var t=value.replace(/</g,"&lt;").replace(/>/g,"&gt;");
			if (value.includes(errors.delim)) {
				var x=value.split(errors.delim);
				res.write("<tr><td>"+x[0]+"</td><td>"+HTMLize(x[1])+"</td></tr>");	
			}
			else 
				res.write("<tr><td></td><td>"+HTMLize(t)+"</td></tr>");
			resultsShown=true;
		});
		if (tableHeader) res.write("</table>");
		
		tableHeader=false;
		errors.messagesWarn.forEach(function(value) {
			if (!tableHeader) {
				res.write("<table><tr><th>code</th><th>warnings</th></tr>");
				tableHeader=true;                    
			}
			var t=value.replace(/</g,"&lt;").replace(/>/g,"&gt;");
			if (value.includes(errors.delim)) {
				var x=value.split(errors.delim);
				res.write("<tr><td>"+x[0]+"</td><td>"+HTMLize(x[1])+"</td></tr>");	
			}
			else 
				res.write("<tr><td></td><td>"+HTMLize(t)+"</td></tr>");

			resultsShown=true;
		});
		if (tableHeader) res.write("</table>");        
	}
	if (!error && !resultsShown) res.write("no errors or warnings");
	
    res.write(FORM_BOTTOM);        
}


/**
 * Add an error message for missing <xxxDeliveryParameters>
 *
 * @param {Object} errs       Errors buffer
 * @param {String} source     The missing source type
 * @param {String} serviceId  The serviceId whose instance is missing delivery parameters
 * @param {String} errCode    The error code to be reported
 */
function NoDeliveryParams(errs, source, serviceId, errCode=null) {
    errs.pushCode(errCode?errCode:"XX101", source+" delivery parameters not specified for service instance in service "+serviceId.quote(), "no delivery params");
}


/**
 * Add an error message when the @href contains an invalid value
 *
 * @param {Object} errs     Errors buffer
 * @param {String} value    The invalid value for the href attribute
 * @param {String} src      The element missing the @href
 * @param {String} loc      The location of the element
 * @param {String} errCode  The error code to be reported
 */
function InvalidHrefValue(errs, value, src, loc, errCode=null) {
	errs.pushCode(errCode?errCode:"XX103", "invalid "+dvbi.a_href.attribute()+"="+value.quote()+" specified for "+src+" in "+loc, "invalid href");
}


/**
 * Add an error message an incorrect country code is specified in transmission parameters
 *
 * @param {Object} errs     Errors buffer
 * @param {String} value    The invalid country code
 * @param {String} src      The transmission mechanism
 * @param {String} loc      The location of the element
 * @param {String} errCode  The error code to be reported
 */
function InvalidCountryCode(errs, value, src, loc, errCode=null) {
	errs.pushCode(errCode?errCode:"XX104", "invalid country code ("+value+") for "+src+" parameters in "+loc, "invalid country code");
}


/**
 * Add an error message an unspecifed target region is used
 *
 * @param {Object} errs     Errors buffer
 * @param {String} region   The unspecified target region
 * @param {String} loc      The location of the element
 * @param {String} errCode  The error code to be reported
 */
function UnspecifiedTargetRegion(errs, region, loc, errCode=null) {
	errs.pushCode(errCode?errCode:"XX105", loc+" has an unspecified "+dvbi.e_TargetRegion.elementize()+region, "target region");	
}


/**
 * Add an error message when the MediaLocator does not contain a MediaUri sub-element
 *
 * @param {Object} errs     Errors buffer
 * @param {String} src      The type of element with the <MediaLocator>
 * @param {String} loc      The location of the element
 * @param {String} errCode  The error code to be reported
 */
function NoMediaLocator(errs, src, loc, errCode=null) {
	errs.pushCode(errCode?errCode:"XX106", tva.e_MediaUri.elementize()+" not specified for "+src+" "+tva.e_MediaLocator.elementize()+" in "+loc, "no "+tva.e_MediaUri);
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
	var i=0, elem;
    while (elem=node.get(xPath(SCHEMA_PREFIX, tva.e_RelatedMaterial, ++i), SL_SCHEMA)) {
        var hr=elem.get(xPath(SCHEMA_PREFIX, tva.e_HowRelated), SL_SCHEMA);
		if (hr && validServiceApplication(hr)) 
			return true;			
    }
    return false;
}


/**
 * check that the specified child elements are in the parent element
 *
 * @param {string} SL_SCHEMA              Used when constructing Xpath queries
 * @param {string} SCHEMA_PREFIX          Used when constructing Xpath queries
 * @param {Object} elem                   the element whose children should be checked
 * @param {Array}  mandatoryChildElements the names of elements that are required within the element
 * @param {Array}  optionalChildElements  the names of elements that are optional within the element
 * @param {Class}  errs                   errors found in validaton
 * @param {string} errCode                error code to be used for any error found 
 * @returns {boolean} true if no errors are found (all mandatory elements are present and no extra elements are specified)
 */
function checkTopElements(SL_SCHEMA, SCHEMA_PREFIX, elem, mandatoryChildElements, optionalChildElements, errs, errCode=null) {
	if (!elem) {
		errs.pushCode(errCode?errCode+"-0":"TE000", "checkTopElements() called with a 'null' element to check");
		return false;
	}
	var initialErrorCount=errs.length, 
		thisElem=((typeof elem.parent().name === 'function')?elem.parent().name().elementize():"")+elem.name().elementize();
	
	// check that each of the specifid childElements exists
	mandatoryChildElements.forEach(elemS => {
		if (!elem.get(xPath(SCHEMA_PREFIX, elemS), SL_SCHEMA)) 
			errs.pushCode(errCode?errCode+"-1":"TE010", "Mandatory element "+elemS.elementize()+" not specified in "+thisElem);
	});
	
	// check that no additional child elements existance if the "Other Child Elements are OK" flag is not set
	if (!isIn(optionalChildElements, OTHER_ELEMENTS_OK)) {
		var c=0, child;
		while (child=elem.child(c++)) {
			var childName=child.name();
			if (child.type()=='element')
				if (!isIn(mandatoryChildElements, childName) && !isIn(optionalChildElements, childName)) 		
					errs.pushCode(errCode?errCode+"-2":"TE011", "Element "+childName.elementize()+" is not permitted in "+thisElem);
		}
	}
	return errs.length==initialErrorCount;
}


/**
 * check that the specified child elements are in the parent element with the correct cardinality and order
 *
 * @param {string} SL_SCHEMA      Used when constructing Xpath queries
 * @param {string} SCHEMA_PREFIX  Used when constructing Xpath queries
 * @param {Object} elem           The element whose children should be checked
 * @param {Array}  childElements  An 'ordered' array of objects {name, minoccurs, maxoccurs} representing the child elements
 * @param {Class}  errs           Errors found in validaton
 * @param {string} errCode        Error code to be used for any error found 
 * @returns {boolean} true if no errors are found (all mandatory elements are present and no extra elements are specified)
 */
const UNBOUNDED=65535
function checkTopElements2(SL_SCHEMA, SCHEMA_PREFIX, elem, childElements, errs, errCode=null) {
	
	function countSubElements(SL_SCHEMA, SCHEMA_PREFIX, elem, subElementName) {
		var count=0, i=0, se;
		while (se=elem.child(i++))
			if (se.name()==subElementName)
				count++;
		return count;
	}	
	
	if (!elem) {
		errs.pushCode(errCode?errCode+"-0":"te000", "checkTopElements() called with a 'null' element to check");
		return false;
	}
	var initialErrorCount=errs.length;
	var thisElemLabel=((typeof elem.parent().name === 'function')?elem.parent().name().elementize():"")+elem.name().elementize();
	var allowAny=false, // true if any 'xs:any' is permitted
	    allowedChildren=[]; // the element names passed to the function

	// first,  check the 'counts'
	childElements.forEach( elemS => {
		if (elemS.name==OTHER_ELEMENTS_OK)
			allowAny=true
		else {
			allowedChildren.push(elemS.name)
			var count=countSubElements(SL_SCHEMA, SCHEMA_PREFIX, elem, elemS.name)
			
			if (count==0 && elemS.minoccurs>0)
				errs.pushCode(errCode?errCode+"-1":"te001", "Mandatory element "+elemS.name.elementize()+" is not specified in "+thisElemLabel, 'missing element');
			else if (count < elemS.minoccurs || count > elemS.maxoccurs)
				errs.pushCode(errCode?errCode+"-2":"te002", "Cardinality error for "+(elem.name()+"."+elemS.name).elementize()+", require "+elemS.minoccurs+"-"+elemS.maxoccurs+", found "+count, "excess elements")
		}
	})
	
	// second, check for any 'additional' elements 
	if (!allowAny) {  // if xs:any is specified, then no point checking for additional elements
		var c=0, child;
		while (child=elem.child(c++)) {
			if (child.type()=='element') 
				if (!isIn(allowedChildren, child.name()))
					errs.pushCode(errCode?errCode+"-3":"te003", "Element "+child.name().elementize()+" is not permitted in "+thisElem, "extra element");
		}
	}
	
	// third, check the order of the elements
	var foundElements=[], c=0, child;
	while (child=elem.child(c++)) {
		if (child.type()=='element')
			foundElements.push(child.name())
	}

	var kpos=0, // this is the current element we are looking for in the ordered list (childElements[kpos].name))
	    fpos=0; // this is the element we are looking at in the found list (foundElems[fpos])

	while (kpos<childElements.length && fpos<foundElements.length) {

		// if we are at an xs:any in the known element, skip over found elements until we get to the next known element
		if (childElements[kpos].name==OTHER_ELEMENTS_OK) {   	
			while (fpos<foundElements.length && !isIn(allowedChildren, foundElements[fpos])) {
				fpos++
			}
			kpos++
		}
		
		// skip over matching elements
		while (childElements[kpos].name==foundElements[fpos] && fpos<foundElements.length)  {
			var incK=false;
			while (childElements[kpos].name==foundElements[fpos] && fpos<foundElements.length)  {
				fpos++; incK=true;
			}
			if (incK) kpos++;
		}
	
	
		console.log("scan k", kpos, childElements.length, "f", fpos, foundElements.length)
	
		if (fpos<foundElements.length) {
					
			console.log("stop", kpos, childElements[kpos].name, ":", kpos+1, childElements[kpos+1]?childElements[kpos+1].name:"kpos+1", ":", fpos, foundElements[fpos])
			
		
			
			if (childElements[kpos] && childElements[kpos].name==OTHER_ELEMENTS_OK && foundElements[fpos]!=childElements[kpos])
			
			
			if (kpos==0 && fpos==0 && childElements[kpos].name!=foundElements[fpos] && childElements[kpos].minoccurs>0 ) {
				
				var message="element "+(foundElements[fpos]?foundElements[fpos].elementize():"fpos="+fpos)+" is not expected as first child"
				
				errs.pushCode(errCode?errCode+"-5":"te005", message, "element sequence")
				console.log(message)
				fpos++
			}
			else if (childElements[kpos+1] && foundElements[fpos]!=childElements[kpos+1].name &&  childElements[kpos+1].name!=OTHER_ELEMENTS_OK && !isIn(allowedChildren, foundElements[fpos])) {
				// the element we found at fpos does not match what is expected
				
				var message="element "+(foundElements[fpos]?foundElements[fpos].elementize():"fpos="+fpos)+" is not expected after "+(childElements[kpos]?childElements[kpos].name.elementize():"kpos")
				
				errs.pushCode(errCode?errCode+"-4":"te004", message, "element sequence")
				console.log(message)
				fpos++
			}
		}
	}

	
	
/*
	for (kpos=0; kpos<childElements.length && fpos<foundElements.length; kpos++) {
		while (fpos<foundElements.length && childElements[kpos].name==foundElements[fpos])  // look for first mismatching found element
			fpos++;

//	console.log("stop1-mismatch", kpos, childElements[kpos].name, ":", fpos, foundElements[fpos])

		if (childElements[kpos].name==OTHER_ELEMENTS_OK) {   	// if we are at an xs:any in the known element
			while (foundElements[fpos] && !isIn(allowedChildren, foundElements[fpos]))  // skip over found elements until we get to the next known element
				fpos++
		}
	
	console.log("stop2-skip any", kpos, childElements[kpos].name, ":", fpos, foundElements[fpos])
	
		if ((fpos<foundElements.length && !isIn(allowedChildren, foundElements[fpos])) || ((kpos+1)<childElements.length && childElements[kpos+1].minoccurs!=0 && childElements[kpos+1].name!=foundElements[fpos])) {
			errs.pushCode(errCode?errCode+"-4":"te004", "element "+(foundElements[fpos]?foundElements[fpos].elementize():"fpos="+fpos)+" is not expected after "+(childElements[kpos]?childElements[kpos].name.elementize():"kpos"), "element sequence")
			console.log("err")
			
			if (!isIn(allowedChildren, foundElements[fpos])) fpos++
		}
		else 
			console.log("ok")
	}
*/
	return errs.length==initialErrorCount
}



/**
 * check that the specified child elements are in the parent element
 *
 * @param {Object} elem                The element whose attributes should be checked
 * @param {Array}  requiredAttributes  The element names permitted within the parent
 * @param {Array}  optionalAttributes  The element names permitted within the parent
 * @param {Class}  errs                Errors found in validaton
 * @param {string} errCode             Error code prefix to be used in reports, if not present then use local codes
 */
function checkAttributes(elem, requiredAttributes, optionalAttributes, errs, errCode=null)
{
	if (!requiredAttributes || !elem) {
		errs.pushCode("AT000", "checkAttributes() called with elem==null or requiredAttributes==null")
		return;
	}
	
	requiredAttributes.forEach(attributeName => {
		if (!elem.attr(attributeName)) {
			var src=(typeof elem.parent()=='object' && typeof elem.parent().name=='function' ? elem.parent().name()+"." : "")
			errs.pushCode(errCode?errCode+"-1":"AT001", src+attributeName.attribute(typeof elem.name=='function'?elem.name():"")+" is a required attribute");	
		}
	});
	
	elem.attrs().forEach(attribute => {
		if (!isIn(requiredAttributes, attribute.name()) && !isIn(optionalAttributes, attribute.name()))
			errs.pushCode(errCode?errCode+"-2":"AT002", 
			  attribute.name().attribute()+" is not permitted in "
				+((typeof elem.parent().name==='function')?elem.parent().name().elementize():"")
				+elem.name().elementize());
	});
}


/**
 * check if the specificed element has the named child element
 * 
 * @param {string} SL_SCHEMA        Used when constructing Xpath queries
 * @param {string} SCHEMA_PREFIX    Used when constructing Xpath queries
 * @param {object} node             The node to check
 * @param {string} elementName      The name of the child element
 * @returns {boolean} true if an element named node.elementName exists, else false
 */
function hasElement(SL_SCHEMA, SCHEMA_PREFIX, node, elementName) {
	if (!node) return false;
	return (node.get(xPath(SCHEMA_PREFIX, elementName), SL_SCHEMA)!=null);
}


/**
 * check the attributes (existance and values) of the given <DVBTriplet>
 * 
 * @param {object} node      The node to check
 * @param {Class}  errs      Errors found in validaton
 * @param {string} errCode   Error code prefix to be used in reports, if not present then use local codes
 */ 
function validateTriplet(triplet, errs, errCode=null) {

	function checkTripletAttributeValue(attr, parentElemName, errs, errCode=null) {
		if (!attr) return;
		if (!isUnsignedShort(attr.value()))
			errs.pushCode(errCode?errCode:"AtV001", "invalid value specified for "+
				attr.name().attribute(parentElemName)+" ("+attr.value()+")")	
	}

	if (!triplet) {
		errs.pushCode(errCode?errCode+"-1":"VT001", "valudateTriplet() called with triplet==null")
		return;
	}
	checkAttributes(triplet, [dvbi.a_serviceId], [dvbi.a_origNetId, dvbi.a_tsId], errs, errCode?errCode+"-2":"VT002")
	checkTripletAttributeValue(triplet.attr(dvbi.a_serviceId), triplet.parent().name()+"."+triplet.name(), errs, errCode?errCode+"-3":"VT003")
	checkTripletAttributeValue(triplet.attr(dvbi.a_origNetId), triplet.parent().name()+"."+triplet.name(), errs, errCode?errCode+"-4":"VT004")
	checkTripletAttributeValue(triplet.attr(dvbi.a_tsId), triplet.parent().name()+"."+triplet.name(), errs, errCode?errCode+"-5":"VT005")	
}


/**
 * extract only an integer value from the given argument, anthing that is non-integer characters will cause failure
 *
 * @param {String} intStr  A string containing a integer value
 * @returns {integer} the integer representation of string
 */
function cleanInt(intStr) {
	intStr=Number(intStr);
	return intStr >= 0 ? Math.floor(intStr) : Math.ceil(intStr);
}


/**
 * determine if the value provided represents a valid longitude value (i.e. -180.0 -> +180.0)
 *
 * @param {String} intStr  A string containing a longitude
 * @returns {boolean} true if the argument represents a longitudal angle
 */
function validLongitude(position) {
	var x=Number(position);
	if (isNaN(x)) return false
	return (x >= -180 && x <= 180)
}

/**
 * determine if the value provided represents a valid transmission frequency
 *
 * @param {String} intStr  A string containing a frequency
 * @returns {boolean} true if the argument represents a frequency (anything greter than 0Hz)
 */
function validFrequency(freq) {
	var val=cleanInt(freq);
	return (!isNaN(val) && val>=0)
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
	
	checkTopElements(SL_SCHEMA, SCHEMA_PREFIX, source, [dvbi.e_ProviderName, dvbi.e_ScheduleInfoEndpoint], [dvbi.e_Name, tva.e_RelatedMaterial, dvbi.e_ProgramInfoEndpoint, dvbi.e_GroupInfoEndpoint, dvbi.e_MoreEpisodesEndpoint], errs, errCode?errCode+"-1":"GS001")
	checkAttributes(source, [dvbi.a_CGSID], [dvbi.a_minimumMetadataUpdatePeriod], errs, errCode?errCode+"-2":"GS002")

	// Check that the @xml:lang values for each <Name> element are unique and only one element 
	// does not have any language specified
	checkXMLLangs(SL_SCHEMA, SCHEMA_PREFIX, dvbi.e_Name, loc, source, errs, errCode?errCode+"a":"GS003");

	// Check that the @xml:lang values for each <ProviderName> element are unique and only one element 
	// does not have any language specified
	checkXMLLangs(SL_SCHEMA, SCHEMA_PREFIX, dvbi.e_ProviderName, loc, source, errs, errCode?errCode+"b":"GS004");
	
	var rm=0, CGrm;
	while (CGrm=source.get(xPath(SCHEMA_PREFIX, tva.e_RelatedMaterial, ++rm), SL_SCHEMA))
		validateRelatedMaterial(CGrm, errs, loc, CONTENT_GUIDE_RM, SCHEMA_NAMESPACE);
}


/**
 * verifies if the specified ContentProtection element is valid according to specification (contents and location)
 *
 * @param {Object} ContentProtection   The <ContentProtection> element (a libxmls ojbect tree) to be checked
 * @param {Object} errs                The class where errors and warnings relating to the serivce list processing are stored 
 * @param {string} Location            The printable name used to indicate the location of the <ContentProtection> element being checked. used for error reporting
 * @param {string} SL_SCHEMA         Used when constructing Xpath queries
 * @param {string} SCHEMA_PREFIX     Used when constructing Xpath queries
 * @param {string} SCHEMA_NAMESPACE  The namespace of XML document
 */
function validateContentProtection(ContentProtection, errs, Location, SCHEMA_NAMESPACE) {
	checkTopElements(SL_SCHEMA, SCHEMA_PREFIX, ContentProtection, [], [dvbi.e_CASystemId, dvbi.e_DRMSystemId], errs, "CP001")
	
	var ca=0, CASystemId
	while (CASystemId=ContentProtection.get(xPath(SCHEMA_PREFIX, dvbi.e_CASystemId, ++ca), SL_SCHEMA)) {
		checkTopElements(SL_SCHEMA, SCHEMA_PREFIX, CASystemId, [dvbi.e_CASystemId], errs, "CP010")
		checkAttributes(CASystemId, [], [dvbi.cpsIndex], errs, "CP011")
	}
	
	var dr=0, DRMSystemId
	while (DRMSystemId=ContentProtection.get(xPath(SCHEMA_PREFIX, dvbi.e_DRMSystemId, ++dr), SL_SCHEMA)) {
		checkTopElements(SL_SCHEMA, SCHEMA_PREFIX, DRMSystemId, [dvbi.e_DRMSystemId], errs, "CP020")
		checkAttributes(DRMSystemId, [dvbi.a_encryptionScheme], [dvbi.cpsIndex], errs, "CP021")
		
		var scheme=DRMSystemId.attr(dvbi.a_encryptionScheme).value()
		if (scheme && !isIn(dvbi.ENCRYPTION_VALID_TYPES, scheme)) 
			errs.pushCode("CP022", scheme.quote()+"is not valid for "+dvbi.a_encryptionScheme.attribute(ContentProtection.name()))
	}
}

/**
 * validate an element against a TV-Anytime BitrateType
 *
 * @param {object} child       The node of the element to check
 * @param {Class}  errs        Errors found in validaton
 * @param {string} errCode     Error code prefix to be used in reports, if not present then use local codes
 *
 */
function checkBitRate(child, errs, errCode=null) {
	
	function attributeError(errs, errCode, child, attributeName) {
		errs.pushCode(errCode, "invalid value "+child.attr(attributeName).value().quote()+" for "+attributeName.attribute(child.name()), child.name()+" error")
	}
	
	checkAttributes(child, [], [tva.a_variable, tva.a_minimum, tva.a_average, tva.a_maximum], errs, errCode?errCode+"-01":"BR001")
	
	// check the value is a nonNegativeInteger
	if (!isNonNegativeInteger(child.text()))
		errs.pushCode(errCode?errCode+"-02":"BR002", "invalid value "+child.text().quote()+" for "+child.name().elementize(), child.name()+" error")
	
	// check any @variable attribute is a boolean
	if (child.attr(tva.a_variable))
		if (!isIn(["true", "false"], child.attr(tva.a_variable).value()))
			atributeError(errs, errCode?errCode+"-03":"BR003", child, tva.a_variable)
	
	// check any @minimum attribute is an unsignedLong
	if (child.attr(tva.a_minimum))
		if (!isUnsignedLong(child.attr(tva.a_minimum).value()))
			atributeError(errs, errCode?errCode+"-04":"BR004", child, tva.a_minimum)
		
	// check any @average attribute is an unsignedLong
	if (child.attr(tva.a_average))
		if (!isUnsignedLong(child.attr(tva.a_average).value()))
			atributeError(errs, errCode?errCode+"-05":"BR005", child, tva.a_average)
		
	// check any @maximum attribute is an unsignedLong
	if (child.attr(tva.a_maximum))
		if (!isUnsignedLong(child.attr(tva.a_maximum).value()))
			atributeError(errs, errCode?errCode+"-05":"BR005", child, tva.a_maximum)
}


/**
 * check if the specified value contains an IP address (v4 or v6) or a domain name
 *
 * @param {string} arg    contains an IP address (v4 or v6) or a domain name
 * @returns true is the arg contains an IP address (v4 or v6) or a domain name, else false 
 */
function isIPorDomain(arg) {
	// TODO:
	return true
}

/**
 * validate an element against a DVB FECLayerAddressType
 *
 * @param {object} layerParams    The node of the element to check
 * @param {Class}  errs           Errors found in validaton
 * @param {string} errCode        Error code prefix to be used in reports, if not present then use local codes
 *
 */
function checkFECLayerAddressType(layerParams, errs, errcode=null) {
	checkAttributes(layerParams, [], [dvbi.a_Address, dvbi.a_Source, dvbi.a_Port, dvbi.a_MaxBitrate, dvbi.a_RTSPControlURL, dvbi.a_PayloadTypeNumber, dvbi.a_TransportProtocol], errs, errcode?errcode+"-01":"LA001")
	
	if (layerParams.attr(dvbi.a_Address)) {
		if (!isIPorDomain(layerParams.attr(dvbi.a_Address).value()))
			errs.pushCode(errcode?errcode+"-02":"LA002", "Invalid value "+layerParams.attr(dvbi.a_Address).value().quote()+" for "+dvbi.a_Address.attribute(layerParams.name()), "invalid value")
	}
	
	if (layerParams.attr(dvbi.a_Source)) {
		if (!isIPorDomain(layerParams.attr(dvbi.a_Source).value()))
			errs.pushCode(errcode?errcode+"-03":"LA003", "Invalid value "+layerParams.attr(dvbi.a_Source).value().quote()+" for "+dvbi.a_Source.attribute(layerParams.name()), "invalid value")
	}
	
	if (layerParams.attr(dvbi.a_Port)) {
		if (!isUnsignedShort(layerParams.attr(dvbi.a_Port).value()))
			errs.pushCode(errcode?errcode+"-04":"LA004", "Invalid value "+layerParams.attr(dvbi.a_Port).value().quote()+" for "+dvbi.a_Port.attribute(layerParams.name()), "invalid value")		
	}
	
	if (layerParams.attr(dvbi.a_MaxBitrate)) {
		if (!isPositiveInteger(layerParams.attr(dvbi.a_MaxBitrate).value()))
			errs.pushCode(errcode?errcode+"-05":"LA005", "Invalid value "+layerParams.attr(dvbi.a_MaxBitrate).value().quote()+" for "+dvbi.a_MaxBitrate.attribute(layerParams.name()), "invalid value")					
	}
	
	if (layerParams.attr(dvbi.a_RTSPControlURL)) {
		// TODO:
	}
	
	if (layerParams.attr(dvbi.a_PayloadTypeNumber)) {
		if (!isUnsignedInt(layerParams.attr(dvbi.a_MaxBitrate).value()))
			errs.pushCode(errcode?errcode+"-05":"LA005", "Invalid value "+layerParams.attr(dvbi.a_MaxBitrate).value().quote()+" for "+dvbi.a_MaxBitrate.attribute(layerParams.name()), "invalid value")			
	}
	
	if (layerParams.attr(dvbi.a_TransportProtocol)) {
		if (!isIn(dvbi.ALLOWED_TRANSPORT_PROTOCOLS, layerParams.attr(dvbi.a_TransportProtocol).value()))
			errs.pushCode(errcode?errcode+"-06":"LA006", "Invalid value "+val.quote()+" for "+dvbi.a_TransportProtocol.attribute(layerParams.name()), "invalid value")
	}
}


/**
 * validate the service list and record any errors
 *
 * @param {String} SLtext  The service list text to be validated
 * @param {Class} errs     Errors found in validaton
 */
function validateServiceList(SLtext, errs) {
	var SL=null;
	if (SLtext) try {
		SL=libxml.parseXmlString(SLtext);
	} catch (err) {
		errs.pushCode("SL001", "XML parsing failed: "+err.message, "malformed XML");
	}
	if (!SL || !SL.root()) {
		errs.pushCode("SL002", "SL is empty")
		return;
	}
	
	// check the retrieved service list against the schema
	// https://syssgx.github.io/xml.js/

//TODO: look into why both of these validation approaches are failing
/*
	var lintResult=null;
	lintResult=xmllint.validateXML({
		xml: SLtext,
		schema: [SLschema_v1.toString(), 
				TVAschema.toString(), 
				MPEG7schema.toString(),
				XMLschema.toString()]
	});
	console.log( lintResult.errors );
*/
/*
	if (!SL.validate(SLschema_v1)){
		SL.validationErrors.forEach(err => console.log("validation error(1):", err));
	};
	if (!SL.validate(SLschema_v2)){
		SL.validationErrors.forEach(err => console.log("validation error(2):", err));
	};
*/	
	if (SL.root().name() !== dvbi.e_ServiceList) {
		errs.pushCode("SL003", "Root element is not "+dvbi.e_ServiceList.elementize());
		return;
	}
	
	var SL_SCHEMA={}, 
		SCHEMA_PREFIX=SL.root().namespace().prefix(), 
		SCHEMA_NAMESPACE=SL.root().namespace().href();
	SL_SCHEMA[SCHEMA_PREFIX]=SCHEMA_NAMESPACE;

	if (SchemaVersion(SCHEMA_NAMESPACE) == SCHEMA_unknown) {
		errs.pushCode("SL004", "Unsupported namespace "+SCHEMA_NAMESPACE.quote());
		return;
	}

	checkTopElements(SL_SCHEMA, SCHEMA_PREFIX, SL.root(), [dvbi.e_Name, dvbi.e_ProviderName], [tva.e_RelatedMaterial, dvbi.e_RegionList, dvbi.e_TargetRegion, dvbi.e_LCNTableList, dvbi.e_ContentGuideSourceList, dvbi.e_ContentGuideSource, dvbi.e_Service, OTHER_ELEMENTS_OK], errs, "SL010")
	checkAttributes(SL.root(), [dvbi.a_version], ["schemaLocation"], errs, "SL011")
/*
	checkTopElements2(SL_SCHEMA, SCHEMA_PREFIX, SL.root(), [
		{name: dvbi.e_Name, minoccurs: 1, maxoccurs: UNBOUNDED},
		{name: dvbi.e_ProviderName, minoccurs: 1, maxoccurs: UNBOUNDED},
		{name: tva.e_RelatedMaterial, minoccurs: 0, maxoccurs: UNBOUNDED},
		{name: dvbi.e_RegionList, minoccurs: 0, maxoccurs: 1},
		{name: dvbi.e_TargetRegion, minoccurs: 0, maxoccurs: UNBOUNDED},
		{name: dvbi.e_LCNTableList, minoccurs: 0, maxoccurs: 1},
		{name: dvbi.e_ContentGuideSourceList, minoccurs: 0, maxoccurs: 1},
		{name: dvbi.e_ContentGuideSource, minoccurs: 0, maxoccurs: 1},
		{name: dvbi.e_Service, minoccurs: 0, maxoccurs: UNBOUNDED}, 
		{name: OTHER_ELEMENTS_OK, minoccurs: 0, maxoccurs: UNBOUNDED}
		], errs, "NEW00")
*/
	//check ServiceList@version
	if (SL.root().attr(dvbi.a_version)) {
		if (!isPositiveInteger(SL.root().attr(dvbi.a_version).value()))
			errs.pushCode("SL012", dvbi.a_version.attribute(dvbi.e_ServiceList)+" is not a positiveInteger ("+SL.root().attr(dvbi.a_version).value()+")")
	}

	// Check that the @xml:lang values for each <Name> element are unique and only one element does not have any language specified
	checkXMLLangs(SL_SCHEMA, SCHEMA_PREFIX, dvbi.e_Name, dvbi.e_ServiceList, SL, errs, "SL013");

	// Check that the @xml:lang values for each <ProviderName> element are unique and only one elementdoes not have any language specified
	checkXMLLangs(SL_SCHEMA, SCHEMA_PREFIX, dvbi.e_ProviderName, dvbi.e_ServiceList, SL, errs, "SL014");

	//check <ServiceList><RelatedMaterial>
	var rm=0, RelatedMaterial;
	while (RelatedMaterial=SL.get(xPath(SCHEMA_PREFIX, tva.e_RelatedMaterial, ++rm), SL_SCHEMA)) 
		validateRelatedMaterial(RelatedMaterial, errs, "service list", SERVICE_LIST_RM, SCHEMA_NAMESPACE);

	// check <ServiceList><RegionList> and remember regionID values
	var knownRegionIDs=[], RegionList=SL.get(xPath(SCHEMA_PREFIX, dvbi.e_RegionList), SL_SCHEMA);
	if (RegionList) {
		checkTopElements(SL_SCHEMA, SCHEMA_PREFIX, RegionList, [dvbi.e_Region], [], errs, "SL015")
		checkAttributes(RegionList, [dvbi.a_version], [], errs, "SL016")

		//check RegionList@version
		if (RegionList.attr(dvbi.a_version)) {
			if (!isPositiveInteger(RegionList.attr(dvbi.a_version).value()))
				errs.pushCode("SL017", dvbi.a_version.attribute(dvbi.e_RegionList)+" is not a positiveInteger ("+RegionList.attr(dvbi.a_version).value()+")")
		}

		// recurse the regionlist - Regions can be nested in Regions
		var r=0, Region;
		while (Region=RegionList.get(xPath(SCHEMA_PREFIX, dvbi.e_Region, ++r), SL_SCHEMA)) 
			addRegion(SL_SCHEMA, SCHEMA_PREFIX, Region, 0, knownRegionIDs, errs);
	}

	//check <ServiceList><TargetRegion>
	var tr=0, TargetRegion;
	while (TargetRegion=SL.get(xPath(SCHEMA_PREFIX, dvbi.e_TargetRegion, ++tr), SL_SCHEMA)) 
		if (!isIn(knownRegionIDs, TargetRegion.text())) 
			UnspecifiedTargetRegion(errs, TargetRegion.text(), "service list");


	// <ServiceList><LCNTableList> is checked below, after the services are enumerated
/*
	// check mpeg7:TextualType elements in <ServiceList><ContentGuideSourceList>
	var cgs=0, CGsource;
	while (CGsource=SL.get(xPath(SCHEMA_PREFIX, dvbi.e_ContentGuideSourceList)+"/"+xPath(SCHEMA_PREFIX, dvbi.e_ContentGuideSource, ++cgs), SL_SCHEMA)) {
	
		// Check that the @xml:lang values for each <ContentGuideSourceList><ContentGuideSource>[cgs]<Name> element are unique and only one element 
		// does not have any language specified
		checkXMLLangs(SL_SCHEMA, SCHEMA_PREFIX, dvbi.e_Name, dvbi.e_ServiceList+"."+dvbi.e_ContentGuideSourceList+"."+dvbi.e_ContentGuideSource+"["+cgs+"]", CGsource, errs, "SL018");

		// Check that the @xml:lang values for each <ContentGuideSourceList><ContentGuideSource>[cgs] element are unique and only one element 
		// does not have any language specified
		checkXMLLangs(SL_SCHEMA, SCHEMA_PREFIX, dvbi.e_ProviderName, dvbi.e_ServiceList+"."+dvbi.e_ContentGuideSourceList+"."+dvbi.e_ContentGuideSource+"["+cgs+"]", CGsource, errs, "SL019");
	}
*/
	//check service list <ContentGuideSourceList>
	var ContentGuideSourceIDs=[];
	var CGSourceList=SL.get("//"+xPath(SCHEMA_PREFIX, dvbi.e_ContentGuideSourceList), SL_SCHEMA);
	if (CGSourceList) {
		var cgs=0, CGSource;
		while (CGSource=CGSourceList.get(xPath(SCHEMA_PREFIX, dvbi.e_ContentGuideSource, ++cgs), SL_SCHEMA)) {

			validateAContentGuideSource(SL_SCHEMA, SCHEMA_PREFIX, SCHEMA_NAMESPACE, CGsource, dvbi.e_ServiceList+"."+dvbi.e_ContentGuideSourceList+"."+dvbi.e_ContentGuideSource+"["+cgs+"]", errs, "SL020")
			
			if (CGSource.attr(dvbi.a_CGSID)) {
				if (isIn(ContentGuideSourceIDs, CGSource.attr(dvbi.a_CGSID).value()))
					errs.pushCode("SL021", "duplicate "+dvbi.a_CGSID.attribute(dvbi.a_CGSID)+" ("+CGSource.attr(dvbi.a_CGSID).value()+") in service list", "duplicate "+dvbi.a_CGSID.attribute());
				else ContentGuideSourceIDs.push(CGSource.attr(dvbi.a_CGSID).value());
			}
/*
			var rm=0, CGrm;
			while (CGrm=CGSource.get(xPath(SCHEMA_PREFIX, tva.e_RelatedMaterial, ++rm), SL_SCHEMA)) 
				validateRelatedMaterial(CGrm, errs, dvbi.e_ServiceList.elementize()+dvbi.e_ContentGuideSourceList.elementize(), CONTENT_GUIDE_RM, SCHEMA_NAMESPACE);
*/
		}
	}

	// check  elements in <ServiceList><ContentGuideSource>
	var slGCS=SL.get(xPath(SCHEMA_PREFIX, dvbi.e_ContentGuideSource), SL_SCHEMA);
	if (slGCS) {
/*
		// Check that the @xml:lang values for each <ContentGuideSource><Name> element are unique and only one element does not have any language specified
		checkXMLLangs(SL_SCHEMA, SCHEMA_PREFIX, dvbi.e_Name, dvbi.e_ServiceList+"."+dvbi.e_ContentGuideSource, slGCS, errs, "SL022");

		// Check that the @xml:lang values for each <ContentGuideSource><ProviderName> element are unique and only one element does not have any language specified
		checkXMLLangs(SL_SCHEMA, SCHEMA_PREFIX, dvbi.e_ProviderName, dvbi.e_ServiceList+"."+dvbi.e_ContentGuideSource, slGCS, errs, "SL023");
		
		var rm=0, CGrm;
		while (CGrm=slGCS.get(xPath(SCHEMA_PREFIX, tva.e_RelatedMaterial, ++rm), SL_SCHEMA))
			validateRelatedMaterial(CGrm, errs, dvbi.e_ServiceList.elementize()+dvbi.e_ContentGuideSourceList.elementize(), CONTENT_GUIDE_RM, SCHEMA_NAMESPACE);
*/
		validateAContentGuideSource(SL_SCHEMA, SCHEMA_PREFIX, SCHEMA_NAMESPACE, slGCS, dvbi.e_ServiceList+"."+dvbi.e_ContentGuideSource, errs, "SL024")
	}

	// this should not happen if the XML document has passed schema validation
	if (SL.get(xPath(SCHEMA_PREFIX, dvbi.e_ContentGuideSourceList), SL_SCHEMA) && SL.get(xPath(SCHEMA_PREFIX, dvbi.e_ContentGuideSource), SL_SCHEMA))
		errs.pushCode("SL025", "cannot specify both "+dvbi.e_ContentGuideSourceList.elementize()+" and "+dvbi.e_ContentGuideSource.elementize(), "source and ref")

	errs.set("num services",0);

	// check <Service>
	var s=0, service, knownServices=[], thisServiceId;
	while (service=SL.get("//"+xPath(SCHEMA_PREFIX, dvbi.e_Service, ++s), SL_SCHEMA)) {
		// for each service
		errs.set("num services",s);
		thisServiceId="service-"+s;  // use a default value in case <UniqueIdentifier> is not specified
		
		checkTopElements(SL_SCHEMA, SCHEMA_PREFIX, service, [dvbi.e_UniqueIdentifier, dvbi.e_ServiceName, dvbi.e_ProviderName], [dvbi.e_ServiceInstance, dvbi.e_TargetRegion, tva.e_RelatedMaterial, dvbi.e_ServiceGenre, dvbi.e_ServiceType, dvbi.e_RecordingInfo, dvbi.e_ContentGuideSource, dvbi.e_ContentGuideSourceRef, dvbi.e_ContentGuideServiceRef], errs, "SL030")
		checkAttributes(service, [dvbi.a_version], [dvbi.a_dynamic], errs, "SL031")
		
		//check Service@version
		if (service.attr(dvbi.a_version)) {
			if (!isPositiveInteger(service.attr(dvbi.a_version).value()))
				errs.pushCode("SL032", dvbi.a_version.attribute(dvbi.e_Service)+" is not a positiveInteger ("+service.attr(dvbi.a_version).value()+")")
		}

		// check <Service><UniqueIdentifier>
		var uID=service.get(xPath(SCHEMA_PREFIX, dvbi.e_UniqueIdentifier), SL_SCHEMA);
		if (uID) {
			thisServiceId=uID.text();
			if (!validServiceIdentifier(thisServiceId)) 
				errs.pushCode("SL033", thisServiceId.quote()+" is not a valid service identifier", "invalid tag");
			if (!uniqueServiceIdentifier(thisServiceId, knownServices)) 
				errs.pushCode("SL034", thisServiceId.quote()+" is not unique", "non unique id");
			knownServices.push(thisServiceId);			
		}

		//check <Service><ServiceInstance>
		var si=0, ServiceInstance;
		while (ServiceInstance=service.get(xPath(SCHEMA_PREFIX, dvbi.e_ServiceInstance, ++si), SL_SCHEMA)) {
			//for each service instance

			checkTopElements(SL_SCHEMA, SCHEMA_PREFIX, ServiceInstance, [], [dvbi.e_DisplayName, tva.e_RelatedMaterial, dvbi.e_ContentProtection, dvbi.e_ContentAttributes, dvbi.e_Availability, dvbi.e_SubscriptionPackage, dvbi.e_FTAContentManagement, dvbi.e_SourceType, dvbi.e_DVBTDeliveryParameters, dvbi.e_DVBSDeliveryParameters, dvbi.e_DVBCDeliveryParameters, dvbi.e_SATIPDeliveryParameters, dvbi.e_RTSPDeliveryParameters, dvbi.e_MulticastTSDeliveryParameters, dvbi.e_DASHDeliveryParameters, dvbi.e_OtherDeliveryParameters], errs, "SL035")
			
			checkAttributes(ServiceInstance, [], [dvbi.a_priority], errs, "SL036")

			// Check that the @xml:lang values for each <DisplayName> element are unique and only one element does not have any language specified
			checkXMLLangs(SL_SCHEMA, SCHEMA_PREFIX, dvbi.e_DisplayName, "service instance in service="+thisServiceId.quote(), ServiceInstance, errs, "SL037");

			// check @href of <ServiceInstance><RelatedMaterial>
			var rm=0, RelatedMaterial;
			while (RelatedMaterial=ServiceInstance.get(xPath(SCHEMA_PREFIX, tva.e_RelatedMaterial, ++rm), SL_SCHEMA)) 
				validateRelatedMaterial(RelatedMaterial, errs, "service instance of "+thisServiceId.quote(), SERVICE_RM, SCHEMA_NAMESPACE);

			// <ServiceInstance><ContentProtection>
			var cp=0, ContentProtection;
			while (ContentProtection=ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_ContentProtection, ++cp), SL_SCHEMA))
				validateContentProtection(ContentProtection, errs, "service instance of "+thisServiceId.quote(), SL_SCHEMA, SCHEMA_PREFIX, SCHEMA_NAMESPACE)

			// <ServiceInstance><ContentAttributes>
			var ContentAttributes=ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_ContentAttributes), SL_SCHEMA)
			if (ContentAttributes) {
				checkTopElements(SL_SCHEMA, SCHEMA_PREFIX, ContentAttributes, [], [tva.e_AudioAttributes, dvbi.e_AudioConformancePoint, tva.e_VideoAttributes, dvbi.e_VideoConformancePoint, tva.e_CaptionLanguage, tva.e_SignLanguage], errs, "SL040")

				// Check @href of ContentAttributes/AudioAttributes/tva:coding
				var cp=0;
				while (conf=ContentAttributes.get(xPath(SCHEMA_PREFIX, tva.e_AudioAttributes, ++cp), SL_SCHEMA)) {
					checkTopElements(SL_SCHEMA, SCHEMA_PREFIX, conf, [], [tva.e_Coding, tva.e_NumOfChannels, tva.e_MixType, tva.e_AudioLanguage, tva.e_SampleFrequency, tva.e_BitsPerSample, tva.e_BitRate], errs, "SL041")
					
					var ch=0, child; 
					while (child=conf.child(ch++)) {
						switch (child.name()) {
							case tva.e_Coding:
								checkAttributes(child, [dvbi.a_href], [], errs, "SL042")
								if (child.attr(dvbi.a_href)) {
									if (!isIn(allowedAudioSchemes, child.attr(dvbi.a_href).value())) 
										errs.pushCode("SL043", "invalid "+dvbi.a_href.attribute(tva.e_AudioAttributes)+" value for ("+child.attr(dvbi.a_href).value()+")", "audio codec");
								}
								break;
							case tva.e_NumOfChannels:
								if (!isUnsignedShort(child.text()))
									errs.pushCode("SL044", "invalid value "+child.text().quote()+" for "+child.name().elementize()+" in "+conf.name().elementize(), "invalid value")
								break;
							case tva.e_MixType:
								// TODO:
								break;
							case tva.e_AudioLanguage:
								// TODO:
								break;
							case tva.e_SampleFrequency:
								if (!isUnsignedInt(child.text()))
									errs.pushCode("SL047", "invalid value "+child.text().quote()+" for "+child.name().elementize()+" in "+conf.name().elementize(), "invalid value")
								break;
							case tva.e_BitsPerSample:
								if (!isUnsignedShort(child.text()))
									errs.pushCode("SL048", "invalid value "+child.text().quote()+" for "+child.name().elementize()+" in "+conf.name().elementize(), "invalid value")
								break;
							case tva.e_BitRate:
								checkBitRate(chile, errs, "SL048")
								break;
						}
					}
				}
				
				// Check @href of ContentAttributes/AudioConformancePoints
				cp=0, conf;
				while (conf=ContentAttributes.get(xPath(SCHEMA_PREFIX, dvbi.e_AudioConformancePoint, ++cp), SL_SCHEMA)) {
					checkAttributes(conf, [dvbi.a_href], [], errs, "SL071")
					if (conf.attr(dvbi.a_href)) {
						if (!isIn(allowedAudioConformancePoints, conf.attr(dvbi.a_href).value())) 
							errs.pushCode("SL072", "invalid "+dvbi.a_href.attribute(dvbi.e_AudioConformancePoint)+" ("+conf.attr(dvbi.a_href).value()+")", "audio conf point");
					}	
				}

				// Check @href of ContentAttributes/VideoAttributes/tva:coding
				cp=0;
				while (conf=ContentAttributes.get(xPath(SCHEMA_PREFIX, tva.e_VideoAttributes, ++cp), SL_SCHEMA)) {
					checkTopElements(SL_SCHEMA, SCHEMA_PREFIX, conf, [], [tva.e_Coding, tva.e_Scan, tva.e_HorizontalSize, tva.e_VerticalSize, tva.e_AspectRatio, tva.e_Color, tva.e_FrameRate, tva.e_BitRate, tva.e_PictureFormat], errs, "SL073")
					
					// TODO: check other elements in the VideoAttributes
					var ch=0, child; 
					while (child=conf.child(ch++)) {
						switch (child.name()) {
							case tva.e_Coding:
								checkAttributes(child, [dvbi.a_href], [], errs, "SL037")
								if (child.attr(dvbi.a_href)) {
									if (!isIn(allowedVideoSchemes, child.attr(dvbi.a_href).value())) 
										errs.pushCode("SL074", "invalid "+dvbi.a_href.attribute(tva.e_VideoAttributes)+" ("+child.attr(dvbi.a_href).value()+")", "video codec");
								}
								break;
							case tva.e_Scan:
								if (!isIn(tva.SCAN_TYPES, child.text()))
									errs.pushCode("SL074a", "invalid "+tva.e_Scan.elementize()+" value "+child.text().quote(), "video atributes")
								break;
							case tva.e_HorizontalSize:
								if (!isUnsignedShort(child.text()))
									errs.pushCode("SL074b", "invalid "+tva.e_HorizontalSize.elementize()+" value "+child.text().quote(), "video attributes")
								break;
							case tva.e_VerticalSize:
								if (!isUnsignedShort(child.text()))
									errs.pushCode("SL074c", "invalid "+tva.e_VerticalSize.elementize()+" value "+child.text().quote(), "video attributes")
								break;
							case tva.e_AspectRatio:
								// TODO:
								break;
							case tva.e_Color:
								checkAttributes(child, [tva.a_type], [], errs, "SLc003")
								if (child.attr(tva.a_type)) {
									if (!isIn(tva.COLOR_TYPES,child.text()))
										errs.pushCode("SL074e", "invalid "+tva.e_Color.elementize()+" value "+child.text().quote(), "video attributes")
								}
								break;
							case tva.e_FrameRate:
								if (!validFrameRate(child.text()))
									errs.pushCode("SL074f", "invalid "+tva.e_FrameRate.elementize()+" value "+child.text().quote(), "video attributes")
								break;
							case tva.e_BitRate:
								checkBitRate(child, errs, "SL074g")
								break;
							case tva.e_PictureFormat:
								checkAttributes(child, [dvbi.a_href], [], errs, "SL074h")
								if (child.attr(dvbi.a_href)) 
									if (!isIn(allowedVideoConformancePoints, child.attr(dvbi.a_href).value())) 
										errs.pushCode("SL074i", "invalid "+dvbi.a_href.attribute(tva.e_PictureFormat)+" value ("+child.attr(dvbi.a_href).value()+")", tva.e_PictureFormat);
								break;
						}
					}
				}

				// Check @href of ContentAttributes/VideoConformancePoints
				cp=0;
				while (conf=ContentAttributes.get(xPath(SCHEMA_PREFIX, dvbi.e_VideoConformancePoint, ++cp), SL_SCHEMA)) { 
					checkAttributes(conf, [dvbi.a_href], [], errs, "SL075")
					if (conf.attr(dvbi.a_href)) {
						if (!isIn(allowedVideoConformancePoints, conf.attr(dvbi.a_href).value())) 
							errs.pushCode("SL076", "invalid "+dvbi.a_href.attribute(dvbi.e_VideoConformancePoint)+" value ("+conf.attr(dvbi.a_href).value()+")", "video conf point");
					}
				}

				// Check ContentAttributes/CaptionLanguage
				cp=0;
				while (conf=ContentAttributes.get(xPath(SCHEMA_PREFIX, tva.e_CaptionLanguage, ++cp), SL_SCHEMA)) { 
					checkAttributes(conf, [], [tva.a_primary, tva.a_translation, tva.a_closed, tva.a_supplemental], errs, "SL077")
					checkLanguage(conf.text(), tva.e_CaptionLanguage.elementize(), errs, "SL078")
				}

				// Check ContentAttributes/SignLanguage
				cp=0;
				while (conf=ContentAttributes.get(xPath(SCHEMA_PREFIX, tva.e_SignLanguage, ++cp), SL_SCHEMA)) { 
					checkAttributes(conf, [], [tva.a_primary, tva.a_translation, tva.a_type, tva.a_closed], errs, "SL079")
					checkLanguage(conf.text(), tva.e_SignLanguage.elementize(), errs, "SL080")
				}
				
			}
			
			// <ServiceInstance><Availability>
			var Availability=ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_Availability), SL_SCHEMA);
			if (Availability) {
				checkTopElements(SL_SCHEMA, SCHEMA_PREFIX, Availability, [dvbi.e_Period], [], errs, "SL081")
				checkAttributes(Availability, [], [dvbi.a_validFrom, dvbi.a_validTo], errs, "SL082")
				var Period, p=0;
				while (Period=Availability.get(xPath(SCHEMA_PREFIX, dvbi.e_Period, ++p), SL_SCHEMA)) 
					if (Period.attr(dvbi.a_validFrom) && Period.attr(dvbi.a_validTo)) {
						// validTo should be >= validFrom
						var fr=new Date(Period.attr(dvbi.a_validFrom).value()), 
							to=new Date(Period.attr(dvbi.a_validTo).value());
					
						if (to.getTime() < fr.getTime()) 
							errs.pushCode("SL083", "invalid availability period for service "+thisServiceId.quote()+". "+fr+">"+to, "period start>end");
					}
			}


			// <ServiceInstance><SubscriptionPackage>
			checkXMLLangs(SL_SCHEMA, SCHEMA_PREFIX, dvbi.e_SubscriptionPackage, ServiceInstance.name().elementize(), ServiceInstance, errs, "SLb001")
			var sp=0, SubscriptionPackage;
			while (SubscriptionPackage=ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_SubscriptionPackage, ++sp))) {
				// nothing to do here
			}
					
			// <ServiceInstance><FTAContentManagement>
			var FTAContentManagement=ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_FTAContentManagement), SL_SCHEMA)
			if (FTAContentManagement) {
				checkAttributes(FTAContentManagement, [dvbi.a_userDefined, dvbi.a_doNotScramble, dvbi.a_controlRemoteAccessOverInternet, dvbi.a_doNotApplyRevocation], [], errs, "SLa000")
				
				var cRAOI=FTAContentManagement.attr(dvbi.a_controlRemoteAccessOverInternet)?FTAContentManagement.attr(dvbi.a_controlRemoteAccessOverInternet).value():null;
				
				if (cRAOI && (cRAOI < 0 || cRAOI > 3))
					errs.pushCode("SLa001", "invalid value "+cRAOI.quote()+" for "+dvbi.a_controlRemoteAccessOverInternet.attribute(dvbi.e_FTAContentManagement), "invalid")
			}

			// note that the <SourceType> element becomes optional and in A177v2, but if specified then the relevant
			// delivery parameters also need to be specified
			var SourceType=ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_SourceType), SL_SCHEMA);
			if (SourceType) {
				let v1Params=false;
				switch (SourceType.text()) {
					case dvbi.DVBT_SOURCE_TYPE:
						if (!ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_DVBTDeliveryParameters), SL_SCHEMA) ) 
							NoDeliveryParams(errs, "DVB-T", thisServiceId, "SL084"); 
						v1Params=true
						break;
					case dvbi.DVBS_SOURCE_TYPE:
						if (!ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_DVBSDeliveryParameters), SL_SCHEMA) ) 
							NoDeliveryParams(errs, "DVB-S", thisServiceId, "SL085");
						v1Params=true
						break;
					case dvbi.DVBC_SOURCE_TYPE:
						if (!ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_DVBCDeliveryParameters), SL_SCHEMA) ) 
							NoDeliveryParams(errs, "DVB-C", thisServiceId, "SL086");
						v1Params=true
						break;
					case dvbi.DVBDASH_SOURCE_TYPE:
						if (!ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_DASHDeliveryParameters), SL_SCHEMA) ) 
							NoDeliveryParams(errs, "DVB-DASH", thisServiceId, "SL087");
						v1Params=true
						break;
					case dvbi.DVBIPTV_SOURCE_TYPE:
						if (!ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_MulticastTSDeliveryParameters), SL_SCHEMA) && !ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_RTSPDeliveryParameters), SL_SCHEMA) ) 
							NoDeliveryParams(errs, "Multicast or RTSP", thisServiceId, "SL088");
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
								errs.pushCode("SL089", "Delivery parameters are not permitted for Application service instance in Service "+thisServiceId.quote(), "invalid application");
								v1Params=true
							}
							else {
								// no xxxxDeliveryParameters is signalled
								// check for appropriate Service.RelatedMaterial or Service.ServiceInstance.RelatedMaterial
								if (!hasSignalledApplication(SL_SCHEMA, SCHEMA_PREFIX, service) 
									&& !hasSignalledApplication(SL_SCHEMA, SCHEMA_PREFIX, ServiceInstance)) 
									errs.pushCode("SL090", "No Application is signalled for "+dvbi.e_SourceType+"="+dvbi.DVBAPPLICATION_SOURCE_TYPE.quote()+" in Service "+thisServiceId.quote(), "no application");
							}
						break;
					default:
						switch (SchemaVersion(SCHEMA_NAMESPACE)) {
							case SCHEMA_v1:
								errs.pushCode("SL091", dvbi.e_SourceType.elementize()+" "+SourceType.text().quote()+" is not valid in Service "+thisServiceId.quote(), "invalid "+dvbi.e_SourceType);
								break;
							case SCHEMA_v2:
								if (!ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_OtherDeliveryParameters), SL_SCHEMA))
									errs.pushCode("SL092", dvbi.e_OtherDeliveryParameters.elementize()+" must be specified with user-defined "+dvbi.e_SourceType+" "+SourceType.text().quote(), "no "+dvbi.e_OtherDeliveryParameters)
								break;
						}
				}
				if (v1Params && SchemaVersion(SCHEMA_NAMESPACE) == SCHEMA_v2)
					errs.pushCodeW("SL093", dvbi.e_SourceType.elementize()+" is deprecated in this version")
			}
			else {
				if (SchemaVersion(SCHEMA_NAMESPACE)==SCHEMA_v1) 
					errs.pushCode("SL094", dvbi.e_SourceType.elementize()+" not specified in "+dvbi.e_ServiceInstance.elementize()+" of service "+thisServiceId.quote(), "no "+dvbi.e_SourceType);
			}

			// <ServiceInstance><DASHDeliveryParameters>
			var DASHDeliveryParameters=ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_DASHDeliveryParameters), SL_SCHEMA);
			if (DASHDeliveryParameters) {
				checkTopElements(SL_SCHEMA, SCHEMA_PREFIX, DASHDeliveryParameters, [dvbi.e_UriBasedLocation], [dvbi.e_MinimumBitRate, dvbi.e_Extension], errs, "SL095")
				var URILoc=DASHDeliveryParameters.get(xPath(SCHEMA_PREFIX, dvbi.e_UriBasedLocation), SL_SCHEMA);
				if (URILoc) {
					checkTopElements(SL_SCHEMA, SCHEMA_PREFIX, URILoc, [dvbi.e_URI], [], errs, "SL096")
					checkAttributes(URILoc, [dvbi.a_contentType], [], errs, "SL097")
					var uriContentType=URILoc.attr(dvbi.a_contentType);
					if (uriContentType) 
						if (!validDASHcontentType(uriContentType.value()))
							errs.pushCode("SL098", dvbi.a_contentType.attribute()+"="+uriContentType.value().quote()+" in service "+thisServiceId.quote()+" is not valid", "no "+dvbi.a_contentType.attribute()+" for DASH");	
				}
				
				// TODO: validate <DASHDeliveryParameters><MinimumBitRate>
				
				var e=0, extension;
				while (extension=DASHDeliveryParameters.get(xPath(SCHEMA_PREFIX, dvbi.e_Extension, ++e), SL_SCHEMA)) {
					if (extension.attr(dvbi.a_extensionName)) {
						if (!validExtensionName(extension.attr(dvbi.a_extensionName).value())) 
							errs.pushCode("SL101", dvbi.a_extensionName.attribute()+"="+extension.attr(dvbi.a_extensionName).value().quote()+" is not valid in service "+thisServiceId.quote(), "invalid "+dvbi.a_extensionName.attribute());
					}
					else 
						errs.pushCode("SL102", dvbi.a_extensionName.attribute()+" not specified for DASH extension in "+thisServiceId.quote(), "no "+dvbi.a_extensionName.attribute());
				}
			}
			var haveDVBT=false, haveDVBS=false;

			// <ServiceInstance><DVBTDeliveryParameters>			
			var DVBTDeliveryParameters=ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_DVBTDeliveryParameters), SL_SCHEMA);
			if (DVBTDeliveryParameters) {
				haveDVBT==true;
				checkTopElements(SL_SCHEMA, SCHEMA_PREFIX, DVBTDeliveryParameters, [dvbi.e_DVBTriplet, dvbi.e_TargetCountry], [], errs, "SL103")

				var DVBTtriplet=DVBTDeliveryParameters.get(xPath(SCHEMA_PREFIX, dvbi.e_DVBTriplet), SL_SCHEMA);
				if (DVBTtriplet) 
					validateTriplet(DVBTtriplet, errs, "SL104")

				var DVBTtargetCountry=DVBTDeliveryParameters.get(xPath(SCHEMA_PREFIX, dvbi.e_TargetCountry), SL_SCHEMA);
				if (DVBTtargetCountry)
					if (!knownCountries.isISO3166code(DVBTtargetCountry.text())) 
						InvalidCountryCode(errs, DVBTtargetCountry.text(), "DVB-T", "service "+thisServiceId.quote(), "SL105");
			}

			// <ServiceInstance><DVBCDeliveryParameters>
			var DVBCDeliveryParameters=ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_DVBCDeliveryParameters), SL_SCHEMA);
			if (DVBCDeliveryParameters) {
				checkTopElements(SL_SCHEMA, SCHEMA_PREFIX, DVBCDeliveryParameters, [dvbi.e_TargetCountry, dvbi.e_NetworkID], [dvbi.e_DVBTriplet], errs, "SL106")
				
				var DVBCtargetCountry=ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_DVBCDeliveryParameters)+"/"+xPath(SCHEMA_PREFIX, dvbi.e_TargetCountry), SL_SCHEMA);
				if (DVBCtargetCountry)
					if (!knownCountries.isISO3166code(DVBCtargetCountry.text()))  
						InvalidCountryCode(errs, DVBCtargetCountry.text(), "DVB-C", "service "+thisServiceId.quote(), "SL107");
				
				var DVBCnetworkId=DVBCDeliveryParameters.get(xPath(SCHEMA_PREFIX, dvbi.e_NetworkID), SL_SCHEMA);
				if (DVBCnetworkId) {
					var val=parseInt(DVBCnetworkId.text());
					if (DVBCnetworkId.text()=="" || val<0 || val>MAX_UNSIGNED_SHORT)
						errs.pushCode("SL108", "invalid value specified for "+
							dvbi.e_NetworkID.elementize()+" ("+DVBCnetworkId.text()+")")
				}

				var DVBCtriplet=DVBCDeliveryParameters.get(xPath(SCHEMA_PREFIX, dvbi.e_DVBTriplet), SL_SCHEMA);
				if (DVBCtriplet) 
					validateTriplet(DVBCtriplet, errs, "SL109")
			}

			// <ServiceInstance><DVBSDeliveryParameters>
			var DVBSDeliveryParameters=ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_DVBSDeliveryParameters), SL_SCHEMA);
			if (DVBSDeliveryParameters) {
				haveDVBS=true;
				
				checkTopElements(SL_SCHEMA, SCHEMA_PREFIX, DVBSDeliveryParameters, [dvbi.e_DVBTriplet], [dvbi.e_OrbitalPosition, dvbi.e_Frequency, dvbi.e_Polarization], errs, "SL110")

				var DVBStriplet=DVBSDeliveryParameters.get(xPath(SCHEMA_PREFIX, dvbi.e_DVBTriplet), SL_SCHEMA);
				if (DVBStriplet) 
					validateTriplet(DVBStriplet, errs, "SL111")
				
				var DVBSorbitalPosition=DVBSDeliveryParameters.get(xPath(SCHEMA_PREFIX, dvbi.e_OrbitalPosition), SL_SCHEMA);
				if (DVBSorbitalPosition) {
					if (!validLongitude(DVBSorbitalPosition.text()))
						errs.pushCode("SL112", "invalid value for "+dvbi.e_DVBSDeliveryParameters+elementize()+dvbi.OrbitalPosition.elementize()+" ("+DVBSorbitalPosition.text()+")")
				}
				var DVBSfrequency=DVBSDeliveryParameters.get(xPath(SCHEMA_PREFIX, dvbi.e_Frequency), SL_SCHEMA);
				if (DVBSfrequency) {
					if (!validFrequency(DVBSfrequency.text()))
						errs.pushCode("SL113", "invalid value for "+dvbi.e_DVBSDeliveryParameters+elementize()+dvbi.Frequency.elementize()+" ("+DVBSfrequency.text()+")")
				}
				var DVBSpolarization=DVBSDeliveryParameters.get(xPath(SCHEMA_PREFIX, dvbi.e_Polarization), SL_SCHEMA);
				if (DVBSpolarization) {
					if (!isIn(dvbi.DVBS_POLARIZATION_VALUES, DVBSpolarization.text()))
						errs.pushCode("SL114", "invalid value for "+dvbi.e_DVBSDeliveryParameters.elementize()+dvbi.e_Polarization.elementize()+" ("+DVBSpolarization.text()+")")
				}
			}

			// <ServiceInstance><SATIPDeliveryParameters>			
			var SATIPDeliveryParameters=ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_SATIPDeliveryParameters), SL_SCHEMA);
			if (SATIPDeliveryParameters) {
				
				checkTopElements(SL_SCHEMA, SCHEMA_PREFIX, SATIPDeliveryParameters, [dvbi.e_QueryParameters], [], errs, "SL115")
				
				// SAT-IP Delivery Parameters can only exist if DVB-T or DVB-S delivery parameters are specified
				if (!haveDVBT && !haveDVBS)
					errs.pushCode("SL116", dvbi.e_SATIPDeliveryParameters.elementize()+" can only be specified with "+dvbi.e_DVBSDeliveryParameters.elementize()+" or "+dvbi.e_DVBTDeliveryParameters.elementize())
			}

			// <ServiceInstance><RTSPDeliveryParameters>
			var RTSPDeliveryParameters=ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_RTSPDeliveryParameters), SL_SCHEMA)
			if (RTSPDeliveryParameters) {
				checkTopElements(SL_SCHEMA, SL_PREFIX, RTSPDeliveryParameters, [dvbi.e_RTSPURL], [dvbi.e_DVBTriplet, dvbi.e_MinimumBitRate], errs, "SLx100")
				
				var Triplet=RTSPDeliveryParameters.get(xPath(SCHEMA_PREFIX, dvbi.e_DVBTriplet), SL_SCHEMA)
				if (Triplet) 
					validateTriplet(Triplet, errs, "SLx101")
				
				var RTSPURL=RTSPDeliveryParameters.get(xPath(SCHEMA_PREFIX, dvbi.e_RTSPURL), SL_SCHEMA)
				if (RTSPURL) {
					checkAttributes(RTSPURL, [], [dvbi.a_RTSPControlURL], errs, "SLx111")
					if (!isRTSPURL(RTSPURL.text()))
						errs.pushCode("SLx112", RTSPURL.text().quote()+" is not a valid RTSP URL", "invalid URL")
				}

				var MinimumBitRate=RTSPDeliveryParameters.get(xPath(SCHEMA_PREFIX, dvbi.e_MinimumBitRate), SL_SCHEMA)
				if (MinimumBitRate) {
					if (!isUnsignedInt(MinimumBitRate.text()))
						errs.pushCode("SLx112", MinimumBitRate.text().quote()+" is not valid for "+dvbi.e_MinimumBitRate.elementize(), "invalid value")
				}				
			}
			
			// <ServiceInstance><MulticastTSDeliveryParameters>
			var MulticastTSDeliveryParameters=ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_MulticastTSDeliveryParameters), SL_SCHEMA)
			if (MulticastTSDeliveryParameters) {
				checkTopElements(SL_SCHEMA, SL_PREFIX, MulticastTSDeliveryParameters, [dvbi.e_IPMulticastAddress], [dvbi.e_DVBTriplet, dvbi.e_MinimumBitRate], errs, "SLx121")
				
				var Triplet=MulticastTSDeliveryParameters.get(xPath(SCHEMA_PREFIX, dvbi.e_DVBTriplet), SL_SCHEMA)
				if (Triplet) 
					validateTriplet(Triplet, errs, "SLx122")
				
				var IPMulticastAddress=MulticastTSDeliveryParameters.get(xPath(SCHEMA_PREFIX, dvbi.e_IPMulticastAddress), SL_SCHEMA)
				if (IPMulticastAddress) {
					checkTopElements(SL_SCHEMA, SL_PREFIX, IPMulticastAddress, [], [dvbi.e_FECBaseLayer, dvbi.e_FECEnhancementLayer, dvbi.e_CNAME, dvbi.e_ssrc, dvbi.e_RTPRetransmission], errs, "SLx123")
					
					var FECBaseLayer=IPMulticastAddress.get(xPath(SCHEMA_PREFIX, dvbi.e_FECBaseLayer), SL_SCHEMA)
					if (FECBaseLayer) 
						checkFECLayerAddressType(FECBaseLayer, errs, "SLx126")

					
					var el=0, FECEnhancementLayer;
					while (FECEnhancementLayer=IPMulticastAddress.get(xPath(SCHEMA_PREFIX, dvbi.e_FECEnhancementLayer, ++el), SL_SCHEMA)) 
						checkFECLayerAddressType(FECEnhancementLayer, errs, "SLx127")
					
					var CNAME=IPMulticastAddress.get(xPath(SCHEMA_PREFIX, dvbi.e_CNAME), SL_SCHEMA)
					if (CNAME) {
						// TODO:
					}
					
					var ssrc=IPMulticastAddress.get(xPath(SCHEMA_PREFIX, dvbi.e_ssrc), SL_SCHEMA)
					if (ssrc) {
						if (!isUnsignedInt(ssrc.text()))
							errs.pushCode("SLx142", ssrc.text().quote()+" is not valid for "+dvbi.e_ssrc.elementize(), "invalid value")
					}
					
					var RTPRetransmission=IPMulticastAddress.get(xPath(SCHEMA_PREFIX, dvbi.e_RTPRetransmission), SL_SCHEMA)
					if (RTPRetransmission) {
						// TODO:
					}
				}
				
				var MinimumBitRate=MulticastTSDeliveryParameters.get(xPath(SCHEMA_PREFIX, dvbi.e_MinimumBitRate), SL_SCHEMA)
				if (MinimumBitRate) {
					if (!isUnsignedInt(MinimumBitRate.text()))
						errs.pushCode("SLx134", MinimumBitRate.text().quote()+" is not valid for "+dvbi.e_MinimumBitRate.elementize(), "invalid value")
				}
			}
			
			// <ServiceInstance><OtherDeliveryParameters>			
			var OtherDeliveryParameters=ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_OtherDeliveryParameters), SL_SCHEMA);
			if (OtherDeliveryParameters) {
				
				checkAttributes(OtherDeliveryParameters, [dvbi.a_extensionName], [], errs, "SL117")

				if (OtherDeliveryParamers.attr(dvbi.a_extensionName)) {
					if (!validExtensionName(OtherDeliveryParamers.attr(dvbi.a_extensionName).value()))
						errs.pushCode("SL118", dvbi.a_extensionName.attribute()+"="+OtherDeliveryParameters.attr(dvbi.a_extensionName).value().quote()+" is not valid in service "+thisServiceId.quote(), "invalid "+dvbi.a_extensionName.attribute());
				}
			}
			
		}

		//check <Service><TargetRegion>
		var tr=0, TargetRegion;
		while (TargetRegion=service.get(xPath(SCHEMA_PREFIX, dvbi.e_TargetRegion, ++tr), SL_SCHEMA)) 
			if (!isIn(knownRegionIDs, TargetRegion.text())) 
				UnspecifiedTargetRegion(errs, TargetRegion.text(), "service "+thisServiceId.quote(), "SL121");

		// Check that the @xml:lang values for each <ServiceName> element are unique and only one element does not have any language specified
		checkXMLLangs(SL_SCHEMA, SCHEMA_PREFIX, dvbi.e_ServiceName, "service="+thisServiceId.quote(), service, errs, "SL122");

		// Check that the @xml:lang values for each <ProviderName> element are unique and only one element does not have any language specified
		checkXMLLangs(SL_SCHEMA, SCHEMA_PREFIX, dvbi.e_ProviderName, "service="+thisServiceId.quote(), service, errs, "SL123");

		//check <Service><RelatedMaterial>
		var rm=0, RelatedMaterial;
		while (RelatedMaterial=service.get(xPath(SCHEMA_PREFIX, tva.e_RelatedMaterial, ++rm), SL_SCHEMA)) 
			validateRelatedMaterial(RelatedMaterial, errs, "service "+thisServiceId.quote(), SERVICE_RM, SCHEMA_NAMESPACE);

		//check <Service><ServiceGenre>
		var ServiceGenre=service.get(xPath(SCHEMA_PREFIX, dvbi.e_ServiceGenre), SL_SCHEMA);
		if (ServiceGenre) {
			checkAttributes(ServiceGenre, [dvbi.a_href], [tva.a_type], errs, "SL102")
			if (ServiceGenre.attr(dvbi.a_href)) {
				if (!isIn(allowedGenres, ServiceGenre.attr(dvbi.a_href).value())) 
					errs.pushCode("SL124", "service "+thisServiceId.quote()+" has an invalid "+dvbi.a_href.attribute(dvbi.e_ServiceGenre)+" "+ServiceGenre.attr(dvbi.a_href).value().quote(), "invalid "+dvbi.e_ServiceGenre);
			}

			if (ServiceGenre.attr(tva.a_type)) {
				if (!isIn(tva.ALLOWED_GENRE_TYPES, ServiceGenre.attr(tva.a_type).value())) 
					errs.pushCode("SL125",  "service "+thisServiceId.quote()+" has an invalid "+tva.a_type.attribute(dvbi.e_ServiceGenre)+" "+ServiceGenre.attr(dvbi.a_type).value().quote(), "invalid "+dvbi.e_ServiceGenre)
			}
		}

		//check <Service><ServiceType>                    
		var ServiceType=service.get(xPath(SCHEMA_PREFIX, dvbi.e_ServiceType), SL_SCHEMA);
		if (ServiceType) {
			checkAttributes(ServiceType, [dvbi.a_href], [], errs, "SL105")
			if (ServiceType.attr(dvbi.a_href)) {
				if (!isIn(allowedServiceTypes, ServiceType.attr(dvbi.a_href).value())) 
					errs.pushCode("SL126", "service "+thisServiceId.quote()+" has an invalid "+dvbi.e_ServiceType.elementize()+" ("+ServiceType.attr(dvbi.a_href).value()+")", "invalid ServiceType");
			}
		}

		// check <Service><RecordingInfo>
		var RecordingInfo=service.get(xPath(SCHEMA_PREFIX, dvbi.e_RecordingInfo), SL_SCHEMA);
		if (RecordingInfo) {
			checkAttributes(RecordingInfo, [dvbi.a_href], [], errs, "SL107")
			if (RecordingInfo.attr(dvbi.a_href)) {
				if (!isIn(RecordingInfoCSvalules, RecordingInfo.attr(dvbi.a_href).value())) 
					errs.pushCode("SL127", "invalid "+dvbi.e_RecordingInfo.elementize()+" value "+RecordingInfo.attr(dvbi.a_href).value().quote()+"for service "+thisServiceId, "invalid RecordingInfo");
			}
		}

		// check <Service><ContentGuideSource>
		var sCG=service.get(xPath(SCHEMA_PREFIX, dvbi.e_ContentGuideSource), SL_SCHEMA);
		if (sCG) {
			validateAContentGuideSource(SL_SCHEMA, SCHEMA_PREFIX, SCHEMA_NAMESPACE, sCG, dvbi.e_ContentGuideSource.elementize()+" in service "+thisServiceId, errs, "SL128")
		}

		//check <Service><ContentGuideSourceRef>
		var sCGref=service.get(xPath(SCHEMA_PREFIX, dvbi.e_ContentGuideSourceRef), SL_SCHEMA);
		if (sCGref) {
			if (!isIn(ContentGuideSourceIDs, sCGref.text())) 
				errs.pushCode("SL129", "content guide reference "+sCGref.text().quote()+" for service "+thisServiceId.quote()+" not specified", "unspecified content guide source");
		}

		// this should not happen if the XML document has passed schema validation
		if (sCG && sCGref)
			errs.pushCode("SL130", "only "+dvbi.e_ContentGuideSource.elementize()+" or "+dvbi.e_CountentGuideSourceRef.elementize()+" to be specifed for a service "+thisServiceId.quote(), "source and ref");
		
		// <Service><ContentGuideServiceRef> checked below
	}        

	// check <Service><ContentGuideServiceRef>
	// issues a warning if this is not a reference to another service or is a reference to self
	s=0;
	while (service=SL.get("//"+xPath(SCHEMA_PREFIX, dvbi.e_Service, ++s), SL_SCHEMA)) {
		var CGSR=service.get(xPath(SCHEMA_PREFIX, dvbi.e_ContentGuideServiceRef), SL_SCHEMA);
		if (CGSR) {
			var uniqueID=service.get(xPath(SCHEMA_PREFIX, dvbi.e_UniqueIdentifier), SL_SCHEMA);
			if (uniqueID && !isIn(knownServices, CGSR.text())) 
				errs.pushCodeW("SL131", dvbi.e_ContentGuideServiceRef.elementize()+" "+CGSR.text().quote()+" in service "+uniqueID.text().quote()+" does not refer to another service", "invalid "+dvbi.e_ContentGuideServiceRef.elementize());
			if (uniqueID && (CGSR.text() == uniqueID.text()))
				errs.pushCodeW("SL132", dvbi.e_ContentGuideServiceRef.elementize()+" is self", "self "+dvbi.e_ContentGuideServiceRef.elementize());
		}
	}

	// check <ServiceList><LCNTableList>
	var LCNtableList=SL.get("//"+xPath(SCHEMA_PREFIX, dvbi.e_LCNTableList), SL_SCHEMA);
	if (LCNtableList) {
		var l=0, LCNTable;
		while (LCNTable=LCNtableList.get(xPath(SCHEMA_PREFIX, dvbi.e_LCNTable, ++l), SL_SCHEMA)) {
			// checks on TargetRegion(s) for this LCNTable
			var tr=0, TargetRegion, lastTargetRegion="";
			while (TargetRegion=LCNTable.get(xPath(SCHEMA_PREFIX, dvbi.e_TargetRegion, ++tr), SL_SCHEMA)) {
				if (!isIn(knownRegionIDs, TargetRegion.text())) 
					errs.pushCode("SL133", dvbi.e_TargetRegion.elementize()+" "+TargetRegion.text()+" in "+dvbi.e_LCNTable.elementize()+" is not defined", "undefined region");
				lastTargetRegion=TargetRegion.text();
			}
			
			var LCNNumbers=[],e=0,LCN;
			while (LCN=LCNTable.get(xPath(SCHEMA_PREFIX, dvbi.e_LCN, ++e), SL_SCHEMA)) {
				if (LCN.attr(dvbi.channelNumber)) {
					var chanNum=LCN.attr(dvbi.channelNumber).value();
					if (isIn(LCNNumbers, chanNum)) 
						errs.pushCode("SL134", "duplicated channel number "+chanNum+" for "+dvbi.e_TargetRegion.elementize()+" "+lastTargetRegion, "duplicate channel number");
					else LCNNumbers.push(chanNum);
				}

				if (LCN.attr(dvbi.a_serviceRef)) {
					var servRef=LCN.attr(dvbi.a_serviceRef).value();
					if (!isIn(knownServices, servRef)) 
						errs.pushCode("SL135", "LCN reference to unknown service "+servRef, "LCN unknown services");
				}
			}
		}
	}
}


/**
 * checks is the service list URL is provided in an argument to the query
 * 
 * @param {Object} req  The request from Express
 * @returns true if the SLurl parameter is specified containing the URL to a service list
 */
function checkQuery(req) {
    if (req.query) {
        if (req.query.SLurl)
            return true;
        
        return false;
    }
    return true;
}


/**
 * checks if the service list file name is provided in an argument to the query
 * 
 * @param {Object} req  The request from Express
 * @returns true if the SLfile parameter is specified containing the file name a service list
 */
function checkFile(req) {
    if (req.files) {
        if (req.files.SLfile)
            return true;
        
        return false;
    }
    return true;
}


/**
 * Process the service list specificed for errors and display them
 *
 * @param {Object} req  The request from Express
 * @param {Object} res  The HTTP response to be sent to the client
 */ 
function processQuery(req, res) {
    if (isEmpty(req.query)) {
        drawForm(true, res);  
    } else if (!checkQuery(req)) {
        drawForm(true, res, req.query.SLurl, "URL not specified");
        res.status(400);
    }
    else {
        var errs=new ErrorList();
	
		var xhttp=new XmlHttpRequest();
		xhttp.onreadystatechange=function() {
			if (this.readyState==this.DONE && this.status==200) 
				validateServiceList(xhttp.responseText.replace(/(\r\n|\n|\r|\t)/gm,""), errs);
			else             
				errs.pushCode("PR102", "retrieval of URL ("+xhttp.settings.url+") failed");
		};
		xhttp.open("GET", req.query.SLurl, false);
		xhttp.send();
		
        drawForm(true, res, req.query.SLurl, null, errs);
    }
    res.end()
}



/**
 * Process the service list specificed by a file name for errors and display them
 *
 * @param {Object} req  The request from Express
 * @param {Object} res  The HTTP response to be sent to the client
 */ 
function processFile(req, res) {
    if (isEmpty(req.query)) {
        drawForm(false, res);    
    } else if (!checkFile(req)) {
        drawForm(false, res, req.query.SLfile, "File not specified");
        res.status(400);
    }
    else {
        var SLxml=null;
        var errs=new ErrorList();
        try {
            SLxml=req.files.SLfile.data;
        }
        catch (err) {
            errs.pushCode("PR101", "retrieval of FILE ("+req.query.SLfile+") failed");
        }
		if (SLxml) 
			validateServiceList(SLxml.toString().replace(/(\r\n|\n|\r|\t)/gm,""), errs);

        drawForm(false, res, req.query.SLfile, null, errs);
    }
    res.end();
}


/**
 * synchronously read a file if it exists
 * 
 * @param {string} filename  The name of the file to read
 * @returns the contents of the file or "null" if the file does not exist
 */
function readmyfile(filename) {
    try {
        var stats=fs.statSync(filename);
        if (stats.isFile()) return fs.readFileSync(filename); 
    }
    catch (err) {console.log(err.code,err.path);}
    return null;
}

var app=express();

app.use(express.static(__dirname));
app.set('view engine', 'ejs');
app.use(fileupload());


morgan.token("protocol", function getProtocol(req) {
    return req.protocol;
});
morgan.token("parseErr",function getParseErr(req) {
    if (req.parseErr) return "("+req.parseErr+")";
    return "";
});
morgan.token("agent",function getAgent(req) {
    return "("+req.headers["user-agent"]+")";
});
morgan.token("slLoc",function getCheckedLocation(req) {
	if (req.files && req.files.SLfile) return "["+req.files.SLfile.name+"]";
    if (req.query.SLurl) return "["+req.query.SLurl+"]";
	return "[*]";
});

app.use(morgan(":remote-addr :protocol :method :url :status :res[content-length] - :response-time ms :agent :parseErr :slLoc"));


// parse command line options
const optionDefinitions=[
  {name: 'urls', alias: 'u', type: Boolean, defaultValue: false},
  {name: 'port', alias: 'p', type: Number, defaultValue:DEFAULT_HTTP_SERVICE_PORT },
  {name: 'sport', alias: 's', type: Number, defaultValue:DEFAULT_HTTP_SERVICE_PORT+1 }
]
 
const options=commandLineArgs(optionDefinitions);

// read in the validation data
loadDataFiles(options.urls);

// initialize Express
app.use(express.urlencoded({ extended: true }));

// handle HTTP POST requests to /check
app.post("/check", function(req,res) {
    req.query.SLurl=req.body.SLurl;
    processQuery(req,res);
});

// handle HTTP GET requests to /check
app.get("/check", function(req,res){
    processQuery(req,res);
});

// handle HTTP POST requests to /checkFile
app.post("/checkFile", function(req,res) {
    req.query.SLfile=req.body.SLfile;
    processFile(req,res);
});

// handle HTTP GET requests to /checkFile
app.get("/checkFile", function(req,res){
    processFile(req,res);
});

// dont handle any other requests
app.get("*", function(req,res) {
    res.status(404).end();
});


// start the HTTP server
var http_server=app.listen(options.port, function() {
    console.log("HTTP listening on port number", http_server.address().port);
});


// start the HTTPS server
// sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ./selfsigned.key -out selfsigned.crt
var https_options={
    key:readmyfile(keyFilename),
    cert:readmyfile(certFilename)
};

if (https_options.key && https_options.cert) {
	if (options.sport==options.port)
		options.sport=options.port+1;
	
    var https_server=https.createServer(https_options, app);
    https_server.listen(options.sport, function(){
        console.log("HTTPS listening on port number", https_server.address().port);
    });
}

