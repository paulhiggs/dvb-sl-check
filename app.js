// node.js - https://nodejs.org/en/
// express framework - https://expressjs.com/en/4x/api.html
const express = require('express');
var app = express();

// libxmljs - https://github.com/libxmljs/libxmljs
const libxml = require('libxmljs');

//TODO: validation against schema
//const xmllint = require('xmllint');

// morgan - https://github.com/expressjs/morgan
const morgan = require('morgan')

const fs=require('fs'), path=require('path');

//const request = require('request');

// sync-request - https://github.com/ForbesLindesay/sync-request
const syncRequest = require('sync-request');
//var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const https=require('https');
const HTTP_SERVICE_PORT = 3010;
const HTTPS_SERVICE_PORT=HTTP_SERVICE_PORT+1;
const keyFilename=path.join('.','selfsigned.key'), certFilename=path.join('.','selfsigned.crt');

const { parse } = require('querystring');

// https://github.com/alexei/sprintf.js
var sprintf = require('sprintf-js').sprintf,
    vsprintf = require('sprintf-js').vsprintf

const TVA_ContentCSFilename=path.join('cs','ContentCS.xml'),
      TVA_FormatCSFilename=path.join('cs','FormatCS.xml'),
	  DVBI_ContentSubjectFilename=path.join('cs','DVBContentSubjectCS-2019.xml'),
	  DVBI_ServiceTypeCSFilename=path.join('cs','DVBServiceTypeCS-2019.xml'),
	  DVB_AudioCodecCSFilename=path.join('cs','AudioCodecCS.xml'),
	  DVB_VideoCodecCSFilename=path.join('cs','VideoCodecCS.xml'),
	  MPEG7_AudioCodingFormatCSFilename=path.join('cs','AudioCodingFormatCS.xml'),
	  MPEG7_VisualCodingFormatCSFilename=path.join('cs','VisualCodingFormatCS.xml'),
	  DVB_AudioConformanceCSFilename=path.join('cs','AudioConformancePointsCS.xml'),
	  DVB_VideoConformanceCSFilename=path.join('cs','VideoConformancePointsCS.xml'),
	  ISO3166_Filename=path.join('.','iso3166-countries.json');

const JPEG_IMAGE_CS_VALUE = 'urn:mpeg:mpeg7:cs:FileFormatCS:2001:1',
	  PNG_IMAGE_CS_VALUE =  'urn:mpeg:mpeg7:cs:FileFormatCS:2001:15';

const JPEG_MIME = 'image/jpg',
	  PNG_MIME =  'image/png';
	  
var allowedGenres=[], allowedServiceTypes=[], allowedAudioSchemes=[], allowedVideoSchemes=[], allowedCountries=[], allowedAudioConformancePoints=[], allowedVideoConformancePoints=[];

//TODO: validation against schema
//const DVBI_ServiceListSchemaFilename=path.join('schema','dvbi_v1.0.xsd');
//const TVA_SchemaFilename=path.join('schema','tva_metadata_3-1.xsd');
//const MPEG7_SchemaFilename=path.join('schema','tva_mpeg7.xsd');
//const XML_SchemaFilename=path.join('schema','xml.xsd');
//var SLschema, TVAschema, MPEG7schema, XMLschema;

const allowed_arguments = ['serviceList', ];

const MAX_SUBREGION_LEVELS=3; // definied for <RegionElement> in Table 33 of A177


morgan.token('protocol', function getProtocol(req) {
	return req.protocol;
});
morgan.token('parseErr',function getParseErr(req) {
	if (req.parseErr) return "("+req.parseErr+")";
	return "";
});
morgan.token('agent',function getAgent(req) {
	return "("+req.headers['user-agent']+")";
});

app.use(morgan(':remote-addr :protocol :method :url :status :res[content-length] - :response-time ms :agent :parseErr'));


function isIn(args, value){
	if (typeof(args) == "string")
		return args==value;
	
	if (typeof(args) == "object") {
		for (var x=0; x<args.length; x++) 
			if (args[x] == value)
				return true;
	}
	return false;
}

function addCSTerm(values,CSuri,term){
	if (term.name()==='Term') {
		values.push(CSuri+':'+term.attr('termID').value())
		var st=0, subTerm;
		while (subTerm=term.child(st)) {
			addCSTerm(values,CSuri,subTerm);
			st++;
		}
	}
}

