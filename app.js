// node.js - https://nodejs.org/en/
// express framework - https://expressjs.com/en/4x/api.html
const express=require("express");
var app=express();

/* TODO:

 - also look for TODO in the code itself
*/

const ErrorList=require("./dvb-common/ErrorList.js");
const dvbi=require("./dvb-common/DVB-I_definitions.js");
const {isJPEGmime, isPNGmime}=require("./dvb-common/MIME_checks.js");
const {isTAGURI}=require("./dvb-common/URI_checks.js");
const {loadCS}=require("./dvb-common/CS_handler.js");

const ISOcountries=require("./dvb-common/ISOcountries.js");
const IANAlanguages=require("./dvb-common/IANAlanguages.js");

// libxmljs - https://github.com/libxmljs/libxmljs
const libxml=require("libxmljs");

//TODO: validation against schema; package.json: 		"xmllint": "0.1.1",
//const xmllint=require("xmllint");

// morgan - https://github.com/expressjs/morgan
const morgan=require("morgan")

// file upload for express - https://github.com/richardgirges/express-fileupload
const fileupload=require("express-fileupload");


const fs=require("fs"), path=require("path");
//const request=require("request");

// command line arguments - https://github.com/75lb/command-line-args
const commandLineArgs=require('command-line-args');

var XmlHttpRequest=require("xmlhttprequest").XMLHttpRequest;

const https=require("https");
const DEFAULT_HTTP_SERVICE_PORT=3010;
const keyFilename=path.join(".","selfsigned.key"), certFilename=path.join(".","selfsigned.crt");

const { parse }=require("querystring");

// https://github.com/alexei/sprintf.js
var sprintf=require("sprintf-js").sprintf,
    vsprintf=require("sprintf-js").vsprintf

const TVA_ContentCSFilename=path.join("dvb-common/tva","ContentCS.xml"),
      TVA_FormatCSFilename=path.join("dvb-common/tva","FormatCS.xml"),
      DVBI_ContentSubjectFilename=path.join("dvb-common/dvbi","DVBContentSubjectCS-2019.xml"),
      DVBI_ServiceTypeCSFilename=path.join("dvb-common/dvbi","DVBServiceTypeCS-2019.xml"),
      DVB_AudioCodecCSFilename=path.join("dvb-common/dvb","AudioCodecCS.xml"),
      DVB_VideoCodecCSFilename=path.join("dvb-common/dvb","VideoCodecCS.xml"),
      MPEG7_AudioCodingFormatCSFilename=path.join("dvb-common/tva","AudioCodingFormatCS.xml"),
      MPEG7_VisualCodingFormatCSFilename=path.join("dvb-common/tva","VisualCodingFormatCS.xml"),
      DVB_AudioConformanceCSFilename=path.join("dvb-common/dvb","AudioConformancePointsCS.xml"),
      DVB_VideoConformanceCSFilename=path.join("dvb-common/dvb","VideoConformancePointsCS.xml"),
      ISO3166_Filename=path.join("dvb-common","iso3166-countries.json"),
      DVBI_RecordingInfoCSFilename=path.join("dvb-common/dvbi","DVBRecordingInfoCS-2019.xml");

// curl from https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry
const IANA_Subtag_Registry_Filename=path.join("./dvb-common","language-subtag-registry");
const IANA_Subtag_Registry_URL="https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry";

const COMMON_REPO_RAW="https://raw.githubusercontent.com/paulhiggs/dvb-common/master/",
      DVB_METADATA="https://dvb.org/metadata/",
      TVA_ContentCSURL=COMMON_REPO_RAW + "tva/" + "ContentCS.xml",
      TVA_FormatCSURL=COMMON_REPO_RAW + "tva/" + "FormatCS.xml",
      DVBI_ContentSubjectURL=COMMON_REPO_RAW + "dvbi/" + "DVBContentSubjectCS-2019.xml",
      DVBI_ServiceTypeCSURL=COMMON_REPO_RAW + "dvbi/" + "DVBServiceTypeCS-2019.xml",
      DVB_AudioCodecCSURL=DVB_METADATA + "cs/2007/" + "AudioCodecCS.xml",
      DVB_VideoCodecCSURL=DVB_METADATA + "cs/2007/" + "VideoCodecCS.xml",
      MPEG7_AudioCodingFormatCSURL=COMMON_REPO_RAW + "tva/" + "AudioCodingFormatCS.xml",
      MPEG7_VisualCodingFormatCSURL=COMMON_REPO_RAW + "tva/" + "VisualCodingFormatCS.xml",
      DVB_AudioConformanceCSURL=DVB_METADATA + "cs/2017/" + "AudioConformancePointsCS.xml",
      DVB_VideoConformanceCSURL=DVB_METADATA + "cs/2017/" + "VideoConformancePointsCS.xml",
      ISO3166_URL=COMMON_REPO_RAW + "iso3166-countries.json",
	  DVBI_RecordingInfoCSURL=COMMON_REPO_RAW + "dvbi/" + "DVBRecordingInfoCS-2019.xml";

const SERVICE_LIST_RM="service list",
      SERVICE_RM="service",
      CONTENT_GUIDE_RM="content guide";

var allowedGenres=[], allowedServiceTypes=[], allowedAudioSchemes=[], allowedVideoSchemes=[], 
	allowedAudioConformancePoints=[], allowedVideoConformancePoints=[], RecordingInfoCSvalules=[];

var knownCountries=new ISOcountries(false, true);
var knownLanguages=new IANAlanguages();

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
String.prototype.quote=function(using='"') {return using+this+using};
String.prototype.elementize=function() {return '<'+this+'>'};
String.prototype.attribute=function(elemName="") {return elemName+'@'+this};


const SCHEMA_v1=1,
      SCHEMA_v2=2,
	  SCHEMA_unknown= -1;
	  
/**
 * determine the schema version (and hence the specificaion version) in use 
 *
 * @param {String] namespace the namespace used in defining the schema
 * @return {Integer} representation of the schema version or error code if unknown 
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
 * @param {string} SCHEMA_PREFIX Used when constructing Xpath queries
 * @param {string} elementName the name of the element to be searched for
 * @param {int} index the instance of the named element to be searched for (if specified)
 * @returns {string} the XPath selector
 */
function xPath(SCHEMA_PREFIX, elementName, index=null) {
	return SCHEMA_PREFIX+":"+elementName+(index?"["+index+"]":"")
}


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

/**
 * determines if a value is in a set of values - simular to 
 *
 * @param {String or Array} values The set of values to check existance in
 * @param {String} value The value to check for existance
 * @return {boolean} if value is in the set of values
 */
function isIn(values, value){
    if (typeof(values) == "string")
        return values==value;
    
    if (typeof(values) == "object") {
        for (var x=0; x<values.length; x++) 
            if (values[x] == value)
                return true;
    }
    return false;
}


/* 
 * convert characters in the string to HTML entities
 *
 * @param {string} str that should be displayed in HTML
 * @return {string} a string with ENTITY representations of < and >
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
 * @param {boolean} useURLs use network locations as teh source rather than local files
 */
