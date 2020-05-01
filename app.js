// node.js - https://nodejs.org/en/
// express framework - https://expressjs.com/en/4x/api.html
const express = require("express");
var app = express();

/* TODO:

 - also look for TODO in the code itself
*/



// libxmljs - https://github.com/libxmljs/libxmljs
const libxml = require("libxmljs");

//TODO: validation against schema
//const xmllint = require("xmllint");

// morgan - https://github.com/expressjs/morgan
const morgan = require("morgan")

const fs=require("fs"), path=require("path");

//const request = require("request");

// sync-request - https://github.com/ForbesLindesay/sync-request
const syncRequest = require("sync-request");
//var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const https=require("https");
const HTTP_SERVICE_PORT = 3010;
const HTTPS_SERVICE_PORT=HTTP_SERVICE_PORT+1;
const keyFilename=path.join(".","selfsigned.key"), certFilename=path.join(".","selfsigned.crt");

const { parse } = require("querystring");

// https://github.com/alexei/sprintf.js
var sprintf = require("sprintf-js").sprintf,
    vsprintf = require("sprintf-js").vsprintf

const TVA_ContentCSFilename=path.join("cs","ContentCS.xml"),
      TVA_FormatCSFilename=path.join("cs","FormatCS.xml"),
      DVBI_ContentSubjectFilename=path.join("cs","DVBContentSubjectCS-2019.xml"),
      DVBI_ServiceTypeCSFilename=path.join("cs","DVBServiceTypeCS-2019.xml"),
      DVB_AudioCodecCSFilename=path.join("cs","AudioCodecCS.xml"),
      DVB_VideoCodecCSFilename=path.join("cs","VideoCodecCS.xml"),
      MPEG7_AudioCodingFormatCSFilename=path.join("cs","AudioCodingFormatCS.xml"),
      MPEG7_VisualCodingFormatCSFilename=path.join("cs","VisualCodingFormatCS.xml"),
      DVB_AudioConformanceCSFilename=path.join("cs","AudioConformancePointsCS.xml"),
      DVB_VideoConformanceCSFilename=path.join("cs","VideoConformancePointsCS.xml"),
      ISO3166_Filename=path.join(".","iso3166-countries.json"),
      DVBI_RecordingInfoCSFilename=path.join("cs","DVBRecordingInfoCS-2019.xml");

// curl from https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry
const IANA_Subtag_Registry_Filename=path.join(".","language-subtag-registry");
const IANA_Subtag_Registry_URL="https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry";



/*
const REPO_RAW = "https://raw.githubusercontent.com/paulhiggs/dvb-sl-check/master/",
      DVB_METADATA = "https://dvb.org/metadata/",
      TVA_ContentCSURL=REPO_RAW + "cs/" + "ContentCS.xml",
      TVA_FormatCSURL=REPO_RAW + "cs/" + "FormatCS.xml",
      DVBI_ContentSubjectURL=REPO_RAW + "cs/" + "DVBContentSubjectCS-2019.xml",
      DVBI_ServiceTypeCSURL=REPO_RAW + "cs/" + "DVBServiceTypeCS-2019.xml",
      DVB_AudioCodecCSURL=DVB_METADATA + "cs/2007/" + "AudioCodecCS.xml",
      DVB_VideoCodecCSURL=DVB_METADATA + "cs/2007/" + "VideoCodecCS.xml",
      MPEG7_AudioCodingFormatCSURL=REPO_RAW + "cs/" + "AudioCodingFormatCS.xml",
      MPEG7_VisualCodingFormatCSURL=REPO_RAW + "cs/" + "VisualCodingFormatCS.xml",
      DVB_AudioConformanceCSURL=DVB_METADATA + "cs/2017/" + "AudioConformancePointsCS.xml",
      DVB_VideoConformanceCSURL=DVB_METADATA + "cs/2017/" + "VideoConformancePointsCS.xml",
      ISO3166_URL=REPO_RAW + "iso3166-countries.json",
	  IANA_Subtag_Registry_URL="https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry",
      DVBI_RecordingInfoCSURL=REPO_RAW + "cs/" + "DVBRecordingInfoCS-2019.xml";
*/
const FILE_FORMAT_CS = "urn:mpeg:mpeg7:cs:FileFormatCS:2001",
      JPEG_IMAGE_CS_VALUE = FILE_FORMAT_CS + ":1",
      PNG_IMAGE_CS_VALUE =  FILE_FORMAT_CS + ":15";

const JPEG_MIME = "image/jpeg", 
      PNG_MIME =  "image/png",
      DVB_AIT =   "application/vnd.dvb.ait+xml";

// A177 table 15
const DVB_SOURCE_PREFIX = "urn:dvb:metadata:source",
      DVBT_SOURCE_TYPE = DVB_SOURCE_PREFIX + ":dvb-t",
      DVBS_SOURCE_TYPE = DVB_SOURCE_PREFIX + ":dvb-s",
      DVBC_SOURCE_TYPE = DVB_SOURCE_PREFIX + ":dvb-c",
      DVBIPTV_SOURCE_TYPE = DVB_SOURCE_PREFIX + ":dvb-iptv",
      DVBDASH_SOURCE_TYPE = DVB_SOURCE_PREFIX + ":dvb-dash",
      DVBAPPLICATION_SOURCE_TYPE = DVB_SOURCE_PREFIX + ":application";

// A177 7.3.2
const LINKED_APLICATION_CS = "urn:dvb:metadata:cs:LinkedApplicationCS:2019",
      APP_IN_PARALLEL = LINKED_APLICATION_CS+":1.1",
      APP_IN_CONTROL  = LINKED_APLICATION_CS+":1.2",
      APP_OUTSIDE_AVAILABILITY = LINKED_APLICATION_CS+":2";

// A177 7.3.1
const DVB_RELATED_CS_v1 = "urn:dvb:metadata:cs:HowRelatedCS:2019",
      BANNER_OUTSIDE_AVAILABILITY_v1 = DVB_RELATED_CS_v1+":1000.1",
      LOGO_SERVICE_LIST_v1 = DVB_RELATED_CS_v1+":1001.1",
      LOGO_SERVICE_v1 = DVB_RELATED_CS_v1+":1001.2",
      LOGO_CG_PROVIDER_v1 = DVB_RELATED_CS_v1+":1002.1";

// A177 7.3.1
const DVB_RELATED_CS_v2 = "urn:dvb:metadata:cs:HowRelatedCS:2020",
      BANNER_OUTSIDE_AVAILABILITY_v2 = DVB_RELATED_CS_v2+":1000.1",
	  BANNER_CONTENT_FINISHED_v2 = DVB_RELATED_CS_v2+":1000.2",	// added in A177v2
      LOGO_SERVICE_LIST_v2 = DVB_RELATED_CS_v2+":1001.1",
      LOGO_SERVICE_v2 = DVB_RELATED_CS_v2+":1001.2",
      LOGO_CG_PROVIDER_v2 = DVB_RELATED_CS_v2+":1002.1";


// A177 5.2.7.2
const CONTENT_TYPE_DASH_MPD = "application/dash+xml",    // MPD of linear service
      CONTENT_TYPE_DVB_PLAYLIST = "application/xml";    // XML Playlist
      
const SERVICE_LIST_RM = "service list",
      SERVICE_RM = "service",
      CONTENT_GUIDE_RM = "content guide";

var allowedGenres=[], allowedServiceTypes=[], allowedAudioSchemes=[], allowedVideoSchemes=[], 
    allowedCountries=[], knownLanguages=[],
	allowedAudioConformancePoints=[], allowedVideoConformancePoints=[], RecordingInfoCSvalules=[];

//TODO: validation against schema
//const DVBI_ServiceListSchemaFilename=path.join("schema","dvbi_v1.0.xsd");
//const TVA_SchemaFilename=path.join("schema","tva_metadata_3-1.xsd");
//const MPEG7_SchemaFilename=path.join("schema","tva_mpeg7.xsd");
//const XML_SchemaFilename=path.join("schema","xml.xsd");
//var SLschema, TVAschema, MPEG7schema, XMLschema;

