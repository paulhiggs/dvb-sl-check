# dvb-sl-check
DVB-I Service List validator

Validates the value space of the instance document, validation against the schema should be performed seperately (for now)

Checks performed:
* channel numbers are not duplictaed in LCN tables
* region identifiers are unique
* service identifiers are 
 * unique
 * formatted according to the TAG URI scheme
* country codes are valid against ISO3166 aplha 3
* regions are not excessively nested
* @countryCodes attribute is not specified for sub-regions
* ServiceGenre is selected from
 * TV Anytime ContentCS
 * TV Anytime FormatCS
 * DVB ContentSubjectCS
* AudioAttributes@href and AudioConformancePoints@href accorinding to 
 * DVB AudioCodecCS
 * MPEG7 AudioCodingFormatCS
 * DVB AudioConformancePointsCS
* VideoAttributes@href and VideoConformancePoints@href accorinding to 
 * DVB VideoCodecCS
 * MPEG7 VisualCodingFormatCS
 * DVB VideoConformancePointsCS
* ServiceType according to DVB ServiceTypeCS-2019
* TargetRegion is defined in the region table