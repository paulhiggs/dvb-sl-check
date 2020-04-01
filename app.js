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
      DVBI_RecordingInfoCSURL=REPO_RAW + "cs/" + "DVBRecordingInfoCS-2019.xml";
*/
const FILE_FORMAT_CS = "urn:mpeg:mpeg7:cs:FileFormatCS:2001",
      JPEG_IMAGE_CS_VALUE = FILE_FORMAT_CS + ":1",
      PNG_IMAGE_CS_VALUE =  FILE_FORMAT_CS + "urn:mpeg:mpeg7:cs:FileFormatCS:2001:15";

const JPEG_MIME = "image/jpg",
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
const DVB_RELATED_CS = "urn:dvb:metadata:cs:HowRelatedCS:2019",
      BANNER_OUTSIDE_AVAILABILITY = DVB_RELATED_CS+":1000.1",
	  BANNER_CONTENT_FINISHED = DVB_RELATED_CS+":1000.2",	// added in A177v2
      LOGO_SERVICE_LIST = DVB_RELATED_CS+":1001.1",
      LOGO_SERVICE = DVB_RELATED_CS+":1001.2",
      LOGO_CG_PROVIDER = DVB_RELATED_CS+":1002.1";

// A177 5.2.7.2
const CONTENT_TYPE_DASH_MPD = "application/dash+xml",    // MPD of linear service
      CONTENT_TYPE_DVB_PLAYLIST = "application/xml";    // XML Playlist
      
const SERVICE_LIST_RM = "service list",
      SERVICE_RM = "service",
      CONTENT_GUIDE_RM = "content guide";

var allowedGenres=[], allowedServiceTypes=[], allowedAudioSchemes=[], allowedVideoSchemes=[], allowedCountries=[], allowedAudioConformancePoints=[], allowedVideoConformancePoints=[], RecordingInfoCSvalules=[];

//TODO: validation against schema
//const DVBI_ServiceListSchemaFilename=path.join("schema","dvbi_v1.0.xsd");
//const TVA_SchemaFilename=path.join("schema","tva_metadata_3-1.xsd");
//const MPEG7_SchemaFilename=path.join("schema","tva_mpeg7.xsd");
//const XML_SchemaFilename=path.join("schema","xml.xsd");
//var SLschema, TVAschema, MPEG7schema, XMLschema;

//const allowed_arguments = ["serviceList", ];

const MAX_SUBREGION_LEVELS=3; // definied for <RegionElement> in Table 33 of A177


class ErrorList {
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
morgan.token("slURL",function getCheckedURL(req) {
    return "["+req.query.SLurl+"]";
});

app.use(morgan(":remote-addr :protocol :method :url :status :res[content-length] - :response-time ms :agent :parseErr :slURL"));


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

function loadDataFiles() {
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

    loadCountries(ISO3166_Filename);

    loadCS(RecordingInfoCSvalules, DVBI_RecordingInfoCSFilename);

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

    loadCountries(ISO3166_URL);
    
    loadCS(RecordingInfoCSvalules, DVBI_RecordingInfoCSURL);

//TODO: validation against schema
//    SLschema=fs.readFileSync(DVBI_ServiceListSchemaFilename);
//    TVAschema=fs.readFileSync(TVA_SchemaFilename);
//    MPEG7schema=fs.readFileSync(MPEG7_SchemaFilename);
//    XMLschema=fs.readFileSync(XML_SchemaFilename);
}
*/


function isTAGURI(identifier){
    // RFC 4151 compliant - https://tools.ietf.org/html/rfc4151
    // tagURI = "tag:" taggingEntity ":" specific [ "#" fragment ]

    var TAGregex=/tag:(([\dA-Za-z\-\._]+@)?[\dA-Za-z][\dA-Za-z\-]*[\dA-Za-z]*(\.[\dA-Za-z][\dA-Za-z\-]*[\dA-Za-z]*)*),\d{4}(\-\d{2}(\-\d{2})?)?:(['A-Za-z\d\-\._~!$&\(\)\*\+,;=:@\?/]|%[0-9A-Fa-f]{2})*(#(['A-Za-z0-9\-\._~!$&\(\)\*\+,;=:@\?/]|%[0-9A-Fa-f]{2})*)?/g;
    var s=identifier.match(TAGregex);
    return s?s[0] === identifier:false;
}
function validServiceIdentifier(identifier){
    return isTAGURI(identifier);
}


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

function validOutScheduleHours(HowRelated) {
    // return true if val is a valid CS value for Out of Service Banners (A177 5.2.5.3)
    // urn:dvb:metadata:cs:HowRelatedCS:2019
    var val= HowRelated.attr("href") ? HowRelated.attr("href").value() : null;
    return val==BANNER_OUTSIDE_AVAILABILITY;
}

