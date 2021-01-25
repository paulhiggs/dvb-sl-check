// node.js - https://nodejs.org/en/
// express framework - https://expressjs.com/en/4x/api.html
const express=require("express")

// pauls useful tools
const phlib=require('./phlib/phlib.js')

/* TODO:

 - also look for TODO in the code itself
*/
const MAX_UNSIGNED_SHORT=65535, 
      MAX_UNSIGNED_INT=  4294967295,
	  MAX_UNSIGNED_LONG= 18446744073709551615
	  
const OTHER_ELEMENTS_OK="!!!",
      ANY_NAMESPACE="$%$!!"

const ErrorList=require("./dvb-common/ErrorList.js")
const dvbi=require("./dvb-common/DVB-I_definitions.js")
const tva=require("./dvb-common/TVA_definitions.js")
const {isJPEGmime, isPNGmime}=require("./dvb-common/MIME_checks.js")
const {isTAGURI}=require("./dvb-common/URI_checks.js")
const {loadCS}=require("./dvb-common/CS_handler.js")

const ISOcountries=require("./dvb-common/ISOcountries.js")
const IANAlanguages=require("./dvb-common/IANAlanguages.js")

// libxmljs2 - github.com/marudor/libxmljs2
const libxml=require("libxmljs2")

//TODO: validation against schema; package.json: 		"xmllint": "0.1.1",
//const xmllint=require("xmllint")

// morgan - https://github.com/expressjs/morgan
const morgan=require("morgan")

// file upload for express - https://github.com/richardgirges/express-fileupload
const fileupload=require("express-fileupload")

// favourite icon - https://www.npmjs.com/package/serve-favicon
const favicon=require("serve-favicon")

const fs=require("fs"), path=require("path")

// command line arguments - https://github.com/75lb/command-line-args
const commandLineArgs=require('command-line-args')

// fetch API for node.js - https://www.npmjs.com/package/node-fetch
const fetch=require('node-fetch')

const https=require("https")
const DEFAULT_HTTP_SERVICE_PORT=3010
const keyFilename=path.join(".","selfsigned.key"), certFilename=path.join(".","selfsigned.crt")

const {parse}=require("querystring")

// https://github.com/alexei/sprintf.js
var sprintf=require("sprintf-js").sprintf,
    vsprintf=require("sprintf-js").vsprintf
const { isIPv4, isIPv6 } = require("net")
const { networkInterfaces } = require("os")

const DVB_COMMON_DIR="dvb-common", 
      COMMON_REPO_RAW="https://raw.githubusercontent.com/paulhiggs/dvb-common/master/",
      DVB_METADATA="https://dvb.org/metadata/"

const TVA_ContentCSFilename=path.join(DVB_COMMON_DIR, "tva","ContentCS.xml"),
	  TVA_ContentCSURL=COMMON_REPO_RAW + "tva/" + "ContentCS.xml",
	  
	  TVA_FormatCSFilename=path.join(DVB_COMMON_DIR, "tva","FormatCS.xml"),
	  TVA_FormatCSURL=COMMON_REPO_RAW + "tva/" + "FormatCS.xml",

	  TVA_PictureFormatCSFilename=path.join(DVB_COMMON_DIR, "tva","PictureFormatCS.xml"),
	  TVA_PictureFormatCSURL=COMMON_REPO_RAW + "tva/" + "PictureFormatCS.xml",

	  DVBI_ContentSubjectFilename=path.join(DVB_COMMON_DIR, "dvbi","DVBContentSubjectCS-2019.xml"),
	  DVBI_ContentSubjectURL=COMMON_REPO_RAW + "dvbi/" + "DVBContentSubjectCS-2019.xml",
	  
	  DVBI_ServiceTypeCSFilename=path.join(DVB_COMMON_DIR, "dvbi","DVBServiceTypeCS-2019.xml"),
	  DVBI_ServiceTypeCSURL=COMMON_REPO_RAW + "dvbi/" + "DVBServiceTypeCS-2019.xml",

	  DVB_AudioCodecCSFilename=path.join(DVB_COMMON_DIR, "dvb/cs/2007","AudioCodecCS.xml"),
	  DVB_AudioCodecCSURL=DVB_METADATA + "cs/2007/" + "AudioCodecCS.xml",

	  DVB_AudioCodecCS2020Filename=path.join(DVB_COMMON_DIR, "dvb/cs/2020","AudioCodecCS.xml"),
	  DVB_AudioCodecCS2020URL=DVB_METADATA + "cs/2020/" + "AudioCodecCS.xml",

	  DVB_VideoCodecCSFilename=path.join(DVB_COMMON_DIR, "dvb/cs/2007","VideoCodecCS.xml"),
	  DVB_VideoCodecCSURL=DVB_METADATA + "cs/2007/" + "VideoCodecCS.xml",

	  DVB_VideoCodecCS2020Filename=path.join(DVB_COMMON_DIR, "dvb/cs/2020","VideoCodecCS.xml"),
	  DVB_VideoCodecCS2020URL=DVB_METADATA + "cs/2020/" + "VideoCodecCS.xml",

	  MPEG7_AudioCodingFormatCSFilename=path.join(DVB_COMMON_DIR, "mpeg7","AudioCodingFormatCS.xml"),
	  MPEG7_AudioCodingFormatCSURL=COMMON_REPO_RAW + "mpeg7/" + "AudioCodingFormatCS.xml",

	  MPEG7_VisualCodingFormatCSFilename=path.join(DVB_COMMON_DIR, "mpeg7","VisualCodingFormatCS.xml"),
	  MPEG7_VisualCodingFormatCSURL=COMMON_REPO_RAW + "mpeg7/" + "VisualCodingFormatCS.xml",

	  MPEG7_AudioPresentationCSFilename=path.join(DVB_COMMON_DIR, "mpeg7", "AudioPresentationCS.xml"),
	  MPEG7_AudioPresentationCSURL=COMMON_REPO_RAW + "mpeg7/" + "AudioPresentationCS.xml",

	  DVB_AudioConformanceCSFilename=path.join(DVB_COMMON_DIR, "dvb/cs/2017","AudioConformancePointsCS.xml"),
	  DVB_AudioConformanceCSURL=DVB_METADATA + "cs/2017/" + "AudioConformancePointsCS.xml",

	  DVB_VideoConformanceCSFilename=path.join(DVB_COMMON_DIR, "dvb/cs/2017","VideoConformancePointsCS.xml"),
	  DVB_VideoConformanceCSURL=DVB_METADATA + "cs/2017/" + "VideoConformancePointsCS.xml",

	  ISO3166_Filename=path.join(DVB_COMMON_DIR, "iso3166-countries.json"),
	  ISO3166_URL=COMMON_REPO_RAW + "iso3166-countries.json",

	  DVBI_RecordingInfoCSFilename=path.join(DVB_COMMON_DIR, "dvbi","DVBRecordingInfoCS-2019.xml"),
	  DVBI_RecordingInfoCSURL=COMMON_REPO_RAW + "dvbi/" + "DVBRecordingInfoCS-2019.xml"

// curl from https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry
const IANA_Subtag_Registry_Filename=path.join(DVB_COMMON_DIR, "language-subtag-registry"),
      IANA_Subtag_Registry_URL="https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry"

const SERVICE_LIST_RM="service list",
      SERVICE_RM="service",
	  SERVICE_INSTANCE_RM="service instance",
      CONTENT_GUIDE_RM="content guide"

var allowedGenres=[], allowedServiceTypes=[], allowedAudioSchemes=[], allowedVideoSchemes=[], 
	allowedAudioConformancePoints=[], allowedVideoConformancePoints=[], RecordingInfoCSvalules=[],
	allowedPictureFormats=[], AudioPresentationCS=[]

var knownCountries=new ISOcountries(false, true)
var knownLanguages=new IANAlanguages()

/*
//TODO: validation against schema
const DVBI_ServiceListSchemaFilename_v1=path.join("schema","dvbi_v1.0.xsd");
var SLschema_v1;
const DVBI_ServiceListSchemaFilename_v2=path.join("schema","dvbi_v2.0.xsd");
var SLschema_v2;
const DVBI_ServiceListSchemaFilename_v3=path.join("schema","dvbi_v3.0.xsd");
var SLschema_v3;
const TVA_SchemaFilename=path.join("schema","tva_metadata_3-1.xsd");
const MPEG7_SchemaFilename=path.join("schema","tva_mpeg7.xsd");
const XML_SchemaFilename=path.join("schema","xml.xsd");
var TVAschema, MPEG7schema, XMLschema;
*/

require('./phstrings.js')


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
 * @returns {boolean} true if value is in the set of values
 */
function isIn(values, value){
    if (typeof(values)=="string")
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
			errs.pushCode(errCode?errCode+"-1":"CL001", (loc?loc:"language")+" value "+lang.quote()+" is invalid", "invalid language")
			break;
		case knownLanguages.languageRedundant:
			errs.pushCodeW(errCode?errCode+"-2":"CL002", (loc?loc:"language")+" value "+lang.quote()+" is redundant", "redundant language")
			break;	
	}
}




/*
//TODO: validation against schema
// for the libxml method
function loadSchema(into, schemafilename) {
	fs.readFile(schemafilename, {encoding: "utf-8"}, function(err,data){
        if (!err) {
			into=libxml.parseXml(data.replace(/(\r\n|\n|\r|\t)/gm,""));
		}
	});
}
*/

/**
 * loads necessary classification schemes for validation
 *
 * @param {boolean} useURLs use network locations as the source rather than local files
 */
function loadCSfromURL(values, csURL, leafNodesOnly=false) { 
	console.log("retrieving CS from", csURL, "via Fetch()")
	
	function handleErrors(response) {
		if (!response.ok) {
			throw Error(response.statusText)
		}
		return response
	}
	
	fetch(csURL)
		.then(handleErrors)
		.then(response => response.text())
		.then(strXML => loadClassificationScheme(values, libxml.parseXmlString(strXML), leafNodesOnly))
		.catch(error => console.log("error ("+error+") retrieving "+csURL))
}


/**
 * loads in the configuration files for the validator, loading the appropriate global variables
 * 
 * @param {boolean} useURLs if true then configuration data should be loaded from network locations otherwise, load from local files 
 */