function loadDataFiles(useURLs) {
	console.log("loading classification schemes...");
    allowedGenres=[];
	loadCS(allowedGenres, useURLs, TVA_ContentCSFilename, TVA_ContentCSURL);
	loadCS(allowedGenres, useURLs, TVA_FormatCSFilename, TVA_FormatCSURL);
	loadCS(allowedGenres, useURLs, DVBI_ContentSubjectFilename, DVBI_ContentSubjectURL);
    
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
 * @param {String} identifier The service identifier
 * @return {boolean} true if the service identifier complies with the specification otherwise false
 */ 
function validServiceIdentifier(identifier){
    return isTAGURI(identifier);
}


/** 
 * determines if the identifer provided is unique against a list of known identifiers
 *
 * @param {String} identifier The service identifier
 * @param (Array} identifiers The list of known service identifiers
 * @return {boolean} true if the service identifier is unique otherwise false
 */
function uniqueServiceIdentifier(identifier,identifiers) {
    return !isIn(identifiers,identifier);
}

function addRegion(Region, depth, knownRegionIDs, errs) {
    var regionID=Region.attr(dvbi.a_regionID).value();
    var countryCodeSpecified=Region.attr(dvbi.a_countryCodes);
    if (isIn(knownRegionIDs, regionID)) 
        errs.push("Duplicate RegionID "+regionID.quote(), "duplicate regionID");
    else knownRegionIDs.push(regionID);

    if ((depth != 0) && countryCodeSpecified) 
        errs.push(dvbi.a_countryCodes.attribute()+" not permitted for sub-region "+regionID.quote(), "ccode in subRegion");


    if (countryCodeSpecified) {
        var countries=countryCodeSpecified.value().split(",");
        if (countries) countries.forEach(country => {
            if (!knownCountries.isISO3166code(country)) 
                errs.push("invalid country code ("+country+") for region "+regionID.quote(), "invalid country code");
        });
    }

    if (depth > dvbi.MAX_SUBREGION_LEVELS) 
        errs.push(dvbi.e_Region.elementize()+" depth exceeded (>"+dvbi.MAX_SUBREGION_LEVELS+") for sub-region "+regionID.quote(), "region depth exceeded");

    var i=0, RegionChild;
    while ((RegionChild=Region.child(i)) != null) {
        if (RegionChild.type()==="element" && RegionChild.name()==dvbi.e_Region) {
            // its a child Region
            addRegion(RegionChild,depth+1,knownRegionIDs,errs);
        }
        i++;
    }
}

/** 
 * determines if the identifer provided refers to a valid application launching method
 *
 * @param {String} HowRelated The service identifier
 * @return {boolean} true if this is a valid application launching method else false
 */
function validServiceApplication(HowRelated) {
    // return true if val is a valid CS value for Service Related Applications (A177 5.2.3)
    // urn:dvb:metadata:cs:LinkedApplicationCS:2019
    var val= HowRelated.attr(dvbi.a_href) ? HowRelated.attr(dvbi.a_href).value() : null;
    return val==dvbi.APP_IN_PARALLEL
        || val==dvbi.APP_IN_CONTROL
        || val==dvbi.APP_OUTSIDE_AVAILABILITY;
}

/** 
 * determines if the identifer provided refers to a valid DASH media type (single MPD or MPD playlist)
 *
 * @param {String} contentType The contentType for the file
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
 * @param {String} HowRelated The banner identifier
 * @param {String} namespace The namespace being used in the XML document
 * @return {boolean} true if this is a valid banner for out-of-servce-hours presentation else false
 */
function validOutScheduleHours(HowRelated, namespace) {
    // return true if val is a valid CS value for Out of Service Banners (A177 5.2.5.3)
    var val= HowRelated.attr(dvbi.a_href) ? HowRelated.attr(dvbi.a_href).value() : null;
    return (SchemaVersion(namespace)==SCHEMA_v1 && val==dvbi.BANNER_OUTSIDE_AVAILABILITY_v1)
		|| (SchemaVersion(namespace)==SCHEMA_v2 && val==dvbi.BANNER_OUTSIDE_AVAILABILITY_v2);
}

/** 
 * determines if the identifer provided refers to a valid banner for content-finished presentation
 *
 * @since DVB A177v2
 * @param {String} HowRelated The banner identifier
 * @param {String} namespace The namespace being used in the XML document
 * @return {boolean} true if this is a valid banner for content-finished presentation else false
 */
function validContentFinishedBanner(HowRelated, namespace) {
    // return true if val is a valid CS value for Content Finished Banner (A177 5.2.7.3)
    var val= HowRelated.attr(dvbi.a_href) ? HowRelated.attr(dvbi.a_href).value() : null;
    return (SchemaVersion(namespace)==SCHEMA_v2 && val==dvbi.BANNER_CONTENT_FINISHED_v2);
}

/** 
 * determines if the identifer provided refers to a valid service list logo
 *
 * @param {String} HowRelated The logo identifier
 * @param {String} namespace The namespace being used in the XML document
 * @return {boolean} true if this is a valid logo for a service list else false
 */
function validServiceListLogo(HowRelated, namespace) {
    // return true if val is a valid CS value Service List Logo (A177 5.2.6.1)
    var val= HowRelated.attr(dvbi.a_href) ? HowRelated.attr(dvbi.a_href).value() : null;
	return (SchemaVersion(namespace)==SCHEMA_v1 && val==dvbi.LOGO_SERVICE_LIST_v1)
		|| (SchemaVersion(namespace)==SCHEMA_v2 && val==dvbi.LOGO_SERVICE_LIST_v2);
}

/** 
 * determines if the identifer provided refers to a valid service  logo
 *
 * @param {String} HowRelated The logo identifier
 * @param {String} namespace The namespace being used in the XML document
 * @return {boolean} true if this is a valid logo for a service  else false
 */
function validServiceLogo(HowRelated, namespace) {
    // return true if val is a valid CS value Service Logo (A177 5.2.6.2)
	var val= HowRelated.attr(dvbi.a_href) ? HowRelated.attr(dvbi.a_href).value() : null;
    return (SchemaVersion(namespace)==SCHEMA_v1 && val==dvbi.LOGO_SERVICE_v1)
		|| (SchemaVersion(namespace)==SCHEMA_v2 && val==dvbi.LOGO_SERVICE_v2);
}

/** 
 * determines if the identifer provided refers to a valid content guide source logo
 *
 * @param {String} HowRelated The logo identifier
 * @param {String} namespace The namespace being used in the XML document
 * @return {boolean} true if this is a valid logo for a content guide source else false
 */
function validContentGuideSourceLogo(HowRelated, namespace) {
    // return true if val is a valid CS value Service Logo (A177 5.2.6.3)
    var val= HowRelated.attr(dvbi.a_href) ? HowRelated.attr(dvbi.a_href).value() : null;
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
    return s?s[0] === ext:false;
}


/**
 * verifies if the specified logo is valid according to specification
 *
 * @param {Object} HowRelated the <HowRelated> subelement (a libxmls ojbect tree) of the <RelatedMaterial> element
 * @param {Object} Format the <Format> subelement (a libxmls ojbect tree) of the <RelatedMaterial> element
 * @param {Object} MediaLocator the <MediaLocator> subelement (a libxmls ojbect tree) of the <RelatedMaterial> element
 * @param {Object} errs The class where errors and warnings relating to the serivce list processing are stored 
 * @param {string} Location The printable name used to indicate the location of the <RelatedMaterial> element being checked. used for error reporting
 * @param {string} LocationType The type of element containing the <RelatedMaterial> element. Different validation rules apply to different location types
*/
function checkValidLogo(HowRelated,Format,MediaLocator,errs,Location,LocationType) {
    // irrespective of the HowRelated@href, all logos have specific requirements
    var isJPEG=false, isPNG=false;

    if (!HowRelated)
        return;
    
    // if <Format> is specified, then it must be per A177 5.2.6.1, 5.2.6.2 or 5.2.6.3 -- which are all the same
    if (Format) {
        var subElems=Format.childNodes(), hasStillPictureFormat=false;
        if (subElems) subElems.forEach(child => {
            if (child.name()==dvbi.e_StillPictureFormat) {
                hasStillPictureFormat=true;
                if (!child.attr(dvbi.a_horizontalSize)) 
                    errs.push(dvbi.a_horizontalSize.attribute()+" not specified for "+dvbi.e_RelatedMaterial.elementize()+dvbi.e_Format.elementize()+dvbi.e_StillPictureFormat.elementize()+" in "+Location, "no "+dvbi.a_horizontalSize.attribute());
                if (!child.attr(dvbi.a_verticalSize)) 
                    errs.push(dvbi.a_verticalSize.attribute()+" not specified for "+dvbi.e_RelatedMaterial.elementize()+dvbi.e_Format.elementize()+dvbi.e_StillPictureFormat.elementize()+" in "+Location, "no "+dvbi.a_verticalSize.attribute());
                if (child.attr(dvbi.a_href)) {
                    var href=child.attr(dvbi.a_href).value();
                    if (href != dvbi.JPEG_IMAGE_CS_VALUE && href != dvbi.PNG_IMAGE_CS_VALUE) {
						InvalidHrefValue(errs, href, dvbi.e_RelatedMaterial.elementize()+dvbi.e_Format.elementize()+dvbi.e_StillPictureFormat.elementize(), Location)
                    }
                    if (href == dvbi.JPEG_IMAGE_CS_VALUE) isJPEG=true;
                    if (href == dvbi.PNG_IMAGE_CS_VALUE) isPNG=true;
                }
                else {
					NoHrefAttribute(errs, dvbi.e_RelatedMaterial.elementize()+dvbi.e_Format.elementize(), Location);
                }
            }
        });
        if (!hasStillPictureFormat) 
            errs.push(dvbi.e_StillPictureFormat.elementize()+" not specified for "+dvbi.e_Format.elementize()+" in "+Location, "no StillPictureFormat");
    }

    if (MediaLocator) {
        var subElems=MediaLocator.childNodes(), hasMediaURI=false;
        if (subElems) subElems.forEach(child => {
            if (child.name()==dvbi.e_MediaUri) {
                hasMediaURI=true;
                if (!child.attr(dvbi.a_contentType)) 
                    errs.push(dvbi.a_contentType.attribute()+" not specified for logo "+dvbi.e_MediaUri.elementize()+" in "+Location, "unspecified "+dvbi.a_contentType.attribute(dvbi.e_MediaUri));
                else {
                    var contentType=child.attr(dvbi.a_contentType).value();
                    if (!isJPEGmime(contentType) && !isPNGmime(contentType))
                        errs.push("invalid "+dvbi.a_contentType.attribute()+" "+contentType.quote()+" specified for "+dvbi.e_RelatedMaterial.elementize()+dvbi.e_MediaLocator.elementize()+" in "+Location, "invalid "+dvbi.a_contentType.attribute(dvbi.e_MediaUri));
                    if (Format && ((isJPEGmime(contentType) && !isJPEG) || (isPNGmime(contentType) && !isPNG))) 
                        errs.push("conflicting media types in "+dvbi.e_Format.elementize()+" and "+dvbi.e_MediaUri.elementize()+" for "+Location, "conflicting mime types");
                }
            }
        });
        if (!hasMediaURI) 
			NoMediaLocator(errs, "logo", Location);
    }
    else 
        errs.push(dvbi.e_MediaLocator+" not specified for "+dvbi.e_RelatedMaterial.elementize()+" in "+Location, "no "+dvbi.e_MediaLocator);
}

/**
 * verifies if the specified application is valid according to specification
 *
 * @param {Object} HowRelated the <HowRelated> subelement (a libxmls ojbect tree) of the <RelatedMaterial> element
 * @param {Object} Format the <Format> subelement (a libxmls ojbect tree) of the <RelatedMaterial> element
 * @param {Object} MediaLocator the <MediaLocator> subelement (a libxmls ojbect tree) of the <RelatedMaterial> element
 * @param {Object} errs The class where errors and warnings relating to the serivce list processing are stored 
 * @param {string} Location The printable name used to indicate the location of the <RelatedMaterial> element being checked. used for error reporting
 * @param {string} LocationType The type of element containing the <RelatedMaterial> element. Different validation rules apply to different location types
 */
function checkSignalledApplication(HowRelated,Format,MediaLocator,errs,Location,LocationType) {
    if (!MediaLocator) 
		NoMediaLocator(errs, "application", Location);
    else {
        var subElems=MediaLocator.childNodes(), hasMediaURI=false;
        if (subElems) subElems.forEach(child => {
            if (child.name()==dvbi.e_MediaUri) {
                hasMediaURI=true;
                if (!child.attr(dvbi.a_contentType)) 
                    errs.push(dvbi.a_contentType.attribute()+" not specified for "+dvbi.e_MediaUri.elementize()+" in "+Location, "unspecified "+dvbi.a_contentType.attribute(dvbi.e_MediaUri));
                else 
                    if (child.attr(dvbi.a_contentType).value()!=dvbi.XML_AIT_CONTENT_TYPE) 
                        errs.pushW(dvbi.a_contentType.attribute()+" "+child.attr(dvbi.a_contentType).value().quote()+" is not DVB AIT for "+dvbi.e_RelatedMaterial.elementize()+dvbi.e_MediaLocator.elementize()+" in "+Location, "invalid "+dvbi.a_contentType.attribute(dvbi.e_MediaUri));
            }
        });
        if (!hasMediaURI) 
			NoMediaLocator(errs, "application", Location);
    }
}

/**
 * verifies if the specified RelatedMaterial element is valid according to specification (contents and location)
 *
 * @param {Object} RelatedMaterial the <RelatedMaterial> element (a libxmls ojbect tree) to be checked
 * @param {Object} errs The class where errors and warnings relating to the serivce list processing are stored 
 * @param {string} Location The printable name used to indicate the location of the <RelatedMaterial> element being checked. used for error reporting
 * @param {string} LocationType The type of element containing the <RelatedMaterial> element. Different validation rules apply to different location types
 * @param {string} SCHEMA_NAMESPACE The namespace of XML document
 */
function validateRelatedMaterial(RelatedMaterial, errs, Location, LocationType, SCHEMA_NAMESPACE) {
    var HowRelated=null, Format=null, MediaLocator=[];
    var elem=RelatedMaterial.child(0);
    while (elem) {
        if (elem.name()===dvbi.e_HowRelated)
            HowRelated=elem;
        else if (elem.name()===dvbi.e_Format)
            Format=elem;
        else if (elem.name()===dvbi.e_MediaLocator)
            MediaLocator.push(elem);

        elem=elem.nextElement();
    }

    if (!HowRelated) {
        errs.push(dvbi.e_HowRelated.elementize()+" not specified for "+dvbi.e_RelatedMaterial.elementize()+" in "+Location, "no "+dvbi.e_HowRelated);
		return;
    }
	var HRhref=HowRelated.attr(dvbi.a_href);
	if (HRhref) {
		if (LocationType==SERVICE_LIST_RM) {
			if (!validServiceListLogo(HowRelated,SCHEMA_NAMESPACE)) 
				InvalidHrefValue(errs, HRhref.value(), dvbi.e_RelatedMaterial.elementize(), Location )
			else 
				MediaLocator.forEach(locator => 
					checkValidLogo(HowRelated, Format, locator, errs, Location, LocationType));
		}
		if (LocationType==SERVICE_RM) {
			if (validContentFinishedBanner(HowRelated, SCHEMA_NAMESPACE) && (SchemaVersion(SCHEMA_NAMESPACE) == SCHEMA_v1)) 
				errs.push(dvbi.BANNER_CONTENT_FINISHED_v2.quote()+" not permitted for "+SCHEMA_NAMESPACE.quote()+" in "+Location, "invalid CS value");
			
			if (!(validOutScheduleHours(HowRelated, SCHEMA_NAMESPACE) || validContentFinishedBanner(HowRelated, SCHEMA_NAMESPACE) ||validServiceApplication(HowRelated) || validServiceLogo(HowRelated, SCHEMA_NAMESPACE))) 
				InvalidHrefValue(errs, HRhref.value(), dvbi.e_RelatedMaterial.elementize(), Location );
			else {
				if (validServiceLogo(HowRelated, SCHEMA_NAMESPACE)||validOutScheduleHours(HowRelated, SCHEMA_NAMESPACE))
					MediaLocator.forEach(locator =>
						checkValidLogo(HowRelated, Format, locator, errs, Location, LocationType));
				if (validServiceApplication(HowRelated))
					MediaLocator.forEach(locator =>
						checkSignalledApplication(HowRelated, Format, locator, errs, Location, LocationType));
			}
		}
		if (LocationType==CONTENT_GUIDE_RM) {
			if (!validContentGuideSourceLogo(HowRelated, SCHEMA_NAMESPACE)) 
				InvalidHrefValue(errs, HRhref.value(), dvbi.e_RelatedMaterial.elementize(), Location)
			else 
				MediaLocator.forEach(locator =>
					checkValidLogo(HowRelated, Format, locator, errs, Location, LocationType));
		}
	}
	else 
		NoHrefAttribute(errs, dvbi.e_RelatedMaterial.elementize()+dvbi.e_HowRelated.elementize(), Location);

}

/**
 * checks that all the @xml:lang values for an element are unique
 *
 * @param {String} SL_SCHEMA Used when constructing Xpath queries
 * @param {String} SCHEMA_PREFIX Used when constructing Xpath queries
 * @param {String} elementName the multilingual XML element to check
 * @param {String} elementLocation the descriptive location of the element being checked (for reporting)
 * @param {Object} node The XML tree node containing the element being checked
 * @param {Object} errs The class where errors and warnings relating to the serivce list processing are stored 
 */
function checkXMLLangs(SL_SCHEMA, SCHEMA_PREFIX, elementName, elementLocation, node, errs) {
    var elementLanguages=[], i=0;
    while (elem=node.get(xPath(SCHEMA_PREFIX, elementName, ++i), SL_SCHEMA)) {
        var langAttr=elem.attr(dvbi.a_lang);
		var lang=langAttr?langAttr.value():"unspecified";
        if (isIn(elementLanguages,lang)) 
            errs.push("xml:lang="+lang.quote()+" already specifed for "+elementName.elementize()+" for "+elementLocation, "duplicate @xml:lang");
        else elementLanguages.push(lang);

        //if lang is specified, validate the format and value of the attribute against BCP47 (RFC 5646)
		if (lang!="unspecified") {
			if (!knownLanguages.isKnown(lang)) 
				errs.push("xml:lang value "+lang.quote()+" is invalid", "invalid @xml:lang");
		}
    }
}

/**
 * checks of the object provided is empty, either contains no values or properties
 *
 * @param {Object} obj the item (array, string, object) to be checked
 * @returns {boolean} true if the object being checked is empty
 */
function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}



