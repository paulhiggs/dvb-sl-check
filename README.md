# dvb-sl-check
DVB-I Service List validator

## Description
Validates the value space of the instance document, validation against the schema should be performed seperately (for now)
Supports both the published :2019 schema and the upcoming :2020 schema and classification scheme updates

Checks performed:
* channel numbers are not duplictaed in LCN tables
* region identifiers are unique
* service identifiers are 
  * unique
  * formatted according to the TAG URI scheme
* country codes are valid against ISO3166 aplha 3 for region tables and delivery parameters for DVB-T and DVB-C
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
* channel numbers are unique in an LCN Table
* ServiceType according to DVB ServiceTypeCS-2019
* TargetRegion for the Service List, LCN Table and Services are defined in the region table
* Validation of &lt;RelatedMaterial&gt; for Service List, Service, Service Instance, Content Guide Source
* Unique @CGSID values
* &lt;ContentGuideSourceRef&gt; refers to a &lt;ContentGuideSource&gt; in the &lt;ContentGuideSourceList&gt;
* &lt;ContentGuideServiceRef&gt; refers to a different service in the service list
* &lt;SourceType&gt; is according to specification and appropriate DeliveryParameters are provided
* For &lt;DASHDeliveryParameters&gt;
  * valid @contentType in &lt;UriBasedLocation&gt;
* only one element for each @xml:lang is specified in any mpeg7:TextualType element
  
## Use

### URL based validation  
&lt;server&gt;/check gives a basic/primitive UI. Enter the URL to your service list and press "Submit" button. Await results!
### File based validation
&lt;server&gt;/checkFile gives a basic/primitive UI. Select the service list file and press "Submit" button. Await results!


## Installation
1. Clone this repository `git clone https://github.com/paulhiggs/dvb-sl-check.git --recurse-submodules`
1. Install necessary libraries (express, libxmljs, morgan)  `npm install`
1. run it - `node app [--urls]`

If you want to start an HTTPS server, make sure you have `selfsigned.crt` and `selfsigned.key` files in the same directory. These can be generated (on Linux) with `sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ./selfsigned.key -out selfsigned.crt`

Occassionally, the language-subtag-registry file can be updated from https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry

### Command Line Arguments
--urls - this argument will force the classification scheme, country and language values to be read from the internet. Default is to load values from local files.