function loadDataFiles(useURLs) {
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

/*
//TODO: validation against schema
	console.log("loading schemas...");
	loadSchema(SLschema_v1, DVBI_ServiceListSchemaFilename_v1);
	loadSchema(SLschema_v2, DVBI_ServiceListSchemaFilename_v2);
	loadSchema(SLschema_v3, DVBI_ServiceListSchemaFilename_v3);

 //   SLschema_v1=fs.readFileSync(DVBI_ServiceListSchemaFilename_v1);
 //   SLschema_v2=fs.readFileSync(DVBI_ServiceListSchemaFilename_v2);
 //   SLschema_v3=fs.readFileSync(DVBI_ServiceListSchemaFilename_v3);
 //   TVAschema=fs.readFileSync(TVA_SchemaFilename);
 //   MPEG7schema=fs.readFileSync(MPEG7_SchemaFilename);
 //   XMLschema=fs.readFileSync(XML_SchemaFilename);
*/
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
 *
 * @param {String} postcode  the postcode value to check
 * @returns {boolean} true if the postcode argument is a valid postcode , otherwise false 
 */
function isPostcode(postcode) {
	if (!postcode) return false

	let p=postcode.trim()
	const postcodeRegex=/[A-Za-z\d]+([\- ][A-Za-z\d]+)?/
	
	let s=p.match(postcodeRegex);
	return s?s[0]===p:false;
}


/**
 *
 * @param {String} postcode  the postcode value to check
 * @returns {boolean} true if the postcode argument is a valid wildcarded postcode , otherwise false 
 */
function isWildcardPostcode(postcode) {
	if (!postcode) return false

	let p=postcode.trim()
	const WildcardRegex=/(\*[A-Za-z\d]*[\- ]?[A-Za-z\d]+)|(([A-Za-z\d]+\*[\- ]?[A-Za-z\d]+)|([A-Za-z\d]+[\- ]?\*[A-Za-z\d]+))|([A-Za-z\d]+[\- ]?[A-Za-z\d]*\*)/

	let s=p.match(WildcardRegex)
	return 	s&&s[0]===p
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
	
    let regionID=Region.attr(dvbi.a_regionID)?Region.attr(dvbi.a_regionID).value():""
	if (regionID!="") {
		if (isIn(knownRegionIDs, regionID)) 
			errs.pushCode("AR003", "Duplicate "+dvbi.a_regionId.attribute()+" "+regionID.quote(), "duplicate regionID")
		else knownRegionIDs.push(regionID)
	}
    let countryCodesSpecified=Region.attr(dvbi.a_countryCodes)
    if ((depth!=0) && countryCodesSpecified) 
        errs.pushCode("AR004", dvbi.a_countryCodes.attribute(Region.name())+" not permitted for sub-region "+regionID.quote(), "ccode in subRegion")

    if (countryCodesSpecified) {
        let countries=countryCodesSpecified.value().split(",")
        if (countries) 
			countries.forEach(country => {
				if (!knownCountries.isISO3166code(country)) 
					errs.pushCode("AR005", "invalid country code ("+country+") for region "+regionID.quote(), "invalid country code")
			})
    }

	checkXMLLangs(SL_SCHEMA, SCHEMA_PREFIX, dvbi.e_RegionName, dvbi.a_regionID.attribute(dvbi.e_Region)+"="+regionID.quote(), Region, errs, "AR006")
	
	// <Region><Postcode>
	let pc=0, Postcode
	while (Postcode=Region.get(xPath(SCHEMA_PREFIX, dvbi.e_Postcode, ++pc), SL_SCHEMA)) {
		if (!isPostcode(Postcode.text()))
			errs.pushCode("AR011", Postcode.text().quote()+" is not a valid postcode", "invalid postcode")
	}
	
	// <Region><WildcardPostcode>
	let wp=0, WildcardPostcode
	while (WildcardPostcode=Region.get(xPath(SCHEMA_PREFIX, dvbi.e_WildcardPostcode, ++wp), SL_SCHEMA)) {
		if (!isWildcardPostcode(WildcardPostcode.text()))
			errs.pushCode("AR021", WildcardPostcode.text().quote()+" is not a valid wildcarded postcode", "invalid postcode")		
	}
	
	// <Region><PostcodeRange>
	let pr=0, PostcodeRange
	while (PostcodeRange=Region.get(xPath(SCHEMA_PREFIX, dvbi.e_PostcodeRange, ++pr), SL_SCHEMA)) {
		checkAttributes(PostcodeRange, [dvbi.a_from, dvbi.a_to], [], errs, "AR031")
		if (PostcodeRange.attr(dvbi.a_from) && !isPostcode(PostcodeRange.attr(dvbi.a_from).value()))
			errs.pushCode("AR032", PostcodeRange.attr(dvbi.a_from).value().quote()+" is not a valid postcode", "invalid postcode")
		if (PostcodeRange.attr(dvbi.a_to) && !isPostcode(PostcodeRange.attr(dvbi.a_to).value()))
			errs.pushCode("AR033", PostcodeRange.attr(dvbi.a_to).value().quote()+" is not a valid postcode", "invalid postcode")
	}
	
	// <Region><Coordinates>
	let co=0, Coordinates
	while (Coordinates=Region.get(xPath(SCHEMA_PREFIX, dvbi.e_Coordinates, ++co), SL_SCHEMA)) {
		checkTopElements(SL_SCHEMA, SCHEMA_PREFIX, Coordinates, [dvbi.e_Latitude, dvbi.e_Longitude, dvbi.e_Radius], [], errs, "AR041")

		let Latitude=Coordinates.get(xPath(SCHEMA_PREFIX, dvbi.e_Latitude), SL_SCHEMA)
		if (Latitude && !validLatitude(Latitude))
			errs.pushCode("AR042", dvbi.e_Latitude.elementize()+" is not a valid latitude "+Latitude.quote(), "invalid value")

		let Longitude=Coordinates.get(xPath(SCHEMA_PREFIX, dvbi.e_Longitude), SL_SCHEMA)
		if (Longitude && !validLongitude(Longitude))
			errs.pushCode("AR043", dvbi.e_Longitude.elementize()+" is not a valid longitude "+Longitude.quote(), "invalid value")
			
		let Raduis=Coordinates.get(xPath(SCHEMA_PREFIX, dvbi.e_Radius), SL_SCHEMA)
		if (Radius && !isPositiveInteger(Radius))
			errs.pushCode("AR044", dvbi.e_Radius.elementize()+" is not a valid value "+Radius.quote(), "invalid value")
	}

    if (depth > dvbi.MAX_SUBREGION_LEVELS) 
        errs.pushCode("AR007", dvbi.e_Region.elementize()+" depth exceeded (>"+dvbi.MAX_SUBREGION_LEVELS+") for sub-region "+regionID.quote(), "region depth exceeded")

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
 * check if the argument is in the correct format for an DVB-I extension identifier
 *
 * @param {string} ext  the signalled extensionName
 * @returns {boolean} true if the signalled extensionName is in the specification defined format, else false
 */
function validExtensionName(ext) {
	const ExtensionRegex=/[A-Za-z\d][A-Za-z\d:\-/\.]*[A-Za-z\d]/g
    let s=ext.trim().match(ExtensionRegex)
    return s?s[0]===ext:false
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
	let s1=str.trim().match(FrameRateRegex1), 
	    s2=str.trim().match(FrameRateRegex2)
	
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

    let isJPEG=false, isPNG=false    
    // if <Format> is specified, then it must be per A177 5.2.6.1, 5.2.6.2 or 5.2.6.3 -- which are all the same
    if (Format) {
        let subElems=Format.childNodes(), 
		    hasStillPictureFormat=false
        if (subElems) subElems.forEach(child => {
            if (child.type()=='element' && child.name()==dvbi.e_StillPictureFormat) {
                hasStillPictureFormat=true;
				checkAttributes(child, [dvbi.a_href], [dvbi.a_horizontalSize, dvbi.a_verticalSize], errs, "VL015")
                if (!child.attr(dvbi.a_horizontalSize)) 
                    errs.pushCode("VL010", dvbi.a_horizontalSize.attribute()+" not specified for "+tva.e_RelatedMaterial.elementize()+tva.e_Format.elementize()+dvbi.e_StillPictureFormat.elementize()+" in "+Location, "no "+dvbi.a_horizontalSize.attribute());
                if (!child.attr(dvbi.a_verticalSize)) 
                    errs.pushCode("VL011", dvbi.a_verticalSize.attribute()+" not specified for "+tva.e_RelatedMaterial.elementize()+tva.e_Format.elementize()+dvbi.e_StillPictureFormat.elementize()+" in "+Location, "no "+dvbi.a_verticalSize.attribute());
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
							InvalidHrefValue(href, tva.e_RelatedMaterial.elementize()+tva.e_Format.elementize()+dvbi.e_StillPictureFormat.elementize(), Location, errs, "VL012")
					}
                } 
            }
        });
        if (!hasStillPictureFormat) 
            errs.pushCode("VL014", dvbi.e_StillPictureFormat.elementize()+" not specified for "+tva.e_Format.elementize()+" in "+Location, "no StillPictureFormat");
    }

    if (MediaLocator) {
        let subElems=MediaLocator.childNodes(), hasMediaURI=false
        if (subElems) subElems.forEach(child => {
            if (child.type()=='element' && child.name()==tva.e_MediaUri) {
                hasMediaURI=true;
				checkAttributes(child, [tva.a_contentType], [tva.a_uriType], errs, "VL021")
				
                if (child.attr(tva.a_contentType)) {
                    let contentType=child.attr(tva.a_contentType).value();
                    if (!isJPEGmime(contentType) && !isPNGmime(contentType))
                        errs.pushCode("VL022", "invalid "+tva.a_contentType.attribute()+" "+contentType.quote()+" specified for "+tva.e_RelatedMaterial.elementize()+tva.e_MediaLocator.elementize()+" in "+Location, "invalid "+tva.a_contentType.attribute(tva.e_MediaUri));
                    if (Format && ((isJPEGmime(contentType) && !isJPEG) || (isPNGmime(contentType) && !isPNG))) 
                        errs.pushCode("VL023", "conflicting media types in "+tva.e_Format.elementize()+" and "+tva.e_MediaUri.elementize()+" for "+Location, "conflicting mime types");					
				}
				if (!isHTTPURL(child.text())) 
					errs.pushCode("VL024", "invalid URL "+child.text().quote()+" specified for "+child.name().elementize(), "invalid resource URL")
            }
        });
        if (!hasMediaURI) 
			NoMediaLocator("logo", Location, errs, "VL025")
    }
    else errs.pushCode("VL026", tva.e_MediaLocator+" not specified for "+tva.e_RelatedMaterial.elementize()+" in "+Location, "no "+tva.e_MediaLocator)
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
	
    if (!MediaLocator) 
		NoMediaLocator("application", Location, errs, "SA001");
	else {
        let subElems=MediaLocator.childNodes(), hasMediaURI=false
        if (subElems) subElems.forEach(child => {
            if (child.type()=='element' && child.name()==tva.e_MediaUri) {
                hasMediaURI=true;
				checkAttributes(child, [tva.a_contentType], [tva.a_uriType], errs, "SA002")
                if (child.attr(tva.a_contentType)) {
					if (!validApplicationType(child.attr(tva.a_contentType).value)) 
                        errs.pushCodeW("SA003", tva.a_contentType.attribute()+" "+child.attr(tva.a_contentType).value().quote()+" is not DVB AIT for "+tva.e_RelatedMaterial.elementize()+tva.e_MediaLocator.elementize()+" in "+Location, "invalid "+tva.a_contentType.attribute(tva.e_MediaUri));
				}
				if (!isHTTPURL(child.text())) 
					errs.pushCode("SA004", "invalid URL "+child.text().quote()+" specified for "+child.name().elementize(), "invalid resource URL")
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
		errs.pushCode("RM000", "validateRelatedMaterial() called with RelatedMaterial==null", "invalid args")
		return rc;
	}
	
    let HowRelated=null, Format=null, MediaLocator=[]
	let elems=RelatedMaterial.childNodes()
	if (elems) elems.forEach(elem => {
		if (elem.type()=='element')
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
        errs.pushCode(errcode?errcode+"-1":"RM001", tva.e_HowRelated.elementize()+" not specified for "+tva.e_RelatedMaterial.elementize()+" in "+Location, "no "+tva.e_HowRelated);
		return rc
    }
	checkAttributes(HowRelated, [dvbi.a_href], [], errs, errcode?errcode+"-2":"RM002")

	if (HowRelated.attr(dvbi.a_href)) {	
		switch (LocationType) {
			case SERVICE_LIST_RM: 
				if (validServiceListLogo(HowRelated, SCHEMA_NAMESPACE)) {
					rc=HowRelated.attr(dvbi.a_href).value()
					MediaLocator.forEach(locator => 
						checkValidLogo(HowRelated, Format, locator, errs, Location, LocationType))
				}
				else
					InvalidHrefValue(HowRelated.attr(dvbi.a_href).value(), tva.e_RelatedMaterial.elementize(), Location, errs, errcode?errcode+"-11":"RM011")	
				break;
			case SERVICE_RM:
			case SERVICE_INSTANCE_RM:
				if (validContentFinishedBanner(HowRelated, ANY_NAMESPACE) && (SchemaVersion(SCHEMA_NAMESPACE)==SCHEMA_v1)) 
					errs.pushCode(errcode?errcode+"-21":"RM021", HowRelated.attr(dvbi.href).value().quote()+" not permitted for "+SCHEMA_NAMESPACE.quote()+" in "+Location, "invalid CS value")
				
				if (validOutScheduleHours(HowRelated, SCHEMA_NAMESPACE) || validContentFinishedBanner(HowRelated, SCHEMA_NAMESPACE) || validServiceApplication(HowRelated) || validServiceLogo(HowRelated, SCHEMA_NAMESPACE)) {
					rc=HowRelated.attr(dvbi.a_href).value()
					if (validServiceLogo(HowRelated, SCHEMA_NAMESPACE) || validOutScheduleHours(HowRelated, SCHEMA_NAMESPACE))
						MediaLocator.forEach(locator =>
							checkValidLogo(HowRelated, Format, locator, errs, Location, LocationType));
					if (validServiceApplication(HowRelated))
						MediaLocator.forEach(locator =>
							checkSignalledApplication(HowRelated, Format, locator, errs, Location, LocationType));
				}
				else 
					InvalidHrefValue(HowRelated.attr(dvbi.a_href).value(), tva.e_RelatedMaterial.elementize(), Location, errs, errcode?errcode+"-22":"RM022")
				break;
			case CONTENT_GUIDE_RM:
				if (validContentGuideSourceLogo(HowRelated, SCHEMA_NAMESPACE)) {
					rc=HowRelated.attr(dvbi.a_href).value()
					MediaLocator.forEach(locator =>
						checkValidLogo(HowRelated, Format, locator, errs, Location, LocationType))
				}
				else
					InvalidHrefValue(HowRelated.attr(dvbi.a_href).value(), tva.e_RelatedMaterial.elementize(), Location, errs, errcode?errcode+"-31":"RM031")
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
		errs.pushCode(errCode?errCode+"-0":"XL000", "checkXMLLangs() called with node==null", "invalid args")
		return;
	}
    let elementLanguages=[], i=0, elem
    while (elem=node.get(xPath(SCHEMA_PREFIX, elementName, ++i), SL_SCHEMA)) {
		let lang=elem.attr(dvbi.a_lang)?elem.attr(dvbi.a_lang).value():"unspecified"
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
    for(let key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}


/**
 * checks of the specified argument matches an HTTP or HTTPS URL (or no protocol is specified)
 *
 * @param {string} arg  The value whose format is to be checked
 * @returns {boolean} true if the argument is an HTTP URL
 */
function isURL(arg) {
	let pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
		'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
		'((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
		'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
		'(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
		'(\\#[-a-z\\d_]*)?$','i') // fragment locator
	return pattern.test(arg)
}


/**
 * checks of the specified argument matches an HTTP(s) URL where the protocol is required to be provided
 *
 * @param {string} arg  The value whose format is to be checked
 * @returns {boolean} true if the argument is an HTTP URL
 */
function isHTTPURL(arg) {
	let pattern = new RegExp('^(https?:\\/\\/)'+ // protocol
		'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
		'((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
		'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
		'(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
		'(\\#[-a-z\\d_]*)?$','i') // fragment locator
	return pattern.test(arg)
}

/**
 * checks of the specified argument matches an domain name (RFC 1034)
 *
 * @param {string} arg  The value whose format is to be checked
 * @returns {boolean} true if the argument is a domain name
 */
function isDomainName(arg) {
	if (!arg) return false
	const DomainNameRegex=/^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/gi
	let s=arg.trim().match(DomainNameRegex)
    return s?s[0]===arg:false
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
	const RTSPRegex=/rtsp:\/\/.*/gi
    let s=arg.trim().match(RTSPRegex)
    return s?s[0]===arg:false;	
}

/**
 * determine if the value provided represents a valid unsignedShort (between 0 and 65535)
 *
 * @param {String}  Value a string containing a integer
 * @returns {boolean} true if the argument represents a positiveInteger - https://www.w3.org/TR/xmlschema-2/#unsignedShort
 */
function isUnsignedShort(arg) {
	if (!arg || arg=="") return false
	let val=parseInt(arg)
	return !(isNaN(val) || val<0 || val>MAX_UNSIGNED_SHORT)
}


/**
 * determine if the value provided represents a valid nonNegativeInteger 
 *
 * @param {String}  Value a string containing a integer
 * @returns {boolean} true if the argument represents a positiveInteger - https://www.w3.org/TR/xmlschema-2/#unsignedShort
 */
function isNonNegativeInteger(arg) {
	if (!arg || arg=="") return false
    let s=arg.trim().match(/\d+/g)
    return s?s[0]===arg:false
}


/**
 * determine if the value provided represents a valid positiveInteger (greater than or equal to 1)
 *
 * @param {String}  Value a string containing a integer
 * @returns {boolean} true if the argument represents a positiveInteger - https://www.w3.org/TR/xmlschema-2/#positiveInteger
 */
function isPositiveInteger(value) {
	let x=Number(value)
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
	if (!arg || arg=="") return false
	let val=parseInt(arg)
	return !(isNaN(val) || val<0 || val>MAX_UNSIGNED_INT)
}


/**
 * determine if the value provided represents a valid unsignedLong
 *
 * @param {String}  Value a string containing a integer
 * @returns {boolean} true if the argument represents a positiveInteger - https://www.w3.org/TR/xmlschema-2/#unsignedInt
 */
function isUnsignedLong(arg) {
	if (!arg || arg=="") return false
	let val=parseInt(arg)
	return !(isNaN(val) || val<0 || val>MAX_UNSIGNED_LONG)
}


/**
 * determine if the value provided represents a valid boolean value
 *
 * @param {String}  Value a string containing a boolean
 * @returns {boolean} true if the argument represents a boolean - https://www.w3.org/TR/xmlschema-2/#boolean
 */
function isBoolean(arg) {
	return (arg=="true" || arg=="false" || arg=="1" || arg==1 || arg=="0" || arg==0 )
}


/**
 * constructs HTML output of the errors found in the service list analysis
 *
 * @param {boolean} URLmode    If true ask for a URL to a service list, if false ask for a file
 * @param {Object}  res        The Express result 
 * @param {string}  lastInput  The url of the service list - used to keep the form intact
 * @param {string}  error      a single error message to display on the form, genrrally related to loading the content to validate
 * @param {Object}  errors     the errors and warnings found during the content guide validation
 * @returns {Promise} the output stream (res) for further async processing
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
	
	res.write(sprintf(URLmode?ENTRY_FORM_URL:ENTRY_FORM_FILE, lastInput?lastInput:""))
/*    if (URLmode) 
		res.write(sprintf(ENTRY_FORM_URL, lastInput?lastInput:""));
	else res.write(sprintf(ENTRY_FORM_FILE, lastInput?lastInput:"")); */

    res.write(RESULT_WITH_INSTRUCTION);

	if (error) 
		res.write("<p>"+error+"</p>");
	let resultsShown=false
	if (errors) {
		let tableHeader=false
		for (let i in errors.counts) {
			if (errors.counts[i]!=0) {
				if (!tableHeader) {
					res.write(SUMMARY_FORM_HEADER);
					tableHeader=true;
				}
				res.write("<tr><td>"+phlib.HTMLize(i)+"</td><td>"+errors.counts[i]+"</td></tr>");
				resultsShown=true;
			}
		}
		for (let i in errors.countsWarn) {
			if (errors.countsWarn[i]!=0) {
				if (!tableHeader) {
					res.write(SUMMARY_FORM_HEADER);
					tableHeader=true;
				}
				res.write("<tr><td><i>"+phlib.HTMLize(i)+"</i></td><td>"+errors.countsWarn[i]+"</td></tr>");
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
			if (value.includes(errors.delim)) {
				let x=value.split(errors.delim)
				res.write("<tr><td>"+x[0]+"</td><td>"+phlib.HTMLize(x[1])+"</td></tr>");	
			}
			else 
				res.write("<tr><td></td><td>"+phlib.HTMLize(value)+"</td></tr>");
			resultsShown=true;
		});
		if (tableHeader) res.write("</table>");
		
		tableHeader=false;
		errors.messagesWarn.forEach(function(value) {
			if (!tableHeader) {
				res.write("<table><tr><th>code</th><th>warnings</th></tr>");
				tableHeader=true;                    
			}
			if (value.includes(errors.delim)) {
				let x=value.split(errors.delim)
				res.write("<tr><td>"+x[0]+"</td><td>"+phlib.HTMLize(x[1])+"</td></tr>");	
			}
			else 
				res.write("<tr><td></td><td>"+phlib.HTMLize(value)+"</td></tr>");

			resultsShown=true;
		});
		if (tableHeader) res.write("</table>");        
	}
	if (!error && !resultsShown) res.write("no errors or warnings");
	
	res.write(FORM_BOTTOM);
	
	return new Promise((resolve, reject) => {
		resolve(res)
	})
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
    errs.pushCode(errCode?errCode:"XX101", source+" delivery parameters not specified for service instance in service "+serviceId.quote(), "no delivery params")
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
	errs.pushCode(errCode?errCode:"XX103", "invalid "+dvbi.a_href.attribute()+"="+value.quote()+" specified for "+src+" in "+loc, "invalid href")
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
	errs.pushCode(errCode?errCode:"XX104", "invalid country code "+value.quote()+" for "+src+" parameters in "+loc, "invalid country code")
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
	errs.pushCode(errCode?errCode:"XX105", loc+" has an unspecified "+dvbi.e_TargetRegion.elementize()+" "+region.quote(), "target region")	
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
	errs.pushCode(errCode?errCode:"XX106", tva.e_MediaUri.elementize()+" not specified for "+src+" "+tva.e_MediaLocator.elementize()+" in "+loc, "no "+tva.e_MediaUri)
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
	errs.pushCode(errcode, "Invalid value "+(invValue?(invValue.quote()+" "):"")+"for "+(attribName?attribName.attribute(elementName):elementName.elementize())+(parentElementName?" in "+parentElementName.elementize():""), "invalid value")	
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
	let initialErrorCount=errs.length, 
		thisElem=((elem&&elem.parent()&&(typeof elem.parent().name==='function'))?elem.parent().name().elementize():"")+elem.name().elementize();
	
	// check that each of the specifid childElements exists
	mandatoryChildElements.forEach(elemS => {
		if (!elem.get(xPath(SCHEMA_PREFIX, elemS), SL_SCHEMA)) 
			errs.pushCode(errCode?errCode+"-1":"TE001", "Mandatory element "+elemS.elementize()+" not specified in "+thisElem);
	});
	
	// check that no additional child elements existance if the "Other Child Elements are OK" flag is not set
	if (!isIn(optionalChildElements, OTHER_ELEMENTS_OK)) {
		let c=0, ch, children=elem.childNodes()
		if (children) children.forEach(ch => {
			if (ch.type()=='element') {
				let childName=ch.name()
				if (!isIn(mandatoryChildElements, childName) && !isIn(optionalChildElements, childName)) 		
					errs.pushCode(errCode?errCode+"-2":"TE002", "Element "+childName.elementize()+" is not permitted in "+thisElem);
			}
		})
	}
	return errs.length==initialErrorCount;
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
	if (!elem)
		errs.pushCode(errCode?errCode+"-1":"AT001", "checkAttributes() called with elem==null")

	if (!requiredAttributes) 
		errs.pushCode(errCode?errCode+"-2":"AT002", "checkAttributes() called with requiredAttributes==null")
		
	if (!elem || !requiredAttributes)
		return;
		
	requiredAttributes.forEach(attributeName => {
		if (!elem.attr(attributeName)) {
			let src=(typeof elem.parent()=='object' && typeof elem.parent().name=='function' ? elem.parent().name()+"." : "")
			errs.pushCode(errCode?errCode+"-10":"AT010", src+attributeName.attribute(typeof elem.name=='function'?elem.name():"")+" is a required attribute");	
		}
	});
	
	elem.attrs().forEach(attribute => {
		if (!isIn(requiredAttributes, attribute.name()) && !isIn(optionalAttributes, attribute.name()))
			errs.pushCode(errCode?errCode+"-11":"AT011", 
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
			invalidValue(errs, errCode?errCode:"AtV001", parentElemName, attr.name(), attr.value())
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
 * @param {String} position  A string containing a longitude
 * @returns {boolean} true if the argument represents a longitudal angle
 */
function validLongitude(position) {
	let val=Number(position)
	if (isNaN(val)) return false
	return (val >= -180 && val <= 180)
}


/**
 * determine if the value provided represents a valid latitude value (i.e. -90.0 -> +90.0)
 *
 * @param {String} position  A string containing a latitude
 * @returns {boolean} true if the argument represents a latidudial angle
 */
function validLatitude(position) {
	let val=Number(position)
	if (isNaN(xval)) return false
	return (val >= -90 && val <= 90)
}


/**
 * determine if the value provided represents a valid transmission frequency
 *
 * @param {String} intStr  A string containing a frequency
 * @returns {boolean} true if the argument represents a frequency (anything greter than 0Hz)
 */
function validFrequency(freq) {
	let val=cleanInt(freq)
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
	
	checkTopElements(SL_SCHEMA, SCHEMA_PREFIX, source, [dvbi.e_ProviderName, dvbi.e_ScheduleInfoEndpoint], [dvbi.e_Name, tva.e_RelatedMaterial, dvbi.e_ProgramInfoEndpoint, dvbi.e_GroupInfoEndpoint, dvbi.e_MoreEpisodesEndpoint], errs, errCode?errCode+"a":"GS001")
	checkAttributes(source, [dvbi.a_CGSID], [dvbi.a_minimumMetadataUpdatePeriod], errs, errCode?errCode+"b":"GS002")

	checkXMLLangs(SL_SCHEMA, SCHEMA_PREFIX, dvbi.e_Name, loc, source, errs, errCode?errCode+"c":"GS003")
	checkXMLLangs(SL_SCHEMA, SCHEMA_PREFIX, dvbi.e_ProviderName, loc, source, errs, errCode?errCode+"d":"GS004")
	
	let rm=0, RelatedMaterial;
	while (RelatedMaterial=source.get(xPath(SCHEMA_PREFIX, tva.e_RelatedMaterial, ++rm), SL_SCHEMA))
		validateRelatedMaterial(RelatedMaterial, errs, loc, CONTENT_GUIDE_RM, SCHEMA_NAMESPACE, errCode?errCode+"e":"GS005")
	
	// ContentGuideSourceType::ScheduleInfoEndpoint - should be a URL
	let sie=source.get(xPath(SCHEMA_PREFIX, dvbi.e_ScheduleInfoEndpoint), SL_SCHEMA)
	if (sie && !isURL(sie.text()))
		errs.pushCode(errCode?errCode+"f":"GS006", dvbi.e_ScheduleInfoEndpoint.elementize()+" is not a valud URL", "not URL")
	
	// ContentGuideSourceType::ProgramInfoEndpoint - should be a URL
	let pie=source.get(xPath(SCHEMA_PREFIX, dvbi.e_ProgramInfoEndpoint), SL_SCHEMA)
	if (pie && !isURL(pie.text()))
		errs.pushCode(errCode?errCode+"g":"GS007", dvbi.e_ProgramInfoEndpoint.elementize()+" is not a valud URL", "not URL")
	
	// ContentGuideSourceType::GroupInfoEndpoint - should be a URL
	let gie=source.get(xPath(SCHEMA_PREFIX, dvbi.e_GroupInfoEndpoint), SL_SCHEMA)
	if (gie && !isURL(gie.text()))
		errs.pushCode(errCode?errCode+"h":"GS008", dvbi.e_GroupInfoEndpoint.elementize()+" is not a valud URL", "not URL")
	
	// ContentGuideSourceType::MoreEpisodesEndpoint - should be a URL
	let mee=source.get(xPath(SCHEMA_PREFIX, dvbi.e_MoreEpisodesEndpoint), SL_SCHEMA)
	if (mee && !isURL(mee.text()))
		errs.pushCode(errCode?errCode+"h":"GS008", dvbi.e_MoreEpisodesEndpoint.elementize()+" is not a valud URL", "not URL")
}


/**
 * verifies if the specified ContentProtection element is valid according to specification (contents and location)
 *
 * @param {string} SL_SCHEMA          Used when constructing Xpath queries
 * @param {string} SCHEMA_PREFIX      Used when constructing Xpath queries
 * @param {string} SCHEMA_NAMESPACE   The namespace of XML document
 * @param {Object} ContentProtection  The <ContentProtection> element (a libxmls ojbect tree) to be checked
 * @param {string} Location           The printable name used to indicate the location of the <ContentProtection> element being checked. used for error reporting
 * @param {Object} errs               The class where errors and warnings relating to the serivce list processing are stored 
 * @param {string} errCode            Error code prefix to be used in reports, if not present then use local codes
 */
function validateContentProtection(SL_SCHEMA, SCHEMA_PREFIX, SCHEMA_NAMESPACE, ContentProtection, Location, errs, errcode=null) {
	if (!ContentProtection) {
		errs.push("CP000", "validateContentProtection() called with ContentProtection==null")
		return
	}
	checkTopElements(SL_SCHEMA, SCHEMA_PREFIX, ContentProtection, [], [dvbi.e_CASystemId, dvbi.e_DRMSystemId], errs, errcode?errcode+"a":"CP001")
	
	let ca=0, CASystemId
	while (CASystemId=ContentProtection.get(xPath(SCHEMA_PREFIX, dvbi.e_CASystemId, ++ca), SL_SCHEMA)) {
		checkTopElements(SL_SCHEMA, SCHEMA_PREFIX, CASystemId, [dvbi.e_CASystemId], errs, errcode?errcode+"b":"CP002")
		checkAttributes(CASystemId, [], [dvbi.a_cpsIndex], errs, errcode?errcode+"c":"CP003")
	}
	
	let dr=0, DRMSystemId
	while (DRMSystemId=ContentProtection.get(xPath(SCHEMA_PREFIX, dvbi.e_DRMSystemId, ++dr), SL_SCHEMA)) {
		checkTopElements(SL_SCHEMA, SCHEMA_PREFIX, DRMSystemId, [dvbi.e_DRMSystemId], [], errs, errcode?errcode+"d":"CP004")
		checkAttributes(DRMSystemId, [dvbi.a_encryptionScheme], [dvbi.a_cpsIndex], errs, errcode?errcode+"e":"CP005")
		
		if (DRMSystemId.attr(dvbi.a_encryptionScheme)) {
			let scheme=DRMSystemId.attr(dvbi.a_encryptionScheme).value()
			if (scheme && !isIn(dvbi.ENCRYPTION_VALID_TYPES, scheme)) 
				errs.pushCode(errcode?errcode+"-6":"CP006", scheme.quote()+" is not valid for "+dvbi.a_encryptionScheme.attribute(ContentProtection.name()))
		}
	}
}


/**
 * validate an element against a TV-Anytime BitrateType
 *
 * @param {object} child       The node of the element to check
 * @param {Class}  errs        Errors found in validaton
 * @param {string} errCode     Error code prefix to be used in reports, if not present then use local codes
 */
function checkBitRate(child, errs, errCode=null) {	
	if (!child) {
		errs.push("BR000", "checkBitRate() called with child==null")		
		return
	}
	checkAttributes(child, [], [tva.a_variable, tva.a_minimum, tva.a_average, tva.a_maximum], errs, errCode?errCode+"a":"BR001")
	
	// check the value is a nonNegativeInteger
	if (!isNonNegativeInteger(child.text()))
		invalidValue(errs, errCode?errCode+"-2":"BR002", child.name(), null, child.text())
	
	// check any @variable attribute is a boolean
	if (child.attr(tva.a_variable) && !isBoolean(child.attr(tva.a_variable).value()))
		invalidValue(errs, errCode?errCode+"-3":"BR003", child.name(), tva.a_variable, child.attr(tva.a_variable).value())
	
	// check any @minimum attribute is an unsignedLong
	if (child.attr(tva.a_minimum) && !isUnsignedLong(child.attr(tva.a_minimum).value()))
		invalidValue(errs, errCode?errCode+"-4":"BR004", child.name(), tva.a_minimum, child.attr(tva.a_minimum).value())
		
	// check any @average attribute is an unsignedLong
	if (child.attr(tva.a_average) && !isUnsignedLong(child.attr(tva.a_average).value()))
		invalidValue(errs, errCode?errCode+"-5":"BR005", child.name(), tva.a_average, child.attr(tva.a_average).value())
		
	// check any @maximum attribute is an unsignedLong
	if (child.attr(tva.a_maximum) && !isUnsignedLong(child.attr(tva.a_maximum).value()))
		invalidValue(errs, errCode?errCode+"-6":"BR006", child.name(), tva.a_maximum, child.attr(tva.a_maximum).value())
}


/**
 * check if the specified value contains an IP address (v4 or v6) or a domain name
 *
 * @param {string} arg    contains an IP address (v4 or v6) or a domain name
 * @returns true is the arg contains an IP address (v4 or v6) or a domain name, else false 
 */
function isIPorDomain(arg) {
	return isDomainName(arg) || isIPv4(arg) || isIPv6(arg)
}

/**
 * validate an element against a DVB FECLayerAddressType
 *
 * @param {object} layerParams    The node of the element to check
 * @param {Class}  errs           Errors found in validaton
 * @param {string} errCode        Error code prefix to be used in reports, if not present then use local codes
 */
function checkFECLayerAddressType(layerParams, errs, errcode=null) {
	checkAttributes(layerParams, [], [dvbi.a_Address, dvbi.a_Source, dvbi.a_Port, dvbi.a_MaxBitrate, dvbi.a_RTSPControlURL, dvbi.a_PayloadTypeNumber, dvbi.a_TransportProtocol], errs, errcode?errcode+"-a":"LA001")
	
	if (layerParams.attr(dvbi.a_Address) && !isIPorDomain(layerParams.attr(dvbi.a_Address).value()))
		invalidValue(errs, errcode?errcode+"-2":"LA002", layerParams.name(), dvbi.a_Address, layerParams.attr(dvbi.a_Address).value())
	
	if (layerParams.attr(dvbi.a_Source) && !isIPorDomain(layerParams.attr(dvbi.a_Source).value()))
		invalidValue(errs, errcode?errcode+"-3":"LA003", layerParams.name(), dvbi.a_Source, layerParams.attr(dvbi.a_Source).value())
	
	if (layerParams.attr(dvbi.a_Port) && !isUnsignedShort(layerParams.attr(dvbi.a_Port).value()))
		invalidValue(errs, errcode?errcode+"-4":"LA004", layerParams.name(), dvbi.a_Port, layerParams.attr(dvbi.a_Port).value())		
	
	if (layerParams.attr(dvbi.a_MaxBitrate) && !isPositiveInteger(layerParams.attr(dvbi.a_MaxBitrate).value()))
		invalidValue(errs, errcode?errcode+"-5":"LA005", layerParams.name(), dvbi.a_MaxBitrate, layerParams.attr(dvbi.a_MaxBitrate).value())	
	
	if (layerParams.attr(dvbi.a_RTSPControlURL) && !isRTSPURL(layerParams.attr(dvbi.a_RTSPControlURL).value())) 
		invalidValue(errs, errcode?errcode+"-6":"LA006", layerParams.name(), dvbi.a_RTSPControlURL, layerParams.attr(dvbi.a_RTSPControlURL).value())	
			
	if (layerParams.attr(dvbi.a_PayloadTypeNumber) && !isUnsignedInt(layerParams.attr(dvbi.a_MaxBitrate).value()))
		invalidValue(errs, errcode?errcode+"-7":"LA007", layerParams.name(), dvbi.a_PayloadTypeNumber, layerParams.attr(dvbi.a_PayloadTypeNumber).value())
			
	if (layerParams.attr(dvbi.a_TransportProtocol) && !isIn(dvbi.ALLOWED_TRANSPORT_PROTOCOLS, layerParams.attr(dvbi.a_TransportProtocol).value()))
		invalidValue(errs, errcode?errcode+"-8":"LA008", layerParams.name(), dvbi.a_TransportProtocol, layerParams.attr(dvbi.a_TransportProtocol).value())
}


/**
 * validate an element against a TVA AspectRatioType
 *
 * @param {object} node           The node of the element to check
 * @param {Class}  errs           Errors found in validaton
 * @param {string} errCode        Error code prefix to be used in reports, if not present then use local codes
 */
function checkAspectRatioType(node, errs, errcode=null) {
	
	function isRatioType(arg) {
		let s=arg.trim().match(/\d+:\d+/g)
		return s?s[0]===arg:false;
	}
	
	if (!node) {
		errs.pushCode("AR010", "checkAspectRatioType() called with node==null", "args")
		return
	}
	checkAttributes(node, [], [tva.a_type], errs, errcode?errcode+"a":"AR011")
	
	if (node.attr(tva.a_type)&& !isIn(tva.ALLOWED_ASPECT_RATIO_TYPES, node.attr(tva.a_type).value()))
		invalidValue(errs, errcode?errcode+"-02":"AR012", node.name(), tva.a_type, node.attr(tva.a_type).value())
	
	if (!isRatioType(node.text()))
		errs.pushCode(errcode?errcode+"-03":"ARo13", node.text.quote()+" is not a valid aspect ratio", "invalid value")
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
		return "length of "+elementize(tva.a_length.attribute(elem)+"="+quote(label))+" exceeds "+length+" characters"; }
	function synopsisToShortError(elem, label, length) {
		return "length of "+elementize(tva.a_length.attribute(elem)+"="+quote(label))+" is less than "+length+" characters"; }
	function singleLengthLangError(elem, length, lang) {
		return "only a single "+elementize(elem)+" is permitted per length ("+length+") and language ("+lang+")"; }
	function requiredSynopsisError(elem, length) {
		return "a "+elementize(elem)+" element with "+tva.a_length.attribute()+"="+quote(length)+" is required"; }
	
	/**
	 * replace ENTITY strings with a generic characterSet
     *
     * @param {string} str string containing HTML or XML entities (starts with & ends with ;)
     * @returns {string} the string with entities replaced with a single character '*'
     */
	function unEntity(str) { return str.replace(/(&.+;)/ig,"*"); }

	if (!Element) {
		errs.pushCode("SY000", "ValidateSynopsisType() called with Element==null")
		return
	}
	let s=0, ste, hasBrief=false, hasShort=false, hasMedium=false, hasLong=false, hasExtended=false;
	let briefLangs=[], shortLangs=[], mediumLangs=[], longLangs=[], extendedLangs=[];
	while (ste=Element.get(xPath(SCHEMA_PREFIX, ElementName, ++s), SCHEMA)) {
		
		checkAttributes(SCHEMA, SCHEMA_PREFIX, ste, [tva.a_length], [tva.a_lang], errs, errcode?errcode+"a":"SY001");

		let synopsisLang=GetLanguage(knownLanguages, errs, ste, parentLanguage, false, errcode?errcode+"b":"SY002");
		let synopsisLength=ste.attr(tva.a_length)?ste.attr(tva.a_length).value():null;
		
		if (synopsisLength) {
			if (isIn(requiredLengths, synopsisLength) || isIn(optionalLengths, synopsisLength)) {
				switch (synopsisLength) {
					case tva.SYNOPSIS_BRIEF_LABEL:
						if ((unEntity(ste.text()).length) > tva.SYNOPSIS_BRIEF_LENGTH)
							errs.pushCode(errCode?errCode+"-10":"SY010", synopsisLengthError(ElementName, tva.SYNOPSIS_BRIEF_LABEL, tva.SYNOPSIS_BRIEF_LENGTH), "synopsis");
						hasBrief=true;
						break;
					case tva.SYNOPSIS_SHORT_LABEL:
						if ((unEntity(ste.text()).length) > tva.SYNOPSIS_SHORT_LENGTH)
							errs.pushCode(errCode?errCode+"-11":"SY011", synopsisLengthError(ElementName, tva.SYNOPSIS_SHORT_LABEL, tva.SYNOPSIS_SHORT_LENGTH), "synopsis");
						hasShort=true;
						break;
					case tva.SYNOPSIS_MEDIUM_LABEL:
						if ((unEntity(ste.text()).length) > tva.SYNOPSIS_MEDIUM_LENGTH)
							errs.pushCode(errCode?errCode+"-12":"SY012", synopsisLengthError(ElementName, tva.SYNOPSIS_MEDIUM_LABEL, tva.SYNOPSIS_MEDIUM_LENGTH), "synopsis");
						hasMedium=true;
						break;
					case tva.SYNOPSIS_LONG_LABEL:
						if ((unEntity(ste.text()).length) > tva.SYNOPSIS_LONG_LENGTH)
							errs.pushCode(errCode?errCode+"-13":"SY013", synopsisLengthError(ElementName, tva.SYNOPSIS_LONG_LABEL, tva.SYNOPSIS_LONG_LENGTH), "synopsis");
						hasLong=true;
						break;						
					case tva.SYNOPSIS_EXTENDED_LABEL:
						if ((unEntity(ste.text()).length) < tva.SYNOPSIS_LENGTH_LENGTH)
							errs.pushCode(errCode?errCode+"-14":"SY014", synopsisToShortError(ElementName, tva.SYNOPSIS_EXTENDED_LABEL, tva.SYNOPSIS_LONG_LENGTH), "synopsis");
						hasExtended=true;
						break;
				}
			}
			else
				errs.pushCode(errCode?errCode+"-15":"SY015", tva.a_length.attribute()+"="+quote(synopsisLength)+" is not permitted", "synopsis");
		}
	
		if (synopsisLang && synopsisLength) {
			switch (synopsisLength) {
				case tva.SYNOPSIS_BRIEF_LABEL:
					if (isIn(briefLangs, synopsisLang)) 
						errs.pushCode(errCode?errCode+"-21":"SY021", singleLengthLangError(ElementName, synopsisLength, synopsisLang), "synopsis");
					else briefLangs.push(synopsisLang);
					break;
				case tva.SYNOPSIS_SHORT_LABEL:
					if (isIn(shortLangs, synopsisLang)) 
						errs.pushCode(errCode?errCode+"-22":"SY022", singleLengthLangError(ElementName, synopsisLength, synopsisLang), "synopsis");
					else shortLangs.push(synopsisLang);
					break;
				case tva.SYNOPSIS_MEDIUM_LABEL:
					if (isIn(mediumLangs, synopsisLang)) 
						errs.pushCode(errCode?errCode+"-23":"SY023", singleLengthLangError(ElementName, synopsisLength, synopsisLang), "synopsis");
					else mediumLangs.push(synopsisLang);
					break;
				case tva.SYNOPSIS_LONG_LABEL:
					if (isIn(longLangs, synopsisLang)) 
						errs.pushCode(errCode?errCode+"-24":"SY024", singleLengthLangError(ElementName, synopsisLength, synopsisLang), "synopsis");
					else longLangs.push(synopsisLang);
					break;
				case tva.SYNOPSIS_EXTENDED_LABEL:
					if (isIn(extendedLangs, synopsisLang)) 
						errs.pushCode(errCode?errCode+"-25":"SY025", singleLengthLangError(ElementName, synopsisLength, synopsisLang), "synopsis");
					else extendedLangs.push(synopsisLang);
					break;
			}
		}
	}
	
	if (isIn(requiredLengths, tva.SYNOPSIS_BRIEF_LABEL) && !hasBrief)
		errs.pushCode(errCode?errCode+"-31":"SY031", requiredSynopsisError(tva.SYNOPSIS_BRIEF_LABEL), "synopsis");	
	if (isIn(requiredLengths, tva.SYNOPSIS_SHORT_LABEL) && !hasShort)
		errs.pushCode(errCode?errCode+"-32":"SY032",requiredSynopsisError(tva.SYNOPSIS_SHORT_LABEL), "synopsis");	
	if (isIn(requiredLengths, tva.SYNOPSIS_MEDIUM_LABEL) && !hasMedium)
		errs.pushCode(errCode?errCode+"-33":"SY022",requiredSynopsisError(tva.SYNOPSIS_MEDIUM_LABEL), "synopsis");	
	if (isIn(requiredLengths, tva.SYNOPSIS_LONG_LABEL) && !hasLong)
		errs.pushCode(errCode?errCode+"-34":"SY034",requiredSynopsisError(tva.SYNOPSIS_LONG_LABEL), "synopsis");	
	if (isIn(requiredLengths, tva.SYNOPSIS_EXTENDED_LABEL) && !hasExtended)
		errs.pushCode(errCode?errCode+"-35":"SY035",requiredSynopsisError(tva.SYNOPSIS_EXTENDED_LABEL), "synopsis");	
}


/**
 * check that a values conforms to the ServiceDaysList type
 *
 * @param {string} the value to check, likely from an Interval@days attribute
 * @returns {boolean} true if the value is properly formated
 */
function validServiceDaysList(val) {
	if (!val) return false
	// list of values 1-7 separeted by spaces
	const DaysListRegex=/([1-7]\s+)*[1-7]/
    let s=val.trim().match(DaysListRegex)
    return s?s[0]===ext:false
}


/**
 * check that a values conforms to the ZuluTimeType type
 *
 * @param {string} val the value to check, likely from an Interval@startTime or @endTime attributes
 * @returns {boolean} true if the value is properly formated
 */
function validZuluTimeType(val) {
	if (!val) return false
	// <pattern value="(([01]\d|2[0-3]):[0-5]\d:[0-5]\d(\.\d+)?|(24:00:00(\.0+)?))Z"/>
	const ZuluRegex=/(([01]\d|2[0-3]):[0-5]\d:[0-5]\d(\.\d+)?|(24:00:00(\.0+)?))Z/
    let s=val.trim().match(ZuluRegex)
    return s?s[0]===val:false
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
	checkTopElements(SL_SCHEMA, SCHEMA_PREFIX, ServiceInstance, [], [dvbi.e_DisplayName, tva.e_RelatedMaterial, dvbi.e_ContentProtection, dvbi.e_ContentAttributes, dvbi.e_Availability, dvbi.e_SubscriptionPackage, dvbi.e_FTAContentManagement, dvbi.e_SourceType, dvbi.e_DVBTDeliveryParameters, dvbi.e_DVBSDeliveryParameters, dvbi.e_DVBCDeliveryParameters, dvbi.e_SATIPDeliveryParameters, dvbi.e_RTSPDeliveryParameters, dvbi.e_MulticastTSDeliveryParameters, dvbi.e_DASHDeliveryParameters, dvbi.e_OtherDeliveryParameters], errs, "SI001")
	
	checkAttributes(ServiceInstance, [], [dvbi.a_priority], errs, "SI002")

	checkXMLLangs(SL_SCHEMA, SCHEMA_PREFIX, dvbi.e_DisplayName, "service instance in service="+thisServiceId.quote(), ServiceInstance, errs, "SI010");

	// check @href of <ServiceInstance><RelatedMaterial>
	let rm=0, countControlApps=0, RelatedMaterial
	while (RelatedMaterial=ServiceInstance.get(xPath(SCHEMA_PREFIX, tva.e_RelatedMaterial, ++rm), SL_SCHEMA)) {
		let foundHref=validateRelatedMaterial(RelatedMaterial, errs, "service instance of "+thisServiceId.quote(), SERVICE_INSTANCE_RM, SCHEMA_NAMESPACE, "SI020")
		if (foundHref!="" && validServiceControlApplication(foundHref)) 
			countControlApps++
	}
	if (countControlApps>1)
		errs.pushCode("SI021", "only a single service control application can be signalled in a service instance", "multi apps")

	// <ServiceInstance><ContentProtection>
	let cp=0, ContentProtection
	while (ContentProtection=ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_ContentProtection, ++cp), SL_SCHEMA))
		validateContentProtection(SL_SCHEMA, SCHEMA_PREFIX, SCHEMA_NAMESPACE, ContentProtection, "service instance of "+thisServiceId.quote(), errs, "SI030")

	// <ServiceInstance><ContentAttributes>
	let ContentAttributes=ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_ContentAttributes), SL_SCHEMA)
	if (ContentAttributes) {
		checkTopElements(SL_SCHEMA, SCHEMA_PREFIX, ContentAttributes, [], [tva.e_AudioAttributes, dvbi.e_AudioConformancePoint, tva.e_VideoAttributes, dvbi.e_VideoConformancePoint, tva.e_CaptionLanguage, tva.e_SignLanguage], errs, "SI040")

		// Check @href of ContentAttributes/AudioAttributes/tva:coding
		let cp=0, conf
		while (conf=ContentAttributes.get(xPath(SCHEMA_PREFIX, tva.e_AudioAttributes, ++cp), SL_SCHEMA)) {
			checkTopElements(SL_SCHEMA, SCHEMA_PREFIX, conf, [], [tva.e_Coding, tva.e_NumOfChannels, tva.e_MixType, tva.e_AudioLanguage, tva.e_SampleFrequency, tva.e_BitsPerSample, tva.e_BitRate], errs, "SI050")
			
			let children=conf.childNodes()
			if (children) children.forEach(child => {
				if (child.type()=='element')
					switch (child.name()) {
						case tva.e_Coding:
							checkAttributes(child, [dvbi.a_href], [], errs, "SL051")
							if (child.attr(dvbi.a_href) && !isIn(allowedAudioSchemes, child.attr(dvbi.a_href).value())) 
								errs.pushCode("SI052", "invalid "+dvbi.a_href.attribute(child.name())+" value for ("+child.attr(dvbi.a_href).value()+")", "audio codec");
							break;
						case tva.e_NumOfChannels:
							if (!isUnsignedShort(child.text()))
								invalidValue(errs, "SI053", child.name(), null, child.text(), conf.name())
							break;
						case tva.e_MixType:
							// taken from MPEG-7 AudioPresentationCS
							checkAttributes(child, [dvbi.a_href], [], errs, "SL054")
							if (child.attr(dvbi.a_href) && !isIn(AudioPresentationCS, child.attr(dvbi.a_href).value())) 
								errs.pushCode("SI055", "invalid "+dvbi.a_href.attribute(child.name())+" value for ("+child.attr(dvbi.a_href).value()+")", "audio codec");
							break;
						case tva.e_AudioLanguage:
							// TODO:
							break;
						case tva.e_SampleFrequency:
							if (!isUnsignedInt(child.text()))
								invalidValue(errs, "SI057", child.name(), null, child.text())
							break;
						case tva.e_BitsPerSample:
							if (!isUnsignedShort(child.text()))
								invalidValue(errs, "SI058", child.name(), null, child.text(), conf.name())
							break;
						case tva.e_BitRate:
							checkBitRate(child, errs, "SI059")
							break;
					}
			})
		}
		
		// Check @href of ContentAttributes/AudioConformancePoints
		cp=0
		while (conf=ContentAttributes.get(xPath(SCHEMA_PREFIX, dvbi.e_AudioConformancePoint, ++cp), SL_SCHEMA)) {
			checkAttributes(conf, [dvbi.a_href], [], errs, "SI060")
			if (conf.attr(dvbi.a_href)) {
				if (!isIn(allowedAudioConformancePoints, conf.attr(dvbi.a_href).value())) 
					errs.pushCode("SI061", "invalid "+dvbi.a_href.attribute(dvbi.e_AudioConformancePoint)+" ("+conf.attr(dvbi.a_href).value()+")", "audio conf point");
			}	
		}

		// Check @href of ContentAttributes/VideoAttributes/tva:coding
		cp=0;
		while (conf=ContentAttributes.get(xPath(SCHEMA_PREFIX, tva.e_VideoAttributes, ++cp), SL_SCHEMA)) {
			let videoSubelements=[tva.e_Coding, tva.e_Scan, tva.e_HorizontalSize, tva.e_VerticalSize, tva.e_AspectRatio, tva.e_Color, tva.e_FrameRate, tva.e_BitRate, tva.e_PictureFormat]
			if (SchemaVersion(SCHEMA_NAMESPACE) >= SCHEMA_v3)
				videoSubelements.push(dvbi.e_Colorimetry)
			checkTopElements(SL_SCHEMA, SCHEMA_PREFIX, conf, [], videoSubelements, errs, "SI070")
			

			let children=conf.childNodes()
			if (children) children.forEach(child => {
				if (child.type()=='element')
					switch (child.name()) {
						case tva.e_Coding:
							checkAttributes(child, [dvbi.a_href], [], errs, "SI071")
							if (child.attr(dvbi.a_href) && !isIn(allowedVideoSchemes, child.attr(dvbi.a_href).value())) 
								errs.pushCode("SI072", "invalid "+dvbi.a_href.attribute(tva.e_VideoAttributes)+" ("+child.attr(dvbi.a_href).value()+")", "video codec");
							break;
						case tva.e_Scan:
							if (!isIn(tva.SCAN_TYPES, child.text()))
								errs.pushCode("SI073", "invalid "+tva.e_Scan.elementize()+" value "+child.text().quote(), "video atributes")
							break;
						case tva.e_HorizontalSize:
							if (!isUnsignedShort(child.text()))
								errs.pushCode("SI074", "invalid "+tva.e_HorizontalSize.elementize()+" value "+child.text().quote(), "video attributes")
							break;
						case tva.e_VerticalSize:
							if (!isUnsignedShort(child.text()))
								errs.pushCode("SI075", "invalid "+tva.e_VerticalSize.elementize()+" value "+child.text().quote(), "video attributes")
							break;
						case tva.e_AspectRatio:
							checkAspectRatioType(child, errs, "SI076")
							break;
						case tva.e_Color:
							checkAttributes(child, [tva.a_type], [], errs, "SI077")
							if (child.attr(tva.a_type) && !isIn(tva.COLOR_TYPES,child.text()))
								errs.pushCode("SI078", "invalid "+tva.e_Color.elementize()+" value "+child.text().quote(), "video attributes")
							break;
						case tva.e_FrameRate:
							if (!validFrameRate(child.text()))
								errs.pushCode("SI079", "invalid "+tva.e_FrameRate.elementize()+" value "+child.text().quote(), "video attributes")
							break;
						case tva.e_BitRate:
							checkBitRate(child, errs, "SI080")
							break;
						case tva.e_PictureFormat:
							checkAttributes(child, [dvbi.a_href], [], errs, "SI081")
							if (child.attr(dvbi.a_href) && !isIn(allowedPictureFormats, child.attr(dvbi.a_href).value())) 
								errs.pushCode("SI082", "invalid "+dvbi.a_href.attribute(tva.e_PictureFormat)+" value ("+child.attr(dvbi.a_href).value()+")", tva.e_PictureFormat);
							break;
						case dvbi.e_Colorimetry:
							checkAttributes(child, [dvbi.a_href], [], errs, "SI083")
							if (child.attr(dvbi.a_href) && !isIn(dvbi.ALLOWED_COLORIMETRY, child.attr(dvbi.a_href).value())) 
								errs.pushCode("SI084", "invalid "+dvbi.a_href.attribute(tva.e_Colorimetry)+" value ("+child.attr(dvbi.a_href).value()+")", tva.e_Colorimetry);
							break;
					}
			})
		}

		// Check @href of ContentAttributes/VideoConformancePoints
		cp=0;
		while (conf=ContentAttributes.get(xPath(SCHEMA_PREFIX, dvbi.e_VideoConformancePoint, ++cp), SL_SCHEMA)) { 
			checkAttributes(conf, [dvbi.a_href], [], errs, "SI090")
			if (conf.attr(dvbi.a_href) && !isIn(allowedVideoConformancePoints, conf.attr(dvbi.a_href).value())) 
				errs.pushCode("SI091", "invalid "+dvbi.a_href.attribute(dvbi.e_VideoConformancePoint)+" value ("+conf.attr(dvbi.a_href).value()+")", "video conf point");
		}

		// Check ContentAttributes/CaptionLanguage
		cp=0;
		while (conf=ContentAttributes.get(xPath(SCHEMA_PREFIX, tva.e_CaptionLanguage, ++cp), SL_SCHEMA)) { 
			checkAttributes(conf, [], [tva.a_primary, tva.a_translation, tva.a_closed, tva.a_supplemental], errs, "SI100")
			checkLanguage(conf.text(), tva.e_CaptionLanguage.elementize(), errs, "SI101")
		}

		// Check ContentAttributes/SignLanguage
		cp=0;
		while (conf=ContentAttributes.get(xPath(SCHEMA_PREFIX, tva.e_SignLanguage, ++cp), SL_SCHEMA)) { 
			checkAttributes(conf, [], [tva.a_primary, tva.a_translation, tva.a_type, tva.a_closed], errs, "SI110")
			checkLanguage(conf.text(), tva.e_SignLanguage.elementize(), errs, "SI111")
		}
	}
	
	// <ServiceInstance><Availability>
	let Availability=ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_Availability), SL_SCHEMA)
	if (Availability) {
		checkTopElements(SL_SCHEMA, SCHEMA_PREFIX, Availability, [dvbi.e_Period], [], errs, "SI121")
		let Period, p=0
		while (Period=Availability.get(xPath(SCHEMA_PREFIX, dvbi.e_Period, ++p), SL_SCHEMA)) {
			checkTopElements(SL_SCHEMA, SCHEMA_PREFIX, Period, [], [dvbi.e_Interval], errs, "SI122")
			checkAttributes(Period, [], [dvbi.a_validFrom, dvbi.a_validTo], errs, "SI123")
			if (Period.attr(dvbi.a_validFrom) && Period.attr(dvbi.a_validTo)) {
				// validTo should be >= validFrom
				let fr=new Date(Period.attr(dvbi.a_validFrom).value()), 
					to=new Date(Period.attr(dvbi.a_validTo).value())
			
				if (to.getTime() < fr.getTime()) 
					errs.pushCode("SI124", "invalid availability period for service "+thisServiceId.quote()+". "+fr+">"+to, "period start>end");
			}
			
			let Interval, i=0
			while (Interval=Period.get(xPath(SCHEMA_PREFIX, dvbi.e_Interval, ++i), SL_SCHEMA)) {
				checkAttributes(Interval, [], [dvbi.a_days, dvbi.a_recurrence, dvbi.a_startTime, dvbi.a_endTime], errs, "SI125")
				
				if (Interval.attr(dvbi.a_days) && !validServiceDaysList(Interval.attr(dvbi.a_days).value()))
					errs.pushCode("SI126", dvbi.a_days.attribute(dvbi.e_Interval)+" is invalid ("+Interval.attr(dvbi.a_days).value().quote()+")")
				
				if (Interval.attr(dvbi.a_recurrence) && !isUnsignedInt(Interval.attr(dvbi.a_recurrence).value()))
					errs.pushCode("SI127", dvbi.a_recurrence.a_startTime(dvbi.e_Interval)+" is invalid ("+Interval.attr(dvbi.a_recurrence).value().quote()+")")
					
				if (Interval.attr(dvbi.a_startTime) && !validZuluTimeType(Interval.attr(dvbi.a_startTime).value())) 
					errs.pushCode("SI128", dvbi.a_days.a_startTime(dvbi.e_Interval)+" is invalid ("+Interval.attr(dvbi.a_startTime).value().quote()+")")

				if (Interval.attr(dvbi.a_endTime) && !validZuluTimeType(Interval.attr(dvbi.a_endTime).value())) 
					errs.pushCode("SI129", dvbi.a_days.a_endTime(dvbi.e_Interval)+" is invalid ("+Interval.attr(dvbi.a_endTime).value().quote()+")")
			}
		}
	}

	// <ServiceInstance><SubscriptionPackage>
	checkXMLLangs(SL_SCHEMA, SCHEMA_PREFIX, dvbi.e_SubscriptionPackage, ServiceInstance.name().elementize(), ServiceInstance, errs, "SI131")
	let sp=0, SubscriptionPackage
	while (SubscriptionPackage=ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_SubscriptionPackage, ++sp), SL_SCHEMA)) {
		// nothing to do here)
	}
			
	// <ServiceInstance><FTAContentManagement>
	let FTAContentManagement=ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_FTAContentManagement), SL_SCHEMA)
	if (FTAContentManagement) {
		checkAttributes(FTAContentManagement, [dvbi.a_userDefined, dvbi.a_doNotScramble, dvbi.a_controlRemoteAccessOverInternet, dvbi.a_doNotApplyRevocation], [], errs, "SI141")
		
		let ud=FTAContentManagement.attr(dvbi.a_userDefined)?FTAContentManagement.attr(dvbi.a_userDefined).value():null;
		if (ud && !isBoolean(ud))
			invalidValue(errs, "SI142", dvbi.e_FTAContentManagement, dvbi.a_userDefined, ud)
		
		let dns=FTAContentManagement.attr(dvbi.a_doNotScramble)?FTAContentManagement.attr(dvbi.a_doNotScramble).value():null;
		if (dns && !isBoolean(dns))
			invalidValue(errs, "SI143", dvbi.e_FTAContentManagement, dvbi.a_doNotScramble, dns)
					
		let cRAOI=FTAContentManagement.attr(dvbi.a_controlRemoteAccessOverInternet)?FTAContentManagement.attr(dvbi.a_controlRemoteAccessOverInternet).value():null;	
		if (cRAOI && (parseInt(cRAOI) < 0 || parseInt(cRAOI) > 3))
			invalidValue(errs, "SI144", dvbi.e_FTAContentManagement, dvbi.a_controlRemoteAccessOverInternet, cRAOI)
		
		let dnar=FTAContentManagement.attr(dvbi.a_doNotApplyRevocation)?FTAContentManagement.attr(dvbi.a_doNotApplyRevocation).value():null;
		if (dnar && !isBoolean(dnar))
			invalidValue(errs, "SI145", dvbi.e_FTAContentManagement, dvbi.a_doNotApplyRevocation, dnar)		
	}

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
						errs.pushCode("SI156", "Delivery parameters are not permitted for Application service instance in Service "+thisServiceId.quote(), "invalid application");
						v1Params=true
					}
					else {
						// no xxxxDeliveryParameters is signalled
						// check for appropriate Service.RelatedMaterial or Service.ServiceInstance.RelatedMaterial
						if (!hasSignalledApplication(SL_SCHEMA, SCHEMA_PREFIX, service) 
							&& !hasSignalledApplication(SL_SCHEMA, SCHEMA_PREFIX, ServiceInstance)) 
							errs.pushCode("SI157", "No Application is signalled for "+dvbi.e_SourceType+"="+dvbi.DVBAPPLICATION_SOURCE_TYPE.quote()+" in Service "+thisServiceId.quote(), "no application");
					}
				break;
			default:
				switch (SchemaVersion(SCHEMA_NAMESPACE)) {
					case SCHEMA_v1:
						errs.pushCode("SI158", dvbi.e_SourceType.elementize()+" "+SourceType.text().quote()+" is not valid in Service "+thisServiceId.quote(), "invalid "+dvbi.e_SourceType);
						break;
					case SCHEMA_v2:
					case SCHEMA_v3:
						if (!ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_OtherDeliveryParameters), SL_SCHEMA))
							errs.pushCode("SI159", dvbi.e_OtherDeliveryParameters.elementize()+" must be specified with user-defined "+dvbi.e_SourceType+" "+SourceType.text().quote(), "no "+dvbi.e_OtherDeliveryParameters)
						break;
				}
		}
		if (v1Params && SchemaVersion(SCHEMA_NAMESPACE) >= SCHEMA_v2)
			errs.pushCodeW("SI160", dvbi.e_SourceType.elementize()+" is deprecated in this version")
	}
	else {
		if (SchemaVersion(SCHEMA_NAMESPACE)==SCHEMA_v1) 
			errs.pushCode("SI161", dvbi.e_SourceType.elementize()+" not specified in "+dvbi.e_ServiceInstance.elementize()+" of service "+thisServiceId.quote(), "no "+dvbi.e_SourceType);
	}

	// <ServiceInstance><DASHDeliveryParameters>
	let DASHDeliveryParameters=ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_DASHDeliveryParameters), SL_SCHEMA)
	if (DASHDeliveryParameters) {
		checkTopElements(SL_SCHEMA, SCHEMA_PREFIX, DASHDeliveryParameters, [dvbi.e_UriBasedLocation], [dvbi.e_MinimumBitRate, dvbi.e_Extension], errs, "SI170")
		let URILoc=DASHDeliveryParameters.get(xPath(SCHEMA_PREFIX, dvbi.e_UriBasedLocation), SL_SCHEMA)
		if (URILoc) {
			checkTopElements(SL_SCHEMA, SCHEMA_PREFIX, URILoc, [dvbi.e_URI], [], errs, "SI171")
			checkAttributes(URILoc, [dvbi.a_contentType], [], errs, "SI172")
			let uriContentType=URILoc.attr(dvbi.a_contentType)
			if (uriContentType && !validDASHcontentType(uriContentType.value()))
				errs.pushCode("SI173", dvbi.a_contentType.attribute()+"="+uriContentType.value().quote()+" in service "+thisServiceId.quote()+" is not valid", "no "+dvbi.a_contentType.attribute()+" for DASH");	
			
			let URI=DASHDeliveryParameters.get(xPath(SCHEMA_PREFIX, dvbi.e_URI), SL_SCHEMA)
			if (URI && !isHTTPURL(URI.text()))
				errs.pushCode("SI174", "invalid URL "+URI.text().quote()+" specified for "+dvbi.e_URI.elementize(), "invalid resource URL")
		}
		
		// <DASHDeliveryParameters><MinimumBitRate>
		let MinimumBitRate=DASHDeliveryParameters.get(xPath(SCHEMA_PREFIX, dvbi.e_MinimumBitRate), SL_SCHEMA)
		if (MinimumBitRate && !isUnsignedInt(MinimumBitRate.text()))
			errs.pushCode("SI175", MinimumBitRate.text().quote()+" is not valid for "+dvbi.e_MinimumBitRate.elementize(), "invalid value")			
	
		// <DASHDeliveryParameters><Extension>		
		let e=0, extension
		while (extension=DASHDeliveryParameters.get(xPath(SCHEMA_PREFIX, dvbi.e_Extension, ++e), SL_SCHEMA)) {
			if (extension.attr(dvbi.a_extensionName)) {
				if (!validExtensionName(extension.attr(dvbi.a_extensionName).value())) 
					errs.pushCode("SI176", dvbi.a_extensionName.attribute()+"="+extension.attr(dvbi.a_extensionName).value().quote()+" is not valid in service "+thisServiceId.quote(), "invalid "+dvbi.a_extensionName.attribute())
			}
			else 
				errs.pushCode("SI177", dvbi.a_extensionName.attribute()+" not specified for DASH extension in "+thisServiceId.quote(), "no "+dvbi.a_extensionName.attribute())
		}
	}
	let haveDVBT=false, haveDVBS=false

	// <ServiceInstance><DVBTDeliveryParameters>			
	let DVBTDeliveryParameters=ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_DVBTDeliveryParameters), SL_SCHEMA)
	if (DVBTDeliveryParameters) {
		haveDVBT=true
		checkTopElements(SL_SCHEMA, SCHEMA_PREFIX, DVBTDeliveryParameters, [dvbi.e_DVBTriplet, dvbi.e_TargetCountry], [], errs, "SI180")

		let DVBTtriplet=DVBTDeliveryParameters.get(xPath(SCHEMA_PREFIX, dvbi.e_DVBTriplet), SL_SCHEMA);
		if (DVBTtriplet) 
			validateTriplet(DVBTtriplet, errs, "SI181")

		let DVBTtargetCountry=DVBTDeliveryParameters.get(xPath(SCHEMA_PREFIX, dvbi.e_TargetCountry), SL_SCHEMA);
		if (DVBTtargetCountry && !knownCountries.isISO3166code(DVBTtargetCountry.text())) 
			InvalidCountryCode(DVBTtargetCountry.text(), "DVB-T", "service "+thisServiceId.quote(), errs, "SI182");
	}

	// <ServiceInstance><DVBCDeliveryParameters>
	let DVBCDeliveryParameters=ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_DVBCDeliveryParameters), SL_SCHEMA);
	if (DVBCDeliveryParameters) {
		checkTopElements(SL_SCHEMA, SCHEMA_PREFIX, DVBCDeliveryParameters, [dvbi.e_TargetCountry, dvbi.e_NetworkID], [dvbi.e_DVBTriplet], errs, "SI190")
		
		let DVBCtargetCountry=ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_DVBCDeliveryParameters)+"/"+xPath(SCHEMA_PREFIX, dvbi.e_TargetCountry), SL_SCHEMA)
		if (DVBCtargetCountry && !knownCountries.isISO3166code(DVBCtargetCountry.text()))  
			InvalidCountryCode(DVBCtargetCountry.text(), "DVB-C", "service "+thisServiceId.quote(), errs, "SI191");
		
		let DVBCnetworkId=DVBCDeliveryParameters.get(xPath(SCHEMA_PREFIX, dvbi.e_NetworkID), SL_SCHEMA);
		if (DVBCnetworkId) {
			let val=parseInt(DVBCnetworkId.text())
			if (DVBCnetworkId.text()=="" || val<0 || val>MAX_UNSIGNED_SHORT)
				errs.pushCode("SI192", "invalid value specified for "+
					dvbi.e_NetworkID.elementize()+" ("+DVBCnetworkId.text()+")")
		}

		let DVBCtriplet=DVBCDeliveryParameters.get(xPath(SCHEMA_PREFIX, dvbi.e_DVBTriplet), SL_SCHEMA)
		if (DVBCtriplet) 
			validateTriplet(DVBCtriplet, errs, "SI193")
	}

	// <ServiceInstance><DVBSDeliveryParameters>
	let DVBSDeliveryParameters=ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_DVBSDeliveryParameters), SL_SCHEMA)
	if (DVBSDeliveryParameters) {
		haveDVBS=true
		checkTopElements(SL_SCHEMA, SCHEMA_PREFIX, DVBSDeliveryParameters, [dvbi.e_DVBTriplet], [dvbi.e_OrbitalPosition, dvbi.e_Frequency, dvbi.e_Polarization], errs, "SI200")

		let DVBStriplet=DVBSDeliveryParameters.get(xPath(SCHEMA_PREFIX, dvbi.e_DVBTriplet), SL_SCHEMA)
		if (DVBStriplet) 
			validateTriplet(DVBStriplet, errs, "SI201")
		
		let DVBSorbitalPosition=DVBSDeliveryParameters.get(xPath(SCHEMA_PREFIX, dvbi.e_OrbitalPosition), SL_SCHEMA)
		if (DVBSorbitalPosition && !validLongitude(DVBSorbitalPosition.text()))
			errs.pushCode("SI202", "invalid value for "+dvbi.e_DVBSDeliveryParameters+elementize()+dvbi.OrbitalPosition.elementize()+" ("+DVBSorbitalPosition.text()+")")

		let DVBSfrequency=DVBSDeliveryParameters.get(xPath(SCHEMA_PREFIX, dvbi.e_Frequency), SL_SCHEMA)
		if (DVBSfrequency && !validFrequency(DVBSfrequency.text()))
			errs.pushCode("SI203", "invalid value for "+dvbi.e_DVBSDeliveryParameters+elementize()+dvbi.Frequency.elementize()+" ("+DVBSfrequency.text()+")")

		let DVBSpolarization=DVBSDeliveryParameters.get(xPath(SCHEMA_PREFIX, dvbi.e_Polarization), SL_SCHEMA)
		if (DVBSpolarization && !isIn(dvbi.DVBS_POLARIZATION_VALUES, DVBSpolarization.text()))
			errs.pushCode("SI204", "invalid value for "+dvbi.e_DVBSDeliveryParameters.elementize()+dvbi.e_Polarization.elementize()+" ("+DVBSpolarization.text()+")")
	}

	// <ServiceInstance><SATIPDeliveryParameters>			
	let SATIPDeliveryParameters=ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_SATIPDeliveryParameters), SL_SCHEMA)
	if (SATIPDeliveryParameters) {
		checkTopElements(SL_SCHEMA, SCHEMA_PREFIX, SATIPDeliveryParameters, [dvbi.e_QueryParameters], [], errs, "SI210")
		
		// SAT-IP Delivery Parameters can only exist if DVB-T or DVB-S delivery parameters are specified
		if (!haveDVBT && !haveDVBS)
			errs.pushCode("SI211", dvbi.e_SATIPDeliveryParameters.elementize()+" can only be specified with "+dvbi.e_DVBSDeliveryParameters.elementize()+" or "+dvbi.e_DVBTDeliveryParameters.elementize())
	}

	// <ServiceInstance><RTSPDeliveryParameters>
	let RTSPDeliveryParameters=ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_RTSPDeliveryParameters), SL_SCHEMA)
	if (RTSPDeliveryParameters) {
		checkTopElements(SL_SCHEMA, SL_PREFIX, RTSPDeliveryParameters, [dvbi.e_RTSPURL], [dvbi.e_DVBTriplet, dvbi.e_MinimumBitRate], errs, "SI220")
		
		let Triplet=RTSPDeliveryParameters.get(xPath(SCHEMA_PREFIX, dvbi.e_DVBTriplet), SL_SCHEMA)
		if (Triplet) 
			validateTriplet(Triplet, errs, "SI221")
		
		let RTSPURL=RTSPDeliveryParameters.get(xPath(SCHEMA_PREFIX, dvbi.e_RTSPURL), SL_SCHEMA)
		if (RTSPURL) {
			checkAttributes(RTSPURL, [], [dvbi.a_RTSPControlURL], errs, "SI222")
			if (!isRTSPURL(RTSPURL.text()))
				errs.pushCode("SI223", RTSPURL.text().quote()+" is not a valid RTSP URL", "invalid URL")
		}

		let MinimumBitRate=RTSPDeliveryParameters.get(xPath(SCHEMA_PREFIX, dvbi.e_MinimumBitRate), SL_SCHEMA)
		if (MinimumBitRate && !isUnsignedInt(MinimumBitRate.text()))
			invalidValue(errs, "SI224", dvbi.e_MinimumBitRate, null, MinimumBitRate.text())	
	}
	
	// <ServiceInstance><MulticastTSDeliveryParameters>
	let MulticastTSDeliveryParameters=ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_MulticastTSDeliveryParameters), SL_SCHEMA)
	if (MulticastTSDeliveryParameters) {
		checkTopElements(SL_SCHEMA, SL_PREFIX, MulticastTSDeliveryParameters, [dvbi.e_IPMulticastAddress], [dvbi.e_DVBTriplet, dvbi.e_MinimumBitRate], errs, "SI230")
		
		let Triplet=MulticastTSDeliveryParameters.get(xPath(SCHEMA_PREFIX, dvbi.e_DVBTriplet), SL_SCHEMA)
		if (Triplet) 
			validateTriplet(Triplet, errs, "SI230")
		
		let IPMulticastAddress=MulticastTSDeliveryParameters.get(xPath(SCHEMA_PREFIX, dvbi.e_IPMulticastAddress), SL_SCHEMA)
		if (IPMulticastAddress) {
			checkTopElements(SL_SCHEMA, SL_PREFIX, IPMulticastAddress, [], [dvbi.e_FECBaseLayer, dvbi.e_FECEnhancementLayer, dvbi.e_CNAME, dvbi.e_ssrc, dvbi.e_RTPRetransmission], errs, "SI232")
			
			let FECBaseLayer=IPMulticastAddress.get(xPath(SCHEMA_PREFIX, dvbi.e_FECBaseLayer), SL_SCHEMA)
			if (FECBaseLayer) 
				checkFECLayerAddressType(FECBaseLayer, errs, "SI233")

			let el=0, FECEnhancementLayer
			while (FECEnhancementLayer=IPMulticastAddress.get(xPath(SCHEMA_PREFIX, dvbi.e_FECEnhancementLayer, ++el), SL_SCHEMA)) 
				checkFECLayerAddressType(FECEnhancementLayer, errs, "SI234")
			
			let CNAME=IPMulticastAddress.get(xPath(SCHEMA_PREFIX, dvbi.e_CNAME), SL_SCHEMA)
			if (CNAME) {
				if (!isDomainName(CNAME.text()))
					errs.pushCode("SI235", dvbi.e_IPMulticastAddress.elementize()+dvbi.e_CNAME.elementize()+" is not a valid domain name for use as a CNAME", "incalid CNAME")
			}
			
			let ssrc=IPMulticastAddress.get(xPath(SCHEMA_PREFIX, dvbi.e_ssrc), SL_SCHEMA)
			if (ssrc && !isUnsignedInt(ssrc.text()))
				invalidValue(errs, "SI236", dvbi.e_ssrc, null, ssrc.text())
			
			let RTPRetransmission=IPMulticastAddress.get(xPath(SCHEMA_PREFIX, dvbi.e_RTPRetransmission), SL_SCHEMA)
			if (RTPRetransmission) {
				// TODO:
			}
		}
		
		let MinimumBitRate=MulticastTSDeliveryParameters.get(xPath(SCHEMA_PREFIX, dvbi.e_MinimumBitRate), SL_SCHEMA)
		if (MinimumBitRate && !isUnsignedInt(MinimumBitRate.text()))
			errs.pushCode("SI238", MinimumBitRate.text().quote()+" is not valid for "+dvbi.e_MinimumBitRate.elementize(), "invalid value")
	}
	
	// <ServiceInstance><OtherDeliveryParameters>			
	let OtherDeliveryParameters=ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_OtherDeliveryParameters), SL_SCHEMA)
	if (OtherDeliveryParameters) {
		checkAttributes(OtherDeliveryParameters, [dvbi.a_extensionName], [], errs, "SI250")

		if (OtherDeliveryParameters.attr(dvbi.a_extensionName) && !validExtensionName(OtherDeliveryParameters.attr(dvbi.a_extensionName).value()))
			errs.pushCode("SI251", dvbi.a_extensionName.attribute()+"="+OtherDeliveryParameters.attr(dvbi.a_extensionName).value().quote()+" is not valid in service "+thisServiceId.quote(), "invalid "+dvbi.a_extensionName.attribute());
	}
}


