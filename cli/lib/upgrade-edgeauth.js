"use strict";

//const util = require("util");
//const debug = require("debug")("jwkrotatekey");
//const request = require("request");
var deployAuthLib = require('./deploy-auth');
var deployAuth;

const path = require('path');
const writeConsoleLog = require('microgateway-core').Logging.writeConsoleLog;
const fs = require("fs");
const _ = require('lodash');
const xml2js = require("xml2js");
const parseString = xml2js.parseString;

const originPoliciesDir = path.join(__dirname, '../..', 'node_modules', 'microgateway-edgeauth/apiproxy/policies/');


const CONSOLE_LOG_TAG_COMP = 'microgateway upgrade edgeauth';

const UpgradeAuth = function() {

}

module.exports = function() {
    return new UpgradeAuth();
}

UpgradeAuth.prototype.upgradeauth = function upgradeauth(options /*, cb */) {
    
    mergeCustomPolicies( options.custompath , ()=> {

        const opts = {
            org: options.org,
            env: options.env,
            username: options.username,
            password: options.password,
            basepath: '/edgemicro-auth',
            debug: false,
            verbose: true,
            proxyName: 'edgemicro-auth',
            directory: path.join(__dirname, '../..', 'node_modules', 'microgateway-edgeauth'),
            'import-only': false,
            'resolve-modules': false,
            virtualHosts: options.virtualhost || 'secure'
        };
    
        var edge_config = {
            managementUri: options.mgmtUrl || 'na',
            authUri: 'na',
            virtualhosts: opts.virtualHosts
        };
    
        if (options.token) {
            opts.token = options.token;
        } else {
            opts.username = options.username;
            opts.password = options.password;
        }
    
        deployAuth = deployAuthLib(edge_config, null);
    
        deployAuth.deployProxyWithPassword(options.mgmtUrl, 'na', opts, opts.directory, function(err /*, result */ ) {
            if (err) {
                writeConsoleLog('log',{component: CONSOLE_LOG_TAG_COMP},err);
            }
        });
    })
    

}

function mergeCustomPolicies(customPoliciesDir, finalCB){
    if ( !customPoliciesDir ) {
        return finalCB();
    }
    // merge the custom policies
    let processCount = 0;
    let allCustomXMls = fs.readdirSync(customPoliciesDir);
    allCustomXMls.forEach( fileName => {
        mergeXmlFIle(fileName, customPoliciesDir, () => {
            processCount++;
            if ( allCustomXMls.length === processCount  ) {
                finalCB();
            }
        });
    });
}

function customizer(objValue, srcValue) {
    if (_.isArray(objValue)) {
      return objValue.concat(srcValue);
    }
  }
   

function mergeXmlFIle(fileName, customPoliciesDir, cb){

    const originFilePath = originPoliciesDir + fileName;

    let originmXmlContent = fs.readFileSync(originFilePath, {encoding: 'utf-8'}); 
    
    parseString(originmXmlContent, { explicitArray: false }, function(err, originXmlJsonObject) {
        if (err) console.log(err);
       
        let customXmlContent = fs.readFileSync(customPoliciesDir+'/'+fileName, {encoding: 'utf-8'});
    
        parseString(customXmlContent,{ explicitArray: false }, function(err, customXmlJsonObject) {
           if (err) console.log(err);
            let mergedJsonObject = _.mergeWith( originXmlJsonObject, customXmlJsonObject, customizer);
            var builder = new xml2js.Builder();
            var mergedXmlContent = builder.buildObject(mergedJsonObject);
            fs.writeFile(originFilePath, mergedXmlContent, cb);
        });
    });
}