const FORM_TOP="<html><head><title>DVB-I Service List Validator</title></head><body>";

const PAGE_HEADING="<h1>DVB-I Service List Validator</h1>";
const ENTRY_FORM_URL="<form method=\"post\"><p><i>URL:</i></p><input type=\"url\" name=\"SLurl\" value=\"%s\"><input type=\"submit\" value=\"submit\"></form>";

const ENTRY_FORM_FILE="<form method=\"post\" encType=\"multipart/form-data\"><p><i>FILE:</i></p><input type=\"file\" name=\"SLfile\" value=\"%s\"><input type=\"submit\" value=\"submit\"></form>";

const RESULT_WITH_INSTRUCTION="<br><p><i>Results:</i></p>";
const SUMMARY_FORM_HEADER="<table><tr><th>item</th><th>count</th></tr>";
const FORM_BOTTOM="</body></html>";

/**
 * constructs HTML output of the errors found in the service list analysis
 *
 * @param {boolean} URLmode if true ask for a URL to a service list, if false ask for a file
 * @param {Object} res the Express result 
 * @param {string} lastURL the url of the service list - used to keep the form intact
 * @param {Object} o the errors and warnings found during the service list validation
 */
function drawForm(URLmode, res, lastInput, o) {
    res.write(FORM_TOP);    
    res.write(PAGE_HEADING);    
    if (URLmode) 
		res.write(sprintf(ENTRY_FORM_URL, lastInput ? lastInput : ""));
	else res.write(sprintf(ENTRY_FORM_FILE, lastInput ? lastInput : ""));
    res.write(RESULT_WITH_INSTRUCTION);
    if (o) {
        if (o.error) {
            res.write("<p>"+o.error+"</p>");
        }
        var resultsShown=false;
        if (o.errors) {
            var tableHeader=false;
            for (var i in o.errors.counts) {
                if (o.errors.counts[i] != 0) {
                    if (!tableHeader) {
                        res.write(SUMMARY_FORM_HEADER);
                        tableHeader=true;
                    }
                    res.write("<tr><td>"+HTMLize(i)+"</td><td>"+o.errors.counts[i]+"</td></tr>");
                    resultsShown=true;
                }
            }
            for (var i in o.errors.countsWarn) {
                if (o.errors.countsWarn[i] != 0) {
                    if (!tableHeader) {
                        res.write(SUMMARY_FORM_HEADER);
                        tableHeader=true;
                    }
                    res.write("<tr><td><i>"+HTMLize(i)+"</i></td><td>"+o.errors.countsWarn[i]+"</td></tr>");
                    resultsShown=true;
                }
            }

            if (tableHeader) res.write("</table>");

            tableHeader=false;
            o.errors.messages.forEach(function(value)
            {
                if (!tableHeader) {
                    res.write("<table><tr><th>errors</th></tr>");
                    tableHeader=true;                    
                }
                res.write("<tr><td>"+HTMLize(value)+"</td></tr>");
                resultsShown=true;
            });
            if (tableHeader) res.write("</table>");
            
            tableHeader=false;
            o.errors.messagesWarn.forEach(function(value)
            {
                if (!tableHeader) {
                    res.write("<table><tr><th>warnings</th></tr>");
                    tableHeader=true;                    
                }
                res.write("<tr><td>"+HTMLize(value)+"</td></tr>");
                resultsShown=true;
            });
            if (tableHeader) res.write("</table>");        
        }
        if (!resultsShown) res.write("no errors or warnings");
    }
    res.write(FORM_BOTTOM);        
}