/**
 * validate the service list and record any errors
 *
 * @param {String} SLtext  The service list text to be validated
 * @param {Class} errs     Errors found in validaton
 */
function doValidateServiceList(SLtext, errs) {
	let SL=null
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
// the xmllint method
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
// the libxmljs2 method
	if (!SL.validate(SLschema_v1)){
		SL.validationErrors.forEach(err => console.log("validation error(1):", err));
	}
	if (!SL.validate(SLschema_v2)){
		SL.validationErrors.forEach(err => console.log("validation error(2):", err));
	}
	if (!SL.validate(SLschema_v3)){
		SL.validationErrors.forEach(err => console.log("validation error(3):", err));
	}
*/	
	if (SL.root().name() !== dvbi.e_ServiceList) {
		errs.pushCode("SL003", "Root element is not "+dvbi.e_ServiceList.elementize());
		return;
	}
	
	let SL_SCHEMA={}, 
		SCHEMA_PREFIX=SL.root().namespace().prefix(), 
		SCHEMA_NAMESPACE=SL.root().namespace().href()
	SL_SCHEMA[SCHEMA_PREFIX]=SCHEMA_NAMESPACE;

	if (SchemaVersion(SCHEMA_NAMESPACE)==SCHEMA_unknown) {
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

	checkXMLLangs(SL_SCHEMA, SCHEMA_PREFIX, dvbi.e_Name, dvbi.e_ServiceList, SL, errs, "SL020");
	checkXMLLangs(SL_SCHEMA, SCHEMA_PREFIX, dvbi.e_ProviderName, dvbi.e_ServiceList, SL, errs, "SL030");

	//check <ServiceList><RelatedMaterial>
	let rm=0, countControlApps=0, RelatedMaterial
	while (RelatedMaterial=SL.get(xPath(SCHEMA_PREFIX, tva.e_RelatedMaterial, ++rm), SL_SCHEMA)) {
		let foundHref=validateRelatedMaterial(RelatedMaterial, errs, "service list", SERVICE_LIST_RM, SCHEMA_NAMESPACE, "SL040")
		if (foundHref!="" && validServiceControlApplication(foundHref)) 
			countControlApps++	}

	if (countControlApps>1)
		errs.pushCode("SL041", "only a single service control application can be signalled in a service", "multi apps")
		
	// check <ServiceList><RegionList> and remember regionID values
	let knownRegionIDs=[], RegionList=SL.get(xPath(SCHEMA_PREFIX, dvbi.e_RegionList), SL_SCHEMA)
	if (RegionList) {
		checkTopElements(SL_SCHEMA, SCHEMA_PREFIX, RegionList, [dvbi.e_Region], [], errs, "SL050")
		checkAttributes(RegionList, [dvbi.a_version], [], errs, "SL051")

		//check RegionList@version
		if (RegionList.attr(dvbi.a_version) && !isPositiveInteger(RegionList.attr(dvbi.a_version).value())) 
			errs.pushCode("SL052", dvbi.a_version.attribute(dvbi.e_RegionList)+" is not a positiveInteger ("+RegionList.attr(dvbi.a_version).value()+")")

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
	    CGSourceList=SL.get("//"+xPath(SCHEMA_PREFIX, dvbi.e_ContentGuideSourceList), SL_SCHEMA)
	if (CGSourceList) {
		let cgs=0, CGSource
		while (CGSource=CGSourceList.get(xPath(SCHEMA_PREFIX, dvbi.e_ContentGuideSource, ++cgs), SL_SCHEMA)) {

			validateAContentGuideSource(SL_SCHEMA, SCHEMA_PREFIX, SCHEMA_NAMESPACE, CGsource, dvbi.e_ServiceList+"."+dvbi.e_ContentGuideSourceList+"."+dvbi.e_ContentGuideSource+"["+cgs+"]", errs, "SL070")
			
			if (CGSource.attr(dvbi.a_CGSID)) {
				if (isIn(ContentGuideSourceIDs, CGSource.attr(dvbi.a_CGSID).value()))
					errs.pushCode("SL071", "duplicate "+dvbi.a_CGSID.attribute(dvbi.a_CGSID)+" ("+CGSource.attr(dvbi.a_CGSID).value()+") in service list", "duplicate "+dvbi.a_CGSID.attribute());
				else ContentGuideSourceIDs.push(CGSource.attr(dvbi.a_CGSID).value());
			}
		}
	}

	// check  elements in <ServiceList><ContentGuideSource>
	let slGCS=SL.get(xPath(SCHEMA_PREFIX, dvbi.e_ContentGuideSource), SL_SCHEMA)
	if (slGCS) 
		validateAContentGuideSource(SL_SCHEMA, SCHEMA_PREFIX, SCHEMA_NAMESPACE, slGCS, dvbi.e_ServiceList+"."+dvbi.e_ContentGuideSource, errs, "SL080")

	// this should not happen if the XML document has passed schema validation
	if (SL.get(xPath(SCHEMA_PREFIX, dvbi.e_ContentGuideSourceList), SL_SCHEMA) && SL.get(xPath(SCHEMA_PREFIX, dvbi.e_ContentGuideSource), SL_SCHEMA))
		errs.pushCode("SL081", "cannot specify both "+dvbi.e_ContentGuideSourceList.elementize()+" and "+dvbi.e_ContentGuideSource.elementize(), "source and ref")

	errs.set("num services", 0);

	// check <Service>
	let s=0, service, knownServices=[], thisServiceId
	while (service=SL.get("//"+xPath(SCHEMA_PREFIX, dvbi.e_Service, ++s), SL_SCHEMA)) {
		// for each service
		errs.set("num services", s);
		thisServiceId="service-"+s;  // use a default value in case <UniqueIdentifier> is not specified
		
		let serviceOptionalElements=[dvbi.e_ServiceInstance, dvbi.e_TargetRegion, tva.e_RelatedMaterial, dvbi.e_ServiceGenre, dvbi.e_ServiceType, dvbi.e_RecordingInfo, dvbi.e_ContentGuideSource, dvbi.e_ContentGuideSourceRef, dvbi.e_ContentGuideServiceRef]
		if (SchemaVersion(SCHEMA_NAMESPACE) > SCHEMA_v2)
			serviceOptionalElements.push(dvbi.e_ServiceDescription)
		
		checkTopElements(SL_SCHEMA, SCHEMA_PREFIX, service, [dvbi.e_UniqueIdentifier, dvbi.e_ServiceName, dvbi.e_ProviderName], serviceOptionalElements, errs, "SL101")
		checkAttributes(service, [dvbi.a_version], [dvbi.a_dynamic], errs, "SL102")
		
		//check Service@version
		if (service.attr(dvbi.a_version) && !isPositiveInteger(service.attr(dvbi.a_version).value()))
			errs.pushCode("SL103", dvbi.a_version.attribute(dvbi.e_Service)+" is not a positiveInteger ("+service.attr(dvbi.a_version).value()+")")

		// check <Service><UniqueIdentifier>
		let uID=service.get(xPath(SCHEMA_PREFIX, dvbi.e_UniqueIdentifier), SL_SCHEMA)
		if (uID) {
			thisServiceId=uID.text();
			if (!validServiceIdentifier(thisServiceId)) 
				errs.pushCode("SL110", thisServiceId.quote()+" is not a valid service identifier", "invalid tag");
			if (!uniqueServiceIdentifier(thisServiceId, knownServices)) 
				errs.pushCode("SL111", thisServiceId.quote()+" is not unique", "non unique id");
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
				UnspecifiedTargetRegion(TargetRegion.text(), "service "+thisServiceId.quote(), errs, "SL130");

		checkXMLLangs(SL_SCHEMA, SCHEMA_PREFIX, dvbi.e_ServiceName, "service="+thisServiceId.quote(), service, errs, "SL140");
		checkXMLLangs(SL_SCHEMA, SCHEMA_PREFIX, dvbi.e_ProviderName, "service="+thisServiceId.quote(), service, errs, "SL141");

		//check <Service><RelatedMaterial>
		let rm=0, RelatedMaterial
		while (RelatedMaterial=service.get(xPath(SCHEMA_PREFIX, tva.e_RelatedMaterial, ++rm), SL_SCHEMA)) 
			validateRelatedMaterial(RelatedMaterial, errs, "service "+thisServiceId.quote(), SERVICE_RM, SCHEMA_NAMESPACE, "SL150"); 

		//check <Service><ServiceGenre>
		let ServiceGenre=service.get(xPath(SCHEMA_PREFIX, dvbi.e_ServiceGenre), SL_SCHEMA)
		if (ServiceGenre) {
			checkAttributes(ServiceGenre, [dvbi.a_href], [tva.a_type], errs, "SL160")
			if (ServiceGenre.attr(dvbi.a_href) && !isIn(allowedGenres, ServiceGenre.attr(dvbi.a_href).value())) 
				errs.pushCode("SL161", "service "+thisServiceId.quote()+" has an invalid "+dvbi.a_href.attribute(dvbi.e_ServiceGenre)+" "+ServiceGenre.attr(dvbi.a_href).value().quote(), "invalid "+dvbi.e_ServiceGenre);

			if (ServiceGenre.attr(tva.a_type) && !isIn(tva.ALLOWED_GENRE_TYPES, ServiceGenre.attr(tva.a_type).value())) 
				errs.pushCode("SL162", "service "+thisServiceId.quote()+" has an invalid "+tva.a_type.attribute(dvbi.e_ServiceGenre)+" "+ServiceGenre.attr(dvbi.a_type).value().quote(), "invalid "+dvbi.e_ServiceGenre)
		}

		//check <Service><ServiceType>                    
		let ServiceType=service.get(xPath(SCHEMA_PREFIX, dvbi.e_ServiceType), SL_SCHEMA)
		if (ServiceType) {
			checkAttributes(ServiceType, [dvbi.a_href], [], errs, "SL163")
			if (ServiceType.attr(dvbi.a_href) && !isIn(allowedServiceTypes, ServiceType.attr(dvbi.a_href).value())) 
				errs.pushCode("SL164", "service "+thisServiceId.quote()+" has an invalid "+dvbi.e_ServiceType.elementize()+" ("+ServiceType.attr(dvbi.a_href).value()+")", "invalid ServiceType");
		}

		// check <Service><ServiceDescription>
		ValidateSynopsisType(SL_SCHEMA, SCHEMA_PREFIX, service, tva.e_ServiceDescription, [], [tva.SYNOPSIS_LENGTH_BRIEF, tva.SYNOPSIS_LENGTH_SHORT, tva.SYNOPSIS_LENGTH_MEDIUM, tva.SYNOPSIS_LENGTH_LONG, tva.SYNOPSIS_LENGTH_EXTENDED], "***", errs, "SL170") 

		// check <Service><RecordingInfo>
		let RecordingInfo=service.get(xPath(SCHEMA_PREFIX, dvbi.e_RecordingInfo), SL_SCHEMA)
		if (RecordingInfo) {
			checkAttributes(RecordingInfo, [dvbi.a_href], [], errs, "SL180")
			if (RecordingInfo.attr(dvbi.a_href) && !isIn(RecordingInfoCSvalules, RecordingInfo.attr(dvbi.a_href).value())) 
				errs.pushCode("SL181", "invalid "+dvbi.e_RecordingInfo.elementize()+" value "+RecordingInfo.attr(dvbi.a_href).value().quote()+"for service "+thisServiceId, "invalid RecordingInfo");
		}

		// check <Service><ContentGuideSource>
		let sCG=service.get(xPath(SCHEMA_PREFIX, dvbi.e_ContentGuideSource), SL_SCHEMA)
		if (sCG) 
			validateAContentGuideSource(SL_SCHEMA, SCHEMA_PREFIX, SCHEMA_NAMESPACE, sCG, dvbi.e_ContentGuideSource.elementize()+" in service "+thisServiceId, errs, "SL190")

		//check <Service><ContentGuideSourceRef>
		let sCGref=service.get(xPath(SCHEMA_PREFIX, dvbi.e_ContentGuideSourceRef), SL_SCHEMA)
		if (sCGref) {
			if (!isIn(ContentGuideSourceIDs, sCGref.text())) 
				errs.pushCode("SL200", "content guide reference "+sCGref.text().quote()+" for service "+thisServiceId.quote()+" not specified", "unspecified content guide source");
		}

		// this should not happen if the XML document has passed schema validation
		if (sCG && sCGref)
			errs.pushCode("SL210", "only "+dvbi.e_ContentGuideSource.elementize()+" or "+dvbi.e_CountentGuideSourceRef.elementize()+" to be specifed for a service "+thisServiceId.quote(), "source and ref");
	}        

	// check <Service><ContentGuideServiceRef>
	// issues a warning if this is not a reference to another service or is a reference to self
	s=0;
	while (service=SL.get("//"+xPath(SCHEMA_PREFIX, dvbi.e_Service, ++s), SL_SCHEMA)) {
		let CGSR=service.get(xPath(SCHEMA_PREFIX, dvbi.e_ContentGuideServiceRef), SL_SCHEMA);
		if (CGSR) {
			let uniqueID=service.get(xPath(SCHEMA_PREFIX, dvbi.e_UniqueIdentifier), SL_SCHEMA);
			if (!isIn(knownServices, CGSR.text())) 
				errs.pushCodeW("SL220", dvbi.e_ContentGuideServiceRef.elementize()+"="+CGSR.text().quote()+(uniqueID?(" in service "+uniqueID.text().quote()):"")+" does not refer to another service", "invalid "+dvbi.e_ContentGuideServiceRef.elementize());
			if (uniqueID && (CGSR.text()==uniqueID.text()))
				errs.pushCodeW("SL221", dvbi.e_ContentGuideServiceRef.elementize()+" is self", "self "+dvbi.e_ContentGuideServiceRef.elementize());
		}
	}

	// check <ServiceList><LCNTableList>
	let LCNtableList=SL.get("//"+xPath(SCHEMA_PREFIX, dvbi.e_LCNTableList), SL_SCHEMA)
	if (LCNtableList) {
		checkTopElements(SL_SCHEMA, SCHEMA_PREFIX, LCNtableList, [], [dvbi.e_LCNTable], errs, "SL230")
		let l=0, LCNTable
		while (LCNTable=LCNtableList.get(xPath(SCHEMA_PREFIX, dvbi.e_LCNTable, ++l), SL_SCHEMA)) {
			// checks on TargetRegion(s) for this LCNTable
			checkTopElements(SL_SCHEMA, SCHEMA_PREFIX, LCNTable, [], [dvbi.e_TargetRegion, dvbi.e_SubscriptionPackage, dvbi.e_LCN], errs, "SL231")
			
			// <LCNTable><TargetRegion>
			let tr=0, TargetRegion, lastTargetRegion=""
			while (TargetRegion=LCNTable.get(xPath(SCHEMA_PREFIX, dvbi.e_TargetRegion, ++tr), SL_SCHEMA)) {
				if (!isIn(knownRegionIDs, TargetRegion.text())) 
					errs.pushCode("SL240", dvbi.e_TargetRegion.elementize()+" "+TargetRegion.text()+" in "+dvbi.e_LCNTable.elementize()+" is not defined", "undefined region");
				lastTargetRegion=TargetRegion.text();
			}
			
			// <LCNTable><SubscriptionPackage>
			checkXMLLangs(SL_SCHEMA, SCHEMA_PREFIX, dvbi.e_SubscriptionPackage, dvbi.e_LCNTable, LCNTable, errs, "SL250");
			
			// <LCNTable><LCN>
			let LCNNumbers=[], e=0, LCN
			while (LCN=LCNTable.get(xPath(SCHEMA_PREFIX, dvbi.e_LCN, ++e), SL_SCHEMA)) {
				
				checkAttributes(LCN, [dvbi.a_channelNumber, dvbi.a_serviceRef], [dvbi.a_selectable, dvbi.a_visible], errs, "SL260")
				
				// LCN@channelNumber
				if (LCN.attr(dvbi.a_channelNumber)) {
					let chanNum=LCN.attr(dvbi.a_channelNumber).value()
					if (!isPositiveInteger(chanNum)) 
						errs.pushCode("SL261", dvbi.a_channelNumber.attribute(dvbi.e_LCN)+" is not a positiveInteger "+chanNum.quote(), "invalid value")
					
					if (isIn(LCNNumbers, chanNum)) 
						errs.pushCode("SL262", "duplicated channel number "+chanNum+" for "+dvbi.e_TargetRegion.elementize()+" "+lastTargetRegion, "duplicate channel number");
					else LCNNumbers.push(chanNum);
				}

				// LCN@serviceRef
				if (LCN.attr(dvbi.a_serviceRef) && !isIn(knownServices, LCN.attr(dvbi.a_serviceRef).value())) 
					errs.pushCode("SL263", "LCN reference to unknown service "+LCN.attr(dvbi.a_serviceRef).value(), "LCN unknown services");
				
				// LCN@selectable
				if (LCN.attr(dvbi.a_selectable) && !isBoolean(LCN.attr(dvbi.a_selectable).value())) 
					errs.pushCode("SL264", dvbi.a_selectable.attribute(dvbi.e_LCN)+" is not a boolean value "+LCN.attr(dvbi.a_selectable).value().quote(), "not boolean")
				
				// LCN@visible
				if (LCN.attr(dvbi.a_visible) && !isBoolean(LCN.attr(dvbi.a_visible).value()))
					errs.pushCode("SL265", dvbi.a_visible.attribute(dvbi.e_LCN)+" is not a boolean value "+LCN.attr(dvbi.a_visible).value().quote(), "not boolean")
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
function validateServiceList(SLtext) {
	var errs=new ErrorList()
	doValidateServiceList(SLtext, errs)

	return new Promise((resolve, reject) => {
		resolve(errs)
	})
}


/**
 * checks is the service list URL is provided in an argument to the query
 * 
 * @param {Object} req  The request from Express
 * @returns true if the SLurl parameter is specified containing the URL to a service list
 */
function checkQuery(req) {
	return (req && req.query && req.query.SLurl)
}


/**
 * checks if the service list file name is provided in an argument to the query
 * 
 * @param {Object} req  The request from Express
 * @returns true if the SLfile parameter is specified containing the file name a service list
 */
function checkFile(req) {
	return (req && req.files && req.files.SLfile)
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
		res.end()
	}
	else if (!checkQuery(req)) {
        drawForm(true, res, req.query.SLurl, "URL not specified");
		res.status(400);
		res.end()
    }
    else {
		let errs=new ErrorList()
			
		function handleErrors(response) {
			if (!response.ok) {
				throw Error(response.statusText)
			}
			return response
		}
		fetch(req.query.SLurl)
			.then(handleErrors)
			.then(response => response.text())
			.then(res=>validateServiceList(res.replace(/(\r\n|\n|\r|\t)/gm,"")))
			.then(errs=>drawForm(true, res, req.query.SLurl, null, errs))
			.then(res=>res.end())
			.catch(error => {
				console.log("error ("+error+") handling "+req.query.SLurl) 
				drawForm(true, res, req.query.SLurl, "error ("+error+") handling "+req.query.SLurl, null)
				res.end()
			})
   }
}



/**
 * Process the service list specificed by a file name for errors and display them
 *
 * @param {Object} req  The request from Express
 * @param {Object} res  The HTTP response to be sent to the client
 */ 
function processFile(req, res) {
    if (isEmpty(req.query)) 
        drawForm(false, res);    
    else if (!checkFile(req)) {
        drawForm(false, res, req.query.SLfile, "File not specified");
        res.status(400);
    }
    else {
        let SLxml=null
        let errs=new ErrorList()
        try {
            SLxml=req.files.SLfile.data;
        }
        catch (err) {
            errs.pushCode("PR101", "retrieval of FILE ("+req.query.SLfile+") failed");
        }
		if (SLxml) 
			doValidateServiceList(SLxml.toString().replace(/(\r\n|\n|\r|\t)/gm,""), errs)

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
        let stats=fs.statSync(filename)
        if (stats.isFile()) return fs.readFileSync(filename); 
    }
    catch (err) {console.log(err.code,err.path);}
    return null;
}

let app=express()

app.use(express.static(__dirname));
app.set('view engine', 'ejs');
app.use(fileupload());
app.use(favicon('favicon.ico'))


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
})


// start the HTTPS server
// sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ./selfsigned.key -out selfsigned.crt
var https_options={
    key:readmyfile(keyFilename),
    cert:readmyfile(certFilename)
}

if (https_options.key && https_options.cert) {
	if (options.sport==options.port)
		options.sport=options.port+1
	
    var https_server=https.createServer(https_options, app);
    https_server.listen(options.sport, function(){
        console.log("HTTPS listening on port number", https_server.address().port);
    });
}