function loadCS(values, classificationScheme) {
	fs.readFile(classificationScheme, {encoding: 'utf-8'}, function(err,data){
		if (!err) {
			var xmlCS = libxml.parseXmlString(data.replace(/(\r\n|\n|\r|\t)/gm,""));
			var CSnamespace = xmlCS.root().attr('uri');
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
	fs.readFile(countriesFile, {encoding: 'utf-8'}, function(err,data){	
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

//TODO: validation against schema
//	SLschema=fs.readFileSync(DVBI_ServiceListSchemaFilename);
//	TVAschema=fs.readFileSync(TVA_SchemaFilename);
//	MPEG7schema=fs.readFileSync(MPEG7_SchemaFilename);
//	XMLschema=fs.readFileSync(XML_SchemaFilename);
}


function incrErr(errCounts,errorCode)
{
	if (errCounts[errorCode]===undefined)
		errCounts[errorCode]=1;
	else errCounts[errorCode]++;
}

function isTAGURI(identifier){
	// RFC 4151 compliant - https://tools.ietf.org/html/rfc4151
	// tagURI = "tag:" taggingEntity ":" specific [ "#" fragment ]

	var TAGregex=/tag:(([\dA-Za-z\-\._]+@)?[\dA-Za-z][\dA-Za-z\-]*[\dA-Za-z]*(\.[\dA-Za-z][\dA-Za-z\-]*[\dA-Za-z]*)*),\d{4}(\-\d{2}(\-\d{2})?)?:(['A-Za-z\d\-\._~!$&\(\)\*\+,;=:@\?/]|%[0-9A-Fa-f]{2})*(#(['A-Za-z0-9\-\._~!$&\(\)\*\+,;=:@\?/]|%[0-9A-Fa-f]{2})*)?/g;
	var s=identifier.match(TAGregex);
	return s[0] === identifier;
}
function validServiceIdentifier(identifier){
	return isTAGURI(identifier);
}

function uniqueServiceIdentifier(identifier,identifiers) {
	return !isIn(identifiers,identifier);
}

function addRegion(Region, depth, knownRegionIDs, validationErrors, errCounts) {
	var regionID=Region.attr('regionID').value();
	var countryCodeSpecified=Region.attr('countryCodes');
	if (isIn(knownRegionIDs, regionID)) {
		validationErrors.push('Duplicate RegionID \"'+regionID+'\"');
		incrErr(errCounts,'duplicate regionID');
	}
	else knownRegionIDs.push(regionID);	
	
	if ((depth != 0) && countryCodeSpecified) {
		validationErrors.push('@countryCodes not permitted for sub-region \"'+regionID+'\"');
		incrErr(errCounts,'ccode in subRegion');
	}
	
	if (countryCodeSpecified) {
		var countries=countryCodeSpecified.value().split(",");
		countries.forEach(country => {
			if (!isISO3166code(country)) {
				validationErrors.push('invalid country code ('+country+') for region \"'+regionID+'\"');
				incrErr(errCounts,'bad country code');	
			}
		});
	}
	
	if (depth > MAX_SUBREGION_LEVELS) {
		validationErrors.push('<Region> depth exceeded (>'+MAX_SUBREGION_LEVELS+') for sub-region \"'+regionID+'\"');
		incrErr(errCounts,'region depth exceeded');
	}
	
	var i=0, RegionChild;
	while ((RegionChild=Region.child(i)) != null) {
		if (RegionChild.type()==='element' && RegionChild.name()=='Region') {
			// its a child Region
			addRegion(RegionChild,depth+1,knownRegionIDs,validationErrors,errCounts);
		}
		i++;
	}
}


function validServiceApplication(HowRelated) {
	// return true if val is a valid CS value for Service Related Applications (A177 5.2.3)
	// urn:dvb:metadata:cs:LinkedApplicationCS:2019 
	var val= HowRelated.attr('href') ? HowRelated.attr('href').value() : null;
	return val=='urn:dvb:metadata:cs:LinkedApplicationCS:2019:1.1'
	    || val=='urn:dvb:metadata:cs:LinkedApplicationCS:2019:1.2'
	    || val=='urn:dvb:metadata:cs:LinkedApplicationCS:2019:2'
}

function validOutScheduleHours(HowRelated) {
	// return true if val is a valid CS value for Out of Service Banners (A177 5.2.5.3)
	// urn:dvb:metadata:cs:HowRelatedCS:2019
	var val= HowRelated.attr('href') ? HowRelated.attr('href').value() : null;
	return val=='urn:dvb:metadata:cs:HowRelatedCS:2019:1000.1'	
}

function validServiceListLogo(HowRelated) {
	// return true if val is a valid CS value Service List Logo (A177 5.2.6.1)
	var val= HowRelated.attr('href') ? HowRelated.attr('href').value() : null;
	return val=='urn:dvb:metadata:cs:HowRelatedCS:2019:1001.1'
}

function validServiceLogo(HowRelated) {
	// return true if val is a valid CS value Service Logo (A177 5.2.6.2)
	var val= HowRelated.attr('href') ? HowRelated.attr('href').value() : null;
	return val=='urn:dvb:metadata:cs:HowRelatedCS:2019:1001.2'
}

function validContentGuideSourceLogo(HowRelated) {
	// return true if val is a valid CS value Service Logo (A177 5.2.6.3)
	var val= HowRelated.attr('href') ? HowRelated.attr('href').value() : null;
	return val=='urn:dvb:metadata:cs:HowRelatedCS:2019:1002.2'
}

function checkValidLogo(HowRelated,Format,MediaLocator,validationErrors,errCounts,Location,LocationType,SCHEMA_PREFIX,SL_SCHEMA) {
	// irrespective of the HowRelated@href, all logos have specific requirements
	var isJPEG=false, isPNG=false;

	if (!HowRelated)
		return;
	
	// if <Format> is specified, then it must be per A177 5.2.6.1, 5.2.6.2 or 5.2.6.3 -- which are all the same
	if (Format) {
		var subElems=Format.childNodes(), hasStillPictureFormat=false;
		subElems.forEach(child => {
			if (child.name() == 'StillPictureFormat') {
				hasStillPictureFormat=true;
				if (!child.attr('horizontalSize')) {
					validationErrors.push('@horizontalSize not specified for <RelatedMaterial><Format><StillPictureFormat> in '+Location );
					incrErr(errCounts,'no @horizontalSize');
				}
				if (!child.attr('verticalSize')) {
					validationErrors.push('@verticalSize not specified for <RelatedMaterial><Format><StillPictureFormat> in '+Location );
					incrErr(errCounts,'no @verticalSize');
				}
				if (child.attr('href')) {
					if (child.attr('href').value() != JPEG_IMAGE_CS_VALUE && child.attr('href').value() != PNG_IMAGE_CS_VALUE) {
						validationErrors.push('invalid @href \"'+child.attr('href').value()+'\" specified for <RelatedMaterial><Format><StillPictureFormat> in '+Location);
						incrErr(errCounts,'invalid href');				
					}
					if (child.attr('href').value() == JPEG_IMAGE_CS_VALUE) isJPEG=true;
					if (child.attr('href').value() == PNG_IMAGE_CS_VALUE) isPNG=true;
				}
				else {
					validationErrors.push('no @href specified for <RelatedMaterial><Format> in '+Location);
					incrErr(errCounts,'no href');
				}
			}
		});
		if (!hasStillPictureFormat) {
			validationErrors.push('<StillPictureFormat> not specified for <Format> in '+Location);
			incrErr(errCounts,'no StillPictureFormat');
		}		
	}
	
	if (MediaLocator) {
		var subElems=MediaLocator.childNodes(), hasMediaURI=false;
		subElems.forEach(child => {
			if (child.name()=='MediaUri') {
				hasMediaURI=true;
				if (!child.attr('contentType')) {
					validationErrors.push('@contentType not specified for <MediaUri> in '+Location);
					incrErr(errCounts,'unspecified MediaUri@contentType');
				}
				else {
					if (child.attr('contentType').value()!=JPEG_MIME && child.attr('contentType').value()!=PNG_MIME) {
						validationErrors.push('invalid @contentType \"'+child.attr('contentType').value()+'\" specified for <RelatedMaterial><MediaLocator> in '+Location);
						incrErr(errCounts,'invalid MediaUri@contentType');
					}
					if (Format && ((child.attr('contentType').value()==JPEG_MIME && !isJPEG) ||
						           (child.attr('contentType').value()==PNG_MIME && !isPNG))){
						validationErrors.push('conflicting media types in <Format> and <MediaUri> for '+Location);
						incrErr(errCounts,'conflicting mime types');
					}	
				}
			}
		});
		if (!hasMediaURI) {
			validationErrors.push('<MediaUri> not specified for <MediaLocator> in '+Location);
			incrErr(errCounts,'no MediaUri');
		}
	}
	else {
		validationErrors.push('MediaLocator not specified for <RelatedMaterial> in '+Location);
		incrErr(errCounts,'no MediaLocator');
	}
}

function validateRelatedMaterial(RelatedMaterial,validationErrors,errCounts,Location,LocationType,SCHEMA_PREFIX,SL_SCHEMA) {
	
	var HowRelated=null, Format=null, MediaLocator=null;
	var elem=RelatedMaterial.child(0);
	while (elem) {
		if (elem.name()==='HowRelated') 
			HowRelated=elem;
		else if (elem.name()==='Format')
			Format=elem;
		else if (elem.name()==='MediaLocator')
			MediaLocator=elem;

		elem = elem.nextElement();
	}
		
	if (!HowRelated) {
		validationErrors.push('<HowRelated> not specified for <RelatedMaterial> in '+Location);
		incrErr(errCounts,'no HowRelated');		
	}		
	else {
		var HRhref=HowRelated.attr('href');
		if (HRhref) {
			if (LocationType=="service list") {
				if (!validServiceListLogo(HowRelated)) {
					validationErrors.push('invalid @href \"'+HRhref.value()+'\" for <RelatedMaterial> in '+Location);
					incrErr(errCounts,'invalid href');
				}
				else {
					checkValidLogo(HowRelated,Format,MediaLocator,validationErrors,errCounts,Location,LocationType,SCHEMA_PREFIX,SL_SCHEMA);
				}
			}
			if (LocationType=="service") {
				if (!(validOutScheduleHours(HowRelated) || validServiceApplication(HowRelated) || validServiceLogo(HowRelated))) {
					validationErrors.push('invalid @href \"'+HRhref.value()+'\" for <RelatedMaterial> in '+Location);
					incrErr(errCounts,'invalid href');
				}
				else {
					if (validServiceLogo(HowRelated))
						checkValidLogo(HowRelated,Format,MediaLocator,validationErrors,errCounts,Location,LocationType,SCHEMA_PREFIX,SL_SCHEMA);
				}
			}
			if (LocationType=="content guide") {
				if (!validContentGuideLogo(HowRelated)) {
					validationErrors.push('invalid @href \"'+HRhref.value()+'\" for <RelatedMaterial> in '+Location);
					incrErr(errCounts,'invalid href');
				}
				else {
					checkValidLogo(HowRelated,Format,MediaLocator,validationErrors,errCounts,Location,LocationType,SCHEMA_PREFIX,SL_SCHEMA);
				}
			}	
		}
		else {
			validationErrors.push('no @href specified for <RelatedMaterial><HowRelated> in '+Location);
			incrErr(errCounts,'no href');
		}
		
		
	}

}

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}
const FORM_TOP='<html><head><title>DVB-I Service List Validator</title></head><body>';

const PAGE_HEADING='<h1>DVB-I Service List Validator</h1>';
const ENTRY_FORM='<form method=\"post\"><p><i>URL:</i></p><input type=\"url\" name="SLurl\" value=\"%s"><input type=\"submit\" value=\"submit\"></form>';
const RESULT_WITH_INSTRUCTION='<br><p><i>Results:</i></p>';

const FORM_BOTTOM='</body></html>';

function drawForm(res, lastURL, o) {
	res.write(FORM_TOP);	
	res.write(PAGE_HEADING);	
	res.write(sprintf(ENTRY_FORM, lastURL ? lastURL : ""));
	res.write(RESULT_WITH_INSTRUCTION);
	if (o) {
		if (o.error) {
			res.write('<p>'+o.error+'</p>');
		}
		var resultsShown=false;
		if (o.counts) {
			var tableHeader=false;
			for (var i in o.counts) {
				if (o.counts[i] != 0) {
					if (!tableHeader) {
						res.write('<table><tr><th>item</th><th>count</th></tr>');
						tableHeader=true;
					}
					res.write('<tr><td>'+i+'</td><td>'+o.counts[i]+'</td></tr>');
					resultsShown=true;
				}
			}
			if (tableHeader) res.write('</table>');
	
		}
		if (o.issues) {
			var tableHeader=false;
			o.issues.forEach(function(value)
			{
				if (!tableHeader) {
					res.write('<table><tr><th>error</th></tr>');
					tableHeader=true;					
				}
				var o=value.replace(/</g,'&lt').replace(/>/g,'&gt');
				res.write('<tr><td>'+o+'</td></tr>');
				resultsShown=true;
			});
			if (tableHeader) res.write('</table>');
		}
		if (!resultsShown) res.write('no errors');
	}
	res.write(FORM_BOTTOM);		
}

app.use(express.urlencoded());

app.post('/check', function(req,res) {
	
	req.query.SLurl=req.body.SLurl;
	processQuery(req,res);
});

app.get('/check', function(req,res){
	processQuery(req,res);
});



	
function processQuery(req,res) {
	if (isEmpty(req.query)) {
		drawForm(res);	
	} else if (!checkQuery(req)) {
		drawForm(res, req.query.Slurl, {error:'URL not specified'});
		res.status(400);
	}
	else {
		var validationErrors=[], errCounts=[], SL, SLxml;
		try {
			SLxml = syncRequest('GET', req.query.SLurl);
		}
		catch (err) {
			validationErrors.push('retrieval of URL ('+req.query.SLurl+') failed');
			SLxml = null;
		}
		if (SLxml) try {
			SL = libxml.parseXmlString(SLxml.getBody().toString().replace(/(\r\n|\n|\r|\t)/gm,""));
			for (err in SL.errors) {
				console.log('XML parsing failed');
				validationErrors.push('XML parsing failed');
			}
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
				Sl.validationErrors.forEach(err => console.log("validation error:", err));
			};
*/
			if (SL.root().name() !== 'ServiceList') {
				validationErrors.push('Root element is not <ServiceList>.');
			}
			else {
				var SL_SCHEMA = {}, SCHEMA_PREFIX=SL.root().namespace().prefix();
				SL_SCHEMA[SL.root().namespace().prefix()]=SL.root().namespace().href();
				
				var s=1, service, knownServices=[];
				errCounts['num services']=0;
			
				// check <RegionList> and remember regionID values
				var knownRegionIDs=[], RegionList=SL.get('//'+SCHEMA_PREFIX+':RegionList', SL_SCHEMA);
				if (RegionList) {
					// recurse the regionlist - Regions can be nested in Regions
					var r=1, Region;
					while (Region=SL.get('//'+SCHEMA_PREFIX+':RegionList/'+SCHEMA_PREFIX+':Region['+r+']', SL_SCHEMA)) {
						addRegion(Region, 0, knownRegionIDs, validationErrors, errCounts);
						r++;
					}
				}				

				//check <RelatedMaterial> for service list
				var rm=1, RelatedMaterial;
				while (RelatedMaterial=SL.get('//'+SCHEMA_PREFIX+':ServiceList/'+SCHEMA_PREFIX+':RelatedMaterial['+rm+']', SL_SCHEMA)) {
					validateRelatedMaterial(RelatedMaterial,validationErrors,errCounts,'service list', 'service list', SCHEMA_PREFIX, SL_SCHEMA);
					rm++;
				}					
				
				// check <Service>
				while (service=SL.get('//'+SCHEMA_PREFIX+':Service['+s+']', SL_SCHEMA)) {
					// for each service
					errCounts['num services']=s;
					
					// check <Service><UniqueIdentifier>
					var uID=SL.get('//'+SCHEMA_PREFIX+':Service['+s+']/'+SCHEMA_PREFIX+':UniqueIdentifier', SL_SCHEMA);
					if (!uID) {
						validationErrors.push('<UniqueIdentifier> not present for service '+s);
					} else{
						if (!validServiceIdentifier(uID.text())) {
							validationErrors.push('\"'+uID.text()+'\" is not a valid identifier');
							incrErr(errCounts,'invalid tag');
						}
						if (!uniqueServiceIdentifier(uID.text(),knownServices)) {
							validationErrors.push('\"'+uID.text()+'\" is not unique');
							incrErr(errCounts,'non unique id');							
						}
						knownServices.push(uID.text());
					}

					//check <Service><ServiceInstance>
					var si=1, ServiceInstance;
					while (ServiceInstance=SL.get('//'+SCHEMA_PREFIX+':Service['+s+']/'+SCHEMA_PREFIX+':ServiceInstance['+si+']', SL_SCHEMA)) {
						//for each service instance
						
						// check @href of <RelatedMaterial><HowRelated>
						var rm=1, RelatedMaterial;
						while (RelatedMaterial=SL.get('//'+SCHEMA_PREFIX+':Service['+s+']/'+SCHEMA_PREFIX+':ServiceInstance['+si+']/'+SCHEMA_PREFIX+':RelatedMaterial['+rm+']', SL_SCHEMA)) {
							validateRelatedMaterial(RelatedMaterial,validationErrors,errCounts,'service instance of \"'+uID.text()+'\"', 'service', SCHEMA_PREFIX, SL_SCHEMA);
							rm++;
						}
						
						// Check @href of ContentAttributes/AudioConformancePoints
						var cp=1, conf;
						while (conf=SL.get('//'+SCHEMA_PREFIX+':Service['+s+']/'+SCHEMA_PREFIX+':ServiceInstance['+si+']/'+SCHEMA_PREFIX+':ContentAttributes/'+SCHEMA_PREFIX+':AudioConformancePoint['+cp+']', SL_SCHEMA)) {
							if (conf.attr('href') && !isIn(allowedAudioConformancePoints,conf.attr('href').value())) {
								validationErrors.push('invalid value for <AudioConformancePoint> ('+conf.attr('href').value()+')');
								incrErr(errCounts,'audio conf point');
							}
							cp++;
						}

						// Check @href of ContentAttributes/AudioAttributes/tva:coding
						cp=1;
						while (conf=SL.get('//'+SCHEMA_PREFIX+':Service['+s+']/'+SCHEMA_PREFIX+':ServiceInstance['+si+']/'+SCHEMA_PREFIX+':ContentAttributes/'+SCHEMA_PREFIX+':AudioAttributes['+cp+']/*', SL_SCHEMA)) {
							// console.log('found AudioAttributes/'+conf.namespace().prefix()+':'+conf.name());
							if (conf.name()==='Coding' && conf.attr('href') && !isIn(allowedAudioSchemes,conf.attr('href').value())) {
								validationErrors.push('invalid value for <AudioAttributes> ('+conf.attr('href').value()+')');
								incrErr(errCounts,'audio codec');
							}
							cp++;
						}
						
						// Check @href of ContentAttributes/VideoConformancePoints
						cp=1;
						while (conf=SL.get('//'+SCHEMA_PREFIX+':Service['+s+']/'+SCHEMA_PREFIX+':ServiceInstance['+si+']/'+SCHEMA_PREFIX+':ContentAttributes/'+SCHEMA_PREFIX+':VideoConformancePoint['+cp+']', SL_SCHEMA)) {
							if (conf.attr('href') && !isIn(allowedVideoConformancePoints,conf.attr('href').value())) {
								validationErrors.push('invalid value for <VideoConformancePoint> ('+conf.attr('href').value()+')');
								incrErr(errCounts,'video conf point');
							}							
							cp++;
						}

						// Check @href of ContentAttributes/VideoAttributes/tva:coding
						cp=1;
						while (conf=SL.get('//'+SCHEMA_PREFIX+':Service['+s+']/'+SCHEMA_PREFIX+':ServiceInstance['+si+']/'+SCHEMA_PREFIX+':ContentAttributes/'+SCHEMA_PREFIX+':VideoAttributes['+cp+']/*', SL_SCHEMA)) {
							// console.log('found VideoAttributes/'+conf.namespace().prefix()+':'+conf.name());
							if (conf.name()==='Coding' && conf.attr('href') && !isIn(allowedVideoSchemes,conf.attr('href').value())) {
								validationErrors.push('invalid value for <VideoAttributes> ('+conf.attr('href').value()+')');
								incrErr(errCounts,'video codec');
							}
							cp++;
						}
						

						si++;  // next <ServiceInstance>
					}
					
					//check <Service><TargetRegion>
					var tr=1, TargetRegion;
					while (TargetRegion=SL.get('//'+SCHEMA_PREFIX+':Service['+s+']/'+SCHEMA_PREFIX+':TargetRegion['+tr+']', SL_SCHEMA)) {
						if (!isIn(knownRegionIDs,TargetRegion.text())) {
							validationErrors.push('service \"'+uID.text()+'\" has an invalid <TargetRegion>'+TargetRegion.text());
							incrErr(errCounts,'target region');
						}
						tr++;
					}
					
					//check <Service><RelatedMaterial>
					var rm=1, RelatedMaterial;
					while (RelatedMaterial=SL.get('//'+SCHEMA_PREFIX+':Service['+s+']/'+SCHEMA_PREFIX+':RelatedMaterial['+rm+']', SL_SCHEMA)) {
						validateRelatedMaterial(RelatedMaterial,validationErrors,errCounts,'service \"'+uID.text()+'\"', 'service', SCHEMA_PREFIX, SL_SCHEMA);
						rm++;
					}					

					//check <Service><ServiceGenre>
					var ServiceGenre=SL.get('//'+SCHEMA_PREFIX+':Service['+s+']/'+SCHEMA_PREFIX+':ServiceGenre', SL_SCHEMA);
					if (ServiceGenre) {
						if (!isIn(allowedGenres,ServiceGenre.text())) {
							validationErrors.push('service \"'+uID.text()+'\" has an invalid <ServiceGenre>'+ServiceGenre.text());
							incrErr(errCounts,'invalid ServiceGenre');
						}
					}
					
					//check <Service><ServiceType>					
					var ServiceType=SL.get('//'+SCHEMA_PREFIX+':Service['+s+']/'+SCHEMA_PREFIX+':ServiceType', SL_SCHEMA);
					if (ServiceType) {
						if (!isIn(allowedServiceTypes,ServiceType.attr('href').value())) {
							validationErrors.push('service \"'+uID.text()+'\" has an invalid <ServiceType>'+ServiceType.attr('href').value());
							incrErr(errCounts,'invalid ServiceType');
						}
					}
					
					s++;  // next <Service>
				}

				//check <TargetRegion> for the service list
				var tr=1, TargetRegion;
				while (TargetRegion=SL.get('//'+SCHEMA_PREFIX+':ServiceList/'+SCHEMA_PREFIX+':TargetRegion['+tr+']', SL_SCHEMA)) {
					if (!isIn(knownRegionIDs,TargetRegion.text())) {
						validationErrors.push('service list has an invalid <TargetRegion>'+TargetRegion.text());
						incrErr(errCounts,'target region');
					}
					tr++;
				}


					
				// check <LCNTableList>
				var LCNtableList=SL.get('//'+SCHEMA_PREFIX+':LCNTableList', SL_SCHEMA);
				if (LCNtableList) {
					var l=1, LCNTable;
					while (LCNTable=SL.get('//'+SCHEMA_PREFIX+':LCNTableList/'+SCHEMA_PREFIX+':LCNTable['+l+']', SL_SCHEMA)) {
						// checks on TargetRegion(s) for this LCNTable
						var tr=1, TargetRegion, lastTargetRegion="";
						while (TargetRegion=SL.get('//'+SCHEMA_PREFIX+':LCNTableList/'+SCHEMA_PREFIX+':LCNTable['+l+']/'+SCHEMA_PREFIX+':TargetRegion['+tr+']', SL_SCHEMA)) {
							if (!isIn(knownRegionIDs, TargetRegion.text())) {
								validationErrors.push('<TargetRegion> '+TargetRegion.text()+' in LCNTable is not defined');
								incrErr(errCounts,'undefined region');
							}
							lastTargetRegion=TargetRegion.text();
							tr++;
						}
						
						var LCNNumbers=[],e=1,LCN;
						while (LCN=SL.get('//'+SCHEMA_PREFIX+':LCNTableList/'+SCHEMA_PREFIX+':LCNTable['+l+']/'+SCHEMA_PREFIX+':LCN['+e+']', SL_SCHEMA)) {
							if (isIn(LCNNumbers,LCN.attr('channelNumber').value())) {
								validationErrors.push('duplicated channel number '+LCN.attr('channelNumber').value()+' for <TargetRegion>'+lastTargetRegion);
								incrErr(errCounts,'duplicate channel number');
							} 
							else LCNNumbers.push(LCN.attr('channelNumber').value());

							if (!isIn(knownServices,LCN.attr('serviceRef').value())) {
								validationErrors.push('LCN reference to unknown service '+LCN.attr('serviceRef').value());
								incrErr(errCounts,'LCN unknown services');
							}
							e++;
						}
						l++;
					}
				}
			}
	
			
		}
		catch (err) {
			console.log(err);
		}

		drawForm(res, req.query.SLurl, {issues:validationErrors, counts:errCounts});
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


app.get('*', function(req,res) {
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