/**
 * Add an error message for missing <xxxDeliveryParameters>
 *
 * @param {Object} errs Errors buffer
 * @param {String} source The missing source type
 * @param {String} serviceId The serviceId whose instance is missing delivery parameters
 */
function NoDeliveryParams(errs, source, serviceId) {
    errs.push(source+" delivery parameters not specified for service instance in service "+serviceId.quote(), "no delivery params");
}

/**
 * Add an error message when the @href is not specified for an element
 *
 * @param {Object} errs Errors buffer
 * @param {String} src The element missing the @href
 * @param {String} loc The location of the element
 */
function NoHrefAttribute(errs, src, loc) {
	errs.push("no @href specified for "+src+" in "+loc, "no href");
}

/**
 * Add an error message when the @href contains an invalid value
 *
 * @param {Object} errs Errors buffer
 * @param {String} value The invalid value for the href attribute
 * @param {String} src The element missing the @href
 * @param {String} loc The location of the element
 */
function InvalidHrefValue(errs, value, src, loc) {
	errs.push("invalid "+dvbi.a_href.attribute()+"="+value.quote()+" specified for "+src+" in "+loc, "invalid href");
}

/**
 * Add an error message an incorrect country code is specified in transmission parameters
 *
 * @param {Object} errs Errors buffer
 * @param {String} value The invalid country code
 * @param {String} src The transmission mechanism
 * @param {String} loc The location of the element
 */