function validContentFinishedBanner(HowRelated) {
    // return true if val is a valid CS value for Content Finished Banner (A177 5.2.7.3)
    // urn:dvb:metadata:cs:HowRelatedCS:2019
    var val= HowRelated.attr("href") ? HowRelated.attr("href").value() : null;
    return val==BANNER_CONTENT_FINISHED;
}

function validServiceListLogo(HowRelated) {
    // return true if val is a valid CS value Service List Logo (A177 5.2.6.1)
    var val= HowRelated.attr("href") ? HowRelated.attr("href").value() : null;
    return val==LOGO_SERVICE_LIST;
}

function validServiceLogo(HowRelated) {
    // return true if val is a valid CS value Service Logo (A177 5.2.6.2)
    var val= HowRelated.attr("href") ? HowRelated.attr("href").value() : null;
    return val==LOGO_SERVICE;
}

function validContentGuideSourceLogo(HowRelated) {
    // return true if val is a valid CS value Service Logo (A177 5.2.6.3)
    var val= HowRelated.attr("href") ? HowRelated.attr("href").value() : null;
    return val==LOGO_CG_PROVIDER;
}

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
                    errs.push("no @href specified for <RelatedMaterial><Format> in "+Location);
                    errs.increment("no href");
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
                    if (contentType!=JPEG_MIME && contentType!=PNG_MIME) {
                        errs.push("invalid @contentType \""+contentType+"\" specified for <RelatedMaterial><MediaLocator> in "+Location);
                        errs.increment("invalid MediaUri@contentType");
                    }
                    if (Format && ((contentType==JPEG_MIME && !isJPEG) || (contentType==PNG_MIME && !isPNG))){
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

function validateRelatedMaterial(RelatedMaterial,errs,Location,LocationType,SCHEMA_PREFIX,SL_SCHEMA) {
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
                if (!validServiceListLogo(HowRelated)) {
                    errs.push("invalid @href=\""+HRhref.value()+"\" for <RelatedMaterial> in "+Location);
                    errs.increment("invalid href");
                }
                else {
                    MediaLocator.forEach(locator => 
                        checkValidLogo(HowRelated,Format,locator,errs,Location,LocationType,SCHEMA_PREFIX,SL_SCHEMA));
                }
            }
            if (LocationType==SERVICE_RM) {
                if (!(validOutScheduleHours(HowRelated) || validContentFinishedBanner(HowRelated) ||validServiceApplication(HowRelated) || validServiceLogo(HowRelated))) {
                    errs.push("invalid @href=\""+HRhref.value()+"\" for <RelatedMaterial> in "+Location);
                    errs.increment("invalid href");
                }
                else {
                    if (validServiceLogo(HowRelated)||validOutScheduleHours(HowRelated))
                        MediaLocator.forEach(locator =>
                            checkValidLogo(HowRelated,Format,locator,errs,Location,LocationType,SCHEMA_PREFIX,SL_SCHEMA));
                    if (validServiceApplication(HowRelated))
                        MediaLocator.forEach(locator =>
                            checkSignalledApplication(HowRelated,Format,locator,errs,Location,LocationType,SCHEMA_PREFIX,SL_SCHEMA));
                }
            }
            if (LocationType==CONTENT_GUIDE_RM) {
                if (!validContentGuideSourceLogo(HowRelated)) {
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
            errs.push("no @href specified for <RelatedMaterial><HowRelated> in "+Location);
            errs.increment("no href");
        }
    }
}

const LANG_OK=0,
      LANG_UNDEFINED,
	  LANG_USE_2DIGIT;