//const allowed_arguments = ["serviceList", ];

const MAX_SUBREGION_LEVELS=3; // definied for <RegionElement> in Table 33 of A177

const SCHEMA_v1 = 1,
      SCHEMA_v2 = 2,
	  SCHEMA_unknown = -1;
	  
/**
 * determine the schema version (and hence the specificaion version) in use 
 *
 * @param {String] namespace the namespace used in defining the schema
 * @return {Integer} representation of the schema version or error code if unknown 
 */
function SchemaVersion(namespace) {
	if (namespace == 'urn:dvb:metadata:servicediscovery:2019')
		return SCHEMA_v1;
	else if (namespace == 'urn:dvb:metadata:servicediscovery:2020')
		return SCHEMA_v2;

	return SCHEMA_unknown;
}

class ErrorList {
/**
 * Manages errors and warnings for the application
 * 
 */
    counts=[]; messages=[]; countsWarn=[]; messagesWarn=[];
    
    increment(key) {
        if (this.counts[key]===undefined)
            this.set(key,1);
        else this.counts[key]++;
    }
    set(key,value) {
        this.counts[key]=value;
    }
    incrementW(key) {
        if (this.countsWarn[key]===undefined)
            this.setW(key,1);
        else this.countsWarn[key]++;
    }
    setW(key,value) {
        this.countsWarn[key]=value;
    }
    push(message) {
        this.messages.push(message);
    }
    pushW(message) {
        this.messagesWarn.push(message);
    }
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

/**
 * Constructs a linear list of terms from a heirarical clssification schemes which are read from an XML document and parsed by libxmljs
 *
 * @param {Array} values The array to push classification scheme values into
 * @param {String} CSuri The classification scheme domian
 * @param {Object} term The classification scheme term that may include nested subterms
 */
function addCSTerm(values,CSuri,term){
    if (term.name()==="Term") {
        values.push(CSuri+":"+term.attr("termID").value())
        var st=0, subTerm;
        while (subTerm=term.child(st)) {
            addCSTerm(values,CSuri,subTerm);
            st++;
        }
    }
}

/**
 * read a classification scheme and load its hierarical values into a linear list 
 *
 * @param {Array} values The linear list of values within the classification scheme
 * @param {String] classificationScheme the filename of the classification scheme
 */
function loadCS(values, classificationScheme) {
    fs.readFile(classificationScheme, {encoding: "utf-8"}, function(err,data){
        if (!err) {
            var xmlCS = libxml.parseXmlString(data.replace(/(\r\n|\n|\r|\t)/gm,""));
            if (!xmlCS) return;
            var CSnamespace = xmlCS.root().attr("uri");
            if (!CSnamespace) return;
            var t=0, term;
            while (term=xmlCS.root().child(t)) {
                addCSTerm(values,CSnamespace.value(),term);
                t++;
            }
        } else {
            console.log(err);
        }
    });
}

/**
 * determine if the argument contains a valid ISO 3166 country code
 *
 * @param {String} countryCode the country code to be checked for validity
 * @return {boolean} true if countryCode is known else false
 */
function isISO3166code(countryCode) {
    if (countryCode.length!=3) {
        return false;
    }
    var found=false;
    allowedCountries.forEach(country => {
        if (countryCode==country.alpha3) found=true;
    });
    return found;
}

/**
 * load the countries list into the allowedCountries global array from the specified JSON file
 *
 * @param {String} countriesFile the file name to load
 */
function loadCountries(countriesFile) {
    fs.readFile(countriesFile, {encoding: "utf-8"}, function(err,data){
        if (!err) {
            allowedCountries = JSON.parse(data, function (key, value) {
                if (key == "numeric") {
                    return new Number(value);
                } else if (key == "alpha2") {
                    if (value.length!=2) return "**"; else return value;
                } else if (key == "alpha3") {
                    if (value.length!=3) return "***"; else return value;
                }
                else {
                    return value;
                }
            });
        } else {
            console.log(err);
        }
    });
}

/**
 * load the languages list into the knownLanguages global array from the specified file
 * file is formatted according to www.iana.org/assignments/language-subtag-registry/language-subtag-registry
 *
 * @param {String} languagesFile the file name to load
 */
function loadLanguages(languagesFile) {
    fs.readFile(languagesFile, {encoding: "utf-8"}, function(err,data){
        if (!err) {
			var entries = data.split("%%");
			entries.forEach(entry => {
				var i=0, items=entry.split("\n");
				if (isIn(items,"Type: language") || isIn(items,"Type: extlang")) {
					//found one
					for (i=0; i<items.length; i++) {
						if (items[i].startsWith("Subtag:")) {
							knownLanguages.push(items[i].split(":")[1].trim());
						}
					}
				}
			});
		}
	});
}

function loadDataFiles() {
	console.log("loading classification schemes...");
    allowedGenres=[];
    loadCS(allowedGenres,TVA_ContentCSFilename);
    loadCS(allowedGenres,TVA_FormatCSFilename);
    loadCS(allowedGenres,DVBI_ContentSubjectFilename);

    allowedServiceTypes=[];
    loadCS(allowedServiceTypes,DVBI_ServiceTypeCSFilename);

    allowedAudioSchemes=[]; allowedAudioConformancePoints=[];
    loadCS(allowedAudioSchemes,DVB_AudioCodecCSFilename);
    loadCS(allowedAudioSchemes,MPEG7_AudioCodingFormatCSFilename);
    loadCS(allowedAudioConformancePoints,DVB_AudioConformanceCSFilename);

    allowedVideoSchemes=[]; allowedVideoConformancePoints=[];
    loadCS(allowedVideoSchemes, DVB_VideoCodecCSFilename);
    loadCS(allowedVideoSchemes, MPEG7_VisualCodingFormatCSFilename);
    loadCS(allowedVideoConformancePoints, DVB_VideoConformanceCSFilename);

	RecordingInfoCSvalules=[];
    loadCS(RecordingInfoCSvalules, DVBI_RecordingInfoCSFilename);

	console.log("loading countries...");
	allowedCountries=[];
    loadCountries(ISO3166_Filename);
	
	console.log("loading languages...");
	knownLanguages=[];
	loadLanguages(IANA_Subtag_Registry_Filename);

//TODO: validation against schema
//    SLschema=fs.readFileSync(DVBI_ServiceListSchemaFilename);
//    TVAschema=fs.readFileSync(TVA_SchemaFilename);
//    MPEG7schema=fs.readFileSync(MPEG7_SchemaFilename);
//    XMLschema=fs.readFileSync(XML_SchemaFilename);
}

/*
function loadDataFilesWeb() {
    allowedGenres=[];
    loadCS(allowedGenres,TVA_ContentCSURL);
    loadCS(allowedGenres,TVA_FormatCSURL);
    loadCS(allowedGenres,DVBI_ContentSubjectURL);
    
    allowedServiceTypes=[];
    loadCS(allowedServiceTypes,DVBI_ServiceTypeCSURL);

    allowedAudioSchemes=[]; allowedAudioConformancePoints=[];
    loadCS(allowedAudioSchemes,DVB_AudioCodecCSURL);
    loadCS(allowedAudioSchemes,MPEG7_AudioCodingFormatCSURL);
    loadCS(allowedAudioConformancePoints,DVB_AudioConformanceCSURL);
    
    allowedVideoSchemes=[]; allowedVideoConformancePoints=[];
    loadCS(allowedVideoSchemes, DVB_VideoCodecCSURL);
    loadCS(allowedVideoSchemes, MPEG7_VisualCodingFormatCSURL);
    loadCS(allowedVideoConformancePoints, DVB_VideoConformanceCSURL);

	RecordingInfoCSvalules=[];
	loadCS(RecordingInfoCSvalules, DVBI_RecordingInfoCSURL);

	allowedCountries=[];
    loadCountries(ISO3166_URL);
    
	knownLanguages=[];
	loadLanguages(IANA_Subtag_Registry_URL);
    

//TODO: validation against schema
//    SLschema=fs.readFileSync(DVBI_ServiceListSchemaFilename);
//    TVAschema=fs.readFileSync(TVA_SchemaFilename);
//    MPEG7schema=fs.readFileSync(MPEG7_SchemaFilename);
//    XMLschema=fs.readFileSync(XML_SchemaFilename);
}
*/


/**
 * determines if the value is a valid JPEG MIME type
 *
 * @param {String} val the MIME type
 * @return {boolean} true is the MIME type represents a JPEG image, otherwise false
 */
function isJPEGmime(val) {
	return val==JPEG_MIME
}
/**
 * determines if the value is a valid PNG MIME type
 *
 * @param {String} val the MIME type
 * @return {boolean} true is the MIME type represents a PNG image, otherwise false
 */
function isPNGmime(val) {
	return val==PNG_MIME 
}

/**
 * determine if the passed value conforms to am IETF RFC4151 TAG URI
 *
 * @param {string} identifier The service identifier to be checked
 * @return {boolean} true of the service identifier is in RFC4151 TAG URI format
 */
function isTAGURI(identifier){
    // RFC 4151 compliant - https://tools.ietf.org/html/rfc4151
    // tagURI = "tag:" taggingEntity ":" specific [ "#" fragment ]

    var TAGregex=/tag:(([\dA-Za-z\-\._]+@)?[\dA-Za-z][\dA-Za-z\-]*[\dA-Za-z]*(\.[\dA-Za-z][\dA-Za-z\-]*[\dA-Za-z]*)*),\d{4}(\-\d{2}(\-\d{2})?)?:(['A-Za-z\d\-\._~!$&\(\)\*\+,;=:@\?/]|%[0-9A-Fa-f]{2})*(#(['A-Za-z0-9\-\._~!$&\(\)\*\+,;=:@\?/]|%[0-9A-Fa-f]{2})*)?/g;
    var s=identifier.match(TAGregex);
    return s?s[0] === identifier:false;
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
    var regionID=Region.attr("regionID").value();
    var countryCodeSpecified=Region.attr("countryCodes");
    if (isIn(knownRegionIDs, regionID)) {
        errs.push("Duplicate RegionID \""+regionID+"\"");
        errs.increment("duplicate regionID");
    }
    else knownRegionIDs.push(regionID);