function InvalidCountryCode(errs, value, src, loc) {
	errs.push("invalid country code ("+value+") for "+src+" parameters in "+loc, "invalid country code");
}

/**
 * Add an error message an unspecifed target region is used
 *
 * @param {Object} errs Errors buffer
 * @param {String} region The unspecified target region
 * @param {String} loc The location of the element
 */
function UnspecifiedTargetRegion(errs, region, loc) {
	errs.push(loc+" has an unspecified "+dvbi.e_TargetRegion.elementize()+region, "target region");	
}


/**
 * Add an error message when the MediaLocator does not contain a MediaUri sub-element
 *
 * @param {Object} errs Errors buffer
 * @param {String} src The type of element with the <MediaLocator>
 * @param {String} loc The location of the element
 */
function NoMediaLocator(errs, src, loc) {
	errs.push("<MediaUri> not specified for "+src+" "+dvbi.e_MediaLocator.elementize()+" in "+loc, "no MediaUri");
}

/**
 * check if the node provided contains an RelatedMaterial element for a signalled application
 *
 * @param {Object} node The XML tree node (either a <Service> or a <ServiceInstance>) to be checked
 * @param {string} SCHEMA_PREFIX Used when constructing Xpath queries
 * @param {string} SL_SCHEMA Used when constructing Xpath queries
 * @returns {boolean}  true if the node contains a <RelatedMaterial> element which signals an application else false
 */
function hasSignalledApplication(node, SCHEMA_PREFIX, SL_SCHEMA) {
	var i=0, elem;
    while (elem=node.get(xPath(SCHEMA_PREFIX, dvbi.e_RelatedMaterial, ++i), SL_SCHEMA)) {
        var hr=elem.get(xPath(SCHEMA_PREFIX, dvbi.e_HowRelated), SL_SCHEMA);
		if (hr && validServiceApplication(hr)) 
			return true;			
    }

    return false;
}


/**
 * validate the service list and record any errors
 *
 * @param {String} SLtext the service list text to be validated
 * @param {Class} errs errors found in validaton
 */
