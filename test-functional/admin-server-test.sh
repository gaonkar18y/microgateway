#!/bin/bash
export MOCHA_ORG='apigeeemgtest2-eval'
export MOCHA_USER='apigeeemgtest2@gmail.com'
export MOCHA_PASSWORD='Testpwd@1'
export MOCHA_ENV='test'

TIMESTAMP=`date "+%Y-%m-%d-%H"`
LOGFILE="NightlyTestLog.$TIMESTAMP"

source ./testhelper.sh

proxyNamePrefix="edgemicro_"
proxyTargetUrl="http://mocktarget.apigee.net"

for count in {1..1000}
do
    echo "creating proxy no $count"
    apiProxyBasePath="hello_$count"
    PROXY_NAME="edgemicro_proxy_$count"
    createAPIProxy ${PROXY_NAME}; 
    createAPIProxyBundle ${PROXY_NAME};
    updateAPIProxy ${PROXY_NAME} ${PROXY_NAME}.zip ${proxyBundleVersion}; 
    deployAPIProxy ${PROXY_NAME} ${MOCHA_ENV} ${proxyBundleVersion};
done