    if ((depth != 0) && countryCodeSpecified) {
        errs.push("@countryCodes not permitted for sub-region \""+regionID+"\"");
        errs.increment("ccode in subRegion");
    }

    if (countryCodeSpecified) {
        var countries=countryCodeSpecified.value().split(",");
        if (countries) countries.forEach(country => {
            if (!isISO3166code(country)) {
                errs.push("invalid country code ("+country+") for region \""+regionID+"\"");
                errs.increment("invalid country code");
            }
        });
    }

    if (depth > MAX_SUBREGION_LEVELS) {
        errs.push("<Region> depth exceeded (>"+MAX_SUBREGION_LEVELS+") for sub-region \""+regionID+"\"");
        errs.increment("region depth exceeded");
    }

    var i=0, RegionChild;
    while ((RegionChild=Region.child(i)) != null) {
        if (RegionChild.type()==="element" && RegionChild.name()=="Region") {
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
    var val= HowRelated.attr("href") ? HowRelated.attr("href").value() : null;
    return val==APP_IN_PARALLEL
        || val==APP_IN_CONTROL
        || val==APP_OUTSIDE_AVAILABILITY;
}

function validDASHcontentType(contentType) {
    // per A177 clause 5.2.7.2
    return contentType==CONTENT_TYPE_DASH_MPD   
        || contentType==CONTENT_TYPE_DVB_PLAYLIST;
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
    var val= HowRelated.attr("href") ? HowRelated.attr("href").value() : null;
    return (SchemaVersion(namespace)==SCHEMA_v1 && val==BANNER_OUTSIDE_AVAILABILITY_v1)
		|| (SchemaVersion(namespace)==SCHEMA_v2 && val==BANNER_OUTSIDE_AVAILABILITY_v2);
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
    var val= HowRelated.attr("href") ? HowRelated.attr("href").value() : null;
    return (SchemaVersion(namespace)==SCHEMA_v2 && val==BANNER_CONTENT_FINISHED_v2);
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
    var val= HowRelated.attr("href") ? HowRelated.attr("href").value() : null;
	return (SchemaVersion(namespace)==SCHEMA_v1 && val==LOGO_SERVICE_LIST_v1)
		|| (SchemaVersion(namespace)==SCHEMA_v2 && val==LOGO_SERVICE_LIST_v2);
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
	var val= HowRelated.attr("href") ? HowRelated.attr("href").value() : null;
    return (SchemaVersion(namespace)==SCHEMA_v1 && val==LOGO_SERVICE_v1)
		|| (SchemaVersion(namespace)==SCHEMA_v2 && val==LOGO_SERVICE_v2);
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
    var val= HowRelated.attr("href") ? HowRelated.attr("href").value() : null;
    return (SchemaVersion(namespace)==SCHEMA_v1 && val==LOGO_CG_PROVIDER_v1)
		|| (SchemaVersion(namespace)==SCHEMA_v2 && val==LOGO_CG_PROVIDER_v2);
}


/**
 * verifies if the specified logo is valid according to specification
 *
 * @param {Object} HowRelated the <HowRelated> subelement (a libxmls ojbect tree) of the <RelatedMaterial> element
 * @param {Object} Format the <Format> subelement (a libxmls ojbect tree) of the <RelatedMaterial> element
 * @param {Object} MediaLocator the <MediaLocator> subelement (a libxmls ojbect tree) of the <RelatedMaterial> element
 * @param {Object} errs The class where errors and warnings relating to the serivce list processing are strored 
 * @param {string} Location The printable name used to indicate the location of the <RelatedMaterial> element being checked. used for error reporting
 * @param {string} LocationType The type of element containing the <RelatedMaterial> element. Different vallidation rules apply to different location types
 * @param {string} SCHEMA_PREFIX Used when constructing Xpath queries -- not used in this function
 * @param {string} SL_SCHEMA Used when constructing Xpath queries -- not used in this function
 */
function checkValidLogo(HowRelated,Format,MediaLocator,errs,Location,LocationType,SCHEMA_PREFIX,SL_SCHEMA) {
    // irrespective of the HowRelated@href, all logos have specific requirements
    var isJPEG=false, isPNG=false;

    if (!HowRelated)
        return;
    
    // if <Format> is specified, then it must be per A177 5.2.6.1, 5.2.6.2 or 5.2.6.3 -- which are all the same
    if (Format) {
        var subElems=Format.childNodes(), hasStillPictureFormat=false;
        if (subElems) subElems.forEach(child => {
            if (child.name() == "StillPictureFormat") {
                hasStillPictureFormat=true;
                if (!child.attr("horizontalSize")) {
                    errs.push("@horizontalSize not specified for <RelatedMaterial><Format><StillPictureFormat> in "+Location );
                    errs.increment("no @horizontalSize");
                }
                if (!child.attr("verticalSize")) {
                    errs.push("@verticalSize not specified for <RelatedMaterial><Format><StillPictureFormat> in "+Location );
                    errs.increment("no @verticalSize");
                }
                if (child.attr("href")) {
                    var href=child.attr("href").value();
                    if (href != JPEG_IMAGE_CS_VALUE && href != PNG_IMAGE_CS_VALUE) {
                        errs.push("invalid @href=\""+href+"\" specified for <RelatedMaterial><Format><StillPictureFormat> in "+Location);
                        errs.increment("invalid href");
                    }
                    if (href == JPEG_IMAGE_CS_VALUE) isJPEG=true;
                    if (href == PNG_IMAGE_CS_VALUE) isPNG=true;
                }
                else {
					NoHrefAttribute(errs, "<RelatedMaterial><Format>", Location);
                }
            }
        });
        if (!hasStillPictureFormat) {
            errs.push("<StillPictureFormat> not specified for <Format> in "+Location);
            errs.increment("no StillPictureFormat");
        }
    }

    if (MediaLocator) {
        var subElems=MediaLocator.childNodes(), hasMediaURI=false;
        if (subElems) subElems.forEach(child => {
            if (child.name()=="MediaUri") {
                hasMediaURI=true;
                if (!child.attr("contentType")) {
                    errs.push("@contentType not specified for logo <MediaUri> in "+Location);
                    errs.increment("unspecified MediaUri@contentType");
                }
                else {
                    var contentType=child.attr("contentType").value();
                    if (!isJPEGmime(contentType) && !isPNGmime(contentType)) {
                        errs.push("invalid @contentType \""+contentType+"\" specified for <RelatedMaterial><MediaLocator> in "+Location);
                        errs.increment("invalid MediaUri@contentType");
                    }
                    if (Format && ((isJPEGmime(contentType) && !isJPEG) || (isPNGmime(contentType) && !isPNG))) {
                        errs.push("conflicting media types in <Format> and <MediaUri> for "+Location);
                        errs.increment("conflicting mime types");
                    }
                }
            }
        });
        if (!hasMediaURI) {
            errs.push("<MediaUri> not specified for logo <MediaLocator> in "+Location);
            errs.increment("no MediaUri");
        }
    }
    else {
        errs.push("MediaLocator not specified for <RelatedMaterial> in "+Location);
        errs.increment("no MediaLocator");
    }
}

/**
 * verifies if the specified application is valid according to specification
 *
 * @param {Object} HowRelated the <HowRelated> subelement (a libxmls ojbect tree) of the <RelatedMaterial> element
 * @param {Object} Format the <Format> subelement (a libxmls ojbect tree) of the <RelatedMaterial> element
 * @param {Object} MediaLocator the <MediaLocator> subelement (a libxmls ojbect tree) of the <RelatedMaterial> element
 * @param {Object} errs The class where errors and warnings relating to the serivce list processing are strored 
 * @param {string} Location The printable name used to indicate the location of the <RelatedMaterial> element being checked. used for error reporting
 * @param {string} LocationType The type of element containing the <RelatedMaterial> element. Different vallidation rules apply to different location types
 * @param {string} SCHEMA_PREFIX Used when constructing Xpath queries -- not used in this function
 * @param {string} SL_SCHEMA Used when constructing Xpath queries -- not used in this function
 */
function checkSignalledApplication(HowRelated,Format,MediaLocator,errs,Location,LocationType,SCHEMA_PREFIX,SL_SCHEMA) {
    if (!MediaLocator) {
        errs.push("application <MediaLocator><MediaUri> not defined for application in "+Location);
        errs.increment("no MediaUri");
    }
    else {
        var subElems=MediaLocator.childNodes(), hasMediaURI=false;
        if (subElems) subElems.forEach(child => {
            if (child.name()=="MediaUri") {
                hasMediaURI=true;
                if (!child.attr("contentType")) {
                    errs.push("@contentType not specified for <MediaUri> in "+Location);
                    errs.increment("unspecified MediaUri@contentType");
                }
                else {
                    if (child.attr("contentType").value()!=DVB_AIT) {
                        errs.pushW("@contentType \""+child.attr("contentType").value()+"\" is not DVB AIT for <RelatedMaterial><MediaLocator> in "+Location);
                        errs.incrementW("invalid MediaUri@contentType");
                    }
                }
            }
        });
        if (!hasMediaURI) {
            errs.push("<MediaUri> not specified for application <MediaLocator> in "+Location);
            errs.increment("no MediaUri");
        }
    }
}

/**
 * verifies if the specified RelatedMaterial element is valid according to specification (contents and location)
 *
 * @param {Object} RelatedMaterial the <RelatedMaterial> element (a libxmls ojbect tree) to be checked
 * @param {Object} errs The class where errors and warnings relating to the serivce list processing are strored 
 * @param {string} Location The printable name used to indicate the location of the <RelatedMaterial> element being checked. used for error reporting
 * @param {string} LocationType The type of element containing the <RelatedMaterial> element. Different vallidation rules apply to different location types
 * @param {string} SCHEMA_PREFIX Used when constructing Xpath queries -- not used in this function
 * @param {string} SCHEMA_NAMESPACE The namespace of XML document
 * @param {string} SL_SCHEMA Used when constructing Xpath queries -- not used in this function
 */
function validateRelatedMaterial(RelatedMaterial,errs,Location,LocationType,SCHEMA_PREFIX,SCHEMA_NAMESPACE,SL_SCHEMA) {
    var HowRelated=null, Format=null, MediaLocator=[];
    var elem=RelatedMaterial.child(0);
    while (elem) {
        if (elem.name()==="HowRelated")
            HowRelated=elem;
        else if (elem.name()==="Format")
            Format=elem;
        else if (elem.name()==="MediaLocator")
            MediaLocator.push(elem);

        elem = elem.nextElement();
    }

    if (!HowRelated) {
        errs.push("<HowRelated> not specified for <RelatedMaterial> in "+Location);
        errs.increment("no HowRelated");
    }
    else {
        var HRhref=HowRelated.attr("href");
        if (HRhref) {
            if (LocationType==SERVICE_LIST_RM) {
                if (!validServiceListLogo(HowRelated,SCHEMA_NAMESPACE)) {
                    errs.push("invalid @href=\""+HRhref.value()+"\" for <RelatedMaterial> in "+Location);
                    errs.increment("invalid href");
                }
                else {
                    MediaLocator.forEach(locator => 
                        checkValidLogo(HowRelated,Format,locator,errs,Location,LocationType,SCHEMA_PREFIX,SL_SCHEMA));
                }
            }
            if (LocationType==SERVICE_RM) {
				if (validContentFinishedBanner(HowRelated, SCHEMA_NAMESPACE) && (SchemaVersion(SCHEMA_NAMESPACE) == SCHEMA_v1)) {
                    errs.push("\""+BANNER_CONTENT_FINISHED_v2 +"\" not permitted for \""+SCHEMA_NAMESPACE+"\" in "+Location);
                    errs.increment("invalid CS value");					
				}
				
                if (!(validOutScheduleHours(HowRelated, SCHEMA_NAMESPACE) || validContentFinishedBanner(HowRelated, SCHEMA_NAMESPACE) ||validServiceApplication(HowRelated) || validServiceLogo(HowRelated,SCHEMA_NAMESPACE))) {
                    errs.push("invalid @href=\""+HRhref.value()+"\" for <RelatedMaterial> in "+Location);
                    errs.increment("invalid href");
                }
                else {
                    if (validServiceLogo(HowRelated, SCHEMA_NAMESPACE)||validOutScheduleHours(HowRelated, SCHEMA_NAMESPACE))
                        MediaLocator.forEach(locator =>
                            checkValidLogo(HowRelated,Format,locator,errs,Location,LocationType,SCHEMA_PREFIX,SL_SCHEMA));
                    if (validServiceApplication(HowRelated))
                        MediaLocator.forEach(locator =>
                            checkSignalledApplication(HowRelated,Format,locator,errs,Location,LocationType,SCHEMA_PREFIX,SL_SCHEMA));
                }
            }
            if (LocationType==CONTENT_GUIDE_RM) {
                if (!validContentGuideSourceLogo(HowRelated, SCHEMA_NAMESPACE)) {
                    errs.push("invalid @href=\""+HRhref.value()+"\" for <RelatedMaterial> in "+Location);
                    errs.increment("invalid href");
                }
                else {
                    MediaLocator.forEach(locator =>
                        checkValidLogo(HowRelated,Format,locator,errs,Location,LocationType,SCHEMA_PREFIX,SL_SCHEMA));
                }
            }
        }
        else {
			NoHrefAttribute(errs, "<RelatedMaterial><HowRelated>", Location);
        }
    }
}

const LANG_OK=0,
      LANG_UNDEFINED=1,
	  LANG_USE_2DIGIT=2;

function checkBCP47lang(lang) {
	//check the lang against BCP47 (https://tools.ietf.org/html/bcp47)
	if (!isIn(knownLanguages, lang))
		return LANG_UNDEFINED;
	
	return LANG_OK;
}

function checkXMLLangs(schema, prefix, elementName, elementLocation, node, errs) {
    var languages=[], i=1;
    while (elem=node.get(prefix+":"+elementName+"["+i+"]", schema)) {
        var lang, langAttr=elem.attr("lang");
        if (!langAttr)
            lang="missing"
        else lang=langAttr.value();
        if (isIn(languages,lang)) {
            errs.push("xml:lang="+lang+" already specifed for <"+elementName+"> for "+elementLocation);
            errs.increment("duplicate @xml:lang");
        }
        else languages.push(lang);

        //if lang is specified, validate the format and value of the attribute against BCP47 (RFC 5646)
		if (lang != "missing") {
			switch(checkBCP47lang(lang)) {
				case LANG_UNDEFINED:
				    errs.push("xml:lang value \""+lang+"\" is invalid");
                    errs.increment("invalid @xml:lang");
					break;
				case LANG_USE_2DIGIT:
				    errs.push("use 2DIGIT value for xml:lang instead of \""+lang+"\"");
                    errs.increment("invalid @xml:lang");
					break;
			}
		}
		
        i++;
    }
}


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
const SUMMARY_FORM_HEADER = "<table><tr><th>item</th><th>count</th></tr>";
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
                    var t=i.replace(/</g,"&lt;").replace(/>/g,"&gt;");
                    res.write("<tr><td>"+t+"</td><td>"+o.errors.counts[i]+"</td></tr>");
                    resultsShown=true;
                }
            }
            for (var i in o.errors.countsWarn) {
                if (o.errors.countsWarn[i] != 0) {
                    if (!tableHeader) {
                        res.write(SUMMARY_FORM_HEADER);
                        tableHeader=true;
                    }
                    var t=i.replace(/</g,"&lt;").replace(/>/g,"&gt;");
                    res.write("<tr><td><i>"+t+"</i></td><td>"+o.errors.countsWarn[i]+"</td></tr>");
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
                var t=value.replace(/</g,"&lt").replace(/>/g,"&gt");
                res.write("<tr><td>"+t+"</td></tr>");
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
                var t=value.replace(/</g,"&lt;").replace(/>/g,"&gt;");
                res.write("<tr><td>"+t+"</td></tr>");
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
    errs.push(source+" delivery parameters not specified for service instance in service \""+serviceId+"\"");
    errs.increment("no delivery params");
}

/**
 * Add an error message when the @href is not specified for an element
 *
 * @param {Object} errs Errors buffer
 * @param {String} src The element missing the @href
 * @param {String} loc The location of the element
 */
function NoHrefAttribute(errs, src, loc) {
	errs.push("no @href specified for "+src+" in "+loc);
	errs.increment("no href");
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
	var i=1, elem;
    while (elem=node.get(SCHEMA_PREFIX+":RelatedMaterial["+i+"]", SL_SCHEMA)) {
        var hr=elem.get(SCHEMA_PREFIX+":HowRelated", SL_SCHEMA);
		if (hr && validServiceApplication(hr)) 
			return true;			
        i++;
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
		SL = libxml.parseXmlString(SLtext);
	} catch (err) {
		errs.push("XML parsing failed: "+err.message);
		errs.increment("malformed XML");
	}
	if (!SL) return;
	
	// check the retrieved service list against the schema
	// https://syssgx.github.io/xml.js/

//TODO: look into why both of these validation approaches are failing
/*
	console.log(xmllint.validateXML({
		xml: SL.toString(),
		schema: [SLschema.toString(), 
				 TVAschema.toString(), 
				 MPEG7schema.toString(),
				 XMLschema.toString()]
	}));
*/
/*
	if (!SL.validate(SLschema)){
		SL.validationErrors.forEach(err => console.log("validation error:", err));
	};
*/
	if (SL.root().name() !== "ServiceList") {
		errs.push("Root element is not <ServiceList>.");
	}
	else {
		var SL_SCHEMA = {}, 
			SCHEMA_PREFIX=SL.root().namespace().prefix(), 
			SCHEMA_NAMESPACE=SL.root().namespace().href();
		SL_SCHEMA[SCHEMA_PREFIX]=SCHEMA_NAMESPACE;

		// Check that the @xml:lang values for each <Name> element are unique and only one element does not have any language specified
		checkXMLLangs(SL_SCHEMA, SCHEMA_PREFIX, "Name", "ServiceList", SL, errs);

		// Check that the @xml:lang values for each <ProviderName> element are unique and only one elementdoes not have any language specified
		checkXMLLangs(SL_SCHEMA, SCHEMA_PREFIX, "ProviderName", "ServiceList", SL, errs);

		//check <ServiceList><RelatedMaterial>
		var rm=1, RelatedMaterial;
		while (RelatedMaterial=SL.get(SCHEMA_PREFIX+":RelatedMaterial["+rm+"]", SL_SCHEMA)) {
			validateRelatedMaterial(RelatedMaterial,errs,"service list", SERVICE_LIST_RM, SCHEMA_PREFIX, SCHEMA_NAMESPACE, SL_SCHEMA);
			rm++;
		}

		// check <ServiceList><RegionList> and remember regionID values
		var knownRegionIDs=[], RegionList=SL.get(SCHEMA_PREFIX+":RegionList", SL_SCHEMA);
		if (RegionList) {
			// recurse the regionlist - Regions can be nested in Regions
			var r=1, Region;
			while (Region=SL.get("//"+SCHEMA_PREFIX+":RegionList/"+SCHEMA_PREFIX+":Region["+r+"]", SL_SCHEMA)) {
				addRegion(Region, 0, knownRegionIDs, errs);
				r++;
			}
		}

		//check <ServiceList><TargetRegion>
		var tr=1, TargetRegion;
		while (TargetRegion=SL.get(SCHEMA_PREFIX+":TargetRegion["+tr+"]", SL_SCHEMA)) {
			if (!isIn(knownRegionIDs,TargetRegion.text())) {
				errs.push("service list has an unspecified <TargetRegion>"+TargetRegion.text());
				errs.increment("target region");
			}
			tr++;
		}

		// <ServiceList><LCNTableList> is checked below, after the services are enumerated

		// check mpeg7:TextualType elements in <ServiceList><ContentGuideSourceList>
		var cgs=1, CGsource;
		while (CGsource=SL.get(SCHEMA_PREFIX+":ContentGuideSourceList/"+SCHEMA_PREFIX+":ContentGuideSource["+cgs+"]", SL_SCHEMA)) {
			// Check that the @xml:lang values for each <ContentGuideSourceList><ContentGuideSource>[cgs]<Name> element are unique and only one element 
			// does not have any language specified
			checkXMLLangs(SL_SCHEMA, SCHEMA_PREFIX, "Name", "ServiceList.ContentGuideSourceList.ContentGuideSource["+cgs+"]", CGsource, errs);

			// Check that the @xml:lang values for each <ContentGuideSourceList><ContentGuideSource>[cgs] element are unique and only one element 
			// does not have any language specified
			checkXMLLangs(SL_SCHEMA, SCHEMA_PREFIX, "ProviderName", "ServiceList.ContentGuideSourceList.ContentGuideSource["+cgs+"]", CGsource, errs);

			cgs++;
		}

		//check service list <ContentGuideSourceList>
		var ContentGuideSourceIDs=[], CGSourceList=SL.get("//"+SCHEMA_PREFIX+":ContentGuideSourceList", SL_SCHEMA);
		if (CGSourceList) {
			var i=1, CGSource;
			while (CGSource=SL.get("//"+SCHEMA_PREFIX+":ContentGuideSourceList/"+SCHEMA_PREFIX+":ContentGuideSource["+i+"]", SL_SCHEMA)) {

				if (isIn(ContentGuideSourceIDs,CGSource.attr("CGSID").value())) {
					errs.push("duplicate @CGSID in service list");
					errs.increment("duplicate CGSID");
				}
				else ContentGuideSourceIDs.push(CGSource.attr("CGSID").value());

				var rm=1, CGrm;
				while (CGrm=SL.get("//"+SCHEMA_PREFIX+":ContentGuideSourceList/"+SCHEMA_PREFIX+":ContentGuideSource["+i+"]/"+SCHEMA_PREFIX+":RelatedMaterial["+rm+"]", SL_SCHEMA)) {
					validateRelatedMaterial(CGrm,errs,"<ServiceList><ContentGuideSourceList>", CONTENT_GUIDE_RM, SCHEMA_PREFIX, SCHEMA_NAMESPACE, SL_SCHEMA);
					rm++;
				}
				i++;
			}
		}

		// check mpeg7:TextualType elements in <ServiceList><ContentGuideSource>
		var slGCS=SL.get(SCHEMA_PREFIX+":ContentGuideSource", SL_SCHEMA);
		if (slGCS) {
			// Check that the @xml:lang values for each <ContentGuideSource><Name> element are unique and only one element does not have any language specified
			checkXMLLangs(SL_SCHEMA, SCHEMA_PREFIX, "Name", "ServiceList.ContentGuideSource", slGCS, errs);

			// Check that the @xml:lang values for each <ContentGuideSource><ProviderName> element are unique and only one element does not have any language specified
			checkXMLLangs(SL_SCHEMA, SCHEMA_PREFIX, "ProviderName", "ServiceList.ContentGuideSource", slGCS, errs);
		}

		// check <ServiceList><ContentGuideSource>
		var CGSource=SL.get("//"+SCHEMA_PREFIX+":ContentGuideSource", SL_SCHEMA);
		if (CGSource) {
			var rm=1, CGrm;
			while (CGrm=SL.get("//"+SCHEMA_PREFIX+":ContentGuideSource/"+SCHEMA_PREFIX+":RelatedMaterial["+rm+"]", SL_SCHEMA)) {
				validateRelatedMaterial(CGrm,errs,"<ServiceList><ContentGuideSource>", CONTENT_GUIDE_RM, SCHEMA_PREFIX, SCHEMA_NAMESPACE, SL_SCHEMA);
				rm++;
			}
		}

		errs.set("num services",0);

		// check <Service>
		var s=1, service, knownServices=[], thisServiceId;
		while (service=SL.get("//"+SCHEMA_PREFIX+":Service["+s+"]", SL_SCHEMA)) {
			// for each service
			errs.set("num services",s);
			thisServiceId="service-"+s;  // use a default value in case <UniqueIdentifier> is not specified

			// check <Service><UniqueIdentifier>
			var uID=service.get(SCHEMA_PREFIX+":UniqueIdentifier", SL_SCHEMA);
			if (!uID) {
				// this should not happen as UniqueIdentifier is a mandatory element within Service
				errs.push("<UniqueIdentifier> not present for service "+s);
				errs.increment("no <UniqueIdentifier>");
			} else {
				thisServiceId=uID.text();
				if (!validServiceIdentifier(thisServiceId)) {
					errs.push("\""+thisServiceId+"\" is not a valid identifier");
					errs.increment("invalid tag");
				}
				if (!uniqueServiceIdentifier(thisServiceId,knownServices)) {
					errs.push("\""+thisServiceId+"\" is not unique");
					errs.increment("non unique id");
				}
				knownServices.push(thisServiceId);
			}

			//check <Service><ServiceInstance>
			var si=1, ServiceInstance;
			while (ServiceInstance=service.get(SCHEMA_PREFIX+":ServiceInstance["+si+"]", SL_SCHEMA)) {
				//for each service instance

				// Check that the @xml:lang values for each <DisplayName> element are unique and only one element does not have any language specified
				checkXMLLangs(SL_SCHEMA, SCHEMA_PREFIX, "DisplayName", "service instance in service=\""+thisServiceId+"\"", ServiceInstance, errs);

				// check @href of <ServiceInstance><RelatedMaterial>
				var rm=1, RelatedMaterial;
				while (RelatedMaterial=ServiceInstance.get(SCHEMA_PREFIX+":RelatedMaterial["+rm+"]", SL_SCHEMA)) {
					validateRelatedMaterial(RelatedMaterial,errs,"service instance of \""+thisServiceId+"\"", SERVICE_RM, SCHEMA_PREFIX, SCHEMA_NAMESPACE, SL_SCHEMA);
					rm++;
				}

				// Check @href of ContentAttributes/AudioConformancePoints
				var cp=1, conf;
				while (conf=ServiceInstance.get(SCHEMA_PREFIX+":ContentAttributes/"+SCHEMA_PREFIX+":AudioConformancePoint["+cp+"]", SL_SCHEMA)) {
					if (conf.attr("href") && !isIn(allowedAudioConformancePoints,conf.attr("href").value())) {
						errs.push("invalid value for <AudioConformancePoint> ("+conf.attr("href").value()+")");
						errs.increment("audio conf point");
					}
					cp++;
				}

				// Check @href of ContentAttributes/AudioAttributes/tva:coding
				cp=1;
				while (conf=ServiceInstance.get(SCHEMA_PREFIX+":ContentAttributes/"+SCHEMA_PREFIX+":AudioAttributes["+cp+"]/*", SL_SCHEMA)) {
					if (conf.name()==="Coding" && conf.attr("href") && !isIn(allowedAudioSchemes,conf.attr("href").value())) {
						errs.push("invalid @href value for <AudioAttributes> ("+conf.attr("href").value()+")");
						errs.increment("audio codec");
					}
					cp++;
				}

				// Check @href of ContentAttributes/VideoConformancePoints
				cp=1;
				while (conf=ServiceInstance.get(SCHEMA_PREFIX+":ContentAttributes/"+SCHEMA_PREFIX+":VideoConformancePoint["+cp+"]", SL_SCHEMA)) {
					if (conf.attr("href") && !isIn(allowedVideoConformancePoints,conf.attr("href").value())) {
						errs.push("invalid @href value for <VideoConformancePoint> ("+conf.attr("href").value()+")");
						errs.increment("video conf point");
					}
					cp++;
				}

				// Check @href of ContentAttributes/VideoAttributes/tva:coding
				cp=1;
				while (conf=ServiceInstance.get(SCHEMA_PREFIX+":ContentAttributes/"+SCHEMA_PREFIX+":VideoAttributes["+cp+"]/*", SL_SCHEMA)) {
					if (conf.name()==="Coding" && conf.attr("href") && !isIn(allowedVideoSchemes,conf.attr("href").value())) {
						errs.push("invalid @href value for <VideoAttributes> ("+conf.attr("href").value()+")");
						errs.increment("video codec");
					}
					cp++;
				}

				var Availability=ServiceInstance.get(SCHEMA_PREFIX+":Availability", SL_SCHEMA);
				if (Availability) {
					var Period, p=1;
					while (Period=Availability.get(SCHEMA_PREFIX+":Period["+p+"]", SL_SCHEMA)) {
						if (Period.attr("validFrom") && Period.attr("validTo")) {
							// validTo should be >= validFrom
							var fr=new Date(Period.attr("validFrom").value()), 
								to=new Date(Period.attr("validTo").value());
						
							if (to.getTime() < fr.getTime()) {
								errs.push("invalid availability period for service \""+thisServiceId+"\". "+fr+">"+to);
								errs.increment("period start>end");
							}
						}
						p++;
					}
				}

				// note that the <SourceType> element becomes optional in A177v2, but if specified then the relevant
				// delivery parameters also need to be specified
				var SourceType = ServiceInstance.get(SCHEMA_PREFIX+":SourceType", SL_SCHEMA);
				if (SourceType) {
					switch (SourceType.text()) {
						case DVBT_SOURCE_TYPE:
							if (!ServiceInstance.get(SCHEMA_PREFIX+":DVBTDeliveryParameters", SL_SCHEMA) ) {
								NoDeliveryParams(errs, "DVB-T", thisServiceId);
							}
							break;
						case DVBS_SOURCE_TYPE:
							if (!ServiceInstance.get(SCHEMA_PREFIX+":DVBSDeliveryParameters", SL_SCHEMA) ) {
								NoDeliveryParams(errs, "DVB-S", thisServiceId);
							}
							break;
						case DVBC_SOURCE_TYPE:
							if (!ServiceInstance.get(SCHEMA_PREFIX+":DVBCDeliveryParameters", SL_SCHEMA) ) {
								NoDeliveryParams(errs, "DVB-C", thisServiceId);
							}
							break;
						case DVBDASH_SOURCE_TYPE:
							if (!ServiceInstance.get(SCHEMA_PREFIX+":DASHDeliveryParameters", SL_SCHEMA) ) {
								NoDeliveryParams(errs, "DVB-DASH", thisServiceId);
							}
							break;
						case DVBIPTV_SOURCE_TYPE:
							if (!ServiceInstance.get(SCHEMA_PREFIX+":MulticastTSDeliveryParameters", SL_SCHEMA) && !ServiceInstance.get(SCHEMA_PREFIX+":RTSPDeliveryParameters", SL_SCHEMA) ) {
								NoDeliveryParams(errs, "Multicast or RTSP", thisServiceId);
							}
							break;
						case DVBAPPLICATION_SOURCE_TYPE:
							// there should not be any <xxxxDeliveryParameters> elements and there should be either a Service.RelatedMaterial or Service.ServiceInstance.RelatedMaterial signalling a service related application
							if (ServiceInstance.get(SCHEMA_PREFIX+":DVBTDeliveryParameters", SL_SCHEMA)
								|| ServiceInstance.get(SCHEMA_PREFIX+":DVBSDeliveryParameters", SL_SCHEMA)
								|| ServiceInstance.get(SCHEMA_PREFIX+":DVBCDeliveryParameters", SL_SCHEMA)
								|| ServiceInstance.get(SCHEMA_PREFIX+":DASHDeliveryParameters", SL_SCHEMA)
								|| ServiceInstance.get(SCHEMA_PREFIX+":MulticastTSDeliveryParameters", SL_SCHEMA)
								|| ServiceInstance.get(SCHEMA_PREFIX+":RTSPDeliveryParameters", SL_SCHEMA) ) {
									errs.push("Delivery parameters are not permitted for Application service instance in Service \""+thisServiceId+"\".");
									errs.increment("invalid application");
								}
								else {
									// no xxxxDeliveryParameters is signalled
									// check for appropriate Service.RelatedMaterial or Service.ServiceInstance.RelatedMaterial
									if (!hasSignalledApplication(service, SCHEMA_PREFIX, SL_SCHEMA) 
										&& !hasSignalledApplication(ServiceInstance, SCHEMA_PREFIX, SL_SCHEMA)) {
										errs.push("No Application is signalled for SourceType=\""+DVBAPPLICATION_SOURCE_TYPE+"\" in Service \""+thisServiceId+"\".");
										errs.increment("no application");
									}
								}
							break;
						default:
							if (SchemaVersion(SCHEMA_NAMESPACE)==SCHEMA_v1) {
								errs.push("SourceType \""+SourceType.text()+"\" is not valid in Service \""+thisServiceId+"\".");
								errs.increment("invalid SourceType");
							}
							else {
								errs.pushW("Service \""+thisServiceId+"\" has a user defined SourceType \""+SourceType.text()+"\"");
								errs.incrementW("user SourceType");
							}
					}
				}
				else {
					// this should not happen as SourceType is a mandatory element within ServiceInstance
					if (SchemaVersion(SCHEMA_NAMESPACE)==SCHEMA_v1) {
						errs.push("SourceType not specifcied in ServiceInstance of service \""+thisServiceId+"\".");
						errs.increment("no SourceType");
					}
				}

				var DASHDeliveryParameters = ServiceInstance.get(SCHEMA_PREFIX+":DASHDeliveryParameters", SL_SCHEMA);
				if (DASHDeliveryParameters) {
					var URILoc = DASHDeliveryParameters.get(SCHEMA_PREFIX+":UriBasedLocation", SL_SCHEMA);
					if (!URILoc) {
						errs.push("UriBasedLocation not specified for DASHDeliveryParameters in service \""+thisServiceId+"\".");
						errs.increment("no UriBasedLocation");
					}
					else {
						var uriContentType=URILoc.attr("contentType");
						if (uriContentType) {
							if (!validDASHcontentType(uriContentType.value())) {
								errs.push("@contentType=\""+uriContentType.value()+"\" in service \""+thisServiceId+"\" is not valid");
								errs.increment("no @contentType for DASH");
							}
						}
						else {
							errs.push("@contentType not specified for URI in service \""+thisServiceId+"\".");
							errs.increment("no @contentType");
						}
					}
				}

				var DVBTtargetCountry = ServiceInstance.get(SCHEMA_PREFIX+":DVBTDeliveryParameters/"+SCHEMA_PREFIX+":TargetCountry", SL_SCHEMA);
				if (DVBTtargetCountry) {
					if (!isISO3166code(DVBTtargetCountry.text())) {
						errs.push("invalid country code ("+DVBTtargetCountry.text()+") for DVB-T parameters in service \""+thisServiceId+"\"");
						errs.increment("invalid country code");    
					}
				}

				var DVBCtargetCountry = ServiceInstance.get(SCHEMA_PREFIX+":DVBCDeliveryParameters/"+SCHEMA_PREFIX+":TargetCountry", SL_SCHEMA);
				if (DVBCtargetCountry) {
					if (!isISO3166code(DVBCtargetCountry.text())) {
						errs.push("invalid country code ("+DVBCtargetCountry.text()+") for DVB-C parameters in service \""+thisServiceId+"\"");
						errs.increment("invalid country code");    
					}
				}

				si++;  // next <ServiceInstance>
			}

			//check <Service><TargetRegion>
			var tr=1, TargetRegion;
			while (TargetRegion=service.get(SCHEMA_PREFIX+":TargetRegion["+tr+"]", SL_SCHEMA)) {
				if (!isIn(knownRegionIDs,TargetRegion.text())) {
					errs.push("service \""+thisServiceId+"\" has an invalid <TargetRegion>"+TargetRegion.text());
					errs.increment("target region");
				}
				tr++;
			}

			// Check that the @xml:lang values for each <ServiceName> element are unique and only one element does not have any language specified
			checkXMLLangs(SL_SCHEMA, SCHEMA_PREFIX, "ServiceName", "service=\""+thisServiceId+"\"", service, errs);

			// Check that the @xml:lang values for each <ProviderName> element are unique and only one element does not have any language specified
			checkXMLLangs(SL_SCHEMA, SCHEMA_PREFIX, "ProviderName", "service=\""+thisServiceId+"\"", service, errs);

			//check <Service><RelatedMaterial>
			var rm=1, RelatedMaterial;
			while (RelatedMaterial=service.get(SCHEMA_PREFIX+":RelatedMaterial["+rm+"]", SL_SCHEMA)) {
				validateRelatedMaterial(RelatedMaterial,errs,"service \""+thisServiceId+"\"", SERVICE_RM, SCHEMA_PREFIX, SCHEMA_NAMESPACE, SL_SCHEMA);
				rm++;
			}

			//check <Service><ServiceGenre>
			var ServiceGenre=service.get(SCHEMA_PREFIX+":ServiceGenre", SL_SCHEMA);
			if (ServiceGenre) {
				if (ServiceGenre.attr("href")) {
					if (!isIn(allowedGenres,ServiceGenre.attr("href").value())) {
						errs.push("service \""+thisServiceId+"\" has an invalid <ServiceGenre>"+ServiceGenre.attr("href").value());
						errs.increment("invalid ServiceGenre");
					}
				}
				else {
					NoHrefAttribute(errs, "<ServiceGenre>", "service \""+thisServiceId+"\"");
				}				
			}

			//check <Service><ServiceType>                    
			var ServiceType=service.get(SCHEMA_PREFIX+":ServiceType", SL_SCHEMA);
			if (ServiceType) {
				if (ServiceType.attr("href")) {
					if (!isIn(allowedServiceTypes,ServiceType.attr("href").value())) {
						errs.push("service \""+thisServiceId+"\" has an invalid <ServiceType>"+ServiceType.attr("href").value());
						errs.increment("invalid ServiceType");
					}
				}
				else {
					NoHrefAttribute(errs, "<ServiceType>", "service \""+thisServiceId+"\"");
				}
			}

			// check <Service><RecordingInfo>
			var RecordingInfo=service.get(SCHEMA_PREFIX+":RecordingInfo", SL_SCHEMA);
			if (RecordingInfo) {
				if (RecordingInfo.attr("href")) {
					if (!isIn(RecordingInfoCSvalules,RecordingInfo.attr("href").value())) {
						errs.push("invalid <RecordingInfo> value \""+RecordingInfo.attr("href").value()+"\"for service "+thisServiceId);
						errs.increment("invalid RecordingInfo");
					}
				}
				else {
					NoHrefAttribute(errs, "<RecordingInfo>", "service \""+thisServiceId+"\"");
				}
			}

			// check <Service><ContentGuideSource>
			var sCG=service.get(SCHEMA_PREFIX+":ContentGuideSource", SL_SCHEMA);
			if (sCG) {
				var rm=1, CGrm;
				while (CGrm=sCG.get(SCHEMA_PREFIX+":RelatedMaterial["+rm+"]", SL_SCHEMA)) {
					validateRelatedMaterial(CGrm,errs,"<ContentGuideSource> in service "+thisServiceId, CONTENT_GUIDE_RM, SCHEMA_PREFIX, SCHEMA_NAMESPACE, SL_SCHEMA);
					rm++;
				}
			}

			//check <Service><ContentGuideSourceRef>
			var sCGref=service.get(SCHEMA_PREFIX+":ContentGuideSourceRef", SL_SCHEMA);
			if (sCGref) {
				if (!isIn(ContentGuideSourceIDs,sCGref.text())) {
					errs.push("content guide reference \""+sCGref.text()+"\" for service \""+thisServiceId+"\" not specified");
					errs.increment("unspecified content guide source");
				}
			}

			// this should not happen if the XML document has passed schema validation
			if (sCG && sCGref) {
				errs.push("only <ContentGuideSource> or <CountentGuideSourceRef> to be specifed for a service \""+thisServiceId+"\"");
				errs.increment("source and ref");
			}
			
			// <Service><ContentguideServiceRef> checked below
			
			s++;  // next <Service>
		}        

		// check <Service><ContentGuideServiceRef>
		// issues a warning if this is not a reference to another service or is a reference to self
		s=1;
		while (service=SL.get("//"+SCHEMA_PREFIX+":Service["+s+"]", SL_SCHEMA)) {
			var CGSR=service.get(SCHEMA_PREFIX+":ContentGuideServiceRef", SL_SCHEMA);
			if (CGSR) {
				var uniqueID=service.get(SCHEMA_PREFIX+":UniqueIdentifier", SL_SCHEMA);
				if (uniqueID && !isIn(knownServices,CGSR.text())) {
					errs.pushW("<ContentGuideServiceRef> \""+CGSR.text()+"\" in service \""+uniqueID.text()+"\"- does not refer to another service");
					errs.incrementW("invalid <ContentGuideServiceRef>");
				}
				if (uniqueID && (CGSR.text() == uniqueID.text())) {
					errs.pushW("<ContentGuideServiceRef> is self");
					errs.incrementW("self <ContentGuideServiceRef>");
				}
			}
			s++;
		}

		// check <ServiceList><LCNTableList>
		var LCNtableList=SL.get("//"+SCHEMA_PREFIX+":LCNTableList", SL_SCHEMA);
		if (LCNtableList) {
			var l=1, LCNTable;
			while (LCNTable=LCNtableList.get(SCHEMA_PREFIX+":LCNTable["+l+"]", SL_SCHEMA)) {
				// checks on TargetRegion(s) for this LCNTable
				var tr=1, TargetRegion, lastTargetRegion="";
				while (TargetRegion=LCNTable.get(SCHEMA_PREFIX+":TargetRegion["+tr+"]", SL_SCHEMA)) {
					if (!isIn(knownRegionIDs, TargetRegion.text())) {
						errs.push("<TargetRegion> "+TargetRegion.text()+" in LCNTable is not defined");
						errs.increment("undefined region");
					}
					lastTargetRegion=TargetRegion.text();
					tr++;
				}
				
				var LCNNumbers=[],e=1,LCN;
				while (LCN=LCNTable.get(SCHEMA_PREFIX+":LCN["+e+"]", SL_SCHEMA)) {
					if (LCN.attr("channelNumber")) {
						var chanNum=LCN.attr("channelNumber").value();
						if (isIn(LCNNumbers,chanNum)) {
							errs.push("duplicated channel number "+chanNum+" for <TargetRegion>"+lastTargetRegion);
							errs.increment("duplicate channel number");
						} 
						else LCNNumbers.push(chanNum);
					}

					if (LCN.attr("serviceRef")) {
						var servRef=LCN.attr("serviceRef").value();
						if (!isIn(knownServices,servRef)) {
							errs.push("LCN reference to unknown service "+servRef);
							errs.increment("LCN unknown services");
						}
					}
					e++;
				}
				l++;
			}
		}
	}	
}

function checkQuery(req) {
    if (req.query) {
        if (req.query.SLurl)
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
        var SLxml=null;
        var errs=new ErrorList();
        try {
            SLxml = syncRequest("GET", req.query.SLurl);
        }
        catch (err) {
            errs.push("retrieval of URL ("+req.query.SLurl+") failed");
        }
		if (SLxml) {
			validateServiceList(SLxml.getBody().toString().replace(/(\r\n|\n|\r|\t)/gm,""), errs);
		}

        drawForm(true, res, req.query.SLurl, {errors:errs});
    }
    res.end();
}


const fileUpload = require('express-fileupload');
//middleware
app.use(express.static(__dirname));
app.set('view engine', 'ejs');
app.use(fileUpload());


function checkFile(req) {
    if (req.files) {
        if (req.files.SLfile)
            return true;
        
        return false;
    }
    return true;
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
            SLxml = req.files.SLfile.data;
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


// read in the validation data
loadDataFiles();

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

var http_server = app.listen(HTTP_SERVICE_PORT, function() {
    console.log("HTTP listening on port number", http_server.address().port);
});


// start the HTTPS server
// sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ./selfsigned.key -out selfsigned.crt

function readmyfile(filename) {
    try {
        var stats=fs.statSync(filename);
        if (stats.isFile()) return fs.readFileSync(filename); 
    }
    catch (err) {console.log(err);}
    return null;
}

var https_options = {
    key:readmyfile(keyFilename),
    cert:readmyfile(certFilename)
};

if (https_options.key && https_options.cert) {
    var https_server = https.createServer(https_options, app);
    https_server.listen(HTTPS_SERVICE_PORT, function(){
        console.log("HTTPS listening on port number", https_server.address().port);
    });
}