function validateServiceList(SLtext, errs) {
	var SL=null;
	if (SLtext) try {
		SL=libxml.parseXmlString(SLtext);
	} catch (err) {
		errs.push("XML parsing failed: "+err.message, "malformed XML");
	}
	if (!SL || !SL.root()) {
		errs.push("SL is empty")
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
	if (SL.root().name() !== "ServiceList") {
		errs.push("Root element is not "+dvbi.e_ServiceList.elementize());
		return;
	}
	
	var SL_SCHEMA={}, 
		SCHEMA_PREFIX=SL.root().namespace().prefix(), 
		SCHEMA_NAMESPACE=SL.root().namespace().href();
	SL_SCHEMA[SCHEMA_PREFIX]=SCHEMA_NAMESPACE;

	if (SchemaVersion(SCHEMA_NAMESPACE) == SCHEMA_unknown) {
		errs.push("Unsupported namespace "+SCHEMA_NAMESPACE.quote());
		return;
	}

	// Check that the @xml:lang values for each <Name> element are unique and only one element does not have any language specified
	checkXMLLangs(SL_SCHEMA, SCHEMA_PREFIX, dvbi.e_Name, dvbi.e_ServiceList, SL, errs);

	// Check that the @xml:lang values for each <ProviderName> element are unique and only one elementdoes not have any language specified
	checkXMLLangs(SL_SCHEMA, SCHEMA_PREFIX, dvbi.e_ProviderName, dvbi.e_ServiceList, SL, errs);

	//check <ServiceList><RelatedMaterial>
	var rm=0, RelatedMaterial;
	while (RelatedMaterial=SL.get(xPath(SCHEMA_PREFIX, dvbi.e_RelatedMaterial, ++rm), SL_SCHEMA)) 
		validateRelatedMaterial(RelatedMaterial,errs,"service list", SERVICE_LIST_RM, SCHEMA_NAMESPACE);

	// check <ServiceList><RegionList> and remember regionID values
	var knownRegionIDs=[], RegionList=SL.get(xPath(SCHEMA_PREFIX, dvbi.e_RegionList), SL_SCHEMA);
	if (RegionList) {
		// recurse the regionlist - Regions can be nested in Regions
		var r=0, Region;
		while (Region=RegionList.get(xPath(SCHEMA_PREFIX, dvbi.e_Region, ++r), SL_SCHEMA)) 
			addRegion(Region, 0, knownRegionIDs, errs);
	}

	//check <ServiceList><TargetRegion>
	var tr=0, TargetRegion;
	while (TargetRegion=SL.get(xPath(SCHEMA_PREFIX, dvbi.e_TargetRegion, ++tr), SL_SCHEMA)) 
		if (!isIn(knownRegionIDs,TargetRegion.text())) 
			UnspecifiedTargetRegion(errs, TargetRegion.text(), "service list");


	// <ServiceList><LCNTableList> is checked below, after the services are enumerated

	// check mpeg7:TextualType elements in <ServiceList><ContentGuideSourceList>
	var cgs=0, CGsource;
	while (CGsource=SL.get(xPath(SCHEMA_PREFIX, dvbi.e_ContentGuideSourceList)+"/"+xPath(SCHEMA_PREFIX, dvbi.e_ContentGuideSource, ++cgs), SL_SCHEMA)) {
		// Check that the @xml:lang values for each <ContentGuideSourceList><ContentGuideSource>[cgs]<Name> element are unique and only one element 
		// does not have any language specified
		checkXMLLangs(SL_SCHEMA, SCHEMA_PREFIX, dvbi.e_Name, dvbi.e_ServiceList+"."+dvbi.e_ContentGuideSourceList+"."+dvbi.e_ContentGuideSource+"["+cgs+"]", CGsource, errs);

		// Check that the @xml:lang values for each <ContentGuideSourceList><ContentGuideSource>[cgs] element are unique and only one element 
		// does not have any language specified
		checkXMLLangs(SL_SCHEMA, SCHEMA_PREFIX, dvbi.e_ProviderName, dvbi.e_ServiceList+"."+dvbi.e_ContentGuideSourceList+"."+dvbi.e_ContentGuideSource+"["+cgs+"]", CGsource, errs);
	}

	//check service list <ContentGuideSourceList>
	var ContentGuideSourceIDs=[];
	var CGSourceList=SL.get("//"+xPath(SCHEMA_PREFIX, dvbi.e_ContentGuideSourceList), SL_SCHEMA);
	if (CGSourceList) {
		var i=0, CGSource;
		while (CGSource=CGSourceList.get(xPath(SCHEMA_PREFIX, dvbi.e_ContentGuideSource, ++i), SL_SCHEMA)) {

			if (isIn(ContentGuideSourceIDs,CGSource.attr(dvbi.a_CGSID).value()))
				errs.push("duplicate "+dvbi.a_CGSID.attribute()+" in service list", "duplicate "+dvbi.a_CGSID.attribute());
			else ContentGuideSourceIDs.push(CGSource.attr(dvbi.a_CGSID).value());

			var rm=0, CGrm;
			while (CGrm=CGSource.get(xPath(SCHEMA_PREFIX, dvbi.e_RelatedMaterial, ++rm), SL_SCHEMA)) 
				validateRelatedMaterial(CGrm, errs, dvbi.e_ServiceList.elementize()+dvbi.e_ContentGuideSourceList.elementize(), CONTENT_GUIDE_RM, SCHEMA_NAMESPACE);
		}
	}

	// check  elements in <ServiceList><ContentGuideSource>
	var slGCS=SL.get(xPath(SCHEMA_PREFIX, dvbi.e_ContentGuideSource), SL_SCHEMA);
	if (slGCS) {
		// Check that the @xml:lang values for each <ContentGuideSource><Name> element are unique and only one element does not have any language specified
		checkXMLLangs(SL_SCHEMA, SCHEMA_PREFIX, dvbi.e_Name, dvbi.e_ServiceList+"."+dvbi.e_ContentGuideSource, slGCS, errs);

		// Check that the @xml:lang values for each <ContentGuideSource><ProviderName> element are unique and only one element does not have any language specified
		checkXMLLangs(SL_SCHEMA, SCHEMA_PREFIX, dvbi.e_ProviderName, dvbi.e_ServiceList+"."+dvbi.e_ContentGuideSource, slGCS, errs);

		var rm=0, CGrm;
		while (CGrm=slGCS.get(xPath(SCHEMA_PREFIX, dvbi.e_RelatedMaterial, ++rm), SL_SCHEMA))
			validateRelatedMaterial(CGrm, errs, dvbi.e_ServiceList.elementize()+dvbi.e_ContentGuideSourceList.elementize(), CONTENT_GUIDE_RM, SCHEMA_NAMESPACE);
	}

	errs.set("num services",0);

	// check <Service>
	var s=0, service, knownServices=[], thisServiceId;
	while (service=SL.get("//"+xPath(SCHEMA_PREFIX, dvbi.e_Service, ++s), SL_SCHEMA)) {
		// for each service
		errs.set("num services",s);
		thisServiceId="service-"+s;  // use a default value in case <UniqueIdentifier> is not specified

		// check <Service><UniqueIdentifier>
		var uID=service.get(xPath(SCHEMA_PREFIX, dvbi.e_UniqueIdentifier), SL_SCHEMA);
		if (!uID) 
			// this should not happen as UniqueIdentifier is a mandatory element within Service
			errs.push(dvbi.e_UniqueIdentifier+" not present for service "+s, "no "+dvbi.e_UniqueIdentifier.elementize());

		else {
			thisServiceId=uID.text();
			if (!validServiceIdentifier(thisServiceId)) 
				errs.push(thisServiceId.quote()+" is not a valid identifier", "invalid tag");
			if (!uniqueServiceIdentifier(thisServiceId,knownServices)) 
				errs.push(thisServiceId.quote()+" is not unique", "non unique id");
			knownServices.push(thisServiceId);
		}

		//check <Service><ServiceInstance>
		var si=0, ServiceInstance;
		while (ServiceInstance=service.get(xPath(SCHEMA_PREFIX, dvbi.e_ServiceInstance, ++si), SL_SCHEMA)) {
			//for each service instance

			// Check that the @xml:lang values for each <DisplayName> element are unique and only one element does not have any language specified
			checkXMLLangs(SL_SCHEMA, SCHEMA_PREFIX, dvbi.e_DisplayName, "service instance in service="+thisServiceId.quote(), ServiceInstance, errs);

			// check @href of <ServiceInstance><RelatedMaterial>
			var rm=0, RelatedMaterial;
			while (RelatedMaterial=ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_RelatedMaterial, ++rm), SL_SCHEMA)) 
				validateRelatedMaterial(RelatedMaterial, errs, "service instance of "+thisServiceId.quote(), SERVICE_RM, SCHEMA_NAMESPACE);

			// Check @href of ContentAttributes/AudioConformancePoints
			var cp=0, conf;
			while (conf=ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_ContentAttributes)+"/"+xPath(SCHEMA_PREFIX, dvbi.e_AudioConformancePoint, ++cp), SL_SCHEMA)) 
				if (conf.attr(dvbi.a_href) && !isIn(allowedAudioConformancePoints,conf.attr(dvbi.a_href).value())) 
					errs.push("invalid "+dvbi.a_href.attribute(dvbi.e_AudioConformancePoint)+" ("+conf.attr(dvbi.a_href).value()+")", "audio conf point");

			// Check @href of ContentAttributes/AudioAttributes/tva:coding
			cp=0;
			while (conf=ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_ContentAttributes)+"/"+xPath(SCHEMA_PREFIX, dvbi.e_AudioAttributes, ++cp)+"/*", SL_SCHEMA))
				if (conf.name()===dvbi.e_Coding && conf.attr(dvbi.a_href) && !isIn(allowedAudioSchemes,conf.attr(dvbi.a_href).value())) 
					errs.push("invalid "+dvbi.a_href.attribute(dvbi.e_AudioAttributes)+" value for ("+conf.attr(dvbi.a_href).value()+")", "audio codec");

			// Check @href of ContentAttributes/VideoConformancePoints
			cp=0;
			while (conf=ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_ContentAttributes)+"/"+xPath(SCHEMA_PREFIX, dvbi.e_VideoConformancePoint, ++cp), SL_SCHEMA))  
				if (conf.attr(dvbi.a_href) && !isIn(allowedVideoConformancePoints,conf.attr(dvbi.a_href).value())) 
					errs.push("invalid "+dvbi.a_href.attribute(dvbi.e_VideoConformancePoint)+" value ("+conf.attr(dvbi.a_href).value()+")", "video conf point");

			// Check @href of ContentAttributes/VideoAttributes/tva:coding
			cp=0;
			while (conf=ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_ContentAttributes)+"/"+xPath(SCHEMA_PREFIX, dvbi.e_VideoAttributes, ++cp)+"/*", SL_SCHEMA)) 
				if (conf.name()===dvbi.e_Coding && conf.attr(dvbi.a_href) && !isIn(allowedVideoSchemes,conf.attr(dvbi.a_href).value())) 
					errs.push("invalid "+dvbi.a_href.attribute(dvbi.e_VideoAttributes)+"@ ("+conf.attr(dvbi.a_href).value()+")", "video codec");

			var Availability=ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_Availability), SL_SCHEMA);
			if (Availability) {
				var Period, p=0;
				while (Period=Availability.get(xPath(SCHEMA_PREFIX, dvbi.e_Period, ++p), SL_SCHEMA)) 
					if (Period.attr(dvbi.a_validFrom) && Period.attr(dvbi.a_validTo)) {
						// validTo should be >= validFrom
						var fr=new Date(Period.attr(dvbi.a_validFrom).value()), 
							to=new Date(Period.attr(dvbi.a_validTo).value());
					
						if (to.getTime() < fr.getTime()) 
							errs.push("invalid availability period for service "+thisServiceId.quote()+". "+fr+">"+to, "period start>end");
					}
			}

			// note that the <SourceType> element becomes optional and in A177v2, but if specified then the relevant
			// delivery parameters also need to be specified
			var SourceType=ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_SourceType), SL_SCHEMA);
			if (SourceType) {
				switch (SourceType.text()) {
					case dvbi.DVBT_SOURCE_TYPE:
						if (!ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_DVBTDeliveryParameters), SL_SCHEMA) ) {
							NoDeliveryParams(errs, "DVB-T", thisServiceId);
						}
						break;
					case dvbi.DVBS_SOURCE_TYPE:
						if (!ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_DVBSDeliveryParameters), SL_SCHEMA) ) {
							NoDeliveryParams(errs, "DVB-S", thisServiceId);
						}
						break;
					case dvbi.DVBC_SOURCE_TYPE:
						if (!ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_DVBCDeliveryParameters), SL_SCHEMA) ) {
							NoDeliveryParams(errs, "DVB-C", thisServiceId);
						}
						break;
					case dvbi.DVBDASH_SOURCE_TYPE:
						if (!ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_DASHDeliveryParameters), SL_SCHEMA) ) {
							NoDeliveryParams(errs, "DVB-DASH", thisServiceId);
						}
						break;
					case dvbi.DVBIPTV_SOURCE_TYPE:
						if (!ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_MulticastTSDeliveryParameters), SL_SCHEMA) && !ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_RTSPDeliveryParameters), SL_SCHEMA) ) {
							NoDeliveryParams(errs, "Multicast or RTSP", thisServiceId);
						}
						break;
					case dvbi.DVBAPPLICATION_SOURCE_TYPE:
						// there should not be any <xxxxDeliveryParameters> elements and there should be either a Service.RelatedMaterial or Service.ServiceInstance.RelatedMaterial signalling a service related application
						if (ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_DVBTDeliveryParameters), SL_SCHEMA)
							|| ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_DVBSDeliveryParameters), SL_SCHEMA)
							|| ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_DVBCDeliveryParameters), SL_SCHEMA)
							|| ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_DASHDeliveryParameters), SL_SCHEMA)
							|| ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_MulticastTSDeliveryParameters), SL_SCHEMA)
							|| ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_RTSPDeliveryParameters), SL_SCHEMA) ) 
								errs.push("Delivery parameters are not permitted for Application service instance in Service "+thisServiceId.quote(), "invalid application");
							else {
								// no xxxxDeliveryParameters is signalled
								// check for appropriate Service.RelatedMaterial or Service.ServiceInstance.RelatedMaterial
								if (!hasSignalledApplication(service, SCHEMA_PREFIX, SL_SCHEMA) 
									&& !hasSignalledApplication(ServiceInstance, SCHEMA_PREFIX, SL_SCHEMA)) {
									errs.push("No Application is signalled for "+dvbi.e_SourceType+"="+dvbi.DVBAPPLICATION_SOURCE_TYPE.quote()+" in Service "+thisServiceId.quote(), "no application");
								}
							}
						break;
					default:
						if (SchemaVersion(SCHEMA_NAMESPACE)==SCHEMA_v1) 
							errs.push(dvbi.e_SourceType.elementize()+" "+SourceType.text().quote()+" is not valid in Service "+thisServiceId.quote(), "invalid "+dvbi.e_SourceType);
				}
			}
			else {
				// this should not happen as SourceType is a mandatory element within ServiceInstance
				if (SchemaVersion(SCHEMA_NAMESPACE)==SCHEMA_v1) 
					errs.push(dvbi.e_SourceType.elementize()+" not specified in ServiceInstance of service "+thisServiceId.quote(), "no "+dvbi.e_SourceType);
			}

			var DASHDeliveryParameters=ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_DASHDeliveryParameters), SL_SCHEMA);
			if (DASHDeliveryParameters) {
				var URILoc=DASHDeliveryParameters.get(xPath(SCHEMA_PREFIX, dvbi.e_UriBasedLocation), SL_SCHEMA);
				if (!URILoc) 
					errs.push(dvbi.e_UriBasedLocation+" not specified for "+dvbi.e_DASHDeliveryParameters+" in service "+thisServiceId.quote(), "no "+dvbi.e_UriBasedLocation);
				else {
					var uriContentType=URILoc.attr(dvbi.a_contentType);
					if (uriContentType) 
						if (!validDASHcontentType(uriContentType.value())) {
							errs.push(dvbi.a_contentType.attribute()+"="+uriContentType.value().quote()+" in service "+thisServiceId.quote()+" is not valid", "no "+dvbi.a_contentType.attribute()+" for DASH");
					}
					else 
						errs.push(dvbi.a_contentType.attribute()+" not specified for URI in service "+thisServiceId.quote(), "no "+dvbi.a_contentType.attribute());
				}
				var e=0, extension;
				while (extension=DASHDeliveryParameters.get(xPath(SCHEMA_PREFIX, dvbi.e_Extension, ++e), SL_SCHEMA)) {
					if (extension.attr(dvbi.a_extensionName)) {
						if (!validExtensionName(extension.attr(dvbi.a_extensionName).value())) 
							errs.push(dvbi.a_extensionName.attribute()+"="+extension.attr(dvbi.a_extensionName).value().quote()+" is not valid in service "+thisServiceId.quote(), "invalid "+dvbi.a_extensionName.attribute());
					}
					else 
						errs.push(dvbi.a_extensionName.attribute()+" not specified for DASH extension in "+thisServiceId.quote(), "no "+dvbi.a_extensionName.attribute());
				}
			}

			var DVBTtargetCountry=ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_DVBTDeliveryParameters)+"/"+xPath(SCHEMA_PREFIX, dvbi.e_TargetCountry), SL_SCHEMA);
			if (DVBTtargetCountry)
				if (!knownCountries.isISO3166code(DVBTtargetCountry.text())) 
					InvalidCountryCode(errs, DVBTtargetCountry.text(), "DVB-T", "service "+thisServiceId.quote());


			var DVBCtargetCountry=ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_DVBCDeliveryParameters)+"/"+xPath(SCHEMA_PREFIX, dvbi.e_TargetCountry), SL_SCHEMA, SL_SCHEMA);
			if (DVBCtargetCountry)
				if (!knownCountries.isISO3166code(DVBCtargetCountry.text()))  
					InvalidCountryCode(errs, DVBCtargetCountry.text(), "DVB-C", "service "+thisServiceId.quote());

			var OtherDeliveryParameters=ServiceInstance.get(xPath(SCHEMA_PREFIX, dvbi.e_OtherDeliveryParameters), SL_SCHEMA);
			if (OtherDeliveryParameters) {
				if (OtherDeliveryParamers.attr(dvbi.a_extensionName)) {
					if (!validExtensionName(OtherDeliveryParamers.attr(dvbi.a_extensionName).value()))
						errs.push(dvbi.a_extensionName.attribute()+"="+OtherDeliveryParameters.attr(dvbi.a_extensionName).value().quote()+" is not valid in service "+thisServiceId.quote(), "invalid "+dvbi.a_extensionName.attribute());
				}
				else errs.push(dvbi.a_extensionName.attribute()+" not specified for "+dvbi.e_OtherDeliveryParameters+" extension in "+thisServiceId.quote(), "no "+dvbi.a_extensionName.attribute());
			}
		}

		//check <Service><TargetRegion>
		var tr=0, TargetRegion;
		while (TargetRegion=service.get(xPath(SCHEMA_PREFIX, dvbi.e_TargetRegion, ++tr), SL_SCHEMA)) 
			if (!isIn(knownRegionIDs,TargetRegion.text())) 
				UnspecifiedTargetRegion(errs, TargetRegion.text(), "service "+thisServiceId.quote());

		// Check that the @xml:lang values for each <ServiceName> element are unique and only one element does not have any language specified
		checkXMLLangs(SL_SCHEMA, SCHEMA_PREFIX, dvbi.e_ServiceName, "service="+thisServiceId.quote(), service, errs);

		// Check that the @xml:lang values for each <ProviderName> element are unique and only one element does not have any language specified
		checkXMLLangs(SL_SCHEMA, SCHEMA_PREFIX, dvbi.e_ProviderName, "service="+thisServiceId.quote(), service, errs);

		//check <Service><RelatedMaterial>
		var rm=0, RelatedMaterial;
		while (RelatedMaterial=service.get(xPath(SCHEMA_PREFIX, dvbi.e_RelatedMaterial, ++rm), SL_SCHEMA)) 
			validateRelatedMaterial(RelatedMaterial, errs, "service "+thisServiceId.quote(), SERVICE_RM, SCHEMA_NAMESPACE);

		//check <Service><ServiceGenre>
		var ServiceGenre=service.get(xPath(SCHEMA_PREFIX, dvbi.e_ServiceGenre), SL_SCHEMA);
		if (ServiceGenre) {
			if (ServiceGenre.attr(dvbi.a_href)) {
				if (!isIn(allowedGenres,ServiceGenre.attr(dvbi.a_href).value())) 
					errs.push("service "+thisServiceId.quote()+" has an invalid "+dvbi.e_ServiceGenre.elementize()+" "+ServiceGenre.attr(dvbi.a_href).value().quote(), "invalid "+dvbi.e_ServiceGenre);
			}
			else NoHrefAttribute(errs, dvbi.e_ServiceGener.elementize(), "service "+thisServiceId.quote());			
		}

		//check <Service><ServiceType>                    
		var ServiceType=service.get(xPath(SCHEMA_PREFIX, dvbi.e_ServiceType), SL_SCHEMA);
		if (ServiceType) {
			if (ServiceType.attr(dvbi.a_href)) {
				if (!isIn(allowedServiceTypes,ServiceType.attr(dvbi.a_href).value())) 
					errs.push("service "+thisServiceId.quote()+" has an invalid "+dvbi.e_ServiceType.elementize()+" ("+ServiceType.attr(dvbi.a_href).value()+")", "invalid ServiceType");
			}
			else NoHrefAttribute(errs, dvbi.e_ServiceType.elementize(), "service "+thisServiceId.quote());
		}

		// check <Service><RecordingInfo>
		var RecordingInfo=service.get(xPath(SCHEMA_PREFIX, dvbi.e_RecordingInfo), SL_SCHEMA);
		if (RecordingInfo) {
			if (RecordingInfo.attr(dvbi.a_href)) {
				if (!isIn(RecordingInfoCSvalules, RecordingInfo.attr(dvbi.a_href).value())) 
					errs.push("invalid "+dvbi.e_RecordingInfo.elementize()+" value "+RecordingInfo.attr(dvbi.a_href).value().quote()+"for service "+thisServiceId, "invalid RecordingInfo");
			}
			else NoHrefAttribute(errs, dvbi.e_RecordingInfo.elementize(), "service "+thisServiceId.quote());
		}

		// check <Service><ContentGuideSource>
		var sCG=service.get(xPath(SCHEMA_PREFIX, dvbi.e_ContentGuideSource), SL_SCHEMA);
		if (sCG) {
			var rm=0, CGrm;
			while (CGrm=sCG.get(xPath(SCHEMA_PREFIX, dvbi.e_RelatedMaterial, ++rm), SL_SCHEMA)) 
				validateRelatedMaterial(CGrm, errs, dvbi.e_ContentGuideSource.elementize()+" in service "+thisServiceId, CONTENT_GUIDE_RM, SCHEMA_NAMESPACE);

		}

		//check <Service><ContentGuideSourceRef>
		var sCGref=service.get(xPath(SCHEMA_PREFIX, dvbi.e_ContentGuideSourceRef), SL_SCHEMA);
		if (sCGref) {
			if (!isIn(ContentGuideSourceIDs,sCGref.text())) 
				errs.push("content guide reference "+sCGref.text().quote()+" for service "+thisServiceId.quote()+" not specified", "unspecified content guide source");
		}

		// this should not happen if the XML document has passed schema validation
		if (sCG && sCGref)
			errs.push("only "+dvb.e_ContentGuideSource.elementize()+" or "+dvbi.e_CountentGuideSourceRef.elementize()+" to be specifed for a service "+thisServiceId.quote(), "source and ref");
		
		// <Service><ContentguideServiceRef> checked below
	}        

	// check <Service><ContentGuideServiceRef>
	// issues a warning if this is not a reference to another service or is a reference to self
	s=0;
	while (service=SL.get("//"+xPath(SCHEMA_PREFIX, dvbi.e_Service, ++s), SL_SCHEMA)) {
		var CGSR=service.get(xPath(SCHEMA_PREFIX, dvbi.e_ContentGuideServiceRef), SL_SCHEMA);
		if (CGSR) {
			var uniqueID=service.get(xPath(SCHEMA_PREFIX, dvbi.e_UniqueIdentifier), SL_SCHEMA);
			if (uniqueID && !isIn(knownServices,CGSR.text())) 
				errs.pushW(dvbi.e_ContentGuideServiceRef.elementize()+" "+CGSR.text().quote()+" in service "+uniqueID.text().quote()+" does not refer to another service", "invalid "+dvbi.e_ContentGuideServiceRef.elementize());
			if (uniqueID && (CGSR.text() == uniqueID.text()))
				errs.pushW(dvbi.e_ContentGuideServiceRef.elementize()+" is self", "self "+dvbi.e_ContentGuideServiceRef.elementize());
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
					errs.push(dvbi.e_TargetRegion.elementize()+" "+TargetRegion.text()+" in "+dvbi.e_LCNTable.elementize()+" is not defined", "undefined region");
				lastTargetRegion=TargetRegion.text();
			}
			
			var LCNNumbers=[],e=0,LCN;
			while (LCN=LCNTable.get(xPath(SCHEMA_PREFIX, dvbi.e_LCN, ++e), SL_SCHEMA)) {
				if (LCN.attr(dvbi.channelNumber)) {
					var chanNum=LCN.attr(dvbi.channelNumber).value();
					if (isIn(LCNNumbers,chanNum)) 
						errs.push("duplicated channel number "+chanNum+" for "+dvbi.e_TargetRegion.elementize()+" "+lastTargetRegion, "duplicate channel number");
					else LCNNumbers.push(chanNum);
				}

				if (LCN.attr(dvbi.a_serviceRef)) {
					var servRef=LCN.attr(dvbi.a_serviceRef).value();
					if (!isIn(knownServices,servRef)) 
						errs.push("LCN reference to unknown service "+servRef, "LCN unknown services");
				}
			}
		}
	}
}

