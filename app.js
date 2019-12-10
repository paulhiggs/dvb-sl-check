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
		errCounts['duplicate regionID']++;
	}
	else knownRegionIDs.push(regionID);	
	
	if ((depth != 0) && countryCodeSpecified) {
		validationErrors.push('@countryCodes not permitted for sub-region \"'+regionID+'\"');
		errCounts['ccode in subRegion']++;
	}
	
	if (countryCodeSpecified) {
		var countries=countryCodeSpecified.value().split(",");
		countries.forEach(country => {
			if (!isISO3166code(country)) {
				validationErrors.push('invalid country code ('+country+') for region \"'+regionID+'\"');
				errCounts['bad country code']++;	
			}
		});
	}
	
	if (depth > MAX_SUBREGION_LEVELS) {
		validationErrors.push('<Region> depth exceeded (>'+MAX_SUBREGION_LEVELS+') for sub-region \"'+regionID+'\"');
		errCounts['region depth exceeded']++;
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
				res.write('<p>'+value+'</p>');
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
				Sl.validatioinErrors.forEach(err => console.log("validation error:", err));
			};
*/
			if (SL.root().name() !== 'ServiceList') {
				validationErrors.push('Root element is not <ServiceList>.');
			}
			else {
				var SL_SCHEMA = {}, SCHEMA_PREFIX=SL.root().namespace().prefix();
				SL_SCHEMA[SL.root().namespace().prefix()]=SL.root().namespace().href();
				
				var s=1, service, knownServices=[];
				
				errCounts['invalid tag']=0; errCounts['non unique id']=0; errCounts['num services']=0; errCounts['invalid ServiceGenre']=0;
				errCounts['duplicate regionID']=0; errCounts['undefined region']=0; errCounts['duplicate channel number']=0; 
				errCounts['invalid ServiceType']=0; errCounts['audio codec']=0; errCounts['video codec']=0;
				errCounts['LCN unknown services']=0; errCounts['ccode in subRegion']=0; errCounts['region depth exceeded']=0;
				errCounts['bad country code']=0;
				
				while (service=SL.get('//'+SCHEMA_PREFIX+':Service['+s+']', SL_SCHEMA)) {
					// for each service
					errCounts['num services']=s;
					var uID=SL.get('//'+SCHEMA_PREFIX+':Service['+s+']/'+SCHEMA_PREFIX+':UniqueIdentifier', SL_SCHEMA);
					if (!uID) {
						validationErrors.push('<UniqueIdentifier> not present for service '+s);
					} else{
						if (!validServiceIdentifier(uID.text())) {
							validationErrors.push('\"'+uID.text()+'\" is not a valid identifier');
							errCounts['invalid tag']++;
						}
						if (!uniqueServiceIdentifier(uID.text(),knownServices)) {
							validationErrors.push('\"'+uID.text()+'\" is not unique');
							errCounts['non unique id']++;							
						}
						knownServices.push(uID.text());
					}
					
					var si=1, ServiceInstance;
					while (ServiceInstance=SL.get('//'+SCHEMA_PREFIX+':Service['+s+']/'+SCHEMA_PREFIX+':ServiceInstance['+si+']', SL_SCHEMA)) {
						//for each service instance
						
						// Check @href of ContentAttributes/AudioConformancePoints
						var cp=1, conf;
						while (conf=SL.get('//'+SCHEMA_PREFIX+':Service['+s+']/'+SCHEMA_PREFIX+':ServiceInstance['+si+']/'+SCHEMA_PREFIX+':ContentAttributes/'+SCHEMA_PREFIX+':AudioConformancePoint['+cp+']', SL_SCHEMA)) {
							if (conf.attr('href') && !isIn(allowedAudioConformancePoints,conf.attr('href').value())) {
								validationErrors.push('invalid value for <AudioConformancePoint> ('+conf.attr('href').value()+')');
								errCounts['audio codec']++;
							}
							cp++;
						}

						// Check @href of ContentAttributes/AudioAttributes/tva:coding
						cp=1;
						while (conf=SL.get('//'+SCHEMA_PREFIX+':Service['+s+']/'+SCHEMA_PREFIX+':ServiceInstance['+si+']/'+SCHEMA_PREFIX+':ContentAttributes/'+SCHEMA_PREFIX+':AudioAttributes['+cp+']/*', SL_SCHEMA)) {
							// console.log('found AudioAttributes/'+conf.namespace().prefix()+':'+conf.name());
							if (conf.name()==='Coding' && conf.attr('href') && !isIn(allowedAudioSchemes,conf.attr('href').value())) {
								validationErrors.push('invalid value for <AudioAttributes> ('+conf.attr('href').value()+')');
								errCounts['audio codec']++;
							}
							cp++;
						}
						
						// Check @href of ContentAttributes/VideoConformancePoints
						cp=1;
						while (conf=SL.get('//'+SCHEMA_PREFIX+':Service['+s+']/'+SCHEMA_PREFIX+':ServiceInstance['+si+']/'+SCHEMA_PREFIX+':ContentAttributes/'+SCHEMA_PREFIX+':VideoConformancePoint['+cp+']', SL_SCHEMA)) {
							if (conf.attr('href') && !isIn(allowedVideoConformancePoints,conf.attr('href').value())) {
								validationErrors.push('invalid value for <VideoConformancePoint> ('+conf.attr('href').value()+')');
								errCounts['video codec']++;
							}							
							cp++;
						}

						// Check @href of ContentAttributes/VideoAttributes/tva:coding
						cp=1;
						while (conf=SL.get('//'+SCHEMA_PREFIX+':Service['+s+']/'+SCHEMA_PREFIX+':ServiceInstance['+si+']/'+SCHEMA_PREFIX+':ContentAttributes/'+SCHEMA_PREFIX+':VideoAttributes['+cp+']/*', SL_SCHEMA)) {
							// console.log('found VideoAttributes/'+conf.namespace().prefix()+':'+conf.name());
							if (conf.name()==='Coding' && conf.attr('href') && !isIn(allowedVideoSchemes,conf.attr('href').value())) {
								validationErrors.push('invalid value for <VideoAttributes> ('+conf.attr('href').value()+')');
								errCounts['video codec']++;
							}
							cp++;
						}
						

						si++;  // next <ServiceInstance>
					}
					
					var serviceGenre=SL.get('//'+SCHEMA_PREFIX+':Service['+s+']/'+SCHEMA_PREFIX+':ServiceGenre', SL_SCHEMA);
					if (serviceGenre) {
						if (!isIn(allowedGenres,serviceGenre.text())) {
							validationErrors.push('service \"'+uID.text()+'\" has an invalid <ServiceGenre>'+serviceGenre.text());
							errCounts['invalid ServiceGenre']++;
						}
					}
					var serviceType=SL.get('//'+SCHEMA_PREFIX+':Service['+s+']/'+SCHEMA_PREFIX+':ServiceType', SL_SCHEMA);
					if (serviceType) {
						if (!isIn(allowedServiceTypes,serviceType.attr('href').value())) {
							validationErrors.push('service \"'+uID.text()+'\" has an invalid <ServiceType>'+serviceType.attr('href').value());
							errCounts['invalid ServiceType']++;
						}
					}
					
					s++;  // next <Service>
				}
				
				var knownRegionIDs=[], RegionList=SL.get('//'+SCHEMA_PREFIX+':RegionList', SL_SCHEMA);
				if (RegionList) {
					// recurse the regionlist - Regions can be nested in Regions
					var r=1, Region;
					while (Region=SL.get('//'+SCHEMA_PREFIX+':RegionList/'+SCHEMA_PREFIX+':Region['+r+']', SL_SCHEMA)) {
						addRegion(Region, 0, knownRegionIDs, validationErrors, errCounts);
						r++;
					}
				}
				
				var LCNtableList=SL.get('//'+SCHEMA_PREFIX+':LCNTableList', SL_SCHEMA);
				if (LCNtableList) {
					var l=1, LCNTable;
					while (LCNTable=SL.get('//'+SCHEMA_PREFIX+':LCNTableList/'+SCHEMA_PREFIX+':LCNTable['+l+']', SL_SCHEMA)) {
						// checks on TargetRegion(s) for this LCNTable
						var tr=1, TargetRegion, lastTargetRegion="";
						while (TargetRegion=SL.get('//'+SCHEMA_PREFIX+':LCNTableList/'+SCHEMA_PREFIX+':LCNTable['+l+']/'+SCHEMA_PREFIX+':TargetRegion['+tr+']', SL_SCHEMA)) {
							if (!isIn(knownRegionIDs, TargetRegion.text())) {
								validationErrors.push('TargetRegion '+TargetRegion.text()+'for LCNTable is not defined');
								errCounts['undefined region']++;
							}
							lastTargetRegion=TargetRegion.text();
							tr++;
						}
						
						var LCNNumbers=[],e=1,LCN;
						while (LCN=SL.get('//'+SCHEMA_PREFIX+':LCNTableList/'+SCHEMA_PREFIX+':LCNTable['+l+']/'+SCHEMA_PREFIX+':LCN['+e+']', SL_SCHEMA)) {
							if (isIn(LCNNumbers,LCN.attr('channelNumber').value())) {
								validationErrors.push('duplicated channel number '+LCN.attr('channelNumber').value()+' for <TargetRegion>'+lastTargetRegion);
								errCounts['duplicate channel number']++;
							} 
							else LCNNumbers.push(LCN.attr('channelNumber').value());

							if (!isIn(knownServices,LCN.attr('serviceRef').value())) {
								validationErrors.push('LCN reference to unknown service '+LCN.attr('serviceRef').value());
								errCounts['LCN unknown services']++;
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