function checkBCP47lang(lang) {
	//TODO: check the lang against BCP47 (https://tools.ietf.org/html/bcp47)
	
	
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

        //if lang!="missing" validate the format and value of the attribute against BCP47 (RFC 5646)
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
const ENTRY_FORM="<form method=\"post\"><p><i>URL:</i></p><input type=\"url\" name=\"SLurl\" value=\"%s\"><input type=\"submit\" value=\"submit\"></form>";
const RESULT_WITH_INSTRUCTION="<br><p><i>Results:</i></p>";
const SUMMARY_FORM_HEADER = "<table><tr><th>item</th><th>count</th></tr>";
const FORM_BOTTOM="</body></html>";

function drawForm(res, lastURL, o) {
    res.write(FORM_TOP);    
    res.write(PAGE_HEADING);    
    res.write(sprintf(ENTRY_FORM, lastURL ? lastURL : ""));
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

app.use(express.urlencoded({ extended: true }));

app.post("/check", function(req,res) {
    req.query.SLurl=req.body.SLurl;
    processQuery(req,res);
});

app.get("/check", function(req,res){
    processQuery(req,res);
});



    
function processQuery(req,res) {
    if (isEmpty(req.query)) {
        drawForm(res);    
    } else if (!checkQuery(req)) {
        drawForm(res, req.query.Slurl, {error:"URL not specified"});
        res.status(400);
    }
    else {
        var SL, SLxml;
        var errs=new ErrorList();
        try {
            SLxml = syncRequest("GET", req.query.SLurl);
        }
        catch (err) {
            errs.push("retrieval of URL ("+req.query.SLurl+") failed");
            SLxml = null;
        }
        if (SLxml) try {
            SL = libxml.parseXmlString(SLxml.getBody().toString().replace(/(\r\n|\n|\r|\t)/gm,""));
        } catch (err) {
            errs.push("XML parsing failed: "+err.message);
            errs.increment("malformed XML");
            SL = null;
        }
        if (SL) {
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
                var SL_SCHEMA = {}, SCHEMA_PREFIX=SL.root().namespace().prefix();
                SL_SCHEMA[SL.root().namespace().prefix()]=SL.root().namespace().href();
                
                // Check that the @xml:lang values for each <Name> element are unique and only one element does not have any language specified
                checkXMLLangs(SL_SCHEMA, SCHEMA_PREFIX, "Name", "ServiceList", SL, errs);
                
                // Check that the @xml:lang values for each <ProviderName> element are unique and only one elementdoes not have any language specified
                checkXMLLangs(SL_SCHEMA, SCHEMA_PREFIX, "ProviderName", "ServiceList", SL, errs);

                //check <ServiceList><RelatedMaterial>
                var rm=1, RelatedMaterial;
                while (RelatedMaterial=SL.get(SCHEMA_PREFIX+":RelatedMaterial["+rm+"]", SL_SCHEMA)) {
                    validateRelatedMaterial(RelatedMaterial,errs,"service list", SERVICE_LIST_RM, SCHEMA_PREFIX, SL_SCHEMA);
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
                            validateRelatedMaterial(CGrm,errs,"<ServiceList><ContentGuideSourceList>", CONTENT_GUIDE_RM, SCHEMA_PREFIX, SL_SCHEMA);
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
                        validateRelatedMaterial(CGrm,errs,"<ServiceList><ContentGuideSource>", CONTENT_GUIDE_RM, SCHEMA_PREFIX, SL_SCHEMA);
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
                        errs.increment("no <UniqueIdentifier>")
                    } else{
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
                            validateRelatedMaterial(RelatedMaterial,errs,"service instance of \""+thisServiceId+"\"", SERVICE_RM, SCHEMA_PREFIX, SL_SCHEMA);
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

                        var SourceType = ServiceInstance.get(SCHEMA_PREFIX+":SourceType", SL_SCHEMA);
                        if (SourceType) {
                            switch (SourceType.text()) {
                                case DVBT_SOURCE_TYPE:
                                    if (!ServiceInstance.get(SCHEMA_PREFIX+":DVBTDeliveryParameters", SL_SCHEMA) ) {
                                        errs.push("DVB-T delivery parameters not specified for service instance in service \""+thisServiceId+"\"");
                                        errs.increment("no delivery params");
                                    }
                                    break;
                                case DVBS_SOURCE_TYPE:
                                    if (!ServiceInstance.get(SCHEMA_PREFIX+":DVBSDeliveryParameters", SL_SCHEMA) ) {
                                        errs.push("DVB-S delivery parameters not specified for service instance in service \""+thisServiceId+"\"");
                                        errs.increment("no delivery params");
                                    }
                                    break;
                                case DVBC_SOURCE_TYPE:
                                    if (!ServiceInstance.get(SCHEMA_PREFIX+":DVBCDeliveryParameters", SL_SCHEMA) ) {
                                        errs.push("DVB-C delivery parameters not specified for service instance in service \""+thisServiceId+"\"");
                                        errs.increment("no delivery params");
                                    }
                                    break;
                                case DVBDASH_SOURCE_TYPE:
                                    if (!ServiceInstance.get(SCHEMA_PREFIX+":DASHDeliveryParameters", SL_SCHEMA) ) {
                                        errs.push("DVB-DASH delivery parameters not specified for service instance in service \""+thisServiceId+"\"");
                                        errs.increment("no delivery params");
                                    }
                                    break;
                                case DVBIPTV_SOURCE_TYPE:
                                    if (!ServiceInstance.get(SCHEMA_PREFIX+":MulticastTSDeliveryParameters", SL_SCHEMA) && !ServiceInstance.get(SCHEMA_PREFIX+":RTSPDeliveryParameters", SL_SCHEMA) ) {
                                        errs.push("Multicast or RTSP delivery parameters not specified for service instance in service \""+thisServiceId+"\"");
                                        errs.increment("no delivery params");
                                    }
                                    break;
                                case DVBAPPLICATION_SOURCE_TYPE:
                                    // there should be either a Service.RelatedMaterial or Service.ServiceInstance.RelatedMaterial signalling a service related application
                                    // TODO:
                                    break;
                                default:
                                    errs.push("SourceType \""+SourceType.text()+"\" is not valid in Service \""+thisServiceId+"\".");
                                    errs.increment("invalid SourceType");
                            }
                        }
                        else {
                            // this should not happen as SourceType is a mandatory element within ServiceInstance
                            // TODO: SourceType becomes optional in A177v2
                            errs.push("SourceType not specifcied in ServiceInstance of service \""+thisServiceId+"\".");
                            errs.increment("no SourceType");
                        }
                        
                        var DASHDeliveryParameters = ServiceInstance.get(SCHEMA_PREFIX+":DASHDeliveryParameters", SL_SCHEMA);
                        if (DASHDeliveryParameters) {
                            var URILoc = DASHDeliveryParameters.get(SCHEMA_PREFIX+":UriBasedLocation", SL_SCHEMA);
                            if (!URILoc) {
                                errs.push("UriBasedLocation not specified for DASHDeliveryParameters in service \""+thisServiceId+"\".");
                                errs.increment("no UriBasedLocation");
                            }
                            else {
                                if (URILoc.attr("contentType")) {
                                    if (!validDASHcontentType(URILoc.attr("contentType").value())) {
                                        errs.push("@contentType=\""+URILoc.attr("contentType").value()+"\" in service \""+thisServiceId+"\" is not valid");
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
                        validateRelatedMaterial(RelatedMaterial,errs,"service \""+thisServiceId+"\"", SERVICE_RM, SCHEMA_PREFIX, SL_SCHEMA);
                        rm++;
                    }                    

                    //check <Service><ServiceGenre>
                    var ServiceGenre=service.get(SCHEMA_PREFIX+":ServiceGenre", SL_SCHEMA);
                    if (ServiceGenre) {
                        if (!isIn(allowedGenres,ServiceGenre.text())) {
                            errs.push("service \""+thisServiceId+"\" has an invalid <ServiceGenre>"+ServiceGenre.text());
                            errs.increment("invalid ServiceGenre");
                        }
                    }
                    
                    //check <Service><ServiceType>                    
                    var ServiceType=service.get(SCHEMA_PREFIX+":ServiceType", SL_SCHEMA);
                    if (ServiceType) {
                        if (!isIn(allowedServiceTypes,ServiceType.attr("href").value())) {
                            errs.push("service \""+thisServiceId+"\" has an invalid <ServiceType>"+ServiceType.attr("href").value());
                            errs.increment("invalid ServiceType");
                        }
                    }
                    
                    // check <Service><RecordingInfo>
                    var RecordingInfo=service.get(SCHEMA_PREFIX+":RecordingInfo", SL_SCHEMA);
                    if (RecordingInfo) {
                        if (!isIn(RecordingInfoCSvalules,RecordingInfo.attr("href").value())) {
                            errs.push("invalid <RecordingInfo> value \""+RecordingInfo.attr("href").value()+"\"for service "+thisServiceId);
                            errs.increment("invalid RecordingInfo");
                        }
                    }

                    // check <Service><ContentGuideSource>
                    var sCG=service.get(SCHEMA_PREFIX+":ContentGuideSource", SL_SCHEMA);
                    if (sCG) {
                        var rm=1, CGrm;
                        while (CGrm=sCG.get(SCHEMA_PREFIX+":RelatedMaterial["+rm+"]", SL_SCHEMA)) {
                            validateRelatedMaterial(CGrm,errs,"<ContentGuideSource> in service "+thisServiceId, CONTENT_GUIDE_RM, SCHEMA_PREFIX, SL_SCHEMA);
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

        drawForm(res, req.query.SLurl, {errors:errs});
    }
    res.end();
}


function checkQuery(req) {
    if (req.query) {
        if (req.query.SLurl)
            return true;
        
        return false;
    }
    return true;
}


app.get("*", function(req,res) {
    res.status(404).end();
});


loadDataFiles();

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