/**
 * checks is the service list URL is provided in an argument to the query
 * 
 * @param {Object} req The request from Express
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
 * @param {Object} req The request from Express
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
 * @param {Object} req The request from Express
 * @param {Object} res The HTTP response to be sent to the client
 */ 
function processQuery(req,res) {
    if (isEmpty(req.query)) {
        drawForm(true, res);  
    } else if (!checkQuery(req)) {
        drawForm(true, res, req.query.SLurl, {error:"URL not specified"});
        res.status(400);
    }
    else {
        var errs=new ErrorList();
	
		var xhttp=new XmlHttpRequest();
		xhttp.onreadystatechange=function() {
			if (this.readyState==this.DONE && this.status==200) {
				validateServiceList(xhttp.responseText.replace(/(\r\n|\n|\r|\t)/gm,""), errs);
			}
			else             
				errs.push("retrieval of URL ("+xhttp.settings.url+") failed");
		};
		xhttp.open("GET", req.query.SLurl, false);
		xhttp.send();
		
        drawForm(true, res, req.query.SLurl, {errors:errs});
    }
    res.end()
}



/**
 * Process the service list specificed by a file name for errors and display them
 *
 * @param {Object} req The request from Express
 * @param {Object} res The HTTP response to be sent to the client
 */ 
function processFile(req,res) {
    if (isEmpty(req.query)) {
        drawForm(false, res);    
    } else if (!checkFile(req)) {
        drawForm(false, res, req.query.SLfile, {error:"File not specified"});
        res.status(400);
    }
    else {
        var SLxml=null;
        var errs=new ErrorList();
        try {
            SLxml=req.files.SLfile.data;
        }
        catch (err) {
            errs.push("retrieval of FILE ("+req.query.SLfile+") failed");
        }
		if (SLxml) {
			validateServiceList(SLxml.toString().replace(/(\r\n|\n|\r|\t)/gm,""), errs);
		}

        drawForm(false, res, req.query.SLfile, {errors:errs});
    }
    res.end();
}

/**
 * synchronously read a file if it exists
 * 
 * @param {string} filename the name of the file to read
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

app.use(express.static(__dirname));
app.set('view engine', 'ejs');
app.use(fileupload());

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
    var https_server=https.createServer(https_options, app);
    https_server.listen(options.sport, function(){
        console.log("HTTPS listening on port number", https_server.address().port);
